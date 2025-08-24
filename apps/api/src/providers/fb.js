import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { dec } from '../utils.js'
const prisma = new PrismaClient(); const GRAPH='https://graph.facebook.com/v18.0'
export async function fbPages(userId){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'facebook' } }); if(!acct) return []
  const token = dec(acct.access); const r = await axios.get(`${GRAPH}/me/accounts?access_token=${token}`); return r.data?.data||[]
}
export async function fbPageInsights(userId, pageId){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'facebook' } }); if(!acct) return { data:[] }
  const token = dec(acct.access); const metrics='page_impressions,page_engaged_users'
  const r = await axios.get(`${GRAPH}/${pageId}/insights?metric=${metrics}&period=week&access_token=${token}`); return r.data
}
export async function igAccountsFromPage(userId, pageId){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'facebook' } }); if(!acct) return null
  const token = dec(acct.access); const r = await axios.get(`${GRAPH}/${pageId}?fields=instagram_business_account&access_token=${token}`)
  return r.data?.instagram_business_account||null
}
export async function igInsights(userId, igId){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'facebook' } }); if(!acct) return { data:[] }
  const token = dec(acct.access); const metrics='impressions,reach,profile_views,website_clicks'
  const r = await axios.get(`${GRAPH}/${igId}/insights?metric=${metrics}&period=day&access_token=${token}`); return r.data
}
