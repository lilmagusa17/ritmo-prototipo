/* RITMO · datos mock del prototipo (CLAUDE.md §4) · nada de APIs externas */

/* Flags del prototipo */
export const SHOW_COMPANY_POLICY = false; // C6: política de no represalia, apagada por defecto

/* Hoy ficticio del prototipo */
export const HOY = {
  iso: '2026-11-10',
  corto: 'mar 10 nov',
  largo: 'martes 10 de noviembre',
};

/* Workspace */
export const WORKSPACE = {
  nombre: 'Equipo Operaciones',
  inicial: 'E',
};

export const USUARIOS = {
  laura: { id: 'laura', nombre: 'Laura', handle: 'laura.m', rol: 'Analista', inicial: 'L', color: '#6d4aff' },
  miguel: { id: 'miguel', nombre: 'Miguel', handle: 'miguel.r', rol: 'Coordinador', inicial: 'M', color: '#2e6fd8' },
  camila: { id: 'camila', nombre: 'Camila', handle: 'camila.p', rol: 'Comercial', inicial: 'C', color: '#22b8a7' },
  ritmo: { id: 'ritmo', nombre: 'RITMO', handle: 'ritmo', rol: 'App', inicial: 'R', color: '#6d4aff', esApp: true },
};

export const CANALES = [
  { id: 'general', nombre: 'general' },
  { id: 'operaciones', nombre: 'operaciones' },
  { id: 'comercial', nombre: 'comercial' },
];

/* DMs por cada vista de Slack. RITMO siempre primero: es la conversación de la prueba. */
export const DMS = {
  laura: [
    { id: 'ritmo', usuario: 'ritmo' },
    { id: 'miguel', usuario: 'miguel' },
    { id: 'camila', usuario: 'camila' },
  ],
  miguel: [
    { id: 'ritmo', usuario: 'ritmo' },
    { id: 'laura', usuario: 'laura' },
    { id: 'camila', usuario: 'camila' },
  ],
};

/* Agenda de hoy de Laura */
export const AGENDA_HOY = [
  { id: 'daily', hora: '9:30', titulo: 'Daily', duracion: '15 min', fin: '9:45' },
  { id: 'comercial', hora: '11:00', titulo: 'Reunión con Comercial', duracion: '1 h', fin: '12:00' },
  { id: 'foco', hora: '14:00', titulo: 'Bloque de foco: Informe mensual', duracion: '2 h', fin: '16:00', esFoco: true },
  { id: 'uno-a-uno', hora: '16:30', titulo: '1:1 con Miguel', duracion: '30 min', fin: '17:00' },
];

/* Compromisos de Laura. fechaEntrega en ISO + etiqueta legible para el copy. */
export const COMPROMISOS = [
  { id: 'informe-mensual', titulo: 'Informe mensual', fechaISO: '2026-11-12', fecha: 'jueves 12 nov', fechaCorta: 'jue 12 nov' },
  { id: 'plan-trimestral', titulo: 'Plan trimestral', fechaISO: '2026-11-20', fecha: 'viernes 20 nov', fechaCorta: 'vie 20 nov' },
  { id: 'presentacion-cliente', titulo: 'Presentación a cliente', fechaISO: '2026-11-17', fecha: 'martes 17 nov', fechaCorta: 'mar 17 nov' },
  { id: 'cierre-inventario', titulo: 'Cierre de inventario', fechaISO: '2026-11-27', fecha: 'viernes 27 nov', fechaCorta: 'vie 27 nov' },
  { id: 'plan-capacitacion', titulo: 'Plan de capacitación', fechaISO: '2026-12-04', fecha: 'viernes 4 dic', fechaCorta: 'vie 4 dic' },
];

/* Tarea nueva que dispara el aviso de choque (L-01) */
export const TAREA_NUEVA = {
  id: 'reporte-ventas',
  titulo: 'Reporte de ventas para Comercial',
  fechaISO: '2026-11-12',
  fecha: 'jueves 12 nov',
  fechaCorta: 'jue 12 nov',
  pedidaPor: 'Camila',
  choca_con: 'informe-mensual',
};

/* Fechas que ofrece el formulario de "Modificar plazo" (L-03) */
export const FECHAS_PROPUESTA = [
  { iso: '2026-11-13', fecha: 'viernes 13 nov', fechaCorta: 'vie 13 nov' },
  { iso: '2026-11-16', fecha: 'lunes 16 nov', fechaCorta: 'lun 16 nov' },
  { iso: '2026-11-17', fecha: 'martes 17 nov', fechaCorta: 'mar 17 nov' },
  { iso: '2026-11-18', fecha: 'miércoles 18 nov', fechaCorta: 'mié 18 nov' },
];

