import { useCallback, useEffect, useRef, useState } from "react";

export type LoreItemId = "q1" | "q2" | "q3" | "q4" | "q5";

export type LoreVoiceSequence = {
  itemId: LoreItemId;
  questionSrc: string;
  answerSrc: string;
};

const BLOCKED_MESSAGE = "音声の再生がブロックされました。もう一度Qをタップしてください";
const GENERIC_MESSAGE = "音声の再生に失敗しました。時間をおいて再試行してください";

export const useLoreVoicePlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestIdRef = useRef(0);
  const pendingResolveRef = useRef<((completed: boolean) => void) | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [playingItemId, setPlayingItemId] = useState<LoreItemId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.volume = 1;
      audioRef.current = audio;
    }

    return audioRef.current;
  }, []);

  const invalidateCurrentRequest = useCallback(() => {
    requestIdRef.current += 1;
    return requestIdRef.current;
  }, []);

  const settlePendingPlayback = useCallback((completed: boolean) => {
    const resolve = pendingResolveRef.current;
    pendingResolveRef.current = null;
    resolve?.(completed);
  }, []);

  const stop = useCallback(() => {
    invalidateCurrentRequest();
    settlePendingPlayback(false);

    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.currentTime = 0;
    }

    setPlayingItemId(null);
  }, [invalidateCurrentRequest, settlePendingPlayback]);

  const playSequence = useCallback(
    async (sequence: LoreVoiceSequence) => {
      const requestId = invalidateCurrentRequest();
      const audio = ensureAudio();

      setErrorMessage(null);
      setPlayingItemId(sequence.itemId);

      const playSingleClip = async (src: string) => {
        if (requestId !== requestIdRef.current) {
          return false;
        }

        settlePendingPlayback(false);
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        audio.src = src;

        try {
          await audio.play();
        } catch (error) {
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            setErrorMessage(BLOCKED_MESSAGE);
          } else {
            console.error("Lore voice playback failed:", error);
            setErrorMessage(GENERIC_MESSAGE);
          }
          setPlayingItemId(null);
          return false;
        }

        const completed = await new Promise<boolean>((resolve) => {
          const cleanup = () => {
            audio.onended = null;
            audio.onerror = null;
            pendingResolveRef.current = null;
          };

          pendingResolveRef.current = (value: boolean) => {
            cleanup();
            resolve(value);
          };

          audio.onended = () => {
            cleanup();
            resolve(requestId === requestIdRef.current);
          };

          audio.onerror = () => {
            cleanup();
            console.error("Lore voice playback failed: audio element error");
            setErrorMessage(GENERIC_MESSAGE);
            resolve(false);
          };
        });

        if (!completed && requestId === requestIdRef.current) {
          setPlayingItemId(null);
        }

        return completed;
      };

      const questionCompleted = await playSingleClip(sequence.questionSrc);
      if (!questionCompleted) {
        return;
      }

      const answerCompleted = await playSingleClip(sequence.answerSrc);
      if (!answerCompleted) {
        return;
      }

      if (requestId === requestIdRef.current) {
        setPlayingItemId(null);
      }
    },
    [ensureAudio, invalidateCurrentRequest, settlePendingPlayback],
  );

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    return () => {
      stop();
      if (audioRef.current) {
        audioRef.current.src = "";
        audioRef.current.load();
        audioRef.current = null;
      }
    };
  }, [stop]);

  return {
    isVoiceEnabled,
    setVoiceEnabled: setIsVoiceEnabled,
    playingItemId,
    playSequence,
    stop,
    errorMessage,
    clearError,
  };
};
