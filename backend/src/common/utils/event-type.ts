// Turns a request's method+path into a short, filterable label for the
// admin Logs screen — named events for the ones an admin actually cares
// about (auth, admin actions), a generic fallback for the rest.
export function deriveEventType(method: string, path: string): string {
  const clean = path.split('?')[0];

  if (clean === '/auth/login') return 'auth.login';
  if (clean === '/auth/register') return 'auth.register';
  if (clean === '/auth/guest') return 'auth.guest';
  if (clean.startsWith('/auth/google') || clean.startsWith('/auth/github'))
    return 'auth.oauth';

  if (/^\/admin\/users\/[^/]+\/block$/.exec(clean)) return 'admin.user.blocked';
  if (/^\/admin\/users\/[^/]+\/unblock$/.exec(clean))
    return 'admin.user.unblocked';
  if (/^\/admin\/users\/[^/]+\/role$/.exec(clean))
    return 'admin.user.role_changed';
  if (/^\/admin\/users\/[^/]+\/reset-progress$/.exec(clean))
    return 'admin.user.reset_progress';
  if (method === 'DELETE' && /^\/admin\/users\/[^/]+$/.exec(clean))
    return 'admin.user.deleted';

  const [resource = 'root'] = clean.split('/').filter(Boolean);
  return `${method.toLowerCase()}.${resource}`;
}
