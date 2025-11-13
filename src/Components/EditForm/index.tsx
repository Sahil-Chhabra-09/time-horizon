import React from "react";
import { X, Save } from "lucide-react";
import { Task } from "../../Pages/Hero";
import "./styles.css";

interface EditFormInterface {
  task: Task;
  editTask: (id: number, updates: Partial<Task>) => void;
  closeForm: () => void;
  editedTask: Partial<Task>;
  setEditedTask: React.Dispatch<React.SetStateAction<Partial<Task>>>;
}

export const EditFormModal: React.FC<EditFormInterface> = ({
  task,
  editTask,
  closeForm,
  editedTask,
  setEditedTask,
}) => {
  const handleSave = () => {
    if (!editedTask.name?.trim()) return;
    editTask(task.id, editedTask);
    closeForm();
  };

  return (
    <div className="form-modal-overlay" onClick={closeForm}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        {/* ---------- HEADER ---------- */}
        <div className="form-header">
          <h2>Edit Task</h2>
          <button className="icon-btn" onClick={closeForm}>
            <X size={20} />
          </button>
        </div>

        {/* ---------- BODY ---------- */}
        <div className="form-body">
          {/* TASK NAME */}
          <div className="input-group">
            <label>Task Name</label>
            <input
              type="text"
              placeholder="e.g. Finish project proposal"
              value={editedTask.name || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, name: e.target.value })
              }
            />
          </div>

          {/* DEADLINE (READ-ONLY) */}
          <div className="input-group">
            <label>Deadline (Cannot be changed)</label>
            <div className="date-display">
              {new Date(task.deadline).toLocaleString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <p className="help-text">
              The deadline cannot be edited to maintain the integrity of your time
              horizon.
            </p>
          </div>

          {/* CATEGORY */}
          <div className="input-group">
            <label>Category</label>
            <select
              value={editedTask.category || "work"}
              onChange={(e) =>
                setEditedTask({ ...editedTask, category: e.target.value })
              }
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="health">Health</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="input-group">
            <label>Description</label>
            <textarea
              placeholder="Optional details about this task..."
              value={editedTask.description || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="form-footer">
          <button className="add-btn" onClick={handleSave}>
            <Save size={18} /> Save Changes
          </button>
          <button className="cancel-btn" onClick={closeForm}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

