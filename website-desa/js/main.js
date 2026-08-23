/* ==========================================================================
   MAIN.JS — mengambil data dari content/data.json lalu merender ke halaman.
   Data sekarang bisa diedit lewat halaman /admin (CMS) ATAU langsung edit
   file content/data.json secara manual. Tidak perlu diedit kecuali kamu
   ingin ubah tampilan/logika, bukan konten.
   ========================================================================== */

let DATA = null;

async function muatData() {
  const res = await fetch("content/data.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal memuat content/data.json");
  return res.json();
}

const WARNA_KATEGORI = {
  Pendidikan: "var(--kat-pendidikan)",
  Kesehatan: "var(--kat-kesehatan)",
  Ekonomi: "var(--kat-ekonomi)",
  Lingkungan: "var(--kat-lingkungan)",
  Sosial: "var(--kat-sosial)",
};

function formatTanggal(iso) {
  const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${bulan[m - 1]} ${y}`;
}

/** Buat elemen <img> jika src ada, kalau tidak buat kotak placeholder. */
function elemenFoto(src, altText) {
  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = altText || "";
    img.loading = "lazy";
    img.onerror = function () {
      const ph = document.createElement("div");
      ph.className = "foto-placeholder";
      ph.textContent = altText || "Foto belum tersedia";
      this.replaceWith(ph);
    };
    return img;
  }
  const ph = document.createElement("div");
  ph.className = "foto-placeholder";
  ph.textContent = altText || "Foto belum tersedia";
  return ph;
}

/* ---------------------------- 1. PROFIL DESA ---------------------------- */
function renderProfil() {
  const d = DATA.desa;
  document.title = `${d.nama} — Profil Desa & Dokumentasi KKNT`;
  document.getElementById("nav-nama-desa").textContent = d.nama;
  document.getElementById("hero-nama-desa").textContent = d.nama;
  document.getElementById("hero-tagline").textContent = d.tagline;
  document.getElementById("hero-lokasi").textContent = `${d.kecamatan}, ${d.kabupaten}, ${d.provinsi}`;
  document.getElementById("hero-foto").appendChild(elemenFoto(d.fotoDesa, `Foto ${d.nama}`));

  document.getElementById("stat-luas").textContent = d.luasWilayah;
  document.getElementById("stat-penduduk").textContent = d.jumlahPenduduk.total.toLocaleString("id-ID");
  document.getElementById("stat-rt").textContent = d.jumlahRT;
  document.getElementById("stat-rw").textContent = d.jumlahRW;

  document.getElementById("teks-sejarah").textContent = d.sejarah.trim();
  document.getElementById("teks-visi").textContent = d.visi;
  const listMisi = document.getElementById("list-misi");
  d.misi.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = m;
    listMisi.appendChild(li);
  });

  const batasWrap = document.getElementById("batas-wilayah");
  const labelArah = { utara: "Utara", selatan: "Selatan", timur: "Timur", barat: "Barat" };
  Object.entries(d.batasWilayah).forEach(([arah, nama]) => {
    const item = document.createElement("div");
    item.className = "batas-item";
    item.innerHTML = `<span class="arah">${labelArah[arah]}</span><span class="nama">${nama}</span>`;
    batasWrap.appendChild(item);
  });

  document.getElementById("peta-desa").src = d.mapsEmbedUrl;

  const potensiWrap = document.getElementById("potensi-grid");
  d.potensi.forEach((p) => {
    const item = document.createElement("div");
    item.className = "potensi-item";
    item.innerHTML = `<div class="ikon">${ikonSvg(p.ikon)}</div><h4>${p.nama}</h4><p>${p.deskripsi}</p>`;
    potensiWrap.appendChild(item);
  });
}

function ikonSvg(nama) {
  const ikon = {
    leaf: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 21c8 0 14-6 14-14V4h-3C8 4 4 10 4 16v5"/></svg>',
    scissors: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.5 15.5M20 20 8.5 8.5"/></svg>',
    mountain: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m3 20 6-11 4 6 2-3 6 8H3Z"/></svg>',
    cow: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10c0-3 2-5 8-5s8 2 8 5v4c0 3-2 6-8 6s-8-3-8-6v-4Z"/><path d="M2 8l2 2M22 8l-2 2"/></svg>',
    landmark: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21h16M5 21V9l7-5 7 5v12M9 21v-6h6v6"/></svg>',
    food: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 2v7a2 2 0 0 0 4 0V2M8 9v13M17 2c-2 0-3 2-3 5s1 5 3 5v9"/></svg>',
  };
  return ikon[nama] || ikon.leaf;
}

/* ------------------------- 2. PERANGKAT DESA ------------------------- */
function renderPerangkat() {
  const wrap = document.getElementById("perangkat-grid");
  DATA.perangkat.forEach((p) => {
    const kartu = document.createElement("div");
    kartu.className = "kartu-orang";
    const fotoDiv = document.createElement("div");
    fotoDiv.className = "foto";
    fotoDiv.appendChild(elemenFoto(p.foto, p.nama));
    kartu.appendChild(fotoDiv);
    const info = document.createElement("div");
    info.className = "info";
    info.innerHTML = `
      <div class="nama">${p.nama}</div>
      <div class="jabatan">${p.jabatan}</div>
      <div class="kontak">📱 ${p.kontak}</div>`;
    kartu.appendChild(info);
    wrap.appendChild(kartu);
  });
}

/* ----------------------------- 3. TIM KKNT ----------------------------- */
function renderKKNT() {
  const k = DATA.kknt;
  document.getElementById("kknt-periode").textContent =
    `${formatTanggal(k.periodeMulai)} – ${formatTanggal(k.periodeSelesai)}`;
  document.getElementById("kknt-dpl").textContent = k.dpl;
  document.getElementById("kknt-motto").textContent = `"${k.motto}"`;
  document.getElementById("kknt-jumlah").textContent = `${k.anggota.length} Mahasiswa`;

  const wrap = document.getElementById("anggota-grid");
  k.anggota.forEach((a) => {
    const kartu = document.createElement("div");
    kartu.className = "kartu-anggota";
    const fotoDiv = document.createElement("div");
    fotoDiv.className = "foto";
    fotoDiv.appendChild(elemenFoto(a.foto, a.nama));
    kartu.appendChild(fotoDiv);
    const info = document.createElement("div");
    info.innerHTML = `
      <div class="nama">${a.nama}</div>
      <div class="divisi">${a.divisi}</div>
      <div class="studi">${a.prodi}, ${a.universitas}</div>`;
    kartu.appendChild(info);
    wrap.appendChild(kartu);
  });
}

/* -------------------------- 4. PROGRAM KERJA -------------------------- */
function renderProkerja() {
  const wrap = document.getElementById("proker-grid");
  DATA.programKerja.forEach((p) => {
    const kartu = document.createElement("div");
    kartu.className = "kartu-proker";
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    thumb.appendChild(elemenFoto(p.thumbnail, p.nama));
    kartu.appendChild(thumb);
    const isi = document.createElement("div");
    isi.className = "isi";
    isi.innerHTML = `
      <span class="tag-kategori" style="background:${WARNA_KATEGORI[p.kategori] || "#999"}">${p.kategori}</span>
      <h4>${p.nama}</h4>
      <p class="deskripsi">${p.deskripsi}</p>
      <div class="proker-meta">
        <span>PJ: ${p.penanggungJawab}</span>
        <span>${formatTanggal(p.tanggal)}</span>
      </div>`;
    kartu.appendChild(isi);
    wrap.appendChild(kartu);
  });
}

/* ---------------------- 5. DOKUMENTASI KEGIATAN ---------------------- */
function renderKegiatan() {
  const wrap = document.getElementById("kegiatan-list");
  DATA.kegiatan.forEach((k, idx) => {
    const item = document.createElement("div");
    item.className = "kegiatan-item";

    const header = document.createElement("div");
    header.className = "kegiatan-header";
    header.innerHTML = `
      <div>
        <h4>${k.judul}</h4>
        <div class="kegiatan-meta">
          <span>📅 ${formatTanggal(k.tanggal)}, ${k.waktu}</span>
          <span>📍 ${k.lokasi}</span>
          <span class="tag-kategori" style="background:${WARNA_KATEGORI[k.kategori] || "#999"}">${k.kategori}</span>
        </div>
      </div>
      <span class="kegiatan-toggle">+</span>`;
    header.addEventListener("click", () => item.classList.toggle("terbuka"));

    const body = document.createElement("div");
    body.className = "kegiatan-body";
    const bodyInner = document.createElement("div");
    bodyInner.className = "kegiatan-body-inner";

    const deskripsi = document.createElement("p");
    deskripsi.textContent = k.deskripsi.trim();
    bodyInner.appendChild(deskripsi);

    if (k.foto && k.foto.length) {
      const fotoGrid = document.createElement("div");
      fotoGrid.className = "kegiatan-foto-grid";
      k.foto.forEach((src) => fotoGrid.appendChild(elemenFoto(src, k.judul)));
      bodyInner.appendChild(fotoGrid);
    }

    if (k.testimoni && k.testimoni.isi) {
      const testi = document.createElement("div");
      testi.className = "testimoni";
      testi.innerHTML = `"${k.testimoni.isi}"<span class="siapa">— ${k.testimoni.nama}</span>`;
      bodyInner.appendChild(testi);
    }

    if (k.videoYoutubeId) {
      const videoWrap = document.createElement("div");
      videoWrap.className = "video-wrap";
      videoWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${k.videoYoutubeId}" title="${k.judul}" allowfullscreen></iframe>`;
      bodyInner.appendChild(videoWrap);
    }

    body.appendChild(bodyInner);
    item.appendChild(header);
    item.appendChild(body);
    wrap.appendChild(item);

    if (idx === 0) item.classList.add("terbuka");
  });
}

