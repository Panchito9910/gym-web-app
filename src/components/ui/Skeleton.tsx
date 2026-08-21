import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  rounded?: boolean;
}

export function Skeleton({
  height = "1rem",
  width = "100%",
  rounded = false,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("skeleton-shimmer", rounded && "rounded-full", className)}
      style={{ height, width, ...style }}
      {...props}
    />
  );
}
