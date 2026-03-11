from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent import run_agent
from models import AgentRequest, QuoteData
import uvicorn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.post("/ai_data", response_model=AgentRequest)
def get_ai_data(request: AgentRequest):
    print("Received request:", request)
    return run_agent(request)


@app.post("/data")
def receive_data(request: AgentRequest):
    print(request)
    return AgentRequest(
        message="Here is your updated data",
        formData=QuoteData(
            first_name="Jane",
            last_name="Doe",
            email="jane.doe@example.com",
            phone="555-867-5309",
            dob="1990-06-15",
            state="CA",
            vehicle_year="2020",
            vehicle_make="Toyota",
            vehicle_model="Camry",
            coverage_type="full",
            deductible="500",
        )
    )


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

if __name__ == "__main__":
    uvicorn.run("app:app", port=8005, log_level="info")