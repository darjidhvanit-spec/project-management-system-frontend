import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    FolderKanban,
    ClipboardCheck,
    Clock3,
    CheckCircle2,
    CircleDot,
    Plus,
    ArrowRight,
    CalendarDays,
    TrendingUp,
    ListTodo,
    Activity,
    Users,
    Sparkles,
    RefreshCw,
} from "lucide-react";

const Dashboard = () => {
    const navigate = useNavigate();

    // =====================================================
    // DASHBOARD STATE
    // =====================================================

    const [dashboardCount, setDashboardCount] = useState({
        totalProjectCount: 0,
        planningProjectCount: 0,
        activeProjectCount: 0,
        completedProjectCount: 0,

        totalTaskCount: 0,
        todoTaskCount: 0,
        inProgressTaskCount: 0,
        reviewTaskCount: 0,
        completedTaskCount: 0,
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const getUserData = () => {
        try {
            const storedUser = localStorage.getItem("pms:session");

            if (!storedUser) {
                return null;
            }

            return JSON.parse(storedUser);
        } catch (error) {
            console.error("User parse error:", error);
            return null;
        }
    };

    // =====================================================
    // DASHBOARD COUNT API
    // =====================================================

    const fetchDashboardCount = async () => {
        try {
            setLoading(true);
            setError("");

            const storedUser = getUserData();

            if (!storedUser) {
                setError("Please login first.");
                return;
            }

            setUser(storedUser);

            const userId =
                storedUser?._id ||
                storedUser?.id ||
                storedUser?.userId;

            if (!userId) {
                setError("Logged-in user ID not found.");
                return;
            }

            const payload = {
                userId,
            };

            const response = await axios.post(
                "https://project-management-system-backend-2-qyqt.onrender.com/user/dashboard_count",
                payload,
                {
                    headers: {
                        "api-key": "projectmanagement",
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Dashboard Count Response:", response.data);

            if (response.data?.success) {
                const responseData = response.data?.data;

                const data = Array.isArray(responseData)
                    ? responseData[0]
                    : responseData;

                if (data) {
                    setDashboardCount({
                        totalProjectCount:
                            Number(data.totalProjectCount) || 0,

                        planningProjectCount:
                            Number(data.planningProjectCount) || 0,

                        activeProjectCount:
                            Number(data.activeProjectCount) || 0,

                        completedProjectCount:
                            Number(data.completedProjectCount) || 0,

                        totalTaskCount:
                            Number(data.totalTaskCount) || 0,

                        todoTaskCount:
                            Number(data.todoTaskCount) || 0,

                        inProgressTaskCount:
                            Number(data.inProgressTaskCount) || 0,

                        reviewTaskCount:
                            Number(data.reviewTaskCount) || 0,

                        completedTaskCount:
                            Number(data.completedTaskCount) || 0,
                    });
                }
            } else {
                setError(
                    response.data?.message ||
                    "Unable to load dashboard data."
                );
            }
        } catch (error) {
            console.error("Dashboard Count API Error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    useEffect(() => {
        fetchDashboardCount();
    }, []);

    // =====================================================
    // CALCULATE PROJECT PROGRESS
    // =====================================================

    const projectProgress = useMemo(() => {
        const total = dashboardCount.totalProjectCount;

        if (!total) return 0;

        return Math.round(
            (dashboardCount.completedProjectCount / total) * 100
        );
    }, [
        dashboardCount.totalProjectCount,
        dashboardCount.completedProjectCount,
    ]);

    // =====================================================
    // CALCULATE TASK PROGRESS
    // =====================================================

    const taskProgress = useMemo(() => {
        const total = dashboardCount.totalTaskCount;

        if (!total) return 0;

        return Math.round(
            (dashboardCount.completedTaskCount / total) * 100
        );
    }, [
        dashboardCount.totalTaskCount,
        dashboardCount.completedTaskCount,
    ]);

    // =====================================================
    // PROJECT STATISTICS
    // =====================================================

    const projectCards = [
        {
            title: "Total Projects",
            value: dashboardCount.totalProjectCount,
            subtitle: "All projects",
            icon: FolderKanban,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            border: "hover:border-blue-200",
        },
        {
            title: "Planning",
            value: dashboardCount.planningProjectCount,
            subtitle: "Planning stage",
            icon: Clock3,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
            border: "hover:border-amber-200",
        },
        {
            title: "Active Projects",
            value: dashboardCount.activeProjectCount,
            subtitle: "Currently active",
            icon: Activity,
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
            border: "hover:border-violet-200",
        },
        {
            title: "Completed",
            value: dashboardCount.completedProjectCount,
            subtitle: "Successfully completed",
            icon: CheckCircle2,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            border: "hover:border-emerald-200",
        },
    ];

    // =====================================================
    // TASK STATISTICS
    // =====================================================

    const taskCards = [
        {
            title: "Total Tasks",
            value: dashboardCount.totalTaskCount,
            icon: ClipboardCheck,
            bg: "bg-slate-50",
            color: "text-slate-700",
        },
        {
            title: "To Do",
            value: dashboardCount.todoTaskCount,
            icon: CircleDot,
            bg: "bg-blue-50",
            color: "text-blue-600",
        },
        {
            title: "In Progress",
            value: dashboardCount.inProgressTaskCount,
            icon: Clock3,
            bg: "bg-amber-50",
            color: "text-amber-600",
        },
        {
            title: "Review",
            value: dashboardCount.reviewTaskCount,
            icon: ListTodo,
            bg: "bg-violet-50",
            color: "text-violet-600",
        },
        {
            title: "Completed",
            value: dashboardCount.completedTaskCount,
            icon: CheckCircle2,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
        },
    ];

    // =====================================================
    // LOADING SKELETON
    // =====================================================

    const StatSkeleton = () => (
        <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-9 w-16 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-28 rounded bg-slate-100" />
        </div>
    );

    // =====================================================
    // RETURN
    // =====================================================

    return (
        <div className="min-h-full w-full min-w-0 bg-[#f8fafc] p-4 sm:p-6 lg:p-8">

            {/* =====================================================
                HERO / HEADER
            ===================================================== */}

            <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#4f46e5] p-6 text-white shadow-lg sm:p-8">

                {/* Decorative circles */}

                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

                <div className="absolute -bottom-20 right-32 h-40 w-40 rounded-full bg-white/5" />

                <div className="absolute left-1/2 top-0 h-24 w-24 rounded-full bg-white/5" />

                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                            <Sparkles size={14} />
                            Project Management Overview
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Welcome back, {user?.name || "Manager"} 👋
                        </h1>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                            Here's what's happening with your projects and
                            tasks today. Keep your team moving forward.
                        </p>

                    </div>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={fetchDashboardCount}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/projects")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-md transition hover:bg-blue-50"
                        >
                            <Plus size={17} />
                            New Project
                        </button>

                    </div>

                </div>
            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={fetchDashboardCount}
                        className="shrink-0 font-semibold underline"
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* =====================================================
                PROJECT OVERVIEW
            ===================================================== */}

            <section className="mb-8">

                <div className="mb-4 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Project Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Track your project performance
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/projects")}
                        className="hidden items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:flex"
                    >
                        View Projects
                        <ArrowRight size={16} />
                    </button>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {projectCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.border}`}
                            >

                                <div className="flex items-start justify-between">

                                    <div className="min-w-0">

                                        <p className="text-sm font-medium text-slate-500">
                                            {card.title}
                                        </p>

                                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                            {loading ? (
                                                <span className="inline-block h-9 w-14 animate-pulse rounded bg-slate-200" />
                                            ) : (
                                                card.value
                                            )}
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {card.subtitle}
                                        </p>

                                    </div>

                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-200 group-hover:scale-110`}
                                    >
                                        <Icon size={22} />
                                    </div>

                                </div>

                                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">

                                    <div
                                        className={`h-full rounded-full bg-current ${card.iconColor} transition-all duration-700`}
                                        style={{
                                            width:
                                                dashboardCount.totalProjectCount > 0
                                                    ? `${Math.min(
                                                        100,
                                                        (card.value /
                                                            dashboardCount.totalProjectCount) *
                                                        100
                                                    )}%`
                                                    : "0%",
                                        }}
                                    />

                                </div>

                            </div>
                        );
                    })}

                </div>

            </section>

            {/* =====================================================
                MIDDLE SECTION
            ===================================================== */}

            <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">

                {/* =================================================
                    PROJECT PROGRESS
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

                    <div className="flex items-start justify-between">

                        <div>
                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <TrendingUp size={18} />
                                </div>

                                <h2 className="font-bold text-slate-800">
                                    Overall Progress
                                </h2>

                            </div>

                            <p className="mt-2 text-sm text-slate-500">
                                Project and task completion summary
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                            {projectProgress}%
                        </span>

                    </div>

                    {/* Project Progress */}

                    <div className="mt-7">

                        <div className="mb-2 flex items-center justify-between text-sm">

                            <span className="font-medium text-slate-600">
                                Projects completed
                            </span>

                            <span className="font-semibold text-slate-800">
                                {dashboardCount.completedProjectCount} /{" "}
                                {dashboardCount.totalProjectCount}
                            </span>

                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                                style={{
                                    width: `${projectProgress}%`,
                                }}
                            />

                        </div>

                    </div>

                    {/* Task Progress */}

                    <div className="mt-6">

                        <div className="mb-2 flex items-center justify-between text-sm">

                            <span className="font-medium text-slate-600">
                                Tasks completed
                            </span>

                            <span className="font-semibold text-slate-800">
                                {dashboardCount.completedTaskCount} /{" "}
                                {dashboardCount.totalTaskCount}
                            </span>

                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000"
                                style={{
                                    width: `${taskProgress}%`,
                                }}
                            />

                        </div>

                    </div>

                    {/* Bottom stats */}

                    <div className="mt-7 grid grid-cols-3 gap-3">

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Active
                            </p>

                            <p className="mt-1 text-xl font-bold text-slate-800">
                                {loading
                                    ? "..."
                                    : dashboardCount.activeProjectCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-amber-50 p-4">
                            <p className="text-xs text-amber-600">
                                Pending
                            </p>

                            <p className="mt-1 text-xl font-bold text-amber-700">
                                {loading
                                    ? "..."
                                    : dashboardCount.todoTaskCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-emerald-50 p-4">
                            <p className="text-xs text-emerald-600">
                                Done
                            </p>

                            <p className="mt-1 text-xl font-bold text-emerald-700">
                                {loading
                                    ? "..."
                                    : dashboardCount.completedTaskCount}
                            </p>
                        </div>

                    </div>

                </div>

                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center gap-2">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Sparkles size={18} />
                        </div>

                        <div>
                            <h2 className="font-bold text-slate-800">
                                Quick Actions
                            </h2>

                            <p className="text-xs text-slate-500">
                                Manage your workspace
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 space-y-3">

                        <button
                            type="button"
                            onClick={() => navigate("/projects")}
                            className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                        >

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                                <Plus size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Create Project
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Start a new project
                                </p>
                            </div>

                            <ArrowRight
                                size={17}
                                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                            />

                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/tasks")}
                            className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
                        >

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100">
                                <ClipboardCheck size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Manage Tasks
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    View and assign tasks
                                </p>
                            </div>

                            <ArrowRight
                                size={17}
                                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-violet-600"
                            />

                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/users")}
                            className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50"
                        >

                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                                <Users size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-800">
                                    Team Members
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Manage project members
                                </p>
                            </div>

                            <ArrowRight
                                size={17}
                                className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                            />

                        </button>

                    </div>

                </div>

            </div>

            {/* =====================================================
                TASK OVERVIEW
            ===================================================== */}

            <section>

                <div className="mb-4 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Task Overview
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Current task status across your projects
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/tasks")}
                        className="hidden items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:flex"
                    >
                        View Tasks
                        <ArrowRight size={16} />
                    </button>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">

                    {taskCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.title}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-slate-500">
                                            {card.title}
                                        </p>

                                        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                                            {loading ? (
                                                <span className="inline-block h-9 w-14 animate-pulse rounded bg-slate-200" />
                                            ) : (
                                                card.value
                                            )}
                                        </h3>

                                    </div>

                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.color} transition-transform duration-200 group-hover:scale-110`}
                                    >
                                        <Icon size={21} />
                                    </div>

                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">

                                    <div
                                        className={`h-1.5 w-1.5 rounded-full ${card.color.replace(
                                            "text-",
                                            "bg-"
                                        )}`}
                                    />

                                    Task status

                                </div>

                            </div>
                        );
                    })}

                </div>

            </section>

            {/* =====================================================
                FOOTER INFO
            ===================================================== */}

            <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CalendarDays size={18} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-700">
                            Stay organized
                        </p>

                        <p className="text-xs text-slate-400">
                            Keep projects and tasks updated regularly.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    onClick={() => navigate("/projects")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                    Go to Projects
                    <ArrowRight size={16} />
                </button>

            </div>

        </div>
    );
};

export default Dashboard;