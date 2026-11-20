/* C4 · Lógica del chat, compartida por Slack y la app móvil.
   El hilo vive en el store, así que la misma conversación se ve en las dos superficies.

   RITMO "escribe" 600–900 ms antes de responder, para que la respuesta no aparezca
   de golpe y el participante note que es una conversación. */

import { useCallback } from 'react';
import { useStore } from '../../store/StoreProvider.jsx';
import { detectarIntencion, responder } from '../../data/intents.js';
import { ESTADOS_DOT, dotPorId } from '../../data/mock.js';

const DEMORA_MIN = 600;
const DEMORA_MAX = 900;

export default function useChatRitmo() {
  const { estado, dispatch } = useStore();

  const enviar = useCallback(
    (texto) => {
      const limpio = (texto || '').trim();
      if (!limpio) return;

      dispatch({ type: 'CHAT_PUSH', mensaje: { de: 'laura', at: estado.reloj, texto: limpio } });
      dispatch({ type: 'CHAT_ESCRIBIENDO', valor: true });

      const intencion = detectarIntencion(limpio);
      const demora = DEMORA_MIN + Math.random() * (DEMORA_MAX - DEMORA_MIN);

      setTimeout(() => {
        const r = responder(intencion, estado);
        dispatch({ type: 'CHAT_ESCRIBIENDO', valor: false });
        dispatch({
          type: 'CHAT_PUSH',
          mensaje: {
            de: 'ritmo',
            at: estado.reloj,
            texto: r.texto,
            attachment: r.attachment || null,
            chips: r.chips || null,
          },
        });
        // Algunas intenciones abren directamente el panel de solicitud (C4)
        if (r.efecto === 'abrir-solicitud') {
          dispatch({ type: 'BORRADOR_SET', borrador: { tipo: null } });
          dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-02', lado: 'laura', solicitudId: null });
        }
      }, demora);
    },
    [dispatch, estado],
  );

  /* Botones que vienen dentro de una respuesta de RITMO */
  const accion = useCallback(
    (accionId, solicitudId) => {
      if (accionId === 'nada') return;

      if (accionId === 'organizar-dia') return enviar('organiza mi día');
      if (accionId === 'cambiar-orden') return enviar('cambiar el orden del día');
      if (accionId === 'ver-entregas') return enviar('mis entregas de la semana');
      if (accionId === 'me-sirve') {
        dispatch({
          type: 'CHAT_PUSH',
          mensaje: { de: 'ritmo', at: estado.reloj, texto: 'Listo, lo dejo así. Te aviso cuando empiece tu bloque de foco.' },
        });
        return;
      }

      if (accionId === 'abrir-solicitud') {
        dispatch({ type: 'BORRADOR_SET', borrador: { tipo: null } });
        dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-02', lado: 'laura', solicitudId: null });
        return;
      }

      if (accionId === 'ver-mis-solicitudes') {
        dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-08', lado: 'laura', solicitudId: null });
        return;
      }

      /* L-11b · Laura mantiene el color que RITMO propuso */
      if (accionId === 'mantener-dot') {
        const info = dotPorId(estado.dot.estado);
        const hasta = estado.dot.hasta;
        dispatch({
          type: 'CHAT_PUSH',
          mensaje: {
            de: 'ritmo',
            at: estado.reloj,
            texto: hasta
              ? `Listo, lo dejo en ${info.nombre} hasta las ${hasta}.`
              : `Listo, lo dejo en ${info.nombre}.`,
            attachment: {
              titulo: 'Tu RITMO Dot',
              pie: 'Tu equipo solo ve el color, no la razón.',
              dot: estado.dot.estado,
              acciones: [{ id: 'cambiar-color-dot', texto: 'Cambiar color' }],
            },
          },
        });
        return;
      }

      /* L-11c · Laura elige otro color a mano */
      if (accionId === 'cambiar-color-dot') {
        dispatch({
          type: 'CHAT_PUSH',
          mensaje: {
            de: 'ritmo',
            at: estado.reloj,
            texto: '¿De qué color lo pongo?',
            attachment: {
              titulo: 'Cambiar el color',
              pie: 'Tu equipo solo ve el color, no la razón.',
              acciones: ESTADOS_DOT.map((e) => ({ id: `dot-${e.id}`, texto: e.nombre })),
            },
          },
        });
        return;
      }

      if (accionId.startsWith('dot-')) {
        const estadoDot = accionId.replace('dot-', '');
        if (estadoDot === estado.dot.estado) return; // ya está en ese color
        dispatch({
          type: 'DOT_SET',
          estado: estadoDot,
          razon: estadoDot === 'recargando' ? 'tomaste una pausa de 10 minutos' : 'lo cambiaste desde el chat',
        });
        return;
      }

      /* Respuestas a la alternativa de Miguel (L-06).
         El mensaje viejo sigue en el hilo, así que los botones podrían pulsarse otra vez:
         solo valen mientras la solicitud siga esperando respuesta de Laura. */
      if (accionId === 'aceptar-alternativa' || accionId === 'rechazar-alternativa') {
        const sol = estado.solicitudes.find((s) => s.id === solicitudId);
        if (!sol || sol.estado !== 'alternativa') return;
        dispatch({
          type: 'LAURA_RESUELVE_ALTERNATIVA',
          id: solicitudId,
          acepta: accionId === 'aceptar-alternativa',
        });
      }
    },
    [dispatch, enviar, estado.reloj, estado.solicitudes, estado.dot],
  );

  return { enviar, accion, escribiendo: estado.ritmoEscribiendo, hilo: estado.chat };
}
