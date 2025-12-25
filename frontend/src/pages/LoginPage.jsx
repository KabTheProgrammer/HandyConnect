import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoginMutation } from "../features/auth/authApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [searchParams] = useSearchParams();
  const roleFromQuery = searchParams.get("role");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    if (!user) return;
    const dest = user.userType === "provider" ? "/provider-home" : "/customer-home";
    if (window.location.pathname !== dest) navigate(dest, { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await login({
        email,
        password,
        role: roleFromQuery || "customer",
      }).unwrap();

      dispatch(setCredentials(userData));
      toast.success(`Welcome back, ${userData.user?.name || "User"}! 👋`, {
        position: "top-center",
      });

      const dest =
        userData.userType === "provider" ? "/provider-home" : "/customer-home";
      navigate(dest, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err?.data?.message || "Invalid email or password", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f8] dark:bg-[#101c22] font-display text-[#111827] dark:text-[#e5e7eb] p-6">
      <header className="text-center mb-12">
        {roleFromQuery && (
          <h1 className="text-2xl font-bold">
            {roleFromQuery === "provider" ? "Provider Login" : "Customer Login"}
          </h1>
        )}
      </header>

      <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4 w-full">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] placeholder-[#6b7280] dark:placeholder-[#9ca3af] p-4 focus:ring-2 focus:ring-[#1193d4]"
          required
        />

        {/* ✅ Password field with inline icon (keeps full width) */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border-none bg-white dark:bg-[#1f2937] text-[#111827] dark:text-[#e5e7eb] placeholder-[#6b7280] dark:placeholder-[#9ca3af] p-4 pr-12 focus:ring-2 focus:ring-[#1193d4]"
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-4 flex items-center cursor-pointer text-[#6b7280] dark:text-[#9ca3af] hover:text-[#1193d4]"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1193d4] text-white font-bold py-3 rounded-lg hover:bg-[#0f82bd] transition-colors disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <a
          href={`/signup${roleFromQuery ? `?role=${roleFromQuery}` : ""}`}
          className="text-sm text-[#6b7280] dark:text-[#9ca3af] hover:text-[#1193d4] dark:hover:text-[#1193d4] underline transition-colors"
        >
          Don't have an account? Sign Up
        </a>
      </div>
    </div>
  );
};

export default LoginPage;
