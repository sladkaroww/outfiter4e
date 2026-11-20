"use client";

import { CloudUploadIcon, Dropzone, ImageIcon, XIcon } from "@yamada-ui/react";
import { useRef, type RefObject } from "react";
import { MAX_IMAGE_BYTES } from "@/lib/client-api";
import { COLORS } from "./index";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ImageDropzoneProps = {
  file?: File;
  onChange: (file: File | null) => void;
};

/** Yamada UI `Dropzone` configured for a single outfit image. */
export function ImageDropzone({ file, onChange }: ImageDropzoneProps) {
  const openRef = useRef<(() => void) | null>(null);

  return (
    <Dropzone.Root
      accept={ACCEPT}
      maxFiles={1}
      maxSize={MAX_IMAGE_BYTES}
      openRef={openRef as RefObject<() => void>}
      variant="dashed"
      minH="112px"
      rounded="2px"
      borderWidth="1px"
      borderColor="#bbb4aa"
      bg="rgba(246,243,238,.7)"
      p="3"
      onDropAccepted={(files) => onChange(files[0] ?? null)}
      onDropRejected={() => onChange(null)}
    >
      {file ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <ImageIcon style={{ width: 20, height: 20, color: COLORS.orange }} />
          <span style={{ color: "#39814d", fontSize: 12, fontWeight: 700 }}>Photo ready</span>
          <span
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 12,
            }}
          >
            {file.name}
          </span>
          <small style={{ color: COLORS.muted, fontFamily: "monospace", fontSize: 10, textTransform: "uppercase" }}>
            {formatBytes(file.size)}
          </small>
          <div className="upload-actions">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                openRef.current?.();
              }}
            >
              <CloudUploadIcon style={{ width: 14, height: 14 }} /> Change
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
            >
              <XIcon style={{ width: 14, height: 14 }} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <Dropzone.Idle>
          <div style={{ display: "grid", justifyItems: "center", gap: 3 }}>
            <CloudUploadIcon style={{ width: 22, height: 22, color: COLORS.orange }} />
            <Dropzone.Title fontSize="12.5px" fontWeight="700" color={COLORS.ink} textAlign="center">
              Drop a photo here
            </Dropzone.Title>
            <Dropzone.Description fontSize="10.5px" color={COLORS.muted} textAlign="center">
              or click to choose · up to 4 MB
            </Dropzone.Description>
          </div>
        </Dropzone.Idle>
      )}
    </Dropzone.Root>
  );
}

