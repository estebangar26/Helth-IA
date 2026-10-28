import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { guardarSchema, esDuplicado, type Med } from './modelo';
const idSchema=z.object({id:z.string().uuid()});
export const listarMedicamentos=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const db=context.supabase,uid=context.userId;
 const [meds,doses,symptoms,prefs]=await Promise.all([db.from('medicaciones').select('*').eq('user_id',uid).order('creado_en',{ascending:false}),db.from('medication_doses').select('*').eq('user_id',uid),db.from('medication_symptoms').select('*').eq('user_id',uid).order('occurred_at',{ascending:false}),db.from('notification_prefs').select('*').eq('user_id',uid).maybeSingle()]);
 if(meds.error||doses.error||symptoms.error||prefs.error)throw new Error('No se pudieron cargar las medicaciones.');
 return {meds:(meds.data??[]) as Med[],doses:doses.data??[],symptoms:symptoms.data??[],prefs:prefs.data};
});
export const guardarMedicamento=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>guardarSchema.parse(x)).handler(async({context,data})=>{
 const db=context.supabase,uid=context.userId;
 const {data:prefs}=await db.from('notification_prefs').select('health_consent').eq('user_id',uid).maybeSingle();
 if(!prefs?.health_consent)throw new Error('Confirme el consentimiento para registrar datos de salud.');
 const {data:meds,error:readError}=await db.from('medicaciones').select('*').eq('user_id',uid);if(readError)throw new Error('No se pudo verificar el tratamiento.');
 if(!data.confirmarDuplicado&&(meds??[]).some(m=>m.id!==data.id&&esDuplicado(data,m)))return {duplicado:true};
 if(data.id&&!(meds??[]).some(m=>m.id===data.id))throw new Error('Tratamiento no autorizado.');
 const c=data.detalle;
 if(c.foto&&!c.foto.startsWith(`${uid}/`))throw new Error('Foto no autorizada.');
 const fila={nombre:data.nombre,dosis:`${c.cantidad} ${c.unidad}`,frecuencia:c.frecuencia==='intervalo'?`cada ${c.horas} horas`:c.frecuencia==='fijos'?c.horarios.join(', '):'solo si lo necesito',notas:data.notas||null,detalle:c};
 const res=data.id?await db.from('medicaciones').update(fila).eq('id',data.id).eq('user_id',uid).select('id').single():await db.from('medicaciones').insert({...fila,user_id:uid}).select('id').single();
 if(res.error||!res.data)throw new Error('No se pudo guardar el medicamento.');
 const {error}=await db.from('medication_schedules').upsert({medication_id:res.data.id,user_id:uid,config:c});if(error)throw new Error('Medicamento guardado; no se pudo guardar su horario.');
 return {duplicado:false};
});
export const guardarPreferencias=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>z.object({allergies:z.string().trim().max(1000),health_consent:z.boolean()}).parse(x)).handler(async({context,data})=>{
 const {error}=await context.supabase.from('notification_prefs').upsert({...data,user_id:context.userId,updated_at:new Date().toISOString()});if(error)throw new Error('No se pudieron guardar las preferencias.');return {ok:true};
});
export const registrarToma=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>z.object({id:z.string().uuid(),scheduled_at:z.string().datetime(),status:z.enum(['tomada','omitida','pospuesta'])}).parse(x)).handler(async({context,data})=>{
 const db=context.supabase;const {data:m}=await db.from('medicaciones').select('id').eq('id',data.id).eq('user_id',context.userId).maybeSingle();if(!m)throw new Error('Tratamiento no autorizado.');
 const now=new Date();const {error}=await db.from('medication_doses').upsert({medication_id:data.id,user_id:context.userId,scheduled_at:data.scheduled_at,status:data.status,recorded_at:now.toISOString(),postponed_until:data.status==='pospuesta'?new Date(now.getTime()+900000).toISOString():null},{onConflict:'medication_id,scheduled_at'});if(error)throw new Error('No se pudo registrar la toma.');return {ok:true};
});
export const registrarSintoma=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>z.object({id:z.string().uuid(),occurred_at:z.string().datetime(),symptom:z.string().trim().min(2).max(300),severity:z.enum(['leve','moderada','grave']),recent_dose:z.boolean(),notes:z.string().trim().max(1000)}).parse(x)).handler(async({context,data})=>{
 const {id,...fila}=data;const {error}=await context.supabase.from('medication_symptoms').insert({...fila,medication_id:id,user_id:context.userId});if(error)throw new Error('No se pudo registrar el síntoma.');return {ok:true};
});
export const eliminarMedicamento=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>idSchema.parse(x)).handler(async({context,data})=>{
 const db=context.supabase;const {data:m}=await db.from('medicaciones').select('detalle').eq('id',data.id).eq('user_id',context.userId).maybeSingle();
 const foto=m?.detalle&&typeof m.detalle==='object'&&!Array.isArray(m.detalle)?m.detalle.foto:undefined;
 if(typeof foto==='string'&&foto.startsWith(`${context.userId}/`)){const {error}=await db.storage.from('medication-photos').remove([foto]);if(error)throw new Error('No se pudo borrar la foto.');}
 const {error}=await db.from('medicaciones').delete().eq('id',data.id).eq('user_id',context.userId);if(error)throw new Error('No se pudo eliminar el tratamiento.');return {ok:true};
});
export const borrarDatosMedicaciones=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const db=context.supabase,uid=context.userId;const {data:files,error:photoError}=await db.storage.from('medication-photos').list(uid,{limit:1000});if(photoError)throw new Error('No se pudieron consultar las fotos.');
 if(files?.length){const {error}=await db.storage.from('medication-photos').remove(files.map(f=>`${uid}/${f.name}`));if(error)throw new Error('No se pudieron borrar las fotos.');}
 const {error}=await db.from('medicaciones').delete().eq('user_id',uid);if(error)throw new Error('No se pudieron borrar los medicamentos.');
 const {error:p}=await db.from('notification_prefs').delete().eq('user_id',uid);if(p)throw new Error('No se pudieron borrar las preferencias.');return {ok:true};
});