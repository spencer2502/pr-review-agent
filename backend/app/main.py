from fastapi import FastAPI
# from app.routes import review

app = FastAPI()

@app.get("/")
def root():
    return{"msg": "PR Review Agent Backend running"}

# app.include_router(review.router,prefix='/reviewu')