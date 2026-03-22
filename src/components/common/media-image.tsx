"use client";

import { convertToProxiedUrl } from "@/lib/google-drive-client";

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * Image component that automatically handles Google Drive URLs
 * Converts Google Drive URLs to proxied URLs to bypass CORS issues
 */
export function MediaImage({ src, alt, ...props }: MediaImageProps) {
  const proxiedSrc = convertToProxiedUrl(src);

  return (
    <img
      {...props}
      src={proxiedSrc}
      alt={alt}
      onError={(e) => {
        // Fallback to original URL if proxy fails
        const target = e.target as HTMLImageElement;
        if (target.src !== src) {
          target.src = src;
        }
      }}
    />
  );
}
