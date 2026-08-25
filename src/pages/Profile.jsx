import React, { useEffect, useState } from "react";
import {
    User,
    Mail,
    ShieldCheck,
    UserCircle,
} from "lucide-react";

const Profile = () => {

    const [user, setUser] = useState({
        name: "",
        email: "",
        role: "Member",
    });

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================
    useEffect(() => {
        const getLoggedInUser = () => {
            try {
                const sessionData =
                    localStorage.getItem("pms:session") ||
                    localStorage.getItem("user");

                if (!sessionData) {
                    return;
                }

                const parsedData =
                    JSON.parse(sessionData);

                const loggedUser =
                    parsedData?.user ||
                    parsedData?.data ||
                    parsedData;

                setUser({
                    name:
                        loggedUser?.name ||
                        loggedUser?.fullName ||
                        loggedUser?.userName ||
                        loggedUser?.username ||
                        "User",

                    email:
                        loggedUser?.email ||
                        "No email available",

                    role:
                        loggedUser?.role ||
                        "Member",
                });

            } catch (error) {
                console.error(
                    "Profile user data error:",
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

    // =====================================================
    // INITIALS
    // =====================================================
    const getInitials = (name) => {
        if (!name) {
            return "US";
        }

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

    // =====================================================
    // ROLE
    // =====================================================
    const normalizedRole = String(user.role || "")
        .trim()
        .toLowerCase();

    const getRoleName = () => {
        if (normalizedRole === "admin") {
            return "Admin";
        }

        if (normalizedRole === "manager") {
            return "Manager";
        }

        if (normalizedRole === "member") {
            return "Member";
        }

        return user.role;
    };

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div className="mb-6">

                <h1 className="text-2xl font-bold text-[#1e293b]">
                    Profile
                </h1>

                <p className="mt-1 text-sm text-[#64748b]">
                    View your account information and profile details.
                </p>

            </div>

            {/* =================================================
                PROFILE CARD
            ================================================= */}
            <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">

                {/* =================================================
                    PROFILE TOP
                ================================================= */}
                <div className="border-b border-[#e2e8f0] bg-[#f8fafc] p-6 sm:p-8">

                    <div className="flex flex-col items-center gap-5 sm:flex-row">

                        {/* Avatar */}
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#2161f5] text-2xl font-bold text-white shadow-sm">
                            {getInitials(user.name)}
                        </div>

                        {/* User Info */}
                        <div className="text-center sm:text-left">

                            <h2 className="text-2xl font-bold text-[#1e293b]">
                                {user.name}
                            </h2>

                            <p className="mt-1 text-sm text-[#64748b]">
                                {user.email}
                            </p>

                            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                <ShieldCheck size={14} />
                                {getRoleName()}
                            </span>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    PROFILE DETAILS
                ================================================= */}
                <div className="p-6 sm:p-8">

                    <h3 className="mb-5 text-lg font-semibold text-[#1e293b]">
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                        {/* Name */}
                        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2161f5]">
                                    <User size={19} />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs font-medium text-[#94a3b8]">
                                        Full Name
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-[#334155]">
                                        {user.name}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Email */}
                        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                    <Mail size={19} />
                                </div>

                                <div className="min-w-0">

                                    <p className="text-xs font-medium text-[#94a3b8]">
                                        Email Address
                                    </p>

                                    <p className="mt-1 truncate text-sm font-semibold text-[#334155]">
                                        {user.email}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Role */}
                        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                    <ShieldCheck size={19} />
                                </div>

                                <div>

                                    <p className="text-xs font-medium text-[#94a3b8]">
                                        Role
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                                        {getRoleName()}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Account */}
                        <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                                    <UserCircle size={19} />
                                </div>

                                <div>

                                    <p className="text-xs font-medium text-[#94a3b8]">
                                        Account Type
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                                        Project Management System
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Profile;