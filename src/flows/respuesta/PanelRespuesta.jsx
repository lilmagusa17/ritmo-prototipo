/* Panel derecho de Miguel · responder una solicitud.
   M-02 detalle (106:11051) · M-02c confirmar aceptación (106:11270)
   M-03 proponer alternativa (109:12949…) · M-04 rechazar (109:13343, 111:12792, 148:17659)
   M-05/05b/05c confirmaciones · M-07 solicitudes del equipo (114:15381, 114:15733)

   C1: la solicitud muestra el nombre de Laura, no "alguien de tu equipo".
   C3: aquí nunca aparece una solicitud cancelada. */

import { useState } from 'react';
import { useStore } from '../../store/StoreProvider.jsx';
import { solicitudesDeMiguel } from '../../store/reducer.js';
import { ALTERNATIVAS, RAZONES_RECHAZO } from '../solicitud/campos.js';
import { ETIQUETAS_ESTADO, ETIQUETAS_ESTADO_MIGUEL } from '../../data/mock.js';
import FechaCambio from '../../components/FechaCambio.jsx';
import { BotonSlack } from '../../components/Mensaje.jsx';

export default function PanelRespuesta() {
  const { estado, dispatch } = useStore();
  const pantalla = estado.panel.pantalla || 'M-07';
  const solicitud = estado.solicitudes.find((s) => s.id === estado.panel.solicitudId) || null;

  const [alternativa, setAlternativa] = useState('');
  const [razon, setRazon] = useState('');
  const [otraRazon, setOtraRazon] = useState('');
  const [error, setError] = useState(null);

  const irA = (p, solicitudId) => dispatch({ type: 'PANEL_ABRIR', pantalla: p, lado: 'miguel', solicitudId });

  /* ---------- M-07 · solicitudes del equipo ---------- */
  if (pantalla === 'M-07' || !solicitud) {
    const lista = solicitudesDeMiguel(estado);
    if (lista.length === 0) {
      return (
        <div className="vacio">
          <span className="glifo" aria-hidden="true">✓</span>
          No hay solicitudes de tu equipo.
          <p style={{ marginTop: 8 }}>Cuando alguien pida un ajuste, aparece aquí con su nombre.</p>
        </div>
      );
    }
    return (
      <>
        <h3 className="panel-titulo">Solicitudes del equipo</h3>
        <p className="panel-intro">
          {lista.filter((s) => s.estado === 'pendiente').length} pendiente(s) de responder.
        </p>
        <div className="opciones">
          {lista.map((s) => (
            <button
              key={s.id}
              className="opcion"
              aria-label={`Laura · ${s.tipoTitulo} · ${ETIQUETAS_ESTADO[s.estado]?.texto}`}
              onClick={() => irA('M-02', s.id)}
            >
              <span className="radio-falso" aria-hidden="true" />
              <span>
                <strong>Laura · {s.tipoTitulo}</strong>
                <span>
                  {s.compromiso} · {ETIQUETAS_ESTADO[s.estado]?.texto}
                </span>
              </span>
            </button>
          ))}
        </div>
      </>
    );
  }

  const yaRespondida = solicitud.estado !== 'pendiente';

  /* ---------- M-02 · detalle ---------- */
  if (pantalla === 'M-02') {
    const et = ETIQUETAS_ESTADO_MIGUEL[solicitud.estado] || ETIQUETAS_ESTADO[solicitud.estado];
    return (
      <>
        {/* Estructura del Figma M-02: estado + "lo que te enviaron" + la tarea que se cruza */}
        <p className="linea-estado">
          <span className={`chip-estado chip-estado--${et?.tono}`}>
            <span aria-hidden="true">{et?.glifo}</span> {et?.texto}
          </span>
          <span className="enviada">Enviada {solicitud.fecha}</span>
        </p>

        <h3 className="panel-titulo">Laura pide: {solicitud.tipoTitulo.toLowerCase()}</h3>

        <div className="resumen">
          <h4>Lo que te enviaron</h4>
          <dl>
            <dt>Tipo de ajuste</dt>
            <dd>{solicitud.tipoTitulo}</dd>
            <dt>Compromiso afectado</dt>
            <dd>{solicitud.compromiso}</dd>
            <dt>Propuesta</dt>
            <dd>
              {/* C2 · original → nueva, siempre las dos fechas */}
              <FechaCambio
                etiqueta={solicitud.compromiso}
                original={solicitud.fechaOriginal}
                nueva={solicitud.propuesta}
              />
            </dd>
            <dt>Nota de Laura</dt>
            <dd>{solicitud.nota ? `“${solicitud.nota}”` : 'Sin nota'}</dd>
          </dl>
        </div>

        {solicitud.tareaNueva && (
          <div className="bloque-cruce">
            <h4>Tarea nueva que se cruza</h4>
            <p>{solicitud.tareaNueva}</p>
          </div>
        )}

        <p className="campo-ayuda">
          Ves este compromiso y su fecha porque Laura decidió compartirlos. No ves su agenda ni sus conversaciones con
          RITMO.
        </p>

        {yaRespondida ? (
          <>
            <p className="exito">
              <span className="glifo" aria-hidden="true">✓</span>
              <span>Ya respondiste esta solicitud.</span>
            </p>
            <div className="panel-pie">
              <BotonSlack onClick={() => irA('M-07')}>Ver todas</BotonSlack>
            </div>
          </>
        ) : (
          <div className="panel-pie">
            <BotonSlack variante="peligro" onClick={() => irA('M-04')}>
              Rechazar
            </BotonSlack>
            <BotonSlack onClick={() => irA('M-03')}>Proponer alternativa</BotonSlack>
            <BotonSlack variante="primario" onClick={() => irA('M-02c')}>
              Aceptar
            </BotonSlack>
          </div>
        )}
      </>
    );
  }

  /* ---------- M-02c · confirmar aceptación ---------- */
  if (pantalla === 'M-02c') {
    return (
      <div className="confirmacion">
        <h4>¿Aceptar este ajuste?</h4>
        <FechaCambio etiqueta={solicitud.compromiso} original={solicitud.fechaOriginal} nueva={solicitud.propuesta} />
        <p>Laura recibe el aviso enseguida y el ajuste queda en firme.</p>
        <div className="panel-pie" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
          <BotonSlack
            variante="primario"
            onClick={() => {
              dispatch({ type: 'MIGUEL_RESPONDE', id: solicitud.id, respuesta: 'aceptar' });
              irA('M-05b');
            }}
          >
            Sí, aceptar
          </BotonSlack>
          <BotonSlack onClick={() => irA('M-02')}>Volver</BotonSlack>
        </div>
      </div>
    );
  }

  /* ---------- M-03 · proponer alternativa ---------- */
  if (pantalla === 'M-03') {
    const opciones = ALTERNATIVAS[solicitud.tipo] || [];
    const elegida = opciones.find((o) => o.id === alternativa);

    const enviar = () => {
      if (!elegida) {
        setError('Elige una alternativa para enviarla.');
        return;
      }
      dispatch({
        type: 'MIGUEL_RESPONDE',
        id: solicitud.id,
        respuesta: 'alternativa',
        alternativa: elegida.titulo,
      });
      irA('M-05');
    };

    return (
      <>
        <h3 className="panel-titulo">¿Qué le propones a Laura?</h3>
        <p className="panel-intro">Ella verá su propuesta y la tuya, una al lado de la otra, y decide.</p>

        {/* C2 · M-03 muestra original, propuesta de Laura y la alternativa */}
        <div className="resumen">
          <h4>Lo que hay sobre la mesa</h4>
          <FechaCambio etiqueta={solicitud.compromiso} original={solicitud.fechaOriginal} nueva={solicitud.propuesta} />
          <dl>
            <dt>Tu alternativa</dt>
            <dd>{elegida ? elegida.titulo : 'elige una opción'}</dd>
          </dl>
        </div>

        {error && (
          <p className="error-campo" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}

        <div className="opciones">
          {opciones.map((o) => (
            <label key={o.id} className={`opcion${alternativa === o.id ? ' opcion--elegida' : ''}`}>
              <input
                type="radio"
                name="alternativa"
                aria-label={`${o.titulo}. ${o.detalle}`}
                checked={alternativa === o.id}
                onChange={() => {
                  setAlternativa(o.id);
                  setError(null);
                }}
              />
              <span>
                <strong>{o.titulo}</strong>
                <span>{o.detalle}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="panel-pie">
          <BotonSlack variante="primario" onClick={enviar}>
            Enviar alternativa
          </BotonSlack>
          <BotonSlack onClick={() => irA('M-02')}>Volver</BotonSlack>
        </div>
      </>
    );
  }

  /* ---------- M-04 · rechazar ---------- */
  if (pantalla === 'M-04') {
    const enviar = () => {
      if (!razon) {
        setError('Elige una razón, o di que prefieres no darla.'); // M-04 sin razón elegida
        return;
      }
      const texto =
        razon === 'otra' ? otraRazon.trim() || 'Otra razón' : RAZONES_RECHAZO.find((r) => r.id === razon)?.texto;
      dispatch({ type: 'MIGUEL_RESPONDE', id: solicitud.id, respuesta: 'rechazar', razon: texto });
      irA('M-05c');
    };

    return (
      <>
        <h3 className="panel-titulo">No puedes aceptar el ajuste</h3>
        <p className="panel-intro">
          Laura verá que no se pudo y la razón que elijas. La fecha de su compromiso sigue igual.
        </p>

        <div className="resumen">
          <FechaCambio
            etiqueta={solicitud.compromiso}
            original={solicitud.fechaOriginal}
            nueva="sigue igual"
          />
        </div>

        {error && (
          <p className="error-campo" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}

        <div className="opciones">
          {RAZONES_RECHAZO.map((r) => (
            <label key={r.id} className={`opcion${razon === r.id ? ' opcion--elegida' : ''}`}>
              <input
                type="radio"
                name="razon"
                aria-label={r.texto}
                checked={razon === r.id}
                onChange={() => {
                  setRazon(r.id);
                  setError(null);
                }}
              />
              <span>
                <strong>{r.texto}</strong>
              </span>
            </label>
          ))}
        </div>

        {razon === 'otra' && (
          <>
            <label className="campo-label" htmlFor="otra-razon">
              Escribe la razón
            </label>
            <textarea
              id="otra-razon"
              className="campo-texto"
              maxLength={200}
              value={otraRazon}
              placeholder="Ej.: el cliente ya tiene la fecha confirmada."
              onChange={(e) => setOtraRazon(e.target.value)}
            />
          </>
        )}

        <div className="panel-pie">
          <BotonSlack variante="peligro" onClick={enviar}>
            Enviar respuesta
          </BotonSlack>
          <BotonSlack onClick={() => irA('M-02')}>Volver</BotonSlack>
        </div>
      </>
    );
  }

  /* ---------- M-05 / M-05b / M-05c · confirmaciones ---------- */
  const confirmaciones = {
    'M-05': {
      titulo: 'Alternativa enviada',
      texto: 'Laura la verá junto a su propuesta. Te aviso cuando responda.',
    },
    'M-05b': {
      titulo: 'Ajuste aceptado',
      texto: 'Laura ya recibió el aviso.',
    },
    'M-05c': {
      titulo: 'Respuesta enviada',
      texto: 'Laura sabe que no se pudo y por qué.',
    },
  };

  if (confirmaciones[pantalla]) {
    const c = confirmaciones[pantalla];
    return (
      <>
        <p className="exito">
          <span className="glifo" aria-hidden="true">✓</span>
          <span>
            <strong>{c.titulo}.</strong> {c.texto}
          </span>
        </p>

        <div className="resumen">
          <h4>Laura · {solicitud.tipoTitulo}</h4>
          <FechaCambio
            etiqueta={solicitud.compromiso}
            original={solicitud.fechaOriginal}
            nueva={solicitud.estado === 'alternativa' ? solicitud.alternativaMiguel : solicitud.propuesta}
          />
        </div>

        <div className="panel-pie">
          <BotonSlack onClick={() => irA('M-07')}>Ver solicitudes del equipo</BotonSlack>
          <BotonSlack onClick={() => dispatch({ type: 'PANEL_CERRAR' })}>Cerrar</BotonSlack>
        </div>
      </>
    );
  }

  return <p className="vacio">Elige una solicitud de la lista.</p>;
}
