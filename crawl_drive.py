import urllib.request
import re
import json
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

categories = [
    {"name": "0. Đọc hướng dẫn trước khi học", "id": "1SMu-F5aQTllvxxa16SH_443F7cLZd65U"},
    {"name": "1. Công nghệ thông tin", "id": "1_zvtConf6gh-g6Hgj2S_ZP83FSeKFG43"},
    {"name": "2. Dựng Phim và Nhiếp ảnh", "id": "12BKneKYbNZFjs4z4KJytVSaEQ0E_aP8k"},
    {"name": "3. Đầu tư", "id": "1fysE4PrXld6tVGpnR3QGLztTiGlzq4Ir"},
    {"name": "4. Kiếm tiền & MMO", "id": "14dWz8nNw0MQLfP3tbx6PS06WB5af0i0O"},
    {"name": "5. Kinh Doanh Và Khởi Nghiệp", "id": "1saMGFwyW_xeDmULE5uMGr3m9RZ99HJJy"},
    {"name": "6. Khóa học Tiktok", "id": "1yC2yMZ2i4OLuSNEk8GK-G1B7x43aG-M2"},
    {"name": "7. Kỹ Năng Mềm", "id": "1phzKnaK2mEzv5MMtBfjshyWZ2fHp8-KA"},
    {"name": "8. Marketing", "id": "15FhakgWogaWohrNWK_NAMooWfTxQKYnB"},
    {"name": "9. Ngoại ngữ", "id": "1zlXmz9K2KvQUL0pDJZyQiFfCrEZ3Z7Nq"},
    {"name": "10. Thiết kế đồ họa", "id": "1C0B2cJcepibpnI2pYe3rfgTflKHvzfP4"},
    {"name": "11. Tin học văn phòng", "id": "1i5mKBzxLUa9Q6gJh6MQatvd6GBpINfd_"},
    {"name": "12. Khóa học khác", "id": "1iedB8mCgN_z0RcqPbSvy2c-rmISUwnBK"},
    {"name": "13. Khóa Học Update 2025", "id": "1cL3S9WrKnu8EJ9l-Ae0IbaCT0237TPLN"},
    {"name": "14. Quà tặng_ Ebook - Audio Book", "id": "1t9QyJAuN1AiU2p4pB8gHiraEZUiqqnml"},
    {"name": "15. Quà tặng_ tài nguyên", "id": "1c4sVDUgEhApziPBPTx_s5vCVhcQUHh-G"},
    {"name": "16. Khóa học mới", "id": "1YkyMmEbUqEFKovsVma4pdoHCKfx3a8tw"},
    {"name": "17. Khóa Học Facebook", "id": "1_a1iIivXvqs2kboqaI42cqxQoGQM-Sjy"},
    {"name": "18. Khóa Học Youtube", "id": "1L9JpY8_2BMkPSzGzju9zkJZkn2NgOG8p"},
    {"name": "19. Combo Khóa học", "id": "1nAQL0EsVKJGtwHHp_zEIHqKjKT9GnesR"}
]

all_data = []

def fetch_folder_items(fid):
    url = f"https://drive.google.com/drive/folders/{fid}?usp=sharing"
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        
        m = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'", html)
        if m:
            raw_val = m.group(1)
            decoded = re.sub(r'\\x([0-9a-fA-F]{2})', lambda match: chr(int(match.group(1), 16)), raw_val)
            decoded = decoded.replace(r'\/', '/')
            data = json.loads(decoded)
            items = data[0] if isinstance(data, list) and len(data) > 0 and isinstance(data[0], list) else data
            parsed = []
            for item in items:
                if isinstance(item, list) and len(item) >= 4:
                    parsed.append({
                        'id': item[0],
                        'name': item[2],
                        'mime': item[3],
                        'is_folder': 'folder' in str(item[3])
                    })
            return parsed
    except Exception as e:
        print(f"Error fetching {fid}: {e}")
    return []

print(f"Crawling {len(categories)} categories from Google Drive...")
for idx, cat in enumerate(categories):
    print(f"[{idx+1}/{len(categories)}] Fetching: {cat['name']} ({cat['id']})...")
    items = fetch_folder_items(cat['id'])
    print(f"  -> Found {len(items)} items")
    cat['children'] = items
    all_data.append(cat)
    time.sleep(0.3)

with open('crawled_drive_tree.json', 'w', encoding='utf-8') as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print("\nFinished crawling! Saved to crawled_drive_tree.json")
