// ═══════════════════════════════════════════════
// Firebase SDK Modules
// ═══════════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ═══════════════════════════════════════════════
// Firebase Config
// ═══════════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyAVe2Xpm7QmWuQht9Qsk0zydRrv7Zvtqys",
  authDomain: "campground-da569.firebaseapp.com",
  projectId: "campground-da569",
  storageBucket: "campground-da569.firebasestorage.app",
  messagingSenderId: "336185176947",
  appId: "1:336185176947:web:b6e0597134a889f0604b06",
  measurementId: "G-PBDZSJ09E5"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);
const campsCollection = collection(db, "campsites");

// ═══════════════════════════════════════════════
// Globals
// ═══════════════════════════════════════════════
const PH_CITIES = [];
let camps = [];
let currentLocationFilter = 'ALL PROVINCES';
const activeAmenities = new Set();
let currentImageData = '';
let currentUser = null;

// ═══════════════════════════════════════════════
// Pixel Icons Library
// ═══════════════════════════════════════════════
const PIXEL_ICONS = {
  trees: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M7 1h2v2H7zM6 3h4v2H6zM5 5h6v2H5zM4 7h8v2H4zM3 9h10v2H3zM7 11h2v4H7z"/></svg>`,
  restroom: `<svg class="pixel-icon" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" xml:space="preserve"><style type="text/css">.st0{fill:#000000;}</style><g><path class="st0" d="M12.344 4.786a2.334 2.334 0 1 0 0 -4.669 2.334 2.334 0 0 0 0 4.669"/><path class="st0" d="M3.656 4.786a2.334 2.334 0 1 0 0 -4.669 2.334 2.334 0 0 0 0 4.669"/><path class="st0" d="m15.883 13.838 -3.202 -7.531a0.375 0.375 0 0 0 -0.338 -0.223 0.375 0.375 0 0 0 -0.338 0.223l-3.202 7.531a1.469 1.469 0 0 0 0.127 1.386 1.469 1.469 0 0 0 1.227 0.659h4.372a1.469 1.469 0 0 0 1.227 -0.659 1.469 1.469 0 0 0 0.127 -1.386"/><path class="st0" d="M5.842 6.081H1.47a1.469 1.469 0 0 0 -1.353 2.045l3.202 7.531a0.367 0.367 0 0 0 0.677 0l3.202 -7.531a1.469 1.469 0 0 0 -1.353 -2.045"/></g></svg>`,
  electricity: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M9 1H6v5H3l5 9V9h3z"/></svg>`,
  wifi: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M2 3h12v2H2zM4 6h8v2H4zM6 9h4v2H6zM7 12h2v2H7z"/></svg>`,
  pisoWifi: `<svg class="pixel-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>i</title><g id="Complete"><g id="signal"><g><path d="M2.5,12A9.5,9.5,0,1,1,12,21.5" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M7.5,12A4.5,4.5,0,1,1,12,16.5" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></g></g></g></svg>`,
  signal: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M1 12h2v3H1zM5 9h2v6H5zM9 6h2v9H9zM13 2h2v13h-2z"/></svg>`,
  parking: `<svg class="pixel-icon" viewBox="0 0 15 15" version="1.1" id="parking" xmlns="http://www.w3.org/2000/svg"><path d="M11.85,8.37c-0.9532,0.7086-2.1239,1.0623-3.31,1H5.79V14H3V1h5.72c1.1305-0.0605,2.244,0.2952,3.13,1c0.8321,0.8147,1.2543,1.9601,1.15,3.12C13.1271,6.3214,12.7045,7.5159,11.85,8.37z M9.75,3.7C9.3254,3.3892,8.8052,3.237,8.28,3.27H5.79v3.82h2.49c0.5315,0.0326,1.056-0.1351,1.47-0.47c0.3795-0.3947,0.5693-0.9346,0.52-1.48C10.324,4.606,10.1327,4.0763,9.75,3.7z"/></svg>`,
  carCamping: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M3 5h10v3H3zM1 8h14v4H1zM3 12h3v2H3zM10 12h3v2h-3z"/></svg>`,
  motorCamping: `<svg class="pixel-icon" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 260.004 260.004" style="enable-background:new 0 0 260.004 260.004;" xml:space="preserve"><path id="XMLID_451_" d="M200.002,0h-140c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h27.58c-1.665,4.695-2.58,9.742-2.58,15c0,19.555,12.541,36.228,30,42.42V110h-25c-8.284,0-15,6.716-15,15v55.017c0,8.284,6.716,15,15,15h10v49.987c0,8.284,6.716,15,15,15h30c8.284,0,15-6.716,15-15v-49.987h10c8.284,0,15-6.716,15-15V125c0-8.284-6.716-15-15-15h-25V87.42c17.459-6.192,30-22.865,30-42.42c0-5.258-0.915-10.305-2.58-15h27.58c8.284,0,15-6.716,15-15C215.002,6.716,208.286,0,200.002,0z M155.002,165.017h-10h-30h-10V140h50V165.017z M145.002,45c0,8.271-6.729,15-15,15s-15-6.729-15-15c0-8.271,6.729-15,15-15S145.002,36.729,145.002,45z"/></svg>`,
  tentOnly: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M8 2L1 14h14L8 2zm0 3.5l4 7H4l4-7z"/><path d="M7 9h2v5H7z"/></svg>`,
  hammock: `<svg class="pixel-icon" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 60.626 60.626" style="enable-background:new 0 0 60.626 60.626;" xml:space="preserve"><g><g><path style="fill:#010002;" d="M59.601,20.867L33.927,43.31c-1.605,1.404-3.213,2.068-4.778,1.971c-2.286-0.145-3.798-1.882-3.812-1.898L1.066,20.46L0,21.324l24.196,22.847c0.248,0.28,2.037,2.192,4.833,2.375c0.143,0.01,0.285,0.016,0.429,0.016c1.863,0,3.71-0.791,5.496-2.352l25.672-22.444L59.601,20.867z"/><circle style="fill:#010002;" cx="41.755" cy="18.658" r="4.594"/><path style="fill:#010002;" d="M27.054,40.402c0.007,0.008,0.014,0.018,0.022,0.023c0.109,0.108,0.223,0.209,0.34,0.301c0.24,0.215,0.48,0.43,0.72,0.646c1.487,1.33,3.379,0.664,4.26-0.591c0.17-0.118,0.334-0.243,0.488-0.386c2.815-2.574,5.631-5.15,8.443-7.727c0.16-0.086,0.318-0.188,0.471-0.324c3.469-3.104,6.938-6.207,10.404-9.311c2.111-1.887-0.998-4.974-3.098-3.097c-2.492,2.229-4.982,4.458-7.474,6.687c-0.013-0.011-0.022-0.025-0.034-0.037c-1.652-1.63-4.158-1.48-5.81,0.031c-2.629,2.403-5.255,4.807-7.881,7.208c-4.991-4.468-9.982-8.936-14.972-13.403c-2.62-2.348-6.507,1.511-3.87,3.872C15.061,29.665,21.057,35.033,27.054,40.402z"/></g></g></svg>`,
  forest: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M4 3h2v2H4zM3 5h4v2H3zM2 7h6v2H2zM5 9h2v3H5zM10 1h2v2h-2zM9 3h4v2H9zM8 5h6v2H8zM7 7h8v2H7zM11 9h2v4h-2z"/></svg>`,
  mountain: `<svg class="pixel-icon" viewBox="0 0 16 16"><path d="M8 2l5 10H3l5-10zm0 3L6 9h4L8 5z"/></svg>`,
  river: `<svg class="pixel-icon" viewBox="0 0 1024 1024" fill="#000000" xmlns="http://www.w3.org/2000/svg"><path d="M808.728649 847.058316a128.534411 128.534411 0 0 1 6.619798-188.526329 211.143973 211.143973 0 0 0 10.205522-310.716768l-16.411583-16.135758a128.534411 128.534411 0 0 1 5.654411-188.52633L979.188447 0.137912h-126.051987l-92.677172 80.678788a211.281886 211.281886 0 0 0-9.240134 310.027206l16.411582 16.135757a128.396498 128.396498 0 0 1-6.20606 188.940068 211.143973 211.143973 0 0 0-10.895084 310.027205l119.018451 118.053064h117.087676z"/></svg>`,
  beach: `<svg class="pixel-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none"><path fill="#000000" d="M10 5.196c1.5-2.598 5.098-2.83 7.696-1.33s4.196 4.732 2.696 7.33l-3.464-2-1.732-1-1.732-1-3.464-2z"/><path stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.696 3.866C15.098 2.366 11.5 2.598 10 5.196l3.464 2m4.232-3.33c2.598 1.5 4.196 4.732 2.696 7.33l-5.196-3m2.5-4.33.5-.866m-.5.866c-1.821.488-2.982 1.165-4.232 3.33m4.232-3.33c.488 1.821.482 3.165-.768 5.33m-1.732-1-1.732-1m1.732 1-3 5.196M3 21l.88-1.056a2.001 2.001 0 0 1 3.139.08v0a2.001 2.001 0 0 0 3.107.118l.19-.218a2.236 2.236 0 0 1 3.367 0l.191.218c.838.957 2.344.9 3.107-.117v0a2.001 2.001 0 0 1 3.14-.08L21 21"/></svg>`,
  hiking: `<svg class="pixel-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 22V16L12 14M12 14L13 8M12 14H10M13 8C14 9.16667 15.6 11 18 11M13 8L12.8212 7.82124C12.2565 7.25648 11.2902 7.54905 11.1336 8.33223L10 14M10 14L8 22M18 9.5V22M8 7H7.72076C7.29033 7 6.90819 7.27543 6.77208 7.68377L5.5 11.5L7 12L8 7ZM14.5 3.5C14.5 4.05228 14.0523 4.5 13.5 4.5C12.9477 4.5 12.5 4.05228 12.5 3.5C12.5 2.94772 12.9477 2.5 13.5 2.5C14.0523 2.5 14.5 2.94772 14.5 3.5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trail: `<svg class="pixel-icon" viewBox="0 0 399.888 399.888" xmlns="http://www.w3.org/2000/svg"><g><path d="M322.833,381.871c-0.258-0.005-26.109-0.57-53.849-7.807c-24.776-6.463-56.088-19.696-64.552-46.03c-15.083-46.925,34.861-113.407,74.992-166.826c30.772-40.96,55.077-73.313,53.277-95.816c-1.101-13.765-12.274-26.923-33.208-39.109C283.924,17.22,262.719,8.47,236.467,0.274c-3.164-0.987-6.528,0.776-7.516,3.939c-0.987,3.163,0.776,6.528,3.939,7.515c74.494,23.257,87.015,44.204,87.848,54.62c1.438,17.972-23.989,51.819-50.909,87.652c-43.97,58.529-93.806,124.867-76.822,177.705c19.092,59.399,125.096,62.078,129.599,62.163c0.039,0,0.077,0.001,0.115,0.001c3.261,0,5.935-2.612,5.997-5.887C328.782,384.67,326.146,381.933,322.833,381.871z"/></g></svg>`
};

const ICON_LABELS = {
  trees: 'TREES', restroom: 'RESTROOM', electricity: 'POWER',
  wifi: 'WI-FI', pisoWifi: 'PISO WI-FI', signal: 'SIGNAL',
  parking: 'PARKING', carCamping: 'CAR CAMP', motorCamping: 'MOTOR CAMP',
  tentOnly: 'TENT', hammock: 'HAMMOCK', forest: 'FOREST',
  mountain: 'MOUNTAIN', river: 'RIVER', beach: 'BEACH',
  hiking: 'HIKING', trail: 'TRAIL'
};

// ═══════════════════════════════════════════════
// Icon colour normaliser
// Some source SVGs hardcode black via fill="#000",
// inline style, or an embedded <style> block. Those
// beat our CSS, so we strip them and hand control
// back to `color` via currentColor.
// fill="none" is preserved — those icons are drawn
// with strokes and would turn into blobs otherwise.
// ═══════════════════════════════════════════════
function normaliseIcon(svg) {
  return svg
    // embedded <style> blocks leak globally once injected
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\s(?:class)="st\d+"/gi, '')
    // inline style attributes (only ever used for fill here)
    .replace(/\sstyle="[^"]*"/gi, '')
    // explicit colours -> currentColor, but leave "none" alone
    .replace(/\sfill="(?!none)[^"]*"/gi, ' fill="currentColor"')
    .replace(/\sstroke="(?!none)[^"]*"/gi, ' stroke="currentColor"');
}

Object.keys(PIXEL_ICONS).forEach(k => {
  PIXEL_ICONS[k] = normaliseIcon(PIXEL_ICONS[k]);
});

// ═══════════════════════════════════════════════
// Legend
// ═══════════════════════════════════════════════
function renderLegend() {
  const legendGrid = document.getElementById('legendGrid');
  if (!legendGrid) return;
  legendGrid.innerHTML = '';
  Object.keys(PIXEL_ICONS).forEach(key => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `${PIXEL_ICONS[key]} <span>${ICON_LABELS[key]}</span>`;
    legendGrid.appendChild(item);
  });
}

// ═══════════════════════════════════════════════
// Favourites  (saved locally, per browser)
// ═══════════════════════════════════════════════
const FAV_KEY = 'nextcamp_favourites';
let favourites = new Set();
let showFavsOnly = false;

try {
  favourites = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'));
} catch {
  favourites = new Set();
}

function saveFavourites() {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favourites]));
  } catch {
    /* storage full or blocked — favourites just won't persist */
  }
}

function toggleFavourite(id) {
  favourites.has(id) ? favourites.delete(id) : favourites.add(id);
  saveFavourites();
  updateFavButton();
}

function updateFavButton() {
  const btn = document.getElementById('favFilterBtn');
  if (!btn) return;
  btn.textContent = showFavsOnly
    ? `★ SAVED (${favourites.size})`
    : `☆ SAVED (${favourites.size})`;
  btn.classList.toggle('btn-leaf', showFavsOnly);
  btn.classList.toggle('btn-dark', !showFavsOnly);
}

// ═══════════════════════════════════════════════
// Inventory grid icons  (suggest / edit modal)
// Reuses PIXEL_ICONS so slots match the legend
// ═══════════════════════════════════════════════
function renderInventoryIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const key = el.getAttribute('data-icon');
    if (PIXEL_ICONS[key]) el.innerHTML = PIXEL_ICONS[key];
  });
}

// ═══════════════════════════════════════════════
// Typewriter  (dialogue-box reveal)
// ═══════════════════════════════════════════════
let typeTimer = null;

function typeWriter(el, text, speed = 18) {
  if (!el) return;
  clearInterval(typeTimer);
  el.textContent = '';
  el.classList.remove('done');

  const chars = String(text || '');
  let i = 0;

  // long text reveals faster so it never drags
  const step = chars.length > 260 ? 3 : 1;

  typeTimer = setInterval(() => {
    if (i >= chars.length) {
      clearInterval(typeTimer);
      el.classList.add('done');
      return;
    }
    el.textContent += chars.slice(i, i + step);
    i += step;
  }, speed);

  // tap the box to skip to the end
  el.onclick = () => {
    clearInterval(typeTimer);
    el.textContent = chars;
    el.classList.add('done');
  };
}

// ═══════════════════════════════════════════════
// UI TOGGLES (burger, legend, filter)
// ═══════════════════════════════════════════════

// Burger menu
const burgerBtn      = document.getElementById('burgerBtn');
const burgerDropdown = document.getElementById('burgerDropdown');
if (burgerBtn && burgerDropdown) {
  burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    burgerDropdown.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (!burgerDropdown.contains(e.target) && e.target !== burgerBtn) {
      burgerDropdown.classList.remove('open');
    }
  });
}

// Legend toggle
const legendWrapper   = document.querySelector('.legend-wrapper');
const legendToggleBtn = document.getElementById('legendToggleBtn');
if (legendToggleBtn && legendWrapper) {
  legendToggleBtn.addEventListener('click', () => {
    legendWrapper.classList.toggle('open');
    legendToggleBtn.classList.toggle('open');
  });
}

// Filter wrapper stub (kept for compatibility)
const filterWrapper   = document.querySelector('.filter-wrapper');
const filterToggleBtn = document.getElementById('filterToggleBtn');
if (filterToggleBtn && filterWrapper) {
  filterToggleBtn.addEventListener('click', () => {
    filterWrapper.classList.toggle('open');
  });
}

// ═══════════════════════════════════════════════
// SEARCHBAR — whole section clickable
// ═══════════════════════════════════════════════

// Helper: toggle a dropdown open/close
function toggleDropdown(dropdown) {
  const isOpen = dropdown.classList.contains('open');
  // Close all dropdowns first
  document.querySelectorAll('.custom-dropdown.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) dropdown.classList.add('open');
}

// Section 1: Search — click anywhere focuses the input
const searchbarMain = document.querySelector('.searchbar-main');
const searchInputEl = document.getElementById('searchInput');
if (searchbarMain && searchInputEl) {
  searchbarMain.addEventListener('click', () => searchInputEl.focus());
}

// Section 2: Province — click anywhere on the box opens dropdown
const searchbarProvince = document.querySelector('.searchbar-province');
const customDropdownEl  = document.getElementById('customDropdown');
if (searchbarProvince && customDropdownEl) {
  searchbarProvince.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-menu')) {
      e.stopPropagation();
      toggleDropdown(customDropdownEl);
    }
  });
}

// Section 3: Filter — click anywhere on the box opens dropdown
const searchbarStyle       = document.querySelector('.searchbar-style');
const campingStyleDropdownEl = document.getElementById('campingStyleDropdown');
if (searchbarStyle && campingStyleDropdownEl) {
  searchbarStyle.addEventListener('click', (e) => {
    // Only toggle if clicking the section itself, not inside the menu
    if (!e.target.closest('.dropdown-menu')) {
      e.stopPropagation();
      toggleDropdown(campingStyleDropdownEl);
    }
  });
}

// Close all dropdowns when clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.custom-dropdown.open').forEach(d => d.classList.remove('open'));
});

// ═══════════════════════════════════════════════
// CAMPING STYLE MULTI-SELECT DROPDOWN
// ═══════════════════════════════════════════════
const campingStyleTrigger  = document.getElementById('campingStyleTrigger');
const campingStyleDropdown = document.getElementById('campingStyleDropdown');
const campingStyleMenu     = document.getElementById('campingStyleMenu');
const campingStyleText     = document.getElementById('campingStyleText');

if (campingStyleMenu) {
  // Stop clicks inside menu from bubbling and closing the dropdown
  campingStyleMenu.addEventListener('click', (e) => e.stopPropagation());

  campingStyleMenu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked   = [...campingStyleMenu.querySelectorAll('input:checked')];
      const amenities = checked.map(c => c.getAttribute('data-amenity'));

      // Update label text
      if (amenities.length === 0) {
        campingStyleText.textContent = 'FILTER';
      } else if (amenities.length === 1) {
        campingStyleText.textContent = checked[0].closest('label').textContent.trim();
      } else {
        campingStyleText.textContent = `${amenities.length} SELECTED`;
      }

      // Update activeAmenities and filter cards
      const allKeys = [...campingStyleMenu.querySelectorAll('input[data-amenity]')]
        .map(i => i.getAttribute('data-amenity'));
      allKeys.forEach(key => activeAmenities.delete(key));
      amenities.forEach(key => activeAmenities.add(key));

      if (cardGrid && cardGrid.children.length > 0) filterCards();
    });
  });
}

// ═══════════════════════════════════════════════
// PROVINCE LIST (sidebar)
// ═══════════════════════════════════════════════
function buildProvinceList() {
  const container = document.getElementById('provinceList');
  if (!container) return;
  container.innerHTML = '';

  // Match renderCards visibility: admins see everything,
  // visitors only see approved entries.
  const visible = camps.filter(c =>
    currentUser || (c.status || 'approved') === 'approved'
  );

  const locations = [...new Set(visible.map(c => c.location).filter(Boolean))].sort();
  const all = ['ALL PROVINCES', ...locations];

  all.forEach(loc => {
    const item = document.createElement('div');
    item.className = 'province-item' + (loc === currentLocationFilter ? ' selected' : '');

    const count = loc === 'ALL PROVINCES'
      ? visible.length
      : visible.filter(c => c.location === loc).length;

    item.innerHTML = `
      <input type="checkbox" ${loc === currentLocationFilter ? 'checked' : ''}>
      <span style="flex:1">${loc}</span>
      <span class="province-count">(${count})</span>
    `;

    item.addEventListener('click', () => {
      document.querySelectorAll('.province-item').forEach(i => {
        i.classList.remove('selected');
        i.querySelector('input').checked = false;
      });
      item.classList.add('selected');
      item.querySelector('input').checked = true;
      currentLocationFilter = loc;
      filterCards();
    });

    container.appendChild(item);
  });
}

// ═══════════════════════════════════════════════
// Auth State
// ═══════════════════════════════════════════════
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const adminLoginBtn  = document.getElementById('adminLoginBtn');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  const adminAddNewBtn = document.getElementById('adminAddNewBtn');

  if (user) {
    if (adminLoginBtn)  adminLoginBtn.style.display  = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-block';
    if (adminAddNewBtn) adminAddNewBtn.style.display = 'inline-block';
  } else {
    if (adminLoginBtn)  adminLoginBtn.style.display  = 'inline-block';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
    if (adminAddNewBtn) adminAddNewBtn.style.display = 'none';
  }
  renderCards();
});

const adminAddNewBtn = document.getElementById('adminAddNewBtn');
if (adminAddNewBtn) {
  adminAddNewBtn.addEventListener('click', () => openEditorModal(null, true));
}

// ═══════════════════════════════════════════════
// Firestore Realtime Listener
// ═══════════════════════════════════════════════
onSnapshot(campsCollection, (snapshot) => {
  camps = snapshot.docs.map(d => ({ id: String(d.id), ...d.data() }));
  renderCards();

  // run the deep link once, after the first load
  if (!deepLinkDone) {
    deepLinkDone = true;
    openFromHash();
  }
}, (error) => {
  console.error("Firestore error:", error);
  alert("Error connecting to database. Check console for details.");
});

async function saveCampToCloud(campData) {
  const docRef = doc(db, "campsites", String(campData.id));
  await setDoc(docRef, campData);
}

async function deleteCampFromCloud(id) {
  if (!id) return;
  const docRef = doc(db, "campsites", String(id));
  await deleteDoc(docRef);
}

// ═══════════════════════════════════════════════
// Render Cards
// ═══════════════════════════════════════════════
const cardGrid = document.getElementById('cardGrid');

function renderCards() {
  if (!cardGrid) return;
  cardGrid.innerHTML = '';

  const visibleCamps = camps.filter(camp => {
    if (currentUser) return true;
    return (camp.status || 'approved') === 'approved';
  });

  visibleCamps.forEach(camp => {
    const isPending = camp.status === 'pending';
    const displayLocation = [camp.locDetails, camp.location].filter(Boolean).join(', ');

    const imageHtml = camp.img && camp.img.trim() !== ''
      ? `<img src="${camp.img}" alt="${camp.name || 'Campsite'}" class="card-image">`
      : `<div class="no-image-placeholder">NO IMAGE</div>`;

    let adminBarHtml = '';
    if (currentUser) {
      if (isPending) {
        adminBarHtml = `
          <div class="pending-banner">PENDING SUGGESTION</div>
          <div class="admin-approval-actions">
            <button class="btn btn-leaf approve-btn" data-id="${camp.id}">APPROVE</button>
            <button class="btn btn-blood decline-btn" data-id="${camp.id}">DECLINE</button>
          </div>`;
      }
      adminBarHtml += `
        <div class="card-menu-container">
          <button class="card-menu-btn" title="Options">⋮</button>
          <div class="card-dropdown-menu">
            <button class="card-edit-btn" data-id="${camp.id}">EDIT</button>
          </div>
        </div>`;
    }

    const isFav = favourites.has(camp.id);

    const card = document.createElement('article');
    card.className = 'camp-card';
    card.setAttribute('data-id', camp.id);
    card.innerHTML = `
      ${adminBarHtml}
      <button class="fav-btn${isFav ? ' on' : ''}" data-fav="${camp.id}"
              title="${isFav ? 'Remove from saved' : 'Save for later'}"
              aria-label="Save">${isFav ? '★' : '☆'}</button>
      <div class="card-image-wrapper">${imageHtml}</div>
      <div class="card-content">
        <h2 class="camp-title">${camp.name || ''}</h2>
        <div class="card-actions">
          <span class="card-location-icon">
            <svg viewBox="0 0 18 18" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
              <path fill="#62d06f" d="M8 1a5 5 0 00-5 5c0 3.8 5 9 5 9s5-5.2 5-9a5 5 0 00-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </span>
          <span class="camp-location">${displayLocation || 'LOCATION UNKNOWN'}</span>
        </div>
      </div>`;

    if (currentUser) {
      const menuBtn      = card.querySelector('.card-menu-btn');
      const dropdownMenu = card.querySelector('.card-dropdown-menu');

      if (menuBtn && dropdownMenu) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          document.querySelectorAll('.card-dropdown-menu').forEach(m => {
            if (m !== dropdownMenu) m.classList.remove('open');
          });
          dropdownMenu.classList.toggle('open');
        });
      }

      const editBtn = card.querySelector('.card-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (dropdownMenu) dropdownMenu.classList.remove('open');
          openEditorModal(camp);
        });
      }

      const approveBtn = card.querySelector('.approve-btn');
      if (approveBtn) {
        approveBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          await saveCampToCloud({ ...camp, status: 'approved' });
        });
      }

      const declineBtn = card.querySelector('.decline-btn');
      if (declineBtn) {
        declineBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (confirm('DECLINE AND DELETE THIS SUGGESTION?')) {
            try { await deleteCampFromCloud(camp.id); }
            catch (err) { alert("Error: " + err.message); }
          }
        });
      }
    }

    const favBtn = card.querySelector('.fav-btn');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFavourite(camp.id);
        const nowFav = favourites.has(camp.id);
        favBtn.classList.toggle('on', nowFav);
        favBtn.textContent = nowFav ? '★' : '☆';
        favBtn.title = nowFav ? 'Remove from saved' : 'Save for later';
        // if the saved-only filter is active, re-run so it drops out live
        if (showFavsOnly) filterCards();
      });
    }

    card.addEventListener('click', (e) => {
      if (!e.target.closest('.card-menu-container') &&
          !e.target.closest('.admin-approval-actions') &&
          !e.target.closest('.fav-btn')) {
        openDetailModal(camp);
      }
    });

    cardGrid.appendChild(card);
  });

  buildProvinceList();
  populateLocationDropdown();
  filterCards();
}

document.addEventListener('click', () => {
  document.querySelectorAll('.card-dropdown-menu').forEach(m => m.classList.remove('open'));
});

// ═══════════════════════════════════════════════
// Scroll Helpers
// ═══════════════════════════════════════════════
function lockScroll()   { document.body.classList.add('modal-open'); }
function unlockScroll() { document.body.classList.remove('modal-open'); }

// ═══════════════════════════════════════════════
// Detail Modal
// ═══════════════════════════════════════════════
const modalOverlay = document.getElementById('modalOverlay');

function openDetailModal(camp) {
  if (!modalOverlay) return;

  const modalImgWrapper = document.querySelector('.modal-image-wrapper');
  if (camp.img && camp.img.trim() !== '') {
    modalImgWrapper.innerHTML = `<img src="${camp.img}" alt="${camp.name}" class="modal-image">`;
  } else {
    modalImgWrapper.innerHTML = `<div class="no-image-placeholder">NO IMAGE</div>`;
  }

  document.getElementById('modalTitle').textContent = camp.name || '';
  const displayLocation = [camp.locDetails, camp.location].filter(Boolean).join(', ');
  document.getElementById('modalLocText').textContent = displayLocation || 'LOCATION UNKNOWN';
  typeWriter(document.getElementById('modalDesc'), camp.desc || '');

  const campUrlLink    = document.getElementById('modalCampUrlLink');
  const mapLink        = document.getElementById('modalMapLink');
  const visitContainer = document.getElementById('modalVisitContainer');
  let hasLinks = false;

  if (campUrlLink) {
    if (camp.campUrl?.trim()) { campUrlLink.href = camp.campUrl; campUrlLink.style.display = 'inline-flex'; hasLinks = true; }
    else campUrlLink.style.display = 'none';
  }
  if (mapLink) {
    if (camp.mapUrl?.trim()) { mapLink.href = camp.mapUrl; mapLink.style.display = 'inline-flex'; hasLinks = true; }
    else mapLink.style.display = 'none';
  }
  // always visible — the share button lives here too
  if (visitContainer) visitContainer.style.display = 'block';

  const grid = document.getElementById('amenitiesGrid');
  if (grid) {
    grid.innerHTML = '';
    Object.keys(PIXEL_ICONS).forEach(key => {
      if (camp[key]) grid.innerHTML += `<div class="amenity-chip">${PIXEL_ICONS[key]} ${ICON_LABELS[key]}</div>`;
    });
  }

  modalOverlay.classList.add('open');
  lockScroll();

  // deep-link: put this campsite in the URL so it can be shared
  if (history.replaceState) {
    history.replaceState(null, '', '#' + encodeURIComponent(camp.id));
  }

  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.textContent = 'COPY LINK';
    shareBtn.onclick = async () => {
      const url = location.origin + location.pathname + '#' + encodeURIComponent(camp.id);
      try {
        if (navigator.share) {
          await navigator.share({ title: camp.name || 'NextCamp', url });
        } else {
          await navigator.clipboard.writeText(url);
          shareBtn.textContent = 'COPIED ✓';
          setTimeout(() => { shareBtn.textContent = 'COPY LINK'; }, 1600);
        }
      } catch {
        // user dismissed the share sheet, or clipboard was blocked
      }
    };
  }
}

function closeDetailModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove('open');
  unlockScroll();
  if (history.replaceState) {
    history.replaceState(null, '', location.pathname + location.search);
  }
}

const modalCloseBtn = document.getElementById('modalClose');
if (modalCloseBtn && modalOverlay) {
  modalCloseBtn.addEventListener('click', closeDetailModal);
}

// click the dim backdrop to close
if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeDetailModal();
  });
}

// Esc closes whichever modal is open
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (modalOverlay?.classList.contains('open')) { closeDetailModal(); return; }
  document.querySelectorAll('.modal-overlay.open').forEach(m => {
    m.classList.remove('open');
    unlockScroll();
  });
});

// ═══════════════════════════════════════════════
// Deep link  —  open a campsite straight from the URL
// ═══════════════════════════════════════════════
let deepLinkDone = false;

function openFromHash() {
  const raw = location.hash.replace('#', '');
  if (!raw) return;
  const id = decodeURIComponent(raw);
  const camp = camps.find(c => String(c.id) === id);
  if (!camp) return;
  const allowed = currentUser || (camp.status || 'approved') === 'approved';
  if (allowed) openDetailModal(camp);
}

window.addEventListener('hashchange', openFromHash);

// ═══════════════════════════════════════════════
// Image Upload / Preview
// ═══════════════════════════════════════════════
const btnUploadMode    = document.getElementById('btnUploadMode');
const btnUrlMode       = document.getElementById('btnUrlMode');
const fileUploadSection = document.getElementById('fileUploadSection');
const urlUploadSection  = document.getElementById('urlUploadSection');
const editImgFile      = document.getElementById('editImgFile');
const editImgUrl       = document.getElementById('editImgUrl');
const editImgPreview   = document.getElementById('editImgPreview');

function showImagePreview(src) {
  if (editImgPreview) { editImgPreview.src = src; editImgPreview.style.display = 'inline-block'; }
}

function resetImagePreview() {
  currentImageData = '';
  if (editImgPreview) { editImgPreview.src = ''; editImgPreview.style.display = 'none'; }
}

if (btnUploadMode) {
  btnUploadMode.addEventListener('click', () => {
    btnUploadMode.classList.add('active'); btnUrlMode.classList.remove('active');
    fileUploadSection.style.display = 'block'; urlUploadSection.style.display = 'none';
    if (currentImageData?.startsWith('data:image')) showImagePreview(currentImageData);
    else if (!currentImageData) resetImagePreview();
  });
}

if (btnUrlMode) {
  btnUrlMode.addEventListener('click', () => {
    btnUrlMode.classList.add('active'); btnUploadMode.classList.remove('active');
    urlUploadSection.style.display = 'block'; fileUploadSection.style.display = 'none';
    if (currentImageData && !currentImageData.startsWith('data:image')) {
      editImgUrl.value = currentImageData; showImagePreview(currentImageData);
    } else if (!editImgUrl.value) resetImagePreview();
  });
}

if (editImgFile) {
  editImgFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File too large! Max 10MB.'); editImgFile.value = ''; return; }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const MAX_WIDTH = 1200;
        let w = img.width, h = img.height;
        if (w > MAX_WIDTH) { h *= MAX_WIDTH / w; w = MAX_WIDTH; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        currentImageData = canvas.toDataURL('image/jpeg', 0.7);
        showImagePreview(currentImageData);
      };
    };
  });
}

if (editImgUrl) {
  editImgUrl.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url.includes('facebook.com/share/')) {
      alert('Facebook links cannot render directly. Use UPLOAD FILE instead.');
      editImgUrl.value = ''; resetImagePreview(); return;
    }
    if (url) { currentImageData = url; showImagePreview(url); }
    else resetImagePreview();
  });
}

// ═══════════════════════════════════════════════
// Editor Modal
// ═══════════════════════════════════════════════
const editorModalOverlay = document.getElementById('editorModalOverlay');
const editorForm         = document.getElementById('editorForm');

function openEditorModal(camp = null, isAdminAction = false) {
  if (!editorModalOverlay || !editorForm) return;

  const saveSubmitBtn = document.getElementById('saveSubmitBtn');

  if (camp) {
    document.getElementById('editorTitle').textContent = 'EDIT CAMPSITE';
    if (saveSubmitBtn) saveSubmitBtn.textContent = 'SAVE';
    document.getElementById('editCampId').value   = String(camp.id);
    document.getElementById('editName').value     = camp.name || '';
    document.getElementById('editLoc').value      = camp.locDetails || '';
    document.getElementById('editCampUrl').value  = camp.campUrl || '';
    document.getElementById('editMapUrl').value   = camp.mapUrl || '';
    document.getElementById('editCountry').value  = camp.location || '';
    document.getElementById('editDesc').value     = camp.desc || '';

    currentImageData = camp.img || '';
    if (currentImageData) {
      currentImageData.startsWith('data:image') ? btnUploadMode.click() : btnUrlMode.click();
    } else { btnUploadMode.click(); resetImagePreview(); }

    ['Trees','Restroom','Electricity','Wifi','PisoWifi','Signal','Parking',
     'CarCamping','MotorCamping','TentOnly','Hammock',
     'Forest','Mountain','River','Beach','Hiking','Trail'].forEach(k => {
      const el = document.getElementById('chk' + k);
      if (el) el.checked = !!camp[k.charAt(0).toLowerCase() + k.slice(1)];
    });

    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) deleteBtn.style.display = currentUser ? 'inline-block' : 'none';
  } else {
    document.getElementById('editorTitle').textContent = currentUser || isAdminAction ? 'ADD NEW SPOT' : 'SUGGEST A CAMPSITE';
    if (saveSubmitBtn) saveSubmitBtn.textContent = currentUser || isAdminAction ? 'SAVE' : 'SUBMIT';
    editorForm.reset();
    document.getElementById('editCampId').value = '';
    btnUploadMode.click(); resetImagePreview();
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) deleteBtn.style.display = 'none';
  }

  editorModalOverlay.classList.add('open');
  lockScroll();
}

// ═══════════════════════════════════════════════
// Form Submit
// ═══════════════════════════════════════════════
if (editorForm) {
  editorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('saveSubmitBtn');
    const originalText = submitBtn?.textContent || '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = currentUser ? 'SAVING...' : 'SUBMITTING...'; }

    try {
      const id = document.getElementById('editCampId').value;
      const existingCamp = camps.find(c => String(c.id) === String(id));

      const campData = {
        id: id || 'camp_' + Date.now(),
        status: currentUser ? (existingCamp?.status || 'approved') : 'pending',
        name:       document.getElementById('editName').value.toUpperCase(),
        locDetails: document.getElementById('editLoc').value.toUpperCase(),
        campUrl:    document.getElementById('editCampUrl').value.trim(),
        mapUrl:     document.getElementById('editMapUrl').value.trim(),
        location:   document.getElementById('editCountry').value.toUpperCase().trim(),
        img:        currentImageData || '',
        desc:       document.getElementById('editDesc').value,
        trees:       document.getElementById('chkTrees').checked,
        restroom:    document.getElementById('chkRestroom').checked,
        electricity: document.getElementById('chkElectricity').checked,
        wifi:        document.getElementById('chkWifi').checked,
        pisoWifi:    document.getElementById('chkPisoWifi').checked,
        signal:      document.getElementById('chkSignal').checked,
        parking:     document.getElementById('chkParking').checked,
        carCamping:  document.getElementById('chkCarCamping').checked,
        motorCamping:document.getElementById('chkMotorCamping').checked,
        tentOnly:    document.getElementById('chkTentOnly').checked,
        hammock:     document.getElementById('chkHammock').checked,
        forest:      document.getElementById('chkForest').checked,
        mountain:    document.getElementById('chkMountain').checked,
        river:       document.getElementById('chkRiver').checked,
        beach:       document.getElementById('chkBeach').checked,
        hiking:      document.getElementById('chkHiking').checked,
        trail:       document.getElementById('chkTrail').checked
      };

      await saveCampToCloud(campData);
      if (!currentUser) alert('Thank you! Your campsite suggestion has been submitted for review.');
      if (editorModalOverlay) { editorModalOverlay.classList.remove('open'); unlockScroll(); }
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Error saving campsite: " + error.message);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    }
  });
}

// ═══════════════════════════════════════════════
// Delete Button
// ═══════════════════════════════════════════════
const deleteBtn = document.getElementById('deleteBtn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', async () => {
    const id = document.getElementById('editCampId').value;
    if (!id) return;
    if (confirm('ARE YOU SURE YOU WANT TO DELETE THIS CAMPSITE?')) {
      try {
        await deleteCampFromCloud(id);
        if (editorModalOverlay) { editorModalOverlay.classList.remove('open'); unlockScroll(); }
      } catch (error) { alert("Error deleting: " + error.message); }
    }
  });
}

// ═══════════════════════════════════════════════
// Filter Cards
// ═══════════════════════════════════════════════
const searchInput = document.getElementById('searchInput');

function filterCards() {
  const query = searchInput?.value.toLowerCase().trim() || '';
  const selectedLoc = currentLocationFilter === 'ALL PROVINCES' ? '' : currentLocationFilter;
  const cards = cardGrid.querySelectorAll('.camp-card');
  let visibleCount = 0;

  cards.forEach((card) => {
    const camp = camps.find(c => String(c.id) === card.getAttribute('data-id'));
    if (!camp) return;

    const matchesSearch    = !query || camp.name?.toLowerCase().includes(query) || camp.locDetails?.toLowerCase().includes(query);
    const matchesLoc       = !selectedLoc || camp.location === selectedLoc;
    const matchesAmenities = activeAmenities.size === 0 || [...activeAmenities].every(a => !!camp[a]);

    const isVisible = matchesSearch && matchesLoc && matchesAmenities
                      && (!showFavsOnly || favourites.has(camp.id));
    card.style.display = isVisible ? 'block' : 'none';
    if (isVisible) visibleCount++;
  });

  const noResults = document.getElementById('noResults');
  if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';

  const counter = document.getElementById('resultsCount');
  if (counter) {
    counter.textContent = visibleCount === 0
      ? 'NO RESULTS'
      : `${visibleCount} CAMPSITE${visibleCount === 1 ? '' : 'S'} FOUND`;
  }
}

if (searchInput) searchInput.addEventListener('input', filterCards);

// ═══════════════════════════════════════════════
// Province Dropdown (searchbar)
// ═══════════════════════════════════════════════
function populateLocationDropdown() {
  const dropdownMenu = document.getElementById('dropdownMenu');
  if (!dropdownMenu) return;
  dropdownMenu.innerHTML = '';

  const visible = camps.filter(c =>
    currentUser || (c.status || 'approved') === 'approved'
  );

  const dynamicCities = visible.map(c => c.location?.toUpperCase()).filter(Boolean);
  const uniqueCities  = ['ALL PROVINCES', ...new Set([...PH_CITIES, ...dynamicCities])];
  if (!uniqueCities.includes(currentLocationFilter)) currentLocationFilter = 'ALL PROVINCES';

  const selectedTextEl = document.getElementById('selectedOptionText');
  if (selectedTextEl) selectedTextEl.textContent = currentLocationFilter;

  uniqueCities.forEach(loc => {
    if (!loc) return;
    const item = document.createElement('div');
    item.className = `dropdown-item ${loc === currentLocationFilter ? 'selected' : ''}`;
    item.dataset.value = loc;
    item.textContent   = loc;
    item.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      currentLocationFilter = loc;
      if (selectedTextEl) selectedTextEl.textContent = loc;
      document.getElementById('customDropdown')?.classList.remove('open');
      filterCards();
      buildProvinceList();
    });
    dropdownMenu.appendChild(item);
  });
}

const customDropdown  = document.getElementById('customDropdown');
// Province dropdown open/close is now handled by the searchbar-province section click above

// ═══════════════════════════════════════════════
// Sort Button
// ═══════════════════════════════════════════════
const sortBtn = document.getElementById('sortBtn');
if (sortBtn) {
  sortBtn.addEventListener('click', () => {
    const isAsc = sortBtn.getAttribute('data-sort') === 'asc';
    camps.sort((a, b) => {
      const na = a.name || '', nb = b.name || '';
      return isAsc ? nb.localeCompare(na) : na.localeCompare(nb);
    });
    sortBtn.setAttribute('data-sort', isAsc ? 'desc' : 'asc');
    sortBtn.textContent = isAsc ? 'SORT: Z-A' : 'SORT: A-Z';
    renderCards();
  });
}

// ═══════════════════════════════════════════════
// Auth Forms
// ═══════════════════════════════════════════════
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, document.getElementById('loginEmail').value, document.getElementById('loginPass').value);
      document.getElementById('loginModalOverlay').classList.remove('open');
      loginForm.reset();
    } catch (err) { alert("Login failed: " + err.message); }
  });
}

const adminLogoutBtn = document.getElementById('adminLogoutBtn');
if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', async () => await signOut(auth));

// ═══════════════════════════════════════════════
// Suggest Button & Editor Close
// ═══════════════════════════════════════════════
const suggestBtn = document.getElementById('suggestBtn');
if (suggestBtn) suggestBtn.addEventListener('click', () => openEditorModal(null, false));

const closeEditorBtn = document.getElementById('closeEditorBtn') || document.getElementById('editorModalClose');
if (closeEditorBtn) {
  closeEditorBtn.addEventListener('click', () => {
    editorModalOverlay?.classList.remove('open');
    unlockScroll();
  });
}

if (editorModalOverlay) {
  editorModalOverlay.addEventListener('click', (e) => {
    if (e.target === editorModalOverlay) { editorModalOverlay.classList.remove('open'); unlockScroll(); }
  });
}

// ═══════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// Saved-only filter toggle
// ═══════════════════════════════════════════════
const favFilterBtn = document.getElementById('favFilterBtn');
if (favFilterBtn) {
  favFilterBtn.addEventListener('click', () => {
    showFavsOnly = !showFavsOnly;
    updateFavButton();
    filterCards();
  });
}
updateFavButton();

renderLegend();
renderInventoryIcons();
