/* ================================================
   js/api.js  —  Backend bilan muloqot
   ================================================

   Barcha server so'rovlari shu faylda.
   Google Apps Script URL ni shu yerda o'zgartirish kifoya.
   ================================================ */

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/' +
  'AKfycbzPxt1L57qhkwgwHz8qDXgqRg8qFV81dHH1QPMkFezQENr6S33bn07dLpK_l7fOw1pmHg' +
  '/exec';

/**
 * Google Apps Script ga GET so'rov yuborish
 * Apps Script CORS uchun faqat GET ni qabul qiladi
 *
 * @param {Object} params  — so'rov parametrlari (action + qo'shimcha ma'lumotlar)
 * @returns {Promise<Object>}  — { ok: true/false, ... }
 */
async function apiRequest(params) {
  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

  const response = await fetch(`${APPS_SCRIPT_URL}?${queryString}`);
  return response.json();
}

/* ─── Auth ─── */

/**
 * Login tekshirish
 * @param {string} email
 * @param {string} parol
 * @returns {Promise<{ok, ism, isSuper, error}>}
 */
async function apiLogin(email, parol) {
  return apiRequest({ action: 'login', email, parol });
}

/* ─── O'quvchilar ─── */

/**
 * Barcha o'quvchilarni yuklash
 * Super admin — hammasini ko'radi
 * Oddiy admin — faqat o'zinikini ko'radi
 */
async function apiGetStudents(email, parol) {
  return apiRequest({ action: 'getStudents', email, parol });
}

/**
 * Yangi o'quvchi qo'shish
 * @param {string} email
 * @param {string} parol
 * @param {Object} student  — { ism, familiya, maktab, sinf, telefon, telefon2, manzil, tug, date }
 */
async function apiAddStudent(email, parol, student) {
  return apiRequest({ action: 'addStudent', email, parol, ...student });
}

/**
 * O'quvchi ma'lumotlarini tahrirlash
 * Eski ism+familiya orqali topiladi, yangi ma'lumotlar bilan yangilanadi
 */
async function apiEditStudent(email, parol, oldIsm, oldFamiliya, student) {
  return apiRequest({
    action: 'editStudent',
    email, parol,
    oldIsm, oldFamiliya,
    ...student
  });
}

/**
 * O'quvchini o'chirish
 */
async function apiDeleteStudent(email, parol, delIsm, delFamiliya) {
  return apiRequest({ action: 'deleteStudent', email, parol, delIsm, delFamiliya });
}

/* ─── Adminlar ─── */

/**
 * Barcha adminlar ro'yxati (faqat super admin)
 */
async function apiGetAdmins(email, parol) {
  return apiRequest({ action: 'getAdmins', email, parol });
}

/**
 * Yangi admin yaratish
 */
async function apiCreateAdmin(email, parol, newIsm, newEmail, newParol) {
  return apiRequest({ action: 'createAdmin', email, parol, newIsm, newEmail, newParol });
}

/**
 * Admin ma'lumotlarini tahrirlash
 */
async function apiEditAdmin(email, parol, oldEmail, newIsm, newEmail, newParol) {
  return apiRequest({ action: 'editAdmin', email, parol, oldEmail, newIsm, newEmail, newParol });
}

/**
 * Adminni o'chirish
 */
async function apiDeleteAdmin(email, parol, deleteEmail) {
  return apiRequest({ action: 'deleteAdmin', email, parol, deleteEmail });
}
