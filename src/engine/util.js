export const clamp = (x, min=0, max=1)=>Math.max(min, Math.min(max, x));
export const jaccard = (a, b)=>{
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x=>B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni ? inter/uni : 0;
};
export const rndPick = (arr)=>arr[Math.floor(Math.random()*arr.length)];
export const uniq = (arr)=>[...new Set(arr)];
export const hash = (s)=>[...s].reduce((a,c)=>a+c.charCodeAt(0),0);
