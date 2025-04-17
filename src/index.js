export default {
  async fetch(request){
    const { searchParams } = new URL(request.url);
    const timestamp = searchParams.get("timestamp");
    const apiSecret = searchParams.get("api_secret");

    if (!timestamp || !apiSecret) {
      return new Response("Missing timestamp or api_secret", { status: 400 });
    }

    const stringToSign = `timestamp=${timestamp}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiSecret);
    const msgData = encoder.encode(stringToSign);

    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray.map(b => b.toString(16).padStart(2, "0")).join("");

    return new Response(JSON.stringify({
      signature,
      string_to_sign: stringToSign
    }), {
      headers: { "Content-Type": "application/json" }
    });
  },
};
