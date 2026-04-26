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

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);

  const bottomRef = useRef(null);
  const user = auth.currentUser;

  const storage = getStorage();

  // FETCH
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

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim() && !file) return;

    let fileUrl = "";

    // 📎 FILE UPLOAD
    if (file) {
      const storageRef = ref(storage, `files/${file.name}`);
      await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "messages"), {
      text: message,
      user: user?.email,
      fileUrl,
      createdAt: new Date(),
    });

    setMessage("");
    setFile(null);
  };

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">

      {/* HEADER */}
      <div className="p-4 bg-white shadow font-semibold">
        Chat
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m, i) => {
          const isMe = m.user === user?.email;

          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-2 rounded-lg ${
                  isMe
                    ? "bg-blue-500 text-white"
                    : "bg-white border"
                }`}
              >
                <p className="text-sm">{m.text}</p>

                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    className="text-xs underline"
                  >
                    📎 File
                  </a>
                )}

                <p className="text-[10px] opacity-70 mt-1">
                  {m.user}
                </p>

                <p className="text-[10px] opacity-50">
                  {new Date(m.createdAt?.seconds * 1000).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white flex gap-2 items-center">

        {/* Emoji quick add */}
        <button onClick={() => setMessage(message + "🙂")}>🙂</button>
        <button onClick={() => setMessage(message + "🔥")}>🔥</button>

        <input
          className="flex-1 border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
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