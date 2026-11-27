const ITEMS = [
  { id:"zandik", name:"Zandik (85)", type:"character", image:"images/zandik.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"dottore65", name:"Il Dottore 65", type:"character", image:"images/dottore_65.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"dottore45", name:"Il Dottore 45", type:"character", image:"images/dottore_45.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"omega", name:"Omega", type:"character", image:"images/omega.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"webdottore", name:"Web Dottore", type:"character", image:"images/web_dottore.png", emoji:"💻", weight:0.25 },
  { id:"dottore18", name:"Il Dottore 18", type:"character", image:"images/dottore_18.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"dottore8", name:"Il Dottore 8", type:"character", image:"images/dottore_8.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"dottore25", name:"Il Dottore 25", type:"character", image:"images/dottore_25.png", emoji:"🧑‍🔬", weight:0.25 },
  { id:"dodore", name:"Dodore (Birds)", type:"junk", image:"images/dodore.png", emoji:"🐦", weight:32.6333333333 },
  { id:"ruinguard", name:"Ruin Guard", type:"junk", image:"images/ruin_guard.png", emoji:"🤖", weight:32.6333333333 },
  { id:"dottomon", name:"Dottomon", type:"junk", image:"images/dottomon.png", emoji:"🐾", weight:32.6333333333 },
  { id:"goldenruinguard", name:"GOLDEN RUIN GUARD", type:"secret", image:"images/golden_ruin_guard.png", emoji:"✨", weight:0.1 }
];

const STARTING_PULLS = 1000;
const PULL_COST = 10;
const MAX_STARS = 5;
const STORAGE_KEY = "ilDottoreUltimateGacha_v1";

// Social links
const SOCIALS = [
  { name:"YouTube", icon:"▶", url:"https://youtube.com/@AuthorHD", reward:200 },
  { name:"Telegram", icon:"✈", url:"https://t.me/AuthorHD", reward:200 },
  { name:"Twitter / X", icon:"𝕏", url:"https://x.com/Author_HD", reward:200 },
  { name:"Patreon", icon:"P", url:"https://patreon.com/AuthorHD", reward:200 },
  { name:"Tumblr", icon:"t", url:"https://www.tumblr.com/authorhd", reward:200 }
];

