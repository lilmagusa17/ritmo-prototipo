/* Panel derecho de Laura · Mis solicitudes.
   L-08 lista (101:9380) · L-08b vacío (101:9669) · L-08c detalle (101:9844)
   L-09 cancelar (104:10502) → L-08d cancelada (105:10716) · L-09b ya respondida (104:10719)

   C3: cancelar quita la solicitud de la bandeja de Miguel. Si Miguel ya respondió,
   no se puede cancelar: se ofrece ver la respuesta. */

import { useStore } from '../../store/StoreProvider.jsx';
import { ETIQUETAS_ESTADO } from '../../data/mock.js';
import FechaCambio from '../../components/FechaCambio.jsx';
import { BotonSlack } from '../../components/Mensaje.jsx';

export default function PanelMisSolicitudes() {
  const { estado, dispatch } = useStore();
  const pantalla = estado.panel.pantalla || 'L-08';
  const solicitud = estado.solicitudes.find((s) => s.id === estado.panel.solicitudId) || null;

  const irA = (p, solicitudId) => dispatch({ type: 'PANEL_ABRIR', pantalla: p, lado: 'laura', solicitudId });

  /* ---------- L-08 / L-08b · lista y vacío ---------- */
  if (pantalla === 'L-08' || !solicitud) {
    if (estado.solicitudes.length === 0) {
      return (
        <div className="vacio">
          <span className="glifo" aria-hidden="true">✎</span>
          Todavía no has pedido ningún ajuste.
          <p style={{ marginTop: 8 }}>Cuando envíes uno, aquí ves en qué va y puedes cancelarlo.</p>
        </div>
      );
    }

    return (
      <>
        <h3 className="panel-titulo">Mis solicitudes</h3>
        <p className="panel-intro">Solo tú ves esta lista.</p>
        <div className="opciones">
          {estado.solicitudes.map((s) => {
            /* C2 · la fila también muestra original → fecha que queda en firme */
            const haciaDonde =
              s.estado === 'acordada'
                ? s.alternativaMiguel || s.propuesta
                : s.estado === 'rechazada' || s.estado === 'rechazo_alt' || s.estado === 'cancelada'
                  ? 'sigue igual'
                  : s.propuesta;
            return (
              <button
                key={s.id}
                className="opcion"
                aria-label={`${s.tipoTitulo}, ${s.compromiso}, de ${s.fechaOriginal} a ${haciaDonde}, ${ETIQUETAS_ESTADO[s.estado]?.texto}`}
                onClick={() => irA('L-08c', s.id)}
              >
                <span className="radio-falso" aria-hidden="true" />
                <span>
                  <strong>
                    {s.fecha} · {s.tipoTitulo}
                  </strong>
                  <span>
                    {s.compromiso} · {ETIQUETAS_ESTADO[s.estado]?.texto}
                  </span>
                  <span className="fila-fechas">
                    <span className="vieja">{s.fechaOriginal}</span> → <strong>{haciaDonde}</strong>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const etiqueta = ETIQUETAS_ESTADO[solicitud.estado];
  const destino =
    solicitud.estado === 'acordada'
      ? solicitud.alternativaMiguel || solicitud.propuesta
      : solicitud.estado === 'rechazada' || solicitud.estado === 'rechazo_alt' || solicitud.estado === 'cancelada'
        ? 'sigue igual'
        : solicitud.propuesta;

  /* ---------- L-09 · confirmar cancelación ---------- */
  if (pantalla === 'L-09') {
    return (
      <div className="confirmacion">
        <h4>¿Cancelar tu solicitud?</h4>
        <p>Se quitará de la bandeja de Miguel y nada cambiará.</p>
        <FechaCambio etiqueta={solicitud.compromiso} original={solicitud.fechaOriginal} nueva={solicitud.propuesta} />
        <div className="panel-pie" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
          <BotonSlack
            variante="peligro"
            onClick={() => {
              dispatch({ type: 'SOLICITUD_CANCELAR', id: solicitud.id });
              irA('L-08d', solicitud.id);
            }}
          >
            Sí, cancelar
          </BotonSlack>
          <BotonSlack onClick={() => irA('L-08c', solicitud.id)}>Dejarla como está</BotonSlack>
        </div>
      </div>
    );
  }

  /* ---------- L-08d · cancelada ---------- */
  if (pantalla === 'L-08d') {
    return (
      <>
        <p className="exito">
          <span className="glifo" aria-hidden="true">✓</span>
          <span>
            <strong>Solicitud cancelada.</strong> Ya no aparece en la bandeja de Miguel.
          </span>
        </p>
        <div className="resumen">
          <FechaCambio etiqueta={solicitud.compromiso} original={solicitud.fechaOriginal} nueva="sigue igual" />
        </div>
        <div className="panel-pie">
          <BotonSlack onClick={() => irA('L-08')}>Ver mis solicitudes</BotonSlack>
          <BotonSlack onClick={() => dispatch({ type: 'PANEL_CERRAR' })}>Cerrar</BotonSlack>
        </div>
      </>
    );
  }

  /* ---------- L-09b · Miguel ya respondió ---------- */
  if (pantalla === 'L-09b') {
    return (
      <div className="confirmacion">
        <h4>Miguel ya respondió</h4>
        <p>Esta solicitud ya no se puede cancelar. Mira qué contestó y decide desde ahí.</p>
        <div className="panel-pie" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
          <BotonSlack variante="primario" onClick={() => irA('L-08c', solicitud.id)}>
            Ver respuesta
          </BotonSlack>
        </div>
      </div>
    );
  }

  /* ---------- L-08c · detalle ---------- */
  return (
    <>
      <p className="paso-indicador">{etiqueta?.texto}</p>
      <h3 className="panel-titulo">{solicitud.tipoTitulo}</h3>

      <div className="resumen">
        <h4>Lo que pediste</h4>
        <FechaCambio etiqueta={solicitud.compromiso} original={solicitud.fechaOriginal} nueva={destino} />
        {solicitud.alternativaMiguel && solicitud.estado === 'alternativa' && (
          <p style={{ margin: '0 0 8px', fontSize: 15 }}>
            Miguel propone: <strong>{solicitud.alternativaMiguel}</strong>
          </p>
        )}
        {solicitud.razonRechazo && (
          <p style={{ margin: '0 0 8px', fontSize: 15 }}>Razón de Miguel: {solicitud.razonRechazo}</p>
        )}
        {solicitud.nota && <p style={{ margin: 0, fontSize: 15 }}>Tu nota: “{solicitud.nota}”</p>}
      </div>

      <h4 style={{ fontSize: 15, margin: '0 0 var(--space-8)' }}>Qué ha pasado</h4>
      <ol className="log" style={{ maxHeight: 'none' }}>
        {(solicitud.historial || []).map((h, i) => (
          <li key={`${h.at}-${i}`}>
            <b>{h.at}</b>
            <span>{h.accion}</span>
          </li>
        ))}
      </ol>

      <div className="panel-pie">
        {solicitud.estado === 'pendiente' && (
          <BotonSlack variante="peligro" onClick={() => irA('L-09', solicitud.id)}>
            Cancelar solicitud
          </BotonSlack>
        )}
        {(solicitud.estado === 'aceptada' ||
          solicitud.estado === 'alternativa' ||
          solicitud.estado === 'acordada' ||
          solicitud.estado === 'rechazada' ||
          solicitud.estado === 'rechazo_alt') && (
          <BotonSlack onClick={() => irA('L-09b', solicitud.id)}>¿Puedo cancelarla?</BotonSlack>
        )}
        <BotonSlack onClick={() => irA('L-08')}>Ver todas</BotonSlack>
      </div>
    </>
  );
}
