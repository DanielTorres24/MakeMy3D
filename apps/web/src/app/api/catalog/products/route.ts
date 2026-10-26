import { getRepository } from '@/server/repository';
import { catalogQuerySchema, queryCatalog } from '@/server/services/catalog-service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  const parsed = catalogQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: 'Filtros inválidos.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  try { return Response.json(queryCatalog(await getRepository().read(), parsed.data), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return Response.json({ error: 'Catálogo temporariamente indisponível.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
