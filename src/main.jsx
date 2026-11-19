import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/slack.css';
import './styles/app.css';
import { StoreProvider } from './store/StoreProvider.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
