import json

transcript_path = r'C:\Users\csuzy\.gemini\antigravity\brain\516c4df1-ac0b-4775-8dde-699a44d35c9f\.system_generated\logs\transcript.jsonl'
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        content = str(data.get('content', ''))
        thinking = str(data.get('thinking', ''))
        if '法语' in content or 'French' in content or '法语' in thinking:
            step = data.get('step_index')
            source = data.get('source')
            print(f"Step {step} ({source}): {content[:150]}")
            if '法语' in thinking:
                print(f"   [Thinking snippet]: {thinking[:200]}")
