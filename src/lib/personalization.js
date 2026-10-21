import { translations } from '../data/translations.js';
import { messageOptions, senders } from '../data/senders.js';

export const LIMITS = { to: 60, company: 100, senderName: 100, senderTitle: 60 };
const controls = /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g;
export const cleanText = (value, max = 100) => Array.from(String(value || '').replace(controls, '').trim()).slice(0, max).join('');
const pick = (value, object, fallback) => Object.hasOwn(object, value) ? value : fallback;

export function readPersonalization(search = '') {
  const q = new URLSearchParams(search);
  const from = q.get('from') === 'custom' ? 'custom' : pick(q.get('from'), senders, 'heerim');
  return {
    to: cleanText(q.get('to'), LIMITS.to),
    company: cleanText(q.get('company'), LIMITS.company) || '',
    lang: pick(q.get('lang'), translations, 'ko'),
    from,
    senderName: cleanText(q.get('senderName'), LIMITS.senderName) || '희림종합건축사사무소',
    senderTitle: cleanText(q.get('senderTitle'), LIMITS.senderTitle),
    message: pick(q.get('message'), messageOptions, senders[from]?.message || 'standard'),
  };
}

export function validateForm(values) {
  const errors = {};
  for (const key of (values.from === 'custom' ? ['senderName'] : [])) {
    if (!cleanText(values[key], LIMITS[key])) errors[key] = '필수 항목을 입력해 주세요.';
    else if (Array.from(String(values[key])).length > LIMITS[key]) errors[key] = `${LIMITS[key]}자 이내로 입력해 주세요.`;
  }
  if (!Object.hasOwn(translations, values.lang)) errors.lang = '전달 언어를 선택해 주세요.';
  return errors;
}

export function createGreetingUrl(values, pageUrl) {
  const url = new URL(pageUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('HTTP 또는 HTTPS 주소가 필요합니다.');
  url.hash = '';
  url.search = '';
  const normalized = readPersonalization(new URLSearchParams(values).toString());
  for (const key of ['lang', 'from', 'message']) url.searchParams.set(key, normalized[key]);
  for (const key of ['to', 'company']) if (normalized[key]) url.searchParams.set(key, normalized[key]);
  if (normalized.from === 'custom') {
    url.searchParams.set('senderName', normalized.senderName);
    if (normalized.senderTitle) url.searchParams.set('senderTitle', normalized.senderTitle);
  }
  return url.href;
}

export function recipientLabel(params, expanded = false) {
  if (!params.to && !params.company) return '';
  const company = params.company ? `${params.company}${params.lang === 'ko' && expanded ? '의 ' : ' · '}` : '';
  return `${company}${params.to}${params.lang === 'ko' ? (expanded ? ' 님께' : ' 님께') : ''}`;
}
