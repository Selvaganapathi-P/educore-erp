import { useEffect, useRef, useState } from 'react';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── constants ─────────────────────────────────────────── */
const SKINS  = ['#FDDBB4','#F5C89A','#E8A87C','#C68642','#8D5524'];
const SHIRTS = ['#EF4444','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#F97316'];
const PANTS  = ['#1E3A5F','#374151','#7C3AED','#064E3B','#92400E','#1E40AF'];
const r      = (a,b) => Math.random()*(b-a)+a;
const ri     = (a,b) => Math.floor(r(a,b+1));
const clamp  = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp   = (a,b,t) => a+(b-a)*t;

/* ─── canvas playground ─────────────────────────────────── */
function PlaygroundCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext('2d');
    let W, H, GY, raf, T = 0;
    let clouds=[], birds=[], children=[], teachers=[], butterflies=[], particles=[], leaves=[], swings=[];

    /* init ------------------------------------------------ */
    function init() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      GY = H * 0.67;

      clouds = Array.from({length:6}, () => ({
        x: r(0,W), y: r(H*.05,H*.22), w: r(100,200), spd: r(.15,.4), op: r(.7,1)
      }));

      birds = Array.from({length:9}, () => ({
        x: r(-100,W), y: r(H*.04,H*.28), spd: r(.9,2.2), wp: r(0,Math.PI*2), sz: r(4,9)
      }));

      butterflies = Array.from({length:5}, () => ({
        x: r(W*.05,W*.55), y: r(GY-65,GY-20),
        vx: r(-.5,.5), vy: r(-.3,.3), ph: r(0,Math.PI*2),
        col: ['#F472B6','#FCD34D','#A78BFA','#34D399'][ri(0,3)], sz: r(5,10)
      }));

      particles = Array.from({length:45}, () => ({
        x: r(0,W), y: r(GY-200,GY), sz: r(1,2.5), op: r(.15,.5),
        vx: r(-.2,.2), vy: r(-.35,-.1), life: r(0,1)
      }));

      leaves = Array.from({length:14}, () => ({
        x: r(0,W), y: r(-20,GY), rot: r(0,Math.PI*2),
        spd: r(.5,1.2), sw: r(.5,1.5), ph: r(0,Math.PI*2),
        col: ['#EF4444','#F97316','#FBBF24','#84CC16'][ri(0,3)], sz: r(5,10)
      }));

      swings = [
        { ph:0, spd: r(.8,1.2), ang:0 },
        { ph:1.4, spd: r(.7,1.1), ang:0 },
      ];

      children = Array.from({length:20}, (_, i) => ({
        x: r(W*.04,W*.96), y: GY+r(-3,3),
        dir: Math.random()>.5?1:-1,
        spd: i<4 ? r(1.6,2.5) : r(.4,.9),
        skin: SKINS[ri(0,4)], shirt: SHIRTS[ri(0,7)], pants: PANTS[ri(0,5)],
        ph: r(0,Math.PI*2), role: i, timer: r(80,240),
        tx: r(W*.04,W*.96), vx:0,
        blink:0, blinking:false,
      }));

      teachers = Array.from({length:3}, (_, i) => ({
        x: r(W*.1,W*.85), y: GY+r(-3,3),
        dir: Math.random()>.5?1:-1, spd: r(.28,.46),
        skin: SKINS[ri(0,4)],
        shirt: ['#1E40AF','#047857','#6B21A8'][i],
        ph: r(0,Math.PI*2), timer: r(120,350),
      }));
    }

    /* sky ------------------------------------------------- */
    function sky() {
      const g = ctx.createLinearGradient(0,0,0,GY);
      g.addColorStop(0,'#1a6fd4'); g.addColorStop(.55,'#87CEEB'); g.addColorStop(1,'#c5e8ff');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,GY);
    }

    function sun() {
      const sx=W*.83, sy=H*.09;
      const gl=ctx.createRadialGradient(sx,sy,8,sx,sy,110);
      gl.addColorStop(0,'rgba(255,225,50,.38)'); gl.addColorStop(1,'rgba(255,225,50,0)');
      ctx.fillStyle=gl; ctx.beginPath(); ctx.arc(sx,sy,110,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(sx,sy,26,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#FFF9C4'; ctx.beginPath(); ctx.arc(sx,sy,18,0,Math.PI*2); ctx.fill();
      // rays
      ctx.save(); ctx.globalAlpha=.04; ctx.fillStyle='#FFD700';
      for(let i=0;i<7;i++){
        const a=(i/7)*Math.PI*2+T*.003;
        ctx.beginPath(); ctx.moveTo(sx,sy);
        ctx.lineTo(sx+Math.cos(a)*W*1.5,sy+Math.sin(a)*H*1.5);
        ctx.lineTo(sx+Math.cos(a+.07)*W*1.5,sy+Math.sin(a+.07)*H*1.5);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawCloud(c) {
      ctx.save(); ctx.globalAlpha=c.op; ctx.fillStyle='rgba(255,255,255,.92)';
      const {x,y,w}=c;
      ctx.beginPath();
      ctx.arc(x,y,w*.3,0,Math.PI*2); ctx.arc(x+w*.25,y-w*.1,w*.22,0,Math.PI*2);
      ctx.arc(x+w*.5,y,w*.28,0,Math.PI*2); ctx.arc(x+w*.7,y+w*.05,w*.18,0,Math.PI*2);
      ctx.fill(); ctx.restore();
    }

    function drawBird(b) {
      const f=Math.sin(T*.09*b.spd+b.wp)*b.sz*.7;
      ctx.save(); ctx.translate(b.x,b.y); ctx.strokeStyle='#1E293B'; ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.moveTo(-b.sz,f); ctx.quadraticCurveTo(-b.sz*.5,-f*.6,0,0);
      ctx.moveTo(0,0); ctx.quadraticCurveTo(b.sz*.5,-f*.6,b.sz,f);
      ctx.stroke(); ctx.restore();
    }

    /* building -------------------------------------------- */
    function building() {
      const bx=W*.35,by=GY-145,bw=W*.3,bh=145;
      // shadow
      ctx.fillStyle='rgba(0,0,0,.08)';
      ctx.beginPath(); ctx.ellipse(bx+bw/2,GY,bw*.55,12,0,0,Math.PI*2); ctx.fill();
      // walls
      ctx.fillStyle='#F5F0E8'; ctx.fillRect(bx,by,bw,bh);
      ctx.fillStyle='#EAE4D8'; ctx.fillRect(bx,by,bw*.4,bh);
      // roof trim
      ctx.fillStyle='#D6CFBE'; ctx.fillRect(bx-12,by-16,bw+24,20);
      // windows
      for(let i=0;i<5;i++){
        const wx=bx+20+i*(bw-40)/4;
        ['#BAE6FD','#93C5FD','#7DD3FC'].forEach((col,row)=>{
          if(row>1) return;
          const wy=by+24+row*44;
          ctx.fillStyle=col; ctx.fillRect(wx,wy,24,26);
          ctx.strokeStyle='#CBD5E1'; ctx.lineWidth=1; ctx.strokeRect(wx,wy,24,26);
          ctx.beginPath(); ctx.moveTo(wx+12,wy); ctx.lineTo(wx+12,wy+26); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(wx,wy+13); ctx.lineTo(wx+24,wy+13); ctx.stroke();
        });
      }
      // door
      ctx.fillStyle='#92400E';
      ctx.beginPath(); ctx.roundRect(bx+bw/2-15,GY-42,30,42,[5,5,0,0]); ctx.fill();
      ctx.strokeStyle='#78350F'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#D1D5DB'; ctx.fillRect(bx+bw/2-24,GY-8,48,8);
      // sign
      ctx.fillStyle='#1D4ED8'; ctx.fillRect(bx+bw/2-54,by+6,108,15);
      ctx.fillStyle='white'; ctx.font='bold 8.5px sans-serif'; ctx.textAlign='center';
      ctx.fillText('SELVA NATIONAL SCHOOL',bx+bw/2,by+17);
      // flag
      const fpx=bx+bw+24, fpy=by-55;
      ctx.strokeStyle='#9CA3AF'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(fpx,fpy); ctx.lineTo(fpx,GY); ctx.stroke();
      const fw1=Math.sin(T*.05)*10, fw2=Math.sin(T*.05+1)*6;
      ctx.fillStyle='#EF4444';
      ctx.beginPath();
      ctx.moveTo(fpx,fpy);
      ctx.lineTo(fpx+38+fw1,fpy+5+fw2);
      ctx.lineTo(fpx+36+fw2,fpy+13+fw1);
      ctx.lineTo(fpx,fpy+14);
      ctx.fill();
    }

    /* tree ------------------------------------------------ */
    function tree(x,y,h,col,swayA) {
      const sw=Math.sin(T*.022+x*.01)*swayA;
      ctx.fillStyle='#92400E'; ctx.fillRect(x-5,y-h*.38,10,h*.42);
      ctx.save(); ctx.translate(x,y-h*.38); ctx.rotate(sw*.018);
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.ellipse(0,-h*.42,h*.27,h*.38,0,0,Math.PI*2); ctx.fill();
      const dk=col.replace(/\d+/g,n=>Math.max(0,+n-22).toString());
      ctx.fillStyle=dk;
      ctx.beginPath(); ctx.ellipse(-h*.13,-h*.3,h*.19,h*.27,-0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(h*.13,-h*.25,h*.17,h*.25,0.3,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    /* ground ---------------------------------------------- */
    function ground() {
      const g=ctx.createLinearGradient(0,GY-8,0,H);
      g.addColorStop(0,'#4ADE80'); g.addColorStop(.12,'#22C55E');
      g.addColorStop(.4,'#16A34A'); g.addColorStop(1,'#14532D');
      ctx.fillStyle=g; ctx.fillRect(0,GY-8,W,H-GY+8);
      ctx.fillStyle='#15803D'; ctx.fillRect(0,GY-3,W,3);
    }

    /* fields ---------------------------------------------- */
    function footballField() {
      const fx=W*.55,fy=GY+12,fw=W*.22,fh=52;
      ctx.fillStyle='#15803D'; ctx.fillRect(fx,fy,fw,fh);
      ctx.strokeStyle='rgba(255,255,255,.65)'; ctx.lineWidth=1.5;
      ctx.strokeRect(fx+2,fy+2,fw-4,fh-4);
      ctx.beginPath(); ctx.moveTo(fx+fw/2,fy); ctx.lineTo(fx+fw/2,fy+fh); ctx.stroke();
      ctx.beginPath(); ctx.arc(fx+fw/2,fy+fh/2,11,0,Math.PI*2); ctx.stroke();
      ctx.strokeRect(fx,fy+fh/2-8,9,16); ctx.strokeRect(fx+fw-9,fy+fh/2-8,9,16);
    }

    function basketballCourt() {
      const bx=W*.72,by=GY+10,bw=W*.14,bh=52;
      ctx.fillStyle='#B45309'; ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=1.5;
      ctx.strokeRect(bx+2,by+2,bw-4,bh-4);
      ctx.beginPath(); ctx.arc(bx+bw/2,by+bh/2,11,0,Math.PI*2); ctx.stroke();
      ctx.strokeRect(bx,by+bh/2-10,bw*.28,20); ctx.strokeRect(bx+bw-bw*.28,by+bh/2-10,bw*.28,20);
      // hoops
      ctx.strokeStyle='#F97316'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(bx+7,by+bh/2,5,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(bx+bw-7,by+bh/2,5,0,Math.PI*2); ctx.stroke();
    }

    function hopscotch() {
      const hx=W*.065,hy=GY+8;
      const nums=[1,2,3,4,5,6,7,8,9,10];
      const cols=['#FCA5A5','#93C5FD','#86EFAC','#FCD34D','#C4B5FD'];
      let n=0;
      for(let row=0;row<5;row++){
        if(row%2===0){
          ctx.fillStyle=cols[row%cols.length]; ctx.globalAlpha=.75;
          ctx.fillRect(hx+14,hy+row*22,22,20); ctx.globalAlpha=1;
          ctx.strokeStyle='white'; ctx.lineWidth=1; ctx.strokeRect(hx+14,hy+row*22,22,20);
          ctx.fillStyle='white'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center';
          ctx.fillText(nums[n++],hx+25,hy+row*22+14);
        } else {
          for(let s=0;s<2;s++){
            ctx.fillStyle=cols[(row+s)%cols.length]; ctx.globalAlpha=.75;
            ctx.fillRect(hx+s*24,hy+row*22,22,20); ctx.globalAlpha=1;
            ctx.strokeStyle='white'; ctx.lineWidth=1; ctx.strokeRect(hx+s*24,hy+row*22,22,20);
            ctx.fillStyle='white'; ctx.fillText(nums[n++],hx+s*24+11,hy+row*22+14);
          }
        }
      }
    }

    /* equipment ------------------------------------------- */
    function swingSet() {
      const sx=W*.14,sy=GY-82;
      ctx.strokeStyle='#6B7280'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(sx-36,GY); ctx.lineTo(sx-20,sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx+96,GY); ctx.lineTo(sx+80,sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx-20,sy); ctx.lineTo(sx+80,sy); ctx.stroke();

      swings.forEach((sw,i)=>{
        const ax=sx+10+i*55, rl=58;
        const cx2=ax+Math.sin(sw.ang)*rl, cy2=sy+Math.cos(sw.ang)*rl;
        ctx.strokeStyle='#9CA3AF'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(ax-10,sy); ctx.lineTo(cx2-10,cy2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax+10,sy); ctx.lineTo(cx2+10,cy2); ctx.stroke();
        ctx.fillStyle='#F97316'; ctx.fillRect(cx2-13,cy2,26,6);
        // kid on swing
        ctx.save(); ctx.translate(cx2,cy2-5); ctx.rotate(sw.ang);
        ctx.fillStyle=SKINS[i+1]; ctx.beginPath(); ctx.arc(0,-20,7,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=SHIRTS[i*3%8]; ctx.fillRect(-5,-13,10,12);
        ctx.fillStyle=PANTS[i%6]; ctx.fillRect(-6,-1,5,12); ctx.fillRect(1,-1,5,12);
        ctx.restore();
      });
    }

    function seesaw() {
      const sx=W*.36,sy=GY;
      const ang=Math.sin(T*.032)*.28;
      ctx.fillStyle='#6B7280';
      ctx.beginPath(); ctx.moveTo(sx-9,sy); ctx.lineTo(sx+9,sy); ctx.lineTo(sx,sy-22); ctx.fill();
      ctx.save(); ctx.translate(sx,sy-22); ctx.rotate(ang);
      ctx.fillStyle='#F97316'; ctx.fillRect(-72,-4,144,8);
      ctx.fillStyle='#C2410C'; ctx.fillRect(-69,-8,9,4); ctx.fillRect(60,-8,9,4);
      miniKid(ctx,-64,-4,-1,'#3B82F6',SKINS[0]);
      miniKid(ctx,64,-4,1,'#EC4899',SKINS[2]);
      ctx.restore();
    }

    function miniKid(ctx,x,y,dir,shirt,skin){
      ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(x,y-19,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=shirt; ctx.fillRect(x-6,y-12,12,12);
      ctx.fillStyle=PANTS[0]; ctx.fillRect(x-5,y,10,7);
    }

    function slide() {
      const sx=W*.275,sy=GY;
      ctx.fillStyle='#6B7280'; ctx.fillRect(sx-6,sy-85,14,86); ctx.fillRect(sx-16,sy-86,30,9);
      ctx.strokeStyle='#F59E0B'; ctx.lineWidth=13; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(sx+5,sy-77); ctx.lineTo(sx+62,sy-5); ctx.stroke();
      ctx.strokeStyle='#D97706'; ctx.lineWidth=2; ctx.stroke();
      ctx.strokeStyle='#9CA3AF'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(sx-13,sy-80); ctx.lineTo(sx-13,sy-48); ctx.stroke();
      // sliding kid
      const sp=((T*.6)%100)/100;
      if(sp<.9){
        const kx=lerp(sx+5,sx+62,sp), ky=lerp(sy-77,sy-5,sp);
        simpleKid(kx,ky,1,'#FBBF24',SKINS[3]);
      }
    }

    function monkeyBars() {
      const mx=W*.44,my=GY-62;
      ctx.strokeStyle='#9CA3AF'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx,GY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx+82,my); ctx.lineTo(mx+82,GY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(mx,my); ctx.lineTo(mx+82,my); ctx.stroke();
      const barCols=['#EF4444','#3B82F6','#10B981','#F59E0B','#8B5CF6','#EC4899'];
      for(let i=0;i<=5;i++){
        ctx.strokeStyle=barCols[i]; ctx.lineWidth=4;
        ctx.beginPath(); ctx.moveTo(mx+i*16.4,my); ctx.lineTo(mx+i*16.4,my+32); ctx.stroke();
      }
      const bi=Math.floor((T*.018)%6);
      const hx=mx+bi*16.4;
      ctx.fillStyle=SKINS[1]; ctx.beginPath(); ctx.arc(hx,my+11,6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#EC4899'; ctx.fillRect(hx-5,my+17,10,10);
      ctx.strokeStyle=SKINS[1]; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(hx-4,my+19); ctx.lineTo(hx-8,my+6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx+4,my+19); ctx.lineTo(hx+8,my+6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx-3,my+27); ctx.lineTo(hx-4,my+38); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hx+3,my+27); ctx.lineTo(hx+4,my+38); ctx.stroke();
    }

    function bench(x) {
      ctx.fillStyle='#92400E';
      ctx.fillRect(x-21,GY-13,42,5);
      ctx.fillRect(x-18,GY-8,6,8); ctx.fillRect(x+12,GY-8,6,8);
    }

    function bush(x,y,rr) {
      ctx.fillStyle='#14532D'; ctx.beginPath(); ctx.arc(x,y,rr,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#16A34A'; ctx.beginPath(); ctx.arc(x-rr*.4,y-rr*.22,rr*.7,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+rr*.38,y-rr*.18,rr*.6,0,Math.PI*2); ctx.fill();
    }

    function flower(x,y,col) {
      for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2;
        ctx.fillStyle=col; ctx.beginPath();
        ctx.ellipse(x+Math.cos(a)*5,y+Math.sin(a)*5,4,3,a,0,Math.PI*2); ctx.fill();
      }
      ctx.fillStyle='#FCD34D'; ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#15803D'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(x,y+3); ctx.lineTo(x,y+13); ctx.stroke();
    }

    function drawButterfly(b) {
      ctx.save(); ctx.translate(b.x,b.y);
      const f=Math.abs(Math.sin(T*.09+b.ph));
      ctx.scale(f,1); ctx.fillStyle=b.col; ctx.globalAlpha=.82;
      ctx.beginPath(); ctx.ellipse(-b.sz,-b.sz*.5,b.sz,b.sz*.7,-0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(b.sz,-b.sz*.5,b.sz,b.sz*.7,0.3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-b.sz*.55,b.sz*.3,b.sz*.55,b.sz*.45,.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(b.sz*.55,b.sz*.3,b.sz*.55,b.sz*.45,-.2,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1; ctx.restore();
    }

    /* character drawing ----------------------------------- */
    function simpleKid(x,y,dir,shirt,skin){
      const ph=T*.09, ls=Math.sin(ph)*.4, as=Math.sin(ph)*.32;
      ctx.save(); ctx.translate(x,y);
      if(dir<0) ctx.scale(-1,1);
      ctx.fillStyle=skin; ctx.beginPath(); ctx.arc(0,-29,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=shirt; ctx.fillRect(-5,-22,10,14);
      ctx.save(); ctx.translate(-5,-20); ctx.rotate(-as);
      ctx.fillStyle=skin; ctx.fillRect(-3,0,5,12); ctx.restore();
      ctx.save(); ctx.translate(5,-20); ctx.rotate(as);
      ctx.fillStyle=skin; ctx.fillRect(-2,0,5,12); ctx.restore();
      ctx.fillStyle=PANTS[0]; ctx.fillRect(-5,-8,10,9);
      ctx.save(); ctx.translate(-3,1); ctx.rotate(-ls);
      ctx.fillStyle=skin; ctx.fillRect(-3,0,5,13); ctx.restore();
      ctx.save(); ctx.translate(3,1); ctx.rotate(ls);
      ctx.fillStyle=skin; ctx.fillRect(-2,0,5,13); ctx.restore();
      ctx.restore();
    }

    function fullKid(ch){
      const moving=Math.abs(ch.vx)>.08;
      const ph=T*.07*(ch.spd/.7)+ch.ph;
      const ls=moving?Math.sin(ph)*.44:0, as=moving?Math.sin(ph)*.34:0;
      const sc=0.88+(ch.y-GY)*.0018;

      ctx.save(); ctx.translate(ch.x,ch.y); ctx.scale(sc,sc);
      if(ch.dir<0) ctx.scale(-1,1);

      // shadow
      ctx.fillStyle='rgba(0,0,0,.11)';
      ctx.beginPath(); ctx.ellipse(0,3,11,3.5,0,0,Math.PI*2); ctx.fill();

      // head
      ctx.fillStyle=ch.skin; ctx.beginPath(); ctx.arc(0,-33,8,0,Math.PI*2); ctx.fill();

      // hair
      ctx.fillStyle=['#92400E','#1C1917','#78350F','#374151'][Math.floor(ch.ph*2)%4];
      ctx.beginPath(); ctx.arc(0,-37,8,Math.PI,0); ctx.fill();

      // eyes
      if(!ch.blinking){
        ctx.fillStyle='#1E293B';
        ctx.beginPath(); ctx.arc(3,-34,1.5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(-3,-34,1.5,0,Math.PI*2); ctx.fill();
      } else {
        ctx.strokeStyle='#1E293B'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(0,-34); ctx.lineTo(6,-34); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-6,-34); ctx.lineTo(0,-34); ctx.stroke();
      }
      // smile
      ctx.strokeStyle='#7F1D1D'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(.5,-31,3,.3,Math.PI-.3); ctx.stroke();

      // shirt
      ctx.fillStyle=ch.shirt;
      ctx.beginPath(); ctx.roundRect(-7,-25,14,16,2); ctx.fill();

      // arms
      ctx.save(); ctx.translate(-7,-23); ctx.rotate(-as-.1);
      ctx.fillStyle=ch.skin; ctx.fillRect(-3,0,5,14);
      ctx.beginPath(); ctx.arc(-0.5,14,2.5,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.translate(7,-23); ctx.rotate(as+.1);
      ctx.fillStyle=ch.skin; ctx.fillRect(-2,0,5,14);
      ctx.beginPath(); ctx.arc(.5,14,2.5,0,Math.PI*2); ctx.fill(); ctx.restore();

      // pants
      ctx.fillStyle=ch.pants; ctx.fillRect(-6,-9,12,10);

      // legs
      ctx.save(); ctx.translate(-3,1); ctx.rotate(-ls);
      ctx.fillStyle=ch.pants; ctx.fillRect(-3,0,5,15);
      ctx.fillStyle=ch.skin; ctx.fillRect(-3,14,5,5);
      ctx.fillStyle='#111827'; ctx.fillRect(-4,18,7,4); ctx.restore();
      ctx.save(); ctx.translate(3,1); ctx.rotate(ls);
      ctx.fillStyle=ch.pants; ctx.fillRect(-2,0,5,15);
      ctx.fillStyle=ch.skin; ctx.fillRect(-2,14,5,5);
      ctx.fillStyle='#111827'; ctx.fillRect(-3,18,7,4); ctx.restore();

      ctx.restore();
    }

    function teacher(tc){
      const ph=T*.04+tc.ph, ls=Math.sin(ph)*.22, as=Math.sin(ph)*.18;
      ctx.save(); ctx.translate(tc.x,tc.y);
      if(tc.dir<0) ctx.scale(-1,1);
      ctx.fillStyle='rgba(0,0,0,.1)';
      ctx.beginPath(); ctx.ellipse(0,4,14,4,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=tc.skin; ctx.beginPath(); ctx.arc(0,-40,10,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#92400E'; ctx.beginPath(); ctx.arc(0,-45,10,Math.PI,0); ctx.fill();
      ctx.fillStyle='#1E293B';
      ctx.beginPath(); ctx.arc(4,-41,1.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(-4,-41,1.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=tc.shirt; ctx.fillRect(-8,-30,16,20);
      ctx.save(); ctx.translate(-8,-28); ctx.rotate(-as);
      ctx.fillStyle=tc.skin; ctx.fillRect(-3,0,6,17); ctx.restore();
      ctx.save(); ctx.translate(8,-28); ctx.rotate(as);
      ctx.fillStyle=tc.skin; ctx.fillRect(-3,0,6,17); ctx.restore();
      ctx.fillStyle='#1F2937'; ctx.fillRect(-7,-10,14,12);
      ctx.save(); ctx.translate(-3.5,2); ctx.rotate(-ls);
      ctx.fillStyle='#1F2937'; ctx.fillRect(-3,0,6,19); ctx.restore();
      ctx.save(); ctx.translate(3.5,2); ctx.rotate(ls);
      ctx.fillStyle='#1F2937'; ctx.fillRect(-3,0,6,19); ctx.restore();
      ctx.restore();
    }

    /* activity groups ------------------------------------- */
    function jumpRope() {
      const rx=W*.82,ry=GY;
      simpleKid(rx-36,ry,1,'#3B82F6',SKINS[0]);
      simpleKid(rx+36,ry,-1,'#10B981',SKINS[1]);
      const jh=Math.abs(Math.sin(T*.09))*28;
      ctx.strokeStyle='#92400E'; ctx.lineWidth=2.5;
      ctx.beginPath();
      ctx.moveTo(rx-28,ry-10);
      ctx.bezierCurveTo(rx-28,ry+14,rx+28,ry+14,rx+28,ry-10);
      ctx.stroke();
      simpleKid(rx,ry-jh,1,'#EC4899',SKINS[2]);
    }

    function readingKids() {
      bench(W*.9);
      ctx.save(); ctx.translate(W*.9-13,GY);
      ctx.fillStyle=SKINS[0]; ctx.beginPath(); ctx.arc(0,-31,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#3B82F6'; ctx.fillRect(-5,-24,10,13);
      ctx.fillStyle='#EF4444'; ctx.fillRect(-9,-22,18,13);
      ctx.fillStyle='white'; ctx.fillRect(-8,-21,16,11);
      ctx.strokeStyle='#E5E7EB'; ctx.lineWidth=.5;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(-7,-19+i*2.8);ctx.lineTo(7,-19+i*2.8);ctx.stroke();}
      ctx.restore();
      ctx.save(); ctx.translate(W*.9+11,GY);
      ctx.fillStyle=SKINS[3]; ctx.beginPath(); ctx.arc(0,-31,7,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#8B5CF6'; ctx.fillRect(-5,-24,10,13);
      ctx.restore();
    }

    function chatGroup() {
      const cx=W*.055,cy=GY;
      simpleKid(cx-20,cy,1,'#F59E0B',SKINS[0]);
      simpleKid(cx,cy-4,-1,'#8B5CF6',SKINS[2]);
      simpleKid(cx+20,cy,-1,'#EF4444',SKINS[4]);
      if(Math.floor(T/65)%2===0){
        ctx.fillStyle='rgba(255,255,255,.92)';
        ctx.beginPath(); ctx.roundRect(cx-16,cy-62,48,20,8); ctx.fill();
        ctx.fillStyle='#1E293B'; ctx.font='8px sans-serif'; ctx.textAlign='center';
        ctx.fillText('Ha ha! 😄',cx+8,cy-48);
      }
    }

    function football() {
      const fx=W*.55,fy=GY+36,fw=W*.22;
      const bx=fx+(Math.sin(T*.022)*.5+.5)*fw, by=fy+Math.sin(T*.042)*9;
      ctx.fillStyle='#1E293B'; ctx.beginPath(); ctx.arc(bx,by,5.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='white'; ctx.beginPath(); ctx.arc(bx-1.5,by-1.5,1.5,0,Math.PI*2); ctx.fill();
      simpleKid(bx-32+Math.sin(T*.026)*16,GY,1,'#EF4444',SKINS[1]);
      simpleKid(bx+28+Math.cos(T*.02)*10,GY,-1,'#3B82F6',SKINS[3]);
      simpleKid(bx+Math.sin(T*.016+1)*18,GY+8,1,'#F59E0B',SKINS[0]);
    }

    function basketball() {
      const bx=W*.72,by=GY+33,bw=W*.14;
      const blx=bx+bw/2+Math.sin(T*.055)*18, bly=by+Math.abs(Math.sin(T*.085))*-22;
      ctx.fillStyle='#F97316'; ctx.beginPath(); ctx.arc(blx,bly,6.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7C2D12'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(blx-6.5,bly); ctx.lineTo(blx+6.5,bly); ctx.stroke();
      ctx.beginPath(); ctx.arc(blx,bly,6.5,-Math.PI/2,Math.PI/2); ctx.stroke();
      simpleKid(bx+bw/2+Math.sin(T*.042)*22,GY,blx>bx+bw/2?1:-1,'#3B82F6',SKINS[2]);
    }

    /* update ---------------------------------------------- */
    function update() {
      clouds.forEach(c=>{ c.x+=c.spd; if(c.x>W+c.w) c.x=-c.w; });
      birds.forEach(b=>{ b.x+=b.spd; if(b.x>W+50) b.x=-50; });
      swings.forEach(s=>{ s.ph+=.022*s.spd; s.ang=Math.sin(s.ph)*.44; });

      butterflies.forEach(b=>{
        b.ph+=.04; b.x+=b.vx+Math.sin(b.ph)*.3; b.y+=b.vy+Math.cos(b.ph*.7)*.2;
        if(b.x<W*.02||b.x>W*.62) b.vx*=-1;
        if(b.y<GY-90||b.y>GY+5) b.vy*=-1;
      });

      particles.forEach(p=>{
        p.x+=p.vx+Math.sin(T*.012+p.y)*.1; p.y+=p.vy; p.life+=.003;
        if(p.y<GY-230||p.life>1){ p.x=r(0,W); p.y=GY-5; p.life=0; p.op=r(.15,.5); }
      });

      leaves.forEach(l=>{
        l.y+=l.spd; l.x+=Math.sin(T*.022+l.ph)*l.sw; l.rot+=.03;
        if(l.y>GY+20){ l.y=r(-20,-5); l.x=r(0,W); }
      });

      children.forEach(ch=>{
        ch.timer--;
        if(ch.timer<=0){
          ch.timer=r(80,240);
          if(Math.random()<.3) ch.dir*=-1;
          ch.tx=r(W*.04,W*.96);
          if(Math.random()<.2) ch.spd=ch.role<4?r(1.6,2.5):r(.4,.9);
        }
        const dx=ch.tx-ch.x;
        if(Math.abs(dx)>6){ ch.dir=dx>0?1:-1; ch.vx=ch.dir*ch.spd; }
        else ch.vx*=.8;
        ch.x=clamp(ch.x+ch.vx,W*.02,W*.98);
        ch.blink--; if(ch.blink<=0){ ch.blinking=!ch.blinking; ch.blink=ch.blinking?3:r(80,200); }
      });

      teachers.forEach(tc=>{
        tc.timer--; if(tc.timer<=0){ tc.timer=r(150,380); if(Math.random()<.4) tc.dir*=-1; }
        tc.x=clamp(tc.x+tc.dir*tc.spd,W*.04,W*.96);
        if(tc.x<=W*.04||tc.x>=W*.96) tc.dir*=-1;
      });
    }

    /* main draw ------------------------------------------- */
    function draw() {
      ctx.clearRect(0,0,W,H);
      sky(); sun();
      clouds.forEach(drawCloud);
      ctx.lineWidth=1.4; birds.forEach(drawBird);

      building();

      tree(W*.04,GY,100,'#16A34A',3); tree(W*.22,GY,88,'#15803D',4);
      tree(W*.73,GY,96,'#14532D',3); tree(W*.88,GY,108,'#166534',5);
      tree(W*.96,GY,80,'#15803D',3); tree(W*.01,GY,74,'#16A34A',4);

      ground();

      // paths
      ctx.fillStyle='#E5E7EB'; ctx.globalAlpha=.55;
      ctx.fillRect(W*.42,GY-2,W*.16,H-GY+2);
      ctx.fillRect(W*.09,GY+20,W*.82,11);
      ctx.globalAlpha=1;

      bush(W*.18,GY,20); bush(W*.32,GY,18); bush(W*.65,GY,22); bush(W*.87,GY,16);
      bench(W*.12); bench(W*.48); bench(W*.76);
      footballField(); basketballCourt(); hopscotch();
      swingSet(); seesaw(); slide(); monkeyBars();

      [[W*.08,GY-5,'#EC4899'],[W*.115,GY-3,'#FBBF24'],[W*.38,GY-5,'#A78BFA'],
       [W*.415,GY-4,'#F472B6'],[W*.68,GY-5,'#34D399'],[W*.715,GY-3,'#FCD34D'],
       [W*.85,GY-5,'#FB923C'],[W*.925,GY-4,'#60A5FA']].forEach(([x,y,c])=>flower(x,y,c));

      particles.forEach(p=>{
        ctx.fillStyle=`rgba(255,220,140,${p.op})`;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.sz,0,Math.PI*2); ctx.fill();
      });

      leaves.forEach(l=>{
        ctx.save(); ctx.translate(l.x,l.y); ctx.rotate(l.rot);
        ctx.fillStyle=l.col; ctx.globalAlpha=.78;
        ctx.beginPath(); ctx.ellipse(0,0,l.sz,l.sz*.5,0,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1; ctx.restore();
      });

      butterflies.forEach(drawButterfly);

      jumpRope(); readingKids(); chatGroup(); football(); basketball();

      [...children].sort((a,b)=>a.y-b.y).forEach(ch=>fullKid(ch));
      teachers.forEach(teacher);
    }

    /* loop ------------------------------------------------ */
    function loop(){ T++; update(); draw(); raf=requestAnimationFrame(loop); }
    function onResize(){ init(); }

    window.addEventListener('resize',onResize);
    init(); loop();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',onResize); };
  }, []);

  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',display:'block'}} />;
}

/* ─── contact page ─────────────────────────────────────── */
export default function ContactPage() {
  const [form,  setForm]  = useState({ name:'', email:'', subject:'', message:'' });
  const [sent,  setSent]  = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name||!form.email||!form.message){ toast.error('Please fill all required fields'); return; }
    setLoading(true);
    setTimeout(()=>{ setSent(true); setLoading(false); toast.success("Message sent! We'll get back to you shortly."); setForm({name:'',email:'',subject:'',message:''}); }, 800);
  };

  return (
    <div style={{position:'relative', minHeight:'100vh', overflow:'hidden'}}>

      {/* Animated canvas background */}
      <PlaygroundCanvas />

      {/* Overlay — keeps text readable */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(5,10,25,.32) 0%,rgba(5,10,25,.28) 40%,rgba(5,10,25,.50) 100%)',zIndex:1}} />

      {/* Page content */}
      <div style={{position:'relative',zIndex:10,minHeight:'100vh',display:'flex',flexDirection:'column',justifyContent:'center',padding:'6rem 1rem 3rem'}}>

        {/* Hero text */}
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <span style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',color:'#FCD34D'}}>Get in Touch</span>
          <h1 style={{fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:900,color:'white',marginTop:'.5rem',lineHeight:1.1,textShadow:'0 2px 20px rgba(0,0,0,.4)'}}>
            We'd Love to{' '}
            <span style={{background:'linear-gradient(90deg,#FBBF24,#F59E0B)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              Hear From You
            </span>
          </h1>
          <p style={{color:'rgba(255,255,255,.85)',marginTop:'.75rem',fontSize:'1rem',maxWidth:500,margin:'.75rem auto 0',textShadow:'0 1px 6px rgba(0,0,0,.4)'}}>
            Admissions, enquiries, or just want to visit campus — we're here to help.
          </p>
        </div>

        {/* Cards */}
        <div style={{maxWidth:900,margin:'0 auto',width:'100%',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem'}}>

          {/* Info */}
          <div style={{background:'rgba(5,10,30,.72)',backdropFilter:'blur(18px)',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:'1.75rem'}}>
            <h2 style={{fontWeight:700,color:'white',fontSize:'1rem',marginBottom:'1.5rem'}}>School Information</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem',marginBottom:'1.5rem'}}>
              {[
                [MapPin,'#F59E0B','123 School Road, Anna Nagar\nChennai, Tamil Nadu – 600040'],
                [Phone,'#60A5FA','+91 98765 43210\n+91 44 2345 6789'],
                [Mail,'#A78BFA','info@selvanationalschool.edu.in\nadmissions@selvanationalschool.edu.in'],
                [Clock,'#34D399','Mon – Fri: 8:00 AM – 4:30 PM\nSaturday: 8:00 AM – 1:00 PM'],
              ].map(([Icon,col,text])=>(
                <div key={text} style={{display:'flex',alignItems:'flex-start',gap:'.75rem'}}>
                  <div style={{width:34,height:34,borderRadius:10,background:`${col}18`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon size={15} color={col} />
                  </div>
                  <p style={{color:'rgba(255,255,255,.75)',fontSize:'.82rem',lineHeight:1.6,whiteSpace:'pre-line',margin:0}}>{text}</p>
                </div>
              ))}
            </div>
            <div style={{background:'rgba(29,78,216,.18)',border:'1px solid rgba(29,78,216,.28)',borderRadius:14,padding:'1rem'}}>
              <p style={{fontWeight:700,color:'white',fontSize:'.88rem',marginBottom:'.4rem'}}>Admissions Enquiries</p>
              <p style={{color:'rgba(255,255,255,.65)',fontSize:'.8rem',lineHeight:1.6,margin:0}}>
                Visit between <span style={{color:'white',fontWeight:600}}>9 AM – 2 PM</span> on school days,
                or email <span style={{color:'#93C5FD'}}>admissions@selvanationalschool.edu.in</span>
              </p>
            </div>
          </div>

          {/* Form */}
          <div style={{background:'rgba(5,10,30,.72)',backdropFilter:'blur(18px)',border:'1px solid rgba(255,255,255,.12)',borderRadius:24,padding:'1.75rem'}}>
            {sent ? (
              <div style={{textAlign:'center',padding:'3rem 0'}}>
                <div style={{width:52,height:52,borderRadius:'50%',background:'rgba(52,211,153,.15)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:22}}>✓</div>
                <p style={{fontWeight:700,color:'white',fontSize:'1rem',marginBottom:'.5rem'}}>Message Sent!</p>
                <p style={{color:'rgba(255,255,255,.55)',fontSize:'.82rem'}}>We'll get back to you within 1–2 business days.</p>
                <button onClick={()=>setSent(false)} style={{marginTop:'1.25rem',color:'#93C5FD',fontSize:'.82rem',background:'none',border:'none',cursor:'pointer'}}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <h2 style={{fontWeight:700,color:'white',fontSize:'1rem',marginBottom:'.25rem'}}>Send a Message</h2>
                {[
                  {label:'Full Name',key:'name',type:'text',ph:'Your name',req:true},
                  {label:'Email Address',key:'email',type:'email',ph:'you@email.com',req:true},
                  {label:'Subject',key:'subject',type:'text',ph:'What is this about?',req:false},
                ].map(({label,key,type,ph,req})=>(
                  <div key={key}>
                    <label style={{display:'block',fontSize:'.72rem',fontWeight:500,color:'rgba(255,255,255,.5)',marginBottom:'.4rem'}}>
                      {label}{req&&<span style={{color:'#F87171',marginLeft:3}}>*</span>}
                    </label>
                    <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={ph}
                      style={{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',borderRadius:12,padding:'.6rem 1rem',fontSize:'.84rem',color:'white',outline:'none'}}
                      onFocus={e=>e.target.style.borderColor='rgba(96,165,250,.55)'}
                      onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'} />
                  </div>
                ))}
                <div>
                  <label style={{display:'block',fontSize:'.72rem',fontWeight:500,color:'rgba(255,255,255,.5)',marginBottom:'.4rem'}}>Message <span style={{color:'#F87171'}}>*</span></label>
                  <textarea rows={4} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Write your message here..."
                    style={{width:'100%',boxSizing:'border-box',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',borderRadius:12,padding:'.6rem 1rem',fontSize:'.84rem',color:'white',outline:'none',resize:'none'}}
                    onFocus={e=>e.target.style.borderColor='rgba(96,165,250,.55)'}
                    onBlur={e=>e.target.style.borderColor='rgba(255,255,255,.12)'} />
                </div>
                <button type="submit" disabled={loading}
                  style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'.75rem',borderRadius:12,background:'linear-gradient(135deg,#1D4ED8,#2563EB)',border:'none',color:'white',fontWeight:700,fontSize:'.86rem',cursor:'pointer',boxShadow:'0 0 24px rgba(29,78,216,.42)',opacity:loading?.6:1,transition:'opacity .2s'}}>
                  {loading?'Sending…':<><span>Send Message</span><ArrowRight size={15}/></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
