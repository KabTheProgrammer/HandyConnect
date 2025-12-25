import { useNavigate } from "react-router-dom";
import { User, Wrench } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setLoginRole } from "../features/auth/authSlice"; // ✅ import this

const AuthChoice = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      const dest = user.userType === "provider" ? "/provider-home" : "/customer-home";
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);

  const handleNavigate = (role) => {
    dispatch(setLoginRole(role)); // ✅ save to Redux + localStorage
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-6 font-display bg-[#f6f7f8] dark:bg-[#101c22] text-slate-800 dark:text-slate-200">
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-[#0f172a] dark:text-white">Join HandyConnect</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Choose your path to get started.</p>
        </header>

        <main className="w-full max-w-sm space-y-4">
          <button
            onClick={() => handleNavigate("customer")}
            className="w-full flex items-center justify-center gap-3 text-lg font-bold text-white bg-[#1193d4] py-4 px-6 rounded-xl shadow-md hover:bg-[#0f82bd] active:scale-95 transition-all duration-200"
          >
            <User className="w-5 h-5" />
            <span>Continue as Customer</span>
          </button>

          <button
            onClick={() => handleNavigate("provider")}
            className="w-full flex items-center justify-center gap-3 text-lg font-bold text-[#1193d4] bg-[#d4effb] dark:bg-[#1a2e38] py-4 px-6 rounded-xl hover:bg-[#c3e5f7] dark:hover:bg-[#213b46] active:scale-95 transition-all duration-200"
          >
            <Wrench className="w-5 h-5" />
            <span>Continue as Provider</span>
          </button>
        </main>
      </div>

      <footer className="text-center pb-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          By continuing, you agree to our{" "}
          <a href="#" className="font-semibold text-[#1193d4] hover:underline transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold text-[#1193d4] hover:underline transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </footer>
    </div>
  );
};

export default AuthChoice;
