import "server-only";

import { createClient } from "@supabase/supabase-js";

export const CONSULTATION_ATTACHMENTS_BUCKET = "consultation-attachments";

let storageClient: ReturnType<typeof createClient> | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Supabase Storage.`);
  }

  return value;
}

export function getSupabaseStorageClient() {
  if (!storageClient) {
    storageClient = createClient(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return storageClient.storage.from(CONSULTATION_ATTACHMENTS_BUCKET);
}

export async function uploadAttachmentObject({
  body,
  contentType,
  storagePath,
}: {
  body: ArrayBuffer;
  contentType: string;
  storagePath: string;
}) {
  return getSupabaseStorageClient().upload(storagePath, body, {
    contentType,
    upsert: false,
  });
}

export async function downloadAttachmentObject(storagePath: string) {
  return getSupabaseStorageClient().download(storagePath);
}

export async function removeAttachmentObject(storagePath: string) {
  return getSupabaseStorageClient().remove([storagePath]);
}
