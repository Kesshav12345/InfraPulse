import os
import subprocess
import markdown

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(EDGE_PATH):
    EDGE_PATH = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

CSS_STYLE = """
@page {
    size: A4;
    margin: 18mm 16mm;
}
*, *:before, *:after {
    box-sizing: border-box;
}
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 10pt;
    margin: 0;
    padding: 0;
}
h1 {
    color: #002b50;
    font-size: 18pt;
    font-weight: 800;
    border-bottom: 2.5px solid #002b50;
    padding-bottom: 6px;
    margin-top: 0;
    margin-bottom: 12px;
}
h2 {
    color: #003b6f;
    font-size: 13pt;
    font-weight: 700;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
}
h3 {
    color: #1e40af;
    font-size: 11pt;
    font-weight: 700;
    margin-top: 14px;
    margin-bottom: 6px;
    page-break-after: avoid;
}
h4 {
    color: #334155;
    font-size: 10pt;
    font-weight: 600;
    margin-top: 10px;
    margin-bottom: 4px;
}
p {
    margin-top: 0;
    margin-bottom: 8px;
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 9pt;
    page-break-inside: avoid;
}
th {
    background-color: #002b50;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 7px 9px;
    border: 1px solid #002b50;
}
td {
    padding: 6px 9px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
}
tr:nth-child(even) {
    background-color: #f8fafc;
}
blockquote {
    border-left: 4px solid #0284c7;
    background-color: #f0f9ff;
    padding: 8px 12px;
    margin: 8px 0;
    border-radius: 0 6px 6px 0;
    color: #0f172a;
    page-break-inside: avoid;
}
blockquote p {
    margin: 4px 0;
}
code {
    background-color: #f1f5f9;
    color: #0f172a;
    padding: 1.5px 4px;
    border-radius: 3px;
    font-size: 8.5pt;
    font-family: Consolas, "Courier New", monospace;
}
pre {
    background-color: #0f172a;
    color: #f8fafc;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 8pt;
    overflow-x: auto;
    page-break-inside: avoid;
    line-height: 1.35;
    margin: 8px 0;
}
pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
}
hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 14px 0;
}
ul, ol {
    padding-left: 20px;
    margin: 6px 0;
}
li {
    margin-bottom: 3px;
}
strong {
    color: #0f172a;
    font-weight: 700;
}
.header-box {
    background: linear-gradient(135deg, #002b50 0%, #004b87 100%);
    color: white;
    padding: 14px 18px;
    border-radius: 6px;
    margin-bottom: 16px;
}
.header-box h1 {
    color: white;
    border-bottom: 1px solid rgba(255,255,255,0.3);
    margin: 0 0 6px 0;
    padding-bottom: 4px;
    font-size: 16pt;
}
.header-box p {
    margin: 2px 0;
    font-size: 9pt;
    opacity: 0.92;
}
"""

def convert(md_file, pdf_file, title):
    with open(md_file, "r", encoding="utf-8") as f:
        content = f.read()

    html_body = markdown.markdown(content, extensions=["tables", "fenced_code", "nl2br"])

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        {CSS_STYLE}
    </style>
</head>
<body>
    {html_body}
</body>
</html>"""

    temp_html = os.path.abspath(md_file.replace(".md", "_temp.html"))
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(full_html)

    pdf_out = os.path.abspath(pdf_file)
    file_url = "file:///" + temp_html.replace("\\", "/")

    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--print-to-pdf-no-header",
        f"--print-to-pdf={pdf_out}",
        file_url
    ]

    subprocess.run(cmd, check=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)

    print(f"Generated: {pdf_file} (Size: {os.path.getsize(pdf_out):,} bytes)")

if __name__ == "__main__":
    convert("SIH_PITCH_SCRIPT.md", "SIH_PITCH_SCRIPT.pdf", "SIH 2026 Pitch Script - Team AEGIS")
    convert("SIH_PROJECT_MASTER_BRIEF.md", "SIH_PROJECT_MASTER_BRIEF.pdf", "PAIMANA Intelligence - Master Technical Brief")
