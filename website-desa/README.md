# Website Profil Desa & Dokumentasi KKNT

Website statis (HTML/CSS/JavaScript, tanpa server tradisional/database sendiri)
untuk profil desa dan dokumentasi kegiatan KKNT — sekarang dilengkapi
**halaman admin (`/admin`)** supaya perangkat desa bisa update konten
langsung dari browser, tanpa perlu edit kode.

## Struktur Folder

```
website-desa/
├── index.html          → struktur halaman (jarang perlu diedit)
├── admin/
│   ├── index.html        → halaman panel admin (CMS)
│   └── config.yml         → pengaturan form admin (jarang perlu diedit)
├── content/
│   └── data.json          → SEMUA KONTEN WEBSITE ADA DI SINI
├── css/
│   └── style.css          → tampilan & warna (jarang perlu diedit)
├── js/
│   └── main.js            → logika render, filter galeri, dll (jarang perlu diedit)
└── assets/
    └── images/             → foto-foto yang diunggah lewat admin akan masuk sini
```

## 🔧 Cara Setup Panel Admin (dilakukan SEKALI oleh yang paham teknis)

Panel admin butuh GitHub + Netlify (bukan drag & drop lagi) supaya perubahan
dari form bisa otomatis tersimpan. Langkah-langkahnya:

1. **Buat repository GitHub** dan upload seluruh folder `website-desa` ke sana.
2. **Buka Netlify** → "Add new site" → "Import an existing project" → pilih
   repo GitHub tadi. Build command dikosongkan saja, publish directory diisi `.`
   (folder utama), karena website ini tidak perlu proses build.
3. Di dashboard situs Netlify → menu **Identity** → klik "Enable Identity".
4. Di menu Identity → **Registration** → atur ke "Invite only" (supaya tidak
   sembarang orang bisa daftar).
5. Di menu Identity → **Services** → aktifkan **Git Gateway**.
6. Kembali ke menu Identity → klik **Invite users** → masukkan email
   perangkat desa yang boleh mengelola website (kepala desa, sekdes, dll).
   Mereka akan menerima email untuk membuat password.
7. Selesai! Sekarang buka `https://nama-situs-kamu.netlify.app/admin/`,
   login pakai email yang diundang, dan form admin siap dipakai.

## ✏️ Cara Update Konten (untuk perangkat desa — tanpa coding)

**Cara termudah — lewat panel admin:**
1. Buka `https://nama-situs-kamu.netlify.app/admin/`
2. Login dengan email & password yang sudah dibuat
3. Pilih bagian yang mau diubah (Profil Desa, Perangkat Desa, Tim KKNT,
   Program Kerja, Dokumentasi Kegiatan, Galeri Foto, atau Kontak & Lokasi)
4. Edit teks, tambah/hapus item pakai tombol "+" dan "Remove", upload foto
   langsung dari komputer/HP
5. Klik **"Publish"** — perubahan otomatis online dalam 1-2 menit

**Cara alternatif — edit file langsung:**
Semua data juga tersimpan di **`content/data.json`**. File ini bisa dibuka
dan diedit manual dengan text editor kalau suatu saat panel admin
bermasalah atau tidak ada akses internet. Formatnya JSON biasa, ikuti pola
yang sudah ada.

### Contoh: ganti nama kepala desa (lewat data.json manual)
Cari bagian `"perangkat"` di `data.json`, ubah teks di antara tanda kutip:
```json
{ "nama": "Bapak Ahmad Sutrisno", "jabatan": "Kepala Desa", ... }
```

### Contoh: tambah kegiatan baru (lewat data.json manual)
Cari bagian `"kegiatan"`, tambahkan blok baru dengan format sama seperti
kegiatan yang sudah ada.

## ⚠️ Catatan Penting

- Setelah perubahan struktur ini, website **tidak bisa lagi dibuka langsung**
  dengan klik dua kali `index.html` — harus lewat server (localhost saat
  development, atau alamat Netlify setelah online). Ini karena `main.js`
  sekarang mengambil data pakai `fetch()`.
- QR code di halaman Kontak butuh `urlWebsiteIni` di `data.json` diisi
  dengan alamat asli setelah website online.
- Kalau kamu TIDAK jadi memakai panel admin dan ingin kembali ke cara
  sederhana (edit file saja, drag & drop ke Netlify), itu tetap bisa —
  tinggal pakai `content/data.json` secara manual dan skip bagian setup
  GitHub/Identity di atas.

## Yang Perlu Diserahkan ke Pihak Desa

- [ ] Seluruh folder `website-desa` (sudah dalam bentuk repo GitHub)
- [ ] File README.md ini
- [ ] Akses ke akun Netlify yang dipakai untuk deploy
- [ ] Email perangkat desa sudah diundang sebagai admin (Identity)
- [ ] Sesi singkat serah terima (15–30 menit) mempraktikkan cara login &
      isi form di `/admin/`
