from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import time
import logging

app = FastAPI()
logger = logging.getLogger("uvicorn.error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
class MajorsRequest(BaseModel):
    majors: List[str]


class ClassifyResponse(BaseModel):
    categories: List[str]


@app.post("/classify", response_model=ClassifyResponse)
async def classify(req: MajorsRequest):
    results = []
    for m in req.majors:
        # simple mock: if "engineer" in text → Engineer
        if "engineer" in m.lower():
            results.append("Engineer")
        else:
            results.append("Non-Engineer")
    return {"categories": results}

# If you want real LLM:
# import openai
# @app.post("/classify")
# async def classify(req: MajorsRequest):
#     try:
#         resp = openai.ChatCompletion.create(
#             model="gpt-4o-mini",
#             messages=[{"role":"system","content":"Classify each major as Engineer or Non-Engineer."},
#                       {"role":"user","content": "\n".join(req.majors)}]
#         )
#         text = resp.choices[0].message.content.strip()
#         # parse text into list… (e.g. JSON or newline-split)
#     except Exception as e:
#         logger.error("LLM error: %s", e)
#         raise HTTPException(status_code=502, detail="LLM failure")
