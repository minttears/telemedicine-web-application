"use client";

import DailyIframe from "@daily-co/daily-js";
import type { DailyCall } from "@daily-co/daily-js";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

type DailyCallRoomProps = {
  backHref: string;
  consultationId: string;
  disabledReason?: string;
  isEligible: boolean;
  role: "DOCTOR" | "PATIENT";
};

type CallSessionResponse = {
  error?: string;
  meetingToken?: string;
  roomUrl?: string;
};

type CallState = "idle" | "loading" | "joining" | "joined" | "ended" | "error";

function isUnsupportedBrowser() {
  const support = DailyIframe.supportedBrowser();

  if (
    typeof support === "object" &&
    support !== null &&
    "supported" in support &&
    support.supported === false
  ) {
    return true;
  }

  return false;
}

export function DailyCallRoom({
  backHref,
  consultationId,
  disabledReason,
  isEligible,
  role,
}: DailyCallRoomProps) {
  const frameHostRef = useRef<HTMLDivElement | null>(null);
  const callFrameRef = useRef<DailyCall | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionLabel = role === "DOCTOR" ? "Start video call" : "Join video call";
  const isStarting =
    isPending || callState === "loading" || callState === "joining";

  function destroyCallFrame() {
    const callFrame = callFrameRef.current;
    callFrameRef.current = null;

    if (!callFrame) {
      return;
    }

    try {
      if (!callFrame.isDestroyed()) {
        void Promise.resolve(callFrame.destroy()).catch(() => null);
      }
    } catch {
      // Daily may already have removed its iframe during leave/error handling.
    }
  }

  useEffect(() => {
    return () => {
      destroyCallFrame();
    };
  }, []);

  function joinCall() {
    if (!isEligible || isStarting || callState === "joined") {
      return;
    }

    setError(null);

    if (isUnsupportedBrowser()) {
      setCallState("error");
      setError(
        "This browser does not support Daily video calls. Try a current desktop or mobile browser with camera and microphone support.",
      );
      return;
    }

    startTransition(async () => {
      setCallState("loading");

      try {
        const response = await fetch(
          `/api/consultations/${consultationId}/call/session`,
          { method: "POST" },
        );
        const payload = (await response.json().catch(() => null)) as
          | CallSessionResponse
          | null;

        if (!response.ok) {
          setCallState("error");
          setError(payload?.error ?? "Unable to prepare the video call.");
          return;
        }

        if (!payload?.roomUrl || !payload.meetingToken) {
          setCallState("error");
          setError("Video provider returned incomplete join information.");
          return;
        }

        const frameHost = frameHostRef.current;

        if (!frameHost) {
          setCallState("error");
          setError("Video call container is not available.");
          return;
        }

        destroyCallFrame();

        const callFrame = DailyIframe.createFrame(frameHost, {
          iframeStyle: {
            border: "0",
            borderRadius: "14px",
            height: "100%",
            width: "100%",
          },
          showLeaveButton: true,
        });

        callFrameRef.current = callFrame;
        callFrame.on("joined-meeting", () => setCallState("joined"));
        callFrame.on("left-meeting", () => {
          destroyCallFrame();
          setCallState("ended");
        });
        callFrame.on("error", () => {
          destroyCallFrame();
          setCallState("error");
          setError(
            "Daily could not start the call. Check camera and microphone permissions, then try again.",
          );
        });

        setCallState("joining");
        await callFrame.join({
          token: payload.meetingToken,
          url: payload.roomUrl,
        });
      } catch {
        destroyCallFrame();
        setCallState("error");
        setError("Unable to start the video call.");
      }
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Video consultation</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Daily video call
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Join from a private Daily room with a short-lived server-issued
            token. Your browser may ask for camera and microphone permission.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
          href={backHref}
        >
          Back to consultation
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-950 p-2">
        <div
          className="relative min-h-[28rem] overflow-hidden rounded-xl bg-slate-900 sm:min-h-[36rem]"
        >
          <div className="absolute inset-0" ref={frameHostRef} />
          {callState !== "joined" && callState !== "joining" ? (
            <div className="relative z-10 flex min-h-[28rem] flex-col items-center justify-center p-6 text-center sm:min-h-[36rem]">
              <div className="max-w-md rounded-xl border border-white/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Ready to connect
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Daily will open inside this panel. Use the Daily controls to
                  mute, turn the camera on or off, and leave the call.
                </p>
                <button
                  className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  disabled={!isEligible || isStarting}
                  onClick={joinCall}
                  type="button"
                >
                  {callState === "loading" ? "Preparing call..." : actionLabel}
                </button>
                {!isEligible && disabledReason ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {disabledReason}
                  </p>
                ) : null}
                {callState === "ended" ? (
                  <p className="mt-3 text-sm leading-6 text-teal-800">
                    The call has ended. You can rejoin while the consultation is
                    still eligible.
                  </p>
                ) : null}
                {error ? (
                  <p className="mt-3 text-sm leading-6 text-red-700">{error}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
