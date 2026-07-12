import { Comment } from "@/constants/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { getComments } from "@/lib/comments";
import { likePost, unlikePost } from "@/lib/likes";
import { getPostDetail } from "@/lib/posts";
import { savePost, unsavePost } from "@/lib/save";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RefObject, useEffect, useRef, useState } from "react";

// Kept as an alias for backwards compatibility; the canonical comment
// view-model lives in `constants/types.ts`.
export type NewComment = Comment;

// All the state and actions for the post detail screen: the post itself,
// like/save toggles, and the comments.
export function usePostDetail(
    postId: string,
    commentSheetRef: RefObject<BottomSheetModal | null>,
) {
    const { profile } = useAuthContext();

    const [postData, setPostData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Like and save buttons. Start empty; we fill in the real values after the fetch below.
    const likes = useOptimisticToggle(
        false,
        0,
        () => likePost(postId, profile!.id),
        () => unlikePost(postId, profile!.id),
    );
    const saves = useOptimisticToggle(
        false,
        0,
        () => savePost(postId, profile!.id),
        () => unsavePost(postId, profile!.id),
    );

    const [commentCount, setCommentCount] = useState(0);
    const [sheetComments, setSheetComments] = useState<NewComment[]>([]);

    // Track if the component is still on screen, so we don't set state after it's gone.
    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Load the post, then set the like/save counts and whether the current user
    // already liked/saved it. `cancelled` ignores a stale fetch if postId changes.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const data = await getPostDetail(postId);
                if (cancelled) return;

                setPostData(data);
                setCommentCount((data?.comments || []).length);

                const likeRows = data?.likes || [];
                const saveRows = data?.saves || [];
                likes.setCount(likeRows.length);
                saves.setCount(saveRows.length);
                likes.setActive(likeRows.some((l: any) => l.user_id === profile?.id));
                saves.setActive(saveRows.some((s: any) => s.user_id === profile?.id));
            } catch (err) {
                console.error("Error fetching full post:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [postId, profile?.id]);

    // Guard against toggling while logged out (matches previous behavior).
    const toggleLike = () => {
        if (!profile?.id) return;
        const wasLiked = likes.active;
        likes.toggle();
        // Keep the "Liked by …" preview in sync by adding/removing yourself.
        setPostData((prev: any) => {
            if (!prev) return prev;
            const rows = prev.likes || [];
            const nextLikes = wasLiked
                ? rows.filter((l: any) => l.user_id !== profile.id)
                : [
                    ...rows,
                    {
                        user_id: profile.id,
                        profiles: {
                            username: profile.username,
                            avatar_url: profile.avatar_url,
                        },
                    },
                ];
            return { ...prev, likes: nextLikes };
        });
    };

    const toggleSave = () => {
        if (!profile?.id) return;
        saves.toggle();
    };

    const openComments = async () => {
        try {
            const fresh = await getComments(postId);
            if (!isMounted.current) return;
            setSheetComments(fresh);
            commentSheetRef.current?.present();
        } catch (err) {
            console.log("Failed to load comments:", err);
        }
    };

    // After someone posts a comment: add it to the open sheet, bump the count,
    // and also push it into postData so the inline comment list updates too.
    const handleNewComment = (newComment: NewComment) => {
        setSheetComments((prev) => [...prev, newComment]);
        setCommentCount((c) => c + 1);
        setPostData((prev: any) =>
            prev
                ? {
                    ...prev,
                    comments: [
                        ...(prev.comments || []),
                        {
                            id: newComment.id,
                            content: newComment.content,
                            created_at: new Date().toISOString(),
                            profiles: {
                                username: newComment.username,
                                avatar_url: newComment.avatar,
                            },
                        },
                    ],
                }
                : prev,
        );
    };

    return {
        postData,
        loading,
        liked: likes.active,
        saved: saves.active,
        likesCount: likes.count,
        savesCount: saves.count,
        commentCount,
        sheetComments,
        toggleLike,
        toggleSave,
        openComments,
        handleNewComment,
    };
}