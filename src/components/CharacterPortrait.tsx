import { portraitUrl } from "@/data/characterArt";
import { useGame } from "@/hooks/useGameStore";

type Props = {
  variant: "vn" | "avatar" | "thumb";
  /** VN 中对方在说话时为高亮 */
  highlight?: boolean;
  className?: string;
};

export function GuyuPortrait({ variant, highlight = true, className = "" }: Props) {
  const { portraitFile } = useGame();
  const cls =
    variant === "vn"
      ? "char-img char-img--vn"
      : variant === "avatar"
        ? "char-img char-img--avatar"
        : "char-img char-img--thumb";
  return (
    <img
      src={portraitUrl(portraitFile)}
      alt=""
      className={`${cls}${highlight ? " char-img--lit" : " char-img--dim"}${className ? ` ${className}` : ""}`}
      decoding="async"
    />
  );
}
