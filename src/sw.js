const CACHE = 'abg-v3-red-v1';
const ASSETS = [
  './','./index.html','./styles/app.css','./manifest.webmanifest',
  './src/app.js','./src/ui.js','./src/generator.js','./src/sw-reg.js','./src/sw.js',
  './src/components/intro.js',
  './src/engine/util.js','./src/engine/state.js','./src/engine/learn.js',
  './src/engine/scoring.js','./src/engine/planner.js','./src/engine/context.js','./src/engine/candidates.js',
  './data/archetypes.js','./data/venues.js','./data/platforms.js',
  './data/ethnicity.js','./data/signals.js','./data/edgy.js','./data/discovery.js',
  './data/cities/la.js','./data/cities/vegas.js','./data/cities/houston.js',
  './data/cities/slc.js','./data/cities/nyc.js','./data/cities/bayarea.js','./data/cities/seattle.js'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE && caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
