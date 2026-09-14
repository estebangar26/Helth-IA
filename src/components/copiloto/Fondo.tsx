/**
 * FRONTEND · Fondo de la aplicación.
 * Escena médica futurista con una capa clara para conservar la lectura.
 */
import fondoSaludFuturista from "@/assets/fondo-salud-futurista.jpg";

export function Fondo() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-surface" aria-hidden="true">
      <img
        src={fondoSaludFuturista}
        alt=""
        width={1920}
        height={1080}
        className="h-full w-full object-cover object-center opacity-55"
      />
      <div className="absolute inset-0 bg-surface/72" />
    </div>
  );
}
