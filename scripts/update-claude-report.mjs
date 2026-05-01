import { Client } from '@notionhq/client';
import dotenv from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ARTICLES_DB = process.env.NOTION_ARTICLES_DB_ID;
const ARTICLE_SLUG = 'claude-creative-connectors';

const textContent = fs.readFileSync(resolve(process.cwd(), 'scripts', 'claude-report.md'), 'utf-8');

function parseTextToBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      if (line.includes('---')) {
        continue;
      }
      
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      tableRows.push({
        type: 'table_row',
        table_row: {
          cells: cells.map(content => [{ type: 'text', text: { content } }])
        }
      });
      continue;
    } else if (inTable) {
      inTable = false;
      blocks.push({
        type: 'table',
        table: {
          table_width: tableRows[0].table_row.cells.length,
          has_column_header: true,
          has_row_header: false,
          children: tableRows
        }
      });
      tableRows = [];
    }

    if (line.startsWith('# ')) {
      blocks.push({
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: line.substring(2) } }] }
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: line.substring(3) } }] }
      });
    } else if (line.startsWith('- ')) {
      const content = line.substring(2);
      const parts = content.split('：');
      if (parts.length > 1) {
        blocks.push({
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: parts[0] + '：' }, annotations: { bold: true } },
              { type: 'text', text: { content: parts.slice(1).join('：') } }
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
    } else {
      blocks.push({
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] }
      });
    }
  }

  if (inTable) {
    blocks.push({
      type: 'table',
      table: {
        table_width: tableRows[0].table_row.cells.length,
        has_column_header: true,
        has_row_header: false,
        children: tableRows
      }
    });
  }

  return blocks;
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
  console.log("Searching for article with slug:", ARTICLE_SLUG);
  const articleRes = await notion.databases.query({
    database_id: ARTICLES_DB,
    filter: { property: 'スラッグ', rich_text: { equals: ARTICLE_SLUG } },
  });

  if (articleRes.results.length === 0) {
    console.error("Article not found.");
    return;
  }

  const pageId = articleRes.results[0].id;
  console.log("Found page ID:", pageId);

  console.log("Fetching existing blocks...");
  const existingBlocks = await getChildren(pageId);
  
  console.log("Deleting " + existingBlocks.length + " existing blocks...");
  await deleteBlocks(existingBlocks);

  console.log("Parsing new report text...");
  const newBlocks = parseTextToBlocks(textContent);
  
  console.log("Appending " + newBlocks.length + " new blocks...");
  
  // Notion API limits block append to 100 children per request
  for (let i = 0; i < newBlocks.length; i += 100) {
    const chunk = newBlocks.slice(i, i + 100);
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk
    });
    console.log("Appended blocks " + i + " to " + (i + chunk.length));
  }

  console.log("Article update complete!");
}

main().catch(console.error);
