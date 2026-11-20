# RITMO · Prototipo en código para pruebas con usuarios

> Contexto persistente para Claude Code. Léelo completo antes de escribir código.
> Esto es un **prototipo de pruebas de usabilidad**, no un producto. Prioridad: que se sienta real para el participante y que el moderador lo controle fácil. Cero sobreingeniería.

---

## 1. Qué es RITMO

Asistente de organización personal que vive en Slack (plugin) + app móvil compañera + una luz física de escritorio (**RITMO Dot**, "la bolita").

- **Laura** (usuaria principal, trabajadora con sobrecarga): organiza su día con RITMO en un chat, recibe avisos cuando una tarea nueva choca con sus compromisos y, si quiere, pide un ajuste a su coordinador.
- **Miguel** (coordinador, complementario): recibe solicitudes de ajuste y responde (aceptar, proponer alternativa, rechazar).
- **RITMO Dot**: luz que muestra el estado de Laura (Disponible, Concentración, En reunión, Recargando, Apagado). El equipo ve el color, nunca la razón.

**Función principal = chat de organización personal.** Las solicitudes de ajuste son una función secundaria que nace del chat o de un aviso de choque.

Proyecto académico (Diseño de Experiencias, Icesi). Idioma de toda la UI: **español (Colombia)**, tuteo.

---

## 2. Stack (mega simple)

- **Vite + React (JavaScript, sin TypeScript)**. CSS plano con variables (sin Tailwind, sin UI kits).
- **Sin backend.** Un solo store global (React context + `useReducer`) persistido en `localStorage`.
- **Sincronización entre ventanas** con el evento `storage` de `window` (o `BroadcastChannel`): lo que hace Laura en una pestaña aparece en la de Miguel, la app móvil y el Dot.
- **Rutas con hash** (sin react-router si no hace falta):
  - `#/slack/laura` → Slack simulado, vista de Laura
  - `#/slack/miguel` → Slack simulado, vista de Miguel
  - `#/app` → app móvil dentro de un marco de teléfono (390×844), centrado
  - `#/dot` → RITMO Dot a pantalla completa (para ponerlo en una tablet/segunda pantalla junto al participante)
  - `#/control` → panel del moderador (no lo ve el participante)
  - `#/` → índice con links a todo lo anterior
- Datos mock en un archivo `src/data/mock.js`. Nada de APIs externas.
- Fuente: **Plus Jakarta Sans** (Google Fonts) para la app móvil; Slack simulado usa `Lato`/system-ui para parecer Slack.
- Debe correr con `npm install && npm run dev`. Deploy opcional a Vercel/Netlify como sitio estático.

> Limitación conocida: `localStorage` sincroniza solo ventanas del **mismo navegador y computador**. Para la prueba: Slack en el laptop, app móvil en otra ventana con marco de teléfono (o Chrome DevTools en modo dispositivo), Dot en una tercera ventana. Si luego se quiere el teléfono real, se agrega un backend mínimo; **no lo hagas ahora**.

---

## 3. Fuente de diseño: Figma

- File key: `w69L7Tyt7R5cRws4GmXl1R` · página `Prototype` (`57:9324`)
- Si tienes el MCP de Figma, usa `get_design_context` / `get_screenshot` por pantalla para fidelidad visual. **El texto y la lógica de este documento mandan sobre Figma** (Figma aún no tiene las correcciones de la sección 5).

### Tokens (de las variables de Figma)

