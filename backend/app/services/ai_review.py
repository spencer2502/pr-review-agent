import random

async def analyze_pr(pr_url: str):
    # Mock scoring (later connect OpenAI or Codemate Build)
    risk_score = random.randint(1, 100)
    review_notes = [
        "Check variable naming conventions.",
        "Ensure error handling is added.",
        "This might affect database performance."
    ]
    return {
        "pr_url": pr_url,
        "risk_score": risk_score,
        "notes": random.sample(review_notes, 2)
    }
