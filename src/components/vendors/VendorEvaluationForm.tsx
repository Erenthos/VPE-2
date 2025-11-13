"use client";

import { useEffect, useState } from "react";

export default function VendorEvaluationForm({ vendor, onClose }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Re-mount the form when vendor changes (CRITICAL FIX)
  useEffect(() => {
    setQuestions([]);
    setResponses({});
    setLoading(true);
  }, [vendor]);

  // Load questions + existing evaluations
  useEffect(() => {
    async function loadData() {
      try {
        // Decode JWT
        const token = JSON.parse(atob(localStorage.getItem("token")!.split(".")[1]));
        const evaluatorId = token.id;

        // 1. Load segments + questions
        const segRes = await fetch("/api/segments-all");
        const segments = await segRes.json();

        let qList: any[] = [];
        segments.forEach((s: any) => {
          s.questions.forEach((q: any) => {
            qList.push({
              id: q.id,
              text: q.text,
              segment: `Q-${q.id}`,
              segmentName: s.name,
              weight: q.weight,
            });
          });
        });

        setQuestions(qList);

        // 2. Load previously saved evaluations
        const evRes = await fetch(
          `/api/evaluations?vendorId=${vendor.id}&evaluatorId=${evaluatorId}`
        );
        const existing = await evRes.json();

        const mapped: any = {};
        existing.forEach((ev: any) => {
          mapped[ev.segment] = {
            score: ev.score,
            comment: ev.comment || "",
          };
        });

        setResponses(mapped);

      } finally {
        // Only stop loading AFTER questions + evaluations are both loaded
        setLoading(false);
      }
    }

    loadData();
  }, [vendor]);

  function setValue(segment: string, field: "score" | "comment", value: any) {
    setResponses((prev: any) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        [field]: value,
      },
    }));
  }

  async function save() {
    const token = JSON.parse(atob(localStorage.getItem("token")!.split(".")[1]));
    const evaluatorId = token.id;

    for (let q of questions) {
      const r = responses[q.segment] || { score: 0, comment: "" };

      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          evaluatorId,
          segment: q.segment,
          score: r.score,
          comment: r.comment,
        }),
      });
    }

    alert("Evaluation saved!");
    onClose();
  }

  // DO NOT render sliders until everything is fully loaded
  if (loading || questions.length === 0) {
    return <div className="text-center p-4">Loading previous evaluation...</div>;
  }

  return (
    <div
      key={vendor.id} // <- CRITICAL: Forces full re-render
      className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur"
    >
      <h3 className="text-xl font-semibold mb-4">
        Evaluate {vendor.name}
      </h3>

      {questions.map((q) => (
        <div key={q.id} className="mb-6 p-3 bg-white/5 rounded-lg">
          <div className="font-semibold mb-2">{q.text}</div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={10}
            value={responses[q.segment]?.score ?? 0}
            onChange={(e) =>
              setValue(q.segment, "score", Number(e.target.value))
            }
            className="w-full"
          />

          <div className="mt-1 text-sm text-white/70">
            Score: {responses[q.segment]?.score ?? 0}
          </div>

          {/* Comment */}
          <textarea
            placeholder="Add comment..."
            className="w-full mt-2 p-2 bg-white/10 border border-white/20 rounded"
            value={responses[q.segment]?.comment ?? ""}
            onChange={(e) =>
              setValue(q.segment, "comment", e.target.value)
            }
          />
        </div>
      ))}

      <div className="flex justify-end gap-4 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          Cancel
        </button>

        <button
          onClick={save}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}
