/* RITMO · forma del estado global.
   Una sola fuente de verdad para las 5 superficies (Slack Laura, Slack Miguel, app, Dot, control). */

import { HISTORIAL_EJEMPLO } from '../data/mock.js';

export const CLAVE_STORAGE = 'ritmo:v1';
export const CANAL_SYNC = 'ritmo-sync';

export const estadoInicial = () => ({
  version: 1,

  /* Reloj simulado del moderador */
  reloj: '9:00',

  /* Onboarding por superficie */
  onboarding: {
    slackLaura: 'bienvenida',   // bienvenida (O-01) → codigo (O-02) → vinculada (O-03) → listo
    slackMiguel: 'bienvenida',  // bienvenida (OM-01) → listo
    app: 'vincular',            // vincular (APP-01) → config (APP-00) → avisos (APP-02) → dot (APP-03) → listo (APP-04)
  },
  appVinculada: false,

  /* RITMO Dot (C7) */
  dot: {
    estado: 'disponible',
    razon: '',
    mostrarNombreEnSlack: false, // "Solo la luz" vs "Luz + nombre en Slack" (C5)
    mostrarNombreEnDot: true,    // toggle del moderador para la vista #/dot
  },

  /* Chat de RITMO con Laura. El mismo hilo se ve en Slack y en la pestaña Chat del móvil (C4). */
  chat: [],
  chatMiguel: [],
  ritmoEscribiendo: false,

  /* Aviso de choque (L-01) */
  avisoChoque: 'oculto', // oculto → visible → postergado (L-01b) → atendido

  /* Solicitudes (§7) */
  solicitudes: [],
  borrador: null, // { tipo, compromiso, fechaOriginal, propuesta, nota, consentimiento }

  /* Panel derecho de Slack (440px) */
  panel: { abierto: false, pantalla: null, lado: null },

  /* Banners push del móvil */
  notificaciones: [],

  /* Flags que arma el moderador antes de un envío */
  flags: {
    errorEnvioProximo: false,
    codigoVencidoProximo: false,
  },

  /* Log del moderador, para las notas de la sesión */
  log: [],
});

/* Estado con el historial de ejemplo cargado (botón del panel de control) */
export const conHistorialEjemplo = (estado) => ({
  ...estado,
  solicitudes: HISTORIAL_EJEMPLO.map((s) => ({ ...s })),
});
