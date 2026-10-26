import React, { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import ScreenCopy from './ScreenCopy.jsx';
import { readPersonalization } from './lib/personalization.js';
import { languages } from './data/translations.js';
import './outline.css';

function Morph({ onComplete }) {
  const canvas = useRef(null);
  useEffect(() => {
    let frame, disposed = false;
    async function start() {
      await document.fonts.ready; if (disposed) return;
      const c=canvas.current, ctx=c.getContext('2d'); c.width=900; c.height=400;
      const mask=document.createElement('canvas');mask.width=900;mask.height=400;
      const m=mask.getContext('2d');m.fillStyle='#fff';m.textAlign='center';m.font='140px "Cormorant Garamond"';m.fillText('2026',450,180);m.font='54px "Cormorant Garamond"';m.fillText('Season’s Greetings',450,280);
      const data=m.getImageData(0,0,900,400).data, targets=[];
      for(let y=35;y<310;y+=4)for(let x=100;x<800;x+=4)if(data[(y*900+x)*4+3]>140)targets.push([x,y]);
      const paths=[[[210,355],[210,120],[275,65],[385,145],[385,355]],[[495,355],[495,165],[545,122],[595,135],[640,176],[640,355]],[[180,355],[670,355]]];
      for(let y=170;y<350;y+=25){paths.push([[212,y],[275,y-40],[384,y+25]]);paths.push([[497,y+15],[552,y-10],[640,y+20]]);}
      const segments=[];for(const points of paths)for(let i=1;i<points.length;i++)segments.push([points[i-1],points[i]]);
      const seeds=targets.map((_,i)=>{const [a,b]=segments[i%segments.length];const u=((i*73)%997)/997;return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u];});
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let beginning;
      const draw=now=>{if(disposed)return;beginning??=now;const t=reduced?8:(now-beginning)/1000;const raw=Math.min(1,Math.max(0,(t-2.4)/3.2)),p=raw*raw*(3-2*raw);ctx.clearRect(0,0,900,400);
        ctx.strokeStyle=`rgba(216,232,242,${Math.max(0,1-p)})`;ctx.lineWidth=1.2;
        for(let i=0;i<segments.length;i++){if(t<2.4&&i/segments.length>t/2.4)continue;const[a,b]=segments[i];ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();}
        ctx.fillStyle='#f5e8cf';ctx.shadowColor='#e9d8b0';ctx.shadowBlur=5;
        for(let i=0;i<targets.length;i++){if(t<2.4)continue;const a=seeds[i],b=targets[i];const bend=Math.sin(p*Math.PI)*Math.sin(i*1.7)*22;ctx.globalAlpha=.9;ctx.fillRect(a[0]+(b[0]-a[0])*p+bend,a[1]+(b[1]-a[1])*p,2.3,2.3);}
        ctx.globalAlpha=1;ctx.shadowBlur=0;
        if(p===1){onComplete();return;}frame=requestAnimationFrame(draw);
      };frame=requestAnimationFrame(draw);
    }start();return()=>{disposed=true;cancelAnimationFrame(frame);};
  }, [onComplete]);
  return <canvas ref={canvas} className="outline-canvas" aria-label="건물 윤곽선이 모여 2026 Season’s Greetings 글자를 만드는 모션" role="img" />;
}

export default function OutlineGreeting(){
  const [params,setParams]=useState(()=>readPersonalization(location.search));const[done,setDone]=useState(false);const[run,setRun]=useState(0);
  const complete=React.useCallback(()=>setDone(true),[]);
  useEffect(()=>{document.documentElement.lang=params.lang;},[params.lang]);
  return <main className="outline-greeting one-screen"><img className="outline-backdrop" src={`${import.meta.env.BASE_URL}assets/v2/architecture-dusk.webp`} alt=""/><header className="motion-header"><Logo light className="motion-logo"/><nav aria-label="언어 선택">{languages.map(l=><button key={l.code} aria-pressed={params.lang===l.code} onClick={()=>{const u=new URL(location.href);u.searchParams.set('lang',l.code);history.replaceState({},'',u);setParams(p=>({...p,lang:l.code}));}}>{l.short}</button>)}</nav></header><Morph key={run} onComplete={complete}/><div className={`outline-copy-stage ${done?'is-ready':''}`}><ScreenCopy params={params} hideHeading/></div><footer className="motion-caption"><Logo light className="motion-caption-logo"/><button className="completion-replay" onClick={()=>{setDone(false);setRun(r=>r+1);}}>연출 다시 보기</button></footer></main>;
}
