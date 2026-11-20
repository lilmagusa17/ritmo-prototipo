/* Marca de RITMO ("Rhythm Mark" del Figma): cuatro barras con los colores del Dot.
   Va donde Slack pondría el avatar de la app, para que no se confunda con una persona. */

export default function MarcaRitmo({ tam = 20, titulo = 'RITMO' }) {
  return (
    <svg
      className="marca-ritmo"
      width={tam}
      height={tam}
      viewBox="0 0 24 24"
      role="img"
      aria-label={titulo}
      focusable="false"
    >
      <rect x="2" y="7" width="3.2" height="10" rx="1.6" fill="var(--dot-disponible)" />
      <rect x="7.4" y="3" width="3.2" height="18" rx="1.6" fill="var(--violet-500)" />
      <rect x="12.8" y="6" width="3.2" height="12" rx="1.6" fill="var(--dot-concentracion)" />
      <rect x="18.2" y="9.5" width="3.2" height="5" rx="1.6" fill="var(--dot-reunion)" />
    </svg>
  );
}
