/* =========================================================================
   SDK EDITS — shared runtime
   Handles: loader, custom cursor, nav, theme toggle, scroll reveals,
   toasts, back-to-top, and the localStorage "content store" that powers
   every owner-editable piece of the site (profile, works, offers).
   No backend exists — this is a static site — so "owner mode" is a
   client-side passcode gate, not real security. Good enough to let
   Dinesh update his own content from any browser without a CMS.
   ========================================================================= */

(function(){
  "use strict";

  /* ---------------- Content store (localStorage) ---------------- */
  const STORE_KEYS = {
    profile: "sdk_profile_v1",
    works:   "sdk_works_v1",
    offers:  "sdk_offers_v1",
    theme:   "sdk_theme_v1",
    owner:   "sdk_owner_v1"
  };

  const OWNER_PASSCODE = "SDK-EDITS-1211"; // change this, then tell only yourself

  const DEFAULT_PROFILE = {
    name: "DINESH KUMAR",
    handle: "SDK Edits",
    tagline: "Professional Video Editor & Photographer",
    bio: "I'm Dinesh Kumar — a video editor and photographer who turns raw, unpolished footage into cinematic stories. Over the years I've cut reels, commercials, wedding films and travel documentaries, chasing one goal every time: make the viewer feel something in the first three seconds.",
    years: "5+",
    photo: "https://i.postimg.cc/1Xs1HB0B/SDK-EDITS-LOGO.png",
    heroImage: "https://i.postimg.cc/1RYXQ9Nw/logo.jpg",
    email: "sdkstudios1211@gmail.com",
    whatsapp: "7708509295",
    instagram: "https://www.instagram.com/sdk_edits_official/?__pwa=1",
    youtube: ""
  };

  const DEFAULT_WORKS = [
    {id:"w1", type:"video", category:"reels", title:"Coastal Drift — Travel Reel", client:"Personal Project", desc:"A 45-second colour-graded travel reel shot along the Tamil Nadu coastline, cut to a rising cinematic score.", poster:"https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1000&auto=format&fit=crop", src:""},
    {id:"w2", type:"video", category:"commercial", title:"Sunrise Roasters — Brand Ad", client:"Sunrise Roasters Co.", desc:"30-second product commercial with motion graphics overlays and warm colour grading.", poster:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop", src:""},
    {id:"w3", type:"video", category:"wedding", title:"Aarav & Meera — Wedding Film", client:"Private Client", desc:"Cinematic same-day edit highlighting candid emotion over a classical score.", poster:"https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop", src:""},
    {id:"p1", type:"photo", category:"photography", title:"Golden Hour Portrait", client:"", desc:"", poster:"https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=900&auto=format&fit=crop", src:""},
    {id:"p2", type:"photo", category:"photography", title:"Urban Frame Study", client:"", desc:"", poster:"https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=900&auto=format&fit=crop", src:""},
    {id:"p3", type:"photo", category:"colour-grading", title:"Teal & Orange Grade", client:"", desc:"", poster:"https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=900&auto=format&fit=crop", src:""},
    {id:"p4", type:"photo", category:"travel", title:"Hillside Fog", client:"", desc:"", poster:"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=900&auto=format&fit=crop", src:""},
    {id:"p5", type:"photo", category:"photography", title:"Studio Light Study", client:"", desc:"", poster:"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=900&auto=format&fit=crop", src:""},
    {id:"w4", type:"video", category:"reels", title:"Studio BTS — Short", client:"Personal Project", desc:"Behind-the-scenes edit from a commercial shoot day.", poster:"https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop", src:""},
    {id:"vg1", type:"video", category:"videography", title:"Videography Cut 01", client:"Personal Project", desc:"", poster:"", src:"https://youtu.be/-nUYUweWZ70?si=JvjUZ90Fz1iOZEuO"},
    {id:"vg2", type:"video", category:"videography", title:"Videography Cut 02", client:"Personal Project", desc:"", poster:"", src:"https://youtu.be/1mO8UPYIye8?si=Ofl16X_ouXHg7VCV"},
    {id:"vg3", type:"video", category:"videography", title:"Videography Cut 03", client:"Personal Project", desc:"", poster:"", src:"https://youtu.be/svHNDE96wnc?si=W0o9i-QzP_kT9_pO"},
    {id:"vg4", type:"video", category:"videography", title:"Videography Cut 04", client:"Personal Project", desc:"", poster:"", src:"https://youtu.be/ULGVcdmqcXw?si=-jyIWjfVPctK3pf0"},
    {id:"vg5", type:"video", category:"videography", title:"Videography Cut 05", client:"Personal Project", desc:"", poster:"", src:"https://youtu.be/fOTZyn5XyYM?si=ci74S0Qsd0JcgInK"},
    {id:"vg6", type:"video", category:"videography", title:"Videography Short 01", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/3sMw3a_fx-Q?si=O_3OiXS_dxt8OfFd"},
    {id:"vg7", type:"video", category:"videography", title:"Videography Short 02", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/pgEnvGM4OGg?si=4RFxCqVRfXGcRAkV"},
    {id:"vg8", type:"video", category:"videography", title:"Videography Short 03", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/iqc1eCNykHQ?si=uqheJ7atBAxLHsJa"},
    {id:"vg9", type:"video", category:"videography", title:"Videography Short 04", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/UkGb-_jxOOA?si=3OBZnyoNMSbuU6-z"},
    {id:"vg10", type:"video", category:"videography", title:"Videography Short 05", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/542kNUgGnJ4?si=KIKnWN_BV0BC1nBE"},
    {id:"vg11", type:"video", category:"videography", title:"Videography Short 06", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/caD9qp5IhlM?si=KKQMEp34fSQJHFhm"},
    {id:"vg12", type:"video", category:"videography", title:"Videography Short 07", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/SMIUK_0x0kY?si=1CzU3geV51GZDN8G"},
    {id:"vg13", type:"video", category:"videography", title:"Videography Short 08", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/vwQlqZcjvyo?si=kPoOf1IJS6tvAa52"},
    {id:"vg14", type:"video", category:"videography", title:"Videography Short 09", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/kQWWmgfF17Q?si=7xfjBrBZeK1HvEEz"},
    {id:"vg15", type:"video", category:"videography", title:"Videography Short 10", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/04x50GWp6pg?si=5Vl04tXskNeUJDsx"},
    {id:"vg16", type:"video", category:"videography", title:"Videography Short 11", client:"Personal Project", desc:"", poster:"", src:"https://youtube.com/shorts/NublDkzty_E?si=6p18FnZvzc2eBZy1"}
  ];

  const DEFAULT_OFFERS = {
    plans: [
      {id:"pl1", name:"Starter Cut", tagline:"For reels & socials", price:"1,499", period:"/ project", featured:false, badge:"", features:["1 short-form video (up to 60s)","Colour correction","Trending audio sync","2 revision rounds","48-hour delivery"]},
      {id:"pl2", name:"Signature Edit", tagline:"Most-booked package", price:"4,999", period:"/ project", featured:true, badge:"Most Popular", features:["Full video edit up to 5 min","Cinematic colour grading","Motion graphics & titles","Sound design & mixing","4 revision rounds","4-day delivery"]},
      {id:"pl3", name:"Full Production", tagline:"Weddings & commercials", price:"12,999", period:"/ project", featured:false, badge:"", features:["Multi-cam edit, unlimited length","Advanced colour grading","Custom motion graphics","Licensed music & sound design","Unlimited revisions","Priority delivery"]}
    ],
    deals: [
      {id:"d1", tag:"Limited", title:"Festive Season Bundle", desc:"Book any 2 reels this month and get a free colour-grading pass on both.", expiry:"Valid through this month"},
      {id:"d2", tag:"New", title:"Wedding Season Early-Bird", desc:"Lock your wedding film slot early and save on the Full Production package.", expiry:"Ask for current pricing"}
    ]
  };

  function readStore(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return structuredCloneSafe(fallback);
      return JSON.parse(raw);
    }catch(e){ return structuredCloneSafe(fallback); }
  }
  function writeStore(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch(e){ console.error("Storage write failed", e); return false; }
  }
  function structuredCloneSafe(v){ return JSON.parse(JSON.stringify(v)); }

  const SDK = {
    keys: STORE_KEYS,
    getProfile(){ return readStore(STORE_KEYS.profile, DEFAULT_PROFILE); },
    setProfile(p){ return writeStore(STORE_KEYS.profile, p); },
    getWorks(){ return readStore(STORE_KEYS.works, DEFAULT_WORKS); },
    setWorks(w){ return writeStore(STORE_KEYS.works, w); },
    getOffers(){ return readStore(STORE_KEYS.offers, DEFAULT_OFFERS); },
    setOffers(o){ return writeStore(STORE_KEYS.offers, o); },
    isOwner(){ return localStorage.getItem(STORE_KEYS.owner) === "1"; },
    uid(){ return "id" + Date.now().toString(36) + Math.random().toString(36).slice(2,7); },

    /* ---- YouTube helpers: paste any youtube.com/youtu.be link, it plays
       inline on the site via an embedded player — nothing leaves the page. */
    youTubeId(url){
      if(!url) return null;
      const patterns = [
        /youtu\.be\/([A-Za-z0-9_-]{11})/,
        /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
        /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
        /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
      ];
      for(const re of patterns){
        const m = url.match(re);
        if(m) return m[1];
      }
      return null;
    },
    isYouTube(url){ return !!SDK.youTubeId(url); },
    isYouTubeShort(url){ return !!(url && /youtube\.com\/shorts\//.test(url)); },
    youTubeThumb(url){
      const id = SDK.youTubeId(url);
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    },
    youTubeEmbed(url, autoplay){
      const id = SDK.youTubeId(url);
      if(!id) return "";
      return `https://www.youtube-nocookie.com/embed/${id}?rel=0${autoplay ? "&autoplay=1" : ""}`;
    }
  };
  window.SDK = SDK;

  /* ---------------- Loader ---------------- */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if(loader){
      setTimeout(() => loader.classList.add("hide"), 550);
    }
  });

  /* ---------------- Theme toggle ---------------- */
  function applyTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll(".theme-icon").forEach(i => {
      i.className = "theme-icon fa-solid " + (t === "light" ? "fa-moon" : "fa-sun");
    });
  }
  const savedTheme = localStorage.getItem(STORE_KEYS.theme) || "dark";
  applyTheme(savedTheme);
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if(!btn) return;
    const cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = cur === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(STORE_KEYS.theme, next);
  });

  /* ---------------- Nav: scroll state + mobile burger ---------------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => {
    if(!header) return;
    header.classList.toggle("scrolled", window.scrollY > 30);
    const toTop = document.querySelector(".to-top");
    if(toTop) toTop.classList.toggle("show", window.scrollY > 600);
  };
  document.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  const burger = document.querySelector(".nav-burger");
  const navLinks = document.querySelector(".nav-links");
  if(burger && navLinks){
    burger.addEventListener("click", () => {
      burger.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      burger.classList.remove("open"); navLinks.classList.remove("open");
    }));
  }

  /* mark active nav link */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[data-nav]").forEach(a => {
    if(a.getAttribute("data-nav") === path) a.classList.add("active");
  });

  /* ---------------- Custom cursor ---------------- */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if(dot && ring && matchMedia("(hover:hover)").matches){
    let rx=0, ry=0, dx=0, dy=0;
    window.addEventListener("mousemove", e => {
      dx = e.clientX; dy = e.clientY;
      dot.style.left = dx+"px"; dot.style.top = dy+"px";
    });
    (function loop(){
      rx += (dx-rx)*0.18; ry += (dy-ry)*0.18;
      ring.style.left = rx+"px"; ring.style.top = ry+"px";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button, .filter-pill, input, textarea, .masonry-item").forEach(el=>{
      el.addEventListener("mouseenter", ()=>ring.classList.add("active"));
      el.addEventListener("mouseleave", ()=>ring.classList.remove("active"));
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, {threshold:0.15});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  /* stagger index for grouped reveals */
  document.querySelectorAll(".reveal-stagger").forEach(group=>{
    Array.from(group.children).forEach((child,i)=> child.style.setProperty("--i", i));
  });

  /* ---------------- Animated counters ---------------- */
  document.querySelectorAll("[data-count]").forEach(el=>{
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    let started = false;
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting && !started){
          started = true;
          const dur = 1600, start = performance.now();
          function step(now){
            const p = Math.min(1, (now-start)/dur);
            const eased = 1 - Math.pow(1-p, 3);
            el.textContent = Math.round(target*eased).toLocaleString() + suffix;
            if(p<1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    }, {threshold:0.4});
    obs.observe(el);
  });

  /* ---------------- Skill bars ---------------- */
  document.querySelectorAll(".skill-fill").forEach(el=>{
    const pct = el.getAttribute("data-fill") || "0";
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(en=>{
        if(en.isIntersecting){ el.style.width = pct+"%"; obs.unobserve(el); }
      });
    }, {threshold:0.3});
    obs.observe(el);
  });

  /* ---------------- Toast ---------------- */
  let toastTimer;
  window.sdkToast = function(msg){
    let t = document.querySelector(".toast");
    if(!t){ t = document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>t.classList.remove("show"), 2600);
  };

  /* ---------------- Generic modal open/close ---------------- */
  document.addEventListener("click", (e)=>{
    const opener = e.target.closest("[data-open-modal]");
    if(opener){
      const id = opener.getAttribute("data-open-modal");
      const modal = document.getElementById(id);
      if(modal) modal.classList.add("open");
    }
    const closer = e.target.closest("[data-close-modal]");
    if(closer){
      const modal = closer.closest(".modal-backdrop");
      if(modal) modal.classList.remove("open");
    }
    if(e.target.classList.contains("modal-backdrop")){
      e.target.classList.remove("open");
    }
  });
  document.addEventListener("keydown", e=>{
    if(e.key === "Escape"){
      document.querySelectorAll(".modal-backdrop.open").forEach(m=>m.classList.remove("open"));
      document.querySelectorAll(".lightbox.open").forEach(m=>m.classList.remove("open"));
    }
  });

  /* ---------------- Owner mode gate ---------------- */
  function setOwner(on){
    if(on){ localStorage.setItem(STORE_KEYS.owner, "1"); document.body.classList.add("owner-mode"); }
    else{ localStorage.removeItem(STORE_KEYS.owner); document.body.classList.remove("owner-mode"); }
    document.querySelectorAll("[data-owner-label]").forEach(b=>{
      b.textContent = on ? "Owner mode: ON" : "Owner login";
    });
  }
  if(SDK.isOwner()) document.body.classList.add("owner-mode");

  document.addEventListener("click", (e)=>{
    const trigger = e.target.closest("[data-owner-trigger]");
    if(!trigger) return;
    if(SDK.isOwner()){
      setOwner(false);
      sdkToast("Owner mode off");
      return;
    }
    const code = prompt("Enter owner passcode to edit this site:");
    if(code === null) return;
    if(code.trim() === OWNER_PASSCODE){
      setOwner(true);
      sdkToast("Owner mode on — edit controls unlocked");
    }else{
      sdkToast("Incorrect passcode");
    }
  });

  /* ---------------- Populate profile-driven elements everywhere ---------------- */
  function renderProfileBits(){
    const p = SDK.getProfile();
    document.querySelectorAll("[data-bind='brandName']").forEach(el=>el.textContent = p.handle || "SDK Edits");
    document.querySelectorAll("[data-bind='fullName']").forEach(el=>el.textContent = p.name);
    document.querySelectorAll("[data-bind='tagline']").forEach(el=>el.textContent = p.tagline);
    document.querySelectorAll("[data-bind='bio']").forEach(el=>el.textContent = p.bio);
    document.querySelectorAll("[data-bind='years']").forEach(el=>el.textContent = p.years);
    document.querySelectorAll("[data-bind='photo']").forEach(el=>el.src = p.photo);
    document.querySelectorAll("[data-bind='brandMark']").forEach(el=>el.src = p.photo);
    document.querySelectorAll("[data-bind='heroImage']").forEach(el=>el.src = p.heroImage || p.photo);
    document.querySelectorAll("[data-bind='email']").forEach(el=>{ el.textContent = p.email; el.href = "mailto:"+p.email; });
    document.querySelectorAll("[data-bind='whatsappHref']").forEach(el=>{
      const digits = (p.whatsapp||"").replace(/\D/g,"");
      el.href = "https://wa.me/91"+digits;
    });
    document.querySelectorAll("[data-bind='whatsappText']").forEach(el=> el.textContent = p.whatsapp);
    document.querySelectorAll("[data-bind='instagramHref']").forEach(el=> el.href = p.instagram);
    document.querySelectorAll("[data-bind='youtubeHref']").forEach(el=>{
      if(p.youtube){ el.href = p.youtube; el.style.display = ""; } else { el.style.display = "none"; }
    });
  }
  renderProfileBits();
  window.sdkRenderProfileBits = renderProfileBits;

  /* ---------------- file:// warning banner ----------------
     YouTube embeds (and, less reliably, localStorage) misbehave when a
     page is opened directly from disk instead of a real hosted URL —
     this is the #1 cause of "Error 153 / video player configuration
     error". Flag it once per session so whoever's editing the site
     knows to host it rather than double-click the HTML file. */
  if(location.protocol === "file:" && !sessionStorage.getItem("sdk_file_warn_dismissed")){
    const bar = document.createElement("div");
    bar.className = "file-warn-bar";
    bar.innerHTML = `
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span>You're viewing this file locally (not hosted online) — YouTube videos won't play here and will show "Error 153". <a href="https://app.netlify.com/drop" target="_blank" rel="noopener">Host it free on Netlify</a> to fix it.</span>
      <button aria-label="Dismiss">&times;</button>`;
    document.body.prepend(bar);
    bar.querySelector("button").addEventListener("click", () => {
      bar.remove();
      sessionStorage.setItem("sdk_file_warn_dismissed", "1");
    });
  }

})();
