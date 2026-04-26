"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";

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
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

export default function Dashboard() {
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState(""); // NEW
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("low");
  const [filter, setFilter] = useState("all");

  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  const router = useRouter();

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) router.push("/login");
    });
    return () => unsub();
  }, []);

  // FETCH TASKS
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

  // ADD TASK
  const addTask = async () => {
    if (!task.trim() || !user) return;

    await addDoc(collection(db, "tasks"), {
      text: task,
      notes,
      dueDate,
      priority,
      completed: false,
      userId: user.uid,
      createdAt: new Date(),
    });

    setTask("");
    setNotes("");
    setDueDate("");
    setPriority("low");
  };

  // DELETE
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  // TOGGLE
  const toggleComplete = async (t) => {
    await updateDoc(doc(db, "tasks", t.id), {
      completed: !t.completed,
    });
  };

  // LOGOUT
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!user) {
    return <div className="p-10">Loading...</div>;
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Task Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* INPUT */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Task title"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <textarea
            className="border p-2 rounded"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex gap-2">
            <input
              type="date"
              className="border p-2 rounded"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <select
              className="border p-2 rounded"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              onClick={addTask}
              className="bg-blue-500 text-white px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilter("all")} className="border px-3 py-1 rounded">All</button>
          <button onClick={() => setFilter("completed")} className="border px-3 py-1 rounded">Completed</button>
          <button onClick={() => setFilter("pending")} className="border px-3 py-1 rounded">Pending</button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <div key={t.id} className="border p-3 rounded bg-gray-50">

              <div className="flex justify-between">
                <h3 className={t.completed ? "line-through font-semibold" : "font-semibold"}>
                  {t.text}
                </h3>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleComplete(t)}
                    className="bg-green-500 text-white px-2 rounded"
                  >
                    ✓
                  </button>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="bg-red-500 text-white px-2 rounded"
                  >
                    X
                  </button>
                </div>
              </div>

              {t.notes && (
                <p className="text-sm text-gray-600 mt-1">
                  📝 {t.notes}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                📅 {t.dueDate || "No deadline"} | ⚡ {t.priority}
              </p>

              <p className="text-xs text-gray-400">
                Created: {t.createdAt?.toDate?.().toLocaleString?.() || "Now"}
              </p>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}