import { createL2Response } from '../agent/workshopAgent.js';

export default function L2PlainChat({ account, prompt }) {
  const response = createL2Response(account);

  return (
    <div className="lesson-layout lesson-layout--chat">
      <section className="lesson-copy">
        <span className="eyebrow">L2 Plain Chat</span>
        <h2>Useful advice, detached from the workflow</h2>
        <p>
          The agent can answer in text, but it cannot reshape the CRM surface or
          update the account plan.
        </p>
      </section>

      <section className="chat-panel" aria-label="L2 text chat">
        <div className="message message--user">{prompt}</div>
        <div className="message message--agent">
          <span>{response.title}</span>
          <p>{response.body}</p>
        </div>
      </section>
    </div>
  );
}
