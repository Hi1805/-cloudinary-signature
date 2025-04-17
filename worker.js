export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { searchParams } = url;

    if (request.method !== 'GET') {
      return new Response('Only GET method allowed', { status: 405 });
    }

    const timestamp = searchParams.get('timestamp');
    const apiSecret = searchParams.get('api_secret');

    if (!timestamp || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing timestamp or api_secret' }),
        { status: 400 }
      );
    }

    const data = `timestamp=${timestamp}${apiSecret}`;
    const hash = await sha1(data);

    return new Response(JSON.stringify({ signature: hash }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

async function sha1(data) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);
  const buffer = await crypto.subtle.digest('SHA-1', encoded);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}