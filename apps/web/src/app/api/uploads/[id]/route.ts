import { getRepository } from '@/server/repository';
import { isAdmin } from '@/server/admin-session';
import { downloadUpload } from '@/server/services/uploads-service';
import { customerSession, apiError } from '@/server/services/commerce-http';
export const runtime='nodejs';
export async function GET(r:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const admin=await isAdmin(r);let owner:string|null=null;
    try {owner=await customerSession(false);}catch { /* Admin downloads need no customer session. */ }
    const repo=getRepository(),{item,buffer}=await downloadUpload(repo,repo.directory,(await params).id,owner,admin);
    return new Response(new Uint8Array(buffer),{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename*=UTF-8''${encodeURIComponent(item.originalName)}`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; sandbox"}});
  }catch(e){return apiError(e);}
}
