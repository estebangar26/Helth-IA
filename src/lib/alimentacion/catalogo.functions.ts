import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import type { Catalogo } from './tipos';
export const obtenerCatalogoAlimentos = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}): Promise<Catalogo> => {
 const [foods,rules,places]=await Promise.all([context.supabase.from('foods').select('*').order('nombre'),context.supabase.from('variable_food_rules').select('*'),context.supabase.from('places').select('*').order('nombre')]);
 if(foods.error || rules.error || places.error) throw new Error('No se pudo leer el catálogo de alimentación.');
 return {foods:foods.data ?? [],rules:rules.data ?? [],places:places.data ?? []};
});
export const obtenerAdminAlimentos = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
 const rol=await context.supabase.rpc('es_admin'); if(rol.error || !rol.data) throw new Error('Acceso solo para administradores.');
 const [foods,rules,places]=await Promise.all([context.supabase.from('foods').select('*').order('nombre'),context.supabase.from('variable_food_rules').select('*'),context.supabase.from('places').select('*')]);
 if(foods.error || rules.error || places.error) throw new Error('No se pudo leer el catálogo.');
 return {foods:foods.data ?? [],rules:rules.data ?? [],places:places.data ?? []};
});
export const guardarCatalogoAlimentos = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((x:unknown)=>z.object({tabla:z.enum(['foods','variable_food_rules','places']),fila:z.record(z.string(),z.unknown())}).parse(x)).handler(async ({data,context})=>{
 const rol=await context.supabase.rpc('es_admin'); if(rol.error || !rol.data) throw new Error('Acceso solo para administradores.');
 const comunes={id:z.string().min(1).max(100),nombre:z.string().min(1).max(150)};
 const schema=data.tabla==='foods'?z.object({...comunes,categoria:z.enum(['fruta colombiana','leguminosa','verdura','proteína','cereal','limitar']),nutriente_clave:z.string(),por_que:z.string(),como_comerlo:z.string(),image_url:z.string().nullable(),image_credit:z.string().nullable(),tags_restriccion:z.array(z.enum(['potasio_alto','fosforo_alto','purinas_altas','azucar_alta','proteina_alta','sodio_alto']))}):data.tabla==='places'?z.object({...comunes,tipo:z.string(),ciudad:z.string(),que_se_consigue:z.string()}):z.object({id:comunes.id,analitos:z.array(z.string()),categorias:z.array(z.string()),estados:z.array(z.enum(['debajo','encima','dentro','sin_rango'])),recomendados:z.array(z.string()),limitar:z.array(z.string()),mensaje:z.string(),consejo:z.string()});
 const fila=schema.parse(data.fila);
 if('image_url' in fila && fila.image_url){
 const prefix=`${import.meta.env['VITE_SUPABASE_URL']}/storage/v1/object/public/foods/`;
 if(!fila.image_url.startsWith(prefix) || !('image_credit' in fila) || !fila.image_credit?.trim()) throw new Error('Use una foto del catálogo con autor y licencia.');
 }
 const {error}=await context.supabase.from(data.tabla).upsert(fila as never); if(error) throw new Error('No se pudo guardar el catálogo.'); return {ok:true};
});
