"use client";

import {
  AlertRoot,
  Card,
  EmptyState,
  Heading,
  Image,
  ShirtIcon,
  Text,
  TrashIcon,
} from "@yamada-ui/react";
import { useMemo, useState } from "react";
import { errorMessage } from "@/lib/client-api";
import { useAppState } from "./app-state";
import { DatabaseStatusBanner } from "./database-status-banner";
import { ItemUploadModal } from "./item-upload-modal";
import { PostUploadModal } from "./post-upload-modal";
import { SearchBar } from "./search-bar";
import { AppButton, AppChip, AppIconButton, AppSkeleton, COLORS } from "./ui";
import { UploadMenu } from "./upload-menu";

export function WardrobeView() {
  const { items, deleteItem, status, error, refresh } = useAppState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [retrying, setRetrying] = useState(false);

  const categories = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.type)))], [items]);
  const suggestions = useMemo(
    () => Array.from(new Set(items.flatMap((item) => [item.name, item.type]))).filter(Boolean),
    [items],
  );
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (category === "All" || item.type === category) &&
          `${item.name} ${item.type} ${item.color} ${item.description}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, items, query],
  );

  const loading = status === "loading" || status === "idle";

  async function handleDelete(id: string) {
    setDeletingId(id);
    setActionError("");
    try {
      await deleteItem(id);
      setConfirmId(null);
    } catch (deleteFailure) {
      setActionError(errorMessage(deleteFailure));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      await refresh();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <>
      <DatabaseStatusBanner />

      <div className="feed-toolbar">
        <div>
          <p className="eyebrow">PRIVATE SPACE</p>
          <h1>My wardrobe</h1>
          <p className="toolbar-copy">
            {status === "ready"
              ? `${items.length} ${items.length === 1 ? "piece" : "pieces"} in your digital wardrobe`
              : "Your digital wardrobe"}
          </p>
        </div>
        <div className="quick-actions">
          <AppButton href="/feed" variant="secondary" size="sm">← Back to feed</AppButton>
          <UploadMenu onUploadPost={() => setShowPost(true)} onAddItem={() => setShowModal(true)} />
        </div>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        items={suggestions}
        placeholder="Search for a t-shirt, jeans, shoes..."
      />

      {categories.length > 1 && (
        <div className="wardrobe-categories">
          {categories.map((item) => (
            <AppChip key={item} selected={category === item} onClick={() => setCategory(item)}>
              {item}
            </AppChip>
          ))}
        </div>
      )}

      {error && (
        <AlertRoot
          status="warning"
          my="5"
          py="3"
          px="4"
          gap="4"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          bg="#fff6f0"
          borderWidth="1px"
          borderColor="#e8c9b7"
          borderLeft="4px solid #ec6f42"
          rounded="0"
        >
          <span style={{ fontSize: 13, color: "#7a4a34" }}>{error}</span>
          <AppButton variant="secondary" size="sm" onClick={handleRetry} loading={retrying}>
            Try again
          </AppButton>
        </AlertRoot>
      )}
      {actionError && (
        <AlertRoot status="error" my="3" py="2" px="4" bg="#fff6f0" borderWidth="1px" borderColor="#e8c9b7" rounded="0">
          <span style={{ fontSize: 12, color: "#7a4a34" }}>{actionError}</span>
        </AlertRoot>
      )}

      {loading ? (
        <div className="wardrobe-grid" aria-busy="true" aria-label="Loading wardrobe">
          {[0, 1, 2, 3].map((index) => (
            <AppSkeleton key={index} height="330px" />
          ))}
        </div>
      ) : (
        <div className="wardrobe-grid">
          {visible.map((item) => (
            <Card.Root className="item-card" key={item.id}>
              {item.image ? (
                <Image src={item.image} alt={item.name} className="item-image" loading="lazy" decoding="async" />
              ) : (
                <div className="image-placeholder item-image" aria-hidden="true">⌁</div>
              )}

              {confirmId === item.id ? (
                <div className="item-confirm">
                  <span>Delete this piece?</span>
                  <div>
                    <AppButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      loading={deletingId === item.id}
                    >
                      Yes
                    </AppButton>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfirmId(null)}
                      disabled={deletingId === item.id}
                    >
                      No
                    </AppButton>
                  </div>
                </div>
              ) : (
                <AppIconButton
                  variant="paper"
                  size="sm"
                  className="item-delete"
                  onClick={() => setConfirmId(item.id)}
                  aria-label={`Delete ${item.name}`}
                  title="Delete piece"
                >
                  <TrashIcon style={{ width: 15, height: 15 }} />
                </AppIconButton>
              )}

              <div>
                <Text as="span" fontSize="11px" fontWeight="700" color={COLORS.orange}>
                  {item.type}
                </Text>
                <Heading as="h3" fontSize="16px" fontWeight="700" my="1">
                  {item.name}
                </Heading>
                <Text fontSize="13px" color={COLORS.muted} m="0">
                  {item.color}
                </Text>
                <Text as="small" display="block" fontSize="12px" color={COLORS.muted} mt="2" lineHeight="1.45">
                  {item.description}
                </Text>
              </div>
            </Card.Root>
          ))}
        </div>
      )}

      {!loading && visible.length === 0 && (
        <EmptyState.Root
          title={items.length === 0 ? "Your wardrobe is empty" : "No pieces found"}
          description={
            items.length === 0
              ? "Add your first piece — the photo goes to Neon Object Storage and the data to Postgres."
              : 'Try "t-shirt" or add a new piece.'
          }
          indicator={<ShirtIcon style={{ width: 30, height: 30, color: COLORS.orange }} />}
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="#bbb4aa"
          bg="rgba(255,253,250,.55)"
          p="10"
          my="5"
          gap="4"
        >
          <AppButton onClick={() => setShowModal(true)}>Add your first piece</AppButton>
        </EmptyState.Root>
      )}

      {showModal && <ItemUploadModal onClose={() => setShowModal(false)} />}
      {showPost && <PostUploadModal onClose={() => setShowPost(false)} />}
    </>
  );
}

