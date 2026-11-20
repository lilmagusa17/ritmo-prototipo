# RITMO · Plan de despliegue (ágil y sencillo)

> **Hecho: D0, D1 y D2.** El prototipo está en
> **https://lilmagusa17.github.io/ritmo-prototipo/** (repositorio público
> `lilmagusa17/ritmo-prototipo`, rama `main`). Cada push a `main` lo vuelve a publicar con la Action
> `.github/workflows/pages.yml`; no hay que tocar nada a mano.
>
> Rutas para la sesión:
> `…/#/slack/laura` · `…/#/slack/miguel` · `…/#/app` · `…/#/dot` · `…/#/control`
>
> Verificado en esa URL: las fuentes de Google cargan, las cinco vistas abren, dos pestañas se sincronizan,
> T3 (aviso → consentimiento → envío, con el botón bloqueado hasta marcar la casilla) y T6 (evento del Dot con sus
> tres señales) pasan, y `Reset total` deja el escenario en 9:00 con el onboarding desde cero.
>
> Se decidió **GitHub Pages** en vez de Netlify Drop (camino A del plan original) porque la URL es estable, no
> caduca a las 24 h y no exige iniciar sesión al participante. Hubo un artifact privado de respaldo con un build
> temprano; quedó desactualizado y no se mantiene: usa la URL de Pages.

> Objetivo: que la sesión de pruebas no dependa de `npm run dev` en tu computador. El prototipo queda en una URL
> que se abre en cualquier navegador, con las cinco vistas en sus hash: `#/slack/laura`, `#/slack/miguel`, `#/app`,
> `#/dot`, `#/control`.
>
> **Lo primero, porque cambia el montaje:** desplegar **no** sincroniza dispositivos. El estado vive en
> `localStorage` + `BroadcastChannel`, o sea **un navegador, un computador** (`CLAUDE.md` §2). Con la URL pública,
> la tablet que muestra el Dot seguirá sin recibir los cambios del laptop. Si quieres eso, es la fase **D4**, que es
> la única con backend y la primera que se recorta.

---

## 0. Decisión en una frase

Sitio **estático** (el build de Vite ya es HTML + JS + CSS, sin backend) publicado en **Netlify Drop**: se arrastra
la carpeta `dist` al navegador y sale una URL en menos de un minuto, sin cuenta, sin repo, sin CI. Las rutas son por
hash, así que no hace falta configurar redirecciones ni `base`.

Lo demás son opciones por si quieres actualizar el prototipo varias veces (D3) o sincronizar dispositivos de verdad
(D4). Nada de contenedores, pipelines ni IaC: sobra para cinco archivos estáticos.

---

## 1. Fases

| Fase | Qué deja listo | Estimado | Gate (no pasar sin esto) |
|---|---|---|---|
| **D0** Preparar el build | `base` relativa, `noindex`, índice con los links, `npm run build` limpio | 0:15 | `npm run preview` abre las 5 vistas desde `dist` |
| **D1** Publicar | URL pública funcionando | 0:10 | La URL abre `#/control` y el reloj se mueve |
| **D2** QA en la URL | Las 6 tareas pasan en la URL, no en localhost | 0:25 | T3 y T6 completas desde la URL, en el navegador de la sesión |
| **D3** *(opcional)* Deploy continuo | GitHub + deploy en cada push | 0:20 | Un push cambia la URL sin tocar nada a mano |
| **D4** *(opcional, recortable)* Sync entre dispositivos | Tablet/teléfono real en vivo | 1:30–2:00 | El Dot en otro dispositivo cambia de color desde `#/control` |

**Camino mínimo: D0 + D1 + D2 = 50 minutos.** Con eso la prueba ya no depende de tu terminal.

---

## 2. Fase por fase

### D0 · Preparar el build (0:15)

1. `vite.config.js`: `base: './'`, para que funcione igual en la raíz de un dominio o en una subcarpeta
   (lo necesitarás si algún día va a GitHub Pages).
2. `index.html`: `<meta name="robots" content="noindex" />`. Es un prototipo con nombres de personas y un workspace
   inventado; no tiene por qué salir en buscadores.
3. En `#/` (el índice): dejar visible la advertencia de que las ventanas deben ser del **mismo navegador**, para que
   nadie del equipo lo abra en su propio portátil esperando ver lo mismo.
4. `npm run build` y `npm run preview`, y abrir las cinco vistas desde el build (no desde el dev server).

**Hecho cuando:** `npm run preview` sirve el `dist` y las cinco rutas se ven igual que en desarrollo.

### D1 · Publicar (0:10)

**Camino A · Netlify Drop (recomendado).** Entras a `app.netlify.com/drop`, arrastras la carpeta `dist` y te da una
URL tipo `https://nombre-raro-123.netlify.app`. Sin cuenta: el sitio vive unas 24 h, y si inicias sesión queda fijo.
Para una prueba mañana, sobra; si harás varias sesiones en la semana, inicia sesión y renómbralo a algo que puedas
dictar en voz alta (`ritmo-prototipo.netlify.app`).

**Camino B · Vercel CLI.** `npx vercel deploy dist --prod`, pide cuenta y confirma con un par de respuestas. Útil si
ya tienes cuenta de Vercel.

**Camino C · GitHub Pages.** Solo si quieres que el prototipo viva junto al código en el mismo repositorio.
Necesita `base: './'` (ya en D0) y una Action que publique `dist`; son 15 minutos más y un paso más para fallar.
No lo recomiendo para mañana.

**Hecho cuando:** abres la URL en una ventana nueva y de incógnito, y `#/control` carga con el reloj en 9:00.

### D2 · QA en la URL (0:25)

El riesgo real de un despliegue no es que no suba, es que algo se vea distinto. Repite el ensayo de F7, pero contra
la URL y en el navegador y el equipo que usarás en la sesión:

- Las fuentes (Plus Jakarta Sans y Lato) cargan: si la red de la universidad bloquea Google Fonts, el prototipo se
  verá con la fuente del sistema. Compruébalo ahí, no en tu casa.
- Las cinco rutas abren y se sincronizan entre pestañas de esa URL.
- **T3** (aviso de choque → consentimiento → envío) y **T6** (evento del Dot con sus tres señales) completas.
- `Reset total` deja el escenario en 9:00 con el onboarding desde cero.
- Guarda las cinco rutas como pestañas fijas o marcadores, con los nombres de las tareas.

**Hecho cuando:** el recorrido T1–T6 pasa desde la URL, sin terminal abierta.

### D3 · Deploy continuo *(opcional, 0:20)*

Hoy el repositorio es local y no tiene remoto. Si vas a seguir ajustando copy después de la primera sesión, vale la
pena: creas el repo en GitHub, haces push de `master`, y conectas Netlify o Vercel al repo con `npm run build` y
`dist` como carpeta de salida. Desde ahí, cada push actualiza la URL.

Si prefieres no exponer el código, repite el arrastre de `dist` en Netlify Drop cada vez: son 30 segundos.

**Hecho cuando:** un cambio de copy commiteado aparece en la URL sin pasos manuales.

### D4 · Sincronizar dispositivos *(opcional, recortable, 1:30–2:00)*

Esta es la única fase que agrega backend, y `CLAUDE.md` §9 lo pone fuera de alcance. Hazla solo si la prueba
**necesita** el Dot en una tablet aparte o la app en un teléfono real.

- Lo mínimo que funciona: un canal en tiempo real alojado (Supabase Realtime o Firebase Realtime Database),
  detrás de un flag en `mock.js` (`SYNC_REMOTO`, por defecto `false`). El store ya centraliza todo en un `dispatch`
  que escribe el estado completo, así que el cambio es un adaptador: publicar el estado tras cada dispatch y
  aplicar el que llegue, igual que hace hoy `BroadcastChannel`.
- Riesgos: una llave pública en el cliente, latencia de red en medio de la sesión y un modo de fallo nuevo
  (si se cae el canal, el prototipo parece roto delante del participante). Por eso el flag: si falla, se apaga y
  vuelves al montaje de un solo navegador.

**Hecho cuando:** desde `#/control` en el laptop, el Dot cambia de color en la tablet en menos de un segundo, y con
el flag apagado todo sigue funcionando como hoy.

---

## 3. Montaje de la sesión con la URL (sin D4)

El despliegue cambia *de dónde* sale el prototipo, no cómo se monta:

- **Un solo computador** con las ventanas: `#/slack/laura` para el participante, `#/app` al lado, `#/control` en tu
  pantalla (o en la segunda salida de video), `#/dot` en una ventana en la segunda pantalla física o en un monitor
  conectado a ese mismo equipo.
- Si hay segundo participante para Miguel, `#/slack/miguel` tiene que estar en **ese mismo navegador** (otra ventana
  del mismo equipo). Si está en su propio portátil, verá un escenario vacío.
- Sesión remota (Zoom/Meet): el participante comparte pantalla y tú moderas pidiéndole control, o el
  participante abre solo `#/slack/laura` y tú disparas los eventos desde `#/control`… **en su navegador**. Esto
  último no funciona sin D4: tenlo claro antes de prometer una sesión remota.

---

## 4. Riesgos y qué hacer

| Riesgo | Señal | Mitigación |
|---|---|---|
| Creer que la URL sincroniza dispositivos | El Dot en la tablet no cambia | Montaje de §3; D4 solo si es imprescindible |
| Google Fonts bloqueado en la red del campus | Todo se ve con fuente del sistema | Detectarlo en D2; si pasa, descargar las dos fuentes al repo (20 min) |
| El sitio de Netlify Drop sin cuenta expira | La URL deja de abrir al otro día | Iniciar sesión y fijar el nombre, o volver a arrastrar `dist` |
| Sin internet en el salón | No carga nada | Plan B: `npm run preview` en el laptop (`dist` ya construido) y seguir con el montaje local |
| Alguien abre la URL y "resetea" sin querer | El escenario cambia a mitad de tarea | `#/control` no está enlazado desde las vistas del participante; no dictes esa ruta |

---

## 5. Orden de recorte

Si el tiempo aprieta: se cortan **D4**, luego **D3**. **D2 no se corta** — un prototipo que se ve raro en la red del
salón hace perder la sesión completa, y eso solo se descubre probando ahí.


---

## 6. Caché del navegador

Los archivos del build llevan un hash en el nombre (`assets/index-XXXX.js`), así que
al republicar el navegador siempre baja la versión nueva. Si aun así ves algo viejo,
abre la URL con un parámetro cualquiera (`?v=2`) o recarga con Ctrl+F5.

## 7. Cómo republicar

```bash
git add -A && git commit -m "ajuste de copy" && git push
```

La Action construye y publica en 1–2 minutos. Para verla: `gh run watch` o la pestaña Actions del repositorio.
Si alguna vez falla el despliegue y la sesión es en minutos, el plan B sigue siendo local:

```bash
npm run build && npm run preview
```

y moderar en `http://localhost:4173` con el mismo montaje de ventanas.
