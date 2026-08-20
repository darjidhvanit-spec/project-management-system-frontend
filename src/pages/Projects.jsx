import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Plus,
    Search,
    X,
    Pencil,
    Trash2,
    CalendarDays,
    Eye,
    AlertTriangle,
    CheckCircle2,
    FolderKanban,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    RotateCcw
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = "https://project-management-system-frontend-nine.vercel.app";
const API_HEADERS = {
    headers: {
        "api-key": "projectmanagement",
        "Content-Type": "application/json"
    }
};

const Projects = () => {

    // ============================================
    // INITIAL FORM DATA
    // ============================================
    const initialFormData = {
        projectName: "",
        description: "",
        startDate: "",
        endDate: "",
        priority: "Medium",
        status: "Planning",
        createdBy: ""
    };

    // ============================================
    // STATES
    // ============================================
    const [projects, setProjects] = useState([]);
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [creatorName, setCreatorName] = useState("");

    // Search & Filter States (Sent to Backend)
    const [search, setSearch] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Pagination States (Backend side pagination)
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal & Action States
    const [viewProject, setViewProject] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, project: null });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isInitialMount = useRef(true);

    // ============================================
    // DATE HELPERS
    // ============================================
    const toInputDateFormat = (date) => {
        if (!date) return "";
        if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
        }
        if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
            const [day, month, year] = date.split("-");
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split("T")[0];
    };

    const formatDate = (date) => {
        if (!date) return "-";
        if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
            const [day, month, year] = date.split("-");
            return `${year}-${month}-${day}`;
        }
        const newDate = new Date(date);
        if (isNaN(newDate.getTime())) {
            return date;
        }
        return newDate.toISOString().split("T")[0];
    };

    // ============================================
    // GET LOGGED-IN USER
    // ============================================
    const getLoggedInUser = () => {
        try {
            const userData = JSON.parse(
                localStorage.getItem("pms:session")
            );
            return userData;
        } catch (err) {
            console.error("User data error:", err);
            return null;
        }
    };

    // ============================================
    // FETCH PROJECT LIST (BACKEND PAGINATION & FILTERS)
    // ============================================
    const fetchProjects = useCallback(async (
        page = currentPage,
        limit = perPage,
        searchTerm = search,
        priorityVal = priorityFilter,
        statusVal = statusFilter
    ) => {
        try {
            setLoading(true);
            setError("");

            // Construct payload matching backend exports.getProject
            const payload = {
                page: page,
                per_page: limit,
                limit: limit,
                ...(searchTerm.trim() ? { projectName: searchTerm.trim() } : {}),
                ...(priorityVal && priorityVal !== "all" ? { priority: priorityVal } : {}),
                ...(statusVal && statusVal !== "all" ? { status: statusVal } : {})
            };

            const response = await axios.post(
                `${API_BASE_URL}/project/project_list`,
                payload,
                API_HEADERS
            );

            console.log("Project List Response:", response.data);

            if (response.data?.success) {
                const resData = response.data?.data;

                // Handle both resData.projectData or direct array
                const projectList = Array.isArray(resData?.projectData)
                    ? resData.projectData
                    : Array.isArray(resData)
                        ? resData
                        : Array.isArray(response.data?.projectData)
                            ? response.data.projectData
                            : [];

                const paginationInfo = resData?.pagination || response.data?.pagination;

                setProjects(projectList);

                if (paginationInfo) {
                    const totalRecs = Number(paginationInfo.totalRecords) || projectList.length;
                    const calculatedTotalPages =
                        Number(paginationInfo.totalPages) ||
                        (totalRecs > 0 ? Math.ceil(totalRecs / limit) : 1);

                    setTotalRecords(totalRecs);
                    setTotalPages(calculatedTotalPages);
                    setCurrentPage(Number(paginationInfo.currentPage) || page);
                } else {
                    setTotalRecords(projectList.length);
                    setTotalPages(Math.max(1, Math.ceil(projectList.length / limit)));
                    setCurrentPage(page);
                }
            } else {
                setProjects([]);
                setTotalRecords(0);
                setTotalPages(1);
                setError(
                    response.data?.message || "Unable to fetch projects"
                );
            }
        } catch (err) {
            console.error("Fetch Project Error:", err);
            setProjects([]);
            setTotalRecords(0);
            setTotalPages(1);
            setError(
                err.response?.data?.message || "Error fetching projects"
            );
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, search, priorityFilter, statusFilter]);

    // Initial Load & Debounced Search/Filter Trigger
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            fetchProjects(1, perPage, search, priorityFilter, statusFilter);
            return;
        }

        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchProjects(1, perPage, search, priorityFilter, statusFilter);
        }, 400);

        return () => clearTimeout(timer);
    }, [search, priorityFilter, statusFilter, perPage]);

    // ============================================
    // PAGINATION HANDLERS
    // ============================================
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
            fetchProjects(newPage, perPage, search, priorityFilter, statusFilter);
        }
    };

    const handlePerPageChange = (e) => {
        const newLimit = parseInt(e.target.value, 10) || 10;
        setPerPage(newLimit);
        setCurrentPage(1);
        fetchProjects(1, newLimit, search, priorityFilter, statusFilter);
    };

    // Calculate Page Numbers for Pagination UI
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    // Reset Filters
    const handleResetFilters = () => {
        setSearch("");
        setPriorityFilter("all");
        setStatusFilter("all");
        setCurrentPage(1);
        fetchProjects(1, perPage, "", "all", "all");
    };

    const hasActiveFilters = search || priorityFilter !== "all" || statusFilter !== "all";

    // ============================================
    // OPEN CREATE PROJECT MODAL
    // ============================================
    const handleAddProject = () => {
        const userData = getLoggedInUser();
        const userRole = (userData?.role || "").toLowerCase();

        if (userData && userData.role && userRole !== "manager" && userRole !== "admin") {
            setError("Only Manager or Admin can create a project.");
            return;
        }

        const userId =
            userData?._id ||
            userData?.id ||
            userData?.userId ||
            "";

        const userName =
            userData?.name ||
            userData?.username ||
            userData?.email ||
            "";

        setEditId(null);
        setError("");
        setSuccess("");
        setFormErrors({});
        setCreatorName(userName);
        setFormData({
            ...initialFormData,
            createdBy: userId
        });
        setShowModal(true);
    };

    // ============================================
    // OPEN EDIT PROJECT MODAL
    // ============================================
    const handleEdit = (project) => {
        const userData = getLoggedInUser();
        const userRole = (userData?.role || "").toLowerCase();

        if (userData && userData.role && userRole !== "manager" && userRole !== "admin") {
            setError("Only Manager or Admin can edit a project.");
            return;
        }

        const projectId = project._id || project.id;
        const loggedUserId =
            userData?._id ||
            userData?.id ||
            userData?.userId ||
            "";

        const createdById =
            typeof project.createdBy === "object" && project.createdBy !== null
                ? project.createdBy?._id || project.createdBy?.id || loggedUserId
                : project.createdBy || loggedUserId;

        const creatorDisplayName =
            typeof project.createdBy === "object" && project.createdBy !== null
                ? project.createdBy?.name || project.createdBy?.username || project.createdBy?.email || ""
                : userData?.name || userData?.email || "Manager";

        setEditId(projectId);
        setError("");
        setSuccess("");
        setFormErrors({});
        setCreatorName(creatorDisplayName);

        setFormData({
            projectName: project.projectName || "",
            description: project.description || "",
            startDate: toInputDateFormat(project.startDate),
            endDate: toInputDateFormat(project.endDate),
            priority: project.priority || "Medium",
            status: project.status || "Planning",
            createdBy: createdById
        });

        setShowModal(true);
    };

    // ============================================
    // OPEN DELETE MODAL
    // ============================================
    const handleOpenDelete = (project) => {
        const userData = getLoggedInUser();
        const userRole = (userData?.role || "").toLowerCase();

        if (userData && userData.role && userRole !== "manager" && userRole !== "admin") {
            setError("Only Manager or Admin can delete a project.");
            return;
        }

        setDeleteModal({ show: true, project });
    };

    // ============================================
    // CONFIRM DELETE PROJECT
    // ============================================
    const handleConfirmDelete = async () => {
        if (!deleteModal.project) return;

        const projectId = deleteModal.project._id || deleteModal.project.id;
        setDeleteLoading(true);
        setError("");
        setSuccess("");

        try {
            let response;
            try {
                // Try DELETE endpoint first
                response = await axios.delete(
                    `${API_BASE_URL}/project/project_delete`,
                    {
                        ...API_HEADERS,
                        data: {
                            id: projectId,
                            _id: projectId,
                            projectId: projectId
                        }
                    }
                );
            } catch (delErr) {
                // Fallback to POST if DELETE is not supported by backend route
                if (delErr.response?.status === 404 || delErr.response?.status === 405) {
                    response = await axios.post(
                        `${API_BASE_URL}/project/project_delete`,
                        {
                            id: projectId,
                            _id: projectId,
                            projectId: projectId
                        },
                        API_HEADERS
                    );
                } else {
                    throw delErr;
                }
            }

            if (response?.data?.success !== false) {
                setSuccess(response?.data?.message || "Project deleted successfully.");
                setDeleteModal({ show: false, project: null });

                // If deleting last item on current page > 1, go to previous page
                const isLastItemOnPage = projects.length === 1 && currentPage > 1;
                const targetPage = isLastItemOnPage ? currentPage - 1 : currentPage;

                if (isLastItemOnPage) {
                    setCurrentPage(targetPage);
                }

                await fetchProjects(targetPage, perPage, search, priorityFilter, statusFilter);
            } else {
                setError(response?.data?.message || "Unable to delete project.");
            }
        } catch (err) {
            console.error("Delete Project Error:", err);
            setError(
                err.response?.data?.message || "Error deleting project. Please try again."
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    // ============================================
    // CLOSE MODAL
    // ============================================
    const handleCloseModal = () => {
        if (submitLoading) return;
        setShowModal(false);
        setEditId(null);
        setFormData(initialFormData);
        setFormErrors({});
        setError("");
    };

    // ============================================
    // INPUT CHANGE
    // ============================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setFormErrors((prev) => ({
            ...prev,
            [name]: ""
        }));

        if (name === "startDate" && formData.endDate) {
            const startDate = new Date(value);
            const endDate = new Date(formData.endDate);

            if (startDate > endDate) {
                setFormErrors((prev) => ({
                    ...prev,
                    endDate: "End date must be greater than or equal to start date."
                }));
            } else {
                setFormErrors((prev) => ({
                    ...prev,
                    endDate: ""
                }));
            }
        }

        if (name === "endDate" && formData.startDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(value);

            if (startDate > endDate) {
                setFormErrors((prev) => ({
                    ...prev,
                    endDate: "End date must be greater than or equal to start date."
                }));
            } else {
                setFormErrors((prev) => ({
                    ...prev,
                    endDate: ""
                }));
            }
        }
    };

    // ============================================
    // FORM VALIDATION
    // ============================================
    const validateForm = () => {
        const errors = {};

        if (!formData.projectName?.trim()) {
            errors.projectName = "Project name is required.";
        } else if (formData.projectName.trim().length < 3) {
            errors.projectName = "Project name must be at least 3 characters.";
        } else if (formData.projectName.trim().length > 100) {
            errors.projectName = "Project name cannot exceed 100 characters.";
        }

        if (!formData.description?.trim()) {
            errors.description = "Description is required.";
        } else if (formData.description.trim().length < 10) {
            errors.description = "Description must be at least 10 characters.";
        } else if (formData.description.trim().length > 500) {
            errors.description = "Description cannot exceed 500 characters.";
        }

        if (!formData.startDate) {
            errors.startDate = "Start date is required.";
        }

        if (!formData.endDate) {
            errors.endDate = "End date is required.";
        }

        if (formData.startDate && formData.endDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);

            if (startDate > endDate) {
                errors.endDate = "End date must be greater than or equal to start date.";
            }
        }

        if (!formData.priority) {
            errors.priority = "Priority is required.";
        }

        if (!formData.status) {
            errors.status = "Status is required.";
        }

        if (!formData.createdBy) {
            errors.createdBy = "Created By is required.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ============================================
    // SUBMIT (CREATE OR UPDATE)
    // ============================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const isValid = validateForm();
        if (!isValid) {
            setError("Please fix the validation errors.");
            return;
        }

        try {
            setSubmitLoading(true);

            const userData = getLoggedInUser();
            if (!userData) {
                setError("Please login first.");
                return;
            }

            const userId =
                userData?._id ||
                userData?.id ||
                userData?.userId ||
                "";

            const userRole = (userData?.role || "").toLowerCase();
            if (userData?.role && userRole !== "manager" && userRole !== "admin") {
                setError("Only Manager or Admin can perform this action.");
                return;
            }

            const payload = {
                projectName: formData.projectName.trim(),
                description: formData.description.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate,
                priority: formData.priority,
                status: formData.status,
                createdBy: formData.createdBy || userId
            };

            // UPDATE PROJECT
            if (editId) {
                const updatePayload = {
                    id: editId,
                    _id: editId,
                    projectId: editId,
                    ...payload
                };

                let response;
                try {
                    response = await axios.put(
                        `${API_BASE_URL}/project/project_update`,
                        updatePayload,
                        API_HEADERS
                    );
                } catch (putErr) {
                    if (putErr.response?.status === 404 || putErr.response?.status === 405) {
                        response = await axios.post(
                            `${API_BASE_URL}/project/project_update`,
                            updatePayload,
                            API_HEADERS
                        );
                    } else {
                        throw putErr;
                    }
                }

                if (response?.data?.success !== false) {
                    setSuccess(
                        response?.data?.message || "Project updated successfully."
                    );
                    setShowModal(false);
                    setEditId(null);
                    setFormData(initialFormData);
                    setFormErrors({});
                    await fetchProjects(currentPage, perPage, search, priorityFilter, statusFilter);
                    return;
                }

                setError(
                    response?.data?.message || "Unable to update project."
                );
                return;
            }

            // CREATE PROJECT
            const response = await axios.post(
                `${API_BASE_URL}/project/project_add`,
                payload,
                API_HEADERS
            );

            if (response?.data?.success !== false) {
                setSuccess(
                    response?.data?.message || "Project created successfully."
                );
                setShowModal(false);
                setFormData({
                    ...initialFormData,
                    createdBy: userId
                });
                setFormErrors({});
                setCurrentPage(1);
                await fetchProjects(1, perPage, search, priorityFilter, statusFilter);
                return;
            }

            setError(
                response?.data?.message || "Unable to create project."
            );

        } catch (err) {
            console.error("Project Save Error:", err);
            if (err.response) {
                setError(
                    err.response?.data?.message || "Operation failed."
                );
            } else if (err.request) {
                setError("Server is not responding. Please check backend server.");
            } else {
                setError(err.message || "Error saving project.");
            }
        } finally {
            setSubmitLoading(false);
        }
    };

    // ============================================
    // BADGE CLASSES
    // ============================================
    const getPriorityClass = (priority) => {
        switch (priority) {
            case "Low":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "High":
                return "bg-rose-50 text-rose-700 border border-rose-200";
            case "Medium":
            default:
                return "bg-amber-50 text-amber-700 border border-amber-200";
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "Completed":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200";
            case "In Progress":
                return "bg-blue-50 text-blue-700 border border-blue-200";
            case "Planning":
            default:
                return "bg-purple-50 text-purple-700 border border-purple-200";
        }
    };

    // Range display calculation for table footer
    const startItem = totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, totalRecords);

    return (
        <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">

            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <FolderKanban className="text-blue-600" size={26} />
                        <h1 className="text-2xl font-bold text-[#1e293b]">
                            Projects
                        </h1>
                    </div>
                    <p className="mt-1 text-sm text-[#64748b]">
                        Manage, track, update, and organize your team's projects.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleAddProject}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus size={18} />
                    New Project
                </button>
            </div>

            {/* ================================= */}
            {/* SUCCESS MESSAGE */}
            {/* ================================= */}
            {success && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-xs">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span>{success}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        className="rounded-md p-1 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ================================= */}
            {/* ERROR MESSAGE */}
            {/* ================================= */}
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-xs">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={18} className="text-rose-600" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        className="rounded-md p-1 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ================================= */}
            {/* TABLE CARD */}
            {/* ================================= */}
            <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xs">

                {/* SEARCH & FILTERS TOOLBAR */}
                <div className="flex flex-col gap-3.5 border-b border-[#e2e8f0] p-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* SEARCH INPUT */}
                    <div className="relative flex-1 max-w-md">
                        <Search
                            size={18}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by project name..."
                            className="w-full rounded-xl border border-[#e2e8f0] py-2 pl-10 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    {/* PRIORITY & STATUS FILTERS */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* PRIORITY FILTER */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="cursor-pointer rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#334155] outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">All Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        {/* STATUS FILTER */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="cursor-pointer rounded-xl border border-[#e2e8f0] bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#334155] outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="all">All Status</option>
                            <option value="Planning">Planning</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>

                        {/* RESET BUTTON */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                title="Reset filters"
                            >
                                <RotateCcw size={13} />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>

                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-[#f8fafc]">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    Project
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    Description
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    Start Date
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    End Date
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    Priority
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    Status
                                </th>
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-[#64748b]">
                                    Created By
                                </th>
                                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-[#64748b]">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#f1f5f9]">
                            {/* LOADING */}
                            {loading && (
                                <tr>
                                    <td colSpan="8" className="px-5 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2 text-sm text-[#64748b]">
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                            Loading projects...
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* NO DATA */}
                            {!loading && projects.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-5 py-12 text-center text-sm text-[#64748b]">
                                        {hasActiveFilters
                                            ? "No projects found matching the filter criteria"
                                            : "No projects found"}
                                    </td>
                                </tr>
                            )}

                            {/* PROJECT ROWS */}
                            {!loading &&
                                projects.map((project) => (
                                    <tr
                                        key={project._id || project.id}
                                        className="transition hover:bg-[#f8fafc]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-[#1e293b]">
                                                {project.projectName}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="max-w-[220px] truncate text-sm text-[#64748b]" title={project.description}>
                                                {project.description || "-"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-[#475569]">
                                                <CalendarDays size={15} className="text-[#94a3b8]" />
                                                {formatDate(project.startDate)}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2 text-sm text-[#475569]">
                                                <CalendarDays size={15} className="text-[#94a3b8]" />
                                                {formatDate(project.endDate)}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                                    project.priority
                                                )}`}
                                            >
                                                {project.priority || "Medium"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    project.status
                                                )}`}
                                            >
                                                {project.status || "Planning"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="text-sm font-medium text-[#475569]">
                                                {project.createdBy?.name ||
                                                    project.createdBy?.username ||
                                                    project.createdBy?.email ||
                                                    "-"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* VIEW BUTTON */}
                                                <button
                                                    type="button"
                                                    onClick={() => setViewProject(project)}
                                                    className="cursor-pointer rounded-lg p-2 text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                                                    title="View Details"
                                                >
                                                    <Eye size={17} />
                                                </button>

                                                {/* EDIT BUTTON */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(project)}
                                                    className="cursor-pointer rounded-lg p-2 text-[#2563eb] transition hover:bg-blue-50"
                                                    title="Edit Project"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                {/* DELETE BUTTON */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDelete(project)}
                                                    className="cursor-pointer rounded-lg p-2 text-rose-600 transition hover:bg-rose-50"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* ================================= */}
                {/* PAGINATION FOOTER */}
                {/* ================================= */}
                {!loading && totalRecords > 0 && (
                    <div className="flex flex-col gap-4 border-t border-[#e2e8f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* ITEMS PER PAGE & TOTAL COUNT */}
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#64748b]">
                            <div className="flex items-center gap-2">
                                <span>Rows per page:</span>
                                <select
                                    value={perPage}
                                    onChange={handlePerPageChange}
                                    className="cursor-pointer rounded-lg border border-[#e2e8f0] bg-white px-2.5 py-1 text-xs sm:text-sm font-semibold text-[#334155] outline-none focus:border-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <span className="hidden sm:inline text-slate-300">|</span>

                            <div>
                                Showing <span className="font-semibold text-[#1e293b]">{startItem}</span> to{" "}
                                <span className="font-semibold text-[#1e293b]">{endItem}</span> of{" "}
                                <span className="font-semibold text-[#1e293b]">{totalRecords}</span> entries
                            </div>
                        </div>

                        {/* PAGE NUMBERS & NAVIGATION */}
                        <div className="flex items-center gap-1.5 self-center sm:self-auto">

                            {/* FIRST PAGE */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                                className="cursor-pointer rounded-lg border border-[#e2e8f0] p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                title="First Page"
                            >
                                <ChevronsLeft size={16} />
                            </button>

                            {/* PREVIOUS PAGE */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="cursor-pointer rounded-lg border border-[#e2e8f0] p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Previous Page"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* PAGE NUMBER BUTTONS */}
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum, idx) => {
                                    if (pageNum === "...") {
                                        return (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="px-2 py-1 text-xs text-slate-400 font-bold"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    const isActive = currentPage === pageNum;

                                    return (
                                        <button
                                            key={`page-${pageNum}`}
                                            type="button"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`min-w-[32px] cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition ${isActive
                                                ? "bg-blue-600 text-white shadow-xs"
                                                : "border border-[#e2e8f0] text-slate-700 hover:bg-slate-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* NEXT PAGE */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="cursor-pointer rounded-lg border border-[#e2e8f0] p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Next Page"
                            >
                                <ChevronRight size={16} />
                            </button>

                            {/* LAST PAGE */}
                            <button
                                type="button"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                                className="cursor-pointer rounded-lg border border-[#e2e8f0] p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Last Page"
                            >
                                <ChevronsRight size={16} />
                            </button>

                        </div>

                    </div>
                )}

            </div>

            {/* ================================================== */}
            {/* CREATE / EDIT PROJECT MODAL */}
            {/* ================================================== */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                        {/* MODAL HEADER */}
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-[#1e293b]">
                                    {editId ? "Edit Project" : "Create Project"}
                                </h2>
                                <p className="mt-0.5 text-xs text-[#64748b]">
                                    {editId
                                        ? "Update project details and specifications."
                                        : "Add a new project to your system."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={submitLoading}
                                className="cursor-pointer rounded-lg p-2 text-[#64748b] transition hover:bg-[#f1f5f9]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* MODAL FORM */}
                        <form onSubmit={handleSubmit} className="p-6" noValidate>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                {/* PROJECT NAME */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        placeholder="Enter project name"
                                        maxLength={100}
                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${formErrors.projectName
                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-[#cbd5e1] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            }`}
                                    />
                                    {formErrors.projectName && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {formErrors.projectName}
                                        </p>
                                    )}
                                </div>

                                {/* DESCRIPTION */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        maxLength={500}
                                        placeholder="Enter project description"
                                        className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition ${formErrors.description
                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-[#cbd5e1] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            }`}
                                    />
                                    <div className="mt-1 flex items-center justify-between">
                                        {formErrors.description ? (
                                            <p className="text-xs text-red-500">
                                                {formErrors.description}
                                            </p>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span className="text-xs text-[#94a3b8]">
                                            {formData.description.length}/500
                                        </span>
                                    </div>
                                </div>

                                {/* START DATE */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <CalendarDays
                                            size={17}
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${formErrors.startDate
                                                ? "text-red-400"
                                                : "text-[#94a3b8]"
                                                }`}
                                        />
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition ${formErrors.startDate
                                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                : "border-[#cbd5e1] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.startDate && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {formErrors.startDate}
                                        </p>
                                    )}
                                </div>

                                {/* END DATE */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <CalendarDays
                                            size={17}
                                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${formErrors.endDate
                                                ? "text-red-400"
                                                : "text-[#94a3b8]"
                                                }`}
                                        />
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            min={formData.startDate || undefined}
                                            onChange={handleChange}
                                            className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition ${formErrors.endDate
                                                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                                : "border-[#cbd5e1] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                }`}
                                        />
                                    </div>
                                    {formErrors.endDate && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {formErrors.endDate}
                                        </p>
                                    )}
                                </div>

                                {/* PRIORITY */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${formErrors.priority
                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-[#cbd5e1] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            }`}
                                    >
                                        <option value="">Select Priority</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    {formErrors.priority && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {formErrors.priority}
                                        </p>
                                    )}
                                </div>

                                {/* STATUS */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition ${formErrors.status
                                            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                            : "border-[#cbd5e1] focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                            }`}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="Planning">Planning</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    {formErrors.status && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {formErrors.status}
                                        </p>
                                    )}
                                </div>

                                {/* CREATED BY */}
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-[#334155]">
                                        Created By
                                    </label>
                                    <input
                                        type="text"
                                        value={creatorName || getLoggedInUser()?.name || getLoggedInUser()?.email || "Manager"}
                                        disabled
                                        className="w-full cursor-not-allowed rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#64748b]"
                                    />
                                </div>

                            </div>

                            {/* MODAL BUTTONS */}
                            <div className="mt-6 flex justify-end gap-3 border-t border-[#e2e8f0] pt-5">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={submitLoading}
                                    className="cursor-pointer rounded-xl border border-[#cbd5e1] px-5 py-2.5 text-sm font-medium text-[#475569] transition hover:bg-[#f8fafc]"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="flex min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitLoading ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            {editId ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {editId ? <Pencil size={17} /> : <Plus size={17} />}
                                            {editId ? "Update Project" : "Create Project"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* ================================================== */}
            {/* VIEW PROJECT MODAL */}
            {/* ================================================== */}
            {viewProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">

                        {/* HEADER */}
                        <div className="sticky top-0 flex items-center justify-between border-b border-[#e2e8f0] bg-white px-6 py-4">
                            <h2 className="text-lg font-bold text-[#1e293b]">
                                Project Details
                            </h2>
                            <button
                                type="button"
                                onClick={() => setViewProject(null)}
                                className="cursor-pointer rounded-lg p-2 text-[#64748b] hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* DETAILS */}
                        <div className="space-y-5 p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                    Project Name
                                </p>
                                <p className="mt-1 text-base font-bold text-[#1e293b]">
                                    {viewProject.projectName || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                    Description
                                </p>
                                <p className="mt-1 text-sm text-[#475569] whitespace-pre-line">
                                    {viewProject.description || "-"}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Start Date
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                        {formatDate(viewProject.startDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        End Date
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                        {formatDate(viewProject.endDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Priority
                                    </p>
                                    <span
                                        className={`mt-1.5 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                                            viewProject.priority
                                        )}`}
                                    >
                                        {viewProject.priority || "-"}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                        Status
                                    </p>
                                    <span
                                        className={`mt-1.5 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                            viewProject.status
                                        )}`}
                                    >
                                        {viewProject.status || "-"}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                                    Created By
                                </p>
                                <p className="mt-1 text-sm font-medium text-[#1e293b]">
                                    {viewProject.createdBy?.name ||
                                        viewProject.createdBy?.username ||
                                        viewProject.createdBy?.email ||
                                        "-"}
                                </p>
                            </div>

                            {/* FOOTER BUTTONS */}
                            <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const p = viewProject;
                                        setViewProject(null);
                                        handleEdit(p);
                                    }}
                                    className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                                >
                                    <Pencil size={15} />
                                    Edit This Project
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setViewProject(null)}
                                    className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ================================================== */}
            {/* DELETE CONFIRMATION MODAL */}
            {/* ================================================== */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in duration-150">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                            <Trash2 size={26} />
                        </div>

                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-bold text-[#1e293b]">
                                Delete Project
                            </h3>
                            <p className="mt-2 text-sm text-[#64748b]">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-[#1e293b]">
                                    "{deleteModal.project?.projectName}"
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={() => setDeleteModal({ show: false, project: null })}
                                className="cursor-pointer rounded-xl border border-[#cbd5e1] px-5 py-2.5 text-sm font-medium text-[#475569] transition hover:bg-[#f8fafc] disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={deleteLoading}
                                onClick={handleConfirmDelete}
                                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleteLoading ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Yes, Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Projects;