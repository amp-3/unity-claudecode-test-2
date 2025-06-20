# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Omni Shooterは、HTML5 CanvasとJavaScriptで構築されたブラウザ向け全方位シューティングゲームです。ES6モジュール、Viteビルドシステム、モジュラー設計を採用しています。

## 開発コマンド

### 基本的な開発作業
```bash
# 開発サーバー起動（ホットリロード付き）
npm run dev

# 本番用ビルド
npm run build

# ビルド確認（本番ビルドをプレビュー）
npm run preview

# テスト実行
npm test

# テスト監視モード
npm run test:watch

# リント実行
npm run lint

# リント自動修正
npm run lint:fix
```

### デバッグとテスト
- `test-game.html` - 全機能をテストできる専用デバッグページ
- ブラウザの開発者ツールでコンソールログを確認
- `npm run dev`でlocalhost:3000でアクセス可能

## アーキテクチャとコード構造

### 中核となる設計パターン

**Entity-Component-System (ECS)アーキテクチャ**
- `Entity`: すべてのゲームオブジェクトの基底クラス（位置、速度、衝突判定）
- `Game`: メインゲームループとシステム管理のシングルトン
- `Systems`: 独立した機能モジュール（入力、武器、スポーン、UI等）

**シングルトンパターン**
- `Game.getInstance()` - ゲーム状態の中央管理
- `AssetLoader.getInstance()` - 画像・音声アセットの一元管理

### 主要システムの関係性

```
Game (シングルトン)
├── InputManager - キーボード/マウス/タッチ/ゲームパッド入力
├── WeaponSystem - 武器の種類と発射パターン管理
├── SpawnSystem - 敵の出現とwave管理
├── ParticleSystem - 爆発等の視覚効果
├── AudioManager - Web Audio APIを使った音響効果
├── UIManager - HUD、メニュー、ゲーム状態表示
├── SaveSystem - localStorage使ったセーブ/ロード
└── AssetLoader - スプライト画像の読み込み管理
```

### ゲーム状態管理

ゲーム状態は`Game.gameState`で管理：
- `MENU` - メニュー画面
- `PLAYING` - ゲームプレイ中
- `PAUSED` - 一時停止
- `GAME_OVER` - ゲームオーバー

状態遷移は`Game.setState()`経由で行い、各状態で適切な初期化・終了処理を実行。

### エンティティ管理

**継承階層**:
```
Entity (基底クラス)
├── Player - プレイヤーキャラクター（入力処理、射撃、体力）
├── Bullet系 - 弾丸（通常、拡散、パワー、レーザー）
├── Enemy系 - 敵（基本、高速、タンク、スナイパー、周回）
└── PowerUp - パワーアップアイテム
```

すべてのエンティティは`Game.entities`（Map）で管理され、毎フレーム更新・描画される。

### 衝突判定システム

`Game.checkCollisions()`でエンティティ間の衝突を検出：
- 円形衝突判定（`collisionRadius`使用）
- プレイヤー vs 敵、弾 vs 敵、プレイヤー vs パワーアップの組み合わせ
- `handleCollision()`で衝突時の処理（ダメージ、破壊、効果適用）

### 重要な技術的注意点

**座標系とスプライト描画**:
- プレイヤーのロケットスプライトは90度回転補正が必要
- `rotation + Math.PI / 2`でスプライト描画時に調整
- フォールバック描画（緑三角形）は`rotation`をそのまま使用

**非同期モジュール読み込み**:
- 動的import()を活用した遅延読み込み
- `async/await`パターンで依存関係を管理
- AssetLoaderでスプライト読み込みエラーをハンドリング

**オブジェクトプーリング**:
- `ObjectPool`クラスで弾丸・パーティクルの再利用
- メモリ効率とガベージコレクション負荷軽減

**レスポンシブUI**:
- Canvas固定サイズ（800x600）をCSS transformでスケール
- UI要素の動的幅制限（`ctx.measureText()`使用）
- 画面サイズに応じた段階的省略表示

### モジュール間の依存関係

各SystemはGameインスタンス経由で他システムと通信：
```javascript
// 例：プレイヤーが武器システム経由で弾丸生成
const game = Game.getInstance();
const bullets = game.weaponSystem.fire(x, y, direction);
bullets.forEach(bullet => game.addEntity(bullet));
```

## 既知の不具合修正履歴

最近修正された主要な不具合：
1. 弾の発射方向のマウス座標二重処理問題（BUGFIX_REPORT.md参照）
2. 弾と敵の衝突判定の双方向対応
3. ロケットスプライトの向き調整
4. UI要素の画面外はみ出し問題

デバッグ時はBUGFIX_REPORT.mdとBUGFIX_REPORT_2.mdを参照。