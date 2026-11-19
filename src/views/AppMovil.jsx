/* App móvil compañera (T1).
   Onboarding APP-01 → APP-00 → APP-02 → APP-03/03a/03b, y luego
   APP-04 Inicio (127:17214) · Chat (C4/C5) · APP-06 Solicitar (149:17951) · APP-07 Historial (149:18037)
   APP-05 Cambiar color (127:17268).

   Copy según C5: "RITMO Dot" (nunca "Indicador RITMO"), "Choques de fechas" (nunca "cruce"),
   y la tarjeta de "Descarga" reemplazada por "Habla con RITMO". */

import { useState } from 'react';
import PhoneFrame from '../components/PhoneFrame.jsx';
import ChatMovil from '../flows/chat/ChatMovil.jsx';
import OnboardingMovil from '../flows/onboarding/OnboardingMovil.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { AGENDA_HOY, COMPROMISOS, HOY, ESTADOS_DOT, dotPorId, ETIQUETAS_ESTADO } from '../data/mock.js';

const TONO_ETIQUETA = {
  pendiente: 'ambar',
  aceptada: 'verde',
  acordada: 'verde',
  alternativa: 'azul',
  rechazada: 'rojo',
  rechazo_alt: 'rojo',
  cancelada: 'neutral',
};

/* APP-05 · cambiar color a mano */
function CambiarColor({ onVolver }) {
  const { estado, dispatch } = useStore();
  const dot = dotPorId(estado.dot.estado);

  return (
    <>
      <h2 className="movil-titulo">Cambiar color</h2>
      <p className="movil-texto">
        Ahora está en <strong>{dot.nombre}</strong>. Vuelve a cambiar sola en tu próximo evento (11:00 · Reunión con
        Comercial).
      </p>

      <div className="tarjeta">
        <div className="opciones-movil">
          {ESTADOS_DOT.map((e) => (
            <button
              key={e.id}
              className={`opcion-movil${estado.dot.estado === e.id ? ' opcion-movil--elegida' : ''}`}
              onClick={() => dispatch({ type: 'DOT_SET', estado: e.id, razon: 'lo cambiaste desde la app' })}
            >
              <span className="bolita" style={{ background: e.color, marginRight: 8 }} aria-hidden="true" />
              {e.nombre}
            </button>
          ))}
        </div>
        <p style={{ margin: 'var(--space-12) 0 0' }}>Tu equipo solo ve el color, no la razón.</p>
      </div>

      <button className="boton-app boton-app--secundario" onClick={onVolver}>
        Volver
      </button>
    </>
  );
}

