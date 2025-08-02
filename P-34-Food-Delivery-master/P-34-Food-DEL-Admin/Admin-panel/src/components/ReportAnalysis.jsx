function ReportAnalysis() {
        // Dummy data for charts and reports
        // Since no chart library allowed, use simple bars and tables

        const revenueData = [
          { month: "Jan", revenue: 12000 },
          { month: "Feb", revenue: 15000 },
          { month: "Mar", revenue: 18000 },
          { month: "Apr", revenue: 14000 },
          { month: "May", revenue: 20000 },
          { month: "Jun", revenue: 22000 },
        ];

        const ordersData = [
          { status: "Delivered", count: 400 },
          { status: "Preparing", count: 80 },
          { status: "Cancelled", count: 20 },
        ];

        const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
        const maxOrders = Math.max(...ordersData.map((d) => d.count));

        return (
          <div className="p-6 flex-grow overflow-auto">
            <h1 className="text-3xl font-semibold mb-6 text-orange-900">
              Report & Analysis
            </h1>

            <section className="mb-10 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4 text-orange-800">
                Monthly Revenue
              </h2>
              <div className="flex items-end gap-4 h-48">
                {revenueData.map(({ month, revenue }) => {
                  const heightPercent = (revenue / maxRevenue) * 100;
                  return (
                    <div key={month} className="flex flex-col items-center w-10">
                      <div
                        className="bg-orange-600 rounded-t"
                        style={{ height: `${heightPercent}%`, width: "100%" }}
                        title={`$${revenue.toLocaleString()}`}
                      ></div>
                      <span className="mt-2 text-sm font-medium text-orange-900">
                        {month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold mb-4 text-orange-800">
                Order Status Distribution
              </h2>
              <div className="flex flex-col gap-4">
                {ordersData.map(({ status, count }) => {
                  const widthPercent = (count / maxOrders) * 100;
                  const color =
                    status === "Delivered"
                      ? "bg-green-600"
                      : status === "Cancelled"
                      ? "bg-red-600"
                      : "bg-yellow-500";
                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-1 font-medium text-orange-900">
                        <span>{status}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full bg-orange-200 rounded h-6">
                        <div
                          className={`${color} h-6 rounded`}
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        );
      }
      