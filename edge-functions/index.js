// 根路径 `/` -> GitHub 首页
export default function onRequest() {
  return fetch('https://github.com/');
}
