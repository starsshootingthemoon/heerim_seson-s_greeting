// 공식 서명 파일이 제공되면 public/assets/ 에 넣고 signature에 상대 경로를 지정합니다.
// 승인되지 않은 서명이나 발신자 이름을 임의로 생성하지 않습니다.
export const senders = {
  heerim: {
    names: { ko: '(주)희림종합건축사사무소', en: 'Heerim Architects & Planners Co., Ltd.', az: 'Heerim Architects & Planners Co., Ltd.' },
    titles: { ko: '', en: '', az: '' },
    signature: null,
    message: 'standard',
  },
  ceo: {
    names: { ko: '희림종합건축사사무소', en: 'Heerim Architects & Planners Co., Ltd.', az: 'Heerim Architects & Planners Co., Ltd.' },
    titles: { ko: '대표이사', en: '', az: '' },
    signature: null,
    message: 'standard',
    reviewNote: '대표이사 성명·직책의 공식 다국어 표기 및 서명 수급 필요',
  },
};

export const messageOptions = {
  standard: { label: '기본 인사말', paragraphIndexes: [0, 1, 2] },
  brief: { label: '감사 인사말 (간략형)', paragraphIndexes: [0, 2] },
};

export function getSender(params) {
  if (params.from === 'custom') {
    return { name: params.senderName, title: params.senderTitle, signature: null };
  }
  const profile = senders[params.from] || senders.heerim;
  return {
    name: profile.names[params.lang] || profile.names.ko,
    title: profile.titles[params.lang] || '',
    signature: profile.signature,
  };
}
