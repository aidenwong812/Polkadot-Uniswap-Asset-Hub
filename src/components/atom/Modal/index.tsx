import { FC, ReactNode, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import ModalCloseIcon from "../../../assets/img/modal-close-icon.svg?react";
import BackArrow from "../../../assets/img/back-arrow.svg?react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  onBack?: () => void | undefined;
}

const Modal: FC<ModalProps> = ({ isOpen, children, title, onClose, onBack }) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative z-10 transform overflow-hidden rounded-2xl border border-gray-10 bg-white p-[18px] shadow-modal-box-shadow">
                <div className="mb-[6px] flex items-center border-b border-b-gray-50 pb-[8px] pr-[24px] pt-[10px]">
                  {onBack ? (
                    <button className="flex justify-end" onClick={onBack}>
                      <BackArrow />
                    </button>
                  ) : null}

                  <div className="flex w-full justify-center font-unbounded-variable text-heading-6 leading-[120%]">
                    {title}
                  </div>
                  <button className="flex justify-end" onClick={onClose}>
                    <ModalCloseIcon />
                  </button>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
