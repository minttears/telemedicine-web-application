import "server-only";

const DEFAULT_DAILY_API_BASE_URL = "https://api.daily.co/v1";

type DailyConfig = {
  apiBaseUrl: string;
  apiKey: string;
};

type DailySuccess<T> = {
  data: T;
  ok: true;
};

type DailyFailure = {
  error: string;
  ok: false;
  status?: number;
};

type DailyResult<T> = DailySuccess<T> | DailyFailure;

type DailyRoomResponse = {
  name?: unknown;
  url?: unknown;
};

type DailyTokenResponse = {
  token?: unknown;
};

export type DailyRoom = {
  name: string;
  url: string;
};

export type DailyMeetingToken = {
  token: string;
};

function getDailyConfig(): DailyResult<DailyConfig> {
  if (process.env.VIDEO_PROVIDER && process.env.VIDEO_PROVIDER !== "daily") {
    return { error: "Video provider is not configured.", ok: false };
  }

  const apiKey = process.env.DAILY_API_KEY?.trim();

  if (!apiKey) {
    return { error: "Video provider is not configured.", ok: false };
  }

  const apiBaseUrl =
    process.env.DAILY_API_BASE_URL?.trim() || DEFAULT_DAILY_API_BASE_URL;

  return {
    data: {
      apiBaseUrl: apiBaseUrl.replace(/\/$/, ""),
      apiKey,
    },
    ok: true,
  };
}

async function dailyRequest<T>({
  body,
  path,
}: {
  body: Record<string, unknown>;
  path: string;
}): Promise<DailyResult<T>> {
  const config = getDailyConfig();

  if (!config.ok) {
    return config;
  }

  let response: Response;

  try {
    response = await fetch(`${config.data.apiBaseUrl}${path}`, {
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${config.data.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  } catch {
    return { error: "Video provider request failed.", ok: false };
  }

  if (!response.ok) {
    return {
      error: "Video provider request failed.",
      ok: false,
      status: response.status,
    };
  }

  const data = (await response.json().catch(() => null)) as T | null;

  if (!data) {
    return { error: "Video provider returned an invalid response.", ok: false };
  }

  return { data, ok: true };
}

export async function createDailyPrivateRoom({
  expiresAt,
  roomName,
}: {
  expiresAt: Date;
  roomName: string;
}): Promise<DailyResult<DailyRoom>> {
  const result = await dailyRequest<DailyRoomResponse>({
    body: {
      name: roomName,
      privacy: "private",
      properties: {
        enable_chat: false,
        enable_recording: "off",
        enable_screenshare: false,
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
    },
    path: "/rooms",
  });

  if (!result.ok) {
    return result;
  }

  const { name, url } = result.data;

  if (typeof name !== "string" || typeof url !== "string") {
    return { error: "Video provider returned an invalid room.", ok: false };
  }

  return {
    data: {
      name,
      url,
    },
    ok: true,
  };
}

export async function createDailyMeetingToken({
  expiresAt,
  isOwner,
  roomName,
  userId,
  userName,
}: {
  expiresAt: Date;
  isOwner: boolean;
  roomName: string;
  userId: string;
  userName: string;
}): Promise<DailyResult<DailyMeetingToken>> {
  const result = await dailyRequest<DailyTokenResponse>({
    body: {
      properties: {
        exp: Math.floor(expiresAt.getTime() / 1000),
        is_owner: isOwner,
        room_name: roomName,
        user_id: userId,
        user_name: userName,
      },
    },
    path: "/meeting-tokens",
  });

  if (!result.ok) {
    return result;
  }

  if (typeof result.data.token !== "string") {
    return { error: "Video provider returned an invalid token.", ok: false };
  }

  return {
    data: {
      token: result.data.token,
    },
    ok: true,
  };
}
