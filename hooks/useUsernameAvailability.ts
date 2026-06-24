import { isUsernameAvailable } from "@/lib/profile";
import { useEffect, useRef, useState } from "react";

export type UsernameStatus =
    | "idle"
    | "checking"
    | "available"
    | "taken"
    | "too_short";

export function useUsernameAvailability(
    username: string,
    currentUsername: string,
    userId: string | undefined,
) {
    const [status, setStatus] = useState<UsernameStatus>("idle");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined,
    );
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    useEffect(() => {
        const trimmed = username.trim();

        if (trimmed === currentUsername) {
            setStatus("idle");
            return;
        }
        if (trimmed.length < 3) {
            setStatus("too_short");
            return;
        }
        if (!userId) {
            setStatus("idle");
            return;
        }

        setStatus("checking");
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const ok = await isUsernameAvailable(trimmed, userId);
                if (isMounted.current) setStatus(ok ? "available" : "taken");
            } catch {
                if (isMounted.current) setStatus("idle");
            }
        }, 500);
    }, [username, currentUsername, userId]);

    return status;
}