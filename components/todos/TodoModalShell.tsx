//  Modal 外殼元件，提供底部滑入的彈出視窗結構，包含背景遮罩、滑入動畫、標題列與關閉按鈕，供 AddTodoModal 和 TodoDetailModal 共用
'use client'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function TodoModalShell({ open, onClose, title, children }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-[60] mx-auto w-full max-w-sm rounded-t-3xl bg-zinc-900 p-6 text-white shadow-2xl transition-transform
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-400">
            {title}
          </p>
          <button type="button" className="text-zinc-400 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>

        {children}
      </div>
    </>
  )
}