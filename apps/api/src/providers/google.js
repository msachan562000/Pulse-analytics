import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'
import { dec } from '../utils.js'
const prisma = new PrismaClient()
function oauth(){ return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL) }
export async function gscListSites(userId){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'google' } }); if(!acct) return []
  const auth = oauth(); auth.setCredentials({ access_token: dec(acct.access), refresh_token: dec(acct.refresh) })
  const wm = google.webmasters({ version:'v3', auth })
  const sites = await wm.sites.list(); return sites.data.siteEntry||[]
}
export async function gscQuery(userId, siteUrl){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'google' } }); if(!acct) return { rows:[] }
  const auth = oauth(); auth.setCredentials({ access_token: dec(acct.access), refresh_token: dec(acct.refresh) })
  const wm = google.webmasters({ version:'v3', auth })
  const end = new Date(); const start = new Date(); start.setDate(end.getDate()-28)
  const r = await wm.searchanalytics.query({ siteUrl, requestBody:{ startDate:start.toISOString().slice(0,10), endDate:end.toISOString().slice(0,10), dimensions:['date'], rowLimit:28 } })
  return r.data
}
