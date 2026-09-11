import { useEffect } from "react";

const FONT_LINK_ID = "mtg-trivia-font";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap";

export function useLoadFont(): void {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}