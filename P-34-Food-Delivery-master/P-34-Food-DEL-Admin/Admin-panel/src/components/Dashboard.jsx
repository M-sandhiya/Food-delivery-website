function Dashboard() {
        // Dummy stats data
        const stats = [
          {
            title: "Total Users",
            value: 1245,
            icon: "fas fa-users",
            bg: "bg-orange-600",
          },
          {
            title: "Total Orders",
            value: 5321,
            icon: "fas fa-shopping-cart",
            bg: "bg-orange-700",
          },
          {
            title: "Restaurants",
            value: 87,
            icon: "fas fa-utensils",
            bg: "bg-orange-600",
          },
          {
            title: "Revenue",
            value: "$123,456",
            icon: "fas fa-dollar-sign",
            bg: "bg-orange-700",
          },
        ];

        return (
          <div className="p-6 flex-grow overflow-auto">
            <h1 className="text-3xl font-semibold mb-6 text-orange-900">
              Dashboard
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(({ title, value, icon, bg }) => (
                <div
                  key={title}
                  className={`flex items-center gap-4 p-6 rounded-lg shadow-md text-white ${bg}`}
                >
                  <div className="text-4xl opacity-80">
                    <i className={icon}></i>
                  </div>
                  <div>
                    <p className="text-lg font-medium">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            <section className="mt-10">
              <h2 className="text-2xl font-semibold mb-4 text-orange-900">
                Recent Orders
              </h2>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white">
                  <thead className="bg-orange-600 text-white">
                    <tr>
                      <th className="py-3 px-6 text-left">Order ID</th>
                      <th className="py-3 px-6 text-left">User</th>
                      <th className="py-3 px-6 text-left">Restaurant</th>
                      <th className="py-3 px-6 text-left">Amount</th>
                      <th className="py-3 px-6 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: "ORD12345",
                        user: "John Doe",
                        restaurant: "Pizza Palace",
                        amount: "$25.00",
                        status: "Delivered",
                      },
                      {
                        id: "ORD12346",
                        user: "Jane Smith",
                        restaurant: "Sushi World",
                        amount: "$40.00",
                        status: "Preparing",
                      },
                      {
                        id: "ORD12347",
                        user: "Mike Johnson",
                        restaurant: "Burger Town",
                        amount: "$15.00",
                        status: "Cancelled",
                      },
                      {
                        id: "ORD12348",
                        user: "Emily Davis",
                        restaurant: "Taco Fiesta",
                        amount: "$30.00",
                        status: "Delivered",
                      },
                      {
                        id: "ORD12349",
                        user: "Chris Lee",
                        restaurant: "Curry House",
                        amount: "$22.00",
                        status: "Delivered",
                      },
                    ].map(({ id, user, restaurant, amount, status }) => (
                      <tr
                        key={id}
                        className="border-b last:border-b-0 hover:bg-orange-50"
                      >
                        <td className="py-3 px-6">{id}</td>
                        <td className="py-3 px-6">{user}</td>
                        <td className="py-3 px-6">{restaurant}</td>
                        <td className="py-3 px-6">{amount}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );
      }
export default Dashboard;