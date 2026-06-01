"use client";

import {
  LiveKitRoom,
  VideoConference,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Link from "next/link";
import { useState } from "react";

type LiveKitCallRoomProps = {
  backHref: string;
  consultationId: string;
  disabledReason?: string;
  isEligible: boolean;
  role: "DOCTOR" | "PATIENT";
};

type CallSessionResponse = {
  error?: string;
  livekitUrl?: string;
  participantToken?: string;
};

type CallState = "idle" | "loading" | "joined" | "ended" | "error";

export function LiveKitCallRoom({
  backHref,
  consultationId,
  disabledReason,
  isEligible,
  role,
}: LiveKitCallRoomProps) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [joinInfo, setJoinInfo] = useState<{
    serverUrl: string;
    token: string;
  } | null>(null);

  const actionLabel = role === "DOCTOR" ? "Start video call" : "Join video call";
  const isStarting = callState === "loading";

  async function joinCall() {
    if (!isEligible || isStarting || callState === "joined") {
      return;
    }

    setCallState("loading");
    setError(null);

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

      if (!payload?.livekitUrl || !payload.participantToken) {
        setCallState("error");
        setError("Video provider returned incomplete join information.");
        return;
      }

      setJoinInfo({
        serverUrl: payload.livekitUrl,
        token: payload.participantToken,
      });
      setCallState("joined");
    } catch {
      setCallState("error");
      setError("Unable to start the video call.");
    }
  }

  function leaveCall() {
    setJoinInfo(null);
    setCallState("ended");
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Video consultation</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            LiveKit video call
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Join from a private LiveKit room with a short-lived server-issued
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-2">
        <div className="min-h-[28rem] rounded-xl bg-slate-900 sm:min-h-[36rem]">
          {joinInfo ? (
            <LiveKitRoom
              audio
              className="h-full min-h-[28rem] bg-slate-900 sm:min-h-[36rem]"
              connect
              data-lk-theme="default"
              onDisconnected={leaveCall}
              onError={() => {
                setJoinInfo(null);
                setCallState("error");
                setError(
                  "LiveKit could not start the call. Check camera and microphone permissions, then try again.",
                );
              }}
              onMediaDeviceFailure={() => {
                setError(
                  "Camera or microphone permission was blocked. Update browser permissions, then rejoin the call.",
                );
              }}
              screen={false}
              serverUrl={joinInfo.serverUrl}
              token={joinInfo.token}
              video
            >
              <VideoConference className="h-full min-h-[28rem] sm:min-h-[36rem]" />
              <style jsx global>{`
                .lk-video-conference .lk-chat,
                .lk-video-conference .lk-chat-toggle,
                .lk-video-conference .lk-button[data-lk-source="screen_share"] {
                  display: none;
                }
              `}</style>
            </LiveKitRoom>
          ) : (
            <div className="flex min-h-[28rem] flex-col items-center justify-center p-6 text-center sm:min-h-[36rem]">
              <div className="max-w-md rounded-xl border border-white/10 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">
                  Ready to connect
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  LiveKit will open inside this panel. Use the call controls to
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
          )}
        </div>
      </div>
    </section>
  );
}
