import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClickOutside from "../ClickOutside";
import { UserCircleIcon, CogIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline"; // Heroicons
import UserOne from "../../images/user/user-01.png";

const DropdownUser: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve admin data from localStorage
    const authenticatedUser = localStorage.getItem("authenticatedUser");
    if (authenticatedUser) {
      setAdminData(JSON.parse(authenticatedUser));
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage and navigate to login
    localStorage.removeItem("authenticatedUser");
    navigate("/auth/signin");
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-4 focus:outline-none"
      >
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {adminData ? `${adminData.firstName} ${adminData.secondName || ""}` : "Loading..."}
          </span>
          <span className="block text-xs">
            {adminData ? adminData.role : "Loading..."}
          </span>
        </span>

        <span className="h-12 w-12 rounded-full">
          <img
            src={adminData?.photo_url || UserOne}
            alt="User"
            className="rounded-full"
          />
        </span>

        <svg
          className="hidden fill-current sm:block"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
            fill=""
          />
        </svg>
      </button>

      {dropdownOpen && (
        <div
          className={`absolute right-0 mt-4 flex w-64 flex-col rounded-sm border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark`}
        >
          <div className="px-4 py-3 border-b border-stroke dark:border-strokedark">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {adminData ? `${adminData.firstName} ${adminData.secondName || ""}` : "Loading..."}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {adminData ? adminData.email : "Loading..."}
            </p>
          </div>

          <ul className="flex flex-col gap-5 px-6 py-7">
            <li>
              <Link
                to="/profile"
                className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300"
              >
                <UserCircleIcon className="w-5 h-5" />
                My Profile
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300"
              >
                <CogIcon className="w-5 h-5" />
                Account Settings
              </Link>
            </li>
          </ul>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-red-600 hover:text-red-800"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}
      {/* Dropdown End */}
    </ClickOutside>
  );
};

export default DropdownUser;
