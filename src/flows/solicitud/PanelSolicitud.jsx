/* Panel derecho de Laura · flujo de solicitud.
   L-02 tipo (90:6161) → L-03/03d/03e/03f formulario → L-04 vista previa (97:7589) → L-05 enviada (97:7821)
   Validación L-03b (91:6666) · descartar L-03c (91:7072) · error de envío L-04b (97:7703)

   Reglas que manda CLAUDE.md §5:
   - C1: sin consentimiento marcado, "Enviar a Miguel" queda deshabilitado.
   - C2: siempre se ve original → nueva.
   - C6: "Quién ve esto" con dos listas, no eslóganes. */

import { useState } from 'react';
import { useStore } from '../../store/StoreProvider.jsx';
import { nuevoId } from '../../store/reducer.js';
import { TIPOS_AJUSTE, TAREA_NUEVA, HOY } from '../../data/mock.js';
import { CONFIG_TIPO, armarSolicitud } from './campos.js';
import FechaCambio from '../../components/FechaCambio.jsx';
import QuienVeEsto from '../../components/QuienVeEsto.jsx';
import Consentimiento from '../../components/Consentimiento.jsx';
import { BotonSlack } from '../../components/Mensaje.jsx';

const MAX_NOTA = 280;

export default function PanelSolicitud() {
  const { estado, dispatch } = useStore();
  const pantalla = estado.panel.pantalla || 'L-02';
  const borrador = estado.borrador || {};

  const [error, setError] = useState(null);       // L-03b
  const [errorEnvio, setErrorEnvio] = useState(false); // L-04b
  const [consentido, setConsentido] = useState(false);

  const cfg = borrador.tipo ? CONFIG_TIPO[borrador.tipo] : null;

  const setBorrador = (cambios) => dispatch({ type: 'BORRADOR_SET', borrador: cambios });
  const irA = (p) => dispatch({ type: 'PANEL_ABRIR', pantalla: p, lado: 'laura' });

  /* ---------- L-02 · tipo de ajuste ---------- */
  if (pantalla === 'L-02') {
    return (
      <>
        <p className="paso-indicador">Paso 1 de 3</p>
        <h3 className="panel-titulo">¿Qué necesitas ajustar?</h3>
        <p className="panel-intro">
          Elige el tipo de ajuste. En el siguiente paso revisas qué verá Miguel antes de enviar nada.
        </p>

        <div className="opciones">
          {TIPOS_AJUSTE.map((t) => (
            <button
              key={t.id}
              className={`opcion${borrador.tipo === t.id ? ' opcion--elegida' : ''}`}
              aria-label={`${t.titulo}. ${t.descripcion}`}
              onClick={() => {
                setBorrador({ tipo: t.id });
                setError(null);
                irA('L-03');
              }}
            >
              {/* Marca visual, no un control: el botón entero es lo que se activa */}
              <span className="radio-falso" aria-hidden="true" />
              <span>
                <strong>{t.titulo}</strong>
                <span>{t.descripcion}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="campo-ayuda">Nada se envía todavía. Miguel no sabe que estás aquí.</p>
      </>
    );
  }

  /* ---------- L-03c · descartar el borrador ---------- */
  if (pantalla === 'L-03c') {
    return (
      <div className="confirmacion">
        <h4>¿Descartar esta solicitud?</h4>
        <p>Perderás lo que llevas escrito. Miguel no verá nada: todavía no la has enviado.</p>
        <div className="panel-pie" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
          <BotonSlack
            variante="peligro"
            onClick={() => {
              dispatch({ type: 'BORRADOR_SET', borrador: null });
              dispatch({ type: 'PANEL_CERRAR' });
            }}
          >
            Sí, descartar
          </BotonSlack>
          <BotonSlack onClick={() => irA('L-03')}>Seguir editando</BotonSlack>
        </div>
      </div>
    );
  }

  /* ---------- L-03 · formulario por tipo ---------- */
  if (pantalla === 'L-03' && cfg) {
    const valor = borrador[cfg.campo] || '';
    const nota = borrador.nota || '';

    const continuar = () => {
      if (!valor) {
        setError(cfg.errorVacio); // L-03b
        return;
      }
      setError(null);
      irA('L-04');
    };

    return (
      <>
        <p className="paso-indicador">Paso 2 de 3 · {cfg.titulo}</p>
        <h3 className="panel-titulo">{cfg.pregunta}</h3>
        <p className="panel-intro">{cfg.ayuda}</p>

        {/* C2 · la fecha original siempre a la vista, también mientras se decide */}
        <div className="resumen">
          <h4>Lo que quieres ajustar</h4>
          <FechaCambio
            etiqueta={cfg.etiquetaFecha}
            original={cfg.fechaOriginal}
            nueva={valor ? cfg.propuestaDesde(valor) : 'elige una opción'}
          />
        </div>

        {error && (
          <p className="error-campo" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}

        <div className="opciones">
          {cfg.opciones.map((o) => (
            <label key={o.id} className={`opcion${valor === o.id ? ' opcion--elegida' : ''}`}>
              <input
                type="radio"
                name={cfg.campo}
                aria-label={o.detalle ? `${o.titulo}. ${o.detalle}` : o.titulo}
                checked={valor === o.id}
                onChange={() => {
                  setBorrador({ [cfg.campo]: o.id });
                  setError(null);
                }}
              />
              <span>
                <strong>{o.titulo}</strong>
                {o.detalle && <span>{o.detalle}</span>}
              </span>
            </label>
          ))}
        </div>

        <label className="campo-label" htmlFor="nota">
          Nota para Miguel <span style={{ fontWeight: 400, color: '#616061' }}>(opcional)</span>
        </label>
        <p className="campo-ayuda">Si escribes una, Miguel la verá tal cual.</p>
        <textarea
          id="nota"
          className="campo-texto"
          maxLength={MAX_NOTA}
          value={nota}
          placeholder="Ej.: puedo entregarlo el lunes con los datos completos."
          onChange={(e) => setBorrador({ nota: e.target.value })}
        />
        <p className="contador">
          {nota.length}/{MAX_NOTA}
        </p>

        <div className="panel-pie">
          <BotonSlack variante="primario" onClick={continuar}>
            Revisar antes de enviar
          </BotonSlack>
          <BotonSlack onClick={() => irA('L-02')}>Cambiar tipo</BotonSlack>
          <BotonSlack variante="peligro" onClick={() => irA('L-03c')}>
            Descartar
          </BotonSlack>
        </div>
      </>
    );
  }

  /* ---------- L-04 · vista previa con consentimiento (C1, C2, C6) ---------- */
  if (pantalla === 'L-04' && cfg) {
    const valor = borrador[cfg.campo];
    const propuesta = cfg.propuestaDesde(valor);
    const nota = (borrador.nota || '').trim();

    const enviar = () => {
      // El moderador pudo armar un error de envío desde #/control (L-04b)
      if (estado.flags.errorEnvioProximo) {
        setErrorEnvio(true);
        dispatch({ type: 'SET_FLAG', flag: 'errorEnvioProximo', valor: false });
        return;
      }
      const solicitud = {
        id: nuevoId('sol'),
        fecha: HOY.corto,
        ...armarSolicitud(borrador),
        historial: [{ at: estado.reloj, actor: 'laura', accion: 'Enviaste la solicitud' }],
      };
      /* El mensaje del hilo (L-05) lo arma SOLICITUD_ENVIAR, para que no salga dos veces */
      dispatch({ type: 'SOLICITUD_ENVIAR', solicitud });
      setErrorEnvio(false);
      setConsentido(false);
      irA('L-05');
    };

    return (
      <>
        <p className="paso-indicador">Paso 3 de 3 · Vista previa</p>
        <h3 className="panel-titulo">Esto es lo que recibirá Miguel</h3>
        <p className="panel-intro">Revísalo. Nada sale de aquí hasta que toques “Enviar a Miguel”.</p>

        {errorEnvio && (
          <div className="error-envio" role="alert">
            <h4>No se pudo enviar</h4>
            <p>Tu solicitud no llegó a Miguel. No se envió nada a medias: puedes volver a intentarlo.</p>
          </div>
        )}

        <div className="resumen">
          <h4>Solicitud de Laura</h4>
          <dl>
            <dt>Tipo de ajuste</dt>
            <dd>{cfg.titulo}</dd>
            <dt>Compromiso</dt>
            <dd>
              {/* C2 · original → nueva, siempre */}
              <FechaCambio etiqueta={cfg.etiquetaFecha} original={cfg.fechaOriginal} nueva={propuesta} />
            </dd>
            <dt>Tarea nueva que choca</dt>
            <dd>
              {TAREA_NUEVA.titulo} · {TAREA_NUEVA.fecha}
            </dd>
            {nota && (
              <>
                <dt>Tu nota</dt>
                <dd>“{nota}”</dd>
              </>
            )}
          </dl>
        </div>

        {/* C6 · dos listas, sin eslóganes */}
        <QuienVeEsto
          ve={[
            'Tu nombre',
            'El compromiso y su fecha actual',
            'Tu propuesta',
            ...(nota ? ['Tu nota'] : []),
            'La tarea nueva que choca',
          ]}
          noVe={['Tu agenda completa', 'Tus otros compromisos', 'Tus conversaciones con RITMO']}
        />

        {/* C1 · consentimiento obligatorio, en los 4 tipos */}
        <Consentimiento marcado={consentido} onCambio={setConsentido} />

        <div className="panel-pie">
          <BotonSlack variante="primario" disabled={!consentido} onClick={enviar}>
            {errorEnvio ? 'Reintentar envío' : 'Enviar a Miguel'}
          </BotonSlack>
          {!consentido && <span className="ayuda-boton">Marca la casilla para enviar</span>}
          <BotonSlack onClick={() => irA('L-03')}>Volver</BotonSlack>
        </div>
      </>
    );
  }

  /* ---------- L-05 · enviada ---------- */
  if (pantalla === 'L-05') {
    const ultima = estado.solicitudes[0];
    return (
      <>
        <p className="exito">
          <span className="glifo" aria-hidden="true">✓</span>
          <span>
            <strong>Enviada a Miguel.</strong> Te aviso en este chat cuando responda.
          </span>
        </p>

        {ultima && (
          <div className="resumen">
            <h4>Lo que enviaste</h4>
            <FechaCambio etiqueta={ultima.compromiso} original={ultima.fechaOriginal} nueva={ultima.propuesta} />
            {ultima.nota && <p style={{ margin: 0, fontSize: 15 }}>“{ultima.nota}”</p>}
          </div>
        )}

        <p className="campo-ayuda">
          Mientras responde, tu agenda no cambia. Puedes cancelar la solicitud desde “Mis solicitudes”.
        </p>

        <div className="panel-pie">
          <BotonSlack onClick={() => dispatch({ type: 'PANEL_CERRAR' })}>Cerrar</BotonSlack>
        </div>
      </>
    );
  }

  /* Sin tipo elegido (p. ej. el panel se abrió directo en L-03): vuelve al paso 1 */
  return (
    <div className="vacio">
      <span className="glifo" aria-hidden="true">✎</span>
      Elige primero el tipo de ajuste.
      <div className="panel-pie" style={{ justifyContent: 'center' }}>
        <BotonSlack onClick={() => irA('L-02')}>Empezar</BotonSlack>
      </div>
    </div>
  );
}
