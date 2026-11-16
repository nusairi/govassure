// Allow only absolute http(s) URLs for feed item links; anything else (javascript:, data:, relative) is dropped.
module.exports = function safeUrl(u) {
  if (typeof u !== "string") return null;
  const s = u.trim();
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    const p = new URL(s);
    if ((p.protocol !== "http:" && p.protocol !== "https:") || !p.hostname) return null;
    return p.href;
  } catch (e) {
    return null;
  }
};
