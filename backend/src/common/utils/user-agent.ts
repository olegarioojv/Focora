// Deliberately simple substring-based parsing — good enough for admin
// display purposes, avoids pulling in a full UA-parsing dependency.
export function parseUserAgent(userAgent: string | undefined | null) {
  if (!userAgent) return { browser: null, os: null };

  let browser: string | null = null;
  if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('OPR/') || userAgent.includes('Opera'))
    browser = 'Opera';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/'))
    browser = 'Safari';

  let os: string | null = null;
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad'))
    os = 'iOS';
  else if (userAgent.includes('Linux')) os = 'Linux';

  return { browser, os };
}
