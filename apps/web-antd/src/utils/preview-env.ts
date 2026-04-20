export function isGithubPagesPreview() {
  if (typeof window === 'undefined') {
    return false;
  }

  const { hostname, pathname } = window.location;
  return hostname === 'ericzr.github.io' && pathname.includes('/previews/');
}

export function isStaticPreviewMode() {
  return (
    isGithubPagesPreview() ||
    import.meta.env.VITE_STATIC_PREVIEW === 'true' ||
    import.meta.env.VITE_STATIC_PREVIEW === true
  );
}

export function getStaticPreviewNamespaceSuffix() {
  if (typeof window === 'undefined') {
    return '';
  }

  const { hostname, pathname } = window.location;
  if (hostname !== 'ericzr.github.io') {
    return '';
  }

  const previewMatch = pathname.match(/\/previews\/([^/]+)\//);
  if (previewMatch?.[1]) {
    return `preview-${previewMatch[1]}`;
  }

  const [repoName] = pathname.split('/').filter(Boolean);
  return repoName ? `gh-pages-${repoName}` : 'gh-pages';
}
