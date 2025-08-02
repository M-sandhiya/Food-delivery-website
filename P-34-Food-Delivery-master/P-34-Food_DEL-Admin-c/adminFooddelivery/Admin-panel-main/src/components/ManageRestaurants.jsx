import React, { useState, useEffect } from "react";
import api from "../api";

function ManageRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
        const [editingId, setEditingId] = useState(null);
  const [statusValue, setStatusValue] = useState("");

  // Fetch restaurants from backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await api.get("/admin/restaurants");
        const mapped = res.data.map((item) => ({
          id: item.rdto?.id ?? "",
          name: item.rdto?.restaurantName ?? "",
          address: item.adto?.fulladdress ?? "",
          phone: item.rdto?.phone ?? "",
          status: item.rdto?.enabled ? "Open" : "Closed",
          image: item.rdto?.restaurantPic || item.rdto?.resturantPic || "",
        }));
        setRestaurants(mapped);
      } catch (err) {
        // handle error
      }
    };
    fetchRestaurants();
  }, []);

        const openEdit = (restaurant) => {
          setEditingId(restaurant.id);
    setStatusValue(restaurant.status);
        };

        const closeEdit = () => {
          setEditingId(null);
    setStatusValue("");
        };

  const handleStatusChange = (e) => {
    setStatusValue(e.target.value);
        };

  const handleSave = async () => {
    try {
      await api.put(`/admin/users/${editingId}?type=restaurant`, {
        enabled: statusValue === "Open",
      });
          setRestaurants((prev) =>
            prev.map((r) =>
          r.id === editingId ? { ...r, status: statusValue } : r
            )
          );
          closeEdit();
    } catch (err) {
      // handle error
    }
        };

  const handleDelete = async (id) => {
          if (
            window.confirm(
              "Are you sure you want to delete this restaurant? This action cannot be undone."
            )
          ) {
      try {
        await api.delete(`/admin/users/${id}?type=restaurant`);
            setRestaurants((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        // handle error
      }
          }
        };

        return (
          <div className="p-6 flex-grow overflow-auto">
      <h1 className="text-3xl font-semibold mb-6 text-orange-900">Manage Restaurants</h1>
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
                  {restaurants.map((restaurant, index) =>
                    editingId === restaurant.id ? (
                      <tr key={`${restaurant.id}-${index}`} className="bg-orange-50">
                        <td className="py-3 px-6">
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={`Front view of ${restaurant.name || 'N/A'} restaurant with signage`}
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-6">{restaurant.name ? restaurant.name : 'N/A'}</td>
                        <td className="py-3 px-6">{restaurant.address ? restaurant.address : 'N/A'}</td>
                        <td className="py-3 px-6">{restaurant.phone ? restaurant.phone : 'N/A'}</td>
                        <td className="py-3 px-6">
                          <select
                            name="status"
                            value={statusValue}
                            onChange={handleStatusChange}
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
                        key={`${restaurant.id}-${index}`}
                        className="border-b last:border-b-0 hover:bg-orange-50"
                      >
                        <td className="py-3 px-6">
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={`Front view of ${restaurant.name || 'N/A'} restaurant with signage`}
                              className="h-16 w-16 object-cover rounded"
                            />
                          ) : (
                            <span>N/A</span>
                          )}
                        </td>
                        <td className="py-3 px-6">{restaurant.name ? restaurant.name : 'N/A'}</td>
                        <td className="py-3 px-6">{restaurant.address ? restaurant.address : 'N/A'}</td>
                        <td className="py-3 px-6">{restaurant.phone ? restaurant.phone : 'N/A'}</td>
                        <td
                          className={`py-3 px-6 font-semibold ${
                            restaurant.status === 'Open'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {restaurant.status ? restaurant.status : 'N/A'}
                        </td>
                        <td className="py-3 px-6 text-center space-x-2">
                          <button
                            onClick={() => openEdit(restaurant)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Status"
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