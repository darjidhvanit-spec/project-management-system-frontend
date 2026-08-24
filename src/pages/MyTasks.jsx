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

const API_BASE_URL = "https://project-management-system-backend-2-qyqt.onrender.com";
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

    // =====================================================
    // FETCH TASKS
    // =====================================================
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
                "Failed to connect to task server."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // =====================================================
    // FETCH PROJECTS
    // =====================================================
    const fetchProjects = useCallback(async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/project/project_list`,
                user._id ? { userId: user._id } : {},
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
    }, [user._id]);

    // Initial Load
    useEffect(() => {
        fetchTasks();
        fetchProjects();
    }, [fetchTasks, fetchProjects]);

    // =====================================================
    // HELPER FUNCTIONS
    // =====================================================
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

    const normalizeStatus = (status) => {
        if (!status) return "Todo";
        const s = String(status).trim().toLowerCase();
        if (s === "done" || s === "completed") return "Done";
        if (s === "in progress" || s === "inprogress") return "In Progress";
        if (s === "review" || s === "in review" || s === "inreview") return "In Review";
        return "Todo";
    };

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

            const currentTask = tasks.find(
                (t) => (t._id || t.id) === taskId
            );

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
    // UNIQUE ASSIGNED PROJECTS FOR DROPDOWN (ONLY ASSIGNED TO MEMBER)
    // =====================================================
    const projectOptions = useMemo(() => {
        const set = new Set();
        
        // Filter tasks that belong to current logged in user
        const memberTasks = (assignedOnly && user._id) 
            ? tasks.filter((t) => {
                const aId = getAssignedId(t.assignedTo);
                const aName = getAssignedName(t.assignedTo).toLowerCase();
                return aId === user._id || aName === user.name.toLowerCase();
              })
            : tasks;

        memberTasks.forEach((t) => {
            const pName = getProjectName(t);
            if (pName && pName !== "Unknown Project" && pName !== "General") {
                set.add(pName);
            }
        });

        return Array.from(set);
    }, [tasks, assignedOnly, user, projects]);

    // =====================================================
    // FILTERING LOGIC FOR TABLE/BOARD
    // =====================================================
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
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

    // =====================================================
    // STATS LOGIC
    // =====================================================
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

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
            {/* TOP HEADER & ACTIONS */}
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

                    <button
                        type="button"
                        onClick={() => fetchTasks(true)}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 rounded-lg border border-[#dfe5ed] bg-white px-3.5 py-2 text-xs font-medium text-[#40536e] shadow-sm transition hover:bg-[#f5f8fc] disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin text-[#2161f5]" : ""}
                        />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </div>

            {/* ERROR ALERT */}
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

            {/* STATS COUNTERS */}
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

            {/* FILTERS & SEARCH BAR */}
            <section className="mt-5 rounded-xl border border-[#dfe5ed] bg-white p-4 shadow-sm">
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
                    {/* Project Filter - ONLY SHOWS MEMBER'S ASSIGNED PROJECTS */}
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

            {/* LIST VIEW (TABLE) */}
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
                                        <td colSpan="8" className="py-12 text-center">
                                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                                <Loader2 size={18} className="animate-spin text-[#2161f5]" />
                                                Loading tasks...
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-sm text-gray-500">
                                            No tasks found matching your filter criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTasks.map((task, idx) => {
                                        const taskId = task._id || task.id;
                                        const normalized = normalizeStatus(task.status);
                                        const isOverdue = isTaskOverdue(task);

                                        return (
                                            <tr key={taskId || idx} className="hover:bg-[#f8fafc] transition">
                                                <td className="px-5 py-4 text-xs font-medium text-gray-400">
                                                    {idx + 1}
                                                </td>

                                                {/* TASK TITLE & DESC */}
                                                <td className="px-5 py-4">
                                                    <div className="max-w-xs">
                                                        <p className="text-sm font-semibold text-[#07152d] line-clamp-1">
                                                            {task.taskTitle || task.title || "Untitled Task"}
                                                        </p>
                                                        {task.description && (
                                                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* PROJECT */}
                                                <td className="px-5 py-4 text-xs font-medium text-[#40536e]">
                                                    {getProjectName(task)}
                                                </td>

                                                {/* ASSIGNED TO */}
                                                <td className="px-5 py-4 text-xs font-medium text-[#40536e]">
                                                    {getAssignedName(task.assignedTo)}
                                                </td>

                                                {/* PRIORITY */}
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getPriorityClass(task.priority)}`}>
                                                        {task.priority || "Medium"}
                                                    </span>
                                                </td>

                                                {/* STATUS DROPDOWN */}
                                                <td className="px-5 py-4">
                                                    <div className="relative inline-block">
                                                        {updatingTaskId === taskId ? (
                                                            <div className="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-500">
                                                                <Loader2 size={13} className="animate-spin text-[#2161f5]" />
                                                                Updating...
                                                            </div>
                                                        ) : (
                                                            <select
                                                                value={normalized}
                                                                onChange={(e) => handleStatusChange(taskId, e.target.value)}
                                                                className={`h-8 cursor-pointer rounded-lg border px-2.5 pr-7 text-xs font-semibold outline-none transition ${getStatusClass(task.status)}`}
                                                            >
                                                                <option value="Todo">To Do</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="In Review">In Review</option>
                                                                <option value="Done">Done</option>
                                                            </select>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* DUE DATE */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-[#58708f]">
                                                        <CalendarDays size={14} className={isOverdue ? "text-red-500" : "text-gray-400"} />
                                                        <span className={isOverdue ? "font-semibold text-red-500" : ""}>
                                                            {formatDate(task.dueDate)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-5 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedTask(task);
                                                            setShowViewModal(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-[#dfe5ed] bg-white px-2.5 py-1.5 text-xs font-medium text-[#40536e] transition hover:bg-gray-50 hover:text-[#07152d]"
                                                    >
                                                        <Eye size={13} />
                                                        Open
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* BOARD VIEW */}
            {viewMode === "board" && (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {["Todo", "In Progress", "In Review", "Done"].map((colStatus) => {
                        const colTasks = filteredTasks.filter(
                            (t) => normalizeStatus(t.status) === colStatus
                        );

                        return (
                            <div key={colStatus} className="rounded-xl border border-[#dfe5ed] bg-[#f8fafc] p-3.5">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#58708f]">
                                        {colStatus}
                                    </h3>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#40536e] shadow-sm">
                                        {colTasks.length}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {colTasks.map((task) => (
                                        <div
                                            key={task._id || task.id}
                                            className="rounded-lg border border-[#dfe5ed] bg-white p-3.5 shadow-sm hover:shadow transition"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-[#07152d]">
                                                    {task.taskTitle || task.title}
                                                </p>
                                                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getPriorityClass(task.priority)}`}>
                                                    {task.priority || "Medium"}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                                                {task.description || "No description"}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] text-gray-400">
                                                <span>{getProjectName(task)}</span>
                                                <span>{formatDate(task.dueDate)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* VIEW MODAL */}
            {showViewModal && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between">
                            <h2 className="text-lg font-bold text-[#07152d]">
                                {selectedTask.taskTitle || selectedTask.title}
                            </h2>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-xs sm:text-sm text-[#40536e]">
                            <div>
                                <span className="font-semibold text-gray-500">Project: </span>
                                {getProjectName(selectedTask)}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Assigned To: </span>
                                {getAssignedName(selectedTask.assignedTo)}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Priority: </span>
                                {selectedTask.priority || "Medium"}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Status: </span>
                                {normalizeStatus(selectedTask.status)}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-500">Due Date: </span>
                                {formatDate(selectedTask.dueDate)}
                            </div>
                            <div className="pt-2">
                                <span className="font-semibold text-gray-500 block mb-1">Description: </span>
                                <p className="rounded-lg bg-gray-50 p-3 text-gray-700">
                                    {selectedTask.description || "No details provided."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="rounded-lg bg-[#2161f5] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600"
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