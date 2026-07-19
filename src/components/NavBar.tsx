import { useNavigate } from "react-router-dom";

export function NavBar() {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="max-w-full mx-auto px-4 py-2 flex items-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </button>
      </div>
    </nav>
  );
}
