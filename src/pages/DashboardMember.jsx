import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BriefcaseBusiness,
    CalendarDays,
    CircleAlert,
    LoaderCircle,
    CircleCheck,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

// ============================================================
// API CONFIG
// ============================================================

const API_BASE_URL =
    "https://project-management-system-backend-2-qyqt.onrender.com";

const API_HEADERS = {
    headers: {
        "api-key": "projectmanagement",
        "Content-Type": "application/json",
    },
};

const TASK_LIST_URL = `${API_BASE_URL}/task/task_list`;
const PROJECT_LIST_URL = `${API_BASE_URL}/project/project_list`;

// ============================================================
// HELPERS
// ============================================================

const getLoggedInUser = () => {
    try {
        const sessionData =
            localStorage.getItem("pms:session") ||
            localStorage.getItem("user");

        if (!sessionData) {
            return null;
        }

        const parsedData = JSON.parse(sessionData);

        return (
            parsedData?.user ||
            parsedData?.data ||
            parsedData
        );
    } catch (error) {
        console.error("Session parse error:", error);
        return null;
    }
};

// ------------------------------------------------------------
// Get ID from object / string
// ------------------------------------------------------------

const getObjectId = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
        return value;
    }

    return (
        value?._id ||
        value?.id ||
        value?.userId ||
        value?.projectId ||
        ""
    );
};

// ------------------------------------------------------------
// Date parser
// Supports:
// YYYY-MM-DD
// DD-MM-YYYY
// ISO dates
// ------------------------------------------------------------

const parseDate = (value) => {
    if (!value) return null;

    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }

    const stringValue = String(value).trim();

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
        const [year, month, day] = stringValue
            .split("-")
            .map(Number);

        const date = new Date(year, month - 1, day);

        return isNaN(date.getTime()) ? null : date;
    }

    // DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(stringValue)) {
        const [day, month, year] = stringValue
            .split("-")
            .map(Number);

        const date = new Date(year, month - 1, day);

        return isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(stringValue);

    return isNaN(date.getTime()) ? null : date;
};

// ------------------------------------------------------------
// Start of today
// ------------------------------------------------------------

const startOfToday = () => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
};

// ------------------------------------------------------------
// End of today
// ------------------------------------------------------------

const endOfToday = () => {
    const date = new Date();

    date.setHours(23, 59, 59, 999);

    return date;
};

// ------------------------------------------------------------
// Date is today
// ------------------------------------------------------------

const isToday = (value) => {
    const date = parseDate(value);

    if (!date) return false;

    return (
        date >= startOfToday() &&
        date <= endOfToday()
    );
};

// ------------------------------------------------------------
// Date is overdue
// ------------------------------------------------------------

const isOverdue = (task) => {
    const dueDate = parseDate(
        task?.dueDate ||
        task?.endDate ||
        task?.deadline
    );

    if (!dueDate) return false;

    const completed =
        String(task?.status || "")
            .toLowerCase()
            .trim() === "completed";

    if (completed) return false;

    return dueDate < startOfToday();
};

// ------------------------------------------------------------
// Due in next 7 days
// ------------------------------------------------------------

const isDueWithin7Days = (task) => {
    const dueDate = parseDate(
        task?.dueDate ||
        task?.endDate ||
        task?.deadline
    );

    if (!dueDate) return false;

    const today = startOfToday();

    const next7Days = new Date(today);

    next7Days.setDate(
        next7Days.getDate() + 7
    );

    return (
        dueDate >= today &&
        dueDate <= next7Days
    );
};

// ------------------------------------------------------------
// Format date
// ------------------------------------------------------------

const formatDate = (value) => {
    const date = parseDate(value);

    if (!date) return "-";

    return date.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "short",
        }
    );
};

// ============================================================
// RESPONSE ARRAY HELPER
// ============================================================

const getArrayFromResponse = (response) => {
    const data = response?.data;

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.data)) {
        return data.data;
    }

    if (Array.isArray(data?.data?.taskData)) {
        return data.data.taskData;
    }

    if (Array.isArray(data?.data?.projectData)) {
        return data.data.projectData;
    }

    if (Array.isArray(data?.taskData)) {
        return data.taskData;
    }

    if (Array.isArray(data?.projectData)) {
        return data.projectData;
    }

    if (Array.isArray(data?.result)) {
        return data.result;
    }

    return [];
};

// ============================================================
// DASHBOARD MEMBER
// ============================================================

