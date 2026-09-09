
/* ===== Eleven Academy - Data Layer (localStorage) ===== */
const DB = {
  get(k, def){ try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch(e){ return def; } },
  set(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
  del(k){ localStorage.removeItem(k); }
};

const K = {
  logo:   'eleven_logo',
  news:   'eleven_news',
  matches:'eleven_matches',
  players:'eleven_players',
  users:  'eleven_users',
  session:'eleven_session'
};

const ADMIN = { email: 'eleven.admin@ec.11', password: 'admin.eleven@11' };

/* ---------- helpers ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function readImage(file, cb){
  if(!file) return cb('');
  const r = new FileReader();
  r.onload = e => cb(e.target.result);
  r.readAsDataURL(file);
}

function getLogo(){ return DB.get(K.logo, ''); }
function getNews(){ return DB.get(K.news, []); }
function getMatches(){ return DB.get(K.matches, []); }
function getPlayers(){ return DB.get(K.players, []); }
function getUsers(){ return DB.get(K.users, []); }
function getSession(){ return DB.get(K.session, null); }

function saveNews(a){ DB.set(K.news, a); }
function saveMatches(a){ DB.set(K.matches, a); }
function savePlayers(a){ DB.set(K.players, a); }
function saveUsers(a){ DB.set(K.users, a); }

function toast(msg){
  let t = document.querySelector('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._tm); t._tm = setTimeout(()=>t.classList.remove('show'), 2600);
}
