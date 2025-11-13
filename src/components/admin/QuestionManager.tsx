"use client";

import { useEffect, useState } from "react";

export default function QuestionManager({ segment, onClose }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [weight, setWeight] = useState(10);
  const [editId, setEditId] = useState(null);

  async function load() {
    const res = await fetch(`/api/questions?segmentId=${segment.id}`);
    const data = await res.json();
    setQuestions(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (editId) {
      await fetch("/api/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, text, weight })
      });
    } else {
      await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId: segment.id, text, weight })
      });
    }

    setText("");
    setWeight(10);
    setEditId(null);
    load();
  }

  async function remove(id: number) {
    await fetch("/api/questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    load();
  }

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">
        Questions for "{segment.name}"
      </h2>

      {/* Add/Edit */}
      <div className="bg-white/10 p-3 rounded-lg mb-4">
        <input
          className="w-full p-2 mb-2 bg-white/10 border border-white/20 rounded"
          placeholder="Question text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="number"
          className="w-full p-2 mb-2 bg-white/10 border border-white/20 rounded"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />

        <button
          onClick={save}
          className="px-4 py-2 bg-green-600 rounded-lg mr-2"
        >
          {editId ? "Update" : "Add"}
        </button>
        <button
          onClick={() => onClose()}
          className="px-4 py-2 bg-gray-600 rounded-lg"
        >
          Close
        </button>
      </div>

      {/* Question List */}
      <div className="bg-white/10 p-3 rounded-lg">
        {questions.map((q: any) => (
          <div
            key={q.id}
            className="flex justify-between items-center p-2 border-b border-white/20"
          >
            <div>
              <p>{q.text}</p>
              <p className="text-white/50 text-sm">{q.weight}% weight</p>
            </div>

            <div className="space-x-3">
              <button
                className="px-2 py-1 bg-blue-600 rounded"
                onClick={() => {
                  setEditId(q.id);
                  setText(q.text);
                  setWeight(q.weight);
                }}
              >
                Edit
              </button>
              <button
                className="px-2 py-1 bg-red-600 rounded"
                onClick={() => remove(q.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-center text-white/60">No questions yet.</p>
        )}
      </div>
    </div>
  );
}
