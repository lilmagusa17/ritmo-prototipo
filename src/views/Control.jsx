/* Panel del moderador. Fase 0: Reset, reloj y Dot, lo mínimo para comprobar el sync.
   Fase 1 lo completa (escenario, eventos, log con hora). */

import { useStore } from '../store/StoreProvider.jsx';
import EstadoVivo from '../components/EstadoVivo.jsx';
import { SALTOS_RELOJ, ESTADOS_DOT } from '../data/mock.js';

export default function Control() {
  const { estado, dispatch } = useStore();

  return (
    <main className="placeholder" style={{ maxWidth: 880 }}>
      <h1>Panel del moderador</h1>
      <p className="pantalla">Fase 0 · Reset, reloj simulado y Dot. No lo ve el participante.</p>

      <EstadoVivo />

      <section style={{ marginTop: 'var(--space-24)' }}>
        <h2 style={{ fontSize: 15, margin: '0 0 var(--space-8)' }}>Escenario</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          <button className="boton boton--primario" onClick={() => dispatch({ type: 'RESET_TOTAL' })}>
            Reset total
          </button>
          <button className="boton" onClick={() => dispatch({ type: 'SALTAR_ONBOARDING' })}>
            Saltar onboarding
          </button>
          <button className="boton" onClick={() => dispatch({ type: 'CARGAR_HISTORIAL' })}>
            Cargar historial de ejemplo
          </button>
          <button className="boton" onClick={() => dispatch({ type: 'VACIAR_HISTORIAL' })}>
            Vaciar historial
          </button>
        </div>
      </section>

      <section style={{ marginTop: 'var(--space-24)' }}>
        <h2 style={{ fontSize: 15, margin: '0 0 var(--space-8)' }}>
          Tiempo simulado · ahora {estado.reloj}
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          {SALTOS_RELOJ.map((s) => (
            <button
              key={s.hora}
              className="boton"
              title={s.nota}
              onClick={() => dispatch({ type: 'SET_RELOJ', hora: s.hora, nota: s.nota })}
              style={estado.reloj === s.hora ? { borderColor: 'var(--violet-500)', color: 'var(--violet-700)' } : undefined}
            >
              {s.hora}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 'var(--space-24)' }}>
        <h2 style={{ fontSize: 15, margin: '0 0 var(--space-8)' }}>RITMO Dot</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-8)' }}>
          {ESTADOS_DOT.map((e) => (
            <button
              key={e.id}
              className="boton"
              onClick={() => dispatch({ type: 'DOT_SET', estado: e.id, razon: 'Cambio manual del moderador' })}
            >
              <span className="punto" style={{ background: e.color }} aria-hidden="true" />
              {e.nombre}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 'var(--space-24)' }}>
        <h2 style={{ fontSize: 15, margin: '0 0 var(--space-8)' }}>Log ({estado.log.length})</h2>
        {estado.log.length === 0 ? (
          <p className="pantalla">Todavía sin eventos. Cada acción del panel queda aquí con la hora simulada.</p>
        ) : (
          <ol style={{ color: 'var(--neutral-600)', fontSize: 13, lineHeight: 1.7, paddingLeft: 20 }}>
            {[...estado.log].reverse().map((l, i) => (
              <li key={`${l.real}-${i}`}>
                <b style={{ color: 'var(--neutral-900)' }}>{l.at}</b> · {l.texto}
              </li>
            ))}
          </ol>
        )}
      </section>

      <p style={{ marginTop: 'var(--space-24)' }}><a className="volver" href="#/">← Volver al índice</a></p>
    </main>
  );
}
