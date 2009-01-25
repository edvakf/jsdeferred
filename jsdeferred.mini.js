// JSDeferred 0.2.2 (c) Copyright (c) 2007 cho45 ( www.lowreal.net )
// See http://coderepos.org/share/wiki/JSDeferred
function Deferred(){return(this instanceof Deferred)? this.init():new Deferred()}
Deferred.prototype={
init:function(){
this._next=null;this.callback={
ok:function(x){return x},
ng:function(x){throw x}
};return this;},
next:function(fun){return this._post("ok",fun)},
error:function(fun){return this._post("ng",fun)},
call:function(val){return this._fire("ok",val)},
fail:function(err){return this._fire("ng",err)},
cancel:function(){
(this.canceller || function(){})();return this.init();},
_post:function(okng,fun){
this._next=new Deferred();this._next.callback[okng]=fun;return this._next;},
_fire:function(okng,value){
var next="ok";try{
value=this.callback[okng].call(this,value);}catch(e){
next="ng";value=e;}
if(value instanceof Deferred){
value._next=this._next;}else{
if(this._next)this._next._fire(next,value);}
return this;}
};Deferred.parallel=function(dl){
var ret=new Deferred(),values={},num=0;for(var i in dl)if(dl.hasOwnProperty(i))(function(d,i){
d.next(function(v){
values[i]=v;if(--num<=0){
if(dl instanceof Array){
values.length=dl.length;values=Array.prototype.slice.call(values,0);}
ret.call(values);}
}).error(function(e){
ret.fail(e);});num++;})(dl[i],i);if(!num)Deferred.next(function(){ret.call()});ret.canceller=function(){
for(var i in dl)if(dl.hasOwnProperty(i)){
dl[i].cancel();}
};return ret;};Deferred.wait=function(n){
var d=new Deferred(),t=new Date();var id=setTimeout(function(){
clearTimeout(id);d.call((new Date).getTime()-t.getTime());},n*1000);d.canceller=function(){try{clearTimeout(id)}catch(e){}};return d;};Deferred.next=function(fun){
var d=new Deferred();var me=Deferred.next;switch(true){
case me._enable_faster_way && me._enable_faster_way_Image:{
var img=new Image();var handler=function(){
d.canceller();d.call();};img.addEventListener("load",handler,false);img.addEventListener("error",handler,false);d.canceller=function(){
img.removeEventListener("load",handler,false);img.removeEventListener("error",handler,false);};img.src="data:,/_/X";break;}
default:{
var id=setTimeout(function(){clearTimeout(id);d.call()},0);d.canceller=function(){try{clearTimeout(id)}catch(e){}};}
}
if(fun)d.callback.ok=fun;return d;};Deferred.next._enable_faster_way=true;Deferred.next._enable_faster_way_Image=(/\b(?:Gecko\/|AppleWebKit\/|Opera\/)/.test(navigator.userAgent));Deferred.call=function(f,args){
args=Array.prototype.slice.call(arguments);f=args.shift();return Deferred.next(function(){
return f.apply(this,args);});};Deferred.loop=function(n,fun){
var o={
begin:n.begin || 0,
end:(typeof n.end=="number")? n.end:n-1,
step:n.step || 1,
last:false,
prev:null
};var ret,step=o.step;return Deferred.next(function(){
function _loop(i){
if(i<=o.end){
if((i+step)>o.end){
o.last=true;o.step=o.end-i+1;}
o.prev=ret;ret=fun.call(this,i,o);if(ret instanceof Deferred){
return ret.next(function(r){
ret=r;return Deferred.call(_loop,i+step);});}else{
return Deferred.call(_loop,i+step);}
}else{
return ret;}
}
return(o.begin<=o.end)? Deferred.call(_loop,o.begin):null;});};Deferred.register=function(name,fun){
this.prototype[name]=function(){
return this.next(Deferred.wrap(fun).apply(null,arguments));};};Deferred.wrap=function(dfun){
return function(){
var a=arguments;return function(){
return dfun.apply(null,a);};};};Deferred.register("loop",Deferred.loop);Deferred.register("wait",Deferred.wait);Deferred.define=function(obj,list){
if(!list)list=["parallel","wait","next","call","loop"];if(!obj)obj=(function getGlobal(){return this})();for(var i=0;i<list.length;i++){
var n=list[i];obj[n]=Deferred[n];}
return Deferred;};