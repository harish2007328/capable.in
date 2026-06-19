import re

with open(r'c:\Users\Admin\OneDrive\Desktop\capable\src\pages\VenturePage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Print lines with companyName or idea or validation or sprint
    if any(k in line.lower() for k in ['companyname', 'idea', 'sprint', 'validation', 'progress']):
        if 1800 <= i+1 <= 2150:
            print(f"{i+1}: {line.strip()}")
