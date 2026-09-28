import { Activity, Dna, HeartPulse } from "lucide-react";

const enfermedades = [
  {
    titulo: "Diabetes",
    icono: Activity,
    queEs: "Alteración del control de la glucosa que incluye diabetes tipo 1, tipo 2 e insípida.",
    alertas: "Sed intensa, cambios marcados de glucemia, cansancio o pérdida de peso sin explicación.",
    consejos: ["Cumpla sus controles", "Registre sus resultados", "Siga el tratamiento indicado"],
  },
  {
    titulo: "Cáncer",
    icono: Dna,
    queEs: "Grupo de enfermedades con crecimiento anormal de células; algunos exámenes incluyen biomarcadores de apoyo.",
    alertas: "Cambios persistentes, masas, sangrado inusual o pérdida de peso requieren valoración profesional.",
    consejos: ["Asista a tamizajes", "No interprete un marcador aislado", "Consulte cambios persistentes"],
  },
  {
    titulo: "Salud sexual, testosterona y libido",
    icono: HeartPulse,
    queEs: "Área que relaciona hormonas, bienestar sexual, energía y otros factores de salud integral.",
    alertas: "Cambios persistentes de libido, fatiga, alteraciones sexuales o variaciones hormonales.",
    consejos: ["Evite automedicarse", "Revise resultados con un especialista", "Cuide sueño y actividad física"],
  },
];

export function EnfermedadesCubiertas() {
  return (
    <section className="mt-6">
      <p className="font-body text-xs font-semibold uppercase text-brand-blue">Cobertura informativa</p>
      <h2 className="mt-1 font-display text-xl font-bold text-ink">Enfermedades que cubre la plataforma</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {enfermedades.map(({ titulo, icono: Icono, queEs, alertas, consejos }) => (
          <article key={titulo} className="rounded-lg border border-clinical-border bg-panel p-5 shadow-sm">
            <Icono className="size-6 text-brand-blue" aria-hidden="true" />
            <h3 className="mt-3 font-display text-lg font-bold text-ink">{titulo}</h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink-dim"><strong className="text-ink">Qué es:</strong> {queEs}</p>
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-dim"><strong className="text-ink">Señales de alerta:</strong> {alertas}</p>
            <ul className="mt-3 space-y-1 font-body text-xs text-ink-dim">{consejos.map((consejo) => <li key={consejo}>• {consejo}</li>)}</ul>
          </article>
        ))}
      </div>
    </section>
  );
}
