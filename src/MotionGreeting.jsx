import HomeLink from './HomeLink.jsx';
import Logo from './Logo.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { getTranslation, languages } from './data/translations.js';
import { readPersonalization, recipientLabel } from './lib/personalization.js';
import { getSender } from './data/senders.js';
import './motion.css';
import ScreenCopy from './ScreenCopy.jsx';
import './screen.css';

const cityLightRoutes = [
  {kind:'building',d:'M449 1208 L459 532 L533 465 L675 579 L724 648 L751 1120'},
  {kind:'building',d:'M535 1125 L533 465'},
  {kind:'building',d:'M490 1182 L497 505'},
  {kind:'building',d:'M580 1120 L579 502 L691 595'},
  {kind:'building',d:'M649 1120 L639 550'},
  {kind:'building',d:'M456 1000 L534 942 L744 1007'},
  {kind:'building',d:'M458 790 L533 729 L734 837'},
  {kind:'building',d:'M820 1121 L818 703 Q820 660 903 616 Q943 624 994 681 L1005 1168'},
  {kind:'building',d:'M855 1132 L850 660 Q870 635 903 616'},
  {kind:'building',d:'M910 1145 L903 616'},
  {kind:'building',d:'M956 1159 L949 638'},
  {kind:'building',d:'M819 810 Q900 750 998 812'},
  {kind:'building',d:'M820 975 Q903 927 1002 980'},
  {kind:'building',d:'M449 1158 L627 1118 L825 1127 L1004 1169'},
  {kind:'road',d:'M0 1168 Q175 1203 395 1259 Q458 1275 513 1283'},
  {kind:'road',d:'M0 1182 Q172 1214 389 1270 Q455 1288 514 1296'},
  {kind:'road',d:'M0 1320 Q210 1285 390 1263 Q451 1255 473 1221'},
  {kind:'road',d:'M0 1335 Q225 1297 395 1275 Q465 1266 485 1229'},
  {kind:'road',d:'M1400 1212 Q1234 1205 1100 1248 Q1008 1278 945 1304 Q904 1325 929 1370'},
  {kind:'road',d:'M1400 1228 Q1246 1220 1107 1261 Q1024 1289 963 1318 Q931 1339 956 1370'},
  {kind:'road',d:'M1080 1370 Q1130 1328 1050 1290 Q1003 1267 1024 1237 Q1047 1212 1162 1192'},
  {kind:'road',d:'M1102 1370 Q1152 1320 1070 1283 Q1030 1264 1046 1244 Q1073 1226 1175 1206'},
  {kind:'road',d:'M473 1221 L450 1208 L449 1158'},
  {kind:'road',d:'M1024 1237 L1014 1197 L1004 1169'},
];

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
  return <main className={`motion-greeting one-screen-shell${video ? ' motion-video-version' : ''}${paused ? ' motion-paused' : ''}${video && (completed || reduced) ? ' is-reading' : ''}`}>
    <section className="motion-scene" aria-label={video ? '건축물의 완성 과정을 담은 2026 새해 인사' : '건축물의 윤곽을 따라 빛이 흐르는 2026 새해 인사'}>
      <div className="motion-camera">
        {video ? <video ref={videoRef} className="motion-film" muted playsInline onEnded={() => setCompleted(true)} autoPlay={!paused} preload="auto" poster={`${import.meta.env.BASE_URL}assets/v3/poster.webp`} aria-label="건축물 완성 과정 영상">
          <source src={`${import.meta.env.BASE_URL}assets/v3/architecture-clean.mp4`} type="video/mp4" />
        </video> : <svg className="motion-art" viewBox="-70 0 1540 1370" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <filter id="light-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
            <linearGradient id="night-shade" x2="0" y2="1"><stop stopColor="#071321" stopOpacity=".45"/><stop offset=".5" stopColor="#071321" stopOpacity="0"/><stop offset="1" stopColor="#071321" stopOpacity=".24"/></linearGradient>
          </defs>
          <image href={`${import.meta.env.BASE_URL}assets/v2/architecture-dusk.webp`} width="1400" height="1370" />
          <rect width="1400" height="1370" fill="url(#night-shade)" />
          <g className="city-light-network" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {cityLightRoutes.map((route,i)=><g key={route.d} className={`city-route city-route-${route.kind}`}>
              <path className="city-route-guide" d={route.d} />
              <path className="city-route-glow city-route-sweep" pathLength="1" d={route.d} filter="url(#light-glow)" style={{animationDelay:`${-i*.63}s`,animationDuration:`${route.kind==='road'?5.5:8}s`}} />
              <path className="city-route-core city-route-sweep" pathLength="1" d={route.d} style={{animationDelay:`${-i*.63}s`,animationDuration:`${route.kind==='road'?5.5:8}s`}} />
            </g>)}
            {[{x:473,y:1221},{x:1024,y:1237}].map((point,i)=><g key={i} className="city-junction"><circle cx={point.x} cy={point.y} r="4"/><circle className="city-junction-ring" cx={point.x} cy={point.y} r="13" style={{animationDelay:`${-i*2}s`}} /></g>)}
          </g>
        </svg>}
      </div>
      <header className="motion-header"><Logo light className="motion-logo" /><nav aria-label="언어 선택">{languages.map(l => <button key={l.code} aria-pressed={params.lang === l.code} onClick={() => language(l.code)}>{l.short}</button>)}</nav></header>
      <div className={`screen-copy-stage ${!video || completed || reduced ? 'video-copy-ready' : 'video-copy-wait'}`}><ScreenCopy params={params} /></div>
      <div className="motion-caption"><Logo light className="motion-caption-logo" /><div className="motion-caption-controls"><HomeLink />{video && completed ? <button className="completion-replay" onClick={() => { const el=videoRef.current; el.currentTime=0; setCompleted(false); setPaused(false); el.play().catch(() => setPaused(true)); }}>다시 보기</button> : <button type="button" onClick={() => setPaused(p => !p)} aria-pressed={paused}>{paused ? '모션 재생' : '모션 일시정지'}</button>}</div></div>
    </section>
  </main>;
}
