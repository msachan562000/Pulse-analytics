import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth20'
import FacebookStrategy from 'passport-facebook'
import LinkedInStrategy from 'passport-linkedin-oauth2'
import { PrismaClient } from '@prisma/client'
import { enc } from './utils.js'

const prisma = new PrismaClient()

passport.serializeUser((user, done)=> done(null, user.id))
passport.deserializeUser(async (id, done)=> { const user = await prisma.user.findUnique({ where: { id } }); done(null, user) })

export function setupPassport(app){
  const g = { id:process.env.GOOGLE_CLIENT_ID, sec:process.env.GOOGLE_CLIENT_SECRET, cb:process.env.GOOGLE_CALLBACK_URL }
  if(g.id && g.sec){
    passport.use(new GoogleStrategy({
      clientID:g.id, clientSecret:g.sec, callbackURL:g.cb,
      scope:['openid','email','profile','https://www.googleapis.com/auth/webmasters.readonly'],
      passReqToCallback:true
    }, async (req, accessToken, refreshToken, params, profile, done)=>{
      try{
        const email = profile.emails?.[0]?.value || `${profile.id}@google.local`
        const user = await prisma.user.upsert({ where:{email}, create:{email, name:profile.displayName||'Google User'}, update:{} })
        await prisma.account.upsert({
          where:{ provider_providerId:{ provider:'google', providerId: profile.id } },
          create:{ provider:'google', providerId:profile.id, userId:user.id, access:enc(accessToken), refresh:enc(refreshToken||''), expiresAt: params?.expires_in ? new Date(Date.now()+params.expires_in*1000) : null },
          update:{ access:enc(accessToken), refresh:enc(refreshToken||'') }
        })
        done(null, user)
      }catch(e){ done(e) }
    }))
  }

  const f = { id:process.env.FACEBOOK_APP_ID, sec:process.env.FACEBOOK_APP_SECRET, cb:process.env.FACEBOOK_CALLBACK_URL }
  if(f.id && f.sec){
    passport.use(new FacebookStrategy({
      clientID:f.id, clientSecret:f.sec, callbackURL:f.cb, profileFields:['id','displayName','emails']
    }, async (accessToken, refreshToken, profile, done)=>{
      try{
        const email = profile.emails?.[0]?.value || `${profile.id}@facebook.local`
        const user = await prisma.user.upsert({ where:{email}, create:{email, name:profile.displayName||'FB User'}, update:{} })
        await prisma.account.upsert({
          where:{ provider_providerId:{ provider:'facebook', providerId: profile.id } },
          create:{ provider:'facebook', providerId:profile.id, userId:user.id, access:enc(accessToken) },
          update:{ access:enc(accessToken) }
        })
        done(null, user)
      }catch(e){ done(e) }
    }))
  }

  const l = { id:process.env.LINKEDIN_CLIENT_ID, sec:process.env.LINKEDIN_CLIENT_SECRET, cb:process.env.LINKEDIN_CALLBACK_URL }
  if(l.id && l.sec){
    passport.use(new LinkedInStrategy({
      clientID:l.id, clientSecret:l.sec, callbackURL:l.cb, scope:['r_liteprofile','r_emailaddress','rw_organization_admin','r_organization_social']
    }, async (accessToken, refreshToken, profile, done)=>{
      try{
        const email = profile.emails?.[0]?.value || `${profile.id}@linkedin.local`
        const user = await prisma.user.upsert({ where:{email}, create:{email, name:profile.displayName||'LinkedIn User'}, update:{} })
        await prisma.account.upsert({
          where:{ provider_providerId:{ provider:'linkedin', providerId: profile.id } },
          create:{ provider:'linkedin', providerId:profile.id, userId:user.id, access:enc(accessToken) },
          update:{ access:enc(accessToken) }
        })
        done(null, user)
      }catch(e){ done(e) }
    }))
  }

  app.use(passport.initialize())
  app.use(passport.session && passport.session())
}
