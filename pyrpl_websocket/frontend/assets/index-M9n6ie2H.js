(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const Bp=!0,We="u-",qp="uplot",Vp=We+"hz",Yp=We+"vt",Hp=We+"title",jp=We+"wrap",Wp=We+"under",Up=We+"over",Xp=We+"axis",rs=We+"off",Gp=We+"select",Kp=We+"cursor-x",Zp=We+"cursor-y",Jp=We+"cursor-pt",Qp=We+"legend",eh=We+"live",th=We+"inline",nh=We+"series",sh=We+"marker",rl=We+"label",ih=We+"value",Ai="width",zi="height",Mi="top",ll="bottom",Vs="left",ho="right",Ko="#000",cl=Ko+"0",fo="mousemove",ul="mousedown",mo="mouseup",pl="mouseenter",hl="mouseleave",dl="dblclick",ah="resize",oh="scroll",fl="change",va="dppxchange",Zo="--",ci=typeof window<"u",Ao=ci?document:null,Xs=ci?window:null,rh=ci?navigator:null;let ve,aa;function zo(){let t=devicePixelRatio;ve!=t&&(ve=t,aa&&Lo(fl,aa,zo),aa=matchMedia(`(min-resolution: ${ve-.001}dppx) and (max-resolution: ${ve+.001}dppx)`),us(fl,aa,zo),Xs.dispatchEvent(new CustomEvent(va)))}function yt(t,e){if(e!=null){let n=t.classList;!n.contains(e)&&n.add(e)}}function _o(t,e){let n=t.classList;n.contains(e)&&n.remove(e)}function Fe(t,e,n){t.style[e]=n+"px"}function Wt(t,e,n,s){let i=Ao.createElement(t);return e!=null&&yt(i,e),n?.insertBefore(i,s),i}function Lt(t,e){return Wt("div",t,e)}const ml=new WeakMap;function ln(t,e,n,s,i){let a="translate("+e+"px,"+n+"px)",o=ml.get(t);a!=o&&(t.style.transform=a,ml.set(t,a),e<0||n<0||e>s||n>i?yt(t,rs):_o(t,rs))}const gl=new WeakMap;function vl(t,e,n){let s=e+n,i=gl.get(t);s!=i&&(gl.set(t,s),t.style.background=e,t.style.borderColor=n)}const xl=new WeakMap;function bl(t,e,n,s){let i=e+""+n,a=xl.get(t);i!=a&&(xl.set(t,i),t.style.height=n+"px",t.style.width=e+"px",t.style.marginLeft=s?-e/2+"px":0,t.style.marginTop=s?-n/2+"px":0)}const Jo={passive:!0},lh={...Jo,capture:!0};function us(t,e,n,s){e.addEventListener(t,n,s?lh:Jo)}function Lo(t,e,n,s){e.removeEventListener(t,n,Jo)}ci&&zo();function Ut(t,e,n,s){let i;n=n||0,s=s||e.length-1;let a=s<=2147483647;for(;s-n>1;)i=a?n+s>>1:Mt((n+s)/2),e[i]<t?n=i:s=i;return t-e[n]<=e[s]-t?n:s}function Cc(t){return(n,s,i)=>{let a=-1,o=-1;for(let l=s;l<=i;l++)if(t(n[l])){a=l;break}for(let l=i;l>=s;l--)if(t(n[l])){o=l;break}return[a,o]}}const Pc=t=>t!=null,Ac=t=>t!=null&&t>0,Ca=Cc(Pc),ch=Cc(Ac);function uh(t,e,n,s=0,i=!1){let a=i?ch:Ca,o=i?Ac:Pc;[e,n]=a(t,e,n);let l=t[e],u=t[e];if(e>-1)if(s==1)l=t[e],u=t[n];else if(s==-1)l=t[n],u=t[e];else for(let d=e;d<=n;d++){let v=t[d];o(v)&&(v<l?l=v:v>u&&(u=v))}return[l??Me,u??-Me]}function Pa(t,e,n,s){let i=Sl(t),a=Sl(e);t==e&&(i==-1?(t*=n,e/=n):(t/=n,e*=n));let o=n==10?vn:zc,l=i==1?Mt:Tt,u=a==1?Tt:Mt,d=l(o(He(t))),v=u(o(He(e))),m=Js(n,d),f=Js(n,v);return n==10&&(d<0&&(m=Ee(m,-d)),v<0&&(f=Ee(f,-v))),s||n==2?(t=m*i,e=f*a):(t=Tc(t,m),e=Aa(e,f)),[t,e]}function Qo(t,e,n,s){let i=Pa(t,e,n,s);return t==0&&(i[0]=0),e==0&&(i[1]=0),i}const er=.1,wl={mode:3,pad:er},Ii={pad:0,soft:null,mode:0},ph={min:Ii,max:Ii};function xa(t,e,n,s){return za(n)?yl(t,e,n):(Ii.pad=n,Ii.soft=s?0:null,Ii.mode=s?3:0,yl(t,e,ph))}function fe(t,e){return t??e}function hh(t,e,n){for(e=fe(e,0),n=fe(n,t.length-1);e<=n;){if(t[e]!=null)return!0;e++}return!1}function yl(t,e,n){let s=n.min,i=n.max,a=fe(s.pad,0),o=fe(i.pad,0),l=fe(s.hard,-Me),u=fe(i.hard,Me),d=fe(s.soft,Me),v=fe(i.soft,-Me),m=fe(s.mode,0),f=fe(i.mode,0),y=e-t,P=vn(y),O=ut(He(t),He(e)),F=vn(O),L=He(F-P);(y<1e-24||L>10)&&(y=0,(t==0||e==0)&&(y=1e-24,m==2&&d!=Me&&(a=0),f==2&&v!=-Me&&(o=0)));let M=y||O||1e3,D=vn(M),z=Js(10,Mt(D)),K=M*(y==0?t==0?.1:1:a),R=Ee(Tc(t-K,z/10),24),ee=t>=d&&(m==1||m==3&&R<=d||m==2&&R>=d)?d:Me,X=ut(l,R<ee&&t>=ee?ee:Xt(ee,R)),ie=M*(y==0?e==0?.1:1:o),J=Ee(Aa(e+ie,z/10),24),_=e<=v&&(f==1||f==3&&J>=v||f==2&&J<=v)?v:-Me,te=Xt(u,J>_&&e<=_?_:ut(_,J));return X==te&&X==0&&(te=100),[X,te]}const dh=new Intl.NumberFormat(ci?rh.language:"en-US"),tr=t=>dh.format(t),Et=Math,ma=Et.PI,He=Et.abs,Mt=Et.floor,Ye=Et.round,Tt=Et.ceil,Xt=Et.min,ut=Et.max,Js=Et.pow,Sl=Et.sign,vn=Et.log10,zc=Et.log2,fh=(t,e=1)=>Et.sinh(t)*e,go=(t,e=1)=>Et.asinh(t/e),Me=1/0;function kl(t){return(vn((t^t>>31)-(t>>31))|0)+1}function Fo(t,e,n){return Xt(ut(t,e),n)}function _c(t){return typeof t=="function"}function le(t){return _c(t)?t:()=>t}const mh=()=>{},Lc=t=>t,Fc=(t,e)=>e,gh=t=>null,Ml=t=>!0,El=(t,e)=>t==e,vh=/\.\d*?(?=9{6,}|0{6,})/gm,ds=t=>{if(Ic(t)||Dn.has(t))return t;const e=`${t}`,n=e.match(vh);if(n==null)return t;let s=n[0].length-1;if(e.indexOf("e-")!=-1){let[i,a]=e.split("e");return+`${ds(i)}e${a}`}return Ee(t,s)};function as(t,e){return ds(Ee(ds(t/e))*e)}function Aa(t,e){return ds(Tt(ds(t/e))*e)}function Tc(t,e){return ds(Mt(ds(t/e))*e)}function Ee(t,e=0){if(Ic(t))return t;let n=10**e,s=t*n*(1+Number.EPSILON);return Ye(s)/n}const Dn=new Map;function Nc(t){return((""+t).split(".")[1]||"").length}function Di(t,e,n,s){let i=[],a=s.map(Nc);for(let o=e;o<n;o++){let l=He(o),u=Ee(Js(t,o),l);for(let d=0;d<s.length;d++){let v=t==10?+`${s[d]}e${o}`:s[d]*u,m=(o>=0?0:l)+(o>=a[d]?0:a[d]),f=t==10?v:Ee(v,m);i.push(f),Dn.set(f,m)}}return i}const Ri={},nr=[],Qs=[null,null],Rn=Array.isArray,Ic=Number.isInteger,xh=t=>t===void 0;function Cl(t){return typeof t=="string"}function za(t){let e=!1;if(t!=null){let n=t.constructor;e=n==null||n==Object}return e}function bh(t){return t!=null&&typeof t=="object"}const wh=Object.getPrototypeOf(Uint8Array),Rc="__proto__";function ei(t,e=za){let n;if(Rn(t)){let s=t.find(i=>i!=null);if(Rn(s)||e(s)){n=Array(t.length);for(let i=0;i<t.length;i++)n[i]=ei(t[i],e)}else n=t.slice()}else if(t instanceof wh)n=t.slice();else if(e(t)){n={};for(let s in t)s!=Rc&&(n[s]=ei(t[s],e))}else n=t;return n}function qe(t){let e=arguments;for(let n=1;n<e.length;n++){let s=e[n];for(let i in s)i!=Rc&&(za(t[i])?qe(t[i],ei(s[i])):t[i]=ei(s[i]))}return t}const yh=0,Sh=1,kh=2;function Mh(t,e,n){for(let s=0,i,a=-1;s<e.length;s++){let o=e[s];if(o>a){for(i=o-1;i>=0&&t[i]==null;)t[i--]=null;for(i=o+1;i<n&&t[i]==null;)t[a=i++]=null}}}function Eh(t,e){if(Ah(t)){let o=t[0].slice();for(let l=1;l<t.length;l++)o.push(...t[l].slice(1));return zh(o[0])||(o=Ph(o)),o}let n=new Set;for(let o=0;o<t.length;o++){let u=t[o][0],d=u.length;for(let v=0;v<d;v++)n.add(u[v])}let s=[Array.from(n).sort((o,l)=>o-l)],i=s[0].length,a=new Map;for(let o=0;o<i;o++)a.set(s[0][o],o);for(let o=0;o<t.length;o++){let l=t[o],u=l[0];for(let d=1;d<l.length;d++){let v=l[d],m=Array(i).fill(void 0),f=e?e[o][d]:Sh,y=[];for(let P=0;P<v.length;P++){let O=v[P],F=a.get(u[P]);O===null?f!=yh&&(m[F]=O,f==kh&&y.push(F)):m[F]=O}Mh(m,y,i),s.push(m)}}return s}const Ch=typeof queueMicrotask>"u"?t=>Promise.resolve().then(t):queueMicrotask;function Ph(t){let e=t[0],n=e.length,s=Array(n);for(let a=0;a<s.length;a++)s[a]=a;s.sort((a,o)=>e[a]-e[o]);let i=[];for(let a=0;a<t.length;a++){let o=t[a],l=Array(n);for(let u=0;u<n;u++)l[u]=o[s[u]];i.push(l)}return i}function Ah(t){let e=t[0][0],n=e.length;for(let s=1;s<t.length;s++){let i=t[s][0];if(i.length!=n)return!1;if(i!=e){for(let a=0;a<n;a++)if(i[a]!=e[a])return!1}}return!0}function zh(t,e=100){const n=t.length;if(n<=1)return!0;let s=0,i=n-1;for(;s<=i&&t[s]==null;)s++;for(;i>=s&&t[i]==null;)i--;if(i<=s)return!0;const a=ut(1,Mt((i-s+1)/e));for(let o=t[s],l=s+a;l<=i;l+=a){const u=t[l];if(u!=null){if(u<=o)return!1;o=u}}return!0}const $c=["January","February","March","April","May","June","July","August","September","October","November","December"],Oc=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function Dc(t){return t.slice(0,3)}const _h=Oc.map(Dc),Lh=$c.map(Dc),Fh={MMMM:$c,MMM:Lh,WWWW:Oc,WWW:_h};function Ei(t){return(t<10?"0":"")+t}function Th(t){return(t<10?"00":t<100?"0":"")+t}const Nh={YYYY:t=>t.getFullYear(),YY:t=>(t.getFullYear()+"").slice(2),MMMM:(t,e)=>e.MMMM[t.getMonth()],MMM:(t,e)=>e.MMM[t.getMonth()],MM:t=>Ei(t.getMonth()+1),M:t=>t.getMonth()+1,DD:t=>Ei(t.getDate()),D:t=>t.getDate(),WWWW:(t,e)=>e.WWWW[t.getDay()],WWW:(t,e)=>e.WWW[t.getDay()],HH:t=>Ei(t.getHours()),H:t=>t.getHours(),h:t=>{let e=t.getHours();return e==0?12:e>12?e-12:e},AA:t=>t.getHours()>=12?"PM":"AM",aa:t=>t.getHours()>=12?"pm":"am",a:t=>t.getHours()>=12?"p":"a",mm:t=>Ei(t.getMinutes()),m:t=>t.getMinutes(),ss:t=>Ei(t.getSeconds()),s:t=>t.getSeconds(),fff:t=>Th(t.getMilliseconds())};function sr(t,e){e=e||Fh;let n=[],s=/\{([a-z]+)\}|[^{]+/gi,i;for(;i=s.exec(t);)n.push(i[0][0]=="{"?Nh[i[1]]:i[0]);return a=>{let o="";for(let l=0;l<n.length;l++)o+=typeof n[l]=="string"?n[l]:n[l](a,e);return o}}const Ih=new Intl.DateTimeFormat().resolvedOptions().timeZone;function Rh(t,e){let n;return e=="UTC"||e=="Etc/UTC"?n=new Date(+t+t.getTimezoneOffset()*6e4):e==Ih?n=t:(n=new Date(t.toLocaleString("en-US",{timeZone:e})),n.setMilliseconds(t.getMilliseconds())),n}const Bc=t=>t%1==0,ba=[1,2,2.5,5],$h=Di(10,-32,0,ba),qc=Di(10,0,32,ba),Oh=qc.filter(Bc),os=$h.concat(qc),ir=`
`,Vc="{YYYY}",Pl=ir+Vc,Yc="{M}/{D}",_i=ir+Yc,oa=_i+"/{YY}",Hc="{aa}",Dh="{h}:{mm}",js=Dh+Hc,Al=ir+js,zl=":{ss}",xe=null;function jc(t){let e=t*1e3,n=e*60,s=n*60,i=s*24,a=i*30,o=i*365,u=(t==1?Di(10,0,3,ba).filter(Bc):Di(10,-3,0,ba)).concat([e,e*5,e*10,e*15,e*30,n,n*5,n*10,n*15,n*30,s,s*2,s*3,s*4,s*6,s*8,s*12,i,i*2,i*3,i*4,i*5,i*6,i*7,i*8,i*9,i*10,i*15,a,a*2,a*3,a*4,a*6,o,o*2,o*5,o*10,o*25,o*50,o*100]);const d=[[o,Vc,xe,xe,xe,xe,xe,xe,1],[i*28,"{MMM}",Pl,xe,xe,xe,xe,xe,1],[i,Yc,Pl,xe,xe,xe,xe,xe,1],[s,"{h}"+Hc,oa,xe,_i,xe,xe,xe,1],[n,js,oa,xe,_i,xe,xe,xe,1],[e,zl,oa+" "+js,xe,_i+" "+js,xe,Al,xe,1],[t,zl+".{fff}",oa+" "+js,xe,_i+" "+js,xe,Al,xe,1]];function v(m){return(f,y,P,O,F,L)=>{let M=[],D=F>=o,z=F>=a&&F<o,K=m(P),R=Ee(K*t,3),ee=vo(K.getFullYear(),D?0:K.getMonth(),z||D?1:K.getDate()),X=Ee(ee*t,3);if(z||D){let ie=z?F/a:0,J=D?F/o:0,_=R==X?R:Ee(vo(ee.getFullYear()+J,ee.getMonth()+ie,1)*t,3),te=new Date(Ye(_/t)),q=te.getFullYear(),Z=te.getMonth();for(let Y=0;_<=O;Y++){let oe=vo(q+J*Y,Z+ie*Y,1),j=oe-m(Ee(oe*t,3));_=Ee((+oe+j)*t,3),_<=O&&M.push(_)}}else{let ie=F>=i?i:F,J=Mt(P)-Mt(R),_=X+J+Aa(R-X,ie);M.push(_);let te=m(_),q=te.getHours()+te.getMinutes()/n+te.getSeconds()/s,Z=F/s,Y=f.axes[y]._space,oe=L/Y;for(;_=Ee(_+F,t==1?0:3),!(_>O);)if(Z>1){let j=Mt(Ee(q+Z,6))%24,ce=m(_).getHours()-j;ce>1&&(ce=-1),_-=ce*s,q=(q+Z)%24;let me=M[M.length-1];Ee((_-me)/F,3)*oe>=.7&&M.push(_)}else M.push(_)}return M}}return[u,d,v]}const[Bh,qh,Vh]=jc(1),[Yh,Hh,jh]=jc(.001);Di(2,-53,53,[1]);function _l(t,e){return t.map(n=>n.map((s,i)=>i==0||i==8||s==null?s:e(i==1||n[8]==0?s:n[1]+s)))}function Ll(t,e){return(n,s,i,a,o)=>{let l=e.find(P=>o>=P[0])||e[e.length-1],u,d,v,m,f,y;return s.map(P=>{let O=t(P),F=O.getFullYear(),L=O.getMonth(),M=O.getDate(),D=O.getHours(),z=O.getMinutes(),K=O.getSeconds(),R=F!=u&&l[2]||L!=d&&l[3]||M!=v&&l[4]||D!=m&&l[5]||z!=f&&l[6]||K!=y&&l[7]||l[1];return u=F,d=L,v=M,m=D,f=z,y=K,R(O)})}}function Wh(t,e){let n=sr(e);return(s,i,a,o,l)=>i.map(u=>n(t(u)))}function vo(t,e,n){return new Date(t,e,n)}function Fl(t,e){return e(t)}const Uh="{YYYY}-{MM}-{DD} {h}:{mm}{aa}";function Tl(t,e){return(n,s,i,a)=>a==null?Zo:e(t(s))}function Xh(t,e){let n=t.series[e];return n.width?n.stroke(t,e):n.points.width?n.points.stroke(t,e):null}function Gh(t,e){return t.series[e].fill(t,e)}const Kh={show:!0,live:!0,isolate:!1,mount:mh,markers:{show:!0,width:2,stroke:Xh,fill:Gh,dash:"solid"},idx:null,idxs:null,values:[]};function Zh(t,e){let n=t.cursor.points,s=Lt(),i=n.size(t,e);Fe(s,Ai,i),Fe(s,zi,i);let a=i/-2;Fe(s,"marginLeft",a),Fe(s,"marginTop",a);let o=n.width(t,e,i);return o&&Fe(s,"borderWidth",o),s}function Jh(t,e){let n=t.series[e].points;return n._fill||n._stroke}function Qh(t,e){let n=t.series[e].points;return n._stroke||n._fill}function ed(t,e){return t.series[e].points.size}const xo=[0,0];function td(t,e,n){return xo[0]=e,xo[1]=n,xo}function ra(t,e,n,s=!0){return i=>{i.button==0&&(!s||i.target==e)&&n(i)}}function bo(t,e,n,s=!0){return i=>{(!s||i.target==e)&&n(i)}}const nd={show:!0,x:!0,y:!0,lock:!1,move:td,points:{one:!1,show:Zh,size:ed,width:0,stroke:Qh,fill:Jh},bind:{mousedown:ra,mouseup:ra,click:ra,dblclick:ra,mousemove:bo,mouseleave:bo,mouseenter:bo},drag:{setScale:!0,x:!0,y:!1,dist:0,uni:null,click:(t,e)=>{e.stopPropagation(),e.stopImmediatePropagation()},_x:!1,_y:!1},focus:{dist:(t,e,n,s,i)=>s-i,prox:-1,bias:0},hover:{skip:[void 0],prox:null,bias:0},left:-10,top:-10,idx:null,dataIdx:null,idxs:null,event:null},Wc={show:!0,stroke:"rgba(0,0,0,0.07)",width:2},ar=qe({},Wc,{filter:Fc}),Uc=qe({},ar,{size:10}),Xc=qe({},Wc,{show:!1}),or='12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',Gc="bold "+or,Kc=1.5,Nl={show:!0,scale:"x",stroke:Ko,space:50,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:Gc,side:2,grid:ar,ticks:Uc,border:Xc,font:or,lineGap:Kc,rotate:0},sd="Value",id="Time",Il={show:!0,scale:"x",auto:!1,sorted:1,min:Me,max:-Me,idxs:[]};function ad(t,e,n,s,i){return e.map(a=>a==null?"":tr(a))}function od(t,e,n,s,i,a,o){let l=[],u=Dn.get(i)||0;n=o?n:Ee(Aa(n,i),u);for(let d=n;d<=s;d=Ee(d+i,u))l.push(Object.is(d,-0)?0:d);return l}function To(t,e,n,s,i,a,o){const l=[],u=t.scales[t.axes[e].scale].log,d=u==10?vn:zc,v=Mt(d(n));i=Js(u,v),u==10&&(i=os[Ut(i,os)]);let m=n,f=i*u;u==10&&(f=os[Ut(f,os)]);do l.push(m),m=m+i,u==10&&!Dn.has(m)&&(m=Ee(m,Dn.get(i))),m>=f&&(i=m,f=i*u,u==10&&(f=os[Ut(f,os)]));while(m<=s);return l}function rd(t,e,n,s,i,a,o){let u=t.scales[t.axes[e].scale].asinh,d=s>u?To(t,e,ut(u,n),s,i):[u],v=s>=0&&n<=0?[0]:[];return(n<-u?To(t,e,ut(u,-s),-n,i):[u]).reverse().map(f=>-f).concat(v,d)}const Zc=/./,ld=/[12357]/,cd=/[125]/,Rl=/1/,No=(t,e,n,s)=>t.map((i,a)=>e==4&&i==0||a%s==0&&n.test(i.toExponential()[i<0?1:0])?i:null);function ud(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=t.scales[o],u=t.valToPos,d=a._space,v=u(10,o),m=u(9,o)-v>=d?Zc:u(7,o)-v>=d?ld:u(5,o)-v>=d?cd:Rl;if(m==Rl){let f=He(u(1,o)-v);if(f<d)return No(e.slice().reverse(),l.distr,m,Tt(d/f)).reverse()}return No(e,l.distr,m,1)}function pd(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=a._space,u=t.valToPos,d=He(u(1,o)-u(2,o));return d<l?No(e.slice().reverse(),3,Zc,Tt(l/d)).reverse():e}function hd(t,e,n,s){return s==null?Zo:e==null?"":tr(e)}const $l={show:!0,scale:"y",stroke:Ko,space:30,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:Gc,side:3,grid:ar,ticks:Uc,border:Xc,font:or,lineGap:Kc,rotate:0};function dd(t,e){let n=3+(t||1)*2;return Ee(n*e,3)}function fd(t,e){let{scale:n,idxs:s}=t.series[0],i=t._data[0],a=t.valToPos(i[s[0]],n,!0),o=t.valToPos(i[s[1]],n,!0),l=He(o-a),u=t.series[e],d=l/(u.points.space*ve);return s[1]-s[0]<=d}const Ol={scale:null,auto:!0,sorted:0,min:Me,max:-Me},Jc=(t,e,n,s,i)=>i,Dl={show:!0,auto:!0,sorted:0,gaps:Jc,alpha:1,facets:[qe({},Ol,{scale:"x"}),qe({},Ol,{scale:"y"})]},Bl={scale:"y",auto:!0,sorted:0,show:!0,spanGaps:!1,gaps:Jc,alpha:1,points:{show:fd,filter:null},values:null,min:Me,max:-Me,idxs:[],path:null,clip:null};function md(t,e,n,s,i){return n/10}const Qc={time:Bp,auto:!0,distr:1,log:10,asinh:1,min:null,max:null,dir:1,ori:0},gd=qe({},Qc,{time:!1,ori:1}),ql={};function eu(t,e){let n=ql[t];return n||(n={key:t,plots:[],sub(s){n.plots.push(s)},unsub(s){n.plots=n.plots.filter(i=>i!=s)},pub(s,i,a,o,l,u,d){for(let v=0;v<n.plots.length;v++)n.plots[v]!=i&&n.plots[v].pub(s,i,a,o,l,u,d)}},t!=null&&(ql[t]=n)),n}const ti=1,Io=2;function Ss(t,e,n){const s=t.mode,i=t.series[e],a=s==2?t._data[e]:t._data,o=t.scales,l=t.bbox;let u=a[0],d=s==2?a[1]:a[e],v=s==2?o[i.facets[0].scale]:o[t.series[0].scale],m=s==2?o[i.facets[1].scale]:o[i.scale],f=l.left,y=l.top,P=l.width,O=l.height,F=t.valToPosH,L=t.valToPosV;return v.ori==0?n(i,u,d,v,m,F,L,f,y,P,O,La,ui,Ta,nu,iu):n(i,u,d,v,m,L,F,y,f,O,P,Fa,pi,cr,su,au)}function rr(t,e){let n=0,s=0,i=fe(t.bands,nr);for(let a=0;a<i.length;a++){let o=i[a];o.series[0]==e?n=o.dir:o.series[1]==e&&(o.dir==1?s|=1:s|=2)}return[n,s==1?-1:s==2?1:s==3?2:0]}function vd(t,e,n,s,i){let a=t.mode,o=t.series[e],l=a==2?o.facets[1].scale:o.scale,u=t.scales[l];return i==-1?u.min:i==1?u.max:u.distr==3?u.dir==1?u.min:u.max:0}function xn(t,e,n,s,i,a){return Ss(t,e,(o,l,u,d,v,m,f,y,P,O,F)=>{let L=o.pxRound;const M=d.dir*(d.ori==0?1:-1),D=d.ori==0?ui:pi;let z,K;M==1?(z=n,K=s):(z=s,K=n);let R=L(m(l[z],d,O,y)),ee=L(f(u[z],v,F,P)),X=L(m(l[K],d,O,y)),ie=L(f(a==1?v.max:v.min,v,F,P)),J=new Path2D(i);return D(J,X,ie),D(J,R,ie),D(J,R,ee),J})}function _a(t,e,n,s,i,a){let o=null;if(t.length>0){o=new Path2D;const l=e==0?Ta:cr;let u=n;for(let m=0;m<t.length;m++){let f=t[m];if(f[1]>f[0]){let y=f[0]-u;y>0&&l(o,u,s,y,s+a),u=f[1]}}let d=n+i-u,v=10;d>0&&l(o,u,s-v/2,d,s+a+v)}return o}function xd(t,e,n){let s=t[t.length-1];s&&s[0]==e?s[1]=n:t.push([e,n])}function lr(t,e,n,s,i,a,o){let l=[],u=t.length;for(let d=i==1?n:s;d>=n&&d<=s;d+=i)if(e[d]===null){let m=d,f=d;if(i==1)for(;++d<=s&&e[d]===null;)f=d;else for(;--d>=n&&e[d]===null;)f=d;let y=a(t[m]),P=f==m?y:a(t[f]),O=m-i;y=o<=0&&O>=0&&O<u?a(t[O]):y;let L=f+i;P=o>=0&&L>=0&&L<u?a(t[L]):P,P>=y&&l.push([y,P])}return l}function Vl(t){return t==0?Lc:t==1?Ye:e=>as(e,t)}function tu(t){let e=t==0?La:Fa,n=t==0?(i,a,o,l,u,d)=>{i.arcTo(a,o,l,u,d)}:(i,a,o,l,u,d)=>{i.arcTo(o,a,u,l,d)},s=t==0?(i,a,o,l,u)=>{i.rect(a,o,l,u)}:(i,a,o,l,u)=>{i.rect(o,a,u,l)};return(i,a,o,l,u,d=0,v=0)=>{d==0&&v==0?s(i,a,o,l,u):(d=Xt(d,l/2,u/2),v=Xt(v,l/2,u/2),e(i,a+d,o),n(i,a+l,o,a+l,o+u,d),n(i,a+l,o+u,a,o+u,v),n(i,a,o+u,a,o,v),n(i,a,o,a+l,o,d),i.closePath())}}const La=(t,e,n)=>{t.moveTo(e,n)},Fa=(t,e,n)=>{t.moveTo(n,e)},ui=(t,e,n)=>{t.lineTo(e,n)},pi=(t,e,n)=>{t.lineTo(n,e)},Ta=tu(0),cr=tu(1),nu=(t,e,n,s,i,a)=>{t.arc(e,n,s,i,a)},su=(t,e,n,s,i,a)=>{t.arc(n,e,s,i,a)},iu=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(e,n,s,i,a,o)},au=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(n,e,i,s,o,a)};function ou(t){return(e,n,s,i,a)=>Ss(e,n,(o,l,u,d,v,m,f,y,P,O,F)=>{let{pxRound:L,points:M}=o,D,z;d.ori==0?(D=La,z=nu):(D=Fa,z=su);const K=Ee(M.width*ve,3);let R=(M.size-M.width)/2*ve,ee=Ee(R*2,3),X=new Path2D,ie=new Path2D,{left:J,top:_,width:te,height:q}=e.bbox;Ta(ie,J-ee,_-ee,te+ee*2,q+ee*2);const Z=Y=>{if(u[Y]!=null){let oe=L(m(l[Y],d,O,y)),j=L(f(u[Y],v,F,P));D(X,oe+R,j),z(X,oe,j,R,0,ma*2)}};if(a)a.forEach(Z);else for(let Y=s;Y<=i;Y++)Z(Y);return{stroke:K>0?X:null,fill:X,clip:ie,flags:ti|Io}})}function ru(t){return(e,n,s,i,a,o)=>{s!=i&&(a!=s&&o!=s&&t(e,n,s),a!=i&&o!=i&&t(e,n,i),t(e,n,o))}}const bd=ru(ui),wd=ru(pi);function lu(t){const e=fe(t?.alignGaps,0);return(n,s,i,a)=>Ss(n,s,(o,l,u,d,v,m,f,y,P,O,F)=>{[i,a]=Ca(u,i,a);let L=o.pxRound,M=q=>L(m(q,d,O,y)),D=q=>L(f(q,v,F,P)),z,K;d.ori==0?(z=ui,K=bd):(z=pi,K=wd);const R=d.dir*(d.ori==0?1:-1),ee={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:ti},X=ee.stroke;let ie=!1;if(a-i>=O*4){let q=H=>n.posToVal(H,d.key,!0),Z=null,Y=null,oe,j,st,ye=M(l[R==1?i:a]),ce=M(l[i]),me=M(l[a]),ae=q(R==1?ce+1:me-1);for(let H=R==1?i:a;H>=i&&H<=a;H+=R){let Se=l[H],Ce=(R==1?Se<ae:Se>ae)?ye:M(Se),he=u[H];Ce==ye?he!=null?(j=he,Z==null?(z(X,Ce,D(j)),oe=Z=Y=j):j<Z?Z=j:j>Y&&(Y=j)):he===null&&(ie=!0):(Z!=null&&K(X,ye,D(Z),D(Y),D(oe),D(j)),he!=null?(j=he,z(X,Ce,D(j)),Z=Y=oe=j):(Z=Y=null,he===null&&(ie=!0)),ye=Ce,ae=q(ye+R))}Z!=null&&Z!=Y&&st!=ye&&K(X,ye,D(Z),D(Y),D(oe),D(j))}else for(let q=R==1?i:a;q>=i&&q<=a;q+=R){let Z=u[q];Z===null?ie=!0:Z!=null&&z(X,M(l[q]),D(Z))}let[_,te]=rr(n,s);if(o.fill!=null||_!=0){let q=ee.fill=new Path2D(X),Z=o.fillTo(n,s,o.min,o.max,_),Y=D(Z),oe=M(l[i]),j=M(l[a]);R==-1&&([j,oe]=[oe,j]),z(q,j,Y),z(q,oe,Y)}if(!o.spanGaps){let q=[];ie&&q.push(...lr(l,u,i,a,R,M,e)),ee.gaps=q=o.gaps(n,s,i,a,q),ee.clip=_a(q,d.ori,y,P,O,F)}return te!=0&&(ee.band=te==2?[xn(n,s,i,a,X,-1),xn(n,s,i,a,X,1)]:xn(n,s,i,a,X,te)),ee})}function yd(t){const e=fe(t.align,1),n=fe(t.ascDesc,!1),s=fe(t.alignGaps,0),i=fe(t.extend,!1);return(a,o,l,u)=>Ss(a,o,(d,v,m,f,y,P,O,F,L,M,D)=>{[l,u]=Ca(m,l,u);let z=d.pxRound,{left:K,width:R}=a.bbox,ee=ce=>z(P(ce,f,M,F)),X=ce=>z(O(ce,y,D,L)),ie=f.ori==0?ui:pi;const J={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:ti},_=J.stroke,te=f.dir*(f.ori==0?1:-1);let q=X(m[te==1?l:u]),Z=ee(v[te==1?l:u]),Y=Z,oe=Z;i&&e==-1&&(oe=K,ie(_,oe,q)),ie(_,Z,q);for(let ce=te==1?l:u;ce>=l&&ce<=u;ce+=te){let me=m[ce];if(me==null)continue;let ae=ee(v[ce]),H=X(me);e==1?ie(_,ae,q):ie(_,Y,H),ie(_,ae,H),q=H,Y=ae}let j=Y;i&&e==1&&(j=K+R,ie(_,j,q));let[st,ye]=rr(a,o);if(d.fill!=null||st!=0){let ce=J.fill=new Path2D(_),me=d.fillTo(a,o,d.min,d.max,st),ae=X(me);ie(ce,j,ae),ie(ce,oe,ae)}if(!d.spanGaps){let ce=[];ce.push(...lr(v,m,l,u,te,ee,s));let me=d.width*ve/2,ae=n||e==1?me:-me,H=n||e==-1?-me:me;ce.forEach(Se=>{Se[0]+=ae,Se[1]+=H}),J.gaps=ce=d.gaps(a,o,l,u,ce),J.clip=_a(ce,f.ori,F,L,M,D)}return ye!=0&&(J.band=ye==2?[xn(a,o,l,u,_,-1),xn(a,o,l,u,_,1)]:xn(a,o,l,u,_,ye)),J})}function Yl(t,e,n,s,i,a,o=Me){if(t.length>1){let l=null;for(let u=0,d=1/0;u<t.length;u++)if(e[u]!==void 0){if(l!=null){let v=He(t[u]-t[l]);v<d&&(d=v,o=He(n(t[u],s,i,a)-n(t[l],s,i,a)))}l=u}}return o}function Sd(t){t=t||Ri;const e=fe(t.size,[.6,Me,1]),n=t.align||0,s=t.gap||0;let i=t.radius;i=i==null?[0,0]:typeof i=="number"?[i,0]:i;const a=le(i),o=1-e[0],l=fe(e[1],Me),u=fe(e[2],1),d=fe(t.disp,Ri),v=fe(t.each,y=>{}),{fill:m,stroke:f}=d;return(y,P,O,F)=>Ss(y,P,(L,M,D,z,K,R,ee,X,ie,J,_)=>{let te=L.pxRound,q=n,Z=s*ve,Y=l*ve,oe=u*ve,j,st;z.ori==0?[j,st]=a(y,P):[st,j]=a(y,P);const ye=z.dir*(z.ori==0?1:-1);let ce=z.ori==0?Ta:cr,me=z.ori==0?v:($,Pe,Ve,Cs,Zn,tn,Jn)=>{v($,Pe,Ve,Zn,Cs,Jn,tn)},ae=fe(y.bands,nr).find($=>$.series[0]==P),H=ae!=null?ae.dir:0,Se=L.fillTo(y,P,L.min,L.max,H),Ue=te(ee(Se,K,_,ie)),Ce,he,T,S=J,E=te(L.width*ve),V=!1,ke=null,ue=null,Re=null,pt=null;m!=null&&(E==0||f!=null)&&(V=!0,ke=m.values(y,P,O,F),ue=new Map,new Set(ke).forEach($=>{$!=null&&ue.set($,new Path2D)}),E>0&&(Re=f.values(y,P,O,F),pt=new Map,new Set(Re).forEach($=>{$!=null&&pt.set($,new Path2D)})));let{x0:$t,size:en}=d;if($t!=null&&en!=null){q=1,M=$t.values(y,P,O,F),$t.unit==2&&(M=M.map(Ve=>y.posToVal(X+Ve*J,z.key,!0)));let $=en.values(y,P,O,F);en.unit==2?he=$[0]*J:he=R($[0],z,J,X)-R(0,z,J,X),S=Yl(M,D,R,z,J,X,S),T=S-he+Z}else S=Yl(M,D,R,z,J,X,S),T=S*o+Z,he=S-T;T<1&&(T=0),E>=he/2&&(E=0),T<5&&(te=Lc);let Gi=T>0,Gn=S-T-(Gi?E:0);he=te(Fo(Gn,oe,Y)),Ce=(q==0?he/2:q==ye?0:he)-q*ye*((q==0?Z/2:0)+(Gi?E/2:0));const ot={stroke:null,fill:null,clip:null,band:null,gaps:null,flags:0},Es=V?null:new Path2D;let pn=null;if(ae!=null)pn=y.data[ae.series[1]];else{let{y0:$,y1:Pe}=d;$!=null&&Pe!=null&&(D=Pe.values(y,P,O,F),pn=$.values(y,P,O,F))}let Kn=j*he,se=st*he;for(let $=ye==1?O:F;$>=O&&$<=F;$+=ye){let Pe=D[$];if(Pe==null)continue;if(pn!=null){let ht=pn[$]??0;if(Pe-ht==0)continue;Ue=ee(ht,K,_,ie)}let Ve=z.distr!=2||d!=null?M[$]:$,Cs=R(Ve,z,J,X),Zn=ee(fe(Pe,Se),K,_,ie),tn=te(Cs-Ce),Jn=te(ut(Zn,Ue)),vt=te(Xt(Zn,Ue)),Ct=Jn-vt;if(Pe!=null){let ht=Pe<0?se:Kn,Ot=Pe<0?Kn:se;V?(E>0&&Re[$]!=null&&ce(pt.get(Re[$]),tn,vt+Mt(E/2),he,ut(0,Ct-E),ht,Ot),ke[$]!=null&&ce(ue.get(ke[$]),tn,vt+Mt(E/2),he,ut(0,Ct-E),ht,Ot)):ce(Es,tn,vt+Mt(E/2),he,ut(0,Ct-E),ht,Ot),me(y,P,$,tn-E/2,vt,he+E,Ct)}}return E>0?ot.stroke=V?pt:Es:V||(ot._fill=L.width==0?L._fill:L._stroke??L._fill,ot.width=0),ot.fill=V?ue:Es,ot})}function kd(t,e){const n=fe(e?.alignGaps,0);return(s,i,a,o)=>Ss(s,i,(l,u,d,v,m,f,y,P,O,F,L)=>{[a,o]=Ca(d,a,o);let M=l.pxRound,D=j=>M(f(j,v,F,P)),z=j=>M(y(j,m,L,O)),K,R,ee;v.ori==0?(K=La,ee=ui,R=iu):(K=Fa,ee=pi,R=au);const X=v.dir*(v.ori==0?1:-1);let ie=D(u[X==1?a:o]),J=ie,_=[],te=[];for(let j=X==1?a:o;j>=a&&j<=o;j+=X)if(d[j]!=null){let ye=u[j],ce=D(ye);_.push(J=ce),te.push(z(d[j]))}const q={stroke:t(_,te,K,ee,R,M),fill:null,clip:null,band:null,gaps:null,flags:ti},Z=q.stroke;let[Y,oe]=rr(s,i);if(l.fill!=null||Y!=0){let j=q.fill=new Path2D(Z),st=l.fillTo(s,i,l.min,l.max,Y),ye=z(st);ee(j,J,ye),ee(j,ie,ye)}if(!l.spanGaps){let j=[];j.push(...lr(u,d,a,o,X,D,n)),q.gaps=j=l.gaps(s,i,a,o,j),q.clip=_a(j,v.ori,P,O,F,L)}return oe!=0&&(q.band=oe==2?[xn(s,i,a,o,Z,-1),xn(s,i,a,o,Z,1)]:xn(s,i,a,o,Z,oe)),q})}function Md(t){return kd(Ed,t)}function Ed(t,e,n,s,i,a){const o=t.length;if(o<2)return null;const l=new Path2D;if(n(l,t[0],e[0]),o==2)s(l,t[1],e[1]);else{let u=Array(o),d=Array(o-1),v=Array(o-1),m=Array(o-1);for(let f=0;f<o-1;f++)v[f]=e[f+1]-e[f],m[f]=t[f+1]-t[f],d[f]=v[f]/m[f];u[0]=d[0];for(let f=1;f<o-1;f++)d[f]===0||d[f-1]===0||d[f-1]>0!=d[f]>0?u[f]=0:(u[f]=3*(m[f-1]+m[f])/((2*m[f]+m[f-1])/d[f-1]+(m[f]+2*m[f-1])/d[f]),isFinite(u[f])||(u[f]=0));u[o-1]=d[o-2];for(let f=0;f<o-1;f++)i(l,t[f]+m[f]/3,e[f]+u[f]*m[f]/3,t[f+1]-m[f]/3,e[f+1]-u[f+1]*m[f]/3,t[f+1],e[f+1])}return l}const Ro=new Set;function Hl(){for(let t of Ro)t.syncRect(!0)}ci&&(us(ah,Xs,Hl),us(oh,Xs,Hl,!0),us(va,Xs,()=>{Te.pxRatio=ve}));const Cd=lu(),Pd=ou();function jl(t,e,n,s){return(s?[t[0],t[1]].concat(t.slice(2)):[t[0]].concat(t.slice(1))).map((a,o)=>$o(a,o,e,n))}function Ad(t,e){return t.map((n,s)=>s==0?{}:qe({},e,n))}function $o(t,e,n,s){return qe({},e==0?n:s,t)}function cu(t,e,n){return e==null?Qs:[e,n]}const zd=cu;function _d(t,e,n){return e==null?Qs:xa(e,n,er,!0)}function uu(t,e,n,s){return e==null?Qs:Pa(e,n,t.scales[s].log,!1)}const Ld=uu;function pu(t,e,n,s){return e==null?Qs:Qo(e,n,t.scales[s].log,!1)}const Fd=pu;function Td(t,e,n,s,i){let a=ut(kl(t),kl(e)),o=e-t,l=Ut(i/s*o,n);do{let u=n[l],d=s*u/o;if(d>=i&&a+(u<5?Dn.get(u):0)<=17)return[u,d]}while(++l<n.length);return[0,0]}function Wl(t){let e,n;return t=t.replace(/(\d+)px/,(s,i)=>(e=Ye((n=+i)*ve))+"px"),[t,e,n]}function Nd(t){t.show&&[t.font,t.labelFont].forEach(e=>{let n=Ee(e[2]*ve,1);e[0]=e[0].replace(/[0-9.]+px/,n+"px"),e[1]=n})}function Te(t,e,n){const s={mode:fe(t.mode,1)},i=s.mode;function a(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?1-g:g)}function o(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?g:1-g)}function l(r,c,p,h){return c.ori==0?a(r,c,p,h):o(r,c,p,h)}s.valToPosH=a,s.valToPosV=o;let u=!1;s.status=0;const d=s.root=Lt(qp);if(t.id!=null&&(d.id=t.id),yt(d,t.class),t.title){let r=Lt(Hp,d);r.textContent=t.title}const v=Wt("canvas"),m=s.ctx=v.getContext("2d"),f=Lt(jp,d);us("click",f,r=>{r.target===P&&(ze!=$s||Ie!=Os)&&tt.click(s,r)},!0);const y=s.under=Lt(Wp,f);f.appendChild(v);const P=s.over=Lt(Up,f);t=ei(t);const O=+fe(t.pxAlign,1),F=Vl(O);(t.plugins||[]).forEach(r=>{r.opts&&(t=r.opts(s,t)||t)});const L=t.ms||.001,M=s.series=i==1?jl(t.series||[],Il,Bl,!1):Ad(t.series||[null],Dl),D=s.axes=jl(t.axes||[],Nl,$l,!0),z=s.scales={},K=s.bands=t.bands||[];K.forEach(r=>{r.fill=le(r.fill||null),r.dir=fe(r.dir,-1)});const R=i==2?M[1].facets[0].scale:M[0].scale,ee={axes:Ep,series:wp},X=(t.drawOrder||["axes","series"]).map(r=>ee[r]);function ie(r){const c=r.distr==3?p=>vn(p>0?p:r.clamp(s,p,r.min,r.max,r.key)):r.distr==4?p=>go(p,r.asinh):r.distr==100?p=>r.fwd(p):p=>p;return p=>{let h=c(p),{_min:g,_max:b}=r,w=b-g;return(h-g)/w}}function J(r){let c=z[r];if(c==null){let p=(t.scales||Ri)[r]||Ri;if(p.from!=null){J(p.from);let h=qe({},z[p.from],p,{key:r});h.valToPct=ie(h),z[r]=h}else{c=z[r]=qe({},r==R?Qc:gd,p),c.key=r;let h=c.time,g=c.range,b=Rn(g);if((r!=R||i==2&&!h)&&(b&&(g[0]==null||g[1]==null)&&(g={min:g[0]==null?wl:{mode:1,hard:g[0],soft:g[0]},max:g[1]==null?wl:{mode:1,hard:g[1],soft:g[1]}},b=!1),!b&&za(g))){let w=g;g=(k,C,N)=>C==null?Qs:xa(C,N,w)}c.range=le(g||(h?zd:r==R?c.distr==3?Ld:c.distr==4?Fd:cu:c.distr==3?uu:c.distr==4?pu:_d)),c.auto=le(b?!1:c.auto),c.clamp=le(c.clamp||md),c._min=c._max=null,c.valToPct=ie(c)}}}J("x"),J("y"),i==1&&M.forEach(r=>{J(r.scale)}),D.forEach(r=>{J(r.scale)});for(let r in t.scales)J(r);const _=z[R],te=_.distr;let q,Z;_.ori==0?(yt(d,Vp),q=a,Z=o):(yt(d,Yp),q=o,Z=a);const Y={};for(let r in z){let c=z[r];(c.min!=null||c.max!=null)&&(Y[r]={min:c.min,max:c.max},c.min=c.max=null)}const oe=t.tzDate||(r=>new Date(Ye(r/L))),j=t.fmtDate||sr,st=L==1?Vh(oe):jh(oe),ye=Ll(oe,_l(L==1?qh:Hh,j)),ce=Tl(oe,Fl(Uh,j)),me=[],ae=s.legend=qe({},Kh,t.legend),H=s.cursor=qe({},nd,{drag:{y:i==2}},t.cursor),Se=ae.show,Ue=H.show,Ce=ae.markers;ae.idxs=me,Ce.width=le(Ce.width),Ce.dash=le(Ce.dash),Ce.stroke=le(Ce.stroke),Ce.fill=le(Ce.fill);let he,T,S,E=[],V=[],ke,ue=!1,Re={};if(ae.live){const r=M[1]?M[1].values:null;ue=r!=null,ke=ue?r(s,1,0):{_:0};for(let c in ke)Re[c]=Zo}if(Se)if(he=Wt("table",Qp,d),S=Wt("tbody",null,he),ae.mount(s,he),ue){T=Wt("thead",null,he,S);let r=Wt("tr",null,T);Wt("th",null,r);for(var pt in ke)Wt("th",rl,r).textContent=pt}else yt(he,th),ae.live&&yt(he,eh);const $t={show:!0},en={show:!1};function Gi(r,c){if(c==0&&(ue||!ae.live||i==2))return Qs;let p=[],h=Wt("tr",nh,S,S.childNodes[c]);yt(h,r.class),r.show||yt(h,rs);let g=Wt("th",null,h);if(Ce.show){let k=Lt(sh,g);if(c>0){let C=Ce.width(s,c);C&&(k.style.border=C+"px "+Ce.dash(s,c)+" "+Ce.stroke(s,c)),k.style.background=Ce.fill(s,c)}}let b=Lt(rl,g);r.label instanceof HTMLElement?b.appendChild(r.label):b.textContent=r.label,c>0&&(Ce.show||(b.style.color=r.width>0?Ce.stroke(s,c):Ce.fill(s,c)),ot("click",g,k=>{if(H._lock)return;es(k);let C=M.indexOf(r);if((k.ctrlKey||k.metaKey)!=ae.isolate){let N=M.some((I,B)=>B>0&&B!=C&&I.show);M.forEach((I,B)=>{B>0&&sn(B,N?B==C?$t:en:$t,!0,Be.setSeries)})}else sn(C,{show:!r.show},!0,Be.setSeries)},!1),As&&ot(pl,g,k=>{H._lock||(es(k),sn(M.indexOf(r),Bs,!0,Be.setSeries))},!1));for(var w in ke){let k=Wt("td",ih,h);k.textContent="--",p.push(k)}return[h,p]}const Gn=new Map;function ot(r,c,p,h=!0){const g=Gn.get(c)||{},b=H.bind[r](s,c,p,h);b&&(us(r,c,g[r]=b),Gn.set(c,g))}function Es(r,c,p){const h=Gn.get(c)||{};for(let g in h)(r==null||g==r)&&(Lo(g,c,h[g]),delete h[g]);r==null&&Gn.delete(c)}let pn=0,Kn=0,se=0,$=0,Pe=0,Ve=0,Cs=Pe,Zn=Ve,tn=se,Jn=$,vt=0,Ct=0,ht=0,Ot=0;s.bbox={};let Ya=!1,Ki=!1,Ps=!1,Qn=!1,Zi=!1,Pt=!1;function Ha(r,c,p){(p||r!=s.width||c!=s.height)&&Lr(r,c),Ts(!1),Ps=!0,Ki=!0,Ns()}function Lr(r,c){s.width=pn=se=r,s.height=Kn=$=c,Pe=Ve=0,dp(),fp();let p=s.bbox;vt=p.left=as(Pe*ve,.5),Ct=p.top=as(Ve*ve,.5),ht=p.width=as(se*ve,.5),Ot=p.height=as($*ve,.5)}const up=3;function pp(){let r=!1,c=0;for(;!r;){c++;let p=kp(c),h=Mp(c);r=c==up||p&&h,r||(Lr(s.width,s.height),Ki=!0)}}function hp({width:r,height:c}){Ha(r,c)}s.setSize=hp;function dp(){let r=!1,c=!1,p=!1,h=!1;D.forEach((g,b)=>{if(g.show&&g._show){let{side:w,_size:k}=g,C=w%2,N=g.label!=null?g.labelSize:0,I=k+N;I>0&&(C?(se-=I,w==3?(Pe+=I,h=!0):p=!0):($-=I,w==0?(Ve+=I,r=!0):c=!0))}}),ts[0]=r,ts[1]=p,ts[2]=c,ts[3]=h,se-=zn[1]+zn[3],Pe+=zn[3],$-=zn[2]+zn[0],Ve+=zn[0]}function fp(){let r=Pe+se,c=Ve+$,p=Pe,h=Ve;function g(b,w){switch(b){case 1:return r+=w,r-w;case 2:return c+=w,c-w;case 3:return p-=w,p+w;case 0:return h-=w,h+w}}D.forEach((b,w)=>{if(b.show&&b._show){let k=b.side;b._pos=g(k,b._size),b.label!=null&&(b._lpos=g(k,b.labelSize))}})}if(H.dataIdx==null){let r=H.hover,c=r.skip=new Set(r.skip??[]);c.add(void 0);let p=r.prox=le(r.prox),h=r.bias??=0;H.dataIdx=(g,b,w,k)=>{if(b==0)return w;let C=w,N=p(g,b,w,k)??Me,I=N>=0&&N<Me,B=_.ori==0?se:$,Q=H.left,ge=e[0],de=e[b];if(c.has(de[w])){C=null;let re=null,G=null,W;if(h==0||h==-1)for(W=w;re==null&&W-- >0;)c.has(de[W])||(re=W);if(h==0||h==1)for(W=w;G==null&&W++<de.length;)c.has(de[W])||(G=W);if(re!=null||G!=null)if(I){let Le=re==null?-1/0:q(ge[re],_,B,0),$e=G==null?1/0:q(ge[G],_,B,0),Qe=Q-Le,we=$e-Q;Qe<=we?Qe<=N&&(C=re):we<=N&&(C=G)}else C=G==null?re:re==null?G:w-re<=G-w?re:G}else I&&He(Q-q(ge[w],_,B,0))>N&&(C=null);return C}}const es=r=>{H.event=r};H.idxs=me,H._lock=!1;let it=H.points;it.show=le(it.show),it.size=le(it.size),it.stroke=le(it.stroke),it.width=le(it.width),it.fill=le(it.fill);const nn=s.focus=qe({},t.focus||{alpha:.3},H.focus),As=nn.prox>=0,zs=As&&it.one;let At=[],_s=[],Ls=[];function Fr(r,c){let p=it.show(s,c);if(p instanceof HTMLElement)return yt(p,Jp),yt(p,r.class),ln(p,-10,-10,se,$),P.insertBefore(p,At[c]),p}function Tr(r,c){if(i==1||c>0){let p=i==1&&z[r.scale].time,h=r.value;r.value=p?Cl(h)?Tl(oe,Fl(h,j)):h||ce:h||hd,r.label=r.label||(p?id:sd)}if(zs||c>0){r.width=r.width==null?1:r.width,r.paths=r.paths||Cd||gh,r.fillTo=le(r.fillTo||vd),r.pxAlign=+fe(r.pxAlign,O),r.pxRound=Vl(r.pxAlign),r.stroke=le(r.stroke||null),r.fill=le(r.fill||null),r._stroke=r._fill=r._paths=r._focus=null;let p=dd(ut(1,r.width),1),h=r.points=qe({},{size:p,width:ut(1,p*.2),stroke:r.stroke,space:p*2,paths:Pd,_stroke:null,_fill:null},r.points);h.show=le(h.show),h.filter=le(h.filter),h.fill=le(h.fill),h.stroke=le(h.stroke),h.paths=le(h.paths),h.pxAlign=r.pxAlign}if(Se){let p=Gi(r,c);E.splice(c,0,p[0]),V.splice(c,0,p[1]),ae.values.push(null)}if(Ue){me.splice(c,0,null);let p=null;zs?c==0&&(p=Fr(r,c)):c>0&&(p=Fr(r,c)),At.splice(c,0,p),_s.splice(c,0,0),Ls.splice(c,0,0)}Je("addSeries",c)}function mp(r,c){c=c??M.length,r=i==1?$o(r,c,Il,Bl):$o(r,c,{},Dl),M.splice(c,0,r),Tr(M[c],c)}s.addSeries=mp;function gp(r){if(M.splice(r,1),Se){ae.values.splice(r,1),V.splice(r,1);let c=E.splice(r,1)[0];Es(null,c.firstChild),c.remove()}Ue&&(me.splice(r,1),At.splice(r,1)[0].remove(),_s.splice(r,1),Ls.splice(r,1)),Je("delSeries",r)}s.delSeries=gp;const ts=[!1,!1,!1,!1];function vp(r,c){if(r._show=r.show,r.show){let p=r.side%2,h=z[r.scale];h==null&&(r.scale=p?M[1].scale:R,h=z[r.scale]);let g=h.time;r.size=le(r.size),r.space=le(r.space),r.rotate=le(r.rotate),Rn(r.incrs)&&r.incrs.forEach(w=>{!Dn.has(w)&&Dn.set(w,Nc(w))}),r.incrs=le(r.incrs||(h.distr==2?Oh:g?L==1?Bh:Yh:os)),r.splits=le(r.splits||(g&&h.distr==1?st:h.distr==3?To:h.distr==4?rd:od)),r.stroke=le(r.stroke),r.grid.stroke=le(r.grid.stroke),r.ticks.stroke=le(r.ticks.stroke),r.border.stroke=le(r.border.stroke);let b=r.values;r.values=Rn(b)&&!Rn(b[0])?le(b):g?Rn(b)?Ll(oe,_l(b,j)):Cl(b)?Wh(oe,b):b||ye:b||ad,r.filter=le(r.filter||(h.distr>=3&&h.log==10?ud:h.distr==3&&h.log==2?pd:Fc)),r.font=Wl(r.font),r.labelFont=Wl(r.labelFont),r._size=r.size(s,null,c,0),r._space=r._rotate=r._incrs=r._found=r._splits=r._values=null,r._size>0&&(ts[c]=!0,r._el=Lt(Xp,f))}}function vi(r,c,p,h){let[g,b,w,k]=p,C=c%2,N=0;return C==0&&(k||b)&&(N=c==0&&!g||c==2&&!w?Ye(Nl.size/3):0),C==1&&(g||w)&&(N=c==1&&!b||c==3&&!k?Ye($l.size/2):0),N}const Nr=s.padding=(t.padding||[vi,vi,vi,vi]).map(r=>le(fe(r,vi))),zn=s._padding=Nr.map((r,c)=>r(s,c,ts,0));let et,Xe=null,Ge=null;const Ji=i==1?M[0].idxs:null;let Dt=null,xi=!1;function Ir(r,c){if(e=r??[],s.data=s._data=e,i==2){et=0;for(let p=1;p<M.length;p++)et+=e[p][0].length}else{e.length==0&&(s.data=s._data=e=[[]]),Dt=e[0],et=Dt.length;let p=e;if(te==2){p=e.slice();let h=p[0]=Array(et);for(let g=0;g<et;g++)h[g]=g}s._data=e=p}if(Ts(!0),Je("setData"),te==2&&(Ps=!0),c!==!1){let p=_;p.auto(s,xi)?ja():Ln(R,p.min,p.max),Qn=Qn||H.left>=0,Pt=!0,Ns()}}s.setData=Ir;function ja(){xi=!0;let r,c;i==1&&(et>0?(Xe=Ji[0]=0,Ge=Ji[1]=et-1,r=e[0][Xe],c=e[0][Ge],te==2?(r=Xe,c=Ge):r==c&&(te==3?[r,c]=Pa(r,r,_.log,!1):te==4?[r,c]=Qo(r,r,_.log,!1):_.time?c=r+Ye(86400/L):[r,c]=xa(r,c,er,!0))):(Xe=Ji[0]=r=null,Ge=Ji[1]=c=null)),Ln(R,r,c)}let Qi,Fs,Wa,Ua,Xa,Ga,Ka,Za,Ja,dt;function Rr(r,c,p,h,g,b){r??=cl,p??=nr,h??="butt",g??=cl,b??="round",r!=Qi&&(m.strokeStyle=Qi=r),g!=Fs&&(m.fillStyle=Fs=g),c!=Wa&&(m.lineWidth=Wa=c),b!=Xa&&(m.lineJoin=Xa=b),h!=Ga&&(m.lineCap=Ga=h),p!=Ua&&m.setLineDash(Ua=p)}function $r(r,c,p,h){c!=Fs&&(m.fillStyle=Fs=c),r!=Ka&&(m.font=Ka=r),p!=Za&&(m.textAlign=Za=p),h!=Ja&&(m.textBaseline=Ja=h)}function Qa(r,c,p,h,g=0){if(h.length>0&&r.auto(s,xi)&&(c==null||c.min==null)){let b=fe(Xe,0),w=fe(Ge,h.length-1),k=p.min==null?uh(h,b,w,g,r.distr==3):[p.min,p.max];r.min=Xt(r.min,p.min=k[0]),r.max=ut(r.max,p.max=k[1])}}const Or={min:null,max:null};function xp(){for(let h in z){let g=z[h];Y[h]==null&&(g.min==null||Y[R]!=null&&g.auto(s,xi))&&(Y[h]=Or)}for(let h in z){let g=z[h];Y[h]==null&&g.from!=null&&Y[g.from]!=null&&(Y[h]=Or)}Y[R]!=null&&Ts(!0);let r={};for(let h in Y){let g=Y[h];if(g!=null){let b=r[h]=ei(z[h],bh);if(g.min!=null)qe(b,g);else if(h!=R||i==2)if(et==0&&b.from==null){let w=b.range(s,null,null,h);b.min=w[0],b.max=w[1]}else b.min=Me,b.max=-Me}}if(et>0){M.forEach((h,g)=>{if(i==1){let b=h.scale,w=Y[b];if(w==null)return;let k=r[b];if(g==0){let C=k.range(s,k.min,k.max,b);k.min=C[0],k.max=C[1],Xe=Ut(k.min,e[0]),Ge=Ut(k.max,e[0]),Ge-Xe>1&&(e[0][Xe]<k.min&&Xe++,e[0][Ge]>k.max&&Ge--),h.min=Dt[Xe],h.max=Dt[Ge]}else h.show&&h.auto&&Qa(k,w,h,e[g],h.sorted);h.idxs[0]=Xe,h.idxs[1]=Ge}else if(g>0&&h.show&&h.auto){let[b,w]=h.facets,k=b.scale,C=w.scale,[N,I]=e[g],B=r[k],Q=r[C];B!=null&&Qa(B,Y[k],b,N,b.sorted),Q!=null&&Qa(Q,Y[C],w,I,w.sorted),h.min=w.min,h.max=w.max}});for(let h in r){let g=r[h],b=Y[h];if(g.from==null&&(b==null||b.min==null)){let w=g.range(s,g.min==Me?null:g.min,g.max==-Me?null:g.max,h);g.min=w[0],g.max=w[1]}}}for(let h in r){let g=r[h];if(g.from!=null){let b=r[g.from];if(b.min==null)g.min=g.max=null;else{let w=g.range(s,b.min,b.max,h);g.min=w[0],g.max=w[1]}}}let c={},p=!1;for(let h in r){let g=r[h],b=z[h];if(b.min!=g.min||b.max!=g.max){b.min=g.min,b.max=g.max;let w=b.distr;b._min=w==3?vn(b.min):w==4?go(b.min,b.asinh):w==100?b.fwd(b.min):b.min,b._max=w==3?vn(b.max):w==4?go(b.max,b.asinh):w==100?b.fwd(b.max):b.max,c[h]=p=!0}}if(p){M.forEach((h,g)=>{i==2?g>0&&c.y&&(h._paths=null):c[h.scale]&&(h._paths=null)});for(let h in c)Ps=!0,Je("setScale",h);Ue&&H.left>=0&&(Qn=Pt=!0)}for(let h in Y)Y[h]=null}function bp(r){let c=Fo(Xe-1,0,et-1),p=Fo(Ge+1,0,et-1);for(;r[c]==null&&c>0;)c--;for(;r[p]==null&&p<et-1;)p++;return[c,p]}function wp(){if(et>0){let r=M.some(c=>c._focus)&&dt!=nn.alpha;r&&(m.globalAlpha=dt=nn.alpha),M.forEach((c,p)=>{if(p>0&&c.show&&(Dr(p,!1),Dr(p,!0),c._paths==null)){let h=dt;dt!=c.alpha&&(m.globalAlpha=dt=c.alpha);let g=i==2?[0,e[p][0].length-1]:bp(e[p]);c._paths=c.paths(s,p,g[0],g[1]),dt!=h&&(m.globalAlpha=dt=h)}}),M.forEach((c,p)=>{if(p>0&&c.show){let h=dt;dt!=c.alpha&&(m.globalAlpha=dt=c.alpha),c._paths!=null&&Br(p,!1);{let g=c._paths!=null?c._paths.gaps:null,b=c.points.show(s,p,Xe,Ge,g),w=c.points.filter(s,p,b,g);(b||w)&&(c.points._paths=c.points.paths(s,p,Xe,Ge,w),Br(p,!0))}dt!=h&&(m.globalAlpha=dt=h),Je("drawSeries",p)}}),r&&(m.globalAlpha=dt=1)}}function Dr(r,c){let p=c?M[r].points:M[r];p._stroke=p.stroke(s,r),p._fill=p.fill(s,r)}function Br(r,c){let p=c?M[r].points:M[r],{stroke:h,fill:g,clip:b,flags:w,_stroke:k=p._stroke,_fill:C=p._fill,_width:N=p.width}=p._paths;N=Ee(N*ve,3);let I=null,B=N%2/2;c&&C==null&&(C=N>0?"#fff":k);let Q=p.pxAlign==1&&B>0;if(Q&&m.translate(B,B),!c){let ge=vt-N/2,de=Ct-N/2,re=ht+N,G=Ot+N;I=new Path2D,I.rect(ge,de,re,G)}c?eo(k,N,p.dash,p.cap,C,h,g,w,b):yp(r,k,N,p.dash,p.cap,C,h,g,w,I,b),Q&&m.translate(-B,-B)}function yp(r,c,p,h,g,b,w,k,C,N,I){let B=!1;C!=0&&K.forEach((Q,ge)=>{if(Q.series[0]==r){let de=M[Q.series[1]],re=e[Q.series[1]],G=(de._paths||Ri).band;Rn(G)&&(G=Q.dir==1?G[0]:G[1]);let W,Le=null;de.show&&G&&hh(re,Xe,Ge)?(Le=Q.fill(s,ge)||b,W=de._paths.clip):G=null,eo(c,p,h,g,Le,w,k,C,N,I,W,G),B=!0}}),B||eo(c,p,h,g,b,w,k,C,N,I)}const qr=ti|Io;function eo(r,c,p,h,g,b,w,k,C,N,I,B){Rr(r,c,p,h,g),(C||N||B)&&(m.save(),C&&m.clip(C),N&&m.clip(N)),B?(k&qr)==qr?(m.clip(B),I&&m.clip(I),ta(g,w),ea(r,b,c)):k&Io?(ta(g,w),m.clip(B),ea(r,b,c)):k&ti&&(m.save(),m.clip(B),I&&m.clip(I),ta(g,w),m.restore(),ea(r,b,c)):(ta(g,w),ea(r,b,c)),(C||N||B)&&m.restore()}function ea(r,c,p){p>0&&(c instanceof Map?c.forEach((h,g)=>{m.strokeStyle=Qi=g,m.stroke(h)}):c!=null&&r&&m.stroke(c))}function ta(r,c){c instanceof Map?c.forEach((p,h)=>{m.fillStyle=Fs=h,m.fill(p)}):c!=null&&r&&m.fill(c)}function Sp(r,c,p,h){let g=D[r],b;if(h<=0)b=[0,0];else{let w=g._space=g.space(s,r,c,p,h),k=g._incrs=g.incrs(s,r,c,p,h,w);b=Td(c,p,k,h,w)}return g._found=b}function to(r,c,p,h,g,b,w,k,C,N){let I=w%2/2;O==1&&m.translate(I,I),Rr(k,w,C,N,k),m.beginPath();let B,Q,ge,de,re=g+(h==0||h==3?-b:b);p==0?(Q=g,de=re):(B=g,ge=re);for(let G=0;G<r.length;G++)c[G]!=null&&(p==0?B=ge=r[G]:Q=de=r[G],m.moveTo(B,Q),m.lineTo(ge,de));m.stroke(),O==1&&m.translate(-I,-I)}function kp(r){let c=!0;return D.forEach((p,h)=>{if(!p.show)return;let g=z[p.scale];if(g.min==null){p._show&&(c=!1,p._show=!1,Ts(!1));return}else p._show||(c=!1,p._show=!0,Ts(!1));let b=p.side,w=b%2,{min:k,max:C}=g,[N,I]=Sp(h,k,C,w==0?se:$);if(I==0)return;let B=g.distr==2,Q=p._splits=p.splits(s,h,k,C,N,I,B),ge=g.distr==2?Q.map(W=>Dt[W]):Q,de=g.distr==2?Dt[Q[1]]-Dt[Q[0]]:N,re=p._values=p.values(s,p.filter(s,ge,h,I,de),h,I,de);p._rotate=b==2?p.rotate(s,re,h,I):0;let G=p._size;p._size=Tt(p.size(s,re,h,r)),G!=null&&p._size!=G&&(c=!1)}),c}function Mp(r){let c=!0;return Nr.forEach((p,h)=>{let g=p(s,h,ts,r);g!=zn[h]&&(c=!1),zn[h]=g}),c}function Ep(){for(let r=0;r<D.length;r++){let c=D[r];if(!c.show||!c._show)continue;let p=c.side,h=p%2,g,b,w=c.stroke(s,r),k=p==0||p==3?-1:1,[C,N]=c._found;if(c.label!=null){let lt=c.labelGap*k,wt=Ye((c._lpos+lt)*ve);$r(c.labelFont[0],w,"center",p==2?Mi:ll),m.save(),h==1?(g=b=0,m.translate(wt,Ye(Ct+Ot/2)),m.rotate((p==3?-ma:ma)/2)):(g=Ye(vt+ht/2),b=wt);let is=_c(c.label)?c.label(s,r,C,N):c.label;m.fillText(is,g,b),m.restore()}if(N==0)continue;let I=z[c.scale],B=h==0?ht:Ot,Q=h==0?vt:Ct,ge=c._splits,de=I.distr==2?ge.map(lt=>Dt[lt]):ge,re=I.distr==2?Dt[ge[1]]-Dt[ge[0]]:C,G=c.ticks,W=c.border,Le=G.show?G.size:0,$e=Ye(Le*ve),Qe=Ye((c.alignTo==2?c._size-Le-c.gap:c.gap)*ve),we=c._rotate*-ma/180,Oe=F(c._pos*ve),xt=($e+Qe)*k,rt=Oe+xt;b=h==0?rt:0,g=h==1?rt:0;let zt=c.font[0],Bt=c.align==1?Vs:c.align==2?ho:we>0?Vs:we<0?ho:h==0?"center":p==3?ho:Vs,on=we||h==1?"middle":p==2?Mi:ll;$r(zt,w,Bt,on);let bt=c.font[1]*c.lineGap,_t=ge.map(lt=>F(l(lt,I,B,Q))),qt=c._values;for(let lt=0;lt<qt.length;lt++){let wt=qt[lt];if(wt!=null){h==0?g=_t[lt]:b=_t[lt],wt=""+wt;let is=wt.indexOf(`
`)==-1?[wt]:wt.split(/\n/gm);for(let ct=0;ct<is.length;ct++){let ol=is[ct];we?(m.save(),m.translate(g,b+ct*bt),m.rotate(we),m.fillText(ol,0,0),m.restore()):m.fillText(ol,g,b+ct*bt)}}}G.show&&to(_t,G.filter(s,de,r,N,re),h,p,Oe,$e,Ee(G.width*ve,3),G.stroke(s,r),G.dash,G.cap);let rn=c.grid;rn.show&&to(_t,rn.filter(s,de,r,N,re),h,h==0?2:1,h==0?Ct:vt,h==0?Ot:ht,Ee(rn.width*ve,3),rn.stroke(s,r),rn.dash,rn.cap),W.show&&to([Oe],[1],h==0?1:0,h==0?1:2,h==1?Ct:vt,h==1?Ot:ht,Ee(W.width*ve,3),W.stroke(s,r),W.dash,W.cap)}Je("drawAxes")}function Ts(r){M.forEach((c,p)=>{p>0&&(c._paths=null,r&&(i==1?(c.min=null,c.max=null):c.facets.forEach(h=>{h.min=null,h.max=null})))})}let na=!1,no=!1,bi=[];function Cp(){no=!1;for(let r=0;r<bi.length;r++)Je(...bi[r]);bi.length=0}function Ns(){na||(Ch(Vr),na=!0)}function Pp(r,c=!1){na=!0,no=c,r(s),Vr(),c&&bi.length>0&&queueMicrotask(Cp)}s.batch=Pp;function Vr(){if(Ya&&(xp(),Ya=!1),Ps&&(pp(),Ps=!1),Ki){if(Fe(y,Vs,Pe),Fe(y,Mi,Ve),Fe(y,Ai,se),Fe(y,zi,$),Fe(P,Vs,Pe),Fe(P,Mi,Ve),Fe(P,Ai,se),Fe(P,zi,$),Fe(f,Ai,pn),Fe(f,zi,Kn),v.width=Ye(pn*ve),v.height=Ye(Kn*ve),D.forEach(({_el:r,_show:c,_size:p,_pos:h,side:g})=>{if(r!=null)if(c){let b=g===3||g===0?p:0,w=g%2==1;Fe(r,w?"left":"top",h-b),Fe(r,w?"width":"height",p),Fe(r,w?"top":"left",w?Ve:Pe),Fe(r,w?"height":"width",w?$:se),_o(r,rs)}else yt(r,rs)}),Qi=Fs=Wa=Xa=Ga=Ka=Za=Ja=Ua=null,dt=1,Si(!0),Pe!=Cs||Ve!=Zn||se!=tn||$!=Jn){Ts(!1);let r=se/tn,c=$/Jn;if(Ue&&!Qn&&H.left>=0){H.left*=r,H.top*=c,Is&&ln(Is,Ye(H.left),0,se,$),Rs&&ln(Rs,0,Ye(H.top),se,$);for(let p=0;p<At.length;p++){let h=At[p];h!=null&&(_s[p]*=r,Ls[p]*=c,ln(h,Tt(_s[p]),Tt(Ls[p]),se,$))}}if(_e.show&&!Zi&&_e.left>=0&&_e.width>0){_e.left*=r,_e.width*=r,_e.top*=c,_e.height*=c;for(let p in lo)Fe(Ds,p,_e[p])}Cs=Pe,Zn=Ve,tn=se,Jn=$}Je("setSize"),Ki=!1}pn>0&&Kn>0&&(m.clearRect(0,0,v.width,v.height),Je("drawClear"),X.forEach(r=>r()),Je("draw")),_e.show&&Zi&&(sa(_e),Zi=!1),Ue&&Qn&&(ss(null,!0,!1),Qn=!1),ae.show&&ae.live&&Pt&&(oo(),Pt=!1),u||(u=!0,s.status=1,Je("ready")),xi=!1,na=!1}s.redraw=(r,c)=>{Ps=c||!1,r!==!1?Ln(R,_.min,_.max):Ns()};function so(r,c){let p=z[r];if(p.from==null){if(et==0){let h=p.range(s,c.min,c.max,r);c.min=h[0],c.max=h[1]}if(c.min>c.max){let h=c.min;c.min=c.max,c.max=h}if(et>1&&c.min!=null&&c.max!=null&&c.max-c.min<1e-16)return;r==R&&p.distr==2&&et>0&&(c.min=Ut(c.min,e[0]),c.max=Ut(c.max,e[0]),c.min==c.max&&c.max++),Y[r]=c,Ya=!0,Ns()}}s.setScale=so;let io,ao,Is,Rs,Yr,Hr,$s,Os,jr,Wr,ze,Ie,_n=!1;const tt=H.drag;let Ke=tt.x,Ze=tt.y;Ue&&(H.x&&(io=Lt(Kp,P)),H.y&&(ao=Lt(Zp,P)),_.ori==0?(Is=io,Rs=ao):(Is=ao,Rs=io),ze=H.left,Ie=H.top);const _e=s.select=qe({show:!0,over:!0,left:0,width:0,top:0,height:0},t.select),Ds=_e.show?Lt(Gp,_e.over?P:y):null;function sa(r,c){if(_e.show){for(let p in r)_e[p]=r[p],p in lo&&Fe(Ds,p,r[p]);c!==!1&&Je("setSelect")}}s.setSelect=sa;function Ap(r){if(M[r].show)Se&&_o(E[r],rs);else if(Se&&yt(E[r],rs),Ue){let p=zs?At[0]:At[r];p!=null&&ln(p,-10,-10,se,$)}}function Ln(r,c,p){so(r,{min:c,max:p})}function sn(r,c,p,h){c.focus!=null&&Tp(r),c.show!=null&&M.forEach((g,b)=>{b>0&&(r==b||r==null)&&(g.show=c.show,Ap(b),i==2?(Ln(g.facets[0].scale,null,null),Ln(g.facets[1].scale,null,null)):Ln(g.scale,null,null),Ns())}),p!==!1&&Je("setSeries",r,c),h&&ki("setSeries",s,r,c)}s.setSeries=sn;function zp(r,c){qe(K[r],c)}function _p(r,c){r.fill=le(r.fill||null),r.dir=fe(r.dir,-1),c=c??K.length,K.splice(c,0,r)}function Lp(r){r==null?K.length=0:K.splice(r,1)}s.addBand=_p,s.setBand=zp,s.delBand=Lp;function Fp(r,c){M[r].alpha=c,Ue&&At[r]!=null&&(At[r].style.opacity=c),Se&&E[r]&&(E[r].style.opacity=c)}let hn,Fn,ns;const Bs={focus:!0};function Tp(r){if(r!=ns){let c=r==null,p=nn.alpha!=1;M.forEach((h,g)=>{if(i==1||g>0){let b=c||g==0||g==r;h._focus=c?null:b,p&&Fp(g,b?1:nn.alpha)}}),ns=r,p&&Ns()}}Se&&As&&ot(hl,he,r=>{H._lock||(es(r),ns!=null&&sn(null,Bs,!0,Be.setSeries))});function an(r,c,p){let h=z[c];p&&(r=r/ve-(h.ori==1?Ve:Pe));let g=se;h.ori==1&&(g=$,r=g-r),h.dir==-1&&(r=g-r);let b=h._min,w=h._max,k=r/g,C=b+(w-b)*k,N=h.distr;return N==3?Js(10,C):N==4?fh(C,h.asinh):N==100?h.bwd(C):C}function Np(r,c){let p=an(r,R,c);return Ut(p,e[0],Xe,Ge)}s.valToIdx=r=>Ut(r,e[0]),s.posToIdx=Np,s.posToVal=an,s.valToPos=(r,c,p)=>z[c].ori==0?a(r,z[c],p?ht:se,p?vt:0):o(r,z[c],p?Ot:$,p?Ct:0),s.setCursor=(r,c,p)=>{ze=r.left,Ie=r.top,ss(null,c,p)};function Ur(r,c){Fe(Ds,Vs,_e.left=r),Fe(Ds,Ai,_e.width=c)}function Xr(r,c){Fe(Ds,Mi,_e.top=r),Fe(Ds,zi,_e.height=c)}let wi=_.ori==0?Ur:Xr,yi=_.ori==1?Ur:Xr;function Ip(){if(Se&&ae.live)for(let r=i==2?1:0;r<M.length;r++){if(r==0&&ue)continue;let c=ae.values[r],p=0;for(let h in c)V[r][p++].firstChild.nodeValue=c[h]}}function oo(r,c){if(r!=null&&(r.idxs?r.idxs.forEach((p,h)=>{me[h]=p}):xh(r.idx)||me.fill(r.idx),ae.idx=me[0]),Se&&ae.live){for(let p=0;p<M.length;p++)(p>0||i==1&&!ue)&&Rp(p,me[p]);Ip()}Pt=!1,c!==!1&&Je("setLegend")}s.setLegend=oo;function Rp(r,c){let p=M[r],h=r==0&&te==2?Dt:e[r],g;ue?g=p.values(s,r,c)??Re:(g=p.value(s,c==null?null:h[c],r,c),g=g==null?Re:{_:g}),ae.values[r]=g}function ss(r,c,p){jr=ze,Wr=Ie,[ze,Ie]=H.move(s,ze,Ie),H.left=ze,H.top=Ie,Ue&&(Is&&ln(Is,Ye(ze),0,se,$),Rs&&ln(Rs,0,Ye(Ie),se,$));let h,g=Xe>Ge;hn=Me,Fn=null;let b=_.ori==0?se:$,w=_.ori==1?se:$;if(ze<0||et==0||g){h=H.idx=null;for(let k=0;k<M.length;k++){let C=At[k];C!=null&&ln(C,-10,-10,se,$)}As&&sn(null,Bs,!0,r==null&&Be.setSeries),ae.live&&(me.fill(h),Pt=!0)}else{let k,C,N;i==1&&(k=_.ori==0?ze:Ie,C=an(k,R),h=H.idx=Ut(C,e[0],Xe,Ge),N=q(e[0][h],_,b,0));let I=-10,B=-10,Q=0,ge=0,de=!0,re="",G="";for(let W=i==2?1:0;W<M.length;W++){let Le=M[W],$e=me[W],Qe=$e==null?null:i==1?e[W][$e]:e[W][1][$e],we=H.dataIdx(s,W,h,C),Oe=we==null?null:i==1?e[W][we]:e[W][1][we];if(Pt=Pt||Oe!=Qe||we!=$e,me[W]=we,W>0&&Le.show){let xt=we==null?-10:we==h?N:q(i==1?e[0][we]:e[W][0][we],_,b,0),rt=Oe==null?-10:Z(Oe,i==1?z[Le.scale]:z[Le.facets[1].scale],w,0);if(As&&Oe!=null){let zt=_.ori==1?ze:Ie,Bt=He(nn.dist(s,W,we,rt,zt));if(Bt<hn){let on=nn.bias;if(on!=0){let bt=an(zt,Le.scale),_t=Oe>=0?1:-1,qt=bt>=0?1:-1;qt==_t&&(qt==1?on==1?Oe>=bt:Oe<=bt:on==1?Oe<=bt:Oe>=bt)&&(hn=Bt,Fn=W)}else hn=Bt,Fn=W}}if(Pt||zs){let zt,Bt;_.ori==0?(zt=xt,Bt=rt):(zt=rt,Bt=xt);let on,bt,_t,qt,rn,lt,wt=!0,is=it.bbox;if(is!=null){wt=!1;let ct=is(s,W);_t=ct.left,qt=ct.top,on=ct.width,bt=ct.height}else _t=zt,qt=Bt,on=bt=it.size(s,W);if(lt=it.fill(s,W),rn=it.stroke(s,W),zs)W==Fn&&hn<=nn.prox&&(I=_t,B=qt,Q=on,ge=bt,de=wt,re=lt,G=rn);else{let ct=At[W];ct!=null&&(_s[W]=_t,Ls[W]=qt,bl(ct,on,bt,wt),vl(ct,lt,rn),ln(ct,Tt(_t),Tt(qt),se,$))}}}}if(zs){let W=nn.prox,Le=ns==null?hn<=W:hn>W||Fn!=ns;if(Pt||Le){let $e=At[0];$e!=null&&(_s[0]=I,Ls[0]=B,bl($e,Q,ge,de),vl($e,re,G),ln($e,Tt(I),Tt(B),se,$))}}}if(_e.show&&_n)if(r!=null){let[k,C]=Be.scales,[N,I]=Be.match,[B,Q]=r.cursor.sync.scales,ge=r.cursor.drag;if(Ke=ge._x,Ze=ge._y,Ke||Ze){let{left:de,top:re,width:G,height:W}=r.select,Le=r.scales[B].ori,$e=r.posToVal,Qe,we,Oe,xt,rt,zt=k!=null&&N(k,B),Bt=C!=null&&I(C,Q);zt&&Ke?(Le==0?(Qe=de,we=G):(Qe=re,we=W),Oe=z[k],xt=q($e(Qe,B),Oe,b,0),rt=q($e(Qe+we,B),Oe,b,0),wi(Xt(xt,rt),He(rt-xt))):wi(0,b),Bt&&Ze?(Le==1?(Qe=de,we=G):(Qe=re,we=W),Oe=z[C],xt=Z($e(Qe,Q),Oe,w,0),rt=Z($e(Qe+we,Q),Oe,w,0),yi(Xt(xt,rt),He(rt-xt))):yi(0,w)}else co()}else{let k=He(jr-Yr),C=He(Wr-Hr);if(_.ori==1){let Q=k;k=C,C=Q}Ke=tt.x&&k>=tt.dist,Ze=tt.y&&C>=tt.dist;let N=tt.uni;N!=null?Ke&&Ze&&(Ke=k>=N,Ze=C>=N,!Ke&&!Ze&&(C>k?Ze=!0:Ke=!0)):tt.x&&tt.y&&(Ke||Ze)&&(Ke=Ze=!0);let I,B;Ke&&(_.ori==0?(I=$s,B=ze):(I=Os,B=Ie),wi(Xt(I,B),He(B-I)),Ze||yi(0,w)),Ze&&(_.ori==1?(I=$s,B=ze):(I=Os,B=Ie),yi(Xt(I,B),He(B-I)),Ke||wi(0,b)),!Ke&&!Ze&&(wi(0,0),yi(0,0))}if(tt._x=Ke,tt._y=Ze,r==null){if(p){if(al!=null){let[k,C]=Be.scales;Be.values[0]=k!=null?an(_.ori==0?ze:Ie,k):null,Be.values[1]=C!=null?an(_.ori==1?ze:Ie,C):null}ki(fo,s,ze,Ie,se,$,h)}if(As){let k=p&&Be.setSeries,C=nn.prox;ns==null?hn<=C&&sn(Fn,Bs,!0,k):hn>C?sn(null,Bs,!0,k):Fn!=ns&&sn(Fn,Bs,!0,k)}}Pt&&(ae.idx=h,oo()),c!==!1&&Je("setCursor")}let Tn=null;Object.defineProperty(s,"rect",{get(){return Tn==null&&Si(!1),Tn}});function Si(r=!1){r?Tn=null:(Tn=P.getBoundingClientRect(),Je("syncRect",Tn))}function Gr(r,c,p,h,g,b,w){H._lock||_n&&r!=null&&r.movementX==0&&r.movementY==0||(ro(r,c,p,h,g,b,w,!1,r!=null),r!=null?ss(null,!0,!0):ss(c,!0,!1))}function ro(r,c,p,h,g,b,w,k,C){if(Tn==null&&Si(!1),es(r),r!=null)p=r.clientX-Tn.left,h=r.clientY-Tn.top;else{if(p<0||h<0){ze=-10,Ie=-10;return}let[N,I]=Be.scales,B=c.cursor.sync,[Q,ge]=B.values,[de,re]=B.scales,[G,W]=Be.match,Le=c.axes[0].side%2==1,$e=_.ori==0?se:$,Qe=_.ori==1?se:$,we=Le?b:g,Oe=Le?g:b,xt=Le?h:p,rt=Le?p:h;if(de!=null?p=G(N,de)?l(Q,z[N],$e,0):-10:p=$e*(xt/we),re!=null?h=W(I,re)?l(ge,z[I],Qe,0):-10:h=Qe*(rt/Oe),_.ori==1){let zt=p;p=h,h=zt}}C&&(c==null||c.cursor.event.type==fo)&&((p<=1||p>=se-1)&&(p=as(p,se)),(h<=1||h>=$-1)&&(h=as(h,$))),k?(Yr=p,Hr=h,[$s,Os]=H.move(s,p,h)):(ze=p,Ie=h)}const lo={width:0,height:0,left:0,top:0};function co(){sa(lo,!1)}let Kr,Zr,Jr,Qr;function el(r,c,p,h,g,b,w){_n=!0,Ke=Ze=tt._x=tt._y=!1,ro(r,c,p,h,g,b,w,!0,!1),r!=null&&(ot(mo,Ao,tl,!1),ki(ul,s,$s,Os,se,$,null));let{left:k,top:C,width:N,height:I}=_e;Kr=k,Zr=C,Jr=N,Qr=I}function tl(r,c,p,h,g,b,w){_n=tt._x=tt._y=!1,ro(r,c,p,h,g,b,w,!1,!0);let{left:k,top:C,width:N,height:I}=_e,B=N>0||I>0,Q=Kr!=k||Zr!=C||Jr!=N||Qr!=I;if(B&&Q&&sa(_e),tt.setScale&&B&&Q){let ge=k,de=N,re=C,G=I;if(_.ori==1&&(ge=C,de=I,re=k,G=N),Ke&&Ln(R,an(ge,R),an(ge+de,R)),Ze)for(let W in z){let Le=z[W];W!=R&&Le.from==null&&Le.min!=Me&&Ln(W,an(re+G,W),an(re,W))}co()}else H.lock&&(H._lock=!H._lock,ss(c,!0,r!=null));r!=null&&(Es(mo,Ao),ki(mo,s,ze,Ie,se,$,null))}function $p(r,c,p,h,g,b,w){if(H._lock)return;es(r);let k=_n;if(_n){let C=!0,N=!0,I=10,B,Q;_.ori==0?(B=Ke,Q=Ze):(B=Ze,Q=Ke),B&&Q&&(C=ze<=I||ze>=se-I,N=Ie<=I||Ie>=$-I),B&&C&&(ze=ze<$s?0:se),Q&&N&&(Ie=Ie<Os?0:$),ss(null,!0,!0),_n=!1}ze=-10,Ie=-10,me.fill(null),ss(null,!0,!0),k&&(_n=k)}function nl(r,c,p,h,g,b,w){H._lock||(es(r),ja(),co(),r!=null&&ki(dl,s,ze,Ie,se,$,null))}function sl(){D.forEach(Nd),Ha(s.width,s.height,!0)}us(va,Xs,sl);const qs={};qs.mousedown=el,qs.mousemove=Gr,qs.mouseup=tl,qs.dblclick=nl,qs.setSeries=(r,c,p,h)=>{let g=Be.match[2];p=g(s,c,p),p!=-1&&sn(p,h,!0,!1)},Ue&&(ot(ul,P,el),ot(fo,P,Gr),ot(pl,P,r=>{es(r),Si(!1)}),ot(hl,P,$p),ot(dl,P,nl),Ro.add(s),s.syncRect=Si);const ia=s.hooks=t.hooks||{};function Je(r,c,p){no?bi.push([r,c,p]):r in ia&&ia[r].forEach(h=>{h.call(null,s,c,p)})}(t.plugins||[]).forEach(r=>{for(let c in r.hooks)ia[c]=(ia[c]||[]).concat(r.hooks[c])});const il=(r,c,p)=>p,Be=qe({key:null,setSeries:!1,filters:{pub:Ml,sub:Ml},scales:[R,M[1]?M[1].scale:null],match:[El,El,il],values:[null,null]},H.sync);Be.match.length==2&&Be.match.push(il),H.sync=Be;const al=Be.key,uo=eu(al);function ki(r,c,p,h,g,b,w){Be.filters.pub(r,c,p,h,g,b,w)&&uo.pub(r,c,p,h,g,b,w)}uo.sub(s);function Op(r,c,p,h,g,b,w){Be.filters.sub(r,c,p,h,g,b,w)&&qs[r](null,c,p,h,g,b,w)}s.pub=Op;function Dp(){uo.unsub(s),Ro.delete(s),Gn.clear(),Lo(va,Xs,sl),d.remove(),he?.remove(),Je("destroy")}s.destroy=Dp;function po(){Je("init",t,e),Ir(e||t.data,!1),Y[R]?so(R,Y[R]):ja(),Zi=_e.show&&(_e.width>0||_e.height>0),Qn=Pt=!0,Ha(t.width,t.height)}return M.forEach(Tr),D.forEach(vp),n?n instanceof HTMLElement?(n.appendChild(d),po()):n(s,po):po(),s}Te.assign=qe;Te.fmtNum=tr;Te.rangeNum=xa;Te.rangeLog=Pa;Te.rangeAsinh=Qo;Te.orient=Ss;Te.pxRatio=ve;Te.join=Eh;Te.fmtDate=sr,Te.tzDate=Rh;Te.sync=eu;{Te.addGap=xd,Te.clipGaps=_a;let t=Te.paths={points:ou};t.linear=lu,t.stepped=yd,t.bars=Sd,t.spline=Md}const je={axis:"#93a7b3",grid:"#1c2a33",green:"#4fd17f",red:"#ef6461",orange:"#ff9f43",blue:"#62a8ff",yellow:"#f2c94c"};function mt(t={}){return{stroke:je.axis,grid:{stroke:je.grid,width:1},...t}}var Nt="INUMBER",hi="IOP1",di="IOP2",fi="IOP3",Sn="IVAR",fs="IVARNAME",ni="IFUNCALL",Na="IFUNDEF",gt="IEXPR",ur="IEXPREVAL",ks="IMEMBER",Ia="IENDSTATEMENT",si="IARRAY";function pe(t,e){this.type=t,this.value=e??0}pe.prototype.toString=function(){switch(this.type){case Nt:case hi:case di:case fi:case Sn:case fs:case Ia:return this.value;case ni:return"CALL "+this.value;case Na:return"DEF "+this.value;case si:return"ARRAY "+this.value;case ks:return"."+this.value;default:return"Invalid Instruction"}};function Ra(t){return new pe(hi,t)}function An(t){return new pe(di,t)}function hu(t){return new pe(fi,t)}function Oo(t,e,n,s,i){for(var a=[],o=[],l,u,d,v,m=0;m<t.length;m++){var f=t[m],y=f.type;if(y===Nt||y===fs)Array.isArray(f.value)?a.push.apply(a,Oo(f.value.map(function(P){return new pe(Nt,P)}).concat(new pe(si,f.value.length)),e,n,s,i)):a.push(f);else if(y===Sn&&Object.hasOwn(i,f.value))f=new pe(Nt,i[f.value]),a.push(f);else if(y===di&&a.length>1)u=a.pop(),l=a.pop(),v=n[f.value],f=new pe(Nt,v(l.value,u.value)),a.push(f);else if(y===fi&&a.length>2)d=a.pop(),u=a.pop(),l=a.pop(),f.value==="?"?a.push(l.value?u.value:d.value):(v=s[f.value],f=new pe(Nt,v(l.value,u.value,d.value)),a.push(f));else if(y===hi&&a.length>0)l=a.pop(),v=e[f.value],f=new pe(Nt,v(l.value)),a.push(f);else if(y===gt){for(;a.length>0;)o.push(a.shift());o.push(new pe(gt,Oo(f.value,e,n,s,i)))}else if(y===ks&&a.length>0)l=a.pop(),a.push(new pe(Nt,l.value[f.value]));else{for(;a.length>0;)o.push(a.shift());o.push(f)}}for(;a.length>0;)o.push(a.shift());return o}function du(t,e,n){for(var s=[],i=0;i<t.length;i++){var a=t[i],o=a.type;if(o===Sn&&a.value===e)for(var l=0;l<n.tokens.length;l++){var u=n.tokens[l],d;u.type===hi?d=Ra(u.value):u.type===di?d=An(u.value):u.type===fi?d=hu(u.value):d=new pe(u.type,u.value),s.push(d)}else o===gt?s.push(new pe(gt,du(a.value,e,n))):s.push(a)}return s}function Ul(t,e,n){for(var s in e.functions)if(e.functions[s]===t)return!0;if(t.__expr_eval_safe_def)return!0;for(var i in n)if(typeof n[i]=="object"&&n[i]!==null){for(var a in n[i])if(n[i][a]===t)return!0}return!1}function ls(t,e,n){var s=[],i,a,o,l,u,d;if(pr(t))return dn(t,n);for(var v=t.length,m=0;m<v;m++){var f=t[m],y=f.type;if(y===Nt||y===fs)s.push(f.value);else if(y===di)a=s.pop(),i=s.pop(),f.value==="and"?s.push(i?!!ls(a,e,n):!1):f.value==="or"?s.push(i?!0:!!ls(a,e,n)):f.value==="="?(l=e.binaryOps[f.value],s.push(l(i,ls(a,e,n),n))):(l=e.binaryOps[f.value],s.push(l(dn(i,n),dn(a,n))));else if(y===fi)o=s.pop(),a=s.pop(),i=s.pop(),f.value==="?"?s.push(ls(i?a:o,e,n)):(l=e.ternaryOps[f.value],s.push(l(dn(i,n),dn(a,n),dn(o,n))));else if(y===Sn){if(/^__proto__|prototype|constructor$/.test(f.value))throw new Error("prototype access detected");if(f.value in e.functions)s.push(e.functions[f.value]);else if(f.value in e.unaryOps&&e.parser.isOperatorEnabled(f.value))s.push(e.unaryOps[f.value]);else{var P=n[f.value];if(P!==void 0){if(typeof P=="function"&&!Ul(P,e,n))throw new Error("Variable references an unallowed function: "+f.value);s.push(P)}else throw new Error("undefined variable: "+f.value)}}else if(y===hi)i=s.pop(),l=e.unaryOps[f.value],s.push(l(dn(i,n)));else if(y===ni){for(d=f.value,u=[];d-- >0;)u.unshift(dn(s.pop(),n));if(l=s.pop(),!Ul(l,e,n))throw new Error("Is not an allowed function.");if(l.apply&&l.call)s.push(l.apply(void 0,u));else throw new Error(l+" is not a function")}else if(y===Na)s.push((function(){for(var O=s.pop(),F=[],L=f.value;L-- >0;)F.unshift(s.pop());var M=s.pop(),D=function(){for(var z=Object.assign({},n),K=0,R=F.length;K<R;K++)z[F[K]]=arguments[K];return ls(O,e,z)};return Object.defineProperty(D,"name",{value:M,writable:!1}),Object.defineProperty(D,"__expr_eval_safe_def",{value:!0,writable:!1}),n[M]=D,D})());else if(y===gt)s.push(Id(f,e));else if(y===ur)s.push(f);else if(y===ks)i=s.pop(),s.push(i[f.value]);else if(y===Ia)s.pop();else if(y===si){for(d=f.value,u=[];d-- >0;)u.unshift(s.pop());s.push(u)}else throw new Error("invalid Expression")}if(s.length>1)throw new Error("invalid Expression (parity)");return s[0]===0?0:dn(s[0],n)}function Id(t,e,n){return pr(t)?t:{type:ur,value:function(s){return ls(t.value,e,s)}}}function pr(t){return t&&t.type===ur}function dn(t,e){return pr(t)?t.value(e):t}function hr(t,e){for(var n=[],s,i,a,o,l,u,d=0;d<t.length;d++){var v=t[d],m=v.type;if(m===Nt)typeof v.value=="number"&&v.value<0?n.push("("+v.value+")"):Array.isArray(v.value)?n.push("["+v.value.map(Xl).join(", ")+"]"):n.push(Xl(v.value));else if(m===di)i=n.pop(),s=n.pop(),o=v.value,e?o==="^"?n.push("Math.pow("+s+", "+i+")"):o==="and"?n.push("(!!"+s+" && !!"+i+")"):o==="or"?n.push("(!!"+s+" || !!"+i+")"):o==="||"?n.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }(("+s+"),("+i+")))"):o==="=="?n.push("("+s+" === "+i+")"):o==="!="?n.push("("+s+" !== "+i+")"):o==="["?n.push(s+"[("+i+") | 0]"):n.push("("+s+" "+o+" "+i+")"):o==="["?n.push(s+"["+i+"]"):n.push("("+s+" "+o+" "+i+")");else if(m===fi)if(a=n.pop(),i=n.pop(),s=n.pop(),o=v.value,o==="?")n.push("("+s+" ? "+i+" : "+a+")");else throw new Error("invalid Expression");else if(m===Sn||m===fs)n.push(v.value);else if(m===hi)s=n.pop(),o=v.value,o==="-"||o==="+"?n.push("("+o+s+")"):e?o==="not"?n.push("(!"+s+")"):o==="!"?n.push("fac("+s+")"):n.push(o+"("+s+")"):o==="!"?n.push("("+s+"!)"):n.push("("+o+" "+s+")");else if(m===ni){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());o=n.pop(),n.push(o+"("+l.join(", ")+")")}else if(m===Na){for(i=n.pop(),u=v.value,l=[];u-- >0;)l.unshift(n.pop());s=n.pop(),e?n.push("("+s+" = function("+l.join(", ")+") { return "+i+" })"):n.push("("+s+"("+l.join(", ")+") = "+i+")")}else if(m===ks)s=n.pop(),n.push(s+"."+v.value);else if(m===si){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());n.push("["+l.join(", ")+"]")}else if(m===gt)n.push("("+hr(v.value,e)+")");else if(m!==Ia)throw new Error("invalid Expression")}return n.length>1&&(e?n=[n.join(",")]:n=[n.join(";")]),String(n[0])}function Xl(t){return typeof t=="string"?JSON.stringify(t).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"):t}function Ws(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}function dr(t,e,n){n=n||{};for(var s=!!n.withMembers,i=null,a=0;a<t.length;a++){var o=t[a];o.type===Sn||o.type===fs?!s&&!Ws(e,o.value)?e.push(o.value):(i!==null&&(Ws(e,i)||e.push(i)),i=o.value):o.type===ks&&s&&i!==null?i+="."+o.value:o.type===gt?dr(o.value,e,n):i!==null&&(Ws(e,i)||e.push(i),i=null)}i!==null&&!Ws(e,i)&&e.push(i)}function Kt(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}Kt.prototype.simplify=function(t){return t=t||{},new Kt(Oo(this.tokens,this.unaryOps,this.binaryOps,this.ternaryOps,t),this.parser)};Kt.prototype.substitute=function(t,e){return e instanceof Kt||(e=this.parser.parse(String(e))),new Kt(du(this.tokens,t,e),this.parser)};Kt.prototype.evaluate=function(t){return t=t||{},ls(this.tokens,this,t)};Kt.prototype.toString=function(){return hr(this.tokens,!1)};Kt.prototype.symbols=function(t){t=t||{};var e=[];return dr(this.tokens,e,t),e};Kt.prototype.variables=function(t){t=t||{};var e=[];dr(this.tokens,e,t);var n=this.functions;return e.filter(function(s){return!(s in n)})};Kt.prototype.toJSFunction=function(t,e){var n=this,s=new Function(t,"with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return "+hr(this.simplify(e).tokens,!0)+"; }");return function(){return s.apply(n,arguments)}};var Bi="TEOF",Ae="TOP",$a="TNUMBER",fu="TSTRING",kn="TPAREN",ii="TBRACKET",Oa="TCOMMA",fr="TNAME",mr="TSEMICOLON";function mu(t,e,n){this.type=t,this.value=e,this.index=n}mu.prototype.toString=function(){return this.type+": "+this.value};function De(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}De.prototype.newToken=function(t,e,n){return new mu(t,e,n??this.pos)};De.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current};De.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent};De.prototype.next=function(){if(this.pos>=this.expression.length)return this.newToken(Bi,"EOF");if(this.isWhitespace()||this.isComment())return this.next();if(this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName())return this.current;this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')};De.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if(n==="'"||n==='"')for(var s=this.expression.indexOf(n,e+1);s>=0&&this.pos<this.expression.length;){if(this.pos=s+1,this.expression.charAt(s-1)!=="\\"){var i=this.expression.substring(e+1,s);this.current=this.newToken(fu,this.unescape(i),e),t=!0;break}s=this.expression.indexOf(n,s+1)}return t};De.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return t==="("||t===")"?(this.current=this.newToken(kn,t),this.pos++,!0):!1};De.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return(t==="["||t==="]")&&this.isOperatorEnabled("[")?(this.current=this.newToken(ii,t),this.pos++,!0):!1};De.prototype.isComma=function(){var t=this.expression.charAt(this.pos);return t===","?(this.current=this.newToken(Oa,","),this.pos++,!0):!1};De.prototype.isSemicolon=function(){var t=this.expression.charAt(this.pos);return t===";"?(this.current=this.newToken(mr,";"),this.pos++,!0):!1};De.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&n!=="."&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(s in this.consts)return this.current=this.newToken($a,this.consts[s]),this.pos+=s.length,!0}return!1};De.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(this.isOperatorEnabled(s)&&(s in this.binaryOps||s in this.unaryOps||s in this.ternaryOps))return this.current=this.newToken(Ae,s),this.pos+=s.length,!0}return!1};De.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var s=this.expression.charAt(e);if(s.toUpperCase()===s.toLowerCase()){if(e===this.pos&&(s==="$"||s==="_")){s==="_"&&(n=!0);continue}else if(e===this.pos||!n||s!=="_"&&(s<"0"||s>"9"))break}else n=!0}if(n){var i=this.expression.substring(t,e);return this.current=this.newToken(fr,i),this.pos+=i.length,!0}return!1};De.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);(e===" "||e==="	"||e===`
`||e==="\r")&&(t=!0,this.pos++,!(this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var Rd=/^[0-9a-f]{4}$/i;De.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var s=t.charAt(++e);switch(s){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+=`
`;break;case"r":n+="\r";break;case"t":n+="	";break;case"u":var i=t.substring(e+1,e+5);Rd.test(i)||this.parseError("Illegal escape sequence: \\u"+i),n+=String.fromCharCode(parseInt(i,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+s+'"')}++e;var a=t.indexOf("\\",e);n+=t.substring(e,a<0?t.length:a),e=a}return n};De.prototype.isComment=function(){var t=this.expression.charAt(this.pos);return t==="/"&&this.expression.charAt(this.pos+1)==="*"?(this.pos=this.expression.indexOf("*/",this.pos)+2,this.pos===1&&(this.pos=this.expression.length),!0):!1};De.prototype.isRadixInteger=function(){var t=this.pos;if(t>=this.expression.length-2||this.expression.charAt(t)!=="0")return!1;++t;var e,n;if(this.expression.charAt(t)==="x")e=16,n=/^[0-9a-f]$/i,++t;else if(this.expression.charAt(t)==="b")e=2,n=/^[01]$/i,++t;else return!1;for(var s=!1,i=t;t<this.expression.length;){var a=this.expression.charAt(t);if(n.test(a))t++,s=!0;else break}return s&&(this.current=this.newToken($a,parseInt(this.expression.substring(i,t),e)),this.pos=t),s};De.prototype.isNumber=function(){for(var t=!1,e=this.pos,n=e,s=e,i=!1,a=!1,o;e<this.expression.length&&(o=this.expression.charAt(e),o>="0"&&o<="9"||!i&&o===".");)o==="."?i=!0:a=!0,e++,t=a;if(t&&(s=e),o==="e"||o==="E"){e++;for(var l=!0,u=!1;e<this.expression.length;){if(o=this.expression.charAt(e),l&&(o==="+"||o==="-"))l=!1;else if(o>="0"&&o<="9")u=!0,l=!1;else break;e++}u||(e=s)}return t?(this.current=this.newToken($a,parseFloat(this.expression.substring(n,e))),this.pos=e):this.pos=s,t};De.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if(e==="+"||e==="-"||e==="*"||e==="/"||e==="%"||e==="^"||e==="?"||e===":"||e===".")this.current=this.newToken(Ae,e);else if(e==="∙"||e==="•")this.current=this.newToken(Ae,"*");else if(e===">")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,">="),this.pos++):this.current=this.newToken(Ae,">");else if(e==="<")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,"<="),this.pos++):this.current=this.newToken(Ae,"<");else if(e==="|")if(this.expression.charAt(this.pos+1)==="|")this.current=this.newToken(Ae,"||"),this.pos++;else return!1;else if(e==="=")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,"=="),this.pos++):this.current=this.newToken(Ae,e);else if(e==="!")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Ae,"!="),this.pos++):this.current=this.newToken(Ae,e);else return!1;return this.pos++,this.isOperatorEnabled(this.current.value)?!0:(this.pos=t,!1)};De.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)};De.prototype.getCoordinates=function(){var t=0,e,n=-1;do t++,e=this.pos-n,n=this.expression.indexOf(`
`,n+1);while(n>=0&&n<this.pos);return{line:t,column:e}};De.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};function Ne(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=n.allowMemberAccess!==!1}Ne.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()};Ne.prototype.tokenMatches=function(t,e){return typeof e>"u"?!0:Array.isArray(e)?Ws(e,t.value):typeof e=="function"?e(t):t.value===e};Ne.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()};Ne.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken};Ne.prototype.accept=function(t,e){return this.nextToken.type===t&&this.tokenMatches(this.nextToken,e)?(this.next(),!0):!1};Ne.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}};Ne.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.accept(fr)||this.accept(Ae,n))t.push(new pe(Sn,this.current.value));else if(this.accept($a))t.push(new pe(Nt,this.current.value));else if(this.accept(fu))t.push(new pe(Nt,this.current.value));else if(this.accept(kn,"("))this.parseExpression(t),this.expect(kn,")");else if(this.accept(ii,"["))if(this.accept(ii,"]"))t.push(new pe(si,0));else{var s=this.parseArrayList(t);t.push(new pe(si,s))}else throw new Error("unexpected "+this.nextToken)};Ne.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),!this.parseUntilEndStatement(t,e)&&this.pushExpression(t,e))};Ne.prototype.pushExpression=function(t,e){for(var n=0,s=e.length;n<s;n++)t.push(e[n])};Ne.prototype.parseUntilEndStatement=function(t,e){return this.accept(mr)?(this.nextToken&&this.nextToken.type!==Bi&&!(this.nextToken.type===kn&&this.nextToken.value===")")&&e.push(new pe(Ia)),this.nextToken.type!==Bi&&this.parseExpression(e),t.push(new pe(gt,e)),!0):!1};Ne.prototype.parseArrayList=function(t){for(var e=0;!this.accept(ii,"]");)for(this.parseExpression(t),++e;this.accept(Oa);)this.parseExpression(t),++e;return e};Ne.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(Ae,"=");){var e=t.pop(),n=[],s=t.length-1;if(e.type===ni){if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var i=0,a=e.value+1;i<a;i++){var o=s-i;t[o].type===Sn&&(t[o]=new pe(fs,t[o].value))}this.parseVariableAssignmentExpression(n),t.push(new pe(gt,n)),t.push(new pe(Na,e.value));continue}if(e.type!==Sn&&e.type!==ks)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new pe(fs,e.value)),t.push(new pe(gt,n)),t.push(An("="))}};Ne.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(Ae,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(Ae,":"),this.parseConditionalExpression(n),t.push(new pe(gt,e)),t.push(new pe(gt,n)),t.push(hu("?"))}};Ne.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(Ae,"or");){var e=[];this.parseAndExpression(e),t.push(new pe(gt,e)),t.push(An("or"))}};Ne.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(Ae,"and");){var e=[];this.parseComparison(e),t.push(new pe(gt,e)),t.push(An("and"))}};var $d=["==","!=","<","<=",">=",">","in"];Ne.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(Ae,$d);){var e=this.current;this.parseAddSub(t),t.push(An(e.value))}};var Od=["+","-","||"];Ne.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(Ae,Od);){var e=this.current;this.parseTerm(t),t.push(An(e.value))}};var Dd=["*","/","%"];Ne.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(Ae,Dd);){var e=this.current;this.parseFactor(t),t.push(An(e.value))}};Ne.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.save(),this.accept(Ae,n)){if(this.current.value!=="-"&&this.current.value!=="+"){if(this.nextToken.type===kn&&this.nextToken.value==="("){this.restore(),this.parseExponential(t);return}else if(this.nextToken.type===mr||this.nextToken.type===Oa||this.nextToken.type===Bi||this.nextToken.type===kn&&this.nextToken.value===")"){this.restore(),this.parseAtom(t);return}}var s=this.current;this.parseFactor(t),t.push(Ra(s.value))}else this.parseExponential(t)};Ne.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(Ae,"^");)this.parseFactor(t),t.push(An("^"))};Ne.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(Ae,"!");)t.push(Ra("!"))};Ne.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;function n(a){return a.value in e}if(this.accept(Ae,n)){var s=this.current;this.parseAtom(t),t.push(Ra(s.value))}else for(this.parseMemberExpression(t);this.accept(kn,"(");)if(this.accept(kn,")"))t.push(new pe(ni,0));else{var i=this.parseArgumentList(t);t.push(new pe(ni,i))}};Ne.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(kn,")");)for(this.parseExpression(t),++e;this.accept(Oa);)this.parseExpression(t),++e;return e};Ne.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(Ae,".")||this.accept(ii,"[");){var e=this.current;if(e.value==="."){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect(fr),t.push(new pe(ks,this.current.value))}else if(e.value==="["){if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect(ii,"]"),t.push(An("["))}else throw new Error("unexpected symbol: "+e.value)}};function Bd(t,e){return Number(t)+Number(e)}function qd(t,e){return t-e}function Vd(t,e){return t*e}function Yd(t,e){return t/e}function Hd(t,e){return t%e}function jd(t,e){return Array.isArray(t)&&Array.isArray(e)?t.concat(e):""+t+e}function Wd(t,e){return t===e}function Ud(t,e){return t!==e}function Xd(t,e){return t>e}function Gd(t,e){return t<e}function Kd(t,e){return t>=e}function Zd(t,e){return t<=e}function Jd(t,e){return!!(t&&e)}function Qd(t,e){return!!(t||e)}function ef(t,e){return Ws(e,t)}function tf(t){return(Math.exp(t)-Math.exp(-t))/2}function nf(t){return(Math.exp(t)+Math.exp(-t))/2}function sf(t){return t===1/0?1:t===-1/0?-1:(Math.exp(t)-Math.exp(-t))/(Math.exp(t)+Math.exp(-t))}function af(t){return t===-1/0?t:Math.log(t+Math.sqrt(t*t+1))}function of(t){return Math.log(t+Math.sqrt(t*t-1))}function rf(t){return Math.log((1+t)/(1-t))/2}function Gl(t){return Math.log(t)*Math.LOG10E}function lf(t){return-t}function cf(t){return!t}function uf(t){return t<0?Math.ceil(t):Math.floor(t)}function pf(t){return Math.random()*(t||1)}function Kl(t){return gr(t+1)}function hf(t){return isFinite(t)&&t===Math.round(t)}var df=4.7421875,wo=[.9999999999999971,57.15623566586292,-59.59796035547549,14.136097974741746,-.4919138160976202,3399464998481189e-20,4652362892704858e-20,-9837447530487956e-20,.0001580887032249125,-.00021026444172410488,.00021743961811521265,-.0001643181065367639,8441822398385275e-20,-26190838401581408e-21,36899182659531625e-22];function gr(t){var e,n;if(hf(t)){if(t<=0)return isFinite(t)?1/0:NaN;if(t>171)return 1/0;for(var s=t-2,i=t-1;s>1;)i*=s,s--;return i===0&&(i=1),i}if(t<.5)return Math.PI/(Math.sin(Math.PI*t)*gr(1-t));if(t>=171.35)return 1/0;if(t>85){var a=t*t,o=a*t,l=o*t,u=l*t;return Math.sqrt(2*Math.PI/t)*Math.pow(t/Math.E,t)*(1+1/(12*t)+1/(288*a)-139/(51840*o)-571/(2488320*l)+163879/(209018880*u)+5246819/(75246796800*u*t))}--t,n=wo[0];for(var d=1;d<wo.length;++d)n+=wo[d]/(t+d);return e=t+df+.5,Math.sqrt(2*Math.PI)*Math.pow(e,t+.5)*Math.exp(-e)*n}function ff(t){return Array.isArray(t)?t.length:String(t).length}function Zl(){for(var t=0,e=0,n=0;n<arguments.length;n++){var s=Math.abs(arguments[n]),i;e<s?(i=e/s,t=t*i*i+1,e=s):s>0?(i=s/e,t+=i*i):t+=s}return e===1/0?1/0:e*Math.sqrt(t)}function Jl(t,e,n){return t?e:n}function mf(t,e){return typeof e>"u"||+e==0?Math.round(t):(t=+t,e=-+e,isNaN(t)||!(typeof e=="number"&&e%1===0)?NaN:(t=t.toString().split("e"),t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e))),t=t.toString().split("e"),+(t[0]+"e"+(t[1]?+t[1]+e:e))))}function gf(t,e,n){return n&&(n[t]=e),e}function vf(t,e){return t[e|0]}function xf(t){return arguments.length===1&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function bf(t){return arguments.length===1&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function wf(t,e){if(typeof t!="function")throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map(function(n,s){return t(n,s)})}function yf(t,e,n){if(typeof t!="function")throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce(function(s,i,a){return t(s,i,a)},e)}function Sf(t,e){if(typeof t!="function")throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter(function(n,s){return t(n,s)})}function kf(t,e){if(!(Array.isArray(e)||typeof e=="string"))throw new Error("Second argument to indexOf is not a string or array");return e.indexOf(t)}function Mf(t,e){if(!Array.isArray(e))throw new Error("Second argument to join is not an array");return e.join(t)}function Ef(t){return(t>0)-(t<0)||+t}var Ql=1/3;function Cf(t){return t<0?-Math.pow(-t,Ql):Math.pow(t,Ql)}function Pf(t){return Math.exp(t)-1}function Af(t){return Math.log(1+t)}function zf(t){return Math.log(t)/Math.LN2}function _f(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce(function(e,n){return e+Number(n)},0)}function Ms(t){this.options=t||{},this.unaryOps={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh||tf,cosh:Math.cosh||nf,tanh:Math.tanh||sf,asinh:Math.asinh||af,acosh:Math.acosh||of,atanh:Math.atanh||rf,sqrt:Math.sqrt,cbrt:Math.cbrt||Cf,log:Math.log,log2:Math.log2||zf,ln:Math.log,lg:Math.log10||Gl,log10:Math.log10||Gl,expm1:Math.expm1||Pf,log1p:Math.log1p||Af,abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,trunc:Math.trunc||uf,"-":lf,"+":Number,exp:Math.exp,not:cf,length:ff,"!":Kl,sign:Math.sign||Ef},this.binaryOps={"+":Bd,"-":qd,"*":Vd,"/":Yd,"%":Hd,"^":Math.pow,"||":jd,"==":Wd,"!=":Ud,">":Xd,"<":Gd,">=":Kd,"<=":Zd,and:Jd,or:Qd,in:ef,"=":gf,"[":vf},this.ternaryOps={"?":Jl},this.functions={random:pf,fac:Kl,min:bf,max:xf,hypot:Math.hypot||Zl,pyt:Math.hypot||Zl,pow:Math.pow,atan2:Math.atan2,if:Jl,gamma:gr,roundTo:mf,map:wf,fold:yf,filter:Sf,indexOf:kf,join:Mf,sum:_f},this.consts={E:Math.E,PI:Math.PI,true:!0,false:!1}}Ms.prototype.parse=function(t){var e=[],n=new Ne(this,new De(this,t),{allowMemberAccess:this.options.allowMemberAccess});return n.parseExpression(e),n.expect(Bi,"EOF"),new Kt(e,this)};Ms.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var gu=new Ms;Ms.parse=function(t){return gu.parse(t)};Ms.evaluate=function(t,e){return gu.parse(t).evaluate(e)};var ec={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",and:"logical",or:"logical",not:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};function Lf(t){return Object.hasOwn(ec,t)?ec[t]:t}Ms.prototype.isOperatorEnabled=function(t){var e=Lf(t),n=this.options.operators||{};return!(e in n)||!!n[e]};const Un=new Ms({allowMemberAccess:!1,operators:{assignment:!1,comparison:!0,fndef:!1,in:!1,logical:!0}}),Ff=[[/\bnp\.arctan2\b/g,"atan2"],[/\bnp\.arcsin\b/g,"asin"],[/\bnp\.arccos\b/g,"acos"],[/\bnp\.arctan\b/g,"atan"],[/\bnp\.(?:absolute|fabs)\b/g,"abs"],[/\bnp\.power\b/g,"pow"],[/\bnp\.maximum\b/g,"max"],[/\bnp\.minimum\b/g,"min"],[/\bnp\.square\b/g,"square"],[/\bnp\.clip\b/g,"clip"],[/\bnp\.where\b/g,"where"],[/\bnp\.heaviside\b/g,"heaviside"],[/\bnp\.deg2rad\b/g,"deg2rad"],[/\bnp\.rad2deg\b/g,"rad2deg"],[/\bnp\.pi\b/g,"PI"],[/\bnp\.e\b/g,"E"]];for(const t of["random","fac","gamma","map","fold","filter","indexOf","join","sum"])delete Un.functions[t];Un.functions.square=t=>t*t;Un.functions.clip=(t,e,n)=>Math.min(Math.max(t,e),n);Un.functions.where=(t,e,n)=>t?e:n;Un.functions.heaviside=(t,e=.5)=>t<0?0:t>0?1:e;Un.functions.deg2rad=t=>t*Math.PI/180;Un.functions.rad2deg=t=>t*180/Math.PI;const Tf=new Set(["ch1","ch2","times"]),vu={mean:t=>bu(t),sum:t=>xu(t),min:t=>la(t,Math.min),max:t=>la(t,Math.max),ptp:t=>la(t,Math.max)-la(t,Math.min),var:t=>tc(t),std:t=>Math.sqrt(tc(t)),median:t=>If(t)},Nf=new RegExp(`\\bnp\\.(${Object.keys(vu).join("|")})\\(\\s*(ch1|ch2|times)\\s*\\)`,"g");function xu(t){let e=0;for(let n=0;n<t.length;n+=1)e+=t[n];return e}function bu(t){return t.length===0?Number.NaN:xu(t)/t.length}function la(t,e){if(t.length===0)return Number.NaN;let n=t[0];for(let s=1;s<t.length;s+=1)n=e(n,t[s]);return n}function tc(t){const e=bu(t);if(!Number.isFinite(e))return Number.NaN;let n=0;for(let s=0;s<t.length;s+=1)n+=(t[s]-e)**2;return n/t.length}function If(t){if(t.length===0)return Number.NaN;const e=Array.from(t).sort((s,i)=>s-i),n=Math.floor(e.length/2);return e.length%2===0?(e[n-1]+e[n])/2:e[n]}function Rf(t){let e=t.trim().replaceAll("**","^");for(const[n,s]of Ff)e=e.replace(n,s);return e.replace(/\bnp\./g,"")}function $f(t,e){return t.replace(Nf,(n,s,i)=>{const a=vu[s](e[i]);return Number.isFinite(a)?String(a):"(0 / 0)"})}function Of(t,e,n,s){const i=Rf($f(t,{ch1:e,ch2:n,times:s}));if(!i)throw new Error("formula is empty");const a=Un.parse(i),o=a.variables().filter(d=>!Tf.has(d));if(o.length>0)throw new Error(`unknown variable ${o[0]}`);const l=a.toJSFunction(["ch1","ch2","times"]),u=new Float32Array(Math.min(e.length,n.length,s.length));for(let d=0;d<u.length;d+=1){const v=Number(l(e[d],n[d],s[d]));u[d]=Number.isFinite(v)?v:Number.NaN}return u}function Df(t,e=250,n=5e3){const s=Math.max(0,Math.floor(t)),i=Math.max(1,Math.floor(e)),a=Math.max(i,Math.floor(n));return Math.min(a,i*2**Math.min(s,20))}class Da{constructor(e,n=250,s=5e3,i=(o,l)=>window.setTimeout(o,l),a=o=>window.clearTimeout(o)){this.reconnect=e,this.baseDelay=n,this.maxDelay=s,this.scheduleTimer=i,this.cancelTimer=a}reconnect;baseDelay;maxDelay;scheduleTimer;cancelTimer;attempt=0;timer=null;schedule(){if(this.timer!==null)return null;const e=Df(this.attempt,this.baseDelay,this.maxDelay);return this.attempt+=1,this.timer=this.scheduleTimer(()=>{this.timer=null,this.reconnect()},e),e}connected(){this.cancel()}cancel(e=!0){this.timer!==null&&(this.cancelTimer(this.timer),this.timer=null),e&&(this.attempt=0)}}const Bf="PWS1",nc=24;function qf(t){if(t.byteLength<nc)throw new Error("Scope frame too short");const e=new DataView(t),n=String.fromCharCode(...new Uint8Array(t.slice(0,4)));if(n!==Bf)throw new Error(`Bad frame magic: ${n}`);const s=e.getUint16(4,!0);if(s!==1)throw new Error(`Unsupported scope frame version: ${s}`);const i=e.getUint16(6,!0),a=e.getUint32(8,!0),o=new Float32Array(t,nc);if(o.length!==a*i)throw new Error("Scope frame payload length does not match metadata");return{channelCount:i,sampleCount:a,sequence:e.getUint32(20,!0),samples:o}}function Vf(t,e){const n=new Float64Array(t.sampleCount),s=new Float32Array(t.sampleCount),i=new Float32Array(t.sampleCount),a=e?.rollingMode?-e.duration:e&&e.triggerSource!=="immediately"?e.triggerDelay-e.duration/2:0,o=e?e.duration:Math.max(0,t.sampleCount-1),l=t.sampleCount>0?o/t.sampleCount:0;for(let u=0;u<t.sampleCount;u+=1)n[u]=e?a+u*l:u,s[u]=t.samples[u*t.channelCount]??0,i[u]=t.channelCount>1?t.samples[u*t.channelCount+1]??0:0;return{x:n,ch1:s,ch2:i}}function Yf(t,e,n,s){const i=Math.min(n+1,Math.max(1,Math.floor(s)));if(i<=1||!e||e.ch1.length!==t.ch1.length||e.ch2.length!==t.ch2.length)return{data:t,currentAverage:1};const a=new Float32Array(t.ch1.length),o=new Float32Array(t.ch2.length),l=i-1;for(let u=0;u<t.ch1.length;u+=1)a[u]=(e.ch1[u]*l+t.ch1[u])/i,o[u]=(e.ch2[u]*l+t.ch2[u])/i;return{data:{x:t.x,ch1:a,ch2:o},currentAverage:i}}function Hf(t,e,n,s=4){const i=Math.max(1,n),a=Math.min(i,Math.max(s,e-t));let o=t,l=t+a;return o<0&&(l-=o,o=0),l>i&&(o-=l-i,l=i),{min:Math.max(0,o),max:Math.min(i,Math.max(a,l))}}const jf=2**14,ca=-1.1,Ci=1.1;class Wf{constructor(e,n,s=()=>{},i=jf){this.plotHost=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new Da(()=>this.openSocket()),this.plot=new Te(this.options(),this.emptyData(),this.plotHost),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotHost),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}plotHost;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;plot;latestFrame=null;receivedFrameCount=0;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;pendingFrame=null;averagedData=null;displayedData=null;currentAverage=0;traceAverage=1;timeSettings=null;channelVisible=[!0,!0];xyMode=!1;mathActive=!1;mathFormula="ch1 * ch2";resizeObserver;resizeListener=()=>this.scheduleResize();connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/scope?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Scope stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Scope stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.setStatus("Scope stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Scope stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.handleFrame(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}reconnect(){if(!this.wantsConnection)return;this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close(),this.resetTraceAveraging(),this.openSocket()}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}setSampleCount(e){this.sampleCount=Math.max(1,Math.floor(e)),this.resetAveraging()}getSampleCount(){return this.sampleCount}setTraceAverage(e){this.traceAverage=Math.max(1,Math.floor(e)),this.resetAveraging()}resetTraceAveraging(){this.pendingFrame=null,this.resetAveraging()}getTraceAverage(){return this.traceAverage}setTimeSettings(e){if(this.timeSettings=e,this.resetAveraging(),this.latestFrame&&this.displayedData){const n=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(n)),this.resetYScale()}),this.plot.redraw(!0,!0)}}setChannelVisible(e,n){this.channelVisible[e-1]=n,this.applySeriesVisibility()}getChannelVisible(e){return this.channelVisible[e-1]}setDisplaySettings(e){const n=this.xyMode!==e.xyMode;if(this.xyMode=e.xyMode,this.mathActive=e.mathActive,this.mathFormula=e.mathFormula,this.applySeriesVisibility(),this.latestFrame&&this.displayedData){const s=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),n&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(s)),this.resetYScale()}),this.plot.redraw(!0,!0)}}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),this.resizeObserver.disconnect(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.plot.destroy()}showFrame(e){this.handleFrame(e)}resetZoom(){if(!this.latestFrame)return;const e=this.latestFrame;this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(e)),this.resetYScale()})}zoom(e){const n=this.plot.scales.x,s=Number(n.min??0),i=Number(n.max??this.currentMaxX()),a=(s+i)/2,o=Math.max(this.minimumXSpan(),(i-s)*e);this.setXScale(a-o/2,a+o/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-6,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??ca),max:Number(e.max??Ci)}}getFormattedTimeLabelsForCurrentRange(e=6){const{min:n,max:s}=this.getXRange(),i=Math.max(2,Math.floor(e)),a=(s-n)/(i-1),o=Array.from({length:i},(l,u)=>n+a*u);return this.formatTimeTicks(this.plot,o)}getFrameSequence(){return this.receivedFrameCount>0?this.receivedFrameCount:null}exportCsv(){if(!this.displayedData)return`time,ch1,ch2
`;const e=["time,ch1,ch2"];for(let n=0;n<this.displayedData.x.length;n+=1)e.push(`${this.displayedData.x[n]},${this.displayedData.ch1[n]},${this.displayedData.ch2[n]}`);return`${e.join(`
`)}
`}getDisplayedStats(){return this.displayedData?{...ic(this.displayedData.ch1,"ch1"),...ic(this.displayedData.ch2,"ch2")}:null}getDisplayedDataFingerprint(){if(!this.displayedData)return null;let e=2166136261;const n=Math.max(1,Math.floor(this.displayedData.x.length/512));for(let s=0;s<this.displayedData.x.length;s+=n)e=yo(e,this.displayedData.x[s]),e=yo(e,this.displayedData.ch1[s]),e=yo(e,this.displayedData.ch2[s]);return e>>>0}getMathStats(){return this.xyMode||!this.mathActive?null:Uf(this.plot.data,3,1)}getXyStats(){if(!this.xyMode)return null;const e=Do(this.plot.data,1,0),n=Do(this.plot.data,1,1);if(!e||!n||e.length===0||e.length!==n.length)return null;let s=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,a=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY,l=0;for(let u=0;u<e.length;u+=1)s=Math.min(s,e[u]),i=Math.max(i,e[u]),a=Math.min(a,n[u]),o=Math.max(o,n[u]),l=Math.max(l,Math.abs(e[u]-n[u]));return{xMin:s,xMax:i,yMin:a,yMax:o,maxDelta:l}}getCurveData(){return this.displayedData?{x:Array.from(this.displayedData.x),channels:[Array.from(this.displayedData.ch1),Array.from(this.displayedData.ch2)]}:null}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}options(){return{mode:2,width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1,min:0,max:this.sampleCount-1},y:{auto:!1,min:ca,max:Ci}},axes:[mt({label:"Time / CH1",values:(e,n)=>this.formatTimeTicks(e,n)}),mt({label:"Amplitude / CH2"})],series:[{},{label:"CH1 / XY",stroke:je.green,width:1.5,points:{show:!1}},{label:"CH2",stroke:je.red,width:1.5,points:{show:!1}},{label:"Math",stroke:je.blue,width:1.5,points:{show:!1}}]}}emptyData(){return[[],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)]]}handleFrame(e){let n;try{n=qf(e)}catch(s){this.setStatus(s instanceof Error?s.message:"Invalid scope frame");return}this.receivedFrameCount+=1,this.pendingFrame=n,this.scheduleRender(),this.setStatus(`Frame ${n.sequence}, ${n.sampleCount} samples, ${n.channelCount} channels`)}frameData(e){const n=Vf(e,this.timeSettings??void 0);if(this.timeSettings?.rollingMode)return this.averagedData=null,this.displayedData=n,this.currentAverage=0,this.setCurrentAverage(0),this.plotData(n);const s=Yf(n,this.averagedData,this.currentAverage,this.traceAverage);return this.averagedData=s.data,this.displayedData=s.data,this.currentAverage=s.currentAverage,this.setCurrentAverage(this.currentAverage),this.plotData(s.data)}plotData(e){if(this.xyMode){const s=new Float32Array(0);return[[],[e.ch1,e.ch2],[s,s],[s,s]]}let n=new Float32Array(e.x.length).fill(Number.NaN);if(this.mathActive)try{n=Of(this.mathFormula,e.ch1,e.ch2,e.x)}catch(s){this.setStatus(`Math formula error: ${s instanceof Error?s.message:String(s)}`)}return[[],[e.x,e.ch1],[e.x,e.ch2],[e.x,n]]}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=this.latestFrame===null,s=this.latestFrame!==null&&this.latestFrame.sampleCount!==e.sampleCount;s&&this.resetAveraging(),this.latestFrame=e,this.plot.setData(this.frameData(e),!1),(n||s)&&this.resetZoom(),this.plot.redraw(!0,!0)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resize()}))}resize(){const e=Math.floor(this.plotHost.clientWidth),n=Math.floor(this.plotHost.clientHeight);e<1||n<1||e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(this.timeSettings&&!this.xyMode){const s=this.defaultXMin(),i=s+this.timeSettings.duration,a=Math.max(Number.EPSILON,this.timeSettings.duration/1024),o=Math.min(i-s,Math.max(a,n-e));let l=e,u=e+o;l<s&&(u+=s-l,l=s),u>i&&(l-=u-i,u=i),this.plot.setScale("x",{min:Math.max(s,l),max:Math.min(i,u)});return}this.plot.setScale("x",Hf(e,n,this.currentMaxX()))}setYScale(e,n){const s=Math.max(1e-6,n-e);this.plot.setScale("y",{min:e,max:e+s})}resetYScale(){this.plot.setScale("y",{min:ca,max:Ci})}minimumXSpan(){return this.timeSettings&&!this.xyMode?Math.max(Number.EPSILON,this.timeSettings.duration/1024):4}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-6,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){if(this.xyMode)return Ci;if(this.timeSettings){const e=this.defaultXMin();return Math.max(e+Number.EPSILON,e+this.timeSettings.duration)}return Math.max(1,(this.latestFrame?.sampleCount??this.sampleCount)-1)}defaultXScale(e){if(this.xyMode)return{min:ca,max:Ci};if(this.timeSettings){const n=this.defaultXMin();return{min:n,max:n+this.timeSettings.duration}}return{min:0,max:Math.max(1,e.sampleCount-1)}}defaultXMin(){return this.timeSettings?this.timeSettings.rollingMode?-this.timeSettings.duration:this.timeSettings.triggerSource==="immediately"?0:this.timeSettings.triggerDelay-this.timeSettings.duration/2:0}resetAveraging(){this.averagedData=null,this.currentAverage=0,this.setCurrentAverage(0)}formatTimeTicks(e,n){if(this.xyMode)return n.map(d=>sc(d,3));const s=Number(e.scales.x.min??n[0]??0),i=Number(e.scales.x.max??n[n.length-1]??s),a=Math.max(Number.EPSILON,Math.abs(i-s)),o=Xf(Math.max(Number.EPSILON,this.timeSettings?.duration??a)),l=n.length>1?Math.abs(n[1]-n[0])*o.scale:a*o.scale,u=Math.max(0,Math.min(9,Math.ceil(-Math.log10(Math.max(l,Number.EPSILON)))+1));return n.map(d=>`${sc(d*o.scale,u)} ${o.suffix}`)}applySeriesVisibility(){this.plot.setSeries(1,{show:this.xyMode||this.channelVisible[0]}),this.plot.setSeries(2,{show:!this.xyMode&&this.channelVisible[1]}),this.plot.setSeries(3,{show:!this.xyMode&&this.mathActive})}}function Do(t,e,n){return t[e]?.[n]??null}function Uf(t,e,n){const s=Do(t,e,n);if(!s||s.length===0)return null;let i=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY;for(let o=0;o<s.length;o+=1){const l=s[o];Number.isFinite(l)&&(i=Math.min(i,l),a=Math.max(a,l))}return i===Number.POSITIVE_INFINITY?null:{min:i,max:a}}function Xf(t){return t<1e-6?{scale:1e9,suffix:"ns"}:t<.001?{scale:1e6,suffix:"us"}:t<1?{scale:1e3,suffix:"ms"}:{scale:1,suffix:"s"}}function sc(t,e){return Number.isFinite(t)?t.toFixed(e).replace(/\.?0+$/,""):"0"}function ic(t,e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const i of t)n=Math.min(n,i),s=Math.max(s,i);return{[`${e}Min`]:n===Number.POSITIVE_INFINITY?0:n,[`${e}Max`]:s===Number.NEGATIVE_INFINITY?0:s}}function yo(t,e){const n=Math.round(Number.isFinite(e)?e*1e6:0);return t^=n&255,t=Math.imul(t,16777619),t^=n>>8&255,t=Math.imul(t,16777619),t^=n>>16&255,t=Math.imul(t,16777619),t^=n>>24&255,t=Math.imul(t,16777619),t}const ac=[new Float64Array(0),new Float32Array(0)];class Gf{constructor(e,n,s=()=>{},i=16384){this.host=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new Da(()=>this.openSocket()),this.plot=new Te(this.options("",this.labels),ac,this.host),this.fftWorker.onmessage=a=>this.handleWorkerResponse(a.data),this.fftWorker.onerror=()=>this.setStatus("Spectrum FFT worker error"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}host;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;retiredSockets=new WeakSet;plot;latestFrame=null;latestCurveFrame=null;pendingFrame=null;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;labels=["Spectrum"];unit="";averagedFrame=null;currentAverage=0;fftWorker=new Worker(new URL("/assets/spectrum-worker-S9qnYzAn.js",import.meta.url),{type:"module"});workerRequestId=0;workerGeneration=0;settings={baseband:!0,span:976562.5,center:0,window:"blackman",displayUnit:"dB(Vpk^2)",displayInput1Baseband:!0,displayInput2Baseband:!0,displayCrossAmplitude:!0,traceAverage:1,runningState:"stopped",iqBandwidth:[]};resizeObserver;resizeListener=()=>this.scheduleResize();setSettings(e){const n={...this.settings,baseband:!!(e.baseband??this.settings.baseband),span:Number(e.span??this.settings.span),center:Number(e.center??this.settings.center),window:String(e.window??this.settings.window),displayUnit:String(e.display_unit??this.settings.displayUnit),displayInput1Baseband:!!(e.display_input1_baseband??this.settings.displayInput1Baseband),displayInput2Baseband:!!(e.display_input2_baseband??this.settings.displayInput2Baseband),displayCrossAmplitude:!!(e.display_cross_amplitude??this.settings.displayCrossAmplitude),traceAverage:Math.max(1,Math.floor(Number(e.trace_average??this.settings.traceAverage))),runningState:String(e.running_state??this.settings.runningState),iqBandwidth:Array.isArray(e.iq_bandwidth)?e.iq_bandwidth.map(Number).filter(Number.isFinite):this.settings.iqBandwidth},s=n.displayUnit!==this.settings.displayUnit,i=n.displayInput1Baseband!==this.settings.displayInput1Baseband||n.displayInput2Baseband!==this.settings.displayInput2Baseband||n.displayCrossAmplitude!==this.settings.displayCrossAmplitude;!(this.settings.runningState==="running_single"&&n.runningState==="stopped")&&rc(n)!==rc(this.settings)&&this.resetAveraging(),this.settings=n,(s||i)&&this.averagedFrame&&(this.pendingFrame=oc(this.averagedFrame,this.settings),this.scheduleRender())}resetAveraging(){this.workerGeneration+=1,this.averagedFrame=null,this.pendingFrame=null,this.currentAverage=0,this.setCurrentAverage(0)}getAverageCount(){return this.currentAverage}connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/spectrumanalyzer?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Spectrum stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Spectrum stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.retiredSockets.has(s)||this.setStatus("Spectrum stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Spectrum stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.showScopeBuffer(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e&&(this.retiredSockets.add(e),e.close())}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}showScopeBuffer(e){this.workerRequestId+=1,this.fftWorker.postMessage({id:this.workerRequestId,generation:this.workerGeneration,buffer:e,settings:{...this.settings,iqBandwidth:[...this.settings.iqBandwidth]}},[e])}handleWorkerResponse(e){if(e.generation!==this.workerGeneration)return;if(e.error||!e.frame){this.setStatus(e.error??"Invalid spectrum frame");return}const n=e.frame,s=this.averageFrame(n);this.setCurrentAverage(this.currentAverage),this.latestCurveFrame=s,this.pendingFrame=oc(s,this.settings),this.scheduleRender(),this.setStatus(`Spectrum frame ${n.sequence}, ${n.x.length} bins, RBW ${Qf(n.rbw)} Hz`)}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),this.resizeObserver.disconnect(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.workerGeneration+=1,this.fftWorker.terminate(),this.plot.destroy()}getSeriesCount(){return this.latestFrame?.series.length??0}getBinCount(){return this.latestFrame?.x.length??0}exportCsv(){if(!this.latestFrame)return`frequency
`;const n=[`frequency,${this.latestFrame.series.map(s=>s.label).join(",")}`];for(let s=0;s<this.latestFrame.x.length;s+=1)n.push([this.latestFrame.x[s],...this.latestFrame.series.map(i=>i.values[s]??"")].join(","));return`${n.join(`
`)}
`}getCurveData(){if(!this.latestCurveFrame)return null;const e=wu(this.latestCurveFrame.series,this.settings);return{x:Array.from(this.latestCurveFrame.x),series:e.map(n=>({label:n.label,values:Array.from(n.values),...n.imaginary?{imaginary:Array.from(n.imaginary)}:{}})),unit:"Vpk^2"}}getCurveParameters(){return{baseband:this.settings.baseband,span:this.settings.span,center:this.settings.center,window:this.settings.window,display_unit:this.settings.displayUnit,trace_average:this.settings.traceAverage,display_input1_baseband:this.settings.displayInput1Baseband,display_input2_baseband:this.settings.displayInput2Baseband,display_cross_amplitude:this.settings.displayCrossAmplitude}}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}resetZoom(){this.latestFrame&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(this.latestFrame)),this.plot.setScale("y",this.defaultYScale(this.latestFrame))})}zoom(e){const{min:n,max:s}=this.getXRange(),i=(n+s)/2,a=Math.max(this.minimumXSpan(),(s-n)*e);this.setXScale(i-a/2,i+a/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-12,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??-120),max:Number(e.max??20)}}options(e,n){return{width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1},y:{auto:!1}},axes:[mt({label:"Frequency (Hz)"}),mt({label:e})],series:[{},...n.map((s,i)=>({label:s,stroke:i===0?je.green:i===1?je.blue:je.yellow,width:1.4,points:{show:!1}}))]}}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=e.series.map(o=>o.label),s=n.join("\0")!==this.labels.join("\0"),i=e.unit!==this.unit,a=this.latestFrame===null;this.latestFrame=e,s||i?(this.labels=n.length?n:["Spectrum"],this.unit=e.unit,this.plot.destroy(),this.plot=new Te(this.options(e.unit,this.labels),this.frameData(e),this.host),this.bindInteractions(),this.scheduleResize()):this.plot.setData(this.frameData(e),!1),(a||s||i)&&this.resetZoom(),this.plot.redraw(!0,!0)}frameData(e){return e.x.length&&e.series.length?[e.x,...e.series.map(n=>n.values)]:ac}averageFrame(e){const n=Math.max(1,this.settings.traceAverage),s=this.averagedFrame&&this.averagedFrame.x.length===e.x.length&&this.averagedFrame.series.length===e.series.length&&this.averagedFrame.series.every((l,u)=>l.values.length===e.series[u].values.length&&!!l.imaginary==!!e.series[u].imaginary&&(!l.imaginary||l.imaginary.length===e.series[u].imaginary.length));if(n<=1||!s)return this.averagedFrame=Zf(e),this.currentAverage=1,e;const i=Math.min(this.currentAverage+1,n),a=i-1,o=e.series.map((l,u)=>{const d=this.averagedFrame.series[u].values,v=new Float64Array(l.values.length);for(let f=0;f<v.length;f+=1)v[f]=(d[f]*a+l.values[f])/i;let m;if(l.imaginary){const f=this.averagedFrame.series[u].imaginary;m=new Float64Array(l.imaginary.length);for(let y=0;y<m.length;y+=1)m[y]=(f[y]*a+l.imaginary[y])/i}return{label:l.label,values:v,...m?{imaginary:m}:{}}});return this.averagedFrame={...e,x:e.x,series:o},this.currentAverage=i,this.averagedFrame}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=window.requestAnimationFrame(()=>{this.resizeFrame=null;const e=Math.floor(this.host.clientWidth),n=Math.floor(this.host.clientHeight);e<1||n<1||e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(!this.latestFrame)return;const s=this.defaultXScale(this.latestFrame),i=this.minimumXSpan(),a=Math.min(s.max-s.min,Math.max(i,n-e));let o=e,l=e+a;o<s.min&&(l+=s.min-o,o=s.min),l>s.max&&(o-=l-s.max,l=s.max),this.plot.setScale("x",{min:Math.max(s.min,o),max:Math.min(s.max,l)})}setYScale(e,n){const s=Math.max(1e-12,n-e);this.plot.setScale("y",{min:e,max:e+s})}minimumXSpan(){return!this.latestFrame||this.latestFrame.x.length<2?Number.EPSILON:Math.max(Number.EPSILON,Math.abs(this.latestFrame.x[this.latestFrame.x.length-1]-this.latestFrame.x[0])/1024)}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-12,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){return this.latestFrame&&this.latestFrame.x.length?this.latestFrame.x[this.latestFrame.x.length-1]:1}defaultXScale(e){return e.x.length?{min:e.x[0],max:e.x[e.x.length-1]}:{min:0,max:1}}defaultYScale(e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const a of e.series)for(const o of a.values)Number.isFinite(o)&&(n=Math.min(n,o),s=Math.max(s,o));if(n===Number.POSITIVE_INFINITY||s===Number.NEGATIVE_INFINITY)return{min:-120,max:20};const i=Math.max(1e-9,(s-n)*.08);return{min:n-i,max:s+i}}}function Kf(t,e,n){const s=new Float64Array(t.length);for(let i=0;i<t.length;i+=1){const a=Math.max(t[i],Number.EPSILON);e==="dB(Vpk^2)"?s[i]=10*Math.log10(a):e==="Vpk"?s[i]=Math.sqrt(a):e==="Vrms^2"?s[i]=a/2:e==="dB(Vrms^2)"?s[i]=10*Math.log10(a/2+Number.EPSILON):e==="Vrms"?s[i]=Math.sqrt(a)/Math.SQRT2:e==="Vrms^2/Hz"?s[i]=a/2/Math.max(n,Number.EPSILON):e==="dB(Vrms^2/Hz)"?s[i]=10*Math.log10(a/2/Math.max(n,Number.EPSILON)+Number.EPSILON):e==="Vrms/sqrt(Hz)"?s[i]=Math.sqrt(a)/Math.SQRT2/Math.max(n,Number.EPSILON):s[i]=a}return s}function Zf(t){return{...t,x:t.x,series:t.series.map(e=>({label:e.label,values:new Float64Array(e.values),...e.imaginary?{imaginary:new Float64Array(e.imaginary)}:{}}))}}function oc(t,e){const n=wu(t.series,e);return{...t,unit:e.displayUnit,series:n.map(s=>({label:s.label,values:Kf(s.imaginary?Jf(s.values,s.imaginary):s.values,e.displayUnit,t.rbw)}))}}function rc(t){return[t.baseband,t.span,t.center,t.window,t.iqBandwidth.join(",")].join("|")}function wu(t,e){return e.baseband?t.filter(n=>n.label==="Input 1"?e.displayInput1Baseband:n.label==="Input 2"?e.displayInput2Baseband:n.label==="Cross"?e.displayCrossAmplitude:!0):t}function Jf(t,e){const n=new Float64Array(t.length);for(let s=0;s<n.length;s+=1)n[s]=Math.hypot(t[s],e[s]);return n}function Qf(t){return Number.isFinite(t)?Math.abs(t)>=1e3?t.toExponential(3):t.toFixed(3):"0"}const lc=[new Float64Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0)],em=[{name:"complex_poles",label:"Complex Poles",kind:"pole",complex:!0},{name:"complex_zeros",label:"Complex Zeros",kind:"zero",complex:!0},{name:"real_poles",label:"Real Poles",kind:"pole",complex:!1},{name:"real_zeros",label:"Real Zeros",kind:"zero",complex:!1}];class tm{constructor(e,n,s){this.host=e,this.setAttribute=n,this.setStatus=s,this.host.innerHTML=`
      <div class="iir-plot-toolbar">
        <button id="iir-zoom-reset" type="button">Reset</button>
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
      <div class="iir-list-grid"></div>
    `;const i=this.host.querySelector('[data-iir-plot="magnitude"]'),a=this.host.querySelector('[data-iir-plot="phase"]');if(!i||!a)throw new Error("Missing IIR plot hosts");this.magnitudeHost=i,this.phaseHost=a,this.magnitudePlot=new Te(this.options("Magnitude (dB)","dB"),lc,i),this.phasePlot=new Te(this.options("Phase (deg)","deg"),lc,a),this.installPlotEvents(this.magnitudePlot),this.installPlotEvents(this.phasePlot),this.host.querySelector("#iir-zoom-reset")?.addEventListener("click",()=>this.resetZoom()),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),this.scheduleResize()}host;setAttribute;setStatus;magnitudePlot;phasePlot;magnitudeHost;phaseHost;latest=null;selectedKey=null;resizeFrame=null;resizeObserver=null;clickTimer=null;markerDrag=null;panState=null;zoomState=null;userView=!1;suppressNextClick=!1;windowMouseMove=e=>{const n=this.panState?.plot??this.zoomState?.plot;n&&this.handlePointerMove(n,e)};windowMouseUp=()=>{const e=this.panState?.plot??this.zoomState?.plot;e&&this.endMouseInteraction(e)};async refresh(){const e=await fetch("/api/modules/iir/plot");if(!e.ok)throw new Error(`IIR plot unavailable: ${e.status}`);this.latest=await e.json();const n=Float64Array.from(this.latest.x,y=>Math.log10(Math.max(y,Number.MIN_VALUE))),s=Float32Array.from(this.latest.magnitude),i=Float32Array.from(this.latest.phase),a=Ys(this.latest.data_magnitude),o=Ys(this.latest.data_phase),l=Ys(this.latest.product_magnitude),u=Ys(this.latest.product_phase),d=Ys(this.latest.measurement_magnitude),v=Ys(this.latest.measurement_phase),m=!this.userView||this.magnitudePlot.data[0].length===0;this.magnitudePlot.setData([n,s,a,l,d],!1),this.phasePlot.setData([n,i,o,u,v],!1),m?this.applyDefaultScales():this.linkXScale(this.getXRange()),this.renderMarkers(),this.renderListEditors();const f=this.latest.data_curve_name?` | ${this.latest.data_curve_name}`:"";this.plotStatus().textContent=`${this.latest.tf_type} | ${this.latest.markers.length} pole/zero marker(s)${f}`}destroy(){this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.removeWindowMouseCapture(),this.resizeObserver?.disconnect(),this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.resizeFrame!==null&&cancelAnimationFrame(this.resizeFrame)}options(e,n){return{width:360,height:220,title:e,cursor:{drag:{x:!1,y:!1,setScale:!1}},scales:{x:{time:!1},y:{auto:!1}},axes:[mt({label:"Frequency",values:(s,i)=>i.map(a=>ko(10**a))}),mt({label:n})],series:[{},{label:"Filter design",stroke:je.yellow,width:2},{label:"Data curve",stroke:je.green,width:1.5},{label:"Data x filter",stroke:je.red,width:1.5},{label:"Measurement",stroke:je.orange,width:0,points:{show:!0,size:4,width:1,stroke:je.orange}}],hooks:{draw:[()=>this.renderMarkers()]}}}installPlotEvents(e){const n=e.root;n.addEventListener("contextmenu",i=>i.preventDefault(),{capture:!0}),n.addEventListener("wheel",i=>{i.preventDefault();const a=Math.exp(i.deltaY/500);this.zoomAroundPointer(e,i,a,a)},{passive:!1}),n.addEventListener("pointerdown",i=>{this.startMouseNavigation(e,i)&&n.setPointerCapture(i.pointerId)},{capture:!0}),n.addEventListener("pointermove",i=>this.handlePointerMove(e,i),{capture:!0});const s=i=>this.endPointerInteraction(e,i);n.addEventListener("pointerup",s,{capture:!0}),n.addEventListener("pointercancel",s,{capture:!0}),n.addEventListener("mousedown",i=>{!this.panState&&!this.zoomState&&this.startMouseNavigation(e,i)},{capture:!0}),n.addEventListener("dblclick",i=>{this.clickTimer!==null&&(window.clearTimeout(this.clickTimer),this.clickTimer=null),this.handlePlotClick(e,i,!0).catch(a=>this.setStatus(a.message))}),n.addEventListener("click",i=>{if(this.suppressNextClick){this.suppressNextClick=!1;return}i.detail>1||(this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.clickTimer=window.setTimeout(()=>{this.clickTimer=null,this.handlePlotClick(e,i,!1).catch(a=>this.setStatus(a.message))},220))}),n.addEventListener("mousemove",i=>{this.markerDrag?this.moveDraggedMarker(i):(!this.panState&&!this.zoomState&&i.buttons&&this.startMouseMoveNavigation(e,i),this.handlePointerMove(e,i))},{capture:!0}),n.addEventListener("mouseup",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)},{capture:!0}),n.addEventListener("mouseleave",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)})}async handlePlotClick(e,n,s){if(!this.latest||n.defaultPrevented)return;const i=this.frequencyFromEvent(e,n);if(n.ctrlKey||n.metaKey)await this.addMarker("poles",i,s);else if(n.shiftKey)await this.addMarker("zeros",i,s);else{const a=this.nearestMarker(i);a&&(this.selectedKey=So(a),this.renderMarkers(),this.renderListEditors())}}async addMarker(e,n,s){if(this.latest){if(s){const i=e==="poles"?"complex_poles":"complex_zeros",a=[...this.latest.state[i],uc(-n/10,n)];await this.setAttribute(i,a)}else{const i=e==="poles"?"real_poles":"real_zeros",a=[...this.latest.state[i],-n];await this.setAttribute(i,a)}await this.refresh()}}renderMarkers(){this.latest&&(this.renderMarkersForPlot(this.magnitudePlot,"magnitude"),this.renderMarkersForPlot(this.phasePlot,"phase"))}renderMarkersForPlot(e,n){const s=Array.from(e.over.querySelectorAll(".iir-marker"));for(const i of s)i.remove();for(const i of this.latest?.markers??[]){const a=Math.max(i.frequency,Number.MIN_VALUE),o=e.valToPos(Math.log10(a),"x"),l=e.valToPos(n==="magnitude"?i.magnitude:i.phase,"y");if(!Number.isFinite(o)||!Number.isFinite(l))continue;const u=document.createElement("button");u.type="button",u.className=`iir-marker is-${i.kind} is-${i.shape}`,u.classList.toggle("is-selected",this.selectedKey===So(i)),u.style.left=`${o}px`,u.style.top=`${l}px`,u.title=`${i.list}[${i.index}] ${ko(i.frequency)}`,u.textContent=i.kind==="pole"?"x":"o",u.addEventListener("mousedown",d=>{d.preventDefault(),d.stopPropagation(),this.selectedKey=So(i),this.markerDrag={marker:i,plot:e},u.classList.add("is-dragging"),this.renderListEditors()}),u.addEventListener("pointerdown",d=>d.stopPropagation()),e.over.appendChild(u)}}renderListEditors(){const e=this.host.querySelector(".iir-list-grid");if(!(!e||!this.latest)){e.textContent="";for(const n of em){const s=[...this.latest.state[n.name]],i=document.createElement("section");i.className="iir-list-editor",i.dataset.list=n.name;const a=document.createElement("header"),o=document.createElement("span");o.textContent=n.label;const l=document.createElement("input");l.type="number",l.min="0",l.max="64",l.step="1",l.value=String(s.length),l.id=`iir-${n.name.replaceAll("_","-")}-count`,l.addEventListener("change",()=>{this.setListCount(n.name,Number(l.value)).catch(f=>this.setStatus(f.message))});const u=document.createElement("button");u.type="button",u.textContent="+",u.title=`Add ${n.label.slice(0,-1).toLowerCase()}`,u.addEventListener("click",()=>{this.appendListValue(n.name).catch(f=>this.setStatus(f.message))});const d=document.createElement("button");d.type="button",d.textContent="-",d.title=`Remove selected ${n.label.slice(0,-1).toLowerCase()}`,d.disabled=s.length===0,d.addEventListener("click",()=>{this.removeListValue(n.name).catch(f=>this.setStatus(f.message))}),a.append(o,l,u,d),i.appendChild(a);const v=document.createElement("input");v.type="text",v.id=`iir-${n.name.replaceAll("_","-")}`,v.value=s.join(", "),v.addEventListener("change",()=>{const f=n.complex?hc(v.value):hc(v.value).map(Number);this.setList(n.name,f).catch(y=>this.setStatus(y.message))}),i.appendChild(v);const m=document.createElement("div");m.className="iir-list-values",s.forEach((f,y)=>{const P=document.createElement("label");P.className="iir-list-value";const O=`${n.name}:${y}`;P.classList.toggle("is-selected",this.selectedKey===O);const F=document.createElement("span");F.textContent=String(y);const L=document.createElement("input");L.type=n.complex?"text":"number",L.step="any",L.value=String(f),L.addEventListener("focus",()=>{this.selectedKey=O,this.renderMarkers(),this.renderListEditors()}),L.addEventListener("change",()=>{const M=[...this.latest.state[n.name]];M[y]=n.complex?L.value:Number(L.value),this.setList(n.name,M).catch(D=>this.setStatus(D.message))}),P.append(F,L),m.appendChild(P)}),i.appendChild(m),e.appendChild(i)}}}async appendListValue(e){if(!this.latest)return;const n=[...this.latest.state[e],pc(e)];await this.setList(e,n)}async removeListValue(e){if(!this.latest)return;const n=[...this.latest.state[e]],s=this.selectedKey?.startsWith(`${e}:`)?Number(this.selectedKey.split(":")[1]):n.length-1;s>=0&&s<n.length&&(n.splice(s,1),this.selectedKey=null,await this.setList(e,n))}async setListCount(e,n){if(!this.latest)return;const s=Math.max(0,Math.min(64,Math.round(Number.isFinite(n)?n:0))),i=[...this.latest.state[e]];for(;i.length<s;)i.push(pc(e));i.length=s,await this.setList(e,i)}async setList(e,n){await this.setAttribute(e,n),await this.refresh()}moveDraggedMarker(e){const n=this.markerDrag;if(!n)return;const s=this.frequencyFromEvent(n.plot,e);this.plotStatus().textContent=`drag ${n.marker.list}[${n.marker.index}] to ${ko(s)}`}async finishDraggedMarker(e){const n=this.markerDrag;if(this.markerDrag=null,!n||!this.latest)return;const s=this.frequencyFromEvent(n.plot,e),i=n.marker;if(i.list==="real_poles"||i.list==="real_zeros"){const a=[...this.latest.state[i.list]];a[i.index]=-s,await this.setAttribute(i.list,a)}else{const a=[...this.latest.state[i.list]],o=nm(String(a[i.index]));a[i.index]=uc(o.real,s),await this.setAttribute(i.list,a)}await this.refresh()}nearestMarker(e){if(!this.latest?.markers.length)return null;let n=this.latest.markers[0],s=1/0;for(const i of this.latest.markers){const a=Math.max(i.frequency,e)/Math.max(Number.MIN_VALUE,Math.min(i.frequency,e));a<s&&(n=i,s=a)}return n}frequencyFromEvent(e,n){const s=e.over.getBoundingClientRect(),i=Math.max(0,Math.min(s.width,n.clientX-s.left));return 10**Number(e.posToVal(i,"x"))}resetZoom(){this.latest&&(this.userView=!1,this.applyDefaultScales(),this.renderMarkers())}getXRange(){const e=this.magnitudePlot.scales.x;return{min:Number(e.min??this.defaultXScale().min),max:Number(e.max??this.defaultXScale().max)}}getMagnitudeYRange(){return this.getYRange(this.magnitudePlot)}getPhaseYRange(){return this.getYRange(this.phasePlot)}handlePointerMove(e,n){if(this.panState?.plot===e){const s=Math.max(1,e.bbox.width/(devicePixelRatio||1)),i=Math.max(1,e.bbox.height/(devicePixelRatio||1)),a=n.clientX-this.panState.startX,o=n.clientY-this.panState.startY;this.panState.moved||=Math.abs(a)>3||Math.abs(o)>3;const l=this.panState.xMax-this.panState.xMin,u=this.panState.yMax-this.panState.yMin,d=a/s*l,v=o/i*u;this.setXScale(this.panState.xMin-d,this.panState.xMax-d),this.setYScale(e,this.panState.yMin+v,this.panState.yMax+v)}else if(this.zoomState?.plot===e){const s=n.clientX-this.zoomState.startX,i=n.clientY-this.zoomState.startY;this.zoomState.moved||=Math.abs(s)>3||Math.abs(i)>3;const a=Math.exp(-s/260),o=Math.exp(i/260);this.zoomAroundStartScale(e,this.zoomState,a,o)}}startMouseNavigation(e,n){if(n.target.closest(".iir-marker")||n.ctrlKey||n.metaKey||n.shiftKey)return!1;const{min:s,max:i}=this.getXRange(),{min:a,max:o}=this.getYRange(e);return n.button===0?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture(),!0):n.button===1||n.button===2?(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture(),!0):!1}startMouseMoveNavigation(e,n){(n.buttons&1)===1?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture()):((n.buttons&2)===2||(n.buttons&4)===4)&&(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture())}getXRangeAsStart(e){const{min:n,max:s}=this.getXRange(),{min:i,max:a}=this.getYRange(e);return{xMin:n,xMax:s,yMin:i,yMax:a}}endPointerInteraction(e,n){const s=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;if(this.panState?.plot===e||this.zoomState?.plot===e){try{e.root.releasePointerCapture(n.pointerId)}catch{}this.userView||=!!s,this.suppressNextClick||=!!s}this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}endMouseInteraction(e){const n=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;this.userView||=!!n,this.suppressNextClick||=!!n,this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}addWindowMouseCapture(){window.addEventListener("mousemove",this.windowMouseMove),window.addEventListener("mouseup",this.windowMouseUp)}removeWindowMouseCapture(){window.removeEventListener("mousemove",this.windowMouseMove),window.removeEventListener("mouseup",this.windowMouseUp)}zoomAroundPointer(e,n,s,i){const a=e.over.getBoundingClientRect(),o=Math.max(0,Math.min(a.width,n.clientX-a.left)),l=Math.max(0,Math.min(a.height,n.clientY-a.top)),u=Number(e.posToVal(o,"x")),d=Number(e.posToVal(l,"y")),{min:v,max:m}=this.getXRange(),{min:f,max:y}=this.getYRange(e),P=(u-v)/Math.max(Number.EPSILON,m-v),O=(d-f)/Math.max(Number.EPSILON,y-f),F=Math.max(this.minimumXSpan(),(m-v)*s),L=Math.max(1e-12,(y-f)*i);this.setXScale(u-F*P,u+F*(1-P)),this.setYScale(e,d-L*O,d+L*(1-O)),this.userView=!0}zoomAroundStartScale(e,n,s,i){const a=(n.xMin+n.xMax)/2,o=(n.yMin+n.yMax)/2,l=Math.max(this.minimumXSpan(),(n.xMax-n.xMin)*s),u=Math.max(1e-12,(n.yMax-n.yMin)*i);this.setXScale(a-l/2,a+l/2),this.setYScale(e,o-u/2,o+u/2)}setXScale(e,n){const s=this.defaultXScale(),i=Math.min(s.max-s.min,Math.max(this.minimumXSpan(),n-e));let a=e,o=e+i;a<s.min&&(o+=s.min-a,a=s.min),o>s.max&&(a-=o-s.max,o=s.max),this.linkXScale({min:Math.max(s.min,a),max:Math.min(s.max,o)})}setYScale(e,n,s){const i=Math.max(1e-12,s-n);e.setScale("y",{min:n,max:n+i}),this.renderMarkers()}linkXScale(e){this.magnitudePlot.setScale("x",e),this.phasePlot.setScale("x",e),this.renderMarkers()}getYRange(e){const n=e.scales.y,s=e===this.magnitudePlot?this.yScale(Float32Array.from(this.latest?.magnitude??[])):this.yScale(Float32Array.from(this.latest?.phase??[]));return{min:Number(n.min??s.min),max:Number(n.max??s.max)}}applyDefaultScales(){if(!this.latest)return;const e=this.defaultXScale();this.magnitudePlot.batch(()=>{this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",this.yScale(Float32Array.from(this.latest.magnitude)))}),this.phasePlot.batch(()=>{this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",this.yScale(Float32Array.from(this.latest.phase)))})}defaultXScale(){const e=this.latest?.x??[],n=e.length?Math.max(Number.MIN_VALUE,e[0]):10,s=e.length?Math.max(n*1.000001,e[e.length-1]):5e6;return{min:Math.log10(n),max:Math.log10(s)}}minimumXSpan(){const{min:e,max:n}=this.defaultXScale();return Math.max(Number.EPSILON,(n-e)/1024)}yScale(e){if(!e.length)return{min:-260,max:20};let n=1/0,s=-1/0;for(const a of e)Number.isFinite(a)&&(n=Math.min(n,a),s=Math.max(s,a));if(!Number.isFinite(n)||!Number.isFinite(s))return{min:-260,max:20};Math.abs(s-n)<1e-9&&(n-=1,s+=1);const i=(s-n)*.1;return{min:n-i,max:s+i}}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=cc(this.magnitudeHost),n=cc(this.phaseHost);!e||!n||(this.magnitudePlot.setSize(e),this.phasePlot.setSize(n),this.renderMarkers())}))}plotStatus(){const e=this.host.querySelector(".iir-plot-status");if(!e)throw new Error("Missing IIR plot status");return e}}function cc(t){const e=t.getBoundingClientRect(),n=Math.floor(e.width),s=Math.floor(e.height);return n<40||s<40?null:{width:n,height:s}}function Ys(t){return Float32Array.from(t,e=>e===null?Number.NaN:e)}function So(t){return`${t.list}:${t.index}`}function uc(t,e){return`${$i(t)}+${$i(Math.abs(e))}j`}function pc(t){return t.startsWith("complex")?"-1000+10000j":-1e4}function hc(t){return t.split(",").map(e=>e.trim()).filter(Boolean)}function nm(t){const n=t.trim().replace("i","j").match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]\d+(?:\.\d+)?(?:e[+-]?\d+)?)j$/i);return n?{real:Number(n[1]??0),imag:Number(n[2])}:{real:-1,imag:1}}function $i(t){return Number(t.toPrecision(8)).toString()}function ko(t){return t>=1e6?`${$i(t/1e6)} MHz`:t>=1e3?`${$i(t/1e3)} kHz`:`${$i(t)} Hz`}class sm{constructor(e){this.elements=e,this.resizeObserver=new ResizeObserver(()=>this.scheduleLayoutRefresh()),this.resizeObserver.observe(e.inputPlot),this.resizeObserver.observe(e.outputPlot),e.classSelect.addEventListener("change",()=>{this.setClass(e.classSelect.value).catch(n=>{this.setStatus(n.message)})}),e.addStage.addEventListener("click",()=>{this.requestSchema("/api/lockbox/stages",{method:"POST"}).catch(n=>{this.setStatus(n.message)})}),e.inputPlotSelect.addEventListener("change",()=>{this.refreshInputPlot().catch(n=>this.setStatus(n.message))}),e.outputPlotSelect.addEventListener("change",()=>{this.refreshOutputPlot().catch(n=>this.setStatus(n.message))})}elements;schema=null;inputPlot=null;outputMagnitudePlot=null;outputPhasePlot=null;resizeObserver;resizeFrame=null;stageLayoutWidth=0;stageHeight=0;async load(){const[e,n]=await Promise.all([fetch("/api/lockbox"),fetch("/api/lockbox/actions")]);if(!e.ok||!n.ok)throw new Error("Lockbox controls unavailable");const s=await e.json(),i=await n.json();this.renderActions(i.actions??[]),await this.applySchema(s)}async applySchema(e){this.schema=e,e.actions&&this.renderActions(e.actions),this.populateClassSelect(e),this.renderLockboxAttributes(e.attributes),this.renderInputs(e.inputs),this.renderOutputs(e.outputs),this.renderStages(e.sequence),this.populatePlotSelect(this.elements.inputPlotSelect,e.inputs.map(n=>n.name)),this.populatePlotSelect(this.elements.outputPlotSelect,e.outputs.map(n=>n.name)),this.setStatus(`${e.classname}: ${e.state.current_state??"ready"} | ${e.state.lock_status?"locked":"not locked"}`),await Promise.all([this.refreshInputPlot(),this.refreshOutputPlot()]),this.scheduleLayoutRefresh()}refreshLayout(){this.inputPlot&&this.fitPlotToHost(this.inputPlot,this.elements.inputPlot);const e=this.elements.outputPlot.querySelectorAll(".lockbox-output-plot-frame");e[0]&&this.outputMagnitudePlot&&this.fitPlotToHost(this.outputMagnitudePlot,e[0]),e[1]&&this.outputPhasePlot&&this.fitPlotToHost(this.outputPhasePlot,e[1]),this.equalizeStageHeights()}getStageCount(){return this.schema?.sequence.length??0}getClassname(){return this.schema?.classname??null}populateClassSelect(e){const s=e.attributes.find(i=>i.name==="classname")?.options??[e.classname];this.elements.classSelect.textContent="";for(const i of s){const a=document.createElement("option");a.value=String(i),a.textContent=String(i),this.elements.classSelect.appendChild(a)}this.elements.classSelect.value=e.classname}populatePlotSelect(e,n){const s=e.value;e.textContent="";for(const i of n){const a=document.createElement("option");a.value=i,a.textContent=i,e.appendChild(a)}e.value=n.includes(s)?s:n[0]??""}renderActions(e){this.elements.actions.textContent="";for(const n of e){const s=document.createElement("button");s.type="button",s.textContent=n.label??n.name,s.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/actions/${n.name}`,{method:"POST"}).catch(i=>{this.setStatus(i.message)})}),this.elements.actions.appendChild(s)}}renderLockboxAttributes(e){const n=this.elements.root.querySelector("#lockbox-attributes");if(n){n.textContent="";for(const s of e)s.name!=="classname"&&n.appendChild(this.createAttributeField(s,i=>this.requestSchema(`/api/lockbox/attributes/${s.name}`,this.valueRequest(i))))}}renderInputs(e){this.elements.inputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"input");s.dataset.nodeName=n.name;const i=document.createElement("button");i.type="button",i.textContent="Calibrate",i.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/actions/calibrate`,{method:"POST"}).catch(o=>this.setStatus(o.message))}),s.querySelector(".lockbox-card-title")?.appendChild(i);const a=document.createElement("div");a.className="lockbox-control-row";for(const o of n.attributes)a.appendChild(this.createAttributeField(o,l=>this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/attributes/${o.name}`,this.valueRequest(l))));if(s.appendChild(a),n.calibration){const o=document.createElement("output");o.textContent=Object.entries(n.calibration).filter(([,l])=>typeof l=="number").slice(0,4).map(([l,u])=>`${l} ${Number(u).toPrecision(3)}`).join(" | "),s.appendChild(o)}this.elements.inputs.appendChild(s)}}renderOutputs(e){this.elements.outputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"output");s.dataset.nodeName=n.name;const i=document.createElement("div");i.className="lockbox-control-row";const a=!!n.attributes.find(l=>l.name==="assisted_design")?.value,o=String(n.attributes.find(l=>l.name==="tf_type")?.value??"filter");for(const l of n.attributes){const u=this.createAttributeField(l,d=>this.requestSchema(`/api/lockbox/outputs/${encodeURIComponent(n.name)}/attributes/${l.name}`,this.valueRequest(d)));["p","i"].includes(l.name)&&this.setFieldDisabled(u,a),["desired_unity_gain_frequency","analog_filter_cutoff"].includes(l.name)&&this.setFieldDisabled(u,!a),l.name==="tf_curve"&&this.setFieldDisabled(u,o!=="curve"),i.appendChild(u)}s.appendChild(i),this.elements.outputs.appendChild(s)}}renderStages(e){this.elements.stages.textContent="",this.stageLayoutWidth=0,this.stageHeight=0,this.elements.stages.style.removeProperty("--lockbox-stage-height"),e.forEach((n,s)=>{const i=this.createSectionCard(n.name,`stage ${s}`);i.classList.add("lockbox-stage-card");const a=document.createElement("button");a.type="button",a.textContent="Delete",a.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}`,{method:"DELETE"}).catch(v=>{this.setStatus(v.message)})});const o=document.createElement("button");o.type="button",o.textContent="Go to this stage",o.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}/actions/execute`,{method:"POST"}).catch(v=>this.setStatus(v.message))});const l=document.createElement("div");l.className="lockbox-card-actions",l.append(o,a),i.querySelector(".lockbox-card-title")?.appendChild(l);const u=document.createElement("div");u.className="lockbox-control-row";for(const v of n.attributes)u.appendChild(this.createAttributeField(v,m=>this.requestSchema(`/api/lockbox/stages/${s}/attributes/${v.name}`,this.valueRequest(m))));i.appendChild(u);const d=document.createElement("div");d.className="lockbox-stage-output-grid";for(const v of n.outputs){const m=document.createElement("section");m.className="lockbox-stage-output";const f=document.createElement("h4");f.textContent=v.output,m.appendChild(f);for(const y of v.attributes)m.appendChild(this.createAttributeField(y,P=>this.requestSchema(`/api/lockbox/stages/${s}/outputs/${encodeURIComponent(v.output)}/attributes/${y.name}`,this.valueRequest(P))));d.appendChild(m)}i.appendChild(d),this.elements.stages.appendChild(i)})}equalizeStageHeights(){const e=Array.from(this.elements.stages.querySelectorAll(".lockbox-stage-card")),n=Math.floor(this.elements.stages.getBoundingClientRect().width);if(e.length===0||n<1||n===this.stageLayoutWidth&&this.stageHeight>0)return;this.elements.stages.style.removeProperty("--lockbox-stage-height");const s=Math.ceil(Math.max(...e.map(i=>i.getBoundingClientRect().height)));s<1||(this.elements.stages.style.setProperty("--lockbox-stage-height",`${s}px`),this.stageLayoutWidth=n,this.stageHeight=s)}createSectionCard(e,n){const s=document.createElement("section");s.className="lockbox-card";const i=document.createElement("header");i.className="lockbox-card-title";const a=document.createElement("h3");a.textContent=e;const o=document.createElement("span");return o.textContent=n,i.append(a,o),s.appendChild(i),s}createAttributeField(e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");for(const l of e.options??[]){const u=document.createElement("option");u.value=String(l),u.textContent=String(l),o.appendChild(u)}o.value=String(e.value),o.addEventListener("change",()=>{const l=this.selectValue(o.value,e.options??[]);n(l).catch(u=>this.setStatus(u.message))}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{n(o.checked).catch(l=>this.setStatus(l.message))}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",o.value=String(e.value),e.min!==void 0&&(o.min=String(e.min)),e.max!==void 0&&(o.max=String(e.max)),e.step!==void 0&&(o.step=String(e.step)),o.addEventListener("change",()=>{n(Number(o.value)).catch(l=>this.setStatus(l.message))}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Array.isArray(e.value)?e.value.join(", "):String(e.value??""),o.addEventListener("change",()=>{n(this.textValue(o.value)).catch(l=>this.setStatus(l.message))}),a=o}return a.id=`lockbox-${e.name.replaceAll("_","-")}-${crypto.randomUUID()}`,s.appendChild(a),s}setFieldDisabled(e,n){const s=e.querySelector("input, select");s&&(s.disabled=n),e.classList.toggle("is-disabled",n)}selectValue(e,n){return n.find(i=>String(i)===e)??e}textValue(e){const n=e.split(",").map(s=>s.trim()).filter(Boolean);return n.length>1&&n.every(s=>Number.isFinite(Number(s)))?n.map(s=>Number(s)):e}valueRequest(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:e})}}async setClass(e){await this.requestSchema("/api/lockbox/class",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({classname:e})})}async requestSchema(e,n){const s=await fetch(e,n);if(!s.ok)throw new Error(`Lockbox request failed: ${s.status}`);await this.applySchema(await s.json())}async refreshInputPlot(){const e=this.schema?.inputs.find(i=>i.name===this.elements.inputPlotSelect.value)??this.schema?.inputs[0];if(!e)return;const n=await fetch(`/api/lockbox/inputs/${encodeURIComponent(e.name)}/plot`);if(!n.ok)return;const s=await n.json();this.drawInputPlot(this.elements.inputPlot,"Expected Signal",s)}async refreshOutputPlot(){const e=this.schema?.outputs.find(i=>i.name===this.elements.outputPlotSelect.value)??this.schema?.outputs[0];if(!e)return;const n=await fetch(`/api/lockbox/outputs/${encodeURIComponent(e.name)}/transfer_function`);if(!n.ok)return;const s=await n.json();this.drawOutputPlot(this.elements.outputPlot,s)}drawInputPlot(e,n,s){this.inputPlot?.destroy(),e.textContent="";const i=this.plotSize(e),a=new Te({title:n,width:i.width,height:i.height,scales:{x:{time:!1}},series:[{},...s.series.map((o,l)=>({label:o.label,stroke:l===0?je.green:je.blue,width:2}))],axes:[mt(),mt()]},[s.x,...s.series.map(o=>o.values)],e);this.inputPlot=a}drawOutputPlot(e,n){this.outputMagnitudePlot?.destroy(),this.outputPhasePlot?.destroy(),e.textContent="";const s=document.createElement("div"),i=document.createElement("div");s.className="lockbox-output-plot-frame",i.className="lockbox-output-plot-frame",e.append(s,i),this.resizeObserver.observe(s),this.resizeObserver.observe(i);const a=n.series.find(l=>l.label==="magnitude")?.values??[],o=n.series.find(l=>l.label==="phase")?.values??[];this.outputMagnitudePlot=new Te({title:"Open-loop magnitude",...this.outputPlotOptions(this.plotSize(s),!0),series:[{},{label:"magnitude",stroke:je.green,width:2}]},[n.x,a.map(l=>Math.max(1e-30,l))],s),this.outputPhasePlot=new Te({title:"Open-loop phase",...this.outputPlotOptions(this.plotSize(i),!1),series:[{},{label:"phase",stroke:je.blue,width:2}]},[n.x,o],i),this.scheduleLayoutRefresh()}outputPlotOptions(e,n){return{width:e.width,height:e.height,scales:{x:{time:!1,distr:3},y:n?{distr:3}:{auto:!0}},axes:[mt(),mt()]}}plotSize(e){const n=e.getBoundingClientRect();return{width:Math.floor(n.width)||420,height:Math.floor(n.height)||224}}fitPlotToHost(e,n){const s=n.getBoundingClientRect();if(s.width<1||s.height<1)return;const i=e.root.querySelector(".u-wrap")?.getBoundingClientRect(),a=Math.max(0,Math.ceil(e.root.getBoundingClientRect().height-(i?.height??0)));e.setSize({width:Math.floor(s.width),height:Math.max(80,Math.floor(s.height)-a)})}scheduleLayoutRefresh(){if(this.resizeFrame!==null)return;let e=3;const n=()=>{this.resizeFrame=requestAnimationFrame(()=>{this.elements.root.hidden||this.refreshLayout(),e-=1,e>0?n():this.resizeFrame=null})};n()}setStatus(e){this.elements.status.textContent=e}}var Ft=typeof window<"u"?window:null,vr=Ft===null,qi=vr?void 0:Ft.document,Vt="addEventListener",Yt="removeEventListener",Mo="getBoundingClientRect",Pi="_a",Ht="_b",fn="_c",ua="horizontal",jt=function(){return!1},im=vr?"calc":["","-webkit-","-moz-","-o-"].filter(function(t){var e=qi.createElement("div");return e.style.cssText="width:"+t+"calc(9px)",!!e.style.length}).shift()+"calc",yu=function(t){return typeof t=="string"||t instanceof String},dc=function(t){if(yu(t)){var e=qi.querySelector(t);if(!e)throw new Error("Selector "+t+" did not match a DOM element");return e}return t},at=function(t,e,n){var s=t[e];return s!==void 0?s:n},pa=function(t,e,n,s){if(e){if(s==="end")return 0;if(s==="center")return t/2}else if(n){if(s==="start")return 0;if(s==="center")return t/2}return t},am=function(t,e){var n=qi.createElement("div");return n.className="gutter gutter-"+e,n},om=function(t,e,n){var s={};return yu(e)?s[t]=e:s[t]=im+"("+e+"% - "+n+"px)",s},rm=function(t,e){var n;return n={},n[t]=e+"px",n},ji=function(t,e){if(e===void 0&&(e={}),vr)return{};var n=t,s,i,a,o,l,u;Array.from&&(n=Array.from(n));var d=dc(n[0]),v=d.parentNode,m=getComputedStyle?getComputedStyle(v):null,f=m?m.flexDirection:null,y=at(e,"sizes")||n.map(function(){return 100/n.length}),P=at(e,"minSize",100),O=Array.isArray(P)?P:n.map(function(){return P}),F=at(e,"maxSize",1/0),L=Array.isArray(F)?F:n.map(function(){return F}),M=at(e,"expandToMin",!1),D=at(e,"gutterSize",10),z=at(e,"gutterAlign","center"),K=at(e,"snapOffset",30),R=Array.isArray(K)?K:n.map(function(){return K}),ee=at(e,"dragInterval",1),X=at(e,"direction",ua),ie=at(e,"cursor",X===ua?"col-resize":"row-resize"),J=at(e,"gutter",am),_=at(e,"elementStyle",om),te=at(e,"gutterStyle",rm);X===ua?(s="width",i="clientX",a="left",o="right",l="clientWidth"):X==="vertical"&&(s="height",i="clientY",a="top",o="bottom",l="clientHeight");function q(T,S,E,V){var ke=_(s,S,E,V);Object.keys(ke).forEach(function(ue){T.style[ue]=ke[ue]})}function Z(T,S,E){var V=te(s,S,E);Object.keys(V).forEach(function(ke){T.style[ke]=V[ke]})}function Y(){return u.map(function(T){return T.size})}function oe(T){return"touches"in T?T.touches[0][i]:T[i]}function j(T){var S=u[this.a],E=u[this.b],V=S.size+E.size;S.size=T/this.size*V,E.size=V-T/this.size*V,q(S.element,S.size,this[Ht],S.i),q(E.element,E.size,this[fn],E.i)}function st(T){var S,E=u[this.a],V=u[this.b];this.dragging&&(S=oe(T)-this.start+(this[Ht]-this.dragOffset),ee>1&&(S=Math.round(S/ee)*ee),S<=E.minSize+E.snapOffset+this[Ht]?S=E.minSize+this[Ht]:S>=this.size-(V.minSize+V.snapOffset+this[fn])&&(S=this.size-(V.minSize+this[fn])),S>=E.maxSize-E.snapOffset+this[Ht]?S=E.maxSize+this[Ht]:S<=this.size-(V.maxSize-V.snapOffset+this[fn])&&(S=this.size-(V.maxSize+this[fn])),j.call(this,S),at(e,"onDrag",jt)(Y()))}function ye(){var T=u[this.a].element,S=u[this.b].element,E=T[Mo](),V=S[Mo]();this.size=E[s]+V[s]+this[Ht]+this[fn],this.start=E[a],this.end=E[o]}function ce(T){if(!getComputedStyle)return null;var S=getComputedStyle(T);if(!S)return null;var E=T[l];return E===0?null:(X===ua?E-=parseFloat(S.paddingLeft)+parseFloat(S.paddingRight):E-=parseFloat(S.paddingTop)+parseFloat(S.paddingBottom),E)}function me(T){var S=ce(v);if(S===null||O.reduce(function(ue,Re){return ue+Re},0)>S)return T;var E=0,V=[],ke=T.map(function(ue,Re){var pt=S*ue/100,$t=pa(D,Re===0,Re===T.length-1,z),en=O[Re]+$t;return pt<en?(E+=en-pt,V.push(0),en):(V.push(pt-en),pt)});return E===0?T:ke.map(function(ue,Re){var pt=ue;if(E>0&&V[Re]-E>0){var $t=Math.min(E,V[Re]-E);E-=$t,pt=ue-$t}return pt/S*100})}function ae(){var T=this,S=u[T.a].element,E=u[T.b].element;T.dragging&&at(e,"onDragEnd",jt)(Y()),T.dragging=!1,Ft[Yt]("mouseup",T.stop),Ft[Yt]("touchend",T.stop),Ft[Yt]("touchcancel",T.stop),Ft[Yt]("mousemove",T.move),Ft[Yt]("touchmove",T.move),T.stop=null,T.move=null,S[Yt]("selectstart",jt),S[Yt]("dragstart",jt),E[Yt]("selectstart",jt),E[Yt]("dragstart",jt),S.style.userSelect="",S.style.webkitUserSelect="",S.style.MozUserSelect="",S.style.pointerEvents="",E.style.userSelect="",E.style.webkitUserSelect="",E.style.MozUserSelect="",E.style.pointerEvents="",T.gutter.style.cursor="",T.parent.style.cursor="",qi.body.style.cursor=""}function H(T){if(!("button"in T&&T.button!==0)){var S=this,E=u[S.a].element,V=u[S.b].element;S.dragging||at(e,"onDragStart",jt)(Y()),T.preventDefault(),S.dragging=!0,S.move=st.bind(S),S.stop=ae.bind(S),Ft[Vt]("mouseup",S.stop),Ft[Vt]("touchend",S.stop),Ft[Vt]("touchcancel",S.stop),Ft[Vt]("mousemove",S.move),Ft[Vt]("touchmove",S.move),E[Vt]("selectstart",jt),E[Vt]("dragstart",jt),V[Vt]("selectstart",jt),V[Vt]("dragstart",jt),E.style.userSelect="none",E.style.webkitUserSelect="none",E.style.MozUserSelect="none",E.style.pointerEvents="none",V.style.userSelect="none",V.style.webkitUserSelect="none",V.style.MozUserSelect="none",V.style.pointerEvents="none",S.gutter.style.cursor=ie,S.parent.style.cursor=ie,qi.body.style.cursor=ie,ye.call(S),S.dragOffset=oe(T)-S.end}}y=me(y);var Se=[];u=n.map(function(T,S){var E={element:dc(T),size:y[S],minSize:O[S],maxSize:L[S],snapOffset:R[S],i:S},V;if(S>0&&(V={a:S-1,b:S,dragging:!1,direction:X,parent:v},V[Ht]=pa(D,S-1===0,!1,z),V[fn]=pa(D,!1,S===n.length-1,z),f==="row-reverse"||f==="column-reverse")){var ke=V.a;V.a=V.b,V.b=ke}if(S>0){var ue=J(S,X,E.element);Z(ue,D,S),V[Pi]=H.bind(V),ue[Vt]("mousedown",V[Pi]),ue[Vt]("touchstart",V[Pi]),v.insertBefore(ue,E.element),V.gutter=ue}return q(E.element,E.size,pa(D,S===0,S===n.length-1,z),S),S>0&&Se.push(V),E});function Ue(T){var S=T.i===Se.length,E=S?Se[T.i-1]:Se[T.i];ye.call(E);var V=S?E.size-T.minSize-E[fn]:T.minSize+E[Ht];j.call(E,V)}u.forEach(function(T){var S=T.element[Mo]()[s];S<T.minSize&&(M?Ue(T):T.minSize=S)});function Ce(T){var S=me(T);S.forEach(function(E,V){if(V>0){var ke=Se[V-1],ue=u[ke.a],Re=u[ke.b];ue.size=S[V-1],Re.size=E,q(ue.element,ue.size,ke[Ht],ue.i),q(Re.element,Re.size,ke[fn],Re.i)}})}function he(T,S){Se.forEach(function(E){if(S!==!0?E.parent.removeChild(E.gutter):(E.gutter[Yt]("mousedown",E[Pi]),E.gutter[Yt]("touchstart",E[Pi])),T!==!0){var V=_(s,E.a.size,E[Ht]);Object.keys(V).forEach(function(ke){u[E.a].element.style[ke]="",u[E.b].element.style[ke]=""})}})}return{setSizes:Ce,getSizes:Y,collapse:function(S){Ue(u[S])},destroy:he,parent:v,pairs:Se}};class lm{constructor(e,n,s,i,a,o,l,u,d){this.controlsHost=e,this.magnitudeHost=n,this.phaseHost=s,this.status=i,this.singleButton=a,this.runButton=o,this.stopButton=l,this.saveButton=u,this.resetButton=d,this.reconnectScheduler=new Da(()=>this.openSocket()),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.magnitudeHost.parentElement??this.magnitudeHost),this.resizeObserver.observe(this.phaseHost.parentElement??this.phaseHost);const v=this.controlsHost.parentElement,m=this.magnitudeHost.closest(".network-plots");if(!v||!m)throw new Error("Network analyzer split panes are missing");this.controlsPane=v,this.plotsPane=m,this.bindActions(),this.scheduleResize()}controlsHost;magnitudeHost;phaseHost;status;singleButton;runButton;stopButton;saveButton;resetButton;magnitudePlot;phasePlot;socket=null;wantsConnection=!1;reconnectScheduler;runId=-1;x=[];magnitude=[];phase=[];real=[];imaginary=[];redrawFrame=null;resizeFrame=null;userScaled=!1;logscale=!0;lastProgress="";resizeObserver;split=null;controlsPane;plotsPane;async initialize(){const[e,n]=await Promise.all([fetch("/api/modules/networkanalyzer/attributes"),fetch("/api/modules/networkanalyzer")]);if(!e.ok||!n.ok)throw new Error("Network analyzer controls failed to load");const s=await e.json(),i=await n.json();this.renderControls(s.attributes??[]),this.applyState(i.state??i)}applyState(e){const n=String(e.running_state??"stopped")!=="stopped";this.runButton.textContent=n?"Running":"Continuous",this.runButton.disabled=n,this.stopButton.disabled=!n;const s=typeof e.iq_module=="string"?` on ${e.iq_module}`:"",i=`${String(e.running_state??"stopped")}${s}`;this.status.textContent=!n&&this.lastProgress?`${this.lastProgress}, ${i}`:i}refreshLayout(){this.ensureSplit(),this.scheduleResize()}destroy(){this.closeSocket(),this.resizeObserver.disconnect(),this.split?.destroy(),this.magnitudePlot.destroy(),this.phasePlot.destroy()}bindActions(){this.singleButton.addEventListener("click",()=>{this.start("single")}),this.runButton.addEventListener("click",()=>{this.start("continuous")}),this.stopButton.addEventListener("click",()=>{this.stop()}),this.saveButton.addEventListener("click",()=>{this.persistCurve().then(()=>{this.downloadCsv(),this.status.textContent="Curve saved"}).catch(e=>{this.status.textContent=e.message})}),this.resetButton.addEventListener("click",()=>this.resetZoom())}ensureSplit(){this.split||this.controlsPane.closest(".workspace-panel")?.hidden||(this.split=ji([this.controlsPane,this.plotsPane],{direction:"vertical",sizes:[34,66],minSize:[100,240],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}async start(e){const n=await fetch(`/api/modules/networkanalyzer/actions/${e}`,{method:"POST"});if(!n.ok){this.status.textContent=`Network analyzer ${e} failed: ${n.status}`;return}const s=await n.json();this.applyState(s.state??{}),this.connectSocket()}async stop(){const e=await fetch("/api/modules/networkanalyzer/actions/stop",{method:"POST"});if(e.ok){const n=await e.json();this.applyState(n.state??{})}this.closeSocket()}connectSocket(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=new WebSocket(`${e}://${window.location.host}/ws/networkanalyzer`);this.socket=n,n.addEventListener("open",()=>{this.socket===n&&this.reconnectScheduler.connected()}),n.addEventListener("message",s=>{this.socket===n&&this.showPoint(JSON.parse(String(s.data)))}),n.addEventListener("close",()=>{if(this.socket===n&&(this.socket=null,this.wantsConnection)){const s=this.reconnectScheduler.schedule();this.status.textContent=`Network Analyzer stream closed; reconnecting${s===null?"":` in ${s} ms`}`}})}closeSocket(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}showPoint(e){e.run_id!==this.runId&&(this.runId=e.run_id,this.x=new Array(e.points).fill(Number.NaN),this.magnitude=new Array(e.points).fill(Number.NaN),this.phase=new Array(e.points).fill(Number.NaN),this.real=new Array(e.points).fill(Number.NaN),this.imaginary=new Array(e.points).fill(Number.NaN),this.userScaled=!1),this.x[e.index]=e.x;const n=Math.hypot(e.real,e.imag);this.magnitude[e.index]=20*Math.log10(Math.max(n,1e-20)),this.phase[e.index]=Math.atan2(e.imag,e.real)*180/Math.PI,this.real[e.index]=e.real,this.imaginary[e.index]=e.imag,this.logscale!==e.logscale&&(this.logscale=e.logscale,this.recreatePlots()),this.scheduleRedraw();const s=e.time_per_point>0?`${cm(e.time_per_point*1e3)} ms/point`:"";this.lastProgress=`${e.index+1}/${e.points}, average ${e.current_avg}${s?`, ${s}`:""}`,this.status.textContent=this.lastProgress,e.running_state==="stopped"&&(this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0)}renderControls(e){this.controlsHost.textContent="";const n=[["Channels",["input","output_direct"]],["Frequency",["start_freq","stop_freq","points","logscale"]],["Setup",["amplitude","acbandwidth"]],["Averaging",["average_per_point","rbw","trace_average","curve_name"]],["Auto Bandwidth",["auto_bandwidth","q_factor_min"]],["Auto Amplitude",["auto_amplitude","target_dbv","auto_amp_min","auto_amp_max"]]],s=new Map(e.map(i=>[i.name,i]));for(const[i,a]of n){const o=document.createElement("fieldset");o.className="network-control-group";const l=document.createElement("legend");l.textContent=i,o.appendChild(l);for(const u of a){const d=s.get(u);d&&o.appendChild(this.createControl(d))}this.controlsHost.appendChild(o)}}createControl(e){const n=document.createElement("label"),s=document.createElement("span");s.textContent=e.label,n.appendChild(s);let i;if(e.type==="select"){const a=document.createElement("select");for(const o of e.options??[]){const l=document.createElement("option");l.value=String(o),l.textContent=String(o),a.appendChild(l)}a.value=String(e.value),i=a}else{const a=document.createElement("input");a.type=e.type==="bool"?"checkbox":e.type,a.type==="checkbox"?a.checked=!!e.value:a.value=String(e.value),e.min!==void 0&&(a.min=String(e.min)),e.max!==void 0&&(a.max=String(e.max)),e.step!==void 0&&(a.step=String(e.step)),i=a}return i.id=`networkanalyzer-${e.name.replaceAll("_","-")}`,i.addEventListener("change",()=>{this.writeAttribute(e,i)}),n.appendChild(i),n}async writeAttribute(e,n){const s=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:e.type==="number"?Number(n.value):n.value,i=await fetch(`/api/modules/networkanalyzer/attributes/${e.name}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:s})});if(!i.ok){this.status.textContent=`${e.label} update failed: ${i.status}`;return}this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0,this.status.textContent=`${e.label} updated`}createPlot(e,n,s,i){return new Te({width:800,height:260,title:n,scales:{x:{time:!1,distr:this.logscale?3:1},y:{auto:!0}},axes:[mt({label:i?"Frequency (Hz)":""}),mt({label:s})],series:[{},{label:n,stroke:je.yellow,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}},hooks:{setScale:[(a,o)=>{(o==="x"||o==="y")&&(this.userScaled=!0)}]}},[[],[]],e)}recreatePlots(){this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.scheduleResize()}scheduleRedraw(){this.redrawFrame===null&&(this.redrawFrame=requestAnimationFrame(()=>{this.redrawFrame=null;const e=fc(this.x);this.magnitudePlot.setData([this.x.slice(0,e),this.magnitude.slice(0,e)]),this.phasePlot.setData([this.x.slice(0,e),this.phase.slice(0,e)])}))}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resizePlot(this.magnitudePlot,this.magnitudeHost),this.resizePlot(this.phasePlot,this.phaseHost)}))}resizePlot(e,n){const s=n.parentElement?.getBoundingClientRect();!s||s.width<100||s.height<100||e.setSize({width:Math.floor(s.width),height:Math.floor(s.height)})}resetZoom(){this.userScaled=!1;const e=Eo(this.x,0,1),n=Eo(this.magnitude,-120,20),s=Eo(this.phase,-180,180);this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",n),this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",s)}downloadCsv(){const e=["x,magnitude_db,phase_deg"];for(let i=0;i<this.x.length;i+=1)Number.isFinite(this.x[i])&&e.push(`${this.x[i]},${this.magnitude[i]},${this.phase[i]}`);const n=URL.createObjectURL(new Blob([`${e.join(`
`)}
`],{type:"text/csv"})),s=document.createElement("a");s.href=n,s.download=`network-analyzer-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`,s.click(),URL.revokeObjectURL(n)}async persistCurve(){const e=fc(this.x);if(e===0)throw new Error("No network analyzer curve to save");const n=this.controlsHost.querySelector("#networkanalyzer-curve-name"),s=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:this.x.slice(0,e),y:this.real.slice(0,e),y_imag:this.imaginary.slice(0,e),params:{...this.currentControlParameters(),name:n?.value||"networkanalyzer curve",module:"networkanalyzer"}})});if(!s.ok)throw new Error(`Save curve failed: ${s.status}`)}currentControlParameters(){const e={};for(const n of this.controlsHost.querySelectorAll("input, select")){const s=n.id.replace(/^networkanalyzer-/,"").replaceAll("-","_");e[s]=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:n instanceof HTMLInputElement&&n.type==="number"?Number(n.value):n.value}return e}}function cm(t){return t>=100?t.toFixed(0):t>=10?t.toFixed(1):t.toFixed(2)}function Eo(t,e,n){const s=t.filter(Number.isFinite);if(s.length===0)return{min:e,max:n};const i=Math.min(...s),a=Math.max(...s);if(i===a)return{min:i-1,max:a+1};const o=(a-i)*.04;return{min:i-o,max:a+o}}function fc(t){let e=0;for(;e<t.length&&Number.isFinite(t[e]);)e+=1;return e}class um{constructor(e,n,s,i,a,o,l,u,d,v,m){this.root=e,this.listPane=n,this.plotPane=s,this.paramsPane=i,this.select=a,this.name=o,this.params=l,this.status=u,this.saveParamsButton=d,this.deleteButton=v,this.refreshButton=m;const f=this.requireHost("#curve-viewer-magnitude"),y=this.requireHost("#curve-viewer-phase");this.magnitudePlot=this.createPlot(f,"Curve","Value"),this.phasePlot=this.createPlot(y,"Phase","deg"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotPane),this.bindActions()}root;listPane;plotPane;paramsPane;select;name;params;status;saveParamsButton;deleteButton;refreshButton;magnitudePlot;phasePlot;split=null;resizeObserver;resizeFrame=null;selected=null;async load(){await this.refreshList()}refreshLayout(){this.ensureSplit(),this.scheduleResize()}bindActions(){this.select.addEventListener("change",()=>{this.loadSelected()}),this.refreshButton.addEventListener("click",()=>{this.refreshList()}),this.saveParamsButton.addEventListener("click",()=>{this.saveParams()}),this.deleteButton.addEventListener("click",()=>{this.deleteSelected()})}async refreshList(){const e=this.select.value,n=await fetch("/api/curves?limit=100");if(!n.ok)throw new Error(`Curve list failed: ${n.status}`);const i=(await n.json()).curves??[];this.select.textContent="";for(const a of i){const o=document.createElement("option");o.value=String(a.pk),o.textContent=`${a.pk}: ${a.name}`,this.select.appendChild(o)}i.some(a=>String(a.pk)===e)?this.select.value=e:i[0]&&(this.select.value=String(i[0].pk)),this.status.textContent=`${i.length} curve${i.length===1?"":"s"}`,i.length?await this.loadSelected():this.clear()}async loadSelected(){if(!this.select.value)return this.clear();const e=await fetch(`/api/curves/${encodeURIComponent(this.select.value)}`);if(!e.ok)throw new Error(`Curve load failed: ${e.status}`);const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.saveParamsButton.disabled=!1,this.deleteButton.disabled=!1;const s=Array.isArray(this.selected.y_imag),i=s?this.selected.y.map((l,u)=>20*Math.log10(Math.max(Math.hypot(l,this.selected.y_imag[u]),1e-20))):this.selected.y,a=s?this.selected.y.map((l,u)=>Math.atan2(this.selected.y_imag[u],l)*180/Math.PI):[];this.magnitudePlot.setData([this.selected.x,i]),this.phasePlot.setData([s?this.selected.x:[],a]);const o=this.phasePlot.root.closest(".curve-viewer-plot-frame");o&&(o.hidden=!s),this.plotPane.classList.toggle("is-complex",s),this.status.textContent=`curve ${this.selected.pk}, ${this.selected.points} points`,this.scheduleResize()}async saveParams(){if(!this.selected)return;const e=await fetch(`/api/curves/${this.selected.pk}/params`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({params_yaml:this.params.value})});if(!e.ok){const s=await e.json().catch(()=>({}));this.status.textContent=s.detail??`Save parameters failed: ${e.status}`;return}const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.status.textContent=`curve ${this.selected.pk} parameters saved`,await this.refreshList()}async deleteSelected(){if(!this.selected)return;const e=this.selected.pk,n=await fetch(`/api/curves/${e}`,{method:"DELETE"});if(!n.ok){this.status.textContent=`Delete curve failed: ${n.status}`;return}this.selected=null,await this.refreshList(),this.status.textContent=`curve ${e} deleted`}clear(){this.selected=null,this.name.value="",this.params.value="",this.magnitudePlot.setData([[],[]]),this.phasePlot.setData([[],[]]),this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0}ensureSplit(){this.split||this.root.hidden||(this.split=ji([this.listPane,this.plotPane,this.paramsPane],{direction:"horizontal",sizes:[18,57,25],minSize:[140,300,200],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}createPlot(e,n,s){return new Te({width:700,height:260,title:n,scales:{x:{time:!1},y:{auto:!0}},axes:[mt({label:"X"}),mt({label:s})],series:[{},{label:n,stroke:je.green,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}}},[[],[]],e)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=this.plotPane.querySelectorAll(".curve-viewer-plot-frame:not([hidden])"),n=[this.magnitudePlot,this.phasePlot];e.forEach((s,i)=>{const a=s.getBoundingClientRect();a.width>100&&a.height>80&&n[i].setSize({width:Math.floor(a.width),height:Math.floor(a.height)})})}))}requireHost(e){const n=this.root.querySelector(e);if(!n)throw new Error(`Missing curve viewer element ${e}`);return n}}class pm{constructor(e){this.elements=e,e.module.addEventListener("change",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.refresh.addEventListener("click",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.save.addEventListener("click",()=>{this.save().catch(n=>this.setStatus(n.message))})}elements;schema=null;async load(e=this.schema?.module??"pyrpl"){const n=await fetch(`/api/config?module=${encodeURIComponent(e)}`);if(!n.ok)throw new Error(await mc(n,"Configuration unavailable"));this.apply(await n.json()),this.setStatus(`Loaded ${this.schema?.module}`)}async save(){const e=this.elements.module.value,n=await fetch(`/api/config/branches/${encodeURIComponent(e)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:this.elements.text.value})});if(!n.ok)throw new Error(await mc(n,"Configuration save failed"));this.apply(await n.json()),this.setStatus(`Saved ${e}`)}getModule(){return this.elements.module.value}getText(){return this.elements.text.value}apply(e){this.schema=e,this.elements.file.textContent=e.configfile,this.elements.module.textContent="";for(const n of e.modules){const s=document.createElement("option");s.value=n,s.textContent=n,this.elements.module.appendChild(s)}this.elements.module.value=e.module,this.elements.text.value=e.text,this.elements.module.disabled=!1,this.elements.text.disabled=!1,this.elements.refresh.disabled=!1,this.elements.save.disabled=!1}setStatus(e){this.elements.status.textContent=e}}async function mc(t,e){try{return(await t.json()).detail??`${e}: ${t.status}`}catch{return`${e}: ${t.status}`}}const gc="pyrpl-control-client-id";function hm(){try{const t=window.sessionStorage.getItem(gc);if(t)return t;const e=window.crypto.randomUUID();return window.sessionStorage.setItem(gc,e),e}catch{return`browser-${Date.now()}-${Math.random().toString(16).slice(2)}`}}class dm{id=hm();label=`Browser ${this.id.slice(0,8)}`;nativeFetch;heartbeatTimer=null;constructor(){this.nativeFetch=window.fetch.bind(window)}installFetchHeaders(){const e=this.nativeFetch;window.fetch=((n,s={})=>{if(new URL(n instanceof Request?n.url:String(n),window.location.href).origin!==window.location.origin)return e(n,s);const a=new Headers(n instanceof Request?n.headers:void 0);return new Headers(s.headers).forEach((o,l)=>a.set(l,o)),a.set("x-pyrpl-client-id",this.id),a.set("x-pyrpl-client-label",this.label),e(n,{...s,headers:a})})}async initialize(){let e=await this.refresh();return e.policy==="single-writer"&&e.controller===null&&(e=await this.claim(!1)),this.startHeartbeat(e.lease_seconds),e}async refresh(){return this.request("/api/control",{method:"GET"})}async claim(e){return this.request("/api/control/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({label:this.label,force:e})})}release(){window.fetch("/api/control/release",{method:"POST",keepalive:!0}).catch(()=>{})}startHeartbeat(e){this.heartbeatTimer!==null&&window.clearInterval(this.heartbeatTimer);const n=Math.max(2e3,Math.min(1e4,e*400));this.heartbeatTimer=window.setInterval(()=>{this.request("/api/control/heartbeat",{method:"POST"}).catch(()=>{})},n)}async request(e,n){const s=await window.fetch(e,n);if(!s.ok){let i=`Control request failed: ${s.status}`;try{const a=await s.json();a.detail&&(i=a.detail)}catch{}throw new Error(i)}return s.json()}}const Rt=[{id:"scope",title:"Scope",description:"Oscilloscope controls and live waveform",defaultEnabled:!0,defaultSplitSizes:[28,72]},{id:"asg",title:"ASG",description:"Arbitrary signal generator controls",defaultEnabled:!1},{id:"pid",title:"PID",description:"PID controller controls",defaultEnabled:!1},{id:"iq",title:"IQ",description:"IQ modulator and demodulator controls",defaultEnabled:!1},{id:"iir",title:"IIR",description:"Infinite impulse response filter controls",defaultEnabled:!1},{id:"trig",title:"Trigger",description:"DSP trigger controls",defaultEnabled:!1},{id:"pwm",title:"PWM",description:"Auxiliary PWM routing controls",defaultEnabled:!1},{id:"spectrumanalyzer",title:"Spectrum Analyzer",description:"FFT spectrum analyzer controls and plot",defaultEnabled:!1,defaultSplitSizes:[35,65]},{id:"networkanalyzer",title:"Network Analyzer",description:"Coherent swept-frequency response measurement",defaultEnabled:!1,defaultSplitSizes:[34,66]},{id:"curveviewer",title:"Curve Viewer",description:"Browse and manage saved PyRPL curves",defaultEnabled:!1},{id:"pyrplconfig",title:"Configuration",description:"Edit PyRPL YAML configuration branches",defaultEnabled:!1},{id:"lockbox",title:"Lockbox",description:"Model-based lock sequence controls",defaultEnabled:!1},{id:"housekeeping",title:"Housekeeping",description:"LED and expansion connector I/O",defaultEnabled:!1},{id:"telemetry",title:"Sampler & AMS",description:"DSP signal readback, statistics, and AMS DAC controls",defaultEnabled:!1},{id:"registers",title:"Register Debug",description:"Raw monitor_server register read/write",defaultEnabled:!1}];function fm(t){const e=Rt.find(n=>n.id===t);if(!e)throw new Error(`Unknown panel ${t}`);return e}function Bo(t){const e=t.trim();if(!e)throw new Error("Register value is empty");const n=Number(e);if(!Number.isInteger(n)||n<0)throw new Error(`Invalid register integer: ${t}`);return n}function mm(t){const e=t.split(/[\s,]+/).map(n=>n.trim()).filter(Boolean).map(Bo);if(e.length===0)throw new Error("At least one register value is required");return e}function ha(t){return`0x${(t>>>0).toString(16).padStart(8,"0")} (${t>>>0})`}async function vc(t,e,n){const s=await fetch(t,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)});if(!s.ok)throw new Error(`${n}: ${s.status}`);return await s.json()}function gm(t){async function e(){const s=Bo(t.readAddr.value),i=Math.max(1,Math.min(64,Number(t.readLength.value))),a=await vc("/api/register/read",{addr:s,length:i},"Register read failed");t.status.textContent=`read ${a.length} word${a.length===1?"":"s"}`,t.output.value=a.values.map((o,l)=>`${ha(s+l*4)}: ${ha(o)}`).join(`
`)}async function n(){const s=Bo(t.writeAddr.value),i=mm(t.writeValues.value),a=await vc("/api/register/write",{addr:s,values:i},"Register write failed");t.status.textContent=`wrote ${a.count} word${a.count===1?"":"s"}`,t.output.value=i.map((o,l)=>`${ha(s+l*4)} <= ${ha(o)}`).join(`
`)}return t.readButton.addEventListener("click",()=>{e().catch(s=>{t.status.textContent=s.message})}),t.writeButton.addEventListener("click",()=>{n().catch(s=>{t.status.textContent=s.message})}),{read:e,write:n}}const Su="pyrpl-websocket.workspace.v1",ku="tabs",vm=2,xr=3;function qo(){const t=Object.fromEntries(Rt.map(e=>[e.id,{enabled:e.defaultEnabled,splitSizes:e.defaultSplitSizes}]));return{activePanelId:Gs(t),layoutMode:ku,splitPanelIds:Gs(t)?[Gs(t)]:[],workspaceSplitSizes:ms([],1),panels:t}}function xm(){let t=null;try{t=JSON.parse(window.localStorage.getItem(Su)??"")}catch{return qo()}return Mu(t)}function Mu(t){if(!t||typeof t!="object")return qo();const e=t,s={...qo().panels};for(const o of Rt){const l=e.panels?.[o.id];s[o.id]={enabled:typeof l?.enabled=="boolean"?l.enabled:s[o.id].enabled,splitSizes:o.defaultSplitSizes?Au(l?.splitSizes,o.defaultSplitSizes):void 0}}const i=e.activePanelId&&s[e.activePanelId]?.enabled?e.activePanelId:Gs(s),a=Cu(Array.isArray(e.splitPanelIds)?e.splitPanelIds:br(s).slice(0,vm),s,i);return{activePanelId:i,layoutMode:Pu(e.layoutMode),splitPanelIds:a,workspaceSplitSizes:ms(e.workspaceSplitSizes,Math.max(1,a.length)),panels:s}}function Eu(t){window.localStorage.setItem(Su,JSON.stringify(t))}function Gs(t){return br(t)[0]??null}function br(t){return Rt.filter(e=>t[e.id]?.enabled).map(e=>e.id)}function Cu(t,e,n=Gs(e)){const s=br(e),i=Array.isArray(t)?t:[],a=[];for(const o of i)if(typeof o=="string"&&s.includes(o)&&!a.includes(o)&&a.push(o),a.length===xr)return a;return a.length>0?a:n&&s.includes(n)?[n]:s.slice(0,1)}function Pu(t){return t==="tabs"||t==="split-horizontal"||t==="split-vertical"?t:ku}function Au(t,e=fm("scope").defaultSplitSizes??[28,72]){if(Array.isArray(t)&&t.length===2){const n=Number(t[0]),s=Number(t[1]);if(Number.isFinite(n)&&Number.isFinite(s)&&n>=15&&s>=35){const i=n+s;return[Math.round(n/i*1e3)/10,Math.round(s/i*1e3)/10]}}return[...e]}function ms(t,e){const n=Array.from({length:e},()=>Math.round(100/e*10)/10);if(!Array.isArray(t)||t.length!==e)return n;const s=t.map(Number);if(s.some(a=>!Number.isFinite(a)||a<10))return n;const i=s.reduce((a,o)=>a+o,0);return i<=0?n:s.map(a=>Math.round(a/i*1e3)/10)}const Wi=new dm;Wi.installFetchHeaders();const bm=2;function x(t){const e=document.querySelector(t);if(!e)throw new Error(`Missing UI element ${t}`);return e}const wm=x("#app");wm.innerHTML=`
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
`;const zu=document.createElement("style");zu.textContent=`
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
`;document.head.appendChild(zu);const ym=x("#scope-plot");x("#scope-panel-content");const wr=x("#scope-controls-pane"),_u=x("#scope-plot-pane");x("#spectrum-panel-content");const Lu=x("#spectrum-controls-pane"),Fu=x("#spectrum-plot-pane"),da=x("#panel-menu"),Sm=x("#workspace"),fa=x("#workspace-tabs"),Vo=x("#workspace-panels"),Tu=x("#scope-panel"),km=x("#asg-panel"),Mm=x("#pid-panel"),Em=x("#iq-panel"),Cm=x("#iir-panel"),Pm=x("#trig-panel"),Am=x("#pwm-panel"),Nu=x("#spectrumanalyzer-panel"),zm=x("#networkanalyzer-panel"),Iu=x("#curveviewer-panel"),_m=x("#pyrplconfig-panel"),Ru=x("#lockbox-panel"),Lm=x("#housekeeping-panel"),Fm=x("#telemetry-panel"),Tm=x("#registers-panel"),gs={scope:Tu,asg:km,pid:Mm,iq:Em,iir:Cm,trig:Pm,pwm:Am,spectrumanalyzer:Nu,networkanalyzer:zm,curveviewer:Iu,pyrplconfig:_m,lockbox:Ru,housekeeping:Lm,telemetry:Fm,registers:Tm},Nm=x("#empty-workspace"),Zt=x("#status"),ft=x("#connect-scope"),mn=x("#single-frame"),Li=x("#stop-scope"),yr=x("#scope-current-average"),Im=x("#save-curve"),vs=x("#scope-curve-name"),Rm=x("#zoom-out"),$m=x("#zoom-in"),Om=x("#zoom-y-out"),Dm=x("#zoom-y-in"),Bm=x("#pan-left"),qm=x("#pan-right"),Vm=x("#pan-up"),Ym=x("#pan-down"),Hm=x("#zoom-reset"),cn=x("#show-ch1"),un=x("#show-ch2"),ai=x("#scope-input1"),oi=x("#scope-input2"),Bn=x("#scope-trigger"),jm=x("#scope-trigger-mode"),Vi=x("#scope-trigger-normal"),qn=x("#scope-trigger-rolling"),Mn=x("#scope-duration"),ri=x("#scope-average"),xs=x("#scope-xy-mode"),bs=x("#scope-math-active"),Vn=x("#scope-math-formula"),En=x("#scope-trace-average"),Yn=x("#scope-trigger-delay"),Hn=x("#scope-threshold"),jn=x("#scope-hysteresis"),kt=x("#scope-state-select"),mi=x("#scope-state-name"),$u=x("#scope-state-save"),Ou=x("#scope-state-load"),Du=x("#scope-state-delete"),Oi=x("#register-status"),ne=x("#module-status"),Wn=x("#hk-status"),Wm=x("#telemetry-refresh"),xc=x("#sampler-grid"),Bu=x("#sampler-status"),Yo=x("#sampler-stats-signal"),Um=x("#sampler-stats-duration"),Ho=x("#sampler-stats-run"),jo=x("#sampler-stats-output"),Ba=x("#ams-status"),Ks=[0,1,2,3].map(t=>x(`#ams-dac${t}`)),Co=new Map,wa=x("#hk-led"),Xm=x("#hk-refresh"),bc=x("#hk-expansion-grid"),Gm=x("#pid-modules"),Km=x("#iq-modules"),Zm=x("#iir-modules"),Jm=x("#trig-modules"),Qm=x("#pwm-modules"),eg=x("#spectrum-modules"),tg=x("#spectrum-plot"),Qt=x("#spectrum-status"),gn=x("#spectrum-single"),St=x("#spectrum-run"),Fi=x("#spectrum-stop"),qu=x("#spectrum-current-average"),ng=x("#spectrum-save-curve"),Yi=x("#spectrum-curve-name"),sg=x("#spectrum-zoom-out"),ig=x("#spectrum-zoom-in"),ag=x("#spectrum-zoom-y-out"),og=x("#spectrum-zoom-y-in"),rg=x("#spectrum-pan-left"),lg=x("#spectrum-pan-right"),cg=x("#spectrum-pan-up"),ug=x("#spectrum-pan-down"),pg=x("#spectrum-zoom-reset"),ws=new lm(x("#network-controls"),x("#network-magnitude-plot"),x("#network-phase-plot"),x("#network-status"),x("#network-single"),x("#network-run"),x("#network-stop"),x("#network-save"),x("#network-reset")),li=new um(Iu,x(".curve-viewer-list-pane"),x(".curve-viewer-plot-pane"),x(".curve-viewer-params-pane"),x("#curve-viewer-select"),x("#curve-viewer-name"),x("#curve-viewer-params"),x("#curve-viewer-status"),x("#curve-viewer-save-params"),x("#curve-viewer-delete"),x("#curve-viewer-refresh")),Cn=new sm({root:Ru,classSelect:x("#lockbox-class"),status:x("#lockbox-status"),actions:x("#lockbox-actions"),inputs:x("#lockbox-inputs"),outputs:x("#lockbox-outputs"),stages:x("#lockbox-stages"),addStage:x("#lockbox-add-stage"),inputPlot:x("#lockbox-input-plot"),outputPlot:x("#lockbox-output-plot"),inputPlotSelect:x("#lockbox-input-plot-select"),outputPlotSelect:x("#lockbox-output-plot-select")}),hg=new pm({file:x("#config-file"),module:x("#config-module"),text:x("#config-text"),refresh:x("#config-refresh"),save:x("#config-save"),status:x("#config-status")}),wc=x("#session-line"),Zs=x("#control-status"),ga=x("#take-control"),yc=Zs.parentElement;gm({readAddr:x("#register-read-addr"),readLength:x("#register-read-length"),readButton:x("#register-read"),writeAddr:x("#register-write-addr"),writeValues:x("#register-write-values"),writeButton:x("#register-write"),status:Oi,output:x("#register-output")});const Vu=["asg0","asg1"],ys={asg0:kc("asg0"),asg1:kc("asg1")},dg={pid:["pid0","pid1","pid2"],iq:["iq0","iq1","iq2"],iir:["iir"],trig:["trig"],pwm:["pwm0","pwm1"],spectrumanalyzer:["spectrumanalyzer"]},fg={pid:Gm,iq:Km,iir:Zm,trig:Jm,pwm:Qm,spectrumanalyzer:eg},Pn=new Map,mg=[ai,oi,Bn,Vi,qn,Mn,ri,xs,bs,Vn,En,Yn,Hn,jn,kt,mi,$u,Ou,Du,vs];let U=new Wf(ym,t=>{Zt.textContent=t},t=>{yr.textContent=`${t} / ${En.value||"1"}`}),be=new Gf(tg,t=>{Qt.textContent=t},t=>{const e=Pn.get("spectrumanalyzer")?.inputs.get("trace_average");qu.textContent=`${t} / ${e?.value||"1"}`}),It=null,Hs=null;const Sc=new Da(()=>ap());let Yu=0,bn="stopped",ps="stopped",A=xm(),Hu=null,ya=null,Sa=null,ka=null,Wo=null,Uo="";function Xn(t){Eu(t),fetch("/api/workspace",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspace:t})}).catch(()=>{})}async function gg(){const t=await fetch("/api/workspace");if(!t.ok)return;const e=await t.json();e.workspace&&typeof e.workspace=="object"?(A=Mu(e.workspace),Eu(A)):Xn(A)}function vg(){window.pyrplScope={getFrameSequence:()=>U.getFrameSequence(),getSampleCount:()=>U.getSampleCount(),getXRange:()=>U.getXRange(),getYRange:()=>U.getYRange(),getScopeTimeLabels:()=>U.getFormattedTimeLabelsForCurrentRange(),isChannelVisible:t=>U.getChannelVisible(t),getEventCount:()=>Yu,getTraceAverage:()=>U.getTraceAverage(),getRunningState:()=>bn,isPanelEnabled:t=>A.panels[t]?.enabled??!1,getScopeSplitSizes:()=>A.panels.scope.splitSizes??[28,72],getWorkspaceLayoutMode:()=>A.layoutMode,getWorkspaceSplitSizes:()=>A.workspaceSplitSizes,getWorkspaceSplitPanelIds:()=>A.splitPanelIds,getActivePanelId:()=>A.activePanelId,getCsvLineCount:()=>U.exportCsv().trimEnd().split(`
`).length,getDisplayedStats:()=>U.getDisplayedStats(),getDisplayedDataFingerprint:()=>U.getDisplayedDataFingerprint(),getScopeMathStats:()=>U.getMathStats(),getScopeXyStats:()=>U.getXyStats(),moduleStatusText:()=>ne.textContent??"",statusText:()=>Zt.textContent??"",getSpectrumSeriesCount:()=>be.getSeriesCount(),getSpectrumBinCount:()=>be.getBinCount(),getSpectrumAverageCount:()=>be.getAverageCount(),getSpectrumXRange:()=>be.getXRange(),getSpectrumYRange:()=>be.getYRange(),getSpectrumCurveData:()=>be.getCurveData(),getIirXRange:()=>It?.getXRange()??null,getIirMagnitudeYRange:()=>It?.getMagnitudeYRange()??null,getIirPhaseYRange:()=>It?.getPhaseYRange()??null,getLockboxClassname:()=>Cn.getClassname(),getLockboxStageCount:()=>Cn.getStageCount()}}function Nn(t,e){return`#${t}-${e.replaceAll("_","-")}`}function kc(t){return{status:x(`#${t}-status`),waveform:x(Nn(t,"waveform")),frequency:x(Nn(t,"frequency")),amplitude:x(Nn(t,"amplitude")),offset:x(Nn(t,"offset")),triggerSource:x(Nn(t,"trigger_source")),outputDirect:x(Nn(t,"output_direct")),startPhase:x(Nn(t,"start_phase")),cyclesPerBurst:x(Nn(t,"cycles_per_burst")),setup:x(`#${t}-setup`),trigger:x(`#${t}-trigger`),off:x(`#${t}-off`)}}function gi(){Sm.classList.toggle("is-split-workspace",A.layoutMode!=="tabs"),xg(),bg();const t=qa(),e=A.layoutMode==="tabs"?[]:A.splitPanelIds,n=A.layoutMode!=="tabs"&&e.length>0,s=n?e:A.activePanelId?[A.activePanelId]:[],i=new Set(s),a=t.length>0;Vo.className=`workspace-panels ${n?`is-split ${A.layoutMode==="split-horizontal"?"is-horizontal":"is-vertical"}`:"is-tabs"}`;for(const[o,l]of Object.entries(gs))l.hidden=!i.has(o);wg(s),Nm.hidden=a,n&&s.length>1?Eg(s):ju(),i.has("scope")?(yg(),window.requestAnimationFrame(()=>U.refreshLayout())):Sg(),i.has("spectrumanalyzer")?(kg(),window.requestAnimationFrame(()=>be.refreshLayout())):Mg(),i.has("lockbox")&&window.requestAnimationFrame(()=>Cn.refreshLayout()),i.has("networkanalyzer")&&window.requestAnimationFrame(()=>ws.refreshLayout()),i.has("curveviewer")&&window.requestAnimationFrame(()=>li.refreshLayout())}function qa(){return Rt.filter(t=>A.panels[t.id]?.enabled).map(t=>t.id)}function Sr(t,e,n,s){const i=Rt.filter(u=>t[u.id]?.enabled).map(u=>u.id),a=Math.min(xr,i.length),o=Math.min(Math.max(1,n),a);if(o===0)return[];const l=Cu(e,t,s);for(const u of i){if(l.length>=o)break;l.includes(u)||l.push(u)}return l.slice(0,o)}function xg(){da.textContent="";for(const i of Rt){const a=document.createElement("label");a.className="menu-check";const o=document.createElement("input");o.id=`panel-${i.id}-enabled`,o.type="checkbox",o.checked=A.panels[i.id]?.enabled??!1,o.addEventListener("change",()=>{o.closest("details")?.removeAttribute("open"),Pg(i.id,o.checked).catch(u=>{ne.textContent=u.message,Oi.textContent=u.message})});const l=document.createElement("span");l.textContent=i.title,a.append(o,l),da.appendChild(a)}const t=document.createElement("label");t.className="menu-field";const e=document.createElement("span");e.textContent="Layout";const n=document.createElement("select");n.id="workspace-layout-mode";const s=[["tabs","Tabs"],["split-horizontal","Side by Side"],["split-vertical","Stacked"]];for(const[i,a]of s){const o=document.createElement("option");o.value=i,o.textContent=a,n.appendChild(o)}if(n.value=A.layoutMode,n.addEventListener("change",()=>{Lg(Pu(n.value)).catch(i=>{ne.textContent=i.message,Oi.textContent=i.message})}),t.append(e,n),da.appendChild(t),A.layoutMode!=="tabs"){const i=qa(),a=document.createElement("label");a.className="menu-field";const o=document.createElement("span");o.textContent="Panels";const l=document.createElement("select");l.id="workspace-pane-count";const u=Math.min(xr,i.length);for(let d=1;d<=u;d+=1){const v=document.createElement("option");v.value=String(d),v.textContent=String(d),l.appendChild(v)}l.value=String(Math.min(Math.max(1,A.splitPanelIds.length),u)),l.addEventListener("change",()=>{zg(Number(l.value)).catch(d=>{ne.textContent=d.message,Oi.textContent=d.message})}),a.append(o,l),da.appendChild(a)}}function bg(){if(fa.textContent="",fa.hidden=A.layoutMode!=="tabs",!fa.hidden)for(const t of Rt){if(!A.panels[t.id]?.enabled)continue;const e=document.createElement("button");e.className=`workspace-tab${A.activePanelId===t.id?" is-active":""}`,e.type="button",e.textContent=t.title,e.addEventListener("click",()=>{Ag(t.id).catch(n=>{ne.textContent=n.message})}),fa.appendChild(e)}}function wg(t){for(const n of Object.values(gs))n.querySelector(".workspace-pane-selector")?.remove();if(A.layoutMode==="tabs")return;const e=qa();for(const[n,s]of t.entries()){const i=gs[s].querySelector(".panel-header");if(!i)continue;const a=document.createElement("label");a.className="workspace-pane-selector";const o=document.createElement("span");o.textContent="Panel";const l=document.createElement("select");l.id=`workspace-pane-select-${n}`,l.value=s;for(const u of e){const d=document.createElement("option");d.value=u,d.textContent=Rt.find(v=>v.id===u)?.title??u,d.disabled=u!==s&&t.includes(u),l.appendChild(d)}l.value=s,l.addEventListener("change",()=>{_g(n,l.value).catch(u=>{ne.textContent=u.message,Oi.textContent=u.message})}),a.append(o,l),i.appendChild(a)}}function yg(){ya||Tu.hidden||(ya=ji([wr,_u],{direction:"vertical",sizes:A.panels.scope.splitSizes,minSize:[132,260],gutterSize:8,snapOffset:24,onDrag:()=>U.refreshLayout(),onDragEnd:t=>{A={...A,panels:{...A.panels,scope:{...A.panels.scope,splitSizes:Au(t)}}},Xn(A),U.refreshLayout()}}))}function Sg(){ya?.destroy(),ya=null,wr.removeAttribute("style"),_u.removeAttribute("style")}function kg(){Sa||Nu.hidden||(Sa=ji([Lu,Fu],{direction:"vertical",sizes:[32,68],minSize:[96,220],gutterSize:8,snapOffset:16,elementStyle:(t,e)=>({height:`calc(${e}% - 4px)`}),gutterStyle:()=>({height:"8px"}),onDrag:()=>be.refreshLayout(),onDragEnd:()=>be.refreshLayout()}))}function Mg(){Sa?.destroy(),Sa=null,Lu.removeAttribute("style"),Fu.removeAttribute("style")}function Eg(t){const e=t.join("|");ka&&Wo===A.layoutMode&&Uo===e||(ju(),Cg(t),Wo=A.layoutMode,Uo=e,ka=ji(t.map(n=>gs[n]),{direction:A.layoutMode==="split-horizontal"?"horizontal":"vertical",sizes:ms(A.workspaceSplitSizes,t.length),minSize:A.layoutMode==="split-horizontal"?220:140,gutterSize:8,snapOffset:24,elementStyle:(n,s,i)=>({flexBasis:`calc(${s}% - ${i}px)`}),gutterStyle:(n,s)=>({flexBasis:`${s}px`}),onDrag:()=>{U.refreshLayout(),be.refreshLayout(),Cn.refreshLayout(),ws.refreshLayout(),li.refreshLayout()},onDragEnd:n=>{A={...A,workspaceSplitSizes:ms(n,t.length)},Xn(A),U.refreshLayout(),be.refreshLayout(),Cn.refreshLayout(),ws.refreshLayout(),li.refreshLayout()}}))}function Cg(t){const e=new Set(t);for(const n of t)Vo.appendChild(gs[n]);for(const n of Rt)e.has(n.id)||Vo.appendChild(gs[n.id])}function ju(){ka?.destroy(),ka=null,Wo=null,Uo="";for(const t of Object.values(gs))t.removeAttribute("style")}async function Pg(t,e){const n=A.panels[t],s={...A.panels,[t]:{...n,enabled:e}},i=e&&A.activePanelId===null?t:!e&&A.activePanelId===t?Gs(s):A.activePanelId,a=Math.min(Math.max(1,A.splitPanelIds.length),Rt.filter(l=>s[l.id]?.enabled).length),o=Sr(s,A.splitPanelIds,a,i);if(A={...A,activePanelId:i,splitPanelIds:o,workspaceSplitSizes:ms(A.workspaceSplitSizes,Math.max(1,o.length)),panels:s},Xn(A),gi(),t==="scope"&&!e){Va("Scope panel disabled"),Jt("stop").catch(l=>{ne.textContent=l.message});return}t==="scope"&&e&&cs("scope")&&await Wu(),t==="spectrumanalyzer"&&!e&&(yn("Spectrum panel disabled"),wn("stop").catch(l=>{Qt.textContent=l.message}))}async function Ag(t){A.panels[t]?.enabled&&(A={...A,activePanelId:t},Xn(A),gi(),t==="scope"&&window.requestAnimationFrame(()=>U.refreshLayout()),t==="spectrumanalyzer"&&window.requestAnimationFrame(()=>be.refreshLayout()),t==="lockbox"&&window.requestAnimationFrame(()=>Cn.refreshLayout()),t==="networkanalyzer"&&window.requestAnimationFrame(()=>ws.refreshLayout()),t==="curveviewer"&&window.requestAnimationFrame(()=>li.refreshLayout()))}async function zg(t){const e=Sr(A.panels,A.splitPanelIds,t,A.activePanelId);A={...A,splitPanelIds:e,workspaceSplitSizes:ms(A.workspaceSplitSizes,Math.max(1,e.length))},Xn(A),gi()}async function _g(t,e){if(!A.panels[e]?.enabled||t<0||t>=A.splitPanelIds.length)return;const n=[...A.splitPanelIds],s=n.indexOf(e);s>=0?[n[t],n[s]]=[n[s],n[t]]:n[t]=e,A={...A,splitPanelIds:n},Xn(A),gi()}function cs(t){return A.layoutMode==="tabs"?A.activePanelId===t:A.splitPanelIds.includes(t)}async function Lg(t){const e=A.layoutMode==="tabs"&&t!=="tabs"?Sr(A.panels,A.splitPanelIds,Math.min(bm,qa().length),A.activePanelId):A.splitPanelIds;A={...A,layoutMode:t,splitPanelIds:e,workspaceSplitSizes:ms(A.workspaceSplitSizes,Math.max(1,e.length))},Xn(A),gi(),cs("scope")&&window.requestAnimationFrame(()=>U.refreshLayout()),cs("lockbox")&&window.requestAnimationFrame(()=>Cn.refreshLayout()),cs("networkanalyzer")&&window.requestAnimationFrame(()=>ws.refreshLayout()),cs("curveviewer")&&window.requestAnimationFrame(()=>li.refreshLayout())}async function Wu(){if(await Qg(),!A.panels.scope.enabled||!cs("scope")){Va("Scope panel disabled");return}Hu?.fake&&(await Jt("continuous"),Hi())}function kr(t){bn=t,Uu(t)}function Uu(t){const e=Er();t==="running_continuous"?(ft.textContent="Pause",ft.disabled=!1,mn.textContent="Run single",mn.disabled=!0,Li.disabled=!1):t==="running_single"?(ft.textContent="Run continuous",ft.disabled=!0,mn.textContent="Pause",mn.disabled=!1,Li.disabled=!1):t==="paused_single"||t==="paused_continuous"?(ft.textContent="Resume continuous",ft.disabled=!1,mn.textContent="Resume single",mn.disabled=e,Li.disabled=!1):(ft.textContent="Run continuous",ft.disabled=!1,mn.textContent="Run single",mn.disabled=e,Li.disabled=!0)}function Fg(t){ps=t,t==="running_continuous"?(St.textContent="Pause",St.disabled=!1,gn.textContent="Run single",gn.disabled=!0,Fi.disabled=!1):t==="running_single"?(St.textContent="Run continuous",St.disabled=!0,gn.textContent="Pause",gn.disabled=!1,Fi.disabled=!1):t==="paused_single"||t==="paused_continuous"?(St.textContent="Resume continuous",St.disabled=!1,gn.textContent="Resume single",gn.disabled=!1,Fi.disabled=!1):(St.textContent="Run continuous",St.disabled=!1,gn.textContent="Run single",gn.disabled=!1,Fi.disabled=!0)}function Hi(){ft.dataset.connected!=="true"&&(U.connect(),ft.dataset.connected="true")}function Va(t="Disconnected"){U.close(),ft.dataset.connected="false",Zt.textContent=t}async function Xu(){ft.dataset.connected==="true"&&(await Jt("stop"),Va("Scope stopped: Spectrum owns the scope resource"))}async function Jt(t){const e=await fetch(`/api/modules/scope/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Scope action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return s.running_state&&kr(s.running_state),["single","continuous","resume_single","resume_continuous"].includes(t)&&U.reconnect(),ne.textContent=`${t}: ${s.running_state??"ok"}`,n}async function Tg(){try{const e=await(await fetch("/api/session")).json(),n=e.fake?"fake hardware":e.settings.hostname;return wc.textContent=`Session: ${n} | reads ${e.reads} | writes ${e.writes}`,e.scope?.running_state&&kr(e.scope.running_state),{fake:!!e.fake}}catch{return wc.textContent="Session unavailable",null}}function Gu(t){return typeof t=="number"?t<.001?`${(t*1e6).toPrecision(4)} us`:t<1?`${(t*1e3).toPrecision(4)} ms`:`${t.toPrecision(4)} s`:t}function $n(t,e){return Array.isArray(e)?e.join(", "):typeof e=="boolean"?String(e):typeof e=="number"&&(t==="duration"||t==="trigger_delay")?Gu(e):typeof e=="number"?Number.isInteger(e)?String(e):String(Number(e.toPrecision(6))):e}function On(t,e){t.textContent="";for(const n of e.options??[]){const s=document.createElement("option");s.value=String(n),s.textContent=e.option_labels?.[String(n)]??Gu(n),t.appendChild(s)}t.value=String(e.value)}function Mr(t,e){t==="input1"?ai.value=String(e):t==="input2"?oi.value=String(e):t==="trigger_source"?(Bn.value=String(e),Ti()):t==="duration"?(Mn.value=String(e),Ti(),Ma()):t==="average"?ri.checked=!!e:t==="ch1_active"?(cn.checked=!!e,U.setChannelVisible(1,cn.checked)):t==="ch2_active"?(un.checked=!!e,U.setChannelVisible(2,un.checked)):t==="ch_math_active"?(bs.checked=!!e,hs()):t==="math_formula"?(document.activeElement!==Vn&&(Vn.value=String(e)),hs()):t==="xy_mode"?(xs.checked=!!e,hs()):t==="rolling_mode"?(qn.checked=!!e,Vi.checked=!e,Ti(),Ma()):t==="trace_average"?(En.value=String(e),U.setTraceAverage(Number(e)),yr.textContent=`0 / ${e}`):t==="trigger_delay"?(document.activeElement!==Yn&&(Yn.value=String(e)),Ti()):t==="threshold"?document.activeElement!==Hn&&(Hn.value=String(e)):t==="hysteresis"?document.activeElement!==jn&&(jn.value=String(e)):t==="curve_name"&&document.activeElement!==vs&&(vs.value=String(e))}function hs(){U.setDisplaySettings({xyMode:xs.checked,mathActive:bs.checked,mathFormula:Vn.value})}function Er(){return qn.checked&&Number(Mn.value)>.1}function Ma(){const t=Number(Mn.value)>.1;jm.disabled=!t;const e=Er();Bn.disabled=e,Hn.disabled=e,jn.disabled=e,Uu(bn)}function Ti(){U.setTimeSettings({duration:Number(Mn.value),triggerDelay:Number(Yn.value||0),triggerSource:Bn.value,rollingMode:Er()})}function Gt(t,e){t.value=String(e.value),e.min!==void 0&&(t.min=String(e.min)),e.max!==void 0&&(t.max=String(e.max)),e.step!==void 0&&(t.step=String(e.step))}function Ng(t){for(const[e,n]of Object.entries(t))n!=null&&Mr(e,n);Ku(t)}function Ku(t){t.running_state&&kr(t.running_state),t.current_avg!==void 0&&(yr.textContent=`${t.current_avg} / ${En.value||"1"}`),"owner"in t&&Ig(typeof t.owner=="string"?t.owner:null)}function Ig(t){wr.classList.toggle("is-owned",t!==null);for(const e of mg)e.disabled=t!==null;t===null&&Ma(),t&&(ne.textContent=`scope occupied by ${t}`)}async function nt(t,e){const n=await Ui("scope",t,e);["input1","input2","duration","average","trigger_source","trigger_delay","threshold","hysteresis","rolling_mode"].includes(t)&&U.reconnect(),Mr(t,n.value),ne.textContent=`${t} = ${$n(t,n.value)}`}async function Ui(t,e,n){const s=await fetch(`/api/modules/${t}/attributes/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:n})});if(!s.ok)throw new Error(`Failed to set ${t}.${e}: ${s.status}`);return s.json()}async function Rg(){const t=await fetch("/api/modules/scope/attributes");if(!t.ok)throw new Error(`Scope controls unavailable: ${t.status}`);const e=await t.json(),n=new Map(e.attributes.map(s=>[s.name,s]));On(ai,n.get("input1")),On(oi,n.get("input2")),On(Bn,n.get("trigger_source")),On(Mn,n.get("duration")),ri.checked=!!n.get("average")?.value,cn.checked=!!(n.get("ch1_active")?.value??!0),U.setChannelVisible(1,cn.checked),un.checked=!!(n.get("ch2_active")?.value??!0),U.setChannelVisible(2,un.checked),bs.checked=!!(n.get("ch_math_active")?.value??!1),Vn.value=String(n.get("math_formula")?.value??"ch1 * ch2"),xs.checked=!!(n.get("xy_mode")?.value??!1),qn.checked=!!(n.get("rolling_mode")?.value??!0),Vi.checked=!qn.checked,Gt(En,n.get("trace_average")),Gt(Yn,n.get("trigger_delay")),Gt(Hn,n.get("threshold")),Gt(jn,n.get("hysteresis")),vs.value=String(n.get("curve_name")?.value??"scope curve"),U.setTraceAverage(Number(En.value)),hs(),Ti(),Ma(),ne.textContent="Scope controls ready"}async function $g(){await Promise.all(Vu.map(t=>Og(t)))}async function Og(t){const e=await fetch(`/api/modules/${t}/attributes`);if(!e.ok)throw new Error(`${t} controls unavailable: ${e.status}`);const n=await e.json(),s=new Map(n.attributes.map(a=>[a.name,a])),i=ys[t];On(i.waveform,s.get("waveform")),Gt(i.frequency,s.get("frequency")),Gt(i.amplitude,s.get("amplitude")),Gt(i.offset,s.get("offset")),On(i.triggerSource,s.get("trigger_source")),On(i.outputDirect,s.get("output_direct")),Gt(i.startPhase,s.get("start_phase")),Gt(i.cyclesPerBurst,s.get("cycles_per_burst")),i.status.textContent=`${t} controls ready`}function Zu(t,e){for(const[n,s]of Object.entries(e))sp(s)&&Cr(t,n,s)}function Cr(t,e,n){const s=ys[t];e==="waveform"?s.waveform.value=String(n):e==="frequency"?s.frequency.value=String(n):e==="amplitude"?s.amplitude.value=String(n):e==="offset"?s.offset.value=String(n):e==="trigger_source"?s.triggerSource.value=String(n):e==="output_direct"?s.outputDirect.value=String(n):e==="start_phase"?s.startPhase.value=String(n):e==="cycles_per_burst"&&(s.cyclesPerBurst.value=String(n))}async function In(t,e,n){const s=await Ui(t,e,n);Cr(t,e,s.value),ys[t].status.textContent=`${e} = ${$n(e,s.value)}`}async function Po(t,e){const n=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!n.ok)throw new Error(`${t} action ${e} failed: ${n.status}`);const s=await n.json();Zu(t,s.state??{}),ys[t].status.textContent=`${e}: ok`}function Dg(){bc.textContent="";for(const t of["P","N"]){const e=document.createElement("section");e.className="housekeeping-bank";const n=document.createElement("h3");n.textContent=`Expansion ${t}`,e.appendChild(n);for(let s=0;s<8;s+=1){const i=document.createElement("div");i.className="housekeeping-pin";const a=`expansion_${t}${s}`,o=`${a}_output`,l=document.createElement("span");l.textContent=`${t}${s}`;const u=document.createElement("label"),d=document.createElement("input");d.type="checkbox",d.id=`hk-${a.replaceAll("_","-")}`,d.addEventListener("change",()=>{Xo(a,d.checked).catch(f=>{Wn.textContent=f.message})}),u.append(d,document.createTextNode(" Value"));const v=document.createElement("label"),m=document.createElement("input");m.type="checkbox",m.id=`hk-${o.replaceAll("_","-")}`,m.addEventListener("change",()=>{Xo(o,m.checked).catch(f=>{Wn.textContent=f.message})}),v.append(m,document.createTextNode(" Output")),i.append(l,u,v),e.appendChild(i)}bc.appendChild(e)}}async function Ju(){const t=await fetch("/api/modules/hk/attributes");if(t.ok){const s=await t.json(),a=new Map(s.attributes.map(o=>[o.name,o])).get("led");a&&Gt(wa,a)}const e=await fetch("/api/modules/hk");if(!e.ok)throw new Error(`Housekeeping controls unavailable: ${e.status}`);const n=await e.json();Qu(n.state??{}),Wn.textContent="Housekeeping controls ready"}function Qu(t){for(const[e,n]of Object.entries(t))sp(n)&&Pr(e,n)}function Pr(t,e){if(t==="led"){wa.value=String(e);return}const n=document.querySelector(`#hk-${t.replaceAll("_","-")}`);n&&(n.checked=!!e)}async function Xo(t,e){const n=await Ui("hk",t,e);Pr(t,n.value),Wn.textContent=`${t} = ${$n(t,n.value)}`}async function ep(){const[t,e]=await Promise.all([fetch("/api/modules/sampler"),fetch("/api/modules/ams")]);if(!t.ok||!e.ok)throw new Error("Sampler or AMS readback unavailable");const n=await t.json(),s=await e.json();Bg(n.state??{}),qg(s.state??{}),Bu.textContent="Sampler refreshed",Ba.textContent="AMS refreshed"}function Bg(t){if(Co.size===0){xc.textContent="",Yo.textContent="";for(const e of Object.keys(t)){const n=document.createElement("div");n.className="sampler-reading";const s=document.createElement("span");s.textContent=e;const i=document.createElement("output");i.dataset.signal=e,n.append(s,i),xc.appendChild(n),Co.set(e,i),Yo.add(new Option(e,e))}}for(const[e,n]of Object.entries(t))if(typeof n=="number"){const s=Co.get(e);s&&(s.value=Ni(n))}}function qg(t){Ks.forEach((e,n)=>{const s=t[`dac${n}`];typeof s=="number"&&(e.value=s.toFixed(6))})}async function Vg(){Ho.disabled=!0,jo.value="Acquiring...";try{const t=await fetch("/api/sampler/stats",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({signal:Yo.value,duration:Number(Um.value)})});if(!t.ok)throw new Error(`Sampler statistics failed: ${t.status}`);const e=await t.json();jo.value=`mean ${Ni(e.mean)} | std ${Ni(e.stddev)} | min ${Ni(e.min)} | max ${Ni(e.max)} | n ${e.count}`}finally{Ho.disabled=!1}}async function tp(t){const e=await Ui("ams",`dac${t}`,Number(Ks[t].value));Ks[t].value=Number(e.value).toFixed(6),Ba.textContent=`DAC${t} = ${Ks[t].value} V`}function Ni(t){if(!Number.isFinite(t))return"--";const e=Math.abs(t);return e!==0&&(e<1e-4||e>=1e4)?t.toExponential(5):t.toFixed(6)}async function Yg(){for(const[t,e]of Object.entries(dg)){const n=fg[t];t==="iir"&&It&&(It.destroy(),It=null),n.textContent="",await Promise.all(e.map(s=>Hg(n,s)))}}async function Hg(t,e){const[n,s,i]=await Promise.all([fetch(`/api/modules/${e}/attributes`),fetch(`/api/modules/${e}/actions`),fetch(`/api/modules/${e}`)]);if(!n.ok||!s.ok||!i.ok)throw new Error(`${e} controls unavailable`);const a=await n.json(),o=await s.json(),l=await i.json(),u=document.createElement("section");u.className="module-panel instrument-card",e==="iir"&&u.classList.add("iir-card"),u.dataset.module=e;const d=document.createElement("header");d.className="instrument-card-header";const v=document.createElement("h3");v.textContent=e.toUpperCase();const m=document.createElement("output");m.id=`${e}-status`,m.textContent=`${e} ready`,d.append(v,m);const f=document.createElement("div");f.className=e==="spectrumanalyzer"?"control-row generic-module-row spectrum-module-row":"control-row generic-module-row";const y={status:m,inputs:new Map,fields:new Map,actions:[],card:u,owner:null},P=e==="spectrumanalyzer"?Xg(a.attributes):a.attributes;for(const F of P){if(e==="iir"&&jg(F.name))continue;const L=Wg(e,F,m);y.inputs.set(F.name,L.input),y.fields.set(F.name,L.label),f.appendChild(L.label)}const O=e==="spectrumanalyzer"?[]:o.actions??[];for(const F of O){const L=document.createElement("button");L.type="button",L.textContent=F.label??F.name,L.addEventListener("click",()=>{Gg(e,F.name,m).catch(M=>{m.textContent=M.message})}),y.actions.push(L),f.appendChild(L)}if(Pn.set(e,y),u.append(d,f),e==="iir"){const F=document.createElement("section");F.className="iir-plot",u.appendChild(F),It=new tm(F,async(L,M)=>{await Us("iir",L,M,m)},L=>{m.textContent=L}),It.refresh().catch(L=>{m.textContent=L.message})}t.appendChild(u),Xi(e,l.state??{})}function jg(t){return t==="real_poles"||t==="real_zeros"||t==="complex_poles"||t==="complex_zeros"}function Wg(t,e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=t==="spectrumanalyzer"?Ug(e):e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");On(o,e),o.addEventListener("change",()=>{Us(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{Us(t,e.name,o.checked,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",Gt(o,e),o.addEventListener("change",()=>{Us(t,e.name,Number(o.value),n).catch(l=>{n.textContent=l.message})}),a=o}else{const o=document.createElement("input");o.type="text",o.value=np(e.value),o.addEventListener("change",()=>{Us(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}return e.readonly&&(a instanceof HTMLSelectElement?a.disabled=!0:a.readOnly=!0),a.id=`${t}-${e.name.replaceAll("_","-")}`,s.appendChild(a),{label:s,input:a}}function Ug(t){return t.name==="input"?"IQ Input":t.name==="center"?"IQ Center":t.name==="input1_baseband"?"BB Input 1":t.name==="input2_baseband"?"BB Input 2":t.name==="display_input1_baseband"||t.name==="display_input2_baseband"?"Show":t.name==="display_cross_amplitude"?"Cross":t.label}function Xg(t){const e=["baseband","display_input1_baseband","input1_baseband","display_input2_baseband","input2_baseband","input","center","acbandwidth","display_cross_amplitude","span","rbw","window","display_unit","trace_average"];return[...t].sort((n,s)=>{const i=e.indexOf(n.name),a=e.indexOf(s.name);return(i===-1?Number.MAX_SAFE_INTEGER:i)-(a===-1?Number.MAX_SAFE_INTEGER:a)})}async function Us(t,e,n,s){const i=await Ui(t,e,n);if(Ar(t,e,i.value),s.textContent=`${e} = ${$n(e,i.value)}`,t==="iir"&&It&&(await It.refresh(),e==="data_curve")){const a=await fetch("/api/modules/iir");if(a.ok){const o=await a.json();Xi("iir",o.state??{})}}}async function Gg(t,e,n){const s=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!s.ok)throw new Error(`${t} action ${e} failed: ${s.status}`);const i=await s.json();Xi(t,i.state??{}),t==="iir"&&It&&await It.refresh(),n.textContent=`${e}: ok`}function Xi(t,e){if(t==="spectrumanalyzer"){if(be.setSettings(e),Kg(e),typeof e.running_state=="string"&&Fg(e.running_state),typeof e.current_avg=="number"){const n=Pn.get("spectrumanalyzer")?.inputs.get("trace_average");qu.textContent=`${e.current_avg} / ${n?.value||"1"}`}document.activeElement!==Yi&&typeof e.curve_name=="string"&&(Yi.value=e.curve_name)}for(const[n,s]of Object.entries(e))n==="owner"?Zg(t,typeof s=="string"?s:null):Jg(s)&&Ar(t,n,s)}function Kg(t){const e=Pn.get("spectrumanalyzer");if(!e)return;const n=!!(t.baseband??!0),s=new Set(["input","center","acbandwidth"]),i=new Set(["input1_baseband","input2_baseband","display_input1_baseband","display_input2_baseband","display_cross_amplitude"]);for(const[a,o]of e.fields)o.hidden=n&&s.has(a)||!n&&i.has(a)}function Ar(t,e,n){const s=Pn.get(t)?.inputs.get(e);s&&(s instanceof HTMLInputElement&&s.type==="checkbox"?s.checked=!!n:s.value=np(n))}function Zg(t,e){const n=Pn.get(t);if(n){n.owner=e,n.card.classList.toggle("is-owned",e!==null);for(const s of n.inputs.values())s.disabled=e!==null;for(const s of n.actions)s.disabled=e!==null;e&&(n.status.textContent=`occupied by ${e}`)}}function Jg(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"||Array.isArray(t)&&t.every(e=>typeof e=="number"||typeof e=="string")}function np(t){return Array.isArray(t)?t.join(", "):String(t)}function sp(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"}function Mc(t){return typeof t=="string"&&Pn.has(t)}async function zr(){const t=await fetch("/api/modules/scope/states");if(!t.ok)return;const e=await t.json();ip(e.states??[])}function ip(t){const e=kt.value;kt.textContent="";const n=document.createElement("option");n.value="",n.textContent=t.length?"Choose state":"No saved states",kt.appendChild(n);for(const s of t){const i=document.createElement("option");i.value=s.name,i.textContent=s.name,kt.appendChild(i)}t.some(s=>s.name===e)?kt.value=e:t[0]&&(kt.value=t[0].name,mi.value=t[0].name)}function Ec(t){return t==="asg0"||t==="asg1"}function ap(){if(Hs&&Hs.readyState!==WebSocket.CLOSED)return;const t=window.location.protocol==="https:"?"wss:":"ws:",e=new WebSocket(`${t}//${window.location.host}/ws/events`);Hs=e,e.addEventListener("open",()=>{Hs===e&&Sc.connected()}),e.addEventListener("message",n=>{const s=JSON.parse(n.data);if(s.type==="control.changed"){op();return}if(s.type==="module.attribute.changed"){if(Yu+=1,s.module==="scope")Mr(s.attribute,s.value),ne.textContent=`${s.attribute} = ${$n(s.attribute,s.value)}`;else if(Ec(s.module)){const i=s.module;Cr(i,s.attribute,s.value),ys[i].status.textContent=`${s.attribute} = ${$n(s.attribute,s.value)}`}else if(s.module==="hk")Pr(s.attribute,s.value),Wn.textContent=`${s.attribute} = ${$n(s.attribute,s.value)}`;else if(Mc(s.module)){Ar(s.module,s.attribute,s.value);const i=Pn.get(s.module);i&&(i.status.textContent=`${s.attribute} = ${$n(s.attribute,s.value)}`)}return}if(s.type!=="module.attribute.changed"||s.module!=="scope"){if(s.type==="module.state.changed"&&s.module==="scope")Ku(s.state),s.state.trigger_test?ne.textContent=iv(s.state.trigger_test):ne.textContent=`${s.state.last_action}: ${s.state.running_state}`;else if(s.type==="module.state.changed"&&Ec(s.module)){const i=s.module;Zu(i,s.state??{}),ys[i].status.textContent=`${i} state updated`}else if(s.type==="module.state.changed"&&s.module==="hk")Qu(s.state??{}),Wn.textContent="Housekeeping state updated";else if(s.type==="module.state.changed"&&Mc(s.module)){Xi(s.module,s.state??{});const i=Pn.get(s.module);i&&!i.owner&&s.module!=="spectrumanalyzer"&&(i.status.textContent=`${s.module} state updated`)}else s.type==="module.state.changed"&&s.module==="lockbox"?Cn.applySchema(s.state).catch(i=>{ne.textContent=i.message}):s.type==="module.state.changed"&&s.module==="networkanalyzer"?ws.applyState(s.state??{}):s.type==="module.states.changed"&&s.module==="scope"&&(ip(s.states??[]),ne.textContent=`${s.states.length} saved state${s.states.length===1?"":"s"}`);return}}),e.addEventListener("close",()=>{Hs===e&&(Hs=null,Sc.schedule())})}function _r(t){yc.classList.remove("is-controller","is-observer","is-shared"),yc.classList.add(`is-${t.role}`),t.role==="shared"?(Zs.value="Shared control",ga.hidden=!0):t.role==="controller"?(Zs.value="You have control",ga.hidden=!0):(Zs.value=t.controller?.label?`Observer: ${t.controller.label} has control`:"Observer: control is available",ga.hidden=!1)}async function op(){try{_r(await Wi.refresh())}catch(t){Zs.value=t instanceof Error?t.message:"Control unavailable"}}async function Qg(){Zt.textContent="Loading one scope frame...";const t=await fetch(`/api/scope/frame?samples=${U.getSampleCount()}`);if(t.status===204){Zt.textContent="No trigger captured";return}if(!t.ok)throw new Error(`Scope frame request failed: ${t.status}`);const e=await t.arrayBuffer();U.close(),U.showFrame(e),ft.dataset.connected="false"}async function wn(t){const e=await fetch(`/api/modules/spectrumanalyzer/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Spectrum action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return Xi("spectrumanalyzer",n.state??{}),Qt.textContent=`${t}: ${s.running_state??"ok"}`,n}async function rp(t,e,n,s){const i=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:t,y:e,y_imag:s,params:n})});if(!i.ok)throw new Error(`Save curve failed: ${i.status}`)}async function ev(){const t=U.getCurveData();if(!t)throw new Error("No scope curve to save");const n=[[0,cn.checked],[1,un.checked]].filter(([,i])=>i),s={input1:ai.value,input2:oi.value,duration:Number(Mn.value),average:ri.checked,trigger_source:Bn.value,trigger_delay:Number(Yn.value),threshold:Number(Hn.value),hysteresis:Number(jn.value),ch1_active:cn.checked,ch2_active:un.checked,ch_math_active:bs.checked,math_formula:Vn.value,xy_mode:xs.checked,rolling_mode:qn.checked,trace_average:Number(En.value)};return await Promise.all(n.map(([i])=>rp(t.x,t.channels[i],{...s,name:`${vs.value||"scope curve"} ch${i+1}`,module:"scope",ch:i,curve_unit:"V"}))),n.length}async function tv(){const t=be.getCurveData();if(!t)throw new Error("No spectrum curve to save");return await Promise.all(t.series.map((e,n)=>rp(t.x,e.values,{...be.getCurveParameters(),name:`${Yi.value||"pyrpl spectrum"} ${e.label.toLowerCase()}`,module:"spectrumanalyzer",ch:e.label==="Cross"?"cross":n,curve_unit:t.unit},e.imaginary))),t.series.length}function Ea(){St.dataset.connected!=="true"&&(be.connect(),St.dataset.connected="true")}function yn(t="Spectrum stopped"){be.close(),St.dataset.connected="false",Qt.textContent=t}async function lp(){await wn("stop"),(St.dataset.connected==="true"||be.isConnected())&&yn("Spectrum stopped: Scope owns the scope resource")}async function nv(){await lp(),await Jt("single"),U.resetTraceAveraging(),Hi()}function sv(){return encodeURIComponent(Go())}function Go(){return(mi.value.trim()||kt.value||"default").trim()}function cp(){return(kt.value||mi.value.trim()||"default").trim()}function iv(t){const e=String(t.source??"unknown"),n=String(t.condition??"condition"),s=Number(t.hysteresis??0);return t.triggered?`triggered ${e} ${n} at sample ${t.index} (hys ${s})`:`no trigger: ${e} ${n} (hys ${s})`}async function av(){const t=await fetch(`/api/modules/scope/states/${sv()}/save`,{method:"POST"});if(!t.ok)throw new Error(`Save state failed: ${t.status}`);await zr(),kt.value=Go(),ne.textContent=`saved state ${Go()}`}async function ov(){const t=cp(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}/load`,{method:"POST"});if(!e.ok)throw new Error(`Load state failed: ${e.status}`);const n=await e.json();Ng(n.state),mi.value=t,ne.textContent=`loaded state ${t}`}async function rv(){const t=cp(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}`,{method:"DELETE"});if(!e.ok)throw new Error(`Delete state failed: ${e.status}`);await zr(),ne.textContent=`deleted state ${t}`}ft.addEventListener("click",()=>{(async()=>{try{bn==="running_continuous"?await Jt("pause"):bn==="paused_single"||bn==="paused_continuous"?(await Jt("resume_continuous"),Hi()):(await lp(),await Jt("continuous"),U.resetTraceAveraging(),Hi())}catch(t){ne.textContent=t instanceof Error?t.message:String(t)}})()});mn.addEventListener("click",()=>{(bn==="running_single"?Jt("pause"):bn==="paused_single"||bn==="paused_continuous"?Jt("resume_single").then(()=>Hi()):nv()).catch(e=>{Zt.textContent=e.message})});Li.addEventListener("click",()=>{Jt("stop").then(()=>{U.resetTraceAveraging(),Va()}).catch(t=>{Zt.textContent=t.message})});Im.addEventListener("click",()=>{Promise.all([Jt("save_curve"),ev()]).then(([,t])=>{U.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),ne.textContent=`saved ${t} curve${t===1?"":"s"}`}).catch(t=>{ne.textContent=t.message})});Rm.addEventListener("click",()=>U.zoom(1.8));$m.addEventListener("click",()=>U.zoom(.55));Om.addEventListener("click",()=>U.zoomY(1.8));Dm.addEventListener("click",()=>U.zoomY(.55));Bm.addEventListener("click",()=>U.panX(-.2));qm.addEventListener("click",()=>U.panX(.2));Vm.addEventListener("click",()=>U.panY(-.2));Ym.addEventListener("click",()=>U.panY(.2));Hm.addEventListener("click",()=>U.resetZoom());gn.addEventListener("click",()=>{(async()=>{try{ps==="running_single"?(await wn("pause"),yn("Spectrum paused")):ps==="paused_single"||ps==="paused_continuous"?(yn("Reconnecting spectrum stream"),await wn("resume_single"),Ea()):(await Xu(),yn("Starting spectrum acquisition"),be.resetAveraging(),await wn("single"),Ea())}catch(t){Qt.textContent=t instanceof Error?t.message:String(t)}})()});St.addEventListener("click",()=>{(async()=>{try{ps==="running_continuous"?(await wn("pause"),yn("Spectrum paused")):ps==="paused_single"||ps==="paused_continuous"?(yn("Reconnecting spectrum stream"),await wn("resume_continuous"),Ea()):(await Xu(),yn("Starting spectrum acquisition"),be.resetAveraging(),await wn("continuous"),Ea())}catch(t){Qt.textContent=t instanceof Error?t.message:String(t)}})()});Fi.addEventListener("click",()=>{wn("stop").then(()=>yn()).catch(t=>{Qt.textContent=t.message})});ng.addEventListener("click",()=>{tv().then(t=>{be.downloadCsv(`spectrum-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),Qt.textContent=`saved ${t} curve${t===1?"":"s"}`}).catch(t=>{Qt.textContent=t.message})});vs.addEventListener("change",()=>{nt("curve_name",vs.value).catch(t=>{ne.textContent=t.message})});Yi.addEventListener("change",()=>{Us("spectrumanalyzer","curve_name",Yi.value,Qt).catch(t=>{Qt.textContent=t.message})});sg.addEventListener("click",()=>be.zoom(1.8));ig.addEventListener("click",()=>be.zoom(.55));ag.addEventListener("click",()=>be.zoomY(1.8));og.addEventListener("click",()=>be.zoomY(.55));rg.addEventListener("click",()=>be.panX(-.2));lg.addEventListener("click",()=>be.panX(.2));cg.addEventListener("click",()=>be.panY(-.2));ug.addEventListener("click",()=>be.panY(.2));pg.addEventListener("click",()=>be.resetZoom());cn.addEventListener("change",()=>{U.setChannelVisible(1,cn.checked),nt("ch1_active",cn.checked).catch(t=>{ne.textContent=t.message,cn.checked=U.getChannelVisible(1)})});un.addEventListener("change",()=>{U.setChannelVisible(2,un.checked),nt("ch2_active",un.checked).catch(t=>{ne.textContent=t.message,un.checked=U.getChannelVisible(2)})});ai.addEventListener("change",()=>{nt("input1",ai.value).catch(t=>{ne.textContent=t.message})});oi.addEventListener("change",()=>{nt("input2",oi.value).catch(t=>{ne.textContent=t.message})});Bn.addEventListener("change",()=>{nt("trigger_source",Bn.value).catch(t=>{ne.textContent=t.message})});Vi.addEventListener("change",()=>{Vi.checked&&nt("rolling_mode",!1).catch(t=>{ne.textContent=t.message})});qn.addEventListener("change",()=>{qn.checked&&nt("rolling_mode",!0).catch(t=>{ne.textContent=t.message})});Mn.addEventListener("change",()=>{nt("duration",Number(Mn.value)).catch(t=>{ne.textContent=t.message})});ri.addEventListener("change",()=>{nt("average",ri.checked).catch(t=>{ne.textContent=t.message})});xs.addEventListener("change",()=>{hs(),nt("xy_mode",xs.checked).catch(t=>{ne.textContent=t.message})});bs.addEventListener("change",()=>{hs(),nt("ch_math_active",bs.checked).catch(t=>{ne.textContent=t.message})});Vn.addEventListener("change",()=>{hs(),nt("math_formula",Vn.value).catch(t=>{ne.textContent=t.message})});En.addEventListener("change",()=>{nt("trace_average",Number(En.value)).catch(t=>{ne.textContent=t.message})});Yn.addEventListener("change",()=>{nt("trigger_delay",Number(Yn.value)).catch(t=>{ne.textContent=t.message})});Hn.addEventListener("change",()=>{nt("threshold",Number(Hn.value)).catch(t=>{ne.textContent=t.message})});jn.addEventListener("change",()=>{nt("hysteresis",Number(jn.value)).catch(t=>{ne.textContent=t.message})});$u.addEventListener("click",()=>{av().catch(t=>{ne.textContent=t.message})});kt.addEventListener("change",()=>{kt.value&&(mi.value=kt.value)});Ou.addEventListener("click",()=>{ov().catch(t=>{ne.textContent=t.message})});Du.addEventListener("click",()=>{rv().catch(t=>{ne.textContent=t.message})});for(const t of Vu){const e=ys[t];e.waveform.addEventListener("change",()=>{In(t,"waveform",e.waveform.value).catch(n=>{e.status.textContent=n.message})}),e.frequency.addEventListener("change",()=>{In(t,"frequency",Number(e.frequency.value)).catch(n=>{e.status.textContent=n.message})}),e.amplitude.addEventListener("change",()=>{In(t,"amplitude",Number(e.amplitude.value)).catch(n=>{e.status.textContent=n.message})}),e.offset.addEventListener("change",()=>{In(t,"offset",Number(e.offset.value)).catch(n=>{e.status.textContent=n.message})}),e.triggerSource.addEventListener("change",()=>{In(t,"trigger_source",e.triggerSource.value).catch(n=>{e.status.textContent=n.message})}),e.outputDirect.addEventListener("change",()=>{In(t,"output_direct",e.outputDirect.value).catch(n=>{e.status.textContent=n.message})}),e.startPhase.addEventListener("change",()=>{In(t,"start_phase",Number(e.startPhase.value)).catch(n=>{e.status.textContent=n.message})}),e.cyclesPerBurst.addEventListener("change",()=>{In(t,"cycles_per_burst",Number(e.cyclesPerBurst.value)).catch(n=>{e.status.textContent=n.message})}),e.setup.addEventListener("click",()=>{Po(t,"setup").catch(n=>{e.status.textContent=n.message})}),e.trigger.addEventListener("click",()=>{Po(t,"trigger").catch(n=>{e.status.textContent=n.message})}),e.off.addEventListener("click",()=>{Po(t,"off").catch(n=>{e.status.textContent=n.message})})}wa.addEventListener("change",()=>{Xo("led",Number(wa.value)).catch(t=>{Wn.textContent=t.message})});Xm.addEventListener("click",()=>{Ju().catch(t=>{Wn.textContent=t.message})});Wm.addEventListener("click",()=>{ep().catch(t=>{Bu.textContent=t.message})});Ho.addEventListener("click",()=>{Vg().catch(t=>{jo.value=t.message})});Ks[2].addEventListener("change",()=>{tp(2).catch(t=>{Ba.textContent=t.message})});Ks[3].addEventListener("change",()=>{tp(3).catch(t=>{Ba.textContent=t.message})});async function lv(){try{_r(await Wi.initialize())}catch{await op()}if(Hu=await Tg(),Dg(),await Rg(),await zr(),await $g(),await Ju(),await ep(),await Yg(),await ws.initialize(),await li.load(),await hg.load().catch(t=>{x("#config-status").textContent=t.message}),await Cn.load(),ap(),await gg(),gi(),!A.activePanelId){Zt.textContent="No panel enabled";return}if(!cs("scope")){const t=A.layoutMode==="tabs"?A.activePanelId:A.splitPanelIds[0]??A.activePanelId;Zt.textContent=`${Rt.find(e=>e.id===t)?.title} panel ready`;return}if(!A.panels.scope.enabled){Zt.textContent="Scope panel disabled";return}await Wu()}ga.addEventListener("click",()=>{Wi.claim(!0).then(_r).catch(t=>{Zs.value=t.message})});window.addEventListener("pagehide",()=>Wi.release());vg();lv().catch(t=>{Zt.textContent=t.message});
