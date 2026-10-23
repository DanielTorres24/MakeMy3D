import { NextResponse } from 'next/server';
import { getRepository } from '@/server/repository';
import { saveUpload, MAX_UPLOAD_BYTES } from '@/server/services/uploads-service';
import { CommerceError } from '@/server/services/commerce-service';
import { customerSession, checkOrigin, apiError } from '@/server/services/commerce-http';
export const runtime='nodejs';
export async function POST(r:Request) {
  try {
    checkOrigin(r); const owner=await customerSession();
    if(!r.headers.get('content-type')?.includes('multipart/form-data')) throw new CommerceError('Esperado ficheiro multipart.',415);
    const reader=r.body?.getReader(); if(!reader) throw new CommerceError('Ficheiro em falta.');
    const chunks:Uint8Array[]=[];let size=0;
    for(;;){ const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>MAX_UPLOAD_BYTES+65536){await reader.cancel();throw new CommerceError('Ficheiro demasiado grande.',413);}chunks.push(part.value); }
    const form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':r.headers.get('content-type')!}}).formData();
    const file=form.get('file'); if(!(file instanceof File) || form.getAll('file').length!==1) throw new CommerceError('Selecione um ficheiro.');
    const repo=getRepository();return NextResponse.json(await saveUpload(repo,repo.directory,owner,file.name,Buffer.from(await file.arrayBuffer())),{status:201});
  }catch(e){return apiError(e);}
}
