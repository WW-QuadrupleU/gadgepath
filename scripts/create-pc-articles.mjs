import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID;

function parseTextToBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      blocks.push({
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: line.substring(3) } }] }
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: line.substring(4) } }] }
      });
    } else if (line.startsWith('* ')) {
      const content = line.substring(2);
      // **xxx**: yyy のような形式のパース
      const boldMatch = content.match(/^\*\*(.*?)\*\*(.*)/);
      if (boldMatch) {
        blocks.push({
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: boldMatch[1] }, annotations: { bold: true } },
              { type: 'text', text: { content: boldMatch[2] } }
            ]
          }
        });
      } else {
        blocks.push({
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: content } }]
          }
        });
      }
    } else if (line.startsWith('---')) {
       blocks.push({
        type: 'divider',
        divider: {}
      });
    } else {
      blocks.push({
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] }
      });
    }
  }
  return blocks;
}

async function createArticle(title, slug, seoKeyword, metaDesc, mdFilePath) {
  const textContent = fs.readFileSync(resolve(process.cwd(), mdFilePath), 'utf-8');
  const blocks = parseTextToBlocks(textContent);

  console.log(`Creating article: ${title}`);
  
  const pageParams = {
    parent: { database_id: ARTICLES_DB },
    properties: {
      'タイトル': { title: [ { text: { content: title } } ] },
      'スラッグ': { rich_text: [ { text: { content: slug } } ] },
      'カテゴリ': { select: { name: 'その他' } },
      'SEOキーワード': { rich_text: [ { text: { content: seoKeyword } } ] },
      'メタディスクリプション': { rich_text: [ { text: { content: metaDesc } } ] },
      'ステータス': { select: { name: '下書き' } }
    },
    children: blocks.length > 100 ? blocks.slice(0, 100) : blocks
  };

  try {
    const res = await notion.pages.create(pageParams);
    console.log(`Created successfully! Page ID: ${res.id}`);
    
    // Append remaining blocks if > 100
    if (blocks.length > 100) {
      for (let i = 100; i < blocks.length; i += 100) {
        const chunk = blocks.slice(i, i + 100);
        await notion.blocks.children.append({ block_id: res.id, children: chunk });
        console.log(`Appended blocks ${i} to ${i + chunk.length}`);
      }
    }
  } catch (error) {
    console.error(`Error creating ${title}:`, error.message);
  }
}

async function main() {
  await createArticle(
    '【2026年版】用途別おすすめノートパソコン！動画編集・配信・テレワークに最適な1台の選び方',
    'laptop-pc-guide-2026',
    'ノートパソコン, おすすめ, 動画編集, 配信, テレワーク, クリエイターPC',
    '動画編集、ゲーム配信、テレワークなど、用途別に最適なWindowsノートパソコンの選び方とおすすめモデルを紹介。CPUやGPUなどの必須スペックも分かりやすく解説します。',
    'scripts/laptop-pc-guide.md'
  );

  await createArticle(
    '【2026年版】用途別おすすめデスクトップPC！本気で配信・3D制作を始めるための最強スペック指南',
    'desktop-pc-guide-2026',
    'デスクトップPC, おすすめ, ゲーミングPC, 配信, 3Dモデリング, Blender',
    '本格的なゲーム配信や3Dモデリング、動画編集を始めたい方向けに、WindowsデスクトップPCの選び方を徹底解説。圧倒的な処理能力を誇るおすすめモデルを用途別に紹介します。',
    'scripts/desktop-pc-guide.md'
  );
}

main();
