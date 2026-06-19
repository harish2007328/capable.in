# Track pushes and pops between lines 1630 and 2420 in VenturePage.jsx
with open(r"c:\Users\Admin\OneDrive\Desktop\capable\src\pages\VenturePage.jsx", "r", encoding="utf-8") as f:
    content = f.read()

stack = []
i = 0
n = len(content)
line_no = 1
col_no = 1

while i < n:
    char = content[i]
    
    if char == '\n':
        line_no += 1
        col_no = 1
        i += 1
        continue
    elif char == '\r':
        if i + 1 < n and content[i+1] == '\n':
            i += 2
            line_no += 1
            col_no = 1
            continue
        line_no += 1
        col_no = 1
        i += 1
        continue
        
    # Skip single line comments
    if char == '/' and i + 1 < n and content[i+1] == '/':
        i += 2
        while i < n and content[i] not in ('\r', '\n'):
            i += 1
        continue
        
    # Skip multi-line comments
    if char == '/' and i + 1 < n and content[i+1] == '*':
        i += 2
        while i + 1 < n and not (content[i] == '*' and content[i+1] == '/'):
            if content[i] == '\n':
                line_no += 1
                col_no = 1
            i += 1
        i += 2
        continue
        
    # Skip string literals
    if char in ("'", '"', '`'):
        quote = char
        i += 1
        escaped = False
        while i < n:
            c = content[i]
            if escaped:
                escaped = False
            elif c == '\\':
                escaped = True
            elif c == quote:
                i += 1
                break
            if c == '\n':
                line_no += 1
                col_no = 1
            else:
                col_no += 1
            i += 1
        continue
        
    if char in ('{', '(', '['):
        stack.append((char, line_no, col_no))
        if 1630 <= line_no <= 2420:
            print(f"PUSH: {char} at line {line_no}, col {col_no}. Current stack depth: {len(stack)}")
    elif char in ('}', ')', ']'):
        if stack:
            top_char, top_line, top_col = stack[-1]
            match = {
                '}': '{',
                ')': '(',
                ']': '['
            }[char]
            if top_char == match:
                if 1630 <= line_no <= 2420:
                    print(f"POP : {char} at line {line_no}, col {col_no} matching {top_char} from line {top_line}, col {top_col}. Stack depth: {len(stack)-1}")
                stack.pop()
            else:
                if 1630 <= line_no <= 2420:
                    print(f"MISMATCH: {char} at line {line_no}, col {col_no} doesn't match {top_char} from line {top_line}, col {top_col}")
                stack.pop()
        else:
            if 1630 <= line_no <= 2420:
                print(f"EXTRA: {char} at line {line_no}, col {col_no}")
                
    col_no += 1
    i += 1
