import React, { useEffect, useState } from 'react'
function Button({children, ...p}){ return <button {...p} className={"px-3 py-1.5 rounded-lg border bg-white "+(p.className||'')}>{children}</button> }
export default function App(){
  const [overview,setOverview] = useState(null)
  const [email,setEmail] = useState('me@example.com')
  const [sites,setSites] = useState([])
  const [pages,setPages] = useState([])
  const [liMe,setLiMe] = useState(null)
  async function refresh(){ const o = await fetch(`/api/overview/${encodeURIComponent(email)}`).then(r=>r.json()); setOverview(o) }
  useEffect(()=>{ refresh() },[])
  async function connect(p){ window.open(`/auth/${p}`, '_blank', 'width=520,height=650') }
  async function loadGoogle(){ const s = await fetch(`/api/google/sites/${encodeURIComponent(email)}`).then(r=>r.json()); setSites(s) }
  async function loadFacebook(){ const s = await fetch(`/api/facebook/pages/${encodeURIComponent(email)}`).then(r=>r.json()); setPages(s) }
  async function loadLinkedIn(){ const s = await fetch(`/api/linkedin/me/${encodeURIComponent(email)}`).then(r=>r.json()); setLiMe(s) }
  return (<div className="max-w-6xl mx-auto px-4 py-8 grid gap-6">
    <h1 className="text-2xl font-semibold">PulseAnalytics</h1>
    <div className="grid md:grid-cols-[1fr_auto] items-end gap-3">
      <div><label className="text-sm text-neutral-600">Admin email (same you use during OAuth)</label>
      <input className="border rounded-lg p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/></div>
      <Button onClick={refresh}>Refresh Overview</Button>
    </div>
    <div className="rounded-2xl bg-white border p-4">
      <div className="font-medium mb-2">Connect Accounts</div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={()=>connect('google')}>Connect Google (GSC)</Button>
        <Button onClick={()=>connect('facebook')}>Connect Facebook/Instagram</Button>
        <Button onClick={()=>connect('linkedin')}>Connect LinkedIn</Button>
      </div>
    </div>
    <div className="grid md:grid-cols-3 gap-4">
      <div className="rounded-2xl bg-white border p-4"><div className="font-medium mb-2">Google Search Console</div>
        <Button onClick={loadGoogle}>List Sites</Button>
        <div className="mt-2 text-sm">{sites.map(s=> <div key={s.siteUrl}>{s.siteUrl} • {s.permissionLevel}</div>)}</div>
      </div>
      <div className="rounded-2xl bg-white border p-4"><div className="font-medium mb-2">Facebook Pages</div>
        <Button onClick={loadFacebook}>List Pages</Button>
        <div className="mt-2 text-sm">{pages.map(p=> <div key={p.id}>{p.name} • {p.category}</div>)}</div>
      </div>
      <div className="rounded-2xl bg-white border p-4"><div className="font-medium mb-2">LinkedIn</div>
        <Button onClick={loadLinkedIn}>Who am I</Button>
        <div className="mt-2 text-sm">{liMe ? JSON.stringify(liMe) : '—'}</div>
      </div>
    </div>
    <div className="rounded-2xl bg-white border p-4"><div className="font-medium mb-2">Overview</div>
      <pre className="text-xs bg-neutral-50 p-3 rounded-xl overflow-auto">{JSON.stringify(overview, null, 2)}</pre>
    </div>
  </div>) }
