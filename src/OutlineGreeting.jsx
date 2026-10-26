import HomeLink from './HomeLink.jsx';
import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import ScreenCopy from './ScreenCopy.jsx';
import { readPersonalization } from './lib/personalization.js';
import { languages } from './data/translations.js';
import './outline.css';
import lettering from './data/morph-lettering.json';
import sketch from './data/building-sketch.json';

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
      const strokes=sketch.map(points=>points.map(project));
      const textScale=Math.min((w*.90)/900,.85),textY=88;
      const letters=lettering.map(glyph=>{
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',glyph.d);const len=path.getTotalLength();
        return Array.from({length:64},(_,j)=>{const p=path.getPointAtLength(len*j/63);return [(w-900*textScale)/2+(glyph.x+p.x*glyph.scale)*textScale,textY+(glyph.y-p.y*glyph.scale)*textScale];});
      });
      const clamp=x=>Math.min(1,Math.max(0,x)),ease=x=>x*x*(3-2*x);
      const hub=[w*.5,textY+160*textScale];
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let beginning;
      const draw=now=>{
        if(disposed)return;beginning??=now;const t=reduced?10:(now-beginning)/1000;
        ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
        // Architectural sketch strokes collect into one stream, rather than mapping to letters.
        if(t<6.5){
          const gather=ease(clamp((t-4.3)/2.2));ctx.beginPath();
          for(let i=0;i<strokes.length;i++){
            const points=strokes[i],reveal=clamp((t-i/strokes.length*.9)/2.3),count=Math.ceil(points.length*reveal);
            for(let j=0;j<count;j++){
              const a=points[j],angle=i*.61+j/Math.max(1,points.length-1)*1.8;
              const radius=Math.sin(gather*Math.PI)*(14+18*(i%5)/5);
              const x=a[0]*(1-gather)+hub[0]*gather+Math.cos(angle)*radius;
              const y=a[1]*(1-gather)+hub[1]*gather+Math.sin(angle)*radius*.6;
              if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
            }
          }
          ctx.lineWidth=.65;ctx.strokeStyle='#edf3fa';ctx.globalAlpha=.67*(1-gather*.85);ctx.shadowColor='#ccecff';ctx.shadowBlur=1.4;ctx.stroke();
        }
        // The collected ribbon becomes the pen that writes a single title.
        const writing=clamp((t-6.4)/2.7);
        if(t>=5.1&&writing<1){
          const flow=clamp((t-5.1)/2.2),to=letters[0][0];ctx.beginPath();ctx.moveTo(hub[0],hub[1]);
          ctx.bezierCurveTo(hub[0]+w*.17,hub[1]+55,hub[0]-w*.12,hub[1]-90,hub[0]+(to[0]-hub[0])*flow,hub[1]+(to[1]-hub[1])*flow);
          ctx.lineWidth=1.25;ctx.globalAlpha=Math.sin(flow*Math.PI)*.85;ctx.shadowBlur=8;ctx.strokeStyle='#fff5df';ctx.stroke();
        }
        if(writing>0){
          ctx.beginPath();
          for(let i=0;i<letters.length;i++){
            const points=letters[i],local=clamp(writing*1.35-i/letters.length*.35),count=Math.ceil(points.length*local);
            for(let j=0;j<count;j++){if(j===0)ctx.moveTo(...points[j]);else ctx.lineTo(...points[j]);}
          }
          ctx.lineWidth=.9;ctx.strokeStyle='#fff5de';ctx.globalAlpha=.98;ctx.shadowColor='#e8d9b5';ctx.shadowBlur=3;ctx.stroke();
        }
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        if(writing===1){onComplete();return;}frame=requestAnimationFrame(draw);
      };frame=requestAnimationFrame(draw);
    }start();return()=>{disposed=true;cancelAnimationFrame(frame);};
  }, [onComplete]);
  return <canvas ref={canvas} className="outline-canvas" aria-label="건축 선화가 하나의 빛 흐름으로 모인 뒤 2026 Season’s Greetings를 그리는 모션" role="img" />;
}

export default function OutlineGreeting(){
  const [params,setParams]=useState(()=>readPersonalization(location.search));const[done,setDone]=useState(false);const[run,setRun]=useState(0);
  const complete=React.useCallback(()=>setDone(true),[]);
  useEffect(()=>{document.documentElement.lang=params.lang;},[params.lang]);
  return <main className={`outline-greeting one-screen${done ? ' is-complete' : ''}`}><img className="outline-backdrop" src={`${import.meta.env.BASE_URL}assets/v2/architecture-dusk.webp`} alt=""/><header className="motion-header"><Logo light className="motion-logo"/><nav aria-label="언어 선택">{languages.map(l=><button key={l.code} aria-pressed={params.lang===l.code} onClick={()=>{const u=new URL(location.href);u.searchParams.set('lang',l.code);history.replaceState({},'',u);setParams(p=>({...p,lang:l.code}));}}>{l.short}</button>)}</nav></header><Morph key={run} onComplete={complete}/><div className={`outline-copy-stage ${done?'is-ready':''}`}><ScreenCopy params={params} hideHeading/></div><footer className="motion-caption"><Logo light className="motion-caption-logo"/><div className="footer-controls"><HomeLink /><button className="completion-replay" onClick={()=>{setDone(false);setRun(r=>r+1);}}>연출 다시 보기</button></div></footer></main>;
}
