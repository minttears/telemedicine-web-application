export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;

type AllowedAttachmentType = {
  extension: string;
  label: string;
  mimeType: string;
};

const ALLOWED_ATTACHMENT_TYPES: AllowedAttachmentType[] = [
  {
    extension: "pdf",
    label: "PDF",
    mimeType: "application/pdf",
  },
  {
    extension: "jpg",
    label: "JPG",
    mimeType: "image/jpeg",
  },
  {
    extension: "jpeg",
    label: "JPEG",
    mimeType: "image/jpeg",
  },
  {
    extension: "png",
    label: "PNG",
    mimeType: "image/png",
  },
  {
    extension: "docx",
    label: "DOCX",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

export type ValidatedAttachmentFile = {
  displayFileName: string;
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

export function formatFileSize(fileSize: number) {
  if (fileSize < 1024) {
    return `${fileSize} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${(fileSize / 1024).toFixed(1)} KB`;
  }

  return `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
}

export function sanitizeFileName(fileName: string) {
  const withoutPath = fileName.replace(/^.*[\\/]/, "");
  const withoutControlChars = withoutPath.replace(/[\x00-\x1F\x7F]/g, "");
  const normalizedWhitespace = withoutControlChars.replace(/\s+/g, " ").trim();
  const safeName = normalizedWhitespace || "attachment";

  return safeName.slice(0, 120);
}

export function validateAttachmentFile(file: File): {
  error?: string;
  value?: ValidatedAttachmentFile;
} {
  const displayFileName = sanitizeFileName(file.name);
  const extension = getExtension(displayFileName);
  const allowedType = ALLOWED_ATTACHMENT_TYPES.find(
    (type) => type.extension === extension,
  );

  if (!allowedType) {
    return {
      error: "File type must be PDF, JPG, JPEG, PNG, or DOCX.",
    };
  }

  if (file.type !== allowedType.mimeType) {
    return {
      error: "File type does not match the file extension.",
    };
  }

  if (file.size <= 0) {
    return {
      error: "File is required.",
    };
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return {
      error: `File must be ${formatFileSize(MAX_ATTACHMENT_SIZE_BYTES)} or smaller.`,
    };
  }

  return {
    value: {
      displayFileName,
      extension,
      fileSize: file.size,
      fileType: allowedType.mimeType,
    },
  };
}

export function getAttachmentTypeLabel(fileType: string) {
  return (
    ALLOWED_ATTACHMENT_TYPES.find((type) => type.mimeType === fileType)?.label ??
    "File"
  );
}
