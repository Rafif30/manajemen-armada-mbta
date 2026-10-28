# PRD — Fleet Management Dashboard (Tes Teknis Frontend Engineer Transjakarta)

| | |
|---|---|
| **Versi** | 1.0 |
| **Tipe** | Tes teknis (take-home) |
| **Stack** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Axios, Leaflet |
| **Sumber data** | MBTA V3 API (`https://api-v3.mbta.com`) |
| **Dokumen terkait** | `design.md` (UI/UX dan arsitektur komponen) |

---

## 1. Ringkasan

Aplikasi frontend untuk memantau armada kendaraan. Pengguna dapat melihat daftar kendaraan dalam bentuk card yang dipaginasi, menyaring berdasarkan **Rute** dan **Trip** (multi-select, infinite scroll), dan membuka **popup detail** kendaraan lengkap dengan posisinya di peta.

Data berasal dari MBTA V3 API (JSON:API). Tidak ada backend; semua request dilakukan dari browser.

## 2. Tujuan dan Non-Tujuan

### Tujuan
1. Memenuhi seluruh persyaratan wajib pada dokumen tes (bagian 4 s/d 7).
2. Memenuhi kedua bonus: **TypeScript** dan **peta (Leaflet)**.
3. Kode mudah dijelaskan di video demo: metode get data, library UI, dan mekanisme pagination.
4. Penanganan loading dan error yang konsisten di semua halaman dan popup.

### Non-Tujuan
- Autentikasi, role, atau penyimpanan data pengguna.
- Backend atau proxy sendiri.
- Realtime streaming (SSE). Pembaruan cukup lewat refetch manual / polling ringan (lihat 6.6, opsional).
- Dukungan multi-bahasa. UI berbahasa Indonesia.

## 3. Persona dan Skenario

**Operator armada** (persona tunggal): ingin tahu kendaraan mana yang sedang berjalan, di mana posisinya, dan kapan datanya terakhir diperbarui.

Skenario utama:
1. Operator membuka aplikasi dan melihat grid kendaraan halaman pertama.
2. Operator memilih satu atau lebih rute, lalu satu atau lebih trip, dan grid menyempit sesuai pilihan.
3. Operator mengganti jumlah data per halaman dan berpindah halaman.
4. Operator mengklik card, popup terbuka, menampilkan detail dan lokasi kendaraan di peta.

## 4. Kebutuhan Fungsional

Setiap kebutuhan diberi ID agar bisa dilacak ke checklist penerimaan (bagian 9).

### 4.1 Pengambilan data (FR-1)

| ID | Kebutuhan |
|---|---|
| FR-1.1 | Data kendaraan diambil dari `GET /vehicles`. |
| FR-1.2 | Request menyertakan `include=route,trip` agar nama rute dan trip tersedia tanpa request tambahan per card. |
| FR-1.3 | Semua pemanggilan API lewat satu API client (Axios instance) dengan `baseURL`, timeout, dan header yang seragam. |
| FR-1.4 | Pengambilan, caching, dan status loading/error dikelola TanStack Query (`useQuery`, `useInfiniteQuery`). |
| FR-1.5 | API key MBTA bersifat opsional, dibaca dari `VITE_MBTA_API_KEY` dan dikirim lewat header `x-api-key` bila ada. |

### 4.2 Daftar kendaraan berbentuk Card (FR-2)

| ID | Kebutuhan |
|---|---|
| FR-2.1 | Kendaraan ditampilkan dalam grid card yang responsif (1 kolom di mobile, 2 di tablet, 3 hingga 4 di desktop). |
| FR-2.2 | Setiap card menampilkan: **label kendaraan**, **status saat ini** (`IN_TRANSIT_TO`, `STOPPED_AT`, `INCOMING_AT`), **latitude dan longitude**, dan **waktu update terakhir**. |
| FR-2.3 | Status ditampilkan sebagai badge berwarna dengan teks yang mudah dibaca (contoh: `IN_TRANSIT_TO` menjadi "Dalam perjalanan"), nilai mentah tetap bisa dilihat lewat `title`/tooltip. |
| FR-2.4 | Waktu update ditampilkan dalam zona waktu lokal pengguna, disertai format relatif ("2 menit lalu"). |
| FR-2.5 | Nilai `null` (misalnya label atau koordinat kosong) ditampilkan sebagai "—", tidak merusak layout. |
| FR-2.6 | Card dapat diklik (dan dapat difokus keyboard) untuk membuka popup detail. |

