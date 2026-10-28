# Design — Fleet Management Dashboard

Dokumen ini menjelaskan desain UI/UX dan arsitektur komponen. Kebutuhan fungsional ada di `prd.md`; ID seperti FR-2.2 merujuk ke dokumen tersebut.

> Palet di bawah **terinspirasi** dari nuansa biru dan oranye Transjakarta, bukan nilai resmi brand. Bila ingin lebih akurat, ganti nilai hex pada bagian 2.1 dengan warna dari panduan identitas resmi; seluruh komponen memakai token, jadi cukup mengubah satu tempat.

---

## 1. Prinsip Desain

1. **Informasi dulu**: data kendaraan adalah isi utama; dekorasi seminimal mungkin.
2. **Status terbaca sekilas**: status kendaraan memakai warna dan teks, tidak bergantung pada warna saja.
3. **Tidak ada layar kosong**: setiap kondisi (loading, kosong, error) punya tampilan sendiri.
4. **Satu pola untuk satu masalah**: dropdown, badge, error, dan skeleton memakai komponen yang sama di semua tempat.

## 2. Design Tokens

### 2.1 Warna

| Token | Hex | Pemakaian |
|---|---|---|
| `primary-50` | `#EFF6FF` | Latar chip, hover ringan |
| `primary-100` | `#DBEAFE` | Latar chip terpilih |
| `primary-500` | `#2563EB` | Fokus ring, link |
| `primary-600` | `#1D4ED8` | Tombol utama |
| `primary-700` | `#1E40AF` | Hover tombol utama |
| `primary-900` | `#0F2A5C` | Header, teks judul |
| `accent-400` | `#FB923C` | Aksen, indikator aktif |
| `accent-500` | `#F97316` | Tombol sekunder, badge aksen |
| `accent-600` | `#EA580C` | Hover aksen |
| `neutral-50` | `#F8FAFC` | Latar halaman |
| `neutral-200` | `#E2E8F0` | Border |
| `neutral-500` | `#64748B` | Teks sekunder |
| `neutral-900` | `#0F172A` | Teks utama |
| `success-600` | `#16A34A` | Status berjalan |
| `danger-600` | `#DC2626` | Error |
| `warning-500` | `#EAB308` | Peringatan |

Aturan kontras: teks putih hanya di atas `primary-600` ke atas dan `accent-600` ke atas. Teks di atas `accent-500` memakai `neutral-900`.

Konfigurasi Tailwind v4 (`src/index.css`):

```css
@import "tailwindcss";

@theme {
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-500: #2563EB;
  --color-primary-600: #1D4ED8;
  --color-primary-700: #1E40AF;
  --color-primary-900: #0F2A5C;
  --color-accent-400: #FB923C;
  --color-accent-500: #F97316;
  --color-accent-600: #EA580C;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}
```

Bila memakai Tailwind v3, pindahkan nilai yang sama ke `theme.extend.colors` pada `tailwind.config.ts`.

### 2.2 Tipografi

| Peran | Kelas Tailwind |
|---|---|
| Judul halaman | `text-2xl font-semibold text-primary-900` |
| Judul card / popup | `text-lg font-semibold` |
| Label field | `text-xs font-medium uppercase tracking-wide text-neutral-500` |
| Nilai field | `text-sm text-neutral-900` |
| Koordinat | `font-mono text-sm tabular-nums` |

### 2.3 Spasi, radius, bayangan

- Skala spasi: kelipatan 4px (`p-4`, `gap-4`, `gap-6`).
- Radius: card dan popup `rounded-xl`, input dan tombol `rounded-lg`, badge `rounded-full`.
- Bayangan: card `shadow-sm`, hover `shadow-md`, popup `shadow-xl`.

## 3. Layout Halaman

```
┌──────────────────────────────────────────────────────────┐
│ Header: logo/judul "Manajemen Armada"      [Segarkan]     │  bg-primary-900, strip aksen accent-500
├──────────────────────────────────────────────────────────┤
│ Toolbar filter                                            │
│  [Rute ▾]  [Trip ▾]            Chip terpilih…  [Reset]    │
├──────────────────────────────────────────────────────────┤
│ Grid kendaraan                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │
│  │ Card   │ │ Card   │ │ Card   │ │ Card   │             │
│  └────────┘ └────────┘ └────────┘ └────────┘             │
├──────────────────────────────────────────────────────────┤
│ Pagination                                                │
│  Menampilkan 1-12 dari 48 data   [12 ▾] per halaman       │
│  Halaman 1 dari 4     « ‹ 1 2 3 4 › »                     │
└──────────────────────────────────────────────────────────┘
```