```css
:root{
  /* RITMO (app móvil) */
  --violet-500:#6d4aff; --violet-600:#5b37e8; --violet-700:#4729c7; --violet-100:#eee9ff; --violet-50:#f5f2ff;
  --neutral-0:#ffffff; --neutral-50:#fbfaff; --neutral-100:#f3f0fa; --neutral-200:#e5e0ef; --neutral-300:#d0c9dc;
  --neutral-500:#81788e; --neutral-600:#635b70; --neutral-900:#211a2e;
  --teal-500:#22b8a7; --green-100:#e5f7ec; --green-600:#0e8f70; --amber-100:#fff3d6; --amber-700:#9b5e00;
  --red-100:#fde8e8; --red-600:#d9415b; --blue-100:#e6f1ff; --blue-600:#2e6fd8;
  /* Estados del Dot */
  --dot-disponible:#2ba97f; --dot-concentracion:#e45970; --dot-reunion:#4686e6; --dot-recargando:#6d4aff; --dot-apagado:#aaa1b7;
  /* Slack host */
  --slack-titlebar:#2c0929; --slack-sidebar:#3f0f3f; --slack-sidebar-search:#5a3c5a; --slack-active:#1164a3;
  --slack-online:#2faa75; --slack-link:#1264a3; --slack-btn-primary:#007a5a; --slack-danger:#e01e5a; --slack-warning:#daa038;
  /* Escalas */
  --space-4:4px; --space-8:8px; --space-12:12px; --space-16:16px; --space-24:24px; --space-32:32px;
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-full:999px;
  --touch-min:44px;
}
```

Regla de marca: **dentro de Slack, los mensajes de RITMO usan estilo nativo de Slack** (Block Kit: botones verdes/grises, attachments con barra lateral, panel lateral derecho para formularios). La marca violeta de RITMO vive en la app móvil.

---

## 4. Datos mock

- Workspace: **Equipo Operaciones**. Canales: general, operaciones, comercial. DMs: Miguel, Camila.
- Hoy (fecha ficticia del prototipo): **martes 10 de noviembre**.
- Agenda de Laura hoy: 9:30 Daily (15 min) · 11:00 Reunión con Comercial · 14:00–16:00 Bloque de foco: Informe mensual · 16:30 1:1 con Miguel.
- Compromisos de Laura: **Informe mensual** (entrega jue 12 nov), Plan trimestral, Presentación a cliente, Cierre de inventario, Plan de capacitación.
- Tarea nueva que dispara el aviso: **Reporte de ventas para Comercial** (entrega jue 12 nov) → choca con Informe mensual.
- Historial de solicitudes (para "Mis solicitudes" / APP-07): 9 nov Plan de capacitación · Modificar plazo (vie 4 dic → vie 11 dic) · Pendiente; 9 nov Cierre de inventario · Redistribuir carga · Pendiente; 3 nov Plan trimestral · Reorganizar prioridad · Acordada; 28 oct Proteger tiempo de foco · Sin acuerdo. *(Quita la fila "Cancelada" de 20 oct — ver corrección 3.)* Las dos pendientes del 9 nov son las que el protocolo de prueba v2 usa para cancelar (T6) y rechazar (T7); ninguna toca el Informe mensual, que es el de la solicitud creada en vivo.

---

## 5. Correcciones del equipo (OBLIGATORIAS — sobrescriben Figma)

### C1 · Consentimiento antes de que Miguel vea la solicitud
**Contexto:** antes RITMO prometía que Miguel no sabría quién pedía el ajuste. Eso es falso en la práctica: si Laura pide mover *su* Informe mensual, Miguel la reconoce. Se elimina la promesa de anonimato y se reemplaza por **consentimiento explícito y en contexto**.

- En **Vista previa (L-04)**, antes de "Enviar a Miguel", agrega un bloque obligatorio:
  - Título: **"Miguel sabrá que esta solicitud es tuya"**
  - Texto: "Para ajustar un compromiso, Miguel necesita ver cuál es y su fecha. Eso le permite reconocerte."
  - Checkbox: **"Entiendo y quiero compartir este compromiso con Miguel"**.
  - "Enviar a Miguel" queda **deshabilitado** hasta marcar el checkbox. Junto al botón deshabilitado, texto de ayuda: "Marca la casilla para enviar".
- Aplica a **los 4 tipos de ajuste** (todos revelan un compromiso de Laura).
- La solicitud **no existe para Miguel** hasta que Laura confirma y envía.
- En la vista de Miguel, la solicitud ya **muestra el nombre**: "Laura pide mover Informe mensual…". Reemplaza todo "Alguien de tu equipo" / "Quien pidió el ajuste" por **"Laura"**.
- Actualiza todo copy que prometía anonimato (ver C6).

