import { NextResponse } from 'next/server';
import { getRepository } from '@/server/repository';
import { createQuote } from '@/server/services/commerce-service';
import { customerSession, readJson, apiError } from '@/server/services/commerce-http';
export async function POST(r:Request) { try { const data=await readJson(r); const quote=await createQuote(getRepository(),await customerSession(),data); return NextResponse.json({id:quote.id,reference:quote.reference},{status:201}); } catch(e){return apiError(e);} }
