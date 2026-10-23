import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepository } from '../repository';
import { CommerceError, createCustomerSession } from './commerce-service';
export async function customerSession(create = true) {
  const jar = await cookies(); const existing = jar.get('mm3d-customer')?.value;
  if (existing && z.uuid().safeParse(existing).success && (await getRepository().read()).carts.some(c => c.id === existing)) return existing;
  if (!create) throw new CommerceError('Sessão não encontrada.', 401);
  const id = await createCustomerSession(getRepository());
  jar.set('mm3d-customer', id, { httpOnly: true, sameSite: 'strict', secure: process.env.MAKEMY3D_COOKIE_SECURE === 'true', path: '/', maxAge: 60*60*24*30 });
  return id;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if ((origin && origin !== (request.headers.get('host') ? new URL(request.url).protocol + '//' + request.headers.get('host') : new URL(request.url).origin)) || request.headers.get('sec-fetch-site') === 'cross-site') throw new CommerceError('Origem não autorizada.', 403);
}
export async function readJson(request: Request) {
  checkOrigin(request);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new CommerceError('Esperado JSON.',415);
  const reader = request.body?.getReader(); if (!reader) throw new CommerceError('Pedido vazio.');
  const chunks: Uint8Array[] = []; let length = 0;
  for (;;) { const part = await reader.read(); if (part.done) break; length += part.value.length; if (length > 64*1024) { await reader.cancel(); throw new CommerceError('Pedido demasiado grande.',413); } chunks.push(part.value); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new CommerceError('JSON inválido.'); }
}
export function apiError(error: unknown) {
  if (error instanceof z.ZodError) return NextResponse.json({ error: 'Dados inválidos. Verifique os campos e o consentimento.' }, {status: 400});
  if (error instanceof CommerceError) return NextResponse.json({error: error.message}, {status: error.status});
  console.error('Commerce API failure', error);
  return NextResponse.json({error: 'Não foi possível concluir. Tente novamente.'}, {status: 500});
}
