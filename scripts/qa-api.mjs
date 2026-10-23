/** Executar após npm run build. Usa dados fictícios numa pasta nova em work; não toca nos dados da loja. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await mkdir(path.join(root,'work'),{recursive:true});
const directory=await mkdtemp(path.join(root,'work','qa-api-'));
const probe=createServer();await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const base=`http://127.0.0.1:${port}`;const password='qa-local-demo-password';let child;let logs='';
async function start(){
 child=spawn(process.execPath,[path.join(root,'scripts/server.mjs'),'--production'],{cwd:root,env:{...process.env,PORT:String(port),MAKEMY3D_DATA_DIR:directory,MAKEMY3D_ADMIN_PASSWORD:password},windowsHide:true,stdio:['ignore','pipe','pipe','ipc']});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Servidor não arrancou: '+logs)),60000);child.once('error',reject);child.once('exit',code=>{clearTimeout(timer);reject(new Error(`Servidor saiu ${code}: ${logs}`));});for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{logs+=chunk.toString();if(chunk.toString().includes('MakeMy3D produção local:')){clearTimeout(timer);resolve();}});});
}
async function stop(){if(!child||child.exitCode!==null)return;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Servidor não terminou por IPC')),15000);child.once('exit',code=>{clearTimeout(timer);if(code!==0)reject(new Error(`Shutdown ${code}`));else resolve();});child.send({type:'shutdown'});});}
async function call(route,{method='GET',cookie='',body,origin=base,status=200,form}={}){
 const headers={};if(cookie)headers.cookie=cookie;if(method!=='GET')headers.origin=origin;
 if(body!==undefined)headers['content-type']='application/json';
 const response=await fetch(base+route,{method,headers,body:form??(body===undefined?undefined:JSON.stringify(body)),redirect:'manual'});
 assert.equal(response.status,status,`${method} ${route}: ${await response.clone().text()}`);return response;
}
const cookieOf=response=>response.headers.get('set-cookie')?.split(';')[0]??'';
const contact={customer:{name:'Cliente Teste Automático',email:'qa@example.invalid',phone:''},consent:true};
let checks=0;
try{
 await start();
 await call('/api/admin/data',{status:401});checks++;
 const catalog=await (await call('/api/catalog/products')).json();assert.equal(catalog.total,200);assert.equal(catalog.categories.length,10);checks++;
 const product=catalog.items.find(p=>p.priceCents!==null&&p.kind==='physical');assert.ok(product);
 const cartCookie=cookieOf(await call('/api/cart'));assert.ok(cartCookie);const outsiderCookie=cookieOf(await call('/api/cart'));
 await call('/api/cart',{method:'POST',cookie:cartCookie,origin:'https://attacker.invalid',body:{},status:403});checks++;
 await call('/api/orders',{method:'POST',body:contact,status:401});checks++;
 const invalidForm=new FormData();invalidForm.set('file',new Blob(['<svg/>']),'evil.svg');await call('/api/uploads',{method:'POST',cookie:cartCookie,form:invalidForm,status:400});checks++;
 const stl='solid demo\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid demo';
 const form=new FormData();form.set('file',new Blob([stl]),'demo.stl');const attachment=await(await call('/api/uploads',{method:'POST',cookie:cartCookie,form,status:201})).json();
 await call(`/api/uploads/${attachment.id}`,{status:404});await call(`/api/uploads/${attachment.id}`,{cookie:outsiderCookie,status:404});checks+=2;
 const download=await call(`/api/uploads/${attachment.id}`,{cookie:cartCookie});assert.equal(await download.text(),stl);assert.equal(download.headers.get('x-content-type-options'),'nosniff');assert.ok(download.headers.get('content-disposition').startsWith('attachment;'));checks++;
 const add={productId:product.id,quantity:2,customization:{text:'Personalização QA',material:product.materials?.[0]??'',attachmentIds:[attachment.id]}};
 await call('/api/cart',{method:'POST',cookie:outsiderCookie,body:add,status:403});
 await call('/api/cart',{method:'POST',cookie:cartCookie,body:{...add,unitPriceCents:1},status:400});checks+=2;
 const cart=await(await call('/api/cart',{method:'POST',cookie:cartCookie,body:add})).json();assert.equal(cart.totalCents,product.priceCents*2);
 await call('/api/orders',{method:'POST',cookie:cartCookie,body:{...contact,consent:false},status:400});checks++;
 const order=await(await call('/api/orders',{method:'POST',cookie:cartCookie,body:contact,status:201})).json();assert.equal(order.totalCents,product.priceCents*2);assert.equal(order.simulated,true);assert.equal(order.customer,undefined);
 await call('/api/orders',{method:'POST',cookie:cartCookie,body:contact,status:400});checks++;
 const quote=await(await call('/api/quotes',{method:'POST',cookie:cartCookie,body:{...contact,description:'Orçamento automático de modelação QA',quantity:3,customization:{attachmentIds:[attachment.id]}},status:201})).json();
 await call('/api/admin/session',{method:'POST',body:{password},origin:'https://attacker.invalid',status:403});
 await call('/api/admin/session',{method:'POST',body:{password:'incorrect'},status:401});checks+=2;
 const login=await call('/api/admin/session',{method:'POST',body:{password}});let adminCookie=cookieOf(login);assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));
 const snapshot=await(await call('/api/admin/data',{cookie:adminCookie})).json();assert.equal(snapshot.orders[0].id,order.id);assert.equal(snapshot.quotes[0].id,quote.id);
 await call('/api/admin/data',{method:'POST',cookie:adminCookie,body:{entity:'orders',action:'save',id:order.id,data:{status:'in-production',notes:'Nota QA'}}});
 await call('/api/admin/data',{method:'POST',cookie:adminCookie,body:{entity:'quotes',action:'save',id:quote.id,data:{status:'reviewing',notes:'Rever medidas'}}});
 await call('/api/admin/data',{method:'POST',cookie:adminCookie,body:{entity:'products',action:'save',id:product.id,data:{active:false}}});
 await call(`/api/catalog/products/${product.slug}`,{status:404});checks++;
 await stop();const before=await readFile(path.join(directory,'store.json'),'utf8');await start();
 await call('/api/admin/data',{cookie:adminCookie,status:401});checks++;
 adminCookie=cookieOf(await call('/api/admin/session',{method:'POST',body:{password}}));
 const restored=await(await call('/api/admin/data',{cookie:adminCookie})).json();assert.equal(restored.orders[0].status,'in-production');assert.equal(restored.orders[0].history.length,2);assert.equal(restored.orders[0].totalCents,product.priceCents*2);assert.equal(restored.orders[0].items[0].customization.text,'Personalização QA');assert.equal(restored.quotes[0].status,'reviewing');
 assert.equal(await(await call(`/api/uploads/${attachment.id}`,{cookie:adminCookie})).text(),stl);assert.equal(await readFile(path.join(directory,'store.json'),'utf8'),before);checks++;
 await call('/api/admin/session',{method:'DELETE',cookie:adminCookie});await call('/api/admin/data',{cookie:adminCookie,status:401});checks++;
 console.log(JSON.stringify({result:'PASS',checks,flow:'catálogo → upload → carrinho → encomenda/orçamento → admin → estado → restart → dados/anexos preservados',directory},null,2));
}finally{await stop();}