Breakpoint grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`.
Konten dibatasi `max-w-7xl mx-auto px-4 sm:px-6`.

Pada mobile, toolbar filter menumpuk vertikal, dan pagination dipecah menjadi dua baris (info di atas, kontrol di bawah).

## 4. Komponen

### 4.1 VehicleCard (FR-2)

```
┌──────────────────────────────┐
│ Bus 1234            [● Dalam │
│                      perjalanan]
│ ──────────────────────────── │
│ LATITUDE        LONGITUDE     │
│ -6.208763       106.845599    │
│ ──────────────────────────── │
│ Diperbarui                    │
│ 27 Okt 2026, 14:05 · 2 mnt lalu│
└──────────────────────────────┘
```

- Elemen: `<button>` penuh (atau `<article>` dengan `tabIndex=0` dan `onKeyDown` Enter/Spasi) agar dapat difokus.
- Kelas dasar: `rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500`.
- Baris atas: label di kiri (`text-lg font-semibold`), badge status di kanan.
- Koordinat dalam dua kolom, 6 digit desimal, font mono.
- Nilai kosong ditulis "—".

### 4.2 StatusBadge

| Nilai API | Teks | Warna |
|---|---|---|
| `IN_TRANSIT_TO` | Dalam perjalanan | `bg-green-100 text-green-800` + titik hijau |
| `STOPPED_AT` | Berhenti di halte | `bg-orange-100 text-orange-800` + titik oranye |
| `INCOMING_AT` | Akan tiba | `bg-blue-100 text-blue-800` + titik biru |
| lainnya / `null` | Tidak diketahui | `bg-slate-100 text-slate-700` |

Badge selalu memuat teks, bukan hanya warna. Nilai mentah dari API tersedia di atribut `title`.

### 4.3 MultiSelectDropdown (FR-4)

Komponen generik dipakai oleh filter Rute dan Trip.

Props (ringkas):

```ts
interface MultiSelectDropdownProps<T> {
  label: string;                       // "Rute" | "Trip"
  options: { value: string; label: string; hint?: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  onReachEnd: () => void;              // dipanggil saat sentinel terlihat
  hasMore: boolean;
  isLoading: boolean;                  // muat awal
  isFetchingMore: boolean;             // muat halaman berikutnya
  error?: string;
  onRetry?: () => void;
  disabled?: boolean;
}
```

Perilaku:

- Tombol pemicu menampilkan label dan jumlah terpilih: "Rute (2)".
- Panel daftar: `max-h-72 overflow-y-auto`, setiap baris berupa checkbox + teks.
- Sentinel `<div ref={sentinelRef} />` di dasar daftar diamati `IntersectionObserver` (root = panel). Saat terlihat dan `hasMore && !isFetchingMore`, panggil `onReachEnd`.
- Baris loading di dasar saat `isFetchingMore`: spinner + "Memuat lebih banyak…".
- Kondisi lain: skeleton 5 baris saat `isLoading`; "Tidak ada data" bila kosong; pesan error + tombol "Coba lagi" bila `error`.
- Chip pilihan tampil di bawah toolbar; setiap chip punya tombol hapus (`aria-label="Hapus Rute 1"`).
- Penutupan: klik di luar, `Esc`. Navigasi daftar dengan panah atas/bawah dan Spasi untuk memilih.
- Aksesibilitas: `role="listbox"` dengan `aria-multiselectable="true"`, opsi `role="option"` dan `aria-selected`.

Filter Trip nonaktif sementara (`disabled`) bila diputuskan demikian pada risiko R-3 di PRD, dengan teks bantuan "Pilih rute terlebih dahulu".

### 4.4 Pagination (FR-3)

```
Menampilkan 1-12 dari 48 data        Per halaman [12 ▾]
Halaman 1 dari 4          [«] [‹] 1 2 3 … 4 [›] [»]
```

- Kiri: teks rentang. Kanan: select jumlah per halaman (6, 12, 24, 48).
- Tombol halaman aktif: `bg-primary-600 text-white`; lainnya `border border-neutral-200 hover:bg-primary-50`.
- Tombol nonaktif: `opacity-50 cursor-not-allowed` dan atribut `disabled`.
- Elipsis muncul bila halaman lebih dari 7.
- Saat perpindahan halaman (data lama masih tampil), tampilkan spinner kecil di sebelah teks rentang dan kurangi opasitas grid menjadi 60%.
- Bila total tidak pasti (PRD 6.3 poin 2): "Menampilkan 13-24 dari 24+ data" dan tombol "»" disembunyikan.

### 4.5 VehicleDetailModal (FR-5)

```
┌──────────────────────────────────────────────┐
│ Bus 1234                  [Dalam perjalanan] ✕│
├──────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │
│ │                 PETA LEAFLET              │ │  h-56 sm:h-72
│ └──────────────────────────────────────────┘ │
│  LATITUDE  -6.208763     LONGITUDE 106.845599 │
│  DIPERBARUI  27 Okt 2026, 14:05 (2 mnt lalu)  │
│  ─────────────────────────────────────────── │
│  RUTE   Koridor 1 — Blok M - Kota             │
│  TRIP   Trip 5a-1234 (Arah 0)                 │
│  ─────────────────────────────────────────── │
│  ARAH 90°    KECEPATAN 12 m/s    OKUPANSI Sepi│
│  STOP BERIKUTNYA  Halte Bundaran HI           │
│                                    [Tutup]    │
└──────────────────────────────────────────────┘
```

> Contoh isi di atas hanya ilustrasi tata letak; nilai nyata berasal dari MBTA API.

- Struktur: overlay `fixed inset-0 bg-slate-900/50`, panel `max-w-2xl rounded-xl bg-white shadow-xl`, pada mobile menjadi `bottom sheet` penuh lebar.
- Atribut: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` ke judul. Fokus dipindahkan ke tombol tutup saat terbuka, dikembalikan ke card saat tertutup; fokus terkunci di dalam dialog.
- Gulir latar dikunci (`overflow-hidden` pada `body`) selama popup terbuka.
- Data awal diisi dari list (placeholder), lalu diperbarui dari `GET /vehicles/{id}`.
- Group "Data lain": arah (`bearing`), kecepatan, `direction_id`, okupansi, stop berikutnya. Field `null` tidak dirender.

#### Peta (VehicleMap)

- `react-leaflet`: `MapContainer`, `TileLayer` (OpenStreetMap), satu `Marker`.
- Zoom awal 15, pusat di koordinat kendaraan. Popup marker berisi label kendaraan.
- Panggil `map.invalidateSize()` setelah modal selesai transisi agar tile tidak terpotong.
- Atribusi OpenStreetMap ditampilkan (kewajiban lisensi tile).
- Impor CSS Leaflet (`leaflet/dist/leaflet.css`) dan perbaiki URL ikon marker bawaan untuk Vite.
- Tanpa koordinat: ganti peta dengan kotak abu-abu bertuliskan "Lokasi belum tersedia".
- Pemuatan peta secara lazy (`React.lazy` + `Suspense`) agar bundle awal tidak membengkak.

## 5. State UI

Setiap area punya empat state yang sama polanya.

| Area | Loading | Kosong | Error | Berhasil |
|---|---|---|---|---|
| Grid kendaraan | 12 skeleton card (jumlah mengikuti `limit`) | Ilustrasi sederhana + "Tidak ada kendaraan yang cocok dengan filter ini." + tombol "Reset filter" | Kotak error + pesan (PRD 6.4) + "Coba lagi" | Grid card |
| Pagination | Disembunyikan saat muat awal; spinner kecil saat pindah halaman | Disembunyikan | Disembunyikan | Tampil |
| Dropdown filter | 5 baris skeleton; spinner di dasar daftar | "Tidak ada data" | Pesan + "Coba lagi" di dalam panel | Daftar opsi |
| Popup | Skeleton pada peta dan field (data list tetap tampil sebagai placeholder bila ada) | — | Pesan error di dalam popup + "Coba lagi"; tombol tutup tetap aktif | Konten lengkap |

Komponen bersama:

- `Skeleton`: `animate-pulse rounded bg-slate-200`.
- `Spinner`: SVG berputar, `text-primary-600`.
- `ErrorState`: ikon, judul singkat, pesan, tombol "Coba lagi"; `role="alert"`.
- `EmptyState`: ikon, pesan, aksi opsional.

## 6. Arsitektur Frontend

### 6.1 Alur data

```
UI (komponen) ──> hooks (useVehicles, useVehicle, useRoutesInfinite, useTripsInfinite)
                       │
                       ▼
             TanStack Query (cache, dedupe, status)
                       │
                       ▼
             api/*.ts (fungsi request)  ──>  axios instance  ──>  MBTA V3 API
                       │
                       ▼
             lib/mappers (JSON:API → model domain)
```

Pemisahan lapisan:

- **api/**: tahu cara memanggil endpoint dan mengembalikan respons mentah bertipe.
- **lib/mappers**: mengubah respons JSON:API (`data`, `included`, `relationships`) menjadi model domain datar (`Vehicle` dengan `route` dan `trip` sudah tergabung).
- **hooks/**: menggabungkan TanStack Query dengan fungsi api dan mapper.
- **komponen**: hanya menerima model domain, tidak mengenal bentuk JSON:API.

### 6.2 Tipe inti

```ts
export type VehicleStatus = 'IN_TRANSIT_TO' | 'STOPPED_AT' | 'INCOMING_AT';

export interface Vehicle {
  id: string;
  label: string | null;
  status: VehicleStatus | null;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string;               // ISO 8601
  bearing: number | null;
  speed: number | null;
  directionId: 0 | 1 | null;
  occupancyStatus: string | null;
  currentStopSequence: number | null;
  route: { id: string; name: string } | null;
  trip: { id: string; headsign: string | null } | null;
  stop: { id: string; name: string } | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number | null;       // null bila tidak diketahui
  totalPages: number | null;
  from: number;
  to: number;
  hasNext: boolean;
}
```

### 6.3 Hooks utama

| Hook | Mekanisme | Catatan |
|---|---|---|
| `useVehicles({ page, limit, routes, trips })` | `useQuery`, `placeholderData: keepPreviousData` | `staleTime` 30 dtk |
| `useVehicle(id)` | `useQuery`, `enabled: !!id`, `initialData` dari list | Untuk popup |
| `useRoutesInfinite()` | `useInfiniteQuery`, `pageParam` = offset | `getNextPageParam` dari `links.next` |
| `useTripsInfinite({ routes })` | `useInfiniteQuery` | Query key memuat `routes`, `staleTime` 5 mnt |
| `useUrlState()` | Membaca/menulis `routes`, `trips`, `page`, `limit` ke `URLSearchParams` | Sumber kebenaran tunggal untuk filter dan pagination |
| `useDebouncedValue(value, 300)` | Menunda perubahan filter | Mengurangi request (risiko R-2 di PRD) |

### 6.4 Pembagian state

| State | Tempat |
|---|---|
| Data server (vehicles, routes, trips) | TanStack Query |
| Filter dan pagination | URL query string (`useUrlState`) |
| Kendaraan yang sedang dibuka di popup | State lokal pada halaman (`selectedVehicleId`), atau `?vehicle=ID` di URL bila ingin tautan langsung ke popup |
| Dropdown terbuka/tertutup | State lokal komponen |

Tidak memakai state manager global (Redux/Zustand); kebutuhan aplikasi sudah tercakup oleh TanStack Query dan URL state.

### 6.5 Penanganan error terpusat

- Interceptor Axios mengubah error menjadi `AppError { kind, status?, message }` dengan `message` berbahasa Indonesia sesuai tabel PRD 6.4.
- Komponen hanya membaca `error.message`; tidak ada pemetaan status di komponen.
- Error render tak terduga ditangkap `ErrorBoundary` di level halaman dengan tampilan `ErrorState` dan tombol muat ulang.

### 6.6 Struktur berkas

```
src/
  api/
    client.ts              # axios instance + interceptor
    vehicles.ts            # getVehicles, getVehicle
    routes.ts              # getRoutes
    trips.ts               # getTrips
  components/
    Badge.tsx  Skeleton.tsx  Spinner.tsx  Modal.tsx
    ErrorState.tsx  EmptyState.tsx  ErrorBoundary.tsx
  features/
    vehicles/
      VehicleGrid.tsx  VehicleCard.tsx  StatusBadge.tsx
      VehicleDetailModal.tsx  VehicleMap.tsx
    filters/
      MultiSelectDropdown.tsx  RouteFilter.tsx  TripFilter.tsx  FilterChips.tsx
    pagination/
      Pagination.tsx  PageSizeSelect.tsx
  hooks/
    useVehicles.ts  useVehicle.ts  useRoutesInfinite.ts
    useTripsInfinite.ts  useUrlState.ts  useDebouncedValue.ts  useInView.ts
  lib/
    mappers.ts  pagination.ts  format.ts  status.ts  errors.ts
  types/
    jsonapi.ts  domain.ts
  App.tsx  main.tsx  index.css
```

## 7. Interaksi dan Alur

1. **Muat awal**: URL dibaca → `useVehicles` jalan → grid menampilkan skeleton → card muncul.
2. **Ubah filter**: pilihan disimpan ke URL → `page` direset ke 1 → query key berubah → grid tetap menampilkan data lama dengan opasitas turun sampai data baru tiba.
3. **Ubah rute**: pilihan trip yang tidak relevan dihapus, daftar trip dimuat ulang dari awal.
4. **Gulir dropdown**: sentinel terlihat → `fetchNextPage` → baris loading di dasar → opsi baru ditambahkan tanpa menggeser posisi gulir.
5. **Buka popup**: klik card → popup terbuka dengan data list → `useVehicle` memuat data segar (skeleton pada field yang belum ada) → peta muncul.
6. **Tutup popup**: `Esc`, overlay, atau tombol tutup → fokus kembali ke card.

## 8. Responsif

| Lebar | Perilaku |
|---|---|
| < 640px | Grid 1 kolom; filter bertumpuk; popup berupa bottom sheet; pagination dua baris, nomor halaman diringkas (sebelumnya, "Halaman X dari Y", berikutnya). |
| 640–1023px | Grid 2 kolom; filter satu baris. |
| 1024–1279px | Grid 3 kolom. |
| ≥ 1280px | Grid 4 kolom. |

Target sentuh minimum 40×40px untuk tombol dan baris dropdown.

## 9. Aksesibilitas

- Semua kontrol dapat dioperasikan keyboard; urutan fokus mengikuti urutan visual.
- Indikator fokus terlihat (`focus-visible:ring-2 ring-primary-500`).
- Status tidak hanya dibedakan oleh warna (ada teks dan titik).
- Perubahan hasil (misalnya "Menampilkan 13-24 dari 48 data") diumumkan lewat `aria-live="polite"`.
- Pesan error memakai `role="alert"`.
- Peta diberi `aria-label` "Peta posisi kendaraan {label}" dan informasi koordinat yang sama tersedia sebagai teks di popup.

## 10. Panduan Penulisan Teks

- Bahasa Indonesia, nada netral dan singkat.
- Pesan error menyebut penyebab dan langkah berikutnya (lihat PRD 6.4).
- Istilah teknis (`IN_TRANSIT_TO`) tidak ditampilkan langsung; selalu dipetakan ke teks yang dapat dibaca.
- Format tanggal: `27 Okt 2026, 14:05` dengan tambahan relatif pada card dan popup.

## 11. README: Bagian Arsitektur (usulan isi)

README sebaiknya memuat ringkasan dari dokumen ini:

1. Diagram alur data (bagian 6.1).
2. Alasan memilih TanStack Query dan URL sebagai sumber kebenaran filter/pagination.
3. Strategi pagination server-side dan cara menghitung total halaman (PRD 6.3).
4. Struktur berkas (6.6).
5. Cara menjalankan: `npm install`, salin `.env.example` menjadi `.env` (opsional `VITE_MBTA_API_KEY`), `npm run dev`, `npm run build`, `npm run test`.
6. Keterbatasan yang diketahui (rate limit API, data snapshot).
