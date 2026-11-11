import { LegalPage } from '@/components/LegalPage'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site'

export default function Termos() {
  return (
    <LegalPage title="Termos de Serviço">
      <section>
        <h2>1. Quem somos</h2>
        <p>
          Este website é operado por {SITE_NAME}, que cria e mantém websites para clientes mediante subscrição.
          Pode contactar-nos através de <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
      <section>
        <h2>2. O serviço</h2>
        <p>Oferecemos dois planos de subscrição, mensal ou anual:</p>
        <ul>
          <li><strong>Website Estático:</strong> até 5 páginas, design responsivo, formulário de contacto, alojamento e manutenção.</li>
          <li><strong>Website e-Commerce:</strong> loja online, catálogo de produtos, carrinho de compras, pagamentos, gestão de encomendas, alojamento e manutenção.</li>
        </ul>
        <p>
          Depois de subscrever, pode acompanhar as fases do seu projeto (Pagamento, Briefing, Design, Desenvolvimento,
          Revisão e Online) no seu painel de cliente.
        </p>
      </section>
      <section>
        <h2>3. Conta de cliente</h2>
        <p>
          Para subscrever é necessário criar uma conta com email e palavra-passe e confirmar o email. É responsável por
          manter as suas credenciais em segurança e por indicar um email que consiga consultar.
        </p>
      </section>
      <section>
        <h2>4. Preços e pagamento</h2>
        <p>
          Os preços são indicados em euros e correspondem aos apresentados no momento da subscrição. O pagamento é
          processado pela Stripe, numa página segura, no início de cada período (mensal ou anual). Pode introduzir um
          código promocional na página de pagamento, quando existir.
        </p>
      </section>
      <section>
        <h2>5. Cancelamento</h2>
        <p>
          Pode cancelar a subscrição a qualquer momento no seu painel, em «Gerir pagamento». O cancelamento produz efeitos
          no fim do período já pago. Para pedidos de reembolso ou dúvidas sobre cobranças, contacte-nos pelo email indicado.
        </p>
      </section>
      <section>
        <h2>6. Utilização</h2>
        <p>
          O serviço não pode ser usado para fins ilegais nem para conteúdos que violem direitos de terceiros. Podemos
          suspender um projeto em caso de utilização indevida.
        </p>
      </section>
      <section>
        <h2>7. Alterações</h2>
        <p>
          Podemos atualizar estes termos. A data da última atualização está no topo desta página. A utilização do serviço
          depois de uma atualização implica a aceitação dos termos em vigor.
        </p>
      </section>
    </LegalPage>
  )
}
