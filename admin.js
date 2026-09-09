
/* ===== Eleven Academy - Admin Panel ===== */
const $ = s => document.querySelector(s);

/* gate */
(function gate(){
  const s = getSession();
  if(!s || !s.admin){
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px">
        <form class="modal" onsubmit="adminLogin(event)" style="max-width:380px">
          <h3>🔐 منطقة الإدارة</h3>
          <p class="sub">هذه المنطقة مخصصة لإدارة الأكاديمية فقط</p>
          <div id="gateMsg" class="msg"></div>
          <div class="field"><label>البريد الإلكتروني</label><input type="email" id="gEmail" required></div>
          <div class="field"><label>كلمة المرور</label><input type="password" id="gPass" required></div>
          <button class="btn btn-green" style="width:100%">دخول المدير</button>
          <p style="margin-top:14px;text-align:center"><a href="index.html" style="color:var(--muted);font-size:.85rem">← العودة للموقع</a></p>
        </form>
      </div>`;
  }
})();
function adminLogin(e){
  e.preventDefault();
  const em = $('#gEmail').value.trim(), pw = $('#gPass').value;
  if(em.toLowerCase() === ADMIN.email && pw === ADMIN.password){
    DB.set(K.session, { name:'الإدارة', email:em, admin:true });
    location.reload();
  } else {
    $('#gateMsg').className='msg err'; $('#gateMsg').textContent='بيانات غير صحيحة';
  }
}
function adminLogout(){ DB.del(K.session); location.href='index.html'; }

/* tabs */
function showTab(t){
  document.querySelectorAll('.atab').forEach(b => b.classList.toggle('on', b.dataset.tab===t));
  document.querySelectorAll('.panel').forEach(p => p.style.display = p.id==='p-'+t ? 'block':'none');
  if(t==='news') renderAdminNews();
  if(t==='matches') renderAdminMatches();
  if(t==='players') renderAdminPlayers();
}

/* settings: logo */
function saveLogoSetting(){
  readImage($('#logoFile').files[0], url => {
    if(!url) return toast('اختر صورة أولاً');
    DB.set(K.logo, url); renderLogoPreview(); toast('تم حفظ الشعار ✅');
  });
}
function removeLogo(){ DB.del(K.logo); renderLogoPreview(); toast('تمت إزالة الشعار'); }
function renderLogoPreview(){
  const p = $('#logoPreview'); if(p) p.src = getLogo() || defaultLogo();
}

/* news admin */
function addNews(e){
  e.preventDefault();
  readImage($('#nImg').files[0], img => {
    const list = getNews();
    list.push({ id:uid(), title:$('#nTitle').value.trim(), content:$('#nContent').value.trim(), img, date:Date.now() });
    saveNews(list); e.target.reset(); renderAdminNews(); toast('تم نشر الخبر 📰');
  });
}
function delNews(id){ saveNews(getNews().filter(n=>n.id!==id)); renderAdminNews(); toast('تم حذف الخبر'); }
function renderAdminNews(){
  const list = getNews().sort((a,b)=>b.date-a.date);
  $('#adminNewsList').innerHTML = list.length ? list.map(n=>`
    <div class="match-card" style="display:flex;align-items:center;gap:14px">
      ${n.img?`<img src="${n.img}" style="width:70px;height:70px;border-radius:14px;object-fit:cover">`:''}
      <div style="flex:1"><b>${esc(n.title)}</b><div style="color:var(--muted);font-size:.8rem">${esc(n.content).slice(0,80)}…</div></div>
      <button class="btn btn-red btn-sm" onclick="delNews('${n.id}')">حذف</button>
    </div>`).join('') : '<div class="empty">لا توجد أخبار — أضف أول خبر من النموذج أعلاه</div>';
}

/* players admin */
function addPlayer(e){
  e.preventDefault();
  readImage($('#plImg').files[0], img => {
    const list = getPlayers();
    list.push({ id:uid(), name:$('#plName').value.trim(), number:$('#plNum').value, position:$('#plPos').value, img });
    savePlayers(list); e.target.reset(); renderAdminPlayers(); toast('تمت إضافة اللاعب 👕');
  });
}
function delPlayer(id){ savePlayers(getPlayers().filter(p=>p.id!==id)); renderAdminPlayers(); toast('تم حذف اللاعب'); }
function renderAdminPlayers(){
  const list = getPlayers();
  $('#adminPlayersList').innerHTML = list.length ? list.map(p=>`
    <div class="match-card" style="display:flex;align-items:center;gap:14px">
      <img src="${p.img||defaultLogo()}" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #22c55e">
      <div style="flex:1"><b>${esc(p.name)}</b><div style="color:var(--muted);font-size:.8rem">#${esc(p.number)} · ${esc(p.position)}</div></div>
      <button class="btn btn-red btn-sm" onclick="delPlayer('${p.id}')">حذف</button>
    </div>`).join('') : '<div class="empty">لا يوجد لاعبون بعد</div>';
}

/* matches admin */
let lineupDraft = [];
function addLineupRow(name='', number='', position=''){
  lineupDraft.push({name, number, position, img:''});
  renderLineupRows();
}
function renderLineupRows(){
  $('#lineupRows').innerHTML = lineupDraft.map((p,i)=>`
    <div class="match-card" style="padding:12px;display:grid;grid-template-columns:1fr 70px 110px 1fr auto;gap:8px;align-items:center">
      <input placeholder="اسم اللاعب" value="${esc(p.name)}" onchange="lineupDraft[${i}].name=this.value" style="background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:10px;padding:8px;color:#fff">
      <input placeholder="الرقم" value="${esc(p.number)}" onchange="lineupDraft[${i}].number=this.value" style="background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:10px;padding:8px;color:#fff">
      <input placeholder="المركز" value="${esc(p.position)}" onchange="lineupDraft[${i}].position=this.value" style="background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:10px;padding:8px;color:#fff">
      <input type="file" accept="image/*" onchange="readImage(this.files[0],u=>{lineupDraft[${i}].img=u;this.nextElementSibling.textContent=u?'✅':'اختر صورة'})" style="font-size:.7rem">
      <span style="font-size:.7rem;color:var(--muted)">${p.img?'✅':'اختر صورة'}</span>
      <button type="button" class="btn btn-red btn-sm" onclick="lineupDraft.splice(${i},1);renderLineupRows()">✖</button>
    </div>`).join('');
}
function addMatch(e){
  e.preventDefault();
  readImage($('#mOppImg').files[0], oppImg => {
    const list = getMatches();
    const st = $('#mStatus').value;
    list.push({
      id:uid(),
      opponent: $('#mOpp').value.trim(),
      oppImg,
      date: $('#mDate').value,
      stadium: $('#mStadium').value.trim(),
      status: st,
      scoreOur: st==='up' ? null : ($('#mScoreOur').value||0),
      scoreOpp: st==='up' ? null : ($('#mScoreOpp').value||0),
      lineup: lineupDraft.filter(p=>p.name)
    });
    saveMatches(list); e.target.reset(); lineupDraft=[]; renderLineupRows(); renderAdminMatches(); toast('تمت إضافة المباراة ⚽');
  });
}
function delMatch(id){ saveMatches(getMatches().filter(m=>m.id!==id)); renderAdminMatches(); toast('تم حذف المباراة'); }
function renderAdminMatches(){
  const list = getMatches().sort((a,b)=> new Date(a.date)-new Date(b.date));
  $('#adminMatchesList').innerHTML = list.length ? list.map(m=>`
    <div class="match-card" style="display:flex;align-items:center;gap:14px">
      <img src="${m.oppImg||defaultLogo()}" style="width:56px;height:56px;border-radius:14px;object-fit:cover">
      <div style="flex:1"><b>إيليفن × ${esc(m.opponent)}</b>
        <div style="color:var(--muted);font-size:.8rem">${new Date(m.date).toLocaleString('ar-EG')} ${m.stadium?'· 📍'+esc(m.stadium):''} · ${STATUS[m.status]||''} · تشكيلة: ${(m.lineup||[]).length} لاعب</div></div>
      <button class="btn btn-red btn-sm" onclick="delMatch('${m.id}')">حذف</button>
    </div>`).join('') : '<div class="empty">لا توجد مباريات بعد</div>';
}

renderLogoPreview();
renderLineupRows();
showTab('news');
