// Public media paths must share Next.js's build-time deployment prefix.
// Empty locally or on a root domain; e.g. /dhomhafiz.dev on GitHub project Pages.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export function assetPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? `${basePath}${path}` : path;
}

export function assetSrcSet(srcSet: string) {
  return srcSet.split(",").map(candidate => {
    const [path, ...descriptor] = candidate.trim().split(/\s+/);
    return [assetPath(path), ...descriptor].join(" ");
  }).join(", ");
}
