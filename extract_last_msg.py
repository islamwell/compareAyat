import json

with open(r'C:\Users\dellTouch\.gemini\antigravity\brain\67448e8c-929a-43cd-9648-8d52e70609df\.system_generated\logs\transcript.jsonl', encoding='utf-8') as f:
    lines = f.readlines()

user_msgs = [json.loads(l) for l in lines if '"source":"USER_EXPLICIT"' in l]
if user_msgs:
    with open('last_msg.txt', 'w', encoding='utf-8') as out:
        out.write(user_msgs[-1]['content'])
