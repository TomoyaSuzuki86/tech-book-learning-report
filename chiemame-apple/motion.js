(() => {
  const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const progress=document.querySelector('.progress i');
  const nav=document.querySelector('.nav');
  const heroSeed=document.querySelector('.hero-seed');
  const origin=document.querySelector('.origin');
  const photoStage=document.querySelector('.photo-stage');
  const photoStrip=document.querySelector('.photo-strip');
  const open=document.querySelector('.open');
  const ending=document.querySelector('.ending');
  let target=scrollY,current=scrollY,running=false;

  document.querySelectorAll('.reveal').forEach(el=>{
    const io=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
    }),{threshold:.14});
    io.observe(el);
  });

  const darkObserver=new IntersectionObserver(entries=>{
    const dark=entries.some(e=>e.isIntersecting&&e.intersectionRatio>.12);
    nav?.classList.toggle('dark-mode',dark);
  },{threshold:[.12,.4]});
  [origin,open].filter(Boolean).forEach(el=>darkObserver.observe(el));

  function update(){
    current += (target-current)*.11;
    const y=current;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(progress) progress.style.transform='scaleX('+clamp(scrollY/max)+')';
    nav?.classList.toggle('scrolled',scrollY>24);

    if(heroSeed){
      const hp=clamp(y/(innerHeight*.9));
      heroSeed.style.setProperty('--seed-scale',String(1+hp*.45));
      heroSeed.style.transform='translate(-50%,-50%) rotate('+(27+hp*105)+'deg) scale('+(1+hp*.45)+')';
    }

    if(origin){
      const r=origin.getBoundingClientRect();
      const travel=Math.max(1,origin.offsetHeight-innerHeight);
      const p=clamp(-r.top/travel);
      origin.style.setProperty('--root-grow',String(clamp(p*1.25)));
      origin.style.setProperty('--node-y',(lerp(16,82,p))+'%');
      origin.style.setProperty('--node-scale',String(clamp(p*2.4)));
      const copy=clamp((p-.05)/.2);
      origin.style.setProperty('--origin-copy-opacity',String(copy));
      origin.style.setProperty('--origin-copy-y',lerp(28,0,copy)+'px');
      const facts=clamp((p-.28)/.24);
      origin.style.setProperty('--facts-opacity',String(facts));
      const word=clamp((p-.55)/.22);
      origin.style.setProperty('--origin-opacity',String(word));
      origin.style.setProperty('--origin-y',lerp(50,0,word)+'px');
    }

    if(photoStage && photoStrip){
      const r=photoStage.getBoundingClientRect();
      const travel=Math.max(1,photoStage.offsetHeight-innerHeight);
      const p=clamp(-r.top/travel);
      const overflow=Math.max(0,photoStrip.scrollWidth-innerWidth*.94);
      photoStrip.style.setProperty('--photo-x',(-overflow*p)+'px');
    }

    if(open){
      const r=open.getBoundingClientRect();
      const travel=Math.max(1,open.offsetHeight-innerHeight);
      const p=clamp(-r.top/travel);
      open.style.setProperty('--ledger-scale',String(lerp(1.28,1,p)));
      open.style.setProperty('--ledger-opacity',String(lerp(.08,.28,p)));
      open.style.setProperty('--open-x',lerp(15,-2,p)+'vw');
      const pts=clamp((p-.42)/.22);
      open.style.setProperty('--open-points-opacity',String(pts));
      open.style.setProperty('--open-points-y',lerp(30,0,pts)+'px');
    }

    if(ending){
      const r=ending.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      ending.style.setProperty('--end-seed',String(lerp(.72,1.18,p)));
    }

    if(Math.abs(target-current)>.15){running=true;requestAnimationFrame(update)}
    else running=false;
  }

  addEventListener('scroll',()=>{
    target=scrollY;
    if(!running){running=true;requestAnimationFrame(update)}
  },{passive:true});
  addEventListener('resize',()=>{target=scrollY;requestAnimationFrame(update)});
  update();
})();