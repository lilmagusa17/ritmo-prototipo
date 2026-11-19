import { useRuta } from './router.js';
import Indice from './views/Indice.jsx';
import SlackLaura from './views/SlackLaura.jsx';
import SlackMiguel from './views/SlackMiguel.jsx';
import AppMovil from './views/AppMovil.jsx';
import Dot from './views/Dot.jsx';
import Control from './views/Control.jsx';

export default function App() {
  const ruta = useRuta();

  switch (ruta) {
    case '#/slack/laura':
      return <SlackLaura />;
    case '#/slack/miguel':
      return <SlackMiguel />;
    case '#/app':
      return <AppMovil />;
    case '#/dot':
      return <Dot />;
    case '#/control':
      return <Control />;
    default:
      return <Indice />;
  }
}
