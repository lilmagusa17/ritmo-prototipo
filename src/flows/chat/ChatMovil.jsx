/* Pestaña Chat de la app móvil (C4/C5).
   Mismo hilo que el DM de Slack: lo que escribe aquí aparece allá y al revés. */

import { useState } from 'react';
import useChatRitmo from './useChatRitmo.js';
import { dotPorId } from '../../data/mock.js';

export default function ChatMovil() {
  const { enviar, accion, escribiendo, hilo } = useChatRitmo();
  const [texto, setTexto] = useState('');

  const mandar = () => {
    if (!texto.trim()) return;
    enviar(texto);
    setTexto('');
  };

  return (
    <>
      <p style={{ color: 'var(--neutral-600)', fontSize: 13, margin: '0 0 var(--space-12)' }}>
        🔒 Lo que escribes aquí es solo para ti.
      </p>

      {hilo.length === 0 && (
        <div className="tarjeta">
          <h3>Habla con RITMO</h3>
          <p>Cuéntale qué tienes pendiente y te ayuda a ordenarlo. Solo tú lo ves.</p>
          <div className="chips-movil">
            {['Ver mi día', 'Organizar mi día', 'Pedir un ajuste'].map((t) => (
              <button key={t} className="chip-movil" onClick={() => enviar(t.toLowerCase())}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-movil">
        {hilo.map((m) => (
          <div key={m.id}>
            <div className={`burbuja burbuja--${m.de === 'laura' ? 'laura' : 'ritmo'}`}>
              {m.texto}
              {m.attachment && (
                <div className="adjunto">
                  {m.attachment.titulo && <strong>{m.attachment.titulo}</strong>}
                  {m.attachment.dot && (
                    <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="bolita" style={{ background: dotPorId(m.attachment.dot).color }} aria-hidden="true" />
                      <strong style={{ display: 'inline' }}>{dotPorId(m.attachment.dot).nombre}</strong>
                    </p>
                  )}
                  {m.attachment.fecha && (
                    <p style={{ margin: 0 }}>
                      <span style={{ textDecoration: 'line-through', color: 'var(--neutral-500)' }}>
                        {m.attachment.fecha.original}
                      </span>{' '}
                      → <strong style={{ display: 'inline' }}>{m.attachment.fecha.nueva}</strong>
                    </p>
                  )}
                  {m.attachment.comparacion && (
                    <p style={{ margin: 0 }}>
                      Actual: {m.attachment.comparacion.actual} · Tu propuesta: {m.attachment.comparacion.tuya} ·
                      Miguel: {m.attachment.comparacion.deMiguel}
                    </p>
                  )}
                  {(m.attachment.lineas || []).map((l) => (
                    <p key={l} style={{ margin: 0 }}>
                      {l}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {m.attachment?.acciones && (
              <div className="chips-movil" style={{ marginTop: 'var(--space-8)' }}>
                {m.attachment.acciones.map((b) => (
                  <button
                    key={b.id}
                    className="chip-movil"
                    onClick={() => accion(b.id, m.attachment.solicitudId)}
                  >
                    {b.texto}
                  </button>
                ))}
              </div>
            )}

            {m.chips && (
              <div className="chips-movil" style={{ marginTop: 'var(--space-8)' }}>
                {m.chips.map((c) => (
                  <button key={c.texto} className="chip-movil" onClick={() => enviar(c.envia)}>
                    {c.texto}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {escribiendo && (
          <p className="escribiendo-movil" role="status">
            RITMO está escribiendo…
          </p>
        )}
      </div>

      <div className="composer-movil">
        <textarea
          placeholder="Escríbele a RITMO"
          aria-label="Escríbele a RITMO"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              mandar();
            }
          }}
        />
        <button onClick={mandar} disabled={!texto.trim()}>
          Enviar
        </button>
      </div>
    </>
  );
}
