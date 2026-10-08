# AMR Warehouse · Operator Console

Bảng điều khiển vận hành và cấu hình hệ thống AMR Warehouse.

**Stack:** React 19 + TypeScript · Vite 8 · React Router 8 · TanStack Query 5 · Zustand 5 · Tailwind CSS 4 · shadcn/ui (style `base-nova`)

---

## 1. Yêu cầu môi trường

| Công cụ | Phiên bản | Ghi chú |
| --- | --- | --- |
| Node.js | **20.19.x → 20.x**, hoặc **22.12 trở lên** | Vite 8 khai báo `^20.19.0 \|\| >=22.12.0`. **Node 21 và Node 22.0–22.11 sẽ không chạy được.** |
| pnpm | **10** trở lên | Dự án dùng `pnpm-lock.yaml` |

Kiểm tra máy hiện tại:

```bash
node -v
pnpm -v
```

Nếu chưa có pnpm, cài bằng một trong hai cách:

```bash
# Cách 1: qua npm
npm install -g pnpm

# Cách 2: qua corepack (đi kèm Node)
corepack enable pnpm
```

> **Lưu ý:** Đừng dùng `npm install` hay `yarn install` cho dự án này. Lockfile là của pnpm, dùng trình quản lý khác sẽ tạo ra cây dependency khác và có thể vỡ build.

## 2. Cài đặt

```bash
git clone <url-repo>
cd fe_kortek
pnpm install
```

## 3. Chạy dự án

```bash
pnpm dev
```

Mở http://localhost:3000

Cổng được cấu hình trong `vite.config.ts`. Muốn đổi thì sửa `server.port`.

## 4. Các lệnh có sẵn

| Lệnh | Tác dụng |
| --- | --- |
| `pnpm dev` | Chạy dev server kèm hot reload |
| `pnpm build` | Kiểm tra type rồi build production vào `dist/` |
| `pnpm preview` | Chạy thử bản đã build ở local |
| `pnpm typecheck` | Chỉ kiểm tra TypeScript, không build |

`pnpm build` chạy `tsc -b` trước `vite build`, nên **lỗi type sẽ làm build fail**. Đây là chủ đích: tránh deploy code sai kiểu.

## 5. Biến môi trường

Dự án chạy được ngay mà **không cần file `.env`** — mặc định dùng mock data.

Khi cần nối backend thật, tạo file `.env.local` ở thư mục gốc:

```env
VITE_API_URL=https://api.example.com/api/v1
VITE_USE_MOCK_API=false
```

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `VITE_API_URL` | `/api/v1` | Base URL API RPC-style |
| `VITE_USE_MOCK_API` | `true` | `false` = gọi API thật thay vì mock |

Toàn bộ biến môi trường được đọc tập trung tại `src/config/env.ts`. Không dùng `import.meta.env` ở chỗ khác.

> File `.env.local` đã nằm trong `.gitignore`, không bị commit.

## 6. Cấu trúc thư mục

```
src/
├── app/           Entry point, Provider, cấu hình Router, globals.css
├── components/
│   ├── ui/        shadcn/ui components (atomic)
│   ├── common/    Component dùng chung: Panel, StatusBadge, QueryState...
│   ├── layout/    AppShell, Sidebar, Topbar, SettingsLayout
│   └── errors/    ErrorBoundary, trang 404
├── config/        env, routes, navigation, constants
├── features/      Chia theo miền nghiệp vụ (xem bên dưới)
├── hooks/         Hook dùng chung: useDebounce, useApplyTheme
├── lib/           Cấu hình thư viện ngoài: axios, react-query, dayjs
├── stores/        Zustand store toàn cục: session, theme, sidebar, system
├── testing/       Mock request + fixtures (database giả)
├── types/         Type dùng chung nhiều feature
└── utils/         Hàm format dùng chung
```

Mỗi feature trong `src/features/` có cấu trúc riêng và một file `index.ts` đóng vai **public API** — chỉ những gì được export ở đó mới được feature khác dùng:

```
features/cameras/
├── api/           TanStack Query hooks
├── components/    UI riêng của feature
├── hooks/         Business logic riêng
├── stores/        State cục bộ của feature
├── types/         Type riêng
├── utils/         Helper riêng
└── index.ts       Public API
```

Sáu feature hiện có: `nodes`, `cameras`, `dispatch`, `dashboard`, `notifications`, `system`.

## 7. Thêm component shadcn/ui

```bash
pnpm dlx shadcn@latest add <tên-component>
```

⚠️ **CLI hiện có lỗi resolve alias.** Sau khi chạy lệnh trên, hãy kiểm tra hai điểm:

1. File có bị tạo vào thư mục `@/components/ui/` (thư mục tên đúng là ký tự `@`) thay vì `src/components/ui/` không. Nếu có, di chuyển file sang đúng chỗ rồi xoá thư mục `@`.
2. Import trong file mới có phải `from "cn"` không. Nếu có, sửa thành `from "@/lib/utils"` và chạy `pnpm remove cn`.

Cấu hình shadcn nằm ở `components.json`. CSS variables nằm ở `src/app/globals.css`.

## 8. Quy ước code

- 1 file = 1 component, component dưới 200 dòng
- Business logic đặt trong custom hook, component chỉ render
- Server state (dữ liệu API) → TanStack Query ở `features/*/api/`
- Client state → Zustand: toàn cục ở `src/stores/`, cục bộ ở `features/*/stores/`
- Luôn dùng selector khi đọc store để tránh re-render không cần thiết:
  `useSystemStore((state) => state.isRunning)`
- Màu sắc dùng token Tailwind (`bg-card`, `text-danger`), không viết hex trực tiếp

## 9. Xử lý sự cố

**`pnpm dev` báo lỗi phiên bản Node**
Nâng Node lên 20.19+. Nếu dùng nvm: `nvm install 20 && nvm use 20`.

**Cài đặt lỗi hoặc dependency xung đột**

```bash
rm -rf node_modules
pnpm install
```

Trên Windows PowerShell: `Remove-Item -Recurse -Force node_modules`

**`pnpm build` fail nhưng `pnpm dev` vẫn chạy**
Dev server của Vite không kiểm tra type. Chạy `pnpm typecheck` để xem lỗi cụ thể.

**Cache TypeScript bị sai sau khi đổi cấu hình**

```bash
pnpm exec tsc -b --force
```

**Port 3000 đang bị chiếm**
Sửa `server.port` trong `vite.config.ts`, hoặc chạy `pnpm dev --port 3001`.
