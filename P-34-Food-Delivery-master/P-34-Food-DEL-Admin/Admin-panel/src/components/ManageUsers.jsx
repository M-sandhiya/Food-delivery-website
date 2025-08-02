function ManageUsers() {
        const [users, setUsers] = useState([
          {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            role: "Customer",
            status: "Active",
          },
          {
            id: 2,
            name: "Jane Smith",
            email: "jane@example.com",
            role: "Customer",
            status: "Active",
          },
          {
            id: 3,
            name: "Mike Johnson",
            email: "mike@example.com",
            role: "Delivery",
            status: "Inactive",
          },
          {
            id: 4,
            name: "Emily Davis",
            email: "emily@example.com",
            role: "Customer",
            status: "Active",
          },
          {
            id: 5,
            name: "Chris Lee",
            email: "chris@example.com",
            role: "Admin",
            status: "Active",
          },
        ]);

        const [editingUser, setEditingUser] = useState(null);
        const [formData, setFormData] = useState({
          name: "",
          email: "",
          role: "Customer",
          status: "Active",
        });

        const openEdit = (user) => {
          setEditingUser(user.id);
          setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
          });
        };

        const closeEdit = () => {
          setEditingUser(null);
          setFormData({
            name: "",
            email: "",
            role: "Customer",
            status: "Active",
          });
        };

        const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSave = () => {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === editingUser ? { ...u, ...formData } : u
            )
          );
          closeEdit();
        };

        const handleDelete = (id) => {
          if (
            window.confirm(
              "Are you sure you want to delete this user? This action cannot be undone."
            )
          ) {
            setUsers((prev) => prev.filter((u) => u.id !== id));
          }
        };

        return (
          <div className="p-6 flex-grow overflow-auto">
            <h1 className="text-3xl font-semibold mb-6 text-orange-900">
              Manage Users
            </h1>
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
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          >
                            <option>Customer</option>
                            <option>Delivery</option>
                            <option>Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
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
                            title="Edit"
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