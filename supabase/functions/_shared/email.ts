// Resend emails, one simple black-and-white template.
const SITE_URL = Deno.env.get('SITE_URL')!

function layout(title: string, body: string) {
  return `<div style="font-family:Inter,Arial,sans-serif;background:#fff;color:#000;padding:32px;max-width:480px;margin:auto">
  <h1 style="font-size:20px;margin:0 0 16px">${title}</h1>
  <p style="font-size:15px;line-height:1.5;margin:0 0 24px">${body}</p>
  <a href="${SITE_URL}/painel" style="display:inline-block;background:#000;color:#fff;padding:10px 18px;text-decoration:none;font-size:14px">Ver o meu projeto</a>
</div>`
}

export const templates = {
  welcome: () => ({
    subject: 'Pagamento confirmado',
    html: layout('Pagamento confirmado', 'Obrigado! Recebemos o seu pagamento e o seu projeto já foi criado. Aceda ao painel com o seu email para acompanhar o progresso. Será enviado um link de acesso, sem palavra-passe.'),
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
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export async function sendEmail(to: string, t: { subject: string; html: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('EMAIL_FROM'), to, ...t }),
  })
  if (!res.ok) console.error('Resend error', res.status, await res.text())
}
