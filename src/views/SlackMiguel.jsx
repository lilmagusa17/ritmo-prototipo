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
import { HOY, SALTOS_RELOJ, ETIQUETAS_ESTADO, ETIQUETAS_ESTADO_MIGUEL } from '../data/mock.js';

const TITULOS_PANEL = {
  'M-02': 'Solicitud de ajuste',
  'M-02c': 'Confirmar',
  'M-03': 'Proponer alternativa',
  'M-04': 'Rechazar la solicitud',
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


/* M-07 · solicitudes del equipo, a pantalla completa como en el Figma (114:15381).
   C3: una solicitud cancelada no llega hasta aquí, desaparece de la vista de Miguel. */
function TablaSolicitudes({ lista, onAbrir }) {
  if (lista.length === 0) {
    return (
      <div className="tabla-vacia">
        <h2>Solicitudes del equipo</h2>
        <p>Todavía no hay solicitudes.</p>
        <p className="tabla-sub">
          Cuando alguien del equipo pida un ajuste, te llega aquí con su nombre y el compromiso que quiere mover.
        </p>
      </div>
    );
  }

  return (
    <div className="tabla-pantalla">
      <h2>Solicitudes del equipo</h2>
      <p className="tabla-sub">Solicitudes de ajuste y sus acuerdos. Las pendientes aparecen primero.</p>

      <table className="tabla-solicitudes">
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Quién</th>
            <th scope="col">Compromiso</th>
            <th scope="col">Estado</th>
            <th scope="col"><span className="sr-only">Abrir</span></th>
          </tr>
        </thead>
        <tbody>
          {lista.map((s) => {
            const et = ETIQUETAS_ESTADO_MIGUEL[s.estado] || ETIQUETAS_ESTADO[s.estado];
            return (
              <tr key={s.id}>
                <td className="col-fecha">{s.fecha || `${HOY.corto}, ${s.historial?.[0]?.at || ''}`}</td>
                <td>Laura</td>
                <td className="col-compromiso">{s.compromiso}</td>
                <td>
                  <span className={`chip-estado chip-estado--${et?.tono}`}>
                    <span aria-hidden="true">{et?.glifo}</span> {et?.texto}
                  </span>
                </td>
                <td className="col-abrir">
                  <button
                    className="btn-slack"
                    onClick={() => onAbrir(s.id)}
                    aria-label={`Abrir la solicitud de Laura sobre ${s.compromiso}`}
                  >
                    {s.estado === 'pendiente' ? 'Responder' : 'Ver'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SlackMiguel() {
  const { estado, dispatch } = useStore();
  const [conv, setConv] = useState({ tipo: 'dm', id: 'ritmo' });
  /* La pestaña "Solicitudes del equipo" cambia el área principal, no abre el panel:
     en el Figma M-07 ocupa toda la pantalla y el detalle sí va en el panel. */
  const [vista, setVista] = useState('mensajes');
  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';

  const lista = solicitudesDeMiguel(estado);
  const pendientes = pendientesDeMiguel(estado);
  const hayRecordatorio = pendientes.length > 0 && horaIndice(estado.reloj) >= horaIndice('12:24');

  const abrirDetalle = (id) => dispatch({ type: 'PANEL_ABRIR', pantalla: 'M-02', lado: 'miguel', solicitudId: id });
  const abrirLista = () => {
    dispatch({ type: 'PANEL_CERRAR' });
    setVista('equipo');
  };

  return (
    <SlackShell
      lado="miguel"
      conversacion={conv}
      onConversacion={setConv}
      tituloPanel={TITULOS_PANEL[estado.panel.pantalla] || 'Solicitudes del equipo'}
      panel={<PanelRespuesta />}
      pestanas={[
        {
          id: 'mensajes',
          texto: 'Mensajes',
          activa: vista === 'mensajes',
          onClick: () => setVista('mensajes'),
        },
        {
          id: 'equipo',
          texto: 'Solicitudes del equipo',
          activa: vista === 'equipo',
          onClick: abrirLista,
        },
      ]}
      accesos={
        vista === 'mensajes'
          ? [
              {
                id: 'pendiente',
                glifo: '◷',
                titulo: 'Pendientes de responder',
                sub:
                  pendientes.length > 0
                    ? `${pendientes.length} sin decisión · Laura · ${pendientes[0].compromiso}`
                    : 'Ninguna sin decisión',
                onClick: () => (pendientes.length > 0 ? abrirDetalle(pendientes[0].id) : abrirLista()),
              },
              {
                id: 'equipo',
                glifo: '☰',
                titulo: 'Solicitudes del equipo',
                sub: 'Estado y acuerdos',
                onClick: abrirLista,
              },
            ]
          : []
      }
      scrollSenal={estado.chatMiguel.length + lista.length}
    >
      {esRitmo && vista === 'equipo' ? (
        <TablaSolicitudes lista={lista} onAbrir={abrirDetalle} />
      ) : esRitmo ? (
        <>
          <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>

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
                  {s.tareaNueva && <p style={{ color: '#616061' }}>Tarea nueva que choca: {s.tareaNueva}</p>}
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
          <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>
          {conv.tipo === 'dm' && conv.id === 'laura' ? (
            <>
              <Mensaje autor="miguel" hora="8:30">
                <p>Buenos días, Laura. ¿Cómo vas con el informe?</p>
              </Mensaje>
              <Mensaje autor="ritmo" hora="9:00">
                <p>Este es tu chat directo con Laura. Las solicitudes de ajuste no llegan por aquí.</p>
                <Attachment titulo="Dónde llegan las solicitudes" pie="En el prototipo solo funciona el chat con RITMO.">
                  <p>Cuando Laura envía una, te la paso en el chat de RITMO con su nombre y el compromiso.</p>
                </Attachment>
              </Mensaje>
            </>
          ) : (
            <Mensaje autor="camila" hora="9:12">
              <p>Buenos días 👋 Dejo aquí el avance de la semana.</p>
            </Mensaje>
          )}
        </>
      )}
    </SlackShell>
  );
}
