import React, { useEffect, useState } from 'react';
import { getTranslation, languages } from './data/translations.js';
import { readPersonalization, recipientLabel } from './lib/personalization.js';
import { getSender } from './data/senders.js';
import './motion.css';

export default function MotionGreeting() {
  const [params, setParams] = useState(() => readPersonalization(location.search));
  const [paused, setPaused] = useState(false);
  const t = getTranslation(params.lang);
  const sender = getSender(params);
  useEffect(() => { document.documentElement.lang = params.lang; }, [params.lang]);
  function language(lang) {
    const url = new URL(location.href); url.searchParams.set('lang', lang);
    history.replaceState({}, '', url); document.documentElement.lang = lang;
    setParams(p => ({ ...p, lang }));
  }
  return <main className={`motion-greeting${paused ? ' motion-paused' : ''}`}>
    <section className="motion-scene" aria-label="건축물의 윤곽을 따라 빛이 흐르는 2027 새해 인사">
      <div className="motion-camera">
        <svg className="motion-art" viewBox="0 0 1400 1370" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
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
        </svg>
      </div>
      <header className="motion-header"><span className="motion-logo">heerim</span><nav aria-label="언어 선택">{languages.map(l => <button key={l.code} aria-pressed={params.lang === l.code} onClick={() => language(l.code)}>{l.short}</button>)}</nav></header>
      <div className="motion-title"><p className="motion-kicker">A NEW LIGHT, A NEW YEAR</p><p className="motion-year">2027</p><h1 lang={t.contentLang}>{params.lang === 'ko' ? '새로운 빛으로, 함께 그리는 내일' : t.headline}</h1><p className="motion-season">Season’s Greetings</p></div>
      <div className="motion-caption"><span>HEERIM ARCHITECTS &amp; PLANNERS</span><button type="button" onClick={() => setPaused(p => !p)} aria-pressed={paused}>{paused ? '모션 재생' : '모션 일시정지'}</button></div>
    </section>
    <section className="motion-message" aria-label="맞춤 새해 인사">
      <p className="motion-message-label">WITH OUR SINCERE GRATITUDE</p>
      <h2>{recipientLabel(params, true)}</h2>
      {t.greeting.map((p, i) => <p lang={t.contentLang} className="motion-paragraph" key={i}>{p}</p>)}
      <p className="motion-sender">{sender.name}{params.lang === 'ko' ? ' 드림' : ''}{sender.title && <span>{sender.title}</span>}</p>
      <footer><span className="motion-logo">heerim</span><span>2027 NEW YEAR GREETING</span></footer>
    </section>
  </main>;
}
