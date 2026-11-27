#!/usr/bin/env python3
"""驾驶 HMI 实验 · 电脑端服务。

用法：python3 server.py [--port 8000] [--root ../../public/hmi-vr] [--data ../../output/hmi-vr-data]

- 提供实验页面（index.html、pre.html、post.html）
- 接收数据：POST …/log?pid=&sid=&kind=frames|events|cues|meta  → <pid>_<sid>_<kind>.csv / _meta.json
- 接收问卷：POST …/survey?pid=&form=pre|post                    → <pid>_survey_<form>.json，并汇总到 survey_<form>.csv
- 眼动数据：POST …/gaze {"x":…,"y":…,"open":…}（任意单位，页面里会校准）；GET …/gaze 取最新一条。
  加 --osc-port 9000 时同时监听 OSC（UDP）：/tracking/eye/CenterPitchYaw、/tracking/eye/LeftRightPitchYaw、
  /tracking/eye/EyesClosedAmount，以及 …/EyeX、…/EyeY 这类 -1…1 的参数。Cymple 套件实际发什么地址还没核对过，到货后先用 --osc-dump 看一眼。
- 状态心跳：POST …/status（头显端）/ GET …/status（电脑端查看）；POST …/cmd?c=recenter|end 给头显发指令
只依赖 Python 标准库。
"""
import argparse, csv, json, os, re, socket, struct, sys, threading, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
SAFE = re.compile(r'[^A-Za-z0-9_\-]')
LOCK = threading.Lock()
STATE = {'status': None, 'at': 0, 'cmd': None}
GAZE = {'x': 0.0, 'y': 0.0, 'open': 1.0, 'at': 0.0, 'n': 0, 'src': ''}


def osc_parse(data):
    """解析一条 OSC 消息（只取 float / int 参数）；bundle 递归展开。返回 [(地址, [数值…])]。"""
    def pad(i):
        return (i + 4) & ~3
    out = []
    if data.startswith(b'#bundle'):
        i = 16
        while i + 4 <= len(data):
            n = struct.unpack('>i', data[i:i + 4])[0]
            out += osc_parse(data[i + 4:i + 4 + n])
            i += 4 + n
        return out
    try:
        e = data.index(b'\0')
        addr = data[:e].decode('ascii', 'replace')
        i = pad(e)
        e2 = data.index(b'\0', i)
        tags = data[i + 1:e2].decode('ascii', 'replace')
        i = pad(e2)
        vals = []
        for t in tags:
            if t == 'f':
                vals.append(struct.unpack('>f', data[i:i + 4])[0]); i += 4
            elif t == 'i':
                vals.append(float(struct.unpack('>i', data[i:i + 4])[0])); i += 4
            elif t in 'TF':
                vals.append(1.0 if t == 'T' else 0.0)
            else:
                break
        out.append((addr, vals))
    except (ValueError, struct.error):
        pass
    return out


def osc_listen(port, dump):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind(('0.0.0.0', port))
    seen = set()
    while True:
        data, _ = sock.recvfrom(4096)
        for addr, v in osc_parse(data):
            if dump and addr not in seen:
                seen.add(addr)
                print(f'[osc] 新地址 {addr} {v}', flush=True)
            if not v:
                continue
            low = addr.lower()
            if addr.endswith('/CenterPitchYaw') and len(v) >= 2:      # VRChat：度；pitch 向下为正 → 这里统一成向上为正
                GAZE.update(x=v[1], y=-v[0])
            elif addr.endswith('/LeftRightPitchYaw') and len(v) >= 4:
                GAZE.update(x=(v[1] + v[3]) / 2, y=-(v[0] + v[2]) / 2)
            elif addr.endswith('/EyesClosedAmount'):
                GAZE['open'] = 1.0 - v[0]
                continue
            elif low.endswith('eyex') or low.endswith('eyesx') or low.endswith('eyeleftx') or low.endswith('eyerightx'):
                GAZE['x'] = v[0]
            elif low.endswith('eyey') or low.endswith('eyesy'):
                GAZE['y'] = v[0]
            else:
                continue
            GAZE.update(at=time.time(), src='osc')
            GAZE['n'] += 1


def clean(v, default='x'):
    return SAFE.sub('', v or '')[:40] or default


