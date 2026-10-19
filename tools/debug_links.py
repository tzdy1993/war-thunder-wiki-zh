import re

with open('test/site/6c38f581943f4a21.html', 'r', encoding='utf-8') as f:
    c1 = f.read()
    m1 = re.findall(r'<a[^>]+href=[\"\']([^\"\']+)[\"\'][^>]*>Centurions</a>', c1)
    print('Centurions href:', m1)

with open('test/site/778d30d3d2caa187.html', 'r', encoding='utf-8') as f:
    c2 = f.read()
    m2 = re.findall(r'<a[^>]+href=[\"\']([^\"\']+)[\"\'][^>]*>Русский</a>', c2)
    print('Russian href:', m2)
