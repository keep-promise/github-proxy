// GitHub 反向代理（EdgeOne Edge Functions）
//   /raw/xxx     -> https://raw.githubusercontent.com/xxx
//   /assets/xxx  -> https://github.githubassets.com/xxx
//   其它路径       -> https://github.com/xxx

const UPSTREAMS = [
  { prefix: '/raw/',    host: 'raw.githubusercontent.com' },
  { prefix: '/assets/', host: 'github.githubassets.com' },
];

export default async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  // 默认走 github.com，命中 /raw/ 或 /assets/ 前缀时切换到对应上游
  let upstream = 'https://github.com' + path;
  for (const { prefix, host } of UPSTREAMS) {
    if (path.startsWith(prefix)) {
      upstream = 'https://' + host + path.slice(prefix.length - 1); // 去掉前缀（含末尾 /）
      break;
    }
  }

  const headers = new Headers(request.headers);
  headers.set('host', new URL(upstream).host); // 修正 Host，避免透传我方域名

  const resp = await fetch(upstream, {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
  });

  const out = new Response(resp.body, resp);
  out.headers.set('access-control-allow-origin', '*'); // 允许跨域调用（前端/脚本可直接用）
  return out;
}
