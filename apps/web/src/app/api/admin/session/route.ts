import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_COOKIE, SESSION_SECONDS, adminError, issueSession, isAdmin, limitLogin, readAdminBody, requireSameOrigin, revokeSession, verifyPassword, AdminError } from '@/server/admin-session';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return Response.json({ authenticated: await isAdmin(request), defaultPassword: !process.env.MAKEMY3D_ADMIN_PASSWORD }, { headers: { 'Cache-Control': 'no-store' } }); }
export async function POST(request: Request) { try { requireSameOrigin(request); limitLogin(); const { password } = z.strictObject({ password: z.string().max(200) }).parse(await readAdminBody(request)); if (!verifyPassword(password)) throw new AdminError(401, 'Palavra-passe incorreta.'); const response = NextResponse.json({ authenticated: true }); response.cookies.set(ADMIN_COOKIE, issueSession(), { httpOnly: true, sameSite: 'strict', secure: new URL(request.url).protocol === 'https:', path: '/', maxAge: SESSION_SECONDS }); return response; } catch (error) { return adminError(error); } }
export async function DELETE(request: Request) { try { requireSameOrigin(request); revokeSession(request); const response = NextResponse.json({ authenticated: false }); response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 }); return response; } catch (error) { return adminError(error); } }
