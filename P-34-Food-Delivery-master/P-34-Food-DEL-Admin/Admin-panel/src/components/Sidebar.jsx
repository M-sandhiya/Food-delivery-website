function Sidebar({ active, setActive }) {
const menuItems = [
          { name: "Dashboard", icon: "fas fa-tachometer-alt", comp: "Dashboard" },
          { name: "Manage Users", icon: "fas fa-users", comp: "ManageUsers" },
          { name: "Manage Orders", icon: "fas fa-shopping-cart", comp: "ManageOrders" },
          { name: "Manage Restaurants", icon: "fas fa-utensils", comp: "ManageRestaurants" },
          { name: "Report & Analysis", icon: "fas fa-chart-line", comp: "ReportAnalysis" },
          { name: "Logout", icon: "fas fa-sign-out-alt", comp: "Logout" },
        ];

        return (
          <aside className="bg-orange-600 text-white w-64 min-h-screen hidden md:flex flex-col">
            <div className="text-3xl font-bold p-6 border-b border-orange-700">
              FoodAdmin
            </div>
            <nav className="flex flex-col flex-grow">
              {menuItems.map(({ name, icon, comp }) => (
                <button
                  key={name}
                  onClick={() => setActive(comp)}
                  className={`flex items-center gap-3 px-6 py-4 text-left hover:bg-orange-700 transition-colors ${
                    active === comp ? "bg-orange-700 font-semibold" : ""
                  }`}
                >
                  <i className={icon}></i>
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </nav>
          </aside>
        );
      }

    export default Sidebar;