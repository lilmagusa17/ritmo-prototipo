/* Tira de estado compartido. Sirve de comprobación del sync entre ventanas
   durante el desarrollo; en fase 7 se quita de las vistas del participante. */

import { useStore } from '../store/StoreProvider.jsx';
import { dotPorId } from '../data/mock.js';
import { pendientesDeMiguel } from '../store/reducer.js';

export default function EstadoVivo() {
  const { estado } = useStore();
  const dot = dotPorId(estado.dot.estado);

  return (
    <div className="estado-vivo">
      <span>Reloj simulado <b>{estado.reloj}</b></span>
      <span>
        <span className="punto" style={{ background: dot.color }} aria-hidden="true" />
        Dot <b>{dot.nombre}</b>
      </span>
      <span>Solicitudes <b>{estado.solicitudes.length}</b></span>
      <span>Pendientes de Miguel <b>{pendientesDeMiguel(estado).length}</b></span>
      <span>App <b>{estado.appVinculada ? 'vinculada' : 'sin vincular'}</b></span>
    </div>
  );
}
