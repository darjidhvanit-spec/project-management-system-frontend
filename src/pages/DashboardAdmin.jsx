
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users,
  Folder,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Inbox,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE_URL =
  "https://project-management-system-backend-2-qyqt.onrender.com";

const API_HEADERS = {
  headers: {
    "api-key": "projectmanagement",
    "Content-Type": "application/json",
  },
};

// =====================================================
// API ENDPOINTS
// =====================================================
// project_list = your existing API
// Change user/task URL only if your backend route is different.

const API_ENDPOINTS = {
  users: `${API_BASE_URL}/user/user_list`,
  projects: `${API_BASE_URL}/project/project_list`,
  tasks: `${API_BASE_URL}/task/task_list`,
};

// =====================================================
// EMPTY STATS
// =====================================================

const EMPTY_STATS = {
  users: {
    total: 0,
    admins: 0,
    managers: 0,
    members: 0,
  },

  projects: {
    total: 0,
    completed: 0,
    onHold: 0,
    active: 0,
    pending: 0,
    inProgress: 0,
    planning: 0,
  },

  tasks: {
    total: 0,
    done: 0,
    overdue: 0,
    unassigned: 0,
    dueIn7Days: 0,
  },
};

// =====================================================
// HELPER - GET ARRAY FROM DIFFERENT API RESPONSES
// =====================================================

const extractArray = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.userData)) {
    return data.data.userData;
  }

  if (Array.isArray(data?.data?.projectData)) {
    return data.data.projectData;
  }

  if (Array.isArray(data?.data?.taskData)) {
    return data.data.taskData;
  }

  if (Array.isArray(data?.userData)) {
    return data.userData;
  }

  if (Array.isArray(data?.projectData)) {
    return data.projectData;
  }

  if (Array.isArray(data?.taskData)) {
    return data.taskData;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
};

// =====================================================
// HELPER - NORMALIZE ROLE
// =====================================================

const normalizeRole = (role) => {
  return String(role || "")
    .trim()
    .toLowerCase();
};

// =====================================================
// HELPER - NORMALIZE STATUS
// =====================================================

const normalizeStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/-/g, " ");
};

// =====================================================
// HELPER - CHECK COMPLETED TASK
// =====================================================

const isCompletedTask = (task) => {
  const status = normalizeStatus(task?.status);

  return (
    status === "completed" ||
    status === "complete" ||
    status === "done"
  );
};

// =====================================================
// HELPER - GET TASK DUE DATE
// =====================================================

const getTaskDueDate = (task) => {
  return (
    task?.dueDate ||
    task?.due_date ||
    task?.deadline ||
    task?.endDate ||
    task?.due_date_time ||
    null
  );
};

// =====================================================
// HELPER - CHECK TASK ASSIGNED
// =====================================================

const isTaskUnassigned = (task) => {
  const assignedTo =
    task?.assignedTo ??
    task?.assigned_to ??
    task?.assignee ??
    task?.userId ??
    null;

  if (!assignedTo) {
    return true;
  }

  if (Array.isArray(assignedTo) && assignedTo.length === 0) {
    return true;
  }

  if (
    typeof assignedTo === "string" &&
    assignedTo.trim() === ""
  ) {
    return true;
  }

  return false;
};

// =====================================================
// DATE HELPERS
// =====================================================

const getStartOfToday = () => {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
};

const getEndOf7Days = () => {
  const date = getStartOfToday();

  date.setDate(date.getDate() + 7);
  date.setHours(23, 59, 59, 999);

  return date;
};

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  // ISO date
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(String(value))) {
    const [day, month, year] = String(value).split("-");

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

// =====================================================
// FORMAT CURRENT DATE
// =====================================================

const formatCurrentDate = () => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
};

// =====================================================
// DASHBOARD COMPONENT
// =====================================================

