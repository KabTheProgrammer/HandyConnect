import { Link, useLocation } from "react-router-dom";
import { CiHome } from "react-icons/ci";
import { MdOutlinePersonOutline } from "react-icons/md";
import { LuMessageSquare } from "react-icons/lu";
import { HiOutlineBriefcase } from "react-icons/hi";
import { useSelector } from "react-redux";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const isProvider = user?.userType === "provider";

  const isActive = (path) => location.pathname === path;

  // Dynamic routing based on user type
  const homePath = isProvider ? "/provider-home" : "/customer-home";
  const profilePath = isProvider ? "/provider/profile" : "/customer/profile";
  const jobsPath = isProvider ? "/provider-jobs" : "/customer-jobs";

  // 👇 BOTH provider & customer go to the same chats list
  const messagesPath = "/chat"; // <-- use /chats list page

  const navItems = [
    { to: homePath, label: "Home", icon: <CiHome /> },
    { to: jobsPath, label: "Jobs", icon: <HiOutlineBriefcase /> },
    { to: messagesPath, label: "Chats", icon: <LuMessageSquare /> },
    { to: profilePath, label: "Profile", icon: <MdOutlinePersonOutline /> },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-[0_-2px_6px_rgba(0,0,0,0.05)] z-50">
      <nav className="flex justify-between items-center max-w-md mx-auto px-6 py-2 sm:px-8">
        {navItems.map(({ to, label, icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center flex-1 transition-all duration-150 ${
                active
                  ? "text-[#0099E6] font-semibold"
                  : "text-gray-500 hover:text-[#0099E6]"
              }`}
            >
              <span className="text-2xl mb-0.5">{icon}</span>
              <span className="text-[11px] sm:text-xs">{label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default BottomNav;
