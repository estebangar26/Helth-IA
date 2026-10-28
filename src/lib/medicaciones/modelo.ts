import { z } from 'zod';
import type { Json } from '@/integrations/supabase/types';
export const UNIDADES = ['mcg','mg','g','mL','UI','gotas','tabletas','puffs'] as const;
const texto = (max=500) => z.string().trim().max(max);
const fechaValida=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(`${s}T00:00:00Z`))&&new Date(`${s}T00:00:00Z`).toISOString().slice(0,10)===s;
export const configuracion = z.object({
 generico:texto(120).default(''),forma:texto(40).default('tableta'),via:texto(80).default(''),motivo:texto().default(''),prescrito:texto(120).default(''),tipo:z.enum(['formulado','venta libre','suplemento']).default('formulado'),vital:z.boolean().default(false),
 cantidad:z.number().positive().max(100000),unidad:z.enum(UNIDADES),porToma:z.number().positive().max(10000).default(1),maxima:texto(80).default(''),
 inicio:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),primera:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),fin:z.string().regex(/^(|\d{4}-\d{2}-\d{2})$/).default(''),continuo:z.boolean().default(true),estado:z.enum(['activo','pausado','finalizado']).default('activo'),
 frecuencia:z.enum(['intervalo','fijos','necesidad']).default('intervalo'),horas:z.number().min(1).max(720).default(8),horarios:z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).max(24).default([]),recordatorioHoras:z.number().min(1).max(720).default(8),anticipacion:z.number().int().min(0).max(120).default(0),
 canal:z.enum(['ninguno','email','whatsapp','ambos']).default('ninguno'),zona:z.literal('America/Bogota').default('America/Bogota'),silencioInicio:texto(5).default(''),silencioFin:texto(5).default(''),email:texto(254).default(''),telefono:texto(20).default(''),incluirDosis:z.boolean().default(false),apoyoNombre:texto(120).default(''),apoyoContacto:texto(254).default(''),
 comidas:z.enum(['en ayunas','con alimentos','después de comer','indiferente']).default('indiferente'),instrucciones:texto(1000).default(''),almacenamiento:texto().default(''),contraindicaciones:texto(1000).default(''),etiquetas:z.array(z.enum(['embarazo','enfermedad renal','enfermedad hepática','alcohol','conducción'])).default([]),interacciones:texto(1000).default(''),efectos:texto(1000).default(''),stock:z.number().nonnegative().max(100000).nullable().default(null),vencimiento:texto(10).default(''),foto:texto(300).default('')
}).superRefine((d,c)=>{
 if(!fechaValida(d.inicio)||(!d.continuo&&!fechaValida(d.fin))||(d.vencimiento&&!fechaValida(d.vencimiento)))c.addIssue({code:'custom',path:['inicio'],message:'Revise las fechas del tratamiento.'});
 if(d.email&&!z.string().email().safeParse(d.email).success)c.addIssue({code:'custom',path:['email'],message:'Correo no válido.'});
 if(d.telefono&&!/^\+[1-9]\d{7,14}$/.test(d.telefono))c.addIssue({code:'custom',path:['telefono'],message:'Use el formato internacional, por ejemplo +57 y el número.'});
 if([d.silencioInicio,d.silencioFin].some(t=>t&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(t))||Boolean(d.silencioInicio)!==Boolean(d.silencioFin))c.addIssue({code:'custom',path:['silencioInicio'],message:'Indique ambas horas de silencio válidas.'});
 if (!d.continuo && (!d.fin || d.fin<d.inicio)) c.addIssue({code:'custom',path:['fin'],message:'La fecha de fin debe ser igual o posterior al inicio.'});
 if(d.frecuencia==='fijos' && !d.horarios.length)c.addIssue({code:'custom',path:['horarios'],message:'Seleccione al menos un horario.'});
 if(d.canal!=='ninguno')c.addIssue({code:'custom',path:['canal'],message:'Los envíos están desactivados hasta conectar y verificar el servicio.'});
});
export type Config = z.infer<typeof configuracion>;
export const guardarSchema=z.object({id:z.string().uuid().optional(),nombre:texto(120).min(2),notas:texto(1000),detalle:configuracion,confirmarDuplicado:z.boolean().default(false)});
export type Med = {id:string;nombre:string;dosis:string|null;frecuencia:string|null;notas:string|null;creado_en:string;detalle:Json};
export type Dosis = {id:string;medication_id:string;scheduled_at:string;status:string;recorded_at:string;postponed_until:string|null};
export type Sintoma = {id:string;medication_id:string;occurred_at:string;symptom:string;severity:string;recent_dose:boolean;notes:string|null};
export const fechaBogota=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const horaLocal=(iso:string)=>new Intl.DateTimeFormat('es-CO',{timeZone:'America/Bogota',dateStyle:'short',timeStyle:'short'}).format(new Date(iso));
export function leerConfig(m:Med):Config|null {const x=configuracion.safeParse(m.detalle);return x.success?x.data:null;}
export function legado(m:Med):Partial<Config>{
 const dosis=m.dosis?.match(/^\s*(\d+(?:[.,]\d+)?)\s*(mcg|µg|mg|g|mL|UI|gotas|tabletas|puffs)\s*$/i);
 const horas=m.frecuencia?.match(/^(?:cada\s+)?(\d+)\s*horas?$/i);
 const unidad=UNIDADES.find(u=>u.toLowerCase()===(dosis?.[2]==='µg'?'mcg':dosis?.[2]?.toLowerCase()));
 return {...(dosis&&unidad?{cantidad:Number(dosis[1]?.replace(',','.')),unidad}:{}),...(horas?{horas:Number(horas[1]),recordatorioHoras:Number(horas[1])}:{})};
}
export function estadoTratamiento(c:Config,now=new Date()){return !c.continuo&&c.fin<fechaBogota(now)?'finalizado':c.estado;}
export function horariosEntre(c:Config,desde:Date,hasta:Date):string[]{
 if(c.frecuencia==='necesidad'||c.estado!=='activo')return [];
 const inicio=new Date(`${c.inicio}T${c.primera}:00-05:00`).getTime();
 const fin=c.continuo?Infinity:new Date(`${c.fin}T23:59:59-05:00`).getTime();
 const lower=Math.max(inicio,desde.getTime()),upper=Math.min(fin,hasta.getTime());if(lower>upper)return [];
 const out:number[]=[];
 if(c.frecuencia==='intervalo'){const paso=c.horas*3600000;for(let t=inicio+Math.max(0,Math.ceil((lower-inicio)/paso))*paso;t<=upper&&out.length<10000;t+=paso)out.push(t);}
 else{for(let day=new Date(`${fechaBogota(new Date(lower))}T00:00:00-05:00`).getTime();day<=upper&&out.length<10000;day+=86400000){for(const h of new Set(c.horarios)){const t=new Date(`${fechaBogota(new Date(day))}T${h}:00-05:00`).getTime();if(t>=lower&&t<=upper)out.push(t);}}}
 return out.sort((a,b)=>a-b).map(t=>new Date(t).toISOString());
}
export function proxima(c:Config,dosis:Dosis[],now=new Date()):string|null{
 if(estadoTratamiento(c,now)!=='activo')return null;
 const pospuestas=dosis.filter(d=>d.status==='pospuesta'&&d.postponed_until).map(d=>d.postponed_until).filter((t):t is string=>Boolean(t)).sort();
 const pendientes=horariosEntre(c,now,new Date(now.getTime()+31*86400000)).filter(t=>!dosis.some(d=>d.scheduled_at===t&&['tomada','omitida'].includes(d.status)));
 return [...pospuestas,...pendientes].sort()[0]??null;
}
export function adherencia(c:Config,dosis:Dosis[],dias:number,now=new Date()){
 const programadas=horariosEntre({...c,estado:'activo'},new Date(now.getTime()-dias*86400000),now);
 const tomadas=programadas.filter(t=>dosis.some(d=>d.scheduled_at===t&&d.status==='tomada')).length;
 return programadas.length?Math.round(tomadas/programadas.length*100):null;
}
export function alertas(c:Config,now=new Date()){
 const diario=c.frecuencia==='intervalo'?24/c.horas:c.frecuencia==='fijos'?new Set(c.horarios).size:0;
 const diasStock=c.stock!==null&&diario>0?c.stock/(c.porToma*diario):null;
 const vence=c.vencimiento?Math.ceil((new Date(`${c.vencimiento}T23:59:59-05:00`).getTime()-now.getTime())/86400000):null;
 return {diasStock,bajo:diasStock!==null&&diasStock<=5,vencePronto:vence!==null&&vence<=30,vencido:vence!==null&&vence<0};
}
export function alarmaSintoma(s:string,severidad:string){return severidad==='grave'||/dificultad para respirar|hinchaz[oó]n de (?:cara|labios)|desmayo|convulsiones|confusi[oó]n/i.test(s);}
export function esDuplicado(a:{nombre:string;detalle:Config},b:Med){const c=leerConfig(b);if(!c||estadoTratamiento(c)!=='activo')return false;const normal=(s:string)=>s.trim().toLocaleLowerCase('es');return (normal(a.nombre)===normal(b.nombre)||(a.detalle.generico&&normal(a.detalle.generico)===normal(c.generico)))&&a.detalle.cantidad===c.cantidad&&a.detalle.unidad===c.unidad&&a.detalle.frecuencia===c.frecuencia&&(c.frecuencia==='intervalo'?a.detalle.horas===c.horas:JSON.stringify([...a.detalle.horarios].sort())===JSON.stringify([...c.horarios].sort()));}
/** Preparación del envío: no crea trabajos ni llama a proveedores. */
export function enSilencio(c:Config,now:Date){if(c.vital||!c.silencioInicio||!c.silencioFin)return false;const h=new Intl.DateTimeFormat('en-GB',{timeZone:c.zona,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);return c.silencioInicio<c.silencioFin?h>=c.silencioInicio&&h<c.silencioFin:h>=c.silencioInicio||h<c.silencioFin;}
export function reintentoVital(c:Config,enviado:string,intentos:number,confirmada:boolean,now:Date){return c.vital&&!confirmada&&intentos===0&&now.getTime()-Date.parse(enviado)>=1800000;}