export const MAX_PROFILE_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

type AllowedProfileImageType = {
  extension: string;
  mimeType: string;
};

const ALLOWED_PROFILE_IMAGE_TYPES: AllowedProfileImageType[] = [
  { extension: "jpg", mimeType: "image/jpeg" },
  { extension: "jpeg", mimeType: "image/jpeg" },
  { extension: "png", mimeType: "image/png" },
  { extension: "webp", mimeType: "image/webp" },
];

export type ValidatedProfileImage = {
  extension: string;
  fileSize: number;
  fileType: string;
};

function getExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return "";
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

export function formatProfileImageSize(fileSize: number) {
  if (fileSize < 1024) {
    return `${fileSize} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateProfileImageFile(file: File): {
  error?: string;
  value?: ValidatedProfileImage;
} {
  const allowedType = ALLOWED_PROFILE_IMAGE_TYPES.find(
    (type) => type.mimeType === file.type,
  );
  const extension = getExtension(file.name);

  if (!allowedType) {
    return { error: "Image must be a JPEG, PNG, or WEBP file." };
  }

  if (
    extension &&
    !ALLOWED_PROFILE_IMAGE_TYPES.some(
      (type) => type.extension === extension && type.mimeType === file.type,
    )
  ) {
    return { error: "Image extension does not match the file type." };
  }

  if (file.size <= 0) {
    return { error: "Image is required." };
  }

  if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
    return {
      error: `Image must be ${formatProfileImageSize(MAX_PROFILE_IMAGE_SIZE_BYTES)} or smaller.`,
    };
  }

  return {
    value: {
      extension: allowedType.extension === "jpeg" ? "jpg" : allowedType.extension,
      fileSize: file.size,
      fileType: allowedType.mimeType,
    },
  };
}
