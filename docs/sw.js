const CACHE='anxiety-shell-v4';
const SDK=['firebase-app','firebase-auth','firebase-firestore'].map(name=>`https://www.gstatic.com/firebasejs/13.1.0/${name}.js`);
const SHELL=['./','./index.html','./data.js','./cloud.js','./auth-errors.js','./firebase-config.js','./manifest.webmanifest','./icons/icon-180.png','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>Promise.all([cache.addAll(SHELL),...SDK.map(url=>cache.add(url).catch(()=>{}))]))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('anxiety-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 // Never cache auth requests, database responses, import files, or exports here.
 if(event.request.method!=='GET')return;
 const shell=url.origin===location.origin&&SHELL.some(path=>new URL(path,self.registration.scope).href===url.href);
 if(!shell&&!SDK.includes(url.href))return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;
 }).catch(()=>caches.match(event.request)));
});
