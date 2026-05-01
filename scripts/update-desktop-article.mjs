import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID;
const PRODUCTS_DB = process.env.NOTION_PRODUCTS_DB_ID || 'c0f456c33c5740bc8d90025630236014';
const ARTICLE_SLUG = 'desktop-pc-guide-2026';

const textContent = fs.readFileSync(resolve(process.cwd(), 'scripts', 'desktop-pc-guide-v2.md'), 'utf-8');

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
    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
      blocks.push({
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: [{ type: 'text', text: { content: line.substring(3) } }] }
      });
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

async function addProduct(name, slug, priceStr) {
  try {
    // Check if product already exists
    const existing = await notion.databases.query({
      database_id: PRODUCTS_DB,
      filter: { property: 'スラッグ', rich_text: { equals: slug } }
    });
    if (existing.results.length > 0) {
      console.log(`Product ${name} already exists. Updating article slug relation...`);
      const pageId = existing.results[0].id;
      const currentSlugs = existing.results[0].properties['記事スラッグ'].multi_select || [];
      if (!currentSlugs.find(s => s.name === ARTICLE_SLUG)) {
        await notion.pages.update({
          page_id: pageId,
          properties: {
            '記事スラッグ': { multi_select: [...currentSlugs, { name: ARTICLE_SLUG }] }
          }
        });
      }
      return;
    }

    console.log(`Creating product: ${name}`);
    await notion.pages.create({
      parent: { database_id: PRODUCTS_DB },
      properties: {
        '商品名': { title: [ { text: { content: name } } ] },
        'スラッグ': { rich_text: [ { text: { content: slug } } ] },
        'カテゴリ': { select: { name: 'パソコン' } },
        '記事スラッグ': { multi_select: [ { name: ARTICLE_SLUG } ] },
        '価格': { rich_text: [ { text: { content: priceStr } } ] },
        'ステータス': { status: { name: '現行品' } },
        // Dummy data for affiliate functionality to work properly
        '楽天URL': { url: 'https://search.rakuten.co.jp/search/mall/' + encodeURIComponent(name) },
        '画像URL': { url: 'https://placehold.co/400x400/png?text=PC' } 
      }
    });
  } catch (e) {
    console.error(`Failed to add product ${name}:`, e.message);
  }
}

async function getChildren(blockId) {
  const blocks = [];
  let hasMore = true;
  let startCursor = undefined;
  while (hasMore) {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: startCursor, page_size: 100 });
    blocks.push(...res.results);
    hasMore = res.has_more;
    startCursor = res.next_cursor;
  }
  return blocks;
}

async function deleteBlocks(blocks) {
  for (const block of blocks) {
    try {
      await notion.blocks.delete({ block_id: block.id });
    } catch (e) {
      console.error("Error deleting block", block.id, e.message);
    }
  }
}

async function main() {
  // 1. Add Products
  console.log('--- Registering Products ---');
  await addProduct('GALLERIA ZA9R-R59', 'galleria-za9r-r59', '約550,000円');
  await addProduct('G-Tune FZ-A9G90', 'g-tune-fz-a9g90', '約580,000円');
  await addProduct('DAIV FX-I7G90', 'daiv-fx-i7g90', '約600,000円');
  await addProduct('GALLERIA RM5C-R56T', 'galleria-rm5c-r56t', '約140,000円');

  // 2. Update Article
  console.log('\n--- Updating Article ---');
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  });

  if (articleRes.results.length === 0) {
    console.error("Article not found.");
    return;
  }

  const pageId = articleRes.results[0].id;
  console.log("Found article page ID:", pageId);

  const existingBlocks = await getChildren(pageId);
  console.log(`Deleting ${existingBlocks.length} existing blocks...`);
  await deleteBlocks(existingBlocks);

  const newBlocks = parseTextToBlocks(textContent);
  console.log(`Appending ${newBlocks.length} new blocks...`);
  
  for (let i = 0; i < newBlocks.length; i += 100) {
    const chunk = newBlocks.slice(i, i + 100);
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk
    });
    console.log(`Appended blocks ${i} to ${i + chunk.length}`);
  }

  console.log("Article update complete!");
}

main().catch(console.error);
