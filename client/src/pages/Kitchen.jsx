import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Table as TableIcon,
  Menu as MenuIcon,
  ShoppingBag,
  ChefHat,
  Receipt,
  Calendar,
  Settings,
  LogOut,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import API from "../api/axios"; // Your configured API

export default function KitchenPage() {
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersRes, tablesRes, menuRes] = await Promise.all([
        API.get("/api/order"), // or "/api/orders" if different
        API.get("/api/table"),
        API.get("/api/menu-item"),
      ]);

      const ordersData = ordersRes.data?.data || ordersRes.data || [];
      const tablesData = tablesRes.data?.data || tablesRes.data || [];
      const menuData = menuRes.data?.data || menuRes.data || [];

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch (err) {
      console.error("Error loading kitchen data:", err);
      alert("Failed to load orders, tables, or menu items");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o)));

    const order = orders.find((o) => o.id === orderId);
    const table = tables.find((t) => t.id === order?.tableId);

    const tableName = table?.tableNumber || table?.number || "Unknown";

    if (status === "PREPARING") {
      alert(`Preparing order for Table ${tableName}`);
    } else if (status === "READY") {
      alert(`Table ${tableName} order is ready to serve`);
    } else if (status === "CANCELLED") {
      alert(`Table ${tableName} order has been cancelled`);
    } else if (status === "SERVED") {
      alert(`Table ${tableName} order marked as served`);
    }
  };

  const getTimeElapsed = (orderTime) => {
    if (!orderTime) return 0;
    const orderDate = new Date(orderTime);
    if (isNaN(orderDate.getTime())) return 0;
    const diff = Math.floor((currentTime.getTime() - orderDate.getTime()) / 1000 / 60);
    return Math.max(diff, 0);
  };

  const activeOrders = orders.filter((o) => o.status !== "SERVED" && o.status !== "CANCELLED");
  const pendingOrders = activeOrders.filter((o) => o.status === "PENDING" || o.status === "NEW");
  const preparingOrders = activeOrders.filter((o) => o.status === "PREPARING");
  const readyOrders = activeOrders.filter((o) => o.status === "READY");

  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin-dashboard" },
    { name: "Tables", icon: TableIcon, path: "/tables" },
    { name: "Menu", icon: MenuIcon, path: "/menu" },
    { name: "POS", icon: ShoppingBag, path: "/pos" },
    { name: "Kitchen", icon: ChefHat, path: "/kitchen" },
    { name: "Bills", icon: Receipt, path: "/bills" },
    { name: "Reservations", icon: Calendar, path: "/reservations" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-2xl text-gray-600">Loading kitchen orders...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">RestaurantOS</h1>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li
                key={item.name}
                className={`rounded-lg transition ${
                  location.pathname === item.path ? "bg-gray-800 font-medium" : "hover:bg-gray-800"
                }`}
              >
                <Link to={item.path} className="flex items-center gap-3 px-4 py-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="font-medium">Admin User</p>
              <p className="text-sm text-gray-400">ADMIN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ChefHat className="w-8 h-8" />
              Kitchen Display System
            </h1>
            <p className="text-gray-600 mt-1">{currentTime.toLocaleTimeString()}</p>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{activeOrders.length}</p>
              <p className="text-sm text-gray-600">Active Orders</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{pendingOrders.length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  PENDING
                </span>
                <span className="text-sm text-gray-600">{pendingOrders.length} orders</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingOrders.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const timeElapsed = getTimeElapsed(order.createdAt || order.placedAt);
                  const isUrgent = timeElapsed > 15;

                  const tableNumber = table?.tableNumber || table?.number || "?";

                  return (
                    <div
                      key={order.id}
                      className={`bg-white rounded-xl shadow-sm border-2 ${
                        isUrgent ? "border-red-500" : "border-gray-200"
                      } p-6`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                            #{tableNumber}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Table {tableNumber}</p>
                            <p className="text-sm text-gray-600">Order #{order.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center gap-1 ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">{timeElapsed}m</span>
                          </div>
                          {isUrgent && (
                            <span className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700">Note: {order.notes}</p>
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item, index) => {
                          const menuItem = menuItems.find((m) => m.id === item.menuItemId || m.id === item.id);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {item.quantity || item.qty || 1}
                                </div>
                                <p className="font-medium text-gray-900">
                                  {menuItem?.name || "Unknown Item"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order.id, "PREPARING")}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      >
                        Start Preparing
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preparing Orders */}
          {preparingOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  PREPARING
                </span>
                <span className="text-sm text-gray-600">{preparingOrders.length} orders</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {preparingOrders.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const timeElapsed = getTimeElapsed(order.createdAt || order.placedAt);
                  const tableNumber = table?.tableNumber || table?.number || "?";

                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                            #{tableNumber}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Table {tableNumber}</p>
                            <p className="text-sm text-gray-600">Order #{order.id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold">{timeElapsed}m</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item, index) => {
                          const menuItem = menuItems.find((m) => m.id === item.menuItemId || m.id === item.id);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {item.quantity || item.qty || 1}
                                </div>
                                <p className="font-medium text-gray-900">
                                  {menuItem?.name || "Unknown Item"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, "READY")}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Ready
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ready Orders */}
          {readyOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  READY
                </span>
                <span className="text-sm text-gray-600">{readyOrders.length} orders</span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {readyOrders.map((order) => {
                  const table = tables.find((t) => t.id === order.tableId);
                  const tableNumber = table?.tableNumber || table?.number || "?";

                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-lg">
                            #{tableNumber}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">Table {tableNumber}</p>
                            <p className="text-sm text-gray-600">Order #{order.id}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {(order.items || []).map((item, index) => {
                          const menuItem = menuItems.find((m) => m.id === item.menuItemId || m.id === item.id);
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                  {item.quantity || item.qty || 1}
                                </div>
                                <p className="font-medium text-gray-900">
                                  {menuItem?.name || "Unknown Item"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => updateOrderStatus(order.id, "SERVED")}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                      >
                        Mark Served
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Active Orders */}
          {activeOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
              <ChefHat className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-2xl font-semibold text-gray-900 mb-2">No active orders</p>
              <p className="text-gray-600">New orders from POS will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}