### 4.3 Pagination (FR-3)

| ID | Kebutuhan |
|---|---|
| FR-3.1 | Menampilkan rentang data, contoh: "Menampilkan 1-5 dari 10 data". |
| FR-3.2 | Pilihan jumlah data per halaman (default 12; opsi 6, 12, 24, 48). Mengubah nilai ini kembali ke halaman 1. |
| FR-3.3 | Menampilkan jumlah halaman yang tersedia. |
| FR-3.4 | Tombol pindah halaman: Sebelumnya, Berikutnya, angka halaman (dengan elipsis bila banyak), serta lompat ke halaman pertama dan terakhir. |
| FR-3.5 | Pagination dilakukan **server-side** memakai `page[limit]` dan `page[offset]` (`offset = (page - 1) * limit`). |
| FR-3.6 | Mengubah filter mengembalikan halaman ke 1. |
| FR-3.7 | Perpindahan halaman tidak mengosongkan grid; data lama tetap tampil sampai data baru siap (`placeholderData: keepPreviousData`). |

### 4.4 Filter Rute dan Trip (FR-4)

| ID | Kebutuhan |
|---|---|
| FR-4.1 | Filter **Rute** dan **Trip** berbentuk dropdown. |
| FR-4.2 | Keduanya **multi-select**; pilihan ditampilkan sebagai chip dan dapat dihapus satu per satu atau sekaligus ("Hapus semua"). |
| FR-4.3 | Daftar opsi dimuat bertahap dengan **infinite scroll** (`useInfiniteQuery` + `IntersectionObserver` pada elemen sentinel di dasar daftar). |
| FR-4.4 | Data rute dari `GET /routes`, data trip dari `GET /trips`, keduanya dengan `page[limit]` dan `page[offset]`. |
| FR-4.5 | Pilihan rute dikirim sebagai `filter[route]=A,B,C`; pilihan trip sebagai `filter[trip]=X,Y` (nilai dipisah koma). |
| FR-4.6 | Daftar trip menyesuaikan rute terpilih: bila ada rute dipilih, `GET /trips` memakai `filter[route]` yang sama. Bila trip yang sudah dipilih tidak lagi relevan setelah rute berubah, trip tersebut dihapus dari pilihan. |
| FR-4.7 | Dropdown memiliki loading indicator pada pemuatan awal dan saat memuat halaman berikutnya, serta state kosong dan state error dengan tombol coba lagi. |
| FR-4.8 | State filter dan pagination disinkronkan ke URL query string (`?route=...&trip=...&page=2&limit=12`) agar dapat dibagikan dan bertahan saat refresh. |

### 4.5 Popup detail kendaraan (FR-5)

| ID | Kebutuhan |
|---|---|
| FR-5.1 | Popup (modal dialog) menampilkan: label kendaraan, status saat ini, latitude dan longitude, waktu update terakhir, data rute, data trip. |
| FR-5.2 | Data lain yang dianggap perlu: `bearing` (arah), `speed`, `direction_id`, `occupancy_status`, `current_stop_sequence`, dan nama stop (`include=stop`) bila tersedia. Field yang `null` disembunyikan atau ditulis "—". |
| FR-5.3 | **Bonus**: peta Leaflet dengan satu marker di posisi kendaraan, popup marker berisi label kendaraan. |
| FR-5.4 | Popup mengambil data segar lewat `GET /vehicles/{id}?include=route,trip,stop`, ditampilkan dengan loading indicator. Data dari list dipakai sebagai placeholder awal agar popup tidak kosong. |
| FR-5.5 | Popup dapat ditutup dengan tombol tutup, tombol `Esc`, dan klik pada overlay. Fokus dikembalikan ke card yang membukanya. |
| FR-5.6 | Bila kendaraan tidak punya koordinat, peta diganti pesan "Lokasi belum tersedia". |

