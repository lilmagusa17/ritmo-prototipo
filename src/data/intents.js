/* C4 · Bot guionado por intenciones. Sin LLM: palabras clave, para que todas las
   sesiones de prueba sean comparables.

   Cada respuesta devuelve { texto, attachment?, chips?, efecto? }.
   - attachment.acciones: botones que hacen algo (abrir el panel, mover el Dot).
   - chips: envían un mensaje por la participante, para que no tenga que escribir. */

import { AGENDA_HOY, COMPROMISOS, TAREA_NUEVA, HOY, ESTADOS_DOT, dotPorId, ETIQUETAS_ESTADO } from './mock.js';

export const normalizar = (texto) =>
  (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/* El orden manda: la primera fila que coincide gana.
   Las frases de varias palabras van antes que las sueltas ("mis solicitudes" antes que "solicitud"). */
const TABLA = [
  { id: 'solicitudes', claves: ['mis solicitudes', 'mi solicitud', 'respondio', 'respondió', 'estado'] },
  { id: 'saturacion', claves: ['saturad', 'no alcanzo', 'mucho trabajo', 'estres', 'cansad', 'agobiad'] },
  /* "cambiar orden" antes que "orden", y "organiza mi día" antes que "mi día":
     si no, pedir otro orden devuelve el mismo plan y organizar devuelve la agenda. */
  { id: 'reordenar', claves: ['cambiar orden', 'cambiar el orden', 'otro orden', 'otra opcion', 'reorganiza'] },
  { id: 'organizar', claves: ['organiza', 'prioriza', 'plan', 'orden'] },
  { id: 'agenda', claves: ['hoy', 'agenda', 'que tengo', 'mi dia', 'mi día'] },
  { id: 'semana', claves: ['semana', 'entregas', 'pendientes'] },
  { id: 'pausa', claves: ['pausa', 'descanso'] },
  { id: 'ajuste', claves: ['ajuste', 'mover', 'plazo', 'solicitud'] },
  { id: 'dot', claves: ['dot', 'luz', 'indicador', 'color'] },
  { id: 'saludo', claves: ['hola', 'buenas', 'gracias'] },
];

export function detectarIntencion(texto) {
  const t = normalizar(texto);
  for (const fila of TABLA) {
    if (fila.claves.some((k) => t.includes(normalizar(k)))) return fila.id;
  }
  return 'fallback';
}

const CHIPS_FALLBACK = [
  { texto: 'Ver mi día', envia: 'que tengo hoy' },
  { texto: 'Proponme un orden', envia: 'organiza mi día' },
  { texto: 'Pedir un ajuste', envia: 'quiero pedir un ajuste' },
  { texto: 'Cambiar mi Dot', envia: 'cambiar mi dot' },
];

/* Respuestas. Reciben el estado para hablar de datos reales, no de ejemplos. */
export function responder(intencion, estado) {
  const informe = COMPROMISOS[0];
  const dot = dotPorId(estado.dot.estado);

  switch (intencion) {
    case 'agenda':
      return {
        texto: `Esto es lo que tienes hoy, ${HOY.largo}:`,
        attachment: {
          titulo: 'Tu agenda de hoy',
          lineas: AGENDA_HOY.map((e) => `${e.hora} · ${e.titulo} (${e.duracion})`),
          /* Cada botón lleva a algo distinto: repetir "Organizar mi día" sin más
             dejaba al participante dando vueltas sobre la misma lista. */
          acciones: [
            { id: 'organizar-dia', texto: 'Proponme un orden', variante: 'primario' },
            { id: 'ver-entregas', texto: 'Ver mis entregas' },
            { id: 'abrir-solicitud', texto: 'Pedir un ajuste' },
          ],
        },
      };

    case 'organizar':
      return {
        texto: 'Te propongo este orden, con tus reuniones ya puestas:',
        attachment: {
          titulo: 'Orden propuesto',
          tono: 'azul',
          lineas: [
            '9:45–11:00 · Cerrar los datos del Informe mensual (antes de Comercial)',
            '12:00–13:00 · Responder lo urgente del Reporte de ventas',
            '14:00–16:00 · Bloque de foco: redactar el Informe mensual',
            '16:00–16:30 · Dejar listo el avance para el 1:1 con Miguel',
          ],
          acciones: [
            { id: 'me-sirve', texto: 'Me sirve', variante: 'primario' },
            { id: 'cambiar-orden', texto: 'Proponme otro orden' },
          ],
        },
      };

    /* Segunda propuesta: el foco temprano. Así "otro orden" cambia algo de verdad. */
    case 'reordenar':
      return {
        texto: 'Va otra forma de armarlo, con el foco temprano:',
        attachment: {
          titulo: 'Otro orden posible',
          tono: 'azul',
          lineas: [
            '9:45–11:00 · Bloque de foco: redactar el Informe mensual',
            '12:00–13:00 · Cerrar los datos que faltan del informe',
            '14:00–15:00 · Reporte de ventas para Comercial',
            '15:00–16:30 · Revisar y preparar el avance para el 1:1 con Miguel',
          ],
          acciones: [
            { id: 'me-sirve', texto: 'Me sirve', variante: 'primario' },
            { id: 'organizar-dia', texto: 'Volver al primero' },
          ],
        },
      };

    case 'semana': {
      const lineas = COMPROMISOS.map((c) =>
        c.fechaISO === TAREA_NUEVA.fechaISO
          ? `⚠ ${c.titulo} · ${c.fecha} · choca con ${TAREA_NUEVA.titulo}`
          : `${c.titulo} · ${c.fecha}`,
      );
      return {
        texto: 'Estas son tus entregas:',
        attachment: {
          titulo: 'Tus compromisos',
          tono: 'ambar',
          lineas,
          pie: 'Solo tú ves esta lista.',
          acciones: [{ id: 'abrir-solicitud', texto: 'Pedir un ajuste' }],
        },
      };
    }

    /* Respuesta empática y corta. No diagnostica ni interpreta (C6, §1). */
    case 'saturacion':
      return {
        texto: 'Tiene sentido: hoy tienes dos entregas el mismo día. Dime por dónde quieres empezar.',
        chips: [
          { texto: 'Ver choques', envia: 'ver mis entregas de la semana' },
          { texto: 'Proteger tiempo de foco', envia: 'quiero un ajuste de tiempo de foco' },
          { texto: 'Tomar una pausa', envia: 'quiero una pausa' },
        ],
      };

    case 'pausa':
      return {
        texto: 'Te propongo 10 minutos de pausa. Puedo poner tu Dot en Recargando mientras tanto.',
        attachment: {
          titulo: 'Pausa de 10 minutos',
          tono: 'verde',
          lineas: ['Tu equipo ve el color, no la razón.'],
          acciones: [
            { id: 'dot-recargando', texto: 'Poner el Dot en Recargando', variante: 'primario' },
            { id: 'nada', texto: 'Ahora no' },
          ],
        },
      };

    case 'ajuste':
      return {
        texto: '¿Qué compromiso quieres ajustar?',
        attachment: {
          titulo: 'Pedir un ajuste',
          lineas: [`Tu entrega más cercana es ${informe.titulo}, el ${informe.fecha}.`],
          acciones: [{ id: 'abrir-solicitud', texto: 'Elegir el tipo de ajuste', variante: 'primario' }],
        },
        efecto: 'abrir-solicitud',
      };

    case 'solicitudes': {
      if (estado.solicitudes.length === 0) {
        return {
          texto: 'Todavía no has enviado ninguna solicitud.',
          chips: [{ texto: 'Pedir un ajuste', envia: 'quiero pedir un ajuste' }],
        };
      }
      return {
        texto: 'Así van tus solicitudes:',
        attachment: {
          titulo: 'Mis solicitudes',
          lineas: estado.solicitudes.map(
            (s) => `${s.tipoTitulo} · ${s.compromiso} · ${ETIQUETAS_ESTADO[s.estado]?.texto}`,
          ),
          acciones: [{ id: 'ver-mis-solicitudes', texto: 'Ver mis solicitudes', variante: 'primario' }],
        },
      };
    }

    case 'dot':
      return {
        texto: `Tu Dot está en ${dot.nombre}.`,
        attachment: {
          titulo: 'RITMO Dot',
          lineas: ['Tu equipo solo ve el color, no la razón.'],
          acciones: ESTADOS_DOT.filter((e) => e.id !== estado.dot.estado).map((e) => ({
            id: `dot-${e.id}`,
            texto: e.nombre,
          })),
        },
      };

    case 'saludo':
      return { texto: 'Hola, Laura. ¿En qué te ayudo?', chips: CHIPS_FALLBACK };

    default:
      return {
        texto: 'Todavía no sé hacer eso. Puedo ayudarte a:',
        chips: CHIPS_FALLBACK,
      };
  }
}
