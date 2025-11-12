import React, { useMemo, useState } from "react";
import { Clock, X, Eye, EyeOff } from "lucide-react";
import "./styles.css";
import { Task } from "../Hero";
import { getTimeRemaining } from "../../Utilities/getTimeRemaining";
import { getUrgencyColor } from "../../Utilities/getUrgencyColor";
import { getUrgency } from "../../Utilities/getUrgency";
import { URGENCY_COLORS } from "../../Constants/UrgencyColors";

interface TimelineViewProps {
  tasks: Task[];
  now: number;
  deleteTask: (id: number) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  now,
  deleteTask,
}) => {
  const [showOverdue, setShowOverdue] = useState(true);

  // single sorted list (helps React patch consistently)
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.deadline - b.deadline),
    [tasks]
  );

  // split lists (used only for computing max ranges)
  const futureTasks = sortedTasks.filter((t) => t.deadline > now);
  const overdueTasks = sortedTasks.filter((t) => t.deadline <= now);

  if (tasks.length === 0) return null;

  // Layout constants (tweak as desired)
  // When overdue are visible: NOW sits in the middle (250), with ranges above/below = 200 each
  // When overdue are hidden: NOW moves near the top (20) and future range grows to fill the space
  const nowAnchorVisible = 250;
  const nowAnchorHidden = 20;

  const overdueRangeVisible = 200; // space above NOW for overdue
  const futureRangeVisible = 200; // space below NOW for future when overdue visible
  const futureRangeHidden = 480; // space below NOW for future when overdue hidden

  const nowY = showOverdue ? nowAnchorVisible : nowAnchorHidden;
  const futureRange = showOverdue ? futureRangeVisible : futureRangeHidden;
  const overdueRange = showOverdue ? overdueRangeVisible : 0;

  // compute maximums used for normalization (avoid divide-by-zero)
  const maxRemainingTime = futureTasks.reduce((max, t) => {
    return Math.max(max, t.deadline - now);
  }, 0);

  const maxOverdueTime = overdueTasks.reduce((max, t) => {
    return Math.max(max, now - t.deadline);
  }, 0);

  // helper to compute top for a given task
  const computeTop = (task: Task) => {
    const isOverdue = task.deadline <= now;
    if (isOverdue) {
      // if overdue hidden, we don't render them — but computeTop remains safe
      const taskOverdueTime = now - task.deadline;
      const ratio = maxOverdueTime ? taskOverdueTime / maxOverdueTime : 0;
      // more overdue -> higher above NOW
      return nowY - ratio * overdueRange;
    } else {
      const taskRemainingTime = task.deadline - now;
      const ratio = maxRemainingTime ? taskRemainingTime / maxRemainingTime : 0;
      // closer deadlines (small remaining) should be nearer NOW (small offset)
      return nowY + ratio * futureRange;
    }
  };

  return (
    <div className="timeline-view">
      {/* Toggle control */}
      <div
        className="timeline-header"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <button
          className="toggle-overdue-btn"
          onClick={() => setShowOverdue((prev) => !prev)}
          aria-pressed={showOverdue}
        >
          {showOverdue ? (
            <>
              <EyeOff size={16} /> Hide Overdue
            </>
          ) : (
            <>
              <Eye size={16} /> Show Overdue
            </>
          )}
        </button>
      </div>

      <div className="timeline-line" />

      <div
        className="timeline-items"
        style={{ position: "relative", minHeight: 600 }}
      >
        <div
          className="timeline-now"
          style={{
            top: `${nowY}px`, // NOW anchor moves when overdue hidden
          }}
        >
          <div className="dot" />
          <div className="label"></div>
        </div>

        {/*
          Render all tasks from a *single* array to keep patching simple.
          Key includes isOverdue to force remount when a task crosses the boundary.
        */}
        {sortedTasks.map((task) => {
          const isOverdue = task.deadline <= now;
          // if overdue tasks are hidden, skip rendering overdue items entirely
          if (isOverdue && !showOverdue) return null;

          const remaining = getTimeRemaining(task.deadline, now);
          const urgency = getUrgency(task, now);
          const color = isOverdue
            ? getUrgencyColor(Math.min(1, urgency))
            : getUrgencyColor(urgency);
          const isUrgent = urgency >= 0.8;

          const top = computeTop(task);
          const safeTop = Number.isFinite(top) ? top : nowY; // defensive

          return (
            <div
              key={`${task.id}-${isOverdue ? "overdue" : "future"}`}
              className="timeline-task-wrapper"
              style={{
                top: `${safeTop}px`,
                transition: "top 400ms cubic-bezier(.2,.9,.2,1)",
              }}
            >
              <div
                className={`timeline-dot ${isUrgent ? "urgent" : ""}`}
                style={{ backgroundColor: color }}
              >
                <Clock size={16} className="text-white" />
              </div>

              <div
                className={`timeline-task ${
                  isOverdue ? "timeline-task-overdue" : ""
                }`}
              >
                <div className="timeline-task-header">
                  <div className="flex-1">
                    <h4>{task.name}</h4>
                    <span className="category">{task.category}</span>
                    <p className="time-remaining">
                      {remaining.days > 0 && `${remaining.days}d `}
                      {remaining.hours > 0 && `${remaining.hours}h `}
                      {remaining.minutes > 0 && `${remaining.minutes}m `}
                      {remaining.seconds}s
                    </p>
                    <p className="timestamp">
                      {new Date(task.deadline).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="delete-btn"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
