# RITMO · Plan de desarrollo ágil (prototipo listo para pruebas mañana)

> **Estado: F0 a F7 terminadas.** El prototipo corre con `npm install && npm run dev` y `npm run build` pasa limpio.
> Las seis tareas de la prueba (T1–T6) se recorrieron de punta a punta en el navegador. El guion de moderación
> vive arriba de `#/control`, así que no hace falta llevar este documento a la sesión.
>
> | Fase | Commit |
> |---|---|
> | F0 base | `c79f38a` |
> | F1 shells + control | `121d591` |
> | F2 solicitud de Laura (T3) | `da18ec2` |
> | F3 Miguel y cierre de ciclo (T4, T5) | `bfae0bb` |
> | F4 chat guionado (T2) | `9211a5b` |
> | F5 app móvil y onboarding (T1) | `69bdddd` |
> | F6 RITMO Dot (T6) | `4094e35` |
> | F7 pulido y ensayo | este commit |

> Estado al escribir este plan: carpeta vacía (solo `CLAUDE.md` y `PROMPT-INICIAL.md`). Node v22.14.0, npm 10.9.2 — listo para `npm create vite`.
> Objetivo: **prototipo corriendo y moderable mañana**, no producto. Fuente de verdad del contenido: `CLAUDE.md` (correcciones C1–C7 mandan sobre Figma).

---

## 0. Estrategia en una frase

Construir en **rebanadas verticales** (cada fase deja algo demostrable en el navegador), en el orden en que las tareas de la prueba se rompen: primero el flujo que la investigación necesita de verdad (**T3–T5**), luego lo que lo envuelve (**T2, T1, T6**), y dejar el pulido como última fase recortable.

Riesgo principal del cronograma: hacer onboarding bonito antes de que el flujo de solicitud funcione. Si falta tiempo, se puede moderar un onboarding feo; **no** se puede moderar un flujo de solicitud roto.

---

## 1. Presupuesto de tiempo y gates

| Fase | Qué deja listo | Estimado | Gate (no pasar sin esto) |
|---|---|---|---|
| **F0** Arranque | Vite + tokens + rutas + store | 0:45 | `npm run dev` abre `#/` con links a las 5 vistas |
| **F1** Shell + Control | Slack shell, marco de teléfono, `#/control` con Reset + reloj | 1:15 | Moderador puede resetear y mover el reloj; 2 pestañas sincronizan |
| **F2** Flujo núcleo Laura | L-01 → L-02 → L-03 (4 tipos) → **L-04 consentimiento** → L-05 | 2:00 | T3 completa de punta a punta en `#/slack/laura` |
| **F3** Miguel + cierre de ciclo | M-01/M-02/M-03/M-04 + resultados en ambos lados + cancelar (C3) | 1:45 | T4 y T5 completas con 2 ventanas |
| **F4** Chat guionado (C4) | Bot por intenciones en DM Laura (mismo hilo en móvil después) | 1:15 | T2 completa; fallback con chips nunca deja al participante sin salida |
| **F5** App móvil (T1) | APP-01 → APP-00 → APP-02 → APP-03x → APP-04 + 4 tabs + copy C5 | 1:45 | T1 completa; tab Chat muestra el mismo hilo que Slack |
| **F6** RITMO Dot (C7) | `#/dot`, 3 señales sincronizadas, puntito en avatares | 1:00 | T6: cambiar estado desde control dispara las 3 señales |
| **F7** Pulido + ensayo | Sección 8 criterio por criterio + corrida T1–T6 | 1:15 | Checklist de ensayo (abajo) sin bloqueantes |

**Total ≈ 11 h.** No cabe en una noche. Reparto realista:

- **Hoy (noche, ~4 h):** F0, F1, F2 → el flujo de Laura hasta "enviada" funciona. Dormir con T3 verde.
- **Mañana (mañana, ~4 h):** F3, F4, F6 → ciclo cerrado, chat y Dot.
- **Mañana (antes de la prueba, ~2–3 h):** F5 y F7. F5 es la candidata #1 a recortarse (ver §6).

Regla de corte: **F7 nunca se salta.** Si a 1:15 de la prueba falta F5, se corta F5, no el ensayo.

---

## 2. Fase por fase · definición de "hecho"

