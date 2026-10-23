import { constants } from 'node:fs';
import { readFileSync, unlinkSync } from 'node:fs';
import { mkdir, open, readFile, rename, unlink, copyFile, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { storeSchema, type Store } from '../../domain/schemas';
import { createInitialStore } from '../seeds/initial';
import type { StoreRepository } from './store-repository';

function code(error: unknown): string | undefined { return (error as NodeJS.ErrnoException).code; }
export class StoreError extends Error {
  constructor(public readonly kind: 'LOCKED' | 'INVALID' | 'IO' | 'CLOSED' | 'CONFIRMATION', message: string, options?: ErrorOptions) { super(message, options); }
}

/** Um ficheiro privado, uma instância, fila por processo e lease exclusivo no disco. */
export class JsonStoreRepository implements StoreRepository {
  private queue: Promise<unknown> = Promise.resolve();
  private owned = false;
  private closed = false;
  private readonly token = randomUUID();
  readonly directory: string;
  private readonly file: string;
  private readonly lock: string;
  private readonly exitCleanup = () => {
    if (!this.owned) return;
    try {
      if (JSON.parse(readFileSync(this.lock, 'utf8')).token === this.token) unlinkSync(this.lock);
    } catch { /* Não substituir nem apagar locks de outra instância. */ }
  };

  constructor(directory: string) {
    this.directory = path.resolve(directory);
    if (this.directory.split(path.sep).some((part) => part.toLowerCase() === 'public')) throw new StoreError('IO', 'Dados não podem ficar em public.');
    this.file = path.join(this.directory, 'store.json');
    this.lock = path.join(this.directory, '.writer.lock');
  }

  private serialized<T>(action: () => Promise<T>): Promise<T> {
    if (this.closed) return Promise.reject(new StoreError('CLOSED', 'Repositório encerrado.'));
    const result = this.queue.then(action);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async assertRegularFile(file: string): Promise<void> {
    try {
      const stat = await lstat(file);
      if (!stat.isFile() || stat.isSymbolicLink()) throw new StoreError('IO', 'Ficheiro de dados inválido.');
    } catch (error) { if (code(error) !== 'ENOENT') throw error; }
  }

  private async initialize(): Promise<void> {
    if (this.owned) return;
    await mkdir(this.directory, { recursive: true });
    if ((await realpath(this.directory)).toLowerCase() !== this.directory.toLowerCase()) throw new StoreError('IO', 'Não são permitidos atalhos/symlinks na pasta de dados.');
    let handle;
    try { handle = await open(this.lock, 'wx', 0o600); }
    catch (error) {
      if (code(error) === 'EEXIST') throw new StoreError('LOCKED', 'Dados em utilização ou lock de execução interrompida. Pare a outra instância; consulte docs/LOCAL_DEVELOPMENT.md.', { cause: error });
      throw error;
    }
    try {
      await handle.writeFile(JSON.stringify({ pid: process.pid, token: this.token, startedAt: new Date().toISOString() }));
      await handle.sync();
    } catch (error) { await handle.close(); await unlink(this.lock); throw error; }
    await handle.close();
    this.owned = true;
    process.once('exit', this.exitCleanup);
    try {
      await this.assertRegularFile(this.file);
      try { await readFile(this.file); }
      catch (error) { if (code(error) === 'ENOENT') await this.write(createInitialStore()); else throw error; }
    } catch (error) { await this.release(); throw error; }
  }

  private async load(): Promise<Store> {
    await this.assertRegularFile(this.file);
    const raw = await readFile(this.file, 'utf8');
    try { return storeSchema.parse(JSON.parse(raw)); }
    catch (error) { throw new StoreError('INVALID', 'Dados inválidos: ficheiro preservado, sem reposição automática.', { cause: error }); }
  }

  private async write(store: Store): Promise<void> {
    const serialized = JSON.stringify(storeSchema.parse(store), null, 2) + '\n';
    const temporary = path.join(this.directory, `.store-${randomUUID()}.tmp`);
    const handle = await open(temporary, 'wx', 0o600);
    try { await handle.writeFile(serialized, 'utf8'); await handle.sync(); }
    catch (error) { await handle.close(); await unlink(temporary).catch(() => undefined); throw error; }
    await handle.close();
    try { await rename(temporary, this.file); }
    catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
  }

  read(): Promise<Store> { return this.serialized(async () => { await this.initialize(); return this.load(); }); }

  update(change: (draft: Store) => void | Promise<void>): Promise<Store> {
    return this.serialized(async () => {
      await this.initialize();
      const draft = await this.load();
      await change(draft);
      draft.revision += 1;
      draft.updatedAt = new Date().toISOString();
      const valid = storeSchema.parse(draft);
      await this.assertRegularFile(this.file);
      await this.write(valid);
      return structuredClone(valid);
    });
  }

  reset(confirmation: 'REPOR DEMO'): Promise<string> {
    return this.serialized(async () => {
      if (confirmation !== 'REPOR DEMO') throw new StoreError('CONFIRMATION', 'Reposição exige confirmação explícita.');
      await this.initialize();
      await this.assertRegularFile(this.file);
      // Cópia bruta permite recuperação mesmo quando o JSON original está inválido.
      const backup = path.join(this.directory, `store-backup-${Date.now()}-${randomUUID()}.json`);
      await copyFile(this.file, backup, constants.COPYFILE_EXCL);
      await this.write(createInitialStore());
      return backup;
    });
  }

  private async release(): Promise<void> {
    if (!this.owned) return;
    if (JSON.parse(await readFile(this.lock, 'utf8')).token === this.token) await unlink(this.lock);
    this.owned = false;
    process.removeListener('exit', this.exitCleanup);
  }

  async close(): Promise<void> { this.closed = true; await this.queue; await this.release(); }
}
