---
name: grill-me
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, resolve ambiguities, design an architecture or feature, or uses any 'grill' trigger phrases.
---

# Grill-Me

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

## Format a round like so:

```markdown
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

## Workflow & Rules

1. **Recompute the frontier after each response**:
   Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

2. **Facts vs. Decisions**:
   - Finding **facts** is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, codebase, tools, dependencies), use your tools to find it; do not ask the user for anything you could look up yourself. Don't block on exploration if other questions in the frontier can be asked now.
   - The **decisions** belong to the user: put each question to them clearly with your recommendation and wait for their response.

3. **Active conversation & scoping**:
   - Keep questions concise, targeted, and high-signal.
   - If a question is ungrillable (e.g. "how does this micro-interaction look?"), suggest prototyping instead of endless guessing.
   - If scope drifts, point it out and clarify boundaries.

4. **Completion**:
   The session is done when the frontier is empty: every branch of the design tree is visited, nothing is left silently assumed. Do not act on or write implementation code until the user confirms you have reached a shared understanding.

## References
- [Grill-me Overview](./references/grill-me.md)
- [Grilling Mechanics](./references/grilling.md)
