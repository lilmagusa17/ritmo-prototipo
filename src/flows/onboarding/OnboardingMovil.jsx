/* Onboarding de la app móvil (T1).
   APP-01 Vincular (126:16974) · APP-01b código vencido (126:17016) · APP-00 Configuración inicial (82:5684)
   APP-02 Avisos (126:17069) · APP-03 ¿Tienes un Dot? (127:17057) · APP-03a Buscar (127:17087)
   APP-03b Configura tu Dot (127:17124) → APP-04 Inicio

   Todo el copy sale de C5 y C6: verbos concretos, una idea por línea, sin jerga
   ("descarga", "cruce", "sincronizar", "estado detallado"). */

import { useState } from 'react';
import { useStore } from '../../store/StoreProvider.jsx';
import { CODIGO_VINCULO, ESTADOS_DOT } from '../../data/mock.js';

const soloDigitos = (t) => (t || '').replace(/\D/g, '');

export default function OnboardingMovil() {
  const { estado, dispatch } = useStore();
  const paso = estado.onboarding.app;

  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(null);
  const [vencido, setVencido] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const ir = (siguiente) => dispatch({ type: 'ONBOARDING_SET', superficie: 'app', paso: siguiente });

  /* ---------- APP-01 · vincular con el código de Slack ---------- */
  if (paso === 'vincular') {
    const comprobar = () => {
      if (soloDigitos(codigo).length < 4) {
        setError('Escribe los 4 dígitos que te dio RITMO en Slack.');
        return;
      }
      // El moderador puede forzar un código vencido desde #/control (APP-01b / O-02b)
      if (estado.flags.codigoVencidoProximo) {
        dispatch({ type: 'SET_FLAG', flag: 'codigoVencidoProximo', valor: false });
        setVencido(true);
        setError(null);
        return;
      }
      if (soloDigitos(codigo) !== soloDigitos(CODIGO_VINCULO)) {
        setError('Ese código no coincide. Míralo otra vez en Slack.');
        return;
      }
      dispatch({ type: 'APP_VINCULADA' });
      dispatch({ type: 'ONBOARDING_SET', superficie: 'slackLaura', paso: 'vinculada' });
      ir('config');
    };

    return (
      <>
        <h2 className="movil-titulo">Conecta RITMO con Slack</h2>
        <p className="movil-texto">
          En Slack, RITMO te dio un código de 4 dígitos. Escríbelo aquí para que las dos pantallas muestren lo mismo.
        </p>

        {vencido ? (
          /* APP-01b · código vencido */
          <div className="tarjeta tarjeta--alerta">
            <h3>Ese código ya venció</h3>
            <p>Los códigos duran 5 minutos. Pide uno nuevo en Slack y vuelve aquí.</p>
            <button
              className="boton-app"
              onClick={() => {
                setVencido(false);
                setCodigo('');
                dispatch({ type: 'ONBOARDING_SET', superficie: 'slackLaura', paso: 'codigo' });
              }}
            >
              Ya pedí uno nuevo
            </button>
          </div>
        ) : (
          <div className="tarjeta">
            <label className="campo-label" htmlFor="codigo">
              Código de Slack
            </label>
            {error && (
              <p className="error-campo" role="alert">
                <span aria-hidden="true">⚠</span> {error}
              </p>
            )}
            <input
              id="codigo"
              className="campo-codigo"
              inputMode="numeric"
              maxLength={9}
              placeholder="0 0 0 0"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                setError(null);
              }}
            />
            <button className="boton-app" onClick={comprobar}>
              Conectar
            </button>
          </div>
        )}
      </>
    );
  }

  /* ---------- APP-00 · qué compartes y cuándo (C6) ---------- */
  if (paso === 'config') {
    return (
      <>
        <h2 className="movil-titulo">Qué compartes y cuándo</h2>
        <div className="tarjeta">
          <p className="movil-texto" style={{ marginBottom: 'var(--space-12)' }}>
            Tu agenda y tus chats con RITMO son solo tuyos. Si envías una solicitud, Miguel verá tu nombre y el
            compromiso que quieres ajustar. Siempre lo revisas antes.
          </p>
          <ul className="lista-check">
            <li>Comparo tus tareas nuevas con tu agenda.</li>
            <li>Te aviso cuando una tarea nueva cae el mismo día que otra entrega tuya.</li>
            <li>Nada se envía sin que lo confirmes.</li>
          </ul>
        </div>

        <div className="tarjeta">
          <h3>Calendario de trabajo</h3>
          <p>Lo uso para detectar choques de fechas. Nadie más ve tu agenda.</p>
        </div>

        <button className="boton-app" onClick={() => ir('avisos')}>
          Entendido, seguir
        </button>
      </>
    );
  }

  /* ---------- APP-02 · avisos ---------- */
  if (paso === 'avisos') {
    const fila = (id, titulo, detalle) => (
      <label className="fila-toggle" key={id}>
        <span>
          <strong>{titulo}</strong>
          <span>{detalle}</span>
        </span>
        <input
          type="checkbox"
          checked={estado.avisos[id]}
          onChange={(e) => dispatch({ type: 'AVISO_TOGGLE', aviso: id, valor: e.target.checked })}
        />
      </label>
    );

    return (
      <>
        <h2 className="movil-titulo">¿De qué te aviso?</h2>
        <div className="tarjeta">
          {fila('choques', 'Choques de fechas', 'Cuando una tarea nueva cae el mismo día que otra entrega tuya.')}
          {fila('respuestas', 'Respuestas de Miguel', 'Cuando contesta una solicitud que enviaste.')}
          {fila('bloquesFoco', 'Bloques de foco', 'Cuando empieza un bloque que reservaste.')}
        </div>
        <button className="boton-app" onClick={() => ir('dot')}>
          Seguir
        </button>
      </>
    );
  }

  /* ---------- APP-03 / APP-03a / APP-03b · el Dot ---------- */
  if (paso === 'dot') {
    if (estado.dotConfigurado) {
      /* APP-03b · configura tu Dot */
      return (
        <>
          <h2 className="movil-titulo">Configura tu RITMO Dot</h2>

          <div className="tarjeta">
            <h3>La luz cambia sola según:</h3>
            <ul className="lista-check">
              <li>Tu calendario (reuniones y bloques de foco).</li>
              <li>
                <strong>Ajustes acordados con Miguel</strong> — Si acordaron tiempo de foco, la luz se pone en
                Concentración.
              </li>
              <li>Lo que tú elijas desde la app o desde Slack.</li>
            </ul>
          </div>

          <div className="tarjeta">
            <h3>¿Tu equipo ve el nombre del estado?</h3>
            <p>
              Todos ven la luz. Elige si en Slack también ven el nombre (ej. “Concentración”). La razón nunca se
              muestra.
            </p>
            <div className="opciones-movil">
              <button
                className={`opcion-movil${!estado.dot.mostrarNombreEnSlack ? ' opcion-movil--elegida' : ''}`}
                onClick={() => dispatch({ type: 'DOT_TOGGLE_NOMBRE_SLACK', valor: false })}
              >
                Solo la luz
              </button>
              <button
                className={`opcion-movil${estado.dot.mostrarNombreEnSlack ? ' opcion-movil--elegida' : ''}`}
                onClick={() => dispatch({ type: 'DOT_TOGGLE_NOMBRE_SLACK', valor: true })}
              >
                Luz + nombre en Slack
              </button>
            </div>
          </div>

          <div className="tarjeta">
            <h3>Colores</h3>
            <ul className="lista-colores">
              {ESTADOS_DOT.map((e) => (
                <li key={e.id}>
                  <span className="bolita" style={{ background: e.color }} aria-hidden="true" />
                  {e.nombre}
                </li>
              ))}
            </ul>
            <p style={{ marginBottom: 0 }}>Tu equipo solo ve el color, no la razón.</p>
          </div>

          <button className="boton-app" onClick={() => ir('listo')}>
            Listo
          </button>
        </>
      );
    }

    if (buscando) {
      /* APP-03a · buscar el Dot */
      return (
        <>
          <h2 className="movil-titulo">Buscando tu Dot…</h2>
          <div className="tarjeta">
            <p>Déjalo cerca y encendido. Esto tarda unos segundos.</p>
            <p style={{ marginBottom: 0 }}>
              <strong>RITMO Dot · a 1 metro</strong>
            </p>
            <button
              className="boton-app"
              style={{ marginTop: 'var(--space-12)' }}
              onClick={() => {
                dispatch({ type: 'DOT_CONFIGURADO' });
                setBuscando(false);
              }}
            >
              Conectar este Dot
            </button>
          </div>
          <button className="boton-app boton-app--secundario" onClick={() => setBuscando(false)}>
            Cancelar
          </button>
        </>
      );
    }

    /* APP-03 · ¿tienes un Dot? */
    return (
      <>
        <h2 className="movil-titulo">¿Tienes un RITMO Dot?</h2>
        <div className="tarjeta">
          <p>
            Es la luz de escritorio que muestra tu estado. Tu equipo ve el color desde lejos y sabe si puede
            interrumpirte.
          </p>
          <button className="boton-app" onClick={() => setBuscando(true)}>
            Sí, buscarlo
          </button>
          <button
            className="boton-app boton-app--secundario"
            style={{ marginTop: 'var(--space-8)' }}
            onClick={() => ir('listo')}
          >
            Todavía no tengo uno
          </button>
        </div>
      </>
    );
  }

  return null;
}
