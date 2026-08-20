import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Folder,
  TrendingUp,
  CheckSquare,
  AlertTriangle,
  Inbox,
  ArrowRight,
} from "lucide-react";

const DashboardAdmin = () => {
  // Demo State / Dynamic Data Structure
  const [stats, setStats] = useState({
    users: {
      total: 5,
      admins: 1,
      managers: 1,
      members: 3,
    },
    projects: {
      total: 4,
      completed: 1,
      onHold: 0,
      active: 2,
      pending: 1,
      inProgress: 2,
    },
    tasks: {
      total: 7,
      done: 2,
      overdue: 1,
      unassigned: 2,
      dueIn7Days: 3,
    },
  });

  // Calculate dynamic percentages
  const activeProjectPercentage = Math.round(
    (stats.projects.active / stats.projects.total) * 100
  );
  const taskCompletionPercentage = Math.round(
    (stats.tasks.done / stats.tasks.total) * 100
  );
  const deliveredPercentage = Math.round(
    (stats.projects.completed / stats.projects.total) * 100
  );

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8 text-slate-800">
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Admin overview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Wednesday, 19 August 2026 · {stats.users.total} people,{" "}
            {stats.projects.total} projects and {stats.tasks.total} tasks across
            the workspace
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
        </div>
      </div>

      {/* TOP METRIC CARDS (GRID OF 6) */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Users */}
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
            {stats.users.admins} admin · {stats.users.managers} manager ·{" "}
            {stats.users.members} me...
          </p>
        </div>

        {/* Total Projects */}
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
            {stats.projects.completed} completed · {stats.projects.onHold} on
            hold
          </p>
        </div>

        {/* Active Projects */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
              ACTIVE PROJEC...
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

        {/* Total Tasks */}
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
            {stats.tasks.done} done · {taskCompletionPercentage}% complete
          </p>
        </div>

        {/* Overdue Tasks */}
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
            {stats.tasks.dueIn7Days} more due in 7 days
          </p>
        </div>

        {/* Unassigned Tasks */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
              UNASSIGNED T...
            </span>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Inbox size={18} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {stats.tasks.unassigned}
          </div>
          <p className="mt-2 text-[11px] font-medium text-amber-600">
            29% with no owner
          </p>
        </div>
      </div>

      {/* BOTTOM ANALYTICS CARDS (GRID OF 2) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* TEAM COMPOSITION CARD */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Team composition
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                5 accounts across 3 roles
              </p>
            </div>
            <Link
              to="/manage-users"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-6 sm:flex-row sm:gap-8">
            {/* Donut Visual Center */}
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-purple-500 border-l-blue-500 border-b-slate-300">
              <div className="text-center">
                <span className="text-xl font-bold text-slate-800">5</span>
                <p className="text-[11px] text-slate-400">people</p>
              </div>
            </div>

            {/* Role Breakdown Bars */}
            <div className="w-full flex-1 space-y-4">
              {/* Admins */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Admins
                  </span>
                  <div className="flex gap-4">
                    <span className="font-semibold text-slate-800">1</span>
                    <span className="text-slate-400 w-8 text-right">20%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-purple-500"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>

              {/* Managers */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Managers
                  </span>
                  <div className="flex gap-4">
                    <span className="font-semibold text-slate-800">1</span>
                    <span className="text-slate-400 w-8 text-right">20%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    Members
                  </span>
                  <div className="flex gap-4">
                    <span className="font-semibold text-slate-800">3</span>
                    <span className="text-slate-400 w-8 text-right">60%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-slate-400"
                    style={{ width: "60%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DELIVERY HEALTH CARD */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Delivery health
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                4 projects tracked
              </p>
            </div>
            <Link
              to="/manage-projects"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {/* Delivered Metric Banner */}
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
              Every project on track
            </span>
          </div>

          {/* Progress Status Breakdown */}
          <div className="mt-5 space-y-3.5">
            {/* Pending */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Pending</span>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">1</span>
                  <span className="text-slate-400">25%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-slate-400"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>In Progress</span>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">2</span>
                  <span className="text-slate-400">50%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-blue-500"
                  style={{ width: "50%" }}
                ></div>
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Completed</span>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">1</span>
                  <span className="text-slate-400">25%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: "25%" }}
                ></div>
              </div>
            </div>

            {/* On Hold */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>On Hold</span>
                <div className="flex gap-2">
                  <span className="font-semibold text-slate-800">0</span>
                  <span className="text-slate-400">0%</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-amber-500"
                  style={{ width: "0%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;