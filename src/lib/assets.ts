type Asset = string | { src: string };

export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`;
  return `${baseWithSlash}${path.replace(/^\/+/, '')}`;
}

export function resolveAsset(asset: Asset): string {
  return typeof asset === 'string' ? asset : asset.src;
}