## 5. Kebutuhan Non-Fungsional

| ID | Kebutuhan |
|---|---|
| NFR-1 | **Loading**: setiap halaman dan popup yang melakukan fetching menampilkan indikator loading (skeleton untuk grid dan popup, spinner kecil untuk dropdown dan refetch). |
| NFR-2 | **Error**: pesan error berbahasa Indonesia yang dapat dipahami (lihat tabel 6.4), dengan tombol "Coba lagi". Tidak menampilkan stack trace atau pesan mentah dari server. |
| NFR-3 | **TypeScript** mode `strict`; tidak ada `any` pada kode aplikasi. |
| NFR-4 | **Responsif** dari lebar 360px hingga desktop. |
| NFR-5 | **Aksesibilitas dasar**: elemen interaktif dapat diakses keyboard, dialog memakai `role="dialog"` dan `aria-modal`, kontras teks memenuhi WCAG AA. |
| NFR-6 | **Performa**: tidak ada request ganda untuk query yang sama (dedupe TanStack Query), `staleTime` 30 detik untuk kendaraan dan 5 menit untuk rute/trip. |
| NFR-7 | **Rate limit**: aplikasi tetap berfungsi pada batas request API (lihat risiko R-2). |
| NFR-8 | Komponen berupa functional component dan hooks; tidak ada class component. |

## 6. Spesifikasi Teknis

### 6.1 Stack dan alasan pemilihan

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| Build tool | Vite | Setup cepat untuk React + TS, env var via `import.meta.env`. |
| UI | React 18 (functional components + hooks) | Diwajibkan oleh tes. |
| Bahasa | TypeScript (strict) | Bonus. |
| Styling | Tailwind CSS | Diwajibkan oleh tes. |
| Data fetching | TanStack Query v5 + Axios | Caching, dedupe, status loading/error, `useInfiniteQuery` untuk dropdown. |
| Peta | Leaflet + react-leaflet, tile OpenStreetMap | Bonus; gratis dan tanpa API key. |
| Tanggal | `date-fns` (atau `Intl` bawaan) | Format waktu lokal dan relatif. |

### 6.2 Endpoint yang dipakai

| Kegunaan | Request |
|---|---|
| Daftar kendaraan | `GET /vehicles?page[limit]=12&page[offset]=0&include=route,trip&filter[route]=...&filter[trip]=...` |
| Detail kendaraan | `GET /vehicles/{id}?include=route,trip,stop` |
| Opsi rute (infinite) | `GET /routes?page[limit]=20&page[offset]=0` |
| Opsi trip (infinite) | `GET /trips?page[limit]=20&page[offset]=0&filter[route]=...` |

Atribut kendaraan yang dipakai: `label`, `current_status`, `latitude`, `longitude`, `updated_at`, `bearing`, `speed`, `direction_id`, `occupancy_status`, `current_stop_sequence`.

### 6.3 Pagination dan total data

MBTA memakai pagination offset. Respons memuat `links` (`first`, `prev`, `next`, `last`) dan tidak dijamin menyertakan total data secara eksplisit. Strategi:

1. Hitung `totalItems` dari offset pada `links.last` ditambah jumlah data pada halaman terakhir. Bila hanya offset yang tersedia, `totalItems` diperkirakan dari `lastOffset + limit` lalu dikoreksi saat pengguna mencapai halaman terakhir.
2. Bila `links.last` tidak ada, gunakan `links.next` untuk menentukan apakah masih ada halaman berikutnya, dan tampilkan rentang tanpa total pasti ("Menampilkan 13-24 dari 24+ data").
3. Logika ini diisolasi di satu fungsi (`getPaginationMeta`) dan diuji dengan unit test supaya perilakunya terdokumentasi.

> **Perlu diverifikasi sebelum implementasi**: bentuk persis `links` dan `meta` pada respons `/vehicles`. Cek langsung dengan satu request di Swagger atau `curl` saat mulai coding, lalu sesuaikan fungsi di atas.

### 6.4 Pemetaan error ke pesan pengguna

