import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const notion = new Client({ auth: process.env.NOTION_TOKEN })
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID

async function main() {
  const pageParams = {
    parent: { database_id: ARTICLES_DB },
    properties: {
      'タイトル': {
        title: [ { text: { content: 'ClaudeがPhotoshopやBlenderと直接連携！クリエイター向け「Connector」の全貌' } } ]
      },
      'スラッグ': {
        rich_text: [ { text: { content: 'claude-creative-connectors' } } ]
      },
      'カテゴリ': {
        select: { name: 'AIツール' }
      },
      'SEOキーワード': {
        rich_text: [ { text: { content: 'Claude, AI, Photoshop, Blender, Connector, 連携' } } ]
      },
      'メタディスクリプション': {
        rich_text: [ { text: { content: 'Anthropicが発表したClaude Connectorにより、PhotoshopやBlenderなどのクリエイティブツールを自然言語で直接操作可能に。作業を自動化し創造性に集中できる新機能を解説します。' } } ]
      },
      'ステータス': {
        select: { name: '下書き' }
      }
    },
    children: [
      {
        heading_2: { rich_text: [{ text: { content: '1. 導入：Claude Connectorとは？' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: '先日、AnthropicはClaudeのプロフェッショナル向け機能として、各クリエイティブソフトウェアと直接連携するための公式「Connector」を発表しました。' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'この機能は、オープン標準であるModel Context Protocol（MCP）を活用しており、ClaudeがPhotoshopなどのAdobe製品や、3DソフトのBlenderなどを「自然言語の指示」で直接操作・自動化できるようになる画期的な仕組みです。' } }] }
      },
      {
        heading_2: { rich_text: [{ text: { content: '2. Adobe Photoshop等との連携でできること' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'Adobe Connectorを使用することで、ClaudeはPhotoshop、Premiere Pro、Adobe Expressなど、50以上のCreative Cloudアプリケーションと連携可能になります。' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'これまで人間が手作業で行っていた以下のような「作業（Busywork）」を、チャットベースの指示でClaudeに代行させることができます。' } }] }
      },
      {
        bulleted_list_item: { rich_text: [{ text: { content: '大量のアセットに対するバッチ処理や画像補正' } }] }
      },
      {
        bulleted_list_item: { rich_text: [{ text: { content: '複雑なレイヤー構造の自動整理・リネーム' } }] }
      },
      {
        bulleted_list_item: { rich_text: [{ text: { content: 'プロジェクトファイルの一括エクスポートやリサイズ処理' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'これにより、デザイナーは単調な作業から解放され、デザインそのものに集中できるようになります。' } }] }
      },
      {
        heading_2: { rich_text: [{ text: { content: '3. Blender（3D）連携でできること' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: '3Dモデリングソフト「Blender」向けのConnectorでは、BlenderのPython APIを通じて、Claudeと対話しながら3Dシーンを構築・編集できるようになります。' } }] }
      },
      {
        bulleted_list_item: { rich_text: [
          { text: { content: 'シーンの分析とデバッグ: ', link: null }, annotations: { bold: true } },
          { text: { content: '複雑なマテリアルノードやシーンの構造をClaudeに読み込ませてエラーを特定' } }
        ] }
      },
      {
        bulleted_list_item: { rich_text: [
          { text: { content: 'スクリプトの自動生成: ', link: null }, annotations: { bold: true } },
          { text: { content: '要件を伝えるだけで、モデルの生成や配置を自動化するPythonスクリプトを記述して実行' } }
        ] }
      },
      {
        bulleted_list_item: { rich_text: [
          { text: { content: 'オブジェクトの一括操作: ', link: null }, annotations: { bold: true } },
          { text: { content: '「すべてのカメラの焦点距離を調整して」「選択したオブジェクトのマテリアルを一括変更して」といった指示を即座に反映' } }
        ] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'さらに、Anthropicはオープンソースコミュニティを支援するため、Blender Development Fundのコーポレートパトロンにも就任しています。' } }] }
      },
      {
        heading_2: { rich_text: [{ text: { content: '4. クリエイティブ・ワークフローはどう変わるか？' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'Claude Connectorの最大の強みは、単一のソフトを操作するだけでなく、パイプライン（工程）全体の橋渡しができる点にあります。' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: '例えば、「Photoshopで作成したテクスチャをBlenderのシーンに適用し、リネームして整理する」といった、アプリケーションを跨いだデータの受け渡しやフォーマット変換のサポートも期待されています。' } }] }
      },
      {
        heading_2: { rich_text: [{ text: { content: '5. まとめ' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'Claude Connectorの登場により、AIは単なる「チャットボット」から「頼れるアシスタント・オペレーター」へと進化しました。ツールの専門的な使い方を1から勉強しなくても、やりたいことを言葉で伝えるだけで高度なソフトウェアを扱える未来がすぐそこまで来ています。' } }] }
      },
      {
        paragraph: { rich_text: [{ text: { content: 'ガジェパスでは今後も、クリエイターのワークフローを革新するAIツールの最新情報をお届けしていきます。' } }] }
      }
    ]
  }

  console.log("Creating article in Notion...")
  const res = await notion.pages.create(pageParams)
  console.log("Created successfully! Page ID:", res.id)
}

main().catch(console.error)
