/* App móvil compañera. Fase 1: marco de teléfono. Fase 5: onboarding + tabs. */

import Placeholder from './Placeholder.jsx';

export default function AppMovil() {
  return (
    <Placeholder
      titulo="App móvil"
      pantalla="Marco de teléfono 390×844 · pendiente (fase 1)"
      proximo={[
        'Fase 1 · marco de teléfono centrado con slot para el banner push',
        'Fase 5 · APP-01 vincular → APP-00 qué compartes → APP-02 avisos → APP-03 Dot → APP-04 inicio',
        'Fase 5 · tabs Inicio · Chat · Solicitar · Historial, con el copy nuevo de C5',
      ]}
    />
  );
}
