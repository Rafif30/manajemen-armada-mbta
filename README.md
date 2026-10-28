# Manajemen Armada — Fleet Management Dashboard

Aplikasi frontend untuk memantau armada kendaraan: daftar kendaraan dalam grid card dengan pagination server-side, filter **Rute** dan **Trip** (multi-select dengan infinite scroll), dan popup detail kendaraan lengkap dengan posisi di peta.

Sumber data: [MBTA V3 API](https://api-v3.mbta.com/docs/swagger/index.html) (JSON:API). Tidak ada backend; semua request dilakukan dari browser.

Dokumen kebutuhan dan desain ada di [`document/prd.md`](document/prd.md) dan [`document/design.md`](document/design.md).

## Stack

| Kebutuhan | Pilihan |
|---|---|
| Build tool | Vite 8 |
| UI | React 19 (functional components + hooks) |
| Bahasa | TypeScript `strict` |
| Styling | Tailwind CSS v4 (design token di `src/index.css`) |
| Data fetching | TanStack Query v5 + Axios |
| Peta | Leaflet + react-leaflet, tile OpenStreetMap |
| Tanggal | date-fns (locale `id`) |
| Test | Vitest |

## Cara Menjalankan

Prasyarat: Node.js 20.19 atau lebih baru, npm 10.

```bash
npm install --legacy-peer-deps   # flag diperlukan pada npm 10.8 karena bug resolusi peer-deps opsional vitest
cp .env.example .env             # opsional, isi VITE_MBTA_API_KEY bila punya
npm run dev                      # http://localhost:5173
```

Perintah lain:

```bash
npm run build       # typecheck + build produksi ke dist/
npm run preview     # pratinjau hasil build
npm run test        # unit test (Vitest)
npm run lint        # ESLint
npm run typecheck   # tsc -b
npm run format      # Prettier
```

### Environment variable

| Nama | Wajib | Keterangan |
|---|---|---|
| `VITE_MBTA_API_KEY` | Tidak | Dikirim lewat header `x-api-key`. Tanpa key, MBTA membatasi sekitar 20 request/menit. Daftar gratis di <https://api-v3.mbta.com/register>. |
| `VITE_MBTA_API_BASE_URL` | Tidak | Default `https://api-v3.mbta.com`. |

## Arsitektur

### Alur data

```
UI (komponen) ──> hooks (useVehicles, useVehicle, useRoutesInfinite, useTripsInfinite)
                       │
                       ▼
             TanStack Query (cache, dedupe, status loading/error)
                       │
                       ▼
             api/*.ts (fungsi request)  ──>  Axios instance  ──>  MBTA V3 API
                       │
                       ▼
             lib/mappers.ts (JSON:API → model domain datar)
```

Pemisahan lapisan:

- **`api/`** tahu cara memanggil endpoint dan mengembalikan respons mentah bertipe. Satu Axios instance (`client.ts`) dengan `baseURL`, timeout, header, dan interceptor error.
- **`lib/mappers.ts`** mengubah JSON:API (`data`, `included`, `relationships`) menjadi model domain `Vehicle` dengan `route`, `trip`, dan `stop` sudah tergabung.
- **`hooks/`** menggabungkan TanStack Query dengan fungsi api dan mapper.
- **Komponen** hanya menerima model domain dan tidak mengenal bentuk JSON:API.

### Metode get data

| Kebutuhan | Mekanisme |
|---|---|
| Daftar kendaraan | `useQuery` dengan key `['vehicles', { page, limit, routes, trips }]`, `placeholderData: keepPreviousData` (grid tidak kosong saat pindah halaman), `staleTime` 30 detik. Request: `GET /vehicles?page[limit]&page[offset]&include=route,trip&filter[route]&filter[trip]`. |
| Detail kendaraan | `useQuery` dengan key `['vehicle', id]`. Data dari cache daftar dipakai sebagai `placeholderData` agar popup langsung terisi, lalu `GET /vehicles/{id}?include=route,trip,stop` mengambil data segar. |
| Opsi rute | `useInfiniteQuery` key `['routes', 'options']`, `pageParam` = offset, halaman berikutnya dari `links.next`, `staleTime` 5 menit. |
| Opsi trip | `useInfiniteQuery` key `['trips', 'options', { routes }]`, `GET /trips?filter[route]=...`. Nonaktif bila belum ada rute dipilih, karena MBTA menolak `/trips` tanpa filter (HTTP 400). |

Perubahan filter dan halaman di-debounce 300 ms sebagai satu objek parameter, sehingga tidak ada request dengan kombinasi setengah jadi. `retry` otomatis dimatikan untuk error 4xx (kecuali satu kali untuk 429) dan `refetchOnWindowFocus` dimatikan untuk menghemat kuota rate limit.

### Sumber kebenaran state

| State | Tempat |
|---|---|
| Data server (vehicles, routes, trips) | TanStack Query |
| Filter, pagination, kendaraan yang dibuka | URL query string (`?route=1,Red&trip=...&page=2&limit=12&vehicle=y1234`) lewat `useUrlState` (`useSyncExternalStore` + History API) |
| Dropdown terbuka/tertutup, indeks opsi aktif | State lokal komponen |

URL dipilih sebagai sumber kebenaran filter dan pagination supaya tautan dapat dibagikan, bertahan saat refresh, dan tombol back/forward browser berfungsi. Tidak ada state manager global; kebutuhan aplikasi sudah tercakup oleh TanStack Query dan URL.

### Pagination server-side

- Request memakai `page[limit]` dan `page[offset]` dengan `offset = (page - 1) * limit`.
- MBTA tidak mengirim total data secara eksplisit, hanya `links` (`first`, `prev`, `next`, `last`). Hasil verifikasi langsung terhadap API:
  - `links.last` selalu ada bila ada data dan offset-nya kelipatan `limit`, sehingga **total halaman pasti**: `lastOffset / limit + 1`.
  - **Total item hanya pasti di halaman terakhir** (`offset + jumlah data`). Di halaman lain dipakai perkiraan `lastOffset + limit` dan ditampilkan dengan tanda `±`.
  - Respons kosong mengembalikan `links: null`.
  - Bila `links.last` tidak ada, `links.next` dipakai untuk menentukan ada/tidaknya halaman berikutnya dan rentang ditampilkan sebagai "dari N+ data".
- Logika ini diisolasi di `getPaginationMeta` (`src/lib/pagination.ts`) dan diuji di `pagination.test.ts`.
- Mengubah filter atau jumlah per halaman mengembalikan ke halaman 1.

### Penanganan loading dan error

- Grid: skeleton card saat muat awal; data lama tetap tampil dengan opasitas 60% saat pindah halaman; state kosong dengan tombol "Reset filter"; state error dengan tombol "Coba lagi".
- Dropdown: skeleton 5 baris saat muat awal, baris "Memuat lebih banyak…" saat memuat halaman berikutnya, state kosong, dan error di dalam panel.
- Popup: skeleton pada peta dan field yang belum ada, spinner saat memperbarui, error di dalam popup dengan tombol tutup tetap aktif.
- Semua error Axios diubah oleh interceptor menjadi `AppError` dengan pesan bahasa Indonesia (`src/lib/errors.ts`). Komponen hanya membaca `error.message`.
- Error render tak terduga ditangkap `AppErrorBoundary` di level halaman.

### Struktur berkas

```
src/
  api/          client.ts (axios + interceptor), vehicles.ts, routes.ts, trips.ts
  components/   Badge, Button, Skeleton, Spinner, Modal, ErrorState, EmptyState,
                AppErrorBoundary, AppHeader, icons
  features/
    vehicles/   VehicleGrid, VehicleCard, StatusBadge, VehicleDetailModal, VehicleMap (lazy)
    filters/    MultiSelectDropdown, RouteFilter, TripFilter, FilterChips, FilterToolbar
    pagination/ Pagination, PageSizeSelect
  hooks/        useVehicles, useVehicle, useRoutesInfinite, useTripsInfinite,
                useUrlState, useDebouncedValue, useInView, useNow
  lib/          pagination.ts, mappers.ts, format.ts, status.ts, errors.ts,
                urlState.ts, queryKeys.ts, cn.ts (+ *.test.ts)
  types/        jsonapi.ts (bentuk respons API), domain.ts (model aplikasi)
  App.tsx  main.tsx  index.css (design token Tailwind)
```

### Aksesibilitas

- Card dapat difokus dan dibuka dengan Enter/Spasi.
- Dropdown memakai `role="listbox"` + `aria-multiselectable`, navigasi panah, Home/End, Spasi/Enter untuk memilih, Esc untuk menutup.
- Popup memakai `role="dialog"` + `aria-modal`, fokus terkunci di dalam dialog dan dikembalikan ke card saat ditutup; Esc dan klik overlay menutup.
- Status kendaraan dibedakan oleh teks dan titik warna, bukan warna saja. Nilai mentah API tersedia pada `title`.
- Perubahan rentang data diumumkan lewat `aria-live="polite"`; pesan error memakai `role="alert"`.

## Keterbatasan yang Diketahui

- **Rate limit**: tanpa API key, MBTA membatasi sekitar 20 request/menit. Aplikasi memitigasi dengan cache, `staleTime`, debounce, dan tanpa polling; bila tetap terkena, muncul pesan 429 dengan tombol coba lagi.
- **Data snapshot**: jumlah kendaraan aktif berubah dari waktu ke waktu, sehingga total halaman dapat bergeser antar request.
- **Total item perkiraan**: di luar halaman terakhir, total item ditampilkan sebagai perkiraan (`±`) karena API tidak mengirim jumlah pasti.
- **Filter trip**: daftar trip hanya tersedia setelah memilih rute (batasan endpoint `/trips`). Trip yang dipilih bisa saja sedang tidak dilayani kendaraan mana pun, sehingga grid kosong; gunakan "Reset filter".
