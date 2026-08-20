import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    CalendarDays,
    CircleAlert,
    LoaderCircle,
    CircleCheck,
    ArrowRight,
} from "lucide-react";

const DashboardMember = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "Member",
        role: "Member",
    });

    // =========================
    // Get Logged In User
    // =========================
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

            setUser({
                name:
                    loggedUser?.name ||
                    loggedUser?.fullName ||
                    loggedUser?.userName ||
                    "Member",

                role:
                    loggedUser?.role ||
                    "Member",
            });

        } catch (error) {
            console.error(
                "Dashboard user error:",
                error
            );
        }
    }, []);

    // =========================
    // Stats
    // =========================
    const stats = [
        {
            title: "ASSIGNED TO ME",
            value: "2",
            description: "1 task still open",
            icon: BriefcaseBusiness,
            iconClass: "bg-blue-50 text-blue-600",
        },
        {
            title: "DUE TODAY",
            value: "0",
            description: "Nothing lands today",
            icon: CalendarDays,
            iconClass: "bg-yellow-50 text-yellow-600",
        },
        {
            title: "OVERDUE",
            value: "0",
            description: "You're right on time",
            icon: CircleAlert,
            iconClass: "bg-red-50 text-red-500",
        },
        {
            title: "IN PROGRESS",
            value: "1",
            description: "0 waiting on review",
            icon: LoaderCircle,
            iconClass: "bg-purple-50 text-purple-600",
        },
        {
            title: "COMPLETED",
            value: "1",
            description: "50% of your work is done",
            icon: CircleCheck,
            iconClass: "bg-green-50 text-green-600",
        },
    ];

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">
            <div className="w-full">

                    {/* =================================================
                        Greeting
                    ================================================== */}
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

                        <div>

                            <h1 className="text-[30px] font-bold tracking-tight text-[#07152d]">
                                Good afternoon, {user.name}
                            </h1>

                            <p className="mt-1 text-sm text-[#71809b]">
                                {new Date().toLocaleDateString(
                                    "en-US",
                                    {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    }
                                )}{" "}
                                · 1 open task on your plate
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/member/tasks")
                            }
                            className="flex items-center justify-center gap-2 rounded-lg bg-[#2161f5] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1855df]"
                        >
                            View all my tasks

                            <ArrowRight size={18} />
                        </button>

                    </div>


                    {/* =================================================
                        Stats
                    ================================================== */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                        {stats.map((item) => {

                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm"
                                >

                                    <div className="flex items-start justify-between">

                                        <p className="text-[12px] font-semibold tracking-wide text-[#58708f]">
                                            {item.title}
                                        </p>

                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.iconClass}`}
                                        >
                                            <Icon size={22} />
                                        </div>

                                    </div>

                                    <h2 className="mt-3 text-[30px] font-bold text-[#07152d]">
                                        {item.value}
                                    </h2>

                                    <p className="mt-1 text-xs text-[#71809b]">
                                        {item.description}
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
                                    0 due today · next 7 days
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/member/tasks")
                                }
                                className="flex items-center gap-1 text-sm font-medium text-[#2161f5]"
                            >
                                View all

                                <ArrowRight size={16} />
                            </button>

                        </div>


                        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h3 className="text-sm font-semibold text-[#07152d]">
                                    Design new landing page hero
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#71809b]">

                                    <span>
                                        Website Redesign
                                    </span>

                                    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 font-medium text-red-500">
                                        High
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <CalendarDays size={14} />
                                        19 Aug
                                    </span>

                                </div>

                            </div>


                            <select
                                defaultValue="In Progress"
                                className="rounded-lg border border-[#d9e1eb] bg-white px-4 py-2.5 text-sm text-[#30415b] outline-none focus:border-[#2161f5]"
                            >
                                <option>
                                    To Do
                                </option>

                                <option>
                                    In Progress
                                </option>

                                <option>
                                    In Review
                                </option>

                                <option>
                                    Done
                                </option>
                            </select>

                        </div>

                    </section>


                    {/* =================================================
                        Bottom Cards
                    ================================================== */}
                    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">

                        {/* My Progress */}
                        <section className="rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm">

                            <h2 className="text-[16px] font-semibold text-[#07152d]">
                                My progress
                            </h2>

                            <p className="mt-1 text-xs text-[#71809b]">
                                Across 2 tasks of mine
                            </p>


                            <div className="mt-6 flex justify-center">

                                <div
                                    className="relative flex h-44 w-44 items-center justify-center rounded-full"
                                    style={{
                                        background:
                                            "conic-gradient(#2f7cf6 0deg 180deg, #12b981 180deg 360deg)",
                                    }}
                                >

                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#f6f8fb]">

                                        <div className="text-center">

                                            <p className="text-3xl font-bold text-[#07152d]">
                                                50%
                                            </p>

                                            <p className="text-xs text-[#71809b]">
                                                Completed
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>


                        {/* My Projects */}
                        <section className="rounded-xl border border-[#e0e6ee] bg-white p-5 shadow-sm">

                            <h2 className="text-[16px] font-semibold text-[#07152d]">
                                My projects
                            </h2>

                            <p className="mt-1 text-xs text-[#71809b]">
                                Progress counts only your own tasks
                            </p>


                            <div className="mt-7">

                                <div className="flex items-center justify-between gap-3">

                                    <h3 className="text-sm font-semibold text-[#07152d]">
                                        Website Redesign
                                    </h3>

                                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                                        In Progress
                                    </span>

                                </div>


                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf1f6]">

                                    <div className="h-full w-0 rounded-full bg-[#2161f5]" />

                                </div>


                                <div className="mt-2 flex justify-between text-xs text-[#71809b]">

                                    <span>
                                        0 of your 1 task done · 1 open
                                    </span>

                                    <span>
                                        0%
                                    </span>

                                </div>

                            </div>

                        </section>

                    </div>

                </div>

        </div>
    );
};

export default DashboardMember;