### F0 · Arranque (0:45)
- `npm create vite@latest . -- --template react` (JS, sin TS). Borrar boilerplate.
- `src/styles/tokens.css` con los tokens de §3 de `CLAUDE.md` tal cual, importado en `main.jsx`.
- `src/data/mock.js`: workspace, canales, DMs, agenda del martes 10 nov, 5 compromisos, tarea nueva "Reporte de ventas", historial de 3 solicitudes (sin la fila "Cancelada" — C3), flag `SHOW_COMPANY_POLICY = false` (C6).
- `src/store/StoreProvider.jsx`: context + `useReducer`, persistencia en `localStorage` (clave `ritmo:v1`), sync con evento `storage` + `BroadcastChannel` como refuerzo.
- Router propio de ~30 líneas sobre `hashchange`. Rutas: `#/`, `#/slack/laura`, `#/slack/miguel`, `#/app`, `#/dot`, `#/control`.
- **Hecho cuando:** `#/` lista las 5 vistas y cada una renderiza un placeholder con el nombre de la pantalla.

### F1 · Shell + panel del moderador (1:15)
- `SlackShell`: title bar, rail, sidebar (canales + DMs + avatar con puntito), área de mensajes, panel derecho de 440px que se abre/cierra. Sin responsive por debajo de 1280px (fuera de alcance).
- `PhoneFrame` 390×844 centrado, con slot para banner push arriba.
- `#/control`: Reset total · Saltar onboarding · Cargar/vaciar historial · reloj simulado visible con los 6 saltos (9:00, 10:12, 11:00, 12:24, 14:00, 18:00) · placeholders de Eventos y Dot · **log con hora**.
- **Hecho cuando:** Reset en `#/control` limpia la vista de Laura abierta en otra pestaña, en vivo. Esto valida el sync antes de construir encima — es el riesgo técnico #1.

### F2 · Núcleo de Laura, T3 (2:00) — *la fase que no se recorta*
Orden de construcción: L-04 primero (es donde vive C1/C2/C6, lo nuevo), luego lo que la alimenta.
- Componente reutilizable **"Quién ve esto"** (ícono ojo + listas "Miguel ve" / "Miguel no ve", 14px, no gris 12px) — C6.
- Componente **`FechaCambio`**: `original (tachada) → nueva`, usado en todas las pantallas de §C2.
- **L-04**: bloque de consentimiento obligatorio, checkbox, botón deshabilitado + "Marca la casilla para enviar". Aplica a los 4 tipos.
- L-01 aviso de choque (+ L-01b "Ahora no"), L-02 tipo de ajuste, L-03/03d/03e/03f, validación L-03b, descartar L-03c, error de envío L-04b, L-05 + L-05b.
- State machine de §7 en el reducer; la solicitud guarda `{id, tipo, compromiso, fechaOriginal, propuesta, nota, tareaNueva, consentimiento, estado, historial[]}`.
- **Hecho cuando:** desde `#/control` → "Disparar aviso de choque" → Laura crea "Modificar plazo", ve `jue 12 nov → lun 16 nov`, marca consentimiento, envía, y la solicitud queda `pendiente` en el store.

### F3 · Miguel y cierre de ciclo, T4 + T5 (1:45)
- `#/slack/miguel`: M-00, M-01 (dice **"Laura pide mover…"**, nunca "alguien de tu equipo" — C1), M-01b recordatorio, M-02 detalle, M-02c confirmar, M-03 (4 variantes), M-04 (3 variantes), M-05/05b/05c, M-06/06b, M-07 + vacío.
- Lado Laura: L-06 comparación **actual · tu propuesta · propuesta de Miguel**, L-07/07b/07c/07d.
- Mis solicitudes: L-08/08b/08c, cancelar L-09 → L-08d, L-09b ya respondida.
- **C3 explícito:** cancelar borra el mensaje del chat de Miguel y baja su contador de pendientes. Nada de pantalla "cancelada" para Miguel.
- Wizard of Oz en `#/control`: "Miguel responde → aceptar / alternativa / rechazar", para moderar sin segundo participante.
- **Hecho cuando:** T4 y T5 corren con Laura y Miguel en dos ventanas, y también con el botón de control en lugar de Miguel.

### F4 · Chat guionado, T2 (1:15)
- Matcher de intenciones de §C4: normalizar (minúsculas, sin tildes), buscar keywords en orden de la tabla, fallback con los 4 chips.
- "RITMO está escribiendo…" 600–900 ms antes de cada respuesta. Mensaje fijo arriba: "Lo que escribes aquí es solo para ti."
- Chips/botones envían el mensaje por el participante (no obliga a escribir).
- Hilo en el store, para que F5 lo reutilice sin tocar lógica.
- **Hecho cuando:** las 10 intenciones responden, el fallback nunca deja al participante sin siguiente paso, y `ajuste` abre el panel L-02.

