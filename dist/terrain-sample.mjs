// Interpolate the same diagonal used by Three PlaneGeometry after rotateX(-PI/2).
export function sampleTerrain(grid,side,x,y){
 if(!grid)return 0;
 const u=Math.max(0,Math.min(grid.N,x/side*grid.N)),v=Math.max(0,Math.min(grid.N,y/side*grid.N));
 const i=Math.min(grid.N-1,Math.floor(u)),j=Math.min(grid.N-1,Math.floor(v)),a=u-i,b=v-j,n=grid.N+1;
 const h00=grid.vals[j*n+i],h10=grid.vals[j*n+i+1],h01=grid.vals[(j+1)*n+i],h11=grid.vals[(j+1)*n+i+1];
 return (b>=a?h00*(1-b)+h01*(b-a)+h11*a:h00*(1-a)+h10*(a-b)+h11*b)-grid.min;
}

