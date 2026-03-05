# Insurance Signup Form Editor — v2 (React + TypeScript + Vite)

An interactive insurance signup form with a chat-based command interface. Edit the form live by typing commands in the chat panel on the right.

## Getting Started

```bash
npm install
npm run dev      # http://localhost:5173
```

---

## Chat Commands

### Page-level

| Command | Effect |
|---|---|
| `title <text>` | Change the company title |
| `tagline <text>` | Change the tagline |
| `heading <text>` | Change the form heading |
| `button text <text>` | Change the submit button label |
| `button color <color>` | Change the button color (hex or CSS name) |
| `background <color>` | Change the page background color |

### Input fields

All field commands take a **field ID** as the first argument.

| Command | Effect |
|---|---|
| `label <field-id> <text>` | Rename a field's label |
| `placeholder <field-id> <text>` | Set placeholder text |
| `fill <field-id> <value>` | Pre-fill a field with a value |
| `clear <field-id>` | Clear a field's value |
| `require <field-id>` | Mark a field as required |
| `optional <field-id>` | Mark a field as optional |

**Static field IDs:**
`first-name`, `last-name`, `email`, `phone`, `dob`, `insurance-type`, `password`, `confirm-password`

### Dynamic fields

| Command | Effect |
|---|---|
| `add field <label>` | Add a new text input (ID auto-generated from label) |
| `remove field <label>` | Remove a previously added field |

### Load from API

```
load <url>
```

Fetches a JSON schema from the given URL and applies it to the form. Relative paths (e.g. `/api/schema.json`) are supported via the Vite dev proxy.

#### JSON schema format

All keys are optional — only fields present in the JSON are updated.

```json
{
  "page": {
    "title":    "Acme Corp Insurance",
    "tagline":  "Coverage you can count on",
    "heading":  "Open an Account",
    "btnText":  "Submit",
    "btnColor": "#2d6a4f",
    "bgColor":  "#f8f9fa"
  },
  "fields": {
    "first-name": {
      "label":       "Given Name",
      "placeholder": "e.g. Jane",
      "value":       "Jane",
      "required":    true
    },
    "email": {
      "label": "Work Email",
      "value": "jane@company.com"
    }
  },
  "addFields": [
    { "label": "Company Name" },
    { "label": "Employee ID" }
  ],
  "removeFields": ["phone"]
}
```

| Key | Type | Description |
|---|---|---|
| `page` | object | Page-level property overrides |
| `fields` | object | Keyed by field ID; updates label, placeholder, value, or required flag |
| `addFields` | array | Adds new dynamic text inputs |
| `removeFields` | array of field IDs | Removes previously added dynamic fields |

#### Serving a local JSON file

The Vite dev proxy forwards `/api/*` to `http://localhost:3001/*`, so you can serve a local JSON file without CORS issues:

```bash
# In the app-http-requets/ directory
npx serve -p 3001 .
```

Then in the chat:

```
load /api/app-v2-request.json
```

### Other

| Command | Effect |
|---|---|
| `help` | Show a command summary in the chat |

---

## Dev Proxy

Configured in [`vite.config.ts`](vite.config.ts):

```
/api/* → http://localhost:3001/*
```

Useful for loading JSON schemas from a local file server without hitting CORS restrictions.

## Build

```bash
npm run build    # TypeScript compile + Vite bundle → dist/
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```