/* ------------------------------ 6. GALERI ------------------------------ */
function renderGaleri() {
  const grid = document.getElementById("galeri-grid");
  const filterWrap = document.getElementById("galeri-filter");
  const kategoriUnik = ["Semua", ...new Set(DATA.galeri.map((g) => g.kategori))];

  kategoriUnik.forEach((kat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (kat === "Semua" ? " aktif" : "");
    btn.textContent = kat;
    btn.dataset.kategori = kat;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("aktif"));
      btn.classList.add("aktif");
      document.querySelectorAll(".galeri-foto").forEach((el) => {
        const cocok = kat === "Semua" || el.dataset.kategori === kat;
        el.classList.toggle("galeri-item-sembunyi", !cocok);
      });
    });
    filterWrap.appendChild(btn);
  });

  DATA.galeri.forEach((g, idx) => {
    const el = document.createElement("div");
    el.className = "galeri-foto";
    el.dataset.kategori = g.kategori;
    el.appendChild(elemenFoto(g.src, g.caption));
    const cap = document.createElement("div");
    cap.className = "galeri-caption";
    cap.textContent = g.caption;
    el.appendChild(cap);
    el.addEventListener("click", () => bukaLightbox(idx));
    grid.appendChild(el);
  });
}

function bukaLightbox(idx) {
  const g = DATA.galeri[idx];
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  img.src = g.src;
  img.alt = g.caption;
  img.onerror = () => { img.removeAttribute("src"); img.alt = "Foto belum tersedia — " + g.caption; };
  document.getElementById("lightbox-caption").textContent = g.caption;
  lightbox.classList.add("tampil");
}
function tutupLightbox() {
  document.getElementById("lightbox").classList.remove("tampil");
}