### F5 · App móvil, T1 (1:45) — *recortable, ver §6*
- Onboarding APP-01/01b → APP-00 → APP-02 → APP-03/03a/03b → APP-04, con el **copy nuevo de C5 palabra por palabra** (nada de "descarga", "cruce", "sincronizar", "estado detallado").
- Tabs Inicio · **Chat** · Solicitar · Historial. APP-05 cambiar color. APP-06 deja claro "Seguir en Slack". APP-07 historial con fechas original → nueva.
- Onboarding de Slack O-01 → O-02/02b → O-03 enlazado por código (el mismo código que pide APP-01).
- **Hecho cuando:** el participante vincula con código, entiende qué se comparte (APP-00 con el copy de C6), configura el Dot y llega a APP-04.

### F6 · RITMO Dot, T6 (1:00)
- `#/dot`: círculo ~60vmin, fondo oscuro, transición 400 ms + pulso, nombre opcional por toggle de control, doble clic = pantalla completa.
- Las **3 señales de C7** salen de un solo `dispatch`: vista Dot + mensaje L-11 en el DM de Laura (con sus 3 botones y la nota "solo ven el color") + banner push 3–4 s en el móvil y tarjeta "Tu Dot" actualizada.
- Puntito de color en el avatar de Laura (sidebar y header del DM de Miguel); nombre del estado en Slack solo si eligió "Luz + nombre en Slack".
- 5 botones de estado en `#/control` + los eventos automáticos (14:00 foco, 11:00 reunión, acuerdo de foco, pausa → Recargando con vuelta a Disponible, fin de jornada).
- **Hecho cuando:** un clic en control cambia las 3 superficies a la vez, en la misma pantalla del moderador.

### F7 · Pulido y ensayo (1:15) — *obligatoria*
- Recorrer §8 criterio por criterio: toques ≥44px en móvil, foco visible con teclado, contraste AA, nada de información solo por color en la app, estados vacíos y de error presentes.
- Correr **T1 → T6 en el navegador** con el setup real de la prueba (Slack en el laptop, móvil en otra ventana, Dot en la tercera).
- Dejar escrito arriba de `#/control` el guion de moderación (qué botón para qué momento).
- Deploy opcional a Vercel/Netlify como estático (solo si todo lo anterior está verde).

---

## 3. Orden de archivos (para no improvisar a las 2 a.m.)

```
src/
  main.jsx  App.jsx            # router hash
  styles/tokens.css  slack.css  app.css
  data/mock.js  intents.js     # tabla C4
  store/StoreProvider.jsx  reducer.js  sync.js
  components/
    QuienVeEsto.jsx  FechaCambio.jsx  Consentimiento.jsx   # C6, C2, C1
    SlackShell.jsx  PanelDerecho.jsx  Mensaje.jsx  BotonesBlockKit.jsx
    PhoneFrame.jsx  BannerPush.jsx  Chat.jsx
  views/
    Indice.jsx  SlackLaura.jsx  SlackMiguel.jsx  AppMovil.jsx  Dot.jsx  Control.jsx
  flows/
    solicitud/  (L-02…L-09b)   respuesta/  (M-01…M-07)   dot/  (L-11x)
```

Los tres componentes de `components/` de la primera línea se construyen **una vez** y se reutilizan en ~15 pantallas. Son el ahorro de tiempo más grande del plan.

---

## 4. Ritual ágil (adaptado a 1 persona + Claude Code)

- **Un commit por fase**, con el gate escrito en el mensaje. Sin git inicializado todavía → `git init` en F0.
- **Demo al final de cada fase:** abrir el navegador y correr el gate. Si el gate falla, la fase no terminó; no se abre la siguiente.
- **Caja de tiempo dura.** Si una fase se pasa 30 min del estimado: parar, anotar lo que falta en §6 y seguir. El prototipo completo es más valioso que una fase perfecta.
- **Backlog de "después de la prueba"** en vez de arreglar en el momento: todo bug cosmético encontrado en F7 se anota, no se arregla, salvo que rompa una tarea T1–T6.

---

## 5. Riesgos y mitigación

| Riesgo | Señal temprana | Mitigación |
|---|---|---|
| Sync entre pestañas se comporta raro | F1 no pasa el gate | Validarlo en F1, antes de construir 30 pantallas encima. `BroadcastChannel` como segundo canal |
| Volumen de pantallas (~60 IDs de Figma) | F2 se pasa de 2 h | Las pantallas son **estados del mismo componente**, no archivos nuevos. Un `<Solicitud estado=…>` cubre L-03 a L-05b |
| Perseguir fidelidad visual con Figma | horas en píxeles, flujo incompleto | Figma solo para F1 (shell) y F5 (móvil). El resto: tokens + texto de `CLAUDE.md` |
| Moderación frágil en la prueba | el moderador duda qué botón tocar | Wizard of Oz en F3 y el guion pegado en `#/control` en F7 |
| Copy viejo que promete anonimato | aparece "alguien de tu equipo" | Al final de F7: buscar en el código `anonim`, `alguien de tu equipo`, `descarga`, `cruce`, `represalia`, `Indicador RITMO` → debe dar 0 resultados |

