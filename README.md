# Next.js 13、React、Tailwind、Prisma、Stripe を使用した SaaS AI プラットフォームの構築

Next.js（フルスタック）13 を使用した SaaS AI プラットフォーム。

### 必要条件

**Node バージョン 18.x.x**

````

### パッケージのインストール

```shell
npm i
````

### .env ファイルの設定

```js
OPENAI_API_KEY = NEXT_PUBLIC_APP_URL = "http://localhost:3000";
```

### Prisma の設定

MySQL データベースを追加（PlanetScale を使用）

```shell
npx prisma db push
```

### アプリの起動

```shell
npm run dev
```

## 利用可能なコマンド

npm を使用してコマンドを実行 `npm run [command]`

| コマンド | 説明                           |
| :------- | :----------------------------- |
| `dev`    | アプリの開発インスタンスを起動 |

## フォルダ構成

ai-saas/
├── app/
│ ├── (dashboard)/
│ │ ├── page.tsx
│ │ └── layout.tsx
│ ├── (landing)/
│ │ ├── page.tsx
│ │ └── layout.tsx
│ ├── api/
│ │ └── route.ts
│ └── layout.tsx
├── components/
│ ├── modal-provider.tsx
│ └── toaster-provider.tsx
├── public/
│ └── ...
├── styles/
│ └── globals.css
├── README.md
└── package.json

# next13-ai-saas
