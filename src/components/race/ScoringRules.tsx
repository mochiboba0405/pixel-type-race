export function ScoringRules() {
  return (
    <section className="panel scoring-rules">
      <p className="section-label">Rules</p>
      <h2>Accuracy matters</h2>
      <ul>
        <li>80%+ accuracy is required to win a round.</li>
        <li>Below 75% accuracy warns first, then DQs after 15 chars or 25% of the prompt, whichever comes first.</li>
        <li>Penalties: +1s under 95%, +2s under 90%, +3s under 85%.</li>
        <li>DQ applies only to the current round, not the full match.</li>
      </ul>
    </section>
  );
}
