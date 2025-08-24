import CryptoJS from 'crypto-js'
const KEY = process.env.ENCRYPTION_KEY || 'changeme'
export const enc = (v)=> v ? CryptoJS.AES.encrypt(v, KEY).toString() : ''
export const dec = (v)=> { if(!v) return ''; try{return CryptoJS.AES.decrypt(v, KEY).toString(CryptoJS.enc.Utf8)}catch{return ''} }
export function ensureEnv(keys){ for(const k of keys){ if(!process.env[k]) console.warn(`[warn] Missing env ${k}`) } }
