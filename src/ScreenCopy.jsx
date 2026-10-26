import React, { useLayoutEffect, useRef, useState } from 'react';
import { getTranslation } from './data/translations.js';
import { getSender, messageOptions } from './data/senders.js';
import { recipientLabel } from './lib/personalization.js';

export default function ScreenCopy({ params, hideHeading = false }) {
  const box = useRef(null), inner = useRef(null);
  const [scale, setScale] = useState(1);
  const t = getTranslation(params.lang), sender = getSender(params);
  useLayoutEffect(() => {
    let alive = true;
    const fit = () => { if (alive && box.current && inner.current) setScale(Math.min(1, box.current.clientHeight / Math.max(1, inner.current.scrollHeight))); };
    const observer = new ResizeObserver(fit);
    observer.observe(box.current); observer.observe(inner.current);
    document.fonts.ready.then(fit); fit();
    return () => { alive = false; observer.disconnect(); };
  }, [params.lang, params.from, params.message, params.to, params.company, params.senderName, params.senderTitle, hideHeading]);
  return <div className="screen-copy" ref={box}><div className="screen-copy-inner" ref={inner} style={{ transform: `translateX(-50%) scale(${scale})` }}>
    {!hideHeading && <><p className="screen-year">2026</p><h1 lang={t.contentLang}>{t.headline}</h1><p className="screen-season">Season’s Greetings</p></>}
    {recipientLabel(params, true) && <p className="screen-recipient">{recipientLabel(params, true)}</p>}
    <div className="screen-paragraphs">{messageOptions[params.message].paragraphIndexes.map(i => <p key={i} lang={t.contentLang}>{t.greeting[i]}</p>)}</div>
    <div className="screen-sender"><p>{sender.name}{params.lang === 'ko' ? ' 드림' : ''}</p>{sender.title && <p>{sender.title}</p>}{sender.signature && <img src={`${import.meta.env.BASE_URL}${sender.signature}`} alt={`${sender.name} 서명`} />}</div>
  </div></div>;
}
