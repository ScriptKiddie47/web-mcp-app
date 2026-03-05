import { useState, useRef, useEffect } from 'react'
import './App.css'

type MsgCls = 'bot' | 'user' | 'bot ok' | 'bot err'

interface Message {
  text: string
  cls: MsgCls
}

interface ExtraField {
  label: string
  fieldId: string
}

interface FieldSchema {
  label?:       string
  placeholder?: string
  required?:    boolean
  value?:       string
}

interface FormSchema {
  page?: {
    title?:    string
    tagline?:  string
    heading?:  string
    btnText?:  string
    btnColor?: string
    bgColor?:  string
  }
  fields?:       Record<string, FieldSchema>
  addFields?:    { label: string }[]
  removeFields?: string[]
}

const STATIC_FIELD_IDS = new Set([
  'first-name', 'last-name', 'email', 'phone', 'dob',
  'insurance-type', 'password', 'confirm-password',
])

const DEFAULT_LABELS: Record<string, string> = {
  'first-name': 'First Name',
  'last-name': 'Last Name',
  'email': 'Email Address',
  'phone': 'Phone Number',
  'dob': 'Date of Birth',
  'insurance-type': 'Insurance Type',
  'password': 'Password',
  'confirm-password': 'Confirm Password',
}

const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  'first-name': 'Jane',
  'last-name': 'Doe',
  'email': 'jane@example.com',
  'phone': '(555) 000-0000',
  'dob': '',
  'insurance-type': '',
  'password': 'Min. 8 characters',
  'confirm-password': 'Re-enter password',
}

const DEFAULT_REQUIRED: Record<string, boolean> = {
  'first-name': true,
  'last-name': true,
  'email': true,
  'phone': false,
  'dob': true,
  'insurance-type': true,
  'password': true,
  'confirm-password': true,
}

