# Omni Shooter - 公開版

🎮 **プレイする**: https://amp-3.github.io/unity-claudecode-test-2/

> 🤖 このゲームは[Claude Code](https://claude.ai/code)を使用して実装されました。

## ゲームの遊び方

### 基本操作
- **移動**: WASD キーまたは矢印キー
- **射撃**: マウスクリック（マウスカーソルの方向に発射）
- **ポーズ**: Escキー

### ゲームの目標
- 敵を倒してスコアを獲得
- パワーアップアイテムを取得して武器を強化
- できるだけ長く生き残る

### 武器の種類
- **Normal**: 基本武器
- **Spread**: 拡散弾
- **Power**: 高威力弾
- **Rapid**: 連射弾
- **Laser**: レーザー弾

### パワーアップ
- **Health**: 体力回復
- **Speed**: 移動速度向上
- **Fire Rate**: 射撃速度向上
- **武器アップグレード**: 一定時間特殊武器に変更

## ファイル構成

- `index.html` - メインゲーム
- `test.html` - テスト・デバッグページ
- `src/` - ゲームソースコード
- `assets/` - ゲームアセット（スプライト等）

## 動作環境

- モダンなWebブラウザ（Chrome, Firefox, Safari, Edge）
- JavaScript ES6モジュール対応
- HTML5 Canvas対応

## サポート

- PC: キーボード・マウス操作
- モバイル: タッチ操作対応
- ゲームパッド: 対応

このゲームはブラウザで直接動作し、インストール不要です。

## 開発者向け情報

### ビルド方法

#### 必要な環境
- Node.js (v14以降)
- npm

#### セットアップ
```bash
# 依存関係のインストール
npm install
```

#### 開発サーバーの起動
```bash
# 開発サーバーを起動（ホットリロード対応）
npm run dev
# http://localhost:3000 でアクセス可能
```

#### 本番用ビルド
```bash
# publicフォルダに本番用ファイルを生成
npm run build
```

#### ビルドの確認
```bash
# ビルドしたファイルをプレビューサーバーで確認
npm run preview
```

### その他のコマンド
```bash
# テスト実行
npm test

# テスト監視モード
npm run test:watch

# リント実行
npm run lint

# リント自動修正
npm run lint:fix
```

### デプロイ
ビルドしたpublicフォルダの内容をGitHub Pagesや任意のWebサーバーにアップロードすることでデプロイできます。