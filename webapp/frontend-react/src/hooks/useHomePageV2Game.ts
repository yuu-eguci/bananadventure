import { useEffect, useRef, useState } from "react";

import { Item, Player, Scene, SceneChoice } from "@/models";
import { SceneService } from "@/services/SceneService";
import { SceneViewModel } from "@/viewModels";

/**
 * `useHomePageV2Game` は、 `HomePageV2` のゲーム進行状態をまとめて扱うための custom hook です。
 * 初期シーンの読み込み、選択肢によるシーン遷移、アイテム使用、リセット、 `leadResponseText` の保持を担当します。
 * `HomePageV2` 側には、画面表示に必要な状態と操作 API だけを渡し、ページコンポーネントの責務を薄く保つことを目的としています。
 */
const service = new SceneService();
const INITIAL_LOADING_DELAY_MS = 1000;
const TRANSITION_LOADING_DURATION_MS = 1000;

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 選択肢レスポンスの末尾に表示する文字列を組み立てる。
// バナナメーターの増減があるときは、その増減量を符号付きで末尾の行に添える。
function buildLeadResponseText(choice: SceneChoice): string | null {
  const baseText = choice.responseText.trim().length > 0 ? choice.responseText : "";

  if (choice.bananaMeterDelta === 0) {
    return baseText.length > 0 ? baseText : null;
  }

  const signedDeltaText =
    choice.bananaMeterDelta > 0 ? `+${choice.bananaMeterDelta}` : `${choice.bananaMeterDelta}`;
  const deltaLine = `（バナナメーター ${signedDeltaText}）`;

  return baseText.length > 0 ? `${baseText}\n${deltaLine}` : deltaLine;
}

type UseHomePageV2GameResult = {
  viewModel: SceneViewModel | null;
  scene: Scene | null;
  player: Player | null;
  isLoading: boolean;
  leadResponseText: string | null;
  // 直前に選んだ選択肢のバナナメーター増減量。メッセージを止めて明滅させるかの判定に使う。
  leadBananaMeterDelta: number;
  selectChoice: (choice: SceneChoice) => Promise<void>;
  useItem: (item: Item) => Promise<void>;
  reset: () => Promise<void>;
};

function useHomePageV2Game(): UseHomePageV2GameResult {
  const [viewModel, setViewModel] = useState<SceneViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadResponseText, setLeadResponseText] = useState<string | null>(null);
  const [leadBananaMeterDelta, setLeadBananaMeterDelta] = useState(0);
  const isBusyRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    void (async () => {
      setIsLoading(true);

      try {
        await wait(INITIAL_LOADING_DELAY_MS);
        const initialViewModel = await service.fetchInitialViewModel();
        if (!isMountedRef.current) {
          return;
        }

        setViewModel(initialViewModel);
        setLeadResponseText(null);
        setLeadBananaMeterDelta(0);
        await wait(TRANSITION_LOADING_DURATION_MS);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const selectChoice = async (choice: SceneChoice) => {
    if (!viewModel || isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    setIsLoading(true);

    try {
      const updatedViewModel = await service.selectSceneChoice({
        viewModel,
        selectedSceneChoiceId: choice.id,
      });

      if (!isMountedRef.current) {
        return;
      }

      setViewModel(updatedViewModel);
      setLeadResponseText(buildLeadResponseText(choice));
      setLeadBananaMeterDelta(choice.bananaMeterDelta);
      await wait(TRANSITION_LOADING_DURATION_MS);
    } finally {
      isBusyRef.current = false;

      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const useItem = async (item: Item) => {
    if (!viewModel || isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;

    try {
      const updatedViewModel = await service.useItem({
        viewModel,
        itemId: item.id,
      });

      if (!isMountedRef.current) {
        return;
      }

      setViewModel(updatedViewModel);
    } finally {
      isBusyRef.current = false;
    }
  };

  const reset = async () => {
    if (isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    setIsLoading(true);

    try {
      const initialViewModel = await service.fetchInitialViewModel();
      if (!isMountedRef.current) {
        return;
      }

      setViewModel(initialViewModel);
      setLeadResponseText(null);
      setLeadBananaMeterDelta(0);
      await wait(TRANSITION_LOADING_DURATION_MS);
    } finally {
      isBusyRef.current = false;

      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return {
    viewModel,
    scene: viewModel?.scene ?? null,
    player: viewModel?.player ?? null,
    isLoading,
    leadResponseText,
    leadBananaMeterDelta,
    selectChoice,
    useItem,
    reset,
  };
}

export default useHomePageV2Game;
