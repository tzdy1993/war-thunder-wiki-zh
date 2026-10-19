import json

transcript_path = r'C:\Users\csuzy\.gemini\antigravity\brain\516c4df1-ac0b-4775-8dde-699a44d35c9f\.system_generated\logs\transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('step_index') in [5338, 5407]:
            print(f"=== Step {data.get('step_index')} ===")
            print(data.get('content'))
