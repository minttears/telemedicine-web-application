type ProfileImageProps = {
  alt: string;
  className?: string;
  initials: string;
  src?: string;
};

export function ProfileImage({
  alt,
  className = "h-16 w-16",
  initials,
  src,
}: ProfileImageProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Images are served through authorized API routes that require cookies.
      <img
        alt={alt}
        className={`${className} rounded-full border border-slate-200 object-cover`}
        src={src}
      />
    );
  }

  return (
    <div
      aria-label={alt}
      className={`${className} flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-500`}
    >
      {initials}
    </div>
  );
}
