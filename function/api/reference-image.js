function safeMessage(err){return String(err?.message||err||'').replace(/\s+/g,' ').trim().slice(0,220)}
export async function onRequestPost(context){
  const {request,env}=context;
  if(!env.AI)return Response.json({ok:false,error:'ai_not_configured',stage:'binding'},{status:503});
  let body={};try{body=await request.json()}catch(e){}
  const kind=String(body.kind||'').trim(),prompt=String(body.prompt||'').trim().slice(0,2048);
  if(!['character','location','product'].includes(kind)||!prompt)return Response.json({ok:false,error:'invalid_reference_request'},{status:400});
  let out;
  try{out=await env.AI.run('@cf/black-forest-labs/flux-1-schnell',{prompt,steps:4,seed:Math.floor(Math.random()*2147483647)})}
  catch(primary){try{out=await env.AI.run('@cf/black-forest-labs/flux-1-schnell',{prompt})}catch(retry){return Response.json({ok:false,error:'ai_inference_failed',detail:safeMessage(retry)||safeMessage(primary)},{status:502})}}
  if(!out?.image)return Response.json({ok:false,error:'invalid_ai_response'},{status:502});
  return Response.json({ok:true,kind,dataURI:`data:image/jpeg;charset=utf-8;base64,${out.image}`});
}
