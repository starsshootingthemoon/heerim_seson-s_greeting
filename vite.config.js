import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  // 기본값은 사용자가 지정한 실제 저장소의 예상 Pages 경로입니다. 배포 성공을 의미하지 않습니다.
  // Cloudflare Pages가 실제 빌드 주소를 제공하면 루트 경로와 OG를 그 주소에 맞춥니다.
  const site = new URL(env.VITE_SITE_URL || process.env.CF_PAGES_URL || 'https://starsshootingthemoon.github.io/heerim_seson-s_greeting/');
  if (!['https:', 'http:'].includes(site.protocol)) throw new Error('VITE_SITE_URL must use HTTP(S).');
  if (!site.pathname.endsWith('/')) site.pathname += '/';
  site.search = ''; site.hash = '';
  return {
    base: command === 'serve' && !isPreview ? '/' : site.pathname,
    plugins: [react(), {
      name: 'static-common-open-graph',
      transformIndexHtml: {
        order: 'pre',
        handler: html => html.replaceAll('__V3_OG_IMAGE_URL__', new URL('assets/v3/poster.webp', site).href).replaceAll('__V2_OG_IMAGE_URL__', new URL('assets/v2/architecture-dusk.webp', site).href).replaceAll('__SITE_URL__', site.href).replaceAll('__OG_IMAGE_URL__', new URL('assets/og-card-wide.png', site).href),
      },
    }],
    server: { host: '127.0.0.1' },
    build: { target: 'es2022', rollupOptions: { input: { main: fileURLToPath(new URL('./index.html', import.meta.url)), v2: fileURLToPath(new URL('./v2/index.html', import.meta.url)), v3: fileURLToPath(new URL('./v3/index.html', import.meta.url)) } } },
  };
});
