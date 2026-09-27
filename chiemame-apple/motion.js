(() => {
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const progress=document.querySelector('.progress i');
  const nav=document.querySelector('.nav');
  const heroOrb=document.querySelector('.hero-orb');
  const cinema=document.querySelector('.cinema');
  const cinemaImg=document.querySelector('.cinema-image img');
  const cinemaWord=document.querySelector('.cinema-word');
  const cinemaCaption=document.querySelector('.cinema-caption');
  const rail=document.querySelector('.rail');
  const gallery=document.querySelector('.gallery');
  const darkTargets=[document.querySelector('.cinema'),document.querySelector('.opening')].filter(Boolean);
  let targetY=scrollY,currentY=scrollY,ticking=false;

  document.querySelectorAll('.reveal').forEach(el=>{
    new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('in')}
    }),{threshold:.13}).observe(el)
  });

  const darkObserver=new IntersectionObserver(entries=>{
    const any=entries.some(e=>e.isIntersecting && e.intersectionRatio>.15);
    nav?.classList.toggle('dark-mode',any)
  },{threshold:[.15,.5]});
  darkTargets.forEach(el=>darkObserver.observe(el));

  function update(){
    const y=currentY += (targetY-currentY)*.12;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progress && (progress.style.transform='scaleX('+clamp(scrollY/max)+')');
    nav?.classList.toggle('scrolled',scrollY>24);

    if(heroOrb){
      const hp=clamp(scrollY/innerHeight,0,1.4);
      heroOrb.style.setProperty('--hero-y',(hp*90)+'px');
      heroOrb.style.setProperty('--hero-scale',String(1+hp*.16));
    }

    if(cinema && cinemaImg){
      const r=cinema.getBoundingClientRect();
      const travel=Math.max(1,cinema.offsetHeight-innerHeight);
      const p=clamp(-r.top/travel);
      const eased=1-Math.pow(1-p,3);
      const side=lerp(44,0,eased);
      const top=lerp(31,0,eased);
      const radius=lerp(1,0,eased);
      cinemaImg.style.setProperty('--clip-side',side+'%');
      cinemaImg.style.setProperty('--clip-top',top+'%');
      cinemaImg.style.setProperty('--clip-radius',radius+'px');
      cinemaImg.style.setProperty('--img-scale',String(lerp(1.2,1,eased)));
      cinemaImg.style.setProperty('--img-x',(Math.sin(p*Math.PI)*-2.5)+'vw');
      cinemaImg.style.setProperty('--img-y',(lerp(3,-2,eased))+'vh');

      const wordPhase=clamp(1-Math.abs(p-.46)/.23);
      cinemaWord.style.setProperty('--word-opacity',String(wordPhase*.9));
      cinemaWord.style.setProperty('--word-y',lerp(44,-14,p)+'px');

      const capPhase=clamp((p-.57)/.2);
      cinemaCaption.style.setProperty('--cap-opacity',String(capPhase));
      cinemaCaption.style.setProperty('--cap-y',lerp(28,0,capPhase)+'px');

      cinemaImg.style.filter='saturate('+lerp(.45,.9,eased)+') contrast(1.08) brightness('+lerp(.66,.84,eased)+')';
    }

    document.querySelectorAll('.story-art').forEach((el,i)=>{
      const r=el.parentElement.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      el.style.setProperty('--float-y',(lerp(46,-36,p)+(i%2?12:-8))+'px')
    });

    if(gallery && rail){
      const r=gallery.getBoundingClientRect();
      const p=clamp((innerHeight-r.top)/(gallery.offsetHeight+innerHeight));
      const overflow=Math.max(0,rail.scrollWidth-innerWidth*.92);
      rail.style.setProperty('--rail-x',(-overflow*p)+'px')
    }

    if(Math.abs(targetY-currentY)>.1){
      ticking=true;requestAnimationFrame(update)
    } else ticking=false;
  }

  addEventListener('scroll',()=>{
    targetY=scrollY;
    if(!ticking){ticking=true;requestAnimationFrame(update)}
  },{passive:true});
  addEventListener('resize',()=>{targetY=scrollY;requestAnimationFrame(update)});
  update();
})();