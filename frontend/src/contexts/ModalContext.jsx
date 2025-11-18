import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

/**
 * ModalProvider - Provides global modal state management
 * Wrap your app with this provider to enable modal functionality throughout
 */
export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    buttons: [],
    closeOnOverlayClick: true,
  });

  /**
   * Show a custom modal with any configuration
   * @param {Object} config - Modal configuration
   * @param {string} config.title - Modal title
   * @param {string} config.message - Modal message
   * @param {Array<{text: string, func: function, variant?: string}>} config.buttons - Button configurations
   * @param {boolean} config.closeOnOverlayClick - Whether clicking overlay closes modal
   */
  const showModal = (config) => {
    setModalState({
      isOpen: true,
      title: config.title || "",
      message: config.message || "",
      buttons: config.buttons || [],
      closeOnOverlayClick: config.closeOnOverlayClick !== undefined ? config.closeOnOverlayClick : true,
    });
  };

  /**
   * Show an alert modal with a single OK button
   * @param {string} message - Alert message
   * @param {string} title - Alert title (optional)
   */
  const showAlert = (message, title = "") => {
    showModal({
      title,
      message,
      buttons: [
        {
          text: "OK",
          func: () => {},
          variant: "primary"
        }
      ],
      closeOnOverlayClick: true,
    });
  };

  /**
   * Show a confirmation modal with Cancel and Confirm buttons
   * @param {string} message - Confirmation message
   * @param {string} title - Confirmation title (optional)
   * @param {function} onConfirm - Callback when user confirms
   * @param {function} onCancel - Callback when user cancels (optional)
   * @param {Object} options - Additional options
   * @param {string} options.confirmText - Text for confirm button (default: "Confirm")
   * @param {string} options.cancelText - Text for cancel button (default: "Cancel")
   * @param {string} options.confirmVariant - Variant for confirm button (default: "danger")
   */
  const showConfirm = (
    message,
    title = "",
    onConfirm,
    onCancel = null,
    options = {}
  ) => {
    const {
      confirmText = "Confirm",
      cancelText = "Cancel",
      confirmVariant = "danger"
    } = options;

    showModal({
      title,
      message,
      buttons: [
        {
          text: cancelText,
          func: onCancel || (() => {}),
        },
        {
          text: confirmText,
          func: onConfirm,
          variant: confirmVariant
        }
      ],
      closeOnOverlayClick: false, // Don't close on overlay click for confirms
    });
  };

  /**
   * Close the modal
   */
  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: "",
      message: "",
      buttons: [],
      closeOnOverlayClick: true,
    });
  };

  return (
    <ModalContext.Provider
      value={{
        modalState,
        showModal,
        showAlert,
        showConfirm,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

/**
 * useModal hook - Access modal functions from any component
 * @returns {Object} Modal context with showModal, showAlert, showConfirm, closeModal functions
 */
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
