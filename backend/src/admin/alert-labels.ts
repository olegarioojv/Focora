// Mirrors the labels shown in the admin Alerts page
// (frontend/src/pages/Admin/admin-alerts-page.tsx) so the email reads
// the same way as the panel.
export const ALERT_TYPE_LABELS: Record<string, string> = {
  db_down: 'Banco de dados indisponível',
  high_cpu: 'Uso elevado de CPU',
  high_memory: 'Uso elevado de memória',
  many_errors: 'Muitas exceções (erros 5xx)',
  many_login_failures: 'Muitas falhas de login',
  request_spike: 'Pico de requisições',
};
