import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import {
  buildAlertEmailHtml,
  buildAlertEmailSubject,
  buildAlertEmailText,
  type AlertEmailData,
} from './alert-email-template';

@Injectable()
export class EmailNotifierService {
  private readonly logger = new Logger(EmailNotifierService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string | undefined;
  private readonly to: string | undefined;

  constructor(configService: ConfigService) {
    const user = configService.get<string>('SMTP_USER');
    const pass = configService.get<string>('SMTP_APP_PASSWORD');
    this.to = configService.get<string>('ALERT_EMAIL_TO');
    this.from = user;

    this.transporter =
      user && pass
        ? createTransport({ service: 'gmail', auth: { user, pass } })
        : null;

    if (!this.transporter) {
      this.logger.warn(
        'E-mail não configurado (SMTP_USER/SMTP_APP_PASSWORD ausentes) — alertas não serão enviados por e-mail.',
      );
    }
  }

  // Best-effort — a notification failure must never affect alert evaluation.
  async sendAlert(data: AlertEmailData) {
    if (!this.transporter || !this.from || !this.to) return;

    try {
      await this.transporter.sendMail({
        from: `Focora <${this.from}>`,
        to: this.to,
        subject: buildAlertEmailSubject(data),
        text: buildAlertEmailText(data),
        html: buildAlertEmailHtml(data),
      });
    } catch (error) {
      this.logger.error('Falha ao enviar alerta por e-mail', error);
    }
  }
}