export default function App() {
  // Page-level state
  const [title, setTitle] = useState('🛡 SafeGuard Insurance')
  const [tagline, setTagline] = useState('Protecting what matters most')
  const [heading, setHeading] = useState('Create Your Account')
  const [btnText, setBtnText] = useState('Create Account')
  const [btnColor, setBtnColor] = useState('#1a4a8a')
  const [bgColor, setBgColor] = useState('#f0f4f8')

  // Per-field override state
  const [fieldLabels, setFieldLabels] = useState<Record<string, string>>({})
  const [fieldPlaceholders, setFieldPlaceholders] = useState<Record<string, string>>({})
  const [fieldRequired, setFieldRequired] = useState<Record<string, boolean>>({})
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})

  // Dynamically added fields
  const [extraFields, setExtraFields] = useState<ExtraField[]>([])

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Hello! Use the commands below to edit this page.', cls: 'bot' },
  ])
  const [chatInput, setChatInput] = useState('')

  const chatBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [messages])

  // Helpers to resolve effective field properties
  const getLabel = (id: string) =>
    fieldLabels[id] ??
    DEFAULT_LABELS[id] ??
    extraFields.find(f => f.fieldId === id)?.label ??
    id

  const getPlaceholder = (id: string) =>
    fieldPlaceholders[id] ?? DEFAULT_PLACEHOLDERS[id] ?? ''

  const getRequired = (id: string) =>
    fieldRequired[id] ?? DEFAULT_REQUIRED[id] ?? false

  const getValue = (id: string) => fieldValues[id] ?? ''

  const setFieldValue = (id: string, value: string) =>
    setFieldValues(prev => ({ ...prev, [id]: value }))

  function applySchema(schema: FormSchema): string[] {
    const applied: string[] = []

    if (schema.page) {
      const p = schema.page
      if (p.title    !== undefined) { setTitle(p.title);       applied.push('title') }
      if (p.tagline  !== undefined) { setTagline(p.tagline);   applied.push('tagline') }
      if (p.heading  !== undefined) { setHeading(p.heading);   applied.push('heading') }
      if (p.btnText  !== undefined) { setBtnText(p.btnText);   applied.push('btnText') }
      if (p.btnColor !== undefined) { setBtnColor(p.btnColor); applied.push('btnColor') }
      if (p.bgColor  !== undefined) { setBgColor(p.bgColor);   applied.push('bgColor') }
    }

    if (schema.fields) {
      for (const [fid, fdata] of Object.entries(schema.fields)) {
        const known = STATIC_FIELD_IDS.has(fid) || extraFields.some(f => f.fieldId === fid)
        if (!known) continue
        if (fdata.label       !== undefined) setFieldLabels(prev => ({ ...prev, [fid]: fdata.label! }))
        if (fdata.placeholder !== undefined) setFieldPlaceholders(prev => ({ ...prev, [fid]: fdata.placeholder! }))
        if (fdata.required    !== undefined) setFieldRequired(prev => ({ ...prev, [fid]: fdata.required! }))
        if (fdata.value       !== undefined) setFieldValues(prev => ({ ...prev, [fid]: fdata.value! }))
        applied.push(`field:${fid}`)
      }
    }

    if (schema.addFields) {
      for (const entry of schema.addFields) {
        const fieldId = entry.label.toLowerCase().replace(/\s+/g, '-')
        setExtraFields(prev => {
          if (prev.some(f => f.fieldId === fieldId)) return prev
          return [...prev, { label: entry.label, fieldId }]
        })
        applied.push(`add:${fieldId}`)
      }
    }

    if (schema.removeFields) {
      setExtraFields(prev => prev.filter(f => !schema.removeFields!.includes(f.fieldId)))
      applied.push(`removed:${schema.removeFields.join(',')}`)
    }

    return applied
  }

  async function handleLoad(raw: string, url: string): Promise<void> {
    setMessages(prev => [
      ...prev,
      { text: raw, cls: 'user' },
      { text: 'Loading…', cls: 'bot' },
    ])

    let data: unknown
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`)
      }
      data = await response.json()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: `Error: ${msg}`, cls: 'bot err' },
      ])
      return
    }

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: 'Error: Response is not a JSON object.', cls: 'bot err' },
      ])
      return
    }

    const schema = data as FormSchema
    const applied = applySchema(schema)
    const summary = applied.length > 0
      ? `Schema applied. Updated: ${applied.join(', ')}.`
      : 'Schema loaded but nothing to update.'

    setMessages(prev => [
      ...prev.slice(0, -1),
      { text: summary, cls: 'bot ok' },
    ])
  }

  function handleSend() {
    const raw = chatInput.trim()
    if (!raw) return
    setChatInput('')
    const cmd = raw.toLowerCase()
    if (cmd.startsWith('load ')) {
      const url = raw.slice('load '.length).trim()
      if (!url) {
        setMessages(prev => [
          ...prev,
          { text: raw, cls: 'user' },
          { text: 'Usage: load <url>', cls: 'bot err' },
        ])
        return
      }
      void handleLoad(raw, url)
      return
    }
    runCommand()
  }

  function runCommand() {
    const raw = chatInput.trim()
    if (!raw) return
    setChatInput('')

    const cmd = raw.toLowerCase()

    const addBoth = (botText: string, botCls: MsgCls) =>
      setMessages(prev => [
        ...prev,
        { text: raw, cls: 'user' },
        { text: botText, cls: botCls },
      ])

    const ok  = (text: string) => addBoth(text, 'bot ok')
    const err = (text: string) => addBoth(text, 'bot err')
    const info = (text: string) => addBoth(text, 'bot')

    const isValidField = (fid: string) =>
      STATIC_FIELD_IDS.has(fid) || extraFields.some(f => f.fieldId === fid)

    // title <text>
    if (cmd.startsWith('title ')) {
      setTitle(raw.slice('title '.length))
      return ok('Company title updated.')
    }

    // tagline <text>
    if (cmd.startsWith('tagline ')) {
      setTagline(raw.slice('tagline '.length))
      return ok('Tagline updated.')
    }

    // heading <text>
    if (cmd.startsWith('heading ')) {
      setHeading(raw.slice('heading '.length))
      return ok('Form heading updated.')
    }

    // button text <text>
    if (cmd.startsWith('button text ')) {
      setBtnText(raw.slice('button text '.length))
      return ok('Button text updated.')
    }

    // button color <color>
    if (cmd.startsWith('button color ')) {
      const color = raw.slice('button color '.length)
      setBtnColor(color)
      return ok(`Button color set to "${color}".`)
    }

    // background <color>
    if (cmd.startsWith('background ')) {
      const color = raw.slice('background '.length)
      setBgColor(color)
      return ok(`Background set to "${color}".`)
    }

    // add field <label>
    if (cmd.startsWith('add field ')) {
      const label = raw.slice('add field '.length)
      const fieldId = label.toLowerCase().replace(/\s+/g, '-')
      setExtraFields(prev => [...prev, { label, fieldId }])
      return ok(`Field "${label}" added.`)
    }

    // remove field <label>
    if (cmd.startsWith('remove field ')) {
      const label = raw.slice('remove field '.length).toLowerCase()
      const found = extraFields.some(f => f.label.toLowerCase() === label)
      if (!found) return err(`No added field named "${label}" found.`)
      setExtraFields(prev => prev.filter(f => f.label.toLowerCase() !== label))
      return ok(`Field "${label}" removed.`)
    }

    // label <field-id> <new-label>
    if (cmd.startsWith('label ')) {
      const rest = raw.slice('label '.length)
      const sp = rest.indexOf(' ')
      if (sp === -1) return err('Usage: label <field-id> <new label text>')
      const fieldId = rest.slice(0, sp).toLowerCase()
      const newLabel = rest.slice(sp + 1)
      if (!isValidField(fieldId)) return err(`No field with id "${fieldId}" found.`)
      setFieldLabels(prev => ({ ...prev, [fieldId]: newLabel }))
      return ok(`Label for "${fieldId}" set to "${newLabel}".`)
    }

    // placeholder <field-id> <text>
    if (cmd.startsWith('placeholder ')) {
      const rest = raw.slice('placeholder '.length)
      const sp = rest.indexOf(' ')
      if (sp === -1) return err('Usage: placeholder <field-id> <text>')
      const fieldId = rest.slice(0, sp).toLowerCase()
      const text = rest.slice(sp + 1)
      if (!isValidField(fieldId)) return err(`No field with id "${fieldId}" found.`)
      setFieldPlaceholders(prev => ({ ...prev, [fieldId]: text }))
      return ok(`Placeholder for "${fieldId}" updated.`)
    }

    // fill <field-id> <value>
    if (cmd.startsWith('fill ')) {
      const rest = raw.slice('fill '.length)
      const sp = rest.indexOf(' ')
      if (sp === -1) return err('Usage: fill <field-id> <value>')
      const fieldId = rest.slice(0, sp).toLowerCase()
      const value = rest.slice(sp + 1)
      if (!isValidField(fieldId)) return err(`No field with id "${fieldId}" found.`)
      setFieldValue(fieldId, value)
      return ok(`Field "${fieldId}" filled.`)
    }

    // clear <field-id>
    if (cmd.startsWith('clear ')) {
      const fieldId = raw.slice('clear '.length).trim().toLowerCase()
      if (!isValidField(fieldId)) return err(`No field with id "${fieldId}" found.`)
      setFieldValue(fieldId, '')
      return ok(`Field "${fieldId}" cleared.`)
    }

    // require <field-id>
    if (cmd.startsWith('require ')) {
      const fieldId = raw.slice('require '.length).trim().toLowerCase()
      if (!isValidField(fieldId)) return err(`No field with id "${fieldId}" found.`)
      setFieldRequired(prev => ({ ...prev, [fieldId]: true }))
      return ok(`Field "${fieldId}" is now required.`)
    }

    // optional <field-id>
    if (cmd.startsWith('optional ')) {
      const fieldId = raw.slice('optional '.length).trim().toLowerCase()
      if (!isValidField(fieldId)) return err(`No field with id "${fieldId}" found.`)
      setFieldRequired(prev => ({ ...prev, [fieldId]: false }))
      return ok(`Field "${fieldId}" is now optional.`)
    }

    // help
    if (cmd === 'help') {
      return info(
        'Page: title, tagline, heading, button text, button color, background, add field, remove field\n' +
        'Input fields: label, placeholder, fill, clear, require, optional — all take a field-id first (e.g. first-name, email, phone…)\n' +
        'load <url> — fetch a JSON schema from a URL and apply it to the form'
      )
    }

    err(`Unknown command: "${raw}". Type "help" for the list.`)
  }

  return (
    <>
      {/* Left: signup form */}
      <div id="form-area" style={{ background: bgColor }}>
        <div className="container">
          <div className="logo">
            <h1 id="company-title">{title}</h1>
            <p id="company-tagline">{tagline}</p>
          </div>

          <h2 id="form-heading">{heading}</h2>

          <form action="#" method="POST">
            <div className="row">
              <div className="form-group">
                <label htmlFor="first-name">{getLabel('first-name')}</label>
                <input
                  type="text"
                  id="first-name"
                  name="first_name"
                  placeholder={getPlaceholder('first-name')}
                  value={getValue('first-name')}
                  onChange={e => setFieldValue('first-name', e.target.value)}
                  required={getRequired('first-name')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last-name">{getLabel('last-name')}</label>
                <input
                  type="text"
                  id="last-name"
                  name="last_name"
                  placeholder={getPlaceholder('last-name')}
                  value={getValue('last-name')}
                  onChange={e => setFieldValue('last-name', e.target.value)}
                  required={getRequired('last-name')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">{getLabel('email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={getPlaceholder('email')}
                value={getValue('email')}
                onChange={e => setFieldValue('email', e.target.value)}
                required={getRequired('email')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">{getLabel('phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder={getPlaceholder('phone')}
                value={getValue('phone')}
                onChange={e => setFieldValue('phone', e.target.value)}
                required={getRequired('phone')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">{getLabel('dob')}</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={getValue('dob')}
                onChange={e => setFieldValue('dob', e.target.value)}
                required={getRequired('dob')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="insurance-type">{getLabel('insurance-type')}</label>
              <select
                id="insurance-type"
                name="insurance_type"
                value={getValue('insurance-type')}
                onChange={e => setFieldValue('insurance-type', e.target.value)}
                required={getRequired('insurance-type')}
              >
                <option value="" disabled>Select a plan</option>
                <option value="auto">Auto Insurance</option>
                <option value="home">Home Insurance</option>
                <option value="life">Life Insurance</option>
                <option value="health">Health Insurance</option>
                <option value="renters">Renters Insurance</option>
              </select>
            </div>

            <hr className="divider" />

            {/* Dynamically added fields */}
            <div id="extra-fields">
              {extraFields.map(field => (
                <div key={field.fieldId} className="form-group">
                  <label htmlFor={field.fieldId}>{getLabel(field.fieldId)}</label>
                  <input
                    type="text"
                    id={field.fieldId}
                    name={field.fieldId}
                    placeholder={getPlaceholder(field.fieldId)}
                    value={getValue(field.fieldId)}
                    onChange={e => setFieldValue(field.fieldId, e.target.value)}
                    required={getRequired(field.fieldId)}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="password">{getLabel('password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={getPlaceholder('password')}
                value={getValue('password')}
                onChange={e => setFieldValue('password', e.target.value)}
                required={getRequired('password')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">{getLabel('confirm-password')}</label>
              <input
                type="password"
                id="confirm-password"
                name="confirm_password"
                placeholder={getPlaceholder('confirm-password')}
                value={getValue('confirm-password')}
                onChange={e => setFieldValue('confirm-password', e.target.value)}
                required={getRequired('confirm-password')}
              />
            </div>

            <button
              type="submit"
              className="btn"
              id="submit-btn"
              style={{ background: btnColor }}
            >
              {btnText}
            </button>
          </form>

          <p className="login-link" id="login-link">
            Already have an account? <a href="#">Log in</a>
          </p>
        </div>
      </div>

      {/* Right: chat panel */}
      <div id="chat-panel">
        <div id="chat-header">
          Page Editor
          <p>Type a command to change the form</p>
        </div>

        <div id="chat-messages" ref={chatBoxRef}>
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.cls}`}>{msg.text}</div>
          ))}
        </div>

        <div id="help-box">
          <strong>Page commands</strong>
          title &lt;text&gt; · tagline &lt;text&gt; · heading &lt;text&gt;<br />
          button text &lt;text&gt; · button color &lt;color&gt;<br />
          background &lt;color&gt;<br />
          add field &lt;label&gt; · remove field &lt;label&gt;<br />
          <strong>Input field commands</strong>
          label &lt;field-id&gt; &lt;text&gt;<br />
          placeholder &lt;field-id&gt; &lt;text&gt;<br />
          fill &lt;field-id&gt; &lt;value&gt;<br />
          clear &lt;field-id&gt;<br />
          require &lt;field-id&gt; · optional &lt;field-id&gt;<br />
          <em>IDs: first-name, last-name, email, phone, dob, password, confirm-password, insurance-type</em><br />
          <strong>API</strong>
          load &lt;url&gt; — fetch JSON schema &amp; apply to form<br />
          help
        </div>

        <div id="chat-input-row">
          <input
            type="text"
            id="chat-input"
            placeholder="Type a command…"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          />
          <button onClick={handleSend}>Run</button>
        </div>
      </div>
    </>
  )
}
