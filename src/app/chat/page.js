"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  // 🔥 REAL-TIME FETCH
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setMessages(data);
    });

    return () => unsub();
  }, []);

  // ➕ SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: message,
      user: auth.currentUser?.email,
      createdAt: new Date(),
    });

    setMessage("");
  };

  // 🔽 AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col p-4 bg-gray-100">

      <h1 className="text-xl font-bold mb-2">Chat</h1>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto bg-white p-3 rounded shadow">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <p className="text-sm text-gray-500">{m.user}</p>
            <div className="bg-blue-100 p-2 rounded inline-block">
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mt-3">
        <input
          className="flex-1 border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>

    </div>
  );
}