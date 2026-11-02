import { createClient } from 'npm:@supabase/supabase-js@2';
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '';
const allowedInterests = new Set(['Automotive mechanics','Diagnostics and OBD-II','Electronics and embedded systems','Open source hardware and software','Motorsports and vehicle design','Workshops and tutorials','Community collaboration']);
function respond(body: unknown, code=200, origin='') {return new Response(JSON.stringify(body),{status:code,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'content-type'}})}
Deno.serve(async(req)=>{
 const origin=req.headers.get('origin')??'';
 if(!allowedOrigin || origin!==allowedOrigin)return respond({error:'Origin not allowed'},403);
 if(req.method==='OPTIONS')return respond({},200,origin);
 if(req.method!=='POST')return respond({error:'Method not allowed'},405,origin);
 if(Number(req.headers.get('content-length')??'0')>8000)return respond({error:'Request too large'},413,origin);
 let d:Record<string,unknown>;
 try {d=await req.json()}catch{return respond({error:'Invalid JSON'},400,origin)}
 const str=(k:string)=>typeof d[k]==='string'?(d[k] as string).trim():'';
 const first_name=str('first_name'),last_name=str('last_name'),email=str('email').toLowerCase(),interest=str('interest'),message=str('message'),token=str('captcha_token');
 if(!first_name||first_name.length>80||!last_name||last_name.length>80||email.length>180||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!allowedInterests.has(interest)||message.length>1000||d.consent!==true||!token)return respond({error:'Please check your details and complete the verification.'},400,origin);
 const secret=Deno.env.get('TURNSTILE_SECRET_KEY');
 if(!secret)return respond({error:'Registration is not configured.'},503,origin);
 const ip=req.headers.get('cf-connecting-ip')??'';
 let valid=false;
 try{const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret,response:token,remoteip:ip})});const result=await verify.json();valid=result.success===true && (!result.hostname || result.hostname===new URL(origin).hostname)}catch{return respond({error:'Verification temporarily unavailable.'},503,origin)}
 if(!valid)return respond({error:'Spam protection verification failed. Please try again.'},403,origin);
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return respond({error:'Registration is not configured.'},503,origin);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {error}=await db.from('community_applications').insert({first_name,last_name,email,interest,message,consent:true,status:'pending'});
 if(error){console.error('Community insert failed',error.code);return respond({error:'Unable to save your application. Please retry.'},500,origin)}
 return respond({ok:true},201,origin);
});
