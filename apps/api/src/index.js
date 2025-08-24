import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import { PrismaClient } from '@prisma/client'
import { setupPassport } from './auth.js'
import { ensureEnv } from './utils.js'
import cron from 'node-cron'
import { gscListSites, gscQuery } from './providers/google.js'
import { fbPages, fbPageInsights, igAccountsFromPage, igInsights } from './providers/fb.js'
import { liMe, liOrganizationStats } from './providers/li.js'

ensureEnv(['SESSION_SECRET'])

const prisma = new PrismaClient()
const app = express()
app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
setupPassport(app)
app.use(passport.initialize())
app.use(passport.session())

// Health
app.get('/api/health', (req,res)=> res.json({ ok:true, time:new Date().toISOString() }))

// OAuth routes
import passportPkg from 'passport'
const Passport = passportPkg
app.get('/auth/google', Passport.authenticate('google'))
app.get('/auth/google/callback', Passport.authenticate('google', { failureRedirect: '/auth/failure' }), (req,res)=> res.send('<script>window.close()</script>'))
app.get('/auth/facebook', Passport.authenticate('facebook', { scope: ['email','public_profile','pages_read_engagement','pages_show_list','instagram_basic','instagram_manage_insights'] }))
app.get('/auth/facebook/callback', Passport.authenticate('facebook', { failureRedirect: '/auth/failure' }), (req,res)=> res.send('<script>window.close()</script>'))
app.get('/auth/linkedin', Passport.authenticate('linkedin', { state: true }))
app.get('/auth/linkedin/callback', Passport.authenticate('linkedin', { failureRedirect: '/auth/failure' }), (req,res)=> res.send('<script>window.close()</script>'))
app.get('/auth/failure', (req,res)=> res.status(401).json({ error: 'OAuth failed' }))

// Connections for a given email (dev helper)
app.get('/api/admin/connections/:userEmail', async (req,res)=> {
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json([])
  const accs = await prisma.account.findMany({ where: { userId: user.id }, select: { id:true, provider:true, providerId:true, createdAt:true } })
  res.json(accs)
})

// Google Search Console
app.get('/api/google/sites/:userEmail', async (req,res)=> {
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json([])
  const sites = await gscListSites(user.id)
  res.json(sites)
})
app.get('/api/google/query/:userEmail', async (req,res)=> {
  const { site } = req.query
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({ rows: [] })
  const data = await gscQuery(user.id, site)
  res.json(data)
})

// Facebook / Instagram
app.get('/api/facebook/pages/:userEmail', async (req,res)=> {
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json([])
  const pages = await fbPages(user.id)
  res.json(pages)
})
app.get('/api/facebook/page-insights/:userEmail', async (req,res)=> {
  const { pageId } = req.query
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({})
  const data = await fbPageInsights(user.id, pageId)
  res.json(data)
})
app.get('/api/instagram/account-from-page/:userEmail', async (req,res)=> {
  const { pageId } = req.query
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({})
  const ig = await igAccountsFromPage(user.id, pageId)
  res.json(ig || {})
})
app.get('/api/instagram/insights/:userEmail', async (req,res)=> {
  const { igId } = req.query
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({})
  const data = await igInsights(user.id, igId)
  res.json(data)
})

// LinkedIn
app.get('/api/linkedin/me/:userEmail', async (req,res)=> {
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({})
  const data = await liMe(user.id)
  res.json(data || {})
})
app.get('/api/linkedin/org-stats/:userEmail', async (req,res)=> {
  const { orgUrn } = req.query
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({})
  const data = await liOrganizationStats(user.id, orgUrn)
  res.json(data || {})
})

// Overview aggregator
app.get('/api/overview/:userEmail', async (req,res)=> {
  const user = await prisma.user.findUnique({ where: { email: req.params.userEmail } })
  if(!user) return res.json({ kpis: [], channels: [] })
  const channels = []
  const pages = await fbPages(user.id).catch(()=>[])
  channels.push(...pages.map(p=>({ name: `Facebook: ${p.name}`, type:'facebook' })))
  const sites = await gscListSites(user.id).catch(()=>[])
  channels.push(...sites.map(s=>({ name: `GSC: ${s.siteUrl}`, type:'gsc' })))
  const li = await liMe(user.id).catch(()=>null)
  if(li) channels.push({ name: `LinkedIn: ${li.localizedFirstName||'Me'}`, type:'linkedin' })
  res.json({ kpis: [{label:'Connected Channels', value: channels.length}], channels })
})

// Cron placeholder
import process from 'process'
cron.schedule('0 6 * * *', async ()=> console.log('[cron] daily sync placeholder'))

const PORT = process.env.PORT || 4101
app.listen(PORT, ()=> console.log(`API listening on http://localhost:${PORT}`))
