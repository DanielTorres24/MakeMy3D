import { getRepository } from '@/server/repository';
import { adminSnapshot, mutateAdmin } from '@/server/admin-service';
import { adminError, readAdminBody, requireAdmin, requireSameOrigin } from '@/server/admin-session';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { try { await requireAdmin(request); return Response.json(adminSnapshot(await getRepository().read()), { headers: { 'Cache-Control': 'no-store' } }); } catch (error) { return adminError(error); } }
export async function POST(request: Request) { try { requireSameOrigin(request); await requireAdmin(request); const body = await readAdminBody(request); const store = await getRepository().update(draft => mutateAdmin(draft, body)); return Response.json(adminSnapshot(store), { headers: { 'Cache-Control': 'no-store' } }); } catch (error) { return adminError(error); } }
