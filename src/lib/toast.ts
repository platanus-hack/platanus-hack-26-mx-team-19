import { toast as baseToast, type Id, type ToastOptions } from "react-toastify"

const defaults: ToastOptions = {
  autoClose: 4200,
  pauseOnHover: true,
  closeOnClick: false,
}

function merge(options?: ToastOptions): ToastOptions {
  return { ...defaults, ...options }
}

/**
 * App-wide toasts — styled via `toastify-theme.css` + `ToastContainer` in `providers.tsx`.
 * Prefer this over importing `toast` from `react-toastify` directly.
 */
export const toast = {
  error(content: string, options?: ToastOptions): Id {
    return baseToast.error(content, merge(options))
  },
  success(content: string, options?: ToastOptions): Id {
    return baseToast.success(content, merge(options))
  },
  info(content: string, options?: ToastOptions): Id {
    return baseToast.info(content, merge(options))
  },
  warning(content: string, options?: ToastOptions): Id {
    return baseToast.warning(content, merge(options))
  },
  dismiss: baseToast.dismiss,
  isActive: baseToast.isActive,
  update: baseToast.update,
  promise: baseToast.promise,
}
