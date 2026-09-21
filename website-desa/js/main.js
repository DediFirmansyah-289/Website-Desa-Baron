/* ==========================================================================
   MAIN.JS — WEBSITE DESA BARON

   Struktur data:

   content/
   ├── desa.json
   ├── perangkat.json
   ├── kknt.json
   ├── proker.json
   ├── kegiatan.json
   ├── galeri.json
   ├── tempat-penting.json
   ├── umkm.json
   └── kontak.json

   Catatan:
   - Data sekolah digabung ke dalam tempat-penting.json
   - Data UMKM berasal dari umkm.json
   - Data dapat diedit melalui /admin CMS atau langsung melalui
     file JSON di folder content/
   ========================================================================== */

let DATA = null;


/* ==========================================================================
   HELPER DASAR
   ========================================================================== */

/**
 * Mengambil file JSON dari folder content.
 */
async function ambilJSON(namaFile) {
  const response = await fetch(`content/${namaFile}.json`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Gagal memuat content/${namaFile}.json — HTTP ${response.status}`
    );
  }

  return response.json();
}


/**
 * Mengubah nilai menjadi teks.
 */
function teks(nilai, fallback = "") {
  if (nilai === null || nilai === undefined) {
    return fallback;
  }

  return String(nilai);
}


/**
 * Memastikan nilai berupa array.
 */
function arrayAman(nilai) {
  return Array.isArray(nilai) ? nilai : [];
}


/**
 * Memastikan nilai berupa object.
 */
function objectAman(nilai) {
  return nilai &&
    typeof nilai === "object" &&
    !Array.isArray(nilai)
    ? nilai
    : {};
}


/**
 * Mengubah teks menjadi HTML yang aman.
 */
function escapeHTML(nilai) {
  return teks(nilai)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/**
 * Normalisasi nomor WhatsApp.
 *
 * 085648692650
 * menjadi:
 * 6285648692650
 */
function normalisasiWhatsApp(nomor) {
  let hasil = teks(nomor).trim();

  if (!hasil) {
    return "";
  }

  hasil = hasil.replace(/[^\d+]/g, "");

  if (hasil.startsWith("+")) {
    hasil = hasil.substring(1);
  }

  if (hasil.startsWith("0")) {
    hasil = "62" + hasil.substring(1);
  }

  return hasil;
}


/**
 * Format tanggal YYYY-MM-DD
 * menjadi tanggal Indonesia.
 */
function formatTanggal(tanggal) {
  if (!tanggal) {
    return "Tanggal belum ditentukan";
  }

  const nilai = teks(tanggal).trim();
  const bagian = nilai.split("-");

  if (bagian.length !== 3) {
    return "Tanggal tidak valid";
  }

  const [tahun, bulan, hari] = bagian.map(Number);

  if (
    !tahun ||
    !bulan ||
    !hari ||
    bulan < 1 ||
    bulan > 12
  ) {
    return "Tanggal tidak valid";
  }

  const daftarBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return `${hari} ${daftarBulan[bulan - 1]} ${tahun}`;
}


/**
 * Membuat elemen gambar.
 */
function elemenFoto(
  src,
  altText = "Foto belum tersedia"
) {
  const sumberFoto = teks(src).trim();
  const teksAlt = teks(
    altText,
    "Foto belum tersedia"
  );

  if (sumberFoto) {
    const img = document.createElement("img");

    img.src = sumberFoto;
    img.alt = teksAlt;
    img.loading = "lazy";

    img.onerror = function () {
      const placeholder =
        document.createElement("div");

      placeholder.className =
        "foto-placeholder";

      placeholder.textContent = teksAlt;

      this.replaceWith(placeholder);
    };

    return img;
  }

  const placeholder =
    document.createElement("div");

  placeholder.className =
    "foto-placeholder";

  placeholder.textContent = teksAlt;

  return placeholder;
}


/**
 * Mengisi textContent jika elemen tersedia.
 */
function isiTeks(
  id,
  nilai,
  fallback = ""
) {
  const elemen =
    document.getElementById(id);

  if (elemen) {
    elemen.textContent =
      teks(nilai, fallback);
  }
}


/**
 * Mengatur src elemen.
 */
function isiSrc(id, nilai) {
  const elemen =
    document.getElementById(id);

  if (elemen && nilai) {
    elemen.src = nilai;
  }
}


/**
 * Mengatur href elemen.
 */
function isiHref(id, nilai) {
  const elemen =
    document.getElementById(id);

  if (elemen && nilai) {
    elemen.href = nilai;
  }
}


/**
 * Mengosongkan elemen sebelum render.
 */
function kosongkan(id) {
  const elemen =
    document.getElementById(id);

  if (elemen) {
    elemen.innerHTML = "";
  }

  return elemen;
}


/* ==========================================================================
   MEMUAT SEMUA DATA
   ========================================================================== */

/*
   URUTAN HARUS SESUAI STRUKTUR:

   1. desa.json
   2. perangkat.json
   3. kknt.json
   4. proker.json
   5. kegiatan.json
   6. galeri.json
   7. tempat-penting.json
   8. umkm.json
   9. kontak.json
*/

async function muatData() {
  const [
    desa,
    perangkatFile,
    kknt,
    prokerFile,
    kegiatanFile,
    galeriFile,
    tempatPentingFile,
    umkmFile,
    kontak,
  ] = await Promise.all([
    ambilJSON("desa"),
    ambilJSON("perangkat"),
    ambilJSON("kknt"),
    ambilJSON("proker"),
    ambilJSON("kegiatan"),
    ambilJSON("galeri"),
    ambilJSON("tempat-penting"),
    ambilJSON("umkm"),
    ambilJSON("kontak"),
  ]);

  return {
    desa: objectAman(desa),

    perangkat:
      arrayAman(perangkatFile.perangkat),

    kknt:
      objectAman(kknt),

    programKerja:
      arrayAman(prokerFile.programKerja),

    kegiatan:
      arrayAman(kegiatanFile.kegiatan),

    galeri:
      arrayAman(galeriFile.galeri),

    tempatPenting:
      arrayAman(
        tempatPentingFile.tempatPenting
      ),

    umkm:
      arrayAman(umkmFile.umkm),

    kontak:
      objectAman(kontak),
  };
}


/* ==========================================================================
   WARNA KATEGORI
   ========================================================================== */

const WARNA_KATEGORI = {
  Pendidikan:
    "var(--kat-pendidikan, #2563eb)",

  Kesehatan:
    "var(--kat-kesehatan, #16a34a)",

  Ekonomi:
    "var(--kat-ekonomi, #d97706)",

  Lingkungan:
    "var(--kat-lingkungan, #15803d)",

  Sosial:
    "var(--kat-sosial, #9333ea)",

  "Teknologi & Informasi":
    "var(--kat-teknologi, #0891b2)",

  "Olahraga & Kesehatan":
    "var(--kat-olahraga, #7c3aed)",

  "Ekonomi & Informasi":
    "var(--kat-ekonomi-informasi, #0f766e)",
};


/* ==========================================================================
   1. PROFIL DESA
   ========================================================================== */

function renderProfil() {
  const d = DATA.desa;

  const jumlahPenduduk =
    objectAman(d.jumlahPenduduk);

  const batasWilayah =
    objectAman(d.batasWilayah);

  const totalPenduduk =
    Number(jumlahPenduduk.total) || 0;

  const lakiLaki =
    Number(jumlahPenduduk.lakiLaki) || 0;

  const perempuan =
    Number(jumlahPenduduk.perempuan) || 0;


  document.title =
    `${teks(
      d.nama,
      "Desa Baron"
    )} — Profil Desa & Dokumentasi KKNT`;


  isiTeks(
    "nav-nama-desa",
    d.nama
  );

  isiTeks(
    "hero-nama-desa",
    d.nama
  );

  isiTeks(
    "hero-tagline",
    d.tagline
  );


  isiTeks(
    "hero-lokasi",
    `${teks(d.kecamatan)}, ${teks(
      d.kabupaten
    )}, ${teks(d.provinsi)}`
  );


  const heroFoto =
    document.getElementById(
      "hero-foto"
    );

  if (heroFoto) {
    heroFoto.innerHTML = "";

    heroFoto.appendChild(
      elemenFoto(
        d.fotoDesa,
        `Foto ${teks(
          d.nama,
          "Desa"
        )}`
      )
    );
  }


  isiTeks(
    "stat-luas",
    d.luasWilayah
  );


  const statPenduduk =
    document.getElementById(
      "stat-penduduk"
    );

  if (statPenduduk) {
    statPenduduk.textContent =
      totalPenduduk.toLocaleString(
        "id-ID"
      );
  }


  const rincianPenduduk =
    document.getElementById(
      "stat-penduduk-rincian"
    );

  if (rincianPenduduk) {
    if (
      lakiLaki > 0 ||
      perempuan > 0
    ) {
      rincianPenduduk.textContent =
        `${lakiLaki.toLocaleString(
          "id-ID"
        )} L / ${perempuan.toLocaleString(
          "id-ID"
        )} P`;
    } else {
      rincianPenduduk.textContent =
        "(rincian L/P sedang diverifikasi)";
    }
  }


  isiTeks(
    "stat-rt",
    d.jumlahRT
  );

  isiTeks(
    "stat-rw",
    d.jumlahRW
  );

  isiTeks(
    "stat-sekolah",
    d.jumlahSekolah
  );

  isiTeks(
    "stat-umkm-gmaps",
    d.jumlahUMKMGoogleMaps
  );


  isiTeks(
    "teks-alasan-website",
    d.alasanWebsite
  );

  isiTeks(
    "teks-sejarah",
    teks(d.sejarah).trim()
  );

  isiTeks(
    "teks-visi",
    d.visi
  );


  const listMisi =
    kosongkan("list-misi");

  arrayAman(d.misi).forEach(
    (misi) => {
      if (!listMisi) return;

      const li =
        document.createElement("li");

      li.textContent =
        teks(misi);

      listMisi.appendChild(li);
    }
  );


  const batasWrap =
    kosongkan("batas-wilayah");


  const labelArah = {
    utara: "Utara",
    selatan: "Selatan",
    timur: "Timur",
    barat: "Barat",
  };


  Object.entries(
    batasWilayah
  ).forEach(
    ([arah, nama]) => {
      if (!batasWrap) return;

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "batas-item";

      item.innerHTML = `
        <span class="arah">
          ${escapeHTML(
            labelArah[arah] ||
            arah
          )}
        </span>

        <span class="nama">
          ${escapeHTML(nama)}
        </span>
      `;

      batasWrap.appendChild(item);
    }
  );


  isiSrc(
    "peta-desa",
    d.mapsEmbedUrl
  );


  const potensiWrap =
    kosongkan("potensi-grid");

  arrayAman(d.potensi).forEach(
    (potensi) => {
      if (!potensiWrap) return;

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "potensi-item";

      item.innerHTML = `
        <div class="ikon">
          ${ikonSvg(
            potensi.ikon
          )}
        </div>

        <h4>
          ${escapeHTML(
            potensi.nama
          )}
        </h4>

        <p>
          ${escapeHTML(
            potensi.deskripsi
          )}
        </p>
      `;

      potensiWrap.appendChild(item);
    }
  );


  const prestasiWrap =
    kosongkan("prestasi-grid");

  arrayAman(d.prestasi).forEach(
    (prestasi) => {
      if (!prestasiWrap) return;

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "potensi-item";

      item.innerHTML = `
        <div class="ikon">
          ${ikonSvg("landmark")}
        </div>

        <h4>
          ${escapeHTML(
            prestasi.nama
          )}
        </h4>

        <p>
          ${escapeHTML(
            prestasi.deskripsi
          )}
        </p>
      `;

      prestasiWrap.appendChild(item);
    }
  );
}


/* ==========================================================================
   ICON SVG
   ========================================================================== */

function ikonSvg(nama) {
  const ikon = {

    leaf: `
      <svg width="28" height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true">

        <path
          d="M5 21c8 0 14-6 14-14V4h-3C8 4 4 10 4 16v5"
        />
      </svg>
    `,


    scissors: `
      <svg width="28" height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true">

        <circle
          cx="6"
          cy="6"
          r="3"
        />

        <circle
          cx="6"
          cy="18"
          r="3"
        />

        <path
          d="M20 4 8.5 15.5M20 20 8.5 8.5"
        />
      </svg>
    `,


    mountain: `
      <svg width="28" height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true">

        <path
          d="m3 20 6-11 4 6 2-3 6 8H3Z"
        />
      </svg>
    `,


    cow: `
      <svg width="28" height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true">

        <path
          d="M4 10c0-3 2-5 8-5s8 2 8 5v4c0 3-2 6-8 6s-8-3-8-6v-4Z"
        />

        <path
          d="M2 8l2 2M22 8l-2 2"
        />
      </svg>
    `,


    landmark: `
      <svg width="28" height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true">

        <path
          d="M4 21h16M5 21V9l7-5 7 5v12M9 21v-6h6v6"
        />
      </svg>
    `,


    food: `
      <svg width="28" height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true">

        <path
          d="M6 2v7a2 2 0 0 0 4 0V2M8 9v13M17 2c-2 0-3 2-3 5s1 5 3 5v9"
        />
      </svg>
    `,
  };

  return (
    ikon[nama] ||
    ikon.leaf
  );
}


/* ==========================================================================
   2. PERANGKAT DESA
   ========================================================================== */

function renderPerangkat() {
  const wrap =
    kosongkan(
      "perangkat-grid"
    );

  DATA.perangkat.forEach(
    (perangkat) => {
      if (!wrap) return;

      const kartu =
        document.createElement(
          "div"
        );

      kartu.className =
        "kartu-orang";


      const fotoDiv =
        document.createElement(
          "div"
        );

      fotoDiv.className =
        "foto";

      fotoDiv.appendChild(
        elemenFoto(
          perangkat.foto,
          perangkat.nama
        )
      );

      kartu.appendChild(
        fotoDiv
      );


      const info =
        document.createElement(
          "div"
        );

      info.className =
        "info";

      info.innerHTML = `
        <div class="nama">
          ${escapeHTML(
            perangkat.nama
          )}
        </div>

        <div class="jabatan">
          ${escapeHTML(
            perangkat.jabatan
          )}
        </div>

        <div class="kontak">
          📱 ${escapeHTML(
            perangkat.kontak || "-"
          )}
        </div>
      `;

      kartu.appendChild(
        info
      );

      wrap.appendChild(
        kartu
      );
    }
  );
}


/* ==========================================================================
   3. TIM KKNT
   ========================================================================== */

function renderKKNT() {
  const k = DATA.kknt;


  isiTeks(
    "kknt-periode",
    `${formatTanggal(
      k.periodeMulai
    )} – ${formatTanggal(
      k.periodeSelesai
    )}`
  );


  isiTeks(
    "kknt-dpl",
    k.dpl
  );


  isiTeks(
    "kknt-motto",
    k.motto
      ? `"${k.motto}"`
      : ""
  );


  const anggota =
    arrayAman(k.anggota);


  isiTeks(
    "kknt-jumlah",
    `${anggota.length} Mahasiswa`
  );


  const wrap =
    kosongkan(
      "anggota-grid"
    );


  anggota.forEach(
    (anggotaItem) => {
      if (!wrap) return;

      const kartu =
        document.createElement(
          "div"
        );

      kartu.className =
        "kartu-anggota";


      const fotoDiv =
        document.createElement(
          "div"
        );

      fotoDiv.className =
        "foto";

      fotoDiv.appendChild(
        elemenFoto(
          anggotaItem.foto,
          anggotaItem.nama
        )
      );

      kartu.appendChild(
        fotoDiv
      );


      const info =
        document.createElement(
          "div"
        );

      info.innerHTML = `
        <div class="nama">
          ${escapeHTML(
            anggotaItem.nama
          )}
        </div>

        <div class="divisi">
          ${escapeHTML(
            anggotaItem.divisi
          )}
        </div>

        <div class="studi">
          ${escapeHTML(
            anggotaItem.prodi
          )},
          ${escapeHTML(
            anggotaItem.universitas
          )}
        </div>
      `;

      kartu.appendChild(
        info
      );

      wrap.appendChild(
        kartu
      );
    }
  );
}


/* ==========================================================================
   4. PROGRAM KERJA
   ========================================================================== */

function renderProkerja() {
  const wrap =
    kosongkan(
      "proker-grid"
    );


  DATA.programKerja.forEach(
    (program) => {
      if (!wrap) return;

      const kartu =
        document.createElement(
          "div"
        );

      kartu.className =
        "kartu-proker";


      const thumb =
        document.createElement(
          "div"
        );

      thumb.className =
        "thumb";

      thumb.appendChild(
        elemenFoto(
          program.thumbnail,
          program.nama
        )
      );

      kartu.appendChild(
        thumb
      );


      const isi =
        document.createElement(
          "div"
        );

      isi.className =
        "isi";


      const warnaKategori =
        WARNA_KATEGORI[
          program.kategori
        ] ||
        "#999999";


      isi.innerHTML = `
        <span
          class="tag-kategori"
          style="background:${warnaKategori}"
        >
          ${escapeHTML(
            program.kategori
          )}
        </span>

        <h4>
          ${escapeHTML(
            program.nama
          )}
        </h4>

        <p class="deskripsi">
          ${escapeHTML(
            program.deskripsi
          )}
        </p>

        <div class="proker-meta">

          <span>
            PJ:
            ${escapeHTML(
              program.penanggungJawab ||
              "-"
            )}
          </span>
          
          <span>
          ${escapeHTML(program.tanggal || "-")}
          </span>

        </div>
      `;


      kartu.appendChild(
        isi
      );

      wrap.appendChild(
        kartu
      );
    }
  );
}


/* ==========================================================================
   5. DOKUMENTASI KEGIATAN
   ========================================================================== */

function renderKegiatan() {
  const wrap =
    kosongkan(
      "kegiatan-list"
    );


  DATA.kegiatan.forEach(
    (kegiatan, index) => {
      if (!wrap) return;


      const item =
        document.createElement(
          "div"
        );

      item.className =
        "kegiatan-item";


      const header =
        document.createElement(
          "div"
        );

      header.className =
        "kegiatan-header";


      const warnaKategori =
        WARNA_KATEGORI[
          kegiatan.kategori
        ] ||
        "#999999";


      header.innerHTML = `
        <div>

          <h4>
            ${escapeHTML(
              kegiatan.judul
            )}
          </h4>

          <div class="kegiatan-meta">

            <span>
             📅
             ${escapeHTML(
               kegiatan.tanggal || "-"
             )},
             ${escapeHTML(
               kegiatan.waktu || ""
             )}
            </span>

            <span>
              📍
              ${escapeHTML(
                kegiatan.lokasi || "-"
              )}
            </span>

            <span
              class="tag-kategori"
              style="background:${warnaKategori}"
            >
              ${escapeHTML(
                kegiatan.kategori
              )}
            </span>

          </div>

        </div>

        <span class="kegiatan-toggle">
          +
        </span>
      `;


      header.addEventListener(
        "click",
        () => {
          item.classList.toggle(
            "terbuka"
          );
        }
      );


      const body =
        document.createElement(
          "div"
        );

      body.className =
        "kegiatan-body";


      const bodyInner =
        document.createElement(
          "div"
        );

      bodyInner.className =
        "kegiatan-body-inner";


      const deskripsi =
        document.createElement(
          "p"
        );

      deskripsi.textContent =
        teks(
          kegiatan.deskripsi
        ).trim();

      bodyInner.appendChild(
        deskripsi
      );


      const daftarFoto =
        arrayAman(
          kegiatan.foto
        );


      if (
        daftarFoto.length > 0
      ) {
        const fotoGrid =
          document.createElement(
            "div"
          );

        fotoGrid.className =
          "kegiatan-foto-grid";


        daftarFoto.forEach(
          (src) => {
            fotoGrid.appendChild(
              elemenFoto(
                src,
                kegiatan.judul
              )
            );
          }
        );


        bodyInner.appendChild(
          fotoGrid
        );
      }


      const testimoni =
        objectAman(
          kegiatan.testimoni
        );


      if (testimoni.isi) {
        const testi =
          document.createElement(
            "div"
          );

        testi.className =
          "testimoni";


        testi.innerHTML = `
          "${escapeHTML(
            testimoni.isi
          )}"

          <span class="siapa">
            —
            ${escapeHTML(
              testimoni.nama ||
              "Warga"
            )}
          </span>
        `;


        bodyInner.appendChild(
          testi
        );
      }


      if (
        kegiatan.videoYoutubeId
      ) {
        const videoWrap =
          document.createElement(
            "div"
          );

        videoWrap.className =
          "video-wrap";


        const iframe =
          document.createElement(
            "iframe"
          );


        iframe.src =
          `https://www.youtube.com/embed/${encodeURIComponent(
            kegiatan.videoYoutubeId
          )}`;


        iframe.title =
          teks(
            kegiatan.judul,
            "Video kegiatan"
          );


        iframe.allowFullscreen =
          true;

        iframe.loading =
          "lazy";


        videoWrap.appendChild(
          iframe
        );

        bodyInner.appendChild(
          videoWrap
        );
      }


      body.appendChild(
        bodyInner
      );


      item.appendChild(
        header
      );

      item.appendChild(
        body
      );


      wrap.appendChild(
        item
      );


      if (index === 0) {
        item.classList.add(
          "terbuka"
        );
      }
    }
  );
}


/* ==========================================================================
   6. GALERI
   ========================================================================== */

function renderGaleri() {
  const grid =
    kosongkan(
      "galeri-grid"
    );

  const filterWrap =
    kosongkan(
      "galeri-filter"
    );


  const kategoriUnik = [
    "Semua",

    ...new Set(
      DATA.galeri
        .map(
          (galeri) =>
            galeri.kategori
        )
        .filter(Boolean)
    ),
  ];


  kategoriUnik.forEach(
    (kategori) => {
      if (!filterWrap) return;


      const button =
        document.createElement(
          "button"
        );

      button.type = "button";


      button.className =
        "filter-btn" +
        (
          kategori === "Semua"
            ? " aktif"
            : ""
        );


      button.textContent =
        kategori;

      button.dataset.kategori =
        kategori;


      button.addEventListener(
        "click",
        () => {

          filterWrap
            .querySelectorAll(
              ".filter-btn"
            )
            .forEach(
              (btn) =>
                btn.classList.remove(
                  "aktif"
                )
            );


          button.classList.add(
            "aktif"
          );


          if (!grid) return;


          grid
            .querySelectorAll(
              ".galeri-foto"
            )
            .forEach(
              (elemen) => {

                const cocok =
                  kategori ===
                    "Semua" ||
                  elemen.dataset
                    .kategori ===
                    kategori;


                elemen.classList.toggle(
                  "galeri-item-sembunyi",
                  !cocok
                );
              }
            );
        }
      );


      filterWrap.appendChild(
        button
      );
    }
  );


  DATA.galeri.forEach(
    (galeri, index) => {

      if (!grid) return;


      const elemen =
        document.createElement(
          "div"
        );

      elemen.className =
        "galeri-foto";


      elemen.dataset.kategori =
        teks(
          galeri.kategori
        );


      elemen.appendChild(
        elemenFoto(
          galeri.src,
          galeri.caption
        )
      );


      const caption =
        document.createElement(
          "div"
        );

      caption.className =
        "galeri-caption";


      caption.textContent =
        teks(
          galeri.caption
        );


      elemen.appendChild(
        caption
      );


      elemen.addEventListener(
        "click",
        () => {
          bukaLightbox(index);
        }
      );


      grid.appendChild(
        elemen
      );
    }
  );
}


/* ==========================================================================
   LIGHTBOX GALERI
   ========================================================================== */

function bukaLightbox(index) {
  const galeri =
    DATA.galeri[index];

  if (!galeri) return;


  const lightbox =
    document.getElementById(
      "lightbox"
    );

  const gambar =
    document.getElementById(
      "lightbox-img"
    );

  const caption =
    document.getElementById(
      "lightbox-caption"
    );


  if (
    !lightbox ||
    !gambar ||
    !caption
  ) {
    return;
  }


  gambar.src =
    teks(galeri.src);

  gambar.alt =
    teks(galeri.caption);


  gambar.onerror = () => {

    gambar.removeAttribute(
      "src"
    );

    gambar.alt =
      "Foto belum tersedia — " +
      teks(galeri.caption);
  };


  caption.textContent =
    teks(galeri.caption);


  lightbox.classList.add(
    "tampil"
  );
}


function tutupLightbox() {
  const lightbox =
    document.getElementById(
      "lightbox"
    );

  if (lightbox) {
    lightbox.classList.remove(
      "tampil"
    );
  }
}


/* ==========================================================================
   7. TEMPAT PENTING
   ========================================================================== */

/*
   Sekolah digabung ke tempat-penting.json.

   Kategori yang digunakan:

   Pemerintahan
   Kesehatan
   Pendidikan
   Umum
*/

const IKON_KATEGORI_TEMPAT = {
  Pemerintahan: "🏛️",
  Kesehatan: "🏥",
  Pendidikan: "🏫",

  "Taman & Ruang Terbuka": "🌳",
  "Pasar & Perdagangan": "🛒",
  "Olahraga & Rekreasi": "⚽",

  SD: "🏫",
  "SMP-SMA": "🏫",
  SMP: "🏫",
  SMK: "🏫",

  Umum: "📍",
};


function renderTempatPenting() {
  const wrap =
    kosongkan(
      "tempat-penting-grid"
    );


  DATA.tempatPenting.forEach(
    (tempat) => {

      if (!wrap) return;


      const kartu =
        document.createElement(
          "a"
        );


      kartu.className =
        "kartu-tempat";


      kartu.href =
        tempat.mapsUrl || "#";


      kartu.target =
        "_blank";


      kartu.rel =
        "noopener noreferrer";


      const ikon =
        IKON_KATEGORI_TEMPAT[
          tempat.kategori
        ] ||
        "📍";


      kartu.innerHTML = `
        <div class="ikon-tempat">
          ${ikon}
        </div>

        <div class="info-tempat">

          <div class="nama-tempat">
            ${escapeHTML(
              tempat.nama
            )}
          </div>

          <div class="kategori-tempat">
            ${escapeHTML(
              tempat.kategori ||
              "Umum"
            )}
          </div>

          ${
            tempat.alamat
              ? `
                <div class="alamat-tempat">
                  ${escapeHTML(
                    tempat.alamat
                  )}
                </div>
              `
              : ""
          }

        </div>

        <div class="panah-tempat">
          ↗
        </div>
      `;


      wrap.appendChild(
        kartu
      );
    }
  );
}


/* ==========================================================================
   8. UMKM
   ========================================================================== */

function renderUMKM() {
  const wrap =
    kosongkan(
      "umkm-grid"
    );


  if (!wrap) return;


  DATA.umkm.forEach(
    (umkm) => {

      const kartu =
        document.createElement(
          "article"
        );


      kartu.className =
        "kartu-umkm";


      const nama =
        teks(
          umkm.nama,
          "UMKM Desa Baron"
        );


      const jenis =
        teks(
          umkm.jenisUsaha ||
          umkm.kategori,
          "-"
        );


      const deskripsi =
        teks(
          umkm.deskripsi,
          "Informasi UMKM belum tersedia."
        );


      const alamat =
        teks(
          umkm.alamat
        ).trim();


      const mapsUrl =
        teks(
          umkm.mapsUrl
        ).trim();


      const foto =
        teks(
          umkm.foto
        ).trim();


      /* --------------------------------------------------------------------
         FOTO UMKM
         -------------------------------------------------------------------- */

      const gambar =
        document.createElement(
          "div"
        );


      gambar.className =
        "gambar-umkm";


      gambar.appendChild(
        elemenFoto(
          foto,
          nama
        )
      );


      kartu.appendChild(
        gambar
      );


      /* --------------------------------------------------------------------
         INFORMASI UMKM
         -------------------------------------------------------------------- */

      const info =
        document.createElement(
          "div"
        );


      info.className =
        "info-umkm";


      info.innerHTML = `
        <span class="kategori-umkm">
          ${escapeHTML(
            jenis
          )}
        </span>

        <h3>
          ${escapeHTML(
            nama
          )}
        </h3>

        <p>
          ${escapeHTML(
            deskripsi
          )}
        </p>

        ${
          alamat
            ? `
              <p class="alamat-umkm">
                ${escapeHTML(
                  alamat
                )}
              </p>
            `
            : ""
        }

        ${
          mapsUrl
            ? `
              <a
                href="${escapeHTML(
                  mapsUrl
                )}"
                target="_blank"
                rel="noopener noreferrer"
                class="tombol-maps"
              >
                Lihat Lokasi ↗
              </a>
            `
            : ""
        }
      `;


      kartu.appendChild(
        info
      );


      wrap.appendChild(
        kartu
      );
    }
  );
}


/* ==========================================================================
   9. KONTAK & LOKASI
   ========================================================================== */

function renderKontak() {
  const k = DATA.kontak;

  isiTeks("kontak-alamat", k.alamat);

  // WhatsApp (bisa lebih dari satu nomor)
  const waWrap = kosongkan("kontak-wa-list");
  arrayAman(k.whatsapp).forEach((wa) => {
    const nomor = normalisasiWhatsApp(wa.nomor);
    if (!nomor || !waWrap) return;
    const link = document.createElement("a");
    link.href = `https://wa.me/${nomor}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = `+${nomor}${wa.keterangan ? " (" + wa.keterangan + ")" : ""}`;
    waWrap.appendChild(link);
  });
  if (waWrap && !waWrap.children.length) waWrap.textContent = "-";

  // Email (bisa lebih dari satu)
  const emailWrap = kosongkan("kontak-email-list");
  arrayAman(k.email).forEach((em) => {
    const alamat = teks(em.email).trim();
    if (!alamat || alamat === "-" || !emailWrap) return;
    const link = document.createElement("a");
    link.href = `mailto:${alamat}`;
    link.textContent = `${alamat}${em.keterangan ? " (" + em.keterangan + ")" : ""}`;
    emailWrap.appendChild(link);
  });
  if (emailWrap && !emailWrap.children.length) emailWrap.textContent = "-";

  isiSrc("peta-kontak", DATA.desa.mapsEmbedUrl);

  // Media sosial: Instagram (bisa lebih dari satu) + TikTok
  const sosial = kosongkan("sosial-links");
  arrayAman(k.instagram).forEach((ig) => {
    const url = teks(ig.url).trim();
    if (!url || url === "-" || !sosial) return;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = ig.keterangan || "Instagram";
    sosial.appendChild(link);
  });

