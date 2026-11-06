import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const portIndex = process.argv.indexOf('--port');
const hostIndex = process.argv.indexOf('--host');
const port = Number((portIndex >= 0 ? process.argv[portIndex + 1] : '') || process.env.PORT || 3000);
const host = hostIndex >= 0 ? process.argv[hostIndex + 1] : '0.0.0.0';
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf'};
http.createServer(async (req,res) => {
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path=resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
    if(!path.startsWith(resolve(root)+sep)){res.writeHead(403);res.end('Forbidden');return;}
    const content=await readFile(path);
    res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:content);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port,host,()=>console.log(`Portfolio available on port ${port}`));
