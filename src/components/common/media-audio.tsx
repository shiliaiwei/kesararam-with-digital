"use client";

import { convertToProxiedUrl } from "@/lib/google-drive-client";

interface MediaAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  src: string;
}

/**
 * Audio component that automatically handles Google Drive URLs
 * Converts Google Drive URLs to proxied URLs to bypass CORS issues
 */
export function MediaAudio({ src, ...props }: MediaAudioProps) {
  const proxiedSrc = convertToProxiedUrl(src);

  return (
    <audio
      {...props}
      src={proxiedSrc}
      onError={(e) => {
        // Fallback to original URL if proxy fails
        const target = e.target as HTMLAudioElement;
        if (target.src !== src) {
          target.src = src;
        }
      }}
    />
  );
}