| Kondisi | Pesan untuk pengguna |
|---|---|
| Tidak ada koneksi / network error | "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi." |
| Timeout | "Server terlalu lama merespons. Silakan coba lagi." |
| 400 | "Permintaan tidak valid. Coba ubah filter yang dipilih." |
| 403 | "Akses ditolak oleh server data. Periksa API key Anda." |
| 404 (detail kendaraan) | "Kendaraan ini sudah tidak aktif atau tidak ditemukan." |
| 429 | "Terlalu banyak permintaan. Tunggu beberapa saat lalu coba lagi." |
| 5xx | "Server data sedang bermasalah. Silakan coba beberapa saat lagi." |
| Data kosong (200 tanpa hasil) | "Tidak ada kendaraan yang cocok dengan filter ini." (bukan error; sertakan tombol "Reset filter") |

### 6.5 Query keys

```ts
['vehicles', { page, limit, routes, trips }]
['vehicle', id]
['routes', 'options']            // useInfiniteQuery
['trips', 'options', { routes }] // useInfiniteQuery
```

### 6.6 Opsional (jika waktu cukup)

- Polling ringan pada daftar kendaraan (`refetchInterval: 30_000`) dengan tombol jeda, serta tombol "Segarkan" manual dan indikator "Terakhir diperbarui".
- Dark mode. Tidak dikerjakan secara default karena arah UI yang dipilih adalah tema biru/oranye.

## 7. Penyerahan (Deliverables)

| Item | Ketentuan |
|---|---|
| Repositori | GitHub, **public**. |
| `README.md` | Cara menjalankan aplikasi (prasyarat, `npm install`, env var, `npm run dev`, `npm run build`) dan penjelasan singkat arsitektur. |
| Video demo | 5 hingga 10 menit. |

### 7.1 Panduan isi video demo

Video wajib menjelaskan tiga hal. Usulan alur (total sekitar 8 menit):

| Menit | Konten |
|---|---|
| 0:00 - 0:45 | Pengantar singkat dan demo aplikasi dari sisi pengguna (grid, filter, pagination, popup, peta). |
| 0:45 - 3:30 | **Metode get data**: API client Axios, TanStack Query (`useQuery` untuk daftar dan detail, `useInfiniteQuery` untuk dropdown), query key, `placeholderData`, caching dan `staleTime`, parameter `filter[...]`, `page[...]`, `include`. Tunjukkan satu request di tab Network. |
| 3:30 - 5:30 | **Pembuatan UI**: React functional components dan hooks, struktur komponen, Tailwind (design token pada tema, responsif), Leaflet untuk peta, pola loading dan error. |
| 5:30 - 7:30 | **Pagination**: server-side dengan `page[limit]` dan `page[offset]`, cara menghitung total halaman dari `links`, reset ke halaman 1 saat filter berubah, sinkronisasi ke URL. |
| 7:30 - 8:00 | Penutup: keputusan desain yang diambil dan hal yang akan ditingkatkan. |

## 8. Struktur Proyek (ringkas)

Detail komponen dan arsitektur ada di `design.md`.

```
src/
  api/          # axios client, fungsi request per resource
  components/   # UI umum (Badge, Skeleton, Spinner, Modal, ErrorState)
  features/
    vehicles/   # VehicleGrid, VehicleCard, VehicleDetailModal, VehicleMap
    filters/    # MultiSelectDropdown, RouteFilter, TripFilter
    pagination/ # Pagination, PageSizeSelect
  hooks/        # useVehicles, useVehicle, useRoutesInfinite, useTripsInfinite, useUrlState
  lib/          # format tanggal, mapping status, mapping error, getPaginationMeta
  types/        # tipe JSON:API dan domain
```

## 9. Kriteria Penerimaan (Checklist)

