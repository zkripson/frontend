import { useLayoutEffect, useState, RefObject } from "react";

type Bounds = { top: number; left: number; right: number; bottom: number };

export function useContainerBounds(
  containerRef: RefObject<HTMLElement | null>,
  elementRef: RefObject<HTMLElement | null>
): Bounds | null {
  const [bounds, setBounds] = useState<Bounds | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = elementRef.current;
    if (!container || !el) return;

    const { clientWidth: cw, clientHeight: ch } = container;
    const { offsetWidth: ew, offsetHeight: eh } = el;

    setBounds({
      top: 0,
      left: 0,
      right: Math.max(0, cw - ew),
      bottom: Math.max(0, ch - eh),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current, elementRef.current]);

  return bounds;
}
