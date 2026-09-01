import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  CalendarDays,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const Tasks = () => {
  // =====================================================
  // API
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
  // INITIAL FORM
  // =====================================================

  const initialFormData = {
    taskTitle: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    status: "Todo",
    createdBy: "",
  };

  const initialErrors = {
    taskTitle: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "",
    startDate: "",
    dueDate: "",
    status: "",
    createdBy: "",
  };

  // =====================================================
  // STATES
  // =====================================================

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] =
    useState(initialFormData);

  const [errors, setErrors] =
    useState(initialErrors);

  const [createdByName, setCreatedByName] =
    useState("");

  // =====================================================
  // FORM / VIEW MODALS
  // =====================================================

  const [showModal, setShowModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [editId, setEditId] =
    useState(null);

  // =====================================================
  // DELETE MODAL
  // =====================================================

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deleteTaskId, setDeleteTaskId] =
    useState(null);

  const [deleteTaskTitle, setDeleteTaskTitle] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  // =====================================================
  // MESSAGE MODAL
  // =====================================================

  const [showMessageModal, setShowMessageModal] =
    useState(false);

  const [messageType, setMessageType] =
    useState("success");

  const [messageTitle, setMessageTitle] =
    useState("");

  const [messageText, setMessageText] =
    useState("");

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const [search, setSearch] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const perPage = 10;

  const [totalRecords, setTotalRecords] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // GET LOGGED USER
  // =====================================================

  const getLoggedUser = () => {
    try {
      const storedUser =
        localStorage.getItem("pms:session");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (err) {
      console.error(
        "User Parse Error:",
        err
      );

      return null;
    }
  };

  // =====================================================
  // SHOW MESSAGE MODAL
  // =====================================================

  const showMessage = (
    type,
    title,
    message
  ) => {
    setMessageType(type);
    setMessageTitle(title);
    setMessageText(message);
    setShowMessageModal(true);
  };

  // =====================================================
  // CLOSE MESSAGE MODAL
  // =====================================================

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageTitle("");
    setMessageText("");
  };

  // =====================================================
  // FETCH TASKS
  // =====================================================

  const fetchTasks = useCallback(
    async (
      page = currentPage,
      searchTerm = search,
      priority = priorityFilter,
      status = statusFilter
    ) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await axios.post(
            `${API_BASE_URL}/task/task_list`,
            {
              page,
              per_page: perPage,
              taskTitle:
                searchTerm.trim(),
              priority,
              status,
            },
            API_HEADERS
          );

        if (response.data?.success) {
          const responseData =
            response.data?.data || {};

          const taskData =
            responseData.taskData;

          const pagination =
            responseData.pagination || {};

          const newTasks =
            Array.isArray(taskData)
              ? taskData
              : [];

          const newTotalRecords =
            Number(
              pagination.totalRecords || 0
            );

          const newTotalPages =
            Number(
              pagination.totalPages || 1
            );

          const newCurrentPage =
            Number(
              pagination.currentPage ||
              page
            );

          setTasks(newTasks);
          setTotalRecords(
            newTotalRecords
          );
          setTotalPages(
            newTotalPages
          );
          setCurrentPage(
            newCurrentPage
          );

          // ------------------------------------------------
          // If current page becomes empty after delete
          // ------------------------------------------------

          if (
            newTasks.length === 0 &&
            newCurrentPage > 1 &&
            newCurrentPage >
            newTotalPages
          ) {
            setCurrentPage(
              newCurrentPage - 1
            );
          }
        } else {
          setTasks([]);
          setTotalRecords(0);
          setTotalPages(1);

          setError(
            response.data?.message ||
            "Unable to fetch task list."
          );
        }
      } catch (err) {
        console.error(
          "Task List Error:",
          err
        );

        setTasks([]);
        setTotalRecords(0);
        setTotalPages(1);

        setError(
          err.response?.data?.message ||
          "Error fetching task list."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      currentPage,
      search,
      priorityFilter,
      statusFilter,
    ]
  );

  // =====================================================
  // FETCH PROJECTS (FETCH ALL FOR DROPDOWN)
  // =====================================================

  const fetchProjects =
    useCallback(async () => {
      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/project/project_list`,
            {
              page: 1,
              limit: 50,
              per_page: 50,
            },
            API_HEADERS
          );

        if (response.data?.success) {
          const resData = response.data?.data;
          const projectList = Array.isArray(resData?.projectData)
            ? resData.projectData
            : Array.isArray(resData)
              ? resData
              : Array.isArray(response.data?.projectData)
                ? response.data.projectData
                : [];

          setProjects(projectList);
        } else {
          setProjects([]);
        }
      } catch (err) {
        console.error(
          "Project List Error:",
          err
        );

        setProjects([]);
      }
    }, []);

  // =====================================================
  // FETCH USERS (FETCH ALL FOR DROPDOWN)
  // =====================================================

  const fetchUsers =
    useCallback(async () => {
      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/user/user_list`,
            {
              page: 1,
              limit: 1000,
              per_page: 1000,
            },
            API_HEADERS
          );

        if (response.data?.success) {
          const resData = response.data?.data;
          const userList = Array.isArray(resData?.userData)
            ? resData.userData
            : Array.isArray(resData)
              ? resData
              : Array.isArray(response.data?.userData)
                ? response.data.userData
                : [];

          const memberUsers =
            userList.filter((user) => {
              const role =
                (
                  user.role ||
                  user.userType ||
                  ""
                ).toLowerCase();

              return (
                role === "member" ||
                role === "user"
              );
            });

          setUsers(memberUsers);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error(
          "User List Error:",
          err
        );

        setUsers([]);
      }
    }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProjects();
    fetchUsers();

    const loggedUser =
      getLoggedUser();

    if (loggedUser) {
      const userId =
        loggedUser?._id ||
        loggedUser?.id ||
        loggedUser?.userId ||
        "";

      const userName =
        loggedUser?.name ||
        loggedUser?.username ||
        loggedUser?.email ||
        "Logged User";

      setFormData((prev) => ({
        ...prev,
        createdBy: userId,
      }));

      setCreatedByName(userName);
    }
  }, [
    fetchProjects,
    fetchUsers,
  ]);

  // =====================================================
  // FETCH TASKS ON SEARCH / FILTER / PAGE
  // =====================================================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchTasks(
          currentPage,
          search,
          priorityFilter,
          statusFilter
        );
      }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentPage,
    search,
    priorityFilter,
    statusFilter,
    fetchTasks,
  ]);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");

    if (
      name === "startDate" ||
      name === "dueDate"
    ) {
      setErrors((prev) => ({
        ...prev,
        startDate: "",
        dueDate: "",
      }));
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const newErrors = {
      ...initialErrors,
    };

    const taskTitle =
      formData.taskTitle.trim();

    const description =
      formData.description.trim();

    if (!taskTitle) {
      newErrors.taskTitle =
        "Task title is required.";
    } else if (
      taskTitle.length < 3
    ) {
      newErrors.taskTitle =
        "Task title must be at least 3 characters.";
    } else if (
      taskTitle.length > 100
    ) {
      newErrors.taskTitle =
        "Task title cannot exceed 100 characters.";
    }

    if (!description) {
      newErrors.description =
        "Description is required.";
    } else if (
      description.length < 10
    ) {
      newErrors.description =
        "Description must be at least 10 characters.";
    } else if (
      description.length > 500
    ) {
      newErrors.description =
        "Description cannot exceed 500 characters.";
    }

    if (!formData.projectId) {
      newErrors.projectId =
        "Please select a project.";
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo =
        "Please select a user member.";
    }

    if (!formData.priority) {
      newErrors.priority =
        "Please select priority.";
    }

    if (!formData.status) {
      newErrors.status =
        "Please select status.";
    }

    if (!formData.startDate) {
      newErrors.startDate =
        "Start date is required.";
    }

    if (!formData.dueDate) {
      newErrors.dueDate =
        "Due date is required.";
    }

    if (
      formData.startDate &&
      formData.dueDate
    ) {
      const start =
        new Date(formData.startDate);

      const due =
        new Date(formData.dueDate);

      if (due < start) {
        newErrors.dueDate =
          "Due date cannot be before start date.";
      }
    }

    if (!formData.createdBy) {
      newErrors.createdBy =
        "Created By is required.";
    }

    setErrors(newErrors);

    return !Object.values(
      newErrors
    ).some(Boolean);
  };

  // =====================================================
  // ADD TASK
  // =====================================================

  const handleAddTask = () => {
    const loggedUser =
      getLoggedUser();

    if (!loggedUser) {
      showMessage(
        "error",
        "Login Required",
        "Please login first."
      );

      return;
    }

    const userId =
      loggedUser?._id ||
      loggedUser?.id ||
      loggedUser?.userId ||
      "";

    const userName =
      loggedUser?.name ||
      loggedUser?.username ||
      loggedUser?.email ||
      "Logged User";

    setEditId(null);

    setErrors(initialErrors);

    setError("");

    setFormData({
      ...initialFormData,
      createdBy: userId,
    });

    setCreatedByName(userName);

    setShowModal(true);
  };

  // =====================================================
  // EDIT TASK
  // =====================================================

  const handleEdit = (task) => {
    const loggedUser =
      getLoggedUser();

    const taskId =
      task?._id ||
      task?.id;

    setEditId(taskId);

    setErrors(initialErrors);

    setError("");

    setFormData({
      taskTitle:
        task?.taskTitle || "",

      description:
        task?.description || "",

      projectId:
        task?.project?._id ||
        task?.projectId?._id ||
        task?.projectId ||
        "",

      assignedTo:
        task?.assignedTo?._id ||
        task?.assignedTo ||
        "",

      priority:
        task?.priority ||
        "Medium",

      startDate:
        task?.startDate
          ? task.startDate.split("T")[0]
          : "",

      dueDate:
        task?.dueDate
          ? task.dueDate.split("T")[0]
          : "",

      status:
        task?.status ||
        "Todo",

      createdBy:
        task?.createdBy?._id ||
        task?.createdBy ||
        loggedUser?._id ||
        loggedUser?.id ||
        "",
    });

    const creatorName =
      task?.createdBy?.name ||
      task?.createdBy?.username ||
      task?.createdBy?.email ||
      loggedUser?.name ||
      loggedUser?.username ||
      loggedUser?.email ||
      "Logged User";

    setCreatedByName(
      creatorName
    );

    setShowModal(true);
  };

  // =====================================================
  // VIEW TASK
  // =====================================================

  const handleView = (task) => {
    setSelectedTask(task);
    setShowViewModal(true);
  };

  // =====================================================
  // CLOSE VIEW
  // =====================================================

  const handleCloseView = () => {
    setShowViewModal(false);
    setSelectedTask(null);
  };

  // =====================================================
  // CLOSE FORM MODAL
  // =====================================================

  const handleCloseModal = () => {
    if (submitting) {
      return;
    }

    const loggedUser =
      getLoggedUser();

    const userId =
      loggedUser?._id ||
      loggedUser?.id ||
      loggedUser?.userId ||
      "";

    setShowModal(false);
    setEditId(null);
    setErrors(initialErrors);
    setError("");

    setFormData({
      ...initialFormData,
      createdBy: userId,
    });
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        taskTitle:
          formData.taskTitle.trim(),
        description:
          formData.description.trim(),
      };

      // =================================================
      // UPDATE
      // =================================================

      if (editId) {
        const response =
          await axios.put(
            `${API_BASE_URL}/task/task_update`,
            {
              id: editId,
              taskId: editId,
              ...payload,
            },
            API_HEADERS
          );

        if (response.data?.success) {
          handleCloseModal();

          await fetchTasks(
            currentPage,
            search,
            priorityFilter,
            statusFilter
          );

          showMessage(
            "success",
            "Task Updated",
            response.data?.message ||
            "Task updated successfully!"
          );
        } else {
          setError(
            response.data?.message ||
            "Failed to update task."
          );
        }

        return;
      }

      // =================================================
      // CREATE
      // =================================================

      const response =
        await axios.post(
          `${API_BASE_URL}/task/task_add`,
          payload,
          API_HEADERS
        );

      if (response.data?.success) {
        handleCloseModal();

        setCurrentPage(1);

        await fetchTasks(
          1,
          search,
          priorityFilter,
          statusFilter
        );

        showMessage(
          "success",
          "Task Created",
          response.data?.message ||
          "Task added successfully!"
        );
      } else {
        setError(
          response.data?.message ||
          "Failed to create task."
        );
      }
    } catch (err) {
      console.error(
        "Task Save Error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Something went wrong while saving task."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // OPEN DELETE MODAL
  // =====================================================

  const handleDelete = (task) => {
    const taskId =
      task?._id ||
      task?.id;

    if (!taskId) {
      showMessage(
        "error",
        "Delete Failed",
        "Task ID not found."
      );

      return;
    }

    setDeleteTaskId(taskId);

    setDeleteTaskTitle(
      task?.taskTitle ||
      "this task"
    );

    setShowDeleteModal(true);
  };

  // =====================================================
  // CLOSE DELETE MODAL
  // =====================================================

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteTaskId(null);
    setDeleteTaskTitle("");
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const confirmDelete = async () => {
    if (!deleteTaskId) {
      return;
    }

    try {
      setDeleting(true);

      const response =
        await axios.delete(
          `${API_BASE_URL}/task/task_delete`,
          {
            ...API_HEADERS,

            data: {
              id: deleteTaskId,
              taskId: deleteTaskId,
              _id: deleteTaskId,
            },
          }
        );

      if (response.data?.success) {
        const wasLastItem =
          tasks.length === 1;

        const pageAfterDelete =
          wasLastItem &&
            currentPage > 1
            ? currentPage - 1
            : currentPage;

        closeDeleteModal();

        // ------------------------------------------------
        // If last item on page, move to previous page
        // ------------------------------------------------

        if (
          wasLastItem &&
          currentPage > 1
        ) {
          setCurrentPage(
            pageAfterDelete
          );

          // useEffect will fetch automatically
        } else {
          await fetchTasks(
            pageAfterDelete,
            search,
            priorityFilter,
            statusFilter
          );
        }

        showMessage(
          "success",
          "Task Deleted",
          response.data?.message ||
          "Task deleted successfully!"
        );
      } else {
        showMessage(
          "error",
          "Delete Failed",
          response.data?.message ||
          "Failed to delete task."
        );
      }
    } catch (err) {
      console.error(
        "Delete Task Error:",
        err
      );

      showMessage(
        "error",
        "Delete Failed",
        err.response?.data?.message ||
        "Error deleting task."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================

  const resetFilters = () => {
    setSearch("");
    setPriorityFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    let start =
      currentPage - 2;

    let end =
      currentPage + 2;

    if (start < 1) {
      start = 1;
      end = 5;
    }

    if (end > totalPages) {
      end = totalPages;
      start =
        totalPages - 4;
    }

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    return pages;
  };

  // =====================================================
  // PROJECT NAME
  // =====================================================

  const getProjectName = (
    projectData
  ) => {
    if (
      projectData &&
      typeof projectData === "object"
    ) {
      return (
        projectData.projectName ||
        projectData.name ||
        "Unknown Project"
      );
    }

    const project =
      projects.find(
        (item) =>
          String(
            item?._id ||
            item?.id
          ) ===
          String(projectData)
      );

    return (
      project?.projectName ||
      project?.name ||
      "Unknown Project"
    );
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (
    priority
  ) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      case "Low":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700";

      case "In Progress":
        return "bg-blue-100 text-blue-700";

      case "Todo":
        return "bg-yellow-100 text-yellow-700";

      case "Review":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =====================================================
  // INPUT CLASS
  // =====================================================

  const getInputClass = (
    fieldName
  ) => {
    return `
      w-full rounded-lg border px-4
      text-sm text-[#334155]
      outline-none transition
      ${errors[fieldName]
        ? "border-red-400 bg-red-50/30 focus:border-red-500"
        : "border-[#dbe2ea] bg-white focus:border-[#2161f5]"
      }
    `;
  };

  // =====================================================
  // FIELD ERROR
  // =====================================================

  const FieldError = ({
    message,
  }) => {
    if (!message) {
      return null;
    }

    return (
      <p className="mt-1.5 text-xs font-medium text-red-500">
        {message}
      </p>
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-[#64748b]">
            Create, assign and track your tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddTask}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2161f5] px-5 text-sm font-semibold text-white transition hover:bg-[#1954dc]"
        >
          <Plus size={19} />

          New Task
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* =================================================
          TABLE CARD
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="flex flex-col gap-3 border-b border-[#e2e8f0] p-4 lg:flex-row lg:items-center">

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-sm">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value
                );

                setCurrentPage(1);
              }}
              placeholder="Search task title..."
              className="h-10 w-full rounded-lg border border-[#dbe2ea] pl-10 pr-4 text-sm outline-none focus:border-[#2161f5]"
            />

          </div>

          {/* PRIORITY */}

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-[#dbe2ea] px-3 text-sm text-[#334155] outline-none focus:border-[#2161f5]"
          >
            <option value="">
              All Priority
            </option>

            <option value="Low">
              Low
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="High">
              High
            </option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
            className="h-10 rounded-lg border border-[#dbe2ea] px-3 text-sm text-[#334155] outline-none focus:border-[#2161f5]"
          >
            <option value="">
              All Status
            </option>

            <option value="Todo">
              Todo
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Review">
              Review
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          {/* RESET */}

          <button
            type="button"
            onClick={resetFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#dbe2ea] px-4 text-sm font-medium text-[#475569] hover:bg-gray-50"
          >
            <RotateCcw size={15} />

            Reset
          </button>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="w-full overflow-x-auto">

          <table className="w-full min-w-[1200px] text-left">

            <thead className="bg-[#f8fafc]">

              <tr>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Task
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Description
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Project
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Assigned To
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Priority
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Start Date
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Due Date
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-semibold uppercase text-[#64748b]">
                  Created By
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase text-[#64748b]">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-[#e2e8f0]">

              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-5 py-16 text-center text-sm text-[#64748b]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Loading tasks...
                    </div>
                  </td>
                </tr>
              ) : tasks.length > 0 ? (
                tasks.map((task) => {
                  const taskId =
                    task?._id ||
                    task?.id;

                  return (
                    <tr
                      key={taskId}
                      className="hover:bg-[#f8fafc]"
                    >

                      {/* TASK */}

                      <td className="px-5 py-4">
                        <span className="font-semibold text-[#1e293b]">
                          {task.taskTitle}
                        </span>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-[220px] px-5 py-4">
                        <p className="truncate text-sm text-[#64748b]">
                          {task.description}
                        </p>
                      </td>

                      {/* PROJECT */}

                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-[#475569]">
                          {getProjectName(
                            task.project ||
                            task.projectId
                          )}
                        </span>
                      </td>

                      {/* ASSIGNED */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-[#475569]">
                          {task.assignedTo?.name ||
                            task.assignedTo?.username ||
                            task.assignedTo?.email ||
                            "-"}
                        </span>
                      </td>

                      {/* PRIORITY */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      {/* START */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#475569]">
                          <CalendarDays size={15} />

                          {task.startDate
                            ? task.startDate.split(
                              "T"
                            )[0]
                            : "-"}
                        </div>
                      </td>

                      {/* DUE */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#475569]">
                          <CalendarDays size={15} />

                          {task.dueDate
                            ? task.dueDate.split(
                              "T"
                            )[0]
                            : "-"}
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                      </td>

                      {/* CREATED BY */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-[#475569]">
                          {task.createdBy?.name ||
                            task.createdBy?.username ||
                            task.createdBy?.email ||
                            "-"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4">

                        <div className="flex justify-center gap-1">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(task)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(task)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#2161f5] hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(task)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="px-5 py-16 text-center"
                  >
                    <div className="text-sm font-medium text-[#64748b]">
                      No tasks found.
                    </div>

                    <p className="mt-1 text-xs text-[#94a3b8]">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="flex flex-col gap-4 border-t border-[#e2e8f0] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-sm text-[#64748b]">

            Showing{" "}

            <span className="font-semibold text-[#334155]">
              {totalRecords === 0
                ? 0
                : (currentPage - 1) *
                perPage +
                1}
            </span>

            {" "}to{" "}

            <span className="font-semibold text-[#334155]">
              {Math.min(
                currentPage *
                perPage,
                totalRecords
              )}
            </span>

            {" "}of{" "}

            <span className="font-semibold text-[#334155]">
              {totalRecords}
            </span>

            {" "}tasks

          </div>

          <div className="flex items-center justify-center gap-1">

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                currentPage === 1 ||
                loading
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.max(
                      prev - 1,
                      1
                    )
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe2ea] text-[#475569] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            {/* PAGE NUMBERS */}

            {getPageNumbers().map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium ${currentPage === page
                    ? "bg-[#2161f5] text-white"
                    : "border border-[#dbe2ea] text-[#475569] hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              )
            )}

            {/* NEXT */}

            <button
              type="button"
              disabled={
                currentPage ===
                totalPages ||
                loading ||
                totalRecords === 0
              }
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe2ea] text-[#475569] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between border-b pb-4">

              <h2 className="text-lg font-semibold text-[#1e293b]">
                {editId
                  ? "Edit Task"
                  : "Add New Task"}
              </h2>

              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-4"
            >

              {/* TASK TITLE */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">
                  Task Title
                </label>

                <input
                  type="text"
                  name="taskTitle"
                  value={
                    formData.taskTitle
                  }
                  onChange={
                    handleChange
                  }
                  className={`${getInputClass(
                    "taskTitle"
                  )} h-10`}
                />

                <FieldError
                  message={
                    errors.taskTitle
                  }
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={3}
                  value={
                    formData.description
                  }
                  onChange={
                    handleChange
                  }
                  className={`${getInputClass(
                    "description"
                  )} py-2`}
                />

                <FieldError
                  message={
                    errors.description
                  }
                />
              </div>

              {/* PROJECT + ASSIGNED */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#475569]">
                    Project
                  </label>

                  <select
                    name="projectId"
                    value={
                      formData.projectId
                    }
                    onChange={
                      handleChange
                    }
                    className={`${getInputClass(
                      "projectId"
                    )} h-10`}
                  >

                    <option value="">
                      Select Project
                    </option>

                    {projects.map(
                      (project) => (
                        <option
                          key={
                            project._id ||
                            project.id
                          }
                          value={
                            project._id ||
                            project.id
                          }
                        >
                          {
                            project.projectName
                          }
                        </option>
                      )
                    )}

                  </select>

                  <FieldError
                    message={
                      errors.projectId
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#475569]">
                    Assigned To
                  </label>

                  <select
                    name="assignedTo"
                    value={
                      formData.assignedTo
                    }
                    onChange={
                      handleChange
                    }
                    className={`${getInputClass(
                      "assignedTo"
                    )} h-10`}
                  >

                    <option value="">
                      Select Member
                    </option>

                    {users.map(
                      (user) => (
                        <option
                          key={
                            user._id ||
                            user.id
                          }
                          value={
                            user._id ||
                            user.id
                          }
                        >
                          {user.name ||
                            user.username ||
                            user.email}
                        </option>
                      )
                    )}

                  </select>

                  <FieldError
                    message={
                      errors.assignedTo
                    }
                  />
                </div>

              </div>

              {/* PRIORITY + STATUS */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#475569]">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={
                      formData.priority
                    }
                    onChange={
                      handleChange
                    }
                    className={`${getInputClass(
                      "priority"
                    )} h-10`}
                  >

                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                  <FieldError
                    message={
                      errors.priority
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#475569]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                    className={`${getInputClass(
                      "status"
                    )} h-10`}
                  >

                    <option value="Todo">
                      Todo
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Review">
                      Review
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                  </select>

                  <FieldError
                    message={
                      errors.status
                    }
                  />
                </div>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#475569]">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={
                      formData.startDate
                    }
                    onChange={
                      handleChange
                    }
                    className={`${getInputClass(
                      "startDate"
                    )} h-10`}
                  />

                  <FieldError
                    message={
                      errors.startDate
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#475569]">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={
                      formData.dueDate
                    }
                    onChange={
                      handleChange
                    }
                    className={`${getInputClass(
                      "dueDate"
                    )} h-10`}
                  />

                  <FieldError
                    message={
                      errors.dueDate
                    }
                  />
                </div>

              </div>

              {/* CREATED BY */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#475569]">
                  Created By
                </label>

                <input
                  type="text"
                  disabled
                  value={
                    createdByName
                  }
                  className="h-10 w-full rounded-lg border border-[#dbe2ea] bg-gray-100 px-4 text-sm text-gray-500"
                />

                <FieldError
                  message={
                    errors.createdBy
                  }
                />
              </div>

              {/* ACTION */}

              <div className="flex justify-end gap-3 border-t pt-4">

                <button
                  type="button"
                  onClick={
                    handleCloseModal
                  }
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-lg bg-[#2161f5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1954dc] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {submitting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {submitting
                    ? "Saving..."
                    : editId
                      ? "Update Task"
                      : "Create Task"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          VIEW TASK MODAL
      ===================================================== */}

      {showViewModal &&
        selectedTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">

                <div>
                  <h2 className="text-lg font-bold text-[#1e293b]">
                    Task Details
                  </h2>

                  <p className="mt-1 text-xs text-[#94a3b8]">
                    View complete task information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseView
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={20} />
                </button>

              </div>

              {/* BODY */}

              <div className="max-h-[70vh] overflow-y-auto p-6">

                {/* TITLE */}

                <div className="mb-5">

                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Task Title
                  </p>

                  <h3 className="text-xl font-bold text-[#1e293b]">
                    {selectedTask.taskTitle ||
                      "-"}
                  </h3>

                </div>

                {/* DESCRIPTION */}

                <div className="mb-5">

                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                    Description
                  </p>

                  <p className="rounded-lg bg-[#f8fafc] p-4 text-sm leading-6 text-[#475569]">
                    {selectedTask.description ||
                      "-"}
                  </p>

                </div>

                {/* GRID */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* PROJECT */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Project
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                      {getProjectName(
                        selectedTask.project ||
                        selectedTask.projectId
                      )}
                    </p>

                  </div>

                  {/* ASSIGNED */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Assigned To
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                      {selectedTask.assignedTo?.name ||
                        selectedTask.assignedTo?.username ||
                        selectedTask.assignedTo?.email ||
                        "-"}
                    </p>

                  </div>

                  {/* PRIORITY */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Priority
                    </p>

                    <div className="mt-2">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                          selectedTask.priority
                        )}`}
                      >
                        {selectedTask.priority ||
                          "-"}
                      </span>

                    </div>

                  </div>

                  {/* STATUS */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Status
                    </p>

                    <div className="mt-2">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          selectedTask.status
                        )}`}
                      >
                        {selectedTask.status ||
                          "-"}
                      </span>

                    </div>

                  </div>

                  {/* START DATE */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Start Date
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#334155]">

                      <CalendarDays
                        size={16}
                      />

                      {selectedTask.startDate
                        ? selectedTask.startDate.split(
                          "T"
                        )[0]
                        : "-"}

                    </div>

                  </div>

                  {/* DUE DATE */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Due Date
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-[#334155]">

                      <CalendarDays
                        size={16}
                      />

                      {selectedTask.dueDate
                        ? selectedTask.dueDate.split(
                          "T"
                        )[0]
                        : "-"}

                    </div>

                  </div>

                  {/* CREATED BY */}

                  <div className="rounded-lg border border-[#e2e8f0] p-4 sm:col-span-2">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                      Created By
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#334155]">
                      {selectedTask.createdBy?.name ||
                        selectedTask.createdBy?.username ||
                        selectedTask.createdBy?.email ||
                        "-"}
                    </p>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="flex justify-end border-t border-[#e2e8f0] px-6 py-4">

                <button
                  type="button"
                  onClick={
                    handleCloseView
                  }
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* DELETE ICON */}

            <div className="flex justify-center pt-7">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">

                <Trash2
                  size={27}
                  className="text-red-600"
                />

              </div>

            </div>

            {/* CONTENT */}

            <div className="px-6 py-5 text-center">

              <h2 className="text-lg font-bold text-[#1e293b]">
                Delete Task?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748b]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#334155]">
                  "{deleteTaskTitle}"
                </span>
                ?
              </p>

              <p className="mt-1 text-xs text-red-500">
                This action cannot be undone.
              </p>

            </div>

            {/* BUTTONS */}

            <div className="flex justify-end gap-3 border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4">

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={deleting}
                className="rounded-lg border border-[#dbe2ea] bg-white px-5 py-2.5 text-sm font-semibold text-[#475569] hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {deleting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />

                    Delete Task
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          SUCCESS / ERROR MESSAGE MODAL
      ===================================================== */}

      {showMessageModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* ICON */}

            <div className="flex justify-center pt-7">

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${messageType ===
                  "success"
                  ? "bg-green-100"
                  : "bg-red-100"
                  }`}
              >

                {messageType ===
                  "success" ? (
                  <CheckCircle2
                    size={34}
                    className="text-green-600"
                  />
                ) : (
                  <AlertCircle
                    size={34}
                    className="text-red-600"
                  />
                )}

              </div>

            </div>

            {/* CONTENT */}

            <div className="px-6 py-5 text-center">

              <h2
                className={`text-lg font-bold ${messageType ===
                  "success"
                  ? "text-green-700"
                  : "text-red-700"
                  }`}
              >
                {messageTitle}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#64748b]">
                {messageText}
              </p>

            </div>

            {/* BUTTON */}

            <div className="flex justify-center border-t border-[#e2e8f0] bg-[#f8fafc] px-6 py-4">

              <button
                type="button"
                onClick={
                  closeMessageModal
                }
                className={`rounded-lg px-7 py-2.5 text-sm font-semibold text-white ${messageType ===
                  "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                OK
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Tasks;