import React, { useEffect } from "react";
import styles from "./Modal.module.css";

/**
 * Reusable Modal component with stained glass aesthetic
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} title - Modal title (optional)
 * @param {string} message - Modal message/content
 * @param {Array<{text: string, func: function, variant?: 'primary'|'danger'}>} buttons - Array of button configurations
 * @param {function} onClose - Callback when modal is closed (via X button or overlay click)
 * @param {boolean} closeOnOverlayClick - Whether clicking overlay closes modal (default: true)
 */
const Modal = ({
  isOpen,
  title,
  message,
  buttons = [],
  onClose,
  closeOnOverlayClick = true
}) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleButtonClick = (func) => {
    if (func) {
      func();
    }
    // Close modal after button action (unless the function itself prevents this)
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {!title && <div />} {/* Spacer for flex alignment */}
          {onClose && (
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>

        {message && (
          <div className={styles.content}>
            <p className={styles.message}>{message}</p>
          </div>
        )}

        {buttons.length > 0 && (
          <div className={styles.buttons}>
            {buttons.map((button, index) => (
              <button
                key={index}
                className={`${styles.button} ${button.variant ? styles[button.variant] : ''}`}
                onClick={() => handleButtonClick(button.func)}
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
