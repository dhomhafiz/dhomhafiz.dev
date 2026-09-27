export type Theme = "light" | "dark";
export const themeStorageKey = "signal-theme";

// Runs before the page paints; storage may be unavailable in private contexts.
export const themeInitScript = `(function(){var t;try{t=localStorage.getItem('${themeStorageKey}')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t})()`;
