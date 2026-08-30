import glob
import re
import os

static_root = 'src/main/resources/static'
paths = [p for p in glob.glob(static_root + '/**/*.*', recursive=True) if p.endswith(('.html', '.js'))]
endpoints = set()
for path in paths:
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    for m in re.finditer(r'fetch\(\s*["`\'](/api[^"`\'\)\]\} ]*)', text):
        endpoints.add(m.group(1))
    for m in re.finditer(r'APP\.api\.(?:get|post|put|delete)\(\s*["`\']?(/[^"`\'\)\]\} ]*)', text):
        endpoints.add(m.group(1))
print('STATIC ENDPOINTS:')
for e in sorted(endpoints):
    print(e)
print('TOTAL STATIC', len(endpoints))

backend_root = 'src/main/java/com/vertex/projects/controller'
route_map = []
for path in glob.glob(backend_root + '/**/*.java', recursive=True):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    class_bases = re.findall(r'@RequestMapping\(\s*"([^"\)]*)"\s*\)', text)
    if not class_bases:
        continue
    base = class_bases[-1]
    for m in re.finditer(r'@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)\(\s*"([^"\)]*)"\s*\)', text):
        route_map.append((os.path.relpath(path), base + m.group(2)))
print('\nBACKEND ROUTES:')
for path, route in sorted(route_map, key=lambda x:(x[1], x[0])):
    print(f'{route}\t({path})')
print('TOTAL BACKEND', len(route_map))
