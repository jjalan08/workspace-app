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
  const [user, setUser] = useState(undefined); // IMPORTANT

  const router = useRouter();
  const auth = getAuth();

  // 🔐 AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 REDIRECT LOGIC (IMPORTANT FIX)
  useEffect(() => {
    if (user === undefined) return; // still checking
    if (!user) {
      router.push("/login");
    }
  }, [user]);

  // 🔥 FETCH TASKS
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "tasks"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(data);
    });

    return () => unsubscribe();
  }, [user]);

  // ➕ ADD TASK
  const addTask = async () => {
    if (!task.trim() || !user?.uid) return;

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

  // ❌ DELETE TASK
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  // ✅ TOGGLE COMPLETE
  const toggleComplete = async (t) => {
    await updateDoc(doc(db, "tasks", t.id), {
      completed: !t.completed,
    });
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // ⏳ LOADING STATE
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  // 🔍 FILTER
  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "pending") return !t.completed;
    return true;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1>Task Dashboard</h1>

      <button onClick={logout}>Logout</button>

      {/* INPUT */}
      <div style={{ marginTop: "20px" }}>
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
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      {/* LIST */}
      <div style={{ marginTop: "20px" }}>
        {filteredTasks.map((t) => (
          <div key={t.id} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
            <span style={{ textDecoration: t.completed ? "line-through" : "none" }}>
              {t.text}
            </span>

            <span> | {t.dueDate}</span>
            <span> | {t.priority}</span>

            <button onClick={() => toggleComplete(t)}>✓</button>
            <button onClick={() => deleteTask(t.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}