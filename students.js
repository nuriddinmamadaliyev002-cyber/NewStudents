/* ================================================
   js/students.js  —  O'quvchilar boshqaruvi
   ================================================

   Funksiyalar:
     loadStudents()   — serverdan ma'lumot yuklash
     addStudent()     — yangi o'quvchi qo'shish
     applyFilters()   — qidirish / filtrlash
     openES(idx)      — tahrirlash modalini ochish
     closeES()        — modalini yopish
     saveES()         — tahrirlangan ma'lumotni saqlash
     delS(idx, name)  — o'quvchini o'chirish
   ================================================ */

/** Barcha o'quvchilar massivi — filterlar uchun asl nusxa */
let students = [];

/* ════════════════════════════════════════
   YUKLASH
════════════════════════════════════════ */

async function loadStudents() {
  showLoading(true);
  try {
    const data = await apiGetStudents(currentUser.email, currentUser.parol);

    if (data.ok) {
      students = data.students;

      // Har bir o'quvchiga original indeks saqlaymiz
      // (filter qilingandan keyin ham to'g'ri tahrirlash uchun)
      students.forEach((s, i) => s.ri = i);

      updateMaktabFilter();
      applyFilters();

      g('total-count').textContent = `${students.length} o'quvchi`;
    }
  } catch (e) {
    toast("❌ Ma'lumotlar yuklanmadi", 'error');
  }

  showLoading(false);
}

/* ════════════════════════════════════════
   QO'SHISH
════════════════════════════════════════ */

async function addStudent() {
  // 1. Qiymatlarni o'qish
  const ism     = g('f-ism').value.trim();
  const familiya = g('f-familiya').value.trim();
  const maktab   = getM('f-maktab');
  const sinf     = g('f-sinf').value;
  const telefon  = g('f-tel').value.trim();
  const telefon2 = g('f-tel2').value.trim();
  const manzil   = g('f-manzil').value.trim();

  // 2. Tug'ilgan sanani yig'ish
  const tug = buildDob('f-kun', 'f-oy', 'f-yil', 'f-tug');
  if (tug === null) return; // Yil xatosi — buildDob ichida toast chiqadi

  // 3. Validatsiya
  if (!ism || !familiya) { toast("⚠️ Ism va familiya kiriting", 'error'); return; }
  if (!maktab)  { toast("⚠️ Maktab raqami 1–99", 'error'); g('f-maktab').classList.add('err'); return; }
  if (!sinf)    { toast("⚠️ Sinf tanlang", 'error'); return; }
  if (!telefon) { toast("⚠️ Telefon kiriting", 'error'); return; }
  if (!tug)     { toast("⚠️ Tug'ilgan sana kiriting", 'error'); return; }

  // 4. Serverga yuborish
  bl('submit-btn', 'spinner', 'btn-txt', true, 'Saqlanmoqda…');
  try {
    const res = await apiAddStudent(currentUser.email, currentUser.parol, {
      ism, familiya, maktab, sinf, telefon, telefon2, manzil, tug,
      date: new Date().toLocaleDateString('uz-UZ')
    });

    if (res.ok) {
      clearAddForm();
      await loadStudents();
      toast("✅ O'quvchi qo'shildi!", 'success');
    } else {
      toast('❌ ' + res.error, 'error');
    }
  } catch (e) {
    toast('❌ Xatolik yuz berdi', 'error');
  }

  bl('submit-btn', 'spinner', 'btn-txt', false, 'Saqlash');
}

/* ════════════════════════════════════════
   FILTRLASH VA KO'RSATISH
════════════════════════════════════════ */

function applyFilters() {
  const query  = (g('f-search').value || '').toLowerCase();
  const fMaktab = g('f-maktab-f').value;
  const fSinf   = g('f-sinf-f').value;

  const filtered = students.filter(s => {
    const matchQ = !query ||
      (s.ism + ' ' + s.familiya + ' ' + s.telefon).toLowerCase().includes(query);
    const matchM = !fMaktab || String(s.maktab) === String(fMaktab);
    const matchS = !fSinf   || s.sinf === fSinf;
    return matchQ && matchM && matchS;
  });

  renderDesktopTable(filtered);
  renderMobileCards(filtered);
}

