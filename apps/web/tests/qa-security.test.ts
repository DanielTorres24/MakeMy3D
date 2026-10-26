import { describe, it, expect, vi } from 'vitest';
import { mkdir, mkdtemp } from 'node:fs/promises';
import path from 'node:path';
vi.mock('server-only', () => ({}));
import { JsonStoreRepository } from '../src/server/repositories/json-store';
import { createCustomerSession, addItem, checkout, createQuote } from '../src/server/services/commerce-service';
import { saveUpload, downloadUpload, validateUpload } from '../src/server/services/uploads-service';
import { mutateAdmin, adminSnapshot } from '../src/server/admin-service';
import { issueSession, isAdmin, revokeSession, requireSameOrigin, readAdminBody } from '../src/server/admin-session';
const contact = { customer: { name: 'Cliente Teste QA', email: 'qa@example.invalid', phone: '' }, consent: true };
const stl = Buffer.from('solid demo\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid demo');
async function isolated() { const base=path.resolve('../../work/tests'); await mkdir(base,{recursive:true}); return new JsonStoreRepository(await mkdtemp(path.join(base,'qa-'))); }
describe('QA independente: segurança e integração persistente', () => {
 it('sessão admin aleatória, revogável e origem obrigatória',async()=>{
  const token=issueSession(); const request=new Request('http://localhost/api/admin/data',{headers:{cookie:`makemy3d_admin=${token}`}});
  expect(await isAdmin(request)).toBe(true); expect(await isAdmin(new Request(request.url))).toBe(false);
  expect(()=>requireSameOrigin(request)).toThrow();
  expect(()=>requireSameOrigin(new Request(request.url,{headers:{origin:'https://attacker.invalid'}}))).toThrow();
  expect(()=>requireSameOrigin(new Request(request.url,{headers:{origin:'http://localhost'}}))).not.toThrow();
  revokeSession(request);expect(await isAdmin(request)).toBe(false);
 });
 it('rejeita corpo administrativo acima do limite',async()=>{
  await expect(readAdminBody(new Request('http://localhost',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({data:'x'.repeat(100001)})}))).rejects.toThrow('grande');
 });
 it('ficheiros desconhecidos, vazios, falsos e demasiado grandes são recusados',()=>{
  for(const name of ['evil.html','evil.svg','evil.exe','evil.stl.png'])expect(()=>validateUpload(name,Buffer.from('<script>alert(1)</script>'))).toThrow();
  expect(()=>validateUpload('demo.stl',Buffer.alloc(0))).toThrow();
  expect(()=>validateUpload('demo.stl',Buffer.alloc(20*1024*1024+1))).toThrow();
  expect(()=>validateUpload('demo.stl',stl)).not.toThrow();
 });
 it('pedido com anexo, snapshot, backoffice e restart preservam integridade e privacidade',async()=>{
  let repo=await isolated();const directory=repo.directory;
  try {
   const owner=await createCustomerSession(repo), outsider=await createCustomerSession(repo);
   const product=(await repo.read()).products.find(p=>p.kind==='physical' && p.priceCents!==null)!;
   const upload=await saveUpload(repo,directory,owner,'../../demo.stl',stl);
   expect(upload.originalName).toBe('demo.stl');
   await expect(downloadUpload(repo,directory,upload.id,null)).rejects.toThrow();
   await expect(downloadUpload(repo,directory,upload.id,outsider)).rejects.toThrow();
   await expect(addItem(repo,outsider,{productId:product.id,quantity:1,customization:{attachmentIds:[upload.id]}})).rejects.toThrow();
   await expect(addItem(repo,owner,{productId:product.id,quantity:1,unitPriceCents:1,customization:{}})).rejects.toThrow();
   await addItem(repo,owner,{productId:product.id,quantity:2,customization:{text:'QA persistente',attachmentIds:[upload.id]}});
   const order=await checkout(repo,owner,contact);
   expect(order.totalCents).toBe(product.priceCents!*2); expect(order.items[0].customization.text).toBe('QA persistente');
   const quote=await createQuote(repo,owner,{...contact,description:'Modelação de peça de teste QA',quantity:3,customization:{attachmentIds:[upload.id]}});
   await repo.update(s=>{
    mutateAdmin(s,{entity:'products',action:'save',id:product.id,data:{priceCents:9999}});
    mutateAdmin(s,{entity:'orders',action:'save',id:order.id,data:{status:'in-production',notes:'Nota interna QA'}});
    mutateAdmin(s,{entity:'quotes',action:'save',id:quote.id,data:{status:'reviewing',notes:'Rever medidas'}});
   });
   expect(adminSnapshot(await repo.read()).metrics.orders).toBe(1);
   await repo.close();repo=new JsonStoreRepository(directory);
   const persisted=await repo.read();expect(persisted.orders[0].totalCents).toBe(product.priceCents!*2);
   expect(persisted.orders[0].status).toBe('in-production');expect(persisted.orders[0].history).toHaveLength(2);
   expect(persisted.quotes[0].status).toBe('reviewing');expect(persisted.carts.find(c=>c.id===owner)!.items).toHaveLength(0);
   expect((await downloadUpload(repo,directory,upload.id,owner)).buffer).toEqual(stl);
   expect((await downloadUpload(repo,directory,upload.id,null,true)).buffer).toEqual(stl);
  }finally{await repo.close();}
 });
});

it('QA recusa imagem com assinatura falsificada antes de guardar qualquer anexo',async()=>{
 const repo=await isolated();
 try{
  const owner=await createCustomerSession(repo);
  const fake=Buffer.alloc(45);Buffer.from('89504e470d0a1a0a','hex').copy(fake);fake.write('IHDR',12);fake.writeUInt32BE(1,16);fake.writeUInt32BE(1,20);fake.write('IEND',37);
  await expect(saveUpload(repo,repo.directory,owner,'falsa.png',fake)).rejects.toThrow();
  expect((await repo.read()).attachments).toHaveLength(0);
 }finally{await repo.close();}
});
