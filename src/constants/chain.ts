const SHARE_KEY_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 4;

function getRandomChar() {
  return SHARE_KEY_CHARS[Math.floor(Math.random() * SHARE_KEY_CHARS.length)];
}

function getRandomSegment(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += getRandomChar();
  }
  return result;
}

export const CHAINID_SAMPLE = "AB12-SD42-2D5Z-35F2";

export function generateChainId(): string {
  const segments = [];
  for (let i = 0; i < SEGMENT_COUNT; i++) {
    segments.push(getRandomSegment(SEGMENT_LENGTH));
  }
  return segments.join("-");
}

export function validChainId(chainId: string): boolean {
  if (typeof chainId !== "string") return false;
  const regex = new RegExp(`^[${SHARE_KEY_CHARS}]{${SEGMENT_LENGTH}}(-[${SHARE_KEY_CHARS}]{${SEGMENT_LENGTH}}){${SEGMENT_COUNT - 1}}$`);
  return regex.test(chainId);
}

export function formatChainId(chainId: string): string {
  if (!chainId) return "";

  const cleaned = chainId.toUpperCase().replace(new RegExp(`[^${SHARE_KEY_CHARS}]`, "g"), "");

  const segments = [];
  for (let i = 0; i < cleaned.length; i += SEGMENT_LENGTH) {
    const segment = cleaned.slice(i, i + SEGMENT_LENGTH);
    if (segment) {
      segments.push(segment);
    }
  }

  return segments.slice(0, SEGMENT_COUNT).join("-");
}
