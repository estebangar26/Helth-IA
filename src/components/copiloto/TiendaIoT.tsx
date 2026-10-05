/**
 * FRONTEND · Tienda de dispositivos médicos conectados (IoT).
 * Catálogo de muestra: productos y precios ilustrativos, sin pagos todavía.
 */
import { Activity, Droplet, HeartPulse, Thermometer, Watch, Wind } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Productos de ejemplo con la variable fisiológica que monitorizan. */
const productos = [
  { icono: Droplet, nombre: "Glucómetro continuo (CGM)", variable: "Glucosa intersticial cada 5 min", precio: "$ 890.000" },
  { icono: HeartPulse, nombre: "Tensiómetro Bluetooth", variable: "Presión arterial y pulso", precio: "$ 320.000" },
  { icono: Watch, nombre: "Reloj con ECG", variable: "Ritmo cardíaco y electrocardiograma", precio: "$ 1.150.000" },
  { icono: Wind, nombre: "Oxímetro inteligente", variable: "Saturación de oxígeno (SpO₂)", precio: "$ 180.000" },
  { icono: Thermometer, nombre: "Termómetro parche", variable: "Temperatura corporal continua", precio: "$ 140.000" },
  { icono: Activity, nombre: "Báscula de composición", variable: "Peso, grasa y masa muscular", precio: "$ 260.000" },
];

export function TiendaIoT() {
  return (
    <section id="tienda" className="bg-panel py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <p className="font-body text-xs font-bold uppercase text-primary">Tienda HelthIA</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Dispositivos conectados para monitorizar en tiempo real</h2>
        <p className="mt-3 max-w-2xl font-body text-ink-dim">Equipos de internet de las cosas médicas que miden variables fisiológicas de forma continua.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map(({ icono: Icono, nombre, variable, precio }) => (
            <article key={nombre} className="flex flex-col rounded-md border border-clinical-border bg-surface p-6 shadow-sm">
              <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary"><Icono aria-hidden="true" /></span>
              <h3 className="mt-5 font-display text-lg font-bold text-ink">{nombre}</h3>
              <p className="mt-2 flex-1 font-body text-sm text-ink-dim">{variable}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-body font-bold text-ink">{precio}</span>
                <Button size="sm" disabled>Próximamente</Button>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-6 font-body text-xs text-ink-dim">Productos y precios de muestra. Consulte con su profesional de salud antes de usar un dispositivo.</p>
      </div>
    </section>
  );
}
