import { useState, useRef, useEffect } from 'react'
import './App.css'

const API_URL = 'http://localhost:8005/ai_data'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]


type MsgRole = 'user' | 'bot' | 'bot-ok' | 'bot-err'
interface Message { text: string; role: MsgRole }

interface ApiResponse {
  message: string
  formData: Record<string, string>
}

export default function App() {
  // Personal
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [dob,       setDob]       = useState('')
  const [state,     setState]     = useState('')
  // Vehicle
  const [vehicleYear,  setVehicleYear]  = useState('')
  const [vehicleMake,  setVehicleMake]  = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  // Coverage
  const [coverageType, setCoverageType] = useState('')
  const [deductible,   setDeductible]   = useState('')

  const [messages,  setMessages]  = useState<Message[]>([
    { text: "Hi! Tell me about your vehicle and coverage needs and I'll help fill out your quote.", role: 'bot' },
  ])
  const [chatInput, setChatInput] = useState('')
  const [loading,   setLoading]   = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const quoteReady = !!coverageType && !!(vehicleYear || vehicleMake || vehicleModel)

  function applyFormData(data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      switch (key) {
        case 'first_name':
        case 'first-name':     setFirstName(value);    break
        case 'last_name':
        case 'last-name':      setLastName(value);     break
        case 'email':          setEmail(value);        break
        case 'phone':          setPhone(value);        break
        case 'dob':            setDob(value);          break
        case 'state':          setState(value);        break
        case 'vehicle_year':
        case 'vehicle-year':   setVehicleYear(value);  break
        case 'vehicle_make':
        case 'vehicle-make':   setVehicleMake(value);  break
        case 'vehicle_model':
        case 'vehicle-model':  setVehicleModel(value); break
        case 'coverage_type':
        case 'coverage-type':  setCoverageType(value); break
        case 'deductible':     setDeductible(value);   break
      }
    }
  }

  async function sendMessage() {
    const text = chatInput.trim()
    if (!text || loading) return
    setChatInput('')

    const formData = {
      'first-name':    firstName,
      'last-name':     lastName,
      'email':         email,
      'phone':         phone,
      'dob':           dob,
      'state':         state,
      'vehicle-year':  vehicleYear,
      'vehicle-make':  vehicleMake,
      'vehicle-model': vehicleModel,
      'coverage-type': coverageType,
      'deductible':    deductible,
    }

    setMessages(prev => [
      ...prev,
      { text, role: 'user' },
      { text: 'Thinking…', role: 'bot' },
    ])
    setLoading(true)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, formData }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)

      const json = await res.json() as ApiResponse
      applyFormData(json.formData)

      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: json.message, role: 'bot-ok' },
      ])
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setMessages(prev => [
        ...prev.slice(0, -1),
        { text: `Error: ${msg}`, role: 'bot-err' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Left: quote form */}
      <div id="form-area">
        <div className="container">
          <div className="logo">
            <h1 id="company-title">🛡 SafeGuard Insurance</h1>
            <p id="company-tagline">Fast, accurate auto insurance quotes</p>
          </div>

          <h2 id="form-heading">Get Your Auto Quote</h2>

          <form action="#" method="POST">
            {/* ── Personal Info ── */}
            <p className="section-label">Personal Information</p>

            <div className="row">
              <div className="form-group">
                <label htmlFor="first-name">First Name</label>
                <input type="text" id="first-name" name="first_name"
                  value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="last-name">Last Name</label>
                <input type="text" id="last-name" name="last_name"
                  value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" name="phone"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="row">
              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input type="date" id="dob" name="dob"
                  value={dob} onChange={e => setDob(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <select id="state" name="state"
                  value={state} onChange={e => setState(e.target.value)}>
                  <option value="" disabled>Select state</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <hr className="divider" />

            {/* ── Vehicle Details ── */}
            <p className="section-label">Vehicle Details</p>

            <div className="row">
              <div className="form-group form-group--sm">
                <label htmlFor="vehicle-year">Year</label>
                <input type="text" id="vehicle-year" name="vehicle_year"
                  placeholder="e.g. 2020"
                  value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle-make">Make</label>
                <input type="text" id="vehicle-make" name="vehicle_make"
                  placeholder="e.g. Toyota"
                  value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="vehicle-model">Model</label>
                <input type="text" id="vehicle-model" name="vehicle_model"
                  placeholder="e.g. Camry"
                  value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} />
              </div>
            </div>

            <hr className="divider" />

            {/* ── Coverage ── */}
            <p className="section-label">Coverage</p>

            <div className="row">
              <div className="form-group">
                <label htmlFor="coverage-type">Coverage Type</label>
                <select id="coverage-type" name="coverage_type"
                  value={coverageType} onChange={e => setCoverageType(e.target.value)}>
                  <option value="" disabled>Select coverage</option>
                  <option value="liability">Liability Only</option>
                  <option value="collision">Collision</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="full">Full Coverage</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="deductible">Deductible</label>
                <select id="deductible" name="deductible"
                  value={deductible} onChange={e => setDeductible(e.target.value)}>
                  <option value="" disabled>Select deductible</option>
                  <option value="500">$500</option>
                  <option value="1000">$1,000</option>
                  <option value="2000">$2,000</option>
                </select>
              </div>
            </div>

            {/* ── Quote Result ── */}
            {quoteReady && (
              <div id="quote-result">
                <span className="quote-label">Your Quote is Ready</span>
                <span className="quote-amount">Contact Us</span>
                <span className="quote-note">
                  Submit your request and an agent will provide your personalized rate
                </span>
              </div>
            )}

            <button type="submit" className="btn" id="submit-btn" style={{ background: '#1a4a8a' }}>
              Submit Quote Request
            </button>
          </form>
        </div>
      </div>

      {/* Right: chat panel */}
      <div id="chat-panel">
        <div id="chat-header">
          <span>🚗 Quote Assistant</span>
          <p>Describe your vehicle or coverage needs</p>
        </div>

        <div id="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>{msg.text}</div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div id="chat-input-row">
          <input
            type="text"
            id="chat-input"
            placeholder="e.g. 2019 Toyota Camry, full coverage"
            value={chatInput}
            disabled={loading}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void sendMessage() }}
          />
          <button onClick={() => void sendMessage()} disabled={loading}>
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </>
  )
}
