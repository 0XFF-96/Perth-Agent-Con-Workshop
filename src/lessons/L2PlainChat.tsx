import { CopilotChat } from "@copilotkit/react-core/v2";

export default function L2PlainChat() {
  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>L2 · Plain chat</h2>
        <p>Text-only assistant. The home of the "bolt-on chatbot". Try: "Summarize the last quarter's metrics."</p>
      </div>
      <div className="chat-region">
        <CopilotChat agentId="l2" />
      </div>
    </section>
  );
}
