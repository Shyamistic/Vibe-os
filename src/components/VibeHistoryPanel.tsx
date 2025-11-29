'use client';
import { useVibeStore } from '@/lib/store';

export function VibeHistoryPanel() {
  const { history, restoreHistoryIndex } = useVibeStore();

  if (!history.length) return null;

  return (
    <div className="history-panel interactive">
      <div className="history-header">SESSION LOG</div>
      <div className="history-list">
        {history
          .slice()
          .reverse()
          .map((entry, idx) => {
            const index = history.length - 1 - idx;
            return (
              <button
                key={index}
                className="history-item"
                onClick={() => restoreHistoryIndex(index)}
              >
                <div className="history-line">
                  <span className="history-time">{entry.time}</span>
                  <span className="history-vibe">{entry.vibe}</span>
                </div>
                <div className="history-trigger">{entry.trigger}</div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
