import re

def minify_css(file_in, file_out):
    with open(file_in, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*([\{\};,:>])\s*', r'\1', content)
    with open(file_out, 'w', encoding='utf-8') as f:
        f.write(content.strip())
        
minify_css('css/ux_enhancements.css', 'css/ux_enhancements.min.css')
print("Successfully minified css/ux_enhancements.css")

minify_css('css/style.css', 'css/style.min.css')
print("Successfully minified css/style.css")

def minify_js(file_in, file_out):
    with open(file_in, 'r', encoding='utf-8') as f:
        content = f.read()
    # Simple JS minification (removing multi-line comments and single line comments starting at new lines)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'^\s*//.*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'\n\s*\n', '\n', content)
    with open(file_out, 'w', encoding='utf-8') as f:
        f.write(content.strip())

minify_js('js/main.js', 'js/main.min.js')
print("Successfully minified js/main.js")
