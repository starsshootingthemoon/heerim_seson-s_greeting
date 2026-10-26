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
      // One continuous thread peels off the roof, winds around both towers, then rises.
      const P=(x,y)=>project([x,y]).map(v=>v.toFixed(2)).join(' ');
      const first=letters[0][0];
      const threadPath=document.createElementNS('http://www.w3.org/2000/svg','path');
      threadPath.setAttribute('d',`M ${P(533,465)} C ${P(385,445)} ${P(370,670)} ${P(600,720)} C ${P(880,780)} ${P(1070,820)} ${P(950,1040)} C ${P(800,1250)} ${P(380,1180)} ${P(430,930)} C ${P(470,720)} ${P(1050,510)} ${P(1030,800)} C ${P(1010,1080)} ${P(770,1140)} ${P(740,850)} C ${P(720,560)} ${P(640,400)} ${P(700,300)} C ${P(650,200)} ${first[0]+w*.2} ${first[1]+80} ${first[0]} ${first[1]}`);
      const threadLength=threadPath.getTotalLength();
      const thread=Array.from({length:360},(_,i)=>{const p=threadPath.getPointAtLength(threadLength*i/359);return [p.x,p.y];});
      const ranks=strokes.map(points=>{const y=points.reduce((v,p)=>v+p[1],0)/points.length;return clamp((y-project([0,465])[1])/(800*scale));});
      const letterLengths=letters.map(points=>points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0));
      const totalLetterLength=letterLengths.reduce((a,b)=>a+b,0);
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let beginning;
      const draw=now=>{
        if(disposed)return;beginning??=now;const t=reduced?20:(now-beginning)/1000;
        const unravel=clamp((t-3.6)/4),writing=clamp((t-7.6)/3.2);
        ctx.clearRect(0,0,w,h);ctx.lineCap='round';ctx.lineJoin='round';
        // The sketch stays in place. Strokes progressively unpick from the roof downward.
        if(unravel<1){
          ctx.beginPath();
          for(let i=0;i<strokes.length;i++){
            const points=strokes[i],reveal=clamp((t-i/strokes.length*.9)/2.3);
            const peeled=clamp((unravel-ranks[i]*.68)/.32),start=Math.floor(peeled*points.length),end=Math.ceil(points.length*reveal);
            for(let j=start;j<end;j++){if(j===start)ctx.moveTo(...points[j]);else ctx.lineTo(...points[j]);}
          }
          ctx.lineWidth=.65;ctx.strokeStyle='#edf3fa';ctx.globalAlpha=.67;ctx.shadowColor='#ccecff';ctx.shadowBlur=1.4;ctx.stroke();
        }
        if(t>=3.6&&writing<.3){
          const head=Math.min(359,Math.floor(ease(unravel)*359));
          const tail=Math.max(0,head-160+Math.floor(clamp(writing/.3)*160));
          if(tail<head){ctx.beginPath();for(let j=tail;j<=head;j++){if(j===tail)ctx.moveTo(...thread[j]);else ctx.lineTo(...thread[j]);}
            ctx.lineWidth=1.3;ctx.strokeStyle='#fff6df';ctx.globalAlpha=.95;ctx.shadowColor='#eef5ff';ctx.shadowBlur=8;ctx.stroke();}
          if(writing===0){const point=thread[head];ctx.beginPath();ctx.arc(point[0],point[1],1.6,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowBlur=12;ctx.fill();}
        }
        if(writing>0){
          let budget=writing*totalLetterLength,tip=null,previous=null;
          for(let i=0;i<letters.length;i++){
            if(budget<=0)break;
            const points=letters[i],local=clamp(budget/Math.max(1,letterLengths[i])),count=Math.max(1,Math.ceil(points.length*local));
            // Fine connecting strokes keep the feeling of a single travelling pen.
            if(previous){ctx.beginPath();ctx.moveTo(...previous);ctx.quadraticCurveTo((previous[0]+points[0][0])/2,Math.min(previous[1],points[0][1])-8,...points[0]);ctx.globalAlpha=.24;ctx.lineWidth=.5;ctx.strokeStyle='#fff5de';ctx.shadowBlur=1;ctx.stroke();}
            ctx.beginPath();for(let j=0;j<count;j++){if(j===0)ctx.moveTo(...points[j]);else ctx.lineTo(...points[j]);tip=points[j];}
            ctx.lineWidth=.9;ctx.strokeStyle='#fff5de';ctx.globalAlpha=.98;ctx.shadowColor='#e8d9b5';ctx.shadowBlur=3;ctx.stroke();
            previous=tip;budget-=letterLengths[i];
          }
          if(tip&&writing<1){ctx.beginPath();ctx.arc(tip[0],tip[1],1.1,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowBlur=8;ctx.fill();}
        }
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        if(writing===1){onComplete();return;}frame=requestAnimationFrame(draw);
      };frame=requestAnimationFrame(draw);
    }start();return()=>{disposed=true;cancelAnimationFrame(frame);};
  }, [onComplete]);
  return <canvas ref={canvas} className="outline-canvas" aria-label="건물 선화가 실처럼 풀려 건물을 휘감고 2026 Season’s Greetings를 그리는 모션" role="img" />;
}

export default function OutlineGreeting(){
  const [params,setParams]=useState(()=>readPersonalization(location.search));const[done,setDone]=useState(false);const[run,setRun]=useState(0);
  const complete=React.useCallback(()=>setDone(true),[]);
  useEffect(()=>{document.documentElement.lang=params.lang;},[params.lang]);
  return <main className={`outline-greeting one-screen${done ? ' is-complete' : ''}`}><img className="outline-backdrop" src={`${import.meta.env.BASE_URL}assets/v2/architecture-dusk.webp`} alt=""/><header className="motion-header"><Logo light className="motion-logo"/><nav aria-label="언어 선택">{languages.map(l=><button key={l.code} aria-pressed={params.lang===l.code} onClick={()=>{const u=new URL(location.href);u.searchParams.set('lang',l.code);history.replaceState({},'',u);setParams(p=>({...p,lang:l.code}));}}>{l.short}</button>)}</nav></header><Morph key={run} onComplete={complete}/><div className={`outline-copy-stage ${done?'is-ready':''}`}><ScreenCopy params={params} hideHeading/></div><footer className="motion-caption"><Logo light className="motion-caption-logo"/><div className="footer-controls"><HomeLink /><button className="completion-replay" onClick={()=>{setDone(false);setRun(r=>r+1);}}>연출 다시 보기</button></div></footer></main>;
}
