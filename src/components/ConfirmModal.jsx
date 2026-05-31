export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, danger = true }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {danger && (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          )}
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {message && <p className="text-sm text-gray-500 mt-0.5">{message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
