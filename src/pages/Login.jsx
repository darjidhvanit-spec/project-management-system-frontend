import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // ==========================================
    // Cleanup timeout when component unmounts
    // ==========================================
    useEffect(() => {
        return () => {
            if (window.loginSuccessTimer) {
                clearTimeout(window.loginSuccessTimer);
            }
        };
    }, []);

    // ==========================================
    // Login
    // ==========================================
    const handleLogin = async (e) => {
        e.preventDefault();

        // Clear old messages
        setError("");
        setSuccess("");

        // ==========================================
        // Validation
        // ==========================================
        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!password.trim()) {
            setError("Password is required");
            return;
        }

        try {
            setLoading(true);

            // ==========================================
            // Login API
            // ==========================================
            const response = await axios.post(
                "https://project-management-system-backend-2-qyqt.onrender.com/user/user_login",
                {
                    email: email.trim(),
                    password: password,
                    device_type: "",
                    device_token: "",
                    device_name: "",
                    os_version: "",
                },
                {
                    headers: {
                        "api-key": "projectmanagement",
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Login Response:", response.data);

            // ==========================================
            // Login Success
            // ==========================================
            if (response.data?.success === true) {
                const userData = response.data.data;

                console.log("Logged In User:", userData);

                // ==========================================
                // Get Token
                // ==========================================
                const token = userData?.device_info?.token || "";

                localStorage.setItem("token", token);

                // ==========================================
                // Save User Session
                // ==========================================
                localStorage.setItem(
                    "pms:session",
                    JSON.stringify(userData)
                );

                // ==========================================
                // Show Success Message
                // ==========================================
                setSuccess("Login successfully!");

                // ==========================================
                // Stop Loading
                // ==========================================
                setLoading(false);

                // ==========================================
                // Navigate after 1.5 seconds
                // ==========================================
                window.loginSuccessTimer = setTimeout(() => {
                    navigate("/dashboard", {
                        replace: true,
                    });
                }, 1500);

            } else {
                setLoading(false);

                setError(
                    response.data?.message ||
                    "Invalid email or password"
                );
            }

        } catch (error) {
            console.error("Login API Error:", error);

            setLoading(false);

            // ==========================================
            // API Error
            // ==========================================
            if (error.response) {
                setError(
                    error.response.data?.message ||
                    "Invalid email or password"
                );
            }

            // ==========================================
            // Server Not Responding
            // ==========================================
            else if (error.request) {
                setError(
                    "Server is not responding. Please try again."
                );
            }

            // ==========================================
            // Other Error
            // ==========================================
            else {
                setError(
                    "Something went wrong. Please try again."
                );
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* ==========================================
                    Header
                ========================================== */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Welcome Back!
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Please login to your account
                    </p>
                </div>

                {/* ==========================================
                    Card
                ========================================== */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">

                    {/* ==========================================
                        Error Message
                    ========================================== */}
                    {error && (
                        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            <span>{error}</span>
                        </div>
                    )}

                    {/* ==========================================
                        Success Message
                    ========================================== */}
                    {success && (
                        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
                            <CheckCircle2
                                size={20}
                                strokeWidth={2}
                            />

                            <span>{success}</span>
                        </div>
                    )}

                    {/* ==========================================
                        Login Form
                    ========================================== */}
                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* ==========================================
                            Email
                        ========================================== */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                disabled={loading || !!success}
                                autoComplete="email"
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                            />
                        </div>

                        {/* ==========================================
                            Password
                        ========================================== */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                        setSuccess("");
                                    }}
                                    disabled={loading || !!success}
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    disabled={loading || !!success}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            size={20}
                                            strokeWidth={2}
                                        />
                                    ) : (
                                        <Eye
                                            size={20}
                                            strokeWidth={2}
                                        />
                                    )}
                                </button>

                            </div>
                        </div>

                        {/* ==========================================
                            Login Button
                        ========================================== */}
                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                        >

                            {loading ? (
                                <>
                                    <Loader2
                                        size={19}
                                        className="animate-spin"
                                    />

                                    <span>
                                        Logging in...
                                    </span>
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2
                                        size={19}
                                    />

                                    <span>
                                        Login Successful
                                    </span>
                                </>
                            ) : (
                                "Login"
                            )}

                        </button>

                    </form>

                    {/* ==========================================
                        Register Link
                    ========================================== */}
                    {!success && (
                        <div className="mt-6 text-center text-xs text-slate-500">
                            Don't have an account?{" "}

                            <Link
                                to="/register"
                                className="font-semibold text-blue-600 hover:underline"
                            >
                                Register here
                            </Link>
                        </div>
                    )}

                </div>

                {/* ==========================================
                    Footer
                ========================================== */}
                <p className="mt-6 text-center text-xs text-slate-400">
                    Project Management System
                </p>

            </div>
        </div>
    );
};

export default Login;