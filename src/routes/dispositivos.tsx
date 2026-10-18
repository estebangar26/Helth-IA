/** FRONTEND · Acceso al monitor local del usuario, sin transmisión a Cloud. */
import { createFileRoute } from "@tanstack/react-router";
import { Activity, ExternalLink, HeartPulse, Thermometer, Wifi, Zap, ShieldAlert } from "lucide-react";
import { NavegacionPublica } from "@/components/copiloto/NavegacionPublica";
import { AvisoMedico } from "@/components/copiloto/AvisoMedico";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dispositivos")({
  head: () => ({
    meta: [
      { title: "Conecta tus dispositivos de IoTM · HelthIA" },
      { name: "description", content: "Accede al monitor de signos vitales ESP32-S3 de Esteban García Otálvaro a través de su red Wi-Fi local." },
      { property: "og:title", content: "Monitor ESP32-S3 · Dispositivos IoTM en HelthIA" },
      { property: "og:description", content: "Conexión local al prototipo de monitor de frecuencia cardíaca, saturación de oxígeno y temperatura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dispositivos,
});

function Dispositivos() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <NavegacionPublica />
      <main className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <p className="flex items-center gap-2 font-body text-sm font-semibold text-primary"><Wifi className="size-4" aria-hidden="true" /> Internet de las cosas médicas</p>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Conecta tus dispositivos de IoTM</h1>
          <p className="max-w-2xl font-body text-ink-dim">Monitor de signos vitales de bajo costo · Diseño de Esteban García Otálvaro.</p>
        </header>

        <section className="grid items-center gap-8 border-y border-clinical-border py-8 lg:grid-cols-2" aria-labelledby="monitor-titulo">
          <div className="space-y-5">
            <span className="font-body text-xs font-semibold uppercase text-brand-lime">Prototipo · Conexión local</span>
            <h2 id="monitor-titulo" className="font-display text-2xl font-bold">MonitorBio ESP32-S3</h2>
            <p className="font-body leading-relaxed text-ink-dim">MAX30100 para pulso y saturación de oxígeno, sensor NTC para temperatura y pantalla OLED de 128 × 32 píxeles.</p>
            <p className="flex gap-2 font-body text-sm text-ink-dim"><ShieldAlert className="size-5 shrink-0 text-warn" aria-hidden="true" /> Sin conexión verificada. HelthIA no está recibiendo mediciones de este dispositivo.</p>
          </div>
          {/* Esquema del hardware, no fotografía ni valores simulados. */}
          <figure className="text-primary">
            <svg viewBox="0 0 520 260" className="mx-auto w-full max-w-lg" role="img" aria-labelledby="esquema-titulo">
              <title id="esquema-titulo">Esquema del ESP32-S3 conectado a pantalla OLED, MAX30100 y sensor NTC</title>
              <g fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M165 95H80V60H50M355 95H440V60H470M260 175V225" />
                <rect x="165" y="45" width="190" height="130" rx="8" />
                <rect x="194" y="66" width="132" height="40" rx="4" />
                <path d="M207 88h18l8-11 10 20 10-16 8 7h50" />
                <rect x="10" y="20" width="120" height="40" rx="4" />
                <rect x="390" y="20" width="120" height="40" rx="4" />
                <circle cx="260" cy="230" r="10" />
                <path d="M180 120h12m-12 12h12m-12 12h12m136-24h12m-12 12h12m-12 12h12" />
              </g>
              <g fill="currentColor" className="font-body" fontSize="14" textAnchor="middle">
                <text x="70" y="46">MAX30100</text><text x="450" y="46">OLED</text>
                <text x="260" y="140">ESP32-S3</text><text x="325" y="235">NTC</text>
              </g>
            </svg>
            <figcaption className="text-center font-body text-xs text-ink-dim">Esquema de los sensores del prototipo</figcaption>
          </figure>
        </section>

        <section className="space-y-4" aria-labelledby="conexion-titulo">
          <h2 id="conexion-titulo" className="font-display text-xl font-bold">Accede a tu monitor</h2>
          <ol className="grid gap-6 font-body md:grid-cols-3">
            <li className="space-y-2"><p className="font-semibold text-primary">01 · Enciende el ESP32-S3</p><p className="text-sm leading-relaxed text-ink-dim">Espera a que la pantalla indique «Servidor listo» y muestre su dirección.</p></li>
            <li className="space-y-2"><p className="font-semibold text-primary">02 · Conéctate a su Wi-Fi</p><p className="text-sm leading-relaxed text-ink-dim">Desde tu celular o computador, selecciona la red <strong className="text-ink">MonitorBioESP32</strong> y usa la contraseña configurada en tu dispositivo. Esta red puede no tener internet.</p></li>
            <li className="space-y-2"><p className="font-semibold text-primary">03 · Abre el monitor local</p><p className="text-sm leading-relaxed text-ink-dim">La dirección predeterminada es <strong className="text-ink">http://192.168.4.1</strong>. Si la pantalla muestra otra, abre esa dirección en tu navegador.</p></li>
          </ol>
          <Button asChild className="mt-2"><a href="http://192.168.4.1" target="_blank" rel="noopener noreferrer">Abrir monitor local <ExternalLink aria-hidden="true" /></a></Button>
          <p className="max-w-3xl font-body text-sm leading-relaxed text-ink-dim">Tu código sirve las mediciones en la dirección local /datos una vez por segundo. No las guarda en HelthIA ni las comparte con tu médico. La conexión directa desde esta página segura al monitor HTTP tiene restricciones del navegador; por eso el monitor se abre por separado.</p>
        </section>

        <section className="space-y-4" aria-labelledby="variables-titulo">
          <h2 id="variables-titulo" className="font-display text-xl font-bold">Variables del monitor</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ nombre: "Frecuencia cardíaca", unidad: "bpm", Icono: HeartPulse }, { nombre: "Saturación de oxígeno", unidad: "% SpO₂", Icono: Activity }, { nombre: "Temperatura estimada", unidad: "°C · Requiere calibración", Icono: Thermometer }, { nombre: "Voltaje del sensor NTC", unidad: "V · Señal del sensor", Icono: Zap }].map(({ nombre, unidad, Icono }) => (
              <article key={nombre} className="space-y-3 rounded-lg border border-clinical-border bg-panel p-5">
                <Icono className="size-5 text-primary" aria-hidden="true" />
                <h3 className="font-body text-sm font-semibold">{nombre}</h3>
                <p className="font-body text-sm text-ink-dim">{unidad}</p>
              </article>
            ))}
          </div>
          <p className="font-body text-sm text-ink-dim">Prototipo no validado para diagnóstico ni decisiones clínicas. Las mediciones deben contrastarse con equipos validados; no se generan alertas médicas automáticas.</p>
        </section>
        <AvisoMedico />
      </main>
    </div>
  );
}