import React from "react";
import { CheckCircle2, Trash2, Sparkles } from "lucide-react";
import { Task } from "../Hero";
import "./styles.css";

interface CompletedTasksViewProps {
  completedTasks: Task[];
  clearCompletedTasks: () => void;
  deleteTask: (id: number) => void;
}

const CompletedTasksView: React.FC<CompletedTasksViewProps> = ({
  completedTasks,
  clearCompletedTasks,
  deleteTask,
}) => {
  if (completedTasks.length === 0) {
    return (
      <div className="completed-empty-state">
        <Sparkles size={64} className="sparkle-icon" />
        <h2>No Completed Tasks Yet</h2>
        <p>Complete your tasks to see them here!</p>
      </div>
    );
  }

  return (
    <div className="completed-tasks-view">
      <div className="completed-header">
        <div className="completed-title-section">
          <CheckCircle2 size={32} className="check-icon" />
          <div>
            <h2>Completed Tasks</h2>
            <p className="completed-count">
              {completedTasks.length} task
              {completedTasks.length !== 1 ? "s" : ""} completed
            </p>
          </div>
        </div>
        <button className="clear-all-btn" onClick={clearCompletedTasks}>
          <Trash2 size={18} />
          Clear All
        </button>
      </div>

      <div className="completed-tasks-grid">
        {completedTasks.map((task, index) => (
          <div
            key={task.id}
            className="completed-task-card"
            style={{ "--index": index } as React.CSSProperties}
          >
            <div className="completed-task-header">
              <div className="completed-badge">
                <CheckCircle2 size={20} />
              </div>
              <button
                className="delete-completed-btn"
                onClick={() => deleteTask(task.id)}
                aria-label="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="completed-task-content">
              <h3 className="completed-task-name">{task.name}</h3>
              <span className="completed-category">{task.category}</span>
              {task.description && (
                <p className="completed-description">{task.description}</p>
              )}
            </div>

            <div className="completed-task-footer">
              <div className="completed-date-info">
                <span className="completed-label">Completed:</span>
                <span className="completed-date">
                  {task.completed_at
                    ? new Date(task.completed_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently"}
                </span>
              </div>
              <div className="completed-date-info">
                <span className="completed-label">Deadline was:</span>
                <span className="completed-date">
                  {new Date(task.deadline).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedTasksView;
