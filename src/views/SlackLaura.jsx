/* Slack simulado · vista de Laura.
   Fase 1: shell + L-00 Inicio (85:6269). Fase 2: flujo de solicitud en el panel derecho.
   Fase 4: el composer empieza a responder (C4). */

import { useState } from 'react';
import SlackShell from '../components/SlackShell.jsx';
import { Mensaje, Attachment, Acciones, BotonSlack, DiaSeparador } from '../components/Mensaje.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { AGENDA_HOY, HOY, COMPROMISOS } from '../data/mock.js';

function ComposerLaura() {
  const [texto, setTexto] = useState('');
  return (
    <>
      <p className="composer-nota">
        <span aria-hidden="true">🔒</span> Lo que escribes aquí es solo para ti.
      </p>
      <div className="composer-caja">
        <textarea
          placeholder="Escribe un mensaje a RITMO"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Escribe un mensaje a RITMO"
        />
        <div className="composer-pie">
          <span className="hora" style={{ color: '#616061', fontSize: 12 }}>
            Responde desde la fase 3 del prototipo
          </span>
          <button className="composer-enviar" disabled={!texto.trim()}>
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}

function CanalDemo({ nombre }) {
  return (
    <>
      <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>
      <Mensaje autor="camila" hora="9:12">
        <p>Buenos días 👋 Dejo aquí el avance de la semana en #{nombre}.</p>
      </Mensaje>
      <Mensaje autor="miguel" hora="9:20">
        <p>Gracias, Camila. Lo reviso después del daily.</p>
      </Mensaje>
    </>
  );
}

export default function SlackLaura() {
  const { estado } = useStore();
  const [conv, setConv] = useState({ tipo: 'dm', id: 'ritmo' });
  const informe = COMPROMISOS[0];

  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';

  return (
    <SlackShell
      lado="laura"
      conversacion={conv}
      onConversacion={setConv}
      tituloPanel="Pedir un ajuste"
      panel={<p className="vacio">El flujo de solicitud se construye en la fase 2.</p>}
      composer={esRitmo ? <ComposerLaura /> : null}
    >
      {esRitmo ? (
        <>
          <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>

          <Mensaje hora="9:00">
            <p>Buenos días, Laura. Este es tu día:</p>
            <Attachment titulo={`Tu agenda · ${HOY.largo}`}>
              {AGENDA_HOY.map((e) => (
                <p key={e.id}>
                  <strong>{e.hora}</strong> · {e.titulo} <span style={{ color: '#616061' }}>({e.duracion})</span>
                </p>
              ))}
            </Attachment>
            <Attachment titulo="Tu próxima entrega" tono="ambar" pie="Solo tú ves esto.">
              <p>
                {informe.titulo} · <strong>{informe.fecha}</strong>
              </p>
            </Attachment>
            <Acciones>
              <BotonSlack variante="primario" disabled>
                Organizar mi día
              </BotonSlack>
              <BotonSlack disabled>Ver mis entregas</BotonSlack>
            </Acciones>
          </Mensaje>

          <Mensaje hora={estado.reloj}>
            <p style={{ color: '#616061' }}>
              Fase 1 lista: shell de Slack. El aviso de choque llega en la fase 2 y el chat responde en la fase 3.
            </p>
          </Mensaje>
        </>
      ) : (
        <CanalDemo nombre={conv.id} />
      )}
    </SlackShell>
  );
}
