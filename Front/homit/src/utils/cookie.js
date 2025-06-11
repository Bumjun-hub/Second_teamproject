// 원하는 쿠키값을 꺼낼수 있게하는 쿠키 유틸 함수
export function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}