/** Maktab filter dropdown ni yangilash */
function updateMaktabFilter() {
  const sel = g('f-maktab-f');
  const current = sel.value;

  const list = [...new Set(students.map(s => s.maktab).filter(Boolean))]
    .sort((a, b) => Number(a) - Number(b));

  sel.innerHTML =
    '<option value="">Barcha maktab</option>' +
    list.map(m =>
      `<option${String(m) === String(current) ? ' selected' : ''}>${m}</option>`
    ).join('');
}

/* ─── Desktop jadval ─── */
function renderDesktopTable(data) {
  const tbody = g('tbl-body');
  const isSuper = currentUser && currentUser.isSuper;
  const cols = isSuper ? 11 : 10;

  if (!data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${cols}">
          <div class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>O'quvchi topilmadi</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map((s, i) => `
    <tr>
      <td class="mono">${i + 1}</td>
      <td><strong>${s.ism}</strong> ${s.familiya}</td>
      <td><span class="maktab-badge">${s.maktab || '—'}</span></td>
      <td><span class="sinf-badge">${s.sinf || '—'}</span></td>
      <td class="mono">${s.telefon  || '—'}</td>
      <td class="mono">${s.telefon2 || '—'}</td>
      <td class="mono">${fTug(s.tug)}</td>
      <td>${s.manzil || '—'}</td>
      ${isSuper ? `<td class="mono" style="font-size:11px;">${s.admin || '—'}</td>` : ''}
      <td class="mono">${fDate(s.date)}</td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn-action" onclick="openES(${s.ri})">✏️</button>
          <button class="btn-action" onclick="delS(${s.ri},'${esc(s.ism + ' ' + s.familiya)}')">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ─── Mobile kartalar ─── */
function renderMobileCards(data) {
  const el = g('mob-cards');
  const isSuper = currentUser && currentUser.isSuper;

  if (!data.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>O'quvchi topilmadi</p>
      </div>`;
    return;
  }

  el.innerHTML = data.map((s, i) => `
    <div class="sc">
      <div class="sc-header">
        <div>
          <div class="sc-name">${s.ism} ${s.familiya}</div>
          <div class="sc-num">#${i + 1}</div>
          <div class="sc-tags">
            <span class="maktab-badge">${s.maktab || '—'}-maktab</span>
            <span class="sinf-badge">${s.sinf || '—'}</span>
          </div>
        </div>
        <div class="sc-btns">
          <button class="btn-action" onclick="openES(${s.ri})">✏️</button>
          <button class="btn-action" onclick="delS(${s.ri},'${esc(s.ism + ' ' + s.familiya)}')">🗑️</button>
        </div>
      </div>
      <div class="sc-body">
        <div class="sc-row">
          <span class="sc-lbl">📞 Telefon</span>
          <span class="sc-val m">${s.telefon || '—'}</span>
        </div>
        <div class="sc-row">
          <span class="sc-lbl">📞 Qo'sh.</span>
          <span class="sc-val m">${s.telefon2 || '—'}</span>
        </div>
        <div class="sc-row">
          <span class="sc-lbl">🎂 Tug'ilgan</span>
          <span class="sc-val m">${fTug(s.tug)}</span>
        </div>
        <div class="sc-row">
          <span class="sc-lbl">📍 Manzil</span>
          <span class="sc-val">${s.manzil || '—'}</span>
        </div>
        ${isSuper ? `
        <div class="sc-row sc-full">
          <span class="sc-lbl">👤 Admin</span>
          <span class="sc-val m" style="font-size:11px;">${s.admin || '—'}</span>
        </div>` : ''}
        <div class="sc-row">
          <span class="sc-lbl">📅 Sana</span>
          <span class="sc-val m">${fDate(s.date)}</span>
        </div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════
   TAHRIRLASH MODAL
════════════════════════════════════════ */

let _editIdx = null;

function openES(idx) {
  const s = students[idx];
  if (!s) return;
  _editIdx = idx;

  // Formani to'ldirish
  g('e-ism').value       = s.ism      || '';
  g('e-familiya').value  = s.familiya || '';
  g('e-maktab').value    = s.maktab   || '';
  g('e-sinf').value      = s.sinf     || '';
  g('e-tel').value       = s.telefon  || '';
  g('e-tel2').value      = s.telefon2 || '';
  g('e-manzil').value    = s.manzil   || '';

  // Tug'ilgan sanani bo'laklarga ajratish
  if (s.tug) {
    const d = new Date(s.tug);
    if (!isNaN(d)) {
      g('e-kun').value = d.getDate();
      g('e-oy').value  = String(d.getMonth() + 1).padStart(2, '0');
      g('e-yil').value = d.getFullYear();
      g('e-tug').value = d.toISOString().split('T')[0];
    }
  } else {
    ['e-kun', 'e-oy', 'e-yil', 'e-tug'].forEach(id => g(id).value = '');
  }

  g('es-modal').style.display = 'flex';
}

function closeES() {
  g('es-modal').style.display = 'none';
  _editIdx = null;
}

async function saveES() {
  const ism      = g('e-ism').value.trim();
  const familiya = g('e-familiya').value.trim();
  const maktab   = getM('e-maktab');
  const sinf     = g('e-sinf').value;
  const telefon  = g('e-tel').value.trim();
  const telefon2 = g('e-tel2').value.trim();
  const manzil   = g('e-manzil').value.trim();

  const tug = buildDob('e-kun', 'e-oy', 'e-yil', 'e-tug');
  if (tug === null) return;

  if (!ism || !familiya) { toast("⚠️ Ism va familiya kiriting", 'error'); return; }
  if (!maktab)  { toast("⚠️ Maktab raqami 1–99", 'error'); return; }
  if (!sinf)    { toast("⚠️ Sinf tanlang", 'error'); return; }
  if (!telefon) { toast("⚠️ Telefon kiriting", 'error'); return; }

  const s = students[_editIdx];
  bl('es-save', 'es-spinner', 'es-btn-txt', true, 'Saqlanmoqda…');

  try {
    const res = await apiEditStudent(
      currentUser.email, currentUser.parol,
      s.ism, s.familiya,
      { ism, familiya, maktab, sinf, telefon, telefon2, manzil, tug }
    );

    if (res.ok) {
      closeES();
      await loadStudents();
      toast("✅ O'quvchi yangilandi!", 'success');
    } else {
      toast('❌ ' + res.error, 'error');
    }
  } catch (e) {
    toast('❌ Xatolik yuz berdi', 'error');
  }

  bl('es-save', 'es-spinner', 'es-btn-txt', false, 'Saqlash');
}

/* ════════════════════════════════════════
   O'CHIRISH
════════════════════════════════════════ */

async function delS(idx, name) {
  if (!confirm(`"${name}" o'chirilsinmi?`)) return;

  const s = students[idx];
  try {
    const res = await apiDeleteStudent(
      currentUser.email, currentUser.parol, s.ism, s.familiya
    );

    if (res.ok) {
      await loadStudents();
      toast("✅ O'quvchi o'chirildi", 'success');
    } else {
      toast('❌ ' + res.error, 'error');
    }
  } catch (e) {
    toast('❌ Xatolik yuz berdi', 'error');
  }
}

/* ════════════════════════════════════════
   PRIVATE YORDAMCHILAR
════════════════════════════════════════ */

/**
 * Tug'ilgan sanani uchta inputdan birlashtirish
 * @returns {string}  — "2015-03-12" formatida
 * @returns {null}    — yil xato bo'lsa
 * @returns {''}      — bo'sh (ixtiyoriy maydon)
 */
function buildDob(kunId, oyId, yilId, tugId) {
  const kun = String(g(kunId).value || '').padStart(2, '0');
  const oy  = g(oyId).value;
  const yil = g(yilId).value;

  if (yil && (yil < 2009 || yil > 2019)) {
    toast("⚠️ Yil 2009–2019 oralig'ida bo'lishi kerak", 'error');
    return null; // xato — yuqorida tekshiriladi
  }

  if (yil && oy && kun) {
    const val = `${yil}-${oy}-${kun}`;
    g(tugId).value = val;
    return val;
  }

  return g(tugId).value || ''; // avval saqlangan qiymat
}

/** Qo'shish formasini tozalash */
function clearAddForm() {
  ['f-ism', 'f-familiya', 'f-maktab', 'f-tel', 'f-tel2', 'f-manzil', 'f-tug', 'f-kun', 'f-yil']
    .forEach(id => {
      const el = g(id);
      el.value = '';
      el.classList && el.classList.remove('err');
    });
  g('f-oy').value   = '';
  g('f-sinf').value = '';
}
