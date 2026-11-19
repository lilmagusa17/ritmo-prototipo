/* Índice del prototipo. No lo ve el participante: es la puerta de entrada del moderador. */

import { RUTAS } from '../router.js';
import EstadoVivo from '../components/EstadoVivo.jsx';
import { HOY } from '../data/mock.js';

export default function Indice() {
  return (
    <main className="indice">
      <h1>RITMO · prototipo de pruebas</h1>
      <p className="sub">
        Hoy del prototipo: <strong>{HOY.largo}</strong>. Las cinco vistas comparten estado: abre cada una en su
        propia ventana del mismo navegador y lo que pase en una aparece en las demás.
      </p>

      <ul className="rutas">
        {RUTAS.map((r) => (
          <li key={r.hash}>
            <a className="ruta-card" href={r.hash}>
              <strong>{r.titulo}</strong>
              <span>{r.detalle}</span>
              <code>{r.hash}</code>
            </a>
          </li>
        ))}
      </ul>

      <EstadoVivo />
    </main>
  );
}
