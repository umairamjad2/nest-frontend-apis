// Turns a User-Agent header into a short label for the "Logged-in devices" list,
// e.g. "Chrome on Windows". Order matters: Edge and Opera also say "Chrome", and
// Chrome also says "Safari", so the more specific names are checked first.

const BROWSERS: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone/, 'iPhone'],
  [/iPad/, 'iPad'],
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Linux/, 'Linux'],
];

function match(table: [RegExp, string][], userAgent: string) {
  return table.find(([pattern]) => pattern.test(userAgent))?.[1];
}

export function describeUserAgent(userAgent: string | null | undefined): string {
  if (!userAgent) return 'Unknown device';

  const browser = match(BROWSERS, userAgent);
  const system = match(SYSTEMS, userAgent);

  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? 'Unknown device';
}
