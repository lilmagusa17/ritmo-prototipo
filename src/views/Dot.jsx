/* RITMO Dot a pantalla completa. Versión mínima en fase 0 para comprobar el sync;
   las 3 señales sincronizadas de C7 se completan en fase 6. */

import { useStore } from '../store/StoreProvider.jsx';
import { dotPorId } from '../data/mock.js';

export default function Dot() {
  const { estado } = useStore();
  const dot = dotPorId(estado.dot.estado);

  const alDobleClic = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div
      onDoubleClick={alDobleClic}
      style={{
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        gap: 'var(--space-24)',
        background: '#17141d',
        cursor: 'pointer',
      }}
    >
      <div
        role="img"
        aria-label={`RITMO Dot en ${dot.nombre}`}
        style={{
          width: '60vmin',
          height: '60vmin',
          borderRadius: 'var(--radius-full)',
          background: dot.color,
          boxShadow: `0 0 18vmin ${dot.hex}66`,
          transition: 'background 400ms ease, box-shadow 400ms ease',
        }}
      />
      {estado.dot.mostrarNombreEnDot && (
        <p style={{ color: '#ffffff99', font: '500 13px var(--font-ritmo)', letterSpacing: '.08em', margin: 0 }}>
          {dot.nombre.toUpperCase()}
        </p>
      )}
    </div>
  );
}