export default function AppMovil() {
  const { estado, dispatch } = useStore();
  const [tab, setTab] = useState('inicio');
  const [cambiandoColor, setCambiandoColor] = useState(false);

  const dot = dotPorId(estado.dot.estado);
  const informe = COMPROMISOS[0];
  const enOnboarding = estado.onboarding.app !== 'listo';

  const ayuda = (
    <>
      Vista de la app compañera. Comparte estado con <a href="#/slack/laura">#/slack/laura</a> y{' '}
      <a href="#/dot">#/dot</a>.
    </>
  );

  if (enOnboarding) {
    return (
      <PhoneFrame mostrarTabs={false} ayuda={ayuda}>
        <OnboardingMovil />
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame tab={tab} onTab={(t) => { setTab(t); setCambiandoColor(false); }} ayuda={ayuda}>
      {/* ---------- APP-04 · Inicio ---------- */}
      {tab === 'inicio' &&
        (cambiandoColor ? (
          <CambiarColor onVolver={() => setCambiandoColor(false)} />
        ) : (
          <>
            <h2 className="movil-titulo">Hola, Laura</h2>
            <p className="movil-texto">{HOY.largo}</p>

            <div className="tarjeta">
              <h3>Tu RITMO Dot</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-8)' }}>
                <span className="bolita" style={{ background: dot.color }} aria-hidden="true" />
                <strong style={{ color: 'var(--neutral-900)' }}>{dot.nombre}</strong>
              </p>
              {estado.dot.razon && <p>Cambió porque {estado.dot.razon}.</p>}
              <p>Tu equipo solo ve el color, no la razón.</p>
              <button className="boton-app boton-app--secundario" onClick={() => setCambiandoColor(true)}>
                Cambiar color
              </button>
            </div>

            <div className="tarjeta">
              <h3>Tu día</h3>
              {AGENDA_HOY.map((e) => (
                <p key={e.id} style={{ marginBottom: 6 }}>
                  <strong style={{ color: 'var(--neutral-900)' }}>{e.hora}</strong> · {e.titulo}
                </p>
              ))}
            </div>

            {/* C5 · la tarjeta de "Descarga" se reemplaza por Chat */}
            <div className="tarjeta">
              <h3>Habla con RITMO</h3>
              <p>Cuéntale qué tienes pendiente y te ayuda a ordenarlo. Solo tú lo ves.</p>
              <button className="boton-app" onClick={() => setTab('chat')}>
                Escribir
              </button>
            </div>

            <div className="tarjeta">
              <h3>Tu próxima entrega</h3>
              <p style={{ marginBottom: 0 }}>
                {informe.titulo} · {informe.fecha}
              </p>
            </div>
          </>
        ))}

      {/* ---------- Chat ---------- */}
      {tab === 'chat' && <ChatMovil />}

      {/* ---------- APP-06 · Solicitar ---------- */}
      {tab === 'solicitar' && (
        <>
          <h2 className="movil-titulo">Pedir un ajuste</h2>
          {/* C5 · "Ordena tu día y pide un ajuste cuando algo no cabe." */}
          <p className="movil-texto">Ordena tu día y pide un ajuste cuando algo no cabe.</p>

          <div className="tarjeta">
            <h3>La solicitud se completa en Slack</h3>
            <p>
              Ahí revisas qué verá Miguel y confirmas antes de enviar. Desde el teléfono puedes empezar y seguir en el
              computador.
            </p>
            <button
              className="boton-app"
              onClick={() => {
                dispatch({ type: 'BORRADOR_SET', borrador: { tipo: null } });
                dispatch({ type: 'PANEL_ABRIR', pantalla: 'L-02', lado: 'laura', solicitudId: null });
                window.open('#/slack/laura', '_blank');
              }}
            >
              Seguir en Slack
            </button>
          </div>

          <div className="tarjeta">
            <h3>Tus entregas</h3>
            {COMPROMISOS.slice(0, 3).map((c) => (
              <p key={c.id} style={{ marginBottom: 6 }}>
                {c.titulo} · {c.fecha}
              </p>
            ))}
          </div>
        </>
      )}

      {/* ---------- APP-07 · Historial ---------- */}
      {tab === 'historial' && (
        <>
          <h2 className="movil-titulo">Mis solicitudes</h2>
          <p className="movil-texto">Solo tú ves esta lista.</p>

          {estado.solicitudes.length === 0 ? (
            <div className="tarjeta">
              <h3>Todavía nada por aquí</h3>
              <p style={{ marginBottom: 0 }}>
                Cuando pidas un ajuste, aquí ves en qué va y qué respondió Miguel.
              </p>
            </div>
          ) : (
            estado.solicitudes.map((s) => {
              const etiqueta = ETIQUETAS_ESTADO[s.estado];
              const destino =
                s.estado === 'acordada'
                  ? s.alternativaMiguel || s.propuesta
                  : s.estado === 'rechazada' || s.estado === 'rechazo_alt' || s.estado === 'cancelada'
                    ? 'sigue igual'
                    : s.propuesta;
              return (
                <div className="tarjeta" key={s.id}>
                  <h3>{s.tipoTitulo}</h3>
                  <p className="fecha-movil">
                    {s.compromiso}: <span className="vieja">{s.fechaOriginal}</span> → <strong>{destino}</strong>
                  </p>
                  <span className={`etiqueta-estado etiqueta-estado--${TONO_ETIQUETA[s.estado] || 'neutral'}`}>
                    {etiqueta?.texto}
                  </span>
                  <p style={{ margin: 'var(--space-8) 0 0', color: 'var(--neutral-600)', fontSize: 13 }}>
                    {s.fecha}
                  </p>
                </div>
              );
            })
          )}
        </>
      )}
    </PhoneFrame>
  );
}
