# Prompt inicial para Claude Code

Copia y pega esto en Claude Code, abierto en la carpeta `RITMO-prototipo` (donde está `CLAUDE.md`).

---

Lee `CLAUDE.md` completo. Vamos a construir el prototipo de pruebas de usabilidad de RITMO: Slack simulado (Laura y Miguel), app móvil en marco de teléfono, RITMO Dot y panel del moderador, todo sincronizado entre ventanas con localStorage.

Reglas:
- Mega simple: Vite + React en JavaScript, CSS plano con los tokens del CLAUDE.md, sin backend, sin librerías de UI.
- Las correcciones C1–C7 de la sección 5 mandan sobre Figma. Si algo de Figma las contradice, sigue el CLAUDE.md.
- Si tienes el MCP de Figma, usa `get_screenshot` / `get_design_context` con los node IDs de la sección 6 para la fidelidad visual, pero el texto sale del CLAUDE.md.
- Trabaja por fases y muéstrame cómo correrlo al final de cada una. No pases a la siguiente sin que yo confirme.

Fases:
1. **Base:** proyecto Vite, tokens, store global con sync entre pestañas, rutas hash (`#/`, `#/slack/laura`, `#/slack/miguel`, `#/app`, `#/dot`, `#/control`), shell de Slack (title bar, rail, sidebar, área de mensajes, panel derecho) y marco de teléfono. Panel de control con Reset y reloj simulado.
2. **Flujo núcleo (T3–T5):** aviso de choque → tipo de ajuste → formulario (los 4 tipos) → vista previa con "Quién ve esto" + consentimiento obligatorio (C1, C2, C6) → enviar → vista de Miguel (aceptar / alternativa / rechazar) → resultados en ambos lados → Mis solicitudes / cancelar (C3). Incluye estados de error, vacío y validación.
3. **Chat funcional (C4):** bot guionado por intenciones en el DM de Laura y en la pestaña Chat del móvil, mismo hilo.
4. **App móvil (T1):** onboarding APP-01 → APP-00 → APP-02 → APP-03/03a/03b → APP-04 con el copy nuevo de C5; tabs Inicio · Chat · Solicitar · Historial; onboarding de Slack O-01 → O-03 conectado con el código.
5. **RITMO Dot (C7):** vista `#/dot`, eventos desde control, mensaje en Slack + banner push en el móvil + puntito de color en avatares.
6. **Pulido para la prueba:** revisa los criterios de la sección 8 uno por uno, recorre T1–T6 en el navegador y dime qué falla.

Empieza con la fase 1.
