import { formatDuration } from '../../features/race/typingMetrics';
import type { TypingMetrics } from '../../features/race/raceTypes';

type StatsBarProps = {
  metrics: TypingMetrics;
};

export function StatsBar({ metrics }: StatsBarProps) {
  return (
    <div className="stats-bar" aria-label="Race stats">
      <div>
        <strong>{metrics.wpm}</strong>
        <span>WPM</span>
      </div>
      <div>
        <strong>{metrics.accuracy}%</strong>
        <span>Accuracy</span>
      </div>
      <div>
        <strong>{Math.round(metrics.progress * 100)}%</strong>
        <span>Progress</span>
      </div>
      <div>
        <strong>{formatDuration(metrics.elapsedMs)}</strong>
        <span>Time</span>
      </div>
    </div>
  );
}
