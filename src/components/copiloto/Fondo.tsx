/**
 * FRONTEND · Fondo de la aplicación.
 * Degradado clínico oscuro con dos franjas de luz inclinadas; puramente visual.
 */
export function Fondo() {
  return (
    <div className="fixed inset-0 -z-10 bg-surface">
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-mid to-surface-light" />
      <div className="absolute top-0 left-1/4 h-full w-[600px] -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      <div className="absolute top-0 right-1/4 h-full w-[400px] -skew-x-[12deg] bg-gradient-to-r from-transparent via-accent-teal/[0.04] to-transparent" />
    </div>
  );
}
