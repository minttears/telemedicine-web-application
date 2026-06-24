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

  const actionLabel =
    role === "DOCTOR" ? "Начать видеозвонок" : "Присоединиться к видеозвонку";
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
        setError(payload?.error ?? "Не удалось подготовить видеозвонок.");
        return;
      }

      if (!payload?.livekitUrl || !payload.participantToken) {
        setCallState("error");
        setError("Сервис видеосвязи вернул неполные данные для подключения.");
        return;
      }

      setJoinInfo({
        serverUrl: payload.livekitUrl,
        token: payload.participantToken,
      });
      setCallState("joined");
    } catch {
      setCallState("error");
      setError("Не удалось начать видеозвонок.");
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
          <p className="text-sm font-medium text-teal-700">
            Онлайн-консультация
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">
            Видеозвонок LiveKit
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Подключитесь к защищённой комнате LiveKit. Браузер может запросить
            разрешение на использование камеры и микрофона.
          </p>
        </div>
        <Link
          className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-teal-700 hover:text-teal-700"
          href={backHref}
        >
          Вернуться к консультации
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
                  "LiveKit не удалось начать звонок. Проверьте разрешения камеры и микрофона, затем повторите попытку.",
                );
              }}
              onMediaDeviceFailure={() => {
                setError(
                  "Доступ к камере или микрофону заблокирован. Измените разрешения браузера и подключитесь снова.",
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
                  Готово к подключению
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  LiveKit откроется в этой панели. Используйте элементы
                  управления, чтобы включать и выключать микрофон и камеру или
                  выйти из звонка.
                </p>
                <button
                  className="mt-5 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  disabled={!isEligible || isStarting}
                  onClick={joinCall}
                  type="button"
                >
                  {callState === "loading"
                    ? "Подготовка звонка..."
                    : actionLabel}
                </button>
                {!isEligible && disabledReason ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {disabledReason}
                  </p>
                ) : null}
                {callState === "ended" ? (
                  <p className="mt-3 text-sm leading-6 text-teal-800">
                    Звонок завершён. Вы можете подключиться снова, пока доступно
                    время консультации.
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
