import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const origin = Deno.env.get("ALLOWED_ORIGIN") ?? "";
const headers = {"Access-Control-Allow-Origin": origin,"Access-Control-Allow-Headers":"content-type, authorization, apikey","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin","Content-Type":"application/json","Cache-Control":"no-store"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 if(!origin || req.headers.get("origin")!==origin)return reply({error:"Not allowed"},403);
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),secret=Deno.env.get("RESUME_ACCESS_CODE");
 if(!url||!key||!secret)return reply({error:"Resume access is not configured"},503);
 const ip=(req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
 const bytes=new TextEncoder().encode(ip+"|"+(Deno.env.get("RESUME_RATE_SALT")||""));
 const digest=await crypto.subtle.digest("SHA-256",bytes);const ipHash=Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
 const sb=createClient(url,key,{auth:{persistSession:false}});
 const since=new Date(Date.now()-60*60*1000).toISOString();
 const {count,error:countError}=await sb.from("resume_access_attempts").select("id",{count:"exact",head:true}).eq("ip_hash",ipHash).gte("created_at",since);
 if(countError)return reply({error:"Access temporarily unavailable"},503);
 if((count??0)>=5)return reply({error:"Too many attempts. Try again later."},429);
 let body:{code?:unknown};try{body=await req.json()}catch{return reply({error:"Invalid request"},400)}
 const code=typeof body.code==="string"?body.code:"";
 if(code.length>32)return reply({error:"Invalid access code"},400);
 const {error:insertError}=await sb.from("resume_access_attempts").insert({ip_hash:ipHash});
 if(insertError)return reply({error:"Access temporarily unavailable"},503);
 // Constant time comparison of fixed length SHA256 digests.
 const hash=async(s:string)=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
 const a=await hash(code),b=await hash(secret);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
 if(diff!==0)return reply({error:"Incorrect access code"},401);
 const {data,error}=await sb.storage.from("private-resumes").createSignedUrl("Orion_Ford_Resume.docx",60,{download:"Orion_Ford_Resume.docx"});
 if(error||!data?.signedUrl)return reply({error:"Resume is temporarily unavailable"},503);
 return reply({url:data.signedUrl});
});
