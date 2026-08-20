import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Folder,
    ClipboardCheck,
    ListTodo,
    Users,
    LogOut,
    X,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "User",
        role: "Member",
    });

    // ==========================================
    // GET LOGGED-IN USER
    // ==========================================
    useEffect(() => {
        const getLoggedInUser = () => {
            try {
                const sessionData =
                    localStorage.getItem("pms:session") ||
                    localStorage.getItem("user");

                if (!sessionData) {
                    return;
                }

                const parsedData = JSON.parse(sessionData);

                const loggedUser =
                    parsedData?.user ||
                    parsedData?.data ||
                    parsedData;

                setUser({
                    name:
                        loggedUser?.name ||
                        loggedUser?.fullName ||
                        loggedUser?.userName ||
                        "User",

                    role:
                        loggedUser?.role ||
                        "Member",
                });
            } catch (error) {
                console.error(
                    "Sidebar user data error:",
                    error
                );
            }
        };

        getLoggedInUser();

        window.addEventListener(
            "storage",
            getLoggedInUser
        );

        return () => {
            window.removeEventListener(
                "storage",
                getLoggedInUser
            );
        };
    }, []);

    // ==========================================
    // NORMALIZE ROLE
    // ==========================================
    const normalizedRole = String(user.role || "")
        .trim()
        .toLowerCase();

    // ==========================================
    // USER INITIALS
    // ==========================================
    const getInitials = (name) => {
        if (!name) return "US";

        const parts = name
            .trim()
            .split(/\s+/);

        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }

        return name
            .substring(0, 2)
            .toUpperCase();
    };

    // ==========================================
    // PORTAL NAME
    // ==========================================
    const getPortalName = () => {
        switch (normalizedRole) {
            case "admin":
                return "Admin Portal";

            case "manager":
                return "Manager Portal";

            case "member":
                return "Member Portal";

            default:
                return "Member Portal";
        }
    };

    // ==========================================
    // ROLE BASED MENU
    // ==========================================
    const getMenuItems = () => {
        // --------------------------------------
        // ADMIN MENU (ઈમેજ મુજબ)
        // --------------------------------------
        if (normalizedRole === "admin") {
            return [
                {
                    name: "Dashboard",
                    path: "/admin-dashboard",
                    icon: LayoutDashboard,
                },
                {
                    name: "Manage Users",
                    path: "/manage-users",
                    icon: Users,
                },
                {
                    name: "Manage Projects",
                    path: "/manage-projects",
                    icon: Folder,
                },
                {
                    name: "Manage Tasks",
                    path: "/manage-tasks",
                    icon: ClipboardCheck,
                },
            ];
        }

        // --------------------------------------
        // MANAGER MENU
        // --------------------------------------
        if (normalizedRole === "manager") {
            return [
                {
                    name: "Dashboard",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    name: "Projects",
                    path: "/projects",
                    icon: Folder,
                },
                {
                    name: "Tasks",
                    path: "/tasks",
                    icon: ClipboardCheck,
                },
            ];
        }

        // --------------------------------------
        // MEMBER MENU
        // --------------------------------------
        if (normalizedRole === "member") {
            return [
                {
                    name: "Dashboard",
                    path: "/dashboard-member",
                    icon: LayoutDashboard,
                },
                {
                    name: "My Tasks",
                    path: "/my-tasks",
                    icon: ListTodo,
                },
            ];
        }

        // --------------------------------------
        // DEFAULT MENU
        // --------------------------------------
        return [
            {
                name: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
        ];
    };

    const menuItems = getMenuItems();

    // ==========================================
    // LOGOUT
    // ==========================================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("pms:session");

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <>
            {/* MOBILE OVERLAY */}
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed
                    inset-y-0
                    left-0
                    z-50
                    flex
                    h-full
                    flex-col
                    bg-[#121927]
                    text-white
                    transition-all
                    duration-300
                    ease-in-out
                    lg:static
                    lg:z-auto
                    lg:shrink-0

                    ${isOpen
                        ? "w-[260px] translate-x-0"
                        : "-translate-x-full lg:w-0 lg:overflow-hidden lg:translate-x-0"
                    }
                `}
            >
                <div className="flex h-full w-[260px] flex-col min-h-0">
                    {/* USER PROFILE */}
                    <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#293142] px-5">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2161f5] text-sm font-bold text-white shadow-xs">
                                {getInitials(user.name)}
                            </div>

                            {/* User Details */}
                            <div className="min-w-0 flex-1">
                                <h2 className="truncate text-sm font-semibold leading-tight text-white">
                                    {user.name}
                                </h2>

                                <p className="mt-0.5 truncate text-xs text-[#91a0b9]">
                                    {getPortalName()}
                                </p>
                            </div>
                        </div>

                        {/* Mobile Close */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-[#91a0b9] hover:bg-[#1b2536] hover:text-white lg:hidden cursor-pointer"
                            aria-label="Close sidebar"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* MENU */}
                    <div className="flex-1 overflow-y-auto px-3.5 py-4">
                        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#71809b]">
                            Menu
                        </p>

                        <nav className="space-y-1.5">
                            {menuItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) {
                                                onClose();
                                            }
                                        }}
                                        className={({ isActive }) =>
                                            `flex h-11 items-center rounded-lg px-3.5 text-sm font-medium transition-all duration-200 ${isActive
                                                ? "bg-[#2161f5] text-white shadow-xs"
                                                : "text-[#91a0b9] hover:bg-[#1b2536] hover:text-white"
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon
                                                    size={19}
                                                    strokeWidth={
                                                        isActive
                                                            ? 2.2
                                                            : 1.8
                                                    }
                                                    className="shrink-0"
                                                />

                                                <span className="ml-3 truncate">
                                                    {item.name}
                                                </span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    {/* LOGOUT */}
                    <div className="shrink-0 border-t border-[#293142] p-3.5">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#e30613] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#c90511] active:scale-[0.98] cursor-pointer shadow-xs"
                        >
                            <LogOut
                                size={18}
                                strokeWidth={2}
                                className="shrink-0"
                            />

                            <span className="ml-2.5">
                                Logout
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;  
