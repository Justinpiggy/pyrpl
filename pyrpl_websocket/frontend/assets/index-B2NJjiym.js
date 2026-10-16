(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const ih=!0,We="u-",ah="uplot",oh=We+"hz",rh=We+"vt",lh=We+"title",ch=We+"wrap",uh=We+"under",ph=We+"over",hh=We+"axis",hs=We+"off",dh=We+"select",fh=We+"cursor-x",mh=We+"cursor-y",gh=We+"cursor-pt",vh=We+"legend",bh=We+"live",wh=We+"inline",xh=We+"series",yh=We+"marker",zl=We+"label",Sh=We+"value",Ii="width",Ri="height",_i="top",_l="bottom",Ws="left",Co="right",hr="#000",Ll=hr+"0",Eo="mousemove",Fl="mousedown",Po="mouseup",Tl="mouseenter",Il="mouseleave",Rl="dblclick",kh="resize",Mh="scroll",Nl="change",Ca="dppxchange",dr="--",mi=typeof window<"u",qo=mi?document:null,ei=mi?window:null,Ch=mi?navigator:null;let be,da;function Vo(){let t=devicePixelRatio;be!=t&&(be=t,da&&Ho(Nl,da,Vo),da=matchMedia(`(min-resolution: ${be-.001}dppx) and (max-resolution: ${be+.001}dppx)`),fs(Nl,da,Vo),ei.dispatchEvent(new CustomEvent(Ca)))}function Ct(t,e){if(e!=null){let n=t.classList;!n.contains(e)&&n.add(e)}}function Yo(t,e){let n=t.classList;n.contains(e)&&n.remove(e)}function Fe(t,e,n){t.style[e]=n+"px"}function Zt(t,e,n,s){let i=qo.createElement(t);return e!=null&&Ct(i,e),n?.insertBefore(i,s),i}function It(t,e){return Zt("div",t,e)}const $l=new WeakMap;function dn(t,e,n,s,i){let a="translate("+e+"px,"+n+"px)",o=$l.get(t);a!=o&&(t.style.transform=a,$l.set(t,a),e<0||n<0||e>s||n>i?Ct(t,hs):Yo(t,hs))}const Ol=new WeakMap;function Dl(t,e,n){let s=e+n,i=Ol.get(t);s!=i&&(Ol.set(t,s),t.style.background=e,t.style.borderColor=n)}const Bl=new WeakMap;function ql(t,e,n,s){let i=e+""+n,a=Bl.get(t);i!=a&&(Bl.set(t,i),t.style.height=n+"px",t.style.width=e+"px",t.style.marginLeft=s?-e/2+"px":0,t.style.marginTop=s?-n/2+"px":0)}const fr={passive:!0},Eh={...fr,capture:!0};function fs(t,e,n,s){e.addEventListener(t,n,s?Eh:fr)}function Ho(t,e,n,s){e.removeEventListener(t,n,fr)}mi&&Vo();function Jt(t,e,n,s){let i;n=n||0,s=s||e.length-1;let a=s<=2147483647;for(;s-n>1;)i=a?n+s>>1:Pt((n+s)/2),e[i]<t?n=i:s=i;return t-e[n]<=e[s]-t?n:s}function Wc(t){return(n,s,i)=>{let a=-1,o=-1;for(let l=s;l<=i;l++)if(t(n[l])){a=l;break}for(let l=i;l>=s;l--)if(t(n[l])){o=l;break}return[a,o]}}const Uc=t=>t!=null,Xc=t=>t!=null&&t>0,$a=Wc(Uc),Ph=Wc(Xc);function Ah(t,e,n,s=0,i=!1){let a=i?Ph:$a,o=i?Xc:Uc;[e,n]=a(t,e,n);let l=t[e],u=t[e];if(e>-1)if(s==1)l=t[e],u=t[n];else if(s==-1)l=t[n],u=t[e];else for(let d=e;d<=n;d++){let v=t[d];o(v)&&(v<l?l=v:v>u&&(u=v))}return[l??Me,u??-Me]}function Oa(t,e,n,s){let i=Hl(t),a=Hl(e);t==e&&(i==-1?(t*=n,e/=n):(t/=n,e*=n));let o=n==10?Mn:Gc,l=i==1?Pt:Nt,u=a==1?Nt:Pt,d=l(o(He(t))),v=u(o(He(e))),m=ii(n,d),f=ii(n,v);return n==10&&(d<0&&(m=Ce(m,-d)),v<0&&(f=Ce(f,-v))),s||n==2?(t=m*i,e=f*a):(t=Qc(t,m),e=Da(e,f)),[t,e]}function mr(t,e,n,s){let i=Oa(t,e,n,s);return t==0&&(i[0]=0),e==0&&(i[1]=0),i}const gr=.1,Vl={mode:3,pad:gr},Bi={pad:0,soft:null,mode:0},zh={min:Bi,max:Bi};function Ea(t,e,n,s){return Ba(n)?Yl(t,e,n):(Bi.pad=n,Bi.soft=s?0:null,Bi.mode=s?3:0,Yl(t,e,zh))}function fe(t,e){return t??e}function _h(t,e,n){for(e=fe(e,0),n=fe(n,t.length-1);e<=n;){if(t[e]!=null)return!0;e++}return!1}function Yl(t,e,n){let s=n.min,i=n.max,a=fe(s.pad,0),o=fe(i.pad,0),l=fe(s.hard,-Me),u=fe(i.hard,Me),d=fe(s.soft,Me),v=fe(i.soft,-Me),m=fe(s.mode,0),f=fe(i.mode,0),y=e-t,P=Mn(y),R=dt(He(t),He(e)),F=Mn(R),_=He(F-P);(y<1e-24||_>10)&&(y=0,(t==0||e==0)&&(y=1e-24,m==2&&d!=Me&&(a=0),f==2&&v!=-Me&&(o=0)));let k=y||R||1e3,D=Mn(k),z=ii(10,Pt(D)),K=k*(y==0?t==0?.1:1:a),$=Ce(Qc(t-K,z/10),24),te=t>=d&&(m==1||m==3&&$<=d||m==2&&$>=d)?d:Me,X=dt(l,$<te&&t>=te?te:Qt(te,$)),ie=k*(y==0?e==0?.1:1:o),Q=Ce(Da(e+ie,z/10),24),L=e<=v&&(f==1||f==3&&Q>=v||f==2&&Q<=v)?v:-Me,ne=Qt(u,Q>L&&e<=L?L:dt(L,Q));return X==ne&&X==0&&(ne=100),[X,ne]}const Lh=new Intl.NumberFormat(mi?Ch.language:"en-US"),vr=t=>Lh.format(t),At=Math,ka=At.PI,He=At.abs,Pt=At.floor,Ye=At.round,Nt=At.ceil,Qt=At.min,dt=At.max,ii=At.pow,Hl=At.sign,Mn=At.log10,Gc=At.log2,Fh=(t,e=1)=>At.sinh(t)*e,Ao=(t,e=1)=>At.asinh(t/e),Me=1/0;function jl(t){return(Mn((t^t>>31)-(t>>31))|0)+1}function jo(t,e,n){return Qt(dt(t,e),n)}function Kc(t){return typeof t=="function"}function le(t){return Kc(t)?t:()=>t}const Th=()=>{},Zc=t=>t,Jc=(t,e)=>e,Ih=t=>null,Wl=t=>!0,Ul=(t,e)=>t==e,Rh=/\.\d*?(?=9{6,}|0{6,})/gm,gs=t=>{if(tu(t)||Hn.has(t))return t;const e=`${t}`,n=e.match(Rh);if(n==null)return t;let s=n[0].length-1;if(e.indexOf("e-")!=-1){let[i,a]=e.split("e");return+`${gs(i)}e${a}`}return Ce(t,s)};function us(t,e){return gs(Ce(gs(t/e))*e)}function Da(t,e){return gs(Nt(gs(t/e))*e)}function Qc(t,e){return gs(Pt(gs(t/e))*e)}function Ce(t,e=0){if(tu(t))return t;let n=10**e,s=t*n*(1+Number.EPSILON);return Ye(s)/n}const Hn=new Map;function eu(t){return((""+t).split(".")[1]||"").length}function Hi(t,e,n,s){let i=[],a=s.map(eu);for(let o=e;o<n;o++){let l=He(o),u=Ce(ii(t,o),l);for(let d=0;d<s.length;d++){let v=t==10?+`${s[d]}e${o}`:s[d]*u,m=(o>=0?0:l)+(o>=a[d]?0:a[d]),f=t==10?v:Ce(v,m);i.push(f),Hn.set(f,m)}}return i}const qi={},br=[],ai=[null,null],Bn=Array.isArray,tu=Number.isInteger,Nh=t=>t===void 0;function Xl(t){return typeof t=="string"}function Ba(t){let e=!1;if(t!=null){let n=t.constructor;e=n==null||n==Object}return e}function $h(t){return t!=null&&typeof t=="object"}const Oh=Object.getPrototypeOf(Uint8Array),nu="__proto__";function oi(t,e=Ba){let n;if(Bn(t)){let s=t.find(i=>i!=null);if(Bn(s)||e(s)){n=Array(t.length);for(let i=0;i<t.length;i++)n[i]=oi(t[i],e)}else n=t.slice()}else if(t instanceof Oh)n=t.slice();else if(e(t)){n={};for(let s in t)s!=nu&&(n[s]=oi(t[s],e))}else n=t;return n}function qe(t){let e=arguments;for(let n=1;n<e.length;n++){let s=e[n];for(let i in s)i!=nu&&(Ba(t[i])?qe(t[i],oi(s[i])):t[i]=oi(s[i]))}return t}const Dh=0,Bh=1,qh=2;function Vh(t,e,n){for(let s=0,i,a=-1;s<e.length;s++){let o=e[s];if(o>a){for(i=o-1;i>=0&&t[i]==null;)t[i--]=null;for(i=o+1;i<n&&t[i]==null;)t[a=i++]=null}}}function Yh(t,e){if(Wh(t)){let o=t[0].slice();for(let l=1;l<t.length;l++)o.push(...t[l].slice(1));return Uh(o[0])||(o=jh(o)),o}let n=new Set;for(let o=0;o<t.length;o++){let u=t[o][0],d=u.length;for(let v=0;v<d;v++)n.add(u[v])}let s=[Array.from(n).sort((o,l)=>o-l)],i=s[0].length,a=new Map;for(let o=0;o<i;o++)a.set(s[0][o],o);for(let o=0;o<t.length;o++){let l=t[o],u=l[0];for(let d=1;d<l.length;d++){let v=l[d],m=Array(i).fill(void 0),f=e?e[o][d]:Bh,y=[];for(let P=0;P<v.length;P++){let R=v[P],F=a.get(u[P]);R===null?f!=Dh&&(m[F]=R,f==qh&&y.push(F)):m[F]=R}Vh(m,y,i),s.push(m)}}return s}const Hh=typeof queueMicrotask>"u"?t=>Promise.resolve().then(t):queueMicrotask;function jh(t){let e=t[0],n=e.length,s=Array(n);for(let a=0;a<s.length;a++)s[a]=a;s.sort((a,o)=>e[a]-e[o]);let i=[];for(let a=0;a<t.length;a++){let o=t[a],l=Array(n);for(let u=0;u<n;u++)l[u]=o[s[u]];i.push(l)}return i}function Wh(t){let e=t[0][0],n=e.length;for(let s=1;s<t.length;s++){let i=t[s][0];if(i.length!=n)return!1;if(i!=e){for(let a=0;a<n;a++)if(i[a]!=e[a])return!1}}return!0}function Uh(t,e=100){const n=t.length;if(n<=1)return!0;let s=0,i=n-1;for(;s<=i&&t[s]==null;)s++;for(;i>=s&&t[i]==null;)i--;if(i<=s)return!0;const a=dt(1,Pt((i-s+1)/e));for(let o=t[s],l=s+a;l<=i;l+=a){const u=t[l];if(u!=null){if(u<=o)return!1;o=u}}return!0}const su=["January","February","March","April","May","June","July","August","September","October","November","December"],iu=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function au(t){return t.slice(0,3)}const Xh=iu.map(au),Gh=su.map(au),Kh={MMMM:su,MMM:Gh,WWWW:iu,WWW:Xh};function Li(t){return(t<10?"0":"")+t}function Zh(t){return(t<10?"00":t<100?"0":"")+t}const Jh={YYYY:t=>t.getFullYear(),YY:t=>(t.getFullYear()+"").slice(2),MMMM:(t,e)=>e.MMMM[t.getMonth()],MMM:(t,e)=>e.MMM[t.getMonth()],MM:t=>Li(t.getMonth()+1),M:t=>t.getMonth()+1,DD:t=>Li(t.getDate()),D:t=>t.getDate(),WWWW:(t,e)=>e.WWWW[t.getDay()],WWW:(t,e)=>e.WWW[t.getDay()],HH:t=>Li(t.getHours()),H:t=>t.getHours(),h:t=>{let e=t.getHours();return e==0?12:e>12?e-12:e},AA:t=>t.getHours()>=12?"PM":"AM",aa:t=>t.getHours()>=12?"pm":"am",a:t=>t.getHours()>=12?"p":"a",mm:t=>Li(t.getMinutes()),m:t=>t.getMinutes(),ss:t=>Li(t.getSeconds()),s:t=>t.getSeconds(),fff:t=>Zh(t.getMilliseconds())};function wr(t,e){e=e||Kh;let n=[],s=/\{([a-z]+)\}|[^{]+/gi,i;for(;i=s.exec(t);)n.push(i[0][0]=="{"?Jh[i[1]]:i[0]);return a=>{let o="";for(let l=0;l<n.length;l++)o+=typeof n[l]=="string"?n[l]:n[l](a,e);return o}}const Qh=new Intl.DateTimeFormat().resolvedOptions().timeZone;function ed(t,e){let n;return e=="UTC"||e=="Etc/UTC"?n=new Date(+t+t.getTimezoneOffset()*6e4):e==Qh?n=t:(n=new Date(t.toLocaleString("en-US",{timeZone:e})),n.setMilliseconds(t.getMilliseconds())),n}const ou=t=>t%1==0,Pa=[1,2,2.5,5],td=Hi(10,-32,0,Pa),ru=Hi(10,0,32,Pa),nd=ru.filter(ou),ps=td.concat(ru),xr=`
`,lu="{YYYY}",Gl=xr+lu,cu="{M}/{D}",Ni=xr+cu,fa=Ni+"/{YY}",uu="{aa}",sd="{h}:{mm}",Xs=sd+uu,Kl=xr+Xs,Zl=":{ss}",we=null;function pu(t){let e=t*1e3,n=e*60,s=n*60,i=s*24,a=i*30,o=i*365,u=(t==1?Hi(10,0,3,Pa).filter(ou):Hi(10,-3,0,Pa)).concat([e,e*5,e*10,e*15,e*30,n,n*5,n*10,n*15,n*30,s,s*2,s*3,s*4,s*6,s*8,s*12,i,i*2,i*3,i*4,i*5,i*6,i*7,i*8,i*9,i*10,i*15,a,a*2,a*3,a*4,a*6,o,o*2,o*5,o*10,o*25,o*50,o*100]);const d=[[o,lu,we,we,we,we,we,we,1],[i*28,"{MMM}",Gl,we,we,we,we,we,1],[i,cu,Gl,we,we,we,we,we,1],[s,"{h}"+uu,fa,we,Ni,we,we,we,1],[n,Xs,fa,we,Ni,we,we,we,1],[e,Zl,fa+" "+Xs,we,Ni+" "+Xs,we,Kl,we,1],[t,Zl+".{fff}",fa+" "+Xs,we,Ni+" "+Xs,we,Kl,we,1]];function v(m){return(f,y,P,R,F,_)=>{let k=[],D=F>=o,z=F>=a&&F<o,K=m(P),$=Ce(K*t,3),te=zo(K.getFullYear(),D?0:K.getMonth(),z||D?1:K.getDate()),X=Ce(te*t,3);if(z||D){let ie=z?F/a:0,Q=D?F/o:0,L=$==X?$:Ce(zo(te.getFullYear()+Q,te.getMonth()+ie,1)*t,3),ne=new Date(Ye(L/t)),q=ne.getFullYear(),Z=ne.getMonth();for(let Y=0;L<=R;Y++){let oe=zo(q+Q*Y,Z+ie*Y,1),j=oe-m(Ce(oe*t,3));L=Ce((+oe+j)*t,3),L<=R&&k.push(L)}}else{let ie=F>=i?i:F,Q=Pt(P)-Pt($),L=X+Q+Da($-X,ie);k.push(L);let ne=m(L),q=ne.getHours()+ne.getMinutes()/n+ne.getSeconds()/s,Z=F/s,Y=f.axes[y]._space,oe=_/Y;for(;L=Ce(L+F,t==1?0:3),!(L>R);)if(Z>1){let j=Pt(Ce(q+Z,6))%24,ce=m(L).getHours()-j;ce>1&&(ce=-1),L-=ce*s,q=(q+Z)%24;let ge=k[k.length-1];Ce((L-ge)/F,3)*oe>=.7&&k.push(L)}else k.push(L)}return k}}return[u,d,v]}const[id,ad,od]=pu(1),[rd,ld,cd]=pu(.001);Hi(2,-53,53,[1]);function Jl(t,e){return t.map(n=>n.map((s,i)=>i==0||i==8||s==null?s:e(i==1||n[8]==0?s:n[1]+s)))}function Ql(t,e){return(n,s,i,a,o)=>{let l=e.find(P=>o>=P[0])||e[e.length-1],u,d,v,m,f,y;return s.map(P=>{let R=t(P),F=R.getFullYear(),_=R.getMonth(),k=R.getDate(),D=R.getHours(),z=R.getMinutes(),K=R.getSeconds(),$=F!=u&&l[2]||_!=d&&l[3]||k!=v&&l[4]||D!=m&&l[5]||z!=f&&l[6]||K!=y&&l[7]||l[1];return u=F,d=_,v=k,m=D,f=z,y=K,$(R)})}}function ud(t,e){let n=wr(e);return(s,i,a,o,l)=>i.map(u=>n(t(u)))}function zo(t,e,n){return new Date(t,e,n)}function ec(t,e){return e(t)}const pd="{YYYY}-{MM}-{DD} {h}:{mm}{aa}";function tc(t,e){return(n,s,i,a)=>a==null?dr:e(t(s))}function hd(t,e){let n=t.series[e];return n.width?n.stroke(t,e):n.points.width?n.points.stroke(t,e):null}function dd(t,e){return t.series[e].fill(t,e)}const fd={show:!0,live:!0,isolate:!1,mount:Th,markers:{show:!0,width:2,stroke:hd,fill:dd,dash:"solid"},idx:null,idxs:null,values:[]};function md(t,e){let n=t.cursor.points,s=It(),i=n.size(t,e);Fe(s,Ii,i),Fe(s,Ri,i);let a=i/-2;Fe(s,"marginLeft",a),Fe(s,"marginTop",a);let o=n.width(t,e,i);return o&&Fe(s,"borderWidth",o),s}function gd(t,e){let n=t.series[e].points;return n._fill||n._stroke}function vd(t,e){let n=t.series[e].points;return n._stroke||n._fill}function bd(t,e){return t.series[e].points.size}const _o=[0,0];function wd(t,e,n){return _o[0]=e,_o[1]=n,_o}function ma(t,e,n,s=!0){return i=>{i.button==0&&(!s||i.target==e)&&n(i)}}function Lo(t,e,n,s=!0){return i=>{(!s||i.target==e)&&n(i)}}const xd={show:!0,x:!0,y:!0,lock:!1,move:wd,points:{one:!1,show:md,size:bd,width:0,stroke:vd,fill:gd},bind:{mousedown:ma,mouseup:ma,click:ma,dblclick:ma,mousemove:Lo,mouseleave:Lo,mouseenter:Lo},drag:{setScale:!0,x:!0,y:!1,dist:0,uni:null,click:(t,e)=>{e.stopPropagation(),e.stopImmediatePropagation()},_x:!1,_y:!1},focus:{dist:(t,e,n,s,i)=>s-i,prox:-1,bias:0},hover:{skip:[void 0],prox:null,bias:0},left:-10,top:-10,idx:null,dataIdx:null,idxs:null,event:null},hu={show:!0,stroke:"rgba(0,0,0,0.07)",width:2},yr=qe({},hu,{filter:Jc}),du=qe({},yr,{size:10}),fu=qe({},hu,{show:!1}),Sr='12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',mu="bold "+Sr,gu=1.5,nc={show:!0,scale:"x",stroke:hr,space:50,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:mu,side:2,grid:yr,ticks:du,border:fu,font:Sr,lineGap:gu,rotate:0},yd="Value",Sd="Time",sc={show:!0,scale:"x",auto:!1,sorted:1,min:Me,max:-Me,idxs:[]};function kd(t,e,n,s,i){return e.map(a=>a==null?"":vr(a))}function Md(t,e,n,s,i,a,o){let l=[],u=Hn.get(i)||0;n=o?n:Ce(Da(n,i),u);for(let d=n;d<=s;d=Ce(d+i,u))l.push(Object.is(d,-0)?0:d);return l}function Wo(t,e,n,s,i,a,o){const l=[],u=t.scales[t.axes[e].scale].log,d=u==10?Mn:Gc,v=Pt(d(n));i=ii(u,v),u==10&&(i=ps[Jt(i,ps)]);let m=n,f=i*u;u==10&&(f=ps[Jt(f,ps)]);do l.push(m),m=m+i,u==10&&!Hn.has(m)&&(m=Ce(m,Hn.get(i))),m>=f&&(i=m,f=i*u,u==10&&(f=ps[Jt(f,ps)]));while(m<=s);return l}function Cd(t,e,n,s,i,a,o){let u=t.scales[t.axes[e].scale].asinh,d=s>u?Wo(t,e,dt(u,n),s,i):[u],v=s>=0&&n<=0?[0]:[];return(n<-u?Wo(t,e,dt(u,-s),-n,i):[u]).reverse().map(f=>-f).concat(v,d)}const vu=/./,Ed=/[12357]/,Pd=/[125]/,ic=/1/,Uo=(t,e,n,s)=>t.map((i,a)=>e==4&&i==0||a%s==0&&n.test(i.toExponential()[i<0?1:0])?i:null);function Ad(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=t.scales[o],u=t.valToPos,d=a._space,v=u(10,o),m=u(9,o)-v>=d?vu:u(7,o)-v>=d?Ed:u(5,o)-v>=d?Pd:ic;if(m==ic){let f=He(u(1,o)-v);if(f<d)return Uo(e.slice().reverse(),l.distr,m,Nt(d/f)).reverse()}return Uo(e,l.distr,m,1)}function zd(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=a._space,u=t.valToPos,d=He(u(1,o)-u(2,o));return d<l?Uo(e.slice().reverse(),3,vu,Nt(l/d)).reverse():e}function _d(t,e,n,s){return s==null?dr:e==null?"":vr(e)}const ac={show:!0,scale:"y",stroke:hr,space:30,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:mu,side:3,grid:yr,ticks:du,border:fu,font:Sr,lineGap:gu,rotate:0};function Ld(t,e){let n=3+(t||1)*2;return Ce(n*e,3)}function Fd(t,e){let{scale:n,idxs:s}=t.series[0],i=t._data[0],a=t.valToPos(i[s[0]],n,!0),o=t.valToPos(i[s[1]],n,!0),l=He(o-a),u=t.series[e],d=l/(u.points.space*be);return s[1]-s[0]<=d}const oc={scale:null,auto:!0,sorted:0,min:Me,max:-Me},bu=(t,e,n,s,i)=>i,rc={show:!0,auto:!0,sorted:0,gaps:bu,alpha:1,facets:[qe({},oc,{scale:"x"}),qe({},oc,{scale:"y"})]},lc={scale:"y",auto:!0,sorted:0,show:!0,spanGaps:!1,gaps:bu,alpha:1,points:{show:Fd,filter:null},values:null,min:Me,max:-Me,idxs:[],path:null,clip:null};function Td(t,e,n,s,i){return n/10}const wu={time:ih,auto:!0,distr:1,log:10,asinh:1,min:null,max:null,dir:1,ori:0},Id=qe({},wu,{time:!1,ori:1}),cc={};function xu(t,e){let n=cc[t];return n||(n={key:t,plots:[],sub(s){n.plots.push(s)},unsub(s){n.plots=n.plots.filter(i=>i!=s)},pub(s,i,a,o,l,u,d){for(let v=0;v<n.plots.length;v++)n.plots[v]!=i&&n.plots[v].pub(s,i,a,o,l,u,d)}},t!=null&&(cc[t]=n)),n}const ri=1,Xo=2;function Cs(t,e,n){const s=t.mode,i=t.series[e],a=s==2?t._data[e]:t._data,o=t.scales,l=t.bbox;let u=a[0],d=s==2?a[1]:a[e],v=s==2?o[i.facets[0].scale]:o[t.series[0].scale],m=s==2?o[i.facets[1].scale]:o[i.scale],f=l.left,y=l.top,P=l.width,R=l.height,F=t.valToPosH,_=t.valToPosV;return v.ori==0?n(i,u,d,v,m,F,_,f,y,P,R,Va,gi,Ha,Su,Mu):n(i,u,d,v,m,_,F,y,f,R,P,Ya,vi,Cr,ku,Cu)}function kr(t,e){let n=0,s=0,i=fe(t.bands,br);for(let a=0;a<i.length;a++){let o=i[a];o.series[0]==e?n=o.dir:o.series[1]==e&&(o.dir==1?s|=1:s|=2)}return[n,s==1?-1:s==2?1:s==3?2:0]}function Rd(t,e,n,s,i){let a=t.mode,o=t.series[e],l=a==2?o.facets[1].scale:o.scale,u=t.scales[l];return i==-1?u.min:i==1?u.max:u.distr==3?u.dir==1?u.min:u.max:0}function Cn(t,e,n,s,i,a){return Cs(t,e,(o,l,u,d,v,m,f,y,P,R,F)=>{let _=o.pxRound;const k=d.dir*(d.ori==0?1:-1),D=d.ori==0?gi:vi;let z,K;k==1?(z=n,K=s):(z=s,K=n);let $=_(m(l[z],d,R,y)),te=_(f(u[z],v,F,P)),X=_(m(l[K],d,R,y)),ie=_(f(a==1?v.max:v.min,v,F,P)),Q=new Path2D(i);return D(Q,X,ie),D(Q,$,ie),D(Q,$,te),Q})}function qa(t,e,n,s,i,a){let o=null;if(t.length>0){o=new Path2D;const l=e==0?Ha:Cr;let u=n;for(let m=0;m<t.length;m++){let f=t[m];if(f[1]>f[0]){let y=f[0]-u;y>0&&l(o,u,s,y,s+a),u=f[1]}}let d=n+i-u,v=10;d>0&&l(o,u,s-v/2,d,s+a+v)}return o}function Nd(t,e,n){let s=t[t.length-1];s&&s[0]==e?s[1]=n:t.push([e,n])}function Mr(t,e,n,s,i,a,o){let l=[],u=t.length;for(let d=i==1?n:s;d>=n&&d<=s;d+=i)if(e[d]===null){let m=d,f=d;if(i==1)for(;++d<=s&&e[d]===null;)f=d;else for(;--d>=n&&e[d]===null;)f=d;let y=a(t[m]),P=f==m?y:a(t[f]),R=m-i;y=o<=0&&R>=0&&R<u?a(t[R]):y;let _=f+i;P=o>=0&&_>=0&&_<u?a(t[_]):P,P>=y&&l.push([y,P])}return l}function uc(t){return t==0?Zc:t==1?Ye:e=>us(e,t)}function yu(t){let e=t==0?Va:Ya,n=t==0?(i,a,o,l,u,d)=>{i.arcTo(a,o,l,u,d)}:(i,a,o,l,u,d)=>{i.arcTo(o,a,u,l,d)},s=t==0?(i,a,o,l,u)=>{i.rect(a,o,l,u)}:(i,a,o,l,u)=>{i.rect(o,a,u,l)};return(i,a,o,l,u,d=0,v=0)=>{d==0&&v==0?s(i,a,o,l,u):(d=Qt(d,l/2,u/2),v=Qt(v,l/2,u/2),e(i,a+d,o),n(i,a+l,o,a+l,o+u,d),n(i,a+l,o+u,a,o+u,v),n(i,a,o+u,a,o,v),n(i,a,o,a+l,o,d),i.closePath())}}const Va=(t,e,n)=>{t.moveTo(e,n)},Ya=(t,e,n)=>{t.moveTo(n,e)},gi=(t,e,n)=>{t.lineTo(e,n)},vi=(t,e,n)=>{t.lineTo(n,e)},Ha=yu(0),Cr=yu(1),Su=(t,e,n,s,i,a)=>{t.arc(e,n,s,i,a)},ku=(t,e,n,s,i,a)=>{t.arc(n,e,s,i,a)},Mu=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(e,n,s,i,a,o)},Cu=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(n,e,i,s,o,a)};function Eu(t){return(e,n,s,i,a)=>Cs(e,n,(o,l,u,d,v,m,f,y,P,R,F)=>{let{pxRound:_,points:k}=o,D,z;d.ori==0?(D=Va,z=Su):(D=Ya,z=ku);const K=Ce(k.width*be,3);let $=(k.size-k.width)/2*be,te=Ce($*2,3),X=new Path2D,ie=new Path2D,{left:Q,top:L,width:ne,height:q}=e.bbox;Ha(ie,Q-te,L-te,ne+te*2,q+te*2);const Z=Y=>{if(u[Y]!=null){let oe=_(m(l[Y],d,R,y)),j=_(f(u[Y],v,F,P));D(X,oe+$,j),z(X,oe,j,$,0,ka*2)}};if(a)a.forEach(Z);else for(let Y=s;Y<=i;Y++)Z(Y);return{stroke:K>0?X:null,fill:X,clip:ie,flags:ri|Xo}})}function Pu(t){return(e,n,s,i,a,o)=>{s!=i&&(a!=s&&o!=s&&t(e,n,s),a!=i&&o!=i&&t(e,n,i),t(e,n,o))}}const $d=Pu(gi),Od=Pu(vi);function Au(t){const e=fe(t?.alignGaps,0);return(n,s,i,a)=>Cs(n,s,(o,l,u,d,v,m,f,y,P,R,F)=>{[i,a]=$a(u,i,a);let _=o.pxRound,k=q=>_(m(q,d,R,y)),D=q=>_(f(q,v,F,P)),z,K;d.ori==0?(z=gi,K=$d):(z=vi,K=Od);const $=d.dir*(d.ori==0?1:-1),te={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:ri},X=te.stroke;let ie=!1;if(a-i>=R*4){let q=H=>n.posToVal(H,d.key,!0),Z=null,Y=null,oe,j,it,ye=k(l[$==1?i:a]),ce=k(l[i]),ge=k(l[a]),ae=q($==1?ce+1:ge-1);for(let H=$==1?i:a;H>=i&&H<=a;H+=$){let Se=l[H],Ee=($==1?Se<ae:Se>ae)?ye:k(Se),he=u[H];Ee==ye?he!=null?(j=he,Z==null?(z(X,Ee,D(j)),oe=Z=Y=j):j<Z?Z=j:j>Y&&(Y=j)):he===null&&(ie=!0):(Z!=null&&K(X,ye,D(Z),D(Y),D(oe),D(j)),he!=null?(j=he,z(X,Ee,D(j)),Z=Y=oe=j):(Z=Y=null,he===null&&(ie=!0)),ye=Ee,ae=q(ye+$))}Z!=null&&Z!=Y&&it!=ye&&K(X,ye,D(Z),D(Y),D(oe),D(j))}else for(let q=$==1?i:a;q>=i&&q<=a;q+=$){let Z=u[q];Z===null?ie=!0:Z!=null&&z(X,k(l[q]),D(Z))}let[L,ne]=kr(n,s);if(o.fill!=null||L!=0){let q=te.fill=new Path2D(X),Z=o.fillTo(n,s,o.min,o.max,L),Y=D(Z),oe=k(l[i]),j=k(l[a]);$==-1&&([j,oe]=[oe,j]),z(q,j,Y),z(q,oe,Y)}if(!o.spanGaps){let q=[];ie&&q.push(...Mr(l,u,i,a,$,k,e)),te.gaps=q=o.gaps(n,s,i,a,q),te.clip=qa(q,d.ori,y,P,R,F)}return ne!=0&&(te.band=ne==2?[Cn(n,s,i,a,X,-1),Cn(n,s,i,a,X,1)]:Cn(n,s,i,a,X,ne)),te})}function Dd(t){const e=fe(t.align,1),n=fe(t.ascDesc,!1),s=fe(t.alignGaps,0),i=fe(t.extend,!1);return(a,o,l,u)=>Cs(a,o,(d,v,m,f,y,P,R,F,_,k,D)=>{[l,u]=$a(m,l,u);let z=d.pxRound,{left:K,width:$}=a.bbox,te=ce=>z(P(ce,f,k,F)),X=ce=>z(R(ce,y,D,_)),ie=f.ori==0?gi:vi;const Q={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:ri},L=Q.stroke,ne=f.dir*(f.ori==0?1:-1);let q=X(m[ne==1?l:u]),Z=te(v[ne==1?l:u]),Y=Z,oe=Z;i&&e==-1&&(oe=K,ie(L,oe,q)),ie(L,Z,q);for(let ce=ne==1?l:u;ce>=l&&ce<=u;ce+=ne){let ge=m[ce];if(ge==null)continue;let ae=te(v[ce]),H=X(ge);e==1?ie(L,ae,q):ie(L,Y,H),ie(L,ae,H),q=H,Y=ae}let j=Y;i&&e==1&&(j=K+$,ie(L,j,q));let[it,ye]=kr(a,o);if(d.fill!=null||it!=0){let ce=Q.fill=new Path2D(L),ge=d.fillTo(a,o,d.min,d.max,it),ae=X(ge);ie(ce,j,ae),ie(ce,oe,ae)}if(!d.spanGaps){let ce=[];ce.push(...Mr(v,m,l,u,ne,te,s));let ge=d.width*be/2,ae=n||e==1?ge:-ge,H=n||e==-1?-ge:ge;ce.forEach(Se=>{Se[0]+=ae,Se[1]+=H}),Q.gaps=ce=d.gaps(a,o,l,u,ce),Q.clip=qa(ce,f.ori,F,_,k,D)}return ye!=0&&(Q.band=ye==2?[Cn(a,o,l,u,L,-1),Cn(a,o,l,u,L,1)]:Cn(a,o,l,u,L,ye)),Q})}function pc(t,e,n,s,i,a,o=Me){if(t.length>1){let l=null;for(let u=0,d=1/0;u<t.length;u++)if(e[u]!==void 0){if(l!=null){let v=He(t[u]-t[l]);v<d&&(d=v,o=He(n(t[u],s,i,a)-n(t[l],s,i,a)))}l=u}}return o}function Bd(t){t=t||qi;const e=fe(t.size,[.6,Me,1]),n=t.align||0,s=t.gap||0;let i=t.radius;i=i==null?[0,0]:typeof i=="number"?[i,0]:i;const a=le(i),o=1-e[0],l=fe(e[1],Me),u=fe(e[2],1),d=fe(t.disp,qi),v=fe(t.each,y=>{}),{fill:m,stroke:f}=d;return(y,P,R,F)=>Cs(y,P,(_,k,D,z,K,$,te,X,ie,Q,L)=>{let ne=_.pxRound,q=n,Z=s*be,Y=l*be,oe=u*be,j,it;z.ori==0?[j,it]=a(y,P):[it,j]=a(y,P);const ye=z.dir*(z.ori==0?1:-1);let ce=z.ori==0?Ha:Cr,ge=z.ori==0?v:(O,Pe,Ve,_s,ns,rn,ss)=>{v(O,Pe,Ve,ns,_s,ss,rn)},ae=fe(y.bands,br).find(O=>O.series[0]==P),H=ae!=null?ae.dir:0,Se=_.fillTo(y,P,_.min,_.max,H),Ue=ne(te(Se,K,L,ie)),Ee,he,T,S=Q,C=ne(_.width*be),V=!1,ke=null,ue=null,Ne=null,ft=null;m!=null&&(C==0||f!=null)&&(V=!0,ke=m.values(y,P,R,F),ue=new Map,new Set(ke).forEach(O=>{O!=null&&ue.set(O,new Path2D)}),C>0&&(Ne=f.values(y,P,R,F),ft=new Map,new Set(Ne).forEach(O=>{O!=null&&ft.set(O,new Path2D)})));let{x0:Vt,size:on}=d;if(Vt!=null&&on!=null){q=1,k=Vt.values(y,P,R,F),Vt.unit==2&&(k=k.map(Ve=>y.posToVal(X+Ve*Q,z.key,!0)));let O=on.values(y,P,R,F);on.unit==2?he=O[0]*Q:he=$(O[0],z,Q,X)-$(0,z,Q,X),S=pc(k,D,$,z,Q,X,S),T=S-he+Z}else S=pc(k,D,$,z,Q,X,S),T=S*o+Z,he=S-T;T<1&&(T=0),C>=he/2&&(C=0),T<5&&(ne=Zc);let sa=T>0,es=S-T-(sa?C:0);he=ne(jo(es,oe,Y)),Ee=(q==0?he/2:q==ye?0:he)-q*ye*((q==0?Z/2:0)+(sa?C/2:0));const lt={stroke:null,fill:null,clip:null,band:null,gaps:null,flags:0},zs=V?null:new Path2D;let wn=null;if(ae!=null)wn=y.data[ae.series[1]];else{let{y0:O,y1:Pe}=d;O!=null&&Pe!=null&&(D=Pe.values(y,P,R,F),wn=O.values(y,P,R,F))}let ts=j*he,se=it*he;for(let O=ye==1?R:F;O>=R&&O<=F;O+=ye){let Pe=D[O];if(Pe==null)continue;if(wn!=null){let mt=wn[O]??0;if(Pe-mt==0)continue;Ue=te(mt,K,L,ie)}let Ve=z.distr!=2||d!=null?k[O]:O,_s=$(Ve,z,Q,X),ns=te(fe(Pe,Se),K,L,ie),rn=ne(_s-Ee),ss=ne(dt(ns,Ue)),yt=ne(Qt(ns,Ue)),zt=ss-yt;if(Pe!=null){let mt=Pe<0?se:ts,Yt=Pe<0?ts:se;V?(C>0&&Ne[O]!=null&&ce(ft.get(Ne[O]),rn,yt+Pt(C/2),he,dt(0,zt-C),mt,Yt),ke[O]!=null&&ce(ue.get(ke[O]),rn,yt+Pt(C/2),he,dt(0,zt-C),mt,Yt)):ce(zs,rn,yt+Pt(C/2),he,dt(0,zt-C),mt,Yt),ge(y,P,O,rn-C/2,yt,he+C,zt)}}return C>0?lt.stroke=V?ft:zs:V||(lt._fill=_.width==0?_._fill:_._stroke??_._fill,lt.width=0),lt.fill=V?ue:zs,lt})}function qd(t,e){const n=fe(e?.alignGaps,0);return(s,i,a,o)=>Cs(s,i,(l,u,d,v,m,f,y,P,R,F,_)=>{[a,o]=$a(d,a,o);let k=l.pxRound,D=j=>k(f(j,v,F,P)),z=j=>k(y(j,m,_,R)),K,$,te;v.ori==0?(K=Va,te=gi,$=Mu):(K=Ya,te=vi,$=Cu);const X=v.dir*(v.ori==0?1:-1);let ie=D(u[X==1?a:o]),Q=ie,L=[],ne=[];for(let j=X==1?a:o;j>=a&&j<=o;j+=X)if(d[j]!=null){let ye=u[j],ce=D(ye);L.push(Q=ce),ne.push(z(d[j]))}const q={stroke:t(L,ne,K,te,$,k),fill:null,clip:null,band:null,gaps:null,flags:ri},Z=q.stroke;let[Y,oe]=kr(s,i);if(l.fill!=null||Y!=0){let j=q.fill=new Path2D(Z),it=l.fillTo(s,i,l.min,l.max,Y),ye=z(it);te(j,Q,ye),te(j,ie,ye)}if(!l.spanGaps){let j=[];j.push(...Mr(u,d,a,o,X,D,n)),q.gaps=j=l.gaps(s,i,a,o,j),q.clip=qa(j,v.ori,P,R,F,_)}return oe!=0&&(q.band=oe==2?[Cn(s,i,a,o,Z,-1),Cn(s,i,a,o,Z,1)]:Cn(s,i,a,o,Z,oe)),q})}function Vd(t){return qd(Yd,t)}function Yd(t,e,n,s,i,a){const o=t.length;if(o<2)return null;const l=new Path2D;if(n(l,t[0],e[0]),o==2)s(l,t[1],e[1]);else{let u=Array(o),d=Array(o-1),v=Array(o-1),m=Array(o-1);for(let f=0;f<o-1;f++)v[f]=e[f+1]-e[f],m[f]=t[f+1]-t[f],d[f]=v[f]/m[f];u[0]=d[0];for(let f=1;f<o-1;f++)d[f]===0||d[f-1]===0||d[f-1]>0!=d[f]>0?u[f]=0:(u[f]=3*(m[f-1]+m[f])/((2*m[f]+m[f-1])/d[f-1]+(m[f]+2*m[f-1])/d[f]),isFinite(u[f])||(u[f]=0));u[o-1]=d[o-2];for(let f=0;f<o-1;f++)i(l,t[f]+m[f]/3,e[f]+u[f]*m[f]/3,t[f+1]-m[f]/3,e[f+1]-u[f+1]*m[f]/3,t[f+1],e[f+1])}return l}const Go=new Set;function hc(){for(let t of Go)t.syncRect(!0)}mi&&(fs(kh,ei,hc),fs(Mh,ei,hc,!0),fs(Ca,ei,()=>{Te.pxRatio=be}));const Hd=Au(),jd=Eu();function dc(t,e,n,s){return(s?[t[0],t[1]].concat(t.slice(2)):[t[0]].concat(t.slice(1))).map((a,o)=>Ko(a,o,e,n))}function Wd(t,e){return t.map((n,s)=>s==0?{}:qe({},e,n))}function Ko(t,e,n,s){return qe({},e==0?n:s,t)}function zu(t,e,n){return e==null?ai:[e,n]}const Ud=zu;function Xd(t,e,n){return e==null?ai:Ea(e,n,gr,!0)}function _u(t,e,n,s){return e==null?ai:Oa(e,n,t.scales[s].log,!1)}const Gd=_u;function Lu(t,e,n,s){return e==null?ai:mr(e,n,t.scales[s].log,!1)}const Kd=Lu;function Zd(t,e,n,s,i){let a=dt(jl(t),jl(e)),o=e-t,l=Jt(i/s*o,n);do{let u=n[l],d=s*u/o;if(d>=i&&a+(u<5?Hn.get(u):0)<=17)return[u,d]}while(++l<n.length);return[0,0]}function fc(t){let e,n;return t=t.replace(/(\d+)px/,(s,i)=>(e=Ye((n=+i)*be))+"px"),[t,e,n]}function Jd(t){t.show&&[t.font,t.labelFont].forEach(e=>{let n=Ce(e[2]*be,1);e[0]=e[0].replace(/[0-9.]+px/,n+"px"),e[1]=n})}function Te(t,e,n){const s={mode:fe(t.mode,1)},i=s.mode;function a(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?1-g:g)}function o(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?g:1-g)}function l(r,c,p,h){return c.ori==0?a(r,c,p,h):o(r,c,p,h)}s.valToPosH=a,s.valToPosV=o;let u=!1;s.status=0;const d=s.root=It(ah);if(t.id!=null&&(d.id=t.id),Ct(d,t.class),t.title){let r=It(lh,d);r.textContent=t.title}const v=Zt("canvas"),m=s.ctx=v.getContext("2d"),f=It(ch,d);fs("click",f,r=>{r.target===P&&(ze!=qs||Re!=Vs)&&tt.click(s,r)},!0);const y=s.under=It(uh,f);f.appendChild(v);const P=s.over=It(ph,f);t=oi(t);const R=+fe(t.pxAlign,1),F=uc(R);(t.plugins||[]).forEach(r=>{r.opts&&(t=r.opts(s,t)||t)});const _=t.ms||.001,k=s.series=i==1?dc(t.series||[],sc,lc,!1):Wd(t.series||[null],rc),D=s.axes=dc(t.axes||[],nc,ac,!0),z=s.scales={},K=s.bands=t.bands||[];K.forEach(r=>{r.fill=le(r.fill||null),r.dir=fe(r.dir,-1)});const $=i==2?k[1].facets[0].scale:k[0].scale,te={axes:Yp,series:Op},X=(t.drawOrder||["axes","series"]).map(r=>te[r]);function ie(r){const c=r.distr==3?p=>Mn(p>0?p:r.clamp(s,p,r.min,r.max,r.key)):r.distr==4?p=>Ao(p,r.asinh):r.distr==100?p=>r.fwd(p):p=>p;return p=>{let h=c(p),{_min:g,_max:w}=r,x=w-g;return(h-g)/x}}function Q(r){let c=z[r];if(c==null){let p=(t.scales||qi)[r]||qi;if(p.from!=null){Q(p.from);let h=qe({},z[p.from],p,{key:r});h.valToPct=ie(h),z[r]=h}else{c=z[r]=qe({},r==$?wu:Id,p),c.key=r;let h=c.time,g=c.range,w=Bn(g);if((r!=$||i==2&&!h)&&(w&&(g[0]==null||g[1]==null)&&(g={min:g[0]==null?Vl:{mode:1,hard:g[0],soft:g[0]},max:g[1]==null?Vl:{mode:1,hard:g[1],soft:g[1]}},w=!1),!w&&Ba(g))){let x=g;g=(M,A,I)=>A==null?ai:Ea(A,I,x)}c.range=le(g||(h?Ud:r==$?c.distr==3?Gd:c.distr==4?Kd:zu:c.distr==3?_u:c.distr==4?Lu:Xd)),c.auto=le(w?!1:c.auto),c.clamp=le(c.clamp||Td),c._min=c._max=null,c.valToPct=ie(c)}}}Q("x"),Q("y"),i==1&&k.forEach(r=>{Q(r.scale)}),D.forEach(r=>{Q(r.scale)});for(let r in t.scales)Q(r);const L=z[$],ne=L.distr;let q,Z;L.ori==0?(Ct(d,oh),q=a,Z=o):(Ct(d,rh),q=o,Z=a);const Y={};for(let r in z){let c=z[r];(c.min!=null||c.max!=null)&&(Y[r]={min:c.min,max:c.max},c.min=c.max=null)}const oe=t.tzDate||(r=>new Date(Ye(r/_))),j=t.fmtDate||wr,it=_==1?od(oe):cd(oe),ye=Ql(oe,Jl(_==1?ad:ld,j)),ce=tc(oe,ec(pd,j)),ge=[],ae=s.legend=qe({},fd,t.legend),H=s.cursor=qe({},xd,{drag:{y:i==2}},t.cursor),Se=ae.show,Ue=H.show,Ee=ae.markers;ae.idxs=ge,Ee.width=le(Ee.width),Ee.dash=le(Ee.dash),Ee.stroke=le(Ee.stroke),Ee.fill=le(Ee.fill);let he,T,S,C=[],V=[],ke,ue=!1,Ne={};if(ae.live){const r=k[1]?k[1].values:null;ue=r!=null,ke=ue?r(s,1,0):{_:0};for(let c in ke)Ne[c]=dr}if(Se)if(he=Zt("table",vh,d),S=Zt("tbody",null,he),ae.mount(s,he),ue){T=Zt("thead",null,he,S);let r=Zt("tr",null,T);Zt("th",null,r);for(var ft in ke)Zt("th",zl,r).textContent=ft}else Ct(he,wh),ae.live&&Ct(he,bh);const Vt={show:!0},on={show:!1};function sa(r,c){if(c==0&&(ue||!ae.live||i==2))return ai;let p=[],h=Zt("tr",xh,S,S.childNodes[c]);Ct(h,r.class),r.show||Ct(h,hs);let g=Zt("th",null,h);if(Ee.show){let M=It(yh,g);if(c>0){let A=Ee.width(s,c);A&&(M.style.border=A+"px "+Ee.dash(s,c)+" "+Ee.stroke(s,c)),M.style.background=Ee.fill(s,c)}}let w=It(zl,g);r.label instanceof HTMLElement?w.appendChild(r.label):w.textContent=r.label,c>0&&(Ee.show||(w.style.color=r.width>0?Ee.stroke(s,c):Ee.fill(s,c)),lt("click",g,M=>{if(H._lock)return;as(M);let A=k.indexOf(r);if((M.ctrlKey||M.metaKey)!=ae.isolate){let I=k.some((N,B)=>B>0&&B!=A&&N.show);k.forEach((N,B)=>{B>0&&cn(B,I?B==A?Vt:on:Vt,!0,Be.setSeries)})}else cn(A,{show:!r.show},!0,Be.setSeries)},!1),Fs&&lt(Tl,g,M=>{H._lock||(as(M),cn(k.indexOf(r),Hs,!0,Be.setSeries))},!1));for(var x in ke){let M=Zt("td",Sh,h);M.textContent="--",p.push(M)}return[h,p]}const es=new Map;function lt(r,c,p,h=!0){const g=es.get(c)||{},w=H.bind[r](s,c,p,h);w&&(fs(r,c,g[r]=w),es.set(c,g))}function zs(r,c,p){const h=es.get(c)||{};for(let g in h)(r==null||g==r)&&(Ho(g,c,h[g]),delete h[g]);r==null&&es.delete(c)}let wn=0,ts=0,se=0,O=0,Pe=0,Ve=0,_s=Pe,ns=Ve,rn=se,ss=O,yt=0,zt=0,mt=0,Yt=0;s.bbox={};let to=!1,ia=!1,Ls=!1,is=!1,aa=!1,_t=!1;function no(r,c,p){(p||r!=s.width||c!=s.height)&&Qr(r,c),$s(!1),Ls=!0,ia=!0,Os()}function Qr(r,c){s.width=wn=se=r,s.height=ts=O=c,Pe=Ve=0,Lp(),Fp();let p=s.bbox;yt=p.left=us(Pe*be,.5),zt=p.top=us(Ve*be,.5),mt=p.width=us(se*be,.5),Yt=p.height=us(O*be,.5)}const Ap=3;function zp(){let r=!1,c=0;for(;!r;){c++;let p=qp(c),h=Vp(c);r=c==Ap||p&&h,r||(Qr(s.width,s.height),ia=!0)}}function _p({width:r,height:c}){no(r,c)}s.setSize=_p;function Lp(){let r=!1,c=!1,p=!1,h=!1;D.forEach((g,w)=>{if(g.show&&g._show){let{side:x,_size:M}=g,A=x%2,I=g.label!=null?g.labelSize:0,N=M+I;N>0&&(A?(se-=N,x==3?(Pe+=N,h=!0):p=!0):(O-=N,x==0?(Ve+=N,r=!0):c=!0))}}),os[0]=r,os[1]=p,os[2]=c,os[3]=h,se-=Tn[1]+Tn[3],Pe+=Tn[3],O-=Tn[2]+Tn[0],Ve+=Tn[0]}function Fp(){let r=Pe+se,c=Ve+O,p=Pe,h=Ve;function g(w,x){switch(w){case 1:return r+=x,r-x;case 2:return c+=x,c-x;case 3:return p-=x,p+x;case 0:return h-=x,h+x}}D.forEach((w,x)=>{if(w.show&&w._show){let M=w.side;w._pos=g(M,w._size),w.label!=null&&(w._lpos=g(M,w.labelSize))}})}if(H.dataIdx==null){let r=H.hover,c=r.skip=new Set(r.skip??[]);c.add(void 0);let p=r.prox=le(r.prox),h=r.bias??=0;H.dataIdx=(g,w,x,M)=>{if(w==0)return x;let A=x,I=p(g,w,x,M)??Me,N=I>=0&&I<Me,B=L.ori==0?se:O,ee=H.left,ve=e[0],de=e[w];if(c.has(de[x])){A=null;let re=null,G=null,W;if(h==0||h==-1)for(W=x;re==null&&W-- >0;)c.has(de[W])||(re=W);if(h==0||h==1)for(W=x;G==null&&W++<de.length;)c.has(de[W])||(G=W);if(re!=null||G!=null)if(N){let Le=re==null?-1/0:q(ve[re],L,B,0),$e=G==null?1/0:q(ve[G],L,B,0),Qe=ee-Le,xe=$e-ee;Qe<=xe?Qe<=I&&(A=re):xe<=I&&(A=G)}else A=G==null?re:re==null?G:x-re<=G-x?re:G}else N&&He(ee-q(ve[x],L,B,0))>I&&(A=null);return A}}const as=r=>{H.event=r};H.idxs=ge,H._lock=!1;let at=H.points;at.show=le(at.show),at.size=le(at.size),at.stroke=le(at.stroke),at.width=le(at.width),at.fill=le(at.fill);const ln=s.focus=qe({},t.focus||{alpha:.3},H.focus),Fs=ln.prox>=0,Ts=Fs&&at.one;let Lt=[],Is=[],Rs=[];function el(r,c){let p=at.show(s,c);if(p instanceof HTMLElement)return Ct(p,gh),Ct(p,r.class),dn(p,-10,-10,se,O),P.insertBefore(p,Lt[c]),p}function tl(r,c){if(i==1||c>0){let p=i==1&&z[r.scale].time,h=r.value;r.value=p?Xl(h)?tc(oe,ec(h,j)):h||ce:h||_d,r.label=r.label||(p?Sd:yd)}if(Ts||c>0){r.width=r.width==null?1:r.width,r.paths=r.paths||Hd||Ih,r.fillTo=le(r.fillTo||Rd),r.pxAlign=+fe(r.pxAlign,R),r.pxRound=uc(r.pxAlign),r.stroke=le(r.stroke||null),r.fill=le(r.fill||null),r._stroke=r._fill=r._paths=r._focus=null;let p=Ld(dt(1,r.width),1),h=r.points=qe({},{size:p,width:dt(1,p*.2),stroke:r.stroke,space:p*2,paths:jd,_stroke:null,_fill:null},r.points);h.show=le(h.show),h.filter=le(h.filter),h.fill=le(h.fill),h.stroke=le(h.stroke),h.paths=le(h.paths),h.pxAlign=r.pxAlign}if(Se){let p=sa(r,c);C.splice(c,0,p[0]),V.splice(c,0,p[1]),ae.values.push(null)}if(Ue){ge.splice(c,0,null);let p=null;Ts?c==0&&(p=el(r,c)):c>0&&(p=el(r,c)),Lt.splice(c,0,p),Is.splice(c,0,0),Rs.splice(c,0,0)}Je("addSeries",c)}function Tp(r,c){c=c??k.length,r=i==1?Ko(r,c,sc,lc):Ko(r,c,{},rc),k.splice(c,0,r),tl(k[c],c)}s.addSeries=Tp;function Ip(r){if(k.splice(r,1),Se){ae.values.splice(r,1),V.splice(r,1);let c=C.splice(r,1)[0];zs(null,c.firstChild),c.remove()}Ue&&(ge.splice(r,1),Lt.splice(r,1)[0].remove(),Is.splice(r,1),Rs.splice(r,1)),Je("delSeries",r)}s.delSeries=Ip;const os=[!1,!1,!1,!1];function Rp(r,c){if(r._show=r.show,r.show){let p=r.side%2,h=z[r.scale];h==null&&(r.scale=p?k[1].scale:$,h=z[r.scale]);let g=h.time;r.size=le(r.size),r.space=le(r.space),r.rotate=le(r.rotate),Bn(r.incrs)&&r.incrs.forEach(x=>{!Hn.has(x)&&Hn.set(x,eu(x))}),r.incrs=le(r.incrs||(h.distr==2?nd:g?_==1?id:rd:ps)),r.splits=le(r.splits||(g&&h.distr==1?it:h.distr==3?Wo:h.distr==4?Cd:Md)),r.stroke=le(r.stroke),r.grid.stroke=le(r.grid.stroke),r.ticks.stroke=le(r.ticks.stroke),r.border.stroke=le(r.border.stroke);let w=r.values;r.values=Bn(w)&&!Bn(w[0])?le(w):g?Bn(w)?Ql(oe,Jl(w,j)):Xl(w)?ud(oe,w):w||ye:w||kd,r.filter=le(r.filter||(h.distr>=3&&h.log==10?Ad:h.distr==3&&h.log==2?zd:Jc)),r.font=fc(r.font),r.labelFont=fc(r.labelFont),r._size=r.size(s,null,c,0),r._space=r._rotate=r._incrs=r._found=r._splits=r._values=null,r._size>0&&(os[c]=!0,r._el=It(hh,f))}}function ki(r,c,p,h){let[g,w,x,M]=p,A=c%2,I=0;return A==0&&(M||w)&&(I=c==0&&!g||c==2&&!x?Ye(nc.size/3):0),A==1&&(g||x)&&(I=c==1&&!w||c==3&&!M?Ye(ac.size/2):0),I}const nl=s.padding=(t.padding||[ki,ki,ki,ki]).map(r=>le(fe(r,ki))),Tn=s._padding=nl.map((r,c)=>r(s,c,os,0));let et,Xe=null,Ge=null;const oa=i==1?k[0].idxs:null;let Ht=null,Mi=!1;function sl(r,c){if(e=r??[],s.data=s._data=e,i==2){et=0;for(let p=1;p<k.length;p++)et+=e[p][0].length}else{e.length==0&&(s.data=s._data=e=[[]]),Ht=e[0],et=Ht.length;let p=e;if(ne==2){p=e.slice();let h=p[0]=Array(et);for(let g=0;g<et;g++)h[g]=g}s._data=e=p}if($s(!0),Je("setData"),ne==2&&(Ls=!0),c!==!1){let p=L;p.auto(s,Mi)?so():Rn($,p.min,p.max),is=is||H.left>=0,_t=!0,Os()}}s.setData=sl;function so(){Mi=!0;let r,c;i==1&&(et>0?(Xe=oa[0]=0,Ge=oa[1]=et-1,r=e[0][Xe],c=e[0][Ge],ne==2?(r=Xe,c=Ge):r==c&&(ne==3?[r,c]=Oa(r,r,L.log,!1):ne==4?[r,c]=mr(r,r,L.log,!1):L.time?c=r+Ye(86400/_):[r,c]=Ea(r,c,gr,!0))):(Xe=oa[0]=r=null,Ge=oa[1]=c=null)),Rn($,r,c)}let ra,Ns,io,ao,oo,ro,lo,co,uo,gt;function il(r,c,p,h,g,w){r??=Ll,p??=br,h??="butt",g??=Ll,w??="round",r!=ra&&(m.strokeStyle=ra=r),g!=Ns&&(m.fillStyle=Ns=g),c!=io&&(m.lineWidth=io=c),w!=oo&&(m.lineJoin=oo=w),h!=ro&&(m.lineCap=ro=h),p!=ao&&m.setLineDash(ao=p)}function al(r,c,p,h){c!=Ns&&(m.fillStyle=Ns=c),r!=lo&&(m.font=lo=r),p!=co&&(m.textAlign=co=p),h!=uo&&(m.textBaseline=uo=h)}function po(r,c,p,h,g=0){if(h.length>0&&r.auto(s,Mi)&&(c==null||c.min==null)){let w=fe(Xe,0),x=fe(Ge,h.length-1),M=p.min==null?Ah(h,w,x,g,r.distr==3):[p.min,p.max];r.min=Qt(r.min,p.min=M[0]),r.max=dt(r.max,p.max=M[1])}}const ol={min:null,max:null};function Np(){for(let h in z){let g=z[h];Y[h]==null&&(g.min==null||Y[$]!=null&&g.auto(s,Mi))&&(Y[h]=ol)}for(let h in z){let g=z[h];Y[h]==null&&g.from!=null&&Y[g.from]!=null&&(Y[h]=ol)}Y[$]!=null&&$s(!0);let r={};for(let h in Y){let g=Y[h];if(g!=null){let w=r[h]=oi(z[h],$h);if(g.min!=null)qe(w,g);else if(h!=$||i==2)if(et==0&&w.from==null){let x=w.range(s,null,null,h);w.min=x[0],w.max=x[1]}else w.min=Me,w.max=-Me}}if(et>0){k.forEach((h,g)=>{if(i==1){let w=h.scale,x=Y[w];if(x==null)return;let M=r[w];if(g==0){let A=M.range(s,M.min,M.max,w);M.min=A[0],M.max=A[1],Xe=Jt(M.min,e[0]),Ge=Jt(M.max,e[0]),Ge-Xe>1&&(e[0][Xe]<M.min&&Xe++,e[0][Ge]>M.max&&Ge--),h.min=Ht[Xe],h.max=Ht[Ge]}else h.show&&h.auto&&po(M,x,h,e[g],h.sorted);h.idxs[0]=Xe,h.idxs[1]=Ge}else if(g>0&&h.show&&h.auto){let[w,x]=h.facets,M=w.scale,A=x.scale,[I,N]=e[g],B=r[M],ee=r[A];B!=null&&po(B,Y[M],w,I,w.sorted),ee!=null&&po(ee,Y[A],x,N,x.sorted),h.min=x.min,h.max=x.max}});for(let h in r){let g=r[h],w=Y[h];if(g.from==null&&(w==null||w.min==null)){let x=g.range(s,g.min==Me?null:g.min,g.max==-Me?null:g.max,h);g.min=x[0],g.max=x[1]}}}for(let h in r){let g=r[h];if(g.from!=null){let w=r[g.from];if(w.min==null)g.min=g.max=null;else{let x=g.range(s,w.min,w.max,h);g.min=x[0],g.max=x[1]}}}let c={},p=!1;for(let h in r){let g=r[h],w=z[h];if(w.min!=g.min||w.max!=g.max){w.min=g.min,w.max=g.max;let x=w.distr;w._min=x==3?Mn(w.min):x==4?Ao(w.min,w.asinh):x==100?w.fwd(w.min):w.min,w._max=x==3?Mn(w.max):x==4?Ao(w.max,w.asinh):x==100?w.fwd(w.max):w.max,c[h]=p=!0}}if(p){k.forEach((h,g)=>{i==2?g>0&&c.y&&(h._paths=null):c[h.scale]&&(h._paths=null)});for(let h in c)Ls=!0,Je("setScale",h);Ue&&H.left>=0&&(is=_t=!0)}for(let h in Y)Y[h]=null}function $p(r){let c=jo(Xe-1,0,et-1),p=jo(Ge+1,0,et-1);for(;r[c]==null&&c>0;)c--;for(;r[p]==null&&p<et-1;)p++;return[c,p]}function Op(){if(et>0){let r=k.some(c=>c._focus)&&gt!=ln.alpha;r&&(m.globalAlpha=gt=ln.alpha),k.forEach((c,p)=>{if(p>0&&c.show&&(rl(p,!1),rl(p,!0),c._paths==null)){let h=gt;gt!=c.alpha&&(m.globalAlpha=gt=c.alpha);let g=i==2?[0,e[p][0].length-1]:$p(e[p]);c._paths=c.paths(s,p,g[0],g[1]),gt!=h&&(m.globalAlpha=gt=h)}}),k.forEach((c,p)=>{if(p>0&&c.show){let h=gt;gt!=c.alpha&&(m.globalAlpha=gt=c.alpha),c._paths!=null&&ll(p,!1);{let g=c._paths!=null?c._paths.gaps:null,w=c.points.show(s,p,Xe,Ge,g),x=c.points.filter(s,p,w,g);(w||x)&&(c.points._paths=c.points.paths(s,p,Xe,Ge,x),ll(p,!0))}gt!=h&&(m.globalAlpha=gt=h),Je("drawSeries",p)}}),r&&(m.globalAlpha=gt=1)}}function rl(r,c){let p=c?k[r].points:k[r];p._stroke=p.stroke(s,r),p._fill=p.fill(s,r)}function ll(r,c){let p=c?k[r].points:k[r],{stroke:h,fill:g,clip:w,flags:x,_stroke:M=p._stroke,_fill:A=p._fill,_width:I=p.width}=p._paths;I=Ce(I*be,3);let N=null,B=I%2/2;c&&A==null&&(A=I>0?"#fff":M);let ee=p.pxAlign==1&&B>0;if(ee&&m.translate(B,B),!c){let ve=yt-I/2,de=zt-I/2,re=mt+I,G=Yt+I;N=new Path2D,N.rect(ve,de,re,G)}c?ho(M,I,p.dash,p.cap,A,h,g,x,w):Dp(r,M,I,p.dash,p.cap,A,h,g,x,N,w),ee&&m.translate(-B,-B)}function Dp(r,c,p,h,g,w,x,M,A,I,N){let B=!1;A!=0&&K.forEach((ee,ve)=>{if(ee.series[0]==r){let de=k[ee.series[1]],re=e[ee.series[1]],G=(de._paths||qi).band;Bn(G)&&(G=ee.dir==1?G[0]:G[1]);let W,Le=null;de.show&&G&&_h(re,Xe,Ge)?(Le=ee.fill(s,ve)||w,W=de._paths.clip):G=null,ho(c,p,h,g,Le,x,M,A,I,N,W,G),B=!0}}),B||ho(c,p,h,g,w,x,M,A,I,N)}const cl=ri|Xo;function ho(r,c,p,h,g,w,x,M,A,I,N,B){il(r,c,p,h,g),(A||I||B)&&(m.save(),A&&m.clip(A),I&&m.clip(I)),B?(M&cl)==cl?(m.clip(B),N&&m.clip(N),ca(g,x),la(r,w,c)):M&Xo?(ca(g,x),m.clip(B),la(r,w,c)):M&ri&&(m.save(),m.clip(B),N&&m.clip(N),ca(g,x),m.restore(),la(r,w,c)):(ca(g,x),la(r,w,c)),(A||I||B)&&m.restore()}function la(r,c,p){p>0&&(c instanceof Map?c.forEach((h,g)=>{m.strokeStyle=ra=g,m.stroke(h)}):c!=null&&r&&m.stroke(c))}function ca(r,c){c instanceof Map?c.forEach((p,h)=>{m.fillStyle=Ns=h,m.fill(p)}):c!=null&&r&&m.fill(c)}function Bp(r,c,p,h){let g=D[r],w;if(h<=0)w=[0,0];else{let x=g._space=g.space(s,r,c,p,h),M=g._incrs=g.incrs(s,r,c,p,h,x);w=Zd(c,p,M,h,x)}return g._found=w}function fo(r,c,p,h,g,w,x,M,A,I){let N=x%2/2;R==1&&m.translate(N,N),il(M,x,A,I,M),m.beginPath();let B,ee,ve,de,re=g+(h==0||h==3?-w:w);p==0?(ee=g,de=re):(B=g,ve=re);for(let G=0;G<r.length;G++)c[G]!=null&&(p==0?B=ve=r[G]:ee=de=r[G],m.moveTo(B,ee),m.lineTo(ve,de));m.stroke(),R==1&&m.translate(-N,-N)}function qp(r){let c=!0;return D.forEach((p,h)=>{if(!p.show)return;let g=z[p.scale];if(g.min==null){p._show&&(c=!1,p._show=!1,$s(!1));return}else p._show||(c=!1,p._show=!0,$s(!1));let w=p.side,x=w%2,{min:M,max:A}=g,[I,N]=Bp(h,M,A,x==0?se:O);if(N==0)return;let B=g.distr==2,ee=p._splits=p.splits(s,h,M,A,I,N,B),ve=g.distr==2?ee.map(W=>Ht[W]):ee,de=g.distr==2?Ht[ee[1]]-Ht[ee[0]]:I,re=p._values=p.values(s,p.filter(s,ve,h,N,de),h,N,de);p._rotate=w==2?p.rotate(s,re,h,N):0;let G=p._size;p._size=Nt(p.size(s,re,h,r)),G!=null&&p._size!=G&&(c=!1)}),c}function Vp(r){let c=!0;return nl.forEach((p,h)=>{let g=p(s,h,os,r);g!=Tn[h]&&(c=!1),Tn[h]=g}),c}function Yp(){for(let r=0;r<D.length;r++){let c=D[r];if(!c.show||!c._show)continue;let p=c.side,h=p%2,g,w,x=c.stroke(s,r),M=p==0||p==3?-1:1,[A,I]=c._found;if(c.label!=null){let ut=c.labelGap*M,Mt=Ye((c._lpos+ut)*be);al(c.labelFont[0],x,"center",p==2?_i:_l),m.save(),h==1?(g=w=0,m.translate(Mt,Ye(zt+Yt/2)),m.rotate((p==3?-ka:ka)/2)):(g=Ye(yt+mt/2),w=Mt);let cs=Kc(c.label)?c.label(s,r,A,I):c.label;m.fillText(cs,g,w),m.restore()}if(I==0)continue;let N=z[c.scale],B=h==0?mt:Yt,ee=h==0?yt:zt,ve=c._splits,de=N.distr==2?ve.map(ut=>Ht[ut]):ve,re=N.distr==2?Ht[ve[1]]-Ht[ve[0]]:A,G=c.ticks,W=c.border,Le=G.show?G.size:0,$e=Ye(Le*be),Qe=Ye((c.alignTo==2?c._size-Le-c.gap:c.gap)*be),xe=c._rotate*-ka/180,Oe=F(c._pos*be),St=($e+Qe)*M,ct=Oe+St;w=h==0?ct:0,g=h==1?ct:0;let Ft=c.font[0],jt=c.align==1?Ws:c.align==2?Co:xe>0?Ws:xe<0?Co:h==0?"center":p==3?Co:Ws,pn=xe||h==1?"middle":p==2?_i:_l;al(Ft,x,jt,pn);let kt=c.font[1]*c.lineGap,Tt=ve.map(ut=>F(l(ut,N,B,ee))),Wt=c._values;for(let ut=0;ut<Wt.length;ut++){let Mt=Wt[ut];if(Mt!=null){h==0?g=Tt[ut]:w=Tt[ut],Mt=""+Mt;let cs=Mt.indexOf(`
`)==-1?[Mt]:Mt.split(/\n/gm);for(let pt=0;pt<cs.length;pt++){let Al=cs[pt];xe?(m.save(),m.translate(g,w+pt*kt),m.rotate(xe),m.fillText(Al,0,0),m.restore()):m.fillText(Al,g,w+pt*kt)}}}G.show&&fo(Tt,G.filter(s,de,r,I,re),h,p,Oe,$e,Ce(G.width*be,3),G.stroke(s,r),G.dash,G.cap);let hn=c.grid;hn.show&&fo(Tt,hn.filter(s,de,r,I,re),h,h==0?2:1,h==0?zt:yt,h==0?Yt:mt,Ce(hn.width*be,3),hn.stroke(s,r),hn.dash,hn.cap),W.show&&fo([Oe],[1],h==0?1:0,h==0?1:2,h==1?zt:yt,h==1?Yt:mt,Ce(W.width*be,3),W.stroke(s,r),W.dash,W.cap)}Je("drawAxes")}function $s(r){k.forEach((c,p)=>{p>0&&(c._paths=null,r&&(i==1?(c.min=null,c.max=null):c.facets.forEach(h=>{h.min=null,h.max=null})))})}let ua=!1,mo=!1,Ci=[];function Hp(){mo=!1;for(let r=0;r<Ci.length;r++)Je(...Ci[r]);Ci.length=0}function Os(){ua||(Hh(ul),ua=!0)}function jp(r,c=!1){ua=!0,mo=c,r(s),ul(),c&&Ci.length>0&&queueMicrotask(Hp)}s.batch=jp;function ul(){if(to&&(Np(),to=!1),Ls&&(zp(),Ls=!1),ia){if(Fe(y,Ws,Pe),Fe(y,_i,Ve),Fe(y,Ii,se),Fe(y,Ri,O),Fe(P,Ws,Pe),Fe(P,_i,Ve),Fe(P,Ii,se),Fe(P,Ri,O),Fe(f,Ii,wn),Fe(f,Ri,ts),v.width=Ye(wn*be),v.height=Ye(ts*be),D.forEach(({_el:r,_show:c,_size:p,_pos:h,side:g})=>{if(r!=null)if(c){let w=g===3||g===0?p:0,x=g%2==1;Fe(r,x?"left":"top",h-w),Fe(r,x?"width":"height",p),Fe(r,x?"top":"left",x?Ve:Pe),Fe(r,x?"height":"width",x?O:se),Yo(r,hs)}else Ct(r,hs)}),ra=Ns=io=oo=ro=lo=co=uo=ao=null,gt=1,Ai(!0),Pe!=_s||Ve!=ns||se!=rn||O!=ss){$s(!1);let r=se/rn,c=O/ss;if(Ue&&!is&&H.left>=0){H.left*=r,H.top*=c,Ds&&dn(Ds,Ye(H.left),0,se,O),Bs&&dn(Bs,0,Ye(H.top),se,O);for(let p=0;p<Lt.length;p++){let h=Lt[p];h!=null&&(Is[p]*=r,Rs[p]*=c,dn(h,Nt(Is[p]),Nt(Rs[p]),se,O))}}if(_e.show&&!aa&&_e.left>=0&&_e.width>0){_e.left*=r,_e.width*=r,_e.top*=c,_e.height*=c;for(let p in yo)Fe(Ys,p,_e[p])}_s=Pe,ns=Ve,rn=se,ss=O}Je("setSize"),ia=!1}wn>0&&ts>0&&(m.clearRect(0,0,v.width,v.height),Je("drawClear"),X.forEach(r=>r()),Je("draw")),_e.show&&aa&&(pa(_e),aa=!1),Ue&&is&&(ls(null,!0,!1),is=!1),ae.show&&ae.live&&_t&&(wo(),_t=!1),u||(u=!0,s.status=1,Je("ready")),Mi=!1,ua=!1}s.redraw=(r,c)=>{Ls=c||!1,r!==!1?Rn($,L.min,L.max):Os()};function go(r,c){let p=z[r];if(p.from==null){if(et==0){let h=p.range(s,c.min,c.max,r);c.min=h[0],c.max=h[1]}if(c.min>c.max){let h=c.min;c.min=c.max,c.max=h}if(et>1&&c.min!=null&&c.max!=null&&c.max-c.min<1e-16)return;r==$&&p.distr==2&&et>0&&(c.min=Jt(c.min,e[0]),c.max=Jt(c.max,e[0]),c.min==c.max&&c.max++),Y[r]=c,to=!0,Os()}}s.setScale=go;let vo,bo,Ds,Bs,pl,hl,qs,Vs,dl,fl,ze,Re,In=!1;const tt=H.drag;let Ke=tt.x,Ze=tt.y;Ue&&(H.x&&(vo=It(fh,P)),H.y&&(bo=It(mh,P)),L.ori==0?(Ds=vo,Bs=bo):(Ds=bo,Bs=vo),ze=H.left,Re=H.top);const _e=s.select=qe({show:!0,over:!0,left:0,width:0,top:0,height:0},t.select),Ys=_e.show?It(dh,_e.over?P:y):null;function pa(r,c){if(_e.show){for(let p in r)_e[p]=r[p],p in yo&&Fe(Ys,p,r[p]);c!==!1&&Je("setSelect")}}s.setSelect=pa;function Wp(r){if(k[r].show)Se&&Yo(C[r],hs);else if(Se&&Ct(C[r],hs),Ue){let p=Ts?Lt[0]:Lt[r];p!=null&&dn(p,-10,-10,se,O)}}function Rn(r,c,p){go(r,{min:c,max:p})}function cn(r,c,p,h){c.focus!=null&&Zp(r),c.show!=null&&k.forEach((g,w)=>{w>0&&(r==w||r==null)&&(g.show=c.show,Wp(w),i==2?(Rn(g.facets[0].scale,null,null),Rn(g.facets[1].scale,null,null)):Rn(g.scale,null,null),Os())}),p!==!1&&Je("setSeries",r,c),h&&zi("setSeries",s,r,c)}s.setSeries=cn;function Up(r,c){qe(K[r],c)}function Xp(r,c){r.fill=le(r.fill||null),r.dir=fe(r.dir,-1),c=c??K.length,K.splice(c,0,r)}function Gp(r){r==null?K.length=0:K.splice(r,1)}s.addBand=Xp,s.setBand=Up,s.delBand=Gp;function Kp(r,c){k[r].alpha=c,Ue&&Lt[r]!=null&&(Lt[r].style.opacity=c),Se&&C[r]&&(C[r].style.opacity=c)}let xn,Nn,rs;const Hs={focus:!0};function Zp(r){if(r!=rs){let c=r==null,p=ln.alpha!=1;k.forEach((h,g)=>{if(i==1||g>0){let w=c||g==0||g==r;h._focus=c?null:w,p&&Kp(g,w?1:ln.alpha)}}),rs=r,p&&Os()}}Se&&Fs&&lt(Il,he,r=>{H._lock||(as(r),rs!=null&&cn(null,Hs,!0,Be.setSeries))});function un(r,c,p){let h=z[c];p&&(r=r/be-(h.ori==1?Ve:Pe));let g=se;h.ori==1&&(g=O,r=g-r),h.dir==-1&&(r=g-r);let w=h._min,x=h._max,M=r/g,A=w+(x-w)*M,I=h.distr;return I==3?ii(10,A):I==4?Fh(A,h.asinh):I==100?h.bwd(A):A}function Jp(r,c){let p=un(r,$,c);return Jt(p,e[0],Xe,Ge)}s.valToIdx=r=>Jt(r,e[0]),s.posToIdx=Jp,s.posToVal=un,s.valToPos=(r,c,p)=>z[c].ori==0?a(r,z[c],p?mt:se,p?yt:0):o(r,z[c],p?Yt:O,p?zt:0),s.setCursor=(r,c,p)=>{ze=r.left,Re=r.top,ls(null,c,p)};function ml(r,c){Fe(Ys,Ws,_e.left=r),Fe(Ys,Ii,_e.width=c)}function gl(r,c){Fe(Ys,_i,_e.top=r),Fe(Ys,Ri,_e.height=c)}let Ei=L.ori==0?ml:gl,Pi=L.ori==1?ml:gl;function Qp(){if(Se&&ae.live)for(let r=i==2?1:0;r<k.length;r++){if(r==0&&ue)continue;let c=ae.values[r],p=0;for(let h in c)V[r][p++].firstChild.nodeValue=c[h]}}function wo(r,c){if(r!=null&&(r.idxs?r.idxs.forEach((p,h)=>{ge[h]=p}):Nh(r.idx)||ge.fill(r.idx),ae.idx=ge[0]),Se&&ae.live){for(let p=0;p<k.length;p++)(p>0||i==1&&!ue)&&eh(p,ge[p]);Qp()}_t=!1,c!==!1&&Je("setLegend")}s.setLegend=wo;function eh(r,c){let p=k[r],h=r==0&&ne==2?Ht:e[r],g;ue?g=p.values(s,r,c)??Ne:(g=p.value(s,c==null?null:h[c],r,c),g=g==null?Ne:{_:g}),ae.values[r]=g}function ls(r,c,p){dl=ze,fl=Re,[ze,Re]=H.move(s,ze,Re),H.left=ze,H.top=Re,Ue&&(Ds&&dn(Ds,Ye(ze),0,se,O),Bs&&dn(Bs,0,Ye(Re),se,O));let h,g=Xe>Ge;xn=Me,Nn=null;let w=L.ori==0?se:O,x=L.ori==1?se:O;if(ze<0||et==0||g){h=H.idx=null;for(let M=0;M<k.length;M++){let A=Lt[M];A!=null&&dn(A,-10,-10,se,O)}Fs&&cn(null,Hs,!0,r==null&&Be.setSeries),ae.live&&(ge.fill(h),_t=!0)}else{let M,A,I;i==1&&(M=L.ori==0?ze:Re,A=un(M,$),h=H.idx=Jt(A,e[0],Xe,Ge),I=q(e[0][h],L,w,0));let N=-10,B=-10,ee=0,ve=0,de=!0,re="",G="";for(let W=i==2?1:0;W<k.length;W++){let Le=k[W],$e=ge[W],Qe=$e==null?null:i==1?e[W][$e]:e[W][1][$e],xe=H.dataIdx(s,W,h,A),Oe=xe==null?null:i==1?e[W][xe]:e[W][1][xe];if(_t=_t||Oe!=Qe||xe!=$e,ge[W]=xe,W>0&&Le.show){let St=xe==null?-10:xe==h?I:q(i==1?e[0][xe]:e[W][0][xe],L,w,0),ct=Oe==null?-10:Z(Oe,i==1?z[Le.scale]:z[Le.facets[1].scale],x,0);if(Fs&&Oe!=null){let Ft=L.ori==1?ze:Re,jt=He(ln.dist(s,W,xe,ct,Ft));if(jt<xn){let pn=ln.bias;if(pn!=0){let kt=un(Ft,Le.scale),Tt=Oe>=0?1:-1,Wt=kt>=0?1:-1;Wt==Tt&&(Wt==1?pn==1?Oe>=kt:Oe<=kt:pn==1?Oe<=kt:Oe>=kt)&&(xn=jt,Nn=W)}else xn=jt,Nn=W}}if(_t||Ts){let Ft,jt;L.ori==0?(Ft=St,jt=ct):(Ft=ct,jt=St);let pn,kt,Tt,Wt,hn,ut,Mt=!0,cs=at.bbox;if(cs!=null){Mt=!1;let pt=cs(s,W);Tt=pt.left,Wt=pt.top,pn=pt.width,kt=pt.height}else Tt=Ft,Wt=jt,pn=kt=at.size(s,W);if(ut=at.fill(s,W),hn=at.stroke(s,W),Ts)W==Nn&&xn<=ln.prox&&(N=Tt,B=Wt,ee=pn,ve=kt,de=Mt,re=ut,G=hn);else{let pt=Lt[W];pt!=null&&(Is[W]=Tt,Rs[W]=Wt,ql(pt,pn,kt,Mt),Dl(pt,ut,hn),dn(pt,Nt(Tt),Nt(Wt),se,O))}}}}if(Ts){let W=ln.prox,Le=rs==null?xn<=W:xn>W||Nn!=rs;if(_t||Le){let $e=Lt[0];$e!=null&&(Is[0]=N,Rs[0]=B,ql($e,ee,ve,de),Dl($e,re,G),dn($e,Nt(N),Nt(B),se,O))}}}if(_e.show&&In)if(r!=null){let[M,A]=Be.scales,[I,N]=Be.match,[B,ee]=r.cursor.sync.scales,ve=r.cursor.drag;if(Ke=ve._x,Ze=ve._y,Ke||Ze){let{left:de,top:re,width:G,height:W}=r.select,Le=r.scales[B].ori,$e=r.posToVal,Qe,xe,Oe,St,ct,Ft=M!=null&&I(M,B),jt=A!=null&&N(A,ee);Ft&&Ke?(Le==0?(Qe=de,xe=G):(Qe=re,xe=W),Oe=z[M],St=q($e(Qe,B),Oe,w,0),ct=q($e(Qe+xe,B),Oe,w,0),Ei(Qt(St,ct),He(ct-St))):Ei(0,w),jt&&Ze?(Le==1?(Qe=de,xe=G):(Qe=re,xe=W),Oe=z[A],St=Z($e(Qe,ee),Oe,x,0),ct=Z($e(Qe+xe,ee),Oe,x,0),Pi(Qt(St,ct),He(ct-St))):Pi(0,x)}else So()}else{let M=He(dl-pl),A=He(fl-hl);if(L.ori==1){let ee=M;M=A,A=ee}Ke=tt.x&&M>=tt.dist,Ze=tt.y&&A>=tt.dist;let I=tt.uni;I!=null?Ke&&Ze&&(Ke=M>=I,Ze=A>=I,!Ke&&!Ze&&(A>M?Ze=!0:Ke=!0)):tt.x&&tt.y&&(Ke||Ze)&&(Ke=Ze=!0);let N,B;Ke&&(L.ori==0?(N=qs,B=ze):(N=Vs,B=Re),Ei(Qt(N,B),He(B-N)),Ze||Pi(0,x)),Ze&&(L.ori==1?(N=qs,B=ze):(N=Vs,B=Re),Pi(Qt(N,B),He(B-N)),Ke||Ei(0,w)),!Ke&&!Ze&&(Ei(0,0),Pi(0,0))}if(tt._x=Ke,tt._y=Ze,r==null){if(p){if(Pl!=null){let[M,A]=Be.scales;Be.values[0]=M!=null?un(L.ori==0?ze:Re,M):null,Be.values[1]=A!=null?un(L.ori==1?ze:Re,A):null}zi(Eo,s,ze,Re,se,O,h)}if(Fs){let M=p&&Be.setSeries,A=ln.prox;rs==null?xn<=A&&cn(Nn,Hs,!0,M):xn>A?cn(null,Hs,!0,M):Nn!=rs&&cn(Nn,Hs,!0,M)}}_t&&(ae.idx=h,wo()),c!==!1&&Je("setCursor")}let $n=null;Object.defineProperty(s,"rect",{get(){return $n==null&&Ai(!1),$n}});function Ai(r=!1){r?$n=null:($n=P.getBoundingClientRect(),Je("syncRect",$n))}function vl(r,c,p,h,g,w,x){H._lock||In&&r!=null&&r.movementX==0&&r.movementY==0||(xo(r,c,p,h,g,w,x,!1,r!=null),r!=null?ls(null,!0,!0):ls(c,!0,!1))}function xo(r,c,p,h,g,w,x,M,A){if($n==null&&Ai(!1),as(r),r!=null)p=r.clientX-$n.left,h=r.clientY-$n.top;else{if(p<0||h<0){ze=-10,Re=-10;return}let[I,N]=Be.scales,B=c.cursor.sync,[ee,ve]=B.values,[de,re]=B.scales,[G,W]=Be.match,Le=c.axes[0].side%2==1,$e=L.ori==0?se:O,Qe=L.ori==1?se:O,xe=Le?w:g,Oe=Le?g:w,St=Le?h:p,ct=Le?p:h;if(de!=null?p=G(I,de)?l(ee,z[I],$e,0):-10:p=$e*(St/xe),re!=null?h=W(N,re)?l(ve,z[N],Qe,0):-10:h=Qe*(ct/Oe),L.ori==1){let Ft=p;p=h,h=Ft}}A&&(c==null||c.cursor.event.type==Eo)&&((p<=1||p>=se-1)&&(p=us(p,se)),(h<=1||h>=O-1)&&(h=us(h,O))),M?(pl=p,hl=h,[qs,Vs]=H.move(s,p,h)):(ze=p,Re=h)}const yo={width:0,height:0,left:0,top:0};function So(){pa(yo,!1)}let bl,wl,xl,yl;function Sl(r,c,p,h,g,w,x){In=!0,Ke=Ze=tt._x=tt._y=!1,xo(r,c,p,h,g,w,x,!0,!1),r!=null&&(lt(Po,qo,kl,!1),zi(Fl,s,qs,Vs,se,O,null));let{left:M,top:A,width:I,height:N}=_e;bl=M,wl=A,xl=I,yl=N}function kl(r,c,p,h,g,w,x){In=tt._x=tt._y=!1,xo(r,c,p,h,g,w,x,!1,!0);let{left:M,top:A,width:I,height:N}=_e,B=I>0||N>0,ee=bl!=M||wl!=A||xl!=I||yl!=N;if(B&&ee&&pa(_e),tt.setScale&&B&&ee){let ve=M,de=I,re=A,G=N;if(L.ori==1&&(ve=A,de=N,re=M,G=I),Ke&&Rn($,un(ve,$),un(ve+de,$)),Ze)for(let W in z){let Le=z[W];W!=$&&Le.from==null&&Le.min!=Me&&Rn(W,un(re+G,W),un(re,W))}So()}else H.lock&&(H._lock=!H._lock,ls(c,!0,r!=null));r!=null&&(zs(Po,qo),zi(Po,s,ze,Re,se,O,null))}function th(r,c,p,h,g,w,x){if(H._lock)return;as(r);let M=In;if(In){let A=!0,I=!0,N=10,B,ee;L.ori==0?(B=Ke,ee=Ze):(B=Ze,ee=Ke),B&&ee&&(A=ze<=N||ze>=se-N,I=Re<=N||Re>=O-N),B&&A&&(ze=ze<qs?0:se),ee&&I&&(Re=Re<Vs?0:O),ls(null,!0,!0),In=!1}ze=-10,Re=-10,ge.fill(null),ls(null,!0,!0),M&&(In=M)}function Ml(r,c,p,h,g,w,x){H._lock||(as(r),so(),So(),r!=null&&zi(Rl,s,ze,Re,se,O,null))}function Cl(){D.forEach(Jd),no(s.width,s.height,!0)}fs(Ca,ei,Cl);const js={};js.mousedown=Sl,js.mousemove=vl,js.mouseup=kl,js.dblclick=Ml,js.setSeries=(r,c,p,h)=>{let g=Be.match[2];p=g(s,c,p),p!=-1&&cn(p,h,!0,!1)},Ue&&(lt(Fl,P,Sl),lt(Eo,P,vl),lt(Tl,P,r=>{as(r),Ai(!1)}),lt(Il,P,th),lt(Rl,P,Ml),Go.add(s),s.syncRect=Ai);const ha=s.hooks=t.hooks||{};function Je(r,c,p){mo?Ci.push([r,c,p]):r in ha&&ha[r].forEach(h=>{h.call(null,s,c,p)})}(t.plugins||[]).forEach(r=>{for(let c in r.hooks)ha[c]=(ha[c]||[]).concat(r.hooks[c])});const El=(r,c,p)=>p,Be=qe({key:null,setSeries:!1,filters:{pub:Wl,sub:Wl},scales:[$,k[1]?k[1].scale:null],match:[Ul,Ul,El],values:[null,null]},H.sync);Be.match.length==2&&Be.match.push(El),H.sync=Be;const Pl=Be.key,ko=xu(Pl);function zi(r,c,p,h,g,w,x){Be.filters.pub(r,c,p,h,g,w,x)&&ko.pub(r,c,p,h,g,w,x)}ko.sub(s);function nh(r,c,p,h,g,w,x){Be.filters.sub(r,c,p,h,g,w,x)&&js[r](null,c,p,h,g,w,x)}s.pub=nh;function sh(){ko.unsub(s),Go.delete(s),es.clear(),Ho(Ca,ei,Cl),d.remove(),he?.remove(),Je("destroy")}s.destroy=sh;function Mo(){Je("init",t,e),sl(e||t.data,!1),Y[$]?go($,Y[$]):so(),aa=_e.show&&(_e.width>0||_e.height>0),is=_t=!0,no(t.width,t.height)}return k.forEach(tl),D.forEach(Rp),n?n instanceof HTMLElement?(n.appendChild(d),Mo()):n(s,Mo):Mo(),s}Te.assign=qe;Te.fmtNum=vr;Te.rangeNum=Ea;Te.rangeLog=Oa;Te.rangeAsinh=mr;Te.orient=Cs;Te.pxRatio=be;Te.join=Yh;Te.fmtDate=wr,Te.tzDate=ed;Te.sync=xu;{Te.addGap=Nd,Te.clipGaps=qa;let t=Te.paths={points:Eu};t.linear=Au,t.stepped=Dd,t.bars=Bd,t.spline=Vd}const je={axis:"#93a7b3",grid:"#1c2a33",green:"#4fd17f",red:"#ef6461",orange:"#ff9f43",blue:"#62a8ff",yellow:"#f2c94c"};function vt(t={}){return{stroke:je.axis,grid:{stroke:je.grid,width:1},...t}}var $t="INUMBER",bi="IOP1",wi="IOP2",xi="IOP3",An="IVAR",vs="IVARNAME",li="IFUNCALL",ja="IFUNDEF",xt="IEXPR",Er="IEXPREVAL",Es="IMEMBER",Wa="IENDSTATEMENT",ci="IARRAY";function pe(t,e){this.type=t,this.value=e??0}pe.prototype.toString=function(){switch(this.type){case $t:case bi:case wi:case xi:case An:case vs:case Wa:return this.value;case li:return"CALL "+this.value;case ja:return"DEF "+this.value;case ci:return"ARRAY "+this.value;case Es:return"."+this.value;default:return"Invalid Instruction"}};function Ua(t){return new pe(bi,t)}function Fn(t){return new pe(wi,t)}function Fu(t){return new pe(xi,t)}function Zo(t,e,n,s,i){for(var a=[],o=[],l,u,d,v,m=0;m<t.length;m++){var f=t[m],y=f.type;if(y===$t||y===vs)Array.isArray(f.value)?a.push.apply(a,Zo(f.value.map(function(P){return new pe($t,P)}).concat(new pe(ci,f.value.length)),e,n,s,i)):a.push(f);else if(y===An&&Object.hasOwn(i,f.value))f=new pe($t,i[f.value]),a.push(f);else if(y===wi&&a.length>1)u=a.pop(),l=a.pop(),v=n[f.value],f=new pe($t,v(l.value,u.value)),a.push(f);else if(y===xi&&a.length>2)d=a.pop(),u=a.pop(),l=a.pop(),f.value==="?"?a.push(l.value?u.value:d.value):(v=s[f.value],f=new pe($t,v(l.value,u.value,d.value)),a.push(f));else if(y===bi&&a.length>0)l=a.pop(),v=e[f.value],f=new pe($t,v(l.value)),a.push(f);else if(y===xt){for(;a.length>0;)o.push(a.shift());o.push(new pe(xt,Zo(f.value,e,n,s,i)))}else if(y===Es&&a.length>0)l=a.pop(),a.push(new pe($t,l.value[f.value]));else{for(;a.length>0;)o.push(a.shift());o.push(f)}}for(;a.length>0;)o.push(a.shift());return o}function Tu(t,e,n){for(var s=[],i=0;i<t.length;i++){var a=t[i],o=a.type;if(o===An&&a.value===e)for(var l=0;l<n.tokens.length;l++){var u=n.tokens[l],d;u.type===bi?d=Ua(u.value):u.type===wi?d=Fn(u.value):u.type===xi?d=Fu(u.value):d=new pe(u.type,u.value),s.push(d)}else o===xt?s.push(new pe(xt,Tu(a.value,e,n))):s.push(a)}return s}function mc(t,e,n){for(var s in e.functions)if(e.functions[s]===t)return!0;if(t.__expr_eval_safe_def)return!0;for(var i in n)if(typeof n[i]=="object"&&n[i]!==null){for(var a in n[i])if(n[i][a]===t)return!0}return!1}function ds(t,e,n){var s=[],i,a,o,l,u,d;if(Pr(t))return yn(t,n);for(var v=t.length,m=0;m<v;m++){var f=t[m],y=f.type;if(y===$t||y===vs)s.push(f.value);else if(y===wi)a=s.pop(),i=s.pop(),f.value==="and"?s.push(i?!!ds(a,e,n):!1):f.value==="or"?s.push(i?!0:!!ds(a,e,n)):f.value==="="?(l=e.binaryOps[f.value],s.push(l(i,ds(a,e,n),n))):(l=e.binaryOps[f.value],s.push(l(yn(i,n),yn(a,n))));else if(y===xi)o=s.pop(),a=s.pop(),i=s.pop(),f.value==="?"?s.push(ds(i?a:o,e,n)):(l=e.ternaryOps[f.value],s.push(l(yn(i,n),yn(a,n),yn(o,n))));else if(y===An){if(/^__proto__|prototype|constructor$/.test(f.value))throw new Error("prototype access detected");if(f.value in e.functions)s.push(e.functions[f.value]);else if(f.value in e.unaryOps&&e.parser.isOperatorEnabled(f.value))s.push(e.unaryOps[f.value]);else{var P=n[f.value];if(P!==void 0){if(typeof P=="function"&&!mc(P,e,n))throw new Error("Variable references an unallowed function: "+f.value);s.push(P)}else throw new Error("undefined variable: "+f.value)}}else if(y===bi)i=s.pop(),l=e.unaryOps[f.value],s.push(l(yn(i,n)));else if(y===li){for(d=f.value,u=[];d-- >0;)u.unshift(yn(s.pop(),n));if(l=s.pop(),!mc(l,e,n))throw new Error("Is not an allowed function.");if(l.apply&&l.call)s.push(l.apply(void 0,u));else throw new Error(l+" is not a function")}else if(y===ja)s.push((function(){for(var R=s.pop(),F=[],_=f.value;_-- >0;)F.unshift(s.pop());var k=s.pop(),D=function(){for(var z=Object.assign({},n),K=0,$=F.length;K<$;K++)z[F[K]]=arguments[K];return ds(R,e,z)};return Object.defineProperty(D,"name",{value:k,writable:!1}),Object.defineProperty(D,"__expr_eval_safe_def",{value:!0,writable:!1}),n[k]=D,D})());else if(y===xt)s.push(Qd(f,e));else if(y===Er)s.push(f);else if(y===Es)i=s.pop(),s.push(i[f.value]);else if(y===Wa)s.pop();else if(y===ci){for(d=f.value,u=[];d-- >0;)u.unshift(s.pop());s.push(u)}else throw new Error("invalid Expression")}if(s.length>1)throw new Error("invalid Expression (parity)");return s[0]===0?0:yn(s[0],n)}function Qd(t,e,n){return Pr(t)?t:{type:Er,value:function(s){return ds(t.value,e,s)}}}function Pr(t){return t&&t.type===Er}function yn(t,e){return Pr(t)?t.value(e):t}function Ar(t,e){for(var n=[],s,i,a,o,l,u,d=0;d<t.length;d++){var v=t[d],m=v.type;if(m===$t)typeof v.value=="number"&&v.value<0?n.push("("+v.value+")"):Array.isArray(v.value)?n.push("["+v.value.map(gc).join(", ")+"]"):n.push(gc(v.value));else if(m===wi)i=n.pop(),s=n.pop(),o=v.value,e?o==="^"?n.push("Math.pow("+s+", "+i+")"):o==="and"?n.push("(!!"+s+" && !!"+i+")"):o==="or"?n.push("(!!"+s+" || !!"+i+")"):o==="||"?n.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }(("+s+"),("+i+")))"):o==="=="?n.push("("+s+" === "+i+")"):o==="!="?n.push("("+s+" !== "+i+")"):o==="["?n.push(s+"[("+i+") | 0]"):n.push("("+s+" "+o+" "+i+")"):o==="["?n.push(s+"["+i+"]"):n.push("("+s+" "+o+" "+i+")");else if(m===xi)if(a=n.pop(),i=n.pop(),s=n.pop(),o=v.value,o==="?")n.push("("+s+" ? "+i+" : "+a+")");else throw new Error("invalid Expression");else if(m===An||m===vs)n.push(v.value);else if(m===bi)s=n.pop(),o=v.value,o==="-"||o==="+"?n.push("("+o+s+")"):e?o==="not"?n.push("(!"+s+")"):o==="!"?n.push("fac("+s+")"):n.push(o+"("+s+")"):o==="!"?n.push("("+s+"!)"):n.push("("+o+" "+s+")");else if(m===li){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());o=n.pop(),n.push(o+"("+l.join(", ")+")")}else if(m===ja){for(i=n.pop(),u=v.value,l=[];u-- >0;)l.unshift(n.pop());s=n.pop(),e?n.push("("+s+" = function("+l.join(", ")+") { return "+i+" })"):n.push("("+s+"("+l.join(", ")+") = "+i+")")}else if(m===Es)s=n.pop(),n.push(s+"."+v.value);else if(m===ci){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());n.push("["+l.join(", ")+"]")}else if(m===xt)n.push("("+Ar(v.value,e)+")");else if(m!==Wa)throw new Error("invalid Expression")}return n.length>1&&(e?n=[n.join(",")]:n=[n.join(";")]),String(n[0])}function gc(t){return typeof t=="string"?JSON.stringify(t).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"):t}function Js(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}function zr(t,e,n){n=n||{};for(var s=!!n.withMembers,i=null,a=0;a<t.length;a++){var o=t[a];o.type===An||o.type===vs?!s&&!Js(e,o.value)?e.push(o.value):(i!==null&&(Js(e,i)||e.push(i)),i=o.value):o.type===Es&&s&&i!==null?i+="."+o.value:o.type===xt?zr(o.value,e,n):i!==null&&(Js(e,i)||e.push(i),i=null)}i!==null&&!Js(e,i)&&e.push(i)}function tn(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}tn.prototype.simplify=function(t){return t=t||{},new tn(Zo(this.tokens,this.unaryOps,this.binaryOps,this.ternaryOps,t),this.parser)};tn.prototype.substitute=function(t,e){return e instanceof tn||(e=this.parser.parse(String(e))),new tn(Tu(this.tokens,t,e),this.parser)};tn.prototype.evaluate=function(t){return t=t||{},ds(this.tokens,this,t)};tn.prototype.toString=function(){return Ar(this.tokens,!1)};tn.prototype.symbols=function(t){t=t||{};var e=[];return zr(this.tokens,e,t),e};tn.prototype.variables=function(t){t=t||{};var e=[];zr(this.tokens,e,t);var n=this.functions;return e.filter(function(s){return!(s in n)})};tn.prototype.toJSFunction=function(t,e){var n=this,s=new Function(t,"with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return "+Ar(this.simplify(e).tokens,!0)+"; }");return function(){return s.apply(n,arguments)}};var ji="TEOF",Ae="TOP",Xa="TNUMBER",Iu="TSTRING",zn="TPAREN",ui="TBRACKET",Ga="TCOMMA",_r="TNAME",Lr="TSEMICOLON";function Ru(t,e,n){this.type=t,this.value=e,this.index=n}Ru.prototype.toString=function(){return this.type+": "+this.value};function De(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}De.prototype.newToken=function(t,e,n){return new Ru(t,e,n??this.pos)};De.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current};De.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent};De.prototype.next=function(){if(this.pos>=this.expression.length)return this.newToken(ji,"EOF");if(this.isWhitespace()||this.isComment())return this.next();if(this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName())return this.current;this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')};De.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if(n==="'"||n==='"')for(var s=this.expression.indexOf(n,e+1);s>=0&&this.pos<this.expression.length;){if(this.pos=s+1,this.expression.charAt(s-1)!=="\\"){var i=this.expression.substring(e+1,s);this.current=this.newToken(Iu,this.unescape(i),e),t=!0;break}s=this.expression.indexOf(n,s+1)}return t};De.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return t==="("||t===")"?(this.current=this.newToken(zn,t),this.pos++,!0):!1};De.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return(t==="["||t==="]")&&this.isOperatorEnabled("[")?(this.current=this.newToken(ui,t),this.pos++,!0):!1};De.prototype.isComma=function(){var t=this.expression.charAt(this.pos);return t===","?(this.current=this.newToken(Ga,","),this.pos++,!0):!1};De.prototype.isSemicolon=function(){var t=this.expression.charAt(this.pos);return t===";"?(this.current=this.newToken(Lr,";"),this.pos++,!0):!1};De.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&n!=="."&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(s in this.consts)return this.current=this.newToken(Xa,this.consts[s]),this.pos+=s.length,!0}return!1};De.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(this.isOperatorEnabled(s)&&(s in this.binaryOps||s in this.unaryOps||s in this.ternaryOps))return this.current=this.newToken(Ae,s),this.pos+=s.length,!0}return!1};De.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var s=this.expression.charAt(e);if(s.toUpperCase()===s.toLowerCase()){if(e===this.pos&&(s==="$"||s==="_")){s==="_"&&(n=!0);continue}else if(e===this.pos||!n||s!=="_"&&(s<"0"||s>"9"))break}else n=!0}if(n){var i=this.expression.substring(t,e);return this.current=this.newToken(_r,i),this.pos+=i.length,!0}return!1};De.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);(e===" "||e==="	"||e===`
`||e==="\r")&&(t=!0,this.pos++,!(this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var ef=/^[0-9a-f]{4}$/i;De.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var s=t.charAt(++e);switch(s){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+=`
`;break;case"r":n+="\r";break;case"t":n+="	";break;case"u":var i=t.substring(e+1,e+5);ef.test(i)||this.parseError("Illegal escape sequence: \\u"+i),n+=String.fromCharCode(parseInt(i,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+s+'"')}++e;var a=t.indexOf("\\",e);n+=t.substring(e,a<0?t.length:a),e=a}return n};De.prototype.isComment=function(){var t=this.expression.charAt(this.pos);return t==="/"&&this.expression.charAt(this.pos+1)==="*"?(this.pos=this.expression.indexOf("*/",this.pos)+2,this.pos===1&&(this.pos=this.expression.length),!0):!1};De.prototype.isRadixInteger=function(){var t=this.pos;if(t>=this.expression.length-2||this.expression.charAt(t)!=="0")return!1;++t;var e,n;if(this.expression.charAt(t)==="x")e=16,n=/^[0-9a-f]$/i,++t;else if(this.expression.charAt(t)==="b")e=2,n=/^[01]$/i,++t;else return!1;for(var s=!1,i=t;t<this.expression.length;){var a=this.expression.charAt(t);if(n.test(a))t++,s=!0;else break}return s&&(this.current=this.newToken(Xa,parseInt(this.expression.substring(i,t),e)),this.pos=t),s};De.prototype.isNumber=function(){for(var t=!1,e=this.pos,n=e,s=e,i=!1,a=!1,o;e<this.expression.length&&(o=this.expression.charAt(e),o>="0"&&o<="9"||!i&&o===".");)o==="."?i=!0:a=!0,e++,t=a;if(t&&(s=e),o==="e"||o==="E"){e++;for(var l=!0,u=!1;e<this.expression.length;){if(o=this.expression.charAt(e),l&&(o==="+"||o==="-"))l=!1;else if(o>="0"&&o<="9")u=!0,l=!1;else break;e++}u||(e=s)}return t?(this.current=this.newToken(Xa,parseFloat(this.expression.substring(n,e))),this.pos=e):this.pos=s,t};De.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if(e==="+"||e==="-"||e==="*"||e==="/"||e==="%"||e==="^"||e==="?"||e===":"||e===".")this.current=this.newToken(Ae,e);else if(e==="∙"||e==="•")this.current=this.newToken(Ae,"*");else if(e===">")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,">="),this.pos++):this.current=this.newToken(Ae,">");else if(e==="<")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,"<="),this.pos++):this.current=this.newToken(Ae,"<");else if(e==="|")if(this.expression.charAt(this.pos+1)==="|")this.current=this.newToken(Ae,"||"),this.pos++;else return!1;else if(e==="=")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,"=="),this.pos++):this.current=this.newToken(Ae,e);else if(e==="!")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,"!="),this.pos++):this.current=this.newToken(Ae,e);else return!1;return this.pos++,this.isOperatorEnabled(this.current.value)?!0:(this.pos=t,!1)};De.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)};De.prototype.getCoordinates=function(){var t=0,e,n=-1;do t++,e=this.pos-n,n=this.expression.indexOf(`
`,n+1);while(n>=0&&n<this.pos);return{line:t,column:e}};De.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};function Ie(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=n.allowMemberAccess!==!1}Ie.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()};Ie.prototype.tokenMatches=function(t,e){return typeof e>"u"?!0:Array.isArray(e)?Js(e,t.value):typeof e=="function"?e(t):t.value===e};Ie.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()};Ie.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken};Ie.prototype.accept=function(t,e){return this.nextToken.type===t&&this.tokenMatches(this.nextToken,e)?(this.next(),!0):!1};Ie.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}};Ie.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.accept(_r)||this.accept(Ae,n))t.push(new pe(An,this.current.value));else if(this.accept(Xa))t.push(new pe($t,this.current.value));else if(this.accept(Iu))t.push(new pe($t,this.current.value));else if(this.accept(zn,"("))this.parseExpression(t),this.expect(zn,")");else if(this.accept(ui,"["))if(this.accept(ui,"]"))t.push(new pe(ci,0));else{var s=this.parseArrayList(t);t.push(new pe(ci,s))}else throw new Error("unexpected "+this.nextToken)};Ie.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),!this.parseUntilEndStatement(t,e)&&this.pushExpression(t,e))};Ie.prototype.pushExpression=function(t,e){for(var n=0,s=e.length;n<s;n++)t.push(e[n])};Ie.prototype.parseUntilEndStatement=function(t,e){return this.accept(Lr)?(this.nextToken&&this.nextToken.type!==ji&&!(this.nextToken.type===zn&&this.nextToken.value===")")&&e.push(new pe(Wa)),this.nextToken.type!==ji&&this.parseExpression(e),t.push(new pe(xt,e)),!0):!1};Ie.prototype.parseArrayList=function(t){for(var e=0;!this.accept(ui,"]");)for(this.parseExpression(t),++e;this.accept(Ga);)this.parseExpression(t),++e;return e};Ie.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(Ae,"=");){var e=t.pop(),n=[],s=t.length-1;if(e.type===li){if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var i=0,a=e.value+1;i<a;i++){var o=s-i;t[o].type===An&&(t[o]=new pe(vs,t[o].value))}this.parseVariableAssignmentExpression(n),t.push(new pe(xt,n)),t.push(new pe(ja,e.value));continue}if(e.type!==An&&e.type!==Es)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new pe(vs,e.value)),t.push(new pe(xt,n)),t.push(Fn("="))}};Ie.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(Ae,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(Ae,":"),this.parseConditionalExpression(n),t.push(new pe(xt,e)),t.push(new pe(xt,n)),t.push(Fu("?"))}};Ie.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(Ae,"or");){var e=[];this.parseAndExpression(e),t.push(new pe(xt,e)),t.push(Fn("or"))}};Ie.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(Ae,"and");){var e=[];this.parseComparison(e),t.push(new pe(xt,e)),t.push(Fn("and"))}};var tf=["==","!=","<","<=",">=",">","in"];Ie.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(Ae,tf);){var e=this.current;this.parseAddSub(t),t.push(Fn(e.value))}};var nf=["+","-","||"];Ie.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(Ae,nf);){var e=this.current;this.parseTerm(t),t.push(Fn(e.value))}};var sf=["*","/","%"];Ie.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(Ae,sf);){var e=this.current;this.parseFactor(t),t.push(Fn(e.value))}};Ie.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.save(),this.accept(Ae,n)){if(this.current.value!=="-"&&this.current.value!=="+"){if(this.nextToken.type===zn&&this.nextToken.value==="("){this.restore(),this.parseExponential(t);return}else if(this.nextToken.type===Lr||this.nextToken.type===Ga||this.nextToken.type===ji||this.nextToken.type===zn&&this.nextToken.value===")"){this.restore(),this.parseAtom(t);return}}var s=this.current;this.parseFactor(t),t.push(Ua(s.value))}else this.parseExponential(t)};Ie.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(Ae,"^");)this.parseFactor(t),t.push(Fn("^"))};Ie.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(Ae,"!");)t.push(Ua("!"))};Ie.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;function n(a){return a.value in e}if(this.accept(Ae,n)){var s=this.current;this.parseAtom(t),t.push(Ua(s.value))}else for(this.parseMemberExpression(t);this.accept(zn,"(");)if(this.accept(zn,")"))t.push(new pe(li,0));else{var i=this.parseArgumentList(t);t.push(new pe(li,i))}};Ie.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(zn,")");)for(this.parseExpression(t),++e;this.accept(Ga);)this.parseExpression(t),++e;return e};Ie.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(Ae,".")||this.accept(ui,"[");){var e=this.current;if(e.value==="."){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect(_r),t.push(new pe(Es,this.current.value))}else if(e.value==="["){if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect(ui,"]"),t.push(Fn("["))}else throw new Error("unexpected symbol: "+e.value)}};function af(t,e){return Number(t)+Number(e)}function of(t,e){return t-e}function rf(t,e){return t*e}function lf(t,e){return t/e}function cf(t,e){return t%e}function uf(t,e){return Array.isArray(t)&&Array.isArray(e)?t.concat(e):""+t+e}function pf(t,e){return t===e}function hf(t,e){return t!==e}function df(t,e){return t>e}function ff(t,e){return t<e}function mf(t,e){return t>=e}function gf(t,e){return t<=e}function vf(t,e){return!!(t&&e)}function bf(t,e){return!!(t||e)}function wf(t,e){return Js(e,t)}function xf(t){return(Math.exp(t)-Math.exp(-t))/2}function yf(t){return(Math.exp(t)+Math.exp(-t))/2}function Sf(t){return t===1/0?1:t===-1/0?-1:(Math.exp(t)-Math.exp(-t))/(Math.exp(t)+Math.exp(-t))}function kf(t){return t===-1/0?t:Math.log(t+Math.sqrt(t*t+1))}function Mf(t){return Math.log(t+Math.sqrt(t*t-1))}function Cf(t){return Math.log((1+t)/(1-t))/2}function vc(t){return Math.log(t)*Math.LOG10E}function Ef(t){return-t}function Pf(t){return!t}function Af(t){return t<0?Math.ceil(t):Math.floor(t)}function zf(t){return Math.random()*(t||1)}function bc(t){return Fr(t+1)}function _f(t){return isFinite(t)&&t===Math.round(t)}var Lf=4.7421875,Fo=[.9999999999999971,57.15623566586292,-59.59796035547549,14.136097974741746,-.4919138160976202,3399464998481189e-20,4652362892704858e-20,-9837447530487956e-20,.0001580887032249125,-.00021026444172410488,.00021743961811521265,-.0001643181065367639,8441822398385275e-20,-26190838401581408e-21,36899182659531625e-22];function Fr(t){var e,n;if(_f(t)){if(t<=0)return isFinite(t)?1/0:NaN;if(t>171)return 1/0;for(var s=t-2,i=t-1;s>1;)i*=s,s--;return i===0&&(i=1),i}if(t<.5)return Math.PI/(Math.sin(Math.PI*t)*Fr(1-t));if(t>=171.35)return 1/0;if(t>85){var a=t*t,o=a*t,l=o*t,u=l*t;return Math.sqrt(2*Math.PI/t)*Math.pow(t/Math.E,t)*(1+1/(12*t)+1/(288*a)-139/(51840*o)-571/(2488320*l)+163879/(209018880*u)+5246819/(75246796800*u*t))}--t,n=Fo[0];for(var d=1;d<Fo.length;++d)n+=Fo[d]/(t+d);return e=t+Lf+.5,Math.sqrt(2*Math.PI)*Math.pow(e,t+.5)*Math.exp(-e)*n}function Ff(t){return Array.isArray(t)?t.length:String(t).length}function wc(){for(var t=0,e=0,n=0;n<arguments.length;n++){var s=Math.abs(arguments[n]),i;e<s?(i=e/s,t=t*i*i+1,e=s):s>0?(i=s/e,t+=i*i):t+=s}return e===1/0?1/0:e*Math.sqrt(t)}function xc(t,e,n){return t?e:n}function Tf(t,e){return typeof e>"u"||+e==0?Math.round(t):(t=+t,e=-+e,isNaN(t)||!(typeof e=="number"&&e%1===0)?NaN:(t=t.toString().split("e"),t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e))),t=t.toString().split("e"),+(t[0]+"e"+(t[1]?+t[1]+e:e))))}function If(t,e,n){return n&&(n[t]=e),e}function Rf(t,e){return t[e|0]}function Nf(t){return arguments.length===1&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function $f(t){return arguments.length===1&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function Of(t,e){if(typeof t!="function")throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map(function(n,s){return t(n,s)})}function Df(t,e,n){if(typeof t!="function")throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce(function(s,i,a){return t(s,i,a)},e)}function Bf(t,e){if(typeof t!="function")throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter(function(n,s){return t(n,s)})}function qf(t,e){if(!(Array.isArray(e)||typeof e=="string"))throw new Error("Second argument to indexOf is not a string or array");return e.indexOf(t)}function Vf(t,e){if(!Array.isArray(e))throw new Error("Second argument to join is not an array");return e.join(t)}function Yf(t){return(t>0)-(t<0)||+t}var yc=1/3;function Hf(t){return t<0?-Math.pow(-t,yc):Math.pow(t,yc)}function jf(t){return Math.exp(t)-1}function Wf(t){return Math.log(1+t)}function Uf(t){return Math.log(t)/Math.LN2}function Xf(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce(function(e,n){return e+Number(n)},0)}function Ps(t){this.options=t||{},this.unaryOps={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh||xf,cosh:Math.cosh||yf,tanh:Math.tanh||Sf,asinh:Math.asinh||kf,acosh:Math.acosh||Mf,atanh:Math.atanh||Cf,sqrt:Math.sqrt,cbrt:Math.cbrt||Hf,log:Math.log,log2:Math.log2||Uf,ln:Math.log,lg:Math.log10||vc,log10:Math.log10||vc,expm1:Math.expm1||jf,log1p:Math.log1p||Wf,abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,trunc:Math.trunc||Af,"-":Ef,"+":Number,exp:Math.exp,not:Pf,length:Ff,"!":bc,sign:Math.sign||Yf},this.binaryOps={"+":af,"-":of,"*":rf,"/":lf,"%":cf,"^":Math.pow,"||":uf,"==":pf,"!=":hf,">":df,"<":ff,">=":mf,"<=":gf,and:vf,or:bf,in:wf,"=":If,"[":Rf},this.ternaryOps={"?":xc},this.functions={random:zf,fac:bc,min:$f,max:Nf,hypot:Math.hypot||wc,pyt:Math.hypot||wc,pow:Math.pow,atan2:Math.atan2,if:xc,gamma:Fr,roundTo:Tf,map:Of,fold:Df,filter:Bf,indexOf:qf,join:Vf,sum:Xf},this.consts={E:Math.E,PI:Math.PI,true:!0,false:!1}}Ps.prototype.parse=function(t){var e=[],n=new Ie(this,new De(this,t),{allowMemberAccess:this.options.allowMemberAccess});return n.parseExpression(e),n.expect(ji,"EOF"),new tn(e,this)};Ps.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var Nu=new Ps;Ps.parse=function(t){return Nu.parse(t)};Ps.evaluate=function(t,e){return Nu.parse(t).evaluate(e)};var Sc={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",and:"logical",or:"logical",not:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};function Gf(t){return Object.hasOwn(Sc,t)?Sc[t]:t}Ps.prototype.isOperatorEnabled=function(t){var e=Gf(t),n=this.options.operators||{};return!(e in n)||!!n[e]};const Jn=new Ps({allowMemberAccess:!1,operators:{assignment:!1,comparison:!0,fndef:!1,in:!1,logical:!0}}),Kf=[[/\bnp\.arctan2\b/g,"atan2"],[/\bnp\.arcsin\b/g,"asin"],[/\bnp\.arccos\b/g,"acos"],[/\bnp\.arctan\b/g,"atan"],[/\bnp\.(?:absolute|fabs)\b/g,"abs"],[/\bnp\.power\b/g,"pow"],[/\bnp\.maximum\b/g,"max"],[/\bnp\.minimum\b/g,"min"],[/\bnp\.square\b/g,"square"],[/\bnp\.clip\b/g,"clip"],[/\bnp\.where\b/g,"where"],[/\bnp\.heaviside\b/g,"heaviside"],[/\bnp\.deg2rad\b/g,"deg2rad"],[/\bnp\.rad2deg\b/g,"rad2deg"],[/\bnp\.pi\b/g,"PI"],[/\bnp\.e\b/g,"E"]];for(const t of["random","fac","gamma","map","fold","filter","indexOf","join","sum"])delete Jn.functions[t];Jn.functions.square=t=>t*t;Jn.functions.clip=(t,e,n)=>Math.min(Math.max(t,e),n);Jn.functions.where=(t,e,n)=>t?e:n;Jn.functions.heaviside=(t,e=.5)=>t<0?0:t>0?1:e;Jn.functions.deg2rad=t=>t*Math.PI/180;Jn.functions.rad2deg=t=>t*180/Math.PI;const Zf=new Set(["ch1","ch2","times"]),$u={mean:t=>Du(t),sum:t=>Ou(t),min:t=>ga(t,Math.min),max:t=>ga(t,Math.max),ptp:t=>ga(t,Math.max)-ga(t,Math.min),var:t=>kc(t),std:t=>Math.sqrt(kc(t)),median:t=>Qf(t)},Jf=new RegExp(`\\bnp\\.(${Object.keys($u).join("|")})\\(\\s*(ch1|ch2|times)\\s*\\)`,"g");function Ou(t){let e=0;for(let n=0;n<t.length;n+=1)e+=t[n];return e}function Du(t){return t.length===0?Number.NaN:Ou(t)/t.length}function ga(t,e){if(t.length===0)return Number.NaN;let n=t[0];for(let s=1;s<t.length;s+=1)n=e(n,t[s]);return n}function kc(t){const e=Du(t);if(!Number.isFinite(e))return Number.NaN;let n=0;for(let s=0;s<t.length;s+=1)n+=(t[s]-e)**2;return n/t.length}function Qf(t){if(t.length===0)return Number.NaN;const e=Array.from(t).sort((s,i)=>s-i),n=Math.floor(e.length/2);return e.length%2===0?(e[n-1]+e[n])/2:e[n]}function em(t){let e=t.trim().replaceAll("**","^");for(const[n,s]of Kf)e=e.replace(n,s);return e.replace(/\bnp\./g,"")}function tm(t,e){return t.replace(Jf,(n,s,i)=>{const a=$u[s](e[i]);return Number.isFinite(a)?String(a):"(0 / 0)"})}function nm(t,e,n,s){const i=em(tm(t,{ch1:e,ch2:n,times:s}));if(!i)throw new Error("formula is empty");const a=Jn.parse(i),o=a.variables().filter(d=>!Zf.has(d));if(o.length>0)throw new Error(`unknown variable ${o[0]}`);const l=a.toJSFunction(["ch1","ch2","times"]),u=new Float32Array(Math.min(e.length,n.length,s.length));for(let d=0;d<u.length;d+=1){const v=Number(l(e[d],n[d],s[d]));u[d]=Number.isFinite(v)?v:Number.NaN}return u}function sm(t,e=250,n=5e3){const s=Math.max(0,Math.floor(t)),i=Math.max(1,Math.floor(e)),a=Math.max(i,Math.floor(n));return Math.min(a,i*2**Math.min(s,20))}class Ka{constructor(e,n=250,s=5e3,i=(o,l)=>window.setTimeout(o,l),a=o=>window.clearTimeout(o)){this.reconnect=e,this.baseDelay=n,this.maxDelay=s,this.scheduleTimer=i,this.cancelTimer=a}reconnect;baseDelay;maxDelay;scheduleTimer;cancelTimer;attempt=0;timer=null;schedule(){if(this.timer!==null)return null;const e=sm(this.attempt,this.baseDelay,this.maxDelay);return this.attempt+=1,this.timer=this.scheduleTimer(()=>{this.timer=null,this.reconnect()},e),e}connected(){this.cancel()}cancel(e=!0){this.timer!==null&&(this.cancelTimer(this.timer),this.timer=null),e&&(this.attempt=0)}}const im="PWS1",Mc=24;function am(t){if(t.byteLength<Mc)throw new Error("Scope frame too short");const e=new DataView(t),n=String.fromCharCode(...new Uint8Array(t.slice(0,4)));if(n!==im)throw new Error(`Bad frame magic: ${n}`);const s=e.getUint16(4,!0);if(s!==1)throw new Error(`Unsupported scope frame version: ${s}`);const i=e.getUint16(6,!0),a=e.getUint32(8,!0),o=new Float32Array(t,Mc);if(o.length!==a*i)throw new Error("Scope frame payload length does not match metadata");return{channelCount:i,sampleCount:a,sequence:e.getUint32(20,!0),samples:o}}function om(t,e){const n=new Float64Array(t.sampleCount),s=new Float32Array(t.sampleCount),i=new Float32Array(t.sampleCount),a=e?.rollingMode?-e.duration:e&&e.triggerSource!=="immediately"?e.triggerDelay-e.duration/2:0,o=e?e.duration:Math.max(0,t.sampleCount-1),l=t.sampleCount>0?o/t.sampleCount:0;for(let u=0;u<t.sampleCount;u+=1)n[u]=e?a+u*l:u,s[u]=t.samples[u*t.channelCount]??0,i[u]=t.channelCount>1?t.samples[u*t.channelCount+1]??0:0;return{x:n,ch1:s,ch2:i}}function rm(t,e,n,s){const i=Math.min(n+1,Math.max(1,Math.floor(s)));if(i<=1||!e||e.ch1.length!==t.ch1.length||e.ch2.length!==t.ch2.length)return{data:t,currentAverage:1};const a=new Float32Array(t.ch1.length),o=new Float32Array(t.ch2.length),l=i-1;for(let u=0;u<t.ch1.length;u+=1)a[u]=(e.ch1[u]*l+t.ch1[u])/i,o[u]=(e.ch2[u]*l+t.ch2[u])/i;return{data:{x:t.x,ch1:a,ch2:o},currentAverage:i}}function lm(t,e,n,s=4){const i=Math.max(1,n),a=Math.min(i,Math.max(s,e-t));let o=t,l=t+a;return o<0&&(l-=o,o=0),l>i&&(o-=l-i,l=i),{min:Math.max(0,o),max:Math.min(i,Math.max(a,l))}}const cm=2**14,va=-1.1,Fi=1.1;class um{constructor(e,n,s=()=>{},i=cm){this.plotHost=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new Ka(()=>this.openSocket()),this.plot=new Te(this.options(),this.emptyData(),this.plotHost),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotHost),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}plotHost;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;plot;latestFrame=null;receivedFrameCount=0;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;pendingFrame=null;averagedData=null;displayedData=null;currentAverage=0;traceAverage=1;timeSettings=null;channelVisible=[!0,!0];xyMode=!1;mathActive=!1;mathFormula="ch1 * ch2";resizeObserver;resizeListener=()=>this.scheduleResize();connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/scope?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Scope stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Scope stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.setStatus("Scope stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Scope stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.handleFrame(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}reconnect(){if(!this.wantsConnection)return;this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close(),this.resetTraceAveraging(),this.openSocket()}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}setSampleCount(e){this.sampleCount=Math.max(1,Math.floor(e)),this.resetAveraging()}getSampleCount(){return this.sampleCount}setTraceAverage(e){this.traceAverage=Math.max(1,Math.floor(e)),this.resetAveraging()}resetTraceAveraging(){this.pendingFrame=null,this.resetAveraging()}getTraceAverage(){return this.traceAverage}setTimeSettings(e){if(this.timeSettings=e,this.resetAveraging(),this.latestFrame&&this.displayedData){const n=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(n)),this.resetYScale()}),this.plot.redraw(!0,!0)}}setChannelVisible(e,n){this.channelVisible[e-1]=n,this.applySeriesVisibility()}getChannelVisible(e){return this.channelVisible[e-1]}setDisplaySettings(e){const n=this.xyMode!==e.xyMode;if(this.xyMode=e.xyMode,this.mathActive=e.mathActive,this.mathFormula=e.mathFormula,this.applySeriesVisibility(),this.latestFrame&&this.displayedData){const s=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),n&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(s)),this.resetYScale()}),this.plot.redraw(!0,!0)}}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),this.resizeObserver.disconnect(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.plot.destroy()}showFrame(e){this.handleFrame(e)}resetZoom(){if(!this.latestFrame)return;const e=this.latestFrame;this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(e)),this.resetYScale()})}zoom(e){const n=this.plot.scales.x,s=Number(n.min??0),i=Number(n.max??this.currentMaxX()),a=(s+i)/2,o=Math.max(this.minimumXSpan(),(i-s)*e);this.setXScale(a-o/2,a+o/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-6,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??va),max:Number(e.max??Fi)}}getFormattedTimeLabelsForCurrentRange(e=6){const{min:n,max:s}=this.getXRange(),i=Math.max(2,Math.floor(e)),a=(s-n)/(i-1),o=Array.from({length:i},(l,u)=>n+a*u);return this.formatTimeTicks(this.plot,o)}getFrameSequence(){return this.receivedFrameCount>0?this.receivedFrameCount:null}exportCsv(){if(!this.displayedData)return`time,ch1,ch2
`;const e=["time,ch1,ch2"];for(let n=0;n<this.displayedData.x.length;n+=1)e.push(`${this.displayedData.x[n]},${this.displayedData.ch1[n]},${this.displayedData.ch2[n]}`);return`${e.join(`
`)}
`}getDisplayedStats(){return this.displayedData?{...Ec(this.displayedData.ch1,"ch1"),...Ec(this.displayedData.ch2,"ch2")}:null}getDisplayedDataFingerprint(){if(!this.displayedData)return null;let e=2166136261;const n=Math.max(1,Math.floor(this.displayedData.x.length/512));for(let s=0;s<this.displayedData.x.length;s+=n)e=To(e,this.displayedData.x[s]),e=To(e,this.displayedData.ch1[s]),e=To(e,this.displayedData.ch2[s]);return e>>>0}getMathStats(){return this.xyMode||!this.mathActive?null:pm(this.plot.data,3,1)}getXyStats(){if(!this.xyMode)return null;const e=Jo(this.plot.data,1,0),n=Jo(this.plot.data,1,1);if(!e||!n||e.length===0||e.length!==n.length)return null;let s=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,a=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY,l=0;for(let u=0;u<e.length;u+=1)s=Math.min(s,e[u]),i=Math.max(i,e[u]),a=Math.min(a,n[u]),o=Math.max(o,n[u]),l=Math.max(l,Math.abs(e[u]-n[u]));return{xMin:s,xMax:i,yMin:a,yMax:o,maxDelta:l}}getCurveData(){return this.displayedData?{x:Array.from(this.displayedData.x),channels:[Array.from(this.displayedData.ch1),Array.from(this.displayedData.ch2)]}:null}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}options(){return{mode:2,width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1,min:0,max:this.sampleCount-1},y:{auto:!1,min:va,max:Fi}},axes:[vt({label:"Time / CH1",values:(e,n)=>this.formatTimeTicks(e,n)}),vt({label:"Amplitude / CH2"})],series:[{},{label:"CH1 / XY",stroke:je.green,width:1.5,points:{show:!1}},{label:"CH2",stroke:je.red,width:1.5,points:{show:!1}},{label:"Math",stroke:je.blue,width:1.5,points:{show:!1}}]}}emptyData(){return[[],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)]]}handleFrame(e){let n;try{n=am(e)}catch(s){this.setStatus(s instanceof Error?s.message:"Invalid scope frame");return}this.receivedFrameCount+=1,this.pendingFrame=n,this.scheduleRender(),this.setStatus(`Frame ${n.sequence}, ${n.sampleCount} samples, ${n.channelCount} channels`)}frameData(e){const n=om(e,this.timeSettings??void 0);if(this.timeSettings?.rollingMode)return this.averagedData=null,this.displayedData=n,this.currentAverage=0,this.setCurrentAverage(0),this.plotData(n);const s=rm(n,this.averagedData,this.currentAverage,this.traceAverage);return this.averagedData=s.data,this.displayedData=s.data,this.currentAverage=s.currentAverage,this.setCurrentAverage(this.currentAverage),this.plotData(s.data)}plotData(e){if(this.xyMode){const s=new Float32Array(0);return[[],[e.ch1,e.ch2],[s,s],[s,s]]}let n=new Float32Array(e.x.length).fill(Number.NaN);if(this.mathActive)try{n=nm(this.mathFormula,e.ch1,e.ch2,e.x)}catch(s){this.setStatus(`Math formula error: ${s instanceof Error?s.message:String(s)}`)}return[[],[e.x,e.ch1],[e.x,e.ch2],[e.x,n]]}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=this.latestFrame===null,s=this.latestFrame!==null&&this.latestFrame.sampleCount!==e.sampleCount;s&&this.resetAveraging(),this.latestFrame=e,this.plot.setData(this.frameData(e),!1),(n||s)&&this.resetZoom(),this.plot.redraw(!0,!0)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resize()}))}resize(){const e=Math.floor(this.plotHost.clientWidth),n=Math.floor(this.plotHost.clientHeight);e<1||n<1||e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(this.timeSettings&&!this.xyMode){const s=this.defaultXMin(),i=s+this.timeSettings.duration,a=Math.max(Number.EPSILON,this.timeSettings.duration/1024),o=Math.min(i-s,Math.max(a,n-e));let l=e,u=e+o;l<s&&(u+=s-l,l=s),u>i&&(l-=u-i,u=i),this.plot.setScale("x",{min:Math.max(s,l),max:Math.min(i,u)});return}this.plot.setScale("x",lm(e,n,this.currentMaxX()))}setYScale(e,n){const s=Math.max(1e-6,n-e);this.plot.setScale("y",{min:e,max:e+s})}resetYScale(){this.plot.setScale("y",{min:va,max:Fi})}minimumXSpan(){return this.timeSettings&&!this.xyMode?Math.max(Number.EPSILON,this.timeSettings.duration/1024):4}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-6,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){if(this.xyMode)return Fi;if(this.timeSettings){const e=this.defaultXMin();return Math.max(e+Number.EPSILON,e+this.timeSettings.duration)}return Math.max(1,(this.latestFrame?.sampleCount??this.sampleCount)-1)}defaultXScale(e){if(this.xyMode)return{min:va,max:Fi};if(this.timeSettings){const n=this.defaultXMin();return{min:n,max:n+this.timeSettings.duration}}return{min:0,max:Math.max(1,e.sampleCount-1)}}defaultXMin(){return this.timeSettings?this.timeSettings.rollingMode?-this.timeSettings.duration:this.timeSettings.triggerSource==="immediately"?0:this.timeSettings.triggerDelay-this.timeSettings.duration/2:0}resetAveraging(){this.averagedData=null,this.currentAverage=0,this.setCurrentAverage(0)}formatTimeTicks(e,n){if(this.xyMode)return n.map(d=>Cc(d,3));const s=Number(e.scales.x.min??n[0]??0),i=Number(e.scales.x.max??n[n.length-1]??s),a=Math.max(Number.EPSILON,Math.abs(i-s)),o=hm(Math.max(Number.EPSILON,this.timeSettings?.duration??a)),l=n.length>1?Math.abs(n[1]-n[0])*o.scale:a*o.scale,u=Math.max(0,Math.min(9,Math.ceil(-Math.log10(Math.max(l,Number.EPSILON)))+1));return n.map(d=>`${Cc(d*o.scale,u)} ${o.suffix}`)}applySeriesVisibility(){this.plot.setSeries(1,{show:this.xyMode||this.channelVisible[0]}),this.plot.setSeries(2,{show:!this.xyMode&&this.channelVisible[1]}),this.plot.setSeries(3,{show:!this.xyMode&&this.mathActive})}}function Jo(t,e,n){return t[e]?.[n]??null}function pm(t,e,n){const s=Jo(t,e,n);if(!s||s.length===0)return null;let i=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY;for(let o=0;o<s.length;o+=1){const l=s[o];Number.isFinite(l)&&(i=Math.min(i,l),a=Math.max(a,l))}return i===Number.POSITIVE_INFINITY?null:{min:i,max:a}}function hm(t){return t<1e-6?{scale:1e9,suffix:"ns"}:t<.001?{scale:1e6,suffix:"us"}:t<1?{scale:1e3,suffix:"ms"}:{scale:1,suffix:"s"}}function Cc(t,e){return Number.isFinite(t)?t.toFixed(e).replace(/\.?0+$/,""):"0"}function Ec(t,e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const i of t)n=Math.min(n,i),s=Math.max(s,i);return{[`${e}Min`]:n===Number.POSITIVE_INFINITY?0:n,[`${e}Max`]:s===Number.NEGATIVE_INFINITY?0:s}}function To(t,e){const n=Math.round(Number.isFinite(e)?e*1e6:0);return t^=n&255,t=Math.imul(t,16777619),t^=n>>8&255,t=Math.imul(t,16777619),t^=n>>16&255,t=Math.imul(t,16777619),t^=n>>24&255,t=Math.imul(t,16777619),t}const Pc=[new Float64Array(0),new Float32Array(0)];class dm{constructor(e,n,s=()=>{},i=16384){this.host=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new Ka(()=>this.openSocket()),this.plot=new Te(this.options("",this.labels),Pc,this.host),this.fftWorker.onmessage=a=>this.handleWorkerResponse(a.data),this.fftWorker.onerror=()=>this.setStatus("Spectrum FFT worker error"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}host;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;retiredSockets=new WeakSet;plot;latestFrame=null;latestCurveFrame=null;latestScopeBuffer=null;pendingFrame=null;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;labels=["Spectrum"];unit="";averagedFrame=null;currentAverage=0;fftWorker=new Worker(new URL("/assets/spectrum-worker-S9qnYzAn.js",import.meta.url),{type:"module"});workerRequestId=0;workerGeneration=0;settings={baseband:!0,span:976562.5,center:0,window:"blackman",displayUnit:"dB(Vpk^2)",displayInput1Baseband:!0,displayInput2Baseband:!0,displayCrossAmplitude:!0,traceAverage:1,runningState:"stopped",iqBandwidth:[]};resizeObserver;resizeListener=()=>this.scheduleResize();setSettings(e){const n={...this.settings,baseband:!!(e.baseband??this.settings.baseband),span:Number(e.span??this.settings.span),center:Number(e.center??this.settings.center),window:String(e.window??this.settings.window),displayUnit:String(e.display_unit??this.settings.displayUnit),displayInput1Baseband:!!(e.display_input1_baseband??this.settings.displayInput1Baseband),displayInput2Baseband:!!(e.display_input2_baseband??this.settings.displayInput2Baseband),displayCrossAmplitude:!!(e.display_cross_amplitude??this.settings.displayCrossAmplitude),traceAverage:Math.max(1,Math.floor(Number(e.trace_average??this.settings.traceAverage))),runningState:String(e.running_state??this.settings.runningState),iqBandwidth:Array.isArray(e.iq_bandwidth)?e.iq_bandwidth.map(Number).filter(Number.isFinite):this.settings.iqBandwidth},s=n.displayUnit!==this.settings.displayUnit,i=n.window!==this.settings.window,a=n.displayInput1Baseband!==this.settings.displayInput1Baseband||n.displayInput2Baseband!==this.settings.displayInput2Baseband||n.displayCrossAmplitude!==this.settings.displayCrossAmplitude;!(this.settings.runningState==="running_single"&&n.runningState==="stopped")&&zc(n)!==zc(this.settings)&&this.resetAveraging(),this.settings=n,i&&this.latestScopeBuffer&&this.showScopeBuffer(this.latestScopeBuffer.slice(0)),(s||a)&&this.averagedFrame&&(this.pendingFrame=Ac(this.averagedFrame,this.settings),this.scheduleRender())}resetAveraging(){this.workerGeneration+=1,this.averagedFrame=null,this.pendingFrame=null,this.currentAverage=0,this.setCurrentAverage(0)}getAverageCount(){return this.currentAverage}getRbw(){return this.latestCurveFrame?.rbw}connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/spectrumanalyzer?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Spectrum stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Spectrum stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.retiredSockets.has(s)||this.setStatus("Spectrum stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Spectrum stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.showScopeBuffer(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e&&(this.retiredSockets.add(e),e.close())}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}showScopeBuffer(e){this.latestScopeBuffer=e.slice(0),this.workerRequestId+=1,this.fftWorker.postMessage({id:this.workerRequestId,generation:this.workerGeneration,buffer:e,settings:{...this.settings,iqBandwidth:[...this.settings.iqBandwidth]}},[e])}handleWorkerResponse(e){if(e.generation!==this.workerGeneration)return;if(e.error||!e.frame){this.setStatus(e.error??"Invalid spectrum frame");return}const n=e.frame,s=this.averageFrame(n);this.setCurrentAverage(this.currentAverage),this.latestCurveFrame=s,this.pendingFrame=Ac(s,this.settings),this.scheduleRender(),this.setStatus(`Spectrum frame ${n.sequence}, ${n.x.length} bins, RBW ${vm(n.rbw)} Hz`)}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),this.resizeObserver.disconnect(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.workerGeneration+=1,this.fftWorker.terminate(),this.plot.destroy()}getSeriesCount(){return this.latestFrame?.series.length??0}getBinCount(){return this.latestFrame?.x.length??0}exportCsv(){if(!this.latestFrame)return`frequency
`;const n=[`frequency,${this.latestFrame.series.map(s=>s.label).join(",")}`];for(let s=0;s<this.latestFrame.x.length;s+=1)n.push([this.latestFrame.x[s],...this.latestFrame.series.map(i=>i.values[s]??"")].join(","));return`${n.join(`
`)}
`}getCurveData(){if(!this.latestCurveFrame)return null;const e=Bu(this.latestCurveFrame.series,this.settings);return{x:Array.from(this.latestCurveFrame.x),series:e.map(n=>({label:n.label,values:Array.from(n.values),...n.imaginary?{imaginary:Array.from(n.imaginary)}:{}})),unit:"Vpk^2"}}getCurveParameters(){return{baseband:this.settings.baseband,span:this.settings.span,center:this.settings.center,window:this.settings.window,display_unit:this.settings.displayUnit,trace_average:this.settings.traceAverage,display_input1_baseband:this.settings.displayInput1Baseband,display_input2_baseband:this.settings.displayInput2Baseband,display_cross_amplitude:this.settings.displayCrossAmplitude}}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}resetZoom(){this.latestFrame&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(this.latestFrame)),this.plot.setScale("y",this.defaultYScale(this.latestFrame))})}zoom(e){const{min:n,max:s}=this.getXRange(),i=(n+s)/2,a=Math.max(this.minimumXSpan(),(s-n)*e);this.setXScale(i-a/2,i+a/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-12,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??-120),max:Number(e.max??20)}}options(e,n){return{width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1},y:{auto:!1}},axes:[vt({label:"Frequency (Hz)"}),vt({label:e})],series:[{},...n.map((s,i)=>({label:s,stroke:i===0?je.green:i===1?je.blue:je.yellow,width:1.4,points:{show:!1}}))]}}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=e.series.map(o=>o.label),s=n.join("\0")!==this.labels.join("\0"),i=e.unit!==this.unit,a=this.latestFrame===null;this.latestFrame=e,s||i?(this.labels=n.length?n:["Spectrum"],this.unit=e.unit,this.plot.destroy(),this.plot=new Te(this.options(e.unit,this.labels),this.frameData(e),this.host),this.bindInteractions(),this.scheduleResize()):this.plot.setData(this.frameData(e),!1),(a||s||i)&&this.resetZoom(),this.plot.redraw(!0,!0)}frameData(e){return e.x.length&&e.series.length?[e.x,...e.series.map(n=>n.values)]:Pc}averageFrame(e){const n=Math.max(1,this.settings.traceAverage),s=this.averagedFrame&&this.averagedFrame.x.length===e.x.length&&this.averagedFrame.series.length===e.series.length&&this.averagedFrame.series.every((l,u)=>l.values.length===e.series[u].values.length&&!!l.imaginary==!!e.series[u].imaginary&&(!l.imaginary||l.imaginary.length===e.series[u].imaginary.length));if(n<=1||!s)return this.averagedFrame=mm(e),this.currentAverage=1,e;const i=Math.min(this.currentAverage+1,n),a=i-1,o=e.series.map((l,u)=>{const d=this.averagedFrame.series[u].values,v=new Float64Array(l.values.length);for(let f=0;f<v.length;f+=1)v[f]=(d[f]*a+l.values[f])/i;let m;if(l.imaginary){const f=this.averagedFrame.series[u].imaginary;m=new Float64Array(l.imaginary.length);for(let y=0;y<m.length;y+=1)m[y]=(f[y]*a+l.imaginary[y])/i}return{label:l.label,values:v,...m?{imaginary:m}:{}}});return this.averagedFrame={...e,x:e.x,series:o},this.currentAverage=i,this.averagedFrame}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=window.requestAnimationFrame(()=>{this.resizeFrame=null;const e=Math.floor(this.host.clientWidth),n=Math.floor(this.host.clientHeight);e<1||n<1||e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(!this.latestFrame)return;const s=this.defaultXScale(this.latestFrame),i=this.minimumXSpan(),a=Math.min(s.max-s.min,Math.max(i,n-e));let o=e,l=e+a;o<s.min&&(l+=s.min-o,o=s.min),l>s.max&&(o-=l-s.max,l=s.max),this.plot.setScale("x",{min:Math.max(s.min,o),max:Math.min(s.max,l)})}setYScale(e,n){const s=Math.max(1e-12,n-e);this.plot.setScale("y",{min:e,max:e+s})}minimumXSpan(){return!this.latestFrame||this.latestFrame.x.length<2?Number.EPSILON:Math.max(Number.EPSILON,Math.abs(this.latestFrame.x[this.latestFrame.x.length-1]-this.latestFrame.x[0])/1024)}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-12,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){return this.latestFrame&&this.latestFrame.x.length?this.latestFrame.x[this.latestFrame.x.length-1]:1}defaultXScale(e){return e.x.length?{min:e.x[0],max:e.x[e.x.length-1]}:{min:0,max:1}}defaultYScale(e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const a of e.series)for(const o of a.values)Number.isFinite(o)&&(n=Math.min(n,o),s=Math.max(s,o));if(n===Number.POSITIVE_INFINITY||s===Number.NEGATIVE_INFINITY)return{min:-120,max:20};const i=Math.max(1e-9,(s-n)*.08);return{min:n-i,max:s+i}}}function fm(t,e,n){const s=new Float64Array(t.length);for(let i=0;i<t.length;i+=1){const a=Math.max(t[i],Number.EPSILON);e==="dB(Vpk^2)"?s[i]=10*Math.log10(a):e==="Vpk"?s[i]=Math.sqrt(a):e==="Vrms^2"?s[i]=a/2:e==="dB(Vrms^2)"?s[i]=10*Math.log10(a/2+Number.EPSILON):e==="Vrms"?s[i]=Math.sqrt(a)/Math.SQRT2:e==="Vrms^2/Hz"?s[i]=a/2/Math.max(n,Number.EPSILON):e==="dB(Vrms^2/Hz)"?s[i]=10*Math.log10(a/2/Math.max(n,Number.EPSILON)+Number.EPSILON):e==="Vrms/sqrt(Hz)"?s[i]=Math.sqrt(a)/Math.SQRT2/Math.max(n,Number.EPSILON):s[i]=a}return s}function mm(t){return{...t,x:t.x,series:t.series.map(e=>({label:e.label,values:new Float64Array(e.values),...e.imaginary?{imaginary:new Float64Array(e.imaginary)}:{}}))}}function Ac(t,e){const n=Bu(t.series,e);return{...t,unit:e.displayUnit,series:n.map(s=>({label:s.label,values:fm(s.imaginary?gm(s.values,s.imaginary):s.values,e.displayUnit,t.rbw)}))}}function zc(t){return[t.baseband,t.span,t.center,t.window,t.iqBandwidth.join(",")].join("|")}function Bu(t,e){return e.baseband?t.filter(n=>n.label==="Input 1"?e.displayInput1Baseband:n.label==="Input 2"?e.displayInput2Baseband:n.label==="Cross"?e.displayCrossAmplitude:!0):t}function gm(t,e){const n=new Float64Array(t.length);for(let s=0;s<n.length;s+=1)n[s]=Math.hypot(t[s],e[s]);return n}function vm(t){return Number.isFinite(t)?Math.abs(t)>=1e3?t.toExponential(3):t.toFixed(3):"0"}const _c=[new Float64Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0)],bm=[{name:"complex_poles",label:"Complex Poles",kind:"pole",complex:!0},{name:"complex_zeros",label:"Complex Zeros",kind:"zero",complex:!0},{name:"real_poles",label:"Real Poles",kind:"pole",complex:!1},{name:"real_zeros",label:"Real Zeros",kind:"zero",complex:!1}];class wm{constructor(e,n,s,i=()=>!0,a=()=>({})){this.host=e,this.setAttribute=n,this.setStatus=s,this.canEditHardware=i,this.viewSettings=a,this.host.innerHTML=`
      <div class="iir-plot-toolbar">
        <button id="iir-zoom-reset" type="button">Reset</button>
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
      <div class="iir-list-grid"></div>
    `;const o=this.host.querySelector('[data-iir-plot="magnitude"]'),l=this.host.querySelector('[data-iir-plot="phase"]');if(!o||!l)throw new Error("Missing IIR plot hosts");this.magnitudeHost=o,this.phaseHost=l,this.magnitudePlot=new Te(this.options("Magnitude (dB)","dB"),_c,o),this.phasePlot=new Te(this.options("Phase (deg)","deg"),_c,l),this.installPlotEvents(this.magnitudePlot),this.installPlotEvents(this.phasePlot),this.host.querySelector("#iir-zoom-reset")?.addEventListener("click",()=>this.resetZoom()),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),this.scheduleResize()}host;setAttribute;setStatus;canEditHardware;viewSettings;magnitudePlot;phasePlot;magnitudeHost;phaseHost;latest=null;refreshRevision=0;selectedKey=null;resizeFrame=null;resizeObserver=null;clickTimer=null;markerDrag=null;panState=null;zoomState=null;userView=!1;suppressNextClick=!1;windowMouseMove=e=>{const n=this.panState?.plot??this.zoomState?.plot;n&&this.handlePointerMove(n,e)};windowMouseUp=()=>{const e=this.panState?.plot??this.zoomState?.plot;e&&this.endMouseInteraction(e)};async refresh(){const e=++this.refreshRevision,n=new URLSearchParams(Object.entries(this.viewSettings()).map(([_,k])=>[_,String(k)])),s=await fetch(`/api/modules/iir/plot?${n}`);if(!s.ok)throw new Error(`IIR plot unavailable: ${s.status}`);const i=await s.json();if(e!==this.refreshRevision)return;this.latest=i;const a=Float64Array.from(this.latest.x,_=>Math.log10(Math.max(_,Number.MIN_VALUE))),o=Float32Array.from(this.latest.magnitude),l=Float32Array.from(this.latest.phase),u=Us(this.latest.data_magnitude),d=Us(this.latest.data_phase),v=Us(this.latest.product_magnitude),m=Us(this.latest.product_phase),f=Us(this.latest.measurement_magnitude),y=Us(this.latest.measurement_phase),P=!this.userView||this.magnitudePlot.data[0].length===0;this.magnitudePlot.setData([a,o,u,v,f],!1),this.phasePlot.setData([a,l,d,m,y],!1),P?this.applyDefaultScales():this.linkXScale(this.getXRange()),this.renderMarkers(),this.renderListEditors();const R=this.host.closest(".module-panel")?.querySelector("#iir-data-curve-name");R&&(R.value=this.latest.data_curve_name);const F=this.latest.data_curve_name?` | ${this.latest.data_curve_name}`:"";this.plotStatus().textContent=`${this.latest.tf_type} | ${this.latest.markers.length} pole/zero marker(s)${F}`}destroy(){this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.removeWindowMouseCapture(),this.resizeObserver?.disconnect(),this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.resizeFrame!==null&&cancelAnimationFrame(this.resizeFrame)}options(e,n){return{width:360,height:220,title:e,cursor:{drag:{x:!1,y:!1,setScale:!1}},scales:{x:{time:!1},y:{auto:!1}},axes:[vt({label:"Frequency",values:(s,i)=>i.map(a=>Ro(10**a))}),vt({label:n})],series:[{},{label:"Filter design",stroke:je.yellow,width:2},{label:"Data curve",stroke:je.green,width:1.5},{label:"Data x filter",stroke:je.red,width:1.5},{label:"Measurement",stroke:je.orange,width:0,points:{show:!0,size:4,width:1,stroke:je.orange}}],hooks:{draw:[()=>this.renderMarkers()]}}}installPlotEvents(e){const n=e.root;n.addEventListener("contextmenu",i=>i.preventDefault(),{capture:!0}),n.addEventListener("wheel",i=>{i.preventDefault();const a=Math.exp(i.deltaY/500);this.zoomAroundPointer(e,i,a,a)},{passive:!1}),n.addEventListener("pointerdown",i=>{this.startMouseNavigation(e,i)&&n.setPointerCapture(i.pointerId)},{capture:!0}),n.addEventListener("pointermove",i=>this.handlePointerMove(e,i),{capture:!0});const s=i=>this.endPointerInteraction(e,i);n.addEventListener("pointerup",s,{capture:!0}),n.addEventListener("pointercancel",s,{capture:!0}),n.addEventListener("mousedown",i=>{!this.panState&&!this.zoomState&&this.startMouseNavigation(e,i)},{capture:!0}),n.addEventListener("dblclick",i=>{this.clickTimer!==null&&(window.clearTimeout(this.clickTimer),this.clickTimer=null),this.handlePlotClick(e,i,!0).catch(a=>this.setStatus(a.message))}),n.addEventListener("click",i=>{if(this.suppressNextClick){this.suppressNextClick=!1;return}i.detail>1||(this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.clickTimer=window.setTimeout(()=>{this.clickTimer=null,this.handlePlotClick(e,i,!1).catch(a=>this.setStatus(a.message))},220))}),n.addEventListener("mousemove",i=>{this.markerDrag?this.moveDraggedMarker(i):(!this.panState&&!this.zoomState&&i.buttons&&this.startMouseMoveNavigation(e,i),this.handlePointerMove(e,i))},{capture:!0}),n.addEventListener("mouseup",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)},{capture:!0}),n.addEventListener("mouseleave",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)})}async handlePlotClick(e,n,s){if(!this.latest||n.defaultPrevented)return;const i=this.frequencyFromEvent(e,n);if(!(!this.canEditHardware()&&(n.ctrlKey||n.metaKey||n.shiftKey)))if(n.ctrlKey||n.metaKey)await this.addMarker("poles",i,s);else if(n.shiftKey)await this.addMarker("zeros",i,s);else{const a=this.nearestMarker(i);a&&(this.selectedKey=Io(a),this.renderMarkers(),this.renderListEditors())}}async addMarker(e,n,s){if(this.latest){if(s){const i=e==="poles"?"complex_poles":"complex_zeros",a=[...this.latest.state[i],Fc(-n/10,n)];await this.setAttribute(i,a)}else{const i=e==="poles"?"real_poles":"real_zeros",a=[...this.latest.state[i],-n];await this.setAttribute(i,a)}await this.refresh()}}renderMarkers(){this.latest&&(this.renderMarkersForPlot(this.magnitudePlot,"magnitude"),this.renderMarkersForPlot(this.phasePlot,"phase"))}renderMarkersForPlot(e,n){const s=Array.from(e.over.querySelectorAll(".iir-marker"));for(const i of s)i.remove();for(const i of this.latest?.markers??[]){const a=Math.max(i.frequency,Number.MIN_VALUE),o=e.valToPos(Math.log10(a),"x"),l=e.valToPos(n==="magnitude"?i.magnitude:i.phase,"y");if(!Number.isFinite(o)||!Number.isFinite(l))continue;const u=document.createElement("button");u.type="button",u.className=`iir-marker is-${i.kind} is-${i.shape}`,u.classList.toggle("is-selected",this.selectedKey===Io(i)),u.style.left=`${o}px`,u.style.top=`${l}px`,u.title=`${i.list}[${i.index}] ${Ro(i.frequency)}`,u.textContent=i.kind==="pole"?"x":"o",u.addEventListener("mousedown",d=>{d.preventDefault(),d.stopPropagation(),this.canEditHardware()&&(this.selectedKey=Io(i),this.markerDrag={marker:i,plot:e},u.classList.add("is-dragging"),this.renderListEditors())}),u.addEventListener("pointerdown",d=>d.stopPropagation()),e.over.appendChild(u)}}renderListEditors(){const e=this.host.querySelector(".iir-list-grid");if(!(!e||!this.latest)){e.textContent="";for(const n of bm){const s=[...this.latest.state[n.name]],i=document.createElement("section");i.className="iir-list-editor",i.dataset.list=n.name;const a=document.createElement("header"),o=document.createElement("span");o.textContent=n.label;const l=document.createElement("input");l.type="number",l.min="0",l.max="64",l.step="1",l.value=String(s.length),l.id=`iir-${n.name.replaceAll("_","-")}-count`,l.addEventListener("change",()=>{this.setListCount(n.name,Number(l.value)).catch(f=>this.setStatus(f.message))});const u=document.createElement("button");u.type="button",u.textContent="+",u.title=`Add ${n.label.slice(0,-1).toLowerCase()}`,u.addEventListener("click",()=>{this.appendListValue(n.name).catch(f=>this.setStatus(f.message))});const d=document.createElement("button");d.type="button",d.textContent="-",d.title=`Remove selected ${n.label.slice(0,-1).toLowerCase()}`,d.disabled=s.length===0,d.addEventListener("click",()=>{this.removeListValue(n.name).catch(f=>this.setStatus(f.message))}),a.append(o,l,u,d),i.appendChild(a);const v=document.createElement("input");v.type="text",v.id=`iir-${n.name.replaceAll("_","-")}`,v.value=s.join(", "),v.addEventListener("change",()=>{const f=n.complex?Ic(v.value):Ic(v.value).map(Number);this.setList(n.name,f).catch(y=>this.setStatus(y.message))}),i.appendChild(v);const m=document.createElement("div");m.className="iir-list-values",s.forEach((f,y)=>{const P=document.createElement("label");P.className="iir-list-value";const R=`${n.name}:${y}`;P.classList.toggle("is-selected",this.selectedKey===R);const F=document.createElement("span");F.textContent=String(y);const _=document.createElement("input");_.type=n.complex?"text":"number",_.step="any",_.value=String(f),_.addEventListener("focus",()=>{this.selectedKey=R,this.renderMarkers(),this.renderListEditors()}),_.addEventListener("change",()=>{const k=[...this.latest.state[n.name]];k[y]=n.complex?_.value:Number(_.value),this.setList(n.name,k).catch(D=>this.setStatus(D.message))}),P.append(F,_),m.appendChild(P)}),i.appendChild(m),e.appendChild(i)}}}async appendListValue(e){if(!this.latest)return;const n=[...this.latest.state[e],Tc(e)];await this.setList(e,n)}async removeListValue(e){if(!this.latest)return;const n=[...this.latest.state[e]],s=this.selectedKey?.startsWith(`${e}:`)?Number(this.selectedKey.split(":")[1]):n.length-1;s>=0&&s<n.length&&(n.splice(s,1),this.selectedKey=null,await this.setList(e,n))}async setListCount(e,n){if(!this.latest)return;const s=Math.max(0,Math.min(64,Math.round(Number.isFinite(n)?n:0))),i=[...this.latest.state[e]];for(;i.length<s;)i.push(Tc(e));i.length=s,await this.setList(e,i)}async setList(e,n){this.canEditHardware()&&(await this.setAttribute(e,n),await this.refresh())}moveDraggedMarker(e){const n=this.markerDrag;if(!n)return;const s=this.frequencyFromEvent(n.plot,e);this.plotStatus().textContent=`drag ${n.marker.list}[${n.marker.index}] to ${Ro(s)}`}async finishDraggedMarker(e){const n=this.markerDrag;if(this.markerDrag=null,!n||!this.latest)return;const s=this.frequencyFromEvent(n.plot,e),i=n.marker;if(i.list==="real_poles"||i.list==="real_zeros"){const a=[...this.latest.state[i.list]];a[i.index]=-s,await this.setAttribute(i.list,a)}else{const a=[...this.latest.state[i.list]],o=xm(String(a[i.index]));a[i.index]=Fc(o.real,s),await this.setAttribute(i.list,a)}await this.refresh()}nearestMarker(e){if(!this.latest?.markers.length)return null;let n=this.latest.markers[0],s=1/0;for(const i of this.latest.markers){const a=Math.max(i.frequency,e)/Math.max(Number.MIN_VALUE,Math.min(i.frequency,e));a<s&&(n=i,s=a)}return n}frequencyFromEvent(e,n){const s=e.over.getBoundingClientRect(),i=Math.max(0,Math.min(s.width,n.clientX-s.left));return 10**Number(e.posToVal(i,"x"))}resetZoom(){this.latest&&(this.userView=!1,this.applyDefaultScales(),this.renderMarkers())}getXRange(){const e=this.magnitudePlot.scales.x;return{min:Number(e.min??this.defaultXScale().min),max:Number(e.max??this.defaultXScale().max)}}getMagnitudeYRange(){return this.getYRange(this.magnitudePlot)}getPhaseYRange(){return this.getYRange(this.phasePlot)}handlePointerMove(e,n){if(this.panState?.plot===e){const s=Math.max(1,e.bbox.width/(devicePixelRatio||1)),i=Math.max(1,e.bbox.height/(devicePixelRatio||1)),a=n.clientX-this.panState.startX,o=n.clientY-this.panState.startY;this.panState.moved||=Math.abs(a)>3||Math.abs(o)>3;const l=this.panState.xMax-this.panState.xMin,u=this.panState.yMax-this.panState.yMin,d=a/s*l,v=o/i*u;this.setXScale(this.panState.xMin-d,this.panState.xMax-d),this.setYScale(e,this.panState.yMin+v,this.panState.yMax+v)}else if(this.zoomState?.plot===e){const s=n.clientX-this.zoomState.startX,i=n.clientY-this.zoomState.startY;this.zoomState.moved||=Math.abs(s)>3||Math.abs(i)>3;const a=Math.exp(-s/260),o=Math.exp(i/260);this.zoomAroundStartScale(e,this.zoomState,a,o)}}startMouseNavigation(e,n){if(n.target.closest(".iir-marker")||n.ctrlKey||n.metaKey||n.shiftKey)return!1;const{min:s,max:i}=this.getXRange(),{min:a,max:o}=this.getYRange(e);return n.button===0?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture(),!0):n.button===1||n.button===2?(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture(),!0):!1}startMouseMoveNavigation(e,n){(n.buttons&1)===1?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture()):((n.buttons&2)===2||(n.buttons&4)===4)&&(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture())}getXRangeAsStart(e){const{min:n,max:s}=this.getXRange(),{min:i,max:a}=this.getYRange(e);return{xMin:n,xMax:s,yMin:i,yMax:a}}endPointerInteraction(e,n){const s=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;if(this.panState?.plot===e||this.zoomState?.plot===e){try{e.root.releasePointerCapture(n.pointerId)}catch{}this.userView||=!!s,this.suppressNextClick||=!!s}this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}endMouseInteraction(e){const n=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;this.userView||=!!n,this.suppressNextClick||=!!n,this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}addWindowMouseCapture(){window.addEventListener("mousemove",this.windowMouseMove),window.addEventListener("mouseup",this.windowMouseUp)}removeWindowMouseCapture(){window.removeEventListener("mousemove",this.windowMouseMove),window.removeEventListener("mouseup",this.windowMouseUp)}zoomAroundPointer(e,n,s,i){const a=e.over.getBoundingClientRect(),o=Math.max(0,Math.min(a.width,n.clientX-a.left)),l=Math.max(0,Math.min(a.height,n.clientY-a.top)),u=Number(e.posToVal(o,"x")),d=Number(e.posToVal(l,"y")),{min:v,max:m}=this.getXRange(),{min:f,max:y}=this.getYRange(e),P=(u-v)/Math.max(Number.EPSILON,m-v),R=(d-f)/Math.max(Number.EPSILON,y-f),F=Math.max(this.minimumXSpan(),(m-v)*s),_=Math.max(1e-12,(y-f)*i);this.setXScale(u-F*P,u+F*(1-P)),this.setYScale(e,d-_*R,d+_*(1-R)),this.userView=!0}zoomAroundStartScale(e,n,s,i){const a=(n.xMin+n.xMax)/2,o=(n.yMin+n.yMax)/2,l=Math.max(this.minimumXSpan(),(n.xMax-n.xMin)*s),u=Math.max(1e-12,(n.yMax-n.yMin)*i);this.setXScale(a-l/2,a+l/2),this.setYScale(e,o-u/2,o+u/2)}setXScale(e,n){const s=this.defaultXScale(),i=Math.min(s.max-s.min,Math.max(this.minimumXSpan(),n-e));let a=e,o=e+i;a<s.min&&(o+=s.min-a,a=s.min),o>s.max&&(a-=o-s.max,o=s.max),this.linkXScale({min:Math.max(s.min,a),max:Math.min(s.max,o)})}setYScale(e,n,s){const i=Math.max(1e-12,s-n);e.setScale("y",{min:n,max:n+i}),this.renderMarkers()}linkXScale(e){this.magnitudePlot.setScale("x",e),this.phasePlot.setScale("x",e),this.renderMarkers()}getYRange(e){const n=e.scales.y,s=e===this.magnitudePlot?this.yScale(Float32Array.from(this.latest?.magnitude??[])):this.yScale(Float32Array.from(this.latest?.phase??[]));return{min:Number(n.min??s.min),max:Number(n.max??s.max)}}applyDefaultScales(){if(!this.latest)return;const e=this.defaultXScale();this.magnitudePlot.batch(()=>{this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",this.yScale(Float32Array.from(this.latest.magnitude)))}),this.phasePlot.batch(()=>{this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",this.yScale(Float32Array.from(this.latest.phase)))})}defaultXScale(){const e=this.latest?.x??[],n=e.length?Math.max(Number.MIN_VALUE,e[0]):10,s=e.length?Math.max(n*1.000001,e[e.length-1]):5e6;return{min:Math.log10(n),max:Math.log10(s)}}minimumXSpan(){const{min:e,max:n}=this.defaultXScale();return Math.max(Number.EPSILON,(n-e)/1024)}yScale(e){if(!e.length)return{min:-260,max:20};let n=1/0,s=-1/0;for(const a of e)Number.isFinite(a)&&(n=Math.min(n,a),s=Math.max(s,a));if(!Number.isFinite(n)||!Number.isFinite(s))return{min:-260,max:20};Math.abs(s-n)<1e-9&&(n-=1,s+=1);const i=(s-n)*.1;return{min:n-i,max:s+i}}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=Lc(this.magnitudeHost),n=Lc(this.phaseHost);!e||!n||(this.magnitudePlot.setSize(e),this.phasePlot.setSize(n),this.renderMarkers())}))}plotStatus(){const e=this.host.querySelector(".iir-plot-status");if(!e)throw new Error("Missing IIR plot status");return e}}function Lc(t){const e=t.getBoundingClientRect(),n=Math.floor(e.width),s=Math.floor(e.height);return n<40||s<40?null:{width:n,height:s}}function Us(t){return Float32Array.from(t,e=>e===null?Number.NaN:e)}function Io(t){return`${t.list}:${t.index}`}function Fc(t,e){return`${Vi(t)}+${Vi(Math.abs(e))}j`}function Tc(t){return t.startsWith("complex")?"-1000+10000j":-1e4}function Ic(t){return t.split(",").map(e=>e.trim()).filter(Boolean)}function xm(t){const n=t.trim().replace("i","j").match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]\d+(?:\.\d+)?(?:e[+-]?\d+)?)j$/i);return n?{real:Number(n[1]??0),imag:Number(n[2])}:{real:-1,imag:1}}function Vi(t){return Number(t.toPrecision(8)).toString()}function Ro(t){return t>=1e6?`${Vi(t/1e6)} MHz`:t>=1e3?`${Vi(t/1e3)} kHz`:`${Vi(t)} Hz`}let ym=0;class Sm{constructor(e){this.elements=e,this.resizeObserver=new ResizeObserver(()=>this.scheduleLayoutRefresh()),this.resizeObserver.observe(e.inputPlot),this.resizeObserver.observe(e.outputPlot),e.classSelect.addEventListener("change",()=>{this.setClass(e.classSelect.value).catch(n=>{this.setStatus(n.message)})}),e.addStage.addEventListener("click",()=>{this.requestSchema("/api/lockbox/stages",{method:"POST"}).catch(n=>{this.setStatus(n.message)})}),e.inputPlotSelect.addEventListener("change",()=>{this.refreshInputPlot().catch(n=>this.setStatus(n.message))}),e.outputPlotSelect.addEventListener("change",()=>{this.refreshOutputPlot().catch(n=>this.setStatus(n.message))})}elements;schema=null;inputPlot=null;outputMagnitudePlot=null;outputPhasePlot=null;resizeObserver;resizeFrame=null;stageLayoutWidth=0;stageHeight=0;async load(){const[e,n]=await Promise.all([fetch("/api/lockbox"),fetch("/api/lockbox/actions")]);if(!e.ok||!n.ok)throw new Error("Lockbox controls unavailable");const s=await e.json(),i=await n.json();this.renderActions(i.actions??[]),await this.applySchema(s)}async applySchema(e){this.schema=e,e.actions&&this.renderActions(e.actions),this.populateClassSelect(e),this.renderLockboxAttributes(e.attributes),this.renderInputs(e.inputs),this.renderOutputs(e.outputs),this.renderStages(e.sequence),this.populatePlotSelect(this.elements.inputPlotSelect,e.inputs.map(n=>n.name)),this.populatePlotSelect(this.elements.outputPlotSelect,e.outputs.map(n=>n.name)),this.setStatus(`${e.classname}: ${e.state.current_state??"ready"} | ${e.state.lock_status?"locked":"not locked"}`),await Promise.all([this.refreshInputPlot(),this.refreshOutputPlot()]),this.scheduleLayoutRefresh()}refreshLayout(){this.inputPlot&&this.fitPlotToHost(this.inputPlot,this.elements.inputPlot);const e=this.elements.outputPlot.querySelectorAll(".lockbox-output-plot-frame");e[0]&&this.outputMagnitudePlot&&this.fitPlotToHost(this.outputMagnitudePlot,e[0]),e[1]&&this.outputPhasePlot&&this.fitPlotToHost(this.outputPhasePlot,e[1]),this.equalizeStageHeights()}getStageCount(){return this.schema?.sequence.length??0}getClassname(){return this.schema?.classname??null}populateClassSelect(e){const s=e.attributes.find(i=>i.name==="classname")?.options??[e.classname];this.elements.classSelect.textContent="";for(const i of s){const a=document.createElement("option");a.value=String(i),a.textContent=String(i),this.elements.classSelect.appendChild(a)}this.elements.classSelect.value=e.classname}populatePlotSelect(e,n){const s=e.value;e.textContent="";for(const i of n){const a=document.createElement("option");a.value=i,a.textContent=i,e.appendChild(a)}e.value=n.includes(s)?s:n[0]??""}renderActions(e){this.elements.actions.textContent="";for(const n of e){const s=document.createElement("button");s.type="button",s.textContent=n.label??n.name,s.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/actions/${n.name}`,{method:"POST"}).catch(i=>{this.setStatus(i.message)})}),this.elements.actions.appendChild(s)}}renderLockboxAttributes(e){const n=this.elements.root.querySelector("#lockbox-attributes");if(n){n.textContent="";for(const s of e)s.name!=="classname"&&n.appendChild(this.createAttributeField(s,i=>this.requestSchema(`/api/lockbox/attributes/${s.name}`,this.valueRequest(i))))}}renderInputs(e){this.elements.inputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"input");s.dataset.nodeName=n.name;const i=document.createElement("button");i.type="button",i.textContent="Calibrate",i.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/actions/calibrate`,{method:"POST"}).catch(o=>this.setStatus(o.message))}),s.querySelector(".lockbox-card-title")?.appendChild(i);const a=document.createElement("div");a.className="lockbox-control-row";for(const o of n.attributes)a.appendChild(this.createAttributeField(o,l=>this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/attributes/${o.name}`,this.valueRequest(l))));if(s.appendChild(a),n.calibration){const o=document.createElement("output");o.textContent=Object.entries(n.calibration).filter(([,l])=>typeof l=="number").slice(0,4).map(([l,u])=>`${l} ${Number(u).toPrecision(3)}`).join(" | "),s.appendChild(o)}this.elements.inputs.appendChild(s)}}renderOutputs(e){this.elements.outputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"output");s.dataset.nodeName=n.name;const i=document.createElement("div");i.className="lockbox-control-row";const a=!!n.attributes.find(l=>l.name==="assisted_design")?.value,o=String(n.attributes.find(l=>l.name==="tf_type")?.value??"filter");for(const l of n.attributes){const u=this.createAttributeField(l,d=>this.requestSchema(`/api/lockbox/outputs/${encodeURIComponent(n.name)}/attributes/${l.name}`,this.valueRequest(d)));["p","i"].includes(l.name)&&this.setFieldDisabled(u,a),["desired_unity_gain_frequency","analog_filter_cutoff"].includes(l.name)&&this.setFieldDisabled(u,!a),l.name==="tf_curve"&&this.setFieldDisabled(u,o!=="curve"),i.appendChild(u)}s.appendChild(i),this.elements.outputs.appendChild(s)}}renderStages(e){this.elements.stages.textContent="",this.stageLayoutWidth=0,this.stageHeight=0,this.elements.stages.style.removeProperty("--lockbox-stage-height"),e.forEach((n,s)=>{const i=this.createSectionCard(n.name,`stage ${s}`);i.classList.add("lockbox-stage-card");const a=document.createElement("button");a.type="button",a.textContent="Delete",a.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}`,{method:"DELETE"}).catch(v=>{this.setStatus(v.message)})});const o=document.createElement("button");o.type="button",o.textContent="Go to this stage",o.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}/actions/execute`,{method:"POST"}).catch(v=>this.setStatus(v.message))});const l=document.createElement("div");l.className="lockbox-card-actions",l.append(o,a),i.querySelector(".lockbox-card-title")?.appendChild(l);const u=document.createElement("div");u.className="lockbox-control-row";for(const v of n.attributes)u.appendChild(this.createAttributeField(v,m=>this.requestSchema(`/api/lockbox/stages/${s}/attributes/${v.name}`,this.valueRequest(m))));i.appendChild(u);const d=document.createElement("div");d.className="lockbox-stage-output-grid";for(const v of n.outputs){const m=document.createElement("section");m.className="lockbox-stage-output";const f=document.createElement("h4");f.textContent=v.output,m.appendChild(f);for(const y of v.attributes)m.appendChild(this.createAttributeField(y,P=>this.requestSchema(`/api/lockbox/stages/${s}/outputs/${encodeURIComponent(v.output)}/attributes/${y.name}`,this.valueRequest(P))));d.appendChild(m)}i.appendChild(d),this.elements.stages.appendChild(i)})}equalizeStageHeights(){const e=Array.from(this.elements.stages.querySelectorAll(".lockbox-stage-card")),n=Math.floor(this.elements.stages.getBoundingClientRect().width);if(e.length===0||n<1||n===this.stageLayoutWidth&&this.stageHeight>0)return;this.elements.stages.style.removeProperty("--lockbox-stage-height");const s=Math.ceil(Math.max(...e.map(i=>i.getBoundingClientRect().height)));s<1||(this.elements.stages.style.setProperty("--lockbox-stage-height",`${s}px`),this.stageLayoutWidth=n,this.stageHeight=s)}createSectionCard(e,n){const s=document.createElement("section");s.className="lockbox-card";const i=document.createElement("header");i.className="lockbox-card-title";const a=document.createElement("h3");a.textContent=e;const o=document.createElement("span");return o.textContent=n,i.append(a,o),s.appendChild(i),s}createAttributeField(e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");for(const l of e.options??[]){const u=document.createElement("option");u.value=String(l),u.textContent=String(l),o.appendChild(u)}o.value=String(e.value),o.addEventListener("change",()=>{const l=this.selectValue(o.value,e.options??[]);n(l).catch(u=>this.setStatus(u.message))}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{n(o.checked).catch(l=>this.setStatus(l.message))}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",o.value=String(e.value),e.min!==void 0&&(o.min=String(e.min)),e.max!==void 0&&(o.max=String(e.max)),e.step!==void 0&&(o.step=String(e.step)),o.addEventListener("change",()=>{n(Number(o.value)).catch(l=>this.setStatus(l.message))}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Array.isArray(e.value)?e.value.join(", "):String(e.value??""),o.addEventListener("change",()=>{n(this.textValue(o.value)).catch(l=>this.setStatus(l.message))}),a=o}return a.id=`lockbox-${e.name.replaceAll("_","-")}-${++ym}`,s.appendChild(a),s}setFieldDisabled(e,n){const s=e.querySelector("input, select");s&&(s.disabled=n),e.classList.toggle("is-disabled",n)}selectValue(e,n){return n.find(i=>String(i)===e)??e}textValue(e){const n=e.split(",").map(s=>s.trim()).filter(Boolean);return n.length>1&&n.every(s=>Number.isFinite(Number(s)))?n.map(s=>Number(s)):e}valueRequest(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:e})}}async setClass(e){await this.requestSchema("/api/lockbox/class",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({classname:e})})}async requestSchema(e,n){const s=await fetch(e,n);if(!s.ok)throw new Error(`Lockbox request failed: ${s.status}`);await this.applySchema(await s.json())}async refreshInputPlot(){const e=this.schema?.inputs.find(i=>i.name===this.elements.inputPlotSelect.value)??this.schema?.inputs[0];if(!e)return;const n=await fetch(`/api/lockbox/inputs/${encodeURIComponent(e.name)}/plot`);if(!n.ok)return;const s=await n.json();this.drawInputPlot(this.elements.inputPlot,"Expected Signal",s)}async refreshOutputPlot(){const e=this.schema?.outputs.find(i=>i.name===this.elements.outputPlotSelect.value)??this.schema?.outputs[0];if(!e)return;const n=await fetch(`/api/lockbox/outputs/${encodeURIComponent(e.name)}/transfer_function`);if(!n.ok)return;const s=await n.json();this.drawOutputPlot(this.elements.outputPlot,s)}drawInputPlot(e,n,s){this.inputPlot?.destroy(),e.textContent="";const i=this.plotSize(e),a=new Te({title:n,width:i.width,height:i.height,scales:{x:{time:!1}},series:[{},...s.series.map((o,l)=>({label:o.label,stroke:l===0?je.green:je.blue,width:2}))],axes:[vt(),vt()]},[s.x,...s.series.map(o=>o.values)],e);this.inputPlot=a}drawOutputPlot(e,n){this.outputMagnitudePlot?.destroy(),this.outputPhasePlot?.destroy(),e.textContent="";const s=document.createElement("div"),i=document.createElement("div");s.className="lockbox-output-plot-frame",i.className="lockbox-output-plot-frame",e.append(s,i),this.resizeObserver.observe(s),this.resizeObserver.observe(i);const a=n.series.find(l=>l.label==="magnitude")?.values??[],o=n.series.find(l=>l.label==="phase")?.values??[];this.outputMagnitudePlot=new Te({title:"Open-loop magnitude",...this.outputPlotOptions(this.plotSize(s),!0),series:[{},{label:"magnitude",stroke:je.green,width:2}]},[n.x,a.map(l=>Math.max(1e-30,l))],s),this.outputPhasePlot=new Te({title:"Open-loop phase",...this.outputPlotOptions(this.plotSize(i),!1),series:[{},{label:"phase",stroke:je.blue,width:2}]},[n.x,o],i),this.scheduleLayoutRefresh()}outputPlotOptions(e,n){return{width:e.width,height:e.height,scales:{x:{time:!1,distr:3},y:n?{distr:3}:{auto:!0}},axes:[vt(),vt()]}}plotSize(e){const n=e.getBoundingClientRect();return{width:Math.floor(n.width)||420,height:Math.floor(n.height)||224}}fitPlotToHost(e,n){const s=n.getBoundingClientRect();if(s.width<1||s.height<1)return;const i=e.root.querySelector(".u-wrap")?.getBoundingClientRect(),a=Math.max(0,Math.ceil(e.root.getBoundingClientRect().height-(i?.height??0)));e.setSize({width:Math.floor(s.width),height:Math.max(80,Math.floor(s.height)-a)})}scheduleLayoutRefresh(){if(this.resizeFrame!==null)return;let e=3;const n=()=>{this.resizeFrame=requestAnimationFrame(()=>{this.elements.root.hidden||this.refreshLayout(),e-=1,e>0?n():this.resizeFrame=null})};n()}setStatus(e){this.elements.status.textContent=e}}var Rt=typeof window<"u"?window:null,Tr=Rt===null,Wi=Tr?void 0:Rt.document,Ut="addEventListener",Xt="removeEventListener",No="getBoundingClientRect",Ti="_a",Gt="_b",Sn="_c",ba="horizontal",Kt=function(){return!1},km=Tr?"calc":["","-webkit-","-moz-","-o-"].filter(function(t){var e=Wi.createElement("div");return e.style.cssText="width:"+t+"calc(9px)",!!e.style.length}).shift()+"calc",qu=function(t){return typeof t=="string"||t instanceof String},Rc=function(t){if(qu(t)){var e=Wi.querySelector(t);if(!e)throw new Error("Selector "+t+" did not match a DOM element");return e}return t},ot=function(t,e,n){var s=t[e];return s!==void 0?s:n},wa=function(t,e,n,s){if(e){if(s==="end")return 0;if(s==="center")return t/2}else if(n){if(s==="start")return 0;if(s==="center")return t/2}return t},Mm=function(t,e){var n=Wi.createElement("div");return n.className="gutter gutter-"+e,n},Cm=function(t,e,n){var s={};return qu(e)?s[t]=e:s[t]=km+"("+e+"% - "+n+"px)",s},Em=function(t,e){var n;return n={},n[t]=e+"px",n},ea=function(t,e){if(e===void 0&&(e={}),Tr)return{};var n=t,s,i,a,o,l,u;Array.from&&(n=Array.from(n));var d=Rc(n[0]),v=d.parentNode,m=getComputedStyle?getComputedStyle(v):null,f=m?m.flexDirection:null,y=ot(e,"sizes")||n.map(function(){return 100/n.length}),P=ot(e,"minSize",100),R=Array.isArray(P)?P:n.map(function(){return P}),F=ot(e,"maxSize",1/0),_=Array.isArray(F)?F:n.map(function(){return F}),k=ot(e,"expandToMin",!1),D=ot(e,"gutterSize",10),z=ot(e,"gutterAlign","center"),K=ot(e,"snapOffset",30),$=Array.isArray(K)?K:n.map(function(){return K}),te=ot(e,"dragInterval",1),X=ot(e,"direction",ba),ie=ot(e,"cursor",X===ba?"col-resize":"row-resize"),Q=ot(e,"gutter",Mm),L=ot(e,"elementStyle",Cm),ne=ot(e,"gutterStyle",Em);X===ba?(s="width",i="clientX",a="left",o="right",l="clientWidth"):X==="vertical"&&(s="height",i="clientY",a="top",o="bottom",l="clientHeight");function q(T,S,C,V){var ke=L(s,S,C,V);Object.keys(ke).forEach(function(ue){T.style[ue]=ke[ue]})}function Z(T,S,C){var V=ne(s,S,C);Object.keys(V).forEach(function(ke){T.style[ke]=V[ke]})}function Y(){return u.map(function(T){return T.size})}function oe(T){return"touches"in T?T.touches[0][i]:T[i]}function j(T){var S=u[this.a],C=u[this.b],V=S.size+C.size;S.size=T/this.size*V,C.size=V-T/this.size*V,q(S.element,S.size,this[Gt],S.i),q(C.element,C.size,this[Sn],C.i)}function it(T){var S,C=u[this.a],V=u[this.b];this.dragging&&(S=oe(T)-this.start+(this[Gt]-this.dragOffset),te>1&&(S=Math.round(S/te)*te),S<=C.minSize+C.snapOffset+this[Gt]?S=C.minSize+this[Gt]:S>=this.size-(V.minSize+V.snapOffset+this[Sn])&&(S=this.size-(V.minSize+this[Sn])),S>=C.maxSize-C.snapOffset+this[Gt]?S=C.maxSize+this[Gt]:S<=this.size-(V.maxSize-V.snapOffset+this[Sn])&&(S=this.size-(V.maxSize+this[Sn])),j.call(this,S),ot(e,"onDrag",Kt)(Y()))}function ye(){var T=u[this.a].element,S=u[this.b].element,C=T[No](),V=S[No]();this.size=C[s]+V[s]+this[Gt]+this[Sn],this.start=C[a],this.end=C[o]}function ce(T){if(!getComputedStyle)return null;var S=getComputedStyle(T);if(!S)return null;var C=T[l];return C===0?null:(X===ba?C-=parseFloat(S.paddingLeft)+parseFloat(S.paddingRight):C-=parseFloat(S.paddingTop)+parseFloat(S.paddingBottom),C)}function ge(T){var S=ce(v);if(S===null||R.reduce(function(ue,Ne){return ue+Ne},0)>S)return T;var C=0,V=[],ke=T.map(function(ue,Ne){var ft=S*ue/100,Vt=wa(D,Ne===0,Ne===T.length-1,z),on=R[Ne]+Vt;return ft<on?(C+=on-ft,V.push(0),on):(V.push(ft-on),ft)});return C===0?T:ke.map(function(ue,Ne){var ft=ue;if(C>0&&V[Ne]-C>0){var Vt=Math.min(C,V[Ne]-C);C-=Vt,ft=ue-Vt}return ft/S*100})}function ae(){var T=this,S=u[T.a].element,C=u[T.b].element;T.dragging&&ot(e,"onDragEnd",Kt)(Y()),T.dragging=!1,Rt[Xt]("mouseup",T.stop),Rt[Xt]("touchend",T.stop),Rt[Xt]("touchcancel",T.stop),Rt[Xt]("mousemove",T.move),Rt[Xt]("touchmove",T.move),T.stop=null,T.move=null,S[Xt]("selectstart",Kt),S[Xt]("dragstart",Kt),C[Xt]("selectstart",Kt),C[Xt]("dragstart",Kt),S.style.userSelect="",S.style.webkitUserSelect="",S.style.MozUserSelect="",S.style.pointerEvents="",C.style.userSelect="",C.style.webkitUserSelect="",C.style.MozUserSelect="",C.style.pointerEvents="",T.gutter.style.cursor="",T.parent.style.cursor="",Wi.body.style.cursor=""}function H(T){if(!("button"in T&&T.button!==0)){var S=this,C=u[S.a].element,V=u[S.b].element;S.dragging||ot(e,"onDragStart",Kt)(Y()),T.preventDefault(),S.dragging=!0,S.move=it.bind(S),S.stop=ae.bind(S),Rt[Ut]("mouseup",S.stop),Rt[Ut]("touchend",S.stop),Rt[Ut]("touchcancel",S.stop),Rt[Ut]("mousemove",S.move),Rt[Ut]("touchmove",S.move),C[Ut]("selectstart",Kt),C[Ut]("dragstart",Kt),V[Ut]("selectstart",Kt),V[Ut]("dragstart",Kt),C.style.userSelect="none",C.style.webkitUserSelect="none",C.style.MozUserSelect="none",C.style.pointerEvents="none",V.style.userSelect="none",V.style.webkitUserSelect="none",V.style.MozUserSelect="none",V.style.pointerEvents="none",S.gutter.style.cursor=ie,S.parent.style.cursor=ie,Wi.body.style.cursor=ie,ye.call(S),S.dragOffset=oe(T)-S.end}}y=ge(y);var Se=[];u=n.map(function(T,S){var C={element:Rc(T),size:y[S],minSize:R[S],maxSize:_[S],snapOffset:$[S],i:S},V;if(S>0&&(V={a:S-1,b:S,dragging:!1,direction:X,parent:v},V[Gt]=wa(D,S-1===0,!1,z),V[Sn]=wa(D,!1,S===n.length-1,z),f==="row-reverse"||f==="column-reverse")){var ke=V.a;V.a=V.b,V.b=ke}if(S>0){var ue=Q(S,X,C.element);Z(ue,D,S),V[Ti]=H.bind(V),ue[Ut]("mousedown",V[Ti]),ue[Ut]("touchstart",V[Ti]),v.insertBefore(ue,C.element),V.gutter=ue}return q(C.element,C.size,wa(D,S===0,S===n.length-1,z),S),S>0&&Se.push(V),C});function Ue(T){var S=T.i===Se.length,C=S?Se[T.i-1]:Se[T.i];ye.call(C);var V=S?C.size-T.minSize-C[Sn]:T.minSize+C[Gt];j.call(C,V)}u.forEach(function(T){var S=T.element[No]()[s];S<T.minSize&&(k?Ue(T):T.minSize=S)});function Ee(T){var S=ge(T);S.forEach(function(C,V){if(V>0){var ke=Se[V-1],ue=u[ke.a],Ne=u[ke.b];ue.size=S[V-1],Ne.size=C,q(ue.element,ue.size,ke[Gt],ue.i),q(Ne.element,Ne.size,ke[Sn],Ne.i)}})}function he(T,S){Se.forEach(function(C){if(S!==!0?C.parent.removeChild(C.gutter):(C.gutter[Xt]("mousedown",C[Ti]),C.gutter[Xt]("touchstart",C[Ti])),T!==!0){var V=L(s,C.a.size,C[Gt]);Object.keys(V).forEach(function(ke){u[C.a].element.style[ke]="",u[C.b].element.style[ke]=""})}})}return{setSizes:Ee,getSizes:Y,collapse:function(S){Ue(u[S])},destroy:he,parent:v,pairs:Se}};class Pm{constructor(e,n,s,i,a,o,l,u,d){this.controlsHost=e,this.magnitudeHost=n,this.phaseHost=s,this.status=i,this.singleButton=a,this.runButton=o,this.stopButton=l,this.saveButton=u,this.resetButton=d,this.reconnectScheduler=new Ka(()=>this.openSocket()),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.magnitudeHost.parentElement??this.magnitudeHost),this.resizeObserver.observe(this.phaseHost.parentElement??this.phaseHost);const v=this.controlsHost.parentElement,m=this.magnitudeHost.closest(".network-plots");if(!v||!m)throw new Error("Network analyzer split panes are missing");this.controlsPane=v,this.plotsPane=m,this.bindActions(),this.scheduleResize()}controlsHost;magnitudeHost;phaseHost;status;singleButton;runButton;stopButton;saveButton;resetButton;state={};subscriptionEnabled=!1;readOnly=!1;magnitudePlot;phasePlot;socket=null;wantsConnection=!1;reconnectScheduler;runId=-1;x=[];magnitude=[];phase=[];real=[];imaginary=[];redrawFrame=null;resizeFrame=null;userScaled=!1;logscale=!0;lastProgress="";resizeObserver;split=null;controlsPane;plotsPane;async initialize(){const[e,n]=await Promise.all([fetch("/api/modules/networkanalyzer/attributes"),fetch("/api/modules/networkanalyzer")]);if(!e.ok||!n.ok)throw new Error("Network analyzer controls failed to load");const s=await e.json(),i=await n.json();this.renderControls(s.attributes??[]),this.applyState(i.state??i)}applyState(e){this.state={...this.state,...e};for(const[a,o]of Object.entries(e)){const l=this.controlsHost.querySelector(`#networkanalyzer-${a.replaceAll("_","-")}`);!l||document.activeElement===l||(l instanceof HTMLInputElement&&l.type==="checkbox"?l.checked=!!o:l.value=String(o))}const n=String(this.state.running_state??"stopped")!=="stopped";this.runButton.textContent=n?"Running":"Continuous",this.runButton.disabled=n,this.stopButton.disabled=!n;const s=typeof this.state.iq_module=="string"?` on ${this.state.iq_module}`:"",i=`${String(this.state.running_state??"stopped")}${s}`;this.status.textContent=!n&&this.lastProgress?`${this.lastProgress}, ${i}`:i,n&&this.subscriptionEnabled?this.connectSocket():(!this.subscriptionEnabled||this.state.last_action==="stop")&&this.closeSocket()}setSubscriptionEnabled(e){this.subscriptionEnabled=e,this.applyState({})}setReadOnly(e){this.readOnly=e,this.saveButton.textContent=e?"Download CSV":"Save Curve"}refreshLayout(){this.ensureSplit(),this.scheduleResize()}getCurveData(){const e=Oo(this.x);return e?{x:this.x.slice(0,e),real:this.real.slice(0,e),imaginary:this.imaginary.slice(0,e)}:null}destroy(){this.closeSocket(),this.resizeObserver.disconnect(),this.split?.destroy(),this.magnitudePlot.destroy(),this.phasePlot.destroy()}bindActions(){this.singleButton.addEventListener("click",()=>{this.start("single")}),this.runButton.addEventListener("click",()=>{this.start("continuous")}),this.stopButton.addEventListener("click",()=>{this.stop()}),this.saveButton.addEventListener("click",()=>{if(this.readOnly){this.downloadCsv();return}this.persistCurve().then(()=>{this.downloadCsv(),this.status.textContent="Curve saved"}).catch(e=>{this.status.textContent=e.message})}),this.resetButton.addEventListener("click",()=>this.resetZoom())}ensureSplit(){this.split||this.controlsPane.closest(".workspace-panel")?.hidden||(this.split=ea([this.controlsPane,this.plotsPane],{direction:"vertical",sizes:[34,66],minSize:[100,240],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}async start(e){const n=await fetch(`/api/modules/networkanalyzer/actions/${e}`,{method:"POST"});if(!n.ok){this.status.textContent=`Network analyzer ${e} failed: ${n.status}`;return}const s=await n.json();this.applyState(s.state??{}),this.connectSocket()}async stop(){const e=await fetch("/api/modules/networkanalyzer/actions/stop",{method:"POST"});if(e.ok){const n=await e.json();this.applyState(n.state??{})}this.closeSocket()}connectSocket(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=new WebSocket(`${e}://${window.location.host}/ws/networkanalyzer`);this.socket=n,n.addEventListener("open",()=>{this.socket===n&&this.reconnectScheduler.connected()}),n.addEventListener("message",s=>{this.socket===n&&this.showPoint(JSON.parse(String(s.data)))}),n.addEventListener("close",()=>{if(this.socket===n&&(this.socket=null,this.wantsConnection)){const s=this.reconnectScheduler.schedule();this.status.textContent=`Network Analyzer stream closed; reconnecting${s===null?"":` in ${s} ms`}`}})}closeSocket(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}showPoint(e){e.run_id!==this.runId&&(this.runId=e.run_id,this.x=new Array(e.points).fill(Number.NaN),this.magnitude=new Array(e.points).fill(Number.NaN),this.phase=new Array(e.points).fill(Number.NaN),this.real=new Array(e.points).fill(Number.NaN),this.imaginary=new Array(e.points).fill(Number.NaN),this.userScaled=!1),this.x[e.index]=e.x;const n=Math.hypot(e.real,e.imag);this.magnitude[e.index]=20*Math.log10(Math.max(n,1e-20)),this.phase[e.index]=Math.atan2(e.imag,e.real)*180/Math.PI,this.real[e.index]=e.real,this.imaginary[e.index]=e.imag,this.logscale!==e.logscale&&(this.logscale=e.logscale,this.recreatePlots()),this.scheduleRedraw();const s=e.time_per_point>0?`${Am(e.time_per_point*1e3)} ms/point`:"";this.lastProgress=`${e.index+1}/${e.points}, average ${e.current_avg}${s?`, ${s}`:""}`,this.status.textContent=this.lastProgress,e.running_state==="stopped"&&(this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0)}renderControls(e){this.controlsHost.textContent="";const n=[["Channels",["input","output_direct"]],["Frequency",["start_freq","stop_freq","points","logscale"]],["Setup",["amplitude","acbandwidth"]],["Averaging",["average_per_point","rbw","trace_average","curve_name"]],["Auto Bandwidth",["auto_bandwidth","q_factor_min"]],["Auto Amplitude",["auto_amplitude","target_dbv","auto_amp_min","auto_amp_max"]]],s=new Map(e.map(i=>[i.name,i]));for(const[i,a]of n){const o=document.createElement("fieldset");o.className="network-control-group";const l=document.createElement("legend");l.textContent=i,o.appendChild(l);for(const u of a){const d=s.get(u);d&&o.appendChild(this.createControl(d))}this.controlsHost.appendChild(o)}}createControl(e){const n=document.createElement("label"),s=document.createElement("span");s.textContent=e.label,n.appendChild(s);let i;if(e.type==="select"){const a=document.createElement("select");for(const o of e.options??[]){const l=document.createElement("option");l.value=String(o),l.textContent=String(o),a.appendChild(l)}a.value=String(e.value),i=a}else{const a=document.createElement("input");a.type=e.type==="bool"?"checkbox":e.type,a.type==="checkbox"?a.checked=!!e.value:a.value=String(e.value),e.min!==void 0&&(a.min=String(e.min)),e.max!==void 0&&(a.max=String(e.max)),e.step!==void 0&&(a.step=String(e.step)),i=a}return i.id=`networkanalyzer-${e.name.replaceAll("_","-")}`,i.addEventListener("change",()=>{this.writeAttribute(e,i)}),n.appendChild(i),n}async writeAttribute(e,n){const s=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:e.type==="number"?Number(n.value):n.value,i=await fetch(`/api/modules/networkanalyzer/attributes/${e.name}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:s})});if(!i.ok){this.status.textContent=`${e.label} update failed: ${i.status}`;return}this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0,this.status.textContent=`${e.label} updated`}createPlot(e,n,s,i){return new Te({width:800,height:260,title:n,scales:{x:{time:!1,distr:this.logscale?3:1},y:{auto:!0}},axes:[vt({label:i?"Frequency (Hz)":""}),vt({label:s})],series:[{},{label:n,stroke:je.yellow,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}},hooks:{setScale:[(a,o)=>{(o==="x"||o==="y")&&(this.userScaled=!0)}]}},[[],[]],e)}recreatePlots(){this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.scheduleResize()}scheduleRedraw(){this.redrawFrame===null&&(this.redrawFrame=requestAnimationFrame(()=>{this.redrawFrame=null;const e=Oo(this.x);this.magnitudePlot.setData([this.x.slice(0,e),this.magnitude.slice(0,e)]),this.phasePlot.setData([this.x.slice(0,e),this.phase.slice(0,e)])}))}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resizePlot(this.magnitudePlot,this.magnitudeHost),this.resizePlot(this.phasePlot,this.phaseHost)}))}resizePlot(e,n){const s=n.parentElement?.getBoundingClientRect();!s||s.width<100||s.height<100||e.setSize({width:Math.floor(s.width),height:Math.floor(s.height)})}resetZoom(){this.userScaled=!1;const e=$o(this.x,0,1),n=$o(this.magnitude,-120,20),s=$o(this.phase,-180,180);this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",n),this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",s)}downloadCsv(){const e=["x,magnitude_db,phase_deg"];for(let i=0;i<this.x.length;i+=1)Number.isFinite(this.x[i])&&e.push(`${this.x[i]},${this.magnitude[i]},${this.phase[i]}`);const n=URL.createObjectURL(new Blob([`${e.join(`
`)}
`],{type:"text/csv"})),s=document.createElement("a");s.href=n,s.download=`network-analyzer-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`,s.click(),URL.revokeObjectURL(n)}async persistCurve(){const e=Oo(this.x);if(e===0)throw new Error("No network analyzer curve to save");const n=this.controlsHost.querySelector("#networkanalyzer-curve-name"),s=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:this.x.slice(0,e),y:this.real.slice(0,e),y_imag:this.imaginary.slice(0,e),params:{...this.currentControlParameters(),name:n?.value||"networkanalyzer curve",module:"networkanalyzer"}})});if(!s.ok)throw new Error(`Save curve failed: ${s.status}`)}currentControlParameters(){const e={};for(const n of this.controlsHost.querySelectorAll("input, select")){const s=n.id.replace(/^networkanalyzer-/,"").replaceAll("-","_");e[s]=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:n instanceof HTMLInputElement&&n.type==="number"?Number(n.value):n.value}return e}}function Am(t){return t>=100?t.toFixed(0):t>=10?t.toFixed(1):t.toFixed(2)}function $o(t,e,n){const s=t.filter(Number.isFinite);if(s.length===0)return{min:e,max:n};const i=Math.min(...s),a=Math.max(...s);if(i===a)return{min:i-1,max:a+1};const o=(a-i)*.04;return{min:i-o,max:a+o}}function Oo(t){let e=0;for(;e<t.length&&Number.isFinite(t[e]);)e+=1;return e}class zm{constructor(e,n,s,i,a,o,l,u,d,v,m){this.root=e,this.listPane=n,this.plotPane=s,this.paramsPane=i,this.select=a,this.name=o,this.params=l,this.status=u,this.saveParamsButton=d,this.deleteButton=v,this.refreshButton=m;const f=this.requireHost("#curve-viewer-magnitude"),y=this.requireHost("#curve-viewer-phase");this.magnitudePlot=this.createPlot(f,"Curve","Value"),this.phasePlot=this.createPlot(y,"Phase","deg"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotPane),this.bindActions()}root;listPane;plotPane;paramsPane;select;name;params;status;saveParamsButton;deleteButton;refreshButton;magnitudePlot;phasePlot;split=null;resizeObserver;resizeFrame=null;selected=null;loaded=!1;loading=null;async load(){this.loading||(this.params.disabled=!0,this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0,this.loading=this.refreshList().then(()=>{this.loaded=!0}).finally(()=>{this.loading=null,this.params.disabled=!1,this.saveParamsButton.disabled=!this.selected,this.deleteButton.disabled=!this.selected})),await this.loading}refreshLayout(){this.ensureSplit(),this.scheduleResize(),!this.root.hidden&&!this.loaded&&this.load().catch(e=>{this.status.textContent=e.message})}bindActions(){const e=n=>{this.status.textContent=n.message};this.select.addEventListener("change",()=>{this.loadSelected().catch(e)}),this.refreshButton.addEventListener("click",()=>{this.load().catch(e)}),this.saveParamsButton.addEventListener("click",()=>{this.saveParams().catch(e)}),this.deleteButton.addEventListener("click",()=>{this.deleteSelected().catch(e)})}async refreshList(){const e=this.select.value,n=await fetch("/api/curves?limit=100");if(!n.ok)throw new Error(`Curve list failed: ${n.status}`);const i=(await n.json()).curves??[];this.select.textContent="";for(const a of i){const o=document.createElement("option");o.value=String(a.pk),o.textContent=`${a.pk}: ${a.name}`,this.select.appendChild(o)}i.some(a=>String(a.pk)===e)?this.select.value=e:i[0]&&(this.select.value=String(i[0].pk)),this.status.textContent=`${i.length} curve${i.length===1?"":"s"}`,i.length?await this.loadSelected():this.clear()}async loadSelected(){if(!this.select.value)return this.clear();const e=await fetch(`/api/curves/${encodeURIComponent(this.select.value)}`);if(!e.ok)throw new Error(`Curve load failed: ${e.status}`);const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.saveParamsButton.disabled=!1,this.deleteButton.disabled=!1;const s=Array.isArray(this.selected.y_imag),i=s?this.selected.y.map((l,u)=>20*Math.log10(Math.max(Math.hypot(l,this.selected.y_imag[u]),1e-20))):this.selected.y,a=s?this.selected.y.map((l,u)=>Math.atan2(this.selected.y_imag[u],l)*180/Math.PI):[];this.magnitudePlot.setData([this.selected.x,i]),this.phasePlot.setData([s?this.selected.x:[],a]);const o=this.phasePlot.root.closest(".curve-viewer-plot-frame");o&&(o.hidden=!s),this.plotPane.classList.toggle("is-complex",s),this.status.textContent=`curve ${this.selected.pk}, ${this.selected.points} points`,this.scheduleResize()}async saveParams(){if(!this.selected)return;const e=await fetch(`/api/curves/${this.selected.pk}/params`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({params_yaml:this.params.value})});if(!e.ok){const s=await e.json().catch(()=>({}));this.status.textContent=s.detail??`Save parameters failed: ${e.status}`;return}const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.status.textContent=`curve ${this.selected.pk} parameters saved`,await this.refreshList()}async deleteSelected(){if(!this.selected)return;const e=this.selected.pk,n=await fetch(`/api/curves/${e}`,{method:"DELETE"});if(!n.ok){this.status.textContent=`Delete curve failed: ${n.status}`;return}this.selected=null,await this.refreshList(),this.status.textContent=`curve ${e} deleted`}clear(){this.selected=null,this.name.value="",this.params.value="",this.magnitudePlot.setData([[],[]]),this.phasePlot.setData([[],[]]),this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0}ensureSplit(){this.split||this.root.hidden||(this.split=ea([this.listPane,this.plotPane,this.paramsPane],{direction:"horizontal",sizes:[18,57,25],minSize:[140,300,200],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}createPlot(e,n,s){return new Te({width:700,height:260,title:n,scales:{x:{time:!1},y:{auto:!0}},axes:[vt({label:"X"}),vt({label:s})],series:[{},{label:n,stroke:je.green,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}}},[[],[]],e)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=this.plotPane.querySelectorAll(".curve-viewer-plot-frame:not([hidden])"),n=[this.magnitudePlot,this.phasePlot];e.forEach((s,i)=>{const a=s.getBoundingClientRect();a.width>100&&a.height>80&&n[i].setSize({width:Math.floor(a.width),height:Math.floor(a.height)})})}))}requireHost(e){const n=this.root.querySelector(e);if(!n)throw new Error(`Missing curve viewer element ${e}`);return n}}function _m(t,e,n,s){if(!t.length||e.length!==t.length||s&&s.length!==t.length)throw new Error("Curve arrays must have the same nonzero length");const i=new TextEncoder().encode(JSON.stringify({points:t.length,complex:!!s,params:n})),a=s?[t,e,s]:[t,e],o=new ArrayBuffer(8+i.length+a.length*t.length*8),l=new Uint8Array(o);l.set([80,89,67,49]);const u=new DataView(o);u.setUint32(4,i.length,!0),l.set(i,8);let d=8+i.length;for(const v of a)for(const m of v)u.setFloat64(d,m,!0),d+=8;return o}const Vu={scope:["ch1_active","ch2_active","ch_math_active","math_formula","xy_mode"],spectrumanalyzer:["display_unit","display_input1_baseband","display_input2_baseband","display_cross_amplitude","window"],iir:["tf_type","data_curve","plot_data","plot_data_times_filter","plot_measurement"]};function Za(t,e){return Vu[t]?.includes(e)??!1}const Lm=new Set(["show-ch1","show-ch2","scope-xy-mode","scope-math-active","scope-math-formula","zoom-reset","spectrum-zoom-reset","iir-zoom-reset","network-reset","save-curve","spectrum-save-curve","network-save","lockbox-input-plot-select","lockbox-output-plot-select","curve-viewer-select","curve-viewer-refresh","curve-viewer-name","curve-viewer-params","config-module","config-refresh","config-text","hk-refresh","telemetry-refresh","sampler-stats-signal","sampler-stats-duration","sampler-stats-run","register-read-addr","register-read-length","register-read","register-output"]);function Ir(t){return t.dataset.controlScope==="view"||!!t.closest(".workspace-pane-selector")||Lm.has(t.id)||/^(spectrum-)?(zoom-(in|out|y-in|y-out)|pan-(left|right|up|down))$/.test(t.id)}const Nc="pyrpl-websocket.plot-views.v1";class Fm{values={};constructor(){try{const e=JSON.parse(window.localStorage.getItem(Nc)??"{}");for(const[n,s]of Object.entries(Vu))for(const i of s){const a=e?.[n]?.[i];["string","number","boolean"].includes(typeof a)&&this.set(n,i,a)}}catch{}}set(e,n,s){if(!Za(e,n))throw new Error(`Not a local plot setting: ${e}.${n}`);(this.values[e]??={})[n]=s;try{window.localStorage.setItem(Nc,JSON.stringify(this.values))}catch{}}get(e){return{...this.values[e]}}merge(e,n){return{...n,...this.values[e]}}}class Tm{constructor(e){this.elements=e,e.module.addEventListener("change",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.refresh.addEventListener("click",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.save.addEventListener("click",()=>{this.save().catch(n=>this.setStatus(n.message))})}elements;schema=null;async load(e=this.schema?.module??"pyrpl"){const n=await fetch(`/api/config?module=${encodeURIComponent(e)}`);if(!n.ok)throw new Error(await $c(n,"Configuration unavailable"));this.apply(await n.json()),this.setStatus(`Loaded ${this.schema?.module}`)}async save(){const e=this.elements.module.value,n=await fetch(`/api/config/branches/${encodeURIComponent(e)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:this.elements.text.value})});if(!n.ok)throw new Error(await $c(n,"Configuration save failed"));this.apply(await n.json()),this.setStatus(`Saved ${e}`)}getModule(){return this.elements.module.value}getText(){return this.elements.text.value}apply(e){this.schema=e,this.elements.file.textContent=e.configfile,this.elements.module.textContent="";for(const n of e.modules){const s=document.createElement("option");s.value=n,s.textContent=n,this.elements.module.appendChild(s)}this.elements.module.value=e.module,this.elements.text.value=e.text,this.elements.module.disabled=!1,this.elements.text.disabled=!1,this.elements.refresh.disabled=!1,this.elements.save.disabled=!1}setStatus(e){this.elements.status.textContent=e}}async function $c(t,e){try{return(await t.json()).detail??`${e}: ${t.status}`}catch{return`${e}: ${t.status}`}}const Oc="pyrpl-control-client-id";function Im(){try{const t=window.sessionStorage.getItem(Oc);if(t)return t;const e=window.crypto.randomUUID();return window.sessionStorage.setItem(Oc,e),e}catch{return`browser-${Date.now()}-${Math.random().toString(16).slice(2)}`}}class Rm{id=Im();label=`Browser ${this.id.slice(0,8)}`;nativeFetch;heartbeatTimer=null;constructor(){this.nativeFetch=window.fetch.bind(window)}installFetchHeaders(){const e=this.nativeFetch;window.fetch=((n,s={})=>{if(new URL(n instanceof Request?n.url:String(n),window.location.href).origin!==window.location.origin)return e(n,s);const a=new Headers(n instanceof Request?n.headers:void 0);return new Headers(s.headers).forEach((o,l)=>a.set(l,o)),a.set("x-pyrpl-client-id",this.id),a.set("x-pyrpl-client-label",this.label),e(n,{...s,headers:a})})}async initialize(){let e=await this.refresh();return e.policy==="single-writer"&&e.controller===null&&(e=await this.claim(!1)),this.startHeartbeat(e.lease_seconds),e}async refresh(){return this.request("/api/control",{method:"GET"})}async claim(e){return this.request("/api/control/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({label:this.label,force:e})})}release(){window.fetch("/api/control/release",{method:"POST",keepalive:!0}).catch(()=>{})}startHeartbeat(e){this.heartbeatTimer!==null&&window.clearInterval(this.heartbeatTimer);const n=Math.max(2e3,Math.min(1e4,e*400));this.heartbeatTimer=window.setInterval(()=>{this.request("/api/control/heartbeat",{method:"POST"}).catch(()=>{})},n)}async request(e,n){const s=await window.fetch(e,n);if(!s.ok){let i=`Control request failed: ${s.status}`;try{const a=await s.json();a.detail&&(i=a.detail)}catch{}throw new Error(i)}return s.json()}}const qt=[{id:"scope",title:"Scope",description:"Oscilloscope controls and live waveform",defaultEnabled:!0,defaultSplitSizes:[28,72]},{id:"asg",title:"ASG",description:"Arbitrary signal generator controls",defaultEnabled:!1},{id:"pid",title:"PID",description:"PID controller controls",defaultEnabled:!1},{id:"iq",title:"IQ",description:"IQ modulator and demodulator controls",defaultEnabled:!1},{id:"iir",title:"IIR",description:"Infinite impulse response filter controls",defaultEnabled:!1},{id:"trig",title:"Trigger",description:"DSP trigger controls",defaultEnabled:!1},{id:"pwm",title:"PWM",description:"Auxiliary PWM routing controls",defaultEnabled:!1},{id:"spectrumanalyzer",title:"Spectrum Analyzer",description:"FFT spectrum analyzer controls and plot",defaultEnabled:!1,defaultSplitSizes:[35,65]},{id:"networkanalyzer",title:"Network Analyzer",description:"Coherent swept-frequency response measurement",defaultEnabled:!1,defaultSplitSizes:[34,66]},{id:"curveviewer",title:"Curve Viewer",description:"Browse and manage saved PyRPL curves",defaultEnabled:!1},{id:"pyrplconfig",title:"Configuration",description:"Edit PyRPL YAML configuration branches",defaultEnabled:!1},{id:"lockbox",title:"Lockbox",description:"Model-based lock sequence controls",defaultEnabled:!1},{id:"housekeeping",title:"Housekeeping",description:"LED and expansion connector I/O",defaultEnabled:!1},{id:"telemetry",title:"Sampler & AMS",description:"DSP signal readback, statistics, and AMS DAC controls",defaultEnabled:!1},{id:"registers",title:"Register Debug",description:"Raw monitor_server register read/write",defaultEnabled:!1}];function Nm(t){const e=qt.find(n=>n.id===t);if(!e)throw new Error(`Unknown panel ${t}`);return e}function Qo(t){const e=t.trim();if(!e)throw new Error("Register value is empty");const n=Number(e);if(!Number.isInteger(n)||n<0)throw new Error(`Invalid register integer: ${t}`);return n}function $m(t){const e=t.split(/[\s,]+/).map(n=>n.trim()).filter(Boolean).map(Qo);if(e.length===0)throw new Error("At least one register value is required");return e}function xa(t){return`0x${(t>>>0).toString(16).padStart(8,"0")} (${t>>>0})`}async function Dc(t,e,n){const s=await fetch(t,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)});if(!s.ok)throw new Error(`${n}: ${s.status}`);return await s.json()}function Om(t){async function e(){const s=Qo(t.readAddr.value),i=Math.max(1,Math.min(64,Number(t.readLength.value))),a=await Dc("/api/register/read",{addr:s,length:i},"Register read failed");t.status.textContent=`read ${a.length} word${a.length===1?"":"s"}`,t.output.value=a.values.map((o,l)=>`${xa(s+l*4)}: ${xa(o)}`).join(`
`)}async function n(){const s=Qo(t.writeAddr.value),i=$m(t.writeValues.value),a=await Dc("/api/register/write",{addr:s,values:i},"Register write failed");t.status.textContent=`wrote ${a.count} word${a.count===1?"":"s"}`,t.output.value=i.map((o,l)=>`${xa(s+l*4)} <= ${xa(o)}`).join(`
`)}return t.readButton.addEventListener("click",()=>{e().catch(s=>{t.status.textContent=s.message})}),t.writeButton.addEventListener("click",()=>{n().catch(s=>{t.status.textContent=s.message})}),{read:e,write:n}}const Yu="pyrpl-websocket.workspace.v1",Hu="tabs",Dm=2,Rr=3;function er(){const t=Object.fromEntries(qt.map(e=>[e.id,{enabled:e.defaultEnabled,splitSizes:e.defaultSplitSizes}]));return{activePanelId:ti(t),layoutMode:Hu,splitPanelIds:ti(t)?[ti(t)]:[],workspaceSplitSizes:bs([],1),panels:t}}function Bm(){let t=null;try{t=JSON.parse(window.localStorage.getItem(Yu)??"")}catch{return er()}return ju(t)}function ju(t){if(!t||typeof t!="object")return er();const e=t,s={...er().panels};for(const o of qt){const l=e.panels?.[o.id];s[o.id]={enabled:typeof l?.enabled=="boolean"?l.enabled:s[o.id].enabled,splitSizes:o.defaultSplitSizes?Gu(l?.splitSizes,o.defaultSplitSizes):void 0}}const i=e.activePanelId&&s[e.activePanelId]?.enabled?e.activePanelId:ti(s),a=Uu(Array.isArray(e.splitPanelIds)?e.splitPanelIds:Nr(s).slice(0,Dm),s,i);return{activePanelId:i,layoutMode:Xu(e.layoutMode),splitPanelIds:a,workspaceSplitSizes:bs(e.workspaceSplitSizes,Math.max(1,a.length)),panels:s}}function Wu(t){window.localStorage.setItem(Yu,JSON.stringify(t))}function ti(t){return Nr(t)[0]??null}function Nr(t){return qt.filter(e=>t[e.id]?.enabled).map(e=>e.id)}function Uu(t,e,n=ti(e)){const s=Nr(e),i=Array.isArray(t)?t:[],a=[];for(const o of i)if(typeof o=="string"&&s.includes(o)&&!a.includes(o)&&a.push(o),a.length===Rr)return a;return a.length>0?a:n&&s.includes(n)?[n]:s.slice(0,1)}function Xu(t){return t==="tabs"||t==="split-horizontal"||t==="split-vertical"?t:Hu}function Gu(t,e=Nm("scope").defaultSplitSizes??[28,72]){if(Array.isArray(t)&&t.length===2){const n=Number(t[0]),s=Number(t[1]);if(Number.isFinite(n)&&Number.isFinite(s)&&n>=15&&s>=35){const i=n+s;return[Math.round(n/i*1e3)/10,Math.round(s/i*1e3)/10]}}return[...e]}function bs(t,e){const n=Array.from({length:e},()=>Math.round(100/e*10)/10);if(!Array.isArray(t)||t.length!==e)return n;const s=t.map(Number);if(s.some(a=>!Number.isFinite(a)||a<10))return n;const i=s.reduce((a,o)=>a+o,0);return i<=0?n:s.map(a=>Math.round(a/i*1e3)/10)}const ta=new Rm,As=new Fm;let tr={};ta.installFetchHeaders();const qm=2;function b(t){const e=document.querySelector(t);if(!e)throw new Error(`Missing UI element ${t}`);return e}const Vm=b("#app");Vm.innerHTML=`
  <section class="shell">
    <header class="topbar">
      <div>
        <h1>PyRPL WebSocket</h1>
        <p id="session-line">TypeScript oscilloscope frontend</p>
      </div>
      <nav class="menubar" aria-label="Workspace menu">
        <div class="control-strip">
          <output id="control-status">Control connecting...</output>
          <button id="take-control" type="button" hidden>Take Control</button>
        </div>
        <details class="menu-dropdown">
          <summary>Panels</summary>
          <div class="menu-content" id="panel-menu"></div>
        </details>
      </nav>
	    </header>

    <main class="workspace" id="workspace">
      <div class="workspace-tabs" id="workspace-tabs"></div>
      <div class="workspace-panels" id="workspace-panels">
        <section class="workspace-panel" id="scope-panel" data-panel-id="scope">
        <header class="panel-header">
          <div>
            <h2>Scope</h2>
            <p>Oscilloscope controls and live waveform</p>
          </div>
          <div class="actions">
            <div class="action-row">
              <output id="scope-current-average">0 / 1</output>
              <button id="single-frame" type="button">Run single</button>
              <button id="connect-scope" type="button">Run continuous</button>
              <button id="stop-scope" type="button" disabled>Stop</button>
              <input id="scope-curve-name" class="curve-name-input" type="text" value="scope curve" aria-label="Curve Name" />
            </div>
            <div class="action-row">
              <button id="save-curve" type="button">Save Curve</button>
              <button id="zoom-out" class="plot-button" type="button" title="Zoom X out">X-</button>
              <button id="zoom-in" class="plot-button" type="button" title="Zoom X in">X+</button>
              <button id="zoom-y-out" class="plot-button" type="button" title="Zoom Y out">Y-</button>
              <button id="zoom-y-in" class="plot-button" type="button" title="Zoom Y in">Y+</button>
              <button id="pan-left" class="plot-button" type="button" title="Move view left">&lt;</button>
              <button id="pan-right" class="plot-button" type="button" title="Move view right">&gt;</button>
              <button id="pan-up" class="plot-button" type="button" title="Move trace up">^</button>
              <button id="pan-down" class="plot-button" type="button" title="Move trace down">v</button>
              <button id="zoom-reset" type="button">Reset</button>
            </div>
          </div>
        </header>
        <div class="panel-content" id="scope-panel-content">
          <section class="module-panel split-pane" id="scope-controls-pane">
            <div class="control-row signal-row">
              <div class="channel-control">
                <label class="toggle-control">
                  <input id="show-ch1" type="checkbox" checked />
                  <span>CH1</span>
                </label>
                <label>
                  <span>Input 1</span>
                  <select id="scope-input1"></select>
                </label>
              </div>
              <div class="channel-control">
                <label class="toggle-control">
                  <input id="show-ch2" type="checkbox" checked />
                  <span>CH2</span>
                </label>
                <label>
                  <span>Input 2</span>
                  <select id="scope-input2"></select>
                </label>
              </div>
              <label>
                <span>Trigger</span>
                <select id="scope-trigger"></select>
              </label>
              <fieldset class="segmented-control" id="scope-trigger-mode">
                <legend>Trigger mode</legend>
                <label><input id="scope-trigger-normal" name="scope-trigger-mode" type="radio" value="normal" /><span>Normal</span></label>
                <label><input id="scope-trigger-rolling" name="scope-trigger-mode" type="radio" value="rolling" checked /><span>Untriggered (rolling)</span></label>
              </fieldset>
              <label>
                <span>Duration</span>
                <select id="scope-duration"></select>
              </label>
              <label class="toggle-control">
                <input id="scope-average" type="checkbox" />
                <span>FPGA Avg</span>
              </label>
              <label class="toggle-control">
                <input id="scope-xy-mode" type="checkbox" />
                <span>XY</span>
              </label>
            </div>
            <div class="control-row tune-row">
              <div class="channel-control math-control">
                <label class="toggle-control">
                  <input id="scope-math-active" type="checkbox" />
                  <span>Math</span>
                </label>
                <label>
                  <span>Formula</span>
                  <input id="scope-math-formula" type="text" value="ch1 * ch2" />
                </label>
              </div>
              <label>
                <span>Trace Avg</span>
                <input id="scope-trace-average" type="number" min="1" max="1024" step="1" />
              </label>
              <label>
                <span>Trig Delay</span>
                <input id="scope-trigger-delay" type="number" step="0.000001" />
              </label>
              <label>
                <span>Threshold</span>
                <input id="scope-threshold" type="number" min="-1" max="1" step="0.0001220703125" />
              </label>
              <label>
                <span>Hysteresis</span>
                <input id="scope-hysteresis" type="number" min="0" max="1" step="0.0001220703125" />
              </label>
              <label>
                <span>Saved State</span>
                <select id="scope-state-select"></select>
              </label>
              <label>
                <span>State Name</span>
                <input id="scope-state-name" type="text" value="default" />
              </label>
              <button id="scope-state-save" type="button">Save</button>
              <button id="scope-state-load" type="button">Load</button>
              <button id="scope-state-delete" type="button">Delete</button>
            </div>
            <output id="module-status">Scope controls loading...</output>
          </section>

          <section class="plot-panel split-pane" id="scope-plot-pane">
            <div class="plot-toolbar">
              <output id="plot-hint">Drag pans. Right-drag zooms X/Y. Use header controls for touch-friendly zoom and offsets.</output>
              <output id="status">Idle</output>
            </div>
            <div id="scope-plot"></div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="asg-panel" data-panel-id="asg" hidden>
        <header class="panel-header">
          <div>
            <h2>ASG</h2>
            <p>Arbitrary signal generators</p>
          </div>
        </header>
        <div class="panel-content instrument-grid">
          ${["asg0","asg1"].map((t,e)=>`
          <section class="module-panel instrument-card" data-asg-module="${t}">
            <header class="instrument-card-header">
              <h3>ASG ${e}</h3>
              <output id="${t}-status">${t} ready</output>
            </header>
            <div class="control-row asg-row">
              <label>
                <span>Waveform</span>
                <select id="${t}-waveform"></select>
              </label>
              <label>
                <span>Frequency</span>
                <input id="${t}-frequency" type="number" min="0" step="1" />
              </label>
              <label>
                <span>Amplitude</span>
                <input id="${t}-amplitude" type="number" min="0" max="1" step="0.001" />
              </label>
              <label>
                <span>Offset</span>
                <input id="${t}-offset" type="number" min="-1" max="1" step="0.001" />
              </label>
              <label>
                <span>Trigger</span>
                <select id="${t}-trigger-source"></select>
              </label>
              <label>
                <span>Output</span>
                <select id="${t}-output-direct"></select>
              </label>
              <label>
                <span>Start Phase</span>
                <input id="${t}-start-phase" type="number" min="0" max="360" step="0.1" />
              </label>
              <label>
                <span>Cycles/Burst</span>
                <input id="${t}-cycles-per-burst" type="number" min="0" step="1" />
              </label>
              <button id="${t}-setup" type="button">Setup</button>
              <button id="${t}-trigger" type="button">Trigger</button>
              <button id="${t}-off" type="button">Off</button>
            </div>
          </section>`).join("")}
        </div>
        </section>
        ${[["pid","PID","PID controllers","pid-modules"],["iq","IQ","IQ modulators and demodulators","iq-modules"],["iir","IIR","Infinite impulse response filter","iir-modules"],["trig","Trigger","DSP trigger","trig-modules"],["pwm","PWM","Auxiliary PWM routing","pwm-modules"]].map(([t,e,n,s])=>`
        <section class="workspace-panel" id="${t}-panel" data-panel-id="${t}" hidden>
        <header class="panel-header">
          <div>
            <h2>${e}</h2>
            <p>${n}</p>
          </div>
        </header>
        <div class="panel-content instrument-grid" id="${s}"></div>
        </section>`).join("")}
        <section class="workspace-panel" id="spectrumanalyzer-panel" data-panel-id="spectrumanalyzer" hidden>
        <header class="panel-header spectrum-header">
          <div>
            <h2>Spectrum Analyzer</h2>
          </div>
          <div class="actions">
            <div class="action-row">
              <button id="spectrum-single" type="button">Run single</button>
              <button id="spectrum-run" type="button">Run continuous</button>
              <button id="spectrum-stop" type="button" disabled>Stop</button>
              <input id="spectrum-curve-name" class="curve-name-input" type="text" value="pyrpl spectrum" aria-label="Curve Name" />
              <button id="spectrum-save-curve" type="button">Save Curve</button>
            </div>
            <div class="action-row">
              <button id="spectrum-zoom-out" class="plot-button" type="button" title="Zoom X out">X-</button>
              <button id="spectrum-zoom-in" class="plot-button" type="button" title="Zoom X in">X+</button>
              <button id="spectrum-zoom-y-out" class="plot-button" type="button" title="Zoom Y out">Y-</button>
              <button id="spectrum-zoom-y-in" class="plot-button" type="button" title="Zoom Y in">Y+</button>
              <button id="spectrum-pan-left" class="plot-button" type="button" title="Move view left">&lt;</button>
              <button id="spectrum-pan-right" class="plot-button" type="button" title="Move view right">&gt;</button>
              <button id="spectrum-pan-up" class="plot-button" type="button" title="Move trace up">^</button>
              <button id="spectrum-pan-down" class="plot-button" type="button" title="Move trace down">v</button>
              <button id="spectrum-zoom-reset" type="button">Reset</button>
            </div>
          </div>
        </header>
        <div class="panel-content spectrum-content" id="spectrum-panel-content">
          <section class="spectrum-controls split-pane" id="spectrum-controls-pane">
            <div id="spectrum-modules"></div>
          </section>
          <section class="plot-panel spectrum-plot-panel split-pane" id="spectrum-plot-pane">
            <div class="plot-toolbar">
              <output id="spectrum-plot-hint">Drag pans. Right-drag zooms X/Y.</output>
              <output id="spectrum-current-average">0 / 1</output>
              <output id="spectrum-status">Spectrum analyzer ready</output>
            </div>
            <div id="spectrum-plot"></div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="networkanalyzer-panel" data-panel-id="networkanalyzer" hidden>
          <header class="panel-header">
            <div><h2>Network Analyzer</h2></div>
            <div class="action-row">
              <button id="network-single" type="button">Single</button>
              <button id="network-run" type="button">Continuous</button>
              <button id="network-stop" type="button" disabled>Stop</button>
              <button id="network-save" type="button">Save Curve</button>
              <button id="network-reset" type="button">Reset Zoom</button>
            </div>
          </header>
          <div class="panel-content network-content">
            <section class="module-panel network-controls-pane split-pane">
              <div id="network-controls" class="network-controls"></div>
              <output id="network-status">Network analyzer ready</output>
            </section>
            <section class="network-plots split-pane">
              <div class="network-plot-frame"><div id="network-magnitude-plot"></div></div>
              <div class="network-plot-frame"><div id="network-phase-plot"></div></div>
            </section>
          </div>
        </section>
        <section class="workspace-panel" id="curveviewer-panel" data-panel-id="curveviewer" hidden>
          <header class="panel-header">
            <div><h2>Curve Viewer</h2></div>
            <div class="action-row">
              <button id="curve-viewer-save-params" type="button" disabled>Save Params</button>
              <button id="curve-viewer-delete" type="button" disabled>Delete Curve</button>
              <button id="curve-viewer-refresh" type="button">Refresh</button>
            </div>
          </header>
          <div class="panel-content curve-viewer-content">
            <section class="curve-viewer-list-pane split-pane">
              <label><span>Curve</span><select id="curve-viewer-select" size="12"></select></label>
            </section>
            <section class="curve-viewer-plot-pane split-pane">
              <div class="curve-viewer-plot-frame"><div id="curve-viewer-magnitude"></div></div>
              <div class="curve-viewer-plot-frame"><div id="curve-viewer-phase"></div></div>
            </section>
            <section class="curve-viewer-params-pane split-pane">
              <label><span>Name</span><input id="curve-viewer-name" type="text" readonly /></label>
              <label><span>Parameters</span><textarea id="curve-viewer-params" spellcheck="false"></textarea></label>
              <output id="curve-viewer-status">Curve viewer ready</output>
            </section>
          </div>
        </section>
        <section class="workspace-panel" id="pyrplconfig-panel" data-panel-id="pyrplconfig" hidden>
          <header class="panel-header">
            <div><h2>Configuration</h2></div>
            <div class="action-row">
              <button id="config-refresh" type="button">Refresh</button>
              <button id="config-save" type="button">Save</button>
            </div>
          </header>
          <div class="panel-content config-content">
            <div class="config-toolbar">
              <label><span>Config file</span><output id="config-file"></output></label>
              <label><span>Module</span><select id="config-module"></select></label>
              <output id="config-status">Configuration loading...</output>
            </div>
            <textarea id="config-text" class="config-editor" spellcheck="false" aria-label="Configuration YAML"></textarea>
          </div>
        </section>
        <section class="workspace-panel" id="lockbox-panel" data-panel-id="lockbox" hidden>
        <header class="panel-header">
          <div>
            <h2>Lockbox</h2>
            <p>Model-based feedback sequence</p>
          </div>
          <div class="lockbox-header-controls">
            <label>
              <span>Class</span>
              <select id="lockbox-class"></select>
            </label>
            <div class="actions" id="lockbox-actions"></div>
          </div>
        </header>
        <div class="panel-content lockbox-content">
          <section class="module-panel lockbox-overview">
            <div class="control-row lockbox-attributes" id="lockbox-attributes"></div>
            <output id="lockbox-status">Lockbox loading...</output>
          </section>
          <section class="lockbox-grid">
            <div class="lockbox-column">
              <header class="lockbox-section-header">
                <h3>Inputs</h3>
                <label><span>Plot</span><select id="lockbox-input-plot-select"></select></label>
              </header>
              <div id="lockbox-inputs"></div>
              <div class="lockbox-plot" id="lockbox-input-plot"></div>
            </div>
            <div class="lockbox-column">
              <header class="lockbox-section-header">
                <h3>Outputs</h3>
                <label><span>Plot</span><select id="lockbox-output-plot-select"></select></label>
              </header>
              <div id="lockbox-outputs"></div>
              <div class="lockbox-plot" id="lockbox-output-plot"></div>
            </div>
            <div class="lockbox-column lockbox-sequence-column">
              <header class="lockbox-section-header">
                <h3>Sequence</h3>
                <button id="lockbox-add-stage" type="button">Add Stage</button>
              </header>
              <div id="lockbox-stages"></div>
            </div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="housekeeping-panel" data-panel-id="housekeeping" hidden>
        <header class="panel-header">
          <div>
            <h2>Housekeeping</h2>
            <p>LED and expansion I/O</p>
          </div>
        </header>
        <div class="panel-content">
          <section class="module-panel housekeeping-panel">
            <div class="control-row housekeeping-top-row">
              <label>
                <span>LED</span>
                <input id="hk-led" type="number" min="0" max="255" step="1" />
              </label>
              <button id="hk-refresh" type="button">Refresh</button>
              <output id="hk-status">Housekeeping ready</output>
            </div>
            <div class="housekeeping-grid" id="hk-expansion-grid"></div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="telemetry-panel" data-panel-id="telemetry" hidden>
        <header class="panel-header">
          <div>
            <h2>Sampler &amp; AMS</h2>
            <p>FPGA signal readback and auxiliary analog outputs</p>
          </div>
          <button id="telemetry-refresh" type="button">Refresh</button>
        </header>
        <div class="panel-content telemetry-layout">
          <section class="module-panel telemetry-section">
            <header class="instrument-card-header">
              <h3>Sampler</h3>
              <output id="sampler-status">Sampler ready</output>
            </header>
            <div class="sampler-grid" id="sampler-grid"></div>
            <div class="control-row sampler-stats-controls">
              <label><span>Signal</span><select id="sampler-stats-signal"></select></label>
              <label><span>Duration</span><input id="sampler-stats-duration" type="number" min="0" max="10" step="0.001" value="0.01" /></label>
              <button id="sampler-stats-run" type="button">Statistics</button>
              <output id="sampler-stats-output">No statistics acquired</output>
            </div>
          </section>
          <section class="module-panel telemetry-section">
            <header class="instrument-card-header">
              <h3>AMS</h3>
              <output id="ams-status">AMS ready</output>
            </header>
            <div class="control-row ams-controls">
              ${[0,1,2,3].map(t=>`
                <label>
                  <span>DAC${t}</span>
                  <input id="ams-dac${t}" type="number" min="0" max="1.8" step="0.0002197265625" ${t<2?"readonly":""} />
                </label>
              `).join("")}
            </div>
          </section>
        </div>
        </section>
        <section class="workspace-panel" id="registers-panel" data-panel-id="registers" hidden>
        <header class="panel-header">
          <div>
            <h2>Register Debug</h2>
            <p>Raw monitor_server register read/write</p>
          </div>
        </header>
        <div class="panel-content register-panel-content">
          <section class="module-panel register-panel">
            <div class="control-row register-row">
              <label>
                <span>Read Addr</span>
                <input id="register-read-addr" type="text" value="0x40100014" />
              </label>
              <label>
                <span>Length</span>
                <input id="register-read-length" type="number" min="1" max="64" step="1" value="1" />
              </label>
              <button id="register-read" type="button">Read</button>
              <label>
                <span>Write Addr</span>
                <input id="register-write-addr" type="text" value="0x40100014" />
              </label>
              <label>
                <span>Values</span>
                <input id="register-write-values" type="text" value="8192" />
              </label>
              <button id="register-write" type="button">Write</button>
            </div>
            <output id="register-status">Register debug ready</output>
            <textarea id="register-output" readonly spellcheck="false"></textarea>
          </section>
        </div>
        </section>
        <section class="empty-workspace" id="empty-workspace" hidden>
          <h2>No Panels Enabled</h2>
          <p>Use Panels to enable an instrument.</p>
        </section>
      </div>
    </main>

  </section>
`;const Ku=document.createElement("style");Ku.textContent=`
  :root {
    color-scheme: dark;
    --bg: #0d1114;
    --panel: #12191e;
    --panel-border: #27343d;
    --text: #edf4f7;
    --muted: #9aacb6;
    --button: #1d272e;
    --button-hover: #283640;
    --plot-bg: #05080a;
    --plot-text: #edf4f7;
    --plot-axis: #93a7b3;
    --plot-grid: #1c2a33;
    --plot-yellow: #f2c94c;
    --plot-magenta: #f05bd7;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  #app {
    height: 100%;
    min-height: 0;
  }

  .shell {
	    display: grid;
	    grid-template-rows: auto minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    gap: 8px;
    padding: 8px;
    overflow: hidden;
  }

	  .topbar,
    .workspace-panel,
	  .module-panel,
	  .plot-panel,
    .empty-workspace {
    border: 1px solid var(--panel-border);
    background: var(--panel);
  }

  .topbar {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 6px 10px;
  }

  h1 {
    margin: 0;
    font-size: 17px;
    font-weight: 680;
    letter-spacing: 0;
  }

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 650;
    letter-spacing: 0;
  }

  p {
    margin: 2px 0 0;
    color: var(--muted);
    font-size: 11px;
  }

  .menubar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .control-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .control-strip output {
    max-width: 260px;
    overflow: hidden;
    color: var(--muted);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .control-strip.is-controller output,
  .control-strip.is-shared output {
    color: #63d98d;
  }

  .control-strip.is-observer output {
    color: #f0c15a;
  }

  .menu-dropdown {
    position: relative;
  }

  .menu-dropdown summary {
    display: inline-flex;
    align-items: center;
    height: 28px;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: var(--button);
    color: var(--text);
    cursor: pointer;
    font-size: 13px;
    list-style: none;
    padding: 0 10px;
  }

  .menu-dropdown summary::-webkit-details-marker {
    display: none;
  }

  .menu-content {
    position: absolute;
    right: 0;
    z-index: 5;
    min-width: 160px;
    margin-top: 6px;
    border: 1px solid var(--panel-border);
    background: #090d10;
    box-shadow: 0 12px 30px rgb(0 0 0 / 0.35);
    padding: 8px;
  }

  .menu-check {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 30px;
    color: var(--text);
    font-size: 13px;
    white-space: nowrap;
  }

  .menu-field {
    display: grid;
    gap: 4px;
    margin-top: 6px;
    padding-top: 8px;
    border-top: 1px solid var(--panel-border);
    color: var(--muted);
    font-size: 12px;
  }

  .menu-field select {
    height: 30px;
  }

  .actions,
  .action-row,
  .zoom-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .actions {
    flex-direction: column;
    align-items: flex-end;
  }

  button {
    min-width: 0;
    height: 24px;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: var(--button);
    color: var(--text);
    font: inherit;
    font-size: 11px;
    padding: 0 7px;
  }

  .plot-button {
    width: 30px;
    padding: 0 4px;
  }

  .curve-name-input {
    width: 130px !important;
    height: 24px !important;
  }

  select {
    height: 28px;
    width: 100%;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #090d10;
    color: var(--text);
    font: inherit;
    font-size: 12px;
    padding: 0 8px;
  }

  input[type="number"],
  input[type="text"] {
    height: 28px;
    width: 100%;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #090d10;
    color: var(--text);
    font: inherit;
    font-size: 12px;
    padding: 0 8px;
  }

  .select-control,
  .toggle-control {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-size: 12px;
  }

  .select-control {
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .toggle-control {
    height: 28px;
    white-space: nowrap;
  }

  .toggle-control input {
    accent-color: #4fd17f;
  }

  .segmented-control {
    position: relative;
    display: flex;
    align-items: end;
    height: 48px;
    min-width: 230px;
    margin: 0;
    padding: 19px 0 0;
    border: 0;
  }

  .segmented-control legend {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--muted);
    font-size: 11px;
    line-height: 14px;
  }

  .segmented-control label {
    position: relative;
    display: block;
  }

  .segmented-control input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
  }

  .segmented-control span {
    display: grid;
    height: 28px;
    padding: 0 8px;
    place-items: center;
    border: 1px solid #53616b;
    color: var(--muted);
    cursor: pointer;
    pointer-events: none;
  }

  .segmented-control label:first-of-type span {
    border-radius: 6px 0 0 6px;
  }

  .segmented-control label:last-of-type span {
    border-left: 0;
    border-radius: 0 6px 6px 0;
  }

  .segmented-control input:checked + span {
    background: #344550;
    color: var(--text);
  }

  .segmented-control:disabled span {
    cursor: not-allowed;
    opacity: 0.45;
  }

  button:hover {
    background: var(--button-hover);
  }

	  .plot-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 8px;
    min-height: 0;
    padding: 8px;
    overflow: hidden;
	  }

  .workspace {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    height: 100%;
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-tabs {
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    overflow: hidden;
  }

  .workspace-tabs:empty {
    display: none;
  }

  .workspace-tabs[hidden] {
    display: none;
  }

  .workspace.is-split-workspace {
    row-gap: 0;
  }

  .workspace-tab {
    height: 28px;
    border-color: var(--panel-border);
    background: #0f1519;
    color: var(--muted);
  }

  .workspace-tab.is-active {
    border-color: #71828e;
    background: var(--panel);
    color: var(--text);
  }

  .workspace-pane-selector {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    min-width: 0;
    color: var(--muted);
    font-size: 11px;
  }

  .workspace-pane-selector select {
    min-width: 116px;
    max-width: 180px;
  }

  .workspace-panel {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-panel[hidden],
  .empty-workspace[hidden] {
    display: none;
  }

  .workspace-panels {
    grid-row: 2;
    align-self: stretch;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-panels.is-tabs {
    display: block;
  }

  .workspace-panels.is-split {
    display: flex;
    height: auto;
    min-width: 0;
    align-items: stretch;
  }

  .workspace-panels.is-split > .workspace-panel {
    height: 100%;
    min-height: 0;
    min-width: 0;
  }

  .workspace-panels.is-horizontal {
    flex-direction: row;
  }

  .workspace-panels.is-vertical {
    flex-direction: column;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 42px;
    border-bottom: 1px solid var(--panel-border);
    padding: 5px 8px;
    flex-wrap: wrap;
  }

  .spectrum-header {
    min-height: 42px;
    padding-block: 5px;
  }

  .network-content {
    display: flex;
  }

  .network-controls-pane {
    padding: 6px;
    overflow: auto;
  }

  .network-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
    gap: 6px;
  }

  .network-control-group {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    min-width: 0;
    margin: 0;
    border: 1px solid var(--panel-border);
    padding: 5px;
  }

  .network-control-group legend {
    color: var(--muted);
    font-size: 11px;
  }

  .network-control-group label {
    display: grid;
    min-width: 0;
    gap: 2px;
    color: var(--muted);
    font-size: 10px;
  }

  .network-plots {
    display: grid;
    grid-template-rows: repeat(2, minmax(0, 1fr));
    min-height: 240px;
    gap: 6px;
    overflow: hidden;
  }

  .network-plot-frame {
    position: relative;
    min-height: 0;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .panel-content.curve-viewer-content {
    display: flex;
    flex-direction: row;
  }

  .curve-viewer-list-pane,
  .curve-viewer-params-pane {
    display: grid;
    min-width: 0;
    gap: 6px;
    padding: 6px;
    overflow: hidden;
  }

  .curve-viewer-list-pane label,
  .curve-viewer-params-pane label {
    display: grid;
    min-height: 0;
    gap: 3px;
    color: var(--muted);
    font-size: 11px;
  }

  #curve-viewer-select {
    height: 100%;
  }

  #curve-viewer-params {
    width: 100%;
    min-height: 0;
    resize: none;
    border: 1px solid #53616b;
    background: #090d10;
    color: var(--text);
    font: 11px ui-monospace, SFMono-Regular, Menlo, monospace;
    padding: 6px;
  }

  .curve-viewer-params-pane {
    grid-template-rows: auto minmax(96px, 1fr) auto;
    overflow: auto;
  }

  .curve-viewer-plot-pane {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    min-height: 0;
    gap: 6px;
    overflow: hidden;
  }

  .curve-viewer-plot-pane.is-complex {
    grid-template-rows: repeat(2, minmax(0, 1fr));
  }

  .curve-viewer-plot-frame {
    min-height: 0;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .panel-header p {
    margin-top: 2px;
    font-size: 12px;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 6px;
    padding: 6px;
    overflow: hidden;
  }

  .split-pane {
    min-height: 0;
    overflow: hidden;
  }

  .gutter {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    background: #27343d;
  }

  .gutter.gutter-vertical {
    height: 8px;
    cursor: row-resize;
  }

  .gutter.gutter-horizontal {
    width: 8px;
    cursor: col-resize;
  }

  .gutter.gutter-vertical::before {
    display: block;
    width: 44px;
    height: 2px;
    background: #71828e;
    content: "";
  }

  .gutter.gutter-horizontal::before {
    display: block;
    width: 2px;
    height: 44px;
    background: #71828e;
    content: "";
  }

  .gutter:hover,
  .gutter:active {
    background: #344550;
  }

  .empty-workspace {
    display: grid;
    height: 100%;
    place-content: center;
    gap: 6px;
    color: var(--muted);
    text-align: center;
  }

  .register-panel-content {
    display: block;
  }

  .register-panel {
    height: 100%;
    align-content: start;
  }

  .register-row {
    grid-template-columns: minmax(130px, 1fr) minmax(80px, 0.4fr) auto minmax(130px, 1fr) minmax(160px, 1fr) auto;
  }

  .instrument-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
    align-items: start;
    overflow: auto;
  }

  .instrument-card {
    align-content: start;
  }

  .instrument-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .instrument-card-header h3 {
    margin: 0;
    font-size: 14px;
  }

  .instrument-card-header output {
    min-height: 24px;
    text-align: right;
  }

  .asg-row {
    grid-template-columns: repeat(4, minmax(92px, 1fr)) repeat(3, auto);
  }

  .generic-module-row {
    grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  }

  .spectrum-module-row {
    grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
  }

  .spectrum-module-row label {
    min-width: 0;
  }

  .spectrum-module-row label[hidden] {
    display: grid;
    visibility: hidden;
    pointer-events: none;
  }

  .iir-card {
    grid-column: 1 / -1;
    min-height: 0;
    display: grid;
    grid-template-rows: auto auto auto;
  }

  .iir-card .generic-module-row {
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  }

  .iir-plot {
    min-height: 0;
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 8px;
  }

  .iir-plot-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: var(--muted);
    font-size: 11px;
  }

  .iir-plot-toolbar button {
    padding: 4px 10px;
    min-height: 26px;
  }

  .iir-plot-grid {
    display: grid;
    grid-template-rows: repeat(2, clamp(360px, 40vh, 520px));
    gap: 8px;
    min-height: 0;
    overflow: hidden;
  }

  .iir-plot-frame {
    min-width: 0;
    min-height: 0;
    position: relative;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .iir-list-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(170px, 1fr));
    gap: 8px;
    min-height: 0;
  }

  .iir-list-editor {
    display: grid;
    gap: 5px;
    min-width: 0;
    border: 1px solid var(--border);
    padding: 6px;
  }

  .iir-list-editor header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 48px 26px 26px;
    align-items: center;
    gap: 4px;
  }

  .iir-list-editor header span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 11px;
    color: var(--muted);
  }

  .iir-list-editor button {
    min-width: 0;
    padding: 3px 0;
  }

  .iir-list-values {
    display: grid;
    gap: 3px;
    max-height: 116px;
    overflow: auto;
  }

  .iir-list-value {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    align-items: center;
    gap: 4px;
    padding: 2px;
  }

  .iir-list-value.is-selected {
    outline: 1px solid var(--plot-yellow);
    background: rgba(242, 201, 76, 0.08);
  }

  .iir-marker {
    position: absolute;
    width: 18px;
    height: 18px;
    margin-left: -9px;
    margin-top: -9px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--plot-yellow);
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    cursor: grab;
    z-index: 4;
  }

  .iir-marker.is-zero {
    color: var(--plot-magenta);
  }

  .iir-marker.is-complex {
    font-size: 16px;
  }

  .iir-marker.is-selected,
  .iir-marker.is-dragging {
    outline: 2px solid var(--plot-yellow);
    background: rgba(242, 201, 76, 0.14);
  }

  .module-panel.is-owned {
    opacity: 0.62;
  }

  .spectrum-content {
    min-height: 0;
    padding: 8px;
  }

  .spectrum-controls {
    min-height: 0;
    align-content: start;
    overflow: auto;
  }

  .spectrum-controls .module-panel {
    border: 0;
    padding: 0;
  }

  .spectrum-plot-panel {
    min-height: 0;
  }

  .housekeeping-panel {
    align-content: start;
    overflow: auto;
  }

  .telemetry-layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr);
    gap: 8px;
    align-content: start;
  }

  .telemetry-section {
    min-width: 0;
  }

  .sampler-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 4px 8px;
    margin-bottom: 8px;
  }

  .sampler-reading {
    display: grid;
    grid-template-columns: minmax(38px, auto) minmax(0, 1fr);
    gap: 5px;
    align-items: baseline;
    padding: 3px 5px;
    border-bottom: 1px solid var(--panel-border);
  }

  .sampler-reading span {
    color: var(--muted);
  }

  .sampler-reading output {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .sampler-stats-controls output {
    min-width: min(100%, 360px);
    font-variant-numeric: tabular-nums;
  }

  .ams-controls input[readonly] {
    color: var(--muted);
    cursor: default;
  }

  @media (max-width: 760px) {
    .telemetry-layout {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .lockbox-header-controls {
    display: grid;
    grid-template-columns: minmax(150px, 220px) auto;
    align-items: end;
    gap: 8px;
  }

  .config-content {
    display: grid;
    grid-template-rows: auto minmax(360px, 1fr);
    gap: 8px;
    padding: 8px;
    min-height: 0;
  }

  .config-toolbar {
    display: flex;
    align-items: end;
    gap: 10px;
    min-width: 0;
    flex-wrap: wrap;
  }

  .config-toolbar label {
    display: grid;
    gap: 3px;
    min-width: 160px;
  }

  .config-toolbar label:first-child {
    flex: 1 1 360px;
  }

  #config-file {
    overflow-wrap: anywhere;
  }

  .config-editor {
    box-sizing: border-box;
    width: 100%;
    min-height: 360px;
    resize: none;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: #11161c;
    color: var(--text);
    padding: 10px;
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  #lockbox-actions {
    display: flex;
    flex-flow: row nowrap;
    align-items: end;
    justify-content: flex-end;
    gap: 6px;
  }

  #lockbox-actions button {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .lockbox-header-controls label {
    display: grid;
    gap: 3px;
  }

  .lockbox-header-controls label span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-content {
    overflow: hidden;
  }

  .lockbox-overview {
    flex: 0 0 auto;
  }

  .lockbox-attributes {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  }

  .lockbox-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    flex: 1 1 0;
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .lockbox-column {
    display: grid;
    grid-template-rows: auto max-content auto;
    align-content: start;
    gap: 6px;
    min-width: 0;
    min-height: 0;
  }

  .lockbox-sequence-column {
    grid-template-rows: auto minmax(0, 1fr);
  }

  .lockbox-section-header,
  .lockbox-card-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .lockbox-section-header h3,
  .lockbox-card-title h3 {
    margin: 0;
    font-size: 13px;
  }

  .lockbox-section-header label {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .lockbox-section-header label span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-section-header select {
    min-width: 110px;
  }

  .lockbox-card-title span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-card-actions {
    display: flex;
    gap: 4px;
  }

  #lockbox-inputs,
  #lockbox-outputs,
  #lockbox-stages {
    display: grid;
    gap: 6px;
  }

  #lockbox-stages {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: max-content;
    align-content: start;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  .lockbox-card {
    display: grid;
    gap: 8px;
    min-width: 0;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 6px;
  }

  .lockbox-stage-card {
    align-content: start;
    height: var(--lockbox-stage-height, auto);
  }

  .lockbox-control-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
    gap: 6px;
    align-items: end;
  }

  .lockbox-card label {
    display: grid;
    gap: 3px;
  }

  .lockbox-card label span {
    color: var(--muted);
    font-size: 11px;
  }

  .lockbox-card label.is-disabled {
    opacity: 0.5;
  }

  .lockbox-stage-output-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 6px;
  }

  .lockbox-stage-output {
    display: grid;
    gap: 6px;
    min-width: 0;
    border: 1px solid #1e2a31;
    border-radius: 6px;
    padding: 6px;
  }

  .lockbox-stage-output h4 {
    margin: 0;
    font-size: 12px;
  }

  .lockbox-stage-output label {
    display: grid;
    gap: 3px;
  }

  .lockbox-plot {
    min-width: 0;
    min-height: 224px;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .lockbox-plot,
  .lockbox-plot * {
    pointer-events: none;
  }

  .lockbox-plot > .uplot {
    max-width: 100%;
    max-height: 100%;
  }

  #lockbox-output-plot {
    display: grid;
    grid-template-rows: repeat(2, minmax(224px, 1fr));
    gap: 6px;
    min-height: 454px;
  }

  .lockbox-output-plot-frame {
    min-width: 0;
    min-height: 0;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  .housekeeping-top-row {
    grid-template-columns: minmax(110px, 180px) auto minmax(180px, 1fr);
  }

  .housekeeping-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 8px;
  }

  .housekeeping-bank {
    display: grid;
    gap: 6px;
    padding: 8px;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
  }

  .housekeeping-bank h3 {
    margin: 0;
    font-size: 13px;
  }

  .housekeeping-pin {
    display: grid;
    grid-template-columns: 36px minmax(80px, 1fr) minmax(96px, 1fr);
    align-items: center;
    gap: 8px;
  }

  #register-output {
    width: 100%;
    min-height: 260px;
    resize: none;
    border: 1px solid #53616b;
    border-radius: 6px;
    background: #05080a;
    color: var(--text);
    font: 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    padding: 10px;
  }
	
	  .module-panel {
	    display: grid;
	    grid-template-columns: 1fr;
	    align-items: end;
	    gap: 6px;
	    min-height: 0;
	    padding: 8px;
	    overflow: hidden;
	  }

    .control-row {
      display: grid;
      align-items: end;
      gap: 6px;
    }

    .signal-row {
      grid-template-columns: minmax(170px, 1.3fr) minmax(170px, 1.3fr) minmax(110px, 0.8fr) minmax(150px, auto) minmax(110px, 0.8fr) repeat(2, minmax(58px, auto));
    }

    .tune-row {
      grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    }

    .channel-control {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: end;
      gap: 8px;
    }
	
	  .module-panel label,
    .control-row label {
	    display: grid;
	    gap: 3px;
	  }

    .module-panel label[hidden],
    .control-row label[hidden] {
      display: none;
    }

    .module-panel .spectrum-module-row label[hidden] {
      display: grid;
      visibility: hidden;
      pointer-events: none;
    }
	
	  .module-panel label span {
	    color: var(--muted);
	    font-size: 11px;
	  }

  .control-row label.toggle-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
  }

  .plot-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  output {
    min-height: 36px;
    align-content: center;
    overflow: hidden;
    color: var(--muted);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #scope-plot,
  #spectrum-plot {
    min-width: 0;
    min-height: 0;
    height: 100%;
    contain: size layout;
    overflow: hidden;
    background: var(--plot-bg);
  }

  #scope-plot > .uplot,
  #spectrum-plot > .uplot,
  .iir-plot-frame > .uplot,
  .lockbox-plot > .uplot {
    max-width: 100%;
    max-height: 100%;
  }

  .uplot {
    color: var(--plot-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  .uplot .u-title,
  .uplot .u-legend,
  .uplot .u-legend th,
  .uplot .u-legend td {
    color: var(--plot-text);
  }

  .uplot .u-cursor-x,
  .uplot .u-cursor-y {
    border-color: var(--plot-axis);
  }

  .uplot .u-over {
    cursor: crosshair;
    touch-action: none;
  }

  .uplot .u-over.is-panning {
    cursor: grabbing;
  }

  .uplot .u-over.is-zooming {
    cursor: ew-resize;
  }

  @media (max-width: 680px) {
    body {
      height: auto;
      min-height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
    }

    #app,
    .shell {
      height: auto;
      min-height: 100dvh;
    }

    .shell {
      grid-template-rows: auto auto;
      width: 100%;
      max-width: 100vw;
      overflow: visible;
    }

    .topbar {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 6px;
    }

    .topbar > div:first-child {
      min-width: 0;
    }

    #session-line {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .menubar {
      flex-direction: row;
      align-items: center;
      gap: 6px;
      margin-left: 0;
    }

    .control-strip output {
      max-width: 110px;
    }

    .menu-content {
      left: auto;
      right: 0;
      max-height: min(70dvh, 520px);
      overflow: auto;
    }

    .workspace {
      grid-template-rows: auto auto;
      overflow: visible;
    }

    .workspace-tabs {
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
    }

    .workspace-tab {
      flex: 0 0 auto;
    }

    .workspace-panels,
    .workspace-panel,
    .panel-content,
    .split-pane,
    .module-panel,
    .plot-panel,
    .lockbox-content,
    #lockbox-stages {
      min-width: 0;
      max-width: 100%;
      height: auto;
      min-height: 0;
      overflow: visible;
    }

    .workspace-panel {
      grid-template-rows: auto auto;
    }

    .panel-header {
      align-items: stretch;
      flex-direction: column;
      gap: 6px;
    }

    .actions {
      align-items: flex-start;
      gap: 4px;
      min-width: 0;
      max-width: 100%;
    }

    .action-row,
    .zoom-actions,
    #lockbox-actions {
      width: 100%;
      min-width: 0;
      max-width: 100%;
      gap: 4px;
      flex-wrap: wrap;
      justify-content: flex-start;
    }

    .actions button,
    .zoom-actions button {
      flex: 0 0 auto;
    }

    .module-panel,
    .plot-toolbar {
      align-items: stretch;
      min-width: 0;
      max-width: 100%;
    }

    .plot-toolbar output {
      min-width: 0;
      max-width: 100%;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .panel-content > .split-pane,
    .network-content > .split-pane,
    .curve-viewer-content > .split-pane {
      width: auto !important;
      height: auto !important;
      flex-basis: auto !important;
    }

    .panel-content > .gutter,
    .network-content > .gutter,
    .curve-viewer-content > .gutter {
      display: none;
    }

    #scope-plot-pane,
    .spectrum-plot-panel {
      height: 360px !important;
      min-height: 360px;
    }

    .spectrum-content,
    .network-content,
    .curve-viewer-content {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr);
      height: auto !important;
      overflow: visible;
    }

    .network-plots {
      height: 520px !important;
      min-height: 520px;
    }

    .lockbox-grid,
    .lockbox-header-controls {
      grid-template-columns: minmax(0, 1fr);
    }

    .lockbox-column,
    .lockbox-sequence-column {
      grid-template-rows: auto;
    }

    .signal-row,
    .tune-row,
    .register-row {
      grid-template-columns: minmax(0, 1fr);
    }

    .module-panel output {
      grid-column: 1 / -1;
    }
  }
`;document.head.appendChild(Ku);const Ym=b("#scope-plot");b("#scope-panel-content");const $r=b("#scope-controls-pane"),Zu=b("#scope-plot-pane");b("#spectrum-panel-content");const Ju=b("#spectrum-controls-pane"),Qu=b("#spectrum-plot-pane"),ya=b("#panel-menu"),Hm=b("#workspace"),Sa=b("#workspace-tabs"),Ui=b("#workspace-panels"),ep=b("#scope-panel"),jm=b("#asg-panel"),Wm=b("#pid-panel"),Um=b("#iq-panel"),Xm=b("#iir-panel"),Gm=b("#trig-panel"),Km=b("#pwm-panel"),tp=b("#spectrumanalyzer-panel"),Zm=b("#networkanalyzer-panel"),np=b("#curveviewer-panel"),Jm=b("#pyrplconfig-panel"),sp=b("#lockbox-panel"),Qm=b("#housekeeping-panel"),eg=b("#telemetry-panel"),tg=b("#registers-panel"),ws={scope:ep,asg:jm,pid:Wm,iq:Um,iir:Xm,trig:Gm,pwm:Km,spectrumanalyzer:tp,networkanalyzer:Zm,curveviewer:np,pyrplconfig:Jm,lockbox:sp,housekeeping:Qm,telemetry:eg,registers:tg},ng=b("#empty-workspace"),nn=b("#status"),nt=b("#connect-scope"),fn=b("#single-frame"),Gs=b("#stop-scope"),Or=b("#scope-current-average"),Ks=b("#save-curve"),xs=b("#scope-curve-name"),sg=b("#zoom-out"),ig=b("#zoom-in"),ag=b("#zoom-y-out"),og=b("#zoom-y-in"),rg=b("#pan-left"),lg=b("#pan-right"),cg=b("#pan-up"),ug=b("#pan-down"),pg=b("#zoom-reset"),mn=b("#show-ch1"),gn=b("#show-ch2"),pi=b("#scope-input1"),hi=b("#scope-input2"),jn=b("#scope-trigger"),hg=b("#scope-trigger-mode"),Xi=b("#scope-trigger-normal"),Wn=b("#scope-trigger-rolling"),_n=b("#scope-duration"),di=b("#scope-average"),ys=b("#scope-xy-mode"),Ss=b("#scope-math-active"),Un=b("#scope-math-formula"),Ln=b("#scope-trace-average"),Xn=b("#scope-trigger-delay"),Gn=b("#scope-threshold"),Kn=b("#scope-hysteresis"),Et=b("#scope-state-select"),yi=b("#scope-state-name"),ip=b("#scope-state-save"),ap=b("#scope-state-load"),op=b("#scope-state-delete"),Yi=b("#register-status"),J=b("#module-status"),Zn=b("#hk-status"),dg=b("#telemetry-refresh"),Bc=b("#sampler-grid"),rp=b("#sampler-status"),nr=b("#sampler-stats-signal"),fg=b("#sampler-stats-duration"),sr=b("#sampler-stats-run"),ir=b("#sampler-stats-output"),Ja=b("#ams-status"),ni=[0,1,2,3].map(t=>b(`#ams-dac${t}`)),Do=new Map,Aa=b("#hk-led"),mg=b("#hk-refresh"),qc=b("#hk-expansion-grid"),gg=b("#pid-modules"),vg=b("#iq-modules"),bg=b("#iir-modules"),wg=b("#trig-modules"),xg=b("#pwm-modules"),yg=b("#spectrum-modules"),Sg=b("#spectrum-plot"),Ot=b("#spectrum-status"),kn=b("#spectrum-single"),ht=b("#spectrum-run"),$i=b("#spectrum-stop"),lp=b("#spectrum-current-average"),Zs=b("#spectrum-save-curve"),Gi=b("#spectrum-curve-name"),kg=b("#spectrum-zoom-out"),Mg=b("#spectrum-zoom-in"),Cg=b("#spectrum-zoom-y-out"),Eg=b("#spectrum-zoom-y-in"),Pg=b("#spectrum-pan-left"),Ag=b("#spectrum-pan-right"),zg=b("#spectrum-pan-up"),_g=b("#spectrum-pan-down"),Lg=b("#spectrum-zoom-reset"),Bt=new Pm(b("#network-controls"),b("#network-magnitude-plot"),b("#network-phase-plot"),b("#network-status"),b("#network-single"),b("#network-run"),b("#network-stop"),b("#network-save"),b("#network-reset")),Ki=new zm(np,b(".curve-viewer-list-pane"),b(".curve-viewer-plot-pane"),b(".curve-viewer-params-pane"),b("#curve-viewer-select"),b("#curve-viewer-name"),b("#curve-viewer-params"),b("#curve-viewer-status"),b("#curve-viewer-save-params"),b("#curve-viewer-delete"),b("#curve-viewer-refresh")),bn=new Sm({root:sp,classSelect:b("#lockbox-class"),status:b("#lockbox-status"),actions:b("#lockbox-actions"),inputs:b("#lockbox-inputs"),outputs:b("#lockbox-outputs"),stages:b("#lockbox-stages"),addStage:b("#lockbox-add-stage"),inputPlot:b("#lockbox-input-plot"),outputPlot:b("#lockbox-output-plot"),inputPlotSelect:b("#lockbox-input-plot-select"),outputPlotSelect:b("#lockbox-output-plot-select")}),Fg=new Tm({file:b("#config-file"),module:b("#config-module"),text:b("#config-text"),refresh:b("#config-refresh"),save:b("#config-save"),status:b("#config-status")}),Vc=b("#session-line"),si=b("#control-status"),Ma=b("#take-control"),Yc=si.parentElement;Om({readAddr:b("#register-read-addr"),readLength:b("#register-read-length"),readButton:b("#register-read"),writeAddr:b("#register-write-addr"),writeValues:b("#register-write-values"),writeButton:b("#register-write"),status:Yi,output:b("#register-output")});const Dr=["asg0","asg1"],ks={asg0:jc("asg0"),asg1:jc("asg1")},Tg={pid:["pid0","pid1","pid2"],iq:["iq0","iq1","iq2"],iir:["iir"],trig:["trig"],pwm:["pwm0","pwm1"],spectrumanalyzer:["spectrumanalyzer"]},Ig={pid:gg,iq:vg,iir:bg,trig:wg,pwm:xg,spectrumanalyzer:yg},Dt=new Map,Rg=[pi,hi,jn,Xi,Wn,_n,di,ys,Ss,Un,Ln,Xn,Gn,Kn,Et,yi,ip,ap,op,xs];let U=new um(Ym,t=>{nn.textContent=t},t=>{Or.textContent=`${t} / ${Ln.value||"1"}`}),me=new dm(Sg,t=>{Ot.textContent=t;const e=me.getRbw(),n=Dt.get("spectrumanalyzer")?.inputs.get("rbw");n&&e!==void 0&&(n.value=String(e))},t=>{const e=Dt.get("spectrumanalyzer")?.inputs.get("trace_average");lp.textContent=`${t} / ${e?.value||"1"}`}),rt=null,qn=null;const Hc=new Ka(()=>kp());let cp=0,wt="stopped";const up=new Map;let Br=!1;const za=new Map;let bt="observer",En="stopped",pp="stop",E=Bm(),hp=null,_a=null,La=null,Fa=null,ar=null,or="";function Qn(t){Wu(t),bt!=="observer"&&fetch("/api/workspace",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspace:t})}).catch(()=>{})}async function Ng(){if(bt==="observer")return;const t=await fetch("/api/workspace");if(!t.ok)return;const e=await t.json();e.workspace&&typeof e.workspace=="object"?(E=ju(e.workspace),Wu(E)):Qn(E)}function $g(){window.pyrplScope={getFrameSequence:()=>U.getFrameSequence(),getSampleCount:()=>U.getSampleCount(),getXRange:()=>U.getXRange(),getYRange:()=>U.getYRange(),getScopeTimeLabels:()=>U.getFormattedTimeLabelsForCurrentRange(),isChannelVisible:t=>U.getChannelVisible(t),getEventCount:()=>cp,getTraceAverage:()=>U.getTraceAverage(),getRunningState:()=>wt,isPanelEnabled:t=>E.panels[t]?.enabled??!1,getScopeSplitSizes:()=>E.panels.scope.splitSizes??[28,72],getWorkspaceLayoutMode:()=>E.layoutMode,getWorkspaceSplitSizes:()=>E.workspaceSplitSizes,getWorkspaceSplitPanelIds:()=>E.splitPanelIds,getActivePanelId:()=>E.activePanelId,getCsvLineCount:()=>U.exportCsv().trimEnd().split(`
`).length,getDisplayedStats:()=>U.getDisplayedStats(),getDisplayedDataFingerprint:()=>U.getDisplayedDataFingerprint(),getScopeMathStats:()=>U.getMathStats(),getScopeXyStats:()=>U.getXyStats(),moduleStatusText:()=>J.textContent??"",statusText:()=>nn.textContent??"",getSpectrumSeriesCount:()=>me.getSeriesCount(),getSpectrumBinCount:()=>me.getBinCount(),getSpectrumAverageCount:()=>me.getAverageCount(),getSpectrumXRange:()=>me.getXRange(),getSpectrumYRange:()=>me.getYRange(),getSpectrumCurveData:()=>me.getCurveData(),getNetworkAnalyzerCurveData:()=>Bt.getCurveData(),getIirXRange:()=>rt?.getXRange()??null,getIirMagnitudeYRange:()=>rt?.getMagnitudeYRange()??null,getIirPhaseYRange:()=>rt?.getPhaseYRange()??null,getLockboxClassname:()=>bn.getClassname(),getLockboxStageCount:()=>bn.getStageCount()}}function On(t,e){return`#${t}-${e.replaceAll("_","-")}`}function jc(t){return{status:b(`#${t}-status`),waveform:b(On(t,"waveform")),frequency:b(On(t,"frequency")),amplitude:b(On(t,"amplitude")),offset:b(On(t,"offset")),triggerSource:b(On(t,"trigger_source")),outputDirect:b(On(t,"output_direct")),startPhase:b(On(t,"start_phase")),cyclesPerBurst:b(On(t,"cycles_per_burst")),setup:b(`#${t}-setup`),trigger:b(`#${t}-trigger`),off:b(`#${t}-off`)}}function Si(){Hm.classList.toggle("is-split-workspace",E.layoutMode!=="tabs"),Og(),Dg();const t=Qa(),e=E.layoutMode==="tabs"?[]:E.splitPanelIds,n=E.layoutMode!=="tabs"&&e.length>0,s=n?e:E.activePanelId?[E.activePanelId]:[],i=new Set(s),a=t.length>0;Ui.className=`workspace-panels ${n?`is-split ${E.layoutMode==="split-horizontal"?"is-horizontal":"is-vertical"}`:"is-tabs"}`;for(const[o,l]of Object.entries(ws))l.hidden=!i.has(o);Bg(s),ng.hidden=a,n&&s.length>1?jg(s):dp(),i.has("scope")?(qg(),window.requestAnimationFrame(()=>U.refreshLayout())):Vg(),i.has("spectrumanalyzer")?(Yg(),window.requestAnimationFrame(()=>me.refreshLayout())):Hg(),i.has("lockbox")&&window.requestAnimationFrame(()=>bn.refreshLayout()),i.has("networkanalyzer")&&window.requestAnimationFrame(()=>Bt.refreshLayout()),i.has("curveviewer")&&window.requestAnimationFrame(()=>Ki.refreshLayout()),Vr(),mp(),Bt.setSubscriptionEnabled(E.panels.networkanalyzer.enabled)}function Qa(){return qt.filter(t=>E.panels[t.id]?.enabled).map(t=>t.id)}function qr(t,e,n,s){const i=qt.filter(u=>t[u.id]?.enabled).map(u=>u.id),a=Math.min(Rr,i.length),o=Math.min(Math.max(1,n),a);if(o===0)return[];const l=Uu(e,t,s);for(const u of i){if(l.length>=o)break;l.includes(u)||l.push(u)}return l.slice(0,o)}function Og(){ya.textContent="";for(const i of qt){const a=document.createElement("label");a.className="menu-check";const o=document.createElement("input");o.id=`panel-${i.id}-enabled`,o.type="checkbox",o.checked=E.panels[i.id]?.enabled??!1,o.addEventListener("change",()=>{o.closest("details")?.removeAttribute("open"),Ug(i.id,o.checked).catch(u=>{J.textContent=u.message,Yi.textContent=u.message})});const l=document.createElement("span");l.textContent=i.title,a.append(o,l),ya.appendChild(a)}const t=document.createElement("label");t.className="menu-field";const e=document.createElement("span");e.textContent="Layout";const n=document.createElement("select");n.id="workspace-layout-mode";const s=[["tabs","Tabs"],["split-horizontal","Side by Side"],["split-vertical","Stacked"]];for(const[i,a]of s){const o=document.createElement("option");o.value=i,o.textContent=a,n.appendChild(o)}if(n.value=E.layoutMode,n.addEventListener("change",()=>{Zg(Xu(n.value)).catch(i=>{J.textContent=i.message,Yi.textContent=i.message})}),t.append(e,n),ya.appendChild(t),E.layoutMode!=="tabs"){const i=Qa(),a=document.createElement("label");a.className="menu-field";const o=document.createElement("span");o.textContent="Panels";const l=document.createElement("select");l.id="workspace-pane-count";const u=Math.min(Rr,i.length);for(let d=1;d<=u;d+=1){const v=document.createElement("option");v.value=String(d),v.textContent=String(d),l.appendChild(v)}l.value=String(Math.min(Math.max(1,E.splitPanelIds.length),u)),l.addEventListener("change",()=>{Gg(Number(l.value)).catch(d=>{J.textContent=d.message,Yi.textContent=d.message})}),a.append(o,l),ya.appendChild(a)}}function Dg(){if(Sa.textContent="",Sa.hidden=E.layoutMode!=="tabs",!Sa.hidden)for(const t of qt){if(!E.panels[t.id]?.enabled)continue;const e=document.createElement("button");e.className=`workspace-tab${E.activePanelId===t.id?" is-active":""}`,e.type="button",e.textContent=t.title,e.addEventListener("click",()=>{Xg(t.id).catch(n=>{J.textContent=n.message})}),Sa.appendChild(e)}}function Bg(t){for(const n of Object.values(ws))n.querySelector(".workspace-pane-selector")?.remove();if(E.layoutMode==="tabs")return;const e=Qa();for(const[n,s]of t.entries()){const i=ws[s].querySelector(".panel-header");if(!i)continue;const a=document.createElement("label");a.className="workspace-pane-selector";const o=document.createElement("span");o.textContent="Panel";const l=document.createElement("select");l.id=`workspace-pane-select-${n}`,l.value=s;for(const u of e){const d=document.createElement("option");d.value=u,d.textContent=qt.find(v=>v.id===u)?.title??u,d.disabled=u!==s&&t.includes(u),l.appendChild(d)}l.value=s,l.addEventListener("change",()=>{Kg(n,l.value).catch(u=>{J.textContent=u.message,Yi.textContent=u.message})}),a.append(o,l),i.appendChild(a)}}function qg(){_a||ep.hidden||(_a=ea([$r,Zu],{direction:"vertical",sizes:E.panels.scope.splitSizes,minSize:[132,260],gutterSize:8,snapOffset:24,onDrag:()=>U.refreshLayout(),onDragEnd:t=>{E={...E,panels:{...E.panels,scope:{...E.panels.scope,splitSizes:Gu(t)}}},Qn(E),U.refreshLayout()}}))}function Vg(){_a?.destroy(),_a=null,$r.removeAttribute("style"),Zu.removeAttribute("style")}function Yg(){La||tp.hidden||(La=ea([Ju,Qu],{direction:"vertical",sizes:[32,68],minSize:[96,220],gutterSize:8,snapOffset:16,elementStyle:(t,e)=>({height:`calc(${e}% - 4px)`}),gutterStyle:()=>({height:"8px"}),onDrag:()=>me.refreshLayout(),onDragEnd:()=>me.refreshLayout()}))}function Hg(){La?.destroy(),La=null,Ju.removeAttribute("style"),Qu.removeAttribute("style")}function jg(t){const e=t.join("|");Fa&&ar===E.layoutMode&&or===e||(dp(),Wg(t),ar=E.layoutMode,or=e,Fa=ea(t.map(n=>ws[n]),{direction:E.layoutMode==="split-horizontal"?"horizontal":"vertical",sizes:bs(E.workspaceSplitSizes,t.length),minSize:E.layoutMode==="split-horizontal"?220:140,gutterSize:8,snapOffset:24,elementStyle:(n,s,i)=>({flexBasis:`calc(${s}% - ${i}px)`}),gutterStyle:(n,s)=>({flexBasis:`${s}px`}),onDrag:()=>{U.refreshLayout(),me.refreshLayout(),bn.refreshLayout(),Bt.refreshLayout(),Ki.refreshLayout()},onDragEnd:n=>{E={...E,workspaceSplitSizes:bs(n,t.length)},Qn(E),U.refreshLayout(),me.refreshLayout(),bn.refreshLayout(),Bt.refreshLayout(),Ki.refreshLayout()}}))}function Wg(t){const e=new Set(t);for(const n of t)Ui.appendChild(ws[n]);for(const n of qt)e.has(n.id)||Ui.appendChild(ws[n.id])}function dp(){Fa?.destroy(),Fa=null,ar=null,or="";for(const t of Object.values(ws))t.removeAttribute("style")}async function Ug(t,e){const n=E.panels[t],s={...E.panels,[t]:{...n,enabled:e}},i=e&&E.activePanelId===null?t:!e&&E.activePanelId===t?ti(s):E.activePanelId,a=Math.min(Math.max(1,E.splitPanelIds.length),qt.filter(l=>s[l.id]?.enabled).length),o=qr(s,E.splitPanelIds,a,i);if(E={...E,activePanelId:i,splitPanelIds:o,workspaceSplitSizes:bs(E.workspaceSplitSizes,Math.max(1,o.length)),panels:s},Qn(E),Si(),t==="scope"&&!e){fi("Scope panel disabled"),bt!=="observer"&&sn("stop").catch(l=>{J.textContent=l.message});return}t==="scope"&&e&&Vn("scope")&&await fp(),t==="spectrumanalyzer"&&!e&&(an("Spectrum panel disabled"),bt!=="observer"&&Pn("stop").catch(l=>{Ot.textContent=l.message}))}async function Xg(t){E.panels[t]?.enabled&&(E={...E,activePanelId:t},Qn(E),Si(),t==="scope"&&window.requestAnimationFrame(()=>U.refreshLayout()),t==="spectrumanalyzer"&&window.requestAnimationFrame(()=>me.refreshLayout()),t==="lockbox"&&window.requestAnimationFrame(()=>bn.refreshLayout()),t==="networkanalyzer"&&window.requestAnimationFrame(()=>Bt.refreshLayout()),t==="curveviewer"&&window.requestAnimationFrame(()=>Ki.refreshLayout()))}async function Gg(t){const e=qr(E.panels,E.splitPanelIds,t,E.activePanelId);E={...E,splitPanelIds:e,workspaceSplitSizes:bs(E.workspaceSplitSizes,Math.max(1,e.length))},Qn(E),Si()}async function Kg(t,e){if(!E.panels[e]?.enabled||t<0||t>=E.splitPanelIds.length)return;const n=[...E.splitPanelIds],s=n.indexOf(e);s>=0?[n[t],n[s]]=[n[s],n[t]]:n[t]=e,E={...E,splitPanelIds:n},Qn(E),Si()}function Vn(t){return E.layoutMode==="tabs"?E.activePanelId===t:E.splitPanelIds.includes(t)}async function Zg(t){const e=E.layoutMode==="tabs"&&t!=="tabs"?qr(E.panels,E.splitPanelIds,Math.min(qm,Qa().length),E.activePanelId):E.splitPanelIds;E={...E,layoutMode:t,splitPanelIds:e,workspaceSplitSizes:bs(E.workspaceSplitSizes,Math.max(1,e.length))},Qn(E),Si(),Vn("scope")&&window.requestAnimationFrame(()=>U.refreshLayout()),Vn("lockbox")&&window.requestAnimationFrame(()=>bn.refreshLayout()),Vn("networkanalyzer")&&window.requestAnimationFrame(()=>Bt.refreshLayout()),Vn("curveviewer")&&window.requestAnimationFrame(()=>Ki.refreshLayout())}async function fp(){if(!E.panels.scope.enabled||!Vn("scope")){fi("Scope panel disabled");return}if(Vr(),wt==="stopped"&&hp?.fake&&bt!=="observer"){if(await bv(),!E.panels.scope.enabled||!Vn("scope"))return;await sn("continuous")}}function eo(t){t.startsWith("running_")&&!wt.startsWith("running_")&&U.resetTraceAveraging(),wt=t,Yr(t),Vr()}function Vr(){Br&&(E.panels.scope.enabled?wt.startsWith("running_")?Zi():wt==="stopped"&&nt.dataset.connected==="true"&&fi("Scope stopped"):nt.dataset.connected==="true"&&fi("Scope panel disabled"))}function Yr(t){const e=Hr();t==="running_continuous"?(nt.textContent="Pause",nt.disabled=!1,fn.textContent="Run single",fn.disabled=!0,Gs.disabled=!1):t==="running_single"?(nt.textContent="Run continuous",nt.disabled=!0,fn.textContent="Pause",fn.disabled=!1,Gs.disabled=!1):t==="paused_single"||t==="paused_continuous"?(nt.textContent="Resume continuous",nt.disabled=!1,fn.textContent="Resume single",fn.disabled=e,Gs.disabled=!1):(nt.textContent="Run continuous",nt.disabled=!1,fn.textContent="Run single",fn.disabled=e,Gs.disabled=!0),bt==="observer"&&(nt.disabled=!0,fn.disabled=!0,Gs.disabled=!0)}function Jg(t){En=t,t==="running_continuous"?(ht.textContent="Pause",ht.disabled=!1,kn.textContent="Run single",kn.disabled=!0,$i.disabled=!1):t==="running_single"?(ht.textContent="Run continuous",ht.disabled=!0,kn.textContent="Pause",kn.disabled=!1,$i.disabled=!1):t==="paused_single"||t==="paused_continuous"?(ht.textContent="Resume continuous",ht.disabled=!1,kn.textContent="Resume single",kn.disabled=!1,$i.disabled=!1):(ht.textContent="Run continuous",ht.disabled=!1,kn.textContent="Run single",kn.disabled=!1,$i.disabled=!0),mp()}function mp(){Br&&(E.panels.spectrumanalyzer.enabled?En.startsWith("running_")?Qi():En==="stopped"&&!["single","resume_single"].includes(pp)&&ht.dataset.connected==="true"&&an():ht.dataset.connected==="true"&&an("Spectrum panel disabled"))}function Zi(){nt.dataset.connected!=="true"&&(U.connect(),nt.dataset.connected="true")}function fi(t="Disconnected"){U.close(),nt.dataset.connected="false",nn.textContent=t}async function gp(){nt.dataset.connected==="true"&&(await sn("stop"),fi("Scope stopped: Spectrum owns the scope resource"))}async function sn(t){const e=await fetch(`/api/modules/scope/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Scope action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return s.running_state&&eo(s.running_state),["single","continuous","resume_single","resume_continuous"].includes(t)&&U.reconnect(),J.textContent=`${t}: ${s.running_state??"ok"}`,n}async function Qg(){try{const e=await(await fetch("/api/session")).json(),n=e.fake?"fake hardware":e.settings.hostname;return Vc.textContent=`Session: ${n} | reads ${e.reads} | writes ${e.writes}`,e.scope?.running_state&&eo(e.scope.running_state),{fake:!!e.fake}}catch{return Vc.textContent="Session unavailable",null}}function vp(t){return typeof t=="number"?t<.001?`${(t*1e6).toPrecision(4)} us`:t<1?`${(t*1e3).toPrecision(4)} ms`:`${t.toPrecision(4)} s`:t}function vn(t,e){return Array.isArray(e)?e.join(", "):typeof e=="boolean"?String(e):typeof e=="number"&&(t==="duration"||t==="trigger_delay")?vp(e):typeof e=="number"?Number.isInteger(e)?String(e):String(Number(e.toPrecision(6))):e}function Yn(t,e){t.textContent="";for(const n of e.options??[]){const s=document.createElement("option");s.value=String(n),s.textContent=e.option_labels?.[String(n)]??vp(n),t.appendChild(s)}t.value=String(e.value)}function Ji(t,e){e=As.get("scope")[t]??e,up.set(t,e),t==="input1"?pi.value=String(e):t==="input2"?hi.value=String(e):t==="trigger_source"?(jn.value=String(e),Oi()):t==="duration"?(_n.value=String(e),Oi(),Ta()):t==="average"?di.checked=!!e:t==="ch1_active"?(mn.checked=!!e,U.setChannelVisible(1,mn.checked)):t==="ch2_active"?(gn.checked=!!e,U.setChannelVisible(2,gn.checked)):t==="ch_math_active"?(Ss.checked=!!e,ms()):t==="math_formula"?(document.activeElement!==Un&&(Un.value=String(e)),ms()):t==="xy_mode"?(ys.checked=!!e,ms()):t==="rolling_mode"?(Wn.checked=!!e,Xi.checked=!e,Oi(),Ta()):t==="trace_average"?(Ln.value=String(e),U.setTraceAverage(Number(e)),Or.textContent=`0 / ${e}`):t==="trigger_delay"?(document.activeElement!==Xn&&(Xn.value=String(e)),Oi()):t==="threshold"?document.activeElement!==Gn&&(Gn.value=String(e)):t==="hysteresis"?document.activeElement!==Kn&&(Kn.value=String(e)):t==="curve_name"&&document.activeElement!==xs&&(xs.value=String(e))}function ms(){U.setDisplaySettings({xyMode:ys.checked,mathActive:Ss.checked,mathFormula:Un.value})}function Hr(){return Wn.checked&&Number(_n.value)>.1}function Ta(){const t=Number(_n.value)>.1;hg.disabled=!t;const e=Hr();jn.disabled=e,Gn.disabled=e,Kn.disabled=e,Yr(wt)}function Oi(){U.setTimeSettings({duration:Number(_n.value),triggerDelay:Number(Xn.value||0),triggerSource:jn.value,rollingMode:Hr()})}function en(t,e){t.value=String(e.value),e.min!==void 0&&(t.min=String(e.min)),e.max!==void 0&&(t.max=String(e.max)),e.step!==void 0&&(t.step=String(e.step))}function jr(t){for(const[e,n]of Object.entries(t))n!=null&&!Object.is(up.get(e),n)&&Ji(e,n);ev(t)}function ev(t){t.running_state&&eo(t.running_state),t.current_avg!==void 0&&(Or.textContent=`${t.current_avg} / ${Ln.value||"1"}`),"owner"in t&&tv(typeof t.owner=="string"?t.owner:null)}function tv(t){$r.classList.toggle("is-owned",t!==null);for(const e of Rg)e.disabled=t!==null&&!Ir(e);t===null&&Ta(),t&&(J.textContent=`scope occupied by ${t}`)}async function st(t,e){if(Za("scope",t)){As.set("scope",t,e),Ji(t,e),J.textContent=`${t} = ${vn(t,e)} (local view)`;return}const n=await na("scope",t,e);["input1","input2","duration","average","trigger_source","trigger_delay","threshold","hysteresis","rolling_mode"].includes(t)&&U.reconnect(),Ji(t,n.value),J.textContent=`${t} = ${vn(t,n.value)}`}async function na(t,e,n){const s=await fetch(`/api/modules/${t}/attributes/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:n})});if(!s.ok)throw new Error(`Failed to set ${t}.${e}: ${s.status}`);return s.json()}async function nv(){const t=await fetch("/api/modules/scope/attributes");if(!t.ok)throw new Error(`Scope controls unavailable: ${t.status}`);const e=await t.json(),n=new Map(e.attributes.map(s=>[s.name,s]));Yn(pi,n.get("input1")),Yn(hi,n.get("input2")),Yn(jn,n.get("trigger_source")),Yn(_n,n.get("duration")),di.checked=!!n.get("average")?.value,mn.checked=!!(n.get("ch1_active")?.value??!0),U.setChannelVisible(1,mn.checked),gn.checked=!!(n.get("ch2_active")?.value??!0),U.setChannelVisible(2,gn.checked),Ss.checked=!!(n.get("ch_math_active")?.value??!1),Un.value=String(n.get("math_formula")?.value??"ch1 * ch2"),ys.checked=!!(n.get("xy_mode")?.value??!1),Wn.checked=!!(n.get("rolling_mode")?.value??!0),Xi.checked=!Wn.checked,en(Ln,n.get("trace_average")),en(Xn,n.get("trigger_delay")),en(Gn,n.get("threshold")),en(Kn,n.get("hysteresis")),xs.value=String(n.get("curve_name")?.value??"scope curve"),U.setTraceAverage(Number(Ln.value)),ms(),Oi(),Ta();for(const[s,i]of Object.entries(As.get("scope")))Ji(s,i);J.textContent="Scope controls ready"}async function sv(){await Promise.all(Dr.map(t=>iv(t)))}async function iv(t){const e=await fetch(`/api/modules/${t}/attributes`);if(!e.ok)throw new Error(`${t} controls unavailable: ${e.status}`);const n=await e.json(),s=new Map(n.attributes.map(a=>[a.name,a])),i=ks[t];Yn(i.waveform,s.get("waveform")),en(i.frequency,s.get("frequency")),en(i.amplitude,s.get("amplitude")),en(i.offset,s.get("offset")),Yn(i.triggerSource,s.get("trigger_source")),Yn(i.outputDirect,s.get("output_direct")),en(i.startPhase,s.get("start_phase")),en(i.cyclesPerBurst,s.get("cycles_per_burst")),i.status.textContent=`${t} controls ready`}function Wr(t,e){for(const[n,s]of Object.entries(e))Kr(s)&&Ur(t,n,s)}function Ur(t,e,n){const s=ks[t];e==="waveform"?s.waveform.value=String(n):e==="frequency"?s.frequency.value=String(n):e==="amplitude"?s.amplitude.value=String(n):e==="offset"?s.offset.value=String(n):e==="trigger_source"?s.triggerSource.value=String(n):e==="output_direct"?s.outputDirect.value=String(n):e==="start_phase"?s.startPhase.value=String(n):e==="cycles_per_burst"&&(s.cyclesPerBurst.value=String(n))}async function Dn(t,e,n){const s=await na(t,e,n);Ur(t,e,s.value),ks[t].status.textContent=`${e} = ${vn(e,s.value)}`}async function Bo(t,e){const n=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!n.ok)throw new Error(`${t} action ${e} failed: ${n.status}`);const s=await n.json();Wr(t,s.state??{}),ks[t].status.textContent=`${e}: ok`}function av(){qc.textContent="";for(const t of["P","N"]){const e=document.createElement("section");e.className="housekeeping-bank";const n=document.createElement("h3");n.textContent=`Expansion ${t}`,e.appendChild(n);for(let s=0;s<8;s+=1){const i=document.createElement("div");i.className="housekeeping-pin";const a=`expansion_${t}${s}`,o=`${a}_output`,l=document.createElement("span");l.textContent=`${t}${s}`;const u=document.createElement("label"),d=document.createElement("input");d.type="checkbox",d.id=`hk-${a.replaceAll("_","-")}`,d.addEventListener("change",()=>{rr(a,d.checked).catch(f=>{Zn.textContent=f.message})}),u.append(d,document.createTextNode(" Value"));const v=document.createElement("label"),m=document.createElement("input");m.type="checkbox",m.id=`hk-${o.replaceAll("_","-")}`,m.addEventListener("change",()=>{rr(o,m.checked).catch(f=>{Zn.textContent=f.message})}),v.append(m,document.createTextNode(" Output")),i.append(l,u,v),e.appendChild(i)}qc.appendChild(e)}}async function bp(){const t=await fetch("/api/modules/hk/attributes");if(t.ok){const s=await t.json(),a=new Map(s.attributes.map(o=>[o.name,o])).get("led");a&&en(Aa,a)}const e=await fetch("/api/modules/hk");if(!e.ok)throw new Error(`Housekeeping controls unavailable: ${e.status}`);const n=await e.json();Xr(n.state??{}),Zn.textContent="Housekeeping controls ready"}function Xr(t){for(const[e,n]of Object.entries(t))Kr(n)&&Gr(e,n)}function Gr(t,e){if(t==="led"){Aa.value=String(e);return}const n=document.querySelector(`#hk-${t.replaceAll("_","-")}`);n&&(n.checked=!!e)}async function rr(t,e){const n=await na("hk",t,e);Gr(t,n.value),Zn.textContent=`${t} = ${vn(t,n.value)}`}async function wp(){const[t,e]=await Promise.all([fetch("/api/modules/sampler"),fetch("/api/modules/ams")]);if(!t.ok||!e.ok)throw new Error("Sampler or AMS readback unavailable");const n=await t.json(),s=await e.json();Ia(n.state??{}),Ra(s.state??{}),rp.textContent="Sampler refreshed",Ja.textContent="AMS refreshed"}function Ia(t){if(Do.size===0){Bc.textContent="",nr.textContent="";for(const e of Object.keys(t)){const n=document.createElement("div");n.className="sampler-reading";const s=document.createElement("span");s.textContent=e;const i=document.createElement("output");i.dataset.signal=e,n.append(s,i),Bc.appendChild(n),Do.set(e,i),nr.add(new Option(e,e))}}for(const[e,n]of Object.entries(t))if(typeof n=="number"){const s=Do.get(e);s&&(s.value=Di(n))}}function Ra(t){ni.forEach((e,n)=>{const s=t[`dac${n}`];typeof s=="number"&&(e.value=s.toFixed(6))})}async function ov(){sr.disabled=!0,ir.value="Acquiring...";try{const t=await fetch("/api/sampler/stats",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({signal:nr.value,duration:Number(fg.value)})});if(!t.ok)throw new Error(`Sampler statistics failed: ${t.status}`);const e=await t.json();ir.value=`mean ${Di(e.mean)} | std ${Di(e.stddev)} | min ${Di(e.min)} | max ${Di(e.max)} | n ${e.count}`}finally{sr.disabled=!1}}async function xp(t){const e=await na("ams",`dac${t}`,Number(ni[t].value));ni[t].value=Number(e.value).toFixed(6),Ja.textContent=`DAC${t} = ${ni[t].value} V`}function Di(t){if(!Number.isFinite(t))return"--";const e=Math.abs(t);return e!==0&&(e<1e-4||e>=1e4)?t.toExponential(5):t.toFixed(6)}async function rv(){for(const[t,e]of Object.entries(Tg)){const n=Ig[t];t==="iir"&&rt&&(rt.destroy(),rt=null),n.textContent="",await Promise.all(e.map(s=>lv(n,s)))}}async function lv(t,e){const[n,s,i]=await Promise.all([fetch(`/api/modules/${e}/attributes`),fetch(`/api/modules/${e}/actions`),fetch(`/api/modules/${e}`)]);if(!n.ok||!s.ok||!i.ok)throw new Error(`${e} controls unavailable`);const a=await n.json(),o=await s.json(),l=await i.json(),u=document.createElement("section");u.className="module-panel instrument-card",e==="iir"&&u.classList.add("iir-card"),u.dataset.module=e;const d=document.createElement("header");d.className="instrument-card-header";const v=document.createElement("h3");v.textContent=e.toUpperCase();const m=document.createElement("output");m.id=`${e}-status`,m.textContent=`${e} ready`,d.append(v,m);const f=document.createElement("div");f.className=e==="spectrumanalyzer"?"control-row generic-module-row spectrum-module-row":"control-row generic-module-row";const y={status:m,inputs:new Map,fields:new Map,actions:[],card:u,owner:null},P=e==="spectrumanalyzer"?hv(a.attributes):a.attributes;for(const F of P){if(e==="iir"&&cv(F.name))continue;const _=uv(e,F,m);y.inputs.set(F.name,_.input),y.fields.set(F.name,_.label),f.appendChild(_.label)}const R=e==="spectrumanalyzer"?[]:o.actions??[];for(const F of R){const _=document.createElement("button");_.type="button",_.textContent=F.label??F.name,_.addEventListener("click",()=>{dv(e,F.name,m).catch(k=>{m.textContent=k.message})}),y.actions.push(_),f.appendChild(_)}if(Dt.set(e,y),u.append(d,f),e==="iir"){const F=document.createElement("section");F.className="iir-plot",u.appendChild(F),rt=new wm(F,async(_,k)=>{await Qs("iir",_,k,m)},_=>{m.textContent=_},()=>bt!=="observer"&&!Dt.get("iir")?.owner,()=>As.get("iir")),rt.refresh().catch(_=>{m.textContent=_.message})}t.appendChild(u),Ms(e,l.state??{})}function cv(t){return t==="real_poles"||t==="real_zeros"||t==="complex_poles"||t==="complex_zeros"}function uv(t,e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=t==="spectrumanalyzer"?pv(e):e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");Yn(o,e),o.addEventListener("change",()=>{Qs(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{Qs(t,e.name,o.checked,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",en(o,e),o.addEventListener("change",()=>{Qs(t,e.name,Number(o.value),n).catch(l=>{n.textContent=l.message})}),a=o}else{const o=document.createElement("input");o.type="text",o.value=yp(e.value),o.addEventListener("change",()=>{Qs(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}return e.readonly&&(a instanceof HTMLSelectElement?a.disabled=!0:a.readOnly=!0),Za(t,e.name)&&(a.dataset.controlScope="view"),a.id=`${t}-${e.name.replaceAll("_","-")}`,s.appendChild(a),{label:s,input:a}}function pv(t){return t.name==="input"?"IQ Input":t.name==="center"?"IQ Center":t.name==="input1_baseband"?"BB Input 1":t.name==="input2_baseband"?"BB Input 2":t.name==="display_input1_baseband"||t.name==="display_input2_baseband"?"Show":t.name==="display_cross_amplitude"?"Cross":t.label}function hv(t){const e=["baseband","display_input1_baseband","input1_baseband","display_input2_baseband","input2_baseband","input","center","acbandwidth","display_cross_amplitude","span","rbw","window","display_unit","trace_average"];return[...t].sort((n,s)=>{const i=e.indexOf(n.name),a=e.indexOf(s.name);return(i===-1?Number.MAX_SAFE_INTEGER:i)-(a===-1?Number.MAX_SAFE_INTEGER:a)})}async function Qs(t,e,n,s){if(Za(t,e)&&Kr(n)){As.set(t,e,n),Na(t,e,n),t==="spectrumanalyzer"&&Ms(t,tr),t==="iir"&&await rt?.refresh(),s.textContent=`${e} = ${vn(e,n)} (local view)`;return}const i=await na(t,e,n);if(Na(t,e,i.value),s.textContent=`${e} = ${vn(e,i.value)}`,t==="iir"&&rt&&(await rt.refresh(),e==="data_curve")){const a=await fetch("/api/modules/iir");if(a.ok){const o=await a.json();Ms("iir",o.state??{})}}}async function dv(t,e,n){const s=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!s.ok)throw new Error(`${t} action ${e} failed: ${s.status}`);const i=await s.json();Ms(t,i.state??{}),t==="iir"&&rt&&await rt.refresh(),n.textContent=`${e}: ok`}function Ms(t,e){if(t==="spectrumanalyzer"&&(tr={...tr,...e}),e=As.merge(t,e),t==="spectrumanalyzer"){if(typeof e.last_action=="string"&&(pp=e.last_action),me.setSettings(e),fv(e),typeof e.running_state=="string"&&Jg(e.running_state),typeof e.current_avg=="number"){const n=Dt.get("spectrumanalyzer")?.inputs.get("trace_average");lp.textContent=`${e.current_avg} / ${n?.value||"1"}`}document.activeElement!==Gi&&typeof e.curve_name=="string"&&(Gi.value=e.curve_name)}for(const[n,s]of Object.entries(e))n==="owner"?mv(t,typeof s=="string"?s:null):gv(s)&&Na(t,n,s)}function fv(t){const e=Dt.get("spectrumanalyzer");if(!e)return;const n=!!(t.baseband??!0),s=new Set(["input","center","acbandwidth"]),i=new Set(["input1_baseband","input2_baseband","display_input1_baseband","display_input2_baseband","display_cross_amplitude"]);for(const[a,o]of e.fields)o.hidden=n&&s.has(a)||!n&&i.has(a)}function Na(t,e,n){n=As.get(t)[e]??n;const s=Dt.get(t)?.inputs.get(e);s&&(s instanceof HTMLInputElement&&s.type==="checkbox"?s.checked=!!n:s.value=yp(n))}function mv(t,e){const n=Dt.get(t);if(n){n.owner=e,n.card.classList.toggle("is-owned",e!==null);for(const s of n.inputs.values())s.disabled=e!==null&&!Ir(s);for(const s of n.actions)s.disabled=e!==null;e&&(n.status.textContent=`occupied by ${e}`)}}function gv(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"||Array.isArray(t)&&t.every(e=>typeof e=="number"||typeof e=="string")}function yp(t){return Array.isArray(t)?t.join(", "):String(t)}function Kr(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"}function lr(t){return typeof t=="string"&&Dt.has(t)}async function Zr(){const t=await fetch("/api/modules/scope/states");if(!t.ok)return;const e=await t.json();Sp(e.states??[])}function Sp(t){const e=Et.value;Et.textContent="";const n=document.createElement("option");n.value="",n.textContent=t.length?"Choose state":"No saved states",Et.appendChild(n);for(const s of t){const i=document.createElement("option");i.value=s.name,i.textContent=s.name,Et.appendChild(i)}t.some(s=>s.name===e)?Et.value=e:t[0]&&(Et.value=t[0].name,yi.value=t[0].name)}function cr(t){return t==="asg0"||t==="asg1"}function kp(){if(qn&&qn.readyState!==WebSocket.CLOSED)return;const t=window.location.protocol==="https:"?"wss:":"ws:",e=new WebSocket(`${t}//${window.location.host}/ws/events`);qn=e,e.addEventListener("open",()=>{if(qn!==e)return;Hc.connected();const n=["scope",...Dr,"hk","ams","sampler",...Dt.keys(),"networkanalyzer","lockbox"];for(const s of n)vv(s,e).catch(i=>{J.textContent=i.message});ur()}),e.addEventListener("message",n=>{const s=JSON.parse(n.data);if(typeof s.module=="string"&&["module.attribute.changed","module.state.changed"].includes(s.type)&&za.set(s.module,(za.get(s.module)??0)+1),s.type==="control.changed"){ur();return}if(s.type==="module.attribute.changed"){if(cp+=1,s.module==="scope")Ji(s.attribute,s.value),s.attribute==="run_continuous"&&eo(s.value?"running_continuous":"stopped"),J.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`;else if(cr(s.module)){const i=s.module;Ur(i,s.attribute,s.value),ks[i].status.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`}else if(s.module==="hk")Gr(s.attribute,s.value),Zn.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`;else if(s.module==="ams")Ra({[s.attribute]:s.value});else if(s.module==="sampler")Ia({[s.attribute]:s.value});else if(s.module==="networkanalyzer")Bt.applyState({[s.attribute]:s.value});else if(lr(s.module)){Na(s.module,s.attribute,s.value),s.module==="iir"&&rt?.refresh().catch(a=>{J.textContent=a.message});const i=Dt.get(s.module);i&&(i.status.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`)}return}if(s.type!=="module.attribute.changed"||s.module!=="scope"){if(s.type==="module.state.changed"&&s.module==="scope")jr(s.state),s.state.trigger_test?J.textContent=kv(s.state.trigger_test):J.textContent=`${s.state.last_action}: ${s.state.running_state}`;else if(s.type==="module.state.changed"&&cr(s.module)){const i=s.module;Wr(i,s.state??{}),ks[i].status.textContent=`${i} state updated`}else if(s.type==="module.state.changed"&&s.module==="hk")Xr(s.state??{}),Zn.textContent="Housekeeping state updated";else if(s.type==="module.state.changed"&&s.module==="ams")Ra(s.state??{});else if(s.type==="module.state.changed"&&s.module==="sampler")Ia(s.state??{});else if(s.type==="module.state.changed"&&lr(s.module)){Ms(s.module,s.state??{}),s.module==="iir"&&rt?.refresh().catch(a=>{J.textContent=a.message});const i=Dt.get(s.module);i&&!i.owner&&s.module!=="spectrumanalyzer"&&(i.status.textContent=`${s.module} state updated`)}else s.type==="module.state.changed"&&s.module==="lockbox"?bn.applySchema(s.state).catch(i=>{J.textContent=i.message}):s.type==="module.state.changed"&&s.module==="networkanalyzer"?Bt.applyState(s.state??{}):s.type==="module.states.changed"&&s.module==="scope"&&(Sp(s.states??[]),J.textContent=`${s.states.length} saved state${s.states.length===1?"":"s"}`);return}}),e.addEventListener("close",()=>{qn===e&&(qn=null,Hc.schedule())})}async function vv(t,e){for(;qn===e&&e.readyState===WebSocket.OPEN;){const n=za.get(t)??0,s=await fetch(t==="lockbox"?"/api/lockbox":`/api/modules/${t}`);if(!s.ok)throw new Error(`${t} state unavailable: ${s.status}`);const i=await s.json(),a=t==="lockbox"?i:i.state;if(qn!==e)return;if(n===(za.get(t)??0)){t==="scope"?jr(a):cr(t)?Wr(t,a):t==="hk"?Xr(a):t==="ams"?Ra(a):t==="sampler"?Ia(a):t==="networkanalyzer"?Bt.applyState(a):t==="lockbox"?await bn.applySchema(a):lr(t)&&Ms(t,a),t==="iir"&&await rt?.refresh();return}}}function Mp(){const t=bt==="observer";for(const e of Ui.querySelectorAll("input, select, textarea, button")){const n=t&&!Ir(e);e.inert=n,n?e.setAttribute("aria-disabled","true"):e.removeAttribute("aria-disabled")}for(const e of["config-text","curve-viewer-params"])b(`#${e}`).readOnly=t}function Jr(t){bt=t.role,Yr(wt),Mp(),Ks.textContent=bt==="observer"?"Download CSV":"Save Curve",Zs.textContent=bt==="observer"?"Download CSV":"Save Curve",Bt.setReadOnly(bt==="observer"),Yc.classList.remove("is-controller","is-observer","is-shared"),Yc.classList.add(`is-${t.role}`),t.role==="shared"?(si.value="Shared control",Ma.hidden=!0):t.role==="controller"?(si.value="You have control",Ma.hidden=!0):(si.value=t.controller?.label?`Observer: ${t.controller.label} has control`:"Observer: control is available",Ma.hidden=!1)}async function ur(){try{Jr(await ta.refresh())}catch(t){si.value=t instanceof Error?t.message:"Control unavailable"}}async function bv(){nn.textContent="Loading one scope frame...";const t=await fetch(`/api/scope/frame?samples=${U.getSampleCount()}`);if(t.status===204){nn.textContent="No trigger captured";return}if(!t.ok)throw new Error(`Scope frame request failed: ${t.status}`);const e=await t.arrayBuffer();U.close(),U.showFrame(e),nt.dataset.connected="false"}async function Pn(t){const e=await fetch(`/api/modules/spectrumanalyzer/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Spectrum action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return Ms("spectrumanalyzer",n.state??{}),Ot.textContent=`${t}: ${s.running_state??"ok"}`,n}async function Cp(t,e,n,s){const i=await fetch("/api/curves?include_data=false",{method:"POST",headers:{"content-type":"application/octet-stream"},body:_m(t,e,n,s)});if(!i.ok)throw new Error(`Save curve failed: ${i.status}`)}async function wv(){const t=U.getCurveData();if(!t)throw new Error("No scope curve to save");const n=[[0,mn.checked],[1,gn.checked]].filter(([,i])=>i),s={input1:pi.value,input2:hi.value,duration:Number(_n.value),average:di.checked,trigger_source:jn.value,trigger_delay:Number(Xn.value),threshold:Number(Gn.value),hysteresis:Number(Kn.value),ch1_active:mn.checked,ch2_active:gn.checked,ch_math_active:Ss.checked,math_formula:Un.value,xy_mode:ys.checked,rolling_mode:Wn.checked,trace_average:Number(Ln.value)};for(const[i]of n)await Cp(t.x,t.channels[i],{...s,name:`${xs.value||"scope curve"} ch${i+1}`,module:"scope",ch:i,curve_unit:"V"});return n.length}async function xv(){const t=me.getCurveData();if(!t)throw new Error("No spectrum curve to save");for(const[e,n]of t.series.entries())await Cp(t.x,n.values,{...me.getCurveParameters(),name:`${Gi.value||"pyrpl spectrum"} ${n.label.toLowerCase()}`,module:"spectrumanalyzer",ch:n.label==="Cross"?"cross":e,curve_unit:t.unit},n.imaginary);return t.series.length}function Qi(){ht.dataset.connected!=="true"&&(me.connect(),ht.dataset.connected="true")}function an(t="Spectrum stopped"){me.close(),ht.dataset.connected="false",Ot.textContent=t}async function Ep(){await Pn("stop"),(ht.dataset.connected==="true"||me.isConnected())&&an("Spectrum stopped: Scope owns the scope resource")}async function yv(){await Ep(),await sn("single"),U.resetTraceAveraging(),Zi()}function Sv(){return encodeURIComponent(pr())}function pr(){return(yi.value.trim()||Et.value||"default").trim()}function Pp(){return(Et.value||yi.value.trim()||"default").trim()}function kv(t){const e=String(t.source??"unknown"),n=String(t.condition??"condition"),s=Number(t.hysteresis??0);return t.triggered?`triggered ${e} ${n} at sample ${t.index} (hys ${s})`:`no trigger: ${e} ${n} (hys ${s})`}async function Mv(){const t=await fetch(`/api/modules/scope/states/${Sv()}/save`,{method:"POST"});if(!t.ok)throw new Error(`Save state failed: ${t.status}`);await Zr(),Et.value=pr(),J.textContent=`saved state ${pr()}`}async function Cv(){const t=Pp(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}/load`,{method:"POST"});if(!e.ok)throw new Error(`Load state failed: ${e.status}`);const n=await e.json();jr(n.state),yi.value=t,J.textContent=`loaded state ${t}`}async function Ev(){const t=Pp(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}`,{method:"DELETE"});if(!e.ok)throw new Error(`Delete state failed: ${e.status}`);await Zr(),J.textContent=`deleted state ${t}`}nt.addEventListener("click",()=>{(async()=>{try{wt==="running_continuous"?await sn("pause"):wt==="paused_single"||wt==="paused_continuous"?(await sn("resume_continuous"),Zi()):(await Ep(),await sn("continuous"),U.resetTraceAveraging(),Zi())}catch(t){J.textContent=t instanceof Error?t.message:String(t)}})()});fn.addEventListener("click",()=>{(wt==="running_single"?sn("pause"):wt==="paused_single"||wt==="paused_continuous"?sn("resume_single").then(()=>Zi()):yv()).catch(e=>{nn.textContent=e.message})});Gs.addEventListener("click",()=>{sn("stop").then(()=>{U.resetTraceAveraging(),fi()}).catch(t=>{nn.textContent=t.message})});Ks.addEventListener("click",async()=>{if(bt==="observer"){U.downloadCsv(`scope-${Date.now()}.csv`);return}Ks.disabled=!0,Ks.textContent="Saving…",J.textContent="Saving curves…";try{const[,t]=await Promise.all([sn("save_curve"),wv()]);U.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),J.textContent=`saved ${t} curve${t===1?"":"s"}`}catch(t){J.textContent=t instanceof Error?t.message:String(t)}finally{Ks.disabled=!1,Ks.textContent="Save Curve"}});sg.addEventListener("click",()=>U.zoom(1.8));ig.addEventListener("click",()=>U.zoom(.55));ag.addEventListener("click",()=>U.zoomY(1.8));og.addEventListener("click",()=>U.zoomY(.55));rg.addEventListener("click",()=>U.panX(-.2));lg.addEventListener("click",()=>U.panX(.2));cg.addEventListener("click",()=>U.panY(-.2));ug.addEventListener("click",()=>U.panY(.2));pg.addEventListener("click",()=>U.resetZoom());kn.addEventListener("click",()=>{(async()=>{try{En==="running_single"?(await Pn("pause"),an("Spectrum paused")):En==="paused_single"||En==="paused_continuous"?(an("Reconnecting spectrum stream"),await Pn("resume_single"),Qi()):(await gp(),an("Starting spectrum acquisition"),me.resetAveraging(),await Pn("single"),Qi())}catch(t){Ot.textContent=t instanceof Error?t.message:String(t)}})()});ht.addEventListener("click",()=>{(async()=>{try{En==="running_continuous"?(await Pn("pause"),an("Spectrum paused")):En==="paused_single"||En==="paused_continuous"?(an("Reconnecting spectrum stream"),await Pn("resume_continuous"),Qi()):(await gp(),an("Starting spectrum acquisition"),me.resetAveraging(),await Pn("continuous"),Qi())}catch(t){Ot.textContent=t instanceof Error?t.message:String(t)}})()});$i.addEventListener("click",()=>{Pn("stop").then(()=>an()).catch(t=>{Ot.textContent=t.message})});Zs.addEventListener("click",async()=>{if(bt==="observer"){me.downloadCsv(`spectrum-${Date.now()}.csv`);return}Zs.disabled=!0,Zs.textContent="Saving…",Ot.textContent="Saving curves…";try{const t=await xv();me.downloadCsv(`spectrum-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),Ot.textContent=`saved ${t} curve${t===1?"":"s"}`}catch(t){Ot.textContent=t instanceof Error?t.message:String(t)}finally{Zs.disabled=!1,Zs.textContent="Save Curve"}});xs.addEventListener("change",()=>{st("curve_name",xs.value).catch(t=>{J.textContent=t.message})});Gi.addEventListener("change",()=>{Qs("spectrumanalyzer","curve_name",Gi.value,Ot).catch(t=>{Ot.textContent=t.message})});kg.addEventListener("click",()=>me.zoom(1.8));Mg.addEventListener("click",()=>me.zoom(.55));Cg.addEventListener("click",()=>me.zoomY(1.8));Eg.addEventListener("click",()=>me.zoomY(.55));Pg.addEventListener("click",()=>me.panX(-.2));Ag.addEventListener("click",()=>me.panX(.2));zg.addEventListener("click",()=>me.panY(-.2));_g.addEventListener("click",()=>me.panY(.2));Lg.addEventListener("click",()=>me.resetZoom());mn.addEventListener("change",()=>{U.setChannelVisible(1,mn.checked),st("ch1_active",mn.checked).catch(t=>{J.textContent=t.message,mn.checked=U.getChannelVisible(1)})});gn.addEventListener("change",()=>{U.setChannelVisible(2,gn.checked),st("ch2_active",gn.checked).catch(t=>{J.textContent=t.message,gn.checked=U.getChannelVisible(2)})});pi.addEventListener("change",()=>{st("input1",pi.value).catch(t=>{J.textContent=t.message})});hi.addEventListener("change",()=>{st("input2",hi.value).catch(t=>{J.textContent=t.message})});jn.addEventListener("change",()=>{st("trigger_source",jn.value).catch(t=>{J.textContent=t.message})});Xi.addEventListener("change",()=>{Xi.checked&&st("rolling_mode",!1).catch(t=>{J.textContent=t.message})});Wn.addEventListener("change",()=>{Wn.checked&&st("rolling_mode",!0).catch(t=>{J.textContent=t.message})});_n.addEventListener("change",()=>{st("duration",Number(_n.value)).catch(t=>{J.textContent=t.message})});di.addEventListener("change",()=>{st("average",di.checked).catch(t=>{J.textContent=t.message})});ys.addEventListener("change",()=>{ms(),st("xy_mode",ys.checked).catch(t=>{J.textContent=t.message})});Ss.addEventListener("change",()=>{ms(),st("ch_math_active",Ss.checked).catch(t=>{J.textContent=t.message})});Un.addEventListener("change",()=>{ms(),st("math_formula",Un.value).catch(t=>{J.textContent=t.message})});Ln.addEventListener("change",()=>{st("trace_average",Number(Ln.value)).catch(t=>{J.textContent=t.message})});Xn.addEventListener("change",()=>{st("trigger_delay",Number(Xn.value)).catch(t=>{J.textContent=t.message})});Gn.addEventListener("change",()=>{st("threshold",Number(Gn.value)).catch(t=>{J.textContent=t.message})});Kn.addEventListener("change",()=>{st("hysteresis",Number(Kn.value)).catch(t=>{J.textContent=t.message})});ip.addEventListener("click",()=>{Mv().catch(t=>{J.textContent=t.message})});Et.addEventListener("change",()=>{Et.value&&(yi.value=Et.value)});ap.addEventListener("click",()=>{Cv().catch(t=>{J.textContent=t.message})});op.addEventListener("click",()=>{Ev().catch(t=>{J.textContent=t.message})});for(const t of Dr){const e=ks[t];e.waveform.addEventListener("change",()=>{Dn(t,"waveform",e.waveform.value).catch(n=>{e.status.textContent=n.message})}),e.frequency.addEventListener("change",()=>{Dn(t,"frequency",Number(e.frequency.value)).catch(n=>{e.status.textContent=n.message})}),e.amplitude.addEventListener("change",()=>{Dn(t,"amplitude",Number(e.amplitude.value)).catch(n=>{e.status.textContent=n.message})}),e.offset.addEventListener("change",()=>{Dn(t,"offset",Number(e.offset.value)).catch(n=>{e.status.textContent=n.message})}),e.triggerSource.addEventListener("change",()=>{Dn(t,"trigger_source",e.triggerSource.value).catch(n=>{e.status.textContent=n.message})}),e.outputDirect.addEventListener("change",()=>{Dn(t,"output_direct",e.outputDirect.value).catch(n=>{e.status.textContent=n.message})}),e.startPhase.addEventListener("change",()=>{Dn(t,"start_phase",Number(e.startPhase.value)).catch(n=>{e.status.textContent=n.message})}),e.cyclesPerBurst.addEventListener("change",()=>{Dn(t,"cycles_per_burst",Number(e.cyclesPerBurst.value)).catch(n=>{e.status.textContent=n.message})}),e.setup.addEventListener("click",()=>{Bo(t,"setup").catch(n=>{e.status.textContent=n.message})}),e.trigger.addEventListener("click",()=>{Bo(t,"trigger").catch(n=>{e.status.textContent=n.message})}),e.off.addEventListener("click",()=>{Bo(t,"off").catch(n=>{e.status.textContent=n.message})})}Aa.addEventListener("change",()=>{rr("led",Number(Aa.value)).catch(t=>{Zn.textContent=t.message})});mg.addEventListener("click",()=>{bp().catch(t=>{Zn.textContent=t.message})});dg.addEventListener("click",()=>{wp().catch(t=>{rp.textContent=t.message})});sr.addEventListener("click",()=>{ov().catch(t=>{ir.value=t.message})});ni[2].addEventListener("change",()=>{xp(2).catch(t=>{Ja.textContent=t.message})});ni[3].addEventListener("change",()=>{xp(3).catch(t=>{Ja.textContent=t.message})});async function Pv(){try{Jr(await ta.initialize())}catch{await ur()}if(hp=await Qg(),av(),await nv(),await Zr(),await sv(),await bp(),await wp(),await rv(),await Bt.initialize(),await Fg.load().catch(t=>{b("#config-status").textContent=t.message}),await bn.load(),kp(),await Ng(),Br=!0,Si(),!E.activePanelId){nn.textContent="No panel enabled";return}if(!Vn("scope")){const t=E.layoutMode==="tabs"?E.activePanelId:E.splitPanelIds[0]??E.activePanelId;nn.textContent=`${qt.find(e=>e.id===t)?.title} panel ready`;return}if(!E.panels.scope.enabled){nn.textContent="Scope panel disabled";return}await fp()}Ma.addEventListener("click",()=>{ta.claim(!0).then(Jr).catch(t=>{si.value=t.message})});window.addEventListener("pagehide",()=>ta.release());new MutationObserver(Mp).observe(Ui,{childList:!0,subtree:!0});$g();Pv().catch(t=>{nn.textContent=t.message});
