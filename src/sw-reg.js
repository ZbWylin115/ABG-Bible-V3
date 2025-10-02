export function registerSW(){
  if('serviceWorker' in navigator){
    addEventListener('load', () => {
      navigator.serviceWorker.register('./src/sw.js').catch(()=>{});
    });
  }
}
