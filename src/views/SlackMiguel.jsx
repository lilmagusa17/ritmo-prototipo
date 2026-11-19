/* Slack simulado · vista de Miguel. Fase 3. */

import Placeholder from './Placeholder.jsx';

export default function SlackMiguel() {
  return (
    <Placeholder
      titulo="Slack · Miguel"
      pantalla="M-00 Inicio · pendiente de shell (fase 1)"
      proximo={[
        'Fase 3 · M-01 solicitud recibida (dice "Laura pide…", C1) → M-02 detalle → aceptar / alternativa / rechazar',
        'Fase 3 · M-07 solicitudes del equipo, con el contador de pendientes',
        'C3 · si Laura cancela, el mensaje desaparece de aquí',
      ]}
    />
  );
}
