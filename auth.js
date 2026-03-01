/* ================================================
   js/auth.js  —  Autentifikatsiya (Login / Logout)
   ================================================ */

/** Joriy foydalanuvchi ma'lumotlari — barcha JS fayllar uchun global */
let currentUser = null;

/* ─── Sahifa yuklanganda avtomatik login ─── */
window.addEventListener('DOMContentLoaded', async () => {
  const saved = localStorage.getItem('iit_user');
  if (!saved) return;

  try {
    currentUser = JSON.parse(saved);
    await showApp();
  } catch (e) {
    // Noto'g'ri JSON bo'lsa tozalab yuboramiz
    localStorage.removeItem('iit_user');
  }
});

/* ─── Enter tugmasi bilan login ─── */
g('inp-parol').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});

/**
 * Login tugmasi bosilganda
 * Email + parolni serverga yuboradi, muvaffaqiyatli bo'lsa appni ochadi
 */
async function doLogin() {
  const email = g('inp-email').value.trim();
  const parol = g('inp-parol').value;

  if (!email || !parol) return;

  const btn = g('login-btn');
  btn.disabled    = true;
  btn.textContent = 'Tekshirilmoqda…';

  try {
    const res = await apiLogin(email, parol);

    if (res.ok) {
      currentUser = { email, parol, ism: res.ism, isSuper: res.isSuper };
      localStorage.setItem('iit_user', JSON.stringify(currentUser));
      await showApp();
    } else {
      showLoginError(res.error || "Login yoki parol noto'g'ri");
    }

  } catch (e) {
    showLoginError('Ulanishda xatolik yuz berdi');
  }

  btn.disabled    = false;
  btn.textContent = 'Kirish';
}

/**
 * Chiqish — sessiyani tozalab login sahifasiga qaytarish
 */
function doLogout() {
  currentUser = null;
  localStorage.removeItem('iit_user');

  g('app').style.display          = 'none';
  g('login-screen').style.display = 'flex';
  g('inp-email').value            = '';
  g('inp-parol').value            = '';
  g('login-err').style.display    = 'none';
}

/**
 * Asosiy ilovani ko'rsatish
 * Super admin uchun qo'shimcha imkoniyatlar ochiladi
 */
async function showApp() {
  g('login-screen').style.display = 'none';
  g('app').style.display          = 'block';

  const badge = g('admin-badge');

  if (currentUser.isSuper) {
    badge.textContent = '⭐ ' + currentUser.ism;
    badge.classList.add('super');
    g('tabs-row').style.display  = 'flex';     // Adminlar tab paydo bo'ladi
    g('admin-col').style.display = '';          // Jadvalda "Admin" ustuni
    loadAdmins();                               // Adminlar ro'yxatini yuklash
  } else {
    badge.textContent = currentUser.ism;
  }

  await loadStudents();
}

/**
 * Tablar orasida almashtirish
 * @param {string} tab  — 's' (o'quvchilar) | 'a' (adminlar)
 */
function switchTab(tab) {
  g('tab-s').style.display = tab === 's' ? 'block' : 'none';
  g('tab-a').style.display = tab === 'a' ? 'block' : 'none';

  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active',
      (i === 0 && tab === 's') || (i === 1 && tab === 'a')
    );
  });
}

/* ─── Private ─── */

function showLoginError(msg) {
  const el = g('login-err');
  el.textContent  = '❌ ' + msg;
  el.style.display = 'block';
}
