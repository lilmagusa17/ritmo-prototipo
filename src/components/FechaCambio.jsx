/* C2 · Toda propuesta de mover fecha muestra original → nueva, con la original
   tachada y en gris. Se usa en L-03, L-04, L-05, M-01, M-02, M-03, L-06, L-07 y el historial.
   Para "proteger tiempo de foco" la "fecha" es un bloque de tiempo; el componente no asume formato. */

export default function FechaCambio({ etiqueta, original, nueva, tercera = null, etiquetaTercera = null }) {
  return (
    <p className="fecha-cambio">
      {etiqueta && <span className="fc-etiqueta">{etiqueta}:</span>}{' '}
      <span className="fc-original">{original}</span>
      <span className="fc-flecha" aria-hidden="true"> → </span>
      <span className="sr-only">cambia a</span>
      <strong className="fc-nueva">{nueva}</strong>
      {tercera && (
        <>
          <span className="fc-flecha" aria-hidden="true"> · </span>
          <span className="fc-etiqueta">{etiquetaTercera}:</span> <strong className="fc-nueva">{tercera}</strong>
        </>
      )}
    </p>
  );
}

/* Comparación de 3 columnas para L-06 (fecha actual · tu propuesta · propuesta de Miguel) */
export function ComparacionTres({ actual, tuya, deMiguel }) {
  return (
    <div className="comparacion">
      <div className="col">
        <span className="col-titulo">Fecha actual</span>
        <strong className="col-valor col-valor--gris">{actual}</strong>
      </div>
      <div className="col">
        <span className="col-titulo">Tu propuesta</span>
        <strong className="col-valor">{tuya}</strong>
      </div>
      <div className="col">
        <span className="col-titulo">Propuesta de Miguel</span>
        <strong className="col-valor">{deMiguel}</strong>
      </div>
    </div>
  );
}
