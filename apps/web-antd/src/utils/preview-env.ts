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
