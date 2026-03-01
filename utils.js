/* ================================================
   js/utils.js  —  Umumiy yordamchi funksiyalar
   ================================================ */

/**
 * document.getElementById uchun qisqartma
 * @param {string} id
 * @returns {HTMLElement}
 */
function g(id) {
  return document.getElementById(id);
}

/**
 * HTML atributiga xavfsiz qo'yish uchun tırnak belgisini escape qilish
 * @param {string} s
 * @returns {string}
 */
function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Sanani uz-UZ formatida ko'rsatish
 * @param {string} val  — ISO sana yoki oddiy string
 * @returns {string}
 */
function fDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString('uz-UZ');
}

/**
 * Tug'ilgan sanani formatlash
 * Bazada "2015-03-12" yoki "2015" formatida saqlangan bo'lishi mumkin
 * @param {string} val
 * @returns {string}
 */
function fTug(val) {
  if (!val) return '—';
  const s = String(val);

  if (s.match(/^\d{4}-\d{2}-\d{2}/) || s.includes('T')) {
    const d = new Date(s);
    if (!isNaN(d)) return d.toLocaleDateString('uz-UZ');
  }

  // Faqat yil qaytarish
  return s.length >= 4 ? s.substring(0, 4) : s;
}

/**
 * Maktab inputini validatsiya qilish (1–99)
 * Har safar input o'zgarganda chaqiriladi
 * @param {HTMLInputElement} inp
 */
function valM(inp) {
  let v = inp.value.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0, 2);
  inp.value = v;

  const n = parseInt(v);
  inp.classList.toggle('err', !!(v && (isNaN(n) || n < 1 || n > 99)));
}

/**
 * Maktab inputidan validatsiya qilingan qiymat olish
 * @param {string} id  — input element ID
 * @returns {string|null}  — to'g'ri bo'lsa string raqam, aks holda null
 */
function getM(id) {
  const v = g(id).value.trim();
  const n = parseInt(v);
  return (!v || isNaN(n) || n < 1 || n > 99) ? null : String(n);
}

/**
 * Tugmani loading holatiga o'tkazish
 * @param {string|null} btnId    — disabled bo'ladigan tugma ID (null bo'lsa o'tkaziladi)
 * @param {string}      spId     — spinner element ID
 * @param {string}      txtId    — matn element ID
 * @param {boolean}     loading  — true = loading, false = normal
 * @param {string}      txt      — ko'rsatiladigan matn
 */
function bl(btnId, spId, txtId, loading, txt) {
  if (btnId) g(btnId).disabled = loading;
  g(spId).style.display  = loading ? 'inline-block' : 'none';
  g(txtId).textContent   = txt;
}

/**
 * Toast xabar ko'rsatish
 * @param {string} msg   — xabar matni
 * @param {string} type  — '' | 'success' | 'error'
 */
let _toastTimer;
function toast(msg, type = '') {
  const t = g('toast');
  t.textContent = msg;
  t.className   = 'toast show ' + type;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

/**
 * Loading overlay ko'rsatish / yashirish
 * @param {boolean} show
 */
function showLoading(show) {
  g('loading-ov').style.display = show ? 'flex' : 'none';
}

/**
 * Parol ko'rish / yashirish
 * @param {string} id  — input element ID
 */
function togglePw(id) {
  const inp  = g(id);
  const icon = g('eye-' + id);
  const hide = inp.type === 'password';
  inp.type = hide ? 'text' : 'password';

  icon.innerHTML = hide
    // Ko'z ochiq
    ? `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
       <circle cx="12" cy="12" r="3"/>`
    // Ko'z yopiq (diagonal chiziq bilan)
    : `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
       <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
       <line x1="1" y1="1" x2="23" y2="23"/>`;
}
