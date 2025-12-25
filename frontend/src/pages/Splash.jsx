import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/auth-choice"); // Navigate to login/register screen
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-6 font-[Work_Sans]">
      {/* Animated Icon */}
      <div className="flex flex-col items-center mb-8">
        <svg
          className="h-24 w-24 text-sky-500 mb-4 animate-spin-slow"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 4.5v3m0 9v3m-4.5-4.5h-3m15 0h-3m-6.75-6.75l-2.122-2.121m12.724 0l-2.12 2.12m-8.486 8.486l-2.12 2.12m12.724 0l-2.122-2.121M12 18a6 6 0 100-12 6 6 0 000 12z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
          HandyConnect
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xs">
          Connecting you with trusted local service providers.
        </p>
      </div>
    </div>
  );
}
