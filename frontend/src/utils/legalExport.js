/**
 * Utilities for clean, isolated legal document printing and Word export (.doc)
 * Ensures only the legal document prints, looking like an official court/statutory notice.
 */

export function printLegalDocument(title, content, metadata = {}) {
  const printWindow = window.open("", "_blank", "width=850,height=1000");
  const escapedContent = (content || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title || "Legal Document"}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 25mm 20mm 25mm 20mm;
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #111;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    .doc-page {
      max-width: 180mm;
      margin: 0 auto;
      padding: 10px 0;
    }
    .doc-header {
      text-align: center;
      border-bottom: 2px solid #222;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .doc-main-title {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .doc-subtitle {
      font-size: 10pt;
      color: #555;
      font-style: italic;
    }
    .doc-content {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 12pt;
      line-height: 1.65;
      text-align: justify;
    }
    .doc-footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ccc;
      font-size: 9pt;
      color: #777;
      text-align: center;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="doc-page">
    <div class="doc-header">
      <div class="doc-main-title">${title || "FORMAL LEGAL DOCUMENT"}</div>
      <div class="doc-subtitle">Statutory Document &bull; Generated via NyayaSahayak Legal AI Assistant</div>
    </div>
    <div class="doc-content">${escapedContent}</div>
    <div class="doc-footer">
      Official Statutory Legal Format &bull; Republic of India
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    // Fallback if popups are blocked in the browser
    window.print();
  }
}

export function downloadWordDocument(filename, title, content) {
  const escapedContent = (content || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const docHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${title || "Legal Document"}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }
    h2 {
      text-align: center;
      text-transform: uppercase;
      font-size: 14pt;
      border-bottom: 2px solid #000;
      padding-bottom: 8px;
    }
    .content {
      white-space: pre-wrap;
      text-align: justify;
    }
  </style>
</head>
<body>
  <h2>${title || "LEGAL NOTICE / DRAFT"}</h2>
  <div class='content'>${escapedContent}</div>
</body>
</html>`;

  const blob = new Blob(["\ufeff", docHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename || "Legal_Document"}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
