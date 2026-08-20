import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        // =========================
        // Validation
        // =========================
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

            // =========================
            // Login API
            // =========================
            const response = await axios.post(
                "http://localhost:5000/user/user_login",
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

            // =========================
            // Login Success
            // =========================
            if (response.data?.success === true) {

                const userData = response.data.data;

                console.log("Logged In User:", userData);

                // =========================
                // Get & Save Token
                // =========================
                const token = userData?.device_info?.token || "";
                localStorage.setItem("token", token);

                // =========================
                // Save User Data Session
                // =========================
                localStorage.setItem(
                    "pms:session",
                    JSON.stringify(userData)
                );

                // =========================
                // Redirect to Dashboard
                // =========================
                navigate("/dashboard", {
                    replace: true,
                });

            } else {
                setError(
                    response.data?.message ||
                    "Invalid email or password"
                );
            }

        } catch (error) {
            console.error("Login API Error:", error);

            if (error.response) {
                setError(
                    error.response.data?.message ||
                    "Invalid email or password"
                );
            } else if (error.request) {
                setError(
                    "Server is not responding. Please check backend server."
                );
            } else {
                setError(
                    "Something went wrong. Please try again."
                );
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">
                        Welcome Back!
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Please login to your account
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* Email Input */}
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
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                autoComplete="email"
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                            />
                        </div>

                        {/* Password Input */}
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
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    autoComplete="current-password"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={loading}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} strokeWidth={2} />
                                    ) : (
                                        <Eye size={20} strokeWidth={2} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    {/* Registration Redirect Link */}
                    <div className="mt-6 text-center text-xs text-slate-500">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-blue-600 hover:underline"
                        >
                            Register here
                        </Link>
                    </div>

                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-slate-400">
                    Project Management System
                </p>

            </div>
        </div>
    );
};

export default Login;