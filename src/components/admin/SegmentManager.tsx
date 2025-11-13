"use client";

import { useEffect, useState } from "react";

export default function SegmentManager() {"use client";

import { useEffect, useState } from "react";

export default function SegmentManager() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [weight, setWeight] = useState(10);

  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

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

  // Add or Update Segment
  async function saveSegment() {
    if (!name.trim()) return alert("Segment name required");

    if (editMode) {
      await fetch("/api/segments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, name, weight }),
      });
    } else {
      await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, weight }),
      });
    }

    setName("");
    setWeight(10);
    setEditMode(false);
    setEditId(null);

    loadSegments();
  }

  async function deleteSegment(id: number) {
    if (!confirm("Delete this segment?")) return;

    await fetch("/api/segments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    loadSegments();
  }

  function edit(seg: any) {
    setName(seg.name);
    setWeight(seg.weight);
    setEditMode(true);
    setEditId(seg.id);
  }

  return (
    <div className="w-full max-w-4xl mx-auto text-white">

      <h2 className="text-2xl font-bold mb-6">Manage Segments</h2>

      {/* Add/Edit Form */}
      <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-6 backdrop-blur-md">
        <h3 className="text-xl mb-4">{editMode ? "Edit Segment" : "Add New Segment"}</h3>

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

        <table className="w-full">
          <thead>
            <tr className="bg-white/10">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Weight</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-3 text-center">Loading...</td>
              </tr>
            ) : segments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-3 text-center">No segments found</td>
              </tr>
            ) : (
              segments.map((seg) => (
                <tr key={seg.id} className="border-t border-white/10">
                  <td className="p-2">{seg.name}</td>
                  <td className="p-2">{seg.weight}%</td>
                  <td className="p-2 text-center space-x-3">
                    <button
                      onClick={() => edit(seg)}
                      className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>

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
    </div>
  );
}

  const [segments, setSegments] = useState<any[]>([]);
  const [newSegment, setNewSegment] = useState("");
  const [newWeight, setNewWeight] = useState(10);
  const [loading, setLoading] = useState(false);

  // 🔹 Load segments on mount
  async function loadSegments() {
    const res = await fetch("/api/segments");
    const data = await res.json();
    setSegments(data);
  }

  useEffect(() => {
    loadSegments();
  }, []);

  // 🔹 Add a new segment
  async function addSegment() {
    if (!newSegment.trim()) return;
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

  // 🔹 Update segment weight
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

      {/* Add Segment Form */}
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

      {/* Segments Table */}
      <div className="bg-white/10 rounded-xl border border-white/20 backdrop-blur-md shadow-lg overflow-hidden">
        <table className="w-full text-sm text-left text-white/80">
          <thead className="border-b border-white/10 text-white">
            <tr>
              <th className="p-3">Segment</th>
              <th className="p-3 text-center">Weight (%)</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {segments.length > 0 ? (
              segments.map((seg) => (
                <tr
                  key={seg.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-3">{seg.name}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      defaultValue={seg.weight}
                      onBlur={(e) =>
                        updateWeight(seg.id, Number(e.target.value))
                      }
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
                <td
                  colSpan={3}
                  className="text-center p-4 text-white/60 italic"
                >
                  No segments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
