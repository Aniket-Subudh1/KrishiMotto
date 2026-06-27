/** Extract a fixed-length numeric OTP from an SMS body. */
export function extractOtpFromMessage(message: string, length = 6): string | null {
  const pattern = new RegExp(`\\b\\d{${length}}\\b`);
  return message.match(pattern)?.[0] ?? null;
}
