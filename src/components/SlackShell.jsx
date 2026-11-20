/* Shell de Slack: title bar · rail · sidebar · área principal · panel derecho (440px).
   Layout fijo, pensado para ≥1280px (§9). El panel derecho se controla desde el store
   para que lo pueda abrir el chat, un botón de un mensaje o el panel del moderador.

   La estructura sigue el Figma (L-00 / L-01 / L-03): secciones Canales · Mensajes
   directos · Apps, pestañas "Mensajes / Mis solicitudes" en la cabecera y dos accesos
   grandes encima del composer. */

import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/StoreProvider.jsx';
import { CANALES, DMS, USUARIOS, WORKSPACE, dotPorId } from '../data/mock.js';
import { pendientesDeMiguel } from '../store/reducer.js';
import Avatar from './Avatar.jsx';
import MarcaRitmo from './MarcaRitmo.jsx';

const RAIL = [
  { id: 'inicio', glifo: '⌂', texto: 'Inicio' },
  { id: 'dms', glifo: '✉', texto: 'MD' },
  { id: 'actividad', glifo: '◔', texto: 'Actividad' },
];

export default function SlackShell({
  lado = 'laura',
  conversacion,
  onConversacion,
  tituloPanel,
  panel = null,
  composer = null,
  // Pestañas de la cabecera del DM de RITMO: [{ id, texto, activa, onClick }]
  pestanas = [],
  // Accesos grandes encima del composer: [{ id, glifo, titulo, sub, onClick }]
  accesos = [],
  // Cambia cuando llega un mensaje nuevo: el hilo baja solo, como en Slack
  scrollSenal = 0,
  children,
}) {
  const { estado, dispatch } = useStore();
  const [railActivo, setRailActivo] = useState('inicio');
  const hilo = useRef(null);

  useEffect(() => {
    const caja = hilo.current;
    if (caja) caja.scrollTop = caja.scrollHeight;
  }, [scrollSenal, conversacion?.id]);

  const yo = lado === 'laura' ? USUARIOS.laura : USUARIOS.miguel;
  const dms = DMS[lado];
  const panelAbierto = estado.panel.abierto && estado.panel.lado === lado && panel;
  const pendientes = pendientesDeMiguel(estado).length;
  const dot = dotPorId(estado.dot.estado);

  // El estado del Dot de Laura se ve en su avatar, en las dos vistas (C7).
  const dotDe = (usuarioId) => (usuarioId === 'laura' ? estado.dot.estado : null);

  const conv = conversacion || { tipo: 'dm', id: 'ritmo' };
  const titulo =
    conv.tipo === 'canal'
      ? `# ${CANALES.find((c) => c.id === conv.id)?.nombre || conv.id}`
      : USUARIOS[dms.find((d) => d.id === conv.id)?.usuario || 'ritmo'].nombre;

  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';
  const esDmLaura = lado === 'miguel' && conv.tipo === 'dm' && conv.id === 'laura';

  const itemDm = (d) => {
    const u = USUARIOS[d.usuario];
    const mostrarBadge = u.esApp && lado === 'miguel' && pendientes > 0;
    return (
      <button
        key={d.id}
        className={`sidebar-item${u.esApp ? ' sidebar-item--app' : ''}`}
        aria-current={conv.tipo === 'dm' && conv.id === d.id}
        onClick={() => onConversacion?.({ tipo: 'dm', id: d.id })}
      >
        <Avatar usuario={u} tam={20} dotEstado={dotDe(u.id)} presencia={u.esApp ? null : 'activo'} />
        {u.nombre}
        {mostrarBadge && <span className="badge">{pendientes}</span>}
      </button>
    );
  };

  return (
    <div className="slack">
      <header className="slack-titlebar">
        <div className="titlebar-izq">
          <span className="semaforo" aria-hidden="true">
            <i style={{ background: '#ff5f57' }} />
            <i style={{ background: '#febc2e' }} />
            <i style={{ background: '#28c840' }} />
          </span>
        </div>
        <div className="titlebar-centro">
          <div className="historial" aria-hidden="true">
            <span>←</span>
            <span>→</span>
            <span>⟳</span>
          </div>
          <div className="slack-buscador">
            <span aria-hidden="true">🔍</span>
            <span>Buscar en {WORKSPACE.nombre}</span>
          </div>
        </div>
        <div className="yo">
          <span className="ayuda-slack" aria-hidden="true">?</span>
          <Avatar usuario={yo} tam={24} dotEstado={dotDe(yo.id)} presencia="activo" />
        </div>
      </header>

      <div className={`slack-cuerpo${panelAbierto ? ' con-panel' : ''}`}>
        <nav className="slack-rail" aria-label="Espacios">
          <div className="slack-workspace" title={WORKSPACE.nombre}>
            {WORKSPACE.inicial}
          </div>
          {RAIL.map((r) => (
            <button
              key={r.id}
              className="rail-item"
              aria-current={railActivo === r.id ? 'page' : undefined}
              onClick={() => setRailActivo(r.id)}
            >
              <span className="glifo" aria-hidden="true">{r.glifo}</span>
              {r.texto}
            </button>
          ))}
          <div className="rail-abajo">
            <Avatar usuario={yo} tam={32} dotEstado={dotDe(yo.id)} presencia="activo" />
          </div>
        </nav>

        <aside className="slack-sidebar">
          <div className="sidebar-header">
            <div>
              <h2>
                {WORKSPACE.nombre} <span aria-hidden="true">⌄</span>
              </h2>
              <p>
                {yo.nombre}
                {lado === 'laura' && estado.dot.mostrarNombreEnSlack ? ` · ${dot.nombre}` : ''}
              </p>
            </div>
            <button className="sidebar-redactar" aria-label="Nuevo mensaje">
              <span aria-hidden="true">✎</span>
            </button>
          </div>
          <div className="sidebar-lista">
            <h3 className="sidebar-seccion"><span aria-hidden="true">⌄</span> Canales</h3>
            {CANALES.map((c) => (
              <button
                key={c.id}
                className="sidebar-item"
                aria-current={conv.tipo === 'canal' && conv.id === c.id}
                onClick={() => onConversacion?.({ tipo: 'canal', id: c.id })}
              >
                <span className="hash" aria-hidden="true">#</span>
                {c.nombre}
              </button>
            ))}

            <h3 className="sidebar-seccion"><span aria-hidden="true">⌄</span> Mensajes directos</h3>
            {dms.filter((d) => !USUARIOS[d.usuario].esApp).map(itemDm)}

            {/* RITMO va en "Apps", como en Slack de verdad: es la app, no una persona
                del equipo. Mezclado con Miguel y Camila el participante no sabe con
                quién habla. */}
            <h3 className="sidebar-seccion"><span aria-hidden="true">⌄</span> Apps</h3>
            {dms.filter((d) => USUARIOS[d.usuario].esApp).map(itemDm)}
          </div>
        </aside>

        <main className="slack-main">
          <div className="main-header">
            <div className="main-header-titulo">
              {esRitmo && <MarcaRitmo tam={20} titulo="" />}
              {esDmLaura && <Avatar usuario={USUARIOS.laura} tam={20} dotEstado={estado.dot.estado} enClaro />}
              <h1>{titulo}</h1>
              {esRitmo ? (
                <span className="etiqueta-app">APP</span>
              ) : (
                conv.tipo === 'dm' && <span className="meta">Chat directo con una persona · RITMO no lo lee</span>
              )}
              {esDmLaura && estado.dot.mostrarNombreEnSlack && <span className="meta">{dot.nombre}</span>}
            </div>

            {esRitmo && pestanas.length > 0 && (
              <div className="main-tabs">
                {pestanas.map((p) => (
                  <button
                    key={p.id}
                    className={`main-tab${p.activa ? ' main-tab--activa' : ''}`}
                    aria-current={p.activa ? 'page' : undefined}
                    onClick={p.onClick}
                  >
                    {p.texto}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mensajes" ref={hilo}>
            {children}
          </div>

          {esRitmo && accesos.length > 0 && (
            <div className="accesos">
              {accesos.map((a) => (
                <button key={a.id} className="acceso" onClick={a.onClick}>
                  <span className="acceso-glifo" aria-hidden="true">{a.glifo}</span>
                  <span>
                    <strong>{a.titulo}</strong>
                    <small>{a.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="composer">{composer}</div>
        </main>

        {panelAbierto && (
          <aside className="slack-panel" aria-label={tituloPanel}>
            <div className="panel-header">
              <h2>{tituloPanel}</h2>
              <button className="panel-cerrar" onClick={() => dispatch({ type: 'PANEL_CERRAR' })} aria-label="Cerrar panel">
                ✕
              </button>
            </div>
            <div className="panel-cuerpo">{panel}</div>
          </aside>
        )}
      </div>
    </div>
  );
}
