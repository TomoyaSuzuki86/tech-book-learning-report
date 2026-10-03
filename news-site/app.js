const IMAGES = {
 tanker: "https://images.unsplash.com/photo-1530890448995-4d82724f702c?auto=format&fit=crop&w=1600&q=82",
 eu: "https://www.worldatlas.com/r/w1200-q80/upload/b8/99/ca/european-commission-european-union-belgium.jpg",
 canal: "https://media.egyin.com/ArticleUpload/2025/3/3/776c4d92-3199-4e64-b_1787_075516.jpg",
 brics: "https://www.financialmail.businessday.co.za/resizer/v2/VYSCC7UCRJP3DIBZZSZVMO4JWQ.jpg?auth=e656daf8936115ebca14aecf1ec7e0fc77a3b2ac9e4ef03005af6c6277dc1958&height=630&smart=true&width=1200",
 space: "https://assets.science.nasa.gov/dynamicimage/assets/science/missions/aqua/aqua_mission_banner.jpg?crop=faces%2Cfocalpoint&fit=crop&h=1125&w=2000",
 canada: "https://tradeisds.com/wp-content/uploads/shutterstock_508572865-2-scaled.jpg",
 bank: "https://usconstitution.net/media/images/federal-reserve-eccles-building-washington-dc_e5353c.jpg",
 storm: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1600&q=82",
 cinema: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=82",
 creator: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=82"
};


const SUPABASE_URL = "https://aaygbxirwyqyubqdejym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Bv2oJTbvw3Cr12LzLFt1tg_w2Ffjhlg";
const REMOTE_NEWS_URL = `${SUPABASE_URL}/rest/v1/kanata_hinata_articles?select=id,article_date,category,topic,legacy_no,title,summary,dialogue,takeaway,image_url,image_alt,image_credit,sources&order=article_date.desc,id.asc`;

const REMOTE_FALLBACK_IMAGES = {
  "世界": {
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1600&q=82",
    imageAlt: "世界地図と国際ニュースを想起させるテーマ画像",
    credit: "テーマイメージ / Unsplash"
  },
  "国内": {
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=82",
    imageAlt: "日本の都市と国内ニュースを想起させるテーマ画像",
    credit: "テーマイメージ / Unsplash"
  },
  "エンタメ": {
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=82",
    imageAlt: "映画館とカルチャーニュースを想起させるテーマ画像",
    credit: "テーマイメージ / Unsplash"
  }
};

const episodes = [];

const grid=document.getElementById("episodeGrid");
const search=document.getElementById("search");
const sortOrder=document.getElementById("sortOrder");
const articleSort=document.getElementById("articleSortOrder");
const chips=document.getElementById("categoryFilters");
const featured=document.getElementById("featured");

function escapeHtml(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function safeHttpUrl(value){
  try{
    const url=new URL(String(value ?? ""));
    return (url.protocol==="https:"||url.protocol==="http:") ? url.href : "";
  }catch{return ""}
}

function remoteRowToEpisode(row){
  const fallback=REMOTE_FALLBACK_IMAGES[row.category] || REMOTE_FALLBACK_IMAGES["世界"];
  const dialogue=Array.isArray(row.dialogue)
    ? row.dialogue.map(turn=>[
        escapeHtml(Array.isArray(turn)?turn[0]:turn?.speaker),
        escapeHtml(Array.isArray(turn)?turn[1]:turn?.text)
      ])
    : [];
  const sources=Array.isArray(row.sources)
    ? row.sources.map(source=>({
        title:escapeHtml(source?.title),
        publisher:escapeHtml(source?.publisher),
        url:safeHttpUrl(source?.url),
        published_at:escapeHtml(source?.published_at)
      })).filter(source=>source.url)
    : [];
  return {
    no:row.legacy_no?Number(row.legacy_no):1000000+Number(row.id),
    displayNo:row.legacy_no?Number(row.legacy_no):Number(row.id),
    date:String(row.article_date).replaceAll("-","."),
    category:escapeHtml(row.topic||row.category),
    image:safeHttpUrl(row.image_url)||fallback.image,
    imageAlt:escapeHtml(row.image_alt)||fallback.imageAlt,
    credit:escapeHtml(row.image_credit)||fallback.credit,
    title:escapeHtml(row.title),
    summary:escapeHtml(row.summary),
    takeaway:escapeHtml(row.takeaway),
    dialogue,
    sources,
    remote:true
  };
}

async function loadRemoteEpisodes(){
  const response=await fetch(REMOTE_NEWS_URL,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});
  if(!response.ok)throw new Error(`Supabase news fetch failed: ${response.status}`);
  const rows=await response.json();
  const order={"世界":0,"国内":1,"エンタメ":2};
  const remote=rows.map(remoteRowToEpisode).sort((a,b)=>
    b.date.localeCompare(a.date) || (order[a.category]??9)-(order[b.category]??9)
  );
  const seen=new Set(episodes.map(e=>`${e.date}\u0000${e.title}`));
  for(const e of remote){
    const key=`${e.date}\u0000${e.title}`;
    if(!seen.has(key)){episodes.push(e);seen.add(key)}
  }
}

