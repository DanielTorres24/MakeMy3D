import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createInitialStore } from '../src/server/seeds/initial';
import { catalogQuerySchema, queryCatalog, findPublicProduct } from '../src/server/services/catalog-service';
import { JsonStoreRepository } from '../src/server/repositories/json-store';
const query = (input: unknown = {}) => catalogQuerySchema.parse(input);
describe('catálogo', () => {
 it('tem 200 conceitos únicos, dez categorias e20 por categoria',()=>{
  const s=createInitialStore();expect(s.categories).toHaveLength(10);expect(s.products).toHaveLength(200);
  expect(new Set(s.products.map(p=>p.slug)).size).toBe(200);
  for(const c of s.categories)expect(s.products.filter(p=>p.categoryId===c.id)).toHaveLength(20);
 });
 it('pesquisa com acentos e filtros combinados',()=>{
  const s=createInitialStore();expect(queryCatalog(s,query({q:'decoração'})).total).toBe(queryCatalog(s,query({q:'decoracao'})).total);
  expect(queryCatalog(s,query({category:'casa-e-organizacao',kind:'service'})).total).toBe(0);
  expect(queryCatalog(s,query({kind:'service'})).total).toBe(40);
 });
 it('não expõe produto ou categoria inativos em lista e detalhe',()=>{
  const s=createInitialStore();s.products[0].active=false;s.categories[1].active=false;
  expect(queryCatalog(s,query()).total).toBe(179);expect(findPublicProduct(s,s.products[0].slug)).toBeNull();
  expect(findPublicProduct(s,s.products.find(p=>p.categoryId===s.categories[1].id)!.slug)).toBeNull();
 });
 it('ordena preços, pagina sem duplicações e rejeita parâmetros inválidos',()=>{
  const s=createInitialStore();const first=queryCatalog(s,query({sort:'price-asc'}));
  expect(first.items.map(p=>p.priceCents)).toEqual(first.items.map(p=>p.priceCents).sort((a,b)=>a!-b!));
  const ids=[];for(let page=1;page<=17;page++)ids.push(...queryCatalog(s,query({page})).items.map(p=>p.id));expect(new Set(ids).size).toBe(200);
  expect(()=>query({page:0})).toThrow();expect(()=>query({sort:'x'})).toThrow();expect(queryCatalog(s,query({q:'zzzzxx'})).total).toBe(0);
 });
 it('importação faz backup, preserva edições e é idempotente',async()=>{
  const base=path.resolve('../../work/tests');await mkdir(base,{recursive:true});const dir=await mkdtemp(path.join(base,'catalog-'));
  const legacy=createInitialStore();legacy.products=legacy.products.slice(0,1);legacy.products[0].name='Editado';legacy.products[0].active=false;
  await writeFile(path.join(dir,'store.json'),JSON.stringify(legacy));const repo=new JsonStoreRepository(dir);
  try{const result=await repo.addCatalog();expect(result.products).toBe(199);expect(result.backup).toBeTruthy();expect(JSON.parse(await readFile(result.backup!,'utf8')).products).toHaveLength(1);
  expect((await repo.read()).products[0].name).toBe('Editado');expect((await repo.read()).products[0].active).toBe(false);
  const before=await readFile(path.join(dir,'store.json'),'utf8');expect(await repo.addCatalog()).toEqual({products:0,categories:0,backup:null});expect(await readFile(path.join(dir,'store.json'),'utf8')).toBe(before);
  }finally{await repo.close()}
 });
 it('conflito de slug aborta sem alterar ficheiro',async()=>{
  const base=path.resolve('../../work/tests');await mkdir(base,{recursive:true});const dir=await mkdtemp(path.join(base,'catalog-conflict-'));
  const s=createInitialStore();s.products[0].id='728403ee-973d-53e4-9f5e-809866d7fea6';const bytes=JSON.stringify(s);await writeFile(path.join(dir,'store.json'),bytes);const repo=new JsonStoreRepository(dir);
  try{await expect(repo.addCatalog()).rejects.toThrow('Conflito');expect(await readFile(path.join(dir,'store.json'),'utf8')).toBe(bytes)}finally{await repo.close()}
 });
});
