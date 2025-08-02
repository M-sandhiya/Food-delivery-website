function ManageOrders() {
        const [orders, setOrders] = useState([
          {
            id: "ORD1001",
            user: "John Doe",
            restaurant: "Pizza Palace",
            amount: 25.0,
            status: "Delivered",
            date: "2024-06-01",
          },
          {
            id: "ORD1002",
            user: "Jane Smith",
            restaurant: "Sushi World",
            amount: 40.0,
            status: "Preparing",
            date: "2024-06-02",
          },
          {
            id: "ORD1003",
            user: "Mike Johnson",
            restaurant: "Burger Town",
            amount: 15.0,
            status: "Cancelled",
            date: "2024-06-03",
          },
          {
            id: "ORD1004",
            user: "Emily Davis",
            restaurant: "Taco Fiesta",
            amount: 30.0,
            status: "Delivered",
            date: "2024-06-04",
          },
          {
            id: "ORD1005",
            user: "Chris Lee",
            restaurant: "Curry House",
            amount: 22.0,
            status: "Delivered",
            date: "2024-06-05",
          },
        ]);

        const statusOptions = ["Preparing", "Delivered", "Cancelled"];

        const updateStatus = (id, newStatus) => {
          setOrders((prev) =>
            prev.map((order) =>
              order.id === id ? { ...order, status: newStatus } : order
            )
          );
        };

        return (
          <div className="p-6 flex-grow overflow-auto">
            <h1 className="text-3xl font-semibold mb-6 text-orange-900">
              Manage Orders
            </h1>
            <div className="overflow-x-auto rounded-lg shadow bg-white">
              <table className="min-w-full">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">Order ID</th>
                    <th className="py-3 px-6 text-left">User</th>
                    <th className="py-3 px-6 text-left">Restaurant</th>
                    <th className="py-3 px-6 text-left">Amount</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(({ id, user, restaurant, amount, status, date }) => (
                    <tr
                      key={id}
                      className="border-b last:border-b-0 hover:bg-orange-50"
                    >
                      <td className="py-3 px-6">{id}</td>
                      <td className="py-3 px-6">{user}</td>
                      <td className="py-3 px-6">{restaurant}</td>
                      <td className="py-3 px-6">${amount.toFixed(2)}</td>
                      <td className="py-3 px-6">{date}</td>
                      <td
                        className={`py-3 px-6 font-semibold ${
                          status === "Delivered"
                            ? "text-green-600"
                            : status === "Cancelled"
                            ? "text-red-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {status}
                      </td>
                      <td className="py-3 px-6 text-center space-x-2">
                        {statusOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => updateStatus(id, option)}
                            disabled={status === option}
                            className={`text-sm px-2 py-1 rounded ${
                              status === option
                                ? "bg-orange-300 cursor-not-allowed"
                                : "bg-orange-600 hover:bg-orange-700 text-white"
                            }`}
                            title={`Set status to ${option}`}
                          >
                            {option}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

     
      