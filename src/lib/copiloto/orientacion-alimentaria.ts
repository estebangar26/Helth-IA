/** Orientación conservadora, sin llamadas de IA ni rangos clínicos inventados. */
import type { ResultadoCatalogo } from './tipos';

export type EstadoAnalitico = 'dentro' | 'debajo' | 'encima' | 'sin_rango';
export function estadoAnalitico(valor: number, referencia: string | null): EstadoAnalitico {
  if (!referencia || !Number.isFinite(valor)) return 'sin_rango';
  // Solo intervalos explícitos o desigualdades: no interpretar rangos por sexo/edad múltiples.
  const texto = referencia.trim().replace(/,/g, '.');
  const intervalo = texto.match(/^(\d+(?:\.\d+)?)\s*(?:-|–|—|a)\s*(\d+(?:\.\d+)?)(?:\s*[a-zA-Zµμ%/² .]+)?$/);
  if (intervalo) {
    const min = Number(intervalo[1]); const max = Number(intervalo[2]);
    if (min > max) return 'sin_rango';
    return valor < min ? 'debajo' : valor > max ? 'encima' : 'dentro';
  }
  const limite = texto.match(/^([<>]=?|[≤≥])\s*(\d+(?:\.\d+)?)(?:\s*[a-zA-Zµμ%/² .]+)?$/);
  if (!limite) return 'sin_rango';
  const n = Number(limite[2]);
  if (limite[1] === '<') return valor >= n ? 'encima' : 'dentro';
  if (limite[1] === '>') return valor <= n ? 'debajo' : 'dentro';
  return limite[1]?.startsWith('<') || limite[1] === '≤' ? (valor > n ? 'encima' : 'dentro') : (valor < n ? 'debajo' : 'dentro');
}

export function orientarResultado(r: ResultadoCatalogo): { estado: EstadoAnalitico; texto: string } {
  const estado = estadoAnalitico(r.valor, r.referencia);
  if (r.codigo === 'creatinina' && estado === 'debajo') return { estado, texto: 'Una creatinina baja no confirma falta de proteína. Puede relacionarse con masa muscular u otras causas. Consulte antes de aumentar carne, proteína o creatina; ningún alimento la corrige por sí solo.' };
  if (r.categoria === 'renal' || r.categoria === 'electrolitos') return { estado, texto: 'La alimentación y los líquidos dependen de la función renal, tratamientos y otros resultados. No aumente proteína, sal, potasio ni agua para corregir este valor sin evaluación médica.' };
  if (estado === 'sin_rango') return { estado, texto: 'No es posible afirmar si este resultado está bajo o alto sin un rango del laboratorio interpretable. No cambie su dieta para corregirlo; solicite interpretación profesional.' };
  if (r.categoria === 'tumoral' || r.categoria === 'hormonal' || r.categoria === 'tiroides') return { estado, texto: 'Este marcador no determina por sí solo una enfermedad ni una dieta. Ningún alimento, bebida o suplemento garantiza normalizarlo. Mantenga comidas variadas y revise el resultado con su médico.' };
  if (r.categoria === 'glucosa' && estado === 'encima' && ['glucemia_ayunas','glucemia_posprandial','glucosa_aleatoria','glucosa_sobrecarga_2h','hba1c','fructosamina'].includes(r.codigo)) return { estado, texto: 'Como apoyo general, prefiera fruta entera en lugar de jugos y gaseosas, verduras y porciones acordadas de fríjoles, lentejas, arroz o arepa. No elimine comidas ni cambie medicamentos; acuerde cantidades con nutrición.' };
  if (r.categoria === 'glucosa' && estado === 'debajo') return { estado, texto: 'Un resultado bajo necesita interpretación; una dieta general no reemplaza el manejo de una hipoglucemia. Si tiene sudor, temblor, confusión o desmayo, siga su plan médico y busque atención urgente.' };
  if (r.categoria === 'lipidos' && ['ldl','colesterol_total','colesterol_no_hdl','trigliceridos'].includes(r.codigo) && estado === 'encima') return { estado, texto: 'Considere avena, fríjoles y lentejas, verduras y pescado; sustituya fritos y embutidos frecuentes por preparaciones al horno o a la plancha. Modere bebidas azucaradas y alcohol, especialmente con triglicéridos elevados.' };
  if (r.codigo === 'hemoglobina' && estado === 'debajo') return { estado, texto: 'La hemoglobina baja tiene distintas causas y no demuestra falta de hierro. Lentejas, fríjoles, huevo y carnes pueden formar parte de una dieta variada, con guayaba o cítricos. No tome hierro sin evaluación.' };
  if (r.categoria === 'hepatica' && estado !== 'dentro') return { estado, texto: 'Revise este hallazgo con su médico. Evite alcohol y productos “detox” o suplementos sin indicación; prefiera comidas variadas con verduras y preparaciones caseras, sin prometer corregir el resultado.' };
  return { estado, texto: 'Prefiera una alimentación variada con verduras, fruta entera, legumbres y preparaciones caseras colombianas. Estar en rango no prueba que una enfermedad esté controlada; las porciones dependen de su evaluación clínica.' };
}