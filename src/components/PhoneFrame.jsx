/* Marco de teléfono 390×844 con status bar, slot de banner push y tabs opcionales.
   El push va fuera del marco, como notificación del sistema (C7). */

import { useEffect, useState } from 'react';
import { useStore } from '../store/StoreProvider.jsx';
import MarcaRitmo from './MarcaRitmo.jsx';

export const TABS = [
  { id: 'inicio', glifo: '⌂', texto: 'Inicio' },
  { id: 'chat', glifo: '💬', texto: 'Chat' },
  { id: 'solicitar', glifo: '✎', texto: 'Solicitar' },
  { id: 'historial', glifo: '≡', texto: 'Historial' },
];

function Push({ notificacion, onAbrir, onCerrar }) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 3600); // 3–4 s (C7)
    return () => clearTimeout(t);
  }, [notificacion.id, onCerrar]);

  return (
    <div className="push" role="status">
      <span className="icono" aria-hidden="true"><MarcaRitmo tam={18} titulo="" /></span>
      <button
        onClick={onAbrir}
        style={{ border: 0, background: 'none', textAlign: 'left', padding: 0, font: 'inherit' }}
      >
        <strong>{notificacion.titulo}</strong>
        {notificacion.cuerpo && <span>{notificacion.cuerpo}</span>}
      </button>
      <button onClick={onCerrar} aria-label="Descartar notificación">✕</button>
    </div>
  );
}

/* El marco mide 390×844 siempre. En pantallas más bajas se escala completo,
   para que la barra de tabs nunca quede fuera de la vista del moderador. */
function useEscalaTelefono() {
  const [escala, setEscala] = useState(1);
  useEffect(() => {
    const medir = () => setEscala(Math.min(1, (window.innerHeight - 140) / 844));
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);
  return escala;
}

export default function PhoneFrame({ tab, onTab, mostrarTabs = true, ayuda = null, children }) {
  const { estado, dispatch } = useStore();
  const ultima = estado.notificaciones[estado.notificaciones.length - 1] || null;
  const escala = useEscalaTelefono();

  return (
    <div className="movil-escenario">
      <div className="movil-columna">
        {ultima && (
          <Push
            notificacion={ultima}
            onAbrir={() => {
              onTab?.('inicio');
              dispatch({ type: 'NOTIF_CERRAR', id: ultima.id });
            }}
            onCerrar={() => dispatch({ type: 'NOTIF_CERRAR', id: ultima.id })}
          />
        )}

        <div
          className="telefono"
          style={escala < 1 ? { transform: `scale(${escala})`, transformOrigin: 'top center', marginBottom: 844 * (escala - 1) } : undefined}
        >
          <span className="notch" aria-hidden="true" />
          <div className="status-bar">
            <span>{estado.reloj}</span>
            <span aria-hidden="true">▮▮▮ ▮</span>
          </div>

          {/* Barra de la app, como en el Figma (APP-04): marca, nombre y menú */}
          {mostrarTabs && (
            <div className="appbar-movil">
              <MarcaRitmo tam={22} titulo="" />
              <strong>RITMO</strong>
              <span className="appbar-mas" aria-hidden="true">⋯</span>
            </div>
          )}

          <div className="pantalla-movil">{children}</div>

          {mostrarTabs && (
            <nav className="tabbar" aria-label="Secciones de RITMO">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className="tab"
                  aria-current={tab === t.id ? 'page' : undefined}
                  onClick={() => onTab?.(t.id)}
                >
                  <span className="glifo" aria-hidden="true">{t.glifo}</span>
                  {t.texto}
                </button>
              ))}
            </nav>
          )}
        </div>

        {ayuda && <p className="movil-ayuda">{ayuda}</p>}
      </div>
    </div>
  );
}