---

## 6. Lista de corte (en este orden, si el reloj aprieta)

1. O-02b código vencido, L-05b recordatorio de 2 h, M-01b (son estados de borde; el moderador puede narrarlos).
2. APP-03a "Buscar Dot" → saltar directo a APP-03b.
3. Las 4 variantes de M-03 → dejar solo "plazo" y "prioridad".
4. **F5 completa** → el participante hace T1 en Slack (O-01→O-03) y el móvil arranca ya vinculado en APP-04. Se pierde parte de T1, se salva todo lo demás.
5. Nombre del estado debajo del círculo en `#/dot`.

**Nunca se cortan:** el consentimiento de C1, la fecha original → nueva de C2, la desaparición al cancelar de C3, y el ensayo F7.

---

## 7. Checklist de ensayo (F7, correr tal cual antes de la prueba)

- [ ] Reset total deja las 5 vistas limpias y el reloj en 9:00
- [ ] **T1** vincular con código desde el móvil → Slack muestra "App vinculada"
- [ ] **T2** escribir "estoy saturada" → respuesta empática + 3 chips; "organiza mi día" → bloques
- [ ] **T3** 10:12 → aviso de choque → Modificar plazo → se ve `jue 12 nov → lun 16 nov` → botón bloqueado sin checkbox → enviar
- [ ] Miguel ve "**Laura** pide mover Informe mensual", con fecha actual y propuesta
- [ ] **T4** Miguel propone alternativa → Laura compara 3 columnas → acepta → ambos ven el acuerdo
- [ ] **T5** nueva solicitud → Laura cancela → desaparece del chat de Miguel y el contador baja
- [ ] **T6** control → Concentración → círculo cambia + mensaje L-11 en Slack + banner en el móvil
- [ ] Tab por teclado: foco visible en el checkbox de consentimiento y en "Enviar a Miguel"
- [ ] El log de `#/control` tiene hora en cada evento (sirve de notas de la sesión)
```


---

## 8. Cierre de F7 · qué se revisó

**Copy prohibido** (`anonim`, `alguien de tu equipo`, `descarga`, `cruce`, `represalia`, `Indicador RITMO`,
`estado detallado`): cero apariciones en texto de interfaz. Lo único que quedó fue el vacío de M-07, que ahora dice
"Cuando alguien del equipo pida un ajuste, te llega aquí con su nombre y el compromiso que quiere mover". Las demás
coincidencias son comentarios del código que explican la corrección.

**Criterios de §8**

- **Áreas táctiles ≥ 44 px:** medidas en el marco del teléfono, descontando la escala; la única que faltaba era la ✕
  del banner push (32 px), ahora 44.
- **Foco visible con teclado:** anillo violeta global; sobre el morado del sidebar de Slack el anillo pasa a blanco,
  donde el violeta no contrastaba.
- **Contraste AA:** `--neutral-500` dejó de usarse para texto (tabs, "RITMO está escribiendo…", fechas, pistas del
  panel) y pasó a `--neutral-600`; el gris de Slack `#ffffff8c` del sidebar subió a `#ffffffb3` y el rojo de los
  botones de peligro a `#c0143c`.
- **Nada solo por color:** el Dot viaja siempre con su nombre (en `#/dot`, en el mensaje de Slack, en la tarjeta del
  teléfono y en el `title` del avatar); las etiquetas de estado llevan texto.
- **Estados vacíos y de error:** L-08b, M-07 vacío, APP-07 vacío, validación L-03b, error de envío L-04b y código
  vencido APP-01b, todos presentes y disparables desde `#/control`.

**Corregido durante el ensayo**

- "Mis solicitudes" (L-08) no mostraba las fechas: ahora cada fila lleva `original → la que queda en firme` (C2).
- Una solicitud acordada del historial de ejemplo mostraba la flecha sin destino, porque no guarda alternativa de
  Miguel; ahora cae en la propuesta de Laura.

**Recorrido T1–T6** (tres ventanas, mismo navegador): vincular con código y configurar el Dot · chat por palabras
clave con chips · aviso de choque, consentimiento y envío · alternativa de Miguel, comparación de tres fechas y
acuerdo · cancelación que desaparece de la bandeja de Miguel y baja el contador · cambio de Dot con luz, mensaje en
Slack y aviso en el teléfono.
