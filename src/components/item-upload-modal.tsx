"use client";

import { LoaderCircleIcon, WandSparklesIcon } from "@yamada-ui/react";
import { FormEvent, useState } from "react";
import { ApiError, errorMessage, identifyClothing, type IdentifiedItem } from "@/lib/client-api";
import { CLOTHING_TYPES } from "@/lib/clothing";
import { useAppState } from "./app-state";
import { AppField, AppInput, AppNativeSelect, AppTextarea, COLORS } from "./ui";
import { AppModal } from "./ui/app-modal";
import { GlowSubmit } from "./ui/glow-submit";
import { ImageDropzone } from "./ui/image-dropzone";

type AiStatus = "idle" | "loading" | "done" | "error" | "unconfigured";

export function ItemUploadModal({ onClose }: { onClose: () => void }) {
  const { addItem } = useAppState();
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(CLOTHING_TYPES[0]);
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [aiError, setAiError] = useState("");

  function applySuggestion(suggestion: IdentifiedItem) {
    setName(suggestion.name);
    setType(suggestion.type || CLOTHING_TYPES[0]);
    setColor(suggestion.color);
    setDescription(suggestion.description);
  }

  async function runAi(nextFile: File) {
    setAiStatus("loading");
    setAiError("");
    try {
      applySuggestion(await identifyClothing(nextFile));
      setAiStatus("done");
    } catch (aiFailure) {
      if (aiFailure instanceof ApiError && aiFailure.code === "ai_not_configured") {
        setAiStatus("unconfigured");
        setAiError([aiFailure.message, aiFailure.hint].filter(Boolean).join(" "));
      } else {
        setAiStatus("error");
        setAiError(errorMessage(aiFailure));
      }
    }
  }

  function handleFile(next: File | null) {
    setFile(next ?? undefined);
    setPreview(next ? URL.createObjectURL(next) : "");
    setAiStatus("idle");
    setAiError("");
    if (next) void runAi(next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Add a photo of the piece — we cannot show it in your wardrobe without one.");
      return;
    }
    if (!name.trim()) {
      setError("Give the piece a name.");
      return;
    }

    setSaving(true);
    try {
      await addItem(
        {
          name: name.trim(),
          type,
          color: color.trim(),
          description: description.trim(),
        },
        file,
      );
      onClose();
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppModal
      open
      onClose={onClose}
      eyebrow="MY WARDROBE"
      title="Add a piece"
      description="The photo goes to Neon Object Storage and the data to Postgres."
    >
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.ink }}>Photo</label>
          <ImageDropzone file={file} onChange={handleFile} />

          {file && aiStatus === "loading" && (
            <p className="ai-hint">
              <LoaderCircleIcon className="ai-spin" style={{ width: 14, height: 14 }} />
              AI is identifying the piece…
            </p>
          )}
          {file && aiStatus === "done" && (
            <p className="ai-hint ai-hint-done">
              <WandSparklesIcon style={{ width: 14, height: 14 }} />
              AI filled the fields.
              <button type="button" onClick={() => void runAi(file)}>Fill again</button>
            </p>
          )}
          {file && aiStatus === "error" && (
            <p className="ai-hint ai-hint-error">
              {aiError}
              <button type="button" onClick={() => void runAi(file)}>Try again</button>
            </p>
          )}
          {file && aiStatus === "unconfigured" && (
            <p className="ai-hint">{aiError || "AI recognition is not configured."}</p>
          )}
        </div>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Photo preview" className="upload-preview" />
        )}

        <AppField label="Name" required>
          <AppInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Vintage shirt"
            required
            maxLength={120}
          />
        </AppField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <AppField label="Type">
            <AppNativeSelect value={type} onChange={(event) => setType(event.target.value)} required>
              {CLOTHING_TYPES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </AppNativeSelect>
          </AppField>
          <AppField label="Color">
            <AppInput
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="Black"
              maxLength={60}
            />
          </AppField>
        </div>

        <AppField label="Description">
          <AppTextarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your piece..."
            rows={3}
            maxLength={600}
          />
        </AppField>

        {error && <p className="upload-error" role="alert">{error}</p>}

        <GlowSubmit loading={saving} idleLabel="Save to wardrobe" loadingLabel="Saving…" />
      </form>
    </AppModal>
  );
}
