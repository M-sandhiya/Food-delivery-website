import React, { useState, useEffect } from "react";
import api from "../api";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [statusValue, setStatusValue] = useState("");

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [customersRes, ridersRes] = await Promise.all([
          api.get("/admin/customers"),
          api.get("/admin/riders"),
        ]);
        const customers = customersRes.data.map((u) => ({
          id: u.id,
          name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
          email: u.email,
          role: "Customer",
          status: u.enabled ? "Active" : "Inactive",
        }));
        const riders = ridersRes.data.map((u) => ({
          id: u.id,
          name: u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.username,
          email: u.email,
          role: "Delivery",
          status: u.enabled ? "Active" : "Inactive",
        }));
        setUsers([...customers, ...riders]);
      } catch (err) {
        // handle error
      }
    };
    fetchUsers();
  }, []);

        const openEdit = (user) => {
          setEditingUser(user.id);
    setStatusValue(user.status);
        };

        const closeEdit = () => {
          setEditingUser(null);
    setStatusValue("");
  };

  const handleStatusChange = (e) => {
    setStatusValue(e.target.value);
        };

  const handleSave = async () => {
    const user = users.find((u) => u.id === editingUser);
    let type = user.role.toLowerCase();
    if (type === "delivery") type = "rider";
    try {
      await api.put(`/admin/users/${user.id}?type=${type}`, {
        enabled: statusValue === "Active",
      });
          setUsers((prev) =>
            prev.map((u) =>
          u.id === editingUser ? { ...u, status: statusValue } : u
            )
          );
          closeEdit();
    } catch (err) {
      // handle error
    }
        };

  const handleDelete = async (id) => {
    const user = users.find((u) => u.id === id);
    let type = user.role.toLowerCase();
    if (type === "delivery") type = "rider";
          if (
            window.confirm(
              "Are you sure you want to delete this user? This action cannot be undone."
            )
          ) {
      try {
        await api.delete(`/admin/users/${id}?type=${type}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        // handle error
      }
          }
        };

        return (
          <div className="p-6 flex-grow overflow-auto">
      <h1 className="text-3xl font-semibold mb-6 text-orange-900">Manage Users</h1>
            <div className="overflow-x-auto rounded-lg shadow bg-white">
              <table className="min-w-full">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) =>
                    editingUser === user.id ? (
                      <tr key={user.id} className="bg-orange-50">
                  <td className="py-3 px-6">{user.name}</td>
                  <td className="py-3 px-6">{user.email}</td>
                  <td className="py-3 px-6">{user.role}</td>
                        <td className="py-3 px-6">
                          <select
                            name="status"
                      value={statusValue}
                      onChange={handleStatusChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          >
                            <option>Active</option>
                            <option>Inactive</option>
                          </select>
                        </td>
                        <td className="py-3 px-6 text-center space-x-2">
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button
                            onClick={closeEdit}
                            className="text-red-600 hover:text-red-800"
                            title="Cancel"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={user.id}
                        className="border-b last:border-b-0 hover:bg-orange-50"
                      >
                        <td className="py-3 px-6">{user.name}</td>
                        <td className="py-3 px-6">{user.email}</td>
                        <td className="py-3 px-6">{user.role}</td>
                        <td
                          className={`py-3 px-6 font-semibold ${
                            user.status === "Active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {user.status}
                        </td>
                        <td className="py-3 px-6 text-center space-x-2">
                          <button
                            onClick={() => openEdit(user)}
                            className="text-blue-600 hover:text-blue-800"
                      title="Edit Status"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      export default ManageUsers;