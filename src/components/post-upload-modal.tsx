"use client";

import { FormEvent, useState } from "react";
import { errorMessage } from "@/lib/client-api";
import { DEFAULT_POST_CATEGORY, POST_CATEGORIES } from "@/lib/categories";
import { useAppState } from "./app-state";
import { AppField, AppInput, AppNativeSelect, AppTag, COLORS } from "./ui";
import { AppModal } from "./ui/app-modal";
import { GlowSubmit } from "./ui/glow-submit";
import { ImageDropzone } from "./ui/image-dropzone";

const MAX_TAGGED_ITEMS = 8;

export function PostUploadModal({ onClose }: { onClose: () => void }) {
  const { addPost, items } = useAppState();
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");
  const [category, setCategory] = useState<string>(DEFAULT_POST_CATEGORY);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleFile(next: File | null) {
    setFile(next ?? undefined);
    setPreview(next ? URL.createObjectURL(next) : "");
  }

  function toggleItem(id: string) {
    setSelectedItems((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length >= MAX_TAGGED_ITEMS
          ? current
          : [...current, id],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Add a photo of the outfit.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) {
      setError("Give the outfit a title.");
      return;
    }

    setSaving(true);
    try {
      await addPost(
        { title, category, location: String(form.get("location") || "").trim() },
        file,
        selectedItems,
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
      eyebrow="SHARE YOUR FIT"
      title="Share an outfit"
      description="Show the community what you are wearing today — the post is saved to the database."
    >
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.ink }}>Photo</label>
          <ImageDropzone file={file} onChange={handleFile} />
        </div>

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Outfit preview" className="upload-preview" />
        )}

        <AppField label="Title" required>
          <AppInput name="title" placeholder="e.g. Sunday layers" required maxLength={120} />
        </AppField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <AppField label="Category">
            <AppNativeSelect value={category} onChange={(event) => setCategory(event.target.value)}>
              {POST_CATEGORIES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </AppNativeSelect>
          </AppField>
          <AppField label="Location">
            <AppInput name="location" placeholder="Sofia" maxLength={120} />
          </AppField>
        </div>

        <div style={{ display: "grid", gap: 5 }}>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.ink }}>Pieces from your wardrobe</label>
          {items.length === 0 ? (
            <p className="modal-hint">Your wardrobe is empty. Add pieces to tag them on the outfit.</p>
          ) : (
            <div className="item-picker">
              {items.slice(0, 24).map((item) => {
                const selected = selectedItems.includes(item.id);
                return (
                  <button
                    type="button"
                    className="chip-button"
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    aria-pressed={selected}
                  >
                    <AppTag
                      cursor="pointer"
                      bg={selected ? COLORS.orange : "transparent"}
                      color={selected ? "#fff" : COLORS.muted}
                      borderColor={selected ? COLORS.orange : COLORS.line}
                      fontWeight={selected ? 600 : 400}
                    >
                      {selected ? "✓ " : ""}{item.name}
                    </AppTag>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="upload-error" role="alert">{error}</p>}

        <GlowSubmit loading={saving} idleLabel="Publish outfit" loadingLabel="Publishing…" />
      </form>
    </AppModal>
  );
}
