import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { JsonStoreRepository } from '../src/server/repositories/json-store';
import { getStoreHealth } from '../src/server/services/store-service';
import { createInitialStore } from '../src/server/seeds/initial';
import { productSchema, customizationSchema, storeSchema } from '../src/domain/schemas';

vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs/promises')>();
  return { ...actual, rename: vi.fn(actual.rename) };
});

let directory: string;
let repository: JsonStoreRepository;
const testRoot = path.resolve(process.cwd(), '../../work/tests');
beforeEach(async () => { await mkdir(testRoot, { recursive: true }); directory = await mkdtemp(path.join(testRoot, 'makemy3d-test-')); repository = new JsonStoreRepository(directory); });
afterEach(async () => {
  vi.restoreAllMocks(); await repository.close();
  if (path.dirname(path.resolve(directory)) !== testRoot || !path.basename(directory).startsWith('makemy3d-test-')) throw new Error('Limpeza fora da pasta de testes recusada.');
  await rm(directory, { recursive: true, force: true });
});
const child = (directory: string, action = 'read') => spawnSync(process.execPath, ['--import', 'tsx', 'tests/fixtures/store-process.ts', directory, action], { cwd: process.cwd(), encoding: 'utf8', timeout: 15000 });

describe('persistência JSON local', () => {
  it('cria seed só quando ausente e mantém dados após reabrir', async () => {
    expect((await repository.read()).schemaVersion).toBe(1);
    await repository.update((store) => { store.settings.name = 'Nome preservado'; });
    await repository.close();
    const second = new JsonStoreRepository(directory);
    try { expect((await second.read()).settings.name).toBe('Nome preservado'); }
    finally { await second.close(); }
  });
  it('persiste após terminar e arrancar outro processo Node', () => {
    const first = child(directory, 'update');
    expect(first.status, first.stderr).toBe(0);
    const restarted = child(directory);
    expect(restarted.status, restarted.stderr).toBe(0);
    expect(JSON.parse(restarted.stdout).settings.name).toBe('Persistência entre processos');
  });
  it('serializa read-modify-write concorrente sem perder atualizações', async () => {
    await Promise.all(Array.from({ length: 30 }, () => repository.update(async (store) => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      store.settings.name = `Revisão ${store.revision + 1}`;
    })));
    const state = await repository.read();
    expect(state.revision).toBe(30);
    expect(state.settings.name).toBe('Revisão 30');
    expect((await readdir(directory)).filter((name) => name.endsWith('.tmp'))).toEqual([]);
  });
  it('recusa outro processo enquanto a instância detém o lock', async () => {
    await repository.read();
    const result = child(directory, 'update');
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Dados em utilização');
    expect((await repository.read()).revision).toBe(0);
  });
  it('recusa uma segunda instância e reset enquanto o lock está ativo', async () => {
    await repository.read();
    const other = new JsonStoreRepository(directory);
    try { await expect(other.reset('REPOR DEMO')).rejects.toMatchObject({ kind: 'LOCKED' }); }
    finally { await other.close(); }
  });
  it('callback falhada ou schema inválido preservam bytes e não bloqueiam a fila', async () => {
    await repository.read();
    const before = await readFile(path.join(directory, 'store.json'), 'utf8');
    await expect(repository.update(() => { throw new Error('Abortar'); })).rejects.toThrow('Abortar');
    await expect(repository.update((store) => { store.settings.name = ''; })).rejects.toThrow();
    expect(await readFile(path.join(directory, 'store.json'), 'utf8')).toBe(before);
    expect((await repository.update((store) => { store.settings.name = 'Recuperado'; })).revision).toBe(1);
  });
  it('erro de rename preserva snapshot anterior e remove temporário', async () => {
    await repository.read();
    const before = await readFile(path.join(directory, 'store.json'), 'utf8');
    vi.mocked(fs.rename).mockRejectedValueOnce(Object.assign(new Error('Disco indisponível'), { code: 'EIO' }));
    await expect(repository.update((store) => { store.settings.name = 'Não guardar'; })).rejects.toThrow('Disco indisponível');
    expect(await readFile(path.join(directory, 'store.json'), 'utf8')).toBe(before);
    expect((await readdir(directory)).some((name) => name.endsWith('.tmp'))).toBe(false);
    expect((await repository.read()).revision).toBe(0);
  });
  it('JSON corrompido não é silenciosamente substituído', async () => {
    await writeFile(path.join(directory, 'store.json'), '{ inválido');
    await expect(repository.read()).rejects.toMatchObject({ kind: 'INVALID' });
    expect(await readFile(path.join(directory, 'store.json'), 'utf8')).toBe('{ inválido');
  });
  it('versão de schema desconhecida é preservada e rejeitada', async () => {
    const raw = JSON.stringify({ ...createInitialStore(), schemaVersion: 99 });
    await writeFile(path.join(directory, 'store.json'), raw);
    await expect(repository.read()).rejects.toMatchObject({ kind: 'INVALID' });
    expect(await readFile(path.join(directory, 'store.json'), 'utf8')).toBe(raw);
  });
  it('reset exige confirmação, faz backup e preserva uploads', async () => {
    await repository.update((store) => { store.settings.name = 'Antes de repor'; });
    await mkdir(path.join(directory, 'uploads'));
    await writeFile(path.join(directory, 'uploads', 'preservar.txt'), 'conteúdo');
    await expect(repository.reset('NÃO' as 'REPOR DEMO')).rejects.toMatchObject({ kind: 'CONFIRMATION' });
    const backup = await repository.reset('REPOR DEMO');
    expect(JSON.parse(await readFile(backup, 'utf8')).settings.name).toBe('Antes de repor');
    expect((await repository.read()).settings.name).toBe('MakeMy3D');
    expect(await readFile(path.join(directory, 'uploads', 'preservar.txt'), 'utf8')).toBe('conteúdo');
  });
  it('reset confirmado preserva backup de JSON corrompido', async () => {
    await writeFile(path.join(directory, 'store.json'), '{ corrupção');
    const backup = await repository.reset('REPOR DEMO');
    expect(await readFile(backup, 'utf8')).toBe('{ corrupção');
    expect((await repository.read()).revision).toBe(0);
  });
  it('não permite caminho public nem operações após close', async () => {
    expect(() => new JsonStoreRepository(path.join(directory, 'public', 'dados'))).toThrow('public');
    await repository.close();
    await expect(repository.read()).rejects.toMatchObject({ kind: 'CLOSED' });
  });
  it('health devolve apenas metadados públicos', async () => {
    expect(await getStoreHealth(repository)).toEqual({ status: 'ok', application: 'MakeMy3D', mode: 'local-demo', schemaVersion: 1 });
  });
});
describe('contratos do domínio', () => {
  it('seed versionado contém catálogo demo e não inventa clientes', () => {
    const seed = storeSchema.parse(createInitialStore());
    expect(seed.products).toHaveLength(200);
    expect(seed.customers).toEqual([]);
    expect(seed.settings.currency).toBe('EUR');
  });
  it('recusa campos desconhecidos e personalizações excessivas', () => {
    expect(customizationSchema.safeParse({ unknown: true }).success).toBe(false);
    expect(customizationSchema.safeParse({ text: 'a'.repeat(201) }).success).toBe(false);
  });
  it('recusa preços fracionários e categorias inexistentes', () => {
    const product = { id: '6f4562d6-e5c6-4f00-a9dc-a58bcc214231', categoryId: '6f4562d6-e5c6-4f00-a9dc-a58bcc214232', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), name: 'Exemplo de teste', slug: 'exemplo', description: '', kind: 'physical', priceCents: 1.5, active: false, provenance: { sourceUrl: null, author: null, rights: 'original-demo', licenceNote: 'Apenas teste' } };
    expect(productSchema.safeParse(product).success).toBe(false);
    expect(storeSchema.safeParse({ ...createInitialStore(), products: [{ ...product, priceCents: 150 }] }).success).toBe(false);
  });
});