class Handler(SimpleHTTPRequestHandler):
    data_dir = '.'

    def log_message(self, fmt, *args):
        if os.environ.get('HMI_QUIET'):
            return
        if '/status' in (args[0] if args else ''):
            return
        super().log_message(fmt, *args)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path.endswith('/gaze'):
            age = (time.time() - GAZE['at']) * 1000 if GAZE['at'] else None
            return self._json({'x': GAZE['x'], 'y': GAZE['y'], 'open': GAZE['open'], 'ageMs': None if age is None else round(age, 1), 'n': GAZE['n'], 'src': GAZE['src']})
        if u.path.endswith('/status'):
            return self._json({'status': STATE['status'], 'ageSec': round(time.time() - STATE['at'], 1) if STATE['at'] else None})
        return super().do_GET()

    def do_POST(self):
        u = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(u.query).items()}
        n = int(self.headers.get('Content-Length') or 0)
        body = self.rfile.read(n) if n else b''
        name = u.path.rstrip('/').rsplit('/', 1)[-1]
        try:
            if name == 'log':
                pid, sid, kind = clean(q.get('pid')), clean(q.get('sid')), clean(q.get('kind'))
                if kind not in ('frames', 'events', 'cues', 'meta'):
                    return self._json({'ok': False, 'error': 'kind'}, 400)
                ext = 'json' if kind == 'meta' else 'csv'
                path = os.path.join(self.data_dir, f'{pid}_{sid}_{kind}.{ext}')
                with LOCK, open(path, 'wb' if kind == 'meta' else 'ab') as f:
                    f.write(body)
                return self._json({'ok': True})
            if name == 'survey':
                pid, form = clean(q.get('pid')), clean(q.get('form'))
                if form not in ('pre', 'post'):
                    return self._json({'ok': False, 'error': 'form'}, 400)
                rec = json.loads(body.decode('utf-8'))
                rec['pid'], rec['form'] = pid, form
                rec['received_at'] = time.strftime('%Y-%m-%dT%H:%M:%S')
                with LOCK:
                    with open(os.path.join(self.data_dir, f'{pid}_survey_{form}.json'), 'w', encoding='utf-8') as f:
                        json.dump(rec, f, ensure_ascii=False, indent=2)
                    flat = {'pid': pid, 'form': form, 'cond': rec.get('cond', ''), 'received_at': rec['received_at']}
                    flat.update({k: v for k, v in sorted((rec.get('answers') or {}).items())})
                    path = os.path.join(self.data_dir, f'survey_{form}.csv')
                    rows = []
                    if os.path.exists(path):
                        with open(path, newline='', encoding='utf-8') as f:
                            rows = [r for r in csv.DictReader(f) if r.get('pid') != pid]   # 同一编号重交则覆盖
                    rows.append(flat)
                    cols = ['pid', 'form', 'cond', 'received_at'] + sorted({k for r in rows for k in r} - {'pid', 'form', 'cond', 'received_at'})
                    with open(path, 'w', newline='', encoding='utf-8') as f:
                        w = csv.DictWriter(f, fieldnames=cols)
                        w.writeheader()
                        w.writerows(rows)
                return self._json({'ok': True})
            if name == 'gaze':
                g = json.loads(body.decode('utf-8'))
                GAZE.update(x=float(g['x']), y=float(g['y']), open=float(g.get('open', 1)), at=time.time(), src='post')
                GAZE['n'] += 1
                return self._json({'ok': True})
            if name == 'status':
                STATE['status'] = json.loads(body.decode('utf-8') or 'null')
                STATE['at'] = time.time()
                cmd, STATE['cmd'] = STATE['cmd'], None
                return self._json({'cmd': cmd})
            if name == 'cmd':
                STATE['cmd'] = clean(q.get('c'), '')
                return self._json({'ok': True})
        except Exception as e:  # noqa: BLE001
            return self._json({'ok': False, 'error': str(e)}, 500)
        return self._json({'ok': False, 'error': 'unknown'}, 404)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--port', type=int, default=8000)
    ap.add_argument('--root', default=os.path.join(HERE, '..', '..', 'public', 'hmi-vr'))
    ap.add_argument('--data', default=os.path.join(HERE, '..', '..', 'output', 'hmi-vr-data'))
    ap.add_argument('--osc-port', type=int, default=0, help='监听眼动套件发来的 OSC（UDP）；0 = 不监听')
    ap.add_argument('--osc-dump', action='store_true', help='把收到的每个新 OSC 地址打印一次，用来确认套件发什么')
    a = ap.parse_args()
    if a.osc_port:
        threading.Thread(target=osc_listen, args=(a.osc_port, a.osc_dump), daemon=True).start()
    root, data = os.path.abspath(a.root), os.path.abspath(a.data)
    os.makedirs(data, exist_ok=True)
    Handler.data_dir = data
    os.chdir(root)
    Handler.extensions_map.update({'.js': 'text/javascript', '.mjs': 'text/javascript'})
    print(f'实验页面: http://localhost:{a.port}/pre.html?pid=P01&cond=C\n页面目录: {root}\n数据目录: {data}', flush=True)
    ThreadingHTTPServer(('0.0.0.0', a.port), Handler).serve_forever()


if __name__ == '__main__':
    main()
