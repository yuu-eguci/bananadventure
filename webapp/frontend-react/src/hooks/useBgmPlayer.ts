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

  // 初回マウント時に Audio オブジェクトを作成します。
  useEffect(() => {
    const audio = new Audio(BGM_TRACKS[trackKey].src);
    audio.loop = true;
    audio.volume = 0.25;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // trackKey が変わったら曲を差し替えます。
  useEffect(() => {
    const prevAudio = audioRef.current;
    if (!prevAudio) return;

    const newSrc = BGM_TRACKS[trackKey].src;

    // 同じ曲なら何もしません。
    if (prevAudio.src.endsWith(newSrc)) return;

    prevAudio.pause();

    const newAudio = new Audio(newSrc);
    newAudio.loop = true;
    newAudio.volume = 0.25;
    audioRef.current = newAudio;

    if (isPlayingRef.current) {
      newAudio.play().catch((error) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setErrorMessage(BLOCKED_MESSAGE);
        } else {
          console.error("BGM playback failed:", error);
          setErrorMessage(GENERIC_MESSAGE);
        }
        updateIsPlaying(false);
      });
    }
  }, [trackKey, updateIsPlaying]);

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
        if (error instanceof DOMException && error.name === "NotAllowedError") {
          setErrorMessage(BLOCKED_MESSAGE);
        } else {
          console.error("BGM playback failed:", error);
          setErrorMessage(GENERIC_MESSAGE);
        }
        updateIsPlaying(false);
      }
      return;
    }

    audio.pause();
    updateIsPlaying(false);
  }, [updateIsPlaying]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const currentTrackLabel = BGM_TRACKS[trackKey].label;

  return { isPlaying, toggle, errorMessage, clearError, currentTrackLabel };
};
