import { useState, useEffect } from "react";
import { Plus, AlertCircle, Download } from "lucide-react";
import "./styles.css";
import { ClockCard } from "../../Components/ClockCard";
import { AddFormModal } from "../../Components/AddForm";
import TimelineView from "../TimelineView";
import { TimeRemaining } from "../../Types/TimeRemaining";

export interface Task {
  id: number;
  name: string;
  created_at: number;
  deadline: number; // timestamp (ms)
  category: string;
  description?: string;
}

export interface NewTask {
  name: string;
  deadline: string;
  category: string;
  description?: string;
}

type PageViewType = "grid" | "timeline";

const TimeHorizonApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<PageViewType>("grid");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTask, setNewTask] = useState<NewTask>({
    name: "",
    deadline: "",
    category: "work",
  });
  const [now, setNow] = useState(Date.now());
  const [hoveringInstallButton, setHoveringInstallButton] =
    useState<boolean>(false);

  // --- PWA Install State ---
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load tasks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("timeHorizonTasks");
      if (stored) {
        const parsed = JSON.parse(stored) as Task[];
        if (Array.isArray(parsed)) setTasks(parsed);
      }
    } catch {
      console.warn("Failed to load tasks from localStorage");
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("timeHorizonTasks", JSON.stringify(tasks));
  }, [tasks]);

  // --- Handle Install Prompt ---
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  // --- CRUD Operations ---
  const addTask = (): void => {
    if (!newTask.name || !newTask.deadline) return;
    const task: Task = {
      id: Date.now(),
      created_at: Date.now(),
      name: newTask.name,
      deadline: new Date(newTask.deadline).getTime(),
      category: newTask.category,
      description: newTask?.description,
    };
    setTasks((prev) => [...prev, task]);
    setNewTask({ name: "", deadline: "", category: "work" });
    setShowAddForm(false);
  };

  const deleteTask = (id: number): void => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const sortedTasks = [...tasks].sort((a, b) => a.deadline - b.deadline);

  const closeForm = (): void => {
    setShowAddForm(false);
    setNewTask({ name: "", deadline: "", category: "work" });
  };

  const onCardClick = ({ task }: { task: Task }) => {
    // placeholder for edit or expand behavior
  };

  return (
    <div className="timehorizon-app">
      <h1 className="title">Time Horizon</h1>
      <p className="subtitle">Your life's commitments, counting down</p>
      {!isInstalled && installPrompt && (
        <button
          className="install-btn"
          onClick={handleInstallClick}
          onMouseEnter={() => {
            setHoveringInstallButton(true);
          }}
          onMouseLeave={() => {
            setHoveringInstallButton(false);
          }}
        >
          <Download size={18} />
          {hoveringInstallButton && " Install App"}
        </button>
      )}

      <div className="controls">
        <div className="view-toggle">
          <button
            className={view === "grid" ? "active" : ""}
            onClick={() => setView("grid")}
          >
            Grid
          </button>
          <button
            className={view === "timeline" ? "active" : ""}
            onClick={() => setView("timeline")}
          >
            Timeline
          </button>
        </div>

        <div className="action-buttons">
          <button
            className="add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      {showAddForm && (
        <AddFormModal
          addTask={addTask}
          closeForm={closeForm}
          newTask={newTask}
          setNewTask={setNewTask}
        />
      )}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>No tasks yet. Add one to see your time horizon.</p>
        </div>
      ) : view === "timeline" ? (
        <TimelineView tasks={tasks} now={now} deleteTask={deleteTask} />
      ) : (
        <div className="grid-view">
          {sortedTasks.map((task) => (
            <ClockCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              now={now}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeHorizonApp;
