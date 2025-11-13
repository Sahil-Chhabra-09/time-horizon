import React, { useState, useEffect, useRef } from "react";
import { Plus, AlertCircle, Download } from "lucide-react";
import "./styles.css";
import { ClockCard } from "../../Components/ClockCard";
import { AddFormModal } from "../../Components/AddForm";
import { EditFormModal } from "../../Components/EditForm";
import TimelineView from "../TimelineView";
import CompletedTasksView from "../CompletedTasks";
import { TimeRemaining } from "../../Types/TimeRemaining";
import { playAudio } from "../../Utilities/playAudio";

export interface Task {
  id: number;
  name: string;
  created_at: number;
  deadline: number; // timestamp (ms)
  category: string;
  description?: string;
  completed?: boolean;
  completed_at?: number;
}

export interface NewTask {
  name: string;
  deadline: string;
  category: string;
  description?: string;
}

type PageViewType = "grid" | "timeline" | "completed";

// Initialize tasks from localStorage synchronously
const getInitialTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem("timeHorizonTasks");
    if (stored) {
      const parsed = JSON.parse(stored) as Task[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    console.warn("Failed to load tasks from localStorage");
  }
  return [];
};

const TimeHorizonApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [view, setView] = useState<PageViewType>("grid");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
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

  // Request notification permission on mount (for background alerts)
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      // Request permission (user interaction may be required on some browsers)
      Notification.requestPermission().catch((err) => {
        console.warn("Failed to request notification permission:", err);
      });
    }
  }, []);

  // Save tasks to localStorage whenever they change
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

  const editTask = (id: number, updates: Partial<Task>): void => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const completeTask = (id: number): void => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: true, completed_at: Date.now() } : t
      )
    );
    // Play success audio
    const baseUrl = (import.meta as any).env?.BASE_URL || "/time-horizon/";
    const isPageVisible = !document.hidden;
    if (isPageVisible) {
      playAudio(`${baseUrl}audio/success.wav`, 10);
    }
  };

  const clearCompletedTasks = (): void => {
    setTasks((prev) => prev.filter((t) => !t.completed));
  };

  // Filter tasks based on view
  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const sortedTasks = [...activeTasks].sort((a, b) => a.deadline - b.deadline);
  const sortedCompletedTasks = [...completedTasks].sort(
    (a, b) => (b.completed_at || 0) - (a.completed_at || 0)
  );

  const closeForm = (): void => {
    setShowAddForm(false);
    setNewTask({ name: "", deadline: "", category: "work" });
  };

  const closeEditForm = (): void => {
    setShowEditForm(false);
    setEditingTask(null);
    setEditedTask({});
  };

  const onCardClick = ({ task }: { task: Task }) => {
    setEditingTask(task);
    setEditedTask({
      name: task.name,
      category: task.category,
      description: task.description,
    });
    setShowEditForm(true);
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
          <button
            className={view === "completed" ? "active" : ""}
            onClick={() => setView("completed")}
          >
            Completed{" "}
            {completedTasks.length > 0 && `(${completedTasks.length})`}
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

      {showEditForm && editingTask && (
        <EditFormModal
          task={editingTask}
          editTask={editTask}
          closeForm={closeEditForm}
          editedTask={editedTask}
          setEditedTask={setEditedTask}
        />
      )}

      {view === "completed" ? (
        <CompletedTasksView
          completedTasks={sortedCompletedTasks}
          clearCompletedTasks={clearCompletedTasks}
          deleteTask={deleteTask}
        />
      ) : view === "timeline" ? (
        sortedTasks.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>No active tasks. Add one to see your time horizon.</p>
          </div>
        ) : (
          <TimelineView
            tasks={sortedTasks}
            now={now}
            deleteTask={deleteTask}
            onCardClick={onCardClick}
          />
        )
      ) : sortedTasks.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>No active tasks. Add one to see your time horizon.</p>
        </div>
      ) : (
        <div className="grid-view">
          {sortedTasks.map((task) => (
            <ClockCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              completeTask={completeTask}
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
