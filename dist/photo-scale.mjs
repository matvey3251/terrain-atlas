export function photoHeight(referenceMeters,referencePixels,buildingPixels){const [m,r,b]=[referenceMeters,referencePixels,buildingPixels].map(Number);if(![m,r,b].every(v=>Number.isFinite(v)&&v>0))throw Error('Введите три положительных размера.');const h=m*b/r;if(h<=0||h>=1000)throw Error('Проверьте масштаб: высота должна быть меньше 1000 м.');return Math.round(h*100)/100;}
export const photoReferences={
 'relation/85761':{url:'https://commons.wikimedia.org/wiki/Category:Hotel_Metropol_(Moscow)',label:'Метрополь — фотографии Wikimedia Commons'},
 'relation/19569819':{url:'https://commons.wikimedia.org/wiki/File:Detmir02.jpg',label:'Детский мир — историческое фото 2007 года (до реконструкции)'}
};

