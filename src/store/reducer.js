/* RITMO · reducer único.
   Regla de CLAUDE.md §7: RITMO nunca cambia nada por su cuenta. Solo Laura, Miguel
   y el moderador disparan acciones. */

import { estadoInicial, conHistorialEjemplo } from './estadoInicial.js';
import { dotPorId } from '../data/mock.js';

let contador = 0;
export const nuevoId = (prefijo = 'id') => {
  contador += 1;
  return `${prefijo}-${Date.now().toString(36)}-${contador}`;
};

const anotar = (estado, texto) => ({
  ...estado,
  log: [...estado.log, { at: estado.reloj, texto, real: new Date().toLocaleTimeString('es-CO') }],
});

export function reducer(estado, accion) {
  switch (accion.type) {
    /* ---------- Sync entre ventanas ---------- */
    case 'HIDRATAR':
      return { ...accion.estado };

    /* ---------- Moderador: escenario ---------- */
    case 'RESET_TOTAL':
      return anotar(estadoInicial(), 'Reset total');

    case 'SALTAR_ONBOARDING':
      return anotar(
        {
          ...estado,
          onboarding: { slackLaura: 'listo', slackMiguel: 'listo', app: 'listo' },
          appVinculada: true,
          dotConfigurado: true,
        },
        'Onboarding saltado',
      );

    case 'CARGAR_HISTORIAL':
      return anotar(conHistorialEjemplo(estado), 'Historial de ejemplo cargado');

    case 'VACIAR_HISTORIAL':
      return anotar({ ...estado, solicitudes: [] }, 'Historial vaciado');

    case 'SET_RELOJ':
      return anotar({ ...estado, reloj: accion.hora }, `Reloj → ${accion.hora}${accion.nota ? ` · ${accion.nota}` : ''}`);

    case 'SET_FLAG':
      return anotar(
        { ...estado, flags: { ...estado.flags, [accion.flag]: accion.valor } },
        `Flag ${accion.flag} = ${accion.valor ? 'on' : 'off'}`,
      );

    case 'LOG':
      return anotar(estado, accion.texto);

    /* ---------- RITMO Dot (C7) ---------- */
    case 'DOT_SET': {
      const info = dotPorId(accion.estado);
      const base = {
        ...estado,
        dot: { ...estado.dot, estado: accion.estado, razon: accion.razon || '' },
        notificaciones: [
          ...estado.notificaciones,
          { id: nuevoId('notif'), titulo: `Tu Dot pasó a ${info.nombre}`, cuerpo: accion.razon || '', at: estado.reloj },
        ],
      };
      return anotar(base, `Dot → ${info.nombre}`);
    }

    case 'DOT_TOGGLE_NOMBRE_SLACK':
      return { ...estado, dot: { ...estado.dot, mostrarNombreEnSlack: accion.valor } };

    case 'DOT_TOGGLE_NOMBRE_VISTA':
      return { ...estado, dot: { ...estado.dot, mostrarNombreEnDot: accion.valor } };

    /* ---------- Notificaciones del móvil ---------- */
    case 'NOTIF_CERRAR':
      return { ...estado, notificaciones: estado.notificaciones.filter((n) => n.id !== accion.id) };

    /* ---------- Panel derecho de Slack ---------- */
    case 'PANEL_ABRIR':
      return {
        ...estado,
        panel: {
          abierto: true,
          pantalla: accion.pantalla,
          lado: accion.lado || 'laura',
          solicitudId: accion.solicitudId ?? estado.panel.solicitudId ?? null,
        },
      };

    case 'PANEL_CERRAR':
      return { ...estado, panel: { abierto: false, pantalla: null, lado: null } };

    /* ---------- Onboarding ---------- */
    case 'ONBOARDING_SET':
      return { ...estado, onboarding: { ...estado.onboarding, [accion.superficie]: accion.paso } };

    case 'AVISO_TOGGLE':
      return { ...estado, avisos: { ...estado.avisos, [accion.aviso]: accion.valor } };

    case 'DOT_CONFIGURADO':
      return anotar({ ...estado, dotConfigurado: true }, 'Dot configurado desde la app');

    case 'APP_VINCULADA':
      return anotar({ ...estado, appVinculada: true }, 'App vinculada con el código');

    /* ---------- Aviso de choque ---------- */
    case 'AVISO_CHOQUE':
      return anotar({ ...estado, avisoChoque: accion.estadoAviso }, `Aviso de choque → ${accion.estadoAviso}`);

    /* ---------- Chat (C4) ---------- */
    case 'CHAT_PUSH':
      return { ...estado, chat: [...estado.chat, { id: nuevoId('msg'), ...accion.mensaje }] };

    case 'CHAT_ESCRIBIENDO':
      return { ...estado, ritmoEscribiendo: accion.valor };

    /* ---------- Solicitudes (§7) ---------- */
    case 'BORRADOR_SET':
      return { ...estado, borrador: accion.borrador ? { ...estado.borrador, ...accion.borrador } : null };

    case 'SOLICITUD_ENVIAR':
      return anotar(
        {
          ...estado,
          solicitudes: [{ ...accion.solicitud, estado: 'pendiente' }, ...estado.solicitudes],
          borrador: null,
          panel: { abierto: true, pantalla: 'L-05', lado: 'laura' },
        },
        `Laura envió una solicitud (${accion.solicitud.tipoTitulo})`,
      );

    case 'SOLICITUD_ESTADO':
      return anotar(
        {
          ...estado,
          solicitudes: estado.solicitudes.map((s) =>
            s.id === accion.id
              ? {
                  ...s,
                  estado: accion.estado,
                  ...(accion.datos || {}),
                  historial: [...(s.historial || []), { at: estado.reloj, actor: accion.actor, accion: accion.accionTexto }],
                }
              : s,
          ),
        },
        accion.accionTexto || `Solicitud → ${accion.estado}`,
      );

    /* Miguel responde (§7). La misma acción mueve la solicitud, avisa a Laura en su chat,
       deja constancia en el de Miguel y, si aplica, mueve el Dot (C7). */
    case 'MIGUEL_RESPONDE': {
      const sol = estado.solicitudes.find((s) => s.id === accion.id);
      if (!sol) return estado;

      const nuevoEstado =
        accion.respuesta === 'aceptar' ? 'aceptada' : accion.respuesta === 'alternativa' ? 'alternativa' : 'rechazada';

      const textoHistorial =
        accion.respuesta === 'aceptar'
          ? 'Miguel aceptó tu propuesta'
          : accion.respuesta === 'alternativa'
            ? 'Miguel propuso una alternativa'
            : 'Miguel no pudo aceptar';

      const solActualizada = {
        ...sol,
        estado: nuevoEstado,
        alternativaMiguel: accion.alternativa || sol.alternativaMiguel || null,
        razonRechazo: accion.razon || null,
        historial: [...(sol.historial || []), { at: estado.reloj, actor: 'miguel', accion: textoHistorial }],
      };

      /* Mensaje para Laura: L-07c aceptada · L-06 alternativa · L-07b sin acuerdo */
      const paraLaura =
        accion.respuesta === 'aceptar'
          ? {
              texto: 'Miguel aceptó tu solicitud.',
              attachment: {
                titulo: 'Ajuste aceptado',
                tono: 'verde',
                fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: sol.propuesta },
                lineas: ['Queda como lo propusiste.'],
              },
            }
          : accion.respuesta === 'alternativa'
            ? {
                texto: 'Miguel propuso algo distinto.',
                attachment: {
                  titulo: 'Alternativa de Miguel',
                  tono: 'azul',
                  comparacion: {
                    actual: sol.fechaOriginal,
                    tuya: sol.propuesta,
                    deMiguel: accion.alternativa,
                  },
                  acciones: [
                    { id: 'aceptar-alternativa', texto: 'Aceptar la alternativa', variante: 'primario' },
                    { id: 'rechazar-alternativa', texto: 'No me sirve' },
                  ],
                  solicitudId: sol.id,
                },
              }
            : {
                texto: 'Miguel no pudo aceptar el ajuste.',
                attachment: {
                  titulo: 'Sin acuerdo',
                  tono: 'rojo',
                  fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: 'sigue igual' },
                  lineas: [accion.razon ? `Razón: ${accion.razon}` : 'Miguel no dejó una razón.'],
                },
              };

      let siguiente = {
        ...estado,
        solicitudes: estado.solicitudes.map((s) => (s.id === sol.id ? solActualizada : s)),
        chat: [...estado.chat, { id: nuevoId('msg'), de: 'ritmo', at: estado.reloj, ...paraLaura }],
        chatMiguel: [
          ...estado.chatMiguel,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: estado.reloj,
            texto:
              accion.respuesta === 'aceptar'
                ? `Le avisé a Laura que aceptaste: ${sol.compromiso}.`
                : accion.respuesta === 'alternativa'
                  ? 'Le mandé tu alternativa a Laura. Te aviso cuando responda.'
                  : 'Le avisé a Laura que no pudiste aceptar.',
          },
        ],
      };

      // C7: un acuerdo de "proteger tiempo de foco" mueve el Dot
      if (accion.respuesta === 'aceptar' && sol.tipo === 'foco') {
        siguiente = reducer(siguiente, {
          type: 'DOT_SET',
          estado: 'concentracion',
          razon: 'Miguel aceptó proteger tu tiempo de foco',
        });
      }

      return anotar(siguiente, `Miguel respondió: ${textoHistorial.toLowerCase()}`);
    }

    /* Laura responde a la alternativa: L-07 acordada · L-07d sin acuerdo */
    case 'LAURA_RESUELVE_ALTERNATIVA': {
      const sol = estado.solicitudes.find((s) => s.id === accion.id);
      if (!sol) return estado;

      const nuevoEstado = accion.acepta ? 'acordada' : 'rechazo_alt';
      const solActualizada = {
        ...sol,
        estado: nuevoEstado,
        historial: [
          ...(sol.historial || []),
          {
            at: estado.reloj,
            actor: 'laura',
            accion: accion.acepta ? 'Aceptaste la alternativa' : 'Dijiste que la alternativa no te sirve',
          },
        ],
      };

      let siguiente = {
        ...estado,
        solicitudes: estado.solicitudes.map((s) => (s.id === sol.id ? solActualizada : s)),
        chat: [
          ...estado.chat,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: estado.reloj,
            texto: accion.acepta ? 'Listo, quedó acordado con Miguel.' : 'Listo. Le avisé que la alternativa no te sirve.',
            attachment: accion.acepta
              ? {
                  titulo: 'Acuerdo',
                  tono: 'verde',
                  fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: sol.alternativaMiguel },
                  lineas: ['Es lo que queda en firme.'],
                }
              : {
                  titulo: 'Sin acuerdo',
                  tono: 'rojo',
                  fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: 'sigue igual' },
                  lineas: ['Nada cambió. Puedes volver a pedir un ajuste cuando quieras.'],
                },
          },
        ],
        chatMiguel: [
          ...estado.chatMiguel,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: estado.reloj,
            texto: accion.acepta
              ? `Laura aceptó tu alternativa: ${sol.compromiso} · ${sol.alternativaMiguel}.`
              : 'Laura dice que tu alternativa no le sirve. No hubo acuerdo.',
          },
        ],
      };

      if (accion.acepta && sol.tipo === 'foco') {
        siguiente = reducer(siguiente, {
          type: 'DOT_SET',
          estado: 'concentracion',
          razon: 'Acordaste con Miguel proteger tu tiempo de foco',
        });
      }

      return anotar(siguiente, accion.acepta ? 'Laura aceptó la alternativa · acordada' : 'Laura rechazó la alternativa');
    }

    /* C3: cancelar la quita de la bandeja de Miguel. No queda estado "cancelada" visible para él. */
    case 'SOLICITUD_CANCELAR':
      return anotar(
        {
          ...estado,
          solicitudes: estado.solicitudes.map((s) =>
            s.id === accion.id
              ? {
                  ...s,
                  estado: 'cancelada',
                  visibleParaMiguel: false,
                  historial: [...(s.historial || []), { at: estado.reloj, actor: 'laura', accion: 'Cancelaste la solicitud' }],
                }
              : s,
          ),
        },
        'Laura canceló una solicitud · desaparece para Miguel',
      );

    default:
      return estado;
  }
}

/* Selectores que usan varias vistas */
export const solicitudesDeMiguel = (estado) =>
  estado.solicitudes.filter((s) => s.estado !== 'cancelada' && s.visibleParaMiguel !== false);

export const pendientesDeMiguel = (estado) =>
  solicitudesDeMiguel(estado).filter((s) => s.estado === 'pendiente');