### C2 · Mostrar siempre la fecha original
Toda propuesta de mover fecha muestra **original → nueva**, con la original tachada o en gris:
`Informe mensual: jueves 12 nov → lunes 16 nov`
Aplica en: L-03 (formulario), L-04 (vista previa), L-05 (lo que enviaste), M-01 (mensaje a Miguel), M-02 (detalle), M-02c (confirmar), M-03 (proponer alternativa: muestra original, propuesta de Laura y campo de alternativa), L-06 (comparación: "Fecha actual · Tu propuesta · Propuesta de Miguel"), L-07, Mis solicitudes / APP-07.
Para "Proteger tiempo de foco": muestra qué reuniones/hora se mueven ("Hoy 14:00–16:00 · antes: libre para reuniones").

### C3 · Quitar "cancelado" de Miguel
- Elimina la pantalla **M-02b Solicitud cancelada** y cualquier estado "Cancelada" en la vista de Miguel (M-07 incluido).
- Si Laura cancela mientras está Pendiente: el mensaje de la solicitud **desaparece** del chat de Miguel y de su lista "Pendientes de responder". El contador baja.
- Copy de Laura al cancelar (L-09): "¿Cancelar tu solicitud? Se quitará de la bandeja de Miguel y nada cambiará." Confirmación (L-08d): "Solicitud cancelada. Ya no aparece en la bandeja de Miguel."
- Si Miguel ya respondió, se mantiene L-09b ("Miguel ya respondió · Ver respuesta").

### C4 · Chat "funcional" (función principal)
El composer "Escribe un mensaje a RITMO" en el DM de Laura **funciona**. Bot guionado por intenciones (palabras clave, sin LLM) para que todas las sesiones de prueba sean comparables.
Mensaje fijo arriba del chat: "Lo que escribes aquí es solo para ti."

| Intención (keywords, sin tildes/minúsculas) | Respuesta de RITMO |
|---|---|
| `hoy`, `agenda`, `que tengo` | Lista la agenda de hoy con horas + botón "Organizar mi día" |
| `organiza`, `prioriza`, `plan`, `orden` | Propone orden del día en bloques (usa agenda + compromisos), botones "Me sirve" / "Cambiar orden" |
| `semana`, `entregas`, `pendientes` | Lista compromisos con fecha; marca en ámbar los que chocan |
| `saturad`, `no alcanzo`, `mucho trabajo`, `estres`, `cansad` | Respuesta empática corta (sin diagnosticar) + chips: "Ver choques", "Proteger tiempo de foco", "Tomar una pausa" |
| `pausa`, `descanso` | Sugiere pausa de 10 min y ofrece poner el Dot en Recargando (botón) |
| `ajuste`, `mover`, `plazo`, `solicitud` | "¿Qué compromiso quieres ajustar?" + abre el panel de solicitud (L-02) |
| `mis solicitudes`, `estado`, `respondio` | Resumen de solicitudes y su estado + botón "Ver mis solicitudes" |
| `dot`, `luz`, `indicador`, `color` | Muestra estado actual del Dot + botones de colores |
| `hola`, `gracias` | Saludo corto |
| (fallback) | "Todavía no sé hacer eso. Puedo ayudarte a:" + chips: Ver mi día · Organizar mi día · Pedir un ajuste · Cambiar mi Dot |

- Los chips/botones también envían el mensaje (el participante no tiene que escribir si no quiere).
- Indicador "RITMO está escribiendo…" de 600–900 ms antes de cada respuesta.
- El mismo hilo se ve en la app móvil (pestaña **Chat**). Estado compartido.

