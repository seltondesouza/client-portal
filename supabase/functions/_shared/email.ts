// Transactional emails. Sends with Brevo when BREVO_API_KEY is set, else Resend when RESEND_API_KEY is set, else Gmail SMTP,
// and does nothing (in-app updates only) when neither is configured. One simple black-and-white template.
// Only service emails go out from here (confirmations, receipts, project updates): no marketing, so no unsubscribe link is needed.
import nodemailer from 'npm:nodemailer@6'

const SITE_URL = Deno.env.get('SITE_URL')!
const FROM_NAME = 'Selton de Souza'

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
const eur = (cents: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(cents / 100)

function layout(title: string, body: string, button: { label: string; path: string } | null = { label: 'Ver o meu projeto', path: '/painel' }) {
  return `<div style="font-family:Inter,Arial,sans-serif;background:#fff;color:#000;padding:32px;max-width:480px;margin:auto">
  <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
  <p style="font-size:15px;line-height:1.5;margin:0 0 24px">${body}</p>
  ${button ? `<a href="${SITE_URL}${button.path}" style="display:inline-block;background:#000;color:#fff;padding:10px 18px;text-decoration:none;font-size:14px">${button.label}</a>` : ''}
  <p style="font-size:12px;color:#6b6b6b;margin:32px 0 0">Recebeu este email porque tem uma conta em ${FROM_NAME}. É uma mensagem de serviço, sobre o seu projeto ou pagamento.</p>
</div>`
}

export const templates = {
  welcome: () => ({
    subject: 'Pagamento confirmado',
    html: layout('Pagamento confirmado', 'Obrigado! Recebemos o seu pagamento e o seu projeto já foi criado. Aceda ao painel com o seu email e palavra-passe para acompanhar o progresso.'),
  }),
  stage: (stageLabel: string, note?: string) => ({
    subject: `O seu projeto passou para a fase ${stageLabel}`,
    html: layout(
      `Fase: ${stageLabel}`,
      `O seu projeto passou para a fase ${stageLabel}. Aguarde o próximo passo.${note ? `<br><br>${escapeHtml(note)}` : ''}`,
    ),
  }),
  live: (previewUrl?: string | null) => ({
    subject: 'O seu website está online!',
    html: layout('O seu website está online', `Boas notícias: o seu projeto está concluído e online.${previewUrl ? ` <a href="${previewUrl}" style="color:#000">${previewUrl}</a>` : ''}`),
  }),
  orderPaid: (summary: string, cents: number) => ({
    subject: 'Pedido confirmado',
    html: layout('Pedido confirmado', `Recebemos o seu pagamento de ${eur(cents)}.<br><br><strong>${escapeHtml(summary)}</strong><br><br>Vamos tratar do seu pedido e pode acompanhá-lo no painel.`),
  }),
  paymentFailed: () => ({
    subject: 'Não conseguimos cobrar o seu pagamento',
    html: layout('Pagamento falhado', 'A última cobrança da sua subscrição não foi concluída. Atualize o método de pagamento no painel, em «Faturas e método de pagamento», para manter o seu website ativo.', { label: 'Atualizar pagamento', path: '/painel' }),
  }),
  canceled: () => ({
    subject: 'Subscrição cancelada',
    html: layout('Subscrição cancelada', 'A sua subscrição foi cancelada. O website mantém-se ativo até ao fim do período já pago. Se foi engano, pode subscrever de novo quando quiser.', { label: 'Ir para o painel', path: '/painel' }),
  }),
  refund: (cents: number) => ({
    subject: 'Reembolso confirmado',
    html: layout('Reembolso confirmado', `Reembolsámos ${eur(cents)}. O valor costuma aparecer na sua conta em 5 a 10 dias úteis, conforme o seu banco.`, null),
  }),
  // Internal: sent to the admin only.
  adminEvent: (title: string, lines: string) => ({
    subject: title,
    html: layout(escapeHtml(title), lines, { label: 'Abrir o painel admin', path: '/admin' }),
  }),
}

export async function sendEmail(to: string, t: { subject: string; html: string }) {
  try {
    const brevoKey = Deno.env.get('BREVO_API_KEY')
    if (brevoKey) {
      // Brevo: free tier, only needs a verified sender address (EMAIL_FROM), no domain.
      const sender = Deno.env.get('EMAIL_FROM')
      if (!sender) { console.error('Brevo: EMAIL_FROM is not set'); return }
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { name: FROM_NAME, email: sender }, to: [{ email: to }], subject: t.subject, htmlContent: t.html }),
      })
      if (!res.ok) console.error('Brevo error', res.status, await res.text())
      return
    }
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      const from = Deno.env.get('RESEND_FROM') ?? `${FROM_NAME} <onboarding@resend.dev>`
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject: t.subject, html: t.html }),
      })
      if (!res.ok) console.error('Resend error', res.status, await res.text())
      return
    }
    const user = Deno.env.get('GMAIL_USER')
    const pass = Deno.env.get('GMAIL_APP_PASSWORD')
    if (!user || !pass) return // email not configured: in-app updates only
    // Gmail SMTP over port 465 (Supabase blocks 25/587).
    const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } })
    await transporter.sendMail({ from: `${FROM_NAME} <${user}>`, to, subject: t.subject, html: t.html })
  } catch (e) {
    console.error('Email error', e) // never break payments or stage updates because of email
  }
}

// Tells the admin something happened (new order, failed payment...). Uses ADMIN_EMAIL.
export async function notifyAdmin(title: string, lines: string) {
  const to = Deno.env.get('ADMIN_EMAIL')
  if (to) await sendEmail(to, templates.adminEvent(title, lines))
}
