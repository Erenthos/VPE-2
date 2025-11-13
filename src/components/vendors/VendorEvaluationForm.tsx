"use client";

import { useEffect, useState } from "react";

export default function VendorEvaluationForm({ vendor, onClose }: any) {
  const [segments, setSegments] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [comment, setComment] = useState<any>({});

  async function loadSegments() {
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);
  }

  useEffect(() => {
    loadSegments();
  }, []);

  async function saveEvaluation() {
    const evaluator = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));

    for (let seg of segments) {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          evaluatorId: evaluator.id,
          segment: seg.name,
          score: form[seg.name] || 0,
          comment: comment[seg.name] || "",
        }),
      });
    }

    alert("Evaluation saved!");
    onClose();
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/10 border border-white/20 p-6 rounded-xl backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-white mb-6">
        Evaluate: {vendor.name}
      </h2>

      {segments.map((seg) => (
        <div key={seg.id} className="mb-6">
          <p className="text-white mb-2 font-semibold">{seg.name} (Weight {seg.weight}%)</p>

          <input
            type="range"
            min="0"
            max="10"
            value={form[seg.name] || 0}
            onChange={(e) =>
              setForm({ ...form, [seg.name]: Number(e.target.value) })
            }
            className="w-full"
          />

          <input
            type="text"
            placeholder="Add comment..."
            className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20 text-white"
            value={comment[seg.name] || ""}
            onChange={(e) =>
              setComment({ ...comment, [seg.name]: e.target.value })
            }
          />
        </div>
      ))}

      <div className="flex justify-end gap-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded-lg">
          Cancel
        </button>
        <button onClick={saveEvaluation} className="px-4 py-2 bg-green-600 rounded-lg">
          Save Evaluation
        </button>
      </div>
    </div>
  );
}
