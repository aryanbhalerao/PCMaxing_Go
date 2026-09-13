import os
import re

handlers_dir = r"C:\Users\aryan\repos\PCMaxing_Go\backend\handlers"

for filename in os.listdir(handlers_dir):
    if not filename.endswith(".go"):
        continue
    filepath = os.path.join(handlers_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content

    # 1. db.Conn.Exec(...) -> err := db.DB.Exec(...).Error
    # Usually it's _, err = db.Conn.Exec(...) or _, err := db.Conn.Exec(...)
    content = re.sub(r'_,?\s*err\s*(=|:=)\s*db\.Conn\.Exec\((.*?)\)', r'err \1 db.DB.Exec(\2).Error', content)
    
    # 2. db.Conn.QueryRow(...) -> db.DB.Raw(...).Row()
    content = re.sub(r'db\.Conn\.QueryRow\((.*?)\)', r'db.DB.Raw(\1).Row()', content)
    
    # 3. db.Conn.Query(...) -> db.DB.Raw(...).Rows()
    # It usually is rows, err := db.Conn.Query(...)
    content = re.sub(r'db\.Conn\.Query\((.*?)\)', r'db.DB.Raw(\1).Rows()', content)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filename}")
