"use client";

import { useEffect, useState } from "react";

export default function VendorEvaluationForm({ vendor, onClose }: any) {
  const [segments, setSegments] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>( []);

  // For storing sliders & comments: { questionId: score }
  const [scores, setScores] = useState<any>({});
  const [comments, setComments] = useState<any>({});

  // Load segments + questions
  async function loadData() {
    const segRes = await fetch("/api/segments");
    const segData = await segRes.json();
    setSegments(segData);

    const qRes = await fetch("/api/questions");
    const qData = await qRes.json();
    setQuestions(qData);

    // Load previous evaluator data
    const token = localStorage.getItem("token");
    const evaluator = JSON.parse(atob(token!.split(".")[1]));

    const evalRes = await fetch(
      `/api/evaluations?vendorId=${vendor.id}&evaluatorId=${evaluator.id}`
    );
    const evalData = await evalRes.json();

    const prevScores: any = {};
    const prevComments: any = {};

    evalData.forEach((e: any) => {
      prevScores[e.segment] = e.score;
      prevComments[e.segment] = e.comment;
    });

    setScores(prevScores);
    setComments(prevComments);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveEvaluation() {
    const token = localStorage.getItem("token");
    const evaluator = JSON.parse(atob(token!.split(".")[1]));

    // Save question-level evaluations
    for (const q of questions) {
      await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId: vendor.id,
          evaluatorId: evaluator.id,
          segment: `Q-${q.id}`, // store question-level key
          score: scores[q.id] || 0,
          comment: comments[q.id] || "",
        }),
      });
    }

    alert("Evaluation saved!");
    onClose();
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6">
        Evaluate {vendor.name}
      </h2>

      {segments.map((seg) => (
        <div key={seg.id} className="mb-10">
          <h3 className="text-xl font-semibold mb-4">
            {seg.name}
          </h3>

          {/* list questions under this segment */}
          {questions
            .filter((q) => q.segmentId === seg.id)
            .map((q) => (
              <div key={q.id} className="mb-6">
                <p className="mb-1 font-medium">{q.text}</p>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={scores[q.id] || 0}
                  onChange={(e) =>
                    setScores({
                      ...scores,
                      [q.id]: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />

                <input
                  type="text"
                  placeholder="Add comment..."
                  className="w-full mt-2 p-2 rounded bg-white/10 border border-white/20"
                  value={comments[q.id] || ""}
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [q.id]: e.target.value,
                    })
                  }
                />
              </div>
            ))}

          {/* If no questions under this segment */}
          {questions.filter((q) => q.segmentId === seg.id).length === 0 && (
            <p className="text-white/50 text-sm italic">
              No questions added under this segment (Admin must add questions)
            </p>
          )}
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
