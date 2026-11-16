// Illustrative urban baseline: remove local DEM spikes, then smooth gradual grade.
// Original elevations and vertical datum remain available in the source-DEM mode.
export function smoothUrbanGrid(grid){
 const {N,vals,min}=grid,n=N+1,at=(data,x,y)=>data[Math.max(0,Math.min(N,y))*n+Math.max(0,Math.min(N,x))],median=[];
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const samples=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)samples.push(at(vals,x+dx,y+dy));samples.sort((a,b)=>a-b);median.push(samples[12]);}
 const kernel=[1,4,6,4,1],h=[],out=[];for(let y=0;y<n;y++)for(let x=0;x<n;x++)h.push(kernel.reduce((s,w,k)=>s+w*at(median,x+k-2,y),0)/16);for(let y=0;y<n;y++)for(let x=0;x<n;x++)out.push(kernel.reduce((s,w,k)=>s+w*at(h,x,y+k-2),0)/16);
 return {N,vals:out,min};
}

