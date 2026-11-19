/* RITMO · store global: context + useReducer, persistido en localStorage y
   sincronizado entre ventanas del mismo navegador (CLAUDE.md §2).

   Dos canales a propósito:
   - evento `storage`: avisa a las otras pestañas cuando cambia localStorage.
   - BroadcastChannel: refuerzo inmediato, no depende de que el navegador dispare `storage`.

   Limitación conocida y aceptada: solo sincroniza ventanas del mismo navegador y
   computador. Para la prueba alcanza (Slack, móvil y Dot en tres ventanas). */

import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { reducer } from './reducer.js';
import { estadoInicial, CLAVE_STORAGE, CANAL_SYNC } from './estadoInicial.js';

const StoreContext = createContext(null);

function leerGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return estadoInicial();
    const guardado = JSON.parse(crudo);
    if (guardado?.version !== 1) return estadoInicial();
    // Mezcla con el inicial para que las claves nuevas no rompan una sesión vieja.
    return { ...estadoInicial(), ...guardado };
  } catch {
    return estadoInicial();
  }
}

export function StoreProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, null, leerGuardado);

  // Si el cambio vino de otra ventana, no lo volvemos a emitir: evita el eco infinito.
  const desdeRemoto = useRef(false);
  const canal = useRef(null);

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      canal.current = new BroadcastChannel(CANAL_SYNC);
      canal.current.onmessage = (ev) => {
        if (ev.data?.tipo === 'estado') {
          desdeRemoto.current = true;
          dispatch({ type: 'HIDRATAR', estado: ev.data.estado });
        }
      };
    }

    const alCambiarStorage = (ev) => {
      if (ev.key !== CLAVE_STORAGE || !ev.newValue) return;
      try {
        desdeRemoto.current = true;
        dispatch({ type: 'HIDRATAR', estado: JSON.parse(ev.newValue) });
      } catch {
        /* JSON a medio escribir: la siguiente emisión lo corrige */
      }
    };

    window.addEventListener('storage', alCambiarStorage);
    return () => {
      window.removeEventListener('storage', alCambiarStorage);
      canal.current?.close();
    };
  }, []);

  useEffect(() => {
    if (desdeRemoto.current) {
      desdeRemoto.current = false;
      return;
    }
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
    } catch {
      /* cuota llena: el prototipo sigue funcionando en memoria */
    }
    canal.current?.postMessage({ tipo: 'estado', estado });
  }, [estado]);

  const valor = useMemo(() => ({ estado, dispatch }), [estado]);
  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
