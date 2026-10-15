
// import { useEffect, useState, useMemo } from "react";
// import {
//   Filter,
//   CheckCheck,
//   RefreshCw,
//   Search,
//   Flame,
//   Wind,
//   UserX,
//   Clock,
// } from "lucide-react";
// import { useAlerts } from "@/context/AlertContext";
// import alertService from "@/services/api/alert.service";
// import AlertCard from "@/components/alert/AlertCard";
// import AdminLayout from "@/components/layout/AdminLayout";

// const Alerts = () => {
//   const {
//     alerts,
//     loading,
//     loadAlerts,
//     acknowledgeAlert,
//     markAllRead,
//     retryAlert,
//     deleteAlert,
//   } = useAlerts();

//   const [filters, setFilters] = useState({
//     type: "",
//     status: "",
//     search: "",
//   });
//   const [stats, setStats] = useState(null);

//   // Initial load
//   useEffect(() => {
//     loadAlerts(filters);
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const res = await alertService.stats(7);
//       setStats(res.data || res);
//     } catch (err) {
//       console.error("Stats fetch failed:", err);
//     }
//   };

//   const handleFilterChange = (key, value) => {
//     const newFilters = { ...filters, [key]: value };
//     setFilters(newFilters);
//     loadAlerts(newFilters);
//   };

//   const handleRefresh = () => {
//     loadAlerts(filters);
//     fetchStats();
//   };

//   // 🆕 Unread ko top pe laao (stable sort — original order preserve rahe read ke andar)
//   const sortedAlerts = useMemo(() => {
//     if (!Array.isArray(alerts)) return [];
//     const unread = alerts.filter((a) => !a.isRead);
//     const read = alerts.filter((a) => a.isRead);
//     return [...unread, ...read];
//   }, [alerts]);

//   const unreadCount = useMemo(
//     () => sortedAlerts.filter((a) => !a.isRead).length,
//     [sortedAlerts]
//   );

//   return (
//     <AdminLayout>
//       <div className="p-6 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//               Alerts
//               {unreadCount > 0 && (
//                 <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
//                   {unreadCount} unread
//                 </span>
//               )}
//             </h1>
//             <p className="text-gray-500 mt-1">
//               Real-time surveillance notifications
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
//             >
//               <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//               Refresh
//             </button>

