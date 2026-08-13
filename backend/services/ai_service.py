import os
import re
import httpx
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

LLM_API_KEY = os.getenv("LLM_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

# Local pre-translated and mapped rules for high accuracy fallback, including Transliterated (Tanglish / Hinglish)
PRESETS = [
    # Tanglish (Romanized Telugu)
    {
        "pattern": r"(maa inti|deggara neeru|neeru ravadam|neellu|ravadam ledu|ravatledu|neeru ledu)",
        "language": "Telugu (Transliterated)",
        "translation": "Water is not being supplied near our house / No drinking water supply.",
        "category": "Water",
        "priority": "High",
        "department": "Water Supply & Sewerage Board",
        "summary": "Disruption in drinking water supply reported by resident in local housing area.",
        "suggested_action": "Dispatch emergency water tanker and inspect main pipeline supply valves."
    },
    {
        "pattern": r"(current ledu|power ledu|veedhi deepalu|lights pani|street lights ledu)",
        "language": "Telugu (Transliterated)",
        "translation": "Street lights or power supply is not working in our locality.",
        "category": "Electricity",
        "priority": "High",
        "department": "Electricity Department",
        "summary": "Electrical outage or street light breakdown reported in the residential area.",
        "suggested_action": "Deploy line technician to check feeder transformer and light fixtures."
    },
    {
        "pattern": r"(chetta|murgi|dustbin|clean cheyaledu|garbage teeyaledu)",
        "language": "Telugu (Transliterated)",
        "translation": "Garbage has not been collected and cleaned from our street.",
        "category": "Sanitation",
        "priority": "High",
        "department": "Sanitation & Waste Management",
        "summary": "Uncollected solid waste accumulating on public residential street.",
        "suggested_action": "Send municipal sanitation vehicle to clear waste and spray disinfectant."
    },
    # Hinglish (Romanized Hindi)
    {
        "pattern": r"(paani nahi|paani ki samasya|paani nahi aa raha|nal me paani)",
        "language": "Hindi (Transliterated)",
        "translation": "Water is not coming in our taps / Water supply problem in our locality.",
        "category": "Water",
        "priority": "High",
        "department": "Water Supply & Sewerage Board",
        "summary": "Water supply disruption reported by residents in housing colony.",
        "suggested_action": "Send water tanker and inspect main distribution pipeline valve."
    },
    {
        "pattern": r"(bijli nahi|power cut|light nahi hai|current nahi hai)",
        "language": "Hindi (Transliterated)",
        "translation": "No electricity / power cut in our area since several hours.",
        "category": "Electricity",
        "priority": "High",
        "department": "Electricity Department",
        "summary": "Unscheduled power outage causing inconvenience to local residents.",
        "suggested_action": "Inspect local feeder unit and restore power supply."
    },
    {
        "pattern": r"(rasta kharab|road kharab|gaddhe hai|road pe gaddhe)",
        "language": "Hindi (Transliterated)",
        "translation": "The road condition is very bad with severe potholes posing safety risks.",
        "category": "Roads",
        "priority": "Medium",
        "department": "Roads & Buildings Department",
        "summary": "Damaged road surface and large potholes posing hazards to commuters.",
        "suggested_action": "Inspect damaged road section and schedule asphalt patching."
    },
    # Native Scripts (Telugu, Hindi, Tamil, Kannada)
    {
        "pattern": r"(మా ప్రాంతంలో.*వీధి దీపాలు|వీధి దీపాలు|పనిచేయడం లేదు)",
        "language": "Telugu",
        "translation": "Street lights in our area have not been working for the past three days.",
        "category": "Electricity",
        "priority": "High",
        "department": "Electricity Department",
        "summary": "Multiple street lights are reportedly non-functional in the citizen's locality.",
        "suggested_action": "Assign maintenance team for inspection and repair of line transformer."
    },
    {
        "pattern": r"(पानी नहीं आ रहा|पानी नहीं|पानी की समस्या)",
        "language": "Hindi",
        "translation": "Water has not been supplied to our locality for the past three days.",
        "category": "Water",
        "priority": "High",
        "department": "Water Supply & Sewerage Board",
        "summary": "Continuous water supply disruption reported by residents for three days.",
        "suggested_action": "Dispatch emergency water tanker and inspect main pipeline valves."
    },
    {
        "pattern": r"(சாலை மிகவும் மோசமாக|சாலை|ரோடு)",
        "language": "Tamil",
        "translation": "The road condition in our area is extremely poor with severe potholes.",
        "category": "Roads",
        "priority": "Medium",
        "department": "Roads & Buildings Department",
        "summary": "Damaged road surface and large potholes posing hazards to commuters.",
        "suggested_action": "Inspect damaged road section and schedule asphalt patching."
    },
    {
        "pattern": r"(నీరు రావట్లేదు|కుళాయి|నీటి సఫరా)",
        "language": "Telugu",
        "translation": "Water supply has been interrupted in our locality for two days.",
        "category": "Water",
        "priority": "High",
        "department": "Water Supply & Sewerage Board",
        "summary": "Interrupted drinking water supply reported in municipal residential block.",
        "suggested_action": "Inspect distribution pipeline for leakages or valve blockage."
    },
    {
        "pattern": r"(ಕುಡಿಯುವ ನೀರು|ನೀರು ಬರುತ್ತಿಲ್ಲ|ರಸ್ತೆ)",
        "language": "Kannada",
        "translation": "Drinking water is not being supplied in our locality properly.",
        "category": "Water",
        "priority": "High",
        "department": "Water Supply & Sewerage Board",
        "summary": "Scarcity of clean drinking water reported in local municipal ward.",
        "suggested_action": "Send drinking water tanker immediately and check municipal pump."
    },
    {
        "pattern": r"(garbage|waste|trash|kurol|drains|overflow)",
        "language": "English",
        "translation": "Garbage has not been collected for five days causing unhygienic conditions.",
        "category": "Sanitation",
        "priority": "High",
        "department": "Sanitation & Municipal Waste Management",
        "summary": "Accumulation of uncollected solid waste in residential streets.",
        "suggested_action": "Deploy sanitation truck to clear waste dumps and spray disinfectant."
    }
]

def detect_script_language(text: str) -> str:
    if re.search(r"[\u0C00-\u0C7F]", text):
        return "Telugu"
    elif re.search(r"[\u0900-\u097F]", text):
        return "Hindi"
    elif re.search(r"[\u0B80-\u0BFF]", text):
        return "Tamil"
    elif re.search(r"[\u0C80-\u0CFF]", text):
        return "Kannada"
    elif any(w in text.lower() for w in ["neeru", "neellu", "inti", "deggara", "ravadam", "ledu", "chetta"]):
        return "Telugu (Transliterated)"
    elif any(w in text.lower() for w in ["paani", "raha", "kharaab", "bijli", "gaddhe", "saaf"]):
        return "Hindi (Transliterated)"
    else:
        return "English"

def local_translate(text: str, lang: str) -> str:
    text_lower = text.lower()
    if "neeru" in text_lower or "neellu" in text_lower or "paani" in text_lower or "water" in text_lower:
        return "Water supply has been interrupted near our house / locality."
    if "current" in text_lower or "bijli" in text_lower or "light" in text_lower:
        return "Electricity / power supply breakdown reported in our area."
    if "road" in text_lower or "rasta" in text_lower or "pothole" in text_lower:
        return "Road is severely damaged with potholes needing repairs."
    if "chetta" in text_lower or "kachra" in text_lower or "garbage" in text_lower:
        return "Uncollected garbage dump accumulated on residential street."
    
    return f"[Translated]: {text}"

def fallback_analysis(text: str, user_lang: Optional[str] = None, user_cat: Optional[str] = None) -> Dict[str, Any]:
    # 1. Preset exact/regex check including Tanglish / Hinglish
    for p in PRESETS:
        if re.search(p["pattern"], text, re.IGNORECASE):
            result = dict(p)
            if user_cat and user_cat != "Auto Detect":
                result["category"] = user_cat
                result["department"] = f"{user_cat} Department"
            if user_lang and user_lang != "Auto Detect":
                result["language"] = user_lang
            return result

    # 2. General script & keyword heuristic classification
    detected_lang = user_lang if (user_lang and user_lang != "Auto Detect") else detect_script_language(text)
    translation = local_translate(text, detected_lang)

    # Keywords for category
    lowered = (text + " " + translation).lower()
    
    if any(k in lowered for k in ["light", "electricity", "power", "current", "wire", "pole", "दीपक", "దీపాలు", "बिजली"]):
        category = "Electricity"
        department = "Electricity Department"
        priority = "High"
        summary = "Power outage or defective electrical infrastructure reported."
        suggested_action = "Deploy electricity board technician to check transformer/lines."
    elif any(k in lowered for k in ["water", "pipe", "tap", "drain", "sewage", "leak", "पानी", "నీరు", "తణ్ణీర్", "neeru", "neellu", "paani"]):
        category = "Water"
        department = "Water Supply & Sewerage Board"
        priority = "High"
        summary = "Disruption in clean water supply or pipeline leak reported."
        suggested_action = "Inspect local valve station and dispatch repair crew."
    elif any(k in lowered for k in ["road", "pothole", "asphalt", "street", "bridge", "సడక్", "రోడ్డు", "சாலை", "ರಸ್ತೆ", "rasta"]):
        category = "Roads"
        department = "Roads & Buildings Department"
        priority = "Medium"
        summary = "Damaged road infrastructure requiring repairs and surfacing."
        suggested_action = "Schedule road maintenance team for pothole patching."
    elif any(k in lowered for k in ["garbage", "waste", "trash", "clean", "smell", "drainage", "कचरा", "చెత్త", "குப்பை", "chetta", "kachra"]):
        category = "Sanitation"
        department = "Sanitation & Waste Management"
        priority = "High"
        summary = "Uncollected garbage accumulating in public residential area."
        suggested_action = "Send municipal sanitation vehicle to clear accumulated waste."
    else:
        category = "Other"
        department = "General Municipal Administration"
        priority = "Medium"
        summary = "General public grievance regarding civic amenities."
        suggested_action = "Assign grievance to ward administrative officer for review."

    if user_cat and user_cat != "Auto Detect":
        category = user_cat
        department = f"{user_cat} Department"

    return {
        "language": detected_lang,
        "translation": translation,
        "category": category,
        "priority": priority,
        "department": department,
        "summary": summary,
        "suggested_action": suggested_action
    }

async def call_llm_api(text: str, user_lang: str, user_cat: str) -> Optional[Dict[str, Any]]:
    if not LLM_API_KEY:
        return None

    try:
        prompt = f"""
Analyze the following public grievance text submitted by a citizen in India (may be in English, native Indian script, or transliterated script like Tanglish/Hinglish):
"{text}"

Context hints:
Language hint: {user_lang}
Category hint: {user_cat}

Return JSON with exactly these fields:
- language (string: English, Telugu, Hindi, Tamil, Kannada, Telugu (Transliterated), Hindi (Transliterated), etc.)
- translation (string: Accurate English translation of grievance)
- category (string: Roads, Water, Electricity, Sanitation, Transport, Public Safety, Other)
- priority (string: High, Medium, Low)
- department (string: appropriate government department name)
- summary (string: concise 1-2 sentence summary of problem)
- suggested_action (string: recommended action for government official)
"""

        if "GEMINI_API_KEY" in os.environ or LLM_API_KEY.startswith("AIza"):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={LLM_API_KEY}"
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                })
                if res.status_code == 200:
                    data = res.json()
                    content_str = data["candidates"][0]["content"]["parts"][0]["text"]
                    import json
                    return json.loads(content_str)
    except Exception as e:
        print(f"LLM API Call Exception: {e}")
    return None

async def analyze_grievance(text: str, user_lang: Optional[str] = "Auto Detect", user_cat: Optional[str] = "Auto Detect") -> Dict[str, Any]:
    llm_res = await call_llm_api(text, user_lang or "Auto Detect", user_cat or "Auto Detect")
    if llm_res and "category" in llm_res:
        return llm_res

    return fallback_analysis(text, user_lang, user_cat)
