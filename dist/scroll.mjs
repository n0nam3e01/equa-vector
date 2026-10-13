const desktop = matchMedia('(min-width: 1000px) and (min-height: 650px)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const journey = document.querySelector('.journey');
const nav = [...journey.querySelectorAll('.journey-nav li')];
const cards = [...journey.querySelectorAll('.journey-card')];
let basicObserver;
let desktopSetup;

// Phone users get native scrolling and a small enhancement without large libraries.
if ('IntersectionObserver' in window) {
  basicObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!reduced.matches) entry.target.animate([{transform:'translateY(12px)'},{transform:'translateY(0)'}],{duration:400,easing:'cubic-bezier(.23,1,.32,1)'});
      basicObserver.unobserve(entry.target);
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(element => basicObserver.observe(element));
}

function loadScript(file) {
  return new Promise((resolve,reject) => {
    const script = document.createElement('script');
    script.src = new URL(file,import.meta.url).href;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${file}`));
    document.head.append(script);
  });
}

async function setupDesktop() {
  const [{default:Lenis}] = await Promise.all([import('./vendor/lenis.mjs'),loadScript('./vendor/gsap.min.js')]);
  await loadScript('./vendor/ScrollTrigger.min.js');
  const {gsap,ScrollTrigger} = window;
  gsap.registerPlugin(ScrollTrigger);
  basicObserver?.disconnect();
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    document.querySelectorAll('.reveal').forEach(element => {
      gsap.from(element,{y:20,duration:.65,ease:'power3.out',clearProps:'transform',scrollTrigger:{trigger:element,start:'top 88%',once:true}});
    });
    gsap.from('.scroll-word',{y:12,stagger:.1,duration:.65,ease:'power3.out',clearProps:'transform',scrollTrigger:{trigger:'#journey-title',start:'top 85%',once:true}});
  });
  media.add('(min-width: 1000px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', () => {
    const lenis = new Lenis({lerp:.1,smoothWheel:true,syncTouch:false,anchors:true});
    const tick = time => lenis.raf(time * 1000);
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    journey.classList.add('is-enhanced');
    document.documentElement.classList.add('scroll-enhanced');
    cards.forEach((card,i) => { card.inert = i !== 0; });
    const viewport = journey.querySelector('.journey-viewport');
    const track = journey.querySelector('.journey-track');
    let active = -1;
    gsap.to(track,{x:() => -(track.scrollWidth - viewport.clientWidth),ease:'none',scrollTrigger:{id:'ventorme-journey',trigger:journey,start:'top 28px',end:() => `+=${Math.min(innerHeight * 1.5,1400)}`,pin:journey.querySelector('.journey-shell'),scrub:.7,invalidateOnRefresh:true,onUpdate:self => {
      const next = Math.min(2,Math.round(self.progress * 2));
      if (next !== active) {
        nav.forEach((item,i) => item.classList.toggle('is-active',i===next));
        cards.forEach((card,i) => { card.inert = i !== next; });
        active=next;
      }
      gsap.set('.journey-fill',{scaleX:1/3 + self.progress * 2/3});
    }}});
    gsap.to('.scroll-orbit',{y:-65,rotation:15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    const resize = new ResizeObserver(() => ScrollTrigger.refresh());
    resize.observe(document.querySelector('.faq'));
    resize.observe(document.querySelector('.quiz'));
    return () => {
      resize.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      journey.classList.remove('is-enhanced');
      document.documentElement.classList.remove('scroll-enhanced');
      nav.forEach((item,i) => item.classList.toggle('is-active',i===0));
      cards.forEach(card => { card.inert = false; });
    };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load',() => ScrollTrigger.refresh(),{once:true});
}
function enhanceWhenNeeded() {
  if (!desktop.matches || reduced.matches || desktopSetup) return;
  desktopSetup = setupDesktop().catch(error => console.warn('Desktop scroll effects unavailable:',error));
}
desktop.addEventListener('change',enhanceWhenNeeded);
reduced.addEventListener('change',enhanceWhenNeeded);
enhanceWhenNeeded();
