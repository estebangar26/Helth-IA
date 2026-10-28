import type { ResultadoCatalogo } from '@/lib/copiloto/tipos';
export type Estado = 'dentro' | 'debajo' | 'encima' | 'sin_rango' | 'observacion' | 'accion' | 'controlado';
export type Lectura = ResultadoCatalogo & { estado: Estado };
export interface Food { id: string; nombre: string; categoria: string; nutriente_clave: string; por_que: string; como_comerlo: string; image_url: string | null; image_path?: string | null; image_credit: string | null; tags_restriccion: string[] }
export interface Rule { id: string; analitos: string[]; categorias: string[]; estados: string[]; recomendados: string[]; limitar: string[]; mensaje: string; consejo: string }
export interface Place { id: string; nombre: string; tipo: string; ciudad: string; que_se_consigue: string }
export interface Catalogo { foods: Food[]; rules: Rule[]; places: Place[] }
export const AVISO = 'Información educativa basada en guías generales; no reemplaza la valoración de un nutricionista o médico.';
