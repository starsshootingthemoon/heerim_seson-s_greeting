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
      // Tight perspective helices cling to the tower volumes, not free-floating sky loops.
      const first=letters[0][0],route=[];
      const add=(x,y,depth=1)=>route.push([...project([x,y]),depth]);
      for(let i=0;i<=20;i++){const t=i/20;add(533+(470-533)*t,465+85*t);}
      for(let i=1;i<=160;i++){
        const t=i/160,a=Math.PI+Math.PI*5*t;
        const radius=125+12*t;
        add(595+radius*Math.cos(a),550+505*t+32*Math.sin(a),Math.sin(a));
      }
      const lower=document.createElementNS('http://www.w3.org/2000/svg','path');
      const start=route[route.length-1],at=project([805,1120]);
      lower.setAttribute('d',`M ${start[0]} ${start[1]} Q ${project([770,1190]).join(' ')} ${at.join(' ')}`);
      for(let i=1;i<=30;i++){const p=lower.getPointAtLength(lower.getTotalLength()*i/30);route.push([p.x,p.y,1]);}
      for(let i=1;i<=160;i++){
        const t=i/160,a=Math.PI+Math.PI*4*t;
        add(910+(105-15*t)*Math.cos(a),1120-425*t+27*Math.sin(a),Math.sin(a));
      }
      const rise=document.createElementNS('http://www.w3.org/2000/svg','path'),last=route[route.length-1];
      rise.setAttribute('d',`M ${last[0]} ${last[1]} Q ${project([820,640]).join(' ')} ${project([903,616]).join(' ')} C ${project([905,540]).join(' ')} ${first[0]+w*.13} ${first[1]+55} ${first[0]} ${first[1]}`);
      for(let i=1;i<=90;i++){const p=rise.getPointAtLength(rise.getTotalLength()*i/90);route.push([p.x,p.y,1]);}
      const lengths=[0];for(let i=1;i<route.length;i++)lengths.push(lengths[i-1]+Math.hypot(route[i][0]-route[i-1][0],route[i][1]-route[i-1][1]));
      const total=lengths[lengths.length-1];let cursor=1;
      const thread=Array.from({length:360},(_,i)=>{const d=total*i/359;while(cursor<lengths.length-1&&lengths[cursor]<d)cursor++;const a=route[cursor-1],b=route[cursor],t=(d-lengths[cursor-1])/Math.max(.001,lengths[cursor]-lengths[cursor-1]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];});
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
          if(tail<head){
            for(const front of [false,true]){
              ctx.beginPath();let connected=false;
              for(let j=tail;j<=head;j++){
                const point=thread[j],visible=front?point[2]>=0:point[2]<0;
                if(!visible){connected=false;continue;}
                if(!connected){ctx.moveTo(point[0],point[1]);connected=true;}else ctx.lineTo(point[0],point[1]);
              }
              ctx.lineWidth=front?1.2:.7;ctx.strokeStyle='#fff6df';ctx.globalAlpha=front?.95:.09;ctx.shadowColor='#eef5ff';ctx.shadowBlur=front?6:0;ctx.stroke();
            }
          }
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
