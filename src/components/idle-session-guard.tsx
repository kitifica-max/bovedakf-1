"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { ClockIcon } from "@/components/icons";

const IDLE_MS = 2 * 60 * 1000;
const WARNING_MS = 30 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

export function IdleSessionGuard() {
  const [warning, setWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WARNING_MS / 1000);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setWarning(true);
      setSecondsLeft(WARNING_MS / 1000);
      countdownTimer.current = setInterval(() => {
        setSecondsLeft((s) => Math.max(0, s - 1));
      }, 1000);
      logoutTimer.current = setTimeout(() => {
        signOut({ redirectTo: "/login" });
      }, WARNING_MS);
    }, IDLE_MS);
  }, []);

  // While the warning is up, only the "Seguir conectado" click counts as a
  // response — ambient mouse movement over the page doesn't quietly dismiss it.
  const onActivity = useCallback(() => {
    setWarning((isWarning) => {
      if (isWarning) return isWarning;
      startIdleTimer();
      return isWarning;
    });
  }, [startIdleTimer]);

  useEffect(() => {
    startIdleTimer();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity));
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [onActivity, startIdleTimer]);

  function extendSession() {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    setWarning(false);
    startIdleTimer();
  }

  if (!warning) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="idle-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray/80 p-4 backdrop-blur-sm"
    >
      <div className="glass w-full max-w-sm rounded-2xl p-6 text-center">
        <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-danger/10 text-danger">
          <ClockIcon className="h-5 w-5" />
        </span>
        <h2 id="idle-title" className="mt-3 font-display text-xl font-semibold text-ink">
          ¿Seguís ahí?
        </h2>
        <p className="mt-1 text-sm text-ink-soft" aria-live="polite">
          Por inactividad, tu sesión se cerrará en{" "}
          <span className="font-semibold text-ink">{secondsLeft}s</span>.
        </p>
        <button
          onClick={extendSession}
          className="mt-4 w-full cursor-pointer rounded-full bg-ink px-4 py-3 text-sm font-medium text-gray transition hover:bg-ink/90"
        >
          Seguir conectado
        </button>
      </div>
    </div>
  );
}
