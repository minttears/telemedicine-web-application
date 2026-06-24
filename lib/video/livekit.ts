import "server-only";

import type { UserRole } from "@prisma/client";
import { AccessToken, TrackSource } from "livekit-server-sdk";

type LiveKitConfig = {
  apiKey: string;
  apiSecret: string;
  url: string;
};

type LiveKitSuccess<T> = {
  data: T;
  ok: true;
};

type LiveKitFailure = {
  error: string;
  ok: false;
};

type LiveKitResult<T> = LiveKitSuccess<T> | LiveKitFailure;

export type LiveKitParticipantToken = {
  token: string;
  url: string;
};

function getLiveKitConfig(): LiveKitResult<LiveKitConfig> {
  if (process.env.VIDEO_PROVIDER !== "livekit") {
    return { error: "Сервис видеосвязи не настроен.", ok: false };
  }

  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  const url = process.env.LIVEKIT_URL?.trim();

  if (!apiKey || !apiSecret || !url) {
    return { error: "Сервис видеосвязи не настроен.", ok: false };
  }

  return {
    data: {
      apiKey,
      apiSecret,
      url,
    },
    ok: true,
  };
}

export async function createLiveKitParticipantToken({
  expiresAt,
  roomName,
  userId,
  userName,
  userRole,
}: {
  expiresAt: Date;
  roomName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
}): Promise<LiveKitResult<LiveKitParticipantToken>> {
  const config = getLiveKitConfig();

  if (!config.ok) {
    return config;
  }

  const ttlSeconds = Math.max(
    1,
    Math.floor((expiresAt.getTime() - Date.now()) / 1000),
  );
  const token = new AccessToken(config.data.apiKey, config.data.apiSecret, {
    identity: `${userRole}:${userId}`,
    name: userName,
    ttl: ttlSeconds,
  });

  token.addGrant({
    canPublish: true,
    canPublishData: false,
    canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
    canSubscribe: true,
    room: roomName,
    roomJoin: true,
  });

  return {
    data: {
      token: await token.toJwt(),
      url: config.data.url,
    },
    ok: true,
  };
}
