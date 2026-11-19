/* Slack simulado · vista de Laura.
   L-00 Inicio (85:6269) · L-01 aviso de choque (68:5373) · L-01b "Ahora no" (85:6503)
   El panel derecho lleva el flujo de solicitud (fase 2). El composer responde en la fase 4. */

import { useState } from 'react';
import SlackShell from '../components/SlackShell.jsx';
import { Mensaje, Attachment, Acciones, BotonSlack, DiaSeparador } from '../components/Mensaje.jsx';
import FechaCambio, { ComparacionTres } from '../components/FechaCambio.jsx';
import PanelSolicitud from '../flows/solicitud/PanelSolicitud.jsx';
import PanelMisSolicitudes from '../flows/solicitud/PanelMisSolicitudes.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { AGENDA_HOY, HOY, COMPROMISOS, TAREA_NUEVA, SALTOS_RELOJ } from '../data/mock.js';

const TITULOS_PANEL = {
  'L-02': 'Pedir un ajuste',
  'L-03': 'Pedir un ajuste',
  'L-03c': 'Descartar solicitud',
  'L-04': 'Revisar antes de enviar',
  'L-05': 'Solicitud enviada',
  'L-08': 'Mis solicitudes',
  'L-08c': 'Mi solicitud',
  'L-08d': 'Solicitud cancelada',
  'L-09': 'Cancelar solicitud',
  'L-09b': 'Miguel ya respondió',
};

/* Las pantallas de "Mis solicitudes" usan otro panel */
const PANTALLAS_MIS = ['L-08', 'L-08c', 'L-08d', 'L-09', 'L-09b'];

const horaIndice = (hora) => SALTOS_RELOJ.findIndex((s) => s.hora === hora);

