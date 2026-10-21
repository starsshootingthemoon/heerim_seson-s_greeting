export async function copyLink(url) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(url); return true; } catch { /* 아래 수동 복사 경로를 사용합니다. */ }
  }
  const field = document.createElement('textarea');
  field.value = url;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;left:-9999px;top:0';
  document.body.append(field);
  field.select();
  let result = false;
  try { result = document.execCommand('copy'); } catch { result = false; }
  field.remove();
  return result;
}

export async function shareLink(url) {
  if (!navigator.share) return (await copyLink(url)) ? 'copied' : 'manual';
  try {
    await navigator.share({ title: 'HEERIM 2026 New Year Greeting', text: '희림건축이 전하는 2026년 새해 인사', url });
    return 'shared';
  } catch (error) {
    if (error.name === 'AbortError') return 'cancelled';
    return (await copyLink(url)) ? 'copied' : 'manual';
  }
}
