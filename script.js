/* =========================================================
   Kepolisian Kota Nexotis — Daftar Pasal & Kalkulator Tilang
   ========================================================= */

/* -----------------------------------------------------------
   DATA PASAL (CONTOH / PLACEHOLDER)
   Ganti isi array ini sesuai daftar pasal resmi kalian.
   cat: 1 = Lalu Lintas, 2 = Ketertiban Umum, 3 = Kriminal
   denda dalam angka (tanpa simbol $), bulan = lama tahanan,
   note = catatan khusus opsional (kosongkan jika tidak ada)
   ----------------------------------------------------------- */
const DATA_PASAL = [
  { cat: 1, kode: "Pasal 1",  nama: "Tidak Memakai Helm",                 denda: 500,  bulan: 0, note: "" },
  { cat: 1, kode: "Pasal 2",  nama: "Melanggar Rambu Lalu Lintas",        denda: 750,  bulan: 0, note: "" },
  { cat: 1, kode: "Pasal 3",  nama: "Melebihi Batas Kecepatan",           denda: 1000, bulan: 0, note: "" },
  { cat: 1, kode: "Pasal 4",  nama: "Tidak Memiliki SIM",                 denda: 1500, bulan: 1, note: "" },
  { cat: 1, kode: "Pasal 5",  nama: "Kendaraan Tidak Layak Jalan (STNK Mati)", denda: 600, bulan: 0, note: "" },
  { cat: 1, kode: "Pasal 6",  nama: "Menerobos Lampu Merah",              denda: 850,  bulan: 0, note: "" },

  { cat: 2, kode: "Pasal 7",  nama: "Membuat Keributan di Tempat Umum",   denda: 800,  bulan: 0, note: "" },
  { cat: 2, kode: "Pasal 8",  nama: "Mabuk di Tempat Umum",               denda: 1000, bulan: 1, note: "" },
  { cat: 2, kode: "Pasal 9",  nama: "Merokok di Area Dilarang Merokok",   denda: 300,  bulan: 0, note: "" },
  { cat: 2, kode: "Pasal 10", nama: "Vandalisme Fasilitas Umum",          denda: 1200, bulan: 1, note: "" },

  { cat: 3, kode: "Pasal 11", nama: "Kepemilikan Senjata Api Ilegal",     denda: 5000, bulan: 6, note: "Wajib sita senjata" },
  { cat: 3, kode: "Pasal 12", nama: "Percobaan Pencurian",                denda: 3000, bulan: 3, note: "" },
  { cat: 3, kode: "Pasal 13", nama: "Penganiayaan Ringan",                denda: 4000, bulan: 4, note: "" },
  { cat: 3, kode: "Pasal 14", nama: "Ancaman Kekerasan",                  denda: 2500, bulan: 2, note: "" },
];

/* ================= RENDER DAFTAR PASAL ================= */
function buatKartuPasal(p) {
  const label = document.createElement("label");
  label.className = "citation-item";
  label.dataset.cat = p.cat;
  label.dataset.search = (p.kode + " " + p.nama).toLowerCase();

  const extra = p.note ? `<div class="citation-extra">⚠️ ${p.note}</div>` : "";

  label.innerHTML = `
    <input type="checkbox" class="pasal-check"
      data-pasal="${p.kode}" data-nama="${p.nama}"
      data-denda="${p.denda}" data-bulan="${p.bulan}" data-text="${p.note}">
    <div class="citation-body">
      <div class="citation-top">
        <span class="pasal-code">${p.kode}</span>
        <span class="citation-price">$${p.denda.toLocaleString("id-ID")}</span>
      </div>
      <div class="citation-name">${p.nama}</div>
      ${extra}
    </div>`;
  return label;
}

function renderPasal() {
  [1, 2, 3].forEach((cat) => {
    const grid = document.querySelector(`[data-cat-grid="${cat}"]`);
    grid.innerHTML = "";
    DATA_PASAL.filter((p) => p.cat === cat).forEach((p) => {
      grid.appendChild(buatKartuPasal(p));
    });
  });
}
renderPasal();

/* ================= FILTER (kategori + pencarian) ================= */
const sections    = document.querySelectorAll(".cat-section");
const filterBtns  = document.querySelectorAll("#filterBar .filter-btn");
const searchInput = document.getElementById("searchInput");
const emptyState  = document.getElementById("emptyState");
let activeCat = "0";

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  let anyVisible = 0;

  sections.forEach((section) => {
    let visibleCount = 0;
    section.querySelectorAll(".citation-item").forEach((item) => {
      const matchesCat = activeCat === "0" || item.dataset.cat === activeCat;
      const matchesSearch = q === "" || item.dataset.search.includes(q);
      const show = matchesCat && matchesSearch;
      item.style.display = show ? "" : "none";
      if (show) { visibleCount++; anyVisible++; }
    });
    section.style.display = visibleCount > 0 ? "" : "none";
    const countEl = section.querySelector(".cat-count");
    if (countEl) countEl.textContent = visibleCount + " pasal";
  });

  emptyState.hidden = anyVisible > 0;
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    applyFilters();
  });
});
searchInput.addEventListener("input", applyFilters);
applyFilters();