const $ = (id) => document.getElementById(id);
const music = $("backgroundMusic");
const chestSound = $("chestSound");
let state = loadState();
let busy = false;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.pulls === "number" && saved.collection) {
      // Backward compatibility with saves created before the 60-pull guarantee.
      if (typeof saved.pity !== "number") saved.pity = 0;
      if (!Array.isArray(saved.claimedSocials)) saved.claimedSocials = [];
      if (!Array.isArray(saved.claimedSupportLinks)) saved.claimedSupportLinks = [];
      return saved;
    }
  } catch (e) {}
  return { pulls:STARTING_PULLS, collection:{}, claimedSocials:[], claimedSupportLinks:[], totalPulls:0, pity:0 };
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function weightedPick(pool = ITEMS) {
  const total = pool.reduce((sum,item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1];
}
function itemImage(item, className="") {
  const img = document.createElement("img");
  img.src = item.image;
  img.alt = item.name;
  img.className = className;
  img.onerror = () => { img.replaceWith(Object.assign(document.createElement("div"), {className:"art-fallback", textContent:item.emoji})); };
  return img;
}
function makeCard(item, count, isNew=false) {
  const card = document.createElement("article");
  card.className = "drop-card";
  const frame = document.createElement("div");
  frame.className = "art-frame";
  frame.appendChild(itemImage(item));
  const name = document.createElement("div");
  name.className = "item-name";
  name.textContent = item.name;
  const type = document.createElement("div");
  type.className = "item-type";
  type.textContent = item.type === "secret" ? "SECRET DROP" : item.type;
  const stars = document.createElement("div");
  stars.className = "stars";
  stars.textContent = item.type === "character" ? "★".repeat(Math.min(count || 1,MAX_STARS)) : (item.type === "secret" ? "✦ ✦ ✦" : "");
  const owned = document.createElement("div");
  owned.className = "owned";
  owned.textContent = isNew ? "NEW DISCOVERY!" : (count ? `Owned: ${count}` : "");
  card.append(frame,name,type,stars,owned);
  return card;
}
function render() {
  $("ticketCount").textContent = state.pulls.toLocaleString("en-US");
  $("costCount").textContent = state.pulls.toLocaleString("en-US");
  $("pityCount").textContent = `${state.pity} / 60`;
  $("pullButton").disabled = state.pulls < PULL_COST || busy;
  $("collectionCount").textContent = `${Object.keys(state.collection).length} / ${ITEMS.length}`;
  renderCollection();
  renderSocials();
  renderSupportLinks();
}
function renderCollection() {
  const grid = $("collectionGrid");
  grid.replaceChildren();
  ITEMS.forEach(item => {
    const count = state.collection[item.id] || 0;
    const card = makeCard(item,count);
    if (!count) card.classList.add("unknown");
    if (!count) {
      card.querySelector(".art-frame").innerHTML = '<div class="art-fallback">❔</div>';
      card.querySelector(".item-name").textContent = "???";
      card.querySelector(".item-type").textContent = "NOT DISCOVERED";
      card.querySelector(".stars").textContent = "";
      card.querySelector(".owned").textContent = "Not found yet";
    } else if (item.type === "character") {
      card.querySelector(".owned").textContent = `Copies: ${count}`;
    }
    // Artwork zoom is available only for discovered items in My Collection.
    if (count > 0) {
      card.classList.add("character-card-clickable");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View ${item.name} artwork full size`);
      const openArtwork = () => openCharacterArtwork(item);
      card.addEventListener("click", openArtwork);
      card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openArtwork();
        }
      });
    }
    grid.appendChild(card);
  });
}
function renderSocials() {
  const wrap = $("socialButtons");
  wrap.replaceChildren();
  SOCIALS.forEach(social => {
    const claimed = state.claimedSocials.includes(social.name);
    const button = document.createElement("a");
    button.className = "social-button";
    button.href = social.url;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.innerHTML = `<span>${social.icon}</span><span>${social.name}</span><b>${claimed ? "CLAIMED" : `+${social.reward}`}</b>`;
    if (claimed) {
      button.style.opacity = ".55";
      button.style.pointerEvents = "none";
    } else {
      button.addEventListener("click", () => {
        state.pulls += social.reward;
        state.claimedSocials.push(social.name);
        saveState();
        render();
      });
    }
    wrap.appendChild(button);
  });
}
function renderSupportLinks() {
  document.querySelectorAll("[data-support-link]").forEach(link => {
    const key = link.dataset.supportLink;
    const claimed = state.claimedSupportLinks.includes(key);
    const label = key === "paypal" ? "♡ PayPal.me" : "✦ DonationAlerts";
    link.textContent = claimed ? `${label} · CLAIMED` : `${label} · +500`;
    link.style.opacity = claimed ? ".65" : "";
    link.setAttribute("aria-label", claimed ? `${label}, reward already claimed` : `${label}, claim 500 pulls`);
  });
}

function claimSupportReward(link) {
  const key = link.dataset.supportLink;
  if (!key || state.claimedSupportLinks.includes(key)) return;
  state.pulls += 500;
  state.claimedSupportLinks.push(key);
  saveState();
  render();
}

function showRecent(drops) {
  const grid = $("resultsGrid");
  grid.replaceChildren();
  drops.forEach(({item,count,isNew}) => {
    const card = makeCard(item,count,isNew);
    grid.appendChild(card);
  });
}
function showReveal(drops) {
  const overlay = $("revealOverlay");
  const items = $("revealItems");
  items.replaceChildren();
  const secretFound = drops.some(d => d.item.type === "secret");
  $("revealTitle").textContent = secretFound ? "THE GOLDEN DISCOVERY!!!" : "YOUR NEW DISCOVERIES!";
  drops.forEach(({item,count,isNew}) => items.appendChild(makeCard(item,count,isNew)));
  overlay.hidden = false;
}
function startMusic() {
  if (music.dataset.started) return;
  music.volume = 0.22;
  music.play().then(() => music.dataset.started = "yes").catch(() => {});
}
async function doPull() {
  if (busy || state.pulls < PULL_COST) return;
  startMusic();
  busy = true;
  render();
  $("statusLine").textContent = "The chest is opening...";
  $("chestWrap").classList.remove("shake");
  void $("chestWrap").offsetWidth;
  $("chestWrap").classList.add("shake");
  chestSound.currentTime = 0;
  chestSound.volume = 0.8;
  chestSound.play().catch(() => {});
  await new Promise(resolve => setTimeout(resolve,650));

  state.pulls -= PULL_COST;
  state.totalPulls += PULL_COST;
  const drops = [];
  for (let i=0;i<10;i++) {
    // Pity counts individual pulls since the last character.
    // After 59 consecutive pulls without a character, the next pull is guaranteed.
    const item = state.pity >= 59
      ? weightedPick(ITEMS.filter(candidate => candidate.type === "character"))
      : weightedPick();

    const before = state.collection[item.id] || 0;
    state.collection[item.id] = before + 1;
    drops.push({item,count:state.collection[item.id],isNew:before===0});

    if (item.type === "character") {
      state.pity = 0;
    } else {
      state.pity += 1;
    }
  }
  saveState();
  busy = false;
  $("statusLine").textContent = drops.some(d=>d.item.type==="secret") ? "A MIRACLE?! THE GOLDEN RUIN GUARD!" : "Experiment complete. Results recorded.";
  showRecent(drops);
  render();
  showReveal(drops);
}
function openCharacterArtwork(item) {
  $("lightboxImage").src = item.image;
  $("lightboxImage").alt = item.name;
  $("lightboxName").textContent = item.name;
  $("artLightbox").hidden = false;
  $("closeArtLightbox").focus();
}
function closeCharacterArtwork() {
  $("artLightbox").hidden = true;
  $("lightboxImage").src = "";
}
function closeReveal() { $("revealOverlay").hidden = true; }
function openRefill() { $("refillOverlay").hidden = false; }
function closeRefill() { $("refillOverlay").hidden = true; }
document.querySelectorAll("[data-support-link]").forEach(link => {
  link.addEventListener("click", () => claimSupportReward(link));
});
$("pullButton").addEventListener("click",doPull);
$("ticketCounter").addEventListener("click",openRefill);
$("ticketCounter").addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openRefill(); } });
$("closeRefill").addEventListener("click",closeRefill);
$("refillOverlay").addEventListener("click", event => { if (event.target === $("refillOverlay")) closeRefill(); });
$("closeReveal").addEventListener("click",closeReveal);
$("closeArtLightbox").addEventListener("click",closeCharacterArtwork);
$("artLightbox").addEventListener("click", event => {
  if (event.target === $("artLightbox")) closeCharacterArtwork();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !$("artLightbox").hidden) closeCharacterArtwork();
});
$("revealDone").addEventListener("click",closeReveal);
$("clearResultsButton").addEventListener("click",() => {
  $("resultsGrid").innerHTML = '<div class="empty-state">Your next discoveries will appear here ✨</div>';
});
$("resetButton").addEventListener("click",() => {
  if (!confirm("Reset your pulls and collection? This cannot be undone.")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  $("resultsGrid").innerHTML = '<div class="empty-state">Your next discoveries will appear here ✨</div>';
  $("statusLine").textContent = "A fresh experiment begins.";
  render();
});

const chest = new Image();
chest.src = "images/chest.png";
chest.onload = () => {
  $("chestImage").hidden = false;
  $("chestPlaceholder").hidden = true;
};
render();
