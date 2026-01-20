import { Search, Plus } from "lucide-react";

const ManageUsersHeader = ({  total, openAdd , search, onSearch }) => {
  return (
    <div className="flex flex-col px-4 gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-lg font-semibold">
        Manage Users{" "}
        <span className="text-sm text-gray-500">({total} Total)</span>
      </h2>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-700" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-64 rounded-full bg-[#f3f5f2] py-2 pl-10 pr-4 text-sm outline-none"
          />
        </div>

        <button  onClick={() => openAdd()} className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-medium text-white">
          <Plus size={16} />
          Add User
        </button>
      </div>
    </div>
  );
};

export default ManageUsersHeader;

