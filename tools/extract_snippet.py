with open('test/site/778d30d3d2caa187.html', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('Русский')
if pos != -1:
    snippet = text[max(0, pos-300):min(len(text), pos+300)]
    with open('tools/russian_snippet.html', 'w', encoding='utf-8') as out:
        out.write(snippet)
