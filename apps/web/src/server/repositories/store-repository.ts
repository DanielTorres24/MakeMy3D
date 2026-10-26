import type { Store } from '../../domain/schemas';

/** A callback não deve chamar o próprio repositório; executa sob exclusão. */
export interface StoreRepository {
  read(): Promise<Store>;
  update(change: (draft: Store) => void | Promise<void>): Promise<Store>;
  reset(confirmation: 'REPOR DEMO'): Promise<string>;
  close(): Promise<void>;
}
