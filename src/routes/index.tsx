import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copiloto de Salud · Seguimiento de diabetes tipo 2" },
      {
        name: "description",
        content:
          "Plataforma que reúne tus exámenes médicos en una sola línea de tiempo, clasifica tu riesgo con reglas clínicas explicables y sugiere alimentación adaptada.",
      },
      { property: "og:title", content: "Copiloto de Salud" },
      {
        property: "og:description",
        content:
          "Monitoreo longitudinal de exámenes médicos y apoyo en la toma de decisiones para enfermedades crónicas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Estado = "ok" | "warn" | "alert";

const estadoTexto: Record<Estado, string> = {
  ok: "Controlado",
  warn: "En observación",
  alert: "Requiere acción",
};

const estadoPunto: Record<Estado, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  alert: "bg-alert",
};

const estadoChip: Record<Estado, string> = {
  ok: "text-ok bg-ok/10 ring-ok/20",
  warn: "text-warn bg-warn/10 ring-warn/20",
  alert: "text-alert bg-alert/10 ring-alert/20",
};

const biomarcadores: {
  nombre: string;
  valor: string;
  unidad?: string;
  nota: string;
  estado: Estado;
}[] = [
  {
    nombre: "Glucemia ayunas",
    valor: "108",
    unidad: "mg/dL",
    nota: "Estable · objetivo < 110",
    estado: "ok",
  },
  {
    nombre: "HbA1c",
    valor: "7.8",
    unidad: "%",
    nota: "Sube 0.4% · meta < 7.0%",
    estado: "warn",
  },
  {
    nombre: "Presión arterial",
    valor: "142/88",
    nota: "Sube · meta < 130/80",
    estado: "warn",
  },
];

const examenes: {
  titulo: string;
  fecha: string;
  estado: Estado;
  valores: { etiqueta: string; valor: string; resaltado?: Estado }[];
  intensidad: "alta" | "media" | "baja";
}[] = [
  {
    titulo: "Panel de control · Laboratorio San Rafael",
    fecha: "12 de marzo de 2025",
    estado: "warn",
    intensidad: "alta",
    valores: [
      { etiqueta: "Glucemia", valor: "108 mg/dL" },
      { etiqueta: "HbA1c", valor: "7.8 %", resaltado: "warn" },
      { etiqueta: "Creatinina", valor: "0.9 mg/dL" },
    ],
  },
  {
    titulo: "Controles intermedios · Clínica Metabólica",
    fecha: "10 de diciembre de 2024",
    estado: "ok",
    intensidad: "media",
    valores: [
      { etiqueta: "Glucemia", valor: "101 mg/dL" },
      { etiqueta: "HbA1c", valor: "7.4 %", resaltado: "ok" },
      { etiqueta: "Presión", valor: "138/84" },
    ],
  },
  {
    titulo: "Ingreso al programa · Hospital Pablo Tobón",
    fecha: "8 de septiembre de 2024",
    estado: "alert",
    intensidad: "baja",
    valores: [
      { etiqueta: "Glucemia", valor: "134 mg/dL" },
      { etiqueta: "HbA1c", valor: "8.6 %", resaltado: "alert" },
      { etiqueta: "Presión", valor: "148/92" },
    ],
  },
];

const recomendaciones = [
  "Preferir arepa de maíz con plátano maduro en el desayuno; reduce el índice glucémico frente a pan blanco.",
  "En la cena, sustituir arroz por quinoa con el aguacate en la ensalada; ayuda a estabilizar la glucosa nocturna.",
  "Como merienda, cambie el dulce por un puñado de guayaba con chía; acompaña con agua de coco sin azúcar.",
];

const tarjetaPorIntensidad = {
  alta: "bg-white/[0.05] ring-white/10",
  media: "bg-white/[0.04] ring-white/[0.08]",
  baja: "bg-white/[0.03] ring-white/[0.06]",
} as const;

const textoPorIntensidad = {
  alta: "text-ink",
  media: "text-ink/80",
  baja: "text-ink/70",
} as const;

const puntoPorIntensidad = {
  alta: "bg-accent-teal",
  media: "bg-white/40",
  baja: "bg-white/30",
} as const;