**Wajib**
- [ ] Data kendaraan diambil dari REST API MBTA (FR-1)
- [ ] Card menampilkan label, status, lat/long, waktu update terakhir (FR-2.2)
- [ ] Pagination: rentang data, pilihan jumlah per halaman, jumlah halaman, tombol pindah halaman (FR-3.1 s/d FR-3.4)
- [ ] Filter Rute dan Trip berbentuk dropdown (FR-4.1)
- [ ] Opsi rute dan trip dimuat dengan infinite scroll / lazy load (FR-4.3)
- [ ] Rute dan trip dapat dipilih lebih dari satu (FR-4.2)
- [ ] Detail kendaraan berbentuk popup dengan field yang diminta (FR-5.1)
- [ ] Setiap halaman dan popup menampilkan loading indicator saat fetching (NFR-1)
- [ ] Pesan error mudah dipahami (NFR-2)
- [ ] Memakai React functional components dan hooks, serta Tailwind (NFR-8)

**Bonus**
- [ ] Peta posisi kendaraan dengan Leaflet (FR-5.3)
- [ ] TypeScript (NFR-3)

**Penyerahan**
- [ ] Repo GitHub public
- [ ] README berisi cara menjalankan dan penjelasan arsitektur
- [ ] Video demo 5 hingga 10 menit yang menjelaskan metode get data, UI, dan pagination

## 10. Risiko dan Asumsi

| ID | Risiko / asumsi | Mitigasi |
|---|---|---|
| R-1 | Respons `/vehicles` mungkin tidak memuat total data secara eksplisit. | Strategi 6.3, diverifikasi di awal pengerjaan. |
| R-2 | Tanpa API key, MBTA membatasi jumlah request per menit (sekitar 20 per menit pada dokumentasi publiknya; verifikasi angka terbaru). Dropdown infinite scroll dan perubahan filter cepat dapat memicu 429. | Caching dan `staleTime`, dedupe, tidak ada polling default, dukungan `VITE_MBTA_API_KEY`, pesan error 429 yang jelas, dan debounce 300 ms pada perubahan filter. |
| R-3 | `GET /trips` dapat berisi sangat banyak trip, termasuk trip yang tidak sedang dilayani kendaraan mana pun, sehingga filter trip bisa menghasilkan grid kosong. | Daftar trip dipersempit oleh rute terpilih (FR-4.6), state kosong disertai tombol reset filter. Perilaku endpoint `/trips` tanpa filter perlu dicek di awal; bila API menolaknya, dropdown trip dinonaktifkan sampai satu rute dipilih. |
| R-4 | Jumlah kendaraan aktif berubah dari waktu ke waktu, jadi total halaman dapat bergeser antar request. | Dokumentasikan di README bahwa data bersifat snapshot per request. |
| R-5 | Ikon marker bawaan Leaflet tidak termuat pada bundler Vite. | Impor aset ikon secara eksplisit dan atur `L.Icon.Default`; panggil `invalidateSize()` saat modal selesai dibuka. |
| R-6 | Tes meminta tampilan "Menampilkan 1-5 dari 10 Data". Bila total tidak diketahui pasti, teks tidak bisa persis seperti contoh. | Gunakan format "dari N+ data" pada kondisi di 6.3 poin 2. |
| A-1 | Aplikasi hanya dipakai di browser modern (Chrome, Firefox, Safari, Edge versi terbaru). | — |
| A-2 | Zona waktu tampilan mengikuti zona waktu perangkat pengguna. | — |

## 11. Rencana Pengerjaan

| Tahap | Cakupan |
|---|---|
| 1. Setup | Vite + React + TS, Tailwind, ESLint/Prettier, TanStack Query, Axios client, token tema. Verifikasi bentuk respons API (R-1, R-3). |
| 2. Daftar kendaraan | `useVehicles`, VehicleCard, VehicleGrid, skeleton, error state. |
| 3. Pagination | Komponen pagination, `getPaginationMeta`, sinkronisasi URL. |
| 4. Filter | MultiSelectDropdown generik, infinite scroll route dan trip, hubungan trip terhadap rute. |
| 5. Popup dan peta | Modal, `useVehicle`, VehicleMap (Leaflet), state loading dan error popup. |
| 6. Penyempurnaan | Responsif, aksesibilitas, unit test fungsi util, README. |
| 7. Penyerahan | Rekam video demo (7.1), push ke repo public, cek checklist bagian 9. |
