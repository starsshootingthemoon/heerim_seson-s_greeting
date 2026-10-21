import React, { useEffect, useRef, useState } from 'react';
import { getTranslation, languages, translations } from './data/translations.js';
import { getSender, messageOptions, senders } from './data/senders.js';
import { createGreetingUrl, LIMITS, readPersonalization, recipientLabel, validateForm } from './lib/personalization.js';
import { copyLink, shareLink } from './lib/share.js';

const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
const pageUrl = () => new URL(import.meta.env.BASE_URL, window.location.origin).href;
const locationState = () => ({ params: readPersonalization(window.location.search), view: window.location.hash === '#generator' ? 'generator' : window.location.hash === '#greeting' ? 'greeting' : 'cover' });

function Header({ lang, onLanguage }) {
  return <header className="card-header">
    <a className="wordmark" href={import.meta.env.BASE_URL} aria-label="HEERIM 2027 연하장 첫 화면">heerim</a>
    <nav className="language-menu" aria-label="연하장 언어 선택">
      {languages.map(({ code, short, label }) => <button key={code} type="button" lang="en" aria-label={label} aria-pressed={lang === code} onClick={() => onLanguage(code)}>{short}</button>)}
    </nav>
  </header>;
}

function TranslationNotice({ lang }) {
  const t = getTranslation(lang);
  return t.notice ? <p className="translation-notice" role="status" lang="ko">{t.notice}</p> : null;
}

function Envelope({ opening }) {
  return <div className={`envelope-scene${opening ? ' is-opening' : ''}`} aria-hidden="true">
    <div className="envelope-back asset-layer"><img src={asset('envelope-back.svg')} width="316.194" height="307.16" alt="" /></div>
    <div className="envelope-card">
      <p>H A P P Y&nbsp;&nbsp; N E W&nbsp;&nbsp; Y E A R</p>
      <div className="envelope-sheep asset-layer"><img src={asset('sheep.svg')} width="215.012" height="149.966" alt="" fetchPriority="high" /></div>
    </div>
    <div className="envelope-front asset-layer"><img src={asset('envelope-front.svg')} width="316.194" height="185.199" alt="" /></div>
    <span className="for-you">FOR YOU</span>
  </div>;
}

function Cover({ params, onOpen, opening, onLanguage }) {
  const t = getTranslation(params.lang);
  return <article className={`greeting-card cover${opening ? ' opening' : ''}`}>
    <Header lang={params.lang} onLanguage={onLanguage} />
    <div className="cover-intro">
      <p className="eyebrow" lang="en">A NEW YEAR, FOR YOU</p>
      <h1 className="year-title">2027</h1>
      <p className="year-caption" lang={params.lang === 'ko' ? 'ko' : t.year === translations.ko.year ? 'ko' : params.lang}>{t.year}</p>
    </div>
    <Envelope opening={opening} />
    <p className="cover-recipient">{recipientLabel(params)}</p>
    <button className="primary open-button" onClick={onOpen} disabled={opening}>{opening ? '인사를 열고 있습니다…' : t.ui.open} <span aria-hidden="true">↗</span></button>
    <p className="cover-tagline">{t.ui.tag}</p>
    <TranslationNotice lang={params.lang} />
    <footer className="card-footer" lang="en">HEERIM ARCHITECTS &amp; PLANNERS</footer>
  </article>;
}

function Greeting({ params, onLanguage, headingRef }) {
  const t = getTranslation(params.lang);
  const sender = getSender(params);
  const paragraphs = messageOptions[params.message].paragraphIndexes.map(i => t.greeting[i]);
  return <article className="greeting-card greeting-view">
    <Header lang={params.lang} onLanguage={onLanguage} />
    <div className="greeting-heading">
      <p className="to-line">TO. {params.to}{params.lang === 'ko' ? ' 님' : ''}</p>
      <h1 ref={headingRef} tabIndex={-1} lang={t.contentLang}>{t.headline}</h1>
      <p className="sheep-year" lang="en">2027 · THE YEAR OF THE RED SHEEP</p>
    </div>
    <div className="greeting-sheep asset-layer"><img src={asset('sheep.svg')} width="215.012" height="149.966" alt="2027 붉은 양 일러스트레이션" /></div>
    <div className="personalized-message">
      <p className="message-recipient">{recipientLabel(params, true)}</p>
      {paragraphs.map((p, i) => <p className="message-paragraph reveal" lang={t.contentLang} key={`${params.lang}-${i}`}>{p}</p>)}
      <div className="sender-block reveal">
        <p className="sender-name">{sender.name}{params.lang === 'ko' ? ' 드림' : ''}</p>
        {sender.title && <p className="sender-title">{sender.title}</p>}
        {sender.signature && <img className="signature" src={`${import.meta.env.BASE_URL}${sender.signature}`} alt={`${sender.name} 서명`} loading="lazy" />}
      </div>
    </div>
    <TranslationNotice lang={params.lang} />
    <figure className="architecture">
      <picture style={{ maskImage: `url("${asset('architecture-mask.svg')}")` }}><source srcSet={asset('architecture.webp')} type="image/webp" /><img src={asset('architecture.png')} width="1536" height="1024" loading="lazy" decoding="async" alt="희림건축 정부대전지방합동청사 건축 이미지의 붉은 하프톤" /></picture>
      <figcaption>HEERIM</figcaption>
    </figure>
  </article>;
}

