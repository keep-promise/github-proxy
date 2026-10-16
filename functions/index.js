// 根路径 `/` -> GitHub 首页
export async function onRequest() {
  return await fetch('https://github.com/');
}
