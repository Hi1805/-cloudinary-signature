export default {
  async fetch(request) {
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get("timestamp");
    const apiSecret = searchParams.get("api_secret");

    if (!timestamp || !apiSecret) {
      return new Response("Missing timestamp or api_secret", { status: 400 });
    }

    const stringToSign = `timestamp=${timestamp}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign + apiSecret);

    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return new Response(
      JSON.stringify({ signature, string_to_sign: stringToSign }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  },
};