function CompleteModal({ open, onClose, url }) {
  const dialog = useRef(null);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (open && !dialog.current.open) { setStatus(''); dialog.current.showModal(); }
    else if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  async function copy() {
    const copied = await copyLink(url);
    setStatus(copied ? '링크를 복사했습니다.' : '자동 복사가 제한되었습니다. 아래 링크를 선택하여 직접 복사해 주세요.');
  }
  async function share() {
    const result = await shareLink(url);
    setStatus({ copied: '이 환경에서는 공유 대신 링크를 복사했습니다.', manual: '공유가 제한되었습니다. 링크를 직접 복사해 주세요.', shared: '공유를 완료했습니다.', cancelled: '' }[result]);
  }
  return <dialog ref={dialog} className="completion-modal" aria-labelledby="complete-title" onClose={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }}>
    <h2 id="complete-title">연하장 링크 생성 완료</h2>
    <p>아래 버튼을 통해 공유할 수 있습니다.</p>
    <div className="modal-actions">
      <button type="button" className="primary" onClick={copy} autoFocus>링크 복사</button>
      <button type="button" className="share-button" aria-label="연하장 링크 공유" onClick={share}><img src={asset('share.svg')} width="55.185" height="49.053" alt="" /></button>
    </div>
    <p className="live-status" role="status" aria-live="polite">{status}</p>
    {status.includes('직접 복사') && <input aria-label="직접 복사할 연하장 링크" value={url} readOnly onFocus={e => e.target.select()} />}
    <button type="button" className="text-button modal-close" onClick={onClose}>닫기</button>
  </dialog>;
}

