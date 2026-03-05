# Page Editor – Chat Commands

## Page-Level Commands

| Command | Example |
|---|---|
| `title <text>` | `title SafeGuard Pro` |
| `tagline <text>` | `tagline Your safety, our priority` |
| `heading <text>` | `heading Join Us Today` |
| `button text <text>` | `button text Sign Me Up` |
| `button color <color>` | `button color #e63946` |
| `background <color>` | `background #dce8f5` |
| `add field <label>` | `add field Middle Name` |
| `remove field <label>` | `remove field Middle Name` |

---

## Input Field Commands

All input field commands require a **field ID** as the first argument.

| Command | Effect | Example |
|---|---|---|
| `label <field-id> <text>` | Change the field's label | `label first-name Given Name` |
| `placeholder <field-id> <text>` | Change the placeholder text | `placeholder email you@domain.com` |
| `fill <field-id> <value>` | Pre-fill the input with a value | `fill phone (555) 123-4567` |
| `clear <field-id>` | Clear the input's value | `clear email` |
| `require <field-id>` | Make the field required | `require phone` |
| `optional <field-id>` | Remove the required constraint | `optional dob` |

---

## Field IDs

| Field ID | Form Field |
|---|---|
| `first-name` | First Name |
| `last-name` | Last Name |
| `email` | Email Address |
| `phone` | Phone Number |
| `dob` | Date of Birth |
| `insurance-type` | Insurance Type (select dropdown) |
| `password` | Password |
| `confirm-password` | Confirm Password |

> **Note:** Fields added with `add field <label>` get an auto-generated ID based on the label (spaces replaced with dashes, lowercased). For example, `add field Middle Name` creates a field with id `middle-name`.

---

## Other Commands

| Command | Description |
|---|---|
| `help` | Show a summary of all available commands |
