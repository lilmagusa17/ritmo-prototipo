/* Avatar de Slack. Si lleva `dotEstado`, muestra el puntito del color del RITMO Dot (C7):
   el equipo ve el color, nunca la razón. */

import { dotPorId } from '../data/mock.js';

export default function Avatar({ usuario, tam = 36, dotEstado = null, presencia = null, enClaro = false }) {
  const color = dotEstado ? dotPorId(dotEstado).color : presencia === 'activo' ? 'var(--slack-online)' : null;
  const titulo = dotEstado ? `${usuario.nombre} · Dot en ${dotPorId(dotEstado).nombre}` : usuario.nombre;

  return (
    <span
      className={`avatar${enClaro ? ' en-claro' : ''}`}
      style={{ width: tam, height: tam, background: usuario.color, fontSize: Math.round(tam * 0.42) }}
      title={titulo}
    >
      {usuario.inicial}
      {color && <span className="presencia" style={{ background: color }} aria-hidden="true" />}
      {dotEstado && <span className="sr-only">Dot en {dotPorId(dotEstado).nombre}</span>}
    </span>
  );
}
