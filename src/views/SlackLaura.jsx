/* Slack simulado · vista de Laura.
   L-00 Inicio (85:6269) · L-01 aviso de choque (68:5373) · L-01b "Ahora no" (85:6503)
   El panel derecho lleva el flujo de solicitud (fase 2). El composer responde en la fase 4. */

import { useState } from 'react';
import SlackShell from '../components/SlackShell.jsx';
import { Mensaje, Attachment, Acciones, BotonSlack, DiaSeparador } from '../components/Mensaje.jsx';
import FechaCambio, { ComparacionTres } from '../components/FechaCambio.jsx';
import PanelSolicitud from '../flows/solicitud/PanelSolicitud.jsx';
import PanelMisSolicitudes from '../flows/solicitud/PanelMisSolicitudes.jsx';
import useChatRitmo from '../flows/chat/useChatRitmo.js';
import { useStore } from '../store/StoreProvider.jsx';
import {
  AGENDA_HOY,
  HOY,
  COMPROMISOS,
  TAREA_NUEVA,
  SALTOS_RELOJ,
  CODIGO_VINCULO,
  dotPorId,
} from '../data/mock.js';

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

function ComposerLaura({ onEnviar }) {
  const [texto, setTexto] = useState('');
  const enviar = () => {
    if (!texto.trim()) return;
    onEnviar(texto);
    setTexto('');
  };

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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          aria-label="Escribe un mensaje a RITMO"
        />
        <div className="composer-pie">
          <span style={{ color: '#616061', fontSize: 12 }}>Enter para enviar</span>
          <button className="composer-enviar" disabled={!texto.trim()} onClick={enviar}>
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}

