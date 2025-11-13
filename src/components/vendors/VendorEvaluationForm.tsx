"use client";

import { useEffect, useState } from "react";

export default function VendorEvaluationForm({ vendor, onClose }: any) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [responses, setResponses] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Load segments + questions + previous evaluations
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // 1. load segments & questions
      const segRes = await fetch("/api/segments-all"); // you already have SegmentManager using this
      const segments = await segRes.json();

      let qList: any[] = [];
      segments.forEach((s: any) => {
        s.questions.forEach((q: any) => {
          qList.push({
            id: q.id,
            text: q.text,
            segment: `Q-${q.id}`,
            weight: q.weight,
            segmentName: s.name
          });
        });
      });

      setQuestions(qList);

      // 2. load saved evaluations
      const token = JSON.parse(atob(localStorage.getItem("token")!.split(".")[1]));

      const evRes = await fetch(
        `/api/evaluations?vendorId=${vendor.id}&evaluatorId=${token.userId}`
      );

      const existing = await evRes.json();

      // 3. map existing answers to form state
      const mapped: any = {};
      existing.forEach((ev: any) => {
        mapped[ev.segment] = {
          score: ev.score,
          comment: ev.comment || ""
        };
      });

      setResponses(mapped);
      setLoading(false);
    }

    loadData();
  }, [vendor]);

  function setValue(segment: string, field: "score" | "comment", value: any) {
    setResponses((prev: any) => ({
      ...prev,
      [segment]: {
        ...prev[segment],
        [field]: value
      }
    }));
  }

  async function save() {
    const token = JSON.parse(atob(localStorage.getItem("token")!.split(".")[1]));

    for (let q of questions) {
      const r = responses[q.segment] || { score: 0, comment: "" };

      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          evaluatorId: token.userId,
          segment: q.segment,
          score: r.score,
          comment: r.comment
        })
      });
    }

    alert("Evaluation saved!");
    onClose();
  }

  if (loading) {
    return <div className="text-center p-4">Loading evaluation...</div>;
  }

  return (
    <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur">
      <h3 className="text-xl font-semibold mb-4">
        Evaluate {vendor.name}
      </h3>

      {/* QUESTIONS */}
      {questions.map((q) => (
        <div key={q.id} className="mb-6 p-3 bg-white/5 rounded-lg">

          <div className="font-semibold mb-2">{q.text}</div>

          {/* Slider */}
          <input
            type="range"
            min={0}
            max={10}
            value={(responses[q.segment]?.score) ?? 0}
            onChange={(e) =>
              setValue(q.segment, "score", Number(e.target.value))
            }
            className="w-full"
          />

          <div className="mt-1 text-sm text-white/70">
            Score: {responses[q.segment]?.score ?? 0}
          </div>

          {/* Comment box */}
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