//             <button
//               onClick={markAllRead}
//               disabled={unreadCount === 0}
//               className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <CheckCheck size={16} />
//               Mark all read
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         {stats && (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//             <StatCard
//               label="Total (7d)"
//               value={stats.total || 0}
//               color="blue"
//               icon={<Clock size={14} />}
//             />
//             <StatCard
//               label="Fire"
//               value={stats.byType?.fire || 0}
//               color="red"
//               icon={<Flame size={14} />}
//             />
//             <StatCard
//               label="Smoke"
//               value={stats.byType?.smoke || 0}
//               color="gray"
//               icon={<Wind size={14} />}
//             />
//             <StatCard
//               label="Person"
//               value={stats.byType?.person || 0}
//               color="amber"
//               icon={<UserX size={14} />}
//             />
//           </div>
//         )}

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="flex items-center gap-2 text-gray-700">
//               <Filter size={16} />
//               <span className="font-medium text-sm">Filters:</span>
//             </div>

//             <select
//               value={filters.type}
//               onChange={(e) => handleFilterChange("type", e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Types</option>
//               <option value="person">Person</option>
//               <option value="fire">Fire</option>
//               <option value="smoke">Smoke</option>
//             </select>

//             <select
//               value={filters.status}
//               onChange={(e) => handleFilterChange("status", e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Status</option>
//               <option value="success">Success</option>
//               <option value="partial">Partial</option>
//               <option value="failed">Failed</option>
//               <option value="pending">Pending</option>
//             </select>

//             <div className="flex-1 min-w-[200px] relative">
//               <Search
//                 size={16}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//               />
//               <input
//                 type="text"
//                 value={filters.search}
//                 onChange={(e) => handleFilterChange("search", e.target.value)}
//                 placeholder="Search camera..."
//                 className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Alerts List */}
//         {loading && alerts.length === 0 ? (
//           <div className="text-center py-16 text-gray-400">
//             <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
//             <p>Loading alerts...</p>
//           </div>
//         ) : sortedAlerts.length === 0 ? (
//           <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
//             <p className="text-lg">No alerts found</p>
//             <p className="text-sm mt-1">Alerts will appear here in real-time</p>
//           </div>
//         ) : (
//           <div className="grid gap-3">
//             {sortedAlerts.map((alert, idx) => {
//               const id = alert._id || alert.id;
//               const isUnread = !alert.isRead;

//               // 🆕 Pehla read alert aane se pehle ek divider lagao
//               const prevAlert = sortedAlerts[idx - 1];
//               const showDivider =
//                 prevAlert && !prevAlert.isRead === false && isUnread === false && unreadCount > 0;

//               return (
//                 <div key={id}>
//                   {/* Divider: Unread | Read */}
//                   {idx === unreadCount && unreadCount > 0 && (
//                     <div className="flex items-center gap-3 my-4">
//                       <div className="flex-1 h-px bg-gray-200" />
//                       <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
//                         Read
//                       </span>
//                       <div className="flex-1 h-px bg-gray-200" />
//                     </div>
//                   )}

//                   <div className={isUnread ? "ring-1 ring-red-100 rounded-xl" : ""}>
//                     <AlertCard
//                       alert={alert}
//                       onAcknowledge={() => acknowledgeAlert(id)}
//                       onRetry={() => retryAlert(id)}
//                       onDelete={() => deleteAlert(id)}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// };

// const StatCard = ({ label, value, color, icon }) => {
//   const colors = {
//     blue: "bg-blue-50 border-blue-200 text-blue-700",
//     red: "bg-red-50 border-red-200 text-red-700",
//     gray: "bg-gray-50 border-gray-200 text-gray-700",
//     amber: "bg-amber-50 border-amber-200 text-amber-700",
//   };
//   return (
//     <div className={`p-4 rounded-xl border ${colors[color]}`}>
//       <p className="text-xs font-medium uppercase opacity-70 flex items-center gap-1.5">
//         {icon} {label}
//       </p>
//       <p className="text-2xl font-bold mt-1">{value}</p>
//     </div>
//   );
// };

// export default Alerts;


import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Filter,
  CheckCheck,
  RefreshCw,
  Search,
  Flame,
  Wind,
  UserX,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAlerts } from "@/context/AlertContext";
import alertService from "@/services/api/alert.service";
import AlertCard from "@/components/alert/AlertCard";
import AdminLayout from "@/components/layout/AdminLayout";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const Alerts = () => {
  const {
    alerts,
    loading,
    pagination,      // 🆕 context se pagination
    loadAlerts,
    acknowledgeAlert,
    markAllRead,
    retryAlert,
    deleteAlert,
  } = useAlerts();

  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchInput, setSearchInput] = useState(""); // for debounce
  const [stats, setStats] = useState(null);

  // ═══════════════════════════════════════════
  // Initial load
  // ═══════════════════════════════════════════
  useEffect(() => {
    loadAlerts({ ...filters, page, limit });
    fetchStats();
  }, [page, limit]);

  // ═══════════════════════════════════════════
  // Debounced search — 500ms baad API call
  // ═══════════════════════════════════════════
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters((f) => ({ ...f, search: searchInput }));
        setPage(1); // search change pe page 1 pe reset
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filters ya search change hone pe reload
  useEffect(() => {
    loadAlerts({ ...filters, page, limit });
  }, [filters, page, limit]);

  const fetchStats = async () => {
    try {
      const res = await alertService.stats(7);
      setStats(res.data || res);
    } catch (err) {
      console.error("Stats fetch failed:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1); // filter change pe page 1
  };

  const handleRefresh = () => {
    loadAlerts({ ...filters, page, limit });
    fetchStats();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // top pe scroll
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🆕 Unread ko top pe (sirf current page pe)
  const sortedAlerts = useMemo(() => {
    if (!Array.isArray(alerts)) return [];
    const unread = alerts.filter((a) => !a.isRead);
    const read = alerts.filter((a) => a.isRead);
    return [...unread, ...read];
  }, [alerts]);

  const unreadCount = useMemo(
    () => sortedAlerts.filter((a) => !a.isRead).length,
    [sortedAlerts]
  );

  // Pagination meta
  const totalPages = pagination?.pages || 1;
  const totalItems = pagination?.total || 0;
  const currentPage = pagination?.page || page;
  const currentLimit = pagination?.limit || limit;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * currentLimit + 1;
  const endItem = Math.min(currentPage * currentLimit, totalItems);

  // Page numbers to show (with ellipsis)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Alerts
              {unreadCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time surveillance notifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck size={16} />
              Mark all read
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total (7d)"
              value={stats.total || 0}
              color="blue"
              icon={<Clock size={14} />}
            />
            <StatCard
              label="Fire"
              value={stats.byType?.fire || 0}
              color="red"
              icon={<Flame size={14} />}
            />
            <StatCard
              label="Smoke"
              value={stats.byType?.smoke || 0}
              color="gray"
              icon={<Wind size={14} />}
            />
            <StatCard
              label="Person"
              value={stats.byType?.person || 0}
              color="amber"
              icon={<UserX size={14} />}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter size={16} />
              <span className="font-medium text-sm">Filters:</span>
            </div>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="person">Person</option>
              <option value="fire">Fire</option>
              <option value="smoke">Smoke</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>

            <div className="flex-1 min-w-[200px] relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search camera..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 🆕 Page size selector */}
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Alerts List */}
        {loading && alerts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <RefreshCw size={32} className="animate-spin mx-auto mb-3" />
            <p>Loading alerts...</p>
          </div>
        ) : sortedAlerts.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
            <p className="text-lg">No alerts found</p>
            <p className="text-sm mt-1">Alerts will appear here in real-time</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {sortedAlerts.map((alert, idx) => {
                const id = alert._id || alert.id;
                const isUnread = !alert.isRead;

                return (
                  <div key={id}>
                    {/* Divider: Unread | Read */}
                    {idx === unreadCount && unreadCount > 0 && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Read
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div
                      className={
                        isUnread ? "ring-1 ring-red-100 rounded-xl" : ""
                      }
                    >
                      <AlertCard
                        alert={alert}
                        onAcknowledge={() => acknowledgeAlert(id)}
                        onRetry={() => retryAlert(id)}
                        onDelete={() => deleteAlert(id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* 🆕 PAGINATION */}
            {/* ═══════════════════════════════════════ */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-4">
                {/* Info */}
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{startItem}</span>–
                  <span className="font-medium">{endItem}</span> of{" "}
                  <span className="font-medium">{totalItems}</span> alerts
                </p>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* First */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="First page"
                  >
                    <ChevronsLeft size={16} />
                  </button>

                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1 mx-2">
                    {pageNumbers.map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-2 text-gray-400 text-sm"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition ${
                            p === currentPage
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Last */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Last page"
                  >
                    <ChevronsRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

const StatCard = ({ label, value, color, icon }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    red: "bg-red-50 border-red-200 text-red-700",
    gray: "bg-gray-50 border-gray-200 text-gray-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p className="text-xs font-medium uppercase opacity-70 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default Alerts;