/* ================= KALKULATOR TILANG ================= */
const listEl         = document.getElementById("listPasalDipilih");
const totalDendaEl   = document.getElementById("totalDenda");
const totalTahananEl = document.getElementById("totalTahanan");
const jumlahPasalEl  = document.getElementById("jumlahPasal");
const specialNoteEl  = document.getElementById("specialNote");
const namaPelaku     = document.getElementById("namaPelaku");
const namaPetugas    = document.getElementById("namaPetugas");

function formatUang(n) {
  return "$" + n.toLocaleString("id-ID");
}

let salinPasalText   = "";
let salinDendaText   = "";
let salinTahananText = "";
let salinSemuaText   = "";

function hitung() {
  let totalDenda = 0;
  let totalBulan = 0;
  let dipilih = [];
  let specialTexts = [];
  let pasalTextLines = [];
  let pasalCodes = [];

  document.querySelectorAll(".pasal-check").forEach((cb) => {
    const item = cb.closest(".citation-item");
    if (cb.checked) {
      item.classList.add("is-checked");

      const denda = parseInt(cb.dataset.denda, 10) || 0;
      const bulan = parseInt(cb.dataset.bulan, 10) || 0;
      const text  = cb.dataset.text || "";

      totalDenda += denda;
      totalBulan += bulan;
      if (text) specialTexts.push(cb.dataset.pasal + ": " + text);

      dipilih.push(
        `<div class="selected-line"><span class="pasal-code">${cb.dataset.pasal}</span><span>${cb.dataset.nama}</span></div>`
      );

      pasalTextLines.push(`${cb.dataset.pasal} - ${cb.dataset.nama}`);
      pasalCodes.push(cb.dataset.pasal);
    } else {
      item.classList.remove("is-checked");
    }
  });

  listEl.innerHTML = dipilih.length
    ? dipilih.join("")
    : '<em class="empty-note">Belum ada pasal dipilih</em>';

  const totalDendaText   = formatUang(totalDenda);
  const totalTahananText = totalBulan + " Bulan" + (specialTexts.length ? " (+ " + specialTexts.join(", ") + ")" : "");

  totalDendaEl.textContent   = totalDendaText;
  totalTahananEl.textContent = totalBulan + " Bulan";
  jumlahPasalEl.textContent  = dipilih.length;
  specialNoteEl.innerHTML = specialTexts.length
    ? "⚠️ Catatan khusus: " + specialTexts.join(", ")
    : "";

  salinPasalText   = pasalCodes.join(", ");
  salinDendaText   = totalDendaText;
  salinTahananText = totalTahananText;
  salinSemuaText = [
    "SURAT TILANG - KEPOLISIAN KOTA NEXOTIS",
    `Pelaku: ${namaPelaku.value || "-"}`,
    `Petugas: ${namaPetugas.value || "-"}`,
    "",
    "Pasal yang dilanggar:",
    pasalTextLines.length ? pasalTextLines.map((l) => "- " + l).join("\n") : "-",
    "",
    `Total Denda: ${totalDendaText}`,
    `Total Masa Tahanan: ${totalTahananText}`,
  ].join("\n");
}

function salinKeClipboard(teks, tombol) {
  if (!teks) return;
  const labelAsli = tombol.innerHTML;
  const tandai = () => {
    tombol.textContent = "✅ Disalin";
    tombol.classList.add("copied");
    setTimeout(() => {
      tombol.innerHTML = labelAsli;
      tombol.classList.remove("copied");
    }, 1500);
  };

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(teks).then(tandai).catch(() => fallbackSalin(teks, tandai));
  } else {
    fallbackSalin(teks, tandai);
  }
}

function fallbackSalin(teks, callback) {
  const ta = document.createElement("textarea");
  ta.value = teks;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) { /* noop */ }
  document.body.removeChild(ta);
  callback();
}

document.getElementById("btnCopyPasal").addEventListener("click", function () {
  salinKeClipboard(salinPasalText, this);
});
document.getElementById("btnCopyDenda").addEventListener("click", function () {
  salinKeClipboard(salinDendaText, this);
});
document.getElementById("btnCopyTahanan").addEventListener("click", function () {
  salinKeClipboard(salinTahananText, this);
});
document.getElementById("btnCopySemua").addEventListener("click", function () {
  salinKeClipboard(salinSemuaText, this);
});
document.getElementById("btnResetPasal").addEventListener("click", function () {
  document.querySelectorAll(".pasal-check").forEach((cb) => { cb.checked = false; });
  hitung();
});

document.addEventListener("change", (e) => {
  if (e.target.classList.contains("pasal-check")) hitung();
});
namaPelaku.addEventListener("input", hitung);
namaPetugas.addEventListener("input", hitung);
hitung();
