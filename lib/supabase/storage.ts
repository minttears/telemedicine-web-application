import "server-only";

import { createClient } from "@supabase/supabase-js";

export const CONSULTATION_ATTACHMENTS_BUCKET = "consultation-attachments";
export const PROFILE_IMAGES_BUCKET = "profile-images";

let storageClient: ReturnType<typeof createClient> | null = null;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for Supabase Storage.`);
  }

  return value;
}

function getSupabaseStorageClient(bucketName: string) {
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

  return storageClient.storage.from(bucketName);
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
  return getSupabaseStorageClient(CONSULTATION_ATTACHMENTS_BUCKET).upload(storagePath, body, {
    contentType,
    upsert: false,
  });
}

export async function downloadAttachmentObject(storagePath: string) {
  return getSupabaseStorageClient(CONSULTATION_ATTACHMENTS_BUCKET).download(storagePath);
}

export async function removeAttachmentObject(storagePath: string) {
  return getSupabaseStorageClient(CONSULTATION_ATTACHMENTS_BUCKET).remove([storagePath]);
}

export async function uploadProfileImageObject({
  body,
  contentType,
  storagePath,
}: {
  body: ArrayBuffer;
  contentType: string;
  storagePath: string;
}) {
  return getSupabaseStorageClient(PROFILE_IMAGES_BUCKET).upload(storagePath, body, {
    contentType,
    upsert: false,
  });
}

export async function downloadProfileImageObject(storagePath: string) {
  return getSupabaseStorageClient(PROFILE_IMAGES_BUCKET).download(storagePath);
}

export async function removeProfileImageObject(storagePath: string) {
  return getSupabaseStorageClient(PROFILE_IMAGES_BUCKET).remove([storagePath]);
}
