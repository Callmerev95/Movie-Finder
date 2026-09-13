import { toast } from '@/components/ui/toast'

export function toastInfo(title: string, description?: string) {
  toast.add({ type: 'info', title, description })
}

export function toastSuccess(title: string, description?: string) {
  toast.add({ type: 'success', title, description })
}

export function toastWithUndo(title: string, description: string, onUndo: () => void) {
  toast.add({
    type: 'info',
    title,
    description,
    timeout: 6000,
    actionProps: { children: 'Urungkan', onClick: onUndo },
  })
}
