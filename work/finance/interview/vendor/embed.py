"""Build the self-contained, local-only CV reader scripts for the interview page."""
from pathlib import Path

VENDOR = Path(__file__).resolve().parent


def resume_scripts():
    def source(name):
        text = (VENDOR / name).read_text()
        if '</script' in text.lower():
            raise ValueError(f'Unexpected script closing tag in {name}')
        return text

    return '\n'.join([
        '<script>' + source('fflate.min.js') + '</script>',
        '<script type="application/octet-stream" id="hkinterview-pdf-module">' + source('pdf.min.mjs') + '</script>',
        '<script type="application/octet-stream" id="hkinterview-pdf-worker">' + source('pdf.worker.min.mjs') + '</script>',
        '<script type="application/json" id="hkinterview-pdf-cmaps">' + source('pdf-cmaps.json') + '</script>',
        '<script>' + (VENDOR.parent / 'resume-reader.js').read_text() + '</script>',
    ])


if __name__ == '__main__':
    print(resume_scripts())
