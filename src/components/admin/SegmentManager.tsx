"use client";

import { useEffect, useState } from "react";

export default function SegmentManager() {
  const [segments, setSegments] = useState<any[]>([]);
  const [newSegment, setNewSegment] = useState("");
  const [newWeight, setNewWeight] = useState(10);
  const [loading, setLoading] = useState(false);

  async function loadSegments() {
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);
  }

  useEffect(() => {
    loadSegments();
  }, []);

  async function addSegment() {
    if (!newSegment) return;
    setLoading(true);
    await fetch("/api/segments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSegment, weight: newWeight }),
    });
    setNewSegment("");
    setNewWeight(10);
    setLoading(false);
    loadSegments();
  }

  async function updateWeight(id: number, weight: number) {
    await fetch("/api/segments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, weight }),
    });
    loadSegments();
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
        Segment & Weight Management
      </h2>

      {/* Add New Segment */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Segment name"
          value={newSegment}
          onChange={(e) => setNewSegment(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400"
        />
        <input
          type="number"
          min={1}
          max={100}
          value={newWeight}
          onChange={(e) => setNewWeight(Number(e.target.value))}
          className="w-24 p-2 rounded-lg bg-white/10 border border-white/20 text-center"
        />
        <button
          onClick={addSegment}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition font-medium"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Segment List */}
      <div className="bg-white/10 rounded-xl border border-white/20 backdrop-blur-md shadow-lg overflow-hidden">
        <table className="w-full text-sm text-left text-white/80">
          <thead className="border-b border-white/10 text-white">
            <tr>
              <th className="p-3">Segment</th>
              <th className="p-3 text-center">Weight (%)</th>
              <th className="p-3 text-center">Update</th>
            </tr>
          </thead>
          <tbody>
            {segments.length > 0 ? (
              segments.map((seg) => (
                <tr key={seg.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="p-3">{seg.name}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      defaultValue={seg.weight}
                      onBlur={(e) => updateWeight(seg.id, Number(e.target.value))}
                      className="w-20 text-center rounded-md bg-white/10 border border-white/20 focus:outline-none focus:border-indigo-400"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => updateWeight(seg.id, seg.weight)}
                      className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-xs"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-4 text-white/60">
                  No segments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
