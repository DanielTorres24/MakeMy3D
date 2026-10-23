import { getRepository } from '@/server/repository';
import { getStoreHealth } from '@/server/services/store-service';
import { StoreError } from '@/server/repositories/json-store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try { return Response.json(await getStoreHealth(getRepository()), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) {
    console.error('[MakeMy3D] Armazenamento indisponível:', error instanceof StoreError ? error.kind : 'IO');
    return Response.json({ status: 'unavailable', message: 'Armazenamento indisponível. Consulte o terminal e a documentação local.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
