import React from 'react';
import * as XLSX from 'xlsx';
import { pdf } from '@react-pdf/renderer';
import { renderToStaticMarkup } from 'react-dom/server';
import { PdfDocument, WordDocument } from './ExportTemplates';

// ==================== HELPER FUNCTIONS ====================

// 1. New: Clean Markdown Syntax from Text
const cleanText = (text) => {
  if (!text) return '';
  return text
    // Remove Bold (**text**)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove Italic (*text* or _text_)
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove Strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove Inline Code (`text`) - remove backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove Links ([text](url)) - keep only text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove Images (![alt](url)) - remove entirely
    .replace(/!\[([^\]]+)\]\([^)]+\)/g, '')
    // Remove Blockquotes (>)
    .replace(/^>\s+/gm, '')
    // Remove stray special chars often found in AI lists
    .replace(/^\s*[-*+]\s+/gm, '') 
    .trim();
};

export const getLastAIResponse = (messages) => {
  const aiMessages = messages.filter(msg => !msg.isUser && msg.role !== 'user' && msg.sender !== 'user');
  if (aiMessages.length === 0) return null;
  const lastMessage = aiMessages[aiMessages.length - 1];
  return lastMessage.text || lastMessage.content || '';
};

const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ==================== MARKDOWN PARSING LOGIC ====================

const parseTableBuffer = (buffer) => {
  const rows = buffer.filter(line => !line.match(/\|[\s-:]+\|\s*/));
  if (rows.length < 1) return null;

  const parseRow = (row) => {
    return row
      .split('|')
      .map(c => c.trim())
      .filter((c, i, arr) => {
        // Remove empty strings caused by leading/trailing pipes
        if ((i === 0 || i === arr.length - 1) && c === '') return false;
        return true;
      })
      .map(c => cleanText(c));
  };
  
  const headers = parseRow(rows[0]);
  if (headers.length === 0) return null;

  return {
    type: 'table',
    headers: headers,
    rows: rows.slice(1).map(parseRow)
  };
};

const parseMarkdown = (text) => {
  if (!text) return { structuredData: [], hasContent: false };

  let workingText = text.trim();
  const extracted = { codeBlocks: [], tables: [], inlineCodes: [] };

  // 1. Extract Code Blocks (Preserve them raw, no cleaning needed)
  workingText = workingText.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const id = `CODEBLOCK_${extracted.codeBlocks.length}`;
    extracted.codeBlocks.push({ lang: lang || 'text', code: code.trim() });
    return `\n${id}\n`;
  });

  // 2. Extract Inline Code
  workingText = workingText.replace(/`([^`]+)`/g, (match, code) => {
    const id = `INLINECODE_${extracted.inlineCodes.length}`;
    extracted.inlineCodes.push(code);
    return id;
  });

  // 3. Process Content
  const lines = workingText.split('\n');
  const structuredData = [];
  let tableBuffer = [];
  let isTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect Table Rows
    if (line.startsWith('|') && line.includes('|')) {
      tableBuffer.push(line);
      isTable = true;
    } else {
      if (isTable) {
        if (tableBuffer.length >= 2) { 
           const tableData = parseTableBuffer(tableBuffer);
           if (tableData) structuredData.push(tableData);
        }
        tableBuffer = [];
        isTable = false;
      }
      
      // Process Normal Lines
      if (line.startsWith('CODEBLOCK_')) {
        const idx = parseInt(line.split('_')[1]);
        if (extracted.codeBlocks[idx]) {
          structuredData.push({ type: 'code', ...extracted.codeBlocks[idx] });
        }
      } else if (line.startsWith('#')) {
         const level = Math.min(3, line.match(/^#+/)[0].length);
         // Clean header text
         structuredData.push({ type: `header${level}`, content: cleanText(line.replace(/^#+\s*/, '')) });
      } else if (line.match(/^[-*]\s/)) {
         // Clean list text
         structuredData.push({ type: 'unordered', content: cleanText(line.replace(/^[-*]\s/, '')) });
      } else if (line.match(/^\d+\.\s/)) {
         // Clean ordered list text
         structuredData.push({ type: 'ordered', content: cleanText(line.replace(/^\d+\.\s/, '')) });
      } else if (line.length > 0) {
         let content = line;
         // Restore inline code just for text replacement, then clean around it
         extracted.inlineCodes.forEach((code, idx) => {
            content = content.replace(`INLINECODE_${idx}`, code);
         });
         // Clean the paragraph text
         structuredData.push({ type: 'text', content: cleanText(content) });
      }
    }
  }

  if (isTable && tableBuffer.length >= 2) {
      const tableData = parseTableBuffer(tableBuffer);
      if (tableData) structuredData.push(tableData);
  }

  return { structuredData, hasContent: structuredData.length > 0 };
};

// ==================== PDF EXPORT ====================

export const downloadAsPDF = async (content, filename = 'Response.pdf') => {
  try {
    const { structuredData } = parseMarkdown(content);
    if (structuredData.length === 0) return false;

    const blob = await pdf(
      <PdfDocument 
        structuredData={structuredData} 
        date={new Date().toLocaleString()} 
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
    return true;

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return false;
  }
};

// ==================== WORD EXPORT ====================

export const downloadAsWordDocument = (content, filename = 'Response.doc') => {
  try {
    const { structuredData } = parseMarkdown(content);
    
    const htmlString = renderToStaticMarkup(
      <WordDocument 
        structuredData={structuredData} 
        date={new Date().toLocaleString()} 
      />
    );

    const blob = new Blob(['\ufeff', htmlString], { type: 'application/msword' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;

  } catch (error) {
    console.error('Word Generation Error:', error);
    return false;
  }
};

// ==================== EXCEL EXPORT ====================

export const downloadAsExcel = (content, filename = 'Response.xlsx') => {
  try {
    const { structuredData } = parseMarkdown(content);
    const wb = XLSX.utils.book_new();
    const sheetData = [];

    structuredData.forEach(item => {
      if (item.type === 'table') {
        sheetData.push(['']);
        // Headers are already cleaned by parseTableBuffer
        sheetData.push(item.headers);
        // Rows are already cleaned
        item.rows.forEach(row => sheetData.push(row));
        sheetData.push(['']); 
      } else if (item.type === 'code') {
        sheetData.push(['CODE BLOCK (' + item.lang + ')']);
        item.code.split('\n').forEach(line => sheetData.push([line]));
        sheetData.push(['']);
      } else if (item.type?.startsWith('header')) {
        sheetData.push([item.content.toUpperCase()]);
      } else {
        sheetData.push([item.content]); // Already cleaned
      }
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws['!cols'] = [{wch: 50}];

    XLSX.utils.book_append_sheet(wb, ws, "AI Response");
    XLSX.writeFile(wb, filename);
    return true;
  } catch (e) {
    console.error("Excel Export Error", e);
    return false;
  }
};