const DashboardMember = () => {
    const navigate = useNavigate();

    // ========================================================
    // USER
    // ========================================================

    const [user, setUser] = useState({
        name: "Member",
        role: "Member",
        userId: "",
    });

    // ========================================================
    // DATA
    // ========================================================

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);

    // ========================================================
    // LOADING
    // ========================================================

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // ========================================================
    // GET USER
    // ========================================================

    useEffect(() => {
        const loggedUser = getLoggedInUser();

        if (!loggedUser) {
            setError("Please login first.");
            setLoading(false);
            return;
        }

        const userId =
            loggedUser?._id ||
            loggedUser?.id ||
            loggedUser?.userId ||
            "";

        setUser({
            name:
                loggedUser?.name ||
                loggedUser?.fullName ||
                loggedUser?.userName ||
                "Member",

            role:
                loggedUser?.role ||
                "Member",

            userId,
        });
    }, []);

    // ========================================================
    // FETCH TASKS + PROJECTS
    // ========================================================

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const loggedUser = getLoggedInUser();

            if (!loggedUser) {
                setError("Please login first.");
                return;
            }

            const userId =
                loggedUser?._id ||
                loggedUser?.id ||
                loggedUser?.userId ||
                "";

            if (!userId) {
                setError("Logged-in user ID not found.");
                return;
            }

            // ==================================================
            // TASK API
            // ==================================================

            const taskPayload = {
                page: 1,
                per_page: 1000,
                limit: 1000,
            };

            // ==================================================
            // PROJECT API
            // ==================================================

            const projectPayload = {
                page: 1,
                per_page: 1000,
                limit: 1000,
            };

            const [
                taskResponse,
                projectResponse,
            ] = await Promise.all([
                axios.post(
                    TASK_LIST_URL,
                    taskPayload,
                    API_HEADERS
                ),

                axios.post(
                    PROJECT_LIST_URL,
                    projectPayload,
                    API_HEADERS
                ),
            ]);

            // ==================================================
            // EXTRACT DATA
            // ==================================================

            const allTasks =
                getArrayFromResponse(taskResponse);

            const allProjects =
                getArrayFromResponse(projectResponse);

            // ==================================================
            // MEMBER TASKS
            // ==================================================

            const memberTasks =
                allTasks.filter((task) => {
                    const assignedId =
                        getObjectId(
                            task?.assignedTo
                        );

                    return (
                        String(assignedId) ===
                        String(userId)
                    );
                });

            // ==================================================
            // SET DATA
            // ==================================================

            setTasks(memberTasks);
            setProjects(allProjects);

            console.log(
                "All Tasks:",
                allTasks
            );

            console.log(
                "Member Tasks:",
                memberTasks
            );

            console.log(
                "Projects:",
                allProjects
            );

        } catch (err) {
            console.error(
                "Dashboard Member API Error:",
                err
            );

            if (err?.response) {
                setError(
                    err?.response?.data?.message ||
                    "Unable to load dashboard data."
                );
            } else if (err?.request) {
                setError(
                    "Server is not responding. Please check backend."
                );
            } else {
                setError(
                    err?.message ||
                    "Something went wrong."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // LOAD DASHBOARD
    // ========================================================

    useEffect(() => {
        if (user.userId) {
            fetchDashboardData();
        }
    }, [user.userId]);

    // ========================================================
    // DYNAMIC STATS
    // ========================================================

    const dashboardStats = useMemo(() => {
        const assigned = tasks.length;

        const dueToday = tasks.filter((task) =>
            isToday(
                task?.dueDate ||
                task?.endDate ||
                task?.deadline
            )
        ).length;

        const overdue = tasks.filter(
            (task) => isOverdue(task)
        ).length;

        const inProgress = tasks.filter(
            (task) =>
                String(task?.status || "")
                    .toLowerCase()
                    .trim() ===
                "in progress"
        ).length;

        const completed = tasks.filter(
            (task) =>
                String(task?.status || "")
                    .toLowerCase()
                    .trim() ===
                "completed"
        ).length;

        const review = tasks.filter(
            (task) =>
                String(task?.status || "")
                    .toLowerCase()
                    .trim() ===
                "review"
        ).length;

        const openTasks =
            assigned - completed;

        const completionPercentage =
            assigned > 0
                ? Math.round(
                    (completed / assigned) * 100
                )
                : 0;

        const dueNext7Days = tasks.filter(
            (task) =>
                isDueWithin7Days(task)
        ).length;

        return {
            assigned,
            dueToday,
            overdue,
            inProgress,
            completed,
            review,
            openTasks,
            completionPercentage,
            dueNext7Days,
        };
    }, [tasks]);

    // ========================================================
    // STATS CARDS
    // ========================================================

    const stats = [
        {
            title: "ASSIGNED TO ME",

            value: dashboardStats.assigned,

            description:
                dashboardStats.openTasks === 0
                    ? "No open tasks"
                    : `${dashboardStats.openTasks} task${dashboardStats.openTasks > 1
                        ? "s"
                        : ""
                    } still open`,

            icon: BriefcaseBusiness,

            iconClass:
                "bg-blue-50 text-blue-600",
        },

        {
            title: "DUE TODAY",

            value: dashboardStats.dueToday,

            description:
                dashboardStats.dueToday === 0
                    ? "Nothing due today"
                    : `${dashboardStats.dueToday} task${dashboardStats.dueToday > 1
                        ? "s"
                        : ""
                    } due today`,

            icon: CalendarDays,

            iconClass:
                "bg-yellow-50 text-yellow-600",
        },

        {
            title: "OVERDUE",

            value: dashboardStats.overdue,

            description:
                dashboardStats.overdue === 0
                    ? "You're right on time"
                    : `${dashboardStats.overdue} overdue task${dashboardStats.overdue > 1
                        ? "s"
                        : ""
                    }`,

            icon: CircleAlert,

            iconClass:
                "bg-red-50 text-red-500",
        },

        {
            title: "IN PROGRESS",

            value: dashboardStats.inProgress,

            description:
                `${dashboardStats.review} waiting on review`,

            icon: LoaderCircle,

            iconClass:
                "bg-purple-50 text-purple-600",
        },

        {
            title: "COMPLETED",

            value: dashboardStats.completed,

            description:
                `${dashboardStats.completionPercentage}% of your work is done`,

            icon: CircleCheck,

            iconClass:
                "bg-green-50 text-green-600",
        },
    ];

    // ========================================================
    // FOCUS TASK
    // ========================================================

    const focusTask = useMemo(() => {
        if (!tasks.length) return null;

        const dueTodayTask = tasks.find(
            (task) => isToday(
                task?.dueDate ||
                task?.endDate ||
                task?.deadline
            )
        );

        if (dueTodayTask) {
            return dueTodayTask;
        }

        const upcomingTask = [...tasks]
            .filter((task) => {
                const dueDate =
                    parseDate(
                        task?.dueDate ||
                        task?.endDate ||
                        task?.deadline
                    );

                return dueDate;
            })
            .sort((a, b) => {
                const dateA =
                    parseDate(
                        a?.dueDate ||
                        a?.endDate ||
                        a?.deadline
                    );

                const dateB =
                    parseDate(
                        b?.dueDate ||
                        b?.endDate ||
                        b?.deadline
                    );

                return dateA - dateB;
            });

        return upcomingTask[0] || tasks[0];
    }, [tasks]);

    // ========================================================
    // PROJECT PROGRESS
    // ========================================================

    const projectProgress = useMemo(() => {
        const projectMap = {};

        tasks.forEach((task) => {
            const projectId =
                getObjectId(
                    task?.projectId
                );

            if (!projectId) return;

            if (!projectMap[projectId]) {
                projectMap[projectId] = {
                    projectId,
                    total: 0,
                    completed: 0,
                    open: 0,
                    tasks: [],
                };
            }

            projectMap[projectId].total += 1;

            const status =
                String(task?.status || "")
                    .toLowerCase()
                    .trim();

            if (status === "completed") {
                projectMap[projectId].completed += 1;
            } else {
                projectMap[projectId].open += 1;
            }

            projectMap[projectId].tasks.push(task);
        });

        return Object.values(projectMap).map(
            (item) => {
                const project =
                    projects.find(
                        (projectItem) =>
                            String(
                                projectItem?._id
                            ) ===
                            String(
                                item.projectId
                            )
                    );

                const taskProject =
                    item.tasks?.[0]?.projectId;

                const projectName =
                    project?.projectName ||
                    taskProject?.projectName ||
                    "Project";

                const percentage =
                    item.total > 0
                        ? Math.round(
                            (item.completed /
                                item.total) *
                            100
                        )
                        : 0;

                const projectStatus =
                    project?.status ||
                    "In Progress";

                return {
                    ...item,
                    projectName,
                    percentage,
                    projectStatus,
                };
            }
        );
    }, [tasks, projects]);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <RefreshCw
                        size={18}
                        className="animate-spin"
                    />

                    Loading dashboard...
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="w-full">

                {/* =================================================
                    Greeting
                ================================================== */}

                <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div>

                        <h1 className="text-[30px] font-bold tracking-tight text-[#07152d]">
                            Good afternoon,{" "}
                            {user.name}
                        </h1>

                        <p className="mt-1 text-sm text-[#71809b]">

                            {new Date().toLocaleDateString(
                                "en-US",
                                {
                                    weekday:
                                        "long",

                                    day: "numeric",

                                    month:
                                        "long",

                                    year:
                                        "numeric",
                                }
                            )}

                            {" · "}

                            {dashboardStats.openTasks}{" "}
                            open task
                            {dashboardStats.openTasks !==
                                1
                                ? "s"
                                : ""}{" "}
                            on your plate

                        </p>

                    </div>

                    <div className="flex gap-2">

                        <button
                            type="button"
                            onClick={
                                fetchDashboardData
                            }
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                            <RefreshCw
                                size={17}
                            />

                            Refresh
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/member/tasks"
                                )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-[#2161f5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1855df]"
                        >
                            View all my tasks

                            <ArrowRight
                                size={18}
                            />
                        </button>

                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* =================================================
                    Stats
                ================================================== */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                    {stats.map((item) => {
                        const Icon =
                            item.icon;

                        return (
                            <div
                                key={
                                    item.title
                                }
                                className="rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm"
                            >

                                <div className="flex items-start justify-between">

                                    <p className="text-[12px] font-semibold tracking-wide text-[#58708f]">
                                        {
                                            item.title
                                        }
                                    </p>

                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.iconClass}`}
                                    >
                                        <Icon
                                            size={
                                                22
                                            }
                                        />
                                    </div>

                                </div>

                                <h2 className="mt-3 text-[30px] font-bold text-[#07152d]">
                                    {
                                        item.value
                                    }
                                </h2>

                                <p className="mt-1 text-xs text-[#71809b]">
                                    {
                                        item.description
                                    }
                                </p>

                            </div>
                        );
                    })}

                </div>

                {/* =================================================
                    Focus Today
                ================================================== */}

                <section className="mt-6 rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm">

                    <div className="flex items-start justify-between">

                        <div>

                            <h2 className="text-[16px] font-semibold text-[#07152d]">
                                Focus today
                            </h2>

                            <p className="mt-1 text-xs text-[#71809b]">
                                {
                                    dashboardStats.dueToday
                                }{" "}
                                due today ·{" "}
                                {
                                    dashboardStats.dueNext7Days
                                }{" "}
                                due in next 7 days
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/member/tasks"
                                )
                            }
                            className="flex items-center gap-1 text-sm font-medium text-[#2161f5]"
                        >
                            View all

                            <ArrowRight
                                size={16}
                            />
                        </button>

                    </div>

                    {focusTask ? (
                        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h3 className="text-sm font-semibold text-[#07152d]">
                                    {
                                        focusTask?.taskTitle ||
                                        focusTask?.title ||
                                        "Untitled task"
                                    }
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#71809b]">

                                    <span>
                                        {
                                            focusTask
                                                ?.projectId
                                                ?.projectName ||
                                            projects.find(
                                                (
                                                    projectItem
                                                ) =>
                                                    String(
                                                        projectItem?._id
                                                    ) ===
                                                    String(
                                                        getObjectId(
                                                            focusTask?.projectId
                                                        )
                                                    )
                                            )
                                                ?.projectName ||
                                            "Project"
                                        }
                                    </span>

                                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 font-medium text-red-500">
                                        {
                                            focusTask?.priority ||
                                            "Medium"
                                        }
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <CalendarDays
                                            size={
                                                14
                                            }
                                        />

                                        {formatDate(
                                            focusTask?.dueDate ||
                                            focusTask?.endDate ||
                                            focusTask?.deadline
                                        )}
                                    </span>

                                </div>

                            </div>

                            <span className="rounded-lg border border-[#d9e1eb] bg-white px-4 py-2.5 text-sm text-[#30415b]">
                                {
                                    focusTask?.status ||
                                    "Todo"
                                }
                            </span>

                        </div>
                    ) : (
                        <div className="mt-8 rounded-lg bg-slate-50 p-8 text-center">

                            <CircleCheck
                                className="mx-auto text-green-500"
                                size={
                                    32
                                }
                            />

                            <p className="mt-2 text-sm font-medium text-slate-700">
                                No tasks assigned to you
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                You're all caught up!
                            </p>

                        </div>
                    )}

                </section>

                {/* =================================================
                    Bottom Cards
                ================================================== */}

                <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">

                    {/* =================================================
                        My Progress
                    ================================================== */}

                    <section className="rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm">

                        <h2 className="text-[16px] font-semibold text-[#07152d]">
                            My progress
                        </h2>

                        <p className="mt-1 text-xs text-[#71809b]">
                            Across{" "}
                            {
                                dashboardStats.assigned
                            }{" "}
                            task
                            {dashboardStats.assigned !==
                                1
                                ? "s"
                                : ""}{" "}
                            of mine
                        </p>

                        <div className="mt-6 flex justify-center">

                            <div
                                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                                style={{
                                    background:
                                        `conic-gradient(#2f7cf6 0deg ${dashboardStats.completionPercentage *
                                        3.6
                                        }deg, #e9eef5 ${dashboardStats.completionPercentage *
                                        3.6
                                        }deg 360deg)`,
                                }}
                            >

                                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#f6f8fb]">

                                    <div className="text-center">

                                        <p className="text-3xl font-bold text-[#07152d]">
                                            {
                                                dashboardStats.completionPercentage
                                            }
                                            %
                                        </p>

                                        <p className="text-xs text-[#71809b]">
                                            Completed
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-3">

                            <div className="rounded-lg bg-slate-50 p-3 text-center">

                                <p className="text-lg font-bold text-slate-800">
                                    {
                                        dashboardStats.inProgress
                                    }
                                </p>

                                <p className="text-[11px] text-slate-400">
                                    In Progress
                                </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3 text-center">

                                <p className="text-lg font-bold text-slate-800">
                                    {
                                        dashboardStats.review
                                    }
                                </p>

                                <p className="text-[11px] text-slate-400">
                                    Review
                                </p>

                            </div>

                            <div className="rounded-lg bg-slate-50 p-3 text-center">

                                <p className="text-lg font-bold text-green-600">
                                    {
                                        dashboardStats.completed
                                    }
                                </p>

                                <p className="text-[11px] text-slate-400">
                                    Completed
                                </p>

                            </div>

                        </div>

                    </section>

                    {/* =================================================
                        My Projects
                    ================================================== */}

                    <section className="rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="text-[16px] font-semibold text-[#07152d]">
                                    My projects
                                </h2>

                                <p className="mt-1 text-xs text-[#71809b]">
                                    Progress counts only your own tasks
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/member/tasks"
                                    )
                                }
                                className="flex items-center gap-1 text-xs font-medium text-blue-600"
                            >
                                View tasks

                                <ArrowRight
                                    size={14}
                                />
                            </button>

                        </div>

                        {projectProgress.length >
                            0 ? (
                            <div className="mt-7 space-y-6">

                                {projectProgress
                                    .slice(
                                        0,
                                        5
                                    )
                                    .map(
                                        (
                                            projectItem
                                        ) => (
                                            <div
                                                key={
                                                    projectItem.projectId
                                                }
                                            >

                                                <div className="flex items-center justify-between gap-3">

                                                    <h3 className="text-sm font-semibold text-[#07152d]">
                                                        {
                                                            projectItem.projectName
                                                        }
                                                    </h3>

                                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                                        {
                                                            projectItem.projectStatus
                                                        }
                                                    </span>

                                                </div>

                                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf1f6]">

                                                    <div
                                                        className="h-full rounded-full bg-[#2161f5] transition-all"
                                                        style={{
                                                            width: `${projectItem.percentage}%`,
                                                        }}
                                                    />

                                                </div>

                                                <div className="mt-2 flex justify-between text-xs text-[#71809b]">

                                                    <span>
                                                        {
                                                            projectItem.completed
                                                        }{" "}
                                                        of{" "}
                                                        {
                                                            projectItem.total
                                                        }{" "}
                                                        your task
                                                        {projectItem.total !==
                                                            1
                                                            ? "s"
                                                            : ""}{" "}
                                                        done ·{" "}
                                                        {
                                                            projectItem.open
                                                        }{" "}
                                                        open
                                                    </span>

                                                    <span>
                                                        {
                                                            projectItem.percentage
                                                        }
                                                        %
                                                    </span>

                                                </div>

                                            </div>
                                        )
                                    )}

                            </div>
                        ) : (
                            <div className="mt-8 rounded-lg bg-slate-50 p-8 text-center">

                                <BriefcaseBusiness
                                    className="mx-auto text-slate-400"
                                    size={
                                        32
                                    }
                                />

                                <p className="mt-2 text-sm font-medium text-slate-700">
                                    No projects assigned
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Projects will appear here when tasks are assigned to you.
                                </p>

                            </div>
                        )}

                    </section>

                </div>

            </div>
        </div>
    );
};

export default DashboardMember;