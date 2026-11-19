/* App móvil compañera.
   Fase 1: marco de teléfono + APP-04 Inicio esbozado. Fase 5: onboarding completo y tabs reales. */

import { useState } from 'react';
import PhoneFrame from '../components/PhoneFrame.jsx';
import ChatMovil from '../flows/chat/ChatMovil.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { AGENDA_HOY, COMPROMISOS, HOY, dotPorId } from '../data/mock.js';

export default function AppMovil() {
  const { estado } = useStore();
  const [tab, setTab] = useState('inicio');
  const dot = dotPorId(estado.dot.estado);
  const informe = COMPROMISOS[0];

  return (
    <PhoneFrame
      tab={tab}
      onTab={setTab}
      ayuda={
        <>
          Vista de la app compañera. Comparte estado con <a href="#/slack/laura">#/slack/laura</a> y{' '}
          <a href="#/dot">#/dot</a>.
        </>
      }
    >
      {tab === 'inicio' && (
        <>
          <h2 style={{ fontSize: 20, margin: '0 0 var(--space-4)' }}>Hola, Laura</h2>
          <p style={{ color: 'var(--neutral-600)', fontSize: 14, margin: '0 0 var(--space-16)' }}>{HOY.largo}</p>

          {/* Tarjeta "Tu Dot" · se actualiza con cada evento (C7) */}
          <div className="tarjeta">
            <h3>Tu RITMO Dot</h3>
            <p style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-8)' }}>
              <span
                style={{ width: 14, height: 14, borderRadius: 'var(--radius-full)', background: dot.color, flex: 'none' }}
                aria-hidden="true"
              />
              <strong style={{ color: 'var(--neutral-900)' }}>{dot.nombre}</strong>
            </p>
            <p>Tu equipo solo ve el color, no la razón.</p>
            <button className="boton-app boton-app--secundario" disabled>
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

          {/* C5: la tarjeta de "Descarga" se reemplaza por Chat */}
          <div className="tarjeta">
            <h3>Habla con RITMO</h3>
            <p>Cuéntale qué tienes pendiente y te ayuda a ordenarlo. Solo tú lo ves.</p>
            <button className="boton-app" onClick={() => setTab('chat')}>
              Escribir
            </button>
          </div>

          <div className="tarjeta">
            <h3>Tu próxima entrega</h3>
            <p>
              {informe.titulo} · {informe.fecha}
            </p>
          </div>
        </>
      )}

      {tab === 'chat' && <ChatMovil />}

      {tab === 'solicitar' && (
        <div className="tarjeta">
          <h3>Solicitar un ajuste</h3>
          <p>La solicitud se completa en Slack. Esta pantalla llega en la fase 4.</p>
        </div>
      )}

      {tab === 'historial' && (
        <div className="tarjeta">
          <h3>Historial</h3>
          <p>
            {estado.solicitudes.length === 0
              ? 'Todavía no has enviado solicitudes.'
              : `${estado.solicitudes.length} solicitud(es) en el prototipo. El detalle llega en la fase 4.`}
          </p>
        </div>
      )}
    </PhoneFrame>
  );
}
