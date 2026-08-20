import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    ListTodo,
    Search,
    AlertTriangle,
    ChevronDown,
    ArrowRight,
    LayoutGrid,
    CalendarDays,
    RefreshCw,
    X,
    Folder,
    User as UserIcon,
    Clock,
    CheckCircle2,
    Loader2,
    Eye,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000";
const API_HEADERS = {
    headers: {
        "api-key": "projectmanagement",
        "Content-Type": "application/json",
    },
};

const MyTasks = () => {
    const navigate = useNavigate();

    // =====================================================
    // USER STATE
    // =====================================================
    const [user, setUser] = useState({
        _id: "",
        id: "",
        name: "Member",
        role: "Member",
        email: "",
    });

    // =====================================================
    // DATA STATES
    // =====================================================
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    // =====================================================
    // FILTER & VIEW STATES
    // =====================================================
    const [search, setSearch] = useState("");
    const [projectFilter, setProjectFilter] = useState("All projects");
    const [statusFilter, setStatusFilter] = useState("All statuses");
    const [priorityFilter, setPriorityFilter] = useState("All priorities");
    const [overdueOnly, setOverdueOnly] = useState(false);
    const [assignedOnly, setAssignedOnly] = useState(false);
    const [viewMode, setViewMode] = useState("list"); // 'list' | 'board'

    // =====================================================
    // MODAL STATE
    // =====================================================
    const [selectedTask, setSelectedTask] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);

    // =====================================================
    // 1. GET LOGGED IN USER
    // =====================================================
    useEffect(() => {
        try {
            const sessionData =
                localStorage.getItem("pms:session") ||
                localStorage.getItem("user");

            if (!sessionData) return;

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

            const userName =
                loggedUser?.name ||
                loggedUser?.fullName ||
                loggedUser?.userName ||
                loggedUser?.username ||
                "Member";

            const userRole =
                loggedUser?.role ||
                loggedUser?.userType ||
                "Member";

            setUser({
                _id: userId,
                id: userId,
                name: userName,
                role: userRole,
                email: loggedUser?.email || "",
            });

            // If logged in as Member, default to showing assigned tasks
            if (userRole.toLowerCase() === "member") {
                setAssignedOnly(true);
            }
        } catch (err) {
            console.error("MyTasks user error:", err);
        }
    }, []);

    const fetchTasks = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError("");

            const response = await axios.post(
                `${API_BASE_URL}/task/task_list`,
                { search: "" },
                API_HEADERS
            );

            if (response.data?.success) {
                const taskData = response.data?.data?.taskData;
                setTasks(Array.isArray(taskData) ? taskData : []);
            } else {
                setTasks([]);
                setError(response.data?.message || "Unable to fetch tasks.");
            }
        } catch (err) {
            console.error("MyTasks Fetch Error:", err);
            setTasks([]);
            setError(
                err.response?.data?.message ||
                "Failed to connect to task server. Please make sure backend is running on port 5000."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/project/project_list`,
                {},
                API_HEADERS
            );

            if (response.data?.success) {
                const projectData = response.data?.data;
                setProjects(Array.isArray(projectData) ? projectData : []);
            } else {
                setProjects([]);
            }
        } catch (err) {
            console.error("MyTasks Project List Error:", err);
            setProjects([]);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchTasks();
        fetchProjects();
    }, [fetchTasks, fetchProjects]);


    const getProjectName = (task) => {
        const projectData = task.projectId || task.project;
        if (typeof projectData === "object" && projectData !== null) {
            return projectData.projectName || projectData.name || "Unknown Project";
        }
        if (projectData) {
            const found = projects.find(
                (p) => String(p._id || p.id) === String(projectData)
            );
            if (found) return found.projectName || found.name;
            return String(projectData);
        }
        return "General";
    };

    const getAssignedName = (assignedTo) => {
        if (!assignedTo) return "Unassigned";
        if (typeof assignedTo === "object") {
            return assignedTo.name || assignedTo.username || assignedTo.email || "Member";
        }
        return String(assignedTo);
    };

    const getAssignedId = (assignedTo) => {
        if (!assignedTo) return "";
        if (typeof assignedTo === "object") {
            return assignedTo._id || assignedTo.id || "";
        }
        return String(assignedTo);
    };

    const getCreatedByName = (createdBy) => {
        if (!createdBy) return "Admin";
        if (typeof createdBy === "object") {
            return createdBy.name || createdBy.username || "Admin";
        }
        return String(createdBy);
    };

    const formatDate = (dateValue) => {
        if (!dateValue) return "-";
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return String(dateValue);
            return date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return String(dateValue);
        }
    };

    // Normalize status names for consistent checks and displays
    const normalizeStatus = (status) => {
        if (!status) return "Todo";
        const s = String(status).trim().toLowerCase();
        if (s === "done" || s === "completed") return "Done";
        if (s === "in progress" || s === "inprogress") return "In Progress";
        if (s === "review" || s === "in review" || s === "inreview") return "In Review";
        return "Todo";
    };

    // Check if task is overdue
    const isTaskOverdue = (task) => {
        const normalized = normalizeStatus(task.status);
        if (normalized === "Done") return false;
        if (!task.dueDate) return false;

        const due = new Date(task.dueDate);
        if (isNaN(due.getTime())) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    };

    // Priority Styling
    const getPriorityClass = (priority) => {
        const p = String(priority).toLowerCase();
        if (p === "high") {
            return "border-red-200 bg-red-50 text-red-600";
        }
        if (p === "medium") {
            return "border-yellow-200 bg-yellow-50 text-yellow-700";
        }
        return "border-emerald-200 bg-emerald-50 text-emerald-700";
    };

    // Status Styling
    const getStatusClass = (status) => {
        const s = normalizeStatus(status);
        if (s === "Done") {
            return "border-emerald-200 bg-emerald-50 text-emerald-700";
        }
        if (s === "In Progress") {
            return "border-blue-200 bg-blue-50 text-blue-700";
        }
        if (s === "In Review") {
            return "border-purple-200 bg-purple-50 text-purple-700";
        }
        return "border-slate-200 bg-slate-50 text-slate-700";
    };


    const handleStatusChange = async (taskId, newStatus) => {
        try {
            setUpdatingTaskId(taskId);

            // Find existing task to maintain required payload fields
            const currentTask = tasks.find(
                (t) => (t._id || t.id) === taskId
            );

            // Format status to what backend expects (Todo, In Progress, Review, Completed)
            let backendStatus = newStatus;
            if (newStatus === "To Do" || newStatus === "Todo") backendStatus = "Todo";
            if (newStatus === "Done" || newStatus === "Completed") backendStatus = "Completed";
            if (newStatus === "In Review" || newStatus === "Review") backendStatus = "Review";
            if (newStatus === "In Progress") backendStatus = "In Progress";

            const payload = {
                id: taskId,
                taskTitle: currentTask?.taskTitle || currentTask?.title || "",
                description: currentTask?.description || "",
                projectId: currentTask?.projectId?._id || currentTask?.projectId || currentTask?.project || "",
                assignedTo: currentTask?.assignedTo?._id || currentTask?.assignedTo || "",
                priority: currentTask?.priority || "Medium",
                startDate: currentTask?.startDate ? String(currentTask.startDate).split("T")[0] : "",
                dueDate: currentTask?.dueDate ? String(currentTask.dueDate).split("T")[0] : "",
                status: backendStatus,
                createdBy: currentTask?.createdBy?._id || currentTask?.createdBy || "",
            };

            const response = await axios.put(
                `${API_BASE_URL}/task/task_update`,
                payload,
                API_HEADERS
            );

            if (response.data?.success) {
                // Optimistic UI update
                setTasks((prev) =>
                    prev.map((t) =>
                        (t._id || t.id) === taskId
                            ? { ...t, status: backendStatus }
                            : t
                    )
                );
            } else {
                alert(response.data?.message || "Failed to update status.");
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert(
                err.response?.data?.message ||
                "Error updating task status. Please try again."
            );
        } finally {
            setUpdatingTaskId(null);
        }
    };

    // =====================================================
    // 6. FILTERING LOGIC
    // =====================================================
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const taskId = task._id || task.id;
            const title = (task.taskTitle || task.title || "").toLowerCase();
            const description = (task.description || "").toLowerCase();
            const projectName = getProjectName(task).toLowerCase();
            const assignedName = getAssignedName(task.assignedTo).toLowerCase();
            const assignedId = getAssignedId(task.assignedTo);
            const searchText = search.toLowerCase().trim();

            // Search filter
            const matchesSearch =
                !searchText ||
                title.includes(searchText) ||
                description.includes(searchText) ||
                projectName.includes(searchText) ||
                assignedName.includes(searchText);

            // Project filter
            const matchesProject =
                projectFilter === "All projects" ||
                getProjectName(task) === projectFilter;

            // Status filter
            const normalized = normalizeStatus(task.status);
            let matchesStatus = true;
            if (statusFilter !== "All statuses") {
                if (statusFilter === "To Do" || statusFilter === "Todo") {
                    matchesStatus = normalized === "Todo";
                } else if (statusFilter === "In Progress") {
                    matchesStatus = normalized === "In Progress";
                } else if (statusFilter === "In Review" || statusFilter === "Review") {
                    matchesStatus = normalized === "In Review";
                } else if (statusFilter === "Done" || statusFilter === "Completed") {
                    matchesStatus = normalized === "Done";
                }
            }

            // Priority filter
            const matchesPriority =
                priorityFilter === "All priorities" ||
                String(task.priority).toLowerCase() === priorityFilter.toLowerCase();

            // Overdue filter
            const isOverdue = isTaskOverdue(task);
            const matchesOverdue = !overdueOnly || isOverdue;

            // Assigned to me filter
            let matchesAssigned = true;
            if (assignedOnly && user._id) {
                const matchesId = assignedId === user._id;
                const matchesUserString = assignedName === user.name.toLowerCase();
                matchesAssigned = matchesId || matchesUserString;
            }

            return (
                matchesSearch &&
                matchesProject &&
                matchesStatus &&
                matchesPriority &&
                matchesOverdue &&
                matchesAssigned
            );
        });
    }, [
        tasks,
        search,
        projectFilter,
        statusFilter,
        priorityFilter,
        overdueOnly,
        assignedOnly,
        user,
        projects,
    ]);


    const baseTasksForStats = useMemo(() => {
        if (assignedOnly && user._id) {
            return tasks.filter((t) => {
                const aId = getAssignedId(t.assignedTo);
                const aName = getAssignedName(t.assignedTo).toLowerCase();
                return aId === user._id || aName === user.name.toLowerCase();
            });
        }
        return tasks;
    }, [tasks, assignedOnly, user]);

    const toDoCount = baseTasksForStats.filter(
        (t) => normalizeStatus(t.status) === "Todo"
    ).length;

    const inProgressCount = baseTasksForStats.filter(
        (t) => normalizeStatus(t.status) === "In Progress"
    ).length;

    const reviewCount = baseTasksForStats.filter(
        (t) => normalizeStatus(t.status) === "In Review"
    ).length;

    const doneCount = baseTasksForStats.filter(
        (t) => normalizeStatus(t.status) === "Done"
    ).length;

    const overdueCount = baseTasksForStats.filter((t) => isTaskOverdue(t)).length;

    const stats = [
        {
            label: "TO DO",
            value: toDoCount,
            dot: "bg-[#91a5c2]",
            filterKey: "To Do",
        },
        {
            label: "IN PROGRESS",
            value: inProgressCount,
            dot: "bg-[#3180f7]",
            filterKey: "In Progress",
        },
        {
            label: "IN REVIEW",
            value: reviewCount,
            dot: "bg-[#8952f6]",
            filterKey: "In Review",
        },
        {
            label: "DONE",
            value: doneCount,
            dot: "bg-[#12b981]",
            filterKey: "Done",
        },
        {
            label: "OVERDUE",
            value: overdueCount,
            dot: "bg-[#f43f4b]",
            danger: true,
            isOverdue: true,
        },
    ];

    // Unique project names from projects API + tasks for the filter
    const projectOptions = useMemo(() => {
        const set = new Set();
        projects.forEach((p) => {
            if (p.projectName) set.add(p.projectName);
            else if (p.name) set.add(p.name);
        });
        tasks.forEach((t) => {
            const pName = getProjectName(t);
            if (pName && pName !== "Unknown Project" && pName !== "General") {
                set.add(pName);
            }
        });
        return Array.from(set);
    }, [projects, tasks]);

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
            {/* =====================================================
                TOP HEADER & ACTIONS
            ====================================================== */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-[28px] font-bold text-[#07152d]">
                        My Tasks
                    </h1>
                    <p className="mt-1 text-sm text-[#71809b]">
                        {loading
                            ? "Loading your task list..."
                            : `${filteredTasks.length} ${filteredTasks.length === 1 ? "task" : "tasks"
                            } found · ${filteredTasks.filter(
                                (t) => normalizeStatus(t.status) !== "Done"
                            ).length
                            } still open`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* User assignment toggle */}
                    {user.role?.toLowerCase() !== "member" && (
                        <button
                            type="button"
                            onClick={() => setAssignedOnly(!assignedOnly)}
                            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition ${assignedOnly
                                ? "border-[#2161f5] bg-blue-50 text-[#2161f5]"
                                : "border-[#dfe5ed] bg-white text-[#40536e] hover:bg-gray-50"
                                }`}
                        >
                            <UserIcon size={15} />
                            {assignedOnly ? "My Tasks Only" : "All Team Tasks"}
                        </button>
                    )}

                    {/* Refresh Button */}
                    <button
                        type="button"
                        onClick={() => fetchTasks(true)}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 rounded-lg border border-[#dfe5ed] bg-white px-3.5 py-2 text-xs font-medium text-[#40536e] shadow-sm transition hover:bg-[#f5f8fc] disabled:opacity-50"
                        title="Refresh Tasks"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin text-[#2161f5]" : ""}
                        />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* =====================================================
                ERROR ALERT
            ====================================================== */}
            {error && (
                <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={19} className="text-red-500 shrink-0" />
                        <p>{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchTasks()}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* =====================================================
                STATS COUNTERS
            ====================================================== */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
                {stats.map((item) => {
                    const isSelected =
                        (item.isOverdue && overdueOnly) ||
                        (!item.isOverdue && statusFilter === item.filterKey);

                    return (
                        <div
                            key={item.label}
                            onClick={() => {
                                if (item.isOverdue) {
                                    setOverdueOnly(!overdueOnly);
                                } else {
                                    setStatusFilter(
                                        statusFilter === item.filterKey
                                            ? "All statuses"
                                            : item.filterKey
                                    );
                                }
                            }}
                            className={`cursor-pointer rounded-xl border bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md ${isSelected
                                ? "border-[#2161f5] ring-2 ring-[#2161f5]/15"
                                : "border-[#dfe5ed] hover:border-[#cfd9e6]"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                                <span className="text-[11px] sm:text-[12px] font-semibold tracking-wide text-[#58708f]">
                                    {item.label}
                                </span>
                            </div>

                            <p
                                className={`mt-2.5 sm:mt-3 text-2xl sm:text-[26px] font-bold ${item.danger ? "text-red-500" : "text-[#07152d]"
                                    }`}
                            >
                                {item.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* =====================================================
                FILTERS & SEARCH BAR
            ====================================================== */}
            <section className="mt-5 rounded-xl border border-[#dfe5ed] bg-white p-4 shadow-sm">
                {/* Search + View Mode */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8da0bb]"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks by title, project, description..."
                            className="h-10 sm:h-11 w-full rounded-lg border border-[#cfd9e6] bg-white pl-10 pr-4 text-sm text-[#07152d] outline-none placeholder:text-[#91a3bc] transition focus:border-[#2161f5] focus:ring-2 focus:ring-[#2161f5]/10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex rounded-lg bg-[#f1f4f8] p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${viewMode === "list"
                                    ? "bg-white text-[#2161f5] shadow-sm"
                                    : "text-[#40536e] hover:text-[#07152d]"
                                    }`}
                            >
                                <ListTodo size={16} />
                                List
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode("board")}
                                className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition ${viewMode === "board"
                                    ? "bg-white text-[#2161f5] shadow-sm"
                                    : "text-[#40536e] hover:text-[#07152d]"
                                    }`}
                            >
                                <LayoutGrid size={16} />
                                Board
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dropdown Filters */}
                <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Project Filter */}
                    <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="h-10 sm:h-11 rounded-lg border border-[#cfd9e6] bg-white px-3.5 text-xs sm:text-sm text-[#24364f] outline-none transition focus:border-[#2161f5]"
                    >
                        <option value="All projects">All projects</option>
                        {projectOptions.map((pName) => (
                            <option key={pName} value={pName}>
                                {pName}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 sm:h-11 rounded-lg border border-[#cfd9e6] bg-white px-3.5 text-xs sm:text-sm text-[#24364f] outline-none transition focus:border-[#2161f5]"
                    >
                        <option value="All statuses">All statuses</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Done">Done</option>
                    </select>

                    {/* Priority Filter */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="h-10 sm:h-11 rounded-lg border border-[#cfd9e6] bg-white px-3.5 text-xs sm:text-sm text-[#24364f] outline-none transition focus:border-[#2161f5]"
                    >
                        <option value="All priorities">All priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    {/* Overdue Toggle */}
                    <button
                        type="button"
                        onClick={() => setOverdueOnly(!overdueOnly)}
                        className={`flex h-10 sm:h-11 items-center justify-center gap-2 rounded-lg border px-4 text-xs sm:text-sm font-medium transition ${overdueOnly
                            ? "border-red-300 bg-red-50 text-red-600"
                            : "border-[#cfd9e6] bg-white text-[#40536e] hover:bg-gray-50"
                            }`}
                    >
                        <AlertTriangle size={16} />
                        Overdue only
                    </button>
                </div>
            </section>

            {/* =====================================================
                LIST VIEW (TABLE)
            ====================================================== */}
            {viewMode === "list" && (
                <section className="mt-5 overflow-hidden rounded-xl border border-[#dfe5ed] bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-[#e8edf3] bg-[#f8fafc]">
                                    <th className="w-12 px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        #
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Task
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Project
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Assigned To
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Priority
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Due Date
                                    </th>
                                    <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-[#58708f]">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#e8edf3]">
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-16 text-center text-sm text-[#71809b]"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2
                                                    size={28}
                                                    className="animate-spin text-[#2161f5]"
                                                />
                                                <span>Loading tasks from server...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTasks.length > 0 ? (
                                    filteredTasks.map((task, index) => {
                                        const taskId = task._id || task.id;
                                        const normalized = normalizeStatus(task.status);
                                        const overdue = isTaskOverdue(task);
                                        const isUpdating = updatingTaskId === taskId;

                                        return (
                                            <tr
                                                key={taskId}
                                                className="transition hover:bg-[#fbfcfe]"
                                            >
                                                <td className="px-5 py-4 text-sm text-[#8ca0ba]">
                                                    {index + 1}
                                                </td>

                                                {/* Task Title + Description */}
                                                <td className="px-5 py-4">
                                                    <h3 className="text-sm font-semibold text-[#07152d]">
                                                        {task.taskTitle || task.title || "Untitled Task"}
                                                    </h3>
                                                    {task.description && (
                                                        <p className="mt-1 max-w-[340px] truncate text-xs text-[#71809b]">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Project */}
                                                <td className="px-5 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#30415b]">
                                                        <Folder size={14} className="text-[#8da0bb]" />
                                                        {getProjectName(task)}
                                                    </span>
                                                </td>

                                                {/* Assigned To */}
                                                <td className="px-5 py-4 text-xs font-medium text-[#40536e]">
                                                    {getAssignedName(task.assignedTo)}
                                                </td>

                                                {/* Priority */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPriorityClass(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority || "Medium"}
                                                    </span>
                                                </td>

                                                {/* Status Dropdown */}
                                                <td className="px-5 py-4">
                                                    <div className="relative w-[125px]">
                                                        {isUpdating ? (
                                                            <div className="flex h-8 items-center gap-1.5 rounded-lg border border-[#cfd9e6] bg-gray-50 px-2.5 text-xs text-[#64748b]">
                                                                <Loader2
                                                                    size={13}
                                                                    className="animate-spin text-[#2161f5]"
                                                                />
                                                                <span>Saving...</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <select
                                                                    value={
                                                                        normalized === "Done"
                                                                            ? "Done"
                                                                            : normalized === "In Progress"
                                                                                ? "In Progress"
                                                                                : normalized === "In Review"
                                                                                    ? "In Review"
                                                                                    : "To Do"
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleStatusChange(
                                                                            taskId,
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className={`h-8 w-full appearance-none rounded-lg border px-2.5 pr-7 text-xs font-medium outline-none transition ${getStatusClass(
                                                                        task.status
                                                                    )}`}
                                                                >
                                                                    <option value="To Do">To Do</option>
                                                                    <option value="In Progress">
                                                                        In Progress
                                                                    </option>
                                                                    <option value="In Review">
                                                                        In Review
                                                                    </option>
                                                                    <option value="Done">Done</option>
                                                                </select>

                                                                <ChevronDown
                                                                    size={13}
                                                                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-70"
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Due Date */}
                                                <td className="px-5 py-4">
                                                    <div
                                                        className={`flex items-center gap-1.5 text-xs ${overdue
                                                            ? "font-semibold text-red-600"
                                                            : "text-[#71809b]"
                                                            }`}
                                                    >
                                                        <CalendarDays size={14} />
                                                        {formatDate(task.dueDate)}
                                                        {overdue && (
                                                            <span className="rounded bg-red-100 px-1 py-0.5 text-[10px] uppercase text-red-700">
                                                                Overdue
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setShowViewModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d3ddea] px-3 py-1.5 text-xs font-medium text-[#30415b] transition hover:border-[#2161f5] hover:bg-[#f5f8fc] hover:text-[#2161f5]"
                                                    >
                                                        Open
                                                        <ArrowRight size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-14 text-center text-sm text-[#71809b]"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ListTodo size={32} className="text-[#94a3b8]" />
                                                <p className="font-medium text-[#334155]">
                                                    No tasks found
                                                </p>
                                                <p className="text-xs text-[#94a3b8]">
                                                    Try clearing search or filter criteria.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* =====================================================
                BOARD VIEW (KANBAN)
            ====================================================== */}
            {viewMode === "board" && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { title: "To Do", key: "Todo", border: "border-t-slate-400" },
                        { title: "In Progress", key: "In Progress", border: "border-t-blue-500" },
                        { title: "In Review", key: "In Review", border: "border-t-purple-500" },
                        { title: "Done", key: "Done", border: "border-t-emerald-500" },
                    ].map((col) => {
                        const colTasks = filteredTasks.filter(
                            (t) => normalizeStatus(t.status) === col.key
                        );

                        return (
                            <div
                                key={col.title}
                                className={`flex flex-col rounded-xl border border-[#dfe5ed] bg-[#f8fafc] p-3.5 shadow-sm border-t-4 ${col.border}`}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-[#1e293b]">
                                        {col.title}
                                    </h3>
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#64748b] shadow-xs">
                                        {colTasks.length}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {colTasks.length > 0 ? (
                                        colTasks.map((task) => {
                                            const taskId = task._id || task.id;
                                            const overdue = isTaskOverdue(task);

                                            return (
                                                <div
                                                    key={taskId}
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowViewModal(true);
                                                    }}
                                                    className="cursor-pointer rounded-lg border border-[#e2e8f0] bg-white p-3.5 shadow-xs transition hover:border-[#2161f5]/50 hover:shadow-md"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="truncate text-[11px] font-medium text-[#64748b]">
                                                            {getProjectName(task)}
                                                        </span>
                                                        <span
                                                            className={`rounded-full border px-2 py-0.2 text-[10px] font-semibold ${getPriorityClass(
                                                                task.priority
                                                            )}`}
                                                        >
                                                            {task.priority || "Medium"}
                                                        </span>
                                                    </div>

                                                    <h4 className="mt-2 text-sm font-semibold text-[#0f172a]">
                                                        {task.taskTitle || task.title || "Untitled"}
                                                    </h4>

                                                    {task.description && (
                                                        <p className="mt-1 line-clamp-2 text-xs text-[#64748b]">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex items-center justify-between border-t border-[#f1f5f9] pt-2.5 text-xs text-[#64748b]">
                                                        <div
                                                            className={`flex items-center gap-1 ${overdue ? "font-semibold text-red-500" : ""
                                                                }`}
                                                        >
                                                            <CalendarDays size={13} />
                                                            {formatDate(task.dueDate)}
                                                        </div>

                                                        <div className="text-[11px] font-medium text-[#475569]">
                                                            {getAssignedName(task.assignedTo)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-[#cbd5e1] p-6 text-center text-xs text-[#94a3b8]">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* =====================================================
                VIEW TASK DETAILS MODAL
            ====================================================== */}
            {showViewModal && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#1e293b]">
                                    Task Details
                                </h2>
                                <p className="mt-0.5 text-xs text-[#64748b]">
                                    View full information for this task
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowViewModal(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#1e293b]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-4 p-6">
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                    Task Title
                                </label>
                                <p className="mt-1 text-base font-bold text-[#0f172a]">
                                    {selectedTask.taskTitle || selectedTask.title || "Untitled Task"}
                                </p>
                            </div>

                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                    Description
                                </label>
                                <p className="mt-1 text-sm text-[#334155] whitespace-pre-wrap rounded-lg bg-[#f8fafc] p-3.5 border border-[#e2e8f0]">
                                    {selectedTask.description || "No description provided."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Project
                                    </label>
                                    <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                        {getProjectName(selectedTask)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Assigned To
                                    </label>
                                    <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                        {getAssignedName(selectedTask.assignedTo)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Priority
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${getPriorityClass(
                                                selectedTask.priority
                                            )}`}
                                        >
                                            {selectedTask.priority || "Medium"}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Status
                                    </label>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${getStatusClass(
                                                selectedTask.status
                                            )}`}
                                        >
                                            {normalizeStatus(selectedTask.status)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Start Date
                                    </label>
                                    <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                        {formatDate(selectedTask.startDate)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Due Date
                                    </label>
                                    <p
                                        className={`mt-1 text-sm font-medium ${isTaskOverdue(selectedTask)
                                            ? "font-semibold text-red-600"
                                            : "text-[#1e293b]"
                                            }`}
                                    >
                                        {formatDate(selectedTask.dueDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-[#e2e8f0] pt-3">
                                <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                    Created By
                                </label>
                                <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                    {getCreatedByName(selectedTask.createdBy)}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end border-t border-[#e2e8f0] px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setShowViewModal(false)}
                                className="rounded-lg bg-[#f1f5f9] px-5 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#e2e8f0]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyTasks;