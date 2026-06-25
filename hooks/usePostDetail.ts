import { useAuthContext } from "@/hooks/use-auth-context";
import { getComments } from "@/lib/comments";
import { likePost, unlikePost } from "@/lib/likes";
import { getPostDetail } from "@/lib/posts";
import { savePost, unsavePost } from "@/lib/save";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { RefObject, useEffect, useRef, useState } from "react";

export type NewComment = {
    id: string;
    content: string;
    username: string;
    avatar: string | null;
    timeAgo: string;
};

export function usePostDetail(
    postId: string,
    commentSheetRef: RefObject<BottomSheetModal | null>,
) {
    const { profile } = useAuthContext();

    const [postData, setPostData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [savesCount, setSavesCount] = useState(0);

    const [commentCount, setCommentCount] = useState(0);
    const [sheetComments, setSheetComments] = useState<NewComment[]>([]);

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const data = await getPostDetail(postId);
                if (cancelled) return;

                setPostData(data);
                setCommentCount((data?.comments || []).length);

                const likes = data?.likes || [];
                const saves = data?.saves || [];
                setLikesCount(likes.length);
                setSavesCount(saves.length);
                setLiked(likes.some((l: any) => l.user_id === profile?.id));
                setSaved(saves.some((s: any) => s.user_id === profile?.id));
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

    const toggleLike = async () => {
        if (!profile?.id) return;
        const wasLiked = liked;
        setLiked(!wasLiked);
        setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
        try {
            if (wasLiked) await unlikePost(postId, profile.id);
            else await likePost(postId, profile.id);
        } catch (err) {
            console.log("Failed to toggle like:", err);
            setLiked(wasLiked);
            setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
        }
    };

    const toggleSave = async () => {
        if (!profile?.id) return;
        const wasSaved = saved;
        setSaved(!wasSaved);
        setSavesCount((c) => (wasSaved ? c - 1 : c + 1));
        try {
            if (wasSaved) await unsavePost(postId, profile.id);
            else await savePost(postId, profile.id);
        } catch (err) {
            console.log("Failed to toggle save:", err);
            setSaved(wasSaved);
            setSavesCount((c) => (wasSaved ? c + 1 : c - 1));
        }
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
        liked,
        saved,
        likesCount,
        savesCount,
        commentCount,
        sheetComments,
        toggleLike,
        toggleSave,
        openComments,
        handleNewComment,
    };
}