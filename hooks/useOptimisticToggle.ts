import { useState } from "react";

// For like/save/follow buttons: flips the button and count straight away,
// runs the add/remove call, and undoes both if it fails.
// setActive/setCount let the caller fill in the real values after loading.
export function useOptimisticToggle(
  initialActive: boolean,
  initialCount: number,
  onAdd: () => Promise<void>,
  onRemove: () => Promise<void>,
) {
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);

  const toggle = async () => {
    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));
    try {
      if (wasActive) await onRemove();
      else await onAdd();
    } catch (err) {
      console.error("Optimistic toggle failed:", err);
      setActive(wasActive);
      setCount((c) => (wasActive ? c + 1 : c - 1));
    }
  };

  return { active, count, setActive, setCount, toggle };
}