arrayAman(k.tiktok).forEach((tt) => {
  const url = teks(tt.url).trim();

  if (!url || url === "-" || !sosial) return;

  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = tt.keterangan || "TikTok";
  sosial.appendChild(link);
});

  /* ------------------------------------------------------------------------
     QR CODE
     ------------------------------------------------------------------------ */

  const qrcodeWrap = document.getElementById("qrcode");
  const qrUrl = document.getElementById("qr-url");
  if (qrcodeWrap) qrcodeWrap.innerHTML = "";

  if (window.QRCode && qrcodeWrap && k.urlWebsiteIni) {
    new QRCode(qrcodeWrap, {
      text: k.urlWebsiteIni,
      width: 140,
      height: 140,
      colorDark: "#1f4d3a",
      colorLight: "#efe8d8",
    });
    if (qrUrl) qrUrl.textContent = k.urlWebsiteIni;
  }
}


/* ==========================================================================
   FOOTER
   ========================================================================== */

function renderFooter() {

  isiTeks(
    "footer-nama-desa",
    DATA.desa.nama
  );


  isiTeks(
    "footer-tahun",
    new Date().getFullYear()
  );
}


/* ==========================================================================
   NAVIGASI
   ========================================================================== */

function initNav() {

  const toggle =
    document.getElementById(
      "navbar-toggle"
    );


  const menu =
    document.getElementById(
      "navbar-menu"
    );


  if (!toggle || !menu) {
    return;
  }


  toggle.addEventListener(
    "click",
    () => {

      menu.classList.toggle(
        "terbuka"
      );
    }
  );


  menu
    .querySelectorAll("a")
    .forEach(
      (link) => {

        link.addEventListener(
          "click",
          () => {

            menu.classList.remove(
              "terbuka"
            );
          }
        );
      }
    );
}


