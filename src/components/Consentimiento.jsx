/* C1 · Consentimiento explícito y en contexto, antes de "Enviar a Miguel".
   Se eliminó la promesa de anonimato: si Laura pide mover SU informe, Miguel la reconoce.
   Aplica a los 4 tipos de ajuste: todos revelan un compromiso de Laura. */

export default function Consentimiento({ marcado, onCambio, id = 'consentimiento' }) {
  return (
    <section className="consentimiento">
      <h4>Miguel sabrá que esta solicitud es tuya</h4>
      <p>Para ajustar un compromiso, Miguel necesita ver cuál es y su fecha. Eso le permite reconocerte.</p>
      <label className="consentimiento-check" htmlFor={id}>
        <input id={id} type="checkbox" checked={marcado} onChange={(e) => onCambio(e.target.checked)} />
        <span>Entiendo y quiero compartir este compromiso con Miguel</span>
      </label>
    </section>
  );
}
