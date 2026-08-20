import React, { useEffect, useState } from 'react';

export interface UndoItem {
  id: string;
  type: 'campaign' | 'persona';
  title: string;
  item: any;
  index: number;
}

interface UndoToastProps {
  undoItem: UndoItem | null;
  onUndo: (item: UndoItem) => void;
  onDismiss: () => void;
  durationSeconds?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  undoItem,
  onUndo,
  onDismiss,
  durationSeconds = 5,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!undoItem) return;

    setTimeLeft(durationSeconds);
    setProgress(100);

    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, totalMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      setTimeLeft(remainingSec);
      setProgress((remainingMs / totalMs) * 100);

      if (remainingMs <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [undoItem?.id, durationSeconds, onDismiss]);

  if (!undoItem) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-48px)] sm:w-auto bg-[#0a2414] text-[#ffffff] rounded-[10px] border border-[#17b267]/40 shadow-2xl p-4 flex flex-col space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbac3] shrink-0 animate-pulse" />
          <div className="truncate">
            <span className="text-[13px] font-medium block truncate text-[#ffffff]">
              {undoItem.title}
            </span>
            <span className="text-[11.5px] text-[#ffffff]/60 block">
              Auto-removing in {timeLeft}s
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => onUndo(undoItem)}
            className="px-3.5 py-1.5 rounded-[6px] bg-[#1ad379] hover:bg-[#17b267] text-[#0a2414] text-[12.5px] font-semibold tracking-tight transition-all active:scale-[0.97] flex items-center space-x-1"
          >
            <span>↩ Undo</span>
          </button>

          <button
            onClick={onDismiss}
            aria-label="Dismiss toast"
            className="p-1 rounded-[6px] text-[#ffffff]/50 hover:text-[#ffffff] hover:bg-[#ffffff]/10 transition-colors text-[14px]"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 5-second Progress Bar */}
      <div className="w-full h-1 bg-[#ffffff]/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1ad379] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