### C5 · Copy de configuración inicial más claro (app móvil)
| Antes | Después |
|---|---|
| "Descarga" / "Empezar descarga" / "Tu descarga personal nunca se comparte" | Pestaña **Chat**. Tarjeta: "**Habla con RITMO** — Cuéntale qué tienes pendiente y te ayuda a ordenarlo. Solo tú lo ves." Botón "Escribir" |
| APP-04: "Organiza lo que pesa y conviértelo en una solicitud concreta." | "Ordena tu día y pide un ajuste cuando algo no cabe." |
| "Indicador RITMO" (en todas partes) | **RITMO Dot** |
| "Avisos de cruce — Cuando una tarea nueva choque con tu agenda." | "**Choques de fechas** — Cuando una tarea nueva cae el mismo día que otra entrega tuya." |
| "Sincroniza la luz con" | "La luz cambia sola según:" |
| "Acuerdos activos de RITMO — Se muestra como Concentración, sin decir por qué." | "**Ajustes acordados con Miguel** — Si acordaron tiempo de foco, la luz se pone en Concentración." |
| "¿Quién ve el estado detallado? Todos ven el color. El estado detallado es el nombre del color en Slack; nunca la razón." | "**¿Tu equipo ve el nombre del estado?** Todos ven la luz. Elige si en Slack también ven el nombre (ej. "Concentración"). La razón nunca se muestra." Opciones: "Solo la luz" / "Luz + nombre en Slack" |
| "Calendario de trabajo — Lo comparo solo para ti, nadie más lo ve." | "Calendario de trabajo — Lo uso para detectar choques de fechas. Nadie más ve tu agenda." |
| APP-05: "…vuelve a sincronizarse con tu próximo evento." | "Vuelve a cambiar sola en tu próximo evento (11:00 · Reunión con Comercial)." |

Regla general: verbos concretos, una idea por línea, sin jerga interna ("cruce", "descarga", "sincronizar", "estado detallado").

### C6 · Notificaciones de privacidad transparentes
Reemplaza eslóganes ("Tu agenda es solo tuya", "Nadie más ve…") por un componente reutilizable **"Quién ve esto"**: ícono de ojo + dos listas cortas **"Miguel ve"** / **"Miguel no ve"**, en tamaño de texto normal (14px, no 12px gris).

| Pantalla | Copy nuevo |
|---|---|
| L-01 aviso de choque | "Solo tú ves este aviso. Miguel no sabe nada hasta que tú envíes una solicitud." |
| L-04 vista previa | **Miguel ve:** tu nombre, el compromiso, su fecha actual, tu propuesta, tu nota (si escribes una) y la tarea nueva que choca. **Miguel no ve:** tu agenda completa, tus otros compromisos ni tus conversaciones con RITMO. + checkbox de C1 |
| APP-00 alerta | "**Qué compartes y cuándo.** Tu agenda y tus chats con RITMO son solo tuyos. Si envías una solicitud, Miguel verá tu nombre y el compromiso que quieres ajustar. Siempre lo revisas antes." |
| O-01 bienvenida | Bullets: "Comparo tus tareas nuevas con tu agenda." · "Tu agenda y este chat son solo tuyos." · "Miguel solo ve lo que tú decidas enviarle, con tu nombre." · "Nada se envía sin que lo confirmes." |
| OM-01 bienvenida Miguel | "Verás quién envía cada solicitud y solo el compromiso que quiere ajustar. No verás su agenda ni sus conversaciones con RITMO." |
| Dot (L-11, APP-03b) | Se mantiene: "Tu equipo solo ve el color, no la razón." |

- **Quita "Acuerdo de no represalia: pedir un ajuste no tiene consecuencias para ti."** RITMO no puede garantizar eso. Si el equipo lo quiere, se formula como política de la empresa: "Tu empresa se comprometió a que pedir un ajuste no tenga consecuencias." (dejarlo detrás de un flag `SHOW_COMPANY_POLICY` en `mock.js`, por defecto `false`).

