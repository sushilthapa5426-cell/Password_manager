// ============================================================
// Layout.jsx — Wraps all protected pages with Sidebar
//means with the help of this page i dont have to load nav bar each and every pages. wrapping this, i can simply call it in any page
// ============================================================
// <Outlet /> renders the current child route:
//   /dashboard    → <Dashboard />
//   /profile      → <Profile />
//   /add-password → <AddPassword />

import { Outlet } from "react-router-dom";
import Sidebar from "../../pages/Sidebar/Sidebar";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout-main">
        <Outlet />
        {/*  Child page renders here */}
      </main>
    </div>
  );
}
