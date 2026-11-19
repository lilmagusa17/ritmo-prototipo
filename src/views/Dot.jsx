/* RITMO Dot a pantalla completa (#/dot) · señal 1 de C7.
   Círculo de ~60vmin sobre fondo oscuro neutro. Cada cambio de estado hace
   transición de 400 ms y un pulso, para que el participante note el cambio
   aunque esté mirando otra pantalla. Doble clic = pantalla completa. */

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
    <div className="dot-escenario" onDoubleClick={alDobleClic} title="Doble clic para pantalla completa">
      <div className="dot-caja">
        {/* El pulso se remonta en cada cambio de estado gracias al key */}
        <span key={estado.dot.estado} className="dot-pulso" style={{ borderColor: dot.hex }} aria-hidden="true" />
        <div
          className="dot-circulo"
          role="img"
          aria-label={`RITMO Dot en ${dot.nombre}`}
          style={{ background: dot.color, boxShadow: `0 0 18vmin ${dot.hex}66` }}
        />
      </div>

      {estado.dot.mostrarNombreEnDot && <p className="dot-nombre">{dot.nombre.toUpperCase()}</p>}
    </div>
  );
}
