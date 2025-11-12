import { useRef } from "react";
import { X, PlusCircle, Calendar } from "lucide-react";
import { NewTask } from "../../Pages/Hero";
import "./styles.css";

interface AddFormInterface {
  addTask: () => void;
  closeForm: () => void;
  newTask: NewTask;
  setNewTask: React.Dispatch<React.SetStateAction<NewTask>>;
}

export const AddFormModal: React.FC<AddFormInterface> = ({
  addTask,
  closeForm,
  newTask,
  setNewTask,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Force open the calendar picker
  const openCalendar = () => {
    dateInputRef.current?.showPicker?.();
  };

  return (
    <div className="form-modal-overlay" onClick={closeForm}>
      <div className="form-modal" onClick={(e) => e.stopPropagation()}>
        {/* ---------- HEADER ---------- */}
        <div className="form-header">
          <h2>Create a New Task</h2>
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
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />
          </div>

          {/* DEADLINE + CATEGORY */}
          <div className="input-row">
            <div className="input-group">
              <label>Deadline</label>
              <div className="date-input-wrapper" onClick={openCalendar}>
                <Calendar size={18} className="calendar-icon" />
                <span className="date-placeholder">
                  {newTask.deadline
                    ? new Date(newTask.deadline).toLocaleString()
                    : "Select date & time"}
                </span>
                {/* Hidden input purely for invoking native picker */}
                <input
                  ref={dateInputRef}
                  type="datetime-local"
                  className="hidden-date-input"
                  value={
                    newTask.deadline
                      ? new Date(newTask.deadline).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      deadline: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Category</label>
              <select
                value={newTask.category}
                onChange={(e) =>
                  setNewTask({ ...newTask, category: e.target.value })
                }
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="input-group">
            <label>Description</label>
            <textarea
              placeholder="Optional details about this task..."
              value={newTask.description || ""}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
          </div>
        </div>

        {/* ---------- FOOTER ---------- */}
        <div className="form-footer">
          <button className="add-btn" onClick={addTask}>
            <PlusCircle size={18} /> Add Task
          </button>
          <button className="cancel-btn" onClick={closeForm}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
