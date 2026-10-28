/** Lee números del laboratorio; los conteos distinguen miles de decimales. */
export function numerosRangoImpreso(referencia: string, analito: string): number[] {
  const esConteo = /leucocit|plaquet|eritrocit|hemat[ií]es|neutr[oó]fil|linfocit|monocit|eosin[oó]fil|bas[oó]fil/i.test(analito);
  return (referencia.match(/\d+(?:[.,]\d+)*/g) ?? []).map((numero) => {
    if (esConteo && /^\d{1,3}(?:,\d{3})+$|^\d{1,3}(?:\.\d{3})+$/.test(numero)) {
      return Number(numero.replace(/[.,]/g, ""));
    }
    return Number(numero.replace(",", "."));
  });
}