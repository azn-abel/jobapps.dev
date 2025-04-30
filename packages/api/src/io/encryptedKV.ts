// crypto-helpers.ts

export async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyData = enc.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData.slice(0, 32),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptAndPut(
  kv: KVNamespace,
  key: string,
  value: any,
  secret: string
): Promise<void> {
  console.log(secret);
  const cryptoKey = await getKey(secret);
  console.log("here");

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(value));

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    encoded
  );

  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), iv.length);

  const base64Combined = btoa(String.fromCharCode(...combined));

  await kv.put(key, base64Combined);
}

export async function getAndDecrypt<T = unknown>(
  kv: KVNamespace,
  key: string,
  secret: string
): Promise<T | null> {
  const base64Combined = await kv.get(key);
  if (!base64Combined) return null;

  const combined = Uint8Array.from(atob(base64Combined), (c) =>
    c.charCodeAt(0)
  );
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const cryptoKey = await getKey(secret);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    ciphertext
  );

  const decoded = new TextDecoder().decode(decryptedBuffer);

  return JSON.parse(decoded);
}
