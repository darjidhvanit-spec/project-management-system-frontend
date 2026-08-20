import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
    const [user, setUser] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const loadUser = () => {
            try {
                const sessionData =
                    localStorage.getItem("pms:session") ||
                    localStorage.getItem("user");

                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    const loggedUser =
                        parsed?.user ||
                        parsed?.data ||
                        parsed;
                    setUser(loggedUser);
                }
            } catch (error) {
                console.error("Session Error:", error);
            }
        };

        loadUser();

        window.addEventListener("storage", loadUser);

        return () => {
            window.removeEventListener("storage", loadUser);
        };
    }, []);

    const userName =
        user?.name ||
        user?.fullName ||
        user?.userName ||
        "User";

    const userRole = user?.role
        ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()} Portal`
        : "Manager Portal";

    const getInitials = (name) => {
        if (!name) return "US";

        const words = name.trim().split(/\s+/);

        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }

        return name.substring(0, 2).toUpperCase();
    };

    // Determine current page title from pathname
    const getPageTitle = () => {
        const path = location.pathname.toLowerCase();

        if (
            path.includes("admin-dashboard") ||
            path.includes("dashboard-member") ||
            path === "/dashboard"
        ) {
            return "Dashboard";
        }
        if (path.includes("manage-users") || path.includes("admin/users")) {
            return "Manage Users";
        }
        if (path.includes("manage-projects") || path === "/projects") {
            return "Projects";
        }
        if (path.includes("manage-tasks") || path === "/tasks") {
            return "Tasks";
        }
        if (path.includes("my-tasks")) {
            return "My Tasks";
        }

        return "Overview";
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={20} strokeWidth={2} />
                </button>

                <h1 className="text-lg font-semibold text-slate-800">
                    {getPageTitle()}
                </h1>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 px-1.5 pr-3 shadow-xs">
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2161f5] text-xs font-bold text-white">
                    {getInitials(userName)}
                </div>

                {/* User */}
                <div className="hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-slate-800">
                        {userName}
                    </p>
                    <p className="text-[10px] leading-tight text-slate-500">
                        {userRole}
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Navbar;