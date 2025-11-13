"use client";

import { useEffect, useState } from "react";
import QuestionManager from "./QuestionManager";

export default function SegmentManager() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [weight, setWeight] = useState(10);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // For Questions Modal
  const [selectedSegment, setSelectedSegment] = useState<any | null>(null);

  async function loadSegments() {
    setLoading(true);
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);
    setLoading(false);
  }

  useEffect(() => {
    loadSegments();
  }, []);

  // Add/Update Segment
  async function saveSegment() {
    if (!name.trim()) return alert("Segment name required");

    if (editMode) {
      await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          name,
          weight,
        }),
      });
    } else {
      await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          weight,
        }),
      });
    }

    setName("");
    setWeight(10);
    setEditMode(false);
    setEditId(null);

    loadSegments();
  }

  // Delete Segment
  async function deleteSegment(id: number) {
    if (!confirm("Delete this segment? This will delete all questions too!"))
      return;

    await fetch("/api/segments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadSegments();
  }

  // Enter Edit Mode
  function edit(seg: any) {
    setName(seg.name);
    setWeight(seg.weight);
    setEditMode(true);
    setEditId(seg.id);
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-white">

      {/* Header */}
      <h2 className="text-2xl font-bold mb-6">Manage Segments</h2>

      {/* Add/Edit Form */}
      <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-6 backdrop-blur-md">
        <h3 className="text-xl mb-4">
          {editMode ? "Edit Segment" : "Add New Segment"}
        </h3>

        <div className="space-y-3">
          <input
            className="w-full p-2 rounded bg-white/10 border border-white/20"
            placeholder="Segment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            className="w-full p-2 rounded bg-white/10 border border-white/20"
            placeholder="Weight (1-100)"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={saveSegment}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
          >
            {editMode ? "Update" : "Add"}
          </button>

          {editMode && (
            <button
              onClick={() => {
                setEditMode(false);
                setName("");
                setWeight(10);
              }}
              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Segment List */}
      <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
        <h3 className="text-xl mb-4">Existing Segments</h3>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/10">
              <th className="p-2">Name</th>
              <th className="p-2">Weight</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-3 text-center">
                  Loading...
                </td>
              </tr>
            ) : segments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-3 text-center">
                  No segments found
                </td>
              </tr>
            ) : (
              segments.map((seg) => (
                <tr
                  key={seg.id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="p-2">{seg.name}</td>
                  <td className="p-2">{seg.weight}%</td>
                  <td className="p-2 text-center space-x-3">

                    {/* Edit Segment */}
                    <button
                      onClick={() => edit(seg)}
                      className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>

                    {/* Manage Questions */}
                    <button
                      onClick={() => setSelectedSegment(seg)}
                      className="px-3 py-1 bg-indigo-600 rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      Questions
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteSegment(seg.id)}
                      className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Questions Modal */}
      {selectedSegment && (
        <Modal onClose={() => setSelectedSegment(null)}>
          <QuestionManager
            segment={selectedSegment}
            onClose={() => setSelectedSegment(null)}
          />
        </Modal>
      )}
    </div>
  );
}

/* Reusable Modal for Questions */
function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/20 max-h-[80vh] overflow-y-auto w-full max-w-xl shadow-2xl">

        {children}

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
