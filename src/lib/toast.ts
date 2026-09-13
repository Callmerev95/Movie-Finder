import { toast } from '@/components/ui/toast'
import { translate, type Language } from './i18n/dict'
import type { StringKey } from './i18n/id'

let lang: Language = 'id'
export function setToastLanguage(l: Language) {
  lang = l
}
const tr = (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars)

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
    actionProps: { children: tr('common.undo'), onClick: onUndo },
  })
}
