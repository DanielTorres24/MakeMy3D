import { getRepository } from '@/server/repository';
import { findPublicProduct } from '@/server/services/catalog-service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const result = findPublicProduct(await getRepository().read(), (await context.params).slug);
    return Response.json(result ?? { error: 'Artigo não encontrado.' }, { status: result ? 200 : 404, headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'Catálogo temporariamente indisponível.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
