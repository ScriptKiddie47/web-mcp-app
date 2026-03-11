# SafeGuard Insurance — AI-Powered Auto Quote App

A two-part project: a **React frontend** that renders a live auto insurance quote form, and a **Python backend** that powers a natural-language chat assistant to fill it out.

```
web-mcp-app/
├── app-v2-react-state-management/   # React 19 + TypeScript frontend
├── web-agent-app/                   # FastAPI + LangChain backend
├── app-v1-only-html-js-manipulation/# Vanilla HTML/JS version (reference)
└── app-http-requets/                # Local JSON file server for testing
```

---

## How It Works

The user types a natural-language message in the chat panel (e.g. *"2019 Toyota Camry, full coverage"*). The frontend sends the message and current form state to the backend. The LangChain agent parses the input and returns a structured response that auto-fills matching form fields.

```
Browser (React)  ──POST /ai_data──▶  FastAPI (Python)
                                          │
                                     LangChain Agent
                                     (OpenAI GPT model)
                                          │
                 ◀── JSON formData ───────┘
```

---

## app-v2 — React Frontend

**Stack:** React 19, TypeScript, Vite

### Setup

```bash
cd app-v2-react-state-management
npm install
npm run dev        # http://localhost:5173
```

### Form Fields

**Personal Information**

| Field ID | Label |
|---|---|
| `first-name` | First Name |
| `last-name` | Last Name |
| `email` | Email |
| `phone` | Phone |
| `dob` | Date of Birth |
| `state` | State (US abbreviation) |

**Vehicle Details**

| Field ID | Label |
|---|---|
| `vehicle-year` | Year |
| `vehicle-make` | Make |
| `vehicle-model` | Model |

**Coverage**

| Field ID | Label | Options |
|---|---|---|
| `coverage-type` | Coverage Type | `liability`, `collision`, `comprehensive`, `full` |
| `deductible` | Deductible | `500`, `1000`, `2000` |

### Chat Interface

Type in the chat panel and press **Enter** or click **Send**. The assistant fills in matching fields based on your message.

**Example inputs:**
```
2019 Toyota Camry, full coverage
My name is Jane Doe, email jane@example.com
I live in California, deductible $1000
```

### Quote Ready Banner

The "Your Quote is Ready" banner appears once both `coverage-type` and at least one vehicle field (`year`, `make`, or `model`) are filled.

### API Endpoint

The frontend posts to `http://localhost:8005/ai_data`:

```json
{
  "message": "2019 Toyota Camry full coverage",
  "formData": {
    "first-name": "",
    "last-name": "",
    "email": "",
    "phone": "",
    "dob": "",
    "state": "",
    "vehicle-year": "",
    "vehicle-make": "",
    "vehicle-model": "",
    "coverage-type": "",
    "deductible": ""
  }
}
```

Response shape mirrors the same structure with updated field values and a `message` string for the chat bubble.

### Build Commands

```bash
npm run build      # TypeScript compile + Vite bundle → dist/
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## web-agent-app — Python Backend

**Stack:** FastAPI, LangChain, OpenAI, Pydantic, Uvicorn

### Setup

```bash
cd web-agent-app
pip install -r requirements.txt
```

Create a `.env` file with your OpenAI API key:

```env
OPENAI_API_KEY=sk-...
```

Start the server:

```bash
python app.py       # http://localhost:8005
```

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/ai_data` | Main endpoint — runs the LangChain agent, returns updated form data |
| `POST` | `/data` | Stub endpoint — returns hardcoded sample data (for testing) |
| `GET` | `/` | Health check |

### Agent Behavior

The agent is configured with a system prompt that instructs it to:

- Help fill out an auto insurance quote form
- Not overwrite existing field values unless the user asks
- Enforce valid deductible values: `500`, `1000`, `2000`
- Enforce valid coverage types: `liability`, `collision`, `comprehensive`, `full`
- Enforce valid US state abbreviations

### Data Models (`models.py`)

```python
class QuoteData(BaseModel):
    first_name:    str   # alias: first-name
    last_name:     str   # alias: last-name
    email:         str
    phone:         str
    dob:           str
    state:         str
    vehicle_year:  str   # alias: vehicle-year
    vehicle_make:  str   # alias: vehicle-make
    vehicle_model: str   # alias: vehicle-model
    coverage_type: str   # alias: coverage-type
    deductible:    str

class AgentRequest(BaseModel):
    message:  str
    formData: QuoteData
```

---

## Running Both Together

Open two terminals:

```bash
# Terminal 1 — Backend
cd web-agent-app && python app.py

# Terminal 2 — Frontend
cd app-v2-react-state-management && npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## app-v1 — Vanilla HTML Reference

`app-v1-only-html-js-manipulation/` is a single-file (`signup.html`) version of a form editor with a chat command interface. It operates entirely in the browser with no backend. See `app-v1-only-html-js-manipulation/COMMANDS.md` for the full command reference.

---

## License

See [LICENSE](LICENSE).
