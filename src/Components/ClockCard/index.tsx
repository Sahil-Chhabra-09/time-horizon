import { Clock, X } from "lucide-react";
import { Task } from "../../Pages/Hero";
import "./styles.css";
import { getTimeRemaining } from "../../Utilities/getTimeRemaining";
import { getUrgencyColor } from "../../Utilities/getUrgencyColor";
import { getUrgency } from "../../Utilities/getUrgency";

export const ClockCard: React.FC<{
  task: Task;
  deleteTask: (id: number) => void;
  now: number;
  onCardClick: ({ task }: { task: Task }) => void;
}> = ({ task, deleteTask, now, onCardClick }) => {
  const time = getTimeRemaining(task.deadline, now);
  const isOverdue = time.total <= 0;

  // Color logic based on urgency

  const urgency = getUrgency(task, now);
  const color = getUrgencyColor(urgency);

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
        <button className="delete-btn" onClick={() => deleteTask(task.id)}>
          <X size={16} />
        </button>
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
