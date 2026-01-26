import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

const DeleteUserModal = ({ isOpen, onClose, onDelete, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-xl">
        {/* Close Icon */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 disabled:opacity-50"
        >
          <X size={22} />
        </button>

        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">Delete User</h3>
            <p className="mt-3 text-lg text-gray-600">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full border border-gray-300 px-8 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-red-500 px-10 py-3 text-lg font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;
