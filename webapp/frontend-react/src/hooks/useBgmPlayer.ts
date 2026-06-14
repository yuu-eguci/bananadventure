import { useCallback, useEffect, useRef, useState } from "react";

export const BGM_TRACKS = {
  main: {
    src: "/bgm/banana-theme-64.mp3",
    label: "ばななちゃんのテーマ",
  },
  ending: {
    src: "/bgm/banana-theme-piano-64.mp3",
    label: "ばななちゃんのテーマ - ピアノ",
  },
} as const;

export type BgmTrackKey = keyof typeof BGM_TRACKS;

const BLOCKED_MESSAGE = "再生がブロックされました。もう一度ボタンを押してください";
const GENERIC_MESSAGE = "BGM の再生に失敗しました。時間をおいて再試行してください";

const createLoopingAudio = (src: string) => {
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0.25;
  return audio;
};

export const useBgmPlayer = (trackKey: BgmTrackKey) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // isPlaying state と isPlayingRef を同期させるヘルパーです。
  const updateIsPlaying = useCallback((value: boolean) => {
    setIsPlaying(value);
    isPlayingRef.current = value;
  }, []);

  const updatePlaybackError = useCallback((error: unknown) => {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      setErrorMessage(BLOCKED_MESSAGE);
      return;
    }

    console.error("BGM playback failed:", error);
    setErrorMessage(GENERIC_MESSAGE);
  }, []);

  useEffect(() => {
    const audio = createLoopingAudio(BGM_TRACKS[trackKey].src);
    audioRef.current = audio;

    if (isPlayingRef.current) {
      audio.play().catch((error) => {
        updatePlaybackError(error);
        updateIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [trackKey, updateIsPlaying, updatePlaybackError]);

  const toggle = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) {
      setErrorMessage(GENERIC_MESSAGE);
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        updateIsPlaying(true);
        setErrorMessage(null);
      } catch (error) {
        updatePlaybackError(error);
        updateIsPlaying(false);
      }
      return;
    }

    audio.pause();
    updateIsPlaying(false);
  }, [updateIsPlaying, updatePlaybackError]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const currentTrackLabel = BGM_TRACKS[trackKey].label;

  return { isPlaying, toggle, errorMessage, clearError, currentTrackLabel };
};
