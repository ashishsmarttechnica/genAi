// Import Dependencies
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import PropTypes from "prop-types";
import clsx from "clsx";

// Local Imports
import { Button } from "components/ui";
import { XMarkIcon } from "@heroicons/react/24/outline";

// ----------------------------------------------------------------------

export function ActionModal({ 
    show, 
    onClose, 
    onConfirm, 
    loading = false, 
    title, 
    description, 
    confirmText = "Confirm", 
    confirmColor = "primary",
    children,
    disabled = false
}) {

  return (
    <Transition
      appear
      show={show}
      as={Dialog}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
      onClose={onClose}
    >
      <TransitionChild
        as="div"
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute inset-0 bg-gray-900/50 transition-opacity dark:bg-black/40"
      />

      <TransitionChild
        as={DialogPanel}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
        className={clsx(
          "scrollbar-sm relative flex w-full max-w-lg flex-col overflow-y-auto rounded-lg bg-white px-4 py-6 transition-all duration-300 dark:bg-dark-700 sm:px-5",
        )}
      >
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-100 uppercase tracking-wider">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="group rounded-full p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-dark-600"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:text-dark-300 dark:group-hover:text-dark-100" />
            </button>
          </div>
          
          {description && (
            <p className="text-gray-500 dark:text-dark-300">
                {description}
            </p>
          )}

          {children}

          <div className="mt-4 flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outlined"
              className="h-9 min-w-28"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              color={confirmColor}
              className="h-9 min-w-28"
              disabled={loading || disabled}
            >
              {loading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </TransitionChild>
    </Transition>
  );
}

ActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmText: PropTypes.string,
  confirmColor: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool
};
