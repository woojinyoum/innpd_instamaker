/**
 * 쿠팡 파트너스 API 중계 프록시 (Cloudflare Worker)
 * ------------------------------------------------------------
 * 브라우저(GitHub Pages)에서는 api-gateway.coupang.com 을 직접 호출할 수 없어(CORS 차단)
 * 이 작은 중계 서버가 요청을 그대로 쿠팡에 전달하고 응답을 돌려줍니다.
 *  - 서명(HMAC)은 앱(브라우저)에서 만들어 Authorization 헤더로 보내므로
 *    이 서버에는 Access Key / Secret Key 가 저장되지 않습니다.
 *  - 파트너스 Open API 경로(/v2/providers/affiliate_open_api/...)만 전달합니다.
 *
 * 설치 (약 3분, 무료):
 *  1) https://dash.cloudflare.com 가입/로그인 → 왼쪽 메뉴 "Workers & Pages" → "Create" → "Create Worker"
 *  2) 이름을 정하고 Deploy → "Edit code" 를 눌러 기본 코드를 전부 지우고 이 파일 내용을 붙여넣기 → Deploy
 *  3) 화면에 보이는 주소(https://이름.계정.workers.dev)를 복사해 앱의 쇼핑 탭 → "쿠팡 파트너스 자동 링크" → 프록시 URL 칸에 붙여넣기
 */
export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Target-Path',
      'Access-Control-Max-Age': '86400',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method === 'GET') return new Response(JSON.stringify({ ok: true, service: 'coupang-partners-proxy' }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    if (request.method !== 'POST') return new Response('POST only', { status: 405, headers: cors });

    const path = request.headers.get('X-Target-Path') || '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
    if (!path.startsWith('/v2/providers/affiliate_open_api/')) return new Response('bad path', { status: 400, headers: cors });
    const auth = request.headers.get('Authorization') || '';
    if (!auth.startsWith('CEA ')) return new Response('missing CEA authorization', { status: 400, headers: cors });

    const body = await request.text();
    let upstream;
    try {
      upstream = await fetch('https://api-gateway.coupang.com' + path, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/json;charset=UTF-8' },
        body,
      });
    } catch (e) {
      return new Response(JSON.stringify({ rCode: '-1', rMessage: 'upstream error: ' + (e && e.message) }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { ...cors, 'Content-Type': 'application/json' } });
  },
};
