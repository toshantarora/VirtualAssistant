import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

const Notification = ({ show, setShow, success = true, title, message }) => {
  if (!show) return null;
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <Transition
          show={show}
          as={Fragment}
          enter="transform ease-out duration-300 transition"
          enterFrom="translate-y-2 opacity-0 sm:translate-x-2 sm:translate-y-0"
          enterTo="translate-y-0 opacity-100 sm:translate-x-0"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg outline outline-1 outline-black/5">
            <div className="p-4">
              <div className="flex items-start">
                {/* Icon */}
                <div className="shrink-0">
                  {success ? (
                    <CheckCircleIcon className="size-6 text-green-400" />
                  ) : (
                    <XCircleIcon className="size-6 text-red-400" />
                  )}
                </div>

                {/* Text */}
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{title}</p>
                  <p className="mt-1 text-sm text-gray-500">{message}</p>
                </div>

                {/* Close */}
                <div className="ml-4 flex shrink-0">
                  <button
                    type="button"
                    onClick={() => setShow(false)}
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default Notification;
