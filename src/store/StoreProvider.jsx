/* RITMO · store global: un solo estado compartido entre todas las ventanas (CLAUDE.md §2).

   localStorage es la fuente de verdad, no la copia en memoria de cada ventana.
   Cada dispatch lee lo último guardado, aplica el reducer encima y vuelve a escribir.
   Sin esto, dos ventanas que actúan casi a la vez (el moderador en #/control y la
   participante en Slack) se pisan: la última en escribir borra lo que hizo la otra.

   Dos canales para avisar del cambio:
   - BroadcastChannel: inmediato entre pestañas del mismo navegador.
   - evento `storage`: respaldo, por si el navegador no soporta BroadcastChannel.

   Limitación conocida y aceptada: solo sincroniza ventanas del mismo navegador y
   computador. Para la prueba alcanza (Slack, móvil y Dot en tres ventanas). */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { reducer } from './reducer.js';
import { estadoInicial, CLAVE_STORAGE, CANAL_SYNC } from './estadoInicial.js';

const StoreContext = createContext(null);

function leerGuardado() {
  try {
    const crudo = localStorage.getItem(CLAVE_STORAGE);
    if (!crudo) return null;
    const guardado = JSON.parse(crudo);
    if (guardado?.version !== 1) return null;
    // Mezcla con el inicial para que las claves nuevas no rompan una sesión vieja.
    return { ...estadoInicial(), ...guardado };
  } catch {
    return null;
  }
}

function guardar(estado) {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(estado));
  } catch {
    /* cuota llena: el prototipo sigue funcionando en memoria */
  }
}

export function StoreProvider({ children }) {
  const [estado, setEstado] = useState(() => {
    const guardado = leerGuardado();
    if (guardado) return guardado;
    const inicial = estadoInicial();
    guardar(inicial);
    return inicial;
  });

  const canal = useRef(null);

  const dispatch = useCallback((accion) => {
    // Siempre sobre lo último guardado, no sobre la copia de esta ventana.
    const base = leerGuardado() || estadoInicial();
    const siguiente = reducer(base, accion);
    guardar(siguiente);
    setEstado(siguiente);
    canal.current?.postMessage({ tipo: 'estado', estado: siguiente });
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      canal.current = new BroadcastChannel(CANAL_SYNC);
      canal.current.onmessage = (ev) => {
        if (ev.data?.tipo === 'estado') setEstado(ev.data.estado);
      };
    }

    const alCambiarStorage = (ev) => {
      if (ev.key !== CLAVE_STORAGE || !ev.newValue) return;
      try {
        setEstado(JSON.parse(ev.newValue));
      } catch {
        /* JSON a medio escribir: el siguiente aviso lo corrige */
      }
    };

    window.addEventListener('storage', alCambiarStorage);
    return () => {
      window.removeEventListener('storage', alCambiarStorage);
      canal.current?.close();
    };
  }, []);

  const valor = useMemo(() => ({ estado, dispatch }), [estado, dispatch]);
  return <StoreContext.Provider value={valor}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
