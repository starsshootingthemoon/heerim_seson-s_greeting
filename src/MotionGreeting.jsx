import HomeLink from './HomeLink.jsx';
import Logo from './Logo.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { getTranslation, languages } from './data/translations.js';
import { readPersonalization, recipientLabel } from './lib/personalization.js';
import { getSender } from './data/senders.js';
import './motion.css';
import ScreenCopy from './ScreenCopy.jsx';
import './screen.css';

export default function MotionGreeting({ video = false }) {
  const [params, setParams] = useState(() => readPersonalization(location.search));
  const [paused, setPaused] = useState(() => video && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const videoRef = useRef(null);
  const [completed, setCompleted] = useState(false);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    if (paused) element.pause();
    else if (!completed) element.play().catch(() => setPaused(true));
  }, [paused, video, completed]);
  const t = getTranslation(params.lang);
  const sender = getSender(params);
  useEffect(() => { document.documentElement.lang = params.lang; }, [params.lang]);
  function language(lang) {
    const url = new URL(location.href); url.searchParams.set('lang', lang);
    history.replaceState({}, '', url); document.documentElement.lang = lang;
    setParams(p => ({ ...p, lang }));
  }
  return <main className={`motion-greeting one-screen-shell${video ? ' motion-video-version' : ''}${paused ? ' motion-paused' : ''}`}>
    <section className="motion-scene" aria-label={video ? '건축물의 완성 과정을 담은 2026 새해 인사' : '건축물의 윤곽을 따라 빛이 흐르는 2026 새해 인사'}>
      <div className="motion-camera">
        {video ? <video ref={videoRef} className="motion-film" muted playsInline onEnded={() => setCompleted(true)} autoPlay={!paused} preload="auto" poster={`${import.meta.env.BASE_URL}assets/v3/poster.webp`} aria-label="건축물 완성 과정 영상">
          <source src={`${import.meta.env.BASE_URL}assets/v3/architecture-clean.mp4`} type="video/mp4" />
        </video> : <svg className="motion-art" viewBox="0 0 1400 1370" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <filter id="light-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
            <linearGradient id="night-shade" x2="0" y2="1"><stop stopColor="#071321" stopOpacity=".45"/><stop offset=".5" stopColor="#071321" stopOpacity="0"/><stop offset="1" stopColor="#071321" stopOpacity=".24"/></linearGradient>
          </defs>
          <image href={`${import.meta.env.BASE_URL}assets/v2/architecture-dusk.webp`} width="1400" height="1370" />
          <rect width="1400" height="1370" fill="url(#night-shade)" />
          <g className="contour-lines" fill="none" stroke="#ffe6b3" strokeWidth="2" strokeLinecap="round">
            <path className="trace trace-one" pathLength="1" d="M449 1208 L459 532 L533 465 L675 579 L724 648 L751 1120" />
            <path className="trace trace-two" pathLength="1" d="M820 1121 L818 703 Q820 660 903 616 Q943 624 994 681 L1005 1168" />
            <path className="trace trace-three" pathLength="1" d="M449 1158 L627 1118 L825 1127 L1004 1169" />
          </g>
          <g className="contour-halo" fill="none" stroke="#ffd690" strokeWidth="7" filter="url(#light-glow)">
            <path className="trace trace-one" pathLength="1" d="M449 1208 L459 532 L533 465 L675 579 L724 648 L751 1120" />
            <path className="trace trace-two" pathLength="1" d="M820 1121 L818 703 Q820 660 903 616 Q943 624 994 681 L1005 1168" />
          </g>
        </svg>}
      </div>
      <header className="motion-header"><Logo light className="motion-logo" /><nav aria-label="언어 선택">{languages.map(l => <button key={l.code} aria-pressed={params.lang === l.code} onClick={() => language(l.code)}>{l.short}</button>)}</nav></header>
      <div className={`screen-copy-stage ${!video || completed || reduced ? 'video-copy-ready' : 'video-copy-wait'}`}><ScreenCopy params={params} /></div>
      <div className="motion-caption"><Logo light className="motion-caption-logo" /><div className="motion-caption-controls"><HomeLink />{video && completed ? <button className="completion-replay" onClick={() => { const el=videoRef.current; el.currentTime=0; setCompleted(false); setPaused(false); el.play().catch(() => setPaused(true)); }}>다시 보기</button> : <button type="button" onClick={() => setPaused(p => !p)} aria-pressed={paused}>{paused ? '모션 재생' : '모션 일시정지'}</button>}</div></div>
    </section>
  </main>;
}
