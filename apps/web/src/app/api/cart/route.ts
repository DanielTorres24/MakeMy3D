import { NextResponse } from 'next/server';
import { getRepository } from '@/server/repository';
import { addItem, changeItem, removeItem, getCart } from '@/server/services/commerce-service';
import { customerSession, readJson, apiError } from '@/server/services/commerce-http';
export const dynamic='force-dynamic';
export async function GET() { try { return NextResponse.json(await getCart(getRepository(),await customerSession()),{headers:{'Cache-Control':'no-store'}}); } catch(e){return apiError(e);} }
export async function POST(r:Request) { try { const data=await readJson(r); return NextResponse.json(await addItem(getRepository(),await customerSession(),data)); } catch(e){return apiError(e);} }
export async function PATCH(r:Request) { try { const data=await readJson(r); return NextResponse.json(await changeItem(getRepository(),await customerSession(false),data)); } catch(e){return apiError(e);} }
export async function DELETE(r:Request) { try { const data=await readJson(r); return NextResponse.json(await removeItem(getRepository(),await customerSession(false),data.id)); } catch(e){return apiError(e);} }
