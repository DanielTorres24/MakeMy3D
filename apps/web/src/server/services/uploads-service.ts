import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink, lstat, realpath, readFile } from 'node:fs/promises';
import path from 'node:path';
import { inflateRawSync } from 'node:zlib';
import type { StoreRepository } from '../repositories/store-repository';
import { CommerceError } from './commerce-service';
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const types: Record<string,string> = { stl: 'model/stl', '3mf': 'model/3mf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };
function invalid(): never { throw new CommerceError('Conteúdo do ficheiro inválido ou não suportado.'); }
function validate3mf(buffer: Buffer) {
  // Central directory establishes limits before bounded decompression; files are never extracted.
  let end = -1;
  for (let i=buffer.length-22; i>=Math.max(0,buffer.length-65557); i--) if (buffer.readUInt32LE(i) === 0x06054b50 && i+22+buffer.readUInt16LE(i+20) === buffer.length) { end=i; break; }
  if (end < 0 || buffer.readUInt16LE(end+4) || buffer.readUInt16LE(end+6)) invalid();
  const count=buffer.readUInt16LE(end+10), centralSize=buffer.readUInt32LE(end+12), start=buffer.readUInt32LE(end+16);
  if (!count || count>200 || start+centralSize!==end || buffer.readUInt16LE(end+8)!==count) invalid();
  let cursor=start,total=0,hasModel=false,hasTypes=false; const names=new Set<string>();
  for (let n=0;n<count;n++) {
    if(cursor+46>end || buffer.readUInt32LE(cursor)!==0x02014b50) invalid();
    const flags=buffer.readUInt16LE(cursor+8), method=buffer.readUInt16LE(cursor+10), compressed=buffer.readUInt32LE(cursor+20), size=buffer.readUInt32LE(cursor+24), nameLen=buffer.readUInt16LE(cursor+28), extraLen=buffer.readUInt16LE(cursor+30), commentLen=buffer.readUInt16LE(cursor+32), offset=buffer.readUInt32LE(cursor+42);
    if(cursor+46+nameLen+extraLen+commentLen>end || flags&1 || ![0,8].includes(method) || size>32*1024*1024 || (total+=size)>64*1024*1024 || offset+30>start) invalid();
    const name=buffer.subarray(cursor+46,cursor+46+nameLen).toString('utf8');
    if(!name || name.includes('\\') || name.startsWith('/') || name.includes(':') || name.split('/').includes('..') || name.includes('\0') || names.has(name.toLowerCase())) invalid(); names.add(name.toLowerCase());
    if(buffer.readUInt32LE(offset)!==0x04034b50 || buffer.readUInt16LE(offset+8)!==method || buffer.readUInt16LE(offset+6)!==flags) invalid();
    const localNameLen=buffer.readUInt16LE(offset+26), localExtraLen=buffer.readUInt16LE(offset+28), dataStart=offset+30+localNameLen+localExtraLen;
    if(dataStart+compressed>start || buffer.subarray(offset+30,offset+30+localNameLen).toString('utf8')!==name) invalid();
    const packed=buffer.subarray(dataStart,dataStart+compressed);
    const decoded=method===0 ? packed : inflateRawSync(packed,{maxOutputLength: Math.max(1,size)});
    if(decoded.length!==size) invalid();
    if(name.endsWith('.model') || name==='[Content_Types].xml' || name.endsWith('.rels')) {
      const xml=decoded.toString('utf8'); if(/<!DOCTYPE|<!ENTITY/i.test(xml)) invalid();
      if(/^3D\/.+\.model$/i.test(name) && /<model(?:\s|>)/i.test(xml) && /<mesh(?:\s|>)/i.test(xml) && /<vertices(?:\s|>)/i.test(xml) && /<triangles(?:\s|>)/i.test(xml)) hasModel=true;
      if(name==='[Content_Types].xml' && /<Types(?:\s|>)/.test(xml)) hasTypes=true;
    }
    cursor+=46+nameLen+extraLen+commentLen;
  }
  if(cursor!==end || !hasModel || !hasTypes) invalid();
}
export function validateUpload(name: string, buffer: Buffer) {
  const extension=path.extname(name).slice(1).toLowerCase();
  if(!types[extension]) throw new CommerceError('Use STL, 3MF, PNG, JPG, JPEG ou WebP.');
  if(!buffer.length || buffer.length>MAX_UPLOAD_BYTES) throw new CommerceError('Cada ficheiro deve ter entre 1 byte e 20 MB.',413);
  try {
    if(extension==='stl') {
      const binary=buffer.length>=84 && buffer.readUInt32LE(80)>0 && 84+buffer.readUInt32LE(80)*50===buffer.length;
      if(binary) {
        for(let offset=84;offset<buffer.length;offset+=50) for(let component=0;component<12;component++) if(!Number.isFinite(buffer.readFloatLE(offset+component*4))) invalid();
      } else {
        if(buffer.includes(0)) invalid();
        const source=buffer.toString('utf8').trim();
        if(!/^solid[^\r\n]*[\r\n]/i.test(source) || !/\bendsolid[^\r\n]*$/i.test(source)) invalid();
        const body=source.replace(/^solid[^\r\n]*[\r\n]+/i,'').replace(/\bendsolid[^\r\n]*$/i,'').trim();
        const number='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
        const vector=`${number}\\s+${number}\\s+${number}`;
        const facet=new RegExp(`facet\\s+normal\\s+${vector}\\s+outer\\s+loop\\s+vertex\\s+${vector}\\s+vertex\\s+${vector}\\s+vertex\\s+${vector}\\s+endloop\\s+endfacet`,'gi');
        const matches=body.match(facet); if(!matches?.length || body.replace(facet,'').trim()) invalid();
        for(const token of body.match(new RegExp(number,'g'))??[]) if(!Number.isFinite(Number(token))) invalid();
      }
    } else if(extension==='3mf') validate3mf(buffer);
    else if(extension==='png') { if(buffer.length<45 || buffer.subarray(0,8).toString('hex')!=='89504e470d0a1a0a' || buffer.toString('ascii',12,16)!=='IHDR' || !buffer.readUInt32BE(16) || !buffer.readUInt32BE(20) || buffer.toString('ascii',buffer.length-8,buffer.length-4)!=='IEND') invalid(); }
    else if(extension==='jpg'||extension==='jpeg') { if(buffer.length<12 || buffer[0]!==255 || buffer[1]!==216 || buffer[2]!==255 || buffer[buffer.length-2]!==255 || buffer[buffer.length-1]!==217) invalid(); }
    else if(extension==='webp') { if(buffer.length<20 || buffer.toString('ascii',0,4)!=='RIFF' || buffer.toString('ascii',8,12)!=='WEBP' || buffer.readUInt32LE(4)+8!==buffer.length || !['VP8 ','VP8L','VP8X'].includes(buffer.toString('ascii',12,16))) invalid(); }
  } catch(error) { if(error instanceof CommerceError) throw error; invalid(); }
  return { extension, mediaType:types[extension] };
}
async function uploadDirectory(directory: string) {
  const folder=path.resolve(directory,'uploads'); await mkdir(folder,{recursive:true});
  if((await realpath(folder)).toLowerCase()!==folder.toLowerCase() || folder.split(path.sep).some(p=>p.toLowerCase()==='public')) throw new CommerceError('Pasta de anexos inválida.',500);
  return folder;
}
export async function saveUpload(repo: StoreRepository, directory: string, owner: string, name: string, buffer: Buffer) {
  const {extension,mediaType}=validateUpload(name,buffer), id=randomUUID(), now=new Date().toISOString();
  if(mediaType.startsWith('image/')) { try { await sharp(buffer,{limitInputPixels:25_000_000, failOn:'warning', animated:false}).resize({width:1,height:1}).raw().toBuffer(); } catch { throw new CommerceError('Imagem corrompida ou com dimensões superiores ao limite de 25 megapíxeis.'); } }
  const originalName=path.basename(name.replaceAll('\\','/')).replace(/[\u0000-\u001f\u007f]/g,'').slice(0,200) || `anexo.${extension}`;
  const attachment={id,createdAt:now,updatedAt:now,ownerId:owner,originalName,storageName:`${id}.${extension}`,mediaType,sizeBytes:buffer.length};
  const file=path.join(await uploadDirectory(directory),attachment.storageName); await writeFile(file,buffer,{flag:'wx',mode:0o600});
  try { await repo.update(s=>{ if(!s.carts.some(c=>c.id===owner)) throw new CommerceError('Sessão inválida.',401); if(s.attachments.filter(a=>a.ownerId===owner).length>=30) throw new CommerceError('Limite de 30 anexos por sessão atingido.'); s.attachments.push(attachment); }); }
  catch(error) { await unlink(file).catch(()=>undefined); throw error; }
  return { id, originalName, sizeBytes:buffer.length };
}
export async function downloadUpload(repo: StoreRepository, directory: string, id: string, owner: string|null, admin=false) {
  const item=(await repo.read()).attachments.find(a=>a.id===id);
  if(!item || (!admin && item.ownerId!==owner)) throw new CommerceError('Anexo não encontrado.',404);
  const file=path.join(await uploadDirectory(directory),item.storageName), stat=await lstat(file);
  if(!stat.isFile() || stat.isSymbolicLink() || stat.size!==item.sizeBytes) throw new CommerceError('Anexo indisponível.',404);
  return { item, buffer:await readFile(file) };
}


