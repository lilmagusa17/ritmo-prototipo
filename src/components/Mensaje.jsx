/* Mensaje de Slack + bloques tipo Block Kit.
   Regla de §3: dentro de Slack, RITMO se ve como Slack. Nada de violeta aquí. */

import Avatar from './Avatar.jsx';
import { USUARIOS } from '../data/mock.js';

export function Mensaje({ autor = 'ritmo', hora = '9:00', dotEstado = null, children }) {
  const usuario = USUARIOS[autor];
  return (
    <article className="msg">
      <Avatar usuario={usuario} tam={36} dotEstado={dotEstado} enClaro />
      <div>
        <div className="cabeza">
          <span className="autor">{usuario.nombre}</span>
          {usuario.esApp && <span className="etiqueta-app">APP</span>}
          <span className="hora">{hora}</span>
        </div>
        <div className="cuerpo">{children}</div>
      </div>
    </article>
  );
}

/* Attachment con barra lateral de color. El tono nunca es la única señal:
   siempre va acompañado del título en texto (§8). */
export function Attachment({ titulo, tono = 'neutral', pie = null, children }) {
  return (
    <div className={`attachment tono-${tono}`}>
      {titulo && <h3>{titulo}</h3>}
      <div className="campo">{children}</div>
      {pie && <p className="pie">{pie}</p>}
    </div>
  );
}

export function Acciones({ children }) {
  return <div className="bloque-acciones">{children}</div>;
}

export function BotonSlack({ variante = 'normal', children, ...props }) {
  const clase =
    variante === 'primario' ? 'btn-slack btn-slack--primario' : variante === 'peligro' ? 'btn-slack btn-slack--peligro' : 'btn-slack';
  return (
    <button className={clase} {...props}>
      {children}
    </button>
  );
}

export function DiaSeparador({ children = 'Hoy' }) {
  return (
    <div className="dia-separador">
      <span>{children}</span>
    </div>
  );
}
