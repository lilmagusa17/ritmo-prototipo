/* Qué pide cada tipo de ajuste (L-03, L-03d, L-03e, L-03f) y cómo se describe
   después en la vista previa, en el mensaje de Miguel y en el historial.

   Todo tipo produce el mismo par original → nueva (C2). Para "proteger tiempo de foco"
   la "fecha" es un bloque de tiempo: "Hoy 14:00–16:00 · antes: libre para reuniones". */

import { COMPROMISOS, FECHAS_PROPUESTA, TAREA_NUEVA } from '../../data/mock.js';

const informe = COMPROMISOS[0];

export const CONFIG_TIPO = {
  /* L-03 · Modificar plazo (90:6272) */
  plazo: {
    titulo: 'Modificar plazo',
    pregunta: '¿Para cuándo necesitas moverlo?',
    ayuda: 'Miguel verá la fecha actual y la que propones.',
    campo: 'propuestaISO',
    errorVacio: 'Elige una fecha nueva para continuar.',
    opciones: FECHAS_PROPUESTA.map((f) => ({ id: f.iso, titulo: f.fecha, detalle: null })),
    etiquetaFecha: informe.titulo,
    fechaOriginal: informe.fecha,
    propuestaDesde: (valor) => FECHAS_PROPUESTA.find((f) => f.iso === valor)?.fecha || '',
  },

  /* L-03d · Reorganizar prioridad (91:6770) */
  prioridad: {
    titulo: 'Reorganizar prioridad',
    pregunta: '¿Qué debería ir primero?',
    ayuda: 'Las dos cosas caen el mismo día. Miguel decide el orden.',
    campo: 'primero',
    errorVacio: 'Elige qué va primero para continuar.',
    opciones: [
      { id: 'informe', titulo: informe.titulo, detalle: `Entrega ${informe.fecha}` },
      { id: 'reporte', titulo: TAREA_NUEVA.titulo, detalle: `Entrega ${TAREA_NUEVA.fecha}` },
    ],
    etiquetaFecha: 'Orden actual',
    fechaOriginal: `${informe.titulo} y ${TAREA_NUEVA.titulo} el mismo día (${informe.fechaCorta})`,
    propuestaDesde: (valor) =>
      valor === 'informe' ? `Primero ${informe.titulo}` : `Primero ${TAREA_NUEVA.titulo}`,
  },

  /* L-03e · Proteger tiempo de foco (91:6866) */
  foco: {
    titulo: 'Proteger tiempo de foco',
    pregunta: '¿Qué bloque quieres proteger?',
    ayuda: 'Miguel verá qué horas quedarían sin reuniones.',
    campo: 'bloque',
    errorVacio: 'Elige un bloque para continuar.',
    opciones: [
      { id: 'hoy-14', titulo: 'Hoy 14:00–16:00', detalle: 'Bloque de foco: Informe mensual' },
      { id: 'manana-9', titulo: 'Mañana 9:00–11:00', detalle: 'Antes del daily de la tarde' },
      { id: 'ambos', titulo: 'Los dos bloques', detalle: 'Hoy y mañana' },
    ],
    etiquetaFecha: 'Bloque de foco',
    fechaOriginal: 'Hoy 14:00–16:00 · antes: libre para reuniones',
    propuestaDesde: (valor) =>
      valor === 'hoy-14'
        ? 'Hoy 14:00–16:00 sin reuniones'
        : valor === 'manana-9'
          ? 'Mañana 9:00–11:00 sin reuniones'
          : 'Hoy 14:00–16:00 y mañana 9:00–11:00 sin reuniones',
  },

  /* L-03f · Redistribuir carga (91:6969) */
  redistribuir: {
    titulo: 'Redistribuir carga',
    pregunta: '¿Con qué parte necesitas apoyo?',
    ayuda: 'Miguel verá qué parte del trabajo propones repartir.',
    campo: 'parte',
    errorVacio: 'Elige con qué parte necesitas apoyo.',
    opciones: [
      { id: 'datos', titulo: 'Consolidar los datos del reporte', detalle: 'Aproximadamente media jornada' },
      { id: 'revision', titulo: 'Revisión final del informe', detalle: 'Aproximadamente 2 horas' },
      { id: 'diapositivas', titulo: 'Preparar las diapositivas', detalle: 'Aproximadamente 3 horas' },
    ],
    etiquetaFecha: TAREA_NUEVA.titulo,
    fechaOriginal: 'Todo el trabajo a tu cargo',
    propuestaDesde: (valor) => {
      const mapa = {
        datos: 'Apoyo para consolidar los datos',
        revision: 'Apoyo en la revisión final',
        diapositivas: 'Apoyo para preparar las diapositivas',
      };
      return mapa[valor] || '';
    },
  },
};

/* Arma la solicitud que viaja al store y, desde ahí, a la vista de Miguel (§7) */
export function armarSolicitud(borrador) {
  const cfg = CONFIG_TIPO[borrador.tipo];
  const valor = borrador[cfg.campo];
  return {
    tipo: borrador.tipo,
    tipoTitulo: cfg.titulo,
    compromiso: cfg.etiquetaFecha,
    fechaOriginal: cfg.fechaOriginal,
    propuesta: cfg.propuestaDesde(valor),
    nota: (borrador.nota || '').trim(),
    tareaNueva: TAREA_NUEVA.titulo,
    consentimiento: true,
  };
}

/* Alternativas que puede proponer Miguel (M-03), por tipo de ajuste.
   "Sin fecha por ahora" es la variante M-03 sin fecha: Miguel no se compromete todavía. */
export const ALTERNATIVAS = {
  plazo: [
    { id: 'vie-13', titulo: 'viernes 13 nov', detalle: 'Un día más, no dos' },
    { id: 'mar-17', titulo: 'martes 17 nov', detalle: 'Después de la revisión con dirección del lunes' },
    { id: 'sin-fecha', titulo: 'Sin fecha por ahora', detalle: 'Lo definimos en el 1:1 de hoy a las 16:30' },
  ],
  prioridad: [
    { id: 'reporte-primero', titulo: `Primero ${TAREA_NUEVA.titulo}`, detalle: 'El informe se entrega después' },
    { id: 'partir', titulo: 'Partir el informe en dos entregas', detalle: 'Avance el jueves, final el lunes' },
    { id: 'sin-fecha', titulo: 'Sin definir por ahora', detalle: 'Lo hablamos en el 1:1 de hoy' },
  ],
  foco: [
    { id: 'una-hora', titulo: 'Hoy 14:00–15:00 sin reuniones', detalle: 'Una hora en vez de dos' },
    { id: 'manana', titulo: 'Mañana 9:00–11:00 sin reuniones', detalle: 'Hoy no se puede mover la agenda' },
    { id: 'sin-fecha', titulo: 'Sin bloque fijo por ahora', detalle: 'Lo revisamos en el 1:1' },
  ],
  redistribuir: [
    { id: 'camila', titulo: 'Camila apoya con los datos', detalle: 'Ella ya tiene el acceso' },
    { id: 'parcial', titulo: 'Apoyo solo en la revisión final', detalle: 'El resto queda contigo' },
    { id: 'sin-fecha', titulo: 'Sin apoyo asignado por ahora', detalle: 'Lo vemos en el 1:1' },
  ],
};

/* Razones de rechazo (M-04). "Otra razón" abre un campo de texto. */
export const RAZONES_RECHAZO = [
  { id: 'cliente', texto: 'Hay un compromiso con el cliente' },
  { id: 'equipo', texto: 'El equipo depende de esa fecha' },
  { id: 'nadie', texto: 'No puedo reasignar a nadie ahora' },
  { id: 'otra', texto: 'Otra razón' },
];
