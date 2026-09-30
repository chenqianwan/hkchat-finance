"""Build the independent finance photo-detail game; legal sources stay untouched."""
from pathlib import Path
from PIL import Image
import base64, json

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ASSETS = ROOT / 'outputs/hkchat-finance/assets'

def photo(name):
    return 'data:image/webp;base64,' + base64.b64encode((ASSETS / name).read_bytes()).decode()

scenes = json.loads((HERE / 'spot-scenes.json').read_text())
for scene in scenes:
    name = f"spot-{scene['id']}.webp"
    scene['width'], scene['height'] = Image.open(ASSETS / name).size
    scene['src'] = photo(name)
    assert len(scene['clues']) == 3
    for clue in scene['clues']:
        r = clue['rect']
        assert 0 <= r['x'] < r['x'] + r['w'] <= 100
        assert 0 <= r['y'] < r['y'] + r['h'] <= 100

js = (HERE / 'spot-mobile.js').read_text()
js = js.replace('__SPOT_SCENES__', json.dumps(scenes, ensure_ascii=False).replace('</', '<\\/'))
js = js.replace('__SPOT_HOME_PHOTO__', json.dumps(photo('home-spot.webp')))
css = (HERE / 'spot-mobile.css').read_text()
html = '<style>' + css + '</style>\n<div id="hkspot" lang="zh-HK"><header class="p-top">HKChat Finance</header><main class="spot-main" id="spot-main"></main></div>\n<script>' + js + '</script>\n'
(HERE / 'spot-fragment.html').write_text(html)
print('Finance spot: 3 AI photo scenes, 9 mapped clues')