function Index() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-surface">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-mid to-surface-light" />
        <div className="absolute top-0 left-1/4 h-full w-[600px] -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
        <div className="absolute top-0 right-1/4 h-full w-[400px] -skew-x-[12deg] bg-gradient-to-r from-transparent via-accent-teal/[0.04] to-transparent" />
      </div>

      <div className="mx-auto min-h-screen max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-[min(1vw,10px)] bg-accent-teal/15 ring-1 ring-accent-teal/20">
              <span className="font-display font-bold text-accent-teal">CS</span>
            </div>
            <div>
              <h1 className="font-display text-xl leading-tight font-semibold text-balance text-ink">
                Copiloto de Salud
              </h1>
              <p className="mt-0.5 font-body text-sm text-ink-dim">
                María Fernanda Restrepo · 64 años · CO-2024-0847
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-display text-sm text-ink-dim sm:inline">
              Actualizado 12 mar 2025
            </span>
            <button className="rounded-[min(1vw,8px)] bg-accent-teal/15 px-4 py-2 font-display text-sm font-medium text-accent-teal ring-1 ring-accent-teal/20 transition-colors hover:bg-accent-teal/25">
              Subir examen
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="self-start lg:sticky lg:top-6">
            <div className="-skew-y-[0.5deg] rounded-[min(1.5vw,16px)] bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur-2xl">
              <p className="mb-4 font-display text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-dim">
                Estado de riesgo
              </p>
              <div className="mb-4 flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-warn/20 ring-2 ring-warn/40">
                  <span className="size-4 rounded-full bg-warn" />
                </div>
                <div>
                  <p className="font-display text-xl leading-none font-bold text-warn">
                    En observación
                  </p>
                  <p className="mt-1 font-body text-sm text-ink-dim">HbA1c sobre la meta</p>
                </div>
              </div>
              <p className="mb-5 font-body text-sm leading-relaxed text-pretty text-ink/80">
                Su HbA1c de 7.8% supera el objetivo de 7.0%. La glucemia en ayunas se mantiene
                estable, pero la presión arterial requiere revisión en la próxima consulta.
              </p>
              <div className="space-y-2">
                {(["ok", "warn", "alert"] as Estado[]).map((e) => (
                  <div key={e} className="flex items-center gap-2 text-sm">
                    <span className={`size-2.5 shrink-0 rounded-full ${estadoPunto[e]}`} />
                    <span className="font-display text-ink/70">{estadoTexto[e]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <button className="w-full rounded-[min(1vw,8px)] bg-white/[0.04] px-3 py-2 text-left font-display text-sm font-medium text-ink ring-1 ring-white/10 transition-colors hover:bg-white/[0.08]">
                  Ver resumen para cita
                </button>
              </div>
            </div>
          </aside>

          <main>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {biomarcadores.map((b) => (
                <div
                  key={b.nombre}
                  className="rounded-[min(1.5vw,14px)] bg-white/[0.05] p-4 ring-1 ring-white/10 backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-display text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
                      {b.nombre}
                    </span>
                    <span className={`size-2 shrink-0 rounded-full ${estadoPunto[b.estado]}`} />
                  </div>
                  <p className="font-display text-3xl leading-none font-bold text-ink">
                    {b.valor}
                    {b.unidad ? (
                      <span className="text-base font-medium text-ink-dim"> {b.unidad}</span>
                    ) : null}
                  </p>
                  <p
                    className={`mt-2 font-body text-sm ${b.estado === "warn" ? "text-warn/90" : "text-ink-dim"}`}
                  >
                    {b.nota}
                  </p>
                </div>
              ))}
            </div>

            <p className="mb-4 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-dim">
              Línea de exámenes
            </p>

            <div className="relative pl-6">
              <div className="absolute top-1 bottom-1 left-[7px] w-px bg-gradient-to-b from-accent-teal/40 via-white/15 to-accent-teal/10" />

              {examenes.map((ex, i) => (
                <div
                  key={ex.titulo}
                  className={`relative rounded-[min(1.5vw,14px)] p-4 ring-1 backdrop-blur-xl ${tarjetaPorIntensidad[ex.intensidad]} ${i < examenes.length - 1 ? "mb-5" : ""}`}
                >
                  <span
                    className={`absolute top-5 -left-6 size-3 rounded-full ring-4 ring-surface ${puntoPorIntensidad[ex.intensidad]}`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={`font-display font-semibold ${textoPorIntensidad[ex.intensidad]}`}
                      >
                        {ex.titulo}
                      </p>
                      <p className="mt-0.5 font-body text-sm text-ink-dim">{ex.fecha}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-[min(1vw,6px)] px-2 py-1 font-display text-[11px] font-semibold tracking-[0.08em] uppercase ring-1 ${estadoChip[ex.estado]}`}
                    >
                      {estadoTexto[ex.estado]}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {ex.valores.map((v) => (
                      <div key={v.etiqueta}>
                        <p className="font-display text-[10px] tracking-[0.08em] uppercase text-ink-dim">
                          {v.etiqueta}
                        </p>
                        <p
                          className={`font-display font-semibold ${
                            v.resaltado === "warn"
                              ? "text-warn"
                              : v.resaltado === "ok"
                                ? "text-ok"
                                : v.resaltado === "alert"
                                  ? "text-alert"
                                  : textoPorIntensidad[ex.intensidad]
                          }`}
                        >
                          {v.valor}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[min(1.5vw,16px)] bg-white/[0.04] p-5 ring-1 ring-white/10 backdrop-blur-xl">
              <p className="mb-3 font-display text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-dim">
                Recomendaciones nutricionales
              </p>
              <ul className="space-y-2.5 font-body">
                {recomendaciones.map((r) => (
                  <li key={r} className="flex gap-3 text-sm leading-relaxed text-ink/85">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-teal" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
