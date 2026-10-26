import HomeLink from './HomeLink.jsx';
import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import ScreenCopy from './ScreenCopy.jsx';
import { readPersonalization } from './lib/personalization.js';
import { languages } from './data/translations.js';
import './outline.css';
import lettering from './data/morph-lettering.json';

function Morph({ onComplete }) {
  const canvas = useRef(null);
  useEffect(() => {
    let frame, disposed = false;
    async function start() {
      await document.fonts.ready; if (disposed) return;
      const c=canvas.current, ctx=c.getContext('2d');
      const w=c.clientWidth,h=c.clientHeight,dpr=Math.min(devicePixelRatio,2);c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);
      const scale=Math.max(w/1400,h/1370),ox=(w-1400*scale)/2,oy=(h-1370*scale)/2;
      const project=([x,y])=>[ox+x*scale,oy+y*scale];
      const outlines=[[[449,1208],[459,532],[533,465],[675,579],[724,648],[751,1120]],[[533,465],[535,1125]],[[818,1121],[818,703],[825,675],[903,616],[943,624],[994,681],[1005,1168]],[[449,1158],[627,1118],[825,1127],[1004,1169]]];
      for(let y=650;y<1100;y+=75)outlines.push([[460,y],[533,y-52],[733,y+81]]);
      const edges=[];for(const a of outlines)for(let i=1;i<a.length;i++)edges.push([project(a[i-1]),project(a[i])]);
      const textScale=Math.min((w*.90)/900,.85),textY=88;
      const curves=lettering.map((glyph,i)=>{
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',glyph.d);const len=path.getTotalLength();
        const target=Array.from({length:80},(_,j)=>{const p=path.getPointAtLength(len*j/79);return [(w-900*textScale)/2+(glyph.x+p.x*glyph.scale)*textScale,textY+(glyph.y-p.y*glyph.scale)*textScale];});
        const [a,b]=edges[i%edges.length];return {target,source:target.map((_,j)=>[a[0]+(b[0]-a[0])*j/79,a[1]+(b[1]-a[1])*j/79])};
      });
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let beginning;
      const draw=now=>{if(disposed)return;beginning??=now;const t=reduced?9:(now-beginning)/1000,raw=Math.min(1,Math.max(0,(t-3.3)/3.5)),p=raw*raw*(3-2*raw);ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
        for(let i=0;i<curves.length;i++){
          const line=curves[i],progress=t<3.3?Math.min(1,Math.max(0,(t-i/curves.length*.9)/1.8)):1;if(!progress)continue;
          const count=Math.max(2,Math.floor(progress*80));ctx.beginPath();
          for(let j=0;j<count;j++){const a=line.source[j],b=line.target[j];const bend=Math.sin(p*Math.PI)*Math.sin(i*.9)*w*.06;const x=a[0]+(b[0]-a[0])*p+bend,y=a[1]+(b[1]-a[1])*p;if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
          ctx.strokeStyle=p===1?'#fff5de':'#eef7ff';ctx.lineWidth=p===1?.85:1.1;ctx.shadowColor='#ccecff';ctx.shadowBlur=p===1?3:8;ctx.globalAlpha=p===1?.95:.72;ctx.stroke();
        }
        ctx.shadowBlur=0;ctx.globalAlpha=1;if(p===1){onComplete();return;}frame=requestAnimationFrame(draw);
      };frame=requestAnimationFrame(draw);
    }start();return()=>{disposed=true;cancelAnimationFrame(frame);};
  }, [onComplete]);
  return <canvas ref={canvas} className="outline-canvas" aria-label="건물 외곽을 따라 그려진 빛의 선이 2026 Season’s Greetings 글자 외곽선으로 이어지는 모션" role="img" />;
}

export default function OutlineGreeting(){
  const [params,setParams]=useState(()=>readPersonalization(location.search));const[done,setDone]=useState(false);const[run,setRun]=useState(0);
  const complete=React.useCallback(()=>setDone(true),[]);
  useEffect(()=>{document.documentElement.lang=params.lang;},[params.lang]);
  return <main className="outline-greeting one-screen"><img className="outline-backdrop" src={`${import.meta.env.BASE_URL}assets/v2/architecture-dusk.webp`} alt=""/><header className="motion-header"><Logo light className="motion-logo"/><nav aria-label="언어 선택">{languages.map(l=><button key={l.code} aria-pressed={params.lang===l.code} onClick={()=>{const u=new URL(location.href);u.searchParams.set('lang',l.code);history.replaceState({},'',u);setParams(p=>({...p,lang:l.code}));}}>{l.short}</button>)}</nav></header><Morph key={run} onComplete={complete}/><div className={`outline-copy-stage ${done?'is-ready':''}`}><ScreenCopy params={params} hideHeading/></div><footer className="motion-caption"><Logo light className="motion-caption-logo"/><div className="footer-controls"><HomeLink /><button className="completion-replay" onClick={()=>{setDone(false);setRun(r=>r+1);}}>연출 다시 보기</button></div></footer></main>;
}