### C7 · Notificaciones del RITMO Dot (para que la simulación se note)
Cada cambio del Dot produce **tres señales sincronizadas**:
1. **`#/dot`**: círculo grande del color, transición suave de 400 ms + un pulso; nombre del estado debajo en texto pequeño (opcional, toggle en control).
2. **Slack (DM de Laura)**: mensaje de RITMO con el patrón L-11: "Tu Dot pasó a **Concentración** porque empezó tu bloque de Informe mensual. ¿Lo mantengo así hasta las 16:00?" Botones: "Sí, mantener" · "Cambiar color" · "Apagar". Nota: "Tu equipo solo ve el color, no la razón."
3. **App móvil**: banner tipo push arriba del marco del teléfono (3–4 s, tap abre APP-04/APP-05) + la tarjeta "Tu Dot" de APP-04 se actualiza.

Además, en Slack el avatar de Laura (sidebar y header del DM de Miguel) muestra un puntito del color del Dot, y si Laura eligió "Luz + nombre en Slack", su estado de Slack muestra el nombre.

Eventos que cambian el Dot (disparables desde `#/control`):
- Empieza bloque de foco (14:00) → Concentración
- Empieza reunión (11:00) → En reunión
- Miguel acepta un ajuste de tipo "Proteger tiempo de foco" → Concentración
- Laura toma pausa (desde chat) → Recargando (vuelve a Disponible en 10 min simulados)
- Fin de jornada → Apagado
- Cambio manual desde APP-05 o desde Slack → color elegido

---

## 6. Pantallas por superficie

Mantén nombres/IDs de Figma en comentarios para trazabilidad.

### Slack · Laura (`#/slack/laura`)
Layout fijo: title bar · rail · sidebar · área principal · panel derecho (se abre para formularios, 440px).
- **Onboarding:** O-01 Bienvenida (`125:15167`) → O-02 Conecta tu app con código (`125:15360`), O-02b código vencido (`125:15711`) → O-03 App vinculada (`125:16071`)
- **Inicio:** L-00 (`85:6269`) + chat funcional (C4)
- **Aviso de choque:** L-01 (`68:5373`) · "Ahora no" → L-01b (`85:6503`)
- **Solicitud (panel derecho):** L-02 tipo de ajuste (`90:6161`) → L-03 Modificar plazo (`90:6272`) / L-03d prioridad (`91:6770`) / L-03e foco (`91:6866`) / L-03f redistribuir (`91:6969`) · validación L-03b (`91:6666`) · descartar L-03c (`91:7072`) → **L-04 vista previa con consentimiento** (`97:7589`) · error L-04b (`97:7703`)
- **Seguimiento:** L-05 enviada (`97:7821`) · L-05b sigue pendiente 2 h (`97:8038`) · L-06 alternativa recibida (`100:9271`) · L-07 acordada (`100:9483`) · L-07b sin acuerdo (`100:9697`) · L-07c aceptada directo (`117:14638`) · L-07d rechazaste alternativa (`118:14891`)
- **Mis solicitudes:** L-08 (`101:9380`) · vacío L-08b (`101:9669`) · detalle L-08c (`101:9844`) · cancelar L-09 (`104:10502`) → L-08d (`105:10716`) · ya respondida L-09b (`104:10719`)
- **Dot:** L-11 / L-11b / L-11c (`125:16488`, `148:17257`, `148:17458`)

### Slack · Miguel (`#/slack/miguel`)
- OM-01 bienvenida (`125:16298`) · M-00 inicio (`105:10934`)
- M-01 solicitud recibida (`105:11193`) · M-01b recordatorio (`105:11397`)
- M-02 detalle (`106:11051`) · M-02c confirmar aceptación (`106:11270`)
- M-03 proponer alternativa: plazo / sin fecha / prioridad / redistribuir (`109:12949`, `109:13047`, `109:13150`, `109:13242`)
- M-04 rechazar: razones / otra razón / sin razón elegida (`109:13343`, `111:12792`, `148:17659`)
- M-05 / M-05b / M-05c confirmaciones (`111:13092`, `111:13313`, `111:13531`) · M-06 / M-06b resultados (`111:13750`, `111:13979`)
- M-07 solicitudes del equipo + vacío (`114:15381`, `114:15733`)
- ~~M-02b solicitud cancelada~~ → **eliminada (C3)**

