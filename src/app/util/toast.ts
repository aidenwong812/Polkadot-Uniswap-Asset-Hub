import { toast, ToastOptions } from "react-hot-toast";

interface DotAcpToast {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
}

const dotAcpToast: DotAcpToast = {
  success: (message, options) => {
    toast.success(message, options);
  },
  error: (message, options) => {
    toast.error(message, options);
  },
};

export default dotAcpToast;
