import 'server-only';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
export class AdminError extends Error { constructor(public status: number, message: string) { super(message); } }
export const ADMIN_COOKIE = 'makemy3d_admin';
export const SESSION_SECONDS = 7200;
const globalState = globalThis as typeof globalThis & { adminSessions?: Map<string, number>; adminAttempts?: number[] };
const sessions = globalState.adminSessions ??= new Map<string, number>();
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function verifyPassword(password: string): boolean { return timingSafeEqual(Buffer.from(hash(password)), Buffer.from(hash(process.env.MAKEMY3D_ADMIN_PASSWORD || 'makemy3d-demo'))); }
export function issueSession(): string { const token = randomBytes(32).toString('hex'); for (const [key, expires] of sessions) if (expires <= Date.now()) sessions.delete(key); sessions.set(hash(token), Date.now() + SESSION_SECONDS * 1000); return token; }
function tokenFrom(request: Request): string { return request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1) || ''; }
export async function isAdmin(request: Request): Promise<boolean> { const token = tokenFrom(request); return /^[a-f0-9]{64}$/.test(token) && (sessions.get(hash(token)) || 0) > Date.now(); }
export async function requireAdmin(request: Request): Promise<void> { if (!await isAdmin(request)) throw new AdminError(401, 'Inicie sessão de demonstração.'); }
export function revokeSession(request: Request) { sessions.delete(hash(tokenFrom(request))); }
export function requireSameOrigin(request: Request) { if (request.headers.get('origin') !== (request.headers.get('host') ? new URL(request.url).protocol + '//' + request.headers.get('host') : new URL(request.url).origin)) throw new AdminError(403, 'Origem do pedido não autorizada.'); }
export function limitLogin() { const attempts = (globalState.adminAttempts ?? []).filter(at => at > Date.now() - 60_000); if (attempts.length >= 10) throw new AdminError(429, 'Demasiadas tentativas. Aguarde um minuto.'); attempts.push(Date.now()); globalState.adminAttempts = attempts; }
export async function readAdminBody(request: Request): Promise<unknown> { if (!request.headers.get('content-type')?.includes('application/json')) throw new AdminError(415, 'Envie JSON.'); if (Number(request.headers.get('content-length')) > 100_000) throw new AdminError(413, 'Pedido demasiado grande.'); const reader = request.body?.getReader(); const chunks: Uint8Array[] = []; let size = 0; if (reader) { while (true) { const result = await reader.read(); if (result.done) break; size += result.value.byteLength; if (size > 100_000) { await reader.cancel(); throw new AdminError(413, 'Pedido demasiado grande.'); } chunks.push(result.value); } } const raw = Buffer.concat(chunks).toString('utf8'); try { return JSON.parse(raw); } catch { throw new AdminError(400, 'JSON inválido.'); } }
export function adminError(error: unknown): Response { if (error instanceof AdminError) return Response.json({ error: error.message }, { status: error.status }); if (error instanceof Error && error.name === 'ZodError') return Response.json({ error: 'Dados inválidos. Verifique os campos.' }, { status: 400 }); console.error('Admin operation failed', error); return Response.json({ error: 'Não foi possível guardar os dados.' }, { status: 500 }); }