### App móvil (`#/app`)
Orden del flujo: APP-01 Vincular (`126:16974`) / APP-01b vencido (`126:17016`) → APP-00 Configuración inicial (`82:5684`) → APP-02 Avisos (`126:17069`) → APP-03 ¿Tienes un RITMO Dot? (`127:17057`) → APP-03a Buscar (`127:17087`) → APP-03b Configura tu Dot (`127:17124`) → APP-04 Inicio (`127:17214`)
Tabs: **Inicio · Chat · Solicitar · Historial**. APP-05 Cambiar color (`127:17268`), APP-06 Solicitar (`149:17951` — deja claro que la solicitud se completa en Slack: "Seguir en Slack"), APP-07 Historial (`149:18037`), ~~APP-08 Descarga~~ → reemplazada por **Chat** (C4/C5).

### Dot (`#/dot`)
Círculo de ~60vmin centrado sobre fondo oscuro neutro. Sin texto por defecto. Doble clic = pantalla completa.

### Control del moderador (`#/control`)
Botones grandes, agrupados:
- **Escenario:** Preparar sesión (deja todo listo para la tarea 1 del protocolo: sin onboarding, con historial, reloj 9:00) · Reset total · Saltar onboarding · Cargar historial de ejemplo / vaciar historial
- **Tiempo simulado:** reloj visible; botones 9:00 · 10:12 (llega tarea nueva → L-01) · 11:00 · 12:24 (+2 h sin respuesta → L-05b/M-01b) · 14:00 · 18:00
- **Eventos:** Disparar aviso de choque · Miguel responde (aceptar / alternativa / rechazar) como Wizard of Oz si no hay segundo participante · Error de envío en el próximo envío · Código vencido en el próximo vínculo
- **Dot:** botones de los 5 estados (disparan C7)
- **Log** de eventos con hora (para notas de la prueba)
Reemplaza los atajos de teclado de Figma (E/T/R/C) por estos botones; mantén los atajos como extra. Reset total pide **Shift+R**: con la `r` sola, una tecla suelta borraba la sesión.

---

## 7. Lógica de la solicitud (state machine)

```
borrador → pendiente → aceptada                    → Laura: L-07c · Miguel: M-05b
                     → alternativa → acordada      → Laura: L-07 · Miguel: M-06
                                   → rechazó_alt   → Laura: L-07d · Miguel: M-06b
                     → rechazada                   → Laura: L-07b · Miguel: M-05c
                     → cancelada (solo si pendiente) → Laura: L-08d · Miguel: desaparece (C3)
```
- Una solicitud guarda: `id, tipo, compromiso, fechaOriginal, propuesta, nota, tareaNueva, consentimiento:true, estado, historial[{at, actor, accion}]`.
- RITMO nunca cambia nada por su cuenta: solo Laura y Miguel cambian estados.
- Al llegar a "acordada"/"aceptada" con tipo foco → evento Dot (C7).

---

## 8. Criterios de aceptación (lo que debe soportar la prueba)

1. **T1 · Configurar:** vincular app con código, entender qué se comparte, configurar el Dot. (móvil + Slack)
2. **T2 · Organizar el día:** usar el chat para ver y ordenar el día. (Slack o móvil)
3. **T3 · Pedir ajuste:** desde el aviso de choque, crear "Modificar plazo", ver fecha original → nueva, **dar consentimiento** y enviar.
4. **T4 · Negociar:** Miguel propone alternativa; Laura compara (actual · suya · de Miguel) y acepta. El Dot reacciona si aplica.
5. **T5 · Cancelar:** cancelar una pendiente; verificar que desaparece para Miguel.
6. **T6 · Dot:** el participante nota el cambio de color y lo relaciona con la notificación en Slack y en el teléfono.

Calidad mínima: botones ≥ 44px en móvil, foco visible con teclado, contraste AA en texto, ningún dato solo por color en la app (el Dot físico sí es solo color, por diseño), estados vacíos y de error presentes.

## 9. Fuera de alcance
Login real, APIs de Slack/Google/BLE, backend, base de datos, tests automatizados, i18n, modo oscuro, responsive de Slack por debajo de 1280px.
