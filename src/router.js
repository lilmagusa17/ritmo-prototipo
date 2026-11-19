/* RITMO · router de hash en ~30 líneas. Sin react-router (CLAUDE.md §2). */

import { useEffect, useState } from 'react';

export const RUTAS = [
  { hash: '#/slack/laura', titulo: 'Slack · Laura', detalle: 'Chat con RITMO, aviso de choque, solicitudes' },
  { hash: '#/slack/miguel', titulo: 'Slack · Miguel', detalle: 'Bandeja del coordinador: aceptar, alternativa, rechazar' },
  { hash: '#/app', titulo: 'App móvil', detalle: 'Marco de teléfono 390×844 · Inicio · Chat · Solicitar · Historial' },
  { hash: '#/dot', titulo: 'RITMO Dot', detalle: 'Luz a pantalla completa para la segunda pantalla' },
  { hash: '#/control', titulo: 'Panel del moderador', detalle: 'Reset, reloj simulado, eventos, Dot y log' },
];

export function rutaActual() {
  const h = window.location.hash || '#/';
  return h.split('?')[0];
}

export function useRuta() {
  const [ruta, setRuta] = useState(rutaActual);
  useEffect(() => {
    const alCambiar = () => setRuta(rutaActual());
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  return ruta;
}

export function ir(hash) {
  window.location.hash = hash;
}
