export const STAGES = [
  { key: 'pagamento', label: 'Pagamento' },
  { key: 'briefing', label: 'Briefing' },
  { key: 'design', label: 'Design' },
  { key: 'desenvolvimento', label: 'Desenvolvimento' },
  { key: 'revisao', label: 'Revisão' },
  { key: 'online', label: 'Online' },
] as const

export type Stage = (typeof STAGES)[number]['key']
export type PlanKey = 'estatico' | 'ecommerce'

export const stageLabel = (k: Stage) => STAGES.find((s) => s.key === k)!.label
export const stageIndex = (k: Stage) => STAGES.findIndex((s) => s.key === k)
export const PLAN_LABEL: Record<PlanKey, string> = {
  estatico: 'Website Estático',
  ecommerce: 'Website e-Commerce',
}

export type Profile = {
  id: string
  email: string
  stripe_customer_id: string | null
  subscription_status: string | null
  current_period_end: string | null
}
export type Project = {
  id: string
  client_id: string
  plan: PlanKey
  stage: Stage
  preview_url: string | null
  created_at: string
}
export type ProjectUpdate = {
  id: string
  project_id: string
  stage: Stage
  note: string | null
  created_at: string
}
