import { LegalPage } from '@/components/LegalPage'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site'

export default function Privacidade() {
  return (
    <LegalPage title="Política de Privacidade">
      <section>
        <h2>1. Responsável</h2>
        <p>
          O responsável pelo tratamento dos seus dados é {SITE_NAME}. Contacto:{' '}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
      <section>
        <h2>2. Dados que recolhemos</h2>
        <ul>
          <li>Email e palavra-passe da conta (a palavra-passe é guardada de forma cifrada).</li>
          <li>Plano subscrito, estado da subscrição e data da próxima cobrança.</li>
          <li>Fase do projeto, notas e atualizações que lhe enviamos.</li>
        </ul>
        <p>Os dados do seu cartão são tratados diretamente pela Stripe. Nós não os recebemos nem guardamos.</p>
      </section>
      <section>
        <h2>3. Para que usamos os dados</h2>
        <p>
          Para criar e gerir a sua conta, processar a subscrição, desenvolver o seu website e mostrar-lhe o progresso do
          projeto.
        </p>
      </section>
      <section>
        <h2>4. Com quem partilhamos</h2>
        <ul>
          <li><strong>Supabase:</strong> autenticação e base de dados, em servidores na União Europeia.</li>
          <li><strong>Stripe:</strong> pagamentos e faturação.</li>
          <li><strong>Vercel:</strong> alojamento deste website.</li>
        </ul>
      </section>
      <section>
        <h2>5. Cookies e armazenamento local</h2>
        <p>
          Usamos apenas armazenamento local essencial do navegador para manter a sua sessão iniciada. Não usamos cookies
          de publicidade nem de análise.
        </p>
      </section>
      <section>
        <h2>6. Conservação</h2>
        <p>
          Mantemos os dados enquanto a sua conta estiver ativa e durante o período exigido por lei, por exemplo para
          obrigações de faturação.
        </p>
      </section>
      <section>
        <h2>7. Os seus direitos</h2>
        <p>
          Tem direito a aceder, retificar e apagar os seus dados, a limitar ou opor-se ao tratamento e à portabilidade.
          Para exercer estes direitos, escreva para{' '}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Pode também apresentar queixa à
          autoridade de proteção de dados do seu país.
        </p>
      </section>
    </LegalPage>
  )
}
