import type { PlanKey } from './stages'

export type Field = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'multi' | 'single'
  options?: string[]
  placeholder?: string
  required?: boolean
}
export type Step = { title: string; description: string; plan?: PlanKey; fields: Field[] }
export type Answers = Record<string, string | string[]>

// The questionnaire. Edit questions here; the form and the admin view both read this list.
export const STEPS: Step[] = [
  {
    title: 'Sobre o negócio',
    description: 'Conte-nos quem é e o que faz.',
    fields: [
      { key: 'nome', label: 'Nome do negócio', type: 'text', required: true },
      { key: 'atividade', label: 'O que faz o seu negócio?', type: 'textarea', required: true, placeholder: 'Descreva em poucas frases.' },
      { key: 'publico', label: 'Quem são os seus clientes?', type: 'textarea' },
    ],
  },
  {
    title: 'Objetivos',
    description: 'O que quer que o website faça por si?',
    fields: [
      {
        key: 'objetivos',
        label: 'Escolha o que se aplica',
        type: 'multi',
        required: true,
        options: ['Apresentar o negócio', 'Receber contactos', 'Mostrar trabalhos ou portefólio', 'Mostrar serviços ou ementa', 'Vender produtos online'],
      },
      { key: 'objetivo_principal', label: 'Qual é o objetivo mais importante?', type: 'textarea' },
    ],
  },
  {
    title: 'Estilo',
    description: 'Ajude-nos a perceber o visual que procura.',
    fields: [
      { key: 'estilo', label: 'Estilo preferido', type: 'multi', options: ['Minimalista', 'Moderno', 'Clássico', 'Elegante', 'Colorido'] },
      { key: 'cores', label: 'Cores preferidas', type: 'text', placeholder: 'Ex.: preto e dourado' },
      { key: 'referencias', label: 'Websites de que gosta', type: 'textarea', placeholder: 'Cole aqui os endereços (links).' },
      { key: 'logotipo', label: 'Já tem logótipo?', type: 'single', options: ['Sim', 'Não', 'Preciso de ajuda'] },
    ],
  },
  {
    title: 'Conteúdo',
    description: 'Páginas, textos e imagens.',
    fields: [
      { key: 'paginas', label: 'Que páginas quer?', type: 'multi', options: ['Início', 'Sobre', 'Serviços', 'Portefólio', 'Contactos', 'Outra'] },
      { key: 'conteudo', label: 'Já tem textos e imagens?', type: 'single', options: ['Sim, tenho tudo', 'Tenho uma parte', 'Ainda não'] },
      { key: 'conteudo_notas', label: 'Algo a acrescentar sobre o conteúdo?', type: 'textarea' },
    ],
  },
  {
    title: 'A sua loja',
    description: 'Algumas perguntas sobre os produtos.',
    plan: 'ecommerce',
    fields: [
      { key: 'produtos', label: 'Quantos produtos pensa vender?', type: 'text', placeholder: 'Ex.: cerca de 50' },
      { key: 'categorias', label: 'Principais categorias de produtos', type: 'textarea' },
      { key: 'envios', label: 'Para onde pretende enviar?', type: 'text', placeholder: 'Ex.: Portugal continental' },
      { key: 'pagamentos', label: 'Como quer receber os pagamentos dos seus clientes?', type: 'textarea' },
    ],
  },
  {
    title: 'Contacto e prazo',
    description: 'Para terminarmos.',
    fields: [
      { key: 'contacto', label: 'Email ou telefone para falarmos consigo', type: 'text', required: true },
      { key: 'prazo', label: 'Prazo desejado', type: 'text', placeholder: 'Ex.: dentro de 1 mês' },
      { key: 'extra', label: 'Mais alguma coisa que devamos saber?', type: 'textarea' },
    ],
  },
]

export const stepsFor = (plan: PlanKey) => STEPS.filter((s) => !s.plan || s.plan === plan)

export const isFilled = (v: string | string[] | undefined) => (Array.isArray(v) ? v.length > 0 : !!v?.trim())

// Flat lookup used by the admin view.
export const FIELDS: Field[] = STEPS.flatMap((s) => s.fields)
