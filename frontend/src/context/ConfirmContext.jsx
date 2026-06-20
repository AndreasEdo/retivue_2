import { createContext, useContext, useState, useCallback, useRef } from 'react';

// useConfirm() -> async confirm({title, message, confirmText, danger}) => Promise<boolean>
const ConfirmContext = createContext(() => Promise.resolve(false));
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts = {}) => {
    setState({
      title: opts.title || 'Are you sure?',
      message: opts.message || 'Please confirm this action.',
      confirmText: opts.confirmText || 'Confirm',
      cancelText: opts.cancelText || 'Cancel',
      danger: !!opts.danger,
    });
    return new Promise((resolve) => { resolver.current = resolve; });
  }, []);

  const close = (val) => {
    setState(null);
    if (resolver.current) { resolver.current(val); resolver.current = null; }
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => close(false)} />
          <div className="relative bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${state.danger ? 'bg-red-50' : 'bg-blue-50'}`}>
                <span className={`material-symbols-outlined text-[20px] ${state.danger ? 'text-[#DC2626]' : 'text-[#2d3fe0]'}`}>
                  {state.danger ? 'warning' : 'help'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#f1f5f9]">{state.title}</h3>
                <p className="text-sm text-[#64748B] dark:text-[#94a3b8] mt-1">{state.message}</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] text-[#64748B] hover:bg-[#f2f4f6] transition-colors"
              >
                {state.cancelText}
              </button>
              <button
                onClick={() => close(true)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${
                  state.danger ? 'bg-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#2d3fe0] hover:bg-[#3748e7]'
                }`}
              >
                {state.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
