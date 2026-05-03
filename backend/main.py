from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Code Reviewer by Gopal Awasthi", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file!")

client = genai.Client(api_key=GEMINI_API_KEY)


class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"


@app.get("/")
def root():
    return {"message": "AI Code Reviewer API by Gopal Awasthi", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/review")
async def review_code(request: CodeReviewRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    if len(request.code) > 10000:
        raise HTTPException(status_code=400, detail="Code too long. Max 10,000 characters.")

    prompt = f"""
You are an expert code reviewer. Review the following {request.language} code and return ONLY a JSON object. No markdown, no explanation, no code blocks, just raw JSON.

Code to review:
{request.code}

Return exactly this JSON structure:
{{
  "overall_score": <integer 1-10>,
  "summary": "<2-3 sentence overall assessment>",
  "correctness": {{
    "score": <integer 1-10>,
    "issues": [
      {{
        "line": "<line number or N/A>",
        "description": "<what is wrong>",
        "suggestion": "<how to fix it>"
      }}
    ]
  }},
  "security": {{
    "score": <integer 1-10>,
    "issues": [
      {{
        "line": "<line number or N/A>",
        "description": "<security vulnerability>",
        "suggestion": "<how to fix it>"
      }}
    ]
  }},
  "readability": {{
    "score": <integer 1-10>,
    "issues": [
      {{
        "line": "<line number or N/A>",
        "description": "<readability problem>",
        "suggestion": "<how to improve>"
      }}
    ]
  }},
  "improvements": [
    "<tip 1>",
    "<tip 2>",
    "<tip 3>"
  ]
}}

Rules:
- If no issues in a category, return empty array []
- Return ONLY valid raw JSON, nothing else
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        raw_text = response.text.strip()

        # Remove markdown code fences if present
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            raw_text = "\n".join(lines).strip()

        # Extract JSON object if extra text is present
        start = raw_text.find('{')
        end = raw_text.rfind('}')
        if start != -1 and end != -1:
            raw_text = raw_text[start:end+1]

        review_data = json.loads(raw_text)
        return review_data

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")
