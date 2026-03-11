from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from models import AgentRequest, QuoteData
from dotenv import load_dotenv
load_dotenv() 

def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"


openai_model = ChatOpenAI(
    model="gpt-5-mini",
)

agent = create_agent(
    model=openai_model,
    system_prompt="You are a helpful auto insurance quote assistant. " \
    "Help the user fill out their auto insurance quote form with their personal info, vehicle details, and coverage preferences. Don't modify existing data unless the user has asked for it." \
    "Deductible options are 500,1000,2000" \
    "Coverage Types are liability,collision,comprehensive,full" \
    "The State should be a valid US state abbreviation.",
    response_format=AgentRequest,
)


def run_agent(request) -> QuoteData:
    ai_message = agent.invoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": f"User message ${request.message} with Data ${request}",
                }
            ]
        }
    )
    print("AI Message:", ai_message["structured_response"])
    return ai_message["structured_response"]
