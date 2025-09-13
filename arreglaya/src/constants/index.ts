// src/constants/index.ts
export const PROFESSIONS: string[] = [
  'Carpintero/a',
  'Plomero/a',
  'Electricista',
  'Pintor/a',
  'Gasista',
  'Albañil',
  'Herrero/a',
  'Jardinero/a',
  'Techista',
  'Cerrajero/a',
  'Vidriero/a',
]

export const BARRIOS_CABA: string[] = [
  'Palermo', 'Recoleta', 'Belgrano', 'Caballito', 'Flores',
  'Almagro', 'Villa Urquiza', 'Colegiales', 'Chacarita', 'Villa Crespo',
  'Núñez', 'Saavedra', 'San Telmo', 'Monserrat', 'San Nicolás',
  'Balvanera', 'Boedo', 'Parque Patricios', 'Barracas', 'La Boca',
  'Constitución', 'Puerto Madero', 'Retiro', 'Agronomía', 'La Paternal',
  'Villa Devoto', 'Villa del Parque', 'Villa Pueyrredón', 'Villa Lugano',
  'Villa Riachuelo', 'Villa Soldati', 'Mataderos', 'Parque Avellaneda',
  'Liniers', 'Vélez Sarsfield', 'Floresta', 'Monte Castro', 'Versalles',
  'Villa Real', 'Villa Luro', 'Parque Chas', 'Nueva Pompeya',
]

export type RequestState = 'enviado' | 'aceptado' | 'rechazado' | 'en curso' | 'finalizado'

export const REQUEST_STATES: RequestState[] = [
  'enviado',
  'aceptado',
  'rechazado',
  'en curso',
  'finalizado',
]