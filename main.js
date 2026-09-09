
/* ===== Eleven Academy - Main Site ===== */
const $ = s => document.querySelector(s);
const isAdmin = () => { const s = getSession(); return !!(s && s.admin); };

/* ---------- Auth ---------- */
function openAuth(){ $('#authModal').classList.add('show'); }
function closeAuth(){ $('#authModal').classList.remove('show'); }
function switchTab(t){
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t));
  $('#loginForm').style.display  = t==='login' ? 'block' : 'none';
  $('#signupForm').style.display = t==='signup' ? 'block' : 'none';
  $('#authMsg').textContent = '';
}

function doLogin(e){
  e.preventDefault();
  const email = $('#liEmail').value.trim(), pass = $('#liPass').value;
  const msg = $('#authMsg'); msg.className='msg';
  /* المدير يدخل من نفس نافذة الدخول كأنه عادي — ببياناته السرية */
  if(email.toLowerCase() === ADMIN.email && pass === ADMIN.password){
    DB.set(K.session, { name:'الإدارة', email, admin:true });
    renderAuth(); closeAuth(); toast('مرحباً بك 👋');
    return;
  }
  const u = getUsers().find(x => x.email === email && x.password === pass);
  if(!u){ msg.className='msg err'; msg.textContent='البريد أو كلمة المرور غير صحيحة'; return; }
  DB.set(K.session, { name:u.name, email:u.email, admin:false });
  renderAuth(); closeAuth(); toast('مرحباً بك ' + u.name + ' ⚽');
}

function doSignup(e){
  e.preventDefault();
  const name = $('#suName').value.trim(), email = $('#suEmail').value.trim(), pass = $('#suPass').value;
  const msg = $('#authMsg'); msg.className='msg';
  if(!name || !email || !pass){ msg.className='msg err'; msg.textContent='يرجى تعبئة جميع الحقول'; return; }
  if(email.toLowerCase() === ADMIN.email){ msg.className='msg err'; msg.textContent='هذا البريد غير متاح'; return; }
  const users = getUsers();
  if(users.some(x => x.email === email)){ msg.className='msg err'; msg.textContent='هذا البريد مسجّل مسبقاً'; return; }
  users.push({ name, email, password: pass });
  saveUsers(users);
  DB.set(K.session, { name, email, admin:false });
  renderAuth(); closeAuth(); toast('تم إنشاء حسابك بنجاح 🎉');
}

function logout(){ DB.del(K.session); renderAuth(); toast('تم تسجيل الخروج'); }

function renderAuth(){
  const s = getSession();
  const box = $('#authArea');
  if(s){
    box.innerHTML = `
      <span style="color:var(--muted);font-weight:700;font-size:.9rem">مرحباً، ${esc(s.name)}</span>
      ${s.admin ? '<a href="admin.html" class="btn btn-ghost btn-sm" title="خاص بالإدارة فقط">⚙️</a>' : ''}
      <button class="btn btn-ghost btn-sm" onclick="logout()">خروج</button>`;
  } else {
    box.innerHTML = `<button class="btn btn-green btn-sm" onclick="openAuth()">دخول / حساب</button>`;
  }
}

/* ---------- Render Logo ---------- */
function renderLogo(){
  const l = getLogo();
  document.querySelectorAll('.site-logo').forEach(i => i.src = l || defaultLogo());
}
function defaultLogo(){
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" rx="22" fill="#16a34a"/><text x="50" y="66" font-size="52" text-anchor="middle" fill="white" font-family="Arial" font-weight="900">11</text></svg>`);
}

/* ---------- News ---------- */
function delNews(id){ if(!isAdmin()) return; saveNews(getNews().filter(n=>n.id!==id)); renderAll(); toast('تم حذف الخبر'); }
function renderNews(){
  const list = getNews().sort((a,b)=> b.date - a.date);
  const box = $('#newsGrid');
  if(!list.length){ box.innerHTML = '<div class="empty">لا توجد أخبار بعد 📰</div>'; return; }
  box.innerHTML = list.map(n => `
    <article class="news-card">
      ${n.img ? `<div class="thumb"><img src="${n.img}" alt=""></div>` : ''}
      <div class="body">
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.content)}</p>
        <span class="date">🗓 ${new Date(n.date).toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'})}</span>
        ${isAdmin() ? `<div style="margin-top:10px"><button class="btn btn-red btn-sm" onclick="delNews('${n.id}')">🗑 حذف</button></div>` : ''}
      </div>
    </article>`).join('');
}

/* ---------- Matches ---------- */
const STATUS = { up:'قادمة', live:'مباشر الآن 🔴', fin:'انتهت' };

