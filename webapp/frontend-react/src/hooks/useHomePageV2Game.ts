import { useCallback, useEffect, useRef, useState } from "react";

import { Item, Player, Scene, SceneChoice } from "@/models";
import { SceneService } from "@/services/SceneService";
import { SceneViewModel } from "@/viewModels";

/**
 * `useHomePageV2Game` は、 `HomePageV2` のゲーム進行状態をまとめて扱うための custom hook です。
 * 初期シーンの読み込み、選択肢によるシーン遷移、アイテム使用、リセット、 `leadResponseText` の保持を担当します。
 * `HomePageV2` 側には、画面表示に必要な状態と操作 API だけを渡し、ページコンポーネントの責務を薄く保つことを目的としています。
 *
 * `SceneService` は引数で注入できます（テストや将来の save / load・API 化での差し替えを想定）。
 * 省略時は hook 内で 1 度だけ生成し、再レンダーをまたいで同じインスタンスを使い回します。
 */
// JingleBackdrop（ローディング演出）を見せるための意図的なウェイト。
// ローカル JSON でも一瞬で終わらせず、初期表示と遷移に演出時間を確保している。
const INITIAL_LOADING_DELAY_MS = 1000;
const TRANSITION_LOADING_DURATION_MS = 1000;
const GENERIC_ERROR_MESSAGE = "エラーが発生しました。もう一度お試しください。";

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type UseHomePageV2GameResult = {
  viewModel: SceneViewModel | null;
  scene: Scene | null;
  player: Player | null;
  isLoading: boolean;
  // 選択肢レスポンス本文（注釈行は付けない。注釈の組み立ては表示側の責務）。
  leadResponseText: string | null;
  // 直前に選んだ選択肢のバナナメーター増減量。メッセージを止めて明滅させるかの判定に使う。
  leadBananaMeterDelta: number;
  // 直前の選択肢で入手したアイテム。メッセージを止めてウィジェットを追加するために使う。
  leadAddedItems: Item[];
  // service 呼び出しが失敗したときのメッセージ。Snackbar 表示に使う。null なら正常。
  errorMessage: string | null;
  clearError: () => void;
  selectChoice: (choice: SceneChoice) => Promise<void>;
  applyItem: (item: Item) => Promise<SceneViewModel | null>;
  reset: () => Promise<void>;
};

const EMPTY_ITEMS: Item[] = [];

function useHomePageV2Game(injectedService?: SceneService): UseHomePageV2GameResult {
  const [viewModel, setViewModel] = useState<SceneViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadResponseText, setLeadResponseText] = useState<string | null>(null);
  const [leadBananaMeterDelta, setLeadBananaMeterDelta] = useState(0);
  const [leadAddedItems, setLeadAddedItems] = useState<Item[]>(EMPTY_ITEMS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBusyRef = useRef(false);
  const isMountedRef = useRef(true);

  // 注入されなければ hook 内で 1 度だけ生成して使い回す。
  const serviceRef = useRef<SceneService | null>(null);
  if (serviceRef.current === null) {
    serviceRef.current = injectedService ?? new SceneService();
  }
  const service = serviceRef.current;

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

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
        setLeadAddedItems(EMPTY_ITEMS);
        await wait(TRANSITION_LOADING_DURATION_MS);
      } catch (error) {
        console.error("Failed to load initial scene", error);
        if (isMountedRef.current) {
          setErrorMessage(GENERIC_ERROR_MESSAGE);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
    // service は ref で固定しているので、初回マウント時のみ実行する。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectChoice = async (choice: SceneChoice) => {
    if (!viewModel || isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

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
      setLeadBananaMeterDelta(choice.bananaMeterDelta);
      setLeadAddedItems(choice.itemsOnSelect.length > 0 ? choice.itemsOnSelect : EMPTY_ITEMS);
      await wait(TRANSITION_LOADING_DURATION_MS);
    } catch (error) {
      console.error("Failed to select scene choice", error);
      if (isMountedRef.current) {
        setErrorMessage(GENERIC_ERROR_MESSAGE);
      }
    } finally {
      isBusyRef.current = false;

      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const applyItem = async (item: Item): Promise<SceneViewModel | null> => {
    if (!viewModel || isBusyRef.current) {
      return null;
    }

    isBusyRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const updatedViewModel = await service.useItem({
        viewModel,
        itemId: item.id,
      });

      if (!isMountedRef.current) {
        return null;
      }

      setViewModel(updatedViewModel);
      setLeadResponseText(null);
      setLeadBananaMeterDelta(0);
      setLeadAddedItems(EMPTY_ITEMS);
      await wait(TRANSITION_LOADING_DURATION_MS);
      return updatedViewModel;
    } catch (error) {
      console.error("Failed to use item", error);
      if (isMountedRef.current) {
        setErrorMessage(GENERIC_ERROR_MESSAGE);
      }
      return null;
    } finally {
      isBusyRef.current = false;

      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const reset = async () => {
    if (isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const initialViewModel = await service.fetchInitialViewModel();
      if (!isMountedRef.current) {
        return;
      }

      setViewModel(initialViewModel);
      setLeadResponseText(null);
      setLeadBananaMeterDelta(0);
      setLeadAddedItems(EMPTY_ITEMS);
      await wait(TRANSITION_LOADING_DURATION_MS);
    } catch (error) {
      console.error("Failed to reset game", error);
      if (isMountedRef.current) {
        setErrorMessage(GENERIC_ERROR_MESSAGE);
      }
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
    leadAddedItems,
    errorMessage,
    clearError,
    selectChoice,
    applyItem,
    reset,
  };
}

export default useHomePageV2Game;
