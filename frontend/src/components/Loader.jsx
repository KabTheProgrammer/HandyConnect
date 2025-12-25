import { Loader2 } from "lucide-react";

const Loader = ({ text = "Loading...", size = 24 }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center text-gray-600">
      <Loader2 className="animate-spin text-[#0099E6]" size={size} />
      {text && <p className="mt-2 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default Loader;
