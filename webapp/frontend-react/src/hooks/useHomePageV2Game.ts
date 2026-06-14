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

type UseHomePageV2GameResult = {
  viewModel: SceneViewModel | null;
  scene: Scene | null;
  player: Player | null;
  isLoading: boolean;
  leadResponseText: string | null;
  selectChoice: (choice: SceneChoice) => Promise<void>;
  useItem: (item: Item) => Promise<void>;
  reset: () => Promise<void>;
};

function useHomePageV2Game(): UseHomePageV2GameResult {
  const [viewModel, setViewModel] = useState<SceneViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadResponseText, setLeadResponseText] = useState<string | null>(null);
  const isBusyRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    void (async () => {
      setIsLoading(true);

      try {
        const initialViewModel = await service.fetchInitialViewModel();
        if (!isMountedRef.current) {
          return;
        }

        setViewModel(initialViewModel);
        setLeadResponseText(null);
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
      setLeadResponseText(choice.responseText.trim().length > 0 ? choice.responseText : null);
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
    selectChoice,
    useItem,
    reset,
  };
}

export default useHomePageV2Game;
