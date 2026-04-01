const SHARE_KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getRandomChar() {
  return SHARE_KEY_CHARS[Math.floor(Math.random() * SHARE_KEY_CHARS.length)];
}

export const CHAINID_SAMPLE = "ABC123";

export function generateChainId(length = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += getRandomChar();
  }
  return result;
}

export function validChainId(chainId: string): boolean {
  if (typeof chainId !== "string") return false;
  const regex = new RegExp(`^[${SHARE_KEY_CHARS}]{6}$`);
  return regex.test(chainId);
}

export function formatChainId(chainId: string): string {
  if (!chainId) return "";
  const cleaned = chainId.toUpperCase().replace(new RegExp(`[^${SHARE_KEY_CHARS}]`, "g"), "");
  return cleaned.slice(0, 6);
}