/* -------------------------- 7. KONTAK & LOKASI -------------------------- */
function renderKontak() {
  const k = DATA.kontak;
  document.getElementById("kontak-alamat").textContent = k.alamat;
  document.getElementById("kontak-wa").textContent = "+" + k.whatsapp;
  document.getElementById("kontak-wa").href = `https://wa.me/${k.whatsapp}`;
  document.getElementById("kontak-email").textContent = k.email;
  document.getElementById("kontak-email").href = `mailto:${k.email}`;
  document.getElementById("peta-kontak").src = DATA.desa.mapsEmbedUrl;

  const sosial = document.getElementById("sosial-links");
  const tautan = [
    { nama: "Instagram Desa", url: k.instagramDesa },
    { nama: "Facebook Desa", url: k.facebookDesa },
    { nama: "Instagram Tim KKNT", url: k.instagramKKNT },
  ].filter((t) => t.url);
  tautan.forEach((t) => {
    const a = document.createElement("a");
    a.href = t.url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = t.nama;
    sosial.appendChild(a);
  });

  // QR Code ke URL website ini
  if (window.QRCode && k.urlWebsiteIni) {
    new QRCode(document.getElementById("qrcode"), {
      text: k.urlWebsiteIni,
      width: 140,
      height: 140,
      colorDark: "#1f4d3a",
      colorLight: "#efe8d8",
    });
    document.getElementById("qr-url").textContent = k.urlWebsiteIni;
  }
}

/* ------------------------------ FOOTER ------------------------------ */
function renderFooter() {
  document.getElementById("footer-nama-desa").textContent = DATA.desa.nama;
  document.getElementById("footer-tahun").textContent = new Date().getFullYear();
}

/* ------------------------------- INIT ------------------------------- */
function initNav() {
  const toggle = document.getElementById("navbar-toggle");
  const menu = document.getElementById("navbar-menu");
  toggle.addEventListener("click", () => menu.classList.toggle("terbuka"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => menu.classList.remove("terbuka")));
}

function initLightbox() {
  document.getElementById("lightbox-tutup").addEventListener("click", tutupLightbox);
  document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") tutupLightbox();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") tutupLightbox(); });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    DATA = await muatData();
  } catch (err) {
    document.body.innerHTML = `<div style="padding:60px 28px; font-family:sans-serif; max-width:600px; margin:0 auto;">
      <h2 style="color:#a6522c;">Gagal memuat data website</h2>
      <p>Pastikan file <code>content/data.json</code> ada dan formatnya benar (JSON valid). Detail teknis: ${err.message}</p>
    </div>`;
    console.error(err);
    return;
  }
  renderProfil();
  renderPerangkat();
  renderKKNT();
  renderProkerja();
  renderKegiatan();
  renderGaleri();
  renderKontak();
  renderFooter();
  initNav();
  initLightbox();
});
