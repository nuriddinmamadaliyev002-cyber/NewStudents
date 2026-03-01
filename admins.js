/* ================================================
   js/admins.js  —  Adminlar boshqaruvi
   ================================================

   Funksiyalar:
     loadAdmins()                  — ro'yxatni yuklash
     renderAdmins(admins)          — HTML ga chizish
     createAdmin()                 — yangi admin yaratish
     openAE(email, ism, parol)     — tahrirlash modalini ochish
     closeAE()                     — modalini yopish
     saveAE()                      — tahrirlangan ma'lumotni saqlash
     delA(email, ism)              — adminni o'chirish
   ================================================ */

/* ════════════════════════════════════════
   YUKLASH VA KO'RSATISH
════════════════════════════════════════ */

async function loadAdmins() {
  try {
    const data = await apiGetAdmins(currentUser.email, currentUser.parol);
    if (data.ok) renderAdmins(data.admins);
  } catch (e) {
    toast("❌ Adminlar yuklanmadi", 'error');
  }
}

function renderAdmins(admins) {
  const el = g('admin-list');

  if (!admins.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">👤</div>
        <p>Adminlar yo'q</p>
      </div>`;
    return;
  }

  el.innerHTML = admins.map(a => `
    <div class="admin-item">
      <div class="admin-info">
        <span class="admin-name">${a.ism}</span>
        <span class="admin-email">${a.email}</span>
        <span class="admin-ptag">🔑 ${a.parol || '—'}</span>
      </div>
      <div class="admin-acts">
        <button class="btn-action"
          onclick="openAE('${esc(a.email)}','${esc(a.ism)}','${esc(a.parol || '')}')">
          ✏️
        </button>
        <button class="btn-small"
          onclick="delA('${esc(a.email)}','${esc(a.ism)}')">
          O'chirish
        </button>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════
   YANGI ADMIN YARATISH
════════════════════════════════════════ */

async function createAdmin() {
  const ism   = g('a-ism').value.trim();
  const email = g('a-email').value.trim();
  const parol = g('a-parol').value.trim();

  if (!ism || !email || !parol) {
    toast("⚠️ Barcha maydonlarni to'ldiring", 'error');
    return;
  }

  bl(null, 'a-spinner', 'a-btn-txt', true, 'Yaratilmoqda…');

  try {
    const res = await apiCreateAdmin(
      currentUser.email, currentUser.parol,
      ism, email, parol
    );

    if (res.ok) {
      // Formani tozalash
      ['a-ism', 'a-email', 'a-parol'].forEach(id => g(id).value = '');
      toast('✅ Admin yaratildi!', 'success');
      loadAdmins();
    } else {
      toast('❌ ' + res.error, 'error');
    }
  } catch (e) {
    toast('❌ Xatolik yuz berdi', 'error');
  }

  bl(null, 'a-spinner', 'a-btn-txt', false, 'Yaratish');
}

/* ════════════════════════════════════════
   TAHRIRLASH MODAL
════════════════════════════════════════ */

let _aeOldEmail = null;

function openAE(email, ism, parol) {
  _aeOldEmail = email;

  g('ae-ism').value   = ism;
  g('ae-email').value = email;
  g('ae-parol').value = '';  // Parolni bo'sh qoldiramiz (ixtiyoriy)

  g('ae-modal').style.display = 'flex';
}

function closeAE() {
  g('ae-modal').style.display = 'none';
  _aeOldEmail = null;
}

async function saveAE() {
  const ism   = g('ae-ism').value.trim();
  const email = g('ae-email').value.trim();
  const parol = g('ae-parol').value.trim();

  if (!ism || !email) {
    toast("⚠️ Ism va email majburiy", 'error');
    return;
  }

  bl('ae-save', 'ae-spinner', 'ae-btn-txt', true, 'Saqlanmoqda…');

  try {
    const res = await apiEditAdmin(
      currentUser.email, currentUser.parol,
      _aeOldEmail, ism, email, parol
    );

    if (res.ok) {
      closeAE();
      loadAdmins();
      toast('✅ Admin yangilandi!', 'success');
    } else {
      toast('❌ ' + res.error, 'error');
    }
  } catch (e) {
    toast('❌ Xatolik yuz berdi', 'error');
  }

  bl('ae-save', 'ae-spinner', 'ae-btn-txt', false, 'Saqlash');
}

/* ════════════════════════════════════════
   O'CHIRISH
════════════════════════════════════════ */

async function delA(email, ism) {
  if (!confirm(`"${ism}" adminini o'chirishni tasdiqlaysizmi?`)) return;

  try {
    const res = await apiDeleteAdmin(currentUser.email, currentUser.parol, email);

    if (res.ok) {
      toast("✅ Admin o'chirildi", 'success');
      loadAdmins();
    } else {
      toast('❌ ' + res.error, 'error');
    }
  } catch (e) {
    toast('❌ Xatolik yuz berdi', 'error');
  }
}
