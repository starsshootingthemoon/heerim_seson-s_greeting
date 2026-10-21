// 기존 공식 연하장과 Figma에 제공된 문구만 사용합니다.
// locale을 추가할 때 이 객체에 데이터를 추가하면 메뉴에도 자동 반영됩니다.
export const translations = {
  ko: {
    label: '한국어', short: 'KR', status: 'provided',
    source: 'Figma 31:19295 / 제공된 2026 한국어 연하장. 연도만 2026로 변경.',
    pendingReview: ['2026년 최종 문구 검수'],
    headline: '새로운 해,\n함께 그리는 내일',
    year: '정미년 · 붉은 양의 해',
    greeting: [
      '한 해 동안 보내주신 성원에\n깊이 감사드립니다.',
      '희림은 해외 시장에서 끊임없이 도전하며,\n모듈러 건축의 혁신과 스마트 기술의 융합으로\n새로운 지평을 열어가고 있습니다.',
      '2026년, 희림과 함께 성장하는 한 해가 되시길 기원합니다.',
    ],
    ui: {
      open: '새해 인사 열어보기', tag: '당신과 함께 만들어갈 새로운 한 해',
      back: '봉투로 돌아가기', create: '연하장 링크 만들기',
    },
  },
  en: {
    label: '영어', short: 'EN', status: 'partial',
    source: '사용자가 제공한 영어 공식 연하장 이미지. 2026 → 2026 연도 치환.',
    pendingReview: ['2026년용 번역 검수', '진입 화면·UI 번역'],
    headline: 'Season’s Greetings', year: null, ui: null,
    greeting: [
      'We extend our sincere gratitude for your continued support throughout the year.',
      'At Heerim, we continue to embrace new challenges around the world, while opening new horizons through innovation in modular architecture and the integration of smart technologies.',
      'May 2026 bring you growth, prosperity, and shared success with Heerim.',
    ],
  },
  ru: {
    label: '러시아어', short: 'RU', status: 'partial',
    source: '사용자가 제공한 러시아어 공식 GIF 연하장. 2026 → 2026 연도 치환.',
    pendingReview: ['2026년용 번역 검수', '진입 화면·UI 번역'],
    headline: 'Поздравления с наступающим\nновым годом', year: null, ui: null,
    greeting: [
      'Мы выражаем искреннюю благодарность за Вашу неизменную поддержку на протяжении всего года.',
      'Компания Heerim продолжает смело выходить на международные рынки, открывая новые горизонты благодаря инновациям в модульной архитектуре и интеграции современных интеллектуальных технологий.',
      'Пусть 2026 год принесёт Вам рост, процветание и совместные успехи вместе с Heerim.',
    ],
  },
  vi: {
    label: '베트남어', short: 'VI', status: 'partial',
    source: '사용자가 제공한 베트남어 공식 GIF 연하장. 2026 → 2026 연도 치환.',
    pendingReview: ['2026년용 번역 검수', '진입 화면·UI 번역', '원문의 Mã Đáo Thành Công 표현과 붉은 양 콘셉트의 적합성 검수'],
    headline: 'Lời chúc mừng năm mới', year: null, ui: null,
    greeting: [
      'Chúng tôi vô cùng trân trọng sự ủng hộ của Quý vị trong suốt năm qua.',
      'Heerim không ngừng đón nhận thử thách trên thị trường toàn cầu, và mở ra những chân trời mới thông qua sự kết hợp giữa sự đột phá trong kiến trúc mô đun và tích hợp công nghệ thông minh.',
      'Chúc Quý vị năm mới 2026 là một năm Mã Đáo Thành Công cùng Heerim.',
    ],
  },
  az: {
    label: '아제르바이잔어', short: 'AZ', status: 'partial',
    source: '사용자가 제공한 아제르바이잔어 공식 GIF 연하장. 2026 → 2026 연도 치환.',
    pendingReview: ['2026년용 번역 검수', '진입 화면·UI 번역'],
    headline: 'Yeni il təbriki', year: null, ui: null,
    greeting: [
      'Bu il ərzində göstərdiyiniz böyük dəstək üçün Sizə dərin minnətdarlığımızı bildiririk.',
      'Heerim, modul bina memarlığında innovasiyalar və müasir ağıllı texnologiyaların inteqrasiyası vasitəsilə yeni üfüqlər açaraq beynəlxalq bazarlara cəsarətlə daxil olmağa davam edir.',
      '2026-ci il sizə Heerim ilə birgə yüksəliş, rifah və uğur gətirsin.',
    ],
  },
};

export const languages = Object.entries(translations).map(([code, data]) => ({ code, ...data }));

export function getTranslation(code) {
  const locale = translations[code] || translations.ko;
  return {
    ...locale,
    headline: locale.headline || translations.ko.headline,
    year: locale.year || translations.ko.year,
    greeting: locale.greeting || translations.ko.greeting,
    contentLang: locale.greeting ? code : 'ko',
    ui: { ...translations.ko.ui, ...locale.ui },
    notice: locale.status === 'pending'
      ? `${locale.label} 번역 검수 대기 · 현재 한국어 인사말을 표시합니다.`
      : locale.status === 'partial'
        ? `${locale.label} 인사말은 제공된 기존 문구를 반영했습니다. 2026년용 검수 전이며, 미제공 UI는 한국어로 표시합니다.`
        : '',
  };
}
