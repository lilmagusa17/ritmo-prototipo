/* Slack simulado · vista de Miguel.
   OM-01 bienvenida (125:16298) · M-00 inicio (105:10934) · M-01 solicitud recibida (105:11193)
   M-01b recordatorio (105:11397) · el resto del flujo vive en el panel derecho.

   C1: cada solicitud dice "Laura pide…", nunca "alguien de tu equipo".
   C3: una solicitud cancelada desaparece de aquí; no hay pantalla de cancelación. */

import { useState } from 'react';
import SlackShell from '../components/SlackShell.jsx';
import { Mensaje, Attachment, Acciones, BotonSlack, DiaSeparador } from '../components/Mensaje.jsx';
import FechaCambio from '../components/FechaCambio.jsx';
import PanelRespuesta from '../flows/respuesta/PanelRespuesta.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { solicitudesDeMiguel, pendientesDeMiguel } from '../store/reducer.js';
import { HOY, SALTOS_RELOJ, ETIQUETAS_ESTADO } from '../data/mock.js';

const TITULOS_PANEL = {
  'M-02': 'Solicitud de Laura',
  'M-02c': 'Confirmar',
  'M-03': 'Proponer alternativa',
  'M-04': 'No puedo aceptar',
  'M-05': 'Alternativa enviada',
  'M-05b': 'Ajuste aceptado',
  'M-05c': 'Respuesta enviada',
  'M-07': 'Solicitudes del equipo',
};

/* El recordatorio M-01b aparece a partir de las 12:24 (+2 h sin respuesta) */
const horaIndice = (hora) => SALTOS_RELOJ.findIndex((s) => s.hora === hora);

/* Qué fecha queda en firme según el estado (C2: siempre original → algo) */
function destinoDe(s) {
  if (s.estado === 'alternativa' || s.estado === 'acordada') return s.alternativaMiguel || s.propuesta;
  if (s.estado === 'rechazada' || s.estado === 'rechazo_alt') return 'sigue igual';
  return s.propuesta;
}

export default function SlackMiguel() {
  const { estado, dispatch } = useStore();
  const [conv, setConv] = useState({ tipo: 'dm', id: 'ritmo' });
  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';

  const lista = solicitudesDeMiguel(estado);
  const pendientes = pendientesDeMiguel(estado);
  const hayRecordatorio = pendientes.length > 0 && horaIndice(estado.reloj) >= horaIndice('12:24');

  const abrirDetalle = (id) => dispatch({ type: 'PANEL_ABRIR', pantalla: 'M-02', lado: 'miguel', solicitudId: id });
  const abrirLista = () => dispatch({ type: 'PANEL_ABRIR', pantalla: 'M-07', lado: 'miguel', solicitudId: null });

  return (
    <SlackShell
      lado="miguel"
      conversacion={conv}
      onConversacion={setConv}
      tituloPanel={TITULOS_PANEL[estado.panel.pantalla] || 'Solicitudes del equipo'}
      panel={<PanelRespuesta />}
    >
      {esRitmo ? (
        <>
          <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>

          {/* OM-01 · bienvenida, con el copy de C6 */}
          <Mensaje hora="8:40">
            <p>Hola, Miguel. Aquí te llegan las solicitudes de ajuste de tu equipo.</p>
            <Attachment titulo="Qué vas a ver">
              <p>Verás quién envía cada solicitud y solo el compromiso que quiere ajustar.</p>
              <p>No verás su agenda ni sus conversaciones con RITMO.</p>
            </Attachment>
            <Acciones>
              <BotonSlack onClick={abrirLista}>Ver solicitudes del equipo</BotonSlack>
            </Acciones>
          </Mensaje>

          {/* M-00 · sin solicitudes */}
          {lista.length === 0 && (
            <Mensaje hora="9:00">
              <p>No tienes solicitudes pendientes.</p>
              <p style={{ color: '#616061' }}>
                Cuando alguien del equipo pida un ajuste, te llega aquí con su nombre y el compromiso que quiere mover.
              </p>
            </Mensaje>
          )}

          {/* M-01 · una tarjeta por solicitud */}
          {lista.map((s) => {
            const etiqueta = ETIQUETAS_ESTADO[s.estado];
            const pendiente = s.estado === 'pendiente';
            return (
              <Mensaje key={s.id} hora={s.historial?.[0]?.at || estado.reloj}>
                <p>
                  <strong>Laura</strong> pide {s.tipoTitulo.toLowerCase()}.
                </p>
                <Attachment
                  titulo={s.compromiso}
                  tono={pendiente ? 'ambar' : s.estado === 'rechazada' || s.estado === 'rechazo_alt' ? 'rojo' : 'verde'}
                  pie={pendiente ? 'Laura decide si te comparte más. Tú ves solo esto.' : `Estado: ${etiqueta?.texto}`}
                >
                  <FechaCambio etiqueta={s.compromiso} original={s.fechaOriginal} nueva={destinoDe(s)} />
                  {s.nota && <p>“{s.nota}”</p>}
                  <p style={{ color: '#616061' }}>Tarea nueva que choca: {s.tareaNueva}</p>
                </Attachment>
                <Acciones>
                  <BotonSlack variante={pendiente ? 'primario' : 'normal'} onClick={() => abrirDetalle(s.id)}>
                    {pendiente ? 'Responder' : 'Ver detalle'}
                  </BotonSlack>
                </Acciones>
              </Mensaje>
            );
          })}

          {/* M-01b · recordatorio a las 12:24 */}
          {hayRecordatorio && (
            <Mensaje hora="12:24">
              <p>
                Recordatorio: {pendientes.length === 1 ? 'una solicitud lleva' : `${pendientes.length} solicitudes llevan`}{' '}
                2 horas sin respuesta.
              </p>
              <Attachment titulo="Pendiente de tu respuesta" tono="ambar">
                {pendientes.map((s) => (
                  <p key={s.id}>
                    Laura · {s.tipoTitulo} · {s.compromiso}
                  </p>
                ))}
              </Attachment>
              <Acciones>
                <BotonSlack variante="primario" onClick={() => abrirDetalle(pendientes[0].id)}>
                  Responder ahora
                </BotonSlack>
              </Acciones>
            </Mensaje>
          )}

          {/* Confirmaciones de RITMO para Miguel (M-06 / M-06b) */}
          {estado.chatMiguel.map((m) => (
            <Mensaje key={m.id} hora={m.at}>
              <p>{m.texto}</p>
            </Mensaje>
          ))}
        </>
      ) : (
        <>
          <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>
          <Mensaje autor="camila" hora="9:12">
            <p>Buenos días 👋 Dejo aquí el avance de la semana.</p>
          </Mensaje>
        </>
      )}
    </SlackShell>
  );
}
