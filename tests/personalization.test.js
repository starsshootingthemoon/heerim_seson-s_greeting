import test from 'node:test';
import assert from 'node:assert/strict';
import { createGreetingUrl, readPersonalization, validateForm } from '../src/lib/personalization.js';
import { getTranslation, translations } from '../src/data/translations.js';
import { getSender } from '../src/data/senders.js';

const origin = 'https://starsshootingthemoon.github.io/heerim_seson-s_greeting/?old=value#generator';

test('한글·기호·국제 수신자 정보가 Pages 하위 경로에서 손실 없이 왕복합니다', () => {
  const form = { to: '김민선 & Əli', company: 'ABC / 建築 + Partners', lang: 'az', from: 'custom', senderName: '홍길동', senderTitle: '대표이사', message: 'brief' };
  const url = new URL(createGreetingUrl(form, origin));
  assert.equal(url.pathname, '/heerim_seson-s_greeting/');
  assert.equal(url.hash, '');
  assert.equal(url.searchParams.has('old'), false);
  const p = readPersonalization(url.search);
  for (const key of Object.keys(form)) assert.equal(p[key], form[key]);
  assert.equal(getSender(p).title, '대표이사');
});

test('알 수 없는 언어·발신자와 제어문자, 긴 입력을 안전하게 처리합니다', () => {
  const p = readPersonalization('?lang=__proto__&from=constructor&to=%00%0AKim&company=' + '가'.repeat(200));
  assert.equal(p.lang, 'ko'); assert.equal(p.from, 'heerim');
  assert.equal(p.to, 'Kim'); assert.equal(p.company.length, 100);
  assert.doesNotThrow(() => readPersonalization('?to=%E0%A4%A'));
  assert.throws(() => createGreetingUrl({}, 'javascript:alert(1)'));
});

test('공백 입력과 미입력 발신자를 검증합니다', () => {
  assert.deepEqual(Object.keys(validateForm({ to: ' ', company: '', lang: 'ko', from: 'custom', senderName: '' })), ['senderName']);
  assert.equal(Object.keys(validateForm({ to: 'Kim', company: 'ABC', lang: 'en', from: 'heerim' })).length, 0);
});

test('제공된 5개 언어 인사말을 표시하고 미제공 UI만 한국어로 폴백합니다', () => {
  for (const code of ['en', 'ru', 'vi', 'az']) {
    assert.equal(translations[code].status, 'partial');
    assert.equal(getTranslation(code).contentLang, code);
    assert.match(getTranslation(code).greeting[2], /2026/);
    assert.equal(getTranslation(code).ui.open, translations.ko.ui.open);
    assert.match(getTranslation(code).notice, /미제공 UI/);
  }
  assert.match(translations.ru.headline, /Поздравления/);
  assert.match(translations.vi.headline, /Lời chúc/);
  assert.ok(translations.vi.pendingReview.some(x => x.includes('Mã Đáo Thành Công')));
  assert.equal(Object.keys(translations).length, 5);
});
