import { useCallback, useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

type ConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

// A drop-in replacement for the system Alert that renders the app's own
// ConfirmModal. Because ConfirmModal is a local absolute overlay (not a native
// <Modal>), it shows correctly even on screens that are themselves presented as
// native modals — where a root-level dialog would be hidden behind them.
//
// Usage:
//   const { alert, confirm, confirmHost } = useConfirm();
//   alert("Heads up", "Something happened");                 // single OK
//   confirm({ title, message, confirmLabel, cancelLabel, onConfirm }); // choice
//   ...return (<View>...{confirmHost}</View>)
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmState) => setState(opts), []);

  const alert = useCallback(
    (title: string, message: string) => setState({ title, message }),
    [],
  );

  const confirmHost = (
    <ConfirmModal
      visible={!!state}
      title={state?.title ?? ""}
      message={state?.message ?? ""}
      confirmLabel={state?.confirmLabel ?? "OK"}
      cancelLabel={state?.cancelLabel}
      onConfirm={() => {
        const cb = state?.onConfirm;
        setState(null);
        cb?.();
      }}
      onCancel={state?.cancelLabel ? () => setState(null) : undefined}
    />
  );

  return { alert, confirm, confirmHost };
}