const DashboardAdmin = () => {
  const [stats, setStats] = useState(EMPTY_STATS);

  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    const response = await axios.post(
      API_ENDPOINTS.users,
      {
        page: 1,
        per_page: 10000,
        limit: 10000,
      },
      API_HEADERS
    );

    return extractArray(response);
  };

  // =====================================================
  // FETCH PROJECTS
  // =====================================================

  const fetchProjects = async () => {
    const response = await axios.post(
      API_ENDPOINTS.projects,
      {
        page: 1,
        per_page: 10000,
        limit: 10000,
      },
      API_HEADERS
    );

    return extractArray(response);
  };

  // =====================================================
  // FETCH TASKS
  // =====================================================

  const fetchTasks = async () => {
    const response = await axios.post(
      API_ENDPOINTS.tasks,
      {
        page: 1,
        per_page: 10000,
        limit: 10000,
      },
      API_HEADERS
    );

    return extractArray(response);
  };

  // =====================================================
  // CALCULATE DASHBOARD STATS
  // =====================================================

  const calculateStats = (
    userData,
    projectData,
    taskData
  ) => {
    // ===================================================
    // USERS
    // ===================================================

    const admins = userData.filter(
      (user) => normalizeRole(user?.role) === "admin"
    ).length;

    const managers = userData.filter(
      (user) => normalizeRole(user?.role) === "manager"
    ).length;

    const members = userData.filter(
      (user) => normalizeRole(user?.role) === "member"
    ).length;

    // ===================================================
    // PROJECTS
    // ===================================================

    const planning = projectData.filter((project) => {
      const status = normalizeStatus(project?.status);

      return (
        status === "planning" ||
        status === "pending"
      );
    }).length;

    const inProgress = projectData.filter((project) => {
      const status = normalizeStatus(project?.status);

      return status === "in progress";
    }).length;

    const completed = projectData.filter((project) => {
      const status = normalizeStatus(project?.status);

      return (
        status === "completed" ||
        status === "complete"
      );
    }).length;

    const onHold = projectData.filter((project) => {
      const status = normalizeStatus(project?.status);

      return (
        status === "on hold" ||
        status === "hold"
      );
    }).length;

    // Active = Planning + In Progress
    const active = planning + inProgress;

    // ===================================================
    // TASKS
    // ===================================================

    const done = taskData.filter((task) =>
      isCompletedTask(task)
    ).length;

    const unassigned = taskData.filter((task) =>
      isTaskUnassigned(task)
    ).length;

    const today = getStartOfToday();
    const sevenDays = getEndOf7Days();

    let overdue = 0;
    let dueIn7Days = 0;

    taskData.forEach((task) => {
      // Completed task should not be overdue
      if (isCompletedTask(task)) {
        return;
      }

      const dueValue = getTaskDueDate(task);

      const dueDate = parseDate(dueValue);

      if (!dueDate) {
        return;
      }

      // Overdue
      if (dueDate < today) {
        overdue += 1;
        return;
      }

      // Due within next 7 days
      if (
        dueDate >= today &&
        dueDate <= sevenDays
      ) {
        dueIn7Days += 1;
      }
    });

    // ===================================================
    // SET STATS
    // ===================================================

    setStats({
      users: {
        total: userData.length,
        admins,
        managers,
        members,
      },

      projects: {
        total: projectData.length,
        completed,
        onHold,
        active,
        pending: planning,
        planning,
        inProgress,
      },

      tasks: {
        total: taskData.length,
        done,
        overdue,
        unassigned,
        dueIn7Days,
      },
    });
  };

  // =====================================================
  // FETCH ALL DASHBOARD DATA
  // =====================================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        userData,
        projectData,
        taskData,
      ] = await Promise.all([
        fetchUsers(),
        fetchProjects(),
        fetchTasks(),
      ]);

      setUsers(userData);
      setProjects(projectData);
      setTasks(taskData);

      calculateStats(
        userData,
        projectData,
        taskData
      );
    } catch (err) {
      console.error(
        "Dashboard API Error:",
        err
      );

      console.error(
        "Dashboard API Response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
        "Unable to load dashboard data."
      );

      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // =====================================================
  // PERCENTAGES
  // =====================================================

  const activeProjectPercentage = useMemo(() => {
    if (!stats.projects.total) {
      return 0;
    }

    return Math.round(
      (stats.projects.active /
        stats.projects.total) *
      100
    );
  }, [
    stats.projects.active,
    stats.projects.total,
  ]);

  const taskCompletionPercentage = useMemo(() => {
    if (!stats.tasks.total) {
      return 0;
    }

    return Math.round(
      (stats.tasks.done /
        stats.tasks.total) *
      100
    );
  }, [
    stats.tasks.done,
    stats.tasks.total,
  ]);

  const deliveredPercentage = useMemo(() => {
    if (!stats.projects.total) {
      return 0;
    }

    return Math.round(
      (stats.projects.completed /
        stats.projects.total) *
      100
    );
  }, [
    stats.projects.completed,
    stats.projects.total,
  ]);

  // =====================================================
  // TEAM PERCENTAGES
  // =====================================================

  const adminPercentage =
    stats.users.total > 0
      ? Math.round(
        (stats.users.admins /
          stats.users.total) *
        100
      )
      : 0;

  const managerPercentage =
    stats.users.total > 0
      ? Math.round(
        (stats.users.managers /
          stats.users.total) *
        100
      )
      : 0;

  const memberPercentage =
    stats.users.total > 0
      ? Math.round(
        (stats.users.members /
          stats.users.total) *
        100
      )
      : 0;

  // =====================================================
  // PROJECT STATUS PERCENTAGES
  // =====================================================

  const pendingPercentage =
    stats.projects.total > 0
      ? Math.round(
        (stats.projects.pending /
          stats.projects.total) *
        100
      )
      : 0;

  const inProgressPercentage =
    stats.projects.total > 0
      ? Math.round(
        (stats.projects.inProgress /
          stats.projects.total) *
        100
      )
      : 0;

  const completedProjectPercentage =
    stats.projects.total > 0
      ? Math.round(
        (stats.projects.completed /
          stats.projects.total) *
        100
      )
      : 0;

  const onHoldPercentage =
    stats.projects.total > 0
      ? Math.round(
        (stats.projects.onHold /
          stats.projects.total) *
        100
      )
      : 0;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="w-full min-w-0 p-4 text-slate-800 sm:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin overview
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            {formatCurrentDate()} ·{" "}
            {stats.users.total} people,{" "}
            {stats.projects.total} projects and{" "}
            {stats.tasks.total} tasks across the workspace
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}

        <div className="flex flex-wrap items-center gap-3">

          <Link
            to="/manage-users"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Users size={16} />
            Manage users
          </Link>

          <Link
            to="/manage-projects"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Folder size={16} />
            Manage projects
          </Link>

          <Link
            to="/manage-tasks"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <CheckSquare size={16} />
            Manage tasks
          </Link>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Refresh dashboard"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          TOP METRIC CARDS
      ================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

        {/* TOTAL USERS */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL USERS
            </span>

            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Users size={18} />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.users.total}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            {stats.users.admins} admin ·{" "}
            {stats.users.managers} manager ·{" "}
            {stats.users.members} member
          </p>
        </div>

        {/* TOTAL PROJECTS */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL PROJECTS
            </span>

            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Folder size={18} />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.projects.total}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            {stats.projects.completed} completed ·{" "}
            {stats.projects.onHold} on hold
          </p>
        </div>

        {/* ACTIVE PROJECTS */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
              ACTIVE PROJECTS
            </span>

            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.projects.active}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            {activeProjectPercentage}% of the portfolio
          </p>
        </div>

        {/* TOTAL TASKS */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL TASKS
            </span>

            <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
              <CheckSquare size={18} />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.tasks.total}
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            {stats.tasks.done} done ·{" "}
            {taskCompletionPercentage}% complete
          </p>
        </div>

        {/* OVERDUE TASKS */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              OVERDUE TASKS
            </span>

            <div className="rounded-lg bg-red-50 p-2 text-red-500">
              <AlertTriangle size={18} />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.tasks.overdue}
          </div>

          <p className="mt-2 text-[11px] font-medium text-red-500">
            {stats.tasks.dueIn7Days} due in 7 days
          </p>
        </div>

        {/* UNASSIGNED TASKS */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="truncate text-[11px] font-bold uppercase tracking-wider text-slate-400">
              UNASSIGNED TASKS
            </span>

            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Inbox size={18} />
            </div>
          </div>

          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.tasks.unassigned}
          </div>

          <p className="mt-2 text-[11px] font-medium text-amber-600">
            {stats.tasks.total > 0
              ? Math.round(
                (stats.tasks.unassigned /
                  stats.tasks.total) *
                100
              )
              : 0}
            % with no owner
          </p>
        </div>
      </div>

      {/* =================================================
          BOTTOM ANALYTICS
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* =================================================
            TEAM COMPOSITION
        ================================================== */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Team composition
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {stats.users.total} accounts across 3 roles
              </p>
            </div>

            <Link
              to="/manage-users"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-8">

            {/* DONUT */}

            <div
              className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #a855f7 0% ${adminPercentage}%,
                  #3b82f6 ${adminPercentage}% ${adminPercentage + managerPercentage
                  }%,
                  #94a3b8 ${adminPercentage + managerPercentage
                  }% 100%
                )`,
              }}
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <span className="text-xl font-bold text-slate-800">
                    {stats.users.total}
                  </span>

                  <p className="text-[11px] text-slate-400">
                    people
                  </p>
                </div>
              </div>
            </div>

            {/* ROLE BREAKDOWN */}

            <div className="w-full flex-1 space-y-4">

              {/* ADMINS */}

              <div>
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    Admins
                  </span>

                  <div className="flex gap-4">
                    <span className="font-semibold text-slate-800">
                      {stats.users.admins}
                    </span>

                    <span className="w-8 text-right text-slate-400">
                      {adminPercentage}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-purple-500 transition-all"
                    style={{
                      width: `${adminPercentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* MANAGERS */}

              <div>
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Managers
                  </span>

                  <div className="flex gap-4">
                    <span className="font-semibold text-slate-800">
                      {stats.users.managers}
                    </span>

                    <span className="w-8 text-right text-slate-400">
                      {managerPercentage}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-blue-500 transition-all"
                    style={{
                      width: `${managerPercentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* MEMBERS */}

              <div>
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Members
                  </span>

                  <div className="flex gap-4">
                    <span className="font-semibold text-slate-800">
                      {stats.users.members}
                    </span>

                    <span className="w-8 text-right text-slate-400">
                      {memberPercentage}%
                    </span>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-slate-400 transition-all"
                    style={{
                      width: `${memberPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            DELIVERY HEALTH
        ================================================== */}

        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-100 pb-4">

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Delivery health
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {stats.projects.total} projects tracked
              </p>
            </div>

            <Link
              to="/manage-projects"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* DELIVERED */}

          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50/70 p-3">

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DELIVERED
              </span>

              <div className="text-xl font-bold text-slate-800">
                {deliveredPercentage}%
              </div>
            </div>

            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
              {stats.projects.completed} of{" "}
              {stats.projects.total} completed
            </span>
          </div>

          {/* PROJECT STATUS */}

          <div className="mt-5 space-y-3.5">

            {/* PENDING */}

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                <span>Pending</span>

                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">
                    {stats.projects.pending}
                  </span>

                  <span className="text-slate-400">
                    {pendingPercentage}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-400 transition-all"
                  style={{
                    width: `${pendingPercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* IN PROGRESS */}

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                <span>In Progress</span>

                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">
                    {stats.projects.inProgress}
                  </span>

                  <span className="text-slate-400">
                    {inProgressPercentage}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-blue-500 transition-all"
                  style={{
                    width: `${inProgressPercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* COMPLETED */}

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                <span>Completed</span>

                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">
                    {stats.projects.completed}
                  </span>

                  <span className="text-slate-400">
                    {completedProjectPercentage}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${completedProjectPercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* ON HOLD */}

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">

                <span>On Hold</span>

                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">
                    {stats.projects.onHold}
                  </span>

                  <span className="text-slate-400">
                    {onHoldPercentage}%
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-amber-500 transition-all"
                  style={{
                    width: `${onHoldPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;