/* Los 4 tipos de ajuste (L-02). Todos revelan un compromiso de Laura → todos piden consentimiento (C1). */
export const TIPOS_AJUSTE = [
  {
    id: 'plazo',
    titulo: 'Modificar plazo',
    descripcion: 'Pide mover la fecha de entrega de un compromiso.',
    pantalla: 'L-03',
  },
  {
    id: 'prioridad',
    titulo: 'Reorganizar prioridad',
    descripcion: 'Pide definir qué va primero cuando dos cosas caen el mismo día.',
    pantalla: 'L-03d',
  },
  {
    id: 'foco',
    titulo: 'Proteger tiempo de foco',
    descripcion: 'Pide dejar un bloque sin reuniones para avanzar.',
    pantalla: 'L-03e',
  },
  {
    id: 'redistribuir',
    titulo: 'Redistribuir carga',
    descripcion: 'Pide apoyo o repartir una parte del trabajo.',
    pantalla: 'L-03f',
  },
];

/* Estados del RITMO Dot (C7) */
export const ESTADOS_DOT = [
  { id: 'disponible', nombre: 'Disponible', color: 'var(--dot-disponible)', hex: '#2ba97f' },
  { id: 'concentracion', nombre: 'Concentración', color: 'var(--dot-concentracion)', hex: '#e45970' },
  { id: 'reunion', nombre: 'En reunión', color: 'var(--dot-reunion)', hex: '#4686e6' },
  { id: 'recargando', nombre: 'Recargando', color: 'var(--dot-recargando)', hex: '#6d4aff' },
  { id: 'apagado', nombre: 'Apagado', color: 'var(--dot-apagado)', hex: '#aaa1b7' },
];

export const dotPorId = (id) => ESTADOS_DOT.find((e) => e.id === id) || ESTADOS_DOT[0];

/* Historial de ejemplo para "Mis solicitudes" / APP-07.
   C3: sin la fila "Cancelada" del 20 oct. */
export const HISTORIAL_EJEMPLO = [
  {
    id: 'sol-hist-1',
    fecha: '10 nov',
    tipo: 'plazo',
    tipoTitulo: 'Modificar plazo',
    compromiso: 'Informe mensual',
    fechaOriginal: 'jueves 12 nov',
    propuesta: 'lunes 16 nov',
    estado: 'pendiente',
    nota: '',
    consentimiento: true,
    historial: [{ at: '10 nov 10:20', actor: 'laura', accion: 'Enviaste la solicitud' }],
  },
  {
    id: 'sol-hist-2',
    fecha: '3 nov',
    tipo: 'prioridad',
    tipoTitulo: 'Reorganizar prioridad',
    compromiso: 'Plan trimestral',
    fechaOriginal: 'viernes 6 nov',
    propuesta: 'Después del cierre de inventario',
    estado: 'acordada',
    nota: '',
    consentimiento: true,
    historial: [
      { at: '3 nov 09:10', actor: 'laura', accion: 'Enviaste la solicitud' },
      { at: '3 nov 11:40', actor: 'miguel', accion: 'Miguel propuso una alternativa' },
      { at: '3 nov 12:05', actor: 'laura', accion: 'Aceptaste la alternativa' },
    ],
  },
  {
    id: 'sol-hist-3',
    fecha: '28 oct',
    tipo: 'foco',
    tipoTitulo: 'Proteger tiempo de foco',
    compromiso: 'Bloque de foco de los martes',
    fechaOriginal: 'Martes 14:00–16:00 · antes: libre para reuniones',
    propuesta: 'Sin reuniones de 14:00 a 16:00',
    estado: 'rechazada',
    nota: '',
    consentimiento: true,
    historial: [
      { at: '28 oct 08:30', actor: 'laura', accion: 'Enviaste la solicitud' },
      { at: '28 oct 15:00', actor: 'miguel', accion: 'Miguel no pudo aceptar' },
    ],
  },
];

/* Etiquetas de estado de la solicitud (§7). Nunca solo color: siempre llevan texto. */
export const ETIQUETAS_ESTADO = {
  borrador: { texto: 'Borrador', tono: 'neutral' },
  pendiente: { texto: 'Pendiente', tono: 'ambar' },
  aceptada: { texto: 'Aceptada', tono: 'verde' },
  alternativa: { texto: 'Alternativa recibida', tono: 'azul' },
  acordada: { texto: 'Acordada', tono: 'verde' },
  rechazo_alt: { texto: 'Sin acuerdo', tono: 'rojo' },
  rechazada: { texto: 'Sin acuerdo', tono: 'rojo' },
  cancelada: { texto: 'Cancelada', tono: 'neutral' },
};

/* Saltos del reloj simulado del panel del moderador (§6) */
export const SALTOS_RELOJ = [
  { hora: '9:00', nota: 'Inicio de jornada' },
  { hora: '10:12', nota: 'Llega la tarea nueva → aviso de choque (L-01)' },
  { hora: '11:00', nota: 'Empieza Reunión con Comercial → Dot En reunión' },
  { hora: '12:24', nota: '+2 h sin respuesta → L-05b / M-01b' },
  { hora: '14:00', nota: 'Empieza bloque de foco → Dot Concentración' },
  { hora: '18:00', nota: 'Fin de jornada → Dot Apagado' },
];

/* Código de vinculación app ↔ Slack (O-02 / APP-01) */
export const CODIGO_VINCULO = '4 7 2 9';
