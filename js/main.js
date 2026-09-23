/* Dienynas — paleidimas */
(async function boot(){
  if(!window.supabase||!window.CONFIG||/JUSU-/.test(CONFIG.SUPABASE_URL)){
    $("#root").innerHTML=`<div class="auth-r" style="min-height:100vh"><div class="auth-card"><h2 style="margin-top:0">Reikia konfigūracijos</h2><p>Atidarykite <span class="mono">js/config.js</span> ir įrašykite savo Supabase projekto URL bei „anon public“ raktą (Supabase → Project Settings → API). Išsami instrukcija — README.md faile.</p></div></div>`;
    return;
  }
  try{await loadSettingsPublic();}catch(e){authUi.dbError=e.message;}
  sb.auth.onAuthStateChange((event)=>{if(event==="SIGNED_OUT"){authUser=null;}});
  await afterAuth();
})();
