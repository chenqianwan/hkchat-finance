# Local CV reader

The interview demo reads files entirely inside the browser. No file text is sent to a server, placed in storage or logged by the reader. PDF source bytes are transferred to a disposable worker, destroyed after extraction. Extracted text remains in the caller's memory until the UI clears it.

## Integration

Use `runpy.run_path('work/finance/interview/vendor/embed.py')['resume_scripts']()` in the page builder. Insert its returned HTML before the application script. It contains fflate, two inert PDF.js module/worker blocks, embedded CMaps, then `resume-reader.js`. No runtime CDN or additional assets are needed. Modules are imported from local Blob URLs only when a PDF is selected.

```js
const { text, format, warnings, pages } = await HKInterviewResume.read(file);
const suggested = HKInterviewResume.suggest(text);
// suggested: { school, focus, experience, project, skills, summary }
// Render every value using textContent or an escaped input value.
// Show editable confirmation before using these snippets in an interview.
```

All suggested values are excerpts from the file. Missing fields are empty strings, including unrecognised schools. No fallback persona, qualification, employer or achievement is invented. Contact-pattern removal is best-effort; the confirmation form should ask for only relevant learning/work details and allow removal of any remaining personal details.

`read()` throws `Error` with a Traditional Chinese `.message` and stable string `.code`. Supported extensions: `.pdf`, `.docx`, `.txt`, case-insensitive. Limit: 5 MiB. PDF: first 10 pages, 20-second extraction timeout, dedicated module worker, no rendering, JavaScript, XFA, external resources or OCR. Text limit: 16,000 characters. DOCX: bounded ZIP metadata and `word/document.xml` text only; no HTML conversion, media, macros or external relationships. TXT: UTF-8 and BOM-marked UTF-16 LE/BE.

Scanned, encrypted and unreadable PDFs direct the user to paste their CV highlights. Password entry and OCR are intentionally absent. The UI should clear its previous file results before each import, display import errors, and let the user retry or paste text. Chrome blocks this module-worker setup when a downloaded HTML is opened directly with `file://`; the reader reports that promptly with a paste fallback. Serve the page over HTTPS (or localhost) for PDF support in Chrome. WebKit supports both modes.

## Vendored dependencies

* PDF.js / `pdfjs-dist` **6.4.299**, Apache-2.0, official npm package published by Mozilla. Legacy browser module build and matching worker; all binary CMaps embedded for Chinese PDFs. `pdfjs-LICENSE.txt`, `pdfjs-cmaps-LICENSE.txt` and `pdfjs-dist-provenance.json` retain licenses, download URL and npm integrity value.
* `fflate` **0.8.3**, MIT, official npm package. Browser UMD build. `fflate-LICENSE.txt` and `fflate-provenance.json` retain license and origin.

Sources: https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html and https://github.com/101arrowz/fflate

No third-party library was modified. Rebuilds use these pinned local files.
