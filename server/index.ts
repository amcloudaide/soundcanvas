import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are a music pattern generator for Strudel, a JavaScript music live coding environment.

Given a text description of a sound, generate a valid Strudel pattern and metadata.

RULES:
- Use Strudel mini-notation syntax
- For drums/percussion: use s() with sample names: bd, sd, hh, cp, cb, tom, rim, oh, ch
- For melodic/bass: use note() with note names (e.g., "c2", "eb4") and .s() for sound source
- Available sound sources for .s(): "sawtooth", "square", "triangle", "sine", "piano"
- Available effects: .lpf(freq), .hpf(freq), .gain(0-1), .speed(rate), .slow(factor), .fast(factor)
- Keep patterns to 1-8 bars, musically interesting but not overly complex
- For chords use comma-separated notes in brackets: [c3,e3,g3]
- Use angle brackets for alternation: <pattern1 pattern2>
- Use ~ for rests, * for repetition, / for subdivision

RESPOND WITH ONLY valid JSON (no markdown, no code fences):
{
  "name": "short descriptive name",
  "category": "beats"|"bass"|"melody"|"chords"|"fx"|"vocal",
  "pattern": "valid strudel pattern code",
  "key": "musical key (e.g., C, Am, Cm, F#, chromatic)",
  "bpm": suggested_bpm_number,
  "bars": number_of_bars,
  "mood": { "energy": 0.0_to_1.0, "brightness": 0.0_to_1.0 },
  "density": 0.0_to_1.0,
  "tags": ["tag1", "tag2", "tag3"]
}`

// Simple rate limiting: max 10 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 })
    return true
  }

  if (entry.count >= 10) {
    return false
  }

  entry.count++
  return true
}

app.post('/api/generate', async (req, res) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'

  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' })
  }

  try {
    const { prompt, existingPattern } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required' })
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'prompt too long (max 500 chars)' })
    }

    const userMessage = existingPattern
      ? `Create a variation of this pattern: ${existingPattern}\n\nVariation request: ${prompt}`
      : prompt

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Unexpected response type' })
    }

    // Parse the JSON response
    let blockData
    try {
      blockData = JSON.parse(content.text)
    } catch {
      console.error('[API] Failed to parse AI response:', content.text)
      return res.status(500).json({ error: 'AI returned invalid JSON. Try again.' })
    }

    // Validate required fields
    const required = ['name', 'category', 'pattern', 'key', 'bpm']
    for (const field of required) {
      if (!(field in blockData)) {
        return res.status(500).json({ error: `AI response missing field: ${field}` })
      }
    }

    res.json(blockData)
  } catch (error: any) {
    console.error('[API] Generation error:', error.message)
    if (error.status === 401) {
      return res.status(500).json({ error: 'API key is invalid. Check your .env file.' })
    }
    res.status(500).json({ error: error.message || 'Generation failed' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.ANTHROPIC_API_KEY })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[API] WARNING: No ANTHROPIC_API_KEY set. AI generation will fail.')
  }
})
