import { getRepository } from '@/server/repository';
import { publicCategories } from '@/server/services/catalog-service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET() {
  try { return Response.json({ items: publicCategories(await getRepository().read()) }, { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: 'Catálogo temporariamente indisponível.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
