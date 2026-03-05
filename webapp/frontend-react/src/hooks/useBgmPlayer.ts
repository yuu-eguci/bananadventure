import { useCallback, useEffect, useRef, useState } from "react";

const BGM_SRC = "/bgm/banana-theme-64.mp3";
const BLOCKED_MESSAGE = "再生がブロックされました。もう一度ボタンを押してください";
const GENERIC_MESSAGE = "BGM の再生に失敗しました。時間をおいて再試行してください";

export const useBgmPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const audio = new Audio(BGM_SRC);
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      setErrorMessage(GENERIC_MESSAGE);
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
        setErrorMessage(null);
      } catch (error) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setErrorMessage(BLOCKED_MESSAGE);
        } else {
          console.error("BGM playback failed:", error);
          setErrorMessage(GENERIC_MESSAGE);
        }
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return { isPlaying, toggle, errorMessage, clearError };
};
