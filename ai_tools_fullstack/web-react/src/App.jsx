import { useState } from 'react'

export default function App(){
  const [prompt,setPrompt] = useState('')
  const [reply,setReply] = useState('')
  async function send(){
    const token = localStorage.getItem('demo_token') || '';
    const r = await fetch('/api/ai/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: JSON.stringify({prompt})
    });
    const j = await r.json();
    setReply(j.choices ? j.choices[0].message.content : JSON.stringify(j));
  }
  async function getDemoToken(){
    const r = await fetch('/api/auth/demo-token', {method:'POST'});
    const j = await r.json();
    localStorage.setItem('demo_token', j.token);
    alert('Demo token saved');
  }
  return (<div style={{maxWidth:800,margin:'40px auto',padding:20}}>
    <h1>AI Tools — Web</h1>
    <button onClick={getDemoToken}>Get demo token</button>
    <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:120,marginTop:12}} />
    <div style={{marginTop:8}}>
      <button onClick={send}>Send</button>
    </div>
    <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{reply}</pre>
  </div>)
}
