export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const apiSecret = searchParams.get("api_secret");
    if (!apiSecret) {
      return new Response("Missing api_secret", { status: 400 });
    }

    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (!["file", "api_key", "signature", "api_secret"].includes(key)) {
        params[key] = value;
      }
    }

    const stringToSign = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");

    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign + apiSecret);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return new Response(JSON.stringify({ signature, string_to_sign: stringToSign }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