function delMatch(id){ if(!isAdmin()) return; saveMatches(getMatches().filter(m=>m.id!==id)); renderAll(); toast('تم حذف المباراة'); }
function renderMatches(){
  const list = getMatches().sort((a,b)=> new Date(a.date) - new Date(b.date));
  const box = $('#matchesList');
  const ourLogo = getLogo() || defaultLogo();
  if(!list.length){ box.innerHTML = '<div class="empty">لا توجد مباريات مجدولة بعد ⚽</div>'; return; }
  box.innerHTML = list.map(m => {
    const d = new Date(m.date);
    const score = m.status==='up' ? `<span style="color:var(--muted);font-size:.85rem">${d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'})}<br>${d.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'})}</span>`
      : `<span class="score-box">${m.scoreOur ?? 0} - ${m.scoreOpp ?? 0}</span>`;
    const lineup = (m.lineup||[]).map(p => `
      <div class="plyr">
        <img src="${p.img || defaultLogo()}" alt="">
        <span class="num">${esc(p.number||'—')}</span>
        <span class="nm">${esc(p.name)}</span>
        <span class="pos">${esc(p.position||'')}</span>
      </div>`).join('');
    return `
    <div class="match-card">
      <div class="match-top">
        <div class="match-teams">
          <div class="mteam"><img src="${ourLogo}"><div>إيليفن</div></div>
          ${score}
          <div class="mteam"><img src="${m.oppImg || defaultLogo()}"><div>${esc(m.opponent)}</div></div>
        </div>
        <span class="status ${m.status}">${STATUS[m.status]||''}</span>
      </div>
      ${m.stadium ? `<div class="stadium">📍 ${esc(m.stadium)}</div>` : ''}
      <div class="match-actions">
        <button class="btn btn-ghost btn-sm" onclick="toggleLineup('${m.id}')">📋 عرض التشكيلة</button>
        ${isAdmin() ? `<button class="btn btn-red btn-sm" onclick="delMatch('${m.id}')">🗑 حذف</button>` : ''}
      </div>
      <div class="lineup-wrap" id="lp-${m.id}">
        <div class="formation"><div class="circle"></div>${lineup || '<div class="empty" style="border:none">لم تُحدد التشكيلة بعد</div>'}</div>
        <div class="countdown" id="cd-${m.id}"></div>
      </div>
    </div>`;
  }).join('');
  startCountdowns();
}

function toggleLineup(id){
  document.getElementById('lp-'+id).classList.toggle('open');
}

let cdTimer;
function startCountdowns(){
  clearInterval(cdTimer);
  const tick = () => {
    getMatches().filter(m => m.status === 'up').forEach(m => {
      const el = document.getElementById('cd-' + m.id);
      if(!el) return;
      const diff = new Date(m.date) - new Date();
      if(diff <= 0){ el.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--gold);font-weight:800">حان وقت المباراة! ⚽</div>'; return; }
      const dd = Math.floor(diff/864e5), hh = Math.floor(diff/36e5)%24, mm = Math.floor(diff/6e4)%60, ss = Math.floor(diff/1e3)%60;
      el.innerHTML = `
        <div><b>${dd}</b><small>يوم</small></div>
        <div><b>${hh}</b><small>ساعة</small></div>
        <div><b>${mm}</b><small>دقيقة</small></div>
        <div><b>${ss}</b><small>ثانية</small></div>`;
    });
  };
  tick(); cdTimer = setInterval(tick, 1000);
}

/* ---------- Players ---------- */
function delPlayer(id){ if(!isAdmin()) return; savePlayers(getPlayers().filter(p=>p.id!==id)); renderAll(); toast('تم حذف اللاعب'); }
function renderPlayers(){
  const list = getPlayers().sort((a,b)=> (a.number||99)-(b.number||99));
  const box = $('#playersGrid');
  if(!list.length){ box.innerHTML = '<div class="empty">لا يوجد لاعبون بعد 👕</div>'; return; }
  box.innerHTML = list.map(p => `
    <div class="player-card" data-num="${esc(p.number||'')}">
      <img src="${p.img || defaultLogo()}" alt="">
      <h4>${esc(p.name)}</h4>
      <span>#${esc(p.number||'—')} · ${esc(p.position||'')}</span>
      ${isAdmin() ? `<div style="margin-top:8px"><button class="btn btn-red btn-sm" onclick="delPlayer('${p.id}')">🗑</button></div>` : ''}
    </div>`).join('');
}

/* ---------- Next match hero ---------- */
function renderHero(){
  const next = getMatches().filter(m => m.status === 'up' && new Date(m.date) > new Date())
    .sort((a,b)=> new Date(a.date)-new Date(b.date))[0];
  const box = $('#heroMatch');
  if(!next){ box.innerHTML = ''; return; }
  const d = new Date(next.date);
  box.innerHTML = `
    <div class="next-match">
      <div style="color:#4ade80;font-weight:800;font-size:.85rem">🏆 المباراة القادمة</div>
      <div class="vs">
        <div class="team"><img src="${getLogo()||defaultLogo()}"><div>إيليفن</div></div>
        <div class="vs-num">VS</div>
        <div class="team"><img src="${next.oppImg||defaultLogo()}"><div>${esc(next.opponent)}</div></div>
      </div>
      <div style="color:var(--muted);font-size:.9rem">${d.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} — ${d.toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'})}</div>
      ${next.stadium ? `<div class="stadium">📍 ${esc(next.stadium)}</div>` : ''}
      <div class="countdown" id="heroCd"></div>
    </div>`;
  const el = document.getElementById('heroCd');
  const tick = () => {
    if(!document.body.contains(el)) return clearInterval(el._t);
    const diff = new Date(next.date) - new Date();
    if(diff <= 0){ el.innerHTML='<div style="grid-column:1/-1;color:var(--gold);font-weight:800">حان وقت المباراة!</div>'; return; }
    const dd=Math.floor(diff/864e5),hh=Math.floor(diff/36e5)%24,mm=Math.floor(diff/6e4)%60,ss=Math.floor(diff/1e3)%60;
    el.innerHTML = `<div><b>${dd}</b><small>يوم</small></div><div><b>${hh}</b><small>ساعة</small></div><div><b>${mm}</b><small>دقيقة</small></div><div><b>${ss}</b><small>ثانية</small></div>`;
  };
  tick(); el._t = setInterval(tick,1000);
}

function renderAll(){ renderLogo(); renderAuth(); renderNews(); renderMatches(); renderPlayers(); renderHero(); }
renderAll();
window.addEventListener('storage', renderAll);
