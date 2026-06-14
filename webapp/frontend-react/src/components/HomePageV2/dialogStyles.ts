import { Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";

/**
 * HomePageV2 のダイアログ / ボタンで共有するスタイル。
 * 同じ `sx` を各コンポーネントへコピペすると後から色を変えたいときに散らかるので、
 * V2 のデザイン言語としてここへ寄せている。
 *
 * `sx={[base, { ...extra }]}` の配列マージで使えるよう、型は `SystemStyleObject<Theme>`。
 */

// Dialog の角丸（<Dialog PaperProps={DIALOG_PAPER_PROPS} />）。
export const DIALOG_PAPER_PROPS = { sx: { borderRadius: "18px" } };

// ダイアログヘッダ（DialogTitle）。
export const dialogTitleSx: SystemStyleObject<Theme> = {
  bgcolor: "primary.main",
  color: "common.black",
  fontWeight: "bold",
};

// ダイアログ本体・アクション行の背景（DialogContent / DialogActions の bgcolor）。
export const dialogSurfaceSx: SystemStyleObject<Theme> = {
  bgcolor: "primary.main",
};

// グレーの主アクションボタン（使う / リセット / 閉じる など）。
export const darkActionButtonSx: SystemStyleObject<Theme> = {
  bgcolor: "grey.800",
  color: "common.white",
  "&:hover": { bgcolor: "grey.900" },
};