/* Mensajes del hilo: los escribe Laura, RITMO, o los produce el flujo de solicitud */
export function MensajeDeStore({ mensaje, onAccion, onChip }) {
  const a = mensaje.attachment;
  return (
    <Mensaje autor={mensaje.de} hora={mensaje.at}>
      {mensaje.texto && <p>{mensaje.texto}</p>}
      {a && (
        <Attachment titulo={a.titulo} tono={a.tono} pie={a.pie}>
          {/* C7 · el color del Dot, con su nombre al lado: nunca solo el color */}
          {a.dot && (
            <p>
              <span className="bolita-slack" style={{ background: dotPorId(a.dot).color }} aria-hidden="true" />
              <strong>{dotPorId(a.dot).nombre}</strong>
            </p>
          )}
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
      {/* Los chips envían el mensaje por la participante: no hace falta escribir (C4) */}
      {mensaje.chips && (
        <div className="chips">
          {mensaje.chips.map((c) => (
            <button key={c.texto} className="chip" onClick={() => onChip(c.envia)}>
              {c.texto}
            </button>
          ))}
        </div>
      )}
    </Mensaje>
  );
}

/* Onboarding de Laura en Slack (T1).
   O-01 Bienvenida (125:15167) → O-02 Conecta tu app con código (125:15360)
   · O-02b código vencido (125:15711) → O-03 App vinculada (125:16071)

   El código es el mismo que pide APP-01 en el teléfono: las dos pantallas se
   enlazan por ahí, así el participante vive la vinculación de verdad. */
function OnboardingLaura() {
  const { estado, dispatch } = useStore();
  const paso = estado.onboarding.slackLaura;
  const [vencido, setVencido] = useState(false);
  const ir = (p) => dispatch({ type: 'ONBOARDING_SET', superficie: 'slackLaura', paso: p });

  return (
    <>
      <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>

      {/* O-01 · bienvenida. Bullets de C6: nada de promesas de anonimato */}
      <Mensaje hora="8:55">
        <p>Hola, Laura. Soy RITMO. Te ayudo a organizar tu día y a pedir un ajuste cuando algo no cabe.</p>
        <Attachment titulo="Cómo trabajo contigo">
          <p>Comparo tus tareas nuevas con tu agenda.</p>
          <p>Tu agenda y este chat son solo tuyos.</p>
          <p>Miguel solo ve lo que tú decidas enviarle, con tu nombre.</p>
          <p>Nada se envía sin que lo confirmes.</p>
        </Attachment>
        {paso === 'bienvenida' && (
          <Acciones>
            <BotonSlack variante="primario" onClick={() => ir('codigo')}>
              Conectar mi teléfono
            </BotonSlack>
          </Acciones>
        )}
      </Mensaje>

      {/* O-02 · código para vincular · O-02b · código vencido */}
      {paso !== 'bienvenida' && (
        <Mensaje hora="8:56">
          {vencido ? (
            <p>Ese código venció. Aquí tienes uno nuevo:</p>
          ) : (
            <p>Abre RITMO en tu teléfono y escribe este código:</p>
          )}
          <Attachment titulo="Código para vincular" pie="El código vence en 5 minutos.">
            <p className="codigo-slack">{vencido ? '8 1 3 5' : CODIGO_VINCULO}</p>
            <p>
              Lo escribes en la app del teléfono ·{' '}
              <a href="#/app" target="_blank" rel="noreferrer">
                abrir la app
              </a>
            </p>
          </Attachment>
          {paso === 'codigo' && !vencido && (
            <Acciones>
              <BotonSlack onClick={() => setVencido(true)}>Pedir otro código</BotonSlack>
            </Acciones>
          )}
        </Mensaje>
      )}

      {/* O-03 · app vinculada */}
      {paso === 'vinculada' && (
        <Mensaje hora="8:58">
          <p>Listo, tu teléfono quedó vinculado.</p>
          <Attachment titulo="App vinculada" tono="verde" pie="Ves el mismo chat en Slack y en el teléfono.">
            <p>
              <strong>Teléfono de Laura</strong> · conectado
            </p>
          </Attachment>
          <Acciones>
            <BotonSlack variante="primario" onClick={() => ir('listo')}>
              Empezar
            </BotonSlack>
          </Acciones>
        </Mensaje>
      )}
    </>
  );
}

/* Conversaciones que no son RITMO. Están para que el workspace se sienta real,
   y sobre todo para que quede claro que hablar con Miguel no es hablar con RITMO. */
function ConversacionDemo({ conv }) {
  if (conv.tipo === 'canal') {
    return (
      <>
        <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>
        <Mensaje autor="camila" hora="9:12">
          <p>Buenos días 👋 Dejo aquí el avance de la semana en #{conv.id}.</p>
        </Mensaje>
        <Mensaje autor="miguel" hora="9:20">
          <p>Gracias, Camila. Lo reviso después del daily.</p>
        </Mensaje>
      </>
    );
  }

  if (conv.id === 'miguel') {
    return (
      <>
        <DiaSeparador>Ayer · lun 9 nov</DiaSeparador>
        <Mensaje autor="miguel" hora="16:40">
          <p>Laura, ¿alcanzas a dejar el informe antes del jueves?</p>
        </Mensaje>
        <Mensaje autor="laura" hora="16:52">
          <p>Voy con eso. Si se complica te aviso.</p>
        </Mensaje>
        <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>
        <Mensaje autor="ritmo" hora="9:00">
          <p>Este es tu chat directo con Miguel. Yo no leo lo que escriben aquí.</p>
          <Attachment titulo="Los ajustes no se piden por aquí" pie="En el prototipo solo funciona el chat con RITMO.">
            <p>Para pedir un ajuste, escríbeme en el chat de RITMO: ahí revisas qué verá Miguel antes de enviar nada.</p>
          </Attachment>
        </Mensaje>
      </>
    );
  }

  return (
    <>
      <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>
      <Mensaje autor="camila" hora="10:05">
        <p>Hola Laura, te paso el Reporte de ventas para Comercial. Lo necesito el jueves 12.</p>
      </Mensaje>
      <Mensaje autor="ritmo" hora="10:12">
        <p>Este es tu chat directo con Camila. Yo no leo lo que escriben aquí.</p>
      </Mensaje>
    </>
  );
}

export default function SlackLaura() {
  const { estado, dispatch } = useStore();
  const { enviar, accion, escribiendo } = useChatRitmo();
  const [conv, setConv] = useState({ tipo: 'dm', id: 'ritmo' });
  const informe = COMPROMISOS[0];
  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';

  const abrirSolicitud = () => {
    dispatch({ type: 'BORRADOR_SET', borrador: { tipo: null } });
    dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-02', lado: 'laura', solicitudId: null });
  };

  const abrirMisSolicitudes = () =>
    dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-08', lado: 'laura', solicitudId: null });

  const pendientes = estado.solicitudes.filter((s) => s.estado === 'pendiente');
  const hayRecordatorio = pendientes.length > 0 && horaIndice(estado.reloj) >= horaIndice('12:24');
  const esMisSolicitudes = PANTALLAS_MIS.includes(estado.panel.pantalla);
  const onboardingListo = estado.onboarding.slackLaura === 'listo';

  return (
    <SlackShell
      lado="laura"
      conversacion={conv}
      onConversacion={setConv}
      tituloPanel={TITULOS_PANEL[estado.panel.pantalla] || 'Pedir un ajuste'}
      panel={esMisSolicitudes ? <PanelMisSolicitudes /> : <PanelSolicitud />}
      composer={esRitmo && onboardingListo ? <ComposerLaura onEnviar={enviar} /> : null}
      pestanas={
        /* Cabecera del Figma (L-00): el participante tiene siempre a la vista
           por dónde se pide un ajuste y dónde ve su estado. */
        onboardingListo
          ? [
              {
                id: 'mensajes',
                texto: 'Mensajes',
                activa: !(estado.panel.abierto && estado.panel.lado === 'laura' && esMisSolicitudes),
                onClick: () => dispatch({ type: 'PANEL_CERRAR' }),
              },
              {
                id: 'mis-solicitudes',
                texto: 'Mis solicitudes',
                activa: estado.panel.abierto && estado.panel.lado === 'laura' && esMisSolicitudes,
                onClick: abrirMisSolicitudes,
              },
            ]
          : []
      }
      accesos={
        onboardingListo
          ? [
              { id: 'pedir', glifo: '＋', titulo: 'Solicitar ajuste', sub: 'Pide mover un plazo u otro ajuste', onClick: abrirSolicitud },
              { id: 'mis', glifo: '☰', titulo: 'Mis solicitudes', sub: 'Estado y acuerdos', onClick: abrirMisSolicitudes },
            ]
          : []
      }
      scrollSenal={
        /* ×2: así un mensaje nuevo nunca empata con el fin del "está escribiendo…" */
        estado.chat.length * 2 + (escribiendo ? 1 : 0) + (onboardingListo ? 1 : 0)
      }
    >
      {esRitmo && !onboardingListo ? (
        <OnboardingLaura />
      ) : esRitmo ? (
        <>
          <DiaSeparador>Hoy, {HOY.largo}</DiaSeparador>

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
              <BotonSlack onClick={() => enviar('organiza mi día')}>Organizar mi día</BotonSlack>
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
            <MensajeDeStore key={m.id} mensaje={m} onAccion={accion} onChip={enviar} />
          ))}

          {escribiendo && (
            <p className="escribiendo" role="status">
              RITMO está escribiendo…
            </p>
          )}

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
        <ConversacionDemo conv={conv} />
      )}
    </SlackShell>
  );
}
