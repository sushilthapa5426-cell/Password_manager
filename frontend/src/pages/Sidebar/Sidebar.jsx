import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  KeyRound,
  Lock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu, //hamburger open icon
  X, // hamburher close icon
  History,
} from "lucide-react";
import { getUser, clearAuth } from "../../utils/api"; // reads user from localStorage
import "./Sidebar.css";

const Sidebar = () => {
  // getUser() returns: { fullName: "Sushil Thapa", email: "sushil@gmail.com" }
  const user = getUser();

  // Build initials from fullName:
  // "Sushil Thapa"
  //   .split(" ")      → ["Sushil", "Thapa"]
  //   .map(n => n[0])  → ["S", "T"]
  //   .join("")        → "ST"
  //   .toUpperCase()   → "ST"
  // No user? Fall back to "U"
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // useNavigate gives us a function to jump to another page
  const navigate = useNavigate();
  // Logout steps:
  // 1. clearAuth() → wipes token + user from localStorage
  // 2. navigate("/login") → sends user to login page
  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // collapsed state:
  // false → sidebar is wide 240px (default)
  // true  → sidebar is narrow 72px (icons only)
  // We need this to know WHEN to show hamburger instead of sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Mobile states
  // isMobile   → true when screen is ≤ 768px
  // We need this to know WHEN to show hamburger instead of sidebar
  const [isMobile, setIsMobile] = useState(false);

  // mobileOpen → true when the mobile drawer is slid open
  // false = drawer hidden off-screen | true = drawer visible
  const [mobileOpen, setMobileOpen] = useState(false);

  // useEffect runs ONCE after the component appears on screen.
  // The [] means: do not re-run on every render, only run on mount.
  //
  // Inside we:
  //   1. Check screen width immediately
  //   2. Add a resize listener to keep checking
  //   3. Return a cleanup function that removes the listener
  //      when the component is removed from the screen
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // If user drags window bigger, auto-close the mobile drawe r
      if (!mobile) setMobileOpen(false);
    };

    check(); // run once on mount
    window.addEventListener("resize", check); // thenrun on every resize
    return () => window.removeEventListener("resize", check); // cleanup
  }, []);

  // When a nav link is tapped on mobile, close the drawer
  const handleLinkClick = () => {
    if (isMobile) setMobileOpen(false);
  };

  // isCollapsed only applies on desktop.
  // On mobile the sidebar is always full-width when open.
  // !isMobile makes sure collapse only works on desktop.
  const isCollapsed = !isMobile && collapsed;

  return (
    // data-collapsed="true" or "false" is read by CSS to switch the width and
    //center the icons. // it effec the whole div
    <div className="sidebar" data-collapsed={collapsed}>
      {/* BRAND */}
      <div className="sidebar__brand">
        <ShieldCheck size={22} color="#4a9eff" />
        {!collapsed && (
          <div>
            <p className="sidebar__brand-name">PassVault</p>
            <p className="sidebar__brand-tagline">Password Manager</p>
          </div>
        )}

        {/* Round collapse button — top right corner of sidebar */}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {/* Show left arrow when open, right arrow when collapsed */}
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* USER PROFILE
          Avatar circle always shows initials (no real photo needed).
          Green dot = online indicator.
          Name and email sit beside the avatar. */}
      <div className="sidebar__profile">
        {/* Avatar circle */}
        <div className="sidebar__avatar">
          <span className="sidebar__avatar-initials">{initials}</span>
          {/* Green dot — bottom-right corner of avatar */}
          <span className="sidebar__avatar-dot" />
        </div>
        {/* Name + email from localStorage and collapsed the view when size is decreased  */}
        {!collapsed && (
          <div className="sidebar__profile-info">
            <span className="sidebar__profile-name">
              {user?.fullName || "User"}
            </span>
            <span className="sidebar__profile-email">{user?.email || ""}</span>
          </div>
        )}
      </div>

      {/* NAV LINKS */}
      <nav className="sidebar__nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <LayoutDashboard size={19} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink
          to="/my-password"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <KeyRound size={19} />
          {!collapsed && <span>My Passwords</span>}
        </NavLink>

        <NavLink
          to="/add-password"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <Lock size={19} />
          {!collapsed && <span>Add Password</span>}
        </NavLink>
        <NavLink
          to="/password-history"
          className={({ isActive }) =>
            isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
          }
        >
          <History size={19} />
          {!collapsed && <span>Password History</span>}
        </NavLink>
      </nav>
      {/* FOOTER
          sidebar__nav has flex:1 so it stretches to fill all space.
          That naturally pushes this footer div to the bottom. */}
      <div className="sidebar__footer">
        {/* Logout button
            We use <button> not <NavLink> because logout is an ACTION,
            not navigation to another page.
            onClick → calls handleLogout which clears data + redirects. */}
        <button
          className="sidebar__link sidebar__logout"
          onClick={handleLogout}
        >
          <LogOut size={19} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
