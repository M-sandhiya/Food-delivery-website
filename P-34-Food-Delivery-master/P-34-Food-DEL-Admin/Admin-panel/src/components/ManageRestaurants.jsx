function ManageRestaurants() {
        const [restaurants, setRestaurants] = useState([
          {
            id: 1,
            name: "Pizza Palace",
            address: "123 Main St, Cityville",
            phone: "123-456-7890",
            status: "Open",
            image:
              "https://placehold.co/100x100/png?text=Pizza+Palace+Restaurant+front+view+with+signage",
          },
          {
            id: 2,
            name: "Sushi World",
            address: "456 Ocean Ave, Beach City",
            phone: "987-654-3210",
            status: "Closed",
            image:
              "https://placehold.co/100x100/png?text=Sushi+World+restaurant+exterior+with+Japanese+style+decor",
          },
          {
            id: 3,
            name: "Burger Town",
            address: "789 Burger Blvd, Foodtown",
            phone: "555-123-4567",
            status: "Open",
            image:
              "https://placehold.co/100x100/png?text=Burger+Town+restaurant+front+with+burger+sign",
          },
          {
            id: 4,
            name: "Taco Fiesta",
            address: "321 Fiesta Rd, Mexicoville",
            phone: "444-555-6666",
            status: "Open",
            image:
              "https://placehold.co/100x100/png?text=Taco+Fiesta+restaurant+colorful+Mexican+decor",
          },
          {
            id: 5,
            name: "Curry House",
            address: "654 Spice St, Flavor City",
            phone: "222-333-4444",
            status: "Closed",
            image:
              "https://placehold.co/100x100/png?text=Curry+House+restaurant+front+with+Indian+style+decor",
          },
        ]);

        const [editingId, setEditingId] = useState(null);
        const [formData, setFormData] = useState({
          name: "",
          address: "",
          phone: "",
          status: "Open",
          image: "",
        });

        const openEdit = (restaurant) => {
          setEditingId(restaurant.id);
          setFormData({
            name: restaurant.name,
            address: restaurant.address,
            phone: restaurant.phone,
            status: restaurant.status,
            image: restaurant.image,
          });
        };

        const closeEdit = () => {
          setEditingId(null);
          setFormData({
            name: "",
            address: "",
            phone: "",
            status: "Open",
            image: "",
          });
        };

        const handleChange = (e) => {
          const { name, value } = e.target;
          setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSave = () => {
          setRestaurants((prev) =>
            prev.map((r) =>
              r.id === editingId ? { ...r, ...formData } : r
            )
          );
          closeEdit();
        };

        const handleDelete = (id) => {
          if (
            window.confirm(
              "Are you sure you want to delete this restaurant? This action cannot be undone."
            )
          ) {
            setRestaurants((prev) => prev.filter((r) => r.id !== id));
          }
        };

        return (
          <div className="p-6 flex-grow overflow-auto">
            <h1 className="text-3xl font-semibold mb-6 text-orange-900">
              Manage Restaurants
            </h1>
            <div className="overflow-x-auto rounded-lg shadow bg-white">
              <table className="min-w-full">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">Image</th>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Address</th>
                    <th className="py-3 px-6 text-left">Phone</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) =>
                    editingId === restaurant.id ? (
                      <tr key={restaurant.id} className="bg-orange-50">
                        <td className="py-3 px-6">
                          <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            placeholder="Image URL"
                          />
                          {formData.image && (
                            <img
                              src={formData.image}
                              alt={`Editable preview of ${formData.name} restaurant front view`}
                              className="mt-2 h-16 w-16 object-cover rounded"
                            />
                          )}
                        </td>
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
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          />
                        </td>
                        <td className="py-3 px-6">
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-2 py-1"
                          >
                            <option>Open</option>
                            <option>Closed</option>
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
                        key={restaurant.id}
                        className="border-b last:border-b-0 hover:bg-orange-50"
                      >
                        <td className="py-3 px-6">
                          <img
                            src={restaurant.image}
                            alt={`Front view of ${restaurant.name} restaurant with signage`}
                            className="h-16 w-16 object-cover rounded"
                          />
                        </td>
                        <td className="py-3 px-6">{restaurant.name}</td>
                        <td className="py-3 px-6">{restaurant.address}</td>
                        <td className="py-3 px-6">{restaurant.phone}</td>
                        <td
                          className={`py-3 px-6 font-semibold ${
                            restaurant.status === "Open"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {restaurant.status}
                        </td>
                        <td className="py-3 px-6 text-center space-x-2">
                          <button
                            onClick={() => openEdit(restaurant)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant.id)}
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
export default ManageRestaurants;