import { NextResponse } from 'next/server';
import { getRepository } from '@/server/repository';
import { checkout } from '@/server/services/commerce-service';
import { customerSession, readJson, apiError } from '@/server/services/commerce-http';
export async function POST(r:Request) { try { const data=await readJson(r); const order=await checkout(getRepository(),await customerSession(false),data); return NextResponse.json({id:order.id,reference:order.reference,totalCents:order.totalCents,simulated:true},{status:201}); } catch(e){return apiError(e);} }
