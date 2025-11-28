"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

// Types
type ModalCallbacks = {
  onConfirm: () => void;
  onReject: () => void;
  onClose: () => void;
};

type ModalContentRenderer = (
  onConfirm: () => void,
  onReject: () => void,
  onClose: () => void
) => ReactNode;

type ModalContent = string | ModalContentRenderer;

export interface ModalOptions {
  header?: ModalContent;
  body?: ModalContent;
  footer?: ModalContent;
}

interface ModalState {
  isOpen: boolean;
  options: ModalOptions;
  onConfirm?: () => void;
  onReject?: () => void;
}

interface ModalContextType {
  showModal: (
    options: ModalOptions,
    onConfirm?: () => void,
    onReject?: () => void
  ) => void;
  closeModal: () => void;
}

// Context
const ModalContext = createContext<ModalContextType | null>(null);

// Hook
export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// Modal Component
interface ModalComponentProps {
  isOpen: boolean;
  options: ModalOptions;
  onConfirm: () => void;
  onReject: () => void;
  onClose: () => void;
}

function ModalComponent({
  isOpen,
  options,
  onConfirm,
  onReject,
  onClose,
}: ModalComponentProps) {
  if (!isOpen) return null;

  const renderContent = (content: ModalContent | undefined): ReactNode => {
    if (!content) return null;
    if (typeof content === "string") {
      return <span>{content}</span>;
    }
    return content(onConfirm, onReject, onClose);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        {options.header && (
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {renderContent(options.header)}
            </div>
          </div>
        )}

        {/* Body */}
        {options.body && (
          <div className="px-6 py-4 text-zinc-700 dark:text-zinc-300">
            {renderContent(options.body)}
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          {options.footer ? (
            renderContent(options.footer)
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={onReject}
                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              >
                취소
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Provider
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    options: {},
  });

  const showModal = useCallback(
    (options: ModalOptions, onConfirm?: () => void, onReject?: () => void) => {
      setModalState({
        isOpen: true,
        options,
        onConfirm,
        onReject,
      });
    },
    []
  );

  const closeModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    modalState.onConfirm?.();
    closeModal();
  }, [modalState.onConfirm, closeModal]);

  const handleReject = useCallback(() => {
    modalState.onReject?.();
    closeModal();
  }, [modalState.onReject, closeModal]);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}
      <ModalComponent
        isOpen={modalState.isOpen}
        options={modalState.options}
        onConfirm={handleConfirm}
        onReject={handleReject}
        onClose={closeModal}
      />
    </ModalContext.Provider>
  );
}
