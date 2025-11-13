"use client";

import { useEffect, useState } from "react";

export default function VendorEvaluationForm({ vendor, onClose }: any) {
  const [segments, setSegments] = useState<any[]>([]);
  const [scores, setScores] = useState({} as any);
  const [comments, setComments] = useState({} as any);

  // Fetch segments
  async function loadSegments() {
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);

    // Load previous evaluations for this vendor
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token!.split(".")[1]));
    const evaluatorId = payload.id;

    const evalRes = await fetch(`/api/evaluations?vendorId=${vendor.id}&evaluatorId=${evaluatorId}`);
    const evals = await evalRes.json();

    const existingScores: any = {};
    const existingComments: any = {};

    evals.forEach((e: any) => {
      existingScores[e.segment] = e.score;
      existingComments[e.segment] = e.comment;
    });

    setScores(existingScores);
    setComments(existingComments);
  }

  useEffect(() => {
    loadSegments();
  }, []);

  // Save
  async function saveEvaluation() {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token!.split(".")[1]));
    const evaluatorId = payload.id;

    for (const seg of segments) {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          evaluatorId,
          segment: seg.name,
          score: scores[seg.name] || 0,
          comment: comments[seg.name] || "",
        }),
      });
    }

    alert("Evaluation saved!");
    onClose();
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">Evaluate {vendor.name}</h2>

      {segments.map((seg) => (
        <div key={seg.id} className="mb-8">
          <p className="font-semibold mb-1">{seg.name} (Weight {seg.weight}%)</p>

          <input
            type="range"
            min="0"
            max="10"
            value={scores[seg.name] || 0}
            onChange={(e) =>
              setScores({ ...scores, [seg.name]: Number(e.target.value) })
            }
            className="w-full"
          />

          <input
            type="text"
            placeholder="Add comment..."
            value={comments[seg.name] || ""}
            onChange={(e) =>
              setComments({ ...comments, [seg.name]: e.target.value })
            }
            className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20"
          />
        </div>
      ))}

      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={saveEvaluation}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
}
