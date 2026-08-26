
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    User,
    Mail,
    ShieldCheck,
    UserCircle,
    Pencil,
    X,
    Lock,
    Save,
    Loader2,
} from "lucide-react";

const Profile = () => {

    // =====================================================
    // API
    // =====================================================
    const API_BASE_URL =
        "https://project-management-system-backend-2-qyqt.onrender.com";

    // =====================================================
    // USER STATE
    // =====================================================
    const [user, setUser] = useState({
        userId: "",
        name: "",
        email: "",
        role: "Member",
    });

    // =====================================================
    // EDIT MODAL
    // =====================================================
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [formData, setFormData] = useState({
        userId: "",
        name: "",
        email: "",
        password: "",
        role: "Member",
    });

    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);

    // =====================================================
    // SUCCESS / ERROR MESSAGE
    // =====================================================
    const [message, setMessage] = useState({
        type: "",
        text: "",
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

                const parsedData = JSON.parse(sessionData);

                const loggedUser =
                    parsedData?.user ||
                    parsedData?.data ||
                    parsedData;

                const userId =
                    loggedUser?._id ||
                    loggedUser?.id ||
                    loggedUser?.userId ||
                    "";

                const name =
                    loggedUser?.name ||
                    loggedUser?.fullName ||
                    loggedUser?.userName ||
                    loggedUser?.username ||
                    "User";

                const email =
                    loggedUser?.email ||
                    "No email available";

                const role =
                    loggedUser?.role ||
                    "Member";

                setUser({
                    userId,
                    name,
                    email,
                    role,
                });

                setFormData({
                    userId,
                    name,
                    email,
                    password: "",
                    role,
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

    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================
    const handleOpenEdit = () => {

        setFormData({
            userId: user.userId,
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
        });

        setErrors({});

        setMessage({
            type: "",
            text: "",
        });

        setIsEditOpen(true);
    };

    // =====================================================
    // CLOSE EDIT MODAL
    // =====================================================
    const handleCloseEdit = () => {

        if (loading) {
            return;
        }

        setIsEditOpen(false);

        setErrors({});

        setMessage({
            type: "",
            text: "",
        });
    };

    // =====================================================
    // INPUT CHANGE
    // =====================================================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));

        setMessage({
            type: "",
            text: "",
        });
    };

    // =====================================================
    // VALIDATION
    // =====================================================
    const validateForm = () => {

        const newErrors = {};

        if (!formData.userId) {
            newErrors.userId = "User ID is required.";
        }

        if (!formData.name.trim()) {
            newErrors.name = "Name is required.";
        } else if (formData.name.trim().length < 2) {
            newErrors.name =
                "Name must be at least 2 characters.";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email =
                    "Please enter a valid email address.";
            }
        }

        /*
         * Password is optional.
         *
         * If user enters password,
         * validate minimum length.
         */
        if (
            formData.password &&
            formData.password.length < 6
        ) {
            newErrors.password =
                "Password must be at least 6 characters.";
        }

        if (!formData.role) {
            newErrors.role = "Role is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // =====================================================
    // UPDATE PROFILE API
    // =====================================================
    const handleUpdateProfile = async (e) => {

        e.preventDefault();

        setMessage({
            type: "",
            text: "",
        });

        if (!validateForm()) {
            return;
        }

        try {

            setLoading(true);

            /*
             * Payload exactly according to your API:
             *
             * {
             *   userId,
             *   name,
             *   email,
             *   password,
             *   role
             * }
             */

            const payload = {
                userId: formData.userId,
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                role: formData.role,
            };

            console.log("Update Profile Payload:", payload);

            const response = await axios.put(
                `${API_BASE_URL}/user/user_update`,
                payload,
                {
                    headers: {
                        "api-key": "projectmanagement",
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log(
                "Update Profile Response:",
                response.data
            );

            // =================================================
            // GET UPDATED USER FROM RESPONSE
            // =================================================
            const responseUser =
                response?.data?.data?.user ||
                response?.data?.data ||
                response?.data?.user ||
                null;

            const updatedUser = {
                userId:
                    responseUser?._id ||
                    responseUser?.id ||
                    responseUser?.userId ||
                    formData.userId,

                name:
                    responseUser?.name ||
                    formData.name,

                email:
                    responseUser?.email ||
                    formData.email,

                role:
                    responseUser?.role ||
                    formData.role,
            };

            // =================================================
            // UPDATE PROFILE UI
            // =================================================
            setUser(updatedUser);

            // =================================================
            // UPDATE LOCAL STORAGE
            // =================================================
            try {

                const currentSession =
                    localStorage.getItem("pms:session");

                if (currentSession) {

                    const parsedSession =
                        JSON.parse(currentSession);

                    /*
                     * Handle session structure:
                     *
                     * {
                     *   user: {...}
                     * }
                     */

                    if (parsedSession?.user) {

                        parsedSession.user = {
                            ...parsedSession.user,
                            _id: updatedUser.userId,
                            name: updatedUser.name,
                            email: updatedUser.email,
                            role: updatedUser.role,
                        };

                    } else {

                        parsedSession._id =
                            updatedUser.userId;

                        parsedSession.name =
                            updatedUser.name;

                        parsedSession.email =
                            updatedUser.email;

                        parsedSession.role =
                            updatedUser.role;
                    }

                    localStorage.setItem(
                        "pms:session",
                        JSON.stringify(parsedSession)
                    );
                }

                // =================================================
                // ALSO UPDATE "user" STORAGE IF IT EXISTS
                // =================================================
                const currentUser =
                    localStorage.getItem("user");

                if (currentUser) {

                    const parsedUser =
                        JSON.parse(currentUser);

                    const storedUser =
                        parsedUser?.user ||
                        parsedUser?.data ||
                        parsedUser;

                    const updatedStoredUser = {
                        ...storedUser,
                        _id: updatedUser.userId,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        role: updatedUser.role,
                    };

                    if (parsedUser?.user) {

                        parsedUser.user =
                            updatedStoredUser;

                    } else if (parsedUser?.data) {

                        parsedUser.data =
                            updatedStoredUser;

                    } else {

                        Object.assign(
                            parsedUser,
                            updatedStoredUser
                        );
                    }

                    localStorage.setItem(
                        "user",
                        JSON.stringify(parsedUser)
                    );
                }

            } catch (storageError) {

                console.error(
                    "LocalStorage update error:",
                    storageError
                );
            }

            // =================================================
            // RESET PASSWORD FIELD
            // =================================================
            setFormData((prev) => ({
                ...prev,
                userId: updatedUser.userId,
                name: updatedUser.name,
                email: updatedUser.email,
                password: "",
                role: updatedUser.role,
            }));

            // =================================================
            // SUCCESS
            // =================================================
            setMessage({
                type: "success",
                text:
                    response?.data?.message ||
                    "Profile updated successfully.",
            });

            // Close modal after short delay
            setTimeout(() => {
                setIsEditOpen(false);

                setMessage({
                    type: "",
                    text: "",
                });
            }, 1200);

        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to update profile. Please try again.";

            setMessage({
                type: "error",
                text: errorMessage,
            });

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div className="mb-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-[#1e293b]">
                            Profile
                        </h1>

                        <p className="mt-1 text-sm text-[#64748b]">
                            View your account information and profile details.
                        </p>

                    </div>

                    {/* Edit Button */}
                    <button
                        type="button"
                        onClick={handleOpenEdit}
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-[#2161f5] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b52d4] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Pencil size={17} />
                        Edit Profile
                    </button>

                </div>

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

            {/* =====================================================
                EDIT PROFILE MODAL
            ===================================================== */}
            {isEditOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl">

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}
                        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">

                            <div>

                                <h2 className="text-lg font-bold text-[#1e293b]">
                                    Edit Profile
                                </h2>

                                <p className="mt-0.5 text-xs text-[#64748b]">
                                    Update your account information.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                disabled={loading}
                                className="rounded-lg p-2 text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#1e293b] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* =================================================
                            FORM
                        ================================================= */}
                        <form
                            onSubmit={handleUpdateProfile}
                            className="space-y-5 p-6"
                        >

                            {/* User ID */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                                    User ID
                                </label>

                                <input
                                    type="text"
                                    value={formData.userId}
                                    disabled
                                    className="w-full rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 text-sm text-[#64748b] outline-none"
                                />

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    User ID is used internally for updating your profile.
                                </p>

                                {errors.userId && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.userId}
                                    </p>
                                )}

                            </div>

                            {/* Name */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                                    Full Name
                                </label>

                                <div className="relative">

                                    <User
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                                    />

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        disabled={loading}
                                        className={`w-full rounded-lg border ${
                                            errors.name
                                                ? "border-red-400"
                                                : "border-[#e2e8f0]"
                                        } bg-white py-2.5 pl-10 pr-3 text-sm text-[#334155] outline-none transition focus:border-[#2161f5] focus:ring-2 focus:ring-blue-100 disabled:bg-[#f8fafc]`}
                                    />

                                </div>

                                {errors.name && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.name}
                                    </p>
                                )}

                            </div>

                            {/* Email */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                                    Email Address
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                                    />

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        disabled={loading}
                                        className={`w-full rounded-lg border ${
                                            errors.email
                                                ? "border-red-400"
                                                : "border-[#e2e8f0]"
                                        } bg-white py-2.5 pl-10 pr-3 text-sm text-[#334155] outline-none transition focus:border-[#2161f5] focus:ring-2 focus:ring-blue-100 disabled:bg-[#f8fafc]`}
                                    />

                                </div>

                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.email}
                                    </p>
                                )}

                            </div>

                            {/* Password */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                                    New Password
                                    <span className="ml-1 text-xs font-normal text-[#94a3b8]">
                                        (Optional)
                                    </span>
                                </label>

                                <div className="relative">

                                    <Lock
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                                    />

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter new password"
                                        disabled={loading}
                                        className={`w-full rounded-lg border ${
                                            errors.password
                                                ? "border-red-400"
                                                : "border-[#e2e8f0]"
                                        } bg-white py-2.5 pl-10 pr-3 text-sm text-[#334155] outline-none transition focus:border-[#2161f5] focus:ring-2 focus:ring-blue-100 disabled:bg-[#f8fafc]`}
                                    />

                                </div>

                                <p className="mt-1 text-xs text-[#94a3b8]">
                                    Leave blank if you don't want to change the password.
                                </p>

                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password}
                                    </p>
                                )}

                            </div>

                            {/* Role */}
                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#334155]">
                                    Role
                                </label>

                                <div className="relative">

                                    <ShieldCheck
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                                    />

                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`w-full appearance-none rounded-lg border ${
                                            errors.role
                                                ? "border-red-400"
                                                : "border-[#e2e8f0]"
                                        } bg-white py-2.5 pl-10 pr-3 text-sm text-[#334155] outline-none transition focus:border-[#2161f5] focus:ring-2 focus:ring-blue-100 disabled:bg-[#f8fafc]`}
                                    >
                                        <option value="Admin">
                                            Admin
                                        </option>

                                        <option value="Manager">
                                            Manager
                                        </option>

                                        <option value="Member">
                                            Member
                                        </option>
                                    </select>

                                </div>

                                {errors.role && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.role}
                                    </p>
                                )}

                            </div>

                            {/* =================================================
                                API MESSAGE
                            ================================================= */}
                            {message.text && (

                                <div
                                    className={`rounded-lg px-4 py-3 text-sm ${
                                        message.type === "success"
                                            ? "bg-green-50 text-green-700"
                                            : "bg-red-50 text-red-700"
                                    }`}
                                >
                                    {message.text}
                                </div>

                            )}

                            {/* =================================================
                                BUTTONS
                            ================================================= */}
                            <div className="flex flex-col-reverse gap-3 border-t border-[#e2e8f0] pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    disabled={loading}
                                    className="rounded-lg border border-[#e2e8f0] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2161f5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1b52d4] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={17} />
                                            Update Profile
                                        </>
                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Profile;

