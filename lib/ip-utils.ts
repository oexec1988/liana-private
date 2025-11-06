export function getClientIP(request: Request): string {
  // Try multiple headers in order of preference
  const xForwardedFor = request.headers.get("x-forwarded-for")
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one (client IP)
    return xForwardedFor.split(",")[0].trim()
  }

  const xRealIp = request.headers.get("x-real-ip")
  if (xRealIp) {
    return xRealIp
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip")
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return "Unknown"
}