/* ==========================================================================
   LIGHTBOX EVENT
   ========================================================================== */

function initLightbox() {

  const tombolTutup =
    document.getElementById(
      "lightbox-tutup"
    );


  const lightbox =
    document.getElementById(
      "lightbox"
    );


  if (tombolTutup) {

    tombolTutup.addEventListener(
      "click",
      tutupLightbox
    );
  }


  if (lightbox) {

    lightbox.addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          lightbox
        ) {

          tutupLightbox();
        }
      }
    );
  }


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Escape"
      ) {

        tutupLightbox();
      }
    }
  );
}


/* ==========================================================================
   ERROR HANDLER
   ========================================================================== */

function tampilkanErrorData(
  error
) {

  const detailError =
    escapeHTML(
      error?.message ||
      "Kesalahan tidak diketahui"
    );


  document.body.innerHTML = `

    <div
      style="
        padding:60px 28px;
        font-family:sans-serif;
        max-width:700px;
        margin:0 auto;
        line-height:1.6;
      "
    >

      <h2 style="color:#a6522c;">
        Gagal Memuat Data Website
      </h2>


      <p>
        Pastikan seluruh file JSON
        di folder
        <code>content/</code>
        tersedia dan memiliki format
        JSON yang valid.
      </p>


      <p>
        File yang dibutuhkan:
      </p>


      <ul>

        <li>
          <code>
            content/desa.json
          </code>
        </li>

        <li>
          <code>
            content/perangkat.json
          </code>
        </li>

        <li>
          <code>
            content/kknt.json
          </code>
        </li>

        <li>
          <code>
            content/proker.json
          </code>
        </li>

        <li>
          <code>
            content/kegiatan.json
          </code>
        </li>

        <li>
          <code>
            content/galeri.json
          </code>
        </li>

        <li>
          <code>
            content/tempat-penting.json
          </code>
        </li>

        <li>
          <code>
            content/umkm.json
          </code>
        </li>

        <li>
          <code>
            content/kontak.json
          </code>
        </li>

      </ul>


      <p>

        <strong>
          Detail teknis:
        </strong>

        ${detailError}

      </p>

    </div>
  `;
}


/* ==========================================================================
   INIT WEBSITE
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      DATA =
        await muatData();

    } catch (error) {

      console.error(
        "Gagal memuat data website:",
        error
      );


      tampilkanErrorData(
        error
      );


      return;
    }


    /* ----------------------------------------------------------------------
       RENDER DATA
       ---------------------------------------------------------------------- */

    renderProfil();

    renderPerangkat();

    renderKKNT();

    renderProkerja();

    renderKegiatan();

    renderGaleri();

    renderTempatPenting();

    renderUMKM();

    renderKontak();

    renderFooter();


    /* ----------------------------------------------------------------------
       INITIALIZATION
       ---------------------------------------------------------------------- */

    initNav();

    initLightbox();
  }
);