function ComposerLaura() {
  const [texto, setTexto] = useState('');
  return (
    <>
      <p className="composer-nota">
        <span aria-hidden="true">🔒</span> Lo que escribes aquí es solo para ti.
      </p>
      <div className="composer-caja">
        <textarea
          placeholder="Escribe un mensaje a RITMO"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Escribe un mensaje a RITMO"
        />
        <div className="composer-pie">
          <span style={{ color: '#616061', fontSize: 12 }}>RITMO empieza a responder en la fase 4</span>
          <button className="composer-enviar" disabled={!texto.trim()}>
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}

/* Mensajes que vienen del store (envíos, respuestas de Miguel, chat de la fase 4) */
function MensajeDeStore({ mensaje, onAccion }) {
  const a = mensaje.attachment;
  return (
    <Mensaje autor={mensaje.de} hora={mensaje.at}>
      {mensaje.texto && <p>{mensaje.texto}</p>}
      {a && (
        <Attachment titulo={a.titulo} tono={a.tono} pie={a.pie}>
          {a.fecha && <FechaCambio etiqueta={a.fecha.etiqueta} original={a.fecha.original} nueva={a.fecha.nueva} />}
          {/* L-06 · fecha actual · tu propuesta · propuesta de Miguel (C2) */}
          {a.comparacion && (
            <ComparacionTres
              actual={a.comparacion.actual}
              tuya={a.comparacion.tuya}
              deMiguel={a.comparacion.deMiguel}
            />
          )}
          {(a.lineas || []).map((l) => (
            <p key={l}>{l}</p>
          ))}
        </Attachment>
      )}
      {a?.acciones && (
        <Acciones>
          {a.acciones.map((b) => (
            <BotonSlack key={b.id} variante={b.variante} onClick={() => onAccion(b.id, a.solicitudId)}>
              {b.texto}
            </BotonSlack>
          ))}
        </Acciones>
      )}
    </Mensaje>
  );
}

function CanalDemo({ nombre }) {
  return (
    <>
      <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>
      <Mensaje autor="camila" hora="9:12">
        <p>Buenos días 👋 Dejo aquí el avance de la semana en #{nombre}.</p>
      </Mensaje>
      <Mensaje autor="miguel" hora="9:20">
        <p>Gracias, Camila. Lo reviso después del daily.</p>
      </Mensaje>
    </>
  );
}

export default function SlackLaura() {
  const { estado, dispatch } = useStore();
  const [conv, setConv] = useState({ tipo: 'dm', id: 'ritmo' });
  const informe = COMPROMISOS[0];
  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';

  const abrirSolicitud = () => {
    dispatch({ type: 'BORRADOR_SET', borrador: { tipo: null } });
    dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-02', lado: 'laura', solicitudId: null });
  };

  const abrirMisSolicitudes = () =>
    dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-08', lado: 'laura', solicitudId: null });

  /* Botones que vienen dentro de un mensaje (L-06: aceptar o rechazar la alternativa) */
  const accionDeMensaje = (accionId, solicitudId) => {
    if (accionId === 'aceptar-alternativa') {
      dispatch({ type: 'LAURA_RESUELVE_ALTERNATIVA', id: solicitudId, acepta: true });
    }
    if (accionId === 'rechazar-alternativa') {
      dispatch({ type: 'LAURA_RESUELVE_ALTERNATIVA', id: solicitudId, acepta: false });
    }
  };

  const pendientes = estado.solicitudes.filter((s) => s.estado === 'pendiente');
  const hayRecordatorio = pendientes.length > 0 && horaIndice(estado.reloj) >= horaIndice('12:24');
  const esMisSolicitudes = PANTALLAS_MIS.includes(estado.panel.pantalla);

  return (
    <SlackShell
      lado="laura"
      conversacion={conv}
      onConversacion={setConv}
      tituloPanel={TITULOS_PANEL[estado.panel.pantalla] || 'Pedir un ajuste'}
      panel={esMisSolicitudes ? <PanelMisSolicitudes /> : <PanelSolicitud />}
      composer={esRitmo ? <ComposerLaura /> : null}
    >
      {esRitmo ? (
        <>
          <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>

          {/* L-00 · inicio */}
          <Mensaje hora="9:00">
            <p>Buenos días, Laura. Este es tu día:</p>
            <Attachment titulo={`Tu agenda · ${HOY.largo}`}>
              {AGENDA_HOY.map((e) => (
                <p key={e.id}>
                  <strong>{e.hora}</strong> · {e.titulo} <span style={{ color: '#616061' }}>({e.duracion})</span>
                </p>
              ))}
            </Attachment>
            <Attachment titulo="Tu próxima entrega" tono="ambar" pie="Solo tú ves esto.">
              <p>
                {informe.titulo} · <strong>{informe.fecha}</strong>
              </p>
            </Attachment>
            <Acciones>
              <BotonSlack onClick={abrirSolicitud}>Pedir un ajuste</BotonSlack>
              <BotonSlack onClick={abrirMisSolicitudes}>Ver mis solicitudes</BotonSlack>
            </Acciones>
          </Mensaje>

          {/* L-01 · aviso de choque */}
          {estado.avisoChoque === 'visible' && (
            <Mensaje hora="10:12">
              <p>Llegó una tarea nueva y choca con algo que ya tienes.</p>
              <Attachment
                titulo="Dos entregas el mismo día"
                tono="ambar"
                pie="Solo tú ves este aviso. Miguel no sabe nada hasta que tú envíes una solicitud."
              >
                <p>
                  <strong>{TAREA_NUEVA.titulo}</strong> · {TAREA_NUEVA.fecha} · lo pidió {TAREA_NUEVA.pedidaPor}
                </p>
                <p>
                  <strong>{informe.titulo}</strong> · {informe.fecha}
                </p>
              </Attachment>
              <Acciones>
                <BotonSlack
                  variante="primario"
                  onClick={() => {
                    dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'atendido' });
                    abrirSolicitud();
                  }}
                >
                  Pedir un ajuste
                </BotonSlack>
                <BotonSlack onClick={() => dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'postergado' })}>
                  Ahora no
                </BotonSlack>
              </Acciones>
            </Mensaje>
          )}

          {/* L-01b · "Ahora no" */}
          {estado.avisoChoque === 'postergado' && (
            <Mensaje hora="10:13">
              <p>Listo, no hago nada. El choque sigue ahí por si quieres volver.</p>
              <Attachment titulo="Sigue pendiente" pie="Miguel no recibió ningún aviso.">
                <FechaCambio
                  etiqueta="Las dos entregas"
                  original={`${informe.titulo} · ${informe.fechaCorta}`}
                  nueva={`${TAREA_NUEVA.titulo} · ${TAREA_NUEVA.fechaCorta}`}
                />
              </Attachment>
              <Acciones>
                <BotonSlack onClick={abrirSolicitud}>Pedir un ajuste</BotonSlack>
                <BotonSlack onClick={() => dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'visible' })}>
                  Ver el aviso otra vez
                </BotonSlack>
              </Acciones>
            </Mensaje>
          )}

          {/* Mensajes del flujo: envíos (L-05), respuestas de Miguel (L-06, L-07x) */}
          {estado.chat.map((m) => (
            <MensajeDeStore key={m.id} mensaje={m} onAccion={accionDeMensaje} />
          ))}

          {/* L-05b · sigue pendiente a las 12:24 */}
          {hayRecordatorio && (
            <Mensaje hora="12:24">
              <p>
                {pendientes.length === 1 ? 'Tu solicitud lleva' : `Tus ${pendientes.length} solicitudes llevan`} 2 horas
                sin respuesta.
              </p>
              <Attachment titulo="Sigue pendiente" tono="ambar" pie="Tu agenda no ha cambiado.">
                {pendientes.map((s) => (
                  <FechaCambio
                    key={s.id}
                    etiqueta={s.compromiso}
                    original={s.fechaOriginal}
                    nueva={s.propuesta}
                  />
                ))}
              </Attachment>
              <Acciones>
                <BotonSlack onClick={abrirMisSolicitudes}>Ver mis solicitudes</BotonSlack>
              </Acciones>
            </Mensaje>
          )}
        </>
      ) : (
        <CanalDemo nombre={conv.id} />
      )}
    </SlackShell>
  );
}
