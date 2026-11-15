import {parseMeters} from './buildings.mjs';
const present=v=>v!==undefined&&v!==null&&String(v).trim()!=='';
const levels=v=>{const s=String(v??'').trim();if(!/^\d+(?:[.,]\d+)?$/.test(s))return null;const n=Number(s.replace(',','.'));return n>=0&&n<300?n:null;};
// Height is total height above local ground, not extrusion depth.
// source describes origin; OSM values are not independently verified measurements.
export function resolveBuilding(p={}, {allowEstimate=true,floorHeight=3,defaultHeight=9,customHeight}={}){
 const warnings=[];const fh=Number(floorHeight),dh=Number(defaultHeight);
 const floor=Number.isFinite(fh)&&fh>0&&fh<20?fh:3;
 const fallback=Number.isFinite(dh)&&dh>0&&dh<1000?dh:9;
 let height=null,minHeight=0,source='',estimated=false,reason=null;
 if(customHeight!==undefined&&customHeight!==null&&customHeight!==''){
  height=parseMeters(customHeight);source='Высота пользователя (не проверена независимо)';estimated=true;
  if(!(height>0))return {height:null,minHeight:0,source,estimated,reason:'invalid_custom_height',warnings};
 }else{
  const explicit=parseMeters(p.height);
  if(explicit>0){height=explicit;source='Тег height OSM (не проверен независимо)';}
  else{
   const problem=present(p.height)?'invalid_height':'missing_height';
   if(!allowEstimate)return {height:null,minHeight:0,source:'Нет допустимого height OSM',estimated:false,reason:problem,warnings};
   if(problem==='invalid_height')warnings.push('Некорректный height OSM: использована оценка.');
   const n=levels(p['building:levels']),roof=parseMeters(p['roof:height']);
   if(n!==null&&n*floor+(roof??0)>0&&n*floor+(roof??0)<1000){
    height=n*floor+(roof??0);source=`Оценка: building:levels OSM (${n}) × ${floor} м${roof!==null?' + roof:height OSM ('+roof+' м)':''}`;
    if(present(p['roof:height'])&&roof===null)warnings.push('Некорректный roof:height OSM не учтён.');
    if(present(p['roof:levels'])&&roof===null)warnings.push('roof:levels не пересчитан в метры: высота крыши неизвестна.');
   }else{
    height=fallback;source=`Условный объём: высота ${fallback} м, не размер реального здания`;
    if(present(p['building:levels']))warnings.push('Этажность не дала допустимой высоты: использован условный объём.');
   }
   estimated=true;
  }
 }
 if(p.min_height!==undefined){
  minHeight=parseMeters(p.min_height);
  if(minHeight===null)return {height:null,minHeight:null,source,estimated,reason:'invalid_min_height',warnings};
 }else if(allowEstimate&&present(p['building:min_level'])){
  const minLevel=levels(p['building:min_level']);
  if(minLevel!==null){minHeight=minLevel*floor;estimated=true;source+=`; нижняя отметка — оценка building:min_level (${minLevel}) × ${floor} м`;}
  else warnings.push('Некорректный building:min_level: нижняя отметка принята 0 м.');
 }
 if(minHeight>=height){reason='min_height_conflict';height=null;}
 return {height,minHeight,source,estimated,reason,warnings};
}

