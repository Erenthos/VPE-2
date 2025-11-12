"use client";

import { useState } from "react";

const SEGMENTS = [
  "Quality of Work",
  "Delivery Timeliness",
  "Pricing Competitiveness",
  "Communication",
  "After Sales Support",
];

export default function VendorEvaluationForm({
  vendor,
  onClose,
}: {
  vendor: any;
  onClose: () => void;
}) {
  const [ratings, setRatings] = useState(
    SEGMENTS.map((segment) => ({ segment, score: 5, comment: "" }))
  );
  const [saving, setSaving] = useState(false);
  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const evaluatorId = userToken ? JSON.parse(atob(userToken.split(".")[1])).id : null;

  const handleRatingChange = (i: number, value: number) => {
    const updated = [...ratings];
    updated[i].score = value;
    setRatings(updated);
  };

  const handleCommentChange = (i: number, value: string) => {
    const updated = [...ratings];
    updated[i].comment = value;
    setRatings(updated);
  };

  const saveEvaluations = async () => {
    setSaving(true);
    for (const r of ratings) {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          evaluatorId,
          segment: r.segment,
          score: r.score,
          comment: r.comment,
        }),
      });
    }
    setSaving(false);
    alert("Evaluation saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 w-full max-w-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          Evaluate {vendor.name}
        </h2>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {ratings.map((r, i) => (
            <div key={r.segment} className="border-b border-white/10 pb-4">
              <h3 className="font-semibold text-lg mb-2">{r.segment}</h3>

              <input
                type="range"
                min={0}
                max={10}
                value={r.score}
                onChange={(e) => handleRatingChange(i, Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-sm text-white/70 mb-2">Score: {r.score}/10</p>

              <textarea
                value={r.comment}
                onChange={(e) => handleCommentChange(i, e.target.value)}
                placeholder="Add your comment..."
                className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-sm focus:outline-none focus:border-indigo-400"
                rows={2}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            Cancel
          </button>
          <button
            onClick={saveEvaluations}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium"
          >
            {saving ? "Saving..." : "Save Evaluations"}
          </button>
        </div>
      </div>
    </div>
  );
}
