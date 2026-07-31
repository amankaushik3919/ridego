"use client";

import { useRef, useState } from "react";
import { ChevronsRight, Loader2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToStartProps {
  onStart: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  loadingLabel?: string;
  variant?: "primary" | "destructive";
}

const THUMB_SIZE = 48;

export function SlideToStart({
  onStart,
  disabled,
  loading,
  label = "Slide to Start Ride",
  loadingLabel = "Starting ride...",
  variant = "primary",
}: SlideToStartProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [maxOffset, setMaxOffset] = useState(0);

  const measure = () => {
    const track = trackRef.current;
    if (track) setMaxOffset(track.clientWidth - THUMB_SIZE - 8);
  };

  const startDrag = (clientX: number) => {
    if (disabled || loading) return;
    measure();
    setDragging(true);
    update(clientX);
  };

  const update = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const max = rect.width - THUMB_SIZE - 8;
    const pos = Math.min(Math.max(clientX - rect.left - THUMB_SIZE / 2, 4), max);
    setMaxOffset(max);
    setOffset(pos);
  };

  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    if (offset >= maxOffset * 0.85) {
      setOffset(maxOffset);
      onStart();
    } else {
      setOffset(0);
    }
  };

  return (
    <div
      ref={trackRef}
      role="button"
      tabIndex={0}
      onMouseDown={(e) => startDrag(e.clientX)}
      onMouseMove={(e) => dragging && update(e.clientX)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchStart={(e) => {
        if (disabled || loading) return;
        e.preventDefault();
        startDrag(e.touches[0].clientX);
      }}
      onTouchMove={(e) => {
        if (!dragging) return;
        e.preventDefault();
        update(e.touches[0].clientX);
      }}
      onTouchEnd={endDrag}
      onTouchCancel={endDrag}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onStart();
        }
      }}
      className={cn(
        "relative flex h-14 w-full select-none items-center overflow-hidden rounded-full transition-colors",
        "[touch-action:none]",
        variant === "destructive"
          ? loading
            ? "bg-error/80"
            : "bg-error"
          : loading
            ? "bg-primary/80"
            : "bg-primary",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-white/20"
        style={{ width: `${offset}px` }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 font-title-md text-title-md font-semibold text-white">
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : variant === "destructive" ? (
          <LogOut className="size-5" />
        ) : (
          <ChevronsRight className="size-5" />
        )}
        {loading ? loadingLabel : label}
      </span>
      <div
        className="pointer-events-none absolute inset-y-1 flex w-12 items-center justify-center rounded-full bg-white shadow-md transition-[left] duration-75"
        style={{ left: `${offset}px` }}
      >
        {variant === "destructive" ? (
          <LogOut className="size-5 text-error" />
        ) : (
          <ChevronsRight className="size-6 text-primary" />
        )}
      </div>
    </div>
  );
}
