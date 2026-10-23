import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.QA_PORT||3198);
export default defineConfig({
 testDir:path.join(root,'apps/web/e2e'),fullyParallel:false,workers:1,timeout:60000,
 outputDir:path.join(root,'work/playwright-results'),reporter:[['list'],['html',{outputFolder:path.join(root,'work/playwright-report'),open:'never'}]],
 use:{baseURL:`http://127.0.0.1:${port}`,viewport:{width:1440,height:1000},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'node scripts/server.mjs --production',cwd:root,url:`http://127.0.0.1:${port}/api/health`,reuseExistingServer:false,timeout:60000,env:{...process.env,PORT:String(port),MAKEMY3D_DATA_DIR:path.join(root,`work/qa-browser-${Date.now()}`),MAKEMY3D_ADMIN_PASSWORD:'qa-browser-demo'}},
});
