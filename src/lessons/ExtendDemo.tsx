import { CopilotChat, useComponent } from "@copilotkit/react-core/v2";
import { PlanCard, PlanCardProps } from "@/components/plan-card";
import { PlanResult, PlanResultProps } from "@/components/plan-result";
import { ExamplePrompts } from "@/components/example-prompts";

export default function ExtendDemo() {
  // 🪁 EXTENSION POINT: add a plan→approve→act action — give the `extend` agent
  // (server.ts) a new goal to plan for, and the planResult below renders the outcome.
  useComponent({
    name: "planCard",
    description:
      "Lay out a plan of 2-4 steps for the user to review BEFORE acting. Call this " +
      "first when the user states a goal; do not take the action until they approve.",
    parameters: PlanCardProps,
    render: PlanCard,
  });

  useComponent({
    name: "planResult",
    description:
      "Render the outcome after the user approves (status 'done') or rejects " +
      "(status 'cancelled') a plan.",
    parameters: PlanResultProps,
    render: PlanResult,
  });

  return (
    <section className="lesson">
      <div className="lesson-copy">
        <h2>🪁 Extend · Plan → approve → act</h2>
        <p>
          State a goal. The agent proposes a plan and waits — it only acts after you
          type <strong>approve</strong>. This is the deck's "You review" loop, and a
          live extension point. See <code>EXTENDING.md</code> or run <code>/extend</code>.
        </p>
      </div>
      <ExamplePrompts
        prompts={[
          "Flag my at-risk Q3 accounts",
          "approve",
          "reject",
        ]}
      />
      <div className="chat-region">
        <CopilotChat agentId="extend" />
      </div>
    </section>
  );
}
