/* Placeholder de fase 0. Cada vista lo reemplaza por su pantalla real en las fases 1–6. */

import EstadoVivo from '../components/EstadoVivo.jsx';

export default function Placeholder({ titulo, pantalla, proximo = [] }) {
  return (
    <main className="placeholder">
      <h1>{titulo}</h1>
      <p className="pantalla">{pantalla}</p>
      <EstadoVivo />
      {proximo.length > 0 && (
        <>
          <p className="pantalla" style={{ marginTop: 'var(--space-24)' }}>Se construye en la siguiente fase:</p>
          <ul>
            {proximo.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </>
      )}
      <p><a className="volver" href="#/">← Volver al índice</a></p>
    </main>
  );
}
