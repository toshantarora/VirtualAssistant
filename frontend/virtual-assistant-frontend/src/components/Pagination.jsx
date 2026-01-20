const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-6 text-sm">
      <p className="text-green-800">{`Page ${currentPage} of ${totalPages}`}</p>

      <div className="flex gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-full border px-4 py-1 text-gray-400"
        >
          Previous
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-full border border-green-700 px-4 py-1 text-green-700"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;

