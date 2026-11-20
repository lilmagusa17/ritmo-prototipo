/* RITMO · reducer único.
   Regla de CLAUDE.md §7: RITMO nunca cambia nada por su cuenta. Solo Laura, Miguel
   y el moderador disparan acciones. */

import { estadoInicial, conHistorialEjemplo } from './estadoInicial.js';
import { dotPorId, TAREA_NUEVA, COMPROMISOS } from '../data/mock.js';

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

    /* Un clic deja todo listo para T0 del protocolo v2: desde cero, sin onboarding,
       con el historial de ejemplo, reloj 9:00 y sin aviso de choque todavía. */
    case 'PREPARAR_SESION': {
      const base = {
        ...estadoInicial(),
        onboarding: { slackLaura: 'listo', slackMiguel: 'listo', app: 'listo' },
        appVinculada: true,
        dotConfigurado: true,
        reloj: '9:00',
        avisoChoque: 'oculto',
        flags: { errorEnvioProximo: false, codigoVencidoProximo: false },
      };
      return anotar(conHistorialEjemplo(base), 'Sesión preparada (protocolo v2)');
    }

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

    case 'SET_RELOJ': {
      let chat = estado.chat;
      const pendientes = estado.solicitudes.filter((s) => s.estado === 'pendiente');

      /* L-05b · a las 12:24 RITMO recuerda en el hilo lo que sigue sin respuesta */
      if (accion.hora === '12:24' && pendientes.length > 0 && !chat.some((m) => m.marca === 'L-05b')) {
        chat = [
          ...chat,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: accion.hora,
            marca: 'L-05b',
            chip: 'pendiente',
            texto:
              pendientes.length === 1
                ? 'Tu solicitud lleva 2 horas sin respuesta.'
                : `Tus ${pendientes.length} solicitudes llevan 2 horas sin respuesta.`,
            attachment: {
              etiqueta: 'Sigue pendiente',
              tono: 'ambar',
              fecha: {
                etiqueta: pendientes[0].compromiso,
                original: pendientes[0].fechaOriginal,
                nueva: pendientes[0].propuesta,
              },
              pie: 'Tu agenda no ha cambiado.',
              acciones: [{ id: 'ver-mis-solicitudes', texto: 'Ver mis solicitudes' }],
            },
          },
        ];
      }

      return anotar({ ...estado, reloj: accion.hora, chat }, `Reloj → ${accion.hora}${accion.nota ? ` · ${accion.nota}` : ''}`);
    }

    case 'SET_FLAG':
      return anotar(
        { ...estado, flags: { ...estado.flags, [accion.flag]: accion.valor } },
        `Flag ${accion.flag} = ${accion.valor ? 'on' : 'off'}`,
      );

    case 'LOG':
      return anotar(estado, accion.texto);

    /* ---------- RITMO Dot (C7) ----------
       Un solo cambio produce las tres señales a la vez:
       1. la vista #/dot cambia de color (lee estado.dot)
       2. RITMO avisa en el DM de Laura con el patrón L-11 y sus botones
       3. el teléfono muestra el banner push y actualiza la tarjeta de APP-04 */
    case 'DOT_SET': {
      const info = dotPorId(accion.estado);
      const hasta = accion.hasta || null;

      const pregunta =
        accion.estado === 'apagado'
          ? 'Tu equipo ya no ve ningún color.'
          : hasta
            ? `¿Lo mantengo así hasta las ${hasta}?`
            : '';

      const acciones =
        accion.estado === 'apagado'
          ? [{ id: 'dot-disponible', texto: 'Volver a Disponible', variante: 'primario' }]
          : accion.estado === 'recargando'
            ? [
                { id: 'dot-disponible', texto: 'Terminé la pausa', variante: 'primario' },
                { id: 'cambiar-color-dot', texto: 'Cambiar color' },
              ]
            : [
                { id: 'mantener-dot', texto: 'Sí, mantener', variante: 'primario' },
                { id: 'cambiar-color-dot', texto: 'Cambiar color' },
                { id: 'dot-apagado', texto: 'Apagar' },
              ];

      const base = {
        ...estado,
        dot: { ...estado.dot, estado: accion.estado, razon: accion.razon || '', hasta },
        chat: [
          ...estado.chat,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: estado.reloj,
            texto: `Tu Dot pasó a ${info.nombre}${accion.razon ? ` porque ${accion.razon}` : ''}. ${pregunta}`.trim(),
            attachment: {
              titulo: 'Tu RITMO Dot',
              pie: 'Tu equipo solo ve el color, no la razón.',
              dot: accion.estado,
              lineas: hasta ? [`Hasta las ${hasta}, salvo que lo cambies tú.`] : [],
              acciones,
            },
          },
        ],
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
    case 'PANEL_ABRIR': {
      const panel = {
        abierto: true,
        pantalla: accion.pantalla,
        lado: accion.lado || 'laura',
        solicitudId: accion.solicitudId ?? estado.panel.solicitudId ?? null,
      };

      /* H2 del protocolo mide cuánto tarda Miguel desde que abre el detalle hasta
         que responde (≤ 90 s). Guardamos el momento real en la solicitud y dejamos
         la apertura en el log, para poder cronometrarlo después. */
      if (panel.lado === 'miguel' && panel.pantalla === 'M-02' && panel.solicitudId) {
        const sol = estado.solicitudes.find((s) => s.id === panel.solicitudId);
        if (sol) {
          return anotar(
            {
              ...estado,
              panel,
              solicitudes: estado.solicitudes.map((s) =>
                s.id === sol.id ? { ...s, abiertoM02En: Date.now() } : s,
              ),
            },
            `Miguel abrió M-02 · ${sol.compromiso}`,
          );
        }
      }

      return { ...estado, panel };
    }

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
    /* El aviso entra al hilo como un mensaje más: así llega en orden, debajo de lo
       último que escribió Laura, y el hilo baja solo hasta él. */
    case 'AVISO_CHOQUE': {
      const yaEsta = (marca) => estado.chat.some((m) => m.marca === marca);
      let chat = estado.chat;

      if (accion.estadoAviso === 'visible' && !yaEsta('L-01')) {
        chat = [
          ...chat,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: estado.reloj,
            marca: 'L-01',
            texto: `Llegó ${TAREA_NUEVA.titulo} (${TAREA_NUEVA.fecha}), que pidió ${TAREA_NUEVA.pedidaPor}. Se cruza con ${COMPROMISOS[0].titulo}, también para el jueves.`,
            attachment: {
              etiqueta: 'Se cruza con',
              tono: 'ambar',
              lineas: [COMPROMISOS[0].titulo, `Entrega: ${COMPROMISOS[0].fecha}`],
              pie: 'Solo tú ves este aviso. Miguel no sabe nada hasta que tú envíes una solicitud.',
              acciones: [
                { id: 'pedir-ajuste-aviso', texto: 'Pedir ajuste', variante: 'primario' },
                { id: 'aviso-ahora-no', texto: 'Ahora no' },
              ],
            },
          },
        ];
      }

      if (accion.estadoAviso === 'postergado' && !yaEsta('L-01b')) {
        chat = [
          ...chat,
          {
            id: nuevoId('msg'),
            de: 'ritmo',
            at: estado.reloj,
            marca: 'L-01b',
            texto: 'Listo, no hago nada. El choque sigue ahí por si quieres volver.',
            attachment: {
              etiqueta: 'Sigue pendiente',
              fecha: {
                etiqueta: 'Las dos entregas',
                original: `${COMPROMISOS[0].titulo} · ${COMPROMISOS[0].fechaCorta}`,
                nueva: `${TAREA_NUEVA.titulo} · ${TAREA_NUEVA.fechaCorta}`,
              },
              pie: 'Miguel no recibió ningún aviso.',
              acciones: [{ id: 'abrir-solicitud', texto: 'Pedir un ajuste' }],
            },
          },
        ];
      }

      /* "Ocultar aviso" lo quita del hilo: si no, el mensaje se quedaba ahí */
      if (accion.estadoAviso === 'oculto') {
        chat = chat.filter((m) => m.marca !== 'L-01' && m.marca !== 'L-01b');
      }

      return anotar({ ...estado, avisoChoque: accion.estadoAviso, chat }, `Aviso de choque → ${accion.estadoAviso}`);
    }

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
          /* El envío también queda en el hilo, no solo en el panel (Figma L-05) */
          chat: [
            ...estado.chat,
            {
              id: nuevoId('msg'),
              de: 'ritmo',
              at: estado.reloj,
              texto: 'Tu solicitud llegó a Miguel.',
              chip: 'pendiente',
              attachment: {
                etiqueta: 'Lo que enviaste',
                fecha: {
                  etiqueta: accion.solicitud.compromiso,
                  original: accion.solicitud.fechaOriginal,
                  nueva: accion.solicitud.propuesta,
                },
                lineas: [accion.solicitud.tipoTitulo, 'Te aviso aquí mismo cuando responda.'],
                pie: 'Puedes cancelarla mientras Miguel no responda.',
              },
            },
          ],
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
              texto: 'Miguel aceptó tu solicitud. Los demás compromisos siguen igual.',
              chip: 'aceptada',
              attachment: {
                etiqueta: 'Qué cambió',
                tono: 'verde',
                fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: sol.propuesta },
                lineas: ['Queda como lo propusiste.'],
              },
            }
          : accion.respuesta === 'alternativa'
            ? {
                texto: `Miguel propone otra opción para ${sol.compromiso}.`,
                chip: 'alternativa',
                attachment: {
                  etiqueta: 'Compara antes de decidir',
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
                chip: 'rechazada',
                attachment: {
                  etiqueta: 'Qué cambió',
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
            ...(accion.respuesta === 'aceptar'
              ? {
                  texto: 'Aceptaste el ajuste. Se lo avisé a Laura.',
                  chip: 'aceptada',
                  attachment: {
                    etiqueta: 'Qué cambió',
                    tono: 'verde',
                    fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: sol.propuesta },
                  },
                }
              : accion.respuesta === 'alternativa'
                ? {
                    texto: 'Enviaste tu alternativa. Te aviso cuando Laura responda.',
                    chip: 'alternativa',
                    attachment: {
                      etiqueta: 'Tu respuesta',
                      tono: 'azul',
                      fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: accion.alternativa },
                      lineas: [`Alternativa a: ${sol.propuesta}`],
                    },
                  }
                : {
                    texto: 'Le avisé a Laura que no pudiste aceptar.',
                    chip: 'rechazada',
                    attachment: {
                      etiqueta: 'Qué cambió',
                      tono: 'rojo',
                      fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: 'sigue igual' },
                      lineas: [accion.razon ? `Razón que diste: ${accion.razon}` : 'No dejaste una razón.'],
                    },
                  }),
          },
        ],
      };

      // C7: un acuerdo de "proteger tiempo de foco" mueve el Dot
      if (accion.respuesta === 'aceptar' && sol.tipo === 'foco') {
        siguiente = reducer(siguiente, {
          type: 'DOT_SET',
          estado: 'concentracion',
          razon: 'Miguel aceptó proteger tu tiempo de foco',
          hasta: '16:00',
        });
      }

      /* Segundos entre abrir M-02 y responder: la métrica de H2 */
      const segundos = sol.abiertoM02En ? Math.round((Date.now() - sol.abiertoM02En) / 1000) : null;

      return anotar(
        siguiente,
        `Miguel respondió: ${textoHistorial.toLowerCase()}${segundos !== null ? ` · ${segundos} s desde M-02` : ''}`,
      );
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
            texto: accion.acepta
              ? 'Acuerdo entre tú y Miguel. Los demás compromisos siguen igual.'
              : 'Listo. Le avisé que la alternativa no te sirve.',
            chip: accion.acepta ? 'acordada' : 'rechazo_alt',
            attachment: accion.acepta
              ? {
                  etiqueta: 'Qué cambió',
                  tono: 'verde',
                  fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: sol.alternativaMiguel },
                  lineas: ['Es lo que queda en firme.'],
                }
              : {
                  etiqueta: 'Qué cambió',
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
            ...(accion.acepta
              ? {
                  texto: 'Hay acuerdo. Los demás compromisos siguen igual.',
                  chip: 'acordada',
                  attachment: {
                    etiqueta: 'Qué cambió',
                    tono: 'verde',
                    fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: sol.alternativaMiguel },
                  },
                }
              : {
                  texto: 'Laura dice que tu alternativa no le sirve. No hubo acuerdo.',
                  chip: 'rechazo_alt',
                  attachment: {
                    etiqueta: 'Qué cambió',
                    tono: 'rojo',
                    fecha: { etiqueta: sol.compromiso, original: sol.fechaOriginal, nueva: 'sigue igual' },
                  },
                }),
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
