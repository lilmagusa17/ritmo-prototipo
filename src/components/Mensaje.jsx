/* Mensaje de Slack + bloques tipo Block Kit.
   Regla de §3: dentro de Slack, RITMO se ve como Slack. Nada de violeta aquí. */

import Avatar from './Avatar.jsx';
import { USUARIOS, ETIQUETAS_ESTADO, ETIQUETAS_ESTADO_MIGUEL } from '../data/mock.js';

/* Chip de estado del Figma (L-07, M-06): glifo + texto, nunca solo color (§8) */
export function ChipEstado({ estado, lado = 'laura' }) {
  const tabla = lado === 'miguel' ? ETIQUETAS_ESTADO_MIGUEL : ETIQUETAS_ESTADO;
  const et = tabla[estado];
  if (!et) return null;
  return (
    <span className={`chip-estado chip-estado--${et.tono}`}>
      <span aria-hidden="true">{et.glifo}</span> {et.texto}
    </span>
  );
}

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
export function Attachment({ titulo, etiqueta = null, tono = 'neutral', pie = null, children }) {
  return (
    <div className={`attachment tono-${tono}`}>
      {/* La etiqueta en versalitas es el patrón del Figma: "LO QUE ENVIASTE", "QUÉ CAMBIÓ" */}
      {etiqueta && <p className="attachment-etiqueta">{etiqueta}</p>}
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
