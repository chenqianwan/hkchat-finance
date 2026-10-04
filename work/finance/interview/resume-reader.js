(function () {
  'use strict';

  const LIMIT = Object.freeze({ bytes: 5 * 1024 * 1024, pages: 10, chars: 16000, xml: 2 * 1024 * 1024 });
  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  let pdfModule;
  let cmapData;
  const fail = (code, message) => Object.assign(new Error(message), { code });
  const normalise = value => String(value || '').replace(/\u0000/g, '').replace(/\r\n?/g, '\n').replace(/[\t \u00a0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  function finish(raw, format, warnings, extra) {
    let text = normalise(raw);
    if (!/[\p{L}\p{N}]/u.test(text)) throw fail('NO_TEXT', '未讀到可用文字。掃描圖片暫不支援，請貼上履歷重點，或使用可選取文字的檔案。');
    if (text.length > LIMIT.chars) {
      text = text.slice(0, LIMIT.chars);
      warnings.push('履歷較長，只保留前 16,000 個字元。請在下一步確認所需重點。');
    }
    return { text, format, warnings, ...extra };
  }

  function decodeText(bytes) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le', { fatal: true }).decode(bytes.subarray(2));
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be', { fatal: true }).decode(bytes.subarray(2));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  async function pdfLibrary() {
    if (!pdfModule) {
      pdfModule = (async () => {
        const source = document.getElementById('hkinterview-pdf-module')?.textContent;
        if (!source) throw fail('READER_UNAVAILABLE', 'PDF 讀取器未能載入，請重新整理頁面，或直接貼上履歷重點。');
        const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
        try { return await import(url); } finally { URL.revokeObjectURL(url); }
      })().catch(error => { pdfModule = null; throw error; });
    }
    return pdfModule;
  }

  class EmbeddedPDFData {
    async fetch({ kind, filename }) {
      if (kind !== 'cMapUrl') throw new Error('External PDF resources are disabled.');
      if (!cmapData) cmapData = JSON.parse(document.getElementById('hkinterview-pdf-cmaps')?.textContent || '{}');
      const entry = Object.prototype.hasOwnProperty.call(cmapData, filename) ? cmapData[filename] : null;
      if (!entry) throw new Error('This PDF CMap is unavailable.');
      return Uint8Array.from(atob(entry), c => c.charCodeAt(0));
    }
  }

  async function readPDF(bytes) {
    if (!new TextDecoder('ascii').decode(bytes.subarray(0, 1024)).includes('%PDF-')) throw fail('INVALID_PDF', '這個檔案不是可讀取的 PDF，請重新匯出，或貼上履歷重點。');
    const pdfjs = await pdfLibrary();
    const source = document.getElementById('hkinterview-pdf-worker')?.textContent;
    if (!source) throw fail('READER_UNAVAILABLE', 'PDF 讀取器未能載入，請重新整理頁面，或直接貼上履歷重點。');
    const workerUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    let worker, pdfWorker, task, timer;
    const warnings = [];
    try {
      worker = new Worker(workerUrl, { type: 'module' });
      await new Promise((resolve, reject) => {
        const readyTimeout = setTimeout(() => reject(fail('READER_UNAVAILABLE', '瀏覽器未能啟動 PDF 讀取器。請在網站連結開啟此頁，或直接貼上履歷重點。')), 5000);
        worker.addEventListener('message', function ready(event) {
          if (event.data?.action !== 'ready') return;
          clearTimeout(readyTimeout);
          worker.removeEventListener('message', ready);
          resolve();
        });
        worker.addEventListener('error', () => {
          clearTimeout(readyTimeout);
          reject(fail('READER_UNAVAILABLE', '瀏覽器未能啟動 PDF 讀取器，請重新整理頁面，或直接貼上履歷重點。'));
        }, { once: true });
      });
      pdfWorker = new pdfjs.PDFWorker({ port: worker, verbosity: 0 });
      task = pdfjs.getDocument({ data: bytes, worker: pdfWorker, verbosity: 0, BinaryDataFactory: EmbeddedPDFData, useWorkerFetch: false, cMapPacked: true, useSystemFonts: false, useWasm: false, disableFontFace: true, isEvalSupported: false, enableXfa: false, maxImageSize: 1, isOffscreenCanvasSupported: false, isImageDecoderSupported: false, disableRange: true, disableStream: true, disableAutoFetch: true });
      const extract = async () => {
        const pdf = await task.promise;
        const pages = Math.min(pdf.numPages, LIMIT.pages);
        if (pdf.numPages > LIMIT.pages) warnings.push('只讀取前 10 頁；請確認重要項目已包含在內。');
        let output = '';
        for (let p = 1; p <= pages && output.length <= LIMIT.chars; p += 1) {
          const page = await pdf.getPage(p);
          const reader = page.streamTextContent({ includeMarkedContent: false }).getReader();
          try {
            for (;;) {
              const chunk = await reader.read();
              if (chunk.done) break;
              for (const item of chunk.value.items || []) {
                if (typeof item.str === 'string') output += item.str + (item.hasEOL ? '\n' : ' ');
                if (output.length > LIMIT.chars) break;
              }
              if (output.length > LIMIT.chars) { await reader.cancel(); break; }
            }
          } finally { reader.releaseLock(); page.cleanup(); }
          output += '\n';
        }
        return finish(output, 'PDF', warnings, { pages: pdf.numPages, pagesRead: pages });
      };
      return await Promise.race([extract(), new Promise((_, reject) => {
        timer = setTimeout(() => { worker?.terminate(); reject(fail('TIMEOUT', '檔案處理時間較長，已停止讀取。請另存較簡單的 PDF，或貼上履歷重點。')); }, 20000);
      })]);
    } catch (error) {
      if (error.code && typeof error.code === 'string') throw error;
      if (error.name === 'PasswordException') throw fail('PASSWORD', '這份 PDF 設有密碼。請使用沒有密碼的版本，或直接貼上履歷重點。');
      throw fail('INVALID_PDF', '未能讀取這份 PDF。請使用可選取文字、沒有密碼的版本，或直接貼上履歷重點。');
    } finally {
      clearTimeout(timer);
      // Terminate even a malformed or timed-out PDF; never fall back to parsing on the UI thread.
      try { const cleanup = task?.destroy(); cleanup?.catch(() => {}); } catch (_) {}
      try { pdfWorker?.destroy(); } catch (_) {}
      worker?.terminate();
      URL.revokeObjectURL(workerUrl);
    }
  }

  function inspectZip(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let end = -1;
    for (let p = bytes.length - 22; p >= Math.max(0, bytes.length - 65557); p -= 1) {
      if (view.getUint32(p, true) === 0x06054b50 && p + 22 + view.getUint16(p + 20, true) === bytes.length) { end = p; break; }
    }
    if (end < 0) throw fail('INVALID_DOCX', 'DOCX 檔案不完整，請重新匯出，或貼上履歷重點。');
    const count = view.getUint16(end + 10, true), size = view.getUint32(end + 12, true), start = view.getUint32(end + 16, true);
    if (view.getUint16(end + 4, true) || view.getUint16(end + 6, true) || count !== view.getUint16(end + 8, true) || count > 256 || start + size > end) throw fail('COMPLEX_DOCX', '這份 DOCX 結構較複雜，請另存簡單版本，或貼上履歷重點。');
    let p = start, total = 0, main = 0;
    const names = new Set();
    for (let i = 0; i < count; i += 1) {
      if (p + 46 > end || view.getUint32(p, true) !== 0x02014b50) throw fail('INVALID_DOCX', 'DOCX 檔案不完整，請重新匯出，或貼上履歷重點。');
      const flags = view.getUint16(p + 8, true), method = view.getUint16(p + 10, true), packed = view.getUint32(p + 20, true), unpacked = view.getUint32(p + 24, true), nameLength = view.getUint16(p + 28, true), extra = view.getUint16(p + 30, true), comment = view.getUint16(p + 32, true), offset = view.getUint32(p + 42, true);
      if (p + 46 + nameLength + extra + comment > end || flags & 1 || ![0, 8].includes(method) || offset + 30 > start) throw fail('INVALID_DOCX', '未能讀取這份 DOCX，請使用沒有密碼的標準 DOCX，或貼上履歷重點。');
      const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLength));
      if (names.has(name) || view.getUint32(offset, true) !== 0x04034b50 || offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true) + packed > start) throw fail('INVALID_DOCX', 'DOCX 檔案結構不完整，請重新匯出，或貼上履歷重點。');
      names.add(name);
      total += unpacked;
      if (total > 40 * 1024 * 1024 || (name === 'word/document.xml' && unpacked > LIMIT.xml)) throw fail('COMPLEX_DOCX', '這份 DOCX 解壓後內容過大，請另存簡單版本，或貼上履歷重點。');
      if (name === 'word/document.xml') main += 1;
      p += 46 + nameLength + extra + comment;
    }
    if (p !== start + size || main !== 1 || !names.has('[Content_Types].xml')) throw fail('INVALID_DOCX', '這個檔案不是可讀取的 DOCX，請重新匯出，或貼上履歷重點。');
  }

  function readDOCX(bytes) {
    inspectZip(bytes);
    if (!window.fflate?.unzipSync) throw fail('READER_UNAVAILABLE', 'DOCX 讀取器未能載入，請重新整理頁面，或貼上履歷重點。');
    const files = window.fflate.unzipSync(bytes, { filter: entry => entry.name === 'word/document.xml' && entry.originalSize <= LIMIT.xml });
    if (!files['word/document.xml'] || files['word/document.xml'].byteLength > LIMIT.xml) throw fail('COMPLEX_DOCX', '這份 DOCX 文字內容過大，請另存簡單版本，或貼上履歷重點。');
    const xml = new TextDecoder('utf-8', { fatal: true }).decode(files['word/document.xml']);
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw fail('INVALID_DOCX', '未能讀取這份 DOCX，請重新匯出，或貼上履歷重點。');
    const documentXML = new DOMParser().parseFromString(xml, 'application/xml');
    if (documentXML.getElementsByTagName('parsererror').length) throw fail('INVALID_DOCX', 'DOCX 文字內容不完整，請重新匯出，或貼上履歷重點。');
    // Only Word text nodes are extracted; no HTML, relationships, macros or embedded content runs.
    const paragraphs = [...documentXML.getElementsByTagNameNS(W_NS, 'p')];
    let output = '';
    for (const paragraph of paragraphs) {
      for (const node of paragraph.getElementsByTagNameNS(W_NS, '*')) {
        if (node.localName === 't') output += node.textContent || '';
        else if (node.localName === 'tab') output += ' ';
        else if (node.localName === 'br') output += '\n';
        if (output.length > LIMIT.chars) break;
      }
      output += '\n';
      if (output.length > LIMIT.chars) break;
    }
    return finish(output, 'DOCX', []);
  }

  async function read(file) {
    if (!(file instanceof Blob) || !file.size) throw fail('EMPTY_FILE', '這個檔案沒有內容，請重新選擇。');
    if (file.size > LIMIT.bytes) throw fail('TOO_LARGE', '檔案上限為 5 MB。請選擇較小的 PDF、DOCX 或 TXT，或貼上履歷重點。');
    const extension = String(file.name || '').split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt'].includes(extension)) throw fail('UNSUPPORTED', '目前支援 PDF、DOCX、TXT。其他格式請先轉存，或直接貼上履歷重點。');
    const bytes = new Uint8Array(await file.arrayBuffer());
    try {
      if (extension === 'pdf') return await readPDF(bytes);
      if (extension === 'docx') return readDOCX(bytes);
      const text = decodeText(bytes);
      if (/[\u0000-\u0008\u000b\u000e-\u001f]/.test(text)) throw fail('INVALID_TXT', 'TXT 似乎含有非文字資料，請另存為 UTF-8 文字，或直接貼上履歷重點。');
      return finish(text, 'TXT', []);
    } catch (error) {
      if (error.code && typeof error.code === 'string') throw error;
      throw fail('UNREADABLE', '檔案未能讀取，請重新匯出為 PDF、DOCX 或 UTF-8 TXT，也可以直接貼上履歷重點。');
    }
  }

  function removeContacts(value) {
    return value.replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '').replace(/(?:\+?852[-\s]?)?\b[2-9]\d{3}[-\s]?\d{4}\b/g, '').replace(/\+\d[\d()\s-]{8,}\d/g, '').replace(/https?:\/\/\S+|www\.\S+/gi, '').replace(/\b[A-Z]{1,2}\d{6}\([0-9A]\)/gi, '').trim();
  }

  function suggest(raw) {
    const lines = normalise(raw).slice(0, LIMIT.chars).split('\n').map(removeContacts).filter(line => line && !/^(?:e-?mail|phone|mobile|tel|address|date of birth|birth|gender|nationality|marital|age|姓名|名字|電話|電郵|地址|出生|性別|國籍|婚姻|年齡|聯絡|联系)\s*[:：]/i.test(line));
    const heading = /^(?:education|experience|work experience|projects?|skills|profile|summary|學歷|教育|經驗|工作經驗|實習|項目|專案|技能|簡介)\s*[:：]?$/i;
    const snippet = (pattern, length = 240) => {
      const at = lines.findIndex(line => pattern.test(line));
      if (at < 0) return '';
      const values = [lines[at]];
      if (heading.test(lines[at]) && lines[at + 1] && !heading.test(lines[at + 1])) values.push(lines[at + 1]);
      return values.join(' · ').slice(0, length);
    };
    const result = {
      school: snippet(/\b(?:university|college|hkust|hku|cuhk|polyu|cityu|hkbu|lingnan)\b|大學|大学|學院|学院/i, 180),
      focus: snippet(/\b(?:major|degree|bachelor|master|phd|artificial intelligence|fintech|finance|computer science|data science)\b|人工智能|金融科技|金融|主修|專業|专业|數據科學|数据科学/i, 220),
      experience: snippet(/\b(?:internship|intern|work experience|employment|professional experience)\b|實習|实习|工作經驗|工作经验|任職|任职/i),
      project: snippet(/\b(?:projects?|capstone|dissertation|thesis|built|developed)\b|項目|项目|專案|专题|專題|研究|開發|开发/i),
      skills: snippet(/\b(?:skills|python|sql|pytorch|tensorflow|excel|tableau|power bi|javascript|machine learning)\b|技能|程式|編程|编程|機器學習|机器学习/i),
      summary: ''
    };
    // Summary consists only of actual extracted snippets, never a guessed persona or credential.
    result.summary = [...new Set([result.school, result.focus, result.experience, result.project, result.skills].filter(Boolean))].join('\n').slice(0, 800);
    return result;
  }

  window.HKInterviewResume = Object.freeze({ read, suggest, limits: LIMIT });
})();
