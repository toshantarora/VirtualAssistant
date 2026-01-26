import { Search, Plus } from "lucide-react";

const ManageUsersHeader = ({
  total,
  openAdd,
  search,
  onSearch,
  showAddUser = true,
  status = null,
}) => {
  return (
    <div className="flex flex-col gap-3 px-3 md:px-5 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base md:text-lg font-semibold">
        {status == "ACTIVE"
          ? "Active"
          : status === "INACTIVE"
          ? "Inactive"
          : "Total"}{" "}
        Users <span className="text-xs md:text-sm text-gray-500">({total} Total)</span>
      </h2>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-700" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full sm:w-64 rounded-full bg-[#f3f5f2] py-2 pl-10 pr-4 text-xs md:text-sm outline-none"
          />
        </div>

        {showAddUser && (
          <button
            onClick={() => openAdd()}
            className="flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2 md:px-5 text-xs md:text-sm font-medium text-white"
          >
            <Plus size={16} />
            Add User
          </button>
        )}
      </div>
    </div>
  );
};

export default ManageUsersHeader;
