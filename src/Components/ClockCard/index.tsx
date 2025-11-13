import { Clock, X, CheckCircle2 } from "lucide-react";
import { Task } from "../../Pages/Hero";
import "./styles.css";
import { getTimeRemaining } from "../../Utilities/getTimeRemaining";
import { getUrgencyColor } from "../../Utilities/getUrgencyColor";
import { getUrgency } from "../../Utilities/getUrgency";
import React, { useEffect, useRef } from "react";
import { playAudio } from "../../Utilities/playAudio";
import { showNotification } from "../../Utilities/showNotification";

export const ClockCard: React.FC<{
  task: Task;
  deleteTask: (id: number) => void;
  completeTask?: (id: number) => void;
  now: number;
  onCardClick: ({ task }: { task: Task }) => void;
}> = ({ task, deleteTask, completeTask, now, onCardClick }) => {
  const time = getTimeRemaining(task.deadline, now);
  const isOverdue = time.total <= 0;

  // Color logic based on urgency

  const urgency = getUrgency(task, now);
  const color = getUrgencyColor(urgency);

  // Map urgency to color threshold level (for tick audio on major changes only)
  const getUrgencyLevel = (urgencyValue: number): number => {
    if (urgencyValue >= 1) return 5; // gray
    if (urgencyValue >= 0.9) return 4; // bright_red
    if (urgencyValue >= 0.8) return 3; // red
    if (urgencyValue >= 0.7) return 2; // orange
    if (urgencyValue >= 0.6) return 1; // yellow
    return 0; // bright_green
  };

  const urgencyLevel = getUrgencyLevel(urgency);

  // Track previous state for audio triggers
  const prevIsOverdueRef = useRef<boolean>(isOverdue);
  const prevUrgencyLevelRef = useRef<number | undefined>(undefined);
  const hasCheckedOverdueRef = useRef<boolean>(false);

  // Play overdue audio when task becomes overdue (only once, even across refreshes)
  useEffect(() => {
    if (isOverdue) {
      // Check if we've already played for this task (persists across refreshes)
      const overdueKey = `overdue_played_${task.id}`;
      const hasPlayed = localStorage.getItem(overdueKey);

      // Only play if:
      // 1. Task just became overdue (transition from not overdue to overdue), OR
      // 2. Task is overdue and we haven't checked yet (initial mount)
      if (
        (!prevIsOverdueRef.current || !hasCheckedOverdueRef.current) &&
        !hasPlayed
      ) {
        // Mark as played in localStorage to persist across refreshes
        localStorage.setItem(overdueKey, "true");
        const baseUrl = (import.meta as any).env?.BASE_URL || "/time-horizon/";

        // Check if page is visible (foreground)
        const isPageVisible = !document.hidden;

        if (isPageVisible) {
          // Play audio only if page is in foreground (browsers block background audio)
          playAudio(`${baseUrl}audio/overdue.wav`, 10);
        }

        // Always show notification (works in background too)
        showNotification("Task Overdue", {
          body: `${task.name} is now overdue`,
          tag: `overdue_${task.id}`, // Prevents duplicate notifications
          requireInteraction: true, // Requires user to dismiss
          silent: false, // Play system sound
        });
      }

      hasCheckedOverdueRef.current = true;
    } else {
      // Task is no longer overdue - reset the check flag
      hasCheckedOverdueRef.current = false;
    }
    prevIsOverdueRef.current = isOverdue;
  }, [isOverdue, task.id]);

  // Play tick audio when urgency level changes (only for specific thresholds: 0.6, 0.8, 0.9)
  useEffect(() => {
    if (
      prevUrgencyLevelRef.current !== undefined &&
      prevUrgencyLevelRef.current !== urgencyLevel &&
      !isOverdue
    ) {
      // Only play tick for specific urgency levels: 1 (0.6), 3 (0.8), 4 (0.9)
      const tickLevels = [1, 3, 4]; // 0.6, 0.8, 0.9 thresholds

      if (tickLevels.includes(urgencyLevel)) {
        // Urgency level changed to one of the tick thresholds
        const baseUrl = (import.meta as any).env?.BASE_URL || "/time-horizon/";
        playAudio(`${baseUrl}audio/tick.wav`, urgency);
      }
    }
    prevUrgencyLevelRef.current = urgencyLevel;
  }, [urgencyLevel, urgency, isOverdue]);

  // Progress ring logic — from creation time to deadline
  const totalDuration = task.deadline - task.created_at;
  const startTime = task.created_at;
  const elapsed = Math.max(0, now - startTime);
  const progress = Math.min(1, elapsed / totalDuration);

  const circleRadius = 60;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference * (1 - progress);

  return (
    <div
      className="clock-card-modern"
      style={{ boxShadow: `0 0 20px ${color}33` }}
      onClick={() => onCardClick({ task })}
    >
      <div className="card-header">
        <div className="task-title-wrapper">
          <h3 className="task-title">{task.name}</h3>
          {task.description && (
            <div className="tooltip">{task.description}</div>
          )}
        </div>
        <div className="card-header-actions">
          {completeTask && (
            <button
              className="complete-btn"
              onClick={(e) => {
                e.stopPropagation();
                completeTask(task.id);
              }}
              aria-label="Complete task"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <span className="category">{task.category}</span>

      <div className="clock-visual">
        <svg className="progress-ring" width="140" height="140">
          <circle
            cx="70"
            cy="70"
            r={circleRadius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          {!isOverdue && (
            <circle
              cx="70"
              cy="70"
              r={circleRadius}
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              className="progress-ring-active"
            />
          )}
        </svg>

        <div className="clock-center">
          <Clock
            size={36}
            style={{
              color,
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </div>
      </div>

      <div className="time-display">
        {isOverdue ? (
          <span className="overdue">OVERDUE</span>
        ) : (
          <>
            <span className="time-primary" style={{ color }}>
              {time.days > 0 && `${time.days}d `} {time.hours}h {time.minutes}m
            </span>
            <span className="time-secondary">{time.seconds}s remaining</span>
          </>
        )}
      </div>

      <div className="card-footer">
        <span>
          {new Date(task.created_at).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>
          {new Date(task.deadline).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};
