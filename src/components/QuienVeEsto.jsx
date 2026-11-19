/* C6 · "Quién ve esto": reemplaza los eslóganes ("Tu agenda es solo tuya").
   Dos listas cortas, texto de 14px (no 12px gris). Sin promesas que RITMO no puede cumplir. */

export default function QuienVeEsto({ ve = [], noVe = [], titulo = 'Quién ve esto' }) {
  return (
    <section className="quien-ve" aria-label={titulo}>
      <h4>
        <span className="ojo" aria-hidden="true">👁</span> {titulo}
      </h4>
      <div className="qv-listas">
        <div>
          <p className="qv-titulo">Miguel ve</p>
          <ul className="qv-lista qv-lista--ve">
            {ve.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="qv-titulo">Miguel no ve</p>
          <ul className="qv-lista qv-lista--no">
            {noVe.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