function renderAll(){
  categories=["すべて",...new Set(episodes.map(e=>e.category))];
  renderFeatured();
  renderChips();
  renderCards();
  renderRoute();
}

const homeView=document.getElementById("homeView");
const articleView=document.getElementById("articleView");
const articleContent=document.getElementById("articleContent");
const relatedGrid=document.getElementById("relatedGrid");
let categories=["すべて",...new Set(episodes.map(e=>e.category))];
let activeCategory="すべて";

function niceDate(date){const [y,m,d]=date.split(".");return `${y}年${Number(m)}月${Number(d)}日`}
function setHash(hash){if(location.hash===hash)renderRoute();else location.hash=hash}
function sortedEpisodes(list=episodes){
 return [...list].sort((a,b)=>sortOrder.value==="oldest"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
}
function renderFeatured(){
 const e=[...episodes].sort((a,b)=>b.date.localeCompare(a.date))[0];
 if(!e){featured.innerHTML=`<div class="empty">記事を読み込んでいます…</div>`;return}
 featured.innerHTML=`
  <img class="featured-image" src="${e.image}" alt="${e.imageAlt}">
  <div class="featured-overlay"></div>
  <div class="featured-copy">
   <div class="featured-meta"><span>特集</span><span>｜</span><span>${e.category}</span><span>${niceDate(e.date)}</span></div>
   <h1>${e.title}</h1>
   <p>${e.summary}</p>
   <a class="featured-read" href="#article-${e.no}">最新の討論を読む →</a>
  </div>
  <span class="image-note">${e.credit}</span>`;
}
function renderChips(){
 chips.innerHTML=categories.map(c=>`<button class="category-chip ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
 chips.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{activeCategory=b.dataset.category;renderChips();renderCards()}));
}
function renderCards(){
 const q=search.value.trim().toLowerCase();
 let rows=episodes.filter(e=>(activeCategory==="すべて"||e.category===activeCategory)&&[e.title,e.summary,e.category,e.takeaway].join(" ").toLowerCase().includes(q));
 rows=sortedEpisodes(rows);
 grid.innerHTML=rows.length?rows.map(e=>`
  <article class="news-card" data-id="${e.no}" tabindex="0" role="link" aria-label="${e.title}">
   <div class="news-card-image-wrap">
    <img loading="lazy" src="${e.image}" alt="${e.imageAlt}">
    <span class="image-badge">${e.category}</span>
   </div>
   <div class="news-card-meta"><span class="category">#${String(e.displayNo??e.no).padStart(2,"0")}</span><time>${niceDate(e.date)}</time></div>
   <h2>${e.title}</h2>
   <p>${e.summary}</p>
   <div class="news-card-footer"><span class="byline"><span class="mini-avatar">対</span>奏汰 × 日向</span><span>読む →</span></div>
  </article>`).join(""):'<div class="empty">条件に一致する記事がありません。</div>';
 grid.querySelectorAll(".news-card").forEach(card=>{
   const open=()=>setHash("#article-"+card.dataset.id);
   card.addEventListener("click",open);
   card.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();open()}});
 });
}
function renderArticle(id){
 const e=episodes.find(x=>x.no===id);
 if(!e){setHash("#archive");return}
 document.title=`${e.title} | 奏汰と日向のニュース討論`;
 articleContent.innerHTML=`
  <div class="article-hero">
   <img src="${e.image}" alt="${e.imageAlt}">
   <span class="image-note">${e.credit} / 記事テーマを表すイメージ</span>
  </div>
  <div class="article-body-wrap">
   <header class="article-header">
    <div class="article-labels"><span class="category">${e.category}</span><span>#${String(e.no).padStart(2,"0")}</span><time>${niceDate(e.date)}</time></div>
    <h1>${e.title}</h1>
    <p class="article-deck">${e.summary}</p>
   </header>
   <div class="author-strip">
    <div class="author"><span class="author-avatar k">奏</span><div><strong>奏汰</strong><small>好奇心と鋭い問い</small></div></div>
    <div class="author"><span class="author-avatar h">日</span><div><strong>日向</strong><small>歴史・経済・地政学</small></div></div>
   </div>
   <p class="article-intro">${e.summary} 今回は、この出来事の背景、当事者の利害、見落とされやすい構造、そして長期的に何を残すのかを二人の対話から読み解く。</p>
   <section class="dialogue">
    ${e.dialogue.map(([who,text])=>`<div class="exchange ${who==="奏汰"?"kanata":"hinata"}"><div class="who">${who}</div><div class="bubble"><span class="speaker-name">${who}</span>${text}</div></div>`).join("")}
   </section>
   <div class="takeaway"><strong>KEY TAKEAWAY</strong>${e.takeaway}</div>
   ${e.sources?.length?`<section class="article-sources"><h2>Sources</h2><ul>${e.sources.map(source=>`<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.publisher?source.publisher+"｜":""}${source.title}</a>${source.published_at?`<small>${source.published_at}</small>`:""}</li>`).join("")}</ul></section>`:""}
  </div>`;
 const related=episodes.filter(x=>x.no!==id).sort((a,b)=>Math.abs(a.no-id)-Math.abs(b.no-id)).slice(0,3);
 relatedGrid.innerHTML=related.map(x=>`<article class="related-card" data-id="${x.no}"><img loading="lazy" src="${x.image}" alt="${x.imageAlt}"><h3>${x.title}</h3></article>`).join("");
 relatedGrid.querySelectorAll(".related-card").forEach(c=>c.addEventListener("click",()=>setHash("#article-"+c.dataset.id)));
 window.scrollTo({top:0,behavior:"instant"});
}
function renderRoute(){
 const m=location.hash.match(/^#article-(\d+)$/);
 if(m){
   homeView.hidden=true;articleView.hidden=false;renderArticle(Number(m[1]));
 }else{
   articleView.hidden=true;homeView.hidden=false;document.title="奏汰と日向のニュース討論";
   if(location.hash==="#archive")setTimeout(()=>document.getElementById("archive").scrollIntoView(),0);
 }
}
search.addEventListener("input",renderCards);
sortOrder.addEventListener("change",()=>{articleSort.value=sortOrder.value;renderCards()});
articleSort.addEventListener("change",()=>{sortOrder.value=articleSort.value;renderCards();setHash("#archive")});
document.getElementById("backToArchive").addEventListener("click",()=>setHash("#archive"));
document.getElementById("menuButton").addEventListener("click",()=>setHash("#archive"));
window.addEventListener("hashchange",renderRoute);
renderAll();
loadRemoteEpisodes()
  .then(renderAll)
  .catch(error=>console.warn("Remote news load failed; using bundled archive.",error));


// PWA: install prompt and offline support
const installButton = document.getElementById("installButton");
let deferredInstallPrompt = null;

function isStandalone(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installButton && !isStandalone()) {
    installButton.hidden = false;
    installButton.classList.add("ready");
  }
});

if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.remove("ready");
    installButton.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (installButton) {
    installButton.classList.remove("ready");
    installButton.hidden = true;
  }
});

if (isStandalone() && installButton) {
  installButton.hidden = true;
}
