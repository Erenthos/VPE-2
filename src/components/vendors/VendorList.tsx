"use client";

import { useEffect, useState } from "react";

export default function VendorList() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");

  async function loadVendors(query = "") {
    setLoading(true);
    const res = await fetch(`/api/vendors?search=${query}`);
    const data = await res.json();
    setVendors(data);
    setLoading(false);
  }

  useEffect(() => {
    loadVendors();
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadVendors(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  async function addVendor() {
    if (!newName.trim()) {
      alert("Vendor name is required");
      return;
    }

    await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        company: newCompany,
        email: newEmail,
      }),
    });

    setNewName("");
    setNewCompany("");
    setNewEmail("");
    setShowAddModal(false);
    loadVendors();
  }

  return (
    <div className="w-full">

      {/* Add Vendor Button */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
        >
          + Add Vendor
        </button>
      </div>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search by vendor name or company..."
        className="w-full mb-4 p-2 rounded bg-white/10 border border-white/20"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Vendor Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-white/10 text-left">
            <th className="p-2">Vendor Name</th>
            <th className="p-2">Company</th>
            <th className="p-2">Email</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={3} className="p-3 text-center">
                Searching...
              </td>
            </tr>
          ) : vendors.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-3 text-center">
                No vendors found
              </td>
            </tr>
          ) : (
            vendors.map((v) => (
              <tr
                key={v.id}
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="p-2">{v.name}</td>
                <td className="p-2">{v.company}</td>
                <td className="p-2">{v.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-lg w-full max-w-lg">

            <h2 className="text-xl font-bold mb-4 text-white">Add New Vendor</h2>

            <input
              className="w-full p-2 mb-3 bg-white/10 border border-white/20 rounded text-white"
              placeholder="Vendor Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <input
              className="w-full p-2 mb-3 bg-white/10 border border-white/20 rounded text-white"
              placeholder="Company Name"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />

            <input
              className="w-full p-2 mb-4 bg-white/10 border border-white/20 rounded text-white"
              placeholder="Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={addVendor}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
