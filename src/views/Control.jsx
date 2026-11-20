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
  '11:00': { estado: 'reunion', razon: 'empezó tu Reunión con Comercial', hasta: '12:00' },
  '14:00': { estado: 'concentracion', razon: 'empezó tu bloque de Informe mensual', hasta: '16:00' },
  '18:00': { estado: 'apagado', razon: 'terminó tu jornada' },
};

/* Eventos del Dot que no cuelgan del reloj (C7) */
const EVENTOS_DOT = [
  { id: 'foco', texto: 'Empieza bloque de foco', estado: 'concentracion', razon: 'empezó tu bloque de Informe mensual', hasta: '16:00' },
  { id: 'reunion', texto: 'Empieza reunión', estado: 'reunion', razon: 'empezó tu Reunión con Comercial', hasta: '12:00' },
  { id: 'pausa', texto: 'Laura toma una pausa', estado: 'recargando', razon: 'tomaste una pausa de 10 minutos' },
  { id: 'fin-pausa', texto: 'Termina la pausa', estado: 'disponible', razon: 'terminó tu pausa' },
  { id: 'jornada', texto: 'Fin de la jornada', estado: 'apagado', razon: 'terminó tu jornada' },
];

export default function Control() {
  const { estado, dispatch } = useStore();
  const dot = dotPorId(estado.dot.estado);
  const pendientes = pendientesDeMiguel(estado);
  const primeraPendiente = pendientes[0] || null;
  const hayAlternativa = estado.solicitudes.some((s) => s.estado === 'alternativa');

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
    const alternativas = {
      plazo: 'martes 17 nov',
      prioridad: 'Partir el informe en dos entregas',
      foco: 'Hoy 14:00-15:00 sin reuniones',
      redistribuir: 'Camila apoya con los datos',
    };
    dispatch({
      type: 'MIGUEL_RESPONDE',
      id: primeraPendiente.id,
      respuesta: tipo,
      alternativa: tipo === 'alternativa' ? alternativas[primeraPendiente.tipo] : undefined,
      razon: tipo === 'rechazar' ? 'El equipo depende de esa fecha' : undefined,
    });
  };

  /* Laura responde a una alternativa, por si se modera también su lado */
  const resolverAlternativa = (acepta) => {
    const conAlternativa = estado.solicitudes.find((s) => s.estado === 'alternativa');
    if (!conAlternativa) return;
    dispatch({ type: 'LAURA_RESUELVE_ALTERNATIVA', id: conAlternativa.id, acepta });
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
        dispatch({ type: 'DOT_SET', estado: sig.id, razon: 'lo cambiaste a mano' });
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

      {/* Guion de la sesión: abierto por defecto para el ensayo, se cierra en la prueba real */}
      <details className="guion" open>
        <summary>Guion de la sesión · montaje y tareas</summary>

        <h3>Montaje (3 ventanas, mismo navegador)</h3>
        <ol>
          <li>
            Abre el prototipo en <code>https://lilmagusa17.github.io/ritmo-prototipo/</code> y recarga con{' '}
            <strong>Ctrl+F5</strong> una vez, por si el navegador tenía una versión vieja guardada.
          </li>
          <li>
            Laptop del participante: <code>#/slack/laura</code> a pantalla completa. Necesita 1280 px de ancho o más.
          </li>
          <li>
            Segunda ventana con el teléfono: <code>#/app</code>.
          </li>
          <li>
            Tablet o segunda pantalla junto al participante: <code>#/dot</code> (doble clic = pantalla completa).
          </li>
          <li>
            Tu ventana: este panel. Si hay un segundo participante, dale <code>#/slack/miguel</code>; si no, responde tú
            desde “Miguel responde”.
          </li>
          <li>
            Antes de empezar: <strong>Reset total</strong>. El reloj queda en 9:00 y el onboarding arranca desde cero.
          </li>
        </ol>

        <h3>Tareas</h3>
        <ol>
          <li>
            <strong>T1 · Configurar.</strong> “Acabas de instalar RITMO en Slack y quieres conectarlo con tu teléfono.”
            En Slack toca “Conectar mi teléfono”; el código es <code>4 7 2 9</code> y se escribe en la app. No ayudes
            con el copy: queremos saber si entiende qué se comparte y qué elige en “¿Tu equipo ve el nombre del
            estado?”.
          </li>
          <li>
            <strong>T2 · Organizar el día.</strong> “Cuéntale a RITMO cómo va tu día.” Deja que escriba lo que quiera;
            el bot responde por palabras clave (hoy, organiza, semana, saturada, pausa, ajuste, dot). Si repite la
            misma petición, RITMO lo nota y ofrece otra salida en vez de repetirse: vale la pena ver si lo usa.
          </li>
          <li>
            <strong>T3 · Pedir un ajuste.</strong> Salta a <strong>10:12</strong>: el aviso de choque llega al hilo
            como un mensaje más, debajo de lo último que haya escrito. Observa por dónde entra —el mensaje, la pestaña
            “Mis solicitudes” o el acceso “Solicitar ajuste” de abajo— y si lee el bloque “Miguel sabrá que esta
            solicitud es tuya” antes de marcar la casilla.
          </li>
          <li>
            <strong>T4 · Negociar.</strong> Usa <strong>Miguel propone alternativa</strong> (o deja que lo haga el
            segundo participante desde su tabla “Solicitudes del equipo”). Mira si compara las tres fechas
            (actual · suya · de Miguel) antes de aceptar.
          </li>
          <li>
            <strong>T5 · Cancelar.</strong> Pídele que cancele una solicitud pendiente desde “Mis solicitudes” y luego
            muéstrale la ventana de Miguel: ni en su chat ni en su tabla, y el contador bajó.
          </li>
          <li>
            <strong>T6 · Dot.</strong> Dispara <strong>Empieza bloque de foco</strong> sin avisar y no digas nada.
            Anota si nota la luz, el mensaje de Slack o el aviso del teléfono, y en qué orden.
          </li>
        </ol>

        <h3>Si algo se rompe</h3>
        <p>
          Reset total y volver a la tarea; con “Saltar onboarding” llegas a la tarea 2 en un clic. El estado vive en
          este navegador: no cierres las ventanas entre tareas. El chat se guarda tal cual, así que un hilo de una
          sesión anterior conserva sus mensajes hasta que hagas Reset total.
        </p>
      </details>

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

            <div className="fila" style={{ marginBottom: 'var(--space-12)' }}>
              <button className="bmod" disabled={!hayAlternativa} onClick={() => resolverAlternativa(true)}>
                Laura acepta la alternativa
              </button>
              <button className="bmod" disabled={!hayAlternativa} onClick={() => resolverAlternativa(false)}>
                Laura la rechaza
              </button>
            </div>

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
                  onClick={() => dispatch({ type: 'DOT_SET', estado: e.id, razon: 'lo cambiaste a mano' })}
                >
                  <span className="punto-grande" style={{ background: e.color }} aria-hidden="true" />
                  {e.nombre}
                </button>
              ))}
              <button className="bmod" title="Siguiente color">
                <span className="kbd">C</span>
              </button>
            </div>
            {/* Cada evento dispara las tres señales de C7 a la vez */}
            <div className="fila" style={{ marginBottom: 'var(--space-12)' }}>
              {EVENTOS_DOT.map((e) => (
                <button
                  key={e.id}
                  className="bmod"
                  onClick={() => dispatch({ type: 'DOT_SET', estado: e.estado, razon: e.razon, hasta: e.hasta })}
                >
                  <span className="punto-grande" style={{ background: dotPorId(e.estado).color }} aria-hidden="true" />
                  {e.texto}
                </button>
              ))}
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
