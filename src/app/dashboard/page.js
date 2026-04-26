"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export default function Dashboard() {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("low");
  const [filter, setFilter] = useState("all");

  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(data);
    });

    return () => unsub();
  }, [user]);

  const addTask = async () => {
    if (!task.trim()) return;

    await addDoc(collection(db, "tasks"), {
      text: task,
      dueDate,
      priority,
      completed: false,
      userId: user.uid,
      createdAt: new Date(),
    });

    setTask("");
    setDueDate("");
    setPriority("low");
  };

  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  const toggleComplete = async (t) => {
    await updateDoc(doc(db, "tasks", t.id), {
      completed: !t.completed,
    });
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) {
    router.push("/login");
    return null;
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <div className="p-10">
      <h1 className="text-3xl mb-4">Task Dashboard</h1>

      <button onClick={logout}>Logout</button>

      {/* INPUT */}
      <div className="flex gap-2 my-4">
        <input
          placeholder="Task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button onClick={addTask}>Add</button>
      </div>

      {/* FILTER */}
      <div className="mb-4">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      {/* LIST */}
      {filteredTasks.map((t) => (
        <div key={t.id} className="flex gap-4 border p-2 my-2">
          <span className={t.completed ? "line-through" : ""}>
            {t.text}
          </span>

          <span>{t.dueDate}</span>
          <span>{t.priority}</span>

          <button onClick={() => toggleComplete(t)}>✓</button>
          <button onClick={() => deleteTask(t.id)}>X</button>
        </div>
      ))}
    </div>
  );
}