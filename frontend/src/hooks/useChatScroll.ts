import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 100;

/** Scroll hanya di dalam container chat — tidak menggeser halaman. */
export function useChatScroll<T>(messages: T[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const prevCountRef = useRef(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
  }, []);

  useEffect(() => {
    const count = messages.length;
    const grew = count > prevCountRef.current;
    prevCountRef.current = count;

    if (count === 0) return;
    if (grew && nearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  }, [messages, scrollToBottom]);

  const scrollToBottomAfterSend = useCallback(() => {
    nearBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom("smooth"));
  }, [scrollToBottom]);

  return { containerRef, onScroll, scrollToBottomAfterSend };
}
