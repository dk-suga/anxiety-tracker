import { firebaseConfig } from './firebase-config.js';
export async function connectCloud(callbacks){
 if(!firebaseConfig?.apiKey||!firebaseConfig?.projectId||!firebaseConfig?.authDomain)throw Error('Приложение подготовлено. Перед первым входом нужно подключить Firebase.');
 const version='13.1.0';
 const [appSDK,authSDK,dbSDK]=await Promise.all([
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
  import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
 ]);
 const app=appSDK.initializeApp(firebaseConfig);
 const auth=authSDK.getAuth(app);
 await authSDK.setPersistence(auth,authSDK.browserLocalPersistence);
 const db=dbSDK.initializeFirestore(app,{localCache:dbSDK.persistentLocalCache({tabManager:dbSDK.persistentMultipleTabManager()})});
 let unsubscribe=null;let uid=null;let generation=0;
 authSDK.onAuthStateChanged(auth,user=>{
  const current=++generation;unsubscribe?.();uid=user?.uid??null;
  if(!uid){callbacks.onSignedOut();return;}
  callbacks.onLoading();
  const records=dbSDK.collection(db,'anxietyUsers',uid,'entries');
  unsubscribe=dbSDK.onSnapshot(records,{includeMetadataChanges:true},snapshot=>{
   if(generation!==current)return;
   const entries={};snapshot.forEach(doc=>{entries[doc.id]=doc.data();});
   callbacks.onData(entries,{fromCache:snapshot.metadata.fromCache,pending:snapshot.metadata.hasPendingWrites});
  },()=>{if(generation===current)callbacks.onError();});
 });
 function ref(key){if(!uid)throw Error('Сначала войди.');return dbSDK.doc(db,'anxietyUsers',uid,'entries',key);}
 return {
  signIn:()=>authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider()),
  async signOut(){generation++;unsubscribe?.();uid=null;callbacks.onSignedOut();await authSDK.signOut(auth);},
  save:(key,entry)=>dbSDK.setDoc(ref(key),entry),
  remove:key=>dbSDK.deleteDoc(ref(key)),
  async importEntries(entries){
   if(!uid)throw Error('Сначала войди.');const importUid=uid;const items=Object.entries(entries);
   for(let i=0;i<items.length;i+=200){
    if(uid!==importUid)throw Error('Аккаунт изменился.');
    const chunk=items.slice(i,i+200).map(([key,value])=>({ref:ref(key),value}));
    await dbSDK.runTransaction(db,async transaction=>{
     const snapshots=await Promise.all(chunk.map(item=>transaction.get(item.ref)));
     snapshots.forEach((snapshot,index)=>{if(!snapshot.exists())transaction.set(chunk[index].ref,chunk[index].value);});
    });
   }
  }
 };
}
