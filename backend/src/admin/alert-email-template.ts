export interface AlertEmailData {
  status: 'triggered' | 'resolved';
  typeLabel: string;
  severity: string;
  message: string;
  timestamp: Date;
}

function formatDateTime(date: Date) {
  return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export function buildAlertEmailSubject(data: AlertEmailData) {
  const prefix = data.status === 'triggered' ? '🔴' : '✅';
  const action = data.status === 'triggered' ? 'Alerta' : 'Resolvido';
  return `${prefix} Focora — ${action}: ${data.typeLabel}`;
}

export function buildAlertEmailText(data: AlertEmailData) {
  const action = data.status === 'triggered' ? 'ALERTA DISPARADO' : 'ALERTA RESOLVIDO';
  return [
    `${action}: ${data.typeLabel}`,
    '',
    data.message,
    '',
    `Severidade: ${data.severity}`,
    `Horário: ${formatDateTime(data.timestamp)}`,
    '',
    'Painel Administrativo — Focora',
  ].join('\n');
}

export function buildAlertEmailHtml(data: AlertEmailData) {
  const isResolved = data.status === 'resolved';
  const accentColor = isResolved ? '#22c55e' : data.severity === 'critical' ? '#ef4444' : '#f97316';
  const badgeLabel = isResolved
    ? 'Resolvido'
    : data.severity === 'critical'
      ? 'Crítico'
      : 'Atenção';
  const headline = isResolved ? 'Alerta resolvido' : 'Alerta disparado';
  const emoji = isResolved ? '✅' : '🔴';

  return `
<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background-color:#0b0a10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background-color:#151420;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
      <tr>
        <td style="padding:20px 24px;background-color:${accentColor};">
          <span style="font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#ffffff;opacity:0.9;">Focora · Painel Administrativo</span>
          <h1 style="margin:6px 0 0;font-size:20px;color:#ffffff;font-weight:700;">${emoji} ${headline}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <span style="display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;color:${accentColor};background-color:${accentColor}22;">
            ${badgeLabel}
          </span>
          <h2 style="margin:14px 0 6px;font-size:17px;color:#f5f5f7;">${data.typeLabel}</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#a8a6b3;">${data.message}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
            <tr>
              <td style="padding:4px 0;font-size:12px;color:#6f6d7a;">Severidade</td>
              <td style="padding:4px 0;font-size:12px;color:#f5f5f7;text-align:right;text-transform:capitalize;">${data.severity}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:12px;color:#6f6d7a;">Horário</td>
              <td style="padding:4px 0;font-size:12px;color:#f5f5f7;text-align:right;">${formatDateTime(data.timestamp)}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;background-color:#0f0e17;">
          <p style="margin:0;font-size:11px;color:#6f6d7a;">
            Mensagem automática do monitoramento do Focora. Você está recebendo isso porque é administrador da plataforma.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
