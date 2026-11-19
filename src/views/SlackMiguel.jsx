/* Slack simulado · vista de Miguel.
   Fase 1: shell + M-00 Inicio (105:10934). Fase 3: solicitudes recibidas y respuestas. */

import { useState } from 'react';
import SlackShell from '../components/SlackShell.jsx';
import { Mensaje, Attachment, Acciones, BotonSlack, DiaSeparador } from '../components/Mensaje.jsx';
import { useStore } from '../store/StoreProvider.jsx';
import { pendientesDeMiguel } from '../store/reducer.js';
import { HOY } from '../data/mock.js';

export default function SlackMiguel() {
  const { estado } = useStore();
  const [conv, setConv] = useState({ tipo: 'dm', id: 'ritmo' });
  const pendientes = pendientesDeMiguel(estado);

  const esRitmo = conv.tipo === 'dm' && conv.id === 'ritmo';

  return (
    <SlackShell
      lado="miguel"
      conversacion={conv}
      onConversacion={setConv}
      tituloPanel="Solicitud del equipo"
      panel={<p className="vacio">El detalle de la solicitud se construye en la fase 3.</p>}
    >
      {esRitmo ? (
        <>
          <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>

          {/* OM-01 bienvenida (125:16298) · copy de C6 */}
          <Mensaje hora="8:40">
            <p>Hola, Miguel. Aquí te llegan las solicitudes de ajuste de tu equipo.</p>
            <Attachment titulo="Qué vas a ver">
              <p>Verás quién envía cada solicitud y solo el compromiso que quiere ajustar.</p>
              <p>No verás su agenda ni sus conversaciones con RITMO.</p>
            </Attachment>
            <Acciones>
              <BotonSlack variante="primario" disabled>
                Entendido
              </BotonSlack>
            </Acciones>
          </Mensaje>

          {pendientes.length === 0 ? (
            <Mensaje hora={estado.reloj}>
              <p>No tienes solicitudes pendientes.</p>
              <p style={{ color: '#616061' }}>
                Cuando alguien de tu equipo pida un ajuste, te llega aquí con su nombre y el compromiso.
              </p>
            </Mensaje>
          ) : (
            <Mensaje hora={estado.reloj}>
              <p>
                Tienes <strong>{pendientes.length}</strong> solicitud{pendientes.length === 1 ? '' : 'es'} pendiente
                {pendientes.length === 1 ? '' : 's'} de responder.
              </p>
              {pendientes.map((s) => (
                <Attachment key={s.id} titulo={`Laura pide: ${s.tipoTitulo.toLowerCase()}`} tono="ambar">
                  <p>
                    {s.compromiso}: <span style={{ textDecoration: 'line-through', color: '#616061' }}>{s.fechaOriginal}</span>{' '}
                    → <strong>{s.propuesta}</strong>
                  </p>
                </Attachment>
              ))}
              <p style={{ color: '#616061', marginTop: 8 }}>
                Los botones de respuesta se construyen en la fase 3.
              </p>
            </Mensaje>
          )}
        </>
      ) : (
        <>
          <DiaSeparador>Hoy · {HOY.corto}</DiaSeparador>
          <Mensaje autor="camila" hora="9:12">
            <p>Buenos días 👋 Dejo aquí el avance de la semana.</p>
          </Mensaje>
        </>
      )}
    </SlackShell>
  );
}
