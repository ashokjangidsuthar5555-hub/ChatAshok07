import { useRef, useState } from 'react'
import { Bot, Camera, Check, Copy, Paperclip, Plus, Send, Settings2, Sparkles, ThumbsDown, ThumbsUp, Zap } from 'lucide-react'

const suggestions = [
  { label: 'Summarize a document', icon: '01' },
  { label: 'Build a launch plan', icon: '02' },
  { label: 'Write better copy', icon: '03' },
]

function AssistantText({ text }) {
  return <div className="assistant-text">
    {text.split('\n').map((line, index) => {
      const trimmed = line.trim()
      if (!trimmed) return <span className="text-gap" key={`gap-${index}`} />

      const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/)
      const sectionMatch = !headingMatch && trimmed.match(/^(.{2,70}):$/)
      const content = (headingMatch?.[1] || sectionMatch?.[1] || trimmed).replace(/\*\*/g, '')

      if (headingMatch || sectionMatch) return <h3 key={index}>{content}</h3>
      return <p key={index}><strong>{content.replace(/^[-*]\s+/, '')}</strong></p>
    })}
  </div>
}

function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Hello! I’m ChatAshok.07.\n\nWhat are we building today?' }])
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [thinking, setThinking] = useState(false)
  const fileInput = useRef(null)
  const cameraInput = useRef(null)

  async function sendMessage(value = draft) {
    const text = value.trim() || (attachment ? 'Is photo ko dekho aur batao iske saath kya-kya kiya ja sakta hai.' : '')
    if (!text || thinking) return
    const nextMessages = [...messages, { role: 'user', text, image: attachment?.dataUrl }]
    setMessages(nextMessages)
    setDraft('')
    setAttachment(null)
    setThinking(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Request failed')
      setMessages((items) => [...items, { role: 'assistant', text: result.reply }])
    } catch (error) {
      setMessages((items) => [...items, { role: 'assistant', text: `Sorry, I could not connect right now. ${error.message}` }])
    } finally {
      setThinking(false)
    }
  }

  function chooseImage(event) {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setAttachment({ name: file.name, dataUrl: reader.result })
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function openCamera() {
    cameraInput.current?.click()
  }

  return <main className="app">
    <aside className="rail">
      <div className="brand-mark"><Sparkles size={18} /></div>
      <div className="rail-line" />
      <button className="rail-button active" aria-label="New chat"><Plus size={18} /></button>
      <button className="rail-button" aria-label="Quick actions"><Zap size={17} /></button>
      <div className="rail-bottom"><button className="rail-button" aria-label="Settings"><Settings2 size={17} /></button><span className="avatar">AK</span></div>
    </aside>
    <header className="topbar">
      <div className="brand-copy"><strong>ChatAshok.07</strong><span>PERSONAL INTELLIGENCE</span></div>
      <div className="model-pill"><i /> ChatAshok.07 <span>PRO</span></div>
      <div className="actions"><span className="live"><i /> Online</span><button aria-label="New chat"><Plus size={18} /></button></div>
    </header>
    <section className="chat">
      <div className="intro"><div className="eyebrow"><span /> CHATASHOK.07 / WORKSPACE</div><h1>Think bigger.<br /><em>Make it real.</em></h1><p>A sharper space for ideas, answers, and the work between them.</p></div>
      <div className="messages">
        {messages.map((message, index) => <div className={`row ${message.role}`} key={`${message.role}-${index}`}>
          {message.role === 'assistant' && <span className="bot"><Bot size={16} /></span>}
            <div className="bubble"><label>{message.role === 'assistant' ? 'ChatAshok.07' : 'YOU'}</label>{message.image && <img className="message-image" src={message.image} alt="Uploaded by you" />}{message.role === 'assistant' ? <AssistantText text={message.text} /> : <p>{message.text}</p>}{message.role === 'assistant' && <div className="tools"><button aria-label="Copy"><Copy size={13} /></button><button aria-label="Like"><ThumbsUp size={13} /></button><button aria-label="Dislike"><ThumbsDown size={13} /></button></div>}</div>
        </div>)}
        {thinking && <div className="row assistant"><span className="bot"><Bot size={16} /></span><div className="bubble"><label>ChatAshok.07</label><p className="dots"><i /><i /><i /></p></div></div>}
      </div>
      {messages.length === 1 && <div className="suggestions">{suggestions.map((item) => <button key={item.label} onClick={() => sendMessage(item.label)}><span>{item.icon}</span>{item.label}<b>↗</b></button>)}</div>}
      <form className="composer" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
        {attachment && <div className="attachment-preview"><img src={attachment.dataUrl} alt="Selected upload" /><span>{attachment.name}</span><button type="button" aria-label="Remove image" onClick={() => setAttachment(null)}>×</button></div>}
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={attachment ? 'Ask what to do with this photo...' : 'Ask ChatAshok.07 anything...'} rows="1" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage() } }} />
        <div><input ref={fileInput} className="file-input" type="file" accept="image/*" onChange={chooseImage} /><input ref={cameraInput} className="file-input" type="file" accept="image/*" capture="environment" onChange={chooseImage} /><button type="button" aria-label="Attach photo" onClick={() => fileInput.current?.click()}><Paperclip size={16} /></button><button type="button" className="camera-button" aria-label="Take photo with camera" onClick={openCamera}><Camera size={16} /></button><small><Check size={12} /> Photo analysis enabled</small><button className="send" aria-label="Send" disabled={(!draft.trim() && !attachment) || thinking}><Send size={16} /></button></div>
      </form>
      <p className="hint">ChatAshok.07 can make mistakes <span>·</span> <kbd>Enter</kbd> to send</p>
    </section>
  </main>
}

export default App
