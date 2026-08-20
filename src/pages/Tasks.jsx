import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  CalendarDays,
  Eye,
} from "lucide-react";

const Tasks = () => {
  // =====================================================
  // INITIAL FORM DATA
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

  // =====================================================
  // INITIAL VALIDATION
  // =====================================================
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

  const [createdByName, setCreatedByName] = useState("");

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState(initialErrors);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // VIEW DETAILS
  // =====================================================
  const [selectedTask, setSelectedTask] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  

  // =====================================================
  // API HEADERS
  // =====================================================
  const API_HEADERS = {
    headers: {
      "api-key": "projectmanagement",
      "Content-Type": "application/json",
    },
  };

  // =====================================================
  // GET LOGGED USER
  // =====================================================
  const getLoggedUser = () => {
    try {
      const storedUser = localStorage.getItem("pms:session");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (err) {
      console.error("User Parse Error:", err);
      return null;
    }
  };

  // =====================================================
  // FETCH TASK LIST
  // =====================================================
  const fetchTasks = useCallback(async (searchTerm = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "https://project-management-system-frontend-nine.vercel.app/task/task_list",
        {
          search: searchTerm,
        },
        API_HEADERS
      );

      if (response.data?.success) {
        const taskData = response.data?.data?.taskData;

        setTasks(Array.isArray(taskData) ? taskData : []);
      } else {
        setTasks([]);

        setError(
          response.data?.message || "Unable to fetch task list."
        );
      }
    } catch (err) {
      console.error("Task List Error:", err);

      setTasks([]);

      setError(
        err.response?.data?.message ||
        "Error fetching task list."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // FETCH PROJECT LIST
  // =====================================================
  const fetchProjects = useCallback(async () => {
    try {
      const response = await axios.post(
        "https://project-management-system-frontend-nine.vercel.app/project/project_list",
        {},
        API_HEADERS
      );

      if (response.data?.success) {
        const projectData = response.data?.data?.projectData;

        setProjects(
          Array.isArray(projectData)
            ? projectData
            : []
        );
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Project List Error:", err);

      setProjects([]);
    }
  }, []);

  // =====================================================
  // FETCH USERS
  // ONLY MEMBER / USER ROLE
  // =====================================================
  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.post(
        "https://project-management-system-frontend-nine.vercel.app/user/user_list",
        {},
        API_HEADERS
      );

      if (response.data?.success) {
        const userData = response.data?.data;

        if (Array.isArray(userData)) {
          const memberUsers = userData.filter(
            (user) => {
              const userRole = (
                user.role ||
                user.userType ||
                ""
              ).toLowerCase();

              return (
                userRole === "member" ||
                userRole === "user"
              );
            }
          );

          setUsers(memberUsers);
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("User List Error:", err);

      setUsers([]);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();

    const loggedUser = getLoggedUser();

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
    fetchTasks,
    fetchProjects,
    fetchUsers,
  ]);

  // =====================================================
  // SEARCH TASKS
  // =====================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search, fetchTasks]);

  // =====================================================
  // HANDLE INPUT CHANGE
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

    // Clear field error when user changes value
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");

    // =================================================
    // DATE CROSS VALIDATION
    // =================================================
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
  // VALIDATE FORM
  // =====================================================
  const validateForm = () => {
    const newErrors = {
      ...initialErrors,
    };

    const taskTitle =
      formData.taskTitle?.trim() || "";

    const description =
      formData.description?.trim() || "";

    // =================================================
    // TASK TITLE
    // =================================================
    if (!taskTitle) {
      newErrors.taskTitle =
        "Task title is required.";
    } else if (taskTitle.length < 3) {
      newErrors.taskTitle =
        "Task title must be at least 3 characters.";
    } else if (taskTitle.length > 100) {
      newErrors.taskTitle =
        "Task title cannot exceed 100 characters.";
    }

    // =================================================
    // DESCRIPTION
    // =================================================
    if (!description) {
      newErrors.description =
        "Description is required.";
    } else if (description.length < 10) {
      newErrors.description =
        "Description must be at least 10 characters.";
    } else if (description.length > 500) {
      newErrors.description =
        "Description cannot exceed 500 characters.";
    }

    // =================================================
    // PROJECT
    // =================================================
    if (!formData.projectId) {
      newErrors.projectId =
        "Please select a project.";
    }

    // =================================================
    // ASSIGNED TO
    // =================================================
    if (!formData.assignedTo) {
      newErrors.assignedTo =
        "Please select a user member.";
    }

    // =================================================
    // PRIORITY
    // =================================================
    if (!formData.priority) {
      newErrors.priority =
        "Please select priority.";
    }

    // =================================================
    // STATUS
    // =================================================
    if (!formData.status) {
      newErrors.status =
        "Please select status.";
    }

    // =================================================
    // START DATE
    // =================================================
    if (!formData.startDate) {
      newErrors.startDate =
        "Start date is required.";
    }

    // =================================================
    // DUE DATE
    // =================================================
    if (!formData.dueDate) {
      newErrors.dueDate =
        "Due date is required.";
    }

    // =================================================
    // DATE COMPARISON
    // =================================================
    if (
      formData.startDate &&
      formData.dueDate
    ) {
      const startDate = new Date(
        formData.startDate
      );

      const dueDate = new Date(
        formData.dueDate
      );

      if (dueDate < startDate) {
        newErrors.dueDate =
          "Due date cannot be before start date.";
      }
    }

    // =================================================
    // CREATED BY
    // =================================================
    if (!formData.createdBy) {
      newErrors.createdBy =
        "Created By user is required.";
    }

    setErrors(newErrors);

    // Return true if no validation errors
    return !Object.values(newErrors).some(
      (error) => error !== ""
    );
  };

  // =====================================================
  // OPEN ADD TASK MODAL
  // =====================================================
  const handleAddTask = () => {
    const loggedUser = getLoggedUser();

    if (!loggedUser) {
      setError("Please login first.");
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
    const loggedUser = getLoggedUser();

    setEditId(
      task._id || task.id
    );

    setErrors(initialErrors);

    setError("");

    setFormData({
      taskTitle:
        task.taskTitle || "",

      description:
        task.description || "",

      projectId:
        task.projectId?._id ||
        task.projectId ||
        "",

      assignedTo:
        task.assignedTo?._id ||
        task.assignedTo ||
        "",

      priority:
        task.priority || "Medium",

      startDate:
        task.startDate
          ? task.startDate.split("T")[0]
          : "",

      dueDate:
        task.dueDate
          ? task.dueDate.split("T")[0]
          : "",

      status:
        task.status || "Todo",

      createdBy:
        task.createdBy?._id ||
        task.createdBy ||
        loggedUser?._id ||
        loggedUser?.id ||
        "",
    });

    const creatorName =
      typeof task.createdBy === "object"
        ? task.createdBy?.name ||
        task.createdBy?.username ||
        task.createdBy?.email
        : loggedUser?.name ||
        loggedUser?.username ||
        loggedUser?.email ||
        "Logged User";

    setCreatedByName(
      creatorName || "Logged User"
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
  // CLOSE CREATE / EDIT MODAL
  // =====================================================
  const handleCloseModal = () => {
    if (submitting) {
      return;
    }

    const loggedUser = getLoggedUser();

    const userId =
      loggedUser?._id ||
      loggedUser?.id ||
      loggedUser?.userId ||
      "";

    setShowModal(false);

    setEditId(null);

    setErrors(initialErrors);

    setFormData({
      ...initialFormData,
      createdBy: userId,
    });

    setError("");
  };

  // =====================================================
  // CREATE / UPDATE TASK
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // =================================================
    // FRONTEND VALIDATION
    // =================================================
    const isValid = validateForm();

    if (!isValid) {
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
      // UPDATE TASK
      // =================================================
      if (editId) {
        const response =
          await axios.put(
            "https://project-management-system-frontend-nine.vercel.app/task/task_update",
            {
              id: editId,
              ...payload,
            },
            API_HEADERS
          );

        if (response.data?.success) {
          alert(
            response.data?.message ||
            "Task updated successfully!"
          );

          await fetchTasks(search);

          handleCloseModal();
        } else {
          setError(
            response.data?.message ||
            "Failed to update task."
          );
        }

        return;
      }

      // =================================================
      // CREATE TASK
      // =================================================
      const response =
        await axios.post(
          "https://project-management-system-frontend-nine.vercel.app/task/task_add",
          payload,
          API_HEADERS
        );

      if (response.data?.success) {
        alert(
          response.data?.message ||
          "Task created successfully!"
        );

        await fetchTasks(search);

        handleCloseModal();
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
  // DELETE TASK
  // =====================================================
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this task?"
      )
    ) {
      return;
    }

    try {
      const response =
        await axios.delete(
          "https://project-management-system-frontend-nine.vercel.app/task/task_delete",
          {
            ...API_HEADERS,
            data: {
              id,
            },
          }
        );

      if (response.data?.success) {
        alert(
          response.data?.message ||
          "Task deleted successfully!"
        );

        await fetchTasks(search);
      } else {
        alert(
          response.data?.message ||
          "Failed to delete task."
        );
      }
    } catch (err) {
      console.error(
        "Delete Task Error:",
        err
      );

      alert(
        err.response?.data?.message ||
        "Error deleting task."
      );
    }
  };

  // =====================================================
  // GET PROJECT NAME
  // =====================================================
  const getProjectName = (
    projectData
  ) => {
    if (
      typeof projectData === "object" &&
      projectData !== null
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
            item.id || item._id
          ) ===
          String(projectData)
      );

    return project
      ? project.projectName ||
      project.name
      : "Unknown Project";
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
  // INPUT CLASS HELPER
  // =====================================================
  const getInputClass = (
    fieldName
  ) => {
    return `
      w-full rounded-lg border px-4 text-sm
      text-[#334155] outline-none transition
      ${errors[fieldName]
        ? "border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-[#dbe2ea] bg-white focus:border-[#2161f5] focus:ring-2 focus:ring-[#2161f5]/10"
      }
    `;
  };

  // =====================================================
  // ERROR MESSAGE COMPONENT
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

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="w-full">

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

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

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

        {/* ================================================= */}
        {/* TABLE CARD */}
        {/* ================================================= */}

        <div className="w-full overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-sm">

          {/* SEARCH */}

          <div className="border-b border-[#e2e8f0] p-4">

            <div className="relative w-full sm:max-w-sm">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search tasks..."
                className="h-10 w-full rounded-lg border border-[#dbe2ea] bg-white pl-10 pr-4 text-sm text-[#334155] outline-none transition focus:border-[#2161f5] focus:ring-2 focus:ring-[#2161f5]/10"
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* TABLE */}
          {/* ================================================= */}

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-[#f8fafc]">

                <tr>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Task
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Description
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Project
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Assigned To
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Start Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Due Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                    Created By
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-[#64748b]">
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
                      Loading tasks...
                    </td>
                  </tr>
                ) : tasks.length > 0 ? (
                  tasks.map((task) => {

                    const taskId =
                      task._id ||
                      task.id;

                    return (
                      <tr
                        key={taskId}
                        className="transition hover:bg-[#f8fafc]"
                      >

                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#1e293b]">
                            {task.taskTitle}
                          </div>
                        </td>

                        <td className="max-w-[200px] px-5 py-4">
                          <p className="truncate text-sm text-[#64748b]">
                            {task.description}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[#475569]">
                            {getProjectName(
                              task.projectId ||
                              task.project
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[#475569]">
                            {typeof task.assignedTo ===
                              "object"
                              ? task.assignedTo?.name ||
                              task.assignedTo?.username ||
                              task.assignedTo?.email
                              : task.assignedTo ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#475569]">
                            <CalendarDays
                              size={15}
                              className="text-[#64748b]"
                            />

                            {task.startDate
                              ? task.startDate.split(
                                "T"
                              )[0]
                              : "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#475569]">
                            <CalendarDays
                              size={15}
                              className="text-[#64748b]"
                            />

                            {task.dueDate
                              ? task.dueDate.split(
                                "T"
                              )[0]
                              : "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-[#475569]">
                            {typeof task.createdBy ===
                              "object"
                              ? task.createdBy?.name ||
                              task.createdBy?.username ||
                              task.createdBy?.email
                              : task.createdBy ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center justify-center gap-1">

                            <button
                              type="button"
                              onClick={() =>
                                handleView(task)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
                              title="View Details"
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(task)
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#2161f5] transition hover:bg-blue-50"
                              title="Edit"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  taskId
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
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
                        Click "New Task" to create your first task.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ================================================= */}
        {/* VIEW TASK MODAL */}
        {/* ================================================= */}

        {showViewModal &&
          selectedTask && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

              <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-4">

                  <div>
                    <h2 className="text-xl font-bold text-[#1e293b]">
                      Task Details
                    </h2>

                    <p className="mt-1 text-xs text-[#64748b]">
                      Detailed view of the task
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowViewModal(false)
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9]"
                  >
                    <X size={21} />
                  </button>

                </div>

                <div className="space-y-4 p-6">

                  <div>
                    <label className="text-xs font-semibold uppercase text-[#64748b]">
                      Task Title
                    </label>

                    <p className="text-base font-semibold text-[#1e293b]">
                      {selectedTask.taskTitle}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase text-[#64748b]">
                      Description
                    </label>

                    <p className="whitespace-pre-wrap rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-sm text-[#334155]">
                      {selectedTask.description ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#64748b]">
                        Project
                      </label>

                      <p className="text-sm font-medium text-[#1e293b]">
                        {getProjectName(
                          selectedTask.projectId ||
                          selectedTask.project
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#64748b]">
                        Assigned To
                      </label>

                      <p className="text-sm font-medium text-[#1e293b]">
                        {typeof selectedTask.assignedTo ===
                          "object"
                          ? selectedTask.assignedTo?.name ||
                          selectedTask.assignedTo?.username ||
                          selectedTask.assignedTo?.email
                          : selectedTask.assignedTo ||
                          "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#64748b]">
                        Priority
                      </label>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityClass(
                          selectedTask.priority
                        )}`}
                      >
                        {selectedTask.priority}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#64748b]">
                        Status
                      </label>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          selectedTask.status
                        )}`}
                      >
                        {selectedTask.status}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#64748b]">
                        Start Date
                      </label>

                      <p className="text-sm font-medium text-[#1e293b]">
                        {selectedTask.startDate
                          ? selectedTask.startDate.split(
                            "T"
                          )[0]
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase text-[#64748b]">
                        Due Date
                      </label>

                      <p className="text-sm font-medium text-[#1e293b]">
                        {selectedTask.dueDate
                          ? selectedTask.dueDate.split(
                            "T"
                          )[0]
                          : "N/A"}
                      </p>
                    </div>

                  </div>

                  <div className="border-t border-[#e2e8f0] pt-3">

                    <label className="text-xs font-semibold uppercase text-[#64748b]">
                      Created By
                    </label>

                    <p className="text-sm font-medium text-[#1e293b]">
                      {typeof selectedTask.createdBy ===
                        "object"
                        ? selectedTask.createdBy?.name ||
                        selectedTask.createdBy?.username ||
                        selectedTask.createdBy?.email
                        : selectedTask.createdBy ||
                        "N/A"}
                    </p>

                  </div>

                </div>

                <div className="flex justify-end border-t border-[#e2e8f0] px-6 py-4">

                  <button
                    type="button"
                    onClick={() =>
                      setShowViewModal(false)
                    }
                    className="rounded-lg bg-[#f1f5f9] px-5 py-2 text-sm font-semibold text-[#334155] transition hover:bg-[#e2e8f0]"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>
          )}

        {/* ================================================= */}
        {/* CREATE / EDIT TASK MODAL */}
        {/* ================================================= */}

        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between border-b border-[#e2e8f0] px-6 py-5">

                <div>

                  <h2 className="text-xl font-bold text-[#1e293b]">
                    {editId
                      ? "Update Task"
                      : "Create New Task"}
                  </h2>

                  <p className="mt-1 text-sm text-[#64748b]">
                    {editId
                      ? "Update task information."
                      : "Add a new task to your project."}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9]"
                >
                  <X size={21} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5 p-6"
              >

                {/* ================================================= */}
                {/* TASK TITLE */}
                {/* ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#334155]">
                    Task Title{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="taskTitle"
                    value={formData.taskTitle}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    maxLength={100}
                    className={`${getInputClass(
                      "taskTitle"
                    )} h-11`}
                  />

                  <FieldError
                    message={errors.taskTitle}
                  />

                </div>

                {/* ================================================= */}
                {/* DESCRIPTION */}
                {/* ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#334155]">
                    Description{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={handleChange}
                    rows="4"
                    maxLength={500}
                    placeholder="Enter task description"
                    className={`${getInputClass(
                      "description"
                    )} resize-none px-4 py-3`}
                  />

                  <div className="mt-1 flex justify-between">

                    <FieldError
                      message={
                        errors.description
                      }
                    />

                    <span className="ml-auto text-xs text-[#94a3b8]">
                      {
                        formData.description
                          .length
                      }
                      /500
                    </span>

                  </div>

                </div>

                {/* ================================================= */}
                {/* PROJECT + ASSIGNED TO */}
                {/* ================================================= */}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* PROJECT */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#334155]">
                      Project{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      name="projectId"
                      value={
                        formData.projectId
                      }
                      onChange={handleChange}
                      className={`${getInputClass(
                        "projectId"
                      )} h-11 bg-white`}
                    >

                      <option value="">
                        Select Project
                      </option>

                      {projects.map(
                        (project) => {

                          const id =
                            project._id ||
                            project.id;

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {project.projectName ||
                                project.name}
                            </option>
                          );
                        }
                      )}

                    </select>

                    <FieldError
                      message={
                        errors.projectId
                      }
                    />

                  </div>

                  {/* ASSIGNED TO */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#334155]">
                      Assigned To{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      name="assignedTo"
                      value={
                        formData.assignedTo
                      }
                      onChange={handleChange}
                      className={`${getInputClass(
                        "assignedTo"
                      )} h-11 bg-white`}
                    >

                      <option value="">
                        Select User Member
                      </option>

                      {users.map(
                        (user) => {

                          const id =
                            user._id ||
                            user.id;

                          return (
                            <option
                              key={id}
                              value={id}
                            >
                              {user.name ||
                                user.username ||
                                user.email}
                            </option>
                          );
                        }
                      )}

                    </select>

                    <FieldError
                      message={
                        errors.assignedTo
                      }
                    />

                  </div>

                  {/* PRIORITY */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#334155]">
                      Priority{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      name="priority"
                      value={
                        formData.priority
                      }
                      onChange={handleChange}
                      className={`${getInputClass(
                        "priority"
                      )} h-11 bg-white`}
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

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#334155]">
                      Status{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <select
                      name="status"
                      value={
                        formData.status
                      }
                      onChange={handleChange}
                      className={`${getInputClass(
                        "status"
                      )} h-11 bg-white`}
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

                  {/* START DATE */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#334155]">
                      Start Date{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                      />

                      <input
                        type="date"
                        name="startDate"
                        value={
                          formData.startDate
                        }
                        onChange={handleChange}
                        className={`${getInputClass(
                          "startDate"
                        )} h-11 pl-10`}
                      />

                    </div>

                    <FieldError
                      message={
                        errors.startDate
                      }
                    />

                  </div>

                  {/* DUE DATE */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-[#334155]">
                      Due Date{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">

                      <CalendarDays
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                      />

                      <input
                        type="date"
                        name="dueDate"
                        value={
                          formData.dueDate
                        }
                        onChange={handleChange}
                        min={
                          formData.startDate ||
                          undefined
                        }
                        className={`${getInputClass(
                          "dueDate"
                        )} h-11 pl-10`}
                      />

                    </div>

                    <FieldError
                      message={
                        errors.dueDate
                      }
                    />

                  </div>

                </div>

                {/* ================================================= */}
                {/* CREATED BY */}
                {/* ================================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#334155]">
                    Created By{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={createdByName}
                    readOnly
                    disabled
                    className="h-11 w-full cursor-not-allowed rounded-lg border border-[#dbe2ea] bg-gray-100 px-4 text-sm font-medium text-gray-600 outline-none"
                  />

                  <FieldError
                    message={
                      errors.createdBy
                    }
                  />

                </div>

                {/* ================================================= */}
                {/* FORM ACTIONS */}
                {/* ================================================= */}

                <div className="flex justify-end gap-3 border-t border-[#e2e8f0] pt-5">

                  <button
                    type="button"
                    onClick={
                      handleCloseModal
                    }
                    disabled={submitting}
                    className="rounded-lg border border-[#dbe2ea] px-5 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex min-w-[140px] items-center justify-center rounded-lg bg-[#2161f5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1954dc] disabled:cursor-not-allowed disabled:opacity-50"
                  >
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

      </div>
    </div>
  );
};

export default Tasks;