/* Shell de Slack: title bar · rail · sidebar · área principal · panel derecho (440px).
   Layout fijo, pensado para ≥1280px (§9). El panel derecho se controla desde el store
   para que lo pueda abrir el chat, un botón de un mensaje o el panel del moderador. */

import { useState } from 'react';
import { useStore } from '../store/StoreProvider.jsx';
import { CANALES, DMS, USUARIOS, WORKSPACE, dotPorId } from '../data/mock.js';
import { pendientesDeMiguel } from '../store/reducer.js';
import Avatar from './Avatar.jsx';

const RAIL = [
  { id: 'inicio', glifo: '⌂', texto: 'Inicio' },
  { id: 'dms', glifo: '✉', texto: 'DMs' },
  { id: 'actividad', glifo: '◔', texto: 'Actividad' },
  { id: 'mas', glifo: '⋯', texto: 'Más' },
];

export default function SlackShell({
  lado = 'laura',
  conversacion,
  onConversacion,
  tituloPanel,
  panel = null,
  composer = null,
  children,
}) {
  const { estado, dispatch } = useStore();
  const [railActivo, setRailActivo] = useState('inicio');

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

  const esDmLaura = lado === 'miguel' && conv.tipo === 'dm' && conv.id === 'laura';

  return (
    <div className="slack">
      <header className="slack-titlebar">
        <div className="historial">
          <span aria-hidden="true">←</span>
          <span aria-hidden="true">→</span>
          <span aria-hidden="true">⟳</span>
        </div>
        <div className="slack-buscador">
          <span aria-hidden="true">🔍</span>
          <span>Buscar en {WORKSPACE.nombre}</span>
        </div>
        <div className="yo">
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
            <h2>{WORKSPACE.nombre}</h2>
            <p>
              {yo.nombre}
              {lado === 'laura' && estado.dot.mostrarNombreEnSlack ? ` · ${dot.nombre}` : ''}
            </p>
          </div>
          <div className="sidebar-acciones">
            <button className="sidebar-nueva">+ Nuevo mensaje</button>
          </div>
          <div className="sidebar-lista">
            <h3 className="sidebar-seccion">Canales</h3>
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

            <h3 className="sidebar-seccion">Mensajes directos</h3>
            {dms.map((d) => {
              const u = USUARIOS[d.usuario];
              const mostrarBadge = lado === 'miguel' && d.id === 'ritmo' && pendientes > 0;
              return (
                <button
                  key={d.id}
                  className="sidebar-item"
                  aria-current={conv.tipo === 'dm' && conv.id === d.id}
                  onClick={() => onConversacion?.({ tipo: 'dm', id: d.id })}
                >
                  <Avatar usuario={u} tam={20} dotEstado={dotDe(u.id)} presencia={u.esApp ? null : 'activo'} />
                  {u.nombre}
                  {u.esApp && <span className="hash">app</span>}
                  {mostrarBadge && <span className="badge">{pendientes}</span>}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="slack-main">
          <div className="main-header">
            <h1>{titulo}</h1>
            {esDmLaura && (
              <>
                <Avatar usuario={USUARIOS.laura} tam={20} dotEstado={estado.dot.estado} enClaro />
                {estado.dot.mostrarNombreEnSlack && <span className="meta">{dot.nombre}</span>}
              </>
            )}
            {conv.tipo === 'dm' && conv.id === 'ritmo' && <span className="meta">App conectada a tu calendario</span>}
          </div>

          <div className="mensajes">{children}</div>

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
