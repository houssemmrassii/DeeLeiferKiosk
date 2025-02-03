import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserFriends,
  FaTruck,
  FaBox,
  FaTags,
  FaClipboardList,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaMapMarkedAlt, // Import the map marker icon
} from "react-icons/fa";
import Logo from "../../images/logo/Logodeele.svg";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { pathname } = location;

  const trigger = useRef<any>(null);
  const sidebar = useRef<any>(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/auth/signin");
  };

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body")?.classList.add("sidebar-expanded");
    } else {
      document.querySelector("body")?.classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`absolute left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[#1c1f1d] text-[#d6d5c9] transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } overflow-y-auto no-scrollbar`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-center px-5 py-5 bg-[#1c1f1d]">
        <NavLink to="/" className="flex items-center">
          <img src={Logo} alt="Logo" className="h-30 w-auto object-contain" />
        </NavLink>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden text-white"
        >
          <svg
            className="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className="flex flex-col overflow-y-auto mt-2">
        <nav className="px-4 py-4">
          <ul className="space-y-4">
            {/* Dashboard */}
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaHome className="text-lg" />
                Dashboard
              </NavLink>
            </li>

            {/* List Zones */}
            <li>
              <NavLink
                to="/ListZones"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaMapMarkerAlt className="text-lg" />
                List Zones
              </NavLink>
            </li>

            {/* Delivery Men */}
            <li>
              <NavLink
                to="/ListDeliveryman"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaTruck className="text-lg" />
                Delivery Man
              </NavLink>
            </li>
             {/* 📍 Tracking - NEW */}
             <li>
              <NavLink
                to="/tracking"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaMapMarkedAlt className="text-lg" />
                Tracking
              </NavLink>
            </li>

            {/* Users */}
            <li>
              <NavLink
                to="/ListUsers"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaUserFriends className="text-lg" />
                Users
              </NavLink>
            </li>

            {/* Promotions */}
            <li>
              <NavLink
                to="/ListPromotion"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaTags className="text-lg" />
                Promotions
              </NavLink>
            </li>

            {/* Commands */}
            <li>
              <NavLink
                to="/CommandTable"
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-[#b9baa3] text-[#0a100d]"
                      : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                  }`
                }
              >
                <FaClipboardList className="text-lg" />
                Commands
              </NavLink>
            </li>

            {/* Products */}
            <li>
              <SidebarLinkGroup activeCondition={pathname.includes("products")}>
                {(handleClick, open) => (
                  <div>
                    <button
                      onClick={handleClick}
                      className={`flex w-full items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                        open
                          ? "bg-[#b9baa3] text-[#0a100d]"
                          : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                      }`}
                    >
                      <FaBox className="text-lg" />
                      Products
                      <svg
                        className={`ml-auto w-4 h-4 transform ${
                          open ? "rotate-180" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <ul className={`${open ? "block" : "hidden"} pl-10 mt-2`}>
                      <li>
                        <NavLink
                          to="/ListProduct"
                          className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                              isActive
                                ? "bg-[#b9baa3] text-[#0a100d]"
                                : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                            }`
                          }
                        >
                          Products
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/ListCategories"
                          className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                              isActive
                                ? "bg-[#b9baa3] text-[#0a100d]"
                                : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                            }`
                          }
                        >
                          Categories
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/ListTypes"
                          className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg ${
                              isActive
                                ? "bg-[#b9baa3] text-[#0a100d]"
                                : "text-[#d6d5c9] hover:bg-[#d6d5c9] hover:text-[#0a100d]"
                            }`
                          }
                        >
                          Types
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                )}
              </SidebarLinkGroup>
            </li>
          </ul>
        </nav>
      </div>

      {/* Logout */}
      <div className="px-4 py-6">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center px-6 py-3 text-[#d6d5c9] rounded-lg hover:bg-[#d6d5c9] hover:text-[#1c1f1d] transition-all"
          title="Logout"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
