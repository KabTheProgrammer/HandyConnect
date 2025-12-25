import Button from "./button";
import { X } from "lucide-react";

export const ExpandableChat = ({
  children,
  size = "md",
  position = "bottom-right",
}) => {
  const sizeClasses = {
    sm: "w-72 h-96",
    md: "w-80 h-[480px]",
    lg: "w-96 h-[540px]",
    xl: "w-[420px] h-[600px]",
    full: "w-full h-full rounded-none",
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div
      className={`
        fixed z-50 bg-white shadow-2xl border overflow-hidden
        rounded-2xl 
        ${sizeClasses[size]} 
        ${positionClasses[position]}

        /* 🟢 Mobile improvements */
        max-h-[85vh]
        w-[95vw]
        sm:w-auto sm:max-h-none
        sm:rounded-2xl
        rounded-t-2xl
      `}
    >
      {children}
    </div>
  );
};

export const ExpandableChatHeader = ({ children, className }) => (
  <div
    className={`
      p-4 border-b font-bold flex items-center justify-between
      bg-gray-100
      sticky top-0 z-10
      ${className}
    `}
  >
    {children}
  </div>
);

export const ExpandableChatBody = ({ children, className }) => (
  <div
    className={`
      flex-grow overflow-y-auto p-3
      max-h-[60vh]
      sm:max-h-none
      ${className}
    `}
  >
    {children}
  </div>
);

export const ExpandableChatFooter = ({ children, className }) => (
  <div
    className={`
      p-3 border-t flex items-center gap-2 bg-white
      sticky bottom-0 z-10
      ${className}
    `}
  >
    {children}
  </div>
);
