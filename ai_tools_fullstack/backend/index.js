const express = require('express');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY || 'sk-REPLACE';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const limiter = rateLimit({ windowMs: 60*1000, max: 60 });
app.use('/api/', limiter);

function authMiddleware(req, res, next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({error:'no auth'});
  const token = h.split(' ')[1];
  try{ req.user = jwt.verify(token, JWT_SECRET); next(); }catch(e){ res.status(401).json({error:'invalid token'}); }
}

app.post('/api/auth/demo-token', (req,res)=>{
  // Demo only. Replace with real auth (Firebase or DB)
  const user = {id:'demo',email:'demo@example.com'};
  const token = jwt.sign(user, JWT_SECRET, {expiresIn:'30d'});
  res.json({token});
});

app.post('/api/ai/chat', authMiddleware, async (req,res)=>{
  const { prompt } = req.body;
  if(!prompt) return res.status(400).json({error:'missing prompt'});
  try{
    const resp = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body: JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}],max_tokens:500})
    });
    const data = await resp.json();
    res.json(data);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

app.post('/api/ai/image', authMiddleware, async (req,res)=>{
  const { prompt } = req.body;
  if(!prompt) return res.status(400).json({error:'missing prompt'});
  try{
    const r = await fetch('https://api.openai.com/v1/images/generations',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body: JSON.stringify({prompt, n:1, size:'1024x1024'})
    });
    const d = await r.json();
    res.json(d);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

app.post('/api/ai/text-tool', authMiddleware, async (req,res)=>{
  const { tool, text } = req.body;
  if(!tool || !text) return res.status(400).json({error:'missing params'});
  try{
    let prompt = '';
    if(tool==='summarize') prompt = `Summarize the following text:\n\n${text}`;
    else if(tool==='grammar') prompt = `Correct grammar and improve clarity without changing meaning:\n\n${text}`;
    else if(tool==='rewrite') prompt = `Rewrite the following text to be more engaging:\n\n${text}`;
    else return res.status(400).json({error:'unsupported tool'});

    const resp = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${OPENAI_KEY}`},
      body: JSON.stringify({model:'gpt-4o-mini',messages:[{role:'user',content:prompt}],max_tokens:300})
    });
    const data = await resp.json();
    res.json(data);
  }catch(e){
    res.status(500).json({error:e.message});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Backend listening on', PORT));
