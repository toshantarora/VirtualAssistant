import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const StatusDialog = ({
  open,
  onClose,
  type = 'success', // "success" | "error"
  title,
  message,
  onConfirm, // 👈 NEW
}) => {
  const isSuccess = type === 'success';

  const handleClick = () => {
    if (isSuccess && onConfirm) {
      onConfirm(); // navigate
    } else {
      onClose(); // just close
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isSuccess ? (
              <CheckIcon className="h-6 w-6 text-green-600" />
            ) : (
              <XMarkIcon className="h-6 w-6 text-red-600" />
            )}
          </div>

          <DialogTitle className="mt-4 text-lg font-semibold">{title}</DialogTitle>

          <p className="mt-2 text-sm text-gray-600">{message}</p>

          <div className="mt-6">
            <button
              onClick={handleClick}
              className={`w-full rounded-md px-4 py-2 text-white transition ${
                isSuccess ? 'bg-primary hover:bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {isSuccess ? 'Go to Dashboard' : 'Cancel'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default StatusDialog;
