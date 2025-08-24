import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { dec } from '../utils.js'
const prisma = new PrismaClient(); const API='https://api.linkedin.com/v2'
export async function liMe(userId){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'linkedin' } }); if(!acct) return null
  const token = dec(acct.access); const r = await axios.get(`${API}/me`, { headers:{ Authorization:`Bearer ${token}` } }); return r.data
}
export async function liOrganizationStats(userId, orgUrn){
  const acct = await prisma.account.findFirst({ where:{ userId, provider:'linkedin' } }); if(!acct) return null
  const token = dec(acct.access); const r = await axios.get(`${API}/organizationPageStatistics?q=organization&organization=${encodeURIComponent(orgUrn)}`, { headers:{ Authorization:`Bearer ${token}` } })
  return r.data
}