function Generator({ initialParams }) {
  const [form, setForm] = useState({ ...initialParams, to: '', company: '', from: 'heerim', senderName: '', senderTitle: '' });
  const [errors, setErrors] = useState({});
  const [generated, setGenerated] = useState('');
  const [completed, setCompleted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState('');
  const formRef = useRef(null);
  const submitRef = useRef(null);
  const onChange = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); setErrors(err => ({ ...err, [name]: '' })); };
  const changeLanguage = lang => setForm(f => ({ ...f, lang }));
  function submit(e) {
    e.preventDefault();
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.querySelector(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus();
      return;
    }
    setGenerated(createGreetingUrl(form, pageUrl()));
    setShowPreview(false); setStatus(''); setCompleted(true);
  }
  const closeModal = () => { setCompleted(false); submitRef.current?.focus(); };
  function input(name, label, placeholder, required = false) {
    return <div className="field">
      <label htmlFor={name}>{label}{required && <span className="sr-only"> (필수)</span>}</label>
      <input id={name} name={name} value={form[name]} onChange={onChange} maxLength={LIMITS[name]} placeholder={placeholder} autoComplete={name === 'company' ? 'organization' : 'off'} required={required} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />
      {errors[name] && <p className="field-error" id={`${name}-error`}>{errors[name]}</p>}
    </div>;
  }
  return <section className="generator-page">
    <form className="generator-form" ref={formRef} onSubmit={submit} noValidate>
      <p className="studio-label" lang="en">HEERIM / GREETING STUDIO</p>
      <h1>연하장 생성</h1>
      <p className="form-intro">수신자와 전달 언어를 선택하면<br />준비된 언어별 인사말을 적용합니다.</p>
      {input('to', '01  받는 분', '김민선', true)}
      {input('company', '02  회사명', 'ABC 건축', true)}
      <fieldset className="language-field">
        <legend>03  전달 언어</legend>
        <div className="language-options">
          {languages.map(({ code, label, status: translationStatus }, index) => <React.Fragment key={code}><label className={`language-option${form.lang === code ? ' selected' : ''}`}>
            <input type="radio" name="lang" value={code} checked={form.lang === code} onChange={() => changeLanguage(code)} aria-describedby="language-review" />
            <span>{label}{translationStatus === 'pending' && <span className="sr-only"> (번역 검수 대기)</span>}</span>
          </label>{index === 1 && <span className="language-row-break" aria-hidden="true" />}</React.Fragment>)}
        </div>
        <p className="field-help" id="language-review">{form.lang === 'ko' ? '검수된 번역문을 적용하며, 자동 번역과 구분하여 운영합니다.' : getTranslation(form.lang).notice}</p>
      </fieldset>
      <div className="field">
        <label htmlFor="from">04  보내는 분</label>
        <select id="from" name="from" value={form.from} onChange={onChange}>
          {Object.entries(senders).map(([id, sender]) => <option key={id} value={id}>{sender.names.ko}{sender.titles.ko ? ` · ${sender.titles.ko}` : ''}</option>)}
          <option value="custom">이름·소속 직접 입력</option>
        </select>
      </div>
      {form.from === 'custom' && <div className="custom-sender">{input('senderName', '보내는 분 이름 또는 소속', '예: 희림종합건축사사무소', true)}{input('senderTitle', '직책 (선택)', '예: 대표이사')}</div>}
      <details className="message-options">
        <summary>발신자 인사말 선택</summary>
        <label className="sr-only" htmlFor="message">인사말</label>
        <select id="message" name="message" value={form.message} onChange={onChange}>
          {Object.entries(messageOptions).map(([id, message]) => <option key={id} value={id}>{message.label}</option>)}
        </select>
      </details>
      <button type="submit" className="primary generate-button" ref={submitRef}>맞춤 연하장 링크 생성 <span aria-hidden="true">↗</span></button>
      <section className="generated-section" aria-label="생성된 연하장 링크">
        <h2>{generated ? '생성된 링크' : '생성 링크 미리보기'}</h2>
        <p className="generated-url">{generated || '정보를 입력하면 이곳에 맞춤 링크를 표시합니다.'}</p>
        {generated && <>
          <div className="generated-actions">
            <button className="text-button" type="button" onClick={async () => setStatus(await copyLink(generated) ? '링크를 복사했습니다.' : '복사가 제한되어 있습니다. 표시된 URL을 직접 복사해 주세요.')}>링크 복사</button>
            <button className="text-button" type="button" onClick={() => setCompleted(true)}>공유</button>
            <a href={generated} target="_blank" rel="noreferrer">새 창에서 보기 ↗</a>
            <button className="text-button" type="button" aria-expanded={showPreview} onClick={() => setShowPreview(v => !v)}>연하장 미리보기 {showPreview ? '접기' : '열기'}</button>
          </div>
          <p role="status" className="live-status">{status}</p>
        </>}
      </section>
      <p className="privacy-note">이름과 회사명은 링크에 포함됩니다. 공개 가능한 정보만 입력해 주세요. 입력 정보는 서버나 브라우저 저장소에 저장하지 않습니다.</p>
    </form>
    {generated && showPreview && <div className="preview-shell"><iframe title="생성된 개인화 연하장 미리보기" src={generated} loading="lazy" /></div>}
    <CompleteModal open={completed} onClose={closeModal} url={generated} />
  </section>;
}

export default function App() {
  const [location, setLocation] = useState(locationState);
  const [opening, setOpening] = useState(false);
  const timer = useRef(null);
  const heading = useRef(null);
  const { params, view } = location;
  useEffect(() => {
    const sync = () => { setLocation(locationState()); setOpening(false); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', sync); window.addEventListener('popstate', sync);
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync); clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    document.documentElement.lang = getTranslation(params.lang).contentLang;
    if (view === 'greeting') heading.current?.focus({ preventScroll: true });
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, [params.lang, view]);
  function onLanguage(lang) {
    const url = new URL(window.location.href); url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
    setLocation(s => ({ ...s, params: { ...s.params, lang } }));
  }
  function openGreeting() {
    if (opening) return;
    setOpening(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
    timer.current = window.setTimeout(() => { window.location.hash = 'greeting'; }, delay);
  }
  return <>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); document.getElementById('main').focus(); }}>본문으로 바로가기</a>
    <main id="main" tabIndex={-1} className={view === 'generator' ? 'generator-layout' : 'card-layout'}>
      {view === 'generator' ? <Generator initialParams={params} /> : view === 'greeting' ? <Greeting params={params} onLanguage={onLanguage} headingRef={heading} /> : <Cover params={params} onLanguage={onLanguage} onOpen={openGreeting} opening={opening} />}
    </main>
    <nav className="utility-nav" aria-label="연하장 추가 메뉴">
      {view === 'greeting' && <a href="#">{getTranslation(params.lang).ui.back}</a>}
      {view === 'generator' ? <a href={import.meta.env.BASE_URL}>연하장 첫 화면</a> : <a href="#generator">{getTranslation(params.lang).ui.create}</a>}
    </nav>
  </>;
}
