"use client";

import {
  AlertRoot,
  CameraIcon,
  Card,
  EmptyState,
  Heading,
  HeartIcon,
  Image,
  Text,
  TrashIcon,
} from "@yamada-ui/react";
import { useState } from "react";
import { errorMessage } from "@/lib/client-api";
import { POST_CATEGORIES } from "@/lib/categories";
import { timeAgo } from "@/lib/time";
import { useAppState } from "./app-state";
import { DatabaseStatusBanner } from "./database-status-banner";
import { ItemUploadModal } from "./item-upload-modal";
import { PostUploadModal } from "./post-upload-modal";
import { AppAvatar, AppButton, AppChip, AppSkeleton, AppTag, COLORS } from "./ui";
import { UploadMenu } from "./upload-menu";

const categories = ["All", ...POST_CATEGORIES];

export function FeedView() {
  const { posts, toggleLike, deletePost, status, error, refresh } = useAppState();
  const [category, setCategory] = useState("All");
  const [showPost, setShowPost] = useState(false);
  const [showItem, setShowItem] = useState(false);
  const [pendingLike, setPendingLike] = useState<string | null>(null);
  const [likeError, setLikeError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [postError, setPostError] = useState("");
  const [retrying, setRetrying] = useState(false);

  const visible = category === "All" ? posts : posts.filter((post) => post.category === category);
  const loading = status === "loading" || status === "idle";

  async function handleLike(id: string) {
    setPendingLike(id);
    setLikeError("");
    try {
      await toggleLike(id);
    } catch (likeFailure) {
      setLikeError(errorMessage(likeFailure));
    } finally {
      setPendingLike(null);
    }
  }

  async function handleDeletePost(id: string) {
    setDeletingId(id);
    setPostError("");
    try {
      await deletePost(id);
      setConfirmDeleteId(null);
    } catch (deleteFailure) {
      setPostError(errorMessage(deleteFailure));
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
          <p className="eyebrow">COMMUNITY FEED</p>
          <h1>What people are wearing</h1>
          <p className="toolbar-copy">
            {status === "ready"
              ? `${posts.length} ${posts.length === 1 ? "outfit" : "outfits"} in the community`
              : "Outfits from real people"}
          </p>
        </div>
        <div className="quick-actions">
          <UploadMenu onUploadPost={() => setShowPost(true)} onAddItem={() => setShowItem(true)} />
        </div>
      </div>

      <div className="category-row">
        {categories.map((item) => (
          <AppChip key={item} selected={category === item} onClick={() => setCategory(item)}>
            {item}
          </AppChip>
        ))}
      </div>

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

      {likeError && (
        <AlertRoot status="error" my="3" py="2" px="4" bg="#fff6f0" borderWidth="1px" borderColor="#e8c9b7" rounded="0">
          <span style={{ fontSize: 12, color: "#7a4a34" }}>{likeError}</span>
        </AlertRoot>
      )}

      {postError && (
        <AlertRoot status="error" my="3" py="2" px="4" bg="#fff6f0" borderWidth="1px" borderColor="#e8c9b7" rounded="0">
          <span style={{ fontSize: 12, color: "#7a4a34" }}>{postError}</span>
        </AlertRoot>
      )}

      {loading ? (
        <div className="feed-grid" aria-busy="true" aria-label="Loading feed">
          {[0, 1, 2, 3].map((index) => (
            <AppSkeleton key={index} height="480px" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState.Root
          title={category === "All" ? "No outfits shared yet" : `No outfits in „${category}“`}
          description="Post your first fit and show what you are wearing today. Every post is saved to the database."
          indicator={<CameraIcon style={{ width: 30, height: 30, color: COLORS.orange }} />}
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="#bbb4aa"
          bg="rgba(255,253,250,.55)"
          p="10"
          my="5"
          gap="4"
        >
          <AppButton onClick={() => setShowPost(true)}>Post your first outfit</AppButton>
        </EmptyState.Root>
      ) : (
        <div className="feed-grid">
          {visible.map((post) => (
            <Card.Root
              key={post.id}
              className="post-card"
              p="2.5"
              bg={COLORS.paper}
              borderWidth="1px"
              borderColor={COLORS.line}
              rounded="14px"
            >
              <div className="post-image-wrap">
                {post.image ? (
                  <Image src={post.image} alt={post.title} className="post-image" loading="lazy" decoding="async" />
                ) : (
                  <div className="image-placeholder" aria-hidden="true">⌁</div>
                )}
              </div>

              <div className="post-meta">
                <div className="author">
                  <AppAvatar name={post.author} src={post.avatarUrl} />
                  <div>
                    <Text as="strong" fontSize="13px" fontWeight="700" lineHeight="1.2">
                      {post.author}
                    </Text>
                    <Text as="small" fontSize="12px" color={COLORS.muted} lineHeight="1.3">
                      {post.handle} · {timeAgo(post.createdAt)}
                    </Text>
                  </div>
                </div>
              </div>

              <Heading as="h3" fontSize="21px" fontWeight="700" letterSpacing="-0.5px" mt="2.5" mx="1">
                {post.title}
              </Heading>
              {post.location && (
                <Text className="location" fontSize="12px" color={COLORS.muted} mx="1">
                  {post.location}
                </Text>
              )}
              {post.items.length > 0 && (
                <div className="item-tags">
                  {post.items.map((item) => (
                    <AppTag key={item}>{item}</AppTag>
                  ))}
                </div>
              )}

              <div className="post-actions">
                <AppButton
                  variant={post.liked ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  loading={pendingLike === post.id}
                  aria-pressed={post.liked}
                >
                  <HeartIcon
                    style={{ width: 15, height: 15 }}
                    fill={post.liked ? "currentColor" : "none"}
                  />
                  {post.liked ? "Reacted" : "React"} · {post.likes}
                </AppButton>

                {post.owned &&
                  (confirmDeleteId === post.id ? (
                    <>
                      <AppButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeletePost(post.id)}
                        loading={deletingId === post.id}
                      >
                        <TrashIcon style={{ width: 14, height: 14 }} />
                        Confirm delete
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={deletingId === post.id}
                      >
                        Cancel
                      </AppButton>
                    </>
                  ) : (
                    <AppButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(post.id)}
                    >
                      <TrashIcon style={{ width: 14, height: 14 }} />
                      Delete
                    </AppButton>
                  ))}
              </div>
            </Card.Root>
          ))}
        </div>
      )}

      {showPost && <PostUploadModal onClose={() => setShowPost(false)} />}
      {showItem && <ItemUploadModal onClose={() => setShowItem(false)} />}
    </>
  );
}

