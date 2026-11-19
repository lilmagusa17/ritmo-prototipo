/* Panel del moderador (#/control). No lo ve el participante (§6).
   Botones grandes agrupados: Escenario · Tiempo · Eventos · Dot · Log.
   Los atajos E/T/R/C quedan como extra, los botones mandan. */

import { useCallback, useEffect } from 'react';
import { useStore } from '../store/StoreProvider.jsx';
import { SALTOS_RELOJ, ESTADOS_DOT, dotPorId } from '../data/mock.js';
import { pendientesDeMiguel } from '../store/reducer.js';
import { RUTAS } from '../router.js';
import '../styles/control.css';

const plural = (n, singular, plural_) => `${n} ${n === 1 ? singular : plural_}`;

/* Eventos del reloj que mueven el Dot (C7) */
const DOT_POR_HORA = {
  '11:00': { estado: 'reunion', razon: 'empezó tu Reunión con Comercial' },
  '14:00': { estado: 'concentracion', razon: 'empezó tu bloque de Informe mensual' },
  '18:00': { estado: 'apagado', razon: 'terminó tu jornada' },
};

export default function Control() {
  const { estado, dispatch } = useStore();
  const dot = dotPorId(estado.dot.estado);
  const pendientes = pendientesDeMiguel(estado);
  const primeraPendiente = pendientes[0] || null;

  const irAHora = useCallback(
    (hora, nota) => {
      dispatch({ type: 'SET_RELOJ', hora, nota });
      const evento = DOT_POR_HORA[hora];
      if (evento) dispatch({ type: 'DOT_SET', estado: evento.estado, razon: evento.razon });
      if (hora === '10:12') dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'visible' });
    },
    [dispatch],
  );

  const responderComoMiguel = (tipo) => {
    if (!primeraPendiente) return;
    const mapa = {
      aceptar: { estado: 'aceptada', texto: 'Miguel aceptó la solicitud' },
      alternativa: { estado: 'alternativa', texto: 'Miguel propuso una alternativa' },
      rechazar: { estado: 'rechazada', texto: 'Miguel no pudo aceptar' },
    };
    const m = mapa[tipo];
    dispatch({
      type: 'SOLICITUD_ESTADO',
      id: primeraPendiente.id,
      estado: m.estado,
      actor: 'miguel',
      accionTexto: m.texto,
      datos: tipo === 'alternativa' ? { alternativaMiguel: 'miércoles 18 nov' } : {},
    });
    // Un acuerdo de "proteger tiempo de foco" mueve el Dot (C7)
    if (tipo === 'aceptar' && primeraPendiente.tipo === 'foco') {
      dispatch({ type: 'DOT_SET', estado: 'concentracion', razon: 'Miguel aceptó proteger tu tiempo de foco' });
    }
  };

  /* Atajos de teclado, como extra de los botones (§6) */
  useEffect(() => {
    const alTeclear = (ev) => {
      if (ev.target.matches('input, textarea')) return;
      const k = ev.key.toLowerCase();
      if (k === 'r') dispatch({ type: 'RESET_TOTAL' });
      if (k === 'e') dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'visible' });
      if (k === 't') {
        const i = SALTOS_RELOJ.findIndex((s) => s.hora === estado.reloj);
        const sig = SALTOS_RELOJ[(i + 1) % SALTOS_RELOJ.length];
        irAHora(sig.hora, sig.nota);
      }
      if (k === 'c') {
        const i = ESTADOS_DOT.findIndex((e) => e.id === estado.dot.estado);
        const sig = ESTADOS_DOT[(i + 1) % ESTADOS_DOT.length];
        dispatch({ type: 'DOT_SET', estado: sig.id, razon: 'Cambio manual del moderador' });
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [dispatch, estado.reloj, estado.dot.estado, irAHora]);

  const notaReloj = SALTOS_RELOJ.find((s) => s.hora === estado.reloj)?.nota || 'Hora libre';

  return (
    <main className="control">
      <h1>Panel del moderador</h1>
      <p className="sub">
        No lo ve el participante. Cada acción queda en el log con la hora simulada, para las notas de la sesión.
      </p>

      <div className="control-grid">
        <div>
          <section className="bloque">
            <h2>Escenario</h2>
            <div className="fila">
              <button className="bmod bmod--peligro" onClick={() => dispatch({ type: 'RESET_TOTAL' })}>
                Reset total <span className="kbd">R</span>
              </button>
              <button className="bmod" onClick={() => dispatch({ type: 'SALTAR_ONBOARDING' })}>
                Saltar onboarding
              </button>
              <button className="bmod" onClick={() => dispatch({ type: 'CARGAR_HISTORIAL' })}>
                Cargar historial de ejemplo
              </button>
              <button className="bmod" onClick={() => dispatch({ type: 'VACIAR_HISTORIAL' })}>
                Vaciar historial
              </button>
            </div>
          </section>

          <section className="bloque">
            <h2>Tiempo simulado</h2>
            <p className="reloj-ahora">{estado.reloj}</p>
            <p className="reloj-nota">{notaReloj}</p>
            <div className="fila">
              {SALTOS_RELOJ.map((s) => (
                <button
                  key={s.hora}
                  className={`bmod${estado.reloj === s.hora ? ' bmod--activo' : ''}`}
                  title={s.nota}
                  onClick={() => irAHora(s.hora, s.nota)}
                >
                  {s.hora}
                </button>
              ))}
              <button className="bmod" title="Siguiente salto" onClick={() => {
                const i = SALTOS_RELOJ.findIndex((s) => s.hora === estado.reloj);
                const sig = SALTOS_RELOJ[(i + 1) % SALTOS_RELOJ.length];
                irAHora(sig.hora, sig.nota);
              }}>
                Siguiente <span className="kbd">T</span>
              </button>
            </div>
          </section>

          <section className="bloque">
            <h2>
              Eventos
              <span className="pista">Wizard of Oz: responde por Miguel si no hay segundo participante</span>
            </h2>
            <div className="fila" style={{ marginBottom: 'var(--space-12)' }}>
              <button
                className="bmod bmod--primario"
                onClick={() => dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'visible' })}
              >
                Disparar aviso de choque <span className="kbd">E</span>
              </button>
              <button className="bmod" onClick={() => dispatch({ type: 'AVISO_CHOQUE', estadoAviso: 'oculto' })}>
                Ocultar aviso
              </button>
            </div>

            <div className="fila" style={{ marginBottom: 'var(--space-12)' }}>
              <button className="bmod" disabled={!primeraPendiente} onClick={() => responderComoMiguel('aceptar')}>
                Miguel acepta
              </button>
              <button className="bmod" disabled={!primeraPendiente} onClick={() => responderComoMiguel('alternativa')}>
                Miguel propone alternativa
              </button>
              <button className="bmod" disabled={!primeraPendiente} onClick={() => responderComoMiguel('rechazar')}>
                Miguel rechaza
              </button>
            </div>
            <p className="reloj-nota">
              {primeraPendiente
                ? `Responde a: ${primeraPendiente.compromiso} · ${primeraPendiente.tipoTitulo}`
                : 'Sin solicitudes pendientes. Carga el historial de ejemplo o envía una desde Laura.'}
            </p>

            <div className="fila">
              <label className="interruptor">
                <input
                  type="checkbox"
                  checked={estado.flags.errorEnvioProximo}
                  onChange={(e) => dispatch({ type: 'SET_FLAG', flag: 'errorEnvioProximo', valor: e.target.checked })}
                />
                Error en el próximo envío (L-04b)
              </label>
              <label className="interruptor">
                <input
                  type="checkbox"
                  checked={estado.flags.codigoVencidoProximo}
                  onChange={(e) => dispatch({ type: 'SET_FLAG', flag: 'codigoVencidoProximo', valor: e.target.checked })}
                />
                Código vencido en el próximo vínculo (O-02b)
              </label>
            </div>
          </section>

          <section className="bloque">
            <h2>
              RITMO Dot
              <span className="pista">ahora: {dot.nombre}</span>
            </h2>
            <div className="fila" style={{ marginBottom: 'var(--space-12)' }}>
              {ESTADOS_DOT.map((e) => (
                <button
                  key={e.id}
                  className={`bmod${estado.dot.estado === e.id ? ' bmod--activo' : ''}`}
                  onClick={() => dispatch({ type: 'DOT_SET', estado: e.id, razon: 'Cambio manual del moderador' })}
                >
                  <span className="punto-grande" style={{ background: e.color }} aria-hidden="true" />
                  {e.nombre}
                </button>
              ))}
              <button className="bmod" title="Siguiente color">
                <span className="kbd">C</span>
              </button>
            </div>
            <div className="fila">
              <label className="interruptor">
                <input
                  type="checkbox"
                  checked={estado.dot.mostrarNombreEnDot}
                  onChange={(e) => dispatch({ type: 'DOT_TOGGLE_NOMBRE_VISTA', valor: e.target.checked })}
                />
                Mostrar el nombre debajo del círculo
              </label>
              <label className="interruptor">
                <input
                  type="checkbox"
                  checked={estado.dot.mostrarNombreEnSlack}
                  onChange={(e) => dispatch({ type: 'DOT_TOGGLE_NOMBRE_SLACK', valor: e.target.checked })}
                />
                Luz + nombre en Slack
              </label>
            </div>
          </section>
        </div>

        <div>
          <section className="bloque">
            <h2>Abrir vistas</h2>
            <div className="enlaces">
              {RUTAS.filter((r) => r.hash !== '#/control').map((r) => (
                <a key={r.hash} href={r.hash} target="_blank" rel="noreferrer">
                  {r.titulo} <code>{r.hash}</code>
                </a>
              ))}
            </div>
            <p className="reloj-nota" style={{ marginTop: 'var(--space-12)', marginBottom: 0 }}>
              Ábrelas en ventanas aparte: comparten estado por localStorage, en este mismo navegador.
            </p>
          </section>

          <section className="bloque">
            <h2>
              Estado
              <span className="pista">
                {plural(estado.solicitudes.length, 'solicitud', 'solicitudes')} ·{' '}
                {plural(pendientes.length, 'pendiente', 'pendientes')}
              </span>
            </h2>
            <p className="reloj-nota" style={{ margin: 0 }}>
              App {estado.appVinculada ? 'vinculada' : 'sin vincular'} · aviso de choque: {estado.avisoChoque}
            </p>
          </section>

          <section className="bloque">
            <h2>Log <span className="pista">{estado.log.length} eventos</span></h2>
            {estado.log.length === 0 ? (
              <p className="reloj-nota" style={{ margin: 0 }}>
                Todavía sin eventos.
              </p>
            ) : (
              <ol className="log">
                {[...estado.log].reverse().map((l, i) => (
                  <li key={`${l.real}-${i}`}>
                    <b>{l.at}</b>
                    <span>{l.texto}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      <p style={{ marginTop: 'var(--space-16)' }}>
        <a className="volver" href="#/">← Volver al índice</a>
      </p>
    </main>
  );
}
