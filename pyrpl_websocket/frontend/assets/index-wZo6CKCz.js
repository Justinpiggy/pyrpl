(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const ch=!0,Ue="u-",uh="uplot",ph=Ue+"hz",hh=Ue+"vt",dh=Ue+"title",fh=Ue+"wrap",mh=Ue+"under",gh=Ue+"over",vh=Ue+"axis",hs=Ue+"off",bh=Ue+"select",wh=Ue+"cursor-x",yh=Ue+"cursor-y",xh=Ue+"cursor-pt",Sh=Ue+"legend",kh=Ue+"live",Mh=Ue+"inline",Eh=Ue+"series",Ch=Ue+"marker",Rl=Ue+"label",Ph=Ue+"value",Ii="width",Ni="height",Li="top",Il="bottom",Gs="left",Ao="right",mr="#000",Nl=mr+"0",zo="mousemove",Ol="mousedown",_o="mouseup",$l="mouseenter",Dl="mouseleave",Bl="dblclick",Ah="resize",zh="scroll",ql="change",Aa="dppxchange",gr="--",gi=typeof window<"u",Ho=gi?document:null,ni=gi?window:null,_h=gi?navigator:null;let we,fa;function jo(){let t=devicePixelRatio;we!=t&&(we=t,fa&&Uo(ql,fa,jo),fa=matchMedia(`(min-resolution: ${we-.001}dppx) and (max-resolution: ${we+.001}dppx)`),gs(ql,fa,jo),ni.dispatchEvent(new CustomEvent(Aa)))}function Et(t,e){if(e!=null){let n=t.classList;!n.contains(e)&&n.add(e)}}function Wo(t,e){let n=t.classList;n.contains(e)&&n.remove(e)}function Te(t,e,n){t.style[e]=n+"px"}function Qt(t,e,n,s){let i=Ho.createElement(t);return e!=null&&Et(i,e),n?.insertBefore(i,s),i}function Nt(t,e){return Qt("div",t,e)}const Vl=new WeakMap;function dn(t,e,n,s,i){let a="translate("+e+"px,"+n+"px)",o=Vl.get(t);a!=o&&(t.style.transform=a,Vl.set(t,a),e<0||n<0||e>s||n>i?Et(t,hs):Wo(t,hs))}const Yl=new WeakMap;function Hl(t,e,n){let s=e+n,i=Yl.get(t);s!=i&&(Yl.set(t,s),t.style.background=e,t.style.borderColor=n)}const jl=new WeakMap;function Wl(t,e,n,s){let i=e+""+n,a=jl.get(t);i!=a&&(jl.set(t,i),t.style.height=n+"px",t.style.width=e+"px",t.style.marginLeft=s?-e/2+"px":0,t.style.marginTop=s?-n/2+"px":0)}const vr={passive:!0},Lh={...vr,capture:!0};function gs(t,e,n,s){e.addEventListener(t,n,s?Lh:vr)}function Uo(t,e,n,s){e.removeEventListener(t,n,vr)}gi&&jo();function en(t,e,n,s){let i;n=n||0,s=s||e.length-1;let a=s<=2147483647;for(;s-n>1;)i=a?n+s>>1:Pt((n+s)/2),e[i]<t?n=i:s=i;return t-e[n]<=e[s]-t?n:s}function Jc(t){return(n,s,i)=>{let a=-1,o=-1;for(let l=s;l<=i;l++)if(t(n[l])){a=l;break}for(let l=i;l>=s;l--)if(t(n[l])){o=l;break}return[a,o]}}const Qc=t=>t!=null,eu=t=>t!=null&&t>0,Ba=Jc(Qc),Fh=Jc(eu);function Th(t,e,n,s=0,i=!1){let a=i?Fh:Ba,o=i?eu:Qc;[e,n]=a(t,e,n);let l=t[e],u=t[e];if(e>-1)if(s==1)l=t[e],u=t[n];else if(s==-1)l=t[n],u=t[e];else for(let d=e;d<=n;d++){let v=t[d];o(v)&&(v<l?l=v:v>u&&(u=v))}return[l??Ee,u??-Ee]}function qa(t,e,n,s){let i=Gl(t),a=Gl(e);t==e&&(i==-1?(t*=n,e/=n):(t/=n,e*=n));let o=n==10?Cn:tu,l=i==1?Pt:$t,u=a==1?$t:Pt,d=l(o(je(t))),v=u(o(je(e))),f=oi(n,d),m=oi(n,v);return n==10&&(d<0&&(f=Ce(f,-d)),v<0&&(m=Ce(m,-v))),s||n==2?(t=f*i,e=m*a):(t=au(t,f),e=Va(e,m)),[t,e]}function br(t,e,n,s){let i=qa(t,e,n,s);return t==0&&(i[0]=0),e==0&&(i[1]=0),i}const wr=.1,Ul={mode:3,pad:wr},Bi={pad:0,soft:null,mode:0},Rh={min:Bi,max:Bi};function za(t,e,n,s){return Ya(n)?Xl(t,e,n):(Bi.pad=n,Bi.soft=s?0:null,Bi.mode=s?3:0,Xl(t,e,Rh))}function me(t,e){return t??e}function Ih(t,e,n){for(e=me(e,0),n=me(n,t.length-1);e<=n;){if(t[e]!=null)return!0;e++}return!1}function Xl(t,e,n){let s=n.min,i=n.max,a=me(s.pad,0),o=me(i.pad,0),l=me(s.hard,-Ee),u=me(i.hard,Ee),d=me(s.soft,Ee),v=me(i.soft,-Ee),f=me(s.mode,0),m=me(i.mode,0),y=e-t,E=Cn(y),R=dt(je(t),je(e)),L=Cn(R),F=je(L-E);(y<1e-24||F>10)&&(y=0,(t==0||e==0)&&(y=1e-24,f==2&&d!=Ee&&(a=0),m==2&&v!=-Ee&&(o=0)));let M=y||R||1e3,B=Cn(M),_=oi(10,Pt(B)),Z=M*(y==0?t==0?.1:1:a),$=Ce(au(t-Z,_/10),24),ne=t>=d&&(f==1||f==3&&$<=d||f==2&&$>=d)?d:Ee,G=dt(l,$<ne&&t>=ne?ne:tn(ne,$)),ae=M*(y==0?e==0?.1:1:o),ee=Ce(Va(e+ae,_/10),24),T=e<=v&&(m==1||m==3&&ee>=v||m==2&&ee<=v)?v:-Ee,se=tn(u,ee>T&&e<=T?T:dt(T,ee));return G==se&&G==0&&(se=100),[G,se]}const Nh=new Intl.NumberFormat(gi?_h.language:"en-US"),yr=t=>Nh.format(t),_t=Math,Ea=_t.PI,je=_t.abs,Pt=_t.floor,He=_t.round,$t=_t.ceil,tn=_t.min,dt=_t.max,oi=_t.pow,Gl=_t.sign,Cn=_t.log10,tu=_t.log2,Oh=(t,e=1)=>_t.sinh(t)*e,Lo=(t,e=1)=>_t.asinh(t/e),Ee=1/0;function Kl(t){return(Cn((t^t>>31)-(t>>31))|0)+1}function Xo(t,e,n){return tn(dt(t,e),n)}function nu(t){return typeof t=="function"}function ce(t){return nu(t)?t:()=>t}const $h=()=>{},su=t=>t,iu=(t,e)=>e,Dh=t=>null,Zl=t=>!0,Jl=(t,e)=>t==e,Bh=/\.\d*?(?=9{6,}|0{6,})/gm,ws=t=>{if(ru(t)||jn.has(t))return t;const e=`${t}`,n=e.match(Bh);if(n==null)return t;let s=n[0].length-1;if(e.indexOf("e-")!=-1){let[i,a]=e.split("e");return+`${ws(i)}e${a}`}return Ce(t,s)};function us(t,e){return ws(Ce(ws(t/e))*e)}function Va(t,e){return ws($t(ws(t/e))*e)}function au(t,e){return ws(Pt(ws(t/e))*e)}function Ce(t,e=0){if(ru(t))return t;let n=10**e,s=t*n*(1+Number.EPSILON);return He(s)/n}const jn=new Map;function ou(t){return((""+t).split(".")[1]||"").length}function Hi(t,e,n,s){let i=[],a=s.map(ou);for(let o=e;o<n;o++){let l=je(o),u=Ce(oi(t,o),l);for(let d=0;d<s.length;d++){let v=t==10?+`${s[d]}e${o}`:s[d]*u,f=(o>=0?0:l)+(o>=a[d]?0:a[d]),m=t==10?v:Ce(v,f);i.push(m),jn.set(m,f)}}return i}const qi={},xr=[],ri=[null,null],Vn=Array.isArray,ru=Number.isInteger,qh=t=>t===void 0;function Ql(t){return typeof t=="string"}function Ya(t){let e=!1;if(t!=null){let n=t.constructor;e=n==null||n==Object}return e}function Vh(t){return t!=null&&typeof t=="object"}const Yh=Object.getPrototypeOf(Uint8Array),lu="__proto__";function li(t,e=Ya){let n;if(Vn(t)){let s=t.find(i=>i!=null);if(Vn(s)||e(s)){n=Array(t.length);for(let i=0;i<t.length;i++)n[i]=li(t[i],e)}else n=t.slice()}else if(t instanceof Yh)n=t.slice();else if(e(t)){n={};for(let s in t)s!=lu&&(n[s]=li(t[s],e))}else n=t;return n}function Ve(t){let e=arguments;for(let n=1;n<e.length;n++){let s=e[n];for(let i in s)i!=lu&&(Ya(t[i])?Ve(t[i],li(s[i])):t[i]=li(s[i]))}return t}const Hh=0,jh=1,Wh=2;function Uh(t,e,n){for(let s=0,i,a=-1;s<e.length;s++){let o=e[s];if(o>a){for(i=o-1;i>=0&&t[i]==null;)t[i--]=null;for(i=o+1;i<n&&t[i]==null;)t[a=i++]=null}}}function Xh(t,e){if(Zh(t)){let o=t[0].slice();for(let l=1;l<t.length;l++)o.push(...t[l].slice(1));return Jh(o[0])||(o=Kh(o)),o}let n=new Set;for(let o=0;o<t.length;o++){let u=t[o][0],d=u.length;for(let v=0;v<d;v++)n.add(u[v])}let s=[Array.from(n).sort((o,l)=>o-l)],i=s[0].length,a=new Map;for(let o=0;o<i;o++)a.set(s[0][o],o);for(let o=0;o<t.length;o++){let l=t[o],u=l[0];for(let d=1;d<l.length;d++){let v=l[d],f=Array(i).fill(void 0),m=e?e[o][d]:jh,y=[];for(let E=0;E<v.length;E++){let R=v[E],L=a.get(u[E]);R===null?m!=Hh&&(f[L]=R,m==Wh&&y.push(L)):f[L]=R}Uh(f,y,i),s.push(f)}}return s}const Gh=typeof queueMicrotask>"u"?t=>Promise.resolve().then(t):queueMicrotask;function Kh(t){let e=t[0],n=e.length,s=Array(n);for(let a=0;a<s.length;a++)s[a]=a;s.sort((a,o)=>e[a]-e[o]);let i=[];for(let a=0;a<t.length;a++){let o=t[a],l=Array(n);for(let u=0;u<n;u++)l[u]=o[s[u]];i.push(l)}return i}function Zh(t){let e=t[0][0],n=e.length;for(let s=1;s<t.length;s++){let i=t[s][0];if(i.length!=n)return!1;if(i!=e){for(let a=0;a<n;a++)if(i[a]!=e[a])return!1}}return!0}function Jh(t,e=100){const n=t.length;if(n<=1)return!0;let s=0,i=n-1;for(;s<=i&&t[s]==null;)s++;for(;i>=s&&t[i]==null;)i--;if(i<=s)return!0;const a=dt(1,Pt((i-s+1)/e));for(let o=t[s],l=s+a;l<=i;l+=a){const u=t[l];if(u!=null){if(u<=o)return!1;o=u}}return!0}const cu=["January","February","March","April","May","June","July","August","September","October","November","December"],uu=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function pu(t){return t.slice(0,3)}const Qh=uu.map(pu),ed=cu.map(pu),td={MMMM:cu,MMM:ed,WWWW:uu,WWW:Qh};function Fi(t){return(t<10?"0":"")+t}function nd(t){return(t<10?"00":t<100?"0":"")+t}const sd={YYYY:t=>t.getFullYear(),YY:t=>(t.getFullYear()+"").slice(2),MMMM:(t,e)=>e.MMMM[t.getMonth()],MMM:(t,e)=>e.MMM[t.getMonth()],MM:t=>Fi(t.getMonth()+1),M:t=>t.getMonth()+1,DD:t=>Fi(t.getDate()),D:t=>t.getDate(),WWWW:(t,e)=>e.WWWW[t.getDay()],WWW:(t,e)=>e.WWW[t.getDay()],HH:t=>Fi(t.getHours()),H:t=>t.getHours(),h:t=>{let e=t.getHours();return e==0?12:e>12?e-12:e},AA:t=>t.getHours()>=12?"PM":"AM",aa:t=>t.getHours()>=12?"pm":"am",a:t=>t.getHours()>=12?"p":"a",mm:t=>Fi(t.getMinutes()),m:t=>t.getMinutes(),ss:t=>Fi(t.getSeconds()),s:t=>t.getSeconds(),fff:t=>nd(t.getMilliseconds())};function Sr(t,e){e=e||td;let n=[],s=/\{([a-z]+)\}|[^{]+/gi,i;for(;i=s.exec(t);)n.push(i[0][0]=="{"?sd[i[1]]:i[0]);return a=>{let o="";for(let l=0;l<n.length;l++)o+=typeof n[l]=="string"?n[l]:n[l](a,e);return o}}const id=new Intl.DateTimeFormat().resolvedOptions().timeZone;function ad(t,e){let n;return e=="UTC"||e=="Etc/UTC"?n=new Date(+t+t.getTimezoneOffset()*6e4):e==id?n=t:(n=new Date(t.toLocaleString("en-US",{timeZone:e})),n.setMilliseconds(t.getMilliseconds())),n}const hu=t=>t%1==0,_a=[1,2,2.5,5],od=Hi(10,-32,0,_a),du=Hi(10,0,32,_a),rd=du.filter(hu),ps=od.concat(du),kr=`
`,fu="{YYYY}",ec=kr+fu,mu="{M}/{D}",Oi=kr+mu,ma=Oi+"/{YY}",gu="{aa}",ld="{h}:{mm}",Zs=ld+gu,tc=kr+Zs,nc=":{ss}",ye=null;function vu(t){let e=t*1e3,n=e*60,s=n*60,i=s*24,a=i*30,o=i*365,u=(t==1?Hi(10,0,3,_a).filter(hu):Hi(10,-3,0,_a)).concat([e,e*5,e*10,e*15,e*30,n,n*5,n*10,n*15,n*30,s,s*2,s*3,s*4,s*6,s*8,s*12,i,i*2,i*3,i*4,i*5,i*6,i*7,i*8,i*9,i*10,i*15,a,a*2,a*3,a*4,a*6,o,o*2,o*5,o*10,o*25,o*50,o*100]);const d=[[o,fu,ye,ye,ye,ye,ye,ye,1],[i*28,"{MMM}",ec,ye,ye,ye,ye,ye,1],[i,mu,ec,ye,ye,ye,ye,ye,1],[s,"{h}"+gu,ma,ye,Oi,ye,ye,ye,1],[n,Zs,ma,ye,Oi,ye,ye,ye,1],[e,nc,ma+" "+Zs,ye,Oi+" "+Zs,ye,tc,ye,1],[t,nc+".{fff}",ma+" "+Zs,ye,Oi+" "+Zs,ye,tc,ye,1]];function v(f){return(m,y,E,R,L,F)=>{let M=[],B=L>=o,_=L>=a&&L<o,Z=f(E),$=Ce(Z*t,3),ne=Fo(Z.getFullYear(),B?0:Z.getMonth(),_||B?1:Z.getDate()),G=Ce(ne*t,3);if(_||B){let ae=_?L/a:0,ee=B?L/o:0,T=$==G?$:Ce(Fo(ne.getFullYear()+ee,ne.getMonth()+ae,1)*t,3),se=new Date(He(T/t)),V=se.getFullYear(),J=se.getMonth();for(let H=0;T<=R;H++){let re=Fo(V+ee*H,J+ae*H,1),W=re-f(Ce(re*t,3));T=Ce((+re+W)*t,3),T<=R&&M.push(T)}}else{let ae=L>=i?i:L,ee=Pt(E)-Pt($),T=G+ee+Va($-G,ae);M.push(T);let se=f(T),V=se.getHours()+se.getMinutes()/n+se.getSeconds()/s,J=L/s,H=m.axes[y]._space,re=F/H;for(;T=Ce(T+L,t==1?0:3),!(T>R);)if(J>1){let W=Pt(Ce(V+J,6))%24,ue=f(T).getHours()-W;ue>1&&(ue=-1),T-=ue*s,V=(V+J)%24;let ve=M[M.length-1];Ce((T-ve)/L,3)*re>=.7&&M.push(T)}else M.push(T)}return M}}return[u,d,v]}const[cd,ud,pd]=vu(1),[hd,dd,fd]=vu(.001);Hi(2,-53,53,[1]);function sc(t,e){return t.map(n=>n.map((s,i)=>i==0||i==8||s==null?s:e(i==1||n[8]==0?s:n[1]+s)))}function ic(t,e){return(n,s,i,a,o)=>{let l=e.find(E=>o>=E[0])||e[e.length-1],u,d,v,f,m,y;return s.map(E=>{let R=t(E),L=R.getFullYear(),F=R.getMonth(),M=R.getDate(),B=R.getHours(),_=R.getMinutes(),Z=R.getSeconds(),$=L!=u&&l[2]||F!=d&&l[3]||M!=v&&l[4]||B!=f&&l[5]||_!=m&&l[6]||Z!=y&&l[7]||l[1];return u=L,d=F,v=M,f=B,m=_,y=Z,$(R)})}}function md(t,e){let n=Sr(e);return(s,i,a,o,l)=>i.map(u=>n(t(u)))}function Fo(t,e,n){return new Date(t,e,n)}function ac(t,e){return e(t)}const gd="{YYYY}-{MM}-{DD} {h}:{mm}{aa}";function oc(t,e){return(n,s,i,a)=>a==null?gr:e(t(s))}function vd(t,e){let n=t.series[e];return n.width?n.stroke(t,e):n.points.width?n.points.stroke(t,e):null}function bd(t,e){return t.series[e].fill(t,e)}const wd={show:!0,live:!0,isolate:!1,mount:$h,markers:{show:!0,width:2,stroke:vd,fill:bd,dash:"solid"},idx:null,idxs:null,values:[]};function yd(t,e){let n=t.cursor.points,s=Nt(),i=n.size(t,e);Te(s,Ii,i),Te(s,Ni,i);let a=i/-2;Te(s,"marginLeft",a),Te(s,"marginTop",a);let o=n.width(t,e,i);return o&&Te(s,"borderWidth",o),s}function xd(t,e){let n=t.series[e].points;return n._fill||n._stroke}function Sd(t,e){let n=t.series[e].points;return n._stroke||n._fill}function kd(t,e){return t.series[e].points.size}const To=[0,0];function Md(t,e,n){return To[0]=e,To[1]=n,To}function ga(t,e,n,s=!0){return i=>{i.button==0&&(!s||i.target==e)&&n(i)}}function Ro(t,e,n,s=!0){return i=>{(!s||i.target==e)&&n(i)}}const Ed={show:!0,x:!0,y:!0,lock:!1,move:Md,points:{one:!1,show:yd,size:kd,width:0,stroke:Sd,fill:xd},bind:{mousedown:ga,mouseup:ga,click:ga,dblclick:ga,mousemove:Ro,mouseleave:Ro,mouseenter:Ro},drag:{setScale:!0,x:!0,y:!1,dist:0,uni:null,click:(t,e)=>{e.stopPropagation(),e.stopImmediatePropagation()},_x:!1,_y:!1},focus:{dist:(t,e,n,s,i)=>s-i,prox:-1,bias:0},hover:{skip:[void 0],prox:null,bias:0},left:-10,top:-10,idx:null,dataIdx:null,idxs:null,event:null},bu={show:!0,stroke:"rgba(0,0,0,0.07)",width:2},Mr=Ve({},bu,{filter:iu}),wu=Ve({},Mr,{size:10}),yu=Ve({},bu,{show:!1}),Er='12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',xu="bold "+Er,Su=1.5,rc={show:!0,scale:"x",stroke:mr,space:50,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:xu,side:2,grid:Mr,ticks:wu,border:yu,font:Er,lineGap:Su,rotate:0},Cd="Value",Pd="Time",lc={show:!0,scale:"x",auto:!1,sorted:1,min:Ee,max:-Ee,idxs:[]};function Ad(t,e,n,s,i){return e.map(a=>a==null?"":yr(a))}function zd(t,e,n,s,i,a,o){let l=[],u=jn.get(i)||0;n=o?n:Ce(Va(n,i),u);for(let d=n;d<=s;d=Ce(d+i,u))l.push(Object.is(d,-0)?0:d);return l}function Go(t,e,n,s,i,a,o){const l=[],u=t.scales[t.axes[e].scale].log,d=u==10?Cn:tu,v=Pt(d(n));i=oi(u,v),u==10&&(i=ps[en(i,ps)]);let f=n,m=i*u;u==10&&(m=ps[en(m,ps)]);do l.push(f),f=f+i,u==10&&!jn.has(f)&&(f=Ce(f,jn.get(i))),f>=m&&(i=f,m=i*u,u==10&&(m=ps[en(m,ps)]));while(f<=s);return l}function _d(t,e,n,s,i,a,o){let u=t.scales[t.axes[e].scale].asinh,d=s>u?Go(t,e,dt(u,n),s,i):[u],v=s>=0&&n<=0?[0]:[];return(n<-u?Go(t,e,dt(u,-s),-n,i):[u]).reverse().map(m=>-m).concat(v,d)}const ku=/./,Ld=/[12357]/,Fd=/[125]/,cc=/1/,Ko=(t,e,n,s)=>t.map((i,a)=>e==4&&i==0||a%s==0&&n.test(i.toExponential()[i<0?1:0])?i:null);function Td(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=t.scales[o],u=t.valToPos,d=a._space,v=u(10,o),f=u(9,o)-v>=d?ku:u(7,o)-v>=d?Ld:u(5,o)-v>=d?Fd:cc;if(f==cc){let m=je(u(1,o)-v);if(m<d)return Ko(e.slice().reverse(),l.distr,f,$t(d/m)).reverse()}return Ko(e,l.distr,f,1)}function Rd(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=a._space,u=t.valToPos,d=je(u(1,o)-u(2,o));return d<l?Ko(e.slice().reverse(),3,ku,$t(l/d)).reverse():e}function Id(t,e,n,s){return s==null?gr:e==null?"":yr(e)}const uc={show:!0,scale:"y",stroke:mr,space:30,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:xu,side:3,grid:Mr,ticks:wu,border:yu,font:Er,lineGap:Su,rotate:0};function Nd(t,e){let n=3+(t||1)*2;return Ce(n*e,3)}function Od(t,e){let{scale:n,idxs:s}=t.series[0],i=t._data[0],a=t.valToPos(i[s[0]],n,!0),o=t.valToPos(i[s[1]],n,!0),l=je(o-a),u=t.series[e],d=l/(u.points.space*we);return s[1]-s[0]<=d}const pc={scale:null,auto:!0,sorted:0,min:Ee,max:-Ee},Mu=(t,e,n,s,i)=>i,hc={show:!0,auto:!0,sorted:0,gaps:Mu,alpha:1,facets:[Ve({},pc,{scale:"x"}),Ve({},pc,{scale:"y"})]},dc={scale:"y",auto:!0,sorted:0,show:!0,spanGaps:!1,gaps:Mu,alpha:1,points:{show:Od,filter:null},values:null,min:Ee,max:-Ee,idxs:[],path:null,clip:null};function $d(t,e,n,s,i){return n/10}const Eu={time:ch,auto:!0,distr:1,log:10,asinh:1,min:null,max:null,dir:1,ori:0},Dd=Ve({},Eu,{time:!1,ori:1}),fc={};function Cu(t,e){let n=fc[t];return n||(n={key:t,plots:[],sub(s){n.plots.push(s)},unsub(s){n.plots=n.plots.filter(i=>i!=s)},pub(s,i,a,o,l,u,d){for(let v=0;v<n.plots.length;v++)n.plots[v]!=i&&n.plots[v].pub(s,i,a,o,l,u,d)}},t!=null&&(fc[t]=n)),n}const ci=1,Zo=2;function As(t,e,n){const s=t.mode,i=t.series[e],a=s==2?t._data[e]:t._data,o=t.scales,l=t.bbox;let u=a[0],d=s==2?a[1]:a[e],v=s==2?o[i.facets[0].scale]:o[t.series[0].scale],f=s==2?o[i.facets[1].scale]:o[i.scale],m=l.left,y=l.top,E=l.width,R=l.height,L=t.valToPosH,F=t.valToPosV;return v.ori==0?n(i,u,d,v,f,L,F,m,y,E,R,ja,vi,Ua,Au,_u):n(i,u,d,v,f,F,L,y,m,R,E,Wa,bi,Ar,zu,Lu)}function Cr(t,e){let n=0,s=0,i=me(t.bands,xr);for(let a=0;a<i.length;a++){let o=i[a];o.series[0]==e?n=o.dir:o.series[1]==e&&(o.dir==1?s|=1:s|=2)}return[n,s==1?-1:s==2?1:s==3?2:0]}function Bd(t,e,n,s,i){let a=t.mode,o=t.series[e],l=a==2?o.facets[1].scale:o.scale,u=t.scales[l];return i==-1?u.min:i==1?u.max:u.distr==3?u.dir==1?u.min:u.max:0}function Pn(t,e,n,s,i,a){return As(t,e,(o,l,u,d,v,f,m,y,E,R,L)=>{let F=o.pxRound;const M=d.dir*(d.ori==0?1:-1),B=d.ori==0?vi:bi;let _,Z;M==1?(_=n,Z=s):(_=s,Z=n);let $=F(f(l[_],d,R,y)),ne=F(m(u[_],v,L,E)),G=F(f(l[Z],d,R,y)),ae=F(m(a==1?v.max:v.min,v,L,E)),ee=new Path2D(i);return B(ee,G,ae),B(ee,$,ae),B(ee,$,ne),ee})}function Ha(t,e,n,s,i,a){let o=null;if(t.length>0){o=new Path2D;const l=e==0?Ua:Ar;let u=n;for(let f=0;f<t.length;f++){let m=t[f];if(m[1]>m[0]){let y=m[0]-u;y>0&&l(o,u,s,y,s+a),u=m[1]}}let d=n+i-u,v=10;d>0&&l(o,u,s-v/2,d,s+a+v)}return o}function qd(t,e,n){let s=t[t.length-1];s&&s[0]==e?s[1]=n:t.push([e,n])}function Pr(t,e,n,s,i,a,o){let l=[],u=t.length;for(let d=i==1?n:s;d>=n&&d<=s;d+=i)if(e[d]===null){let f=d,m=d;if(i==1)for(;++d<=s&&e[d]===null;)m=d;else for(;--d>=n&&e[d]===null;)m=d;let y=a(t[f]),E=m==f?y:a(t[m]),R=f-i;y=o<=0&&R>=0&&R<u?a(t[R]):y;let F=m+i;E=o>=0&&F>=0&&F<u?a(t[F]):E,E>=y&&l.push([y,E])}return l}function mc(t){return t==0?su:t==1?He:e=>us(e,t)}function Pu(t){let e=t==0?ja:Wa,n=t==0?(i,a,o,l,u,d)=>{i.arcTo(a,o,l,u,d)}:(i,a,o,l,u,d)=>{i.arcTo(o,a,u,l,d)},s=t==0?(i,a,o,l,u)=>{i.rect(a,o,l,u)}:(i,a,o,l,u)=>{i.rect(o,a,u,l)};return(i,a,o,l,u,d=0,v=0)=>{d==0&&v==0?s(i,a,o,l,u):(d=tn(d,l/2,u/2),v=tn(v,l/2,u/2),e(i,a+d,o),n(i,a+l,o,a+l,o+u,d),n(i,a+l,o+u,a,o+u,v),n(i,a,o+u,a,o,v),n(i,a,o,a+l,o,d),i.closePath())}}const ja=(t,e,n)=>{t.moveTo(e,n)},Wa=(t,e,n)=>{t.moveTo(n,e)},vi=(t,e,n)=>{t.lineTo(e,n)},bi=(t,e,n)=>{t.lineTo(n,e)},Ua=Pu(0),Ar=Pu(1),Au=(t,e,n,s,i,a)=>{t.arc(e,n,s,i,a)},zu=(t,e,n,s,i,a)=>{t.arc(n,e,s,i,a)},_u=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(e,n,s,i,a,o)},Lu=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(n,e,i,s,o,a)};function Fu(t){return(e,n,s,i,a)=>As(e,n,(o,l,u,d,v,f,m,y,E,R,L)=>{let{pxRound:F,points:M}=o,B,_;d.ori==0?(B=ja,_=Au):(B=Wa,_=zu);const Z=Ce(M.width*we,3);let $=(M.size-M.width)/2*we,ne=Ce($*2,3),G=new Path2D,ae=new Path2D,{left:ee,top:T,width:se,height:V}=e.bbox;Ua(ae,ee-ne,T-ne,se+ne*2,V+ne*2);const J=H=>{if(u[H]!=null){let re=F(f(l[H],d,R,y)),W=F(m(u[H],v,L,E));B(G,re+$,W),_(G,re,W,$,0,Ea*2)}};if(a)a.forEach(J);else for(let H=s;H<=i;H++)J(H);return{stroke:Z>0?G:null,fill:G,clip:ae,flags:ci|Zo}})}function Tu(t){return(e,n,s,i,a,o)=>{s!=i&&(a!=s&&o!=s&&t(e,n,s),a!=i&&o!=i&&t(e,n,i),t(e,n,o))}}const Vd=Tu(vi),Yd=Tu(bi);function Ru(t){const e=me(t?.alignGaps,0);return(n,s,i,a)=>As(n,s,(o,l,u,d,v,f,m,y,E,R,L)=>{[i,a]=Ba(u,i,a);let F=o.pxRound,M=V=>F(f(V,d,R,y)),B=V=>F(m(V,v,L,E)),_,Z;d.ori==0?(_=vi,Z=Vd):(_=bi,Z=Yd);const $=d.dir*(d.ori==0?1:-1),ne={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:ci},G=ne.stroke;let ae=!1;if(a-i>=R*4){let V=j=>n.posToVal(j,d.key,!0),J=null,H=null,re,W,it,Se=M(l[$==1?i:a]),ue=M(l[i]),ve=M(l[a]),oe=V($==1?ue+1:ve-1);for(let j=$==1?i:a;j>=i&&j<=a;j+=$){let ke=l[j],Pe=($==1?ke<oe:ke>oe)?Se:M(ke),de=u[j];Pe==Se?de!=null?(W=de,J==null?(_(G,Pe,B(W)),re=J=H=W):W<J?J=W:W>H&&(H=W)):de===null&&(ae=!0):(J!=null&&Z(G,Se,B(J),B(H),B(re),B(W)),de!=null?(W=de,_(G,Pe,B(W)),J=H=re=W):(J=H=null,de===null&&(ae=!0)),Se=Pe,oe=V(Se+$))}J!=null&&J!=H&&it!=Se&&Z(G,Se,B(J),B(H),B(re),B(W))}else for(let V=$==1?i:a;V>=i&&V<=a;V+=$){let J=u[V];J===null?ae=!0:J!=null&&_(G,M(l[V]),B(J))}let[T,se]=Cr(n,s);if(o.fill!=null||T!=0){let V=ne.fill=new Path2D(G),J=o.fillTo(n,s,o.min,o.max,T),H=B(J),re=M(l[i]),W=M(l[a]);$==-1&&([W,re]=[re,W]),_(V,W,H),_(V,re,H)}if(!o.spanGaps){let V=[];ae&&V.push(...Pr(l,u,i,a,$,M,e)),ne.gaps=V=o.gaps(n,s,i,a,V),ne.clip=Ha(V,d.ori,y,E,R,L)}return se!=0&&(ne.band=se==2?[Pn(n,s,i,a,G,-1),Pn(n,s,i,a,G,1)]:Pn(n,s,i,a,G,se)),ne})}function Hd(t){const e=me(t.align,1),n=me(t.ascDesc,!1),s=me(t.alignGaps,0),i=me(t.extend,!1);return(a,o,l,u)=>As(a,o,(d,v,f,m,y,E,R,L,F,M,B)=>{[l,u]=Ba(f,l,u);let _=d.pxRound,{left:Z,width:$}=a.bbox,ne=ue=>_(E(ue,m,M,L)),G=ue=>_(R(ue,y,B,F)),ae=m.ori==0?vi:bi;const ee={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:ci},T=ee.stroke,se=m.dir*(m.ori==0?1:-1);let V=G(f[se==1?l:u]),J=ne(v[se==1?l:u]),H=J,re=J;i&&e==-1&&(re=Z,ae(T,re,V)),ae(T,J,V);for(let ue=se==1?l:u;ue>=l&&ue<=u;ue+=se){let ve=f[ue];if(ve==null)continue;let oe=ne(v[ue]),j=G(ve);e==1?ae(T,oe,V):ae(T,H,j),ae(T,oe,j),V=j,H=oe}let W=H;i&&e==1&&(W=Z+$,ae(T,W,V));let[it,Se]=Cr(a,o);if(d.fill!=null||it!=0){let ue=ee.fill=new Path2D(T),ve=d.fillTo(a,o,d.min,d.max,it),oe=G(ve);ae(ue,W,oe),ae(ue,re,oe)}if(!d.spanGaps){let ue=[];ue.push(...Pr(v,f,l,u,se,ne,s));let ve=d.width*we/2,oe=n||e==1?ve:-ve,j=n||e==-1?-ve:ve;ue.forEach(ke=>{ke[0]+=oe,ke[1]+=j}),ee.gaps=ue=d.gaps(a,o,l,u,ue),ee.clip=Ha(ue,m.ori,L,F,M,B)}return Se!=0&&(ee.band=Se==2?[Pn(a,o,l,u,T,-1),Pn(a,o,l,u,T,1)]:Pn(a,o,l,u,T,Se)),ee})}function gc(t,e,n,s,i,a,o=Ee){if(t.length>1){let l=null;for(let u=0,d=1/0;u<t.length;u++)if(e[u]!==void 0){if(l!=null){let v=je(t[u]-t[l]);v<d&&(d=v,o=je(n(t[u],s,i,a)-n(t[l],s,i,a)))}l=u}}return o}function jd(t){t=t||qi;const e=me(t.size,[.6,Ee,1]),n=t.align||0,s=t.gap||0;let i=t.radius;i=i==null?[0,0]:typeof i=="number"?[i,0]:i;const a=ce(i),o=1-e[0],l=me(e[1],Ee),u=me(e[2],1),d=me(t.disp,qi),v=me(t.each,y=>{}),{fill:f,stroke:m}=d;return(y,E,R,L)=>As(y,E,(F,M,B,_,Z,$,ne,G,ae,ee,T)=>{let se=F.pxRound,V=n,J=s*we,H=l*we,re=u*we,W,it;_.ori==0?[W,it]=a(y,E):[it,W]=a(y,E);const Se=_.dir*(_.ori==0?1:-1);let ue=_.ori==0?Ua:Ar,ve=_.ori==0?v:(D,Ae,Ye,Ts,ns,rn,ss)=>{v(D,Ae,Ye,ns,Ts,ss,rn)},oe=me(y.bands,xr).find(D=>D.series[0]==E),j=oe!=null?oe.dir:0,ke=F.fillTo(y,E,F.min,F.max,j),Xe=se(ne(ke,Z,T,ae)),Pe,de,I,k=ee,P=se(F.width*we),Y=!1,Me=null,pe=null,Oe=null,ft=null;f!=null&&(P==0||m!=null)&&(Y=!0,Me=f.values(y,E,R,L),pe=new Map,new Set(Me).forEach(D=>{D!=null&&pe.set(D,new Path2D)}),P>0&&(Oe=m.values(y,E,R,L),ft=new Map,new Set(Oe).forEach(D=>{D!=null&&ft.set(D,new Path2D)})));let{x0:Ht,size:on}=d;if(Ht!=null&&on!=null){V=1,M=Ht.values(y,E,R,L),Ht.unit==2&&(M=M.map(Ye=>y.posToVal(G+Ye*ee,_.key,!0)));let D=on.values(y,E,R,L);on.unit==2?de=D[0]*ee:de=$(D[0],_,ee,G)-$(0,_,ee,G),k=gc(M,B,$,_,ee,G,k),I=k-de+J}else k=gc(M,B,$,_,ee,G,k),I=k*o+J,de=k-I;I<1&&(I=0),P>=de/2&&(P=0),I<5&&(se=su);let ia=I>0,es=k-I-(ia?P:0);de=se(Xo(es,re,H)),Pe=(V==0?de/2:V==Se?0:de)-V*Se*((V==0?J/2:0)+(ia?P/2:0));const ct={stroke:null,fill:null,clip:null,band:null,gaps:null,flags:0},Fs=Y?null:new Path2D;let yn=null;if(oe!=null)yn=y.data[oe.series[1]];else{let{y0:D,y1:Ae}=d;D!=null&&Ae!=null&&(B=Ae.values(y,E,R,L),yn=D.values(y,E,R,L))}let ts=W*de,ie=it*de;for(let D=Se==1?R:L;D>=R&&D<=L;D+=Se){let Ae=B[D];if(Ae==null)continue;if(yn!=null){let mt=yn[D]??0;if(Ae-mt==0)continue;Xe=ne(mt,Z,T,ae)}let Ye=_.distr!=2||d!=null?M[D]:D,Ts=$(Ye,_,ee,G),ns=ne(me(Ae,ke),Z,T,ae),rn=se(Ts-Pe),ss=se(dt(ns,Xe)),xt=se(tn(ns,Xe)),Lt=ss-xt;if(Ae!=null){let mt=Ae<0?ie:ts,jt=Ae<0?ts:ie;Y?(P>0&&Oe[D]!=null&&ue(ft.get(Oe[D]),rn,xt+Pt(P/2),de,dt(0,Lt-P),mt,jt),Me[D]!=null&&ue(pe.get(Me[D]),rn,xt+Pt(P/2),de,dt(0,Lt-P),mt,jt)):ue(Fs,rn,xt+Pt(P/2),de,dt(0,Lt-P),mt,jt),ve(y,E,D,rn-P/2,xt,de+P,Lt)}}return P>0?ct.stroke=Y?ft:Fs:Y||(ct._fill=F.width==0?F._fill:F._stroke??F._fill,ct.width=0),ct.fill=Y?pe:Fs,ct})}function Wd(t,e){const n=me(e?.alignGaps,0);return(s,i,a,o)=>As(s,i,(l,u,d,v,f,m,y,E,R,L,F)=>{[a,o]=Ba(d,a,o);let M=l.pxRound,B=W=>M(m(W,v,L,E)),_=W=>M(y(W,f,F,R)),Z,$,ne;v.ori==0?(Z=ja,ne=vi,$=_u):(Z=Wa,ne=bi,$=Lu);const G=v.dir*(v.ori==0?1:-1);let ae=B(u[G==1?a:o]),ee=ae,T=[],se=[];for(let W=G==1?a:o;W>=a&&W<=o;W+=G)if(d[W]!=null){let Se=u[W],ue=B(Se);T.push(ee=ue),se.push(_(d[W]))}const V={stroke:t(T,se,Z,ne,$,M),fill:null,clip:null,band:null,gaps:null,flags:ci},J=V.stroke;let[H,re]=Cr(s,i);if(l.fill!=null||H!=0){let W=V.fill=new Path2D(J),it=l.fillTo(s,i,l.min,l.max,H),Se=_(it);ne(W,ee,Se),ne(W,ae,Se)}if(!l.spanGaps){let W=[];W.push(...Pr(u,d,a,o,G,B,n)),V.gaps=W=l.gaps(s,i,a,o,W),V.clip=Ha(W,v.ori,E,R,L,F)}return re!=0&&(V.band=re==2?[Pn(s,i,a,o,J,-1),Pn(s,i,a,o,J,1)]:Pn(s,i,a,o,J,re)),V})}function Ud(t){return Wd(Xd,t)}function Xd(t,e,n,s,i,a){const o=t.length;if(o<2)return null;const l=new Path2D;if(n(l,t[0],e[0]),o==2)s(l,t[1],e[1]);else{let u=Array(o),d=Array(o-1),v=Array(o-1),f=Array(o-1);for(let m=0;m<o-1;m++)v[m]=e[m+1]-e[m],f[m]=t[m+1]-t[m],d[m]=v[m]/f[m];u[0]=d[0];for(let m=1;m<o-1;m++)d[m]===0||d[m-1]===0||d[m-1]>0!=d[m]>0?u[m]=0:(u[m]=3*(f[m-1]+f[m])/((2*f[m]+f[m-1])/d[m-1]+(f[m]+2*f[m-1])/d[m]),isFinite(u[m])||(u[m]=0));u[o-1]=d[o-2];for(let m=0;m<o-1;m++)i(l,t[m]+f[m]/3,e[m]+u[m]*f[m]/3,t[m+1]-f[m]/3,e[m+1]-u[m+1]*f[m]/3,t[m+1],e[m+1])}return l}const Jo=new Set;function vc(){for(let t of Jo)t.syncRect(!0)}gi&&(gs(Ah,ni,vc),gs(zh,ni,vc,!0),gs(Aa,ni,()=>{Re.pxRatio=we}));const Gd=Ru(),Kd=Fu();function bc(t,e,n,s){return(s?[t[0],t[1]].concat(t.slice(2)):[t[0]].concat(t.slice(1))).map((a,o)=>Qo(a,o,e,n))}function Zd(t,e){return t.map((n,s)=>s==0?{}:Ve({},e,n))}function Qo(t,e,n,s){return Ve({},e==0?n:s,t)}function Iu(t,e,n){return e==null?ri:[e,n]}const Jd=Iu;function Qd(t,e,n){return e==null?ri:za(e,n,wr,!0)}function Nu(t,e,n,s){return e==null?ri:qa(e,n,t.scales[s].log,!1)}const ef=Nu;function Ou(t,e,n,s){return e==null?ri:br(e,n,t.scales[s].log,!1)}const tf=Ou;function nf(t,e,n,s,i){let a=dt(Kl(t),Kl(e)),o=e-t,l=en(i/s*o,n);do{let u=n[l],d=s*u/o;if(d>=i&&a+(u<5?jn.get(u):0)<=17)return[u,d]}while(++l<n.length);return[0,0]}function wc(t){let e,n;return t=t.replace(/(\d+)px/,(s,i)=>(e=He((n=+i)*we))+"px"),[t,e,n]}function sf(t){t.show&&[t.font,t.labelFont].forEach(e=>{let n=Ce(e[2]*we,1);e[0]=e[0].replace(/[0-9.]+px/,n+"px"),e[1]=n})}function Re(t,e,n){const s={mode:me(t.mode,1)},i=s.mode;function a(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?1-g:g)}function o(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?g:1-g)}function l(r,c,p,h){return c.ori==0?a(r,c,p,h):o(r,c,p,h)}s.valToPosH=a,s.valToPosV=o;let u=!1;s.status=0;const d=s.root=Nt(uh);if(t.id!=null&&(d.id=t.id),Et(d,t.class),t.title){let r=Nt(dh,d);r.textContent=t.title}const v=Qt("canvas"),f=s.ctx=v.getContext("2d"),m=Nt(fh,d);gs("click",m,r=>{r.target===E&&(_e!=Hs||Ne!=js)&&nt.click(s,r)},!0);const y=s.under=Nt(mh,m);m.appendChild(v);const E=s.over=Nt(gh,m);t=li(t);const R=+me(t.pxAlign,1),L=mc(R);(t.plugins||[]).forEach(r=>{r.opts&&(t=r.opts(s,t)||t)});const F=t.ms||.001,M=s.series=i==1?bc(t.series||[],lc,dc,!1):Zd(t.series||[null],hc),B=s.axes=bc(t.axes||[],rc,uc,!0),_=s.scales={},Z=s.bands=t.bands||[];Z.forEach(r=>{r.fill=ce(r.fill||null),r.dir=me(r.dir,-1)});const $=i==2?M[1].facets[0].scale:M[0].scale,ne={axes:Xp,series:Yp},G=(t.drawOrder||["axes","series"]).map(r=>ne[r]);function ae(r){const c=r.distr==3?p=>Cn(p>0?p:r.clamp(s,p,r.min,r.max,r.key)):r.distr==4?p=>Lo(p,r.asinh):r.distr==100?p=>r.fwd(p):p=>p;return p=>{let h=c(p),{_min:g,_max:w}=r,x=w-g;return(h-g)/x}}function ee(r){let c=_[r];if(c==null){let p=(t.scales||qi)[r]||qi;if(p.from!=null){ee(p.from);let h=Ve({},_[p.from],p,{key:r});h.valToPct=ae(h),_[r]=h}else{c=_[r]=Ve({},r==$?Eu:Dd,p),c.key=r;let h=c.time,g=c.range,w=Vn(g);if((r!=$||i==2&&!h)&&(w&&(g[0]==null||g[1]==null)&&(g={min:g[0]==null?Ul:{mode:1,hard:g[0],soft:g[0]},max:g[1]==null?Ul:{mode:1,hard:g[1],soft:g[1]}},w=!1),!w&&Ya(g))){let x=g;g=(C,z,N)=>z==null?ri:za(z,N,x)}c.range=ce(g||(h?Jd:r==$?c.distr==3?ef:c.distr==4?tf:Iu:c.distr==3?Nu:c.distr==4?Ou:Qd)),c.auto=ce(w?!1:c.auto),c.clamp=ce(c.clamp||$d),c._min=c._max=null,c.valToPct=ae(c)}}}ee("x"),ee("y"),i==1&&M.forEach(r=>{ee(r.scale)}),B.forEach(r=>{ee(r.scale)});for(let r in t.scales)ee(r);const T=_[$],se=T.distr;let V,J;T.ori==0?(Et(d,ph),V=a,J=o):(Et(d,hh),V=o,J=a);const H={};for(let r in _){let c=_[r];(c.min!=null||c.max!=null)&&(H[r]={min:c.min,max:c.max},c.min=c.max=null)}const re=t.tzDate||(r=>new Date(He(r/F))),W=t.fmtDate||Sr,it=F==1?pd(re):fd(re),Se=ic(re,sc(F==1?ud:dd,W)),ue=oc(re,ac(gd,W)),ve=[],oe=s.legend=Ve({},wd,t.legend),j=s.cursor=Ve({},Ed,{drag:{y:i==2}},t.cursor),ke=oe.show,Xe=j.show,Pe=oe.markers;oe.idxs=ve,Pe.width=ce(Pe.width),Pe.dash=ce(Pe.dash),Pe.stroke=ce(Pe.stroke),Pe.fill=ce(Pe.fill);let de,I,k,P=[],Y=[],Me,pe=!1,Oe={};if(oe.live){const r=M[1]?M[1].values:null;pe=r!=null,Me=pe?r(s,1,0):{_:0};for(let c in Me)Oe[c]=gr}if(ke)if(de=Qt("table",Sh,d),k=Qt("tbody",null,de),oe.mount(s,de),pe){I=Qt("thead",null,de,k);let r=Qt("tr",null,I);Qt("th",null,r);for(var ft in Me)Qt("th",Rl,r).textContent=ft}else Et(de,Mh),oe.live&&Et(de,kh);const Ht={show:!0},on={show:!1};function ia(r,c){if(c==0&&(pe||!oe.live||i==2))return ri;let p=[],h=Qt("tr",Eh,k,k.childNodes[c]);Et(h,r.class),r.show||Et(h,hs);let g=Qt("th",null,h);if(Pe.show){let C=Nt(Ch,g);if(c>0){let z=Pe.width(s,c);z&&(C.style.border=z+"px "+Pe.dash(s,c)+" "+Pe.stroke(s,c)),C.style.background=Pe.fill(s,c)}}let w=Nt(Rl,g);r.label instanceof HTMLElement?w.appendChild(r.label):w.textContent=r.label,c>0&&(Pe.show||(w.style.color=r.width>0?Pe.stroke(s,c):Pe.fill(s,c)),ct("click",g,C=>{if(j._lock)return;as(C);let z=M.indexOf(r);if((C.ctrlKey||C.metaKey)!=oe.isolate){let N=M.some((O,q)=>q>0&&q!=z&&O.show);M.forEach((O,q)=>{q>0&&cn(q,N?q==z?Ht:on:Ht,!0,qe.setSeries)})}else cn(z,{show:!r.show},!0,qe.setSeries)},!1),Is&&ct($l,g,C=>{j._lock||(as(C),cn(M.indexOf(r),Us,!0,qe.setSeries))},!1));for(var x in Me){let C=Qt("td",Ph,h);C.textContent="--",p.push(C)}return[h,p]}const es=new Map;function ct(r,c,p,h=!0){const g=es.get(c)||{},w=j.bind[r](s,c,p,h);w&&(gs(r,c,g[r]=w),es.set(c,g))}function Fs(r,c,p){const h=es.get(c)||{};for(let g in h)(r==null||g==r)&&(Uo(g,c,h[g]),delete h[g]);r==null&&es.delete(c)}let yn=0,ts=0,ie=0,D=0,Ae=0,Ye=0,Ts=Ae,ns=Ye,rn=ie,ss=D,xt=0,Lt=0,mt=0,jt=0;s.bbox={};let io=!1,aa=!1,Rs=!1,is=!1,oa=!1,Ft=!1;function ao(r,c,p){(p||r!=s.width||c!=s.height)&&il(r,c),Bs(!1),Rs=!0,aa=!0,qs()}function il(r,c){s.width=yn=ie=r,s.height=ts=D=c,Ae=Ye=0,Np(),Op();let p=s.bbox;xt=p.left=us(Ae*we,.5),Lt=p.top=us(Ye*we,.5),mt=p.width=us(ie*we,.5),jt=p.height=us(D*we,.5)}const Tp=3;function Rp(){let r=!1,c=0;for(;!r;){c++;let p=Wp(c),h=Up(c);r=c==Tp||p&&h,r||(il(s.width,s.height),aa=!0)}}function Ip({width:r,height:c}){ao(r,c)}s.setSize=Ip;function Np(){let r=!1,c=!1,p=!1,h=!1;B.forEach((g,w)=>{if(g.show&&g._show){let{side:x,_size:C}=g,z=x%2,N=g.label!=null?g.labelSize:0,O=C+N;O>0&&(z?(ie-=O,x==3?(Ae+=O,h=!0):p=!0):(D-=O,x==0?(Ye+=O,r=!0):c=!0))}}),os[0]=r,os[1]=p,os[2]=c,os[3]=h,ie-=In[1]+In[3],Ae+=In[3],D-=In[2]+In[0],Ye+=In[0]}function Op(){let r=Ae+ie,c=Ye+D,p=Ae,h=Ye;function g(w,x){switch(w){case 1:return r+=x,r-x;case 2:return c+=x,c-x;case 3:return p-=x,p+x;case 0:return h-=x,h+x}}B.forEach((w,x)=>{if(w.show&&w._show){let C=w.side;w._pos=g(C,w._size),w.label!=null&&(w._lpos=g(C,w.labelSize))}})}if(j.dataIdx==null){let r=j.hover,c=r.skip=new Set(r.skip??[]);c.add(void 0);let p=r.prox=ce(r.prox),h=r.bias??=0;j.dataIdx=(g,w,x,C)=>{if(w==0)return x;let z=x,N=p(g,w,x,C)??Ee,O=N>=0&&N<Ee,q=T.ori==0?ie:D,te=j.left,be=e[0],fe=e[w];if(c.has(fe[x])){z=null;let le=null,K=null,U;if(h==0||h==-1)for(U=x;le==null&&U-- >0;)c.has(fe[U])||(le=U);if(h==0||h==1)for(U=x;K==null&&U++<fe.length;)c.has(fe[U])||(K=U);if(le!=null||K!=null)if(O){let Fe=le==null?-1/0:V(be[le],T,q,0),$e=K==null?1/0:V(be[K],T,q,0),et=te-Fe,xe=$e-te;et<=xe?et<=N&&(z=le):xe<=N&&(z=K)}else z=K==null?le:le==null?K:x-le<=K-x?le:K}else O&&je(te-V(be[x],T,q,0))>N&&(z=null);return z}}const as=r=>{j.event=r};j.idxs=ve,j._lock=!1;let at=j.points;at.show=ce(at.show),at.size=ce(at.size),at.stroke=ce(at.stroke),at.width=ce(at.width),at.fill=ce(at.fill);const ln=s.focus=Ve({},t.focus||{alpha:.3},j.focus),Is=ln.prox>=0,Ns=Is&&at.one;let Tt=[],Os=[],$s=[];function al(r,c){let p=at.show(s,c);if(p instanceof HTMLElement)return Et(p,xh),Et(p,r.class),dn(p,-10,-10,ie,D),E.insertBefore(p,Tt[c]),p}function ol(r,c){if(i==1||c>0){let p=i==1&&_[r.scale].time,h=r.value;r.value=p?Ql(h)?oc(re,ac(h,W)):h||ue:h||Id,r.label=r.label||(p?Pd:Cd)}if(Ns||c>0){r.width=r.width==null?1:r.width,r.paths=r.paths||Gd||Dh,r.fillTo=ce(r.fillTo||Bd),r.pxAlign=+me(r.pxAlign,R),r.pxRound=mc(r.pxAlign),r.stroke=ce(r.stroke||null),r.fill=ce(r.fill||null),r._stroke=r._fill=r._paths=r._focus=null;let p=Nd(dt(1,r.width),1),h=r.points=Ve({},{size:p,width:dt(1,p*.2),stroke:r.stroke,space:p*2,paths:Kd,_stroke:null,_fill:null},r.points);h.show=ce(h.show),h.filter=ce(h.filter),h.fill=ce(h.fill),h.stroke=ce(h.stroke),h.paths=ce(h.paths),h.pxAlign=r.pxAlign}if(ke){let p=ia(r,c);P.splice(c,0,p[0]),Y.splice(c,0,p[1]),oe.values.push(null)}if(Xe){ve.splice(c,0,null);let p=null;Ns?c==0&&(p=al(r,c)):c>0&&(p=al(r,c)),Tt.splice(c,0,p),Os.splice(c,0,0),$s.splice(c,0,0)}Qe("addSeries",c)}function $p(r,c){c=c??M.length,r=i==1?Qo(r,c,lc,dc):Qo(r,c,{},hc),M.splice(c,0,r),ol(M[c],c)}s.addSeries=$p;function Dp(r){if(M.splice(r,1),ke){oe.values.splice(r,1),Y.splice(r,1);let c=P.splice(r,1)[0];Fs(null,c.firstChild),c.remove()}Xe&&(ve.splice(r,1),Tt.splice(r,1)[0].remove(),Os.splice(r,1),$s.splice(r,1)),Qe("delSeries",r)}s.delSeries=Dp;const os=[!1,!1,!1,!1];function Bp(r,c){if(r._show=r.show,r.show){let p=r.side%2,h=_[r.scale];h==null&&(r.scale=p?M[1].scale:$,h=_[r.scale]);let g=h.time;r.size=ce(r.size),r.space=ce(r.space),r.rotate=ce(r.rotate),Vn(r.incrs)&&r.incrs.forEach(x=>{!jn.has(x)&&jn.set(x,ou(x))}),r.incrs=ce(r.incrs||(h.distr==2?rd:g?F==1?cd:hd:ps)),r.splits=ce(r.splits||(g&&h.distr==1?it:h.distr==3?Go:h.distr==4?_d:zd)),r.stroke=ce(r.stroke),r.grid.stroke=ce(r.grid.stroke),r.ticks.stroke=ce(r.ticks.stroke),r.border.stroke=ce(r.border.stroke);let w=r.values;r.values=Vn(w)&&!Vn(w[0])?ce(w):g?Vn(w)?ic(re,sc(w,W)):Ql(w)?md(re,w):w||Se:w||Ad,r.filter=ce(r.filter||(h.distr>=3&&h.log==10?Td:h.distr==3&&h.log==2?Rd:iu)),r.font=wc(r.font),r.labelFont=wc(r.labelFont),r._size=r.size(s,null,c,0),r._space=r._rotate=r._incrs=r._found=r._splits=r._values=null,r._size>0&&(os[c]=!0,r._el=Nt(vh,m))}}function Mi(r,c,p,h){let[g,w,x,C]=p,z=c%2,N=0;return z==0&&(C||w)&&(N=c==0&&!g||c==2&&!x?He(rc.size/3):0),z==1&&(g||x)&&(N=c==1&&!w||c==3&&!C?He(uc.size/2):0),N}const rl=s.padding=(t.padding||[Mi,Mi,Mi,Mi]).map(r=>ce(me(r,Mi))),In=s._padding=rl.map((r,c)=>r(s,c,os,0));let tt,Ge=null,Ke=null;const ra=i==1?M[0].idxs:null;let Wt=null,Ei=!1;function ll(r,c){if(e=r??[],s.data=s._data=e,i==2){tt=0;for(let p=1;p<M.length;p++)tt+=e[p][0].length}else{e.length==0&&(s.data=s._data=e=[[]]),Wt=e[0],tt=Wt.length;let p=e;if(se==2){p=e.slice();let h=p[0]=Array(tt);for(let g=0;g<tt;g++)h[g]=g}s._data=e=p}if(Bs(!0),Qe("setData"),se==2&&(Rs=!0),c!==!1){let p=T;p.auto(s,Ei)?oo():On($,p.min,p.max),is=is||j.left>=0,Ft=!0,qs()}}s.setData=ll;function oo(){Ei=!0;let r,c;i==1&&(tt>0?(Ge=ra[0]=0,Ke=ra[1]=tt-1,r=e[0][Ge],c=e[0][Ke],se==2?(r=Ge,c=Ke):r==c&&(se==3?[r,c]=qa(r,r,T.log,!1):se==4?[r,c]=br(r,r,T.log,!1):T.time?c=r+He(86400/F):[r,c]=za(r,c,wr,!0))):(Ge=ra[0]=r=null,Ke=ra[1]=c=null)),On($,r,c)}let la,Ds,ro,lo,co,uo,po,ho,fo,gt;function cl(r,c,p,h,g,w){r??=Nl,p??=xr,h??="butt",g??=Nl,w??="round",r!=la&&(f.strokeStyle=la=r),g!=Ds&&(f.fillStyle=Ds=g),c!=ro&&(f.lineWidth=ro=c),w!=co&&(f.lineJoin=co=w),h!=uo&&(f.lineCap=uo=h),p!=lo&&f.setLineDash(lo=p)}function ul(r,c,p,h){c!=Ds&&(f.fillStyle=Ds=c),r!=po&&(f.font=po=r),p!=ho&&(f.textAlign=ho=p),h!=fo&&(f.textBaseline=fo=h)}function mo(r,c,p,h,g=0){if(h.length>0&&r.auto(s,Ei)&&(c==null||c.min==null)){let w=me(Ge,0),x=me(Ke,h.length-1),C=p.min==null?Th(h,w,x,g,r.distr==3):[p.min,p.max];r.min=tn(r.min,p.min=C[0]),r.max=dt(r.max,p.max=C[1])}}const pl={min:null,max:null};function qp(){for(let h in _){let g=_[h];H[h]==null&&(g.min==null||H[$]!=null&&g.auto(s,Ei))&&(H[h]=pl)}for(let h in _){let g=_[h];H[h]==null&&g.from!=null&&H[g.from]!=null&&(H[h]=pl)}H[$]!=null&&Bs(!0);let r={};for(let h in H){let g=H[h];if(g!=null){let w=r[h]=li(_[h],Vh);if(g.min!=null)Ve(w,g);else if(h!=$||i==2)if(tt==0&&w.from==null){let x=w.range(s,null,null,h);w.min=x[0],w.max=x[1]}else w.min=Ee,w.max=-Ee}}if(tt>0){M.forEach((h,g)=>{if(i==1){let w=h.scale,x=H[w];if(x==null)return;let C=r[w];if(g==0){let z=C.range(s,C.min,C.max,w);C.min=z[0],C.max=z[1],Ge=en(C.min,e[0]),Ke=en(C.max,e[0]),Ke-Ge>1&&(e[0][Ge]<C.min&&Ge++,e[0][Ke]>C.max&&Ke--),h.min=Wt[Ge],h.max=Wt[Ke]}else h.show&&h.auto&&mo(C,x,h,e[g],h.sorted);h.idxs[0]=Ge,h.idxs[1]=Ke}else if(g>0&&h.show&&h.auto){let[w,x]=h.facets,C=w.scale,z=x.scale,[N,O]=e[g],q=r[C],te=r[z];q!=null&&mo(q,H[C],w,N,w.sorted),te!=null&&mo(te,H[z],x,O,x.sorted),h.min=x.min,h.max=x.max}});for(let h in r){let g=r[h],w=H[h];if(g.from==null&&(w==null||w.min==null)){let x=g.range(s,g.min==Ee?null:g.min,g.max==-Ee?null:g.max,h);g.min=x[0],g.max=x[1]}}}for(let h in r){let g=r[h];if(g.from!=null){let w=r[g.from];if(w.min==null)g.min=g.max=null;else{let x=g.range(s,w.min,w.max,h);g.min=x[0],g.max=x[1]}}}let c={},p=!1;for(let h in r){let g=r[h],w=_[h];if(w.min!=g.min||w.max!=g.max){w.min=g.min,w.max=g.max;let x=w.distr;w._min=x==3?Cn(w.min):x==4?Lo(w.min,w.asinh):x==100?w.fwd(w.min):w.min,w._max=x==3?Cn(w.max):x==4?Lo(w.max,w.asinh):x==100?w.fwd(w.max):w.max,c[h]=p=!0}}if(p){M.forEach((h,g)=>{i==2?g>0&&c.y&&(h._paths=null):c[h.scale]&&(h._paths=null)});for(let h in c)Rs=!0,Qe("setScale",h);Xe&&j.left>=0&&(is=Ft=!0)}for(let h in H)H[h]=null}function Vp(r){let c=Xo(Ge-1,0,tt-1),p=Xo(Ke+1,0,tt-1);for(;r[c]==null&&c>0;)c--;for(;r[p]==null&&p<tt-1;)p++;return[c,p]}function Yp(){if(tt>0){let r=M.some(c=>c._focus)&&gt!=ln.alpha;r&&(f.globalAlpha=gt=ln.alpha),M.forEach((c,p)=>{if(p>0&&c.show&&(hl(p,!1),hl(p,!0),c._paths==null)){let h=gt;gt!=c.alpha&&(f.globalAlpha=gt=c.alpha);let g=i==2?[0,e[p][0].length-1]:Vp(e[p]);c._paths=c.paths(s,p,g[0],g[1]),gt!=h&&(f.globalAlpha=gt=h)}}),M.forEach((c,p)=>{if(p>0&&c.show){let h=gt;gt!=c.alpha&&(f.globalAlpha=gt=c.alpha),c._paths!=null&&dl(p,!1);{let g=c._paths!=null?c._paths.gaps:null,w=c.points.show(s,p,Ge,Ke,g),x=c.points.filter(s,p,w,g);(w||x)&&(c.points._paths=c.points.paths(s,p,Ge,Ke,x),dl(p,!0))}gt!=h&&(f.globalAlpha=gt=h),Qe("drawSeries",p)}}),r&&(f.globalAlpha=gt=1)}}function hl(r,c){let p=c?M[r].points:M[r];p._stroke=p.stroke(s,r),p._fill=p.fill(s,r)}function dl(r,c){let p=c?M[r].points:M[r],{stroke:h,fill:g,clip:w,flags:x,_stroke:C=p._stroke,_fill:z=p._fill,_width:N=p.width}=p._paths;N=Ce(N*we,3);let O=null,q=N%2/2;c&&z==null&&(z=N>0?"#fff":C);let te=p.pxAlign==1&&q>0;if(te&&f.translate(q,q),!c){let be=xt-N/2,fe=Lt-N/2,le=mt+N,K=jt+N;O=new Path2D,O.rect(be,fe,le,K)}c?go(C,N,p.dash,p.cap,z,h,g,x,w):Hp(r,C,N,p.dash,p.cap,z,h,g,x,O,w),te&&f.translate(-q,-q)}function Hp(r,c,p,h,g,w,x,C,z,N,O){let q=!1;z!=0&&Z.forEach((te,be)=>{if(te.series[0]==r){let fe=M[te.series[1]],le=e[te.series[1]],K=(fe._paths||qi).band;Vn(K)&&(K=te.dir==1?K[0]:K[1]);let U,Fe=null;fe.show&&K&&Ih(le,Ge,Ke)?(Fe=te.fill(s,be)||w,U=fe._paths.clip):K=null,go(c,p,h,g,Fe,x,C,z,N,O,U,K),q=!0}}),q||go(c,p,h,g,w,x,C,z,N,O)}const fl=ci|Zo;function go(r,c,p,h,g,w,x,C,z,N,O,q){cl(r,c,p,h,g),(z||N||q)&&(f.save(),z&&f.clip(z),N&&f.clip(N)),q?(C&fl)==fl?(f.clip(q),O&&f.clip(O),ua(g,x),ca(r,w,c)):C&Zo?(ua(g,x),f.clip(q),ca(r,w,c)):C&ci&&(f.save(),f.clip(q),O&&f.clip(O),ua(g,x),f.restore(),ca(r,w,c)):(ua(g,x),ca(r,w,c)),(z||N||q)&&f.restore()}function ca(r,c,p){p>0&&(c instanceof Map?c.forEach((h,g)=>{f.strokeStyle=la=g,f.stroke(h)}):c!=null&&r&&f.stroke(c))}function ua(r,c){c instanceof Map?c.forEach((p,h)=>{f.fillStyle=Ds=h,f.fill(p)}):c!=null&&r&&f.fill(c)}function jp(r,c,p,h){let g=B[r],w;if(h<=0)w=[0,0];else{let x=g._space=g.space(s,r,c,p,h),C=g._incrs=g.incrs(s,r,c,p,h,x);w=nf(c,p,C,h,x)}return g._found=w}function vo(r,c,p,h,g,w,x,C,z,N){let O=x%2/2;R==1&&f.translate(O,O),cl(C,x,z,N,C),f.beginPath();let q,te,be,fe,le=g+(h==0||h==3?-w:w);p==0?(te=g,fe=le):(q=g,be=le);for(let K=0;K<r.length;K++)c[K]!=null&&(p==0?q=be=r[K]:te=fe=r[K],f.moveTo(q,te),f.lineTo(be,fe));f.stroke(),R==1&&f.translate(-O,-O)}function Wp(r){let c=!0;return B.forEach((p,h)=>{if(!p.show)return;let g=_[p.scale];if(g.min==null){p._show&&(c=!1,p._show=!1,Bs(!1));return}else p._show||(c=!1,p._show=!0,Bs(!1));let w=p.side,x=w%2,{min:C,max:z}=g,[N,O]=jp(h,C,z,x==0?ie:D);if(O==0)return;let q=g.distr==2,te=p._splits=p.splits(s,h,C,z,N,O,q),be=g.distr==2?te.map(U=>Wt[U]):te,fe=g.distr==2?Wt[te[1]]-Wt[te[0]]:N,le=p._values=p.values(s,p.filter(s,be,h,O,fe),h,O,fe);p._rotate=w==2?p.rotate(s,le,h,O):0;let K=p._size;p._size=$t(p.size(s,le,h,r)),K!=null&&p._size!=K&&(c=!1)}),c}function Up(r){let c=!0;return rl.forEach((p,h)=>{let g=p(s,h,os,r);g!=In[h]&&(c=!1),In[h]=g}),c}function Xp(){for(let r=0;r<B.length;r++){let c=B[r];if(!c.show||!c._show)continue;let p=c.side,h=p%2,g,w,x=c.stroke(s,r),C=p==0||p==3?-1:1,[z,N]=c._found;if(c.label!=null){let pt=c.labelGap*C,Mt=He((c._lpos+pt)*we);ul(c.labelFont[0],x,"center",p==2?Li:Il),f.save(),h==1?(g=w=0,f.translate(Mt,He(Lt+jt/2)),f.rotate((p==3?-Ea:Ea)/2)):(g=He(xt+mt/2),w=Mt);let cs=nu(c.label)?c.label(s,r,z,N):c.label;f.fillText(cs,g,w),f.restore()}if(N==0)continue;let O=_[c.scale],q=h==0?mt:jt,te=h==0?xt:Lt,be=c._splits,fe=O.distr==2?be.map(pt=>Wt[pt]):be,le=O.distr==2?Wt[be[1]]-Wt[be[0]]:z,K=c.ticks,U=c.border,Fe=K.show?K.size:0,$e=He(Fe*we),et=He((c.alignTo==2?c._size-Fe-c.gap:c.gap)*we),xe=c._rotate*-Ea/180,De=L(c._pos*we),St=($e+et)*C,ut=De+St;w=h==0?ut:0,g=h==1?ut:0;let Rt=c.font[0],Ut=c.align==1?Gs:c.align==2?Ao:xe>0?Gs:xe<0?Ao:h==0?"center":p==3?Ao:Gs,pn=xe||h==1?"middle":p==2?Li:Il;ul(Rt,x,Ut,pn);let kt=c.font[1]*c.lineGap,It=be.map(pt=>L(l(pt,O,q,te))),Xt=c._values;for(let pt=0;pt<Xt.length;pt++){let Mt=Xt[pt];if(Mt!=null){h==0?g=It[pt]:w=It[pt],Mt=""+Mt;let cs=Mt.indexOf(`
`)==-1?[Mt]:Mt.split(/\n/gm);for(let ht=0;ht<cs.length;ht++){let Tl=cs[ht];xe?(f.save(),f.translate(g,w+ht*kt),f.rotate(xe),f.fillText(Tl,0,0),f.restore()):f.fillText(Tl,g,w+ht*kt)}}}K.show&&vo(It,K.filter(s,fe,r,N,le),h,p,De,$e,Ce(K.width*we,3),K.stroke(s,r),K.dash,K.cap);let hn=c.grid;hn.show&&vo(It,hn.filter(s,fe,r,N,le),h,h==0?2:1,h==0?Lt:xt,h==0?jt:mt,Ce(hn.width*we,3),hn.stroke(s,r),hn.dash,hn.cap),U.show&&vo([De],[1],h==0?1:0,h==0?1:2,h==1?Lt:xt,h==1?jt:mt,Ce(U.width*we,3),U.stroke(s,r),U.dash,U.cap)}Qe("drawAxes")}function Bs(r){M.forEach((c,p)=>{p>0&&(c._paths=null,r&&(i==1?(c.min=null,c.max=null):c.facets.forEach(h=>{h.min=null,h.max=null})))})}let pa=!1,bo=!1,Ci=[];function Gp(){bo=!1;for(let r=0;r<Ci.length;r++)Qe(...Ci[r]);Ci.length=0}function qs(){pa||(Gh(ml),pa=!0)}function Kp(r,c=!1){pa=!0,bo=c,r(s),ml(),c&&Ci.length>0&&queueMicrotask(Gp)}s.batch=Kp;function ml(){if(io&&(qp(),io=!1),Rs&&(Rp(),Rs=!1),aa){if(Te(y,Gs,Ae),Te(y,Li,Ye),Te(y,Ii,ie),Te(y,Ni,D),Te(E,Gs,Ae),Te(E,Li,Ye),Te(E,Ii,ie),Te(E,Ni,D),Te(m,Ii,yn),Te(m,Ni,ts),v.width=He(yn*we),v.height=He(ts*we),B.forEach(({_el:r,_show:c,_size:p,_pos:h,side:g})=>{if(r!=null)if(c){let w=g===3||g===0?p:0,x=g%2==1;Te(r,x?"left":"top",h-w),Te(r,x?"width":"height",p),Te(r,x?"top":"left",x?Ye:Ae),Te(r,x?"height":"width",x?D:ie),Wo(r,hs)}else Et(r,hs)}),la=Ds=ro=co=uo=po=ho=fo=lo=null,gt=1,zi(!0),Ae!=Ts||Ye!=ns||ie!=rn||D!=ss){Bs(!1);let r=ie/rn,c=D/ss;if(Xe&&!is&&j.left>=0){j.left*=r,j.top*=c,Vs&&dn(Vs,He(j.left),0,ie,D),Ys&&dn(Ys,0,He(j.top),ie,D);for(let p=0;p<Tt.length;p++){let h=Tt[p];h!=null&&(Os[p]*=r,$s[p]*=c,dn(h,$t(Os[p]),$t($s[p]),ie,D))}}if(Le.show&&!oa&&Le.left>=0&&Le.width>0){Le.left*=r,Le.width*=r,Le.top*=c,Le.height*=c;for(let p in Mo)Te(Ws,p,Le[p])}Ts=Ae,ns=Ye,rn=ie,ss=D}Qe("setSize"),aa=!1}yn>0&&ts>0&&(f.clearRect(0,0,v.width,v.height),Qe("drawClear"),G.forEach(r=>r()),Qe("draw")),Le.show&&oa&&(ha(Le),oa=!1),Xe&&is&&(ls(null,!0,!1),is=!1),oe.show&&oe.live&&Ft&&(So(),Ft=!1),u||(u=!0,s.status=1,Qe("ready")),Ei=!1,pa=!1}s.redraw=(r,c)=>{Rs=c||!1,r!==!1?On($,T.min,T.max):qs()};function wo(r,c){let p=_[r];if(p.from==null){if(tt==0){let h=p.range(s,c.min,c.max,r);c.min=h[0],c.max=h[1]}if(c.min>c.max){let h=c.min;c.min=c.max,c.max=h}if(tt>1&&c.min!=null&&c.max!=null&&c.max-c.min<1e-16)return;r==$&&p.distr==2&&tt>0&&(c.min=en(c.min,e[0]),c.max=en(c.max,e[0]),c.min==c.max&&c.max++),H[r]=c,io=!0,qs()}}s.setScale=wo;let yo,xo,Vs,Ys,gl,vl,Hs,js,bl,wl,_e,Ne,Nn=!1;const nt=j.drag;let Ze=nt.x,Je=nt.y;Xe&&(j.x&&(yo=Nt(wh,E)),j.y&&(xo=Nt(yh,E)),T.ori==0?(Vs=yo,Ys=xo):(Vs=xo,Ys=yo),_e=j.left,Ne=j.top);const Le=s.select=Ve({show:!0,over:!0,left:0,width:0,top:0,height:0},t.select),Ws=Le.show?Nt(bh,Le.over?E:y):null;function ha(r,c){if(Le.show){for(let p in r)Le[p]=r[p],p in Mo&&Te(Ws,p,r[p]);c!==!1&&Qe("setSelect")}}s.setSelect=ha;function Zp(r){if(M[r].show)ke&&Wo(P[r],hs);else if(ke&&Et(P[r],hs),Xe){let p=Ns?Tt[0]:Tt[r];p!=null&&dn(p,-10,-10,ie,D)}}function On(r,c,p){wo(r,{min:c,max:p})}function cn(r,c,p,h){c.focus!=null&&nh(r),c.show!=null&&M.forEach((g,w)=>{w>0&&(r==w||r==null)&&(g.show=c.show,Zp(w),i==2?(On(g.facets[0].scale,null,null),On(g.facets[1].scale,null,null)):On(g.scale,null,null),qs())}),p!==!1&&Qe("setSeries",r,c),h&&_i("setSeries",s,r,c)}s.setSeries=cn;function Jp(r,c){Ve(Z[r],c)}function Qp(r,c){r.fill=ce(r.fill||null),r.dir=me(r.dir,-1),c=c??Z.length,Z.splice(c,0,r)}function eh(r){r==null?Z.length=0:Z.splice(r,1)}s.addBand=Qp,s.setBand=Jp,s.delBand=eh;function th(r,c){M[r].alpha=c,Xe&&Tt[r]!=null&&(Tt[r].style.opacity=c),ke&&P[r]&&(P[r].style.opacity=c)}let xn,$n,rs;const Us={focus:!0};function nh(r){if(r!=rs){let c=r==null,p=ln.alpha!=1;M.forEach((h,g)=>{if(i==1||g>0){let w=c||g==0||g==r;h._focus=c?null:w,p&&th(g,w?1:ln.alpha)}}),rs=r,p&&qs()}}ke&&Is&&ct(Dl,de,r=>{j._lock||(as(r),rs!=null&&cn(null,Us,!0,qe.setSeries))});function un(r,c,p){let h=_[c];p&&(r=r/we-(h.ori==1?Ye:Ae));let g=ie;h.ori==1&&(g=D,r=g-r),h.dir==-1&&(r=g-r);let w=h._min,x=h._max,C=r/g,z=w+(x-w)*C,N=h.distr;return N==3?oi(10,z):N==4?Oh(z,h.asinh):N==100?h.bwd(z):z}function sh(r,c){let p=un(r,$,c);return en(p,e[0],Ge,Ke)}s.valToIdx=r=>en(r,e[0]),s.posToIdx=sh,s.posToVal=un,s.valToPos=(r,c,p)=>_[c].ori==0?a(r,_[c],p?mt:ie,p?xt:0):o(r,_[c],p?jt:D,p?Lt:0),s.setCursor=(r,c,p)=>{_e=r.left,Ne=r.top,ls(null,c,p)};function yl(r,c){Te(Ws,Gs,Le.left=r),Te(Ws,Ii,Le.width=c)}function xl(r,c){Te(Ws,Li,Le.top=r),Te(Ws,Ni,Le.height=c)}let Pi=T.ori==0?yl:xl,Ai=T.ori==1?yl:xl;function ih(){if(ke&&oe.live)for(let r=i==2?1:0;r<M.length;r++){if(r==0&&pe)continue;let c=oe.values[r],p=0;for(let h in c)Y[r][p++].firstChild.nodeValue=c[h]}}function So(r,c){if(r!=null&&(r.idxs?r.idxs.forEach((p,h)=>{ve[h]=p}):qh(r.idx)||ve.fill(r.idx),oe.idx=ve[0]),ke&&oe.live){for(let p=0;p<M.length;p++)(p>0||i==1&&!pe)&&ah(p,ve[p]);ih()}Ft=!1,c!==!1&&Qe("setLegend")}s.setLegend=So;function ah(r,c){let p=M[r],h=r==0&&se==2?Wt:e[r],g;pe?g=p.values(s,r,c)??Oe:(g=p.value(s,c==null?null:h[c],r,c),g=g==null?Oe:{_:g}),oe.values[r]=g}function ls(r,c,p){bl=_e,wl=Ne,[_e,Ne]=j.move(s,_e,Ne),j.left=_e,j.top=Ne,Xe&&(Vs&&dn(Vs,He(_e),0,ie,D),Ys&&dn(Ys,0,He(Ne),ie,D));let h,g=Ge>Ke;xn=Ee,$n=null;let w=T.ori==0?ie:D,x=T.ori==1?ie:D;if(_e<0||tt==0||g){h=j.idx=null;for(let C=0;C<M.length;C++){let z=Tt[C];z!=null&&dn(z,-10,-10,ie,D)}Is&&cn(null,Us,!0,r==null&&qe.setSeries),oe.live&&(ve.fill(h),Ft=!0)}else{let C,z,N;i==1&&(C=T.ori==0?_e:Ne,z=un(C,$),h=j.idx=en(z,e[0],Ge,Ke),N=V(e[0][h],T,w,0));let O=-10,q=-10,te=0,be=0,fe=!0,le="",K="";for(let U=i==2?1:0;U<M.length;U++){let Fe=M[U],$e=ve[U],et=$e==null?null:i==1?e[U][$e]:e[U][1][$e],xe=j.dataIdx(s,U,h,z),De=xe==null?null:i==1?e[U][xe]:e[U][1][xe];if(Ft=Ft||De!=et||xe!=$e,ve[U]=xe,U>0&&Fe.show){let St=xe==null?-10:xe==h?N:V(i==1?e[0][xe]:e[U][0][xe],T,w,0),ut=De==null?-10:J(De,i==1?_[Fe.scale]:_[Fe.facets[1].scale],x,0);if(Is&&De!=null){let Rt=T.ori==1?_e:Ne,Ut=je(ln.dist(s,U,xe,ut,Rt));if(Ut<xn){let pn=ln.bias;if(pn!=0){let kt=un(Rt,Fe.scale),It=De>=0?1:-1,Xt=kt>=0?1:-1;Xt==It&&(Xt==1?pn==1?De>=kt:De<=kt:pn==1?De<=kt:De>=kt)&&(xn=Ut,$n=U)}else xn=Ut,$n=U}}if(Ft||Ns){let Rt,Ut;T.ori==0?(Rt=St,Ut=ut):(Rt=ut,Ut=St);let pn,kt,It,Xt,hn,pt,Mt=!0,cs=at.bbox;if(cs!=null){Mt=!1;let ht=cs(s,U);It=ht.left,Xt=ht.top,pn=ht.width,kt=ht.height}else It=Rt,Xt=Ut,pn=kt=at.size(s,U);if(pt=at.fill(s,U),hn=at.stroke(s,U),Ns)U==$n&&xn<=ln.prox&&(O=It,q=Xt,te=pn,be=kt,fe=Mt,le=pt,K=hn);else{let ht=Tt[U];ht!=null&&(Os[U]=It,$s[U]=Xt,Wl(ht,pn,kt,Mt),Hl(ht,pt,hn),dn(ht,$t(It),$t(Xt),ie,D))}}}}if(Ns){let U=ln.prox,Fe=rs==null?xn<=U:xn>U||$n!=rs;if(Ft||Fe){let $e=Tt[0];$e!=null&&(Os[0]=O,$s[0]=q,Wl($e,te,be,fe),Hl($e,le,K),dn($e,$t(O),$t(q),ie,D))}}}if(Le.show&&Nn)if(r!=null){let[C,z]=qe.scales,[N,O]=qe.match,[q,te]=r.cursor.sync.scales,be=r.cursor.drag;if(Ze=be._x,Je=be._y,Ze||Je){let{left:fe,top:le,width:K,height:U}=r.select,Fe=r.scales[q].ori,$e=r.posToVal,et,xe,De,St,ut,Rt=C!=null&&N(C,q),Ut=z!=null&&O(z,te);Rt&&Ze?(Fe==0?(et=fe,xe=K):(et=le,xe=U),De=_[C],St=V($e(et,q),De,w,0),ut=V($e(et+xe,q),De,w,0),Pi(tn(St,ut),je(ut-St))):Pi(0,w),Ut&&Je?(Fe==1?(et=fe,xe=K):(et=le,xe=U),De=_[z],St=J($e(et,te),De,x,0),ut=J($e(et+xe,te),De,x,0),Ai(tn(St,ut),je(ut-St))):Ai(0,x)}else Eo()}else{let C=je(bl-gl),z=je(wl-vl);if(T.ori==1){let te=C;C=z,z=te}Ze=nt.x&&C>=nt.dist,Je=nt.y&&z>=nt.dist;let N=nt.uni;N!=null?Ze&&Je&&(Ze=C>=N,Je=z>=N,!Ze&&!Je&&(z>C?Je=!0:Ze=!0)):nt.x&&nt.y&&(Ze||Je)&&(Ze=Je=!0);let O,q;Ze&&(T.ori==0?(O=Hs,q=_e):(O=js,q=Ne),Pi(tn(O,q),je(q-O)),Je||Ai(0,x)),Je&&(T.ori==1?(O=Hs,q=_e):(O=js,q=Ne),Ai(tn(O,q),je(q-O)),Ze||Pi(0,w)),!Ze&&!Je&&(Pi(0,0),Ai(0,0))}if(nt._x=Ze,nt._y=Je,r==null){if(p){if(Fl!=null){let[C,z]=qe.scales;qe.values[0]=C!=null?un(T.ori==0?_e:Ne,C):null,qe.values[1]=z!=null?un(T.ori==1?_e:Ne,z):null}_i(zo,s,_e,Ne,ie,D,h)}if(Is){let C=p&&qe.setSeries,z=ln.prox;rs==null?xn<=z&&cn($n,Us,!0,C):xn>z?cn(null,Us,!0,C):$n!=rs&&cn($n,Us,!0,C)}}Ft&&(oe.idx=h,So()),c!==!1&&Qe("setCursor")}let Dn=null;Object.defineProperty(s,"rect",{get(){return Dn==null&&zi(!1),Dn}});function zi(r=!1){r?Dn=null:(Dn=E.getBoundingClientRect(),Qe("syncRect",Dn))}function Sl(r,c,p,h,g,w,x){j._lock||Nn&&r!=null&&r.movementX==0&&r.movementY==0||(ko(r,c,p,h,g,w,x,!1,r!=null),r!=null?ls(null,!0,!0):ls(c,!0,!1))}function ko(r,c,p,h,g,w,x,C,z){if(Dn==null&&zi(!1),as(r),r!=null)p=r.clientX-Dn.left,h=r.clientY-Dn.top;else{if(p<0||h<0){_e=-10,Ne=-10;return}let[N,O]=qe.scales,q=c.cursor.sync,[te,be]=q.values,[fe,le]=q.scales,[K,U]=qe.match,Fe=c.axes[0].side%2==1,$e=T.ori==0?ie:D,et=T.ori==1?ie:D,xe=Fe?w:g,De=Fe?g:w,St=Fe?h:p,ut=Fe?p:h;if(fe!=null?p=K(N,fe)?l(te,_[N],$e,0):-10:p=$e*(St/xe),le!=null?h=U(O,le)?l(be,_[O],et,0):-10:h=et*(ut/De),T.ori==1){let Rt=p;p=h,h=Rt}}z&&(c==null||c.cursor.event.type==zo)&&((p<=1||p>=ie-1)&&(p=us(p,ie)),(h<=1||h>=D-1)&&(h=us(h,D))),C?(gl=p,vl=h,[Hs,js]=j.move(s,p,h)):(_e=p,Ne=h)}const Mo={width:0,height:0,left:0,top:0};function Eo(){ha(Mo,!1)}let kl,Ml,El,Cl;function Pl(r,c,p,h,g,w,x){Nn=!0,Ze=Je=nt._x=nt._y=!1,ko(r,c,p,h,g,w,x,!0,!1),r!=null&&(ct(_o,Ho,Al,!1),_i(Ol,s,Hs,js,ie,D,null));let{left:C,top:z,width:N,height:O}=Le;kl=C,Ml=z,El=N,Cl=O}function Al(r,c,p,h,g,w,x){Nn=nt._x=nt._y=!1,ko(r,c,p,h,g,w,x,!1,!0);let{left:C,top:z,width:N,height:O}=Le,q=N>0||O>0,te=kl!=C||Ml!=z||El!=N||Cl!=O;if(q&&te&&ha(Le),nt.setScale&&q&&te){let be=C,fe=N,le=z,K=O;if(T.ori==1&&(be=z,fe=O,le=C,K=N),Ze&&On($,un(be,$),un(be+fe,$)),Je)for(let U in _){let Fe=_[U];U!=$&&Fe.from==null&&Fe.min!=Ee&&On(U,un(le+K,U),un(le,U))}Eo()}else j.lock&&(j._lock=!j._lock,ls(c,!0,r!=null));r!=null&&(Fs(_o,Ho),_i(_o,s,_e,Ne,ie,D,null))}function oh(r,c,p,h,g,w,x){if(j._lock)return;as(r);let C=Nn;if(Nn){let z=!0,N=!0,O=10,q,te;T.ori==0?(q=Ze,te=Je):(q=Je,te=Ze),q&&te&&(z=_e<=O||_e>=ie-O,N=Ne<=O||Ne>=D-O),q&&z&&(_e=_e<Hs?0:ie),te&&N&&(Ne=Ne<js?0:D),ls(null,!0,!0),Nn=!1}_e=-10,Ne=-10,ve.fill(null),ls(null,!0,!0),C&&(Nn=C)}function zl(r,c,p,h,g,w,x){j._lock||(as(r),oo(),Eo(),r!=null&&_i(Bl,s,_e,Ne,ie,D,null))}function _l(){B.forEach(sf),ao(s.width,s.height,!0)}gs(Aa,ni,_l);const Xs={};Xs.mousedown=Pl,Xs.mousemove=Sl,Xs.mouseup=Al,Xs.dblclick=zl,Xs.setSeries=(r,c,p,h)=>{let g=qe.match[2];p=g(s,c,p),p!=-1&&cn(p,h,!0,!1)},Xe&&(ct(Ol,E,Pl),ct(zo,E,Sl),ct($l,E,r=>{as(r),zi(!1)}),ct(Dl,E,oh),ct(Bl,E,zl),Jo.add(s),s.syncRect=zi);const da=s.hooks=t.hooks||{};function Qe(r,c,p){bo?Ci.push([r,c,p]):r in da&&da[r].forEach(h=>{h.call(null,s,c,p)})}(t.plugins||[]).forEach(r=>{for(let c in r.hooks)da[c]=(da[c]||[]).concat(r.hooks[c])});const Ll=(r,c,p)=>p,qe=Ve({key:null,setSeries:!1,filters:{pub:Zl,sub:Zl},scales:[$,M[1]?M[1].scale:null],match:[Jl,Jl,Ll],values:[null,null]},j.sync);qe.match.length==2&&qe.match.push(Ll),j.sync=qe;const Fl=qe.key,Co=Cu(Fl);function _i(r,c,p,h,g,w,x){qe.filters.pub(r,c,p,h,g,w,x)&&Co.pub(r,c,p,h,g,w,x)}Co.sub(s);function rh(r,c,p,h,g,w,x){qe.filters.sub(r,c,p,h,g,w,x)&&Xs[r](null,c,p,h,g,w,x)}s.pub=rh;function lh(){Co.unsub(s),Jo.delete(s),es.clear(),Uo(Aa,ni,_l),d.remove(),de?.remove(),Qe("destroy")}s.destroy=lh;function Po(){Qe("init",t,e),ll(e||t.data,!1),H[$]?wo($,H[$]):oo(),oa=Le.show&&(Le.width>0||Le.height>0),is=Ft=!0,ao(t.width,t.height)}return M.forEach(ol),B.forEach(Bp),n?n instanceof HTMLElement?(n.appendChild(d),Po()):n(s,Po):Po(),s}Re.assign=Ve;Re.fmtNum=yr;Re.rangeNum=za;Re.rangeLog=qa;Re.rangeAsinh=br;Re.orient=As;Re.pxRatio=we;Re.join=Xh;Re.fmtDate=Sr,Re.tzDate=ad;Re.sync=Cu;{Re.addGap=qd,Re.clipGaps=Ha;let t=Re.paths={points:Fu};t.linear=Ru,t.stepped=Hd,t.bars=jd,t.spline=Ud}const We={axis:"#93a7b3",grid:"#1c2a33",green:"#4fd17f",red:"#ef6461",orange:"#ff9f43",blue:"#62a8ff",yellow:"#f2c94c"};function bt(t={}){return{stroke:We.axis,grid:{stroke:We.grid,width:1},...t}}var Dt="INUMBER",wi="IOP1",yi="IOP2",xi="IOP3",zn="IVAR",ys="IVARNAME",ui="IFUNCALL",Xa="IFUNDEF",yt="IEXPR",zr="IEXPREVAL",zs="IMEMBER",Ga="IENDSTATEMENT",pi="IARRAY";function he(t,e){this.type=t,this.value=e??0}he.prototype.toString=function(){switch(this.type){case Dt:case wi:case yi:case xi:case zn:case ys:case Ga:return this.value;case ui:return"CALL "+this.value;case Xa:return"DEF "+this.value;case pi:return"ARRAY "+this.value;case zs:return"."+this.value;default:return"Invalid Instruction"}};function Ka(t){return new he(wi,t)}function Rn(t){return new he(yi,t)}function $u(t){return new he(xi,t)}function er(t,e,n,s,i){for(var a=[],o=[],l,u,d,v,f=0;f<t.length;f++){var m=t[f],y=m.type;if(y===Dt||y===ys)Array.isArray(m.value)?a.push.apply(a,er(m.value.map(function(E){return new he(Dt,E)}).concat(new he(pi,m.value.length)),e,n,s,i)):a.push(m);else if(y===zn&&Object.hasOwn(i,m.value))m=new he(Dt,i[m.value]),a.push(m);else if(y===yi&&a.length>1)u=a.pop(),l=a.pop(),v=n[m.value],m=new he(Dt,v(l.value,u.value)),a.push(m);else if(y===xi&&a.length>2)d=a.pop(),u=a.pop(),l=a.pop(),m.value==="?"?a.push(l.value?u.value:d.value):(v=s[m.value],m=new he(Dt,v(l.value,u.value,d.value)),a.push(m));else if(y===wi&&a.length>0)l=a.pop(),v=e[m.value],m=new he(Dt,v(l.value)),a.push(m);else if(y===yt){for(;a.length>0;)o.push(a.shift());o.push(new he(yt,er(m.value,e,n,s,i)))}else if(y===zs&&a.length>0)l=a.pop(),a.push(new he(Dt,l.value[m.value]));else{for(;a.length>0;)o.push(a.shift());o.push(m)}}for(;a.length>0;)o.push(a.shift());return o}function Du(t,e,n){for(var s=[],i=0;i<t.length;i++){var a=t[i],o=a.type;if(o===zn&&a.value===e)for(var l=0;l<n.tokens.length;l++){var u=n.tokens[l],d;u.type===wi?d=Ka(u.value):u.type===yi?d=Rn(u.value):u.type===xi?d=$u(u.value):d=new he(u.type,u.value),s.push(d)}else o===yt?s.push(new he(yt,Du(a.value,e,n))):s.push(a)}return s}function yc(t,e,n){for(var s in e.functions)if(e.functions[s]===t)return!0;if(t.__expr_eval_safe_def)return!0;for(var i in n)if(typeof n[i]=="object"&&n[i]!==null){for(var a in n[i])if(n[i][a]===t)return!0}return!1}function ds(t,e,n){var s=[],i,a,o,l,u,d;if(_r(t))return Sn(t,n);for(var v=t.length,f=0;f<v;f++){var m=t[f],y=m.type;if(y===Dt||y===ys)s.push(m.value);else if(y===yi)a=s.pop(),i=s.pop(),m.value==="and"?s.push(i?!!ds(a,e,n):!1):m.value==="or"?s.push(i?!0:!!ds(a,e,n)):m.value==="="?(l=e.binaryOps[m.value],s.push(l(i,ds(a,e,n),n))):(l=e.binaryOps[m.value],s.push(l(Sn(i,n),Sn(a,n))));else if(y===xi)o=s.pop(),a=s.pop(),i=s.pop(),m.value==="?"?s.push(ds(i?a:o,e,n)):(l=e.ternaryOps[m.value],s.push(l(Sn(i,n),Sn(a,n),Sn(o,n))));else if(y===zn){if(/^__proto__|prototype|constructor$/.test(m.value))throw new Error("prototype access detected");if(m.value in e.functions)s.push(e.functions[m.value]);else if(m.value in e.unaryOps&&e.parser.isOperatorEnabled(m.value))s.push(e.unaryOps[m.value]);else{var E=n[m.value];if(E!==void 0){if(typeof E=="function"&&!yc(E,e,n))throw new Error("Variable references an unallowed function: "+m.value);s.push(E)}else throw new Error("undefined variable: "+m.value)}}else if(y===wi)i=s.pop(),l=e.unaryOps[m.value],s.push(l(Sn(i,n)));else if(y===ui){for(d=m.value,u=[];d-- >0;)u.unshift(Sn(s.pop(),n));if(l=s.pop(),!yc(l,e,n))throw new Error("Is not an allowed function.");if(l.apply&&l.call)s.push(l.apply(void 0,u));else throw new Error(l+" is not a function")}else if(y===Xa)s.push((function(){for(var R=s.pop(),L=[],F=m.value;F-- >0;)L.unshift(s.pop());var M=s.pop(),B=function(){for(var _=Object.assign({},n),Z=0,$=L.length;Z<$;Z++)_[L[Z]]=arguments[Z];return ds(R,e,_)};return Object.defineProperty(B,"name",{value:M,writable:!1}),Object.defineProperty(B,"__expr_eval_safe_def",{value:!0,writable:!1}),n[M]=B,B})());else if(y===yt)s.push(af(m,e));else if(y===zr)s.push(m);else if(y===zs)i=s.pop(),s.push(i[m.value]);else if(y===Ga)s.pop();else if(y===pi){for(d=m.value,u=[];d-- >0;)u.unshift(s.pop());s.push(u)}else throw new Error("invalid Expression")}if(s.length>1)throw new Error("invalid Expression (parity)");return s[0]===0?0:Sn(s[0],n)}function af(t,e,n){return _r(t)?t:{type:zr,value:function(s){return ds(t.value,e,s)}}}function _r(t){return t&&t.type===zr}function Sn(t,e){return _r(t)?t.value(e):t}function Lr(t,e){for(var n=[],s,i,a,o,l,u,d=0;d<t.length;d++){var v=t[d],f=v.type;if(f===Dt)typeof v.value=="number"&&v.value<0?n.push("("+v.value+")"):Array.isArray(v.value)?n.push("["+v.value.map(xc).join(", ")+"]"):n.push(xc(v.value));else if(f===yi)i=n.pop(),s=n.pop(),o=v.value,e?o==="^"?n.push("Math.pow("+s+", "+i+")"):o==="and"?n.push("(!!"+s+" && !!"+i+")"):o==="or"?n.push("(!!"+s+" || !!"+i+")"):o==="||"?n.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }(("+s+"),("+i+")))"):o==="=="?n.push("("+s+" === "+i+")"):o==="!="?n.push("("+s+" !== "+i+")"):o==="["?n.push(s+"[("+i+") | 0]"):n.push("("+s+" "+o+" "+i+")"):o==="["?n.push(s+"["+i+"]"):n.push("("+s+" "+o+" "+i+")");else if(f===xi)if(a=n.pop(),i=n.pop(),s=n.pop(),o=v.value,o==="?")n.push("("+s+" ? "+i+" : "+a+")");else throw new Error("invalid Expression");else if(f===zn||f===ys)n.push(v.value);else if(f===wi)s=n.pop(),o=v.value,o==="-"||o==="+"?n.push("("+o+s+")"):e?o==="not"?n.push("(!"+s+")"):o==="!"?n.push("fac("+s+")"):n.push(o+"("+s+")"):o==="!"?n.push("("+s+"!)"):n.push("("+o+" "+s+")");else if(f===ui){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());o=n.pop(),n.push(o+"("+l.join(", ")+")")}else if(f===Xa){for(i=n.pop(),u=v.value,l=[];u-- >0;)l.unshift(n.pop());s=n.pop(),e?n.push("("+s+" = function("+l.join(", ")+") { return "+i+" })"):n.push("("+s+"("+l.join(", ")+") = "+i+")")}else if(f===zs)s=n.pop(),n.push(s+"."+v.value);else if(f===pi){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());n.push("["+l.join(", ")+"]")}else if(f===yt)n.push("("+Lr(v.value,e)+")");else if(f!==Ga)throw new Error("invalid Expression")}return n.length>1&&(e?n=[n.join(",")]:n=[n.join(";")]),String(n[0])}function xc(t){return typeof t=="string"?JSON.stringify(t).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"):t}function ei(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}function Fr(t,e,n){n=n||{};for(var s=!!n.withMembers,i=null,a=0;a<t.length;a++){var o=t[a];o.type===zn||o.type===ys?!s&&!ei(e,o.value)?e.push(o.value):(i!==null&&(ei(e,i)||e.push(i)),i=o.value):o.type===zs&&s&&i!==null?i+="."+o.value:o.type===yt?Fr(o.value,e,n):i!==null&&(ei(e,i)||e.push(i),i=null)}i!==null&&!ei(e,i)&&e.push(i)}function sn(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}sn.prototype.simplify=function(t){return t=t||{},new sn(er(this.tokens,this.unaryOps,this.binaryOps,this.ternaryOps,t),this.parser)};sn.prototype.substitute=function(t,e){return e instanceof sn||(e=this.parser.parse(String(e))),new sn(Du(this.tokens,t,e),this.parser)};sn.prototype.evaluate=function(t){return t=t||{},ds(this.tokens,this,t)};sn.prototype.toString=function(){return Lr(this.tokens,!1)};sn.prototype.symbols=function(t){t=t||{};var e=[];return Fr(this.tokens,e,t),e};sn.prototype.variables=function(t){t=t||{};var e=[];Fr(this.tokens,e,t);var n=this.functions;return e.filter(function(s){return!(s in n)})};sn.prototype.toJSFunction=function(t,e){var n=this,s=new Function(t,"with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return "+Lr(this.simplify(e).tokens,!0)+"; }");return function(){return s.apply(n,arguments)}};var ji="TEOF",ze="TOP",Za="TNUMBER",Bu="TSTRING",_n="TPAREN",hi="TBRACKET",Ja="TCOMMA",Tr="TNAME",Rr="TSEMICOLON";function qu(t,e,n){this.type=t,this.value=e,this.index=n}qu.prototype.toString=function(){return this.type+": "+this.value};function Be(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}Be.prototype.newToken=function(t,e,n){return new qu(t,e,n??this.pos)};Be.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current};Be.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent};Be.prototype.next=function(){if(this.pos>=this.expression.length)return this.newToken(ji,"EOF");if(this.isWhitespace()||this.isComment())return this.next();if(this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName())return this.current;this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')};Be.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if(n==="'"||n==='"')for(var s=this.expression.indexOf(n,e+1);s>=0&&this.pos<this.expression.length;){if(this.pos=s+1,this.expression.charAt(s-1)!=="\\"){var i=this.expression.substring(e+1,s);this.current=this.newToken(Bu,this.unescape(i),e),t=!0;break}s=this.expression.indexOf(n,s+1)}return t};Be.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return t==="("||t===")"?(this.current=this.newToken(_n,t),this.pos++,!0):!1};Be.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return(t==="["||t==="]")&&this.isOperatorEnabled("[")?(this.current=this.newToken(hi,t),this.pos++,!0):!1};Be.prototype.isComma=function(){var t=this.expression.charAt(this.pos);return t===","?(this.current=this.newToken(Ja,","),this.pos++,!0):!1};Be.prototype.isSemicolon=function(){var t=this.expression.charAt(this.pos);return t===";"?(this.current=this.newToken(Rr,";"),this.pos++,!0):!1};Be.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&n!=="."&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(s in this.consts)return this.current=this.newToken(Za,this.consts[s]),this.pos+=s.length,!0}return!1};Be.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(this.isOperatorEnabled(s)&&(s in this.binaryOps||s in this.unaryOps||s in this.ternaryOps))return this.current=this.newToken(ze,s),this.pos+=s.length,!0}return!1};Be.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var s=this.expression.charAt(e);if(s.toUpperCase()===s.toLowerCase()){if(e===this.pos&&(s==="$"||s==="_")){s==="_"&&(n=!0);continue}else if(e===this.pos||!n||s!=="_"&&(s<"0"||s>"9"))break}else n=!0}if(n){var i=this.expression.substring(t,e);return this.current=this.newToken(Tr,i),this.pos+=i.length,!0}return!1};Be.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);(e===" "||e==="	"||e===`
`||e==="\r")&&(t=!0,this.pos++,!(this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var of=/^[0-9a-f]{4}$/i;Be.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var s=t.charAt(++e);switch(s){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+=`
`;break;case"r":n+="\r";break;case"t":n+="	";break;case"u":var i=t.substring(e+1,e+5);of.test(i)||this.parseError("Illegal escape sequence: \\u"+i),n+=String.fromCharCode(parseInt(i,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+s+'"')}++e;var a=t.indexOf("\\",e);n+=t.substring(e,a<0?t.length:a),e=a}return n};Be.prototype.isComment=function(){var t=this.expression.charAt(this.pos);return t==="/"&&this.expression.charAt(this.pos+1)==="*"?(this.pos=this.expression.indexOf("*/",this.pos)+2,this.pos===1&&(this.pos=this.expression.length),!0):!1};Be.prototype.isRadixInteger=function(){var t=this.pos;if(t>=this.expression.length-2||this.expression.charAt(t)!=="0")return!1;++t;var e,n;if(this.expression.charAt(t)==="x")e=16,n=/^[0-9a-f]$/i,++t;else if(this.expression.charAt(t)==="b")e=2,n=/^[01]$/i,++t;else return!1;for(var s=!1,i=t;t<this.expression.length;){var a=this.expression.charAt(t);if(n.test(a))t++,s=!0;else break}return s&&(this.current=this.newToken(Za,parseInt(this.expression.substring(i,t),e)),this.pos=t),s};Be.prototype.isNumber=function(){for(var t=!1,e=this.pos,n=e,s=e,i=!1,a=!1,o;e<this.expression.length&&(o=this.expression.charAt(e),o>="0"&&o<="9"||!i&&o===".");)o==="."?i=!0:a=!0,e++,t=a;if(t&&(s=e),o==="e"||o==="E"){e++;for(var l=!0,u=!1;e<this.expression.length;){if(o=this.expression.charAt(e),l&&(o==="+"||o==="-"))l=!1;else if(o>="0"&&o<="9")u=!0,l=!1;else break;e++}u||(e=s)}return t?(this.current=this.newToken(Za,parseFloat(this.expression.substring(n,e))),this.pos=e):this.pos=s,t};Be.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if(e==="+"||e==="-"||e==="*"||e==="/"||e==="%"||e==="^"||e==="?"||e===":"||e===".")this.current=this.newToken(ze,e);else if(e==="∙"||e==="•")this.current=this.newToken(ze,"*");else if(e===">")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(ze,">="),this.pos++):this.current=this.newToken(ze,">");else if(e==="<")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(ze,"<="),this.pos++):this.current=this.newToken(ze,"<");else if(e==="|")if(this.expression.charAt(this.pos+1)==="|")this.current=this.newToken(ze,"||"),this.pos++;else return!1;else if(e==="=")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(ze,"=="),this.pos++):this.current=this.newToken(ze,e);else if(e==="!")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(ze,"!="),this.pos++):this.current=this.newToken(ze,e);else return!1;return this.pos++,this.isOperatorEnabled(this.current.value)?!0:(this.pos=t,!1)};Be.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)};Be.prototype.getCoordinates=function(){var t=0,e,n=-1;do t++,e=this.pos-n,n=this.expression.indexOf(`
`,n+1);while(n>=0&&n<this.pos);return{line:t,column:e}};Be.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};function Ie(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=n.allowMemberAccess!==!1}Ie.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()};Ie.prototype.tokenMatches=function(t,e){return typeof e>"u"?!0:Array.isArray(e)?ei(e,t.value):typeof e=="function"?e(t):t.value===e};Ie.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()};Ie.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken};Ie.prototype.accept=function(t,e){return this.nextToken.type===t&&this.tokenMatches(this.nextToken,e)?(this.next(),!0):!1};Ie.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}};Ie.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.accept(Tr)||this.accept(ze,n))t.push(new he(zn,this.current.value));else if(this.accept(Za))t.push(new he(Dt,this.current.value));else if(this.accept(Bu))t.push(new he(Dt,this.current.value));else if(this.accept(_n,"("))this.parseExpression(t),this.expect(_n,")");else if(this.accept(hi,"["))if(this.accept(hi,"]"))t.push(new he(pi,0));else{var s=this.parseArrayList(t);t.push(new he(pi,s))}else throw new Error("unexpected "+this.nextToken)};Ie.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),!this.parseUntilEndStatement(t,e)&&this.pushExpression(t,e))};Ie.prototype.pushExpression=function(t,e){for(var n=0,s=e.length;n<s;n++)t.push(e[n])};Ie.prototype.parseUntilEndStatement=function(t,e){return this.accept(Rr)?(this.nextToken&&this.nextToken.type!==ji&&!(this.nextToken.type===_n&&this.nextToken.value===")")&&e.push(new he(Ga)),this.nextToken.type!==ji&&this.parseExpression(e),t.push(new he(yt,e)),!0):!1};Ie.prototype.parseArrayList=function(t){for(var e=0;!this.accept(hi,"]");)for(this.parseExpression(t),++e;this.accept(Ja);)this.parseExpression(t),++e;return e};Ie.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(ze,"=");){var e=t.pop(),n=[],s=t.length-1;if(e.type===ui){if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var i=0,a=e.value+1;i<a;i++){var o=s-i;t[o].type===zn&&(t[o]=new he(ys,t[o].value))}this.parseVariableAssignmentExpression(n),t.push(new he(yt,n)),t.push(new he(Xa,e.value));continue}if(e.type!==zn&&e.type!==zs)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new he(ys,e.value)),t.push(new he(yt,n)),t.push(Rn("="))}};Ie.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(ze,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(ze,":"),this.parseConditionalExpression(n),t.push(new he(yt,e)),t.push(new he(yt,n)),t.push($u("?"))}};Ie.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(ze,"or");){var e=[];this.parseAndExpression(e),t.push(new he(yt,e)),t.push(Rn("or"))}};Ie.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(ze,"and");){var e=[];this.parseComparison(e),t.push(new he(yt,e)),t.push(Rn("and"))}};var rf=["==","!=","<","<=",">=",">","in"];Ie.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(ze,rf);){var e=this.current;this.parseAddSub(t),t.push(Rn(e.value))}};var lf=["+","-","||"];Ie.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(ze,lf);){var e=this.current;this.parseTerm(t),t.push(Rn(e.value))}};var cf=["*","/","%"];Ie.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(ze,cf);){var e=this.current;this.parseFactor(t),t.push(Rn(e.value))}};Ie.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.save(),this.accept(ze,n)){if(this.current.value!=="-"&&this.current.value!=="+"){if(this.nextToken.type===_n&&this.nextToken.value==="("){this.restore(),this.parseExponential(t);return}else if(this.nextToken.type===Rr||this.nextToken.type===Ja||this.nextToken.type===ji||this.nextToken.type===_n&&this.nextToken.value===")"){this.restore(),this.parseAtom(t);return}}var s=this.current;this.parseFactor(t),t.push(Ka(s.value))}else this.parseExponential(t)};Ie.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(ze,"^");)this.parseFactor(t),t.push(Rn("^"))};Ie.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(ze,"!");)t.push(Ka("!"))};Ie.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;function n(a){return a.value in e}if(this.accept(ze,n)){var s=this.current;this.parseAtom(t),t.push(Ka(s.value))}else for(this.parseMemberExpression(t);this.accept(_n,"(");)if(this.accept(_n,")"))t.push(new he(ui,0));else{var i=this.parseArgumentList(t);t.push(new he(ui,i))}};Ie.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(_n,")");)for(this.parseExpression(t),++e;this.accept(Ja);)this.parseExpression(t),++e;return e};Ie.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(ze,".")||this.accept(hi,"[");){var e=this.current;if(e.value==="."){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect(Tr),t.push(new he(zs,this.current.value))}else if(e.value==="["){if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect(hi,"]"),t.push(Rn("["))}else throw new Error("unexpected symbol: "+e.value)}};function uf(t,e){return Number(t)+Number(e)}function pf(t,e){return t-e}function hf(t,e){return t*e}function df(t,e){return t/e}function ff(t,e){return t%e}function mf(t,e){return Array.isArray(t)&&Array.isArray(e)?t.concat(e):""+t+e}function gf(t,e){return t===e}function vf(t,e){return t!==e}function bf(t,e){return t>e}function wf(t,e){return t<e}function yf(t,e){return t>=e}function xf(t,e){return t<=e}function Sf(t,e){return!!(t&&e)}function kf(t,e){return!!(t||e)}function Mf(t,e){return ei(e,t)}function Ef(t){return(Math.exp(t)-Math.exp(-t))/2}function Cf(t){return(Math.exp(t)+Math.exp(-t))/2}function Pf(t){return t===1/0?1:t===-1/0?-1:(Math.exp(t)-Math.exp(-t))/(Math.exp(t)+Math.exp(-t))}function Af(t){return t===-1/0?t:Math.log(t+Math.sqrt(t*t+1))}function zf(t){return Math.log(t+Math.sqrt(t*t-1))}function _f(t){return Math.log((1+t)/(1-t))/2}function Sc(t){return Math.log(t)*Math.LOG10E}function Lf(t){return-t}function Ff(t){return!t}function Tf(t){return t<0?Math.ceil(t):Math.floor(t)}function Rf(t){return Math.random()*(t||1)}function kc(t){return Ir(t+1)}function If(t){return isFinite(t)&&t===Math.round(t)}var Nf=4.7421875,Io=[.9999999999999971,57.15623566586292,-59.59796035547549,14.136097974741746,-.4919138160976202,3399464998481189e-20,4652362892704858e-20,-9837447530487956e-20,.0001580887032249125,-.00021026444172410488,.00021743961811521265,-.0001643181065367639,8441822398385275e-20,-26190838401581408e-21,36899182659531625e-22];function Ir(t){var e,n;if(If(t)){if(t<=0)return isFinite(t)?1/0:NaN;if(t>171)return 1/0;for(var s=t-2,i=t-1;s>1;)i*=s,s--;return i===0&&(i=1),i}if(t<.5)return Math.PI/(Math.sin(Math.PI*t)*Ir(1-t));if(t>=171.35)return 1/0;if(t>85){var a=t*t,o=a*t,l=o*t,u=l*t;return Math.sqrt(2*Math.PI/t)*Math.pow(t/Math.E,t)*(1+1/(12*t)+1/(288*a)-139/(51840*o)-571/(2488320*l)+163879/(209018880*u)+5246819/(75246796800*u*t))}--t,n=Io[0];for(var d=1;d<Io.length;++d)n+=Io[d]/(t+d);return e=t+Nf+.5,Math.sqrt(2*Math.PI)*Math.pow(e,t+.5)*Math.exp(-e)*n}function Of(t){return Array.isArray(t)?t.length:String(t).length}function Mc(){for(var t=0,e=0,n=0;n<arguments.length;n++){var s=Math.abs(arguments[n]),i;e<s?(i=e/s,t=t*i*i+1,e=s):s>0?(i=s/e,t+=i*i):t+=s}return e===1/0?1/0:e*Math.sqrt(t)}function Ec(t,e,n){return t?e:n}function $f(t,e){return typeof e>"u"||+e==0?Math.round(t):(t=+t,e=-+e,isNaN(t)||!(typeof e=="number"&&e%1===0)?NaN:(t=t.toString().split("e"),t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e))),t=t.toString().split("e"),+(t[0]+"e"+(t[1]?+t[1]+e:e))))}function Df(t,e,n){return n&&(n[t]=e),e}function Bf(t,e){return t[e|0]}function qf(t){return arguments.length===1&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function Vf(t){return arguments.length===1&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function Yf(t,e){if(typeof t!="function")throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map(function(n,s){return t(n,s)})}function Hf(t,e,n){if(typeof t!="function")throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce(function(s,i,a){return t(s,i,a)},e)}function jf(t,e){if(typeof t!="function")throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter(function(n,s){return t(n,s)})}function Wf(t,e){if(!(Array.isArray(e)||typeof e=="string"))throw new Error("Second argument to indexOf is not a string or array");return e.indexOf(t)}function Uf(t,e){if(!Array.isArray(e))throw new Error("Second argument to join is not an array");return e.join(t)}function Xf(t){return(t>0)-(t<0)||+t}var Cc=1/3;function Gf(t){return t<0?-Math.pow(-t,Cc):Math.pow(t,Cc)}function Kf(t){return Math.exp(t)-1}function Zf(t){return Math.log(1+t)}function Jf(t){return Math.log(t)/Math.LN2}function Qf(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce(function(e,n){return e+Number(n)},0)}function _s(t){this.options=t||{},this.unaryOps={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh||Ef,cosh:Math.cosh||Cf,tanh:Math.tanh||Pf,asinh:Math.asinh||Af,acosh:Math.acosh||zf,atanh:Math.atanh||_f,sqrt:Math.sqrt,cbrt:Math.cbrt||Gf,log:Math.log,log2:Math.log2||Jf,ln:Math.log,lg:Math.log10||Sc,log10:Math.log10||Sc,expm1:Math.expm1||Kf,log1p:Math.log1p||Zf,abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,trunc:Math.trunc||Tf,"-":Lf,"+":Number,exp:Math.exp,not:Ff,length:Of,"!":kc,sign:Math.sign||Xf},this.binaryOps={"+":uf,"-":pf,"*":hf,"/":df,"%":ff,"^":Math.pow,"||":mf,"==":gf,"!=":vf,">":bf,"<":wf,">=":yf,"<=":xf,and:Sf,or:kf,in:Mf,"=":Df,"[":Bf},this.ternaryOps={"?":Ec},this.functions={random:Rf,fac:kc,min:Vf,max:qf,hypot:Math.hypot||Mc,pyt:Math.hypot||Mc,pow:Math.pow,atan2:Math.atan2,if:Ec,gamma:Ir,roundTo:$f,map:Yf,fold:Hf,filter:jf,indexOf:Wf,join:Uf,sum:Qf},this.consts={E:Math.E,PI:Math.PI,true:!0,false:!1}}_s.prototype.parse=function(t){var e=[],n=new Ie(this,new Be(this,t),{allowMemberAccess:this.options.allowMemberAccess});return n.parseExpression(e),n.expect(ji,"EOF"),new sn(e,this)};_s.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var Vu=new _s;_s.parse=function(t){return Vu.parse(t)};_s.evaluate=function(t,e){return Vu.parse(t).evaluate(e)};var Pc={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",and:"logical",or:"logical",not:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};function em(t){return Object.hasOwn(Pc,t)?Pc[t]:t}_s.prototype.isOperatorEnabled=function(t){var e=em(t),n=this.options.operators||{};return!(e in n)||!!n[e]};const Jn=new _s({allowMemberAccess:!1,operators:{assignment:!1,comparison:!0,fndef:!1,in:!1,logical:!0}}),tm=[[/\bnp\.arctan2\b/g,"atan2"],[/\bnp\.arcsin\b/g,"asin"],[/\bnp\.arccos\b/g,"acos"],[/\bnp\.arctan\b/g,"atan"],[/\bnp\.(?:absolute|fabs)\b/g,"abs"],[/\bnp\.power\b/g,"pow"],[/\bnp\.maximum\b/g,"max"],[/\bnp\.minimum\b/g,"min"],[/\bnp\.square\b/g,"square"],[/\bnp\.clip\b/g,"clip"],[/\bnp\.where\b/g,"where"],[/\bnp\.heaviside\b/g,"heaviside"],[/\bnp\.deg2rad\b/g,"deg2rad"],[/\bnp\.rad2deg\b/g,"rad2deg"],[/\bnp\.pi\b/g,"PI"],[/\bnp\.e\b/g,"E"]];for(const t of["random","fac","gamma","map","fold","filter","indexOf","join","sum"])delete Jn.functions[t];Jn.functions.square=t=>t*t;Jn.functions.clip=(t,e,n)=>Math.min(Math.max(t,e),n);Jn.functions.where=(t,e,n)=>t?e:n;Jn.functions.heaviside=(t,e=.5)=>t<0?0:t>0?1:e;Jn.functions.deg2rad=t=>t*Math.PI/180;Jn.functions.rad2deg=t=>t*180/Math.PI;const nm=new Set(["ch1","ch2","times"]),Yu={mean:t=>ju(t),sum:t=>Hu(t),min:t=>va(t,Math.min),max:t=>va(t,Math.max),ptp:t=>va(t,Math.max)-va(t,Math.min),var:t=>Ac(t),std:t=>Math.sqrt(Ac(t)),median:t=>im(t)},sm=new RegExp(`\\bnp\\.(${Object.keys(Yu).join("|")})\\(\\s*(ch1|ch2|times)\\s*\\)`,"g");function Hu(t){let e=0;for(let n=0;n<t.length;n+=1)e+=t[n];return e}function ju(t){return t.length===0?Number.NaN:Hu(t)/t.length}function va(t,e){if(t.length===0)return Number.NaN;let n=t[0];for(let s=1;s<t.length;s+=1)n=e(n,t[s]);return n}function Ac(t){const e=ju(t);if(!Number.isFinite(e))return Number.NaN;let n=0;for(let s=0;s<t.length;s+=1)n+=(t[s]-e)**2;return n/t.length}function im(t){if(t.length===0)return Number.NaN;const e=Array.from(t).sort((s,i)=>s-i),n=Math.floor(e.length/2);return e.length%2===0?(e[n-1]+e[n])/2:e[n]}function am(t){let e=t.trim().replaceAll("**","^");for(const[n,s]of tm)e=e.replace(n,s);return e.replace(/\bnp\./g,"")}function om(t,e){return t.replace(sm,(n,s,i)=>{const a=Yu[s](e[i]);return Number.isFinite(a)?String(a):"(0 / 0)"})}function rm(t,e,n,s){const i=am(om(t,{ch1:e,ch2:n,times:s}));if(!i)throw new Error("formula is empty");const a=Jn.parse(i),o=a.variables().filter(d=>!nm.has(d));if(o.length>0)throw new Error(`unknown variable ${o[0]}`);const l=a.toJSFunction(["ch1","ch2","times"]),u=new Float32Array(Math.min(e.length,n.length,s.length));for(let d=0;d<u.length;d+=1){const v=Number(l(e[d],n[d],s[d]));u[d]=Number.isFinite(v)?v:Number.NaN}return u}function lm(t,e=250,n=5e3){const s=Math.max(0,Math.floor(t)),i=Math.max(1,Math.floor(e)),a=Math.max(i,Math.floor(n));return Math.min(a,i*2**Math.min(s,20))}class Qa{constructor(e,n=250,s=5e3,i=(o,l)=>window.setTimeout(o,l),a=o=>window.clearTimeout(o)){this.reconnect=e,this.baseDelay=n,this.maxDelay=s,this.scheduleTimer=i,this.cancelTimer=a}reconnect;baseDelay;maxDelay;scheduleTimer;cancelTimer;attempt=0;timer=null;schedule(){if(this.timer!==null)return null;const e=lm(this.attempt,this.baseDelay,this.maxDelay);return this.attempt+=1,this.timer=this.scheduleTimer(()=>{this.timer=null,this.reconnect()},e),e}connected(){this.cancel()}cancel(e=!0){this.timer!==null&&(this.cancelTimer(this.timer),this.timer=null),e&&(this.attempt=0)}}const cm="PWS1",zc=24,ba=16384,um=8e-9;function pm(t){const e=t*8192,n=Math.floor(e);let s=e-n===.5?n+Math.abs(n%2):Math.round(e);return s===0&&t!==0&&(s=Math.sign(t)),Math.max(-8192,Math.min(8191,s))/8192}function hm(t,e){if(e.rollingMode)return-e.duration;if(e.triggerSource==="immediately")return 0;const n=e.triggerDelay-e.duration/2,s=/^ch([12])_(positive|negative)_edge$/.exec(e.triggerSource);if(!e.hardware||!s)return n;const i=e.duration/ba,a=Math.max(1,Math.round(i/um)),o=1+Math.floor(2/a),l=e.triggerDelay/i,u=Math.floor(l),d=l-u===.5?u+Math.abs(u%2):Math.round(l),v=Math.max(1,Math.min(2**32-1,d+ba/2)),f=ba-v-o;let m=-f*i;const y=Number(s[1])-1;if(t.sampleCount===ba&&y<t.channelCount&&f>0&&f<t.sampleCount){const E=t.samples[(f-1)*t.channelCount+y],R=t.samples[f*t.channelCount+y],L=pm(e.threshold??0),F=s[2]==="positive"?E<L&&R>=L:E>L&&R<=L;if(Number.isFinite(E)&&Number.isFinite(R)&&F){const M=(L-E)/(R-E);m+=(1-M)*i}}return m}function dm(t){if(t.byteLength<zc)throw new Error("Scope frame too short");const e=new DataView(t),n=String.fromCharCode(...new Uint8Array(t.slice(0,4)));if(n!==cm)throw new Error(`Bad frame magic: ${n}`);const s=e.getUint16(4,!0);if(s!==1)throw new Error(`Unsupported scope frame version: ${s}`);const i=e.getUint16(6,!0),a=e.getUint32(8,!0),o=new Float32Array(t,zc);if(o.length!==a*i)throw new Error("Scope frame payload length does not match metadata");return{channelCount:i,sampleCount:a,sequence:e.getUint32(20,!0),samples:o}}function _c(t,e){const n=new Float64Array(t.sampleCount),s=new Float32Array(t.sampleCount),i=new Float32Array(t.sampleCount),a=e?hm(t,e):0,o=e?e.duration:Math.max(0,t.sampleCount-1),l=t.sampleCount>0?o/t.sampleCount:0;for(let u=0;u<t.sampleCount;u+=1)n[u]=e?a+u*l:u,s[u]=t.samples[u*t.channelCount]??0,i[u]=t.channelCount>1?t.samples[u*t.channelCount+1]??0:0;return{x:n,ch1:s,ch2:i}}function fm(t,e,n,s=4){const i=Math.max(1,n),a=Math.min(i,Math.max(s,e-t));let o=t,l=t+a;return o<0&&(l-=o,o=0),l>i&&(o-=l-i,l=i),{min:Math.max(0,o),max:Math.min(i,Math.max(a,l))}}const mm=2**14,wa=-1.1,Ti=1.1;class gm{constructor(e,n,s=()=>{},i=mm){this.plotHost=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new Qa(()=>this.openSocket()),this.plot=new Re(this.options(),this.emptyData(),this.plotHost),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotHost),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}plotHost;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;plot;latestFrame=null;receivedFrameCount=0;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;pendingFrame=null;averagedData=null;displayedData=null;currentAverage=0;traceAverage=1;timeSettings=null;channelVisible=[!0,!0];xyMode=!1;mathActive=!1;mathFormula="ch1 * ch2";resizeObserver;resizeListener=()=>this.scheduleResize();connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/scope?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Scope stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Scope stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.setStatus("Scope stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Scope stream error",!0)},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.handleFrame(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}reconnect(){if(!this.wantsConnection)return;this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close(),this.resetTraceAveraging(),this.openSocket()}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}setSampleCount(e){this.sampleCount=Math.max(1,Math.floor(e)),this.resetAveraging()}getSampleCount(){return this.sampleCount}setTraceAverage(e){this.traceAverage=Math.max(1,Math.floor(e)),this.resetAveraging()}resetTraceAveraging(){this.pendingFrame=null,this.resetAveraging()}getTraceAverage(){return this.traceAverage}setTimeSettings(e){const n=this.timeSettings;if(n&&n.duration===e.duration&&n.triggerDelay===e.triggerDelay&&n.triggerSource===e.triggerSource&&n.rollingMode===e.rollingMode&&n.hardware===e.hardware&&n.threshold===e.threshold)return;const s=this.getXRange();if(this.timeSettings=e,this.resetAveraging(),this.latestFrame&&this.displayedData){this.displayedData=_c(this.latestFrame,e);const i=this.defaultXScale(this.latestFrame);this.plot.batch(()=>{this.plot.setData(this.plotData(this.displayedData),!1),this.xyMode||(n?(s.min<i.min||s.max>i.max)&&this.setXScale(s.min,s.max):this.plot.setScale("x",i))}),this.plot.redraw(!0,!0)}}setChannelVisible(e,n){this.channelVisible[e-1]=n,this.applySeriesVisibility()}getChannelVisible(e){return this.channelVisible[e-1]}setDisplaySettings(e){const n=this.xyMode!==e.xyMode;if(this.xyMode=e.xyMode,this.mathActive=e.mathActive,this.mathFormula=e.mathFormula,this.applySeriesVisibility(),this.latestFrame&&this.displayedData){const s=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),n&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(s)),this.resetYScale()}),this.plot.redraw(!0,!0)}}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),this.resizeObserver.disconnect(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.plot.destroy()}showFrame(e){this.handleFrame(e)}resetZoom(){if(!this.latestFrame)return;const e=this.latestFrame;this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(e)),this.resetYScale()})}zoom(e){const n=this.plot.scales.x,s=Number(n.min??0),i=Number(n.max??this.currentMaxX()),a=(s+i)/2,o=Math.max(this.minimumXSpan(),(i-s)*e);this.setXScale(a-o/2,a+o/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-6,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??wa),max:Number(e.max??Ti)}}getFormattedTimeLabelsForCurrentRange(e=6){const{min:n,max:s}=this.getXRange(),i=Math.max(2,Math.floor(e)),a=(s-n)/(i-1),o=Array.from({length:i},(l,u)=>n+a*u);return this.formatTimeTicks(this.plot,o)}getFrameSequence(){return this.receivedFrameCount>0?this.receivedFrameCount:null}exportCsv(){if(!this.displayedData)return`time,ch1,ch2
`;const e=["time,ch1,ch2"];for(let n=0;n<this.displayedData.x.length;n+=1)e.push(`${this.displayedData.x[n]},${this.displayedData.ch1[n]},${this.displayedData.ch2[n]}`);return`${e.join(`
`)}
`}getDisplayedStats(){return this.displayedData?{...Fc(this.displayedData.ch1,"ch1"),...Fc(this.displayedData.ch2,"ch2")}:null}getDisplayedDataFingerprint(){if(!this.displayedData)return null;let e=2166136261;const n=Math.max(1,Math.floor(this.displayedData.x.length/512));for(let s=0;s<this.displayedData.x.length;s+=n)e=No(e,this.displayedData.x[s]),e=No(e,this.displayedData.ch1[s]),e=No(e,this.displayedData.ch2[s]);return e>>>0}getMathStats(){return this.xyMode||!this.mathActive?null:vm(this.plot.data,3,1)}getXyStats(){if(!this.xyMode)return null;const e=tr(this.plot.data,1,0),n=tr(this.plot.data,1,1);if(!e||!n||e.length===0||e.length!==n.length)return null;let s=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,a=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY,l=0;for(let u=0;u<e.length;u+=1)s=Math.min(s,e[u]),i=Math.max(i,e[u]),a=Math.min(a,n[u]),o=Math.max(o,n[u]),l=Math.max(l,Math.abs(e[u]-n[u]));return{xMin:s,xMax:i,yMin:a,yMax:o,maxDelta:l}}getCurveData(){return this.displayedData?{x:Array.from(this.displayedData.x),channels:[Array.from(this.displayedData.ch1),Array.from(this.displayedData.ch2)]}:null}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}options(){return{mode:2,width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1,min:0,max:this.sampleCount-1},y:{auto:!1,min:wa,max:Ti}},axes:[bt({label:"Time / CH1",values:(e,n)=>this.formatTimeTicks(e,n)}),bt({label:"Amplitude / CH2"})],series:[{},{label:"CH1 / XY",stroke:We.green,width:1.5,points:{show:!1}},{label:"CH2",stroke:We.red,width:1.5,points:{show:!1}},{label:"Math",stroke:We.blue,width:1.5,points:{show:!1}}]}}emptyData(){return[[],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)]]}handleFrame(e){let n;try{n=dm(e)}catch(s){this.setStatus(s instanceof Error?s.message:"Invalid scope frame",!0);return}this.receivedFrameCount+=1,this.pendingFrame=n,this.scheduleRender(),this.setStatus(`Frame ${n.sequence}, ${n.sampleCount} samples, ${n.channelCount} channels`)}frameData(e){const n=_c(e,this.timeSettings??void 0);return this.timeSettings?.rollingMode?(this.averagedData=null,this.displayedData=n,this.currentAverage=0,this.setCurrentAverage(0),this.plotData(n)):(this.displayedData=n,this.plotData(n))}plotData(e){if(this.xyMode){const s=new Float32Array(0);return[[],[e.ch1,e.ch2],[s,s],[s,s]]}let n=new Float32Array(e.x.length).fill(Number.NaN);if(this.mathActive)try{n=rm(this.mathFormula,e.ch1,e.ch2,e.x)}catch(s){this.setStatus(`Math formula error: ${s instanceof Error?s.message:String(s)}`,!0)}return[[],[e.x,e.ch1],[e.x,e.ch2],[e.x,n]]}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=this.latestFrame===null,s=this.latestFrame!==null&&this.latestFrame.sampleCount!==e.sampleCount;if(s&&this.resetAveraging(),this.latestFrame=e,this.plot.setData(this.frameData(e),!1),n)this.resetZoom();else if(s&&!this.timeSettings&&!this.xyMode){const i=this.getXRange();this.plot.batch(()=>this.setXScale(i.min,i.max))}this.plot.redraw(!0,!0)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resize()}))}resize(){const e=Math.floor(this.plotHost.clientWidth),n=Math.floor(this.plotHost.clientHeight);e<1||n<1||e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(this.timeSettings&&!this.xyMode){const s=this.defaultXMin(),i=s+this.timeSettings.duration,a=Math.max(Number.EPSILON,this.timeSettings.duration/1024),o=Math.min(i-s,Math.max(a,n-e));let l=e,u=e+o;l<s&&(u+=s-l,l=s),u>i&&(l-=u-i,u=i),this.plot.setScale("x",{min:Math.max(s,l),max:Math.min(i,u)});return}this.plot.setScale("x",fm(e,n,this.currentMaxX()))}setYScale(e,n){const s=Math.max(1e-6,n-e);this.plot.setScale("y",{min:e,max:e+s})}resetYScale(){this.plot.setScale("y",{min:wa,max:Ti})}minimumXSpan(){return this.timeSettings&&!this.xyMode?Math.max(Number.EPSILON,this.timeSettings.duration/1024):4}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-6,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){if(this.xyMode)return Ti;if(this.timeSettings){const e=this.defaultXMin();return Math.max(e+Number.EPSILON,e+this.timeSettings.duration)}return Math.max(1,(this.latestFrame?.sampleCount??this.sampleCount)-1)}defaultXScale(e){if(this.xyMode)return{min:wa,max:Ti};if(this.timeSettings){const n=this.defaultXMin();return{min:n,max:n+this.timeSettings.duration}}return{min:0,max:Math.max(1,e.sampleCount-1)}}defaultXMin(){return this.timeSettings?this.timeSettings.rollingMode?-this.timeSettings.duration:this.timeSettings.triggerSource==="immediately"?0:this.timeSettings.triggerDelay-this.timeSettings.duration/2:0}resetAveraging(){this.averagedData=null,this.currentAverage=0,this.setCurrentAverage(0)}formatTimeTicks(e,n){if(this.xyMode)return n.map(d=>Lc(d,3));const s=Number(e.scales.x.min??n[0]??0),i=Number(e.scales.x.max??n[n.length-1]??s),a=Math.max(Number.EPSILON,Math.abs(i-s)),o=bm(Math.max(Number.EPSILON,this.timeSettings?.duration??a)),l=n.length>1?Math.abs(n[1]-n[0])*o.scale:a*o.scale,u=Math.max(0,Math.min(9,Math.ceil(-Math.log10(Math.max(l,Number.EPSILON)))+1));return n.map(d=>`${Lc(d*o.scale,u)} ${o.suffix}`)}applySeriesVisibility(){const e=this.getXRange(),n=this.getYRange(),s=[this.xyMode||this.channelVisible[0],!this.xyMode&&this.channelVisible[1],!this.xyMode&&this.mathActive];this.plot.batch(()=>{s.forEach((i,a)=>{this.plot.series[a+1].show!==i&&this.plot.setSeries(a+1,{show:i})}),this.plot.setScale("x",e),this.plot.setScale("y",n)})}}function tr(t,e,n){return t[e]?.[n]??null}function vm(t,e,n){const s=tr(t,e,n);if(!s||s.length===0)return null;let i=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY;for(let o=0;o<s.length;o+=1){const l=s[o];Number.isFinite(l)&&(i=Math.min(i,l),a=Math.max(a,l))}return i===Number.POSITIVE_INFINITY?null:{min:i,max:a}}function bm(t){return t<1e-6?{scale:1e9,suffix:"ns"}:t<.001?{scale:1e6,suffix:"us"}:t<1?{scale:1e3,suffix:"ms"}:{scale:1,suffix:"s"}}function Lc(t,e){return Number.isFinite(t)?t.toFixed(e).replace(/\.?0+$/,""):"0"}function Fc(t,e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const i of t)n=Math.min(n,i),s=Math.max(s,i);return{[`${e}Min`]:n===Number.POSITIVE_INFINITY?0:n,[`${e}Max`]:s===Number.NEGATIVE_INFINITY?0:s}}function No(t,e){const n=Math.round(Number.isFinite(e)?e*1e6:0);return t^=n&255,t=Math.imul(t,16777619),t^=n>>8&255,t=Math.imul(t,16777619),t^=n>>16&255,t=Math.imul(t,16777619),t^=n>>24&255,t=Math.imul(t,16777619),t}const Wu=["#session-line","output[id$='-status']","#status",".iir-plot-status","#scope-current-average","#spectrum-current-average","#plot-hint","#spectrum-plot-hint",".panel-header p",".empty-workspace p"].join(", ");function wm(t){const e=new URLSearchParams(t).get("debug");return e==="1"||e==="true"}function S(t,e){t.textContent=e,t.dispatchEvent(new CustomEvent("pyrpl-error",{bubbles:!0,detail:e}))}function ym(t,e){const n=document.createElement("footer");n.id="status-bar",n.hidden=!e,n.setAttribute("aria-label","Application status");const s=document.createElement("div");s.id="debug-status",s.hidden=!e,s.setAttribute("aria-label","Debug information");const i=document.createElement("div");i.id="application-error",i.hidden=!0;const a=document.createElement("span");a.setAttribute("role","alert");const o=document.createElement("button");if(o.type="button",o.textContent="Dismiss",o.addEventListener("click",()=>{i.hidden=!0,a.textContent="",n.hidden=!e}),i.append(a,o),n.append(i,s),t.append(n),t.addEventListener("pyrpl-error",v=>{a.textContent=v.detail,i.hidden=!1,n.hidden=!1}),!e)return;let l=!1;const u=()=>{l=!1;const v=[];for(const f of t.querySelectorAll(Wu)){const m=f.closest(".workspace-panel");if(m?.hidden||f.closest(".empty-workspace")?.hidden)continue;const y=f.textContent?.trim();if(!y)continue;const E=document.createElement("span");E.dataset.source=f.id||f.className||"description";const R=m?.querySelector("h2")?.textContent;E.textContent=R?`${R}: ${y}`:y,v.push(E)}s.replaceChildren(...v)},d=new MutationObserver(()=>{l||(l=!0,window.requestAnimationFrame(u))});for(const v of t.children)v!==n&&d.observe(v,{subtree:!0,childList:!0,characterData:!0,attributes:!0,attributeFilter:["hidden"]});u()}const Tc=[new Float64Array(0),new Float32Array(0)];class xm{constructor(e,n,s=()=>{},i=16384){this.host=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new Qa(()=>this.openSocket()),this.plot=new Re(this.options("",this.labels),Tc,this.host),this.fftWorker.onmessage=a=>this.handleWorkerResponse(a.data),this.fftWorker.onerror=()=>this.setStatus("Spectrum FFT worker error",!0),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}host;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;retiredSockets=new WeakSet;plot;latestFrame=null;latestCurveFrame=null;latestScopeBuffer=null;pendingFrame=null;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;labels=["Spectrum"];unit="";averagedFrame=null;currentAverage=0;fftWorker=new Worker(new URL("/assets/spectrum-worker-BoMK1mMm.js",import.meta.url),{type:"module"});workerRequestId=0;workerGeneration=0;settings={baseband:!0,span:976562.5,center:0,window:"blackman",displayUnit:"dB(Vpk^2)",displayInput1Baseband:!0,displayInput2Baseband:!0,displayCrossAmplitude:!0,traceAverage:1,runningState:"stopped",iqBandwidth:[]};resizeObserver;resizeListener=()=>this.scheduleResize();setSettings(e){const n={...this.settings,baseband:!!(e.baseband??this.settings.baseband),span:Number(e.span??this.settings.span),center:Number(e.center??this.settings.center),window:String(e.window??this.settings.window),displayUnit:String(e.display_unit??this.settings.displayUnit),displayInput1Baseband:!!(e.display_input1_baseband??this.settings.displayInput1Baseband),displayInput2Baseband:!!(e.display_input2_baseband??this.settings.displayInput2Baseband),displayCrossAmplitude:!!(e.display_cross_amplitude??this.settings.displayCrossAmplitude),traceAverage:Math.max(1,Math.floor(Number(e.trace_average??this.settings.traceAverage))),runningState:String(e.running_state??this.settings.runningState),iqBandwidth:Array.isArray(e.iq_bandwidth)?e.iq_bandwidth.map(Number).filter(Number.isFinite):this.settings.iqBandwidth},s=n.displayUnit!==this.settings.displayUnit,i=n.window!==this.settings.window,a=n.displayInput1Baseband!==this.settings.displayInput1Baseband||n.displayInput2Baseband!==this.settings.displayInput2Baseband||n.displayCrossAmplitude!==this.settings.displayCrossAmplitude;!(this.settings.runningState==="running_single"&&n.runningState==="stopped")&&Ic(n)!==Ic(this.settings)&&this.resetAveraging(),this.settings=n,i&&this.wantsConnection&&(this.close(),this.connect()),(s||a)&&this.averagedFrame&&(this.pendingFrame=Rc(this.averagedFrame,this.settings),this.scheduleRender())}resetAveraging(){this.workerGeneration+=1,this.averagedFrame=null,this.pendingFrame=null,this.currentAverage=0,this.setCurrentAverage(0)}getAverageCount(){return this.currentAverage}getRbw(){return this.latestCurveFrame?.rbw}connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/spectrumanalyzer?samples=${this.sampleCount}&window=${encodeURIComponent(this.settings.window)}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Spectrum stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Spectrum stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.retiredSockets.has(s)||this.setStatus("Spectrum stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Spectrum stream error",!0)},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.showScopeBuffer(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e&&(this.retiredSockets.add(e),e.close())}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}showScopeBuffer(e){this.latestScopeBuffer=e.slice(0),this.workerRequestId+=1,this.fftWorker.postMessage({id:this.workerRequestId,generation:this.workerGeneration,buffer:e,settings:{...this.settings,iqBandwidth:[...this.settings.iqBandwidth]}},[e])}handleWorkerResponse(e){if(e.generation!==this.workerGeneration)return;if(e.error||!e.frame){this.setStatus(e.error??"Invalid spectrum frame",!0);return}const n=e.frame,s=n.currentAverage!==void 0?n:this.averageFrame(n);n.currentAverage!==void 0&&(this.currentAverage=n.currentAverage,this.averagedFrame=n),this.setCurrentAverage(this.currentAverage),this.latestCurveFrame=s,this.pendingFrame=Rc(s,this.settings),this.scheduleRender(),this.setStatus(`Spectrum frame ${n.sequence}, ${n.x.length} bins, RBW ${Em(n.rbw)} Hz`)}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),this.resizeObserver.disconnect(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.workerGeneration+=1,this.fftWorker.terminate(),this.plot.destroy()}getSeriesCount(){return this.latestFrame?.series.length??0}getBinCount(){return this.latestFrame?.x.length??0}exportCsv(){if(!this.latestFrame)return`frequency
`;const n=[`frequency,${this.latestFrame.series.map(s=>s.label).join(",")}`];for(let s=0;s<this.latestFrame.x.length;s+=1)n.push([this.latestFrame.x[s],...this.latestFrame.series.map(i=>i.values[s]??"")].join(","));return`${n.join(`
`)}
`}getCurveData(){if(!this.latestCurveFrame)return null;const e=Uu(this.latestCurveFrame.series,this.settings);return{x:Array.from(this.latestCurveFrame.x),series:e.map(n=>({label:n.label,values:Array.from(n.values),...n.imaginary?{imaginary:Array.from(n.imaginary)}:{}})),unit:"Vpk^2"}}getCurveParameters(){return{baseband:this.settings.baseband,span:this.settings.span,center:this.settings.center,window:this.settings.window,display_unit:this.settings.displayUnit,trace_average:this.settings.traceAverage,display_input1_baseband:this.settings.displayInput1Baseband,display_input2_baseband:this.settings.displayInput2Baseband,display_cross_amplitude:this.settings.displayCrossAmplitude}}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}resetZoom(){this.latestFrame&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(this.latestFrame)),this.plot.setScale("y",this.defaultYScale(this.latestFrame))})}zoom(e){const{min:n,max:s}=this.getXRange(),i=(n+s)/2,a=Math.max(this.minimumXSpan(),(s-n)*e);this.setXScale(i-a/2,i+a/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-12,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??-120),max:Number(e.max??20)}}options(e,n){return{width:this.host.clientWidth||900,height:this.host.clientHeight||420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1},y:{auto:!1}},axes:[bt({label:"Frequency (Hz)"}),bt({label:e})],series:[{},...n.map((s,i)=>({label:s,stroke:i===0?We.green:i===1?We.blue:We.yellow,width:1.4,points:{show:!1}}))]}}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=e.series.map(o=>o.label),s=n.join("\0")!==this.labels.join("\0"),i=e.unit!==this.unit,a=this.latestFrame===null;this.latestFrame=e,s||i?(this.labels=n.length?n:["Spectrum"],this.unit=e.unit,this.plot.destroy(),this.plot=new Re(this.options(e.unit,this.labels),this.frameData(e),this.host),this.plotSize={width:0,height:0},this.bindInteractions(),this.scheduleResize()):this.plot.setData(this.frameData(e),!1),(a||s||i)&&this.resetZoom(),this.plot.redraw(!0,!0)}frameData(e){return e.x.length&&e.series.length?[e.x,...e.series.map(n=>n.values)]:Tc}averageFrame(e){const n=Math.max(1,this.settings.traceAverage),s=this.averagedFrame&&this.averagedFrame.x.length===e.x.length&&this.averagedFrame.series.length===e.series.length&&this.averagedFrame.series.every((l,u)=>l.values.length===e.series[u].values.length&&!!l.imaginary==!!e.series[u].imaginary&&(!l.imaginary||l.imaginary.length===e.series[u].imaginary.length));if(n<=1||!s)return this.averagedFrame=km(e),this.currentAverage=1,e;const i=Math.min(this.currentAverage+1,n),a=i-1,o=e.series.map((l,u)=>{const d=this.averagedFrame.series[u].values,v=new Float64Array(l.values.length);for(let m=0;m<v.length;m+=1)v[m]=(d[m]*a+l.values[m])/i;let f;if(l.imaginary){const m=this.averagedFrame.series[u].imaginary;f=new Float64Array(l.imaginary.length);for(let y=0;y<f.length;y+=1)f[y]=(m[y]*a+l.imaginary[y])/i}return{label:l.label,values:v,...f?{imaginary:f}:{}}});return this.averagedFrame={...e,x:e.x,series:o},this.currentAverage=i,this.averagedFrame}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=window.requestAnimationFrame(()=>{this.resizeFrame=null;const e=Math.floor(this.host.clientWidth),n=Math.floor(this.host.clientHeight);e<1||n<1||e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(!this.latestFrame)return;const s=this.defaultXScale(this.latestFrame),i=this.minimumXSpan(),a=Math.min(s.max-s.min,Math.max(i,n-e));let o=e,l=e+a;o<s.min&&(l+=s.min-o,o=s.min),l>s.max&&(o-=l-s.max,l=s.max),this.plot.setScale("x",{min:Math.max(s.min,o),max:Math.min(s.max,l)})}setYScale(e,n){const s=Math.max(1e-12,n-e);this.plot.setScale("y",{min:e,max:e+s})}minimumXSpan(){return!this.latestFrame||this.latestFrame.x.length<2?Number.EPSILON:Math.max(Number.EPSILON,Math.abs(this.latestFrame.x[this.latestFrame.x.length-1]-this.latestFrame.x[0])/1024)}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-12,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){return this.latestFrame&&this.latestFrame.x.length?this.latestFrame.x[this.latestFrame.x.length-1]:1}defaultXScale(e){return e.x.length?{min:e.x[0],max:e.x[e.x.length-1]}:{min:0,max:1}}defaultYScale(e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const a of e.series)for(const o of a.values)Number.isFinite(o)&&(n=Math.min(n,o),s=Math.max(s,o));if(n===Number.POSITIVE_INFINITY||s===Number.NEGATIVE_INFINITY)return{min:-120,max:20};const i=Math.max(1e-9,(s-n)*.08);return{min:n-i,max:s+i}}}function Sm(t,e,n){const s=new Float64Array(t.length);for(let i=0;i<t.length;i+=1){const a=Math.max(t[i],Number.EPSILON);e==="dB(Vpk^2)"?s[i]=10*Math.log10(a):e==="Vpk"?s[i]=Math.sqrt(a):e==="Vrms^2"?s[i]=a/2:e==="dB(Vrms^2)"?s[i]=10*Math.log10(a/2+Number.EPSILON):e==="Vrms"?s[i]=Math.sqrt(a)/Math.SQRT2:e==="Vrms^2/Hz"?s[i]=a/2/Math.max(n,Number.EPSILON):e==="dB(Vrms^2/Hz)"?s[i]=10*Math.log10(a/2/Math.max(n,Number.EPSILON)+Number.EPSILON):e==="Vrms/sqrt(Hz)"?s[i]=Math.sqrt(a)/Math.SQRT2/Math.max(n,Number.EPSILON):s[i]=a}return s}function km(t){return{...t,x:t.x,series:t.series.map(e=>({label:e.label,values:new Float64Array(e.values),...e.imaginary?{imaginary:new Float64Array(e.imaginary)}:{}}))}}function Rc(t,e){const n=Uu(t.series,e);return{...t,unit:e.displayUnit,series:n.map(s=>({label:s.label,values:Sm(s.imaginary?Mm(s.values,s.imaginary):s.values,e.displayUnit,t.rbw)}))}}function Ic(t){return[t.baseband,t.span,t.center,t.window,t.iqBandwidth.join(",")].join("|")}function Uu(t,e){return e.baseband?t.filter(n=>n.label==="Input 1"?e.displayInput1Baseband:n.label==="Input 2"?e.displayInput2Baseband:n.label==="Cross"?e.displayCrossAmplitude:!0):t}function Mm(t,e){const n=new Float64Array(t.length);for(let s=0;s<n.length;s+=1)n[s]=Math.hypot(t[s],e[s]);return n}function Em(t){return Number.isFinite(t)?Math.abs(t)>=1e3?t.toExponential(3):t.toFixed(3):"0"}const Nc=[new Float64Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0)],Cm=[{name:"complex_poles",label:"Complex Poles",kind:"pole",complex:!0},{name:"complex_zeros",label:"Complex Zeros",kind:"zero",complex:!0},{name:"real_poles",label:"Real Poles",kind:"pole",complex:!1},{name:"real_zeros",label:"Real Zeros",kind:"zero",complex:!1}];class Pm{constructor(e,n,s,i=()=>!0,a=()=>({})){this.host=e,this.setAttribute=n,this.setStatus=s,this.canEditHardware=i,this.viewSettings=a,this.host.innerHTML=`
      <div class="iir-plot-toolbar">
        <button id="iir-zoom-reset" type="button">Reset</button>
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
      <div class="iir-list-grid"></div>
    `;const o=this.host.querySelector('[data-iir-plot="magnitude"]'),l=this.host.querySelector('[data-iir-plot="phase"]');if(!o||!l)throw new Error("Missing IIR plot hosts");this.magnitudeHost=o,this.phaseHost=l,this.magnitudePlot=new Re(this.options("Magnitude (dB)","dB"),Nc,o),this.phasePlot=new Re(this.options("Phase (deg)","deg"),Nc,l),this.installPlotEvents(this.magnitudePlot),this.installPlotEvents(this.phasePlot),this.host.querySelector("#iir-zoom-reset")?.addEventListener("click",()=>this.resetZoom()),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),this.scheduleResize()}host;setAttribute;setStatus;canEditHardware;viewSettings;magnitudePlot;phasePlot;magnitudeHost;phaseHost;latest=null;refreshRevision=0;selectedKey=null;resizeFrame=null;resizeObserver=null;clickTimer=null;markerDrag=null;panState=null;zoomState=null;userView=!1;suppressNextClick=!1;windowMouseMove=e=>{const n=this.panState?.plot??this.zoomState?.plot;n&&this.handlePointerMove(n,e)};windowMouseUp=()=>{const e=this.panState?.plot??this.zoomState?.plot;e&&this.endMouseInteraction(e)};async refresh(){const e=++this.refreshRevision,n=new URLSearchParams(Object.entries(this.viewSettings()).map(([F,M])=>[F,String(M)])),s=await fetch(`/api/modules/iir/plot?${n}`);if(!s.ok)throw new Error(`IIR plot unavailable: ${s.status}`);const i=await s.json();if(e!==this.refreshRevision)return;this.latest=i;const a=Float64Array.from(this.latest.x,F=>Math.log10(Math.max(F,Number.MIN_VALUE))),o=Float32Array.from(this.latest.magnitude),l=Float32Array.from(this.latest.phase),u=Ks(this.latest.data_magnitude),d=Ks(this.latest.data_phase),v=Ks(this.latest.product_magnitude),f=Ks(this.latest.product_phase),m=Ks(this.latest.measurement_magnitude),y=Ks(this.latest.measurement_phase),E=!this.userView||this.magnitudePlot.data[0].length===0;this.magnitudePlot.setData([a,o,u,v,m],!1),this.phasePlot.setData([a,l,d,f,y],!1),E?this.applyDefaultScales():this.linkXScale(this.getXRange()),this.renderMarkers(),this.renderListEditors();const R=this.host.closest(".module-panel")?.querySelector("#iir-data-curve-name");R&&(R.value=this.latest.data_curve_name);const L=this.latest.data_curve_name?` | ${this.latest.data_curve_name}`:"";this.plotStatus().textContent=`${this.latest.tf_type} | ${this.latest.markers.length} pole/zero marker(s)${L}`}destroy(){this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.removeWindowMouseCapture(),this.resizeObserver?.disconnect(),this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.resizeFrame!==null&&cancelAnimationFrame(this.resizeFrame)}options(e,n){return{width:360,height:220,title:e,cursor:{drag:{x:!1,y:!1,setScale:!1}},scales:{x:{time:!1},y:{auto:!1}},axes:[bt({label:"Frequency",values:(s,i)=>i.map(a=>$o(10**a))}),bt({label:n})],series:[{},{label:"Filter design",stroke:We.yellow,width:2},{label:"Data curve",stroke:We.green,width:1.5},{label:"Data x filter",stroke:We.red,width:1.5},{label:"Measurement",stroke:We.orange,width:0,points:{show:!0,size:4,width:1,stroke:We.orange}}],hooks:{draw:[()=>this.renderMarkers()]}}}installPlotEvents(e){const n=e.root;n.addEventListener("contextmenu",i=>i.preventDefault(),{capture:!0}),n.addEventListener("wheel",i=>{i.preventDefault();const a=Math.exp(i.deltaY/500);this.zoomAroundPointer(e,i,a,a)},{passive:!1}),n.addEventListener("pointerdown",i=>{this.startMouseNavigation(e,i)&&n.setPointerCapture(i.pointerId)},{capture:!0}),n.addEventListener("pointermove",i=>this.handlePointerMove(e,i),{capture:!0});const s=i=>this.endPointerInteraction(e,i);n.addEventListener("pointerup",s,{capture:!0}),n.addEventListener("pointercancel",s,{capture:!0}),n.addEventListener("mousedown",i=>{!this.panState&&!this.zoomState&&this.startMouseNavigation(e,i)},{capture:!0}),n.addEventListener("dblclick",i=>{this.clickTimer!==null&&(window.clearTimeout(this.clickTimer),this.clickTimer=null),this.handlePlotClick(e,i,!0).catch(a=>S(this.plotStatus(),a.message))}),n.addEventListener("click",i=>{if(this.suppressNextClick){this.suppressNextClick=!1;return}i.detail>1||(this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.clickTimer=window.setTimeout(()=>{this.clickTimer=null,this.handlePlotClick(e,i,!1).catch(a=>S(this.plotStatus(),a.message))},220))}),n.addEventListener("mousemove",i=>{this.markerDrag?this.moveDraggedMarker(i):(!this.panState&&!this.zoomState&&i.buttons&&this.startMouseMoveNavigation(e,i),this.handlePointerMove(e,i))},{capture:!0}),n.addEventListener("mouseup",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>S(this.plotStatus(),a.message)):this.endMouseInteraction(e)},{capture:!0}),n.addEventListener("mouseleave",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>S(this.plotStatus(),a.message)):this.endMouseInteraction(e)})}async handlePlotClick(e,n,s){if(!this.latest||n.defaultPrevented)return;const i=this.frequencyFromEvent(e,n);if(!(!this.canEditHardware()&&(n.ctrlKey||n.metaKey||n.shiftKey)))if(n.ctrlKey||n.metaKey)await this.addMarker("poles",i,s);else if(n.shiftKey)await this.addMarker("zeros",i,s);else{const a=this.nearestMarker(i);a&&(this.selectedKey=Oo(a),this.renderMarkers(),this.renderListEditors())}}async addMarker(e,n,s){if(this.latest){if(s){const i=e==="poles"?"complex_poles":"complex_zeros",a=[...this.latest.state[i],$c(-n/10,n)];await this.setAttribute(i,a)}else{const i=e==="poles"?"real_poles":"real_zeros",a=[...this.latest.state[i],-n];await this.setAttribute(i,a)}await this.refresh()}}renderMarkers(){this.latest&&(this.renderMarkersForPlot(this.magnitudePlot,"magnitude"),this.renderMarkersForPlot(this.phasePlot,"phase"))}renderMarkersForPlot(e,n){const s=Array.from(e.over.querySelectorAll(".iir-marker"));for(const i of s)i.remove();for(const i of this.latest?.markers??[]){const a=Math.max(i.frequency,Number.MIN_VALUE),o=e.valToPos(Math.log10(a),"x"),l=e.valToPos(n==="magnitude"?i.magnitude:i.phase,"y");if(!Number.isFinite(o)||!Number.isFinite(l))continue;const u=document.createElement("button");u.type="button",u.className=`iir-marker is-${i.kind} is-${i.shape}`,u.classList.toggle("is-selected",this.selectedKey===Oo(i)),u.style.left=`${o}px`,u.style.top=`${l}px`,u.title=`${i.list}[${i.index}] ${$o(i.frequency)}`,u.textContent=i.kind==="pole"?"x":"o",u.addEventListener("mousedown",d=>{d.preventDefault(),d.stopPropagation(),this.canEditHardware()&&(this.selectedKey=Oo(i),this.markerDrag={marker:i,plot:e},u.classList.add("is-dragging"),this.renderListEditors())}),u.addEventListener("pointerdown",d=>d.stopPropagation()),e.over.appendChild(u)}}renderListEditors(){const e=this.host.querySelector(".iir-list-grid");if(!(!e||!this.latest)){e.textContent="";for(const n of Cm){const s=[...this.latest.state[n.name]],i=document.createElement("section");i.className="iir-list-editor",i.dataset.list=n.name;const a=document.createElement("header"),o=document.createElement("span");o.textContent=n.label;const l=document.createElement("input");l.type="number",l.min="0",l.max="64",l.step="1",l.value=String(s.length),l.id=`iir-${n.name.replaceAll("_","-")}-count`,l.addEventListener("change",()=>{this.setListCount(n.name,Number(l.value)).catch(m=>S(this.plotStatus(),m.message))});const u=document.createElement("button");u.type="button",u.textContent="+",u.title=`Add ${n.label.slice(0,-1).toLowerCase()}`,u.addEventListener("click",()=>{this.appendListValue(n.name).catch(m=>S(this.plotStatus(),m.message))});const d=document.createElement("button");d.type="button",d.textContent="-",d.title=`Remove selected ${n.label.slice(0,-1).toLowerCase()}`,d.disabled=s.length===0,d.addEventListener("click",()=>{this.removeListValue(n.name).catch(m=>S(this.plotStatus(),m.message))}),a.append(o,l,u,d),i.appendChild(a);const v=document.createElement("input");v.type="text",v.id=`iir-${n.name.replaceAll("_","-")}`,v.value=s.join(", "),v.addEventListener("change",()=>{const m=n.complex?Bc(v.value):Bc(v.value).map(Number);this.setList(n.name,m).catch(y=>S(this.plotStatus(),y.message))}),i.appendChild(v);const f=document.createElement("div");f.className="iir-list-values",s.forEach((m,y)=>{const E=document.createElement("label");E.className="iir-list-value";const R=`${n.name}:${y}`;E.classList.toggle("is-selected",this.selectedKey===R);const L=document.createElement("span");L.textContent=String(y);const F=document.createElement("input");F.type=n.complex?"text":"number",F.step="any",F.value=String(m),F.addEventListener("focus",()=>{this.selectedKey=R,this.renderMarkers(),this.renderListEditors()}),F.addEventListener("change",()=>{const M=[...this.latest.state[n.name]];M[y]=n.complex?F.value:Number(F.value),this.setList(n.name,M).catch(B=>S(this.plotStatus(),B.message))}),E.append(L,F),f.appendChild(E)}),i.appendChild(f),e.appendChild(i)}}}async appendListValue(e){if(!this.latest)return;const n=[...this.latest.state[e],Dc(e)];await this.setList(e,n)}async removeListValue(e){if(!this.latest)return;const n=[...this.latest.state[e]],s=this.selectedKey?.startsWith(`${e}:`)?Number(this.selectedKey.split(":")[1]):n.length-1;s>=0&&s<n.length&&(n.splice(s,1),this.selectedKey=null,await this.setList(e,n))}async setListCount(e,n){if(!this.latest)return;const s=Math.max(0,Math.min(64,Math.round(Number.isFinite(n)?n:0))),i=[...this.latest.state[e]];for(;i.length<s;)i.push(Dc(e));i.length=s,await this.setList(e,i)}async setList(e,n){this.canEditHardware()&&(await this.setAttribute(e,n),await this.refresh())}moveDraggedMarker(e){const n=this.markerDrag;if(!n)return;const s=this.frequencyFromEvent(n.plot,e);this.plotStatus().textContent=`drag ${n.marker.list}[${n.marker.index}] to ${$o(s)}`}async finishDraggedMarker(e){const n=this.markerDrag;if(this.markerDrag=null,!n||!this.latest)return;const s=this.frequencyFromEvent(n.plot,e),i=n.marker;if(i.list==="real_poles"||i.list==="real_zeros"){const a=[...this.latest.state[i.list]];a[i.index]=-s,await this.setAttribute(i.list,a)}else{const a=[...this.latest.state[i.list]],o=Am(String(a[i.index]));a[i.index]=$c(o.real,s),await this.setAttribute(i.list,a)}await this.refresh()}nearestMarker(e){if(!this.latest?.markers.length)return null;let n=this.latest.markers[0],s=1/0;for(const i of this.latest.markers){const a=Math.max(i.frequency,e)/Math.max(Number.MIN_VALUE,Math.min(i.frequency,e));a<s&&(n=i,s=a)}return n}frequencyFromEvent(e,n){const s=e.over.getBoundingClientRect(),i=Math.max(0,Math.min(s.width,n.clientX-s.left));return 10**Number(e.posToVal(i,"x"))}resetZoom(){this.latest&&(this.userView=!1,this.applyDefaultScales(),this.renderMarkers())}getXRange(){const e=this.magnitudePlot.scales.x;return{min:Number(e.min??this.defaultXScale().min),max:Number(e.max??this.defaultXScale().max)}}getMagnitudeYRange(){return this.getYRange(this.magnitudePlot)}getPhaseYRange(){return this.getYRange(this.phasePlot)}handlePointerMove(e,n){if(this.panState?.plot===e){const s=Math.max(1,e.bbox.width/(devicePixelRatio||1)),i=Math.max(1,e.bbox.height/(devicePixelRatio||1)),a=n.clientX-this.panState.startX,o=n.clientY-this.panState.startY;this.panState.moved||=Math.abs(a)>3||Math.abs(o)>3;const l=this.panState.xMax-this.panState.xMin,u=this.panState.yMax-this.panState.yMin,d=a/s*l,v=o/i*u;this.setXScale(this.panState.xMin-d,this.panState.xMax-d),this.setYScale(e,this.panState.yMin+v,this.panState.yMax+v)}else if(this.zoomState?.plot===e){const s=n.clientX-this.zoomState.startX,i=n.clientY-this.zoomState.startY;this.zoomState.moved||=Math.abs(s)>3||Math.abs(i)>3;const a=Math.exp(-s/260),o=Math.exp(i/260);this.zoomAroundStartScale(e,this.zoomState,a,o)}}startMouseNavigation(e,n){if(n.target.closest(".iir-marker")||n.ctrlKey||n.metaKey||n.shiftKey)return!1;const{min:s,max:i}=this.getXRange(),{min:a,max:o}=this.getYRange(e);return n.button===0?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture(),!0):n.button===1||n.button===2?(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture(),!0):!1}startMouseMoveNavigation(e,n){(n.buttons&1)===1?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture()):((n.buttons&2)===2||(n.buttons&4)===4)&&(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture())}getXRangeAsStart(e){const{min:n,max:s}=this.getXRange(),{min:i,max:a}=this.getYRange(e);return{xMin:n,xMax:s,yMin:i,yMax:a}}endPointerInteraction(e,n){const s=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;if(this.panState?.plot===e||this.zoomState?.plot===e){try{e.root.releasePointerCapture(n.pointerId)}catch{}this.userView||=!!s,this.suppressNextClick||=!!s}this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}endMouseInteraction(e){const n=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;this.userView||=!!n,this.suppressNextClick||=!!n,this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}addWindowMouseCapture(){window.addEventListener("mousemove",this.windowMouseMove),window.addEventListener("mouseup",this.windowMouseUp)}removeWindowMouseCapture(){window.removeEventListener("mousemove",this.windowMouseMove),window.removeEventListener("mouseup",this.windowMouseUp)}zoomAroundPointer(e,n,s,i){const a=e.over.getBoundingClientRect(),o=Math.max(0,Math.min(a.width,n.clientX-a.left)),l=Math.max(0,Math.min(a.height,n.clientY-a.top)),u=Number(e.posToVal(o,"x")),d=Number(e.posToVal(l,"y")),{min:v,max:f}=this.getXRange(),{min:m,max:y}=this.getYRange(e),E=(u-v)/Math.max(Number.EPSILON,f-v),R=(d-m)/Math.max(Number.EPSILON,y-m),L=Math.max(this.minimumXSpan(),(f-v)*s),F=Math.max(1e-12,(y-m)*i);this.setXScale(u-L*E,u+L*(1-E)),this.setYScale(e,d-F*R,d+F*(1-R)),this.userView=!0}zoomAroundStartScale(e,n,s,i){const a=(n.xMin+n.xMax)/2,o=(n.yMin+n.yMax)/2,l=Math.max(this.minimumXSpan(),(n.xMax-n.xMin)*s),u=Math.max(1e-12,(n.yMax-n.yMin)*i);this.setXScale(a-l/2,a+l/2),this.setYScale(e,o-u/2,o+u/2)}setXScale(e,n){const s=this.defaultXScale(),i=Math.min(s.max-s.min,Math.max(this.minimumXSpan(),n-e));let a=e,o=e+i;a<s.min&&(o+=s.min-a,a=s.min),o>s.max&&(a-=o-s.max,o=s.max),this.linkXScale({min:Math.max(s.min,a),max:Math.min(s.max,o)})}setYScale(e,n,s){const i=Math.max(1e-12,s-n);e.setScale("y",{min:n,max:n+i}),this.renderMarkers()}linkXScale(e){this.magnitudePlot.setScale("x",e),this.phasePlot.setScale("x",e),this.renderMarkers()}getYRange(e){const n=e.scales.y,s=e===this.magnitudePlot?this.yScale(Float32Array.from(this.latest?.magnitude??[])):this.yScale(Float32Array.from(this.latest?.phase??[]));return{min:Number(n.min??s.min),max:Number(n.max??s.max)}}applyDefaultScales(){if(!this.latest)return;const e=this.defaultXScale();this.magnitudePlot.batch(()=>{this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",this.yScale(Float32Array.from(this.latest.magnitude)))}),this.phasePlot.batch(()=>{this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",this.yScale(Float32Array.from(this.latest.phase)))})}defaultXScale(){const e=this.latest?.x??[],n=e.length?Math.max(Number.MIN_VALUE,e[0]):10,s=e.length?Math.max(n*1.000001,e[e.length-1]):5e6;return{min:Math.log10(n),max:Math.log10(s)}}minimumXSpan(){const{min:e,max:n}=this.defaultXScale();return Math.max(Number.EPSILON,(n-e)/1024)}yScale(e){if(!e.length)return{min:-260,max:20};let n=1/0,s=-1/0;for(const a of e)Number.isFinite(a)&&(n=Math.min(n,a),s=Math.max(s,a));if(!Number.isFinite(n)||!Number.isFinite(s))return{min:-260,max:20};Math.abs(s-n)<1e-9&&(n-=1,s+=1);const i=(s-n)*.1;return{min:n-i,max:s+i}}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=Oc(this.magnitudeHost),n=Oc(this.phaseHost);!e||!n||(this.magnitudePlot.setSize(e),this.phasePlot.setSize(n),this.renderMarkers())}))}plotStatus(){const e=this.host.querySelector(".iir-plot-status");if(!e)throw new Error("Missing IIR plot status");return e}}function Oc(t){const e=t.getBoundingClientRect(),n=Math.floor(e.width),s=Math.floor(e.height);return n<40||s<40?null:{width:n,height:s}}function Ks(t){return Float32Array.from(t,e=>e===null?Number.NaN:e)}function Oo(t){return`${t.list}:${t.index}`}function $c(t,e){return`${Vi(t)}+${Vi(Math.abs(e))}j`}function Dc(t){return t.startsWith("complex")?"-1000+10000j":-1e4}function Bc(t){return t.split(",").map(e=>e.trim()).filter(Boolean)}function Am(t){const n=t.trim().replace("i","j").match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]\d+(?:\.\d+)?(?:e[+-]?\d+)?)j$/i);return n?{real:Number(n[1]??0),imag:Number(n[2])}:{real:-1,imag:1}}function Vi(t){return Number(t.toPrecision(8)).toString()}function $o(t){return t>=1e6?`${Vi(t/1e6)} MHz`:t>=1e3?`${Vi(t/1e3)} kHz`:`${Vi(t)} Hz`}let zm=0;class _m{constructor(e){this.elements=e,this.resizeObserver=new ResizeObserver(()=>this.scheduleLayoutRefresh()),this.resizeObserver.observe(e.inputPlot),this.resizeObserver.observe(e.outputPlot),e.classSelect.addEventListener("change",()=>{this.setClass(e.classSelect.value).catch(n=>{S(this.elements.status,n.message)})}),e.addStage.addEventListener("click",()=>{this.requestSchema("/api/lockbox/stages",{method:"POST"}).catch(n=>{S(this.elements.status,n.message)})}),e.inputPlotSelect.addEventListener("change",()=>{this.refreshInputPlot().catch(n=>S(this.elements.status,n.message))}),e.outputPlotSelect.addEventListener("change",()=>{this.refreshOutputPlot().catch(n=>S(this.elements.status,n.message))})}elements;schema=null;inputPlot=null;outputMagnitudePlot=null;outputPhasePlot=null;resizeObserver;resizeFrame=null;stageLayoutWidth=0;stageHeight=0;async load(){const[e,n]=await Promise.all([fetch("/api/lockbox"),fetch("/api/lockbox/actions")]);if(!e.ok||!n.ok)throw new Error("Lockbox controls unavailable");const s=await e.json(),i=await n.json();this.renderActions(i.actions??[]),await this.applySchema(s)}async applySchema(e){this.schema=e,e.actions&&this.renderActions(e.actions),this.populateClassSelect(e),this.renderLockboxAttributes(e.attributes),this.renderInputs(e.inputs),this.renderOutputs(e.outputs),this.renderStages(e.sequence),this.populatePlotSelect(this.elements.inputPlotSelect,e.inputs.map(n=>n.name)),this.populatePlotSelect(this.elements.outputPlotSelect,e.outputs.map(n=>n.name)),this.setStatus(`${e.classname}: ${e.state.current_state??"ready"} | ${e.state.lock_status?"locked":"not locked"}`),await Promise.all([this.refreshInputPlot(),this.refreshOutputPlot()]),this.scheduleLayoutRefresh()}refreshLayout(){this.inputPlot&&this.fitPlotToHost(this.inputPlot,this.elements.inputPlot);const e=this.elements.outputPlot.querySelectorAll(".lockbox-output-plot-frame");e[0]&&this.outputMagnitudePlot&&this.fitPlotToHost(this.outputMagnitudePlot,e[0]),e[1]&&this.outputPhasePlot&&this.fitPlotToHost(this.outputPhasePlot,e[1]),this.equalizeStageHeights()}getStageCount(){return this.schema?.sequence.length??0}getClassname(){return this.schema?.classname??null}populateClassSelect(e){const s=e.attributes.find(i=>i.name==="classname")?.options??[e.classname];this.elements.classSelect.textContent="";for(const i of s){const a=document.createElement("option");a.value=String(i),a.textContent=String(i),this.elements.classSelect.appendChild(a)}this.elements.classSelect.value=e.classname}populatePlotSelect(e,n){const s=e.value;e.textContent="";for(const i of n){const a=document.createElement("option");a.value=i,a.textContent=i,e.appendChild(a)}e.value=n.includes(s)?s:n[0]??""}renderActions(e){this.elements.actions.textContent="";for(const n of e){const s=document.createElement("button");s.type="button",s.textContent=n.label??n.name,s.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/actions/${n.name}`,{method:"POST"}).catch(i=>{S(this.elements.status,i.message)})}),this.elements.actions.appendChild(s)}}renderLockboxAttributes(e){const n=this.elements.root.querySelector("#lockbox-attributes");if(n){n.textContent="";for(const s of e)s.name!=="classname"&&n.appendChild(this.createAttributeField(s,i=>this.requestSchema(`/api/lockbox/attributes/${s.name}`,this.valueRequest(i))))}}renderInputs(e){this.elements.inputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"input");s.dataset.nodeName=n.name;const i=document.createElement("button");i.type="button",i.textContent="Calibrate",i.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/actions/calibrate`,{method:"POST"}).catch(o=>S(this.elements.status,o.message))}),s.querySelector(".lockbox-card-title")?.appendChild(i);const a=document.createElement("div");a.className="lockbox-control-row";for(const o of n.attributes)a.appendChild(this.createAttributeField(o,l=>this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/attributes/${o.name}`,this.valueRequest(l))));if(s.appendChild(a),n.calibration){const o=document.createElement("output");o.textContent=Object.entries(n.calibration).filter(([,l])=>typeof l=="number").slice(0,4).map(([l,u])=>`${l} ${Number(u).toPrecision(3)}`).join(" | "),s.appendChild(o)}this.elements.inputs.appendChild(s)}}renderOutputs(e){this.elements.outputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"output");s.dataset.nodeName=n.name;const i=document.createElement("div");i.className="lockbox-control-row";const a=!!n.attributes.find(l=>l.name==="assisted_design")?.value,o=String(n.attributes.find(l=>l.name==="tf_type")?.value??"filter");for(const l of n.attributes){const u=this.createAttributeField(l,d=>this.requestSchema(`/api/lockbox/outputs/${encodeURIComponent(n.name)}/attributes/${l.name}`,this.valueRequest(d)));["p","i"].includes(l.name)&&this.setFieldDisabled(u,a),["desired_unity_gain_frequency","analog_filter_cutoff"].includes(l.name)&&this.setFieldDisabled(u,!a),l.name==="tf_curve"&&this.setFieldDisabled(u,o!=="curve"),i.appendChild(u)}s.appendChild(i),this.elements.outputs.appendChild(s)}}renderStages(e){this.elements.stages.textContent="",this.stageLayoutWidth=0,this.stageHeight=0,this.elements.stages.style.removeProperty("--lockbox-stage-height"),e.forEach((n,s)=>{const i=this.createSectionCard(n.name,`stage ${s}`);i.classList.add("lockbox-stage-card");const a=document.createElement("button");a.type="button",a.textContent="Delete",a.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}`,{method:"DELETE"}).catch(v=>{S(this.elements.status,v.message)})});const o=document.createElement("button");o.type="button",o.textContent="Go to this stage",o.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}/actions/execute`,{method:"POST"}).catch(v=>S(this.elements.status,v.message))});const l=document.createElement("div");l.className="lockbox-card-actions",l.append(o,a),i.querySelector(".lockbox-card-title")?.appendChild(l);const u=document.createElement("div");u.className="lockbox-control-row";for(const v of n.attributes)u.appendChild(this.createAttributeField(v,f=>this.requestSchema(`/api/lockbox/stages/${s}/attributes/${v.name}`,this.valueRequest(f))));i.appendChild(u);const d=document.createElement("div");d.className="lockbox-stage-output-grid";for(const v of n.outputs){const f=document.createElement("section");f.className="lockbox-stage-output";const m=document.createElement("h4");m.textContent=v.output,f.appendChild(m);for(const y of v.attributes)f.appendChild(this.createAttributeField(y,E=>this.requestSchema(`/api/lockbox/stages/${s}/outputs/${encodeURIComponent(v.output)}/attributes/${y.name}`,this.valueRequest(E))));d.appendChild(f)}i.appendChild(d),this.elements.stages.appendChild(i)})}equalizeStageHeights(){const e=Array.from(this.elements.stages.querySelectorAll(".lockbox-stage-card")),n=Math.floor(this.elements.stages.getBoundingClientRect().width);if(e.length===0||n<1||n===this.stageLayoutWidth&&this.stageHeight>0)return;this.elements.stages.style.removeProperty("--lockbox-stage-height");const s=Math.ceil(Math.max(...e.map(i=>i.getBoundingClientRect().height)));s<1||(this.elements.stages.style.setProperty("--lockbox-stage-height",`${s}px`),this.stageLayoutWidth=n,this.stageHeight=s)}createSectionCard(e,n){const s=document.createElement("section");s.className="lockbox-card";const i=document.createElement("header");i.className="lockbox-card-title";const a=document.createElement("h3");a.textContent=e;const o=document.createElement("span");return o.textContent=n,i.append(a,o),s.appendChild(i),s}createAttributeField(e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");for(const l of e.options??[]){const u=document.createElement("option");u.value=String(l),u.textContent=String(l),o.appendChild(u)}o.value=String(e.value),o.addEventListener("change",()=>{const l=this.selectValue(o.value,e.options??[]);n(l).catch(u=>S(this.elements.status,u.message))}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{n(o.checked).catch(l=>S(this.elements.status,l.message))}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",o.value=String(e.value),e.min!==void 0&&(o.min=String(e.min)),e.max!==void 0&&(o.max=String(e.max)),e.step!==void 0&&(o.step=String(e.step)),o.addEventListener("change",()=>{n(Number(o.value)).catch(l=>S(this.elements.status,l.message))}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Array.isArray(e.value)?e.value.join(", "):String(e.value??""),o.addEventListener("change",()=>{n(this.textValue(o.value)).catch(l=>S(this.elements.status,l.message))}),a=o}return a.id=`lockbox-${e.name.replaceAll("_","-")}-${++zm}`,s.appendChild(a),s}setFieldDisabled(e,n){const s=e.querySelector("input, select");s&&(s.disabled=n),e.classList.toggle("is-disabled",n)}selectValue(e,n){return n.find(i=>String(i)===e)??e}textValue(e){const n=e.split(",").map(s=>s.trim()).filter(Boolean);return n.length>1&&n.every(s=>Number.isFinite(Number(s)))?n.map(s=>Number(s)):e}valueRequest(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:e})}}async setClass(e){await this.requestSchema("/api/lockbox/class",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({classname:e})})}async requestSchema(e,n){const s=await fetch(e,n);if(!s.ok)throw new Error(`Lockbox request failed: ${s.status}`);await this.applySchema(await s.json())}async refreshInputPlot(){const e=this.schema?.inputs.find(i=>i.name===this.elements.inputPlotSelect.value)??this.schema?.inputs[0];if(!e)return;const n=await fetch(`/api/lockbox/inputs/${encodeURIComponent(e.name)}/plot`);if(!n.ok)return;const s=await n.json();this.drawInputPlot(this.elements.inputPlot,"Expected Signal",s)}async refreshOutputPlot(){const e=this.schema?.outputs.find(i=>i.name===this.elements.outputPlotSelect.value)??this.schema?.outputs[0];if(!e)return;const n=await fetch(`/api/lockbox/outputs/${encodeURIComponent(e.name)}/transfer_function`);if(!n.ok)return;const s=await n.json();this.drawOutputPlot(this.elements.outputPlot,s)}drawInputPlot(e,n,s){this.inputPlot?.destroy(),e.textContent="";const i=this.plotSize(e),a=new Re({title:n,width:i.width,height:i.height,scales:{x:{time:!1}},series:[{},...s.series.map((o,l)=>({label:o.label,stroke:l===0?We.green:We.blue,width:2}))],axes:[bt(),bt()]},[s.x,...s.series.map(o=>o.values)],e);this.inputPlot=a}drawOutputPlot(e,n){this.outputMagnitudePlot?.destroy(),this.outputPhasePlot?.destroy(),e.textContent="";const s=document.createElement("div"),i=document.createElement("div");s.className="lockbox-output-plot-frame",i.className="lockbox-output-plot-frame",e.append(s,i),this.resizeObserver.observe(s),this.resizeObserver.observe(i);const a=n.series.find(l=>l.label==="magnitude")?.values??[],o=n.series.find(l=>l.label==="phase")?.values??[];this.outputMagnitudePlot=new Re({title:"Open-loop magnitude",...this.outputPlotOptions(this.plotSize(s),!0),series:[{},{label:"magnitude",stroke:We.green,width:2}]},[n.x,a.map(l=>Math.max(1e-30,l))],s),this.outputPhasePlot=new Re({title:"Open-loop phase",...this.outputPlotOptions(this.plotSize(i),!1),series:[{},{label:"phase",stroke:We.blue,width:2}]},[n.x,o],i),this.scheduleLayoutRefresh()}outputPlotOptions(e,n){return{width:e.width,height:e.height,scales:{x:{time:!1,distr:3},y:n?{distr:3}:{auto:!0}},axes:[bt(),bt()]}}plotSize(e){const n=e.getBoundingClientRect();return{width:Math.floor(n.width)||420,height:Math.floor(n.height)||224}}fitPlotToHost(e,n){const s=n.getBoundingClientRect();if(s.width<1||s.height<1)return;const i=e.root.querySelector(".u-wrap")?.getBoundingClientRect(),a=Math.max(0,Math.ceil(e.root.getBoundingClientRect().height-(i?.height??0)));e.setSize({width:Math.floor(s.width),height:Math.max(80,Math.floor(s.height)-a)})}scheduleLayoutRefresh(){if(this.resizeFrame!==null)return;let e=3;const n=()=>{this.resizeFrame=requestAnimationFrame(()=>{this.elements.root.hidden||this.refreshLayout(),e-=1,e>0?n():this.resizeFrame=null})};n()}setStatus(e){this.elements.status.textContent=e}}var Ot=typeof window<"u"?window:null,Nr=Ot===null,Wi=Nr?void 0:Ot.document,Gt="addEventListener",Kt="removeEventListener",Do="getBoundingClientRect",Ri="_a",Zt="_b",kn="_c",ya="horizontal",Jt=function(){return!1},Lm=Nr?"calc":["","-webkit-","-moz-","-o-"].filter(function(t){var e=Wi.createElement("div");return e.style.cssText="width:"+t+"calc(9px)",!!e.style.length}).shift()+"calc",Xu=function(t){return typeof t=="string"||t instanceof String},qc=function(t){if(Xu(t)){var e=Wi.querySelector(t);if(!e)throw new Error("Selector "+t+" did not match a DOM element");return e}return t},ot=function(t,e,n){var s=t[e];return s!==void 0?s:n},xa=function(t,e,n,s){if(e){if(s==="end")return 0;if(s==="center")return t/2}else if(n){if(s==="start")return 0;if(s==="center")return t/2}return t},Fm=function(t,e){var n=Wi.createElement("div");return n.className="gutter gutter-"+e,n},Tm=function(t,e,n){var s={};return Xu(e)?s[t]=e:s[t]=Lm+"("+e+"% - "+n+"px)",s},Rm=function(t,e){var n;return n={},n[t]=e+"px",n},ea=function(t,e){if(e===void 0&&(e={}),Nr)return{};var n=t,s,i,a,o,l,u;Array.from&&(n=Array.from(n));var d=qc(n[0]),v=d.parentNode,f=getComputedStyle?getComputedStyle(v):null,m=f?f.flexDirection:null,y=ot(e,"sizes")||n.map(function(){return 100/n.length}),E=ot(e,"minSize",100),R=Array.isArray(E)?E:n.map(function(){return E}),L=ot(e,"maxSize",1/0),F=Array.isArray(L)?L:n.map(function(){return L}),M=ot(e,"expandToMin",!1),B=ot(e,"gutterSize",10),_=ot(e,"gutterAlign","center"),Z=ot(e,"snapOffset",30),$=Array.isArray(Z)?Z:n.map(function(){return Z}),ne=ot(e,"dragInterval",1),G=ot(e,"direction",ya),ae=ot(e,"cursor",G===ya?"col-resize":"row-resize"),ee=ot(e,"gutter",Fm),T=ot(e,"elementStyle",Tm),se=ot(e,"gutterStyle",Rm);G===ya?(s="width",i="clientX",a="left",o="right",l="clientWidth"):G==="vertical"&&(s="height",i="clientY",a="top",o="bottom",l="clientHeight");function V(I,k,P,Y){var Me=T(s,k,P,Y);Object.keys(Me).forEach(function(pe){I.style[pe]=Me[pe]})}function J(I,k,P){var Y=se(s,k,P);Object.keys(Y).forEach(function(Me){I.style[Me]=Y[Me]})}function H(){return u.map(function(I){return I.size})}function re(I){return"touches"in I?I.touches[0][i]:I[i]}function W(I){var k=u[this.a],P=u[this.b],Y=k.size+P.size;k.size=I/this.size*Y,P.size=Y-I/this.size*Y,V(k.element,k.size,this[Zt],k.i),V(P.element,P.size,this[kn],P.i)}function it(I){var k,P=u[this.a],Y=u[this.b];this.dragging&&(k=re(I)-this.start+(this[Zt]-this.dragOffset),ne>1&&(k=Math.round(k/ne)*ne),k<=P.minSize+P.snapOffset+this[Zt]?k=P.minSize+this[Zt]:k>=this.size-(Y.minSize+Y.snapOffset+this[kn])&&(k=this.size-(Y.minSize+this[kn])),k>=P.maxSize-P.snapOffset+this[Zt]?k=P.maxSize+this[Zt]:k<=this.size-(Y.maxSize-Y.snapOffset+this[kn])&&(k=this.size-(Y.maxSize+this[kn])),W.call(this,k),ot(e,"onDrag",Jt)(H()))}function Se(){var I=u[this.a].element,k=u[this.b].element,P=I[Do](),Y=k[Do]();this.size=P[s]+Y[s]+this[Zt]+this[kn],this.start=P[a],this.end=P[o]}function ue(I){if(!getComputedStyle)return null;var k=getComputedStyle(I);if(!k)return null;var P=I[l];return P===0?null:(G===ya?P-=parseFloat(k.paddingLeft)+parseFloat(k.paddingRight):P-=parseFloat(k.paddingTop)+parseFloat(k.paddingBottom),P)}function ve(I){var k=ue(v);if(k===null||R.reduce(function(pe,Oe){return pe+Oe},0)>k)return I;var P=0,Y=[],Me=I.map(function(pe,Oe){var ft=k*pe/100,Ht=xa(B,Oe===0,Oe===I.length-1,_),on=R[Oe]+Ht;return ft<on?(P+=on-ft,Y.push(0),on):(Y.push(ft-on),ft)});return P===0?I:Me.map(function(pe,Oe){var ft=pe;if(P>0&&Y[Oe]-P>0){var Ht=Math.min(P,Y[Oe]-P);P-=Ht,ft=pe-Ht}return ft/k*100})}function oe(){var I=this,k=u[I.a].element,P=u[I.b].element;I.dragging&&ot(e,"onDragEnd",Jt)(H()),I.dragging=!1,Ot[Kt]("mouseup",I.stop),Ot[Kt]("touchend",I.stop),Ot[Kt]("touchcancel",I.stop),Ot[Kt]("mousemove",I.move),Ot[Kt]("touchmove",I.move),I.stop=null,I.move=null,k[Kt]("selectstart",Jt),k[Kt]("dragstart",Jt),P[Kt]("selectstart",Jt),P[Kt]("dragstart",Jt),k.style.userSelect="",k.style.webkitUserSelect="",k.style.MozUserSelect="",k.style.pointerEvents="",P.style.userSelect="",P.style.webkitUserSelect="",P.style.MozUserSelect="",P.style.pointerEvents="",I.gutter.style.cursor="",I.parent.style.cursor="",Wi.body.style.cursor=""}function j(I){if(!("button"in I&&I.button!==0)){var k=this,P=u[k.a].element,Y=u[k.b].element;k.dragging||ot(e,"onDragStart",Jt)(H()),I.preventDefault(),k.dragging=!0,k.move=it.bind(k),k.stop=oe.bind(k),Ot[Gt]("mouseup",k.stop),Ot[Gt]("touchend",k.stop),Ot[Gt]("touchcancel",k.stop),Ot[Gt]("mousemove",k.move),Ot[Gt]("touchmove",k.move),P[Gt]("selectstart",Jt),P[Gt]("dragstart",Jt),Y[Gt]("selectstart",Jt),Y[Gt]("dragstart",Jt),P.style.userSelect="none",P.style.webkitUserSelect="none",P.style.MozUserSelect="none",P.style.pointerEvents="none",Y.style.userSelect="none",Y.style.webkitUserSelect="none",Y.style.MozUserSelect="none",Y.style.pointerEvents="none",k.gutter.style.cursor=ae,k.parent.style.cursor=ae,Wi.body.style.cursor=ae,Se.call(k),k.dragOffset=re(I)-k.end}}y=ve(y);var ke=[];u=n.map(function(I,k){var P={element:qc(I),size:y[k],minSize:R[k],maxSize:F[k],snapOffset:$[k],i:k},Y;if(k>0&&(Y={a:k-1,b:k,dragging:!1,direction:G,parent:v},Y[Zt]=xa(B,k-1===0,!1,_),Y[kn]=xa(B,!1,k===n.length-1,_),m==="row-reverse"||m==="column-reverse")){var Me=Y.a;Y.a=Y.b,Y.b=Me}if(k>0){var pe=ee(k,G,P.element);J(pe,B,k),Y[Ri]=j.bind(Y),pe[Gt]("mousedown",Y[Ri]),pe[Gt]("touchstart",Y[Ri]),v.insertBefore(pe,P.element),Y.gutter=pe}return V(P.element,P.size,xa(B,k===0,k===n.length-1,_),k),k>0&&ke.push(Y),P});function Xe(I){var k=I.i===ke.length,P=k?ke[I.i-1]:ke[I.i];Se.call(P);var Y=k?P.size-I.minSize-P[kn]:I.minSize+P[Zt];W.call(P,Y)}u.forEach(function(I){var k=I.element[Do]()[s];k<I.minSize&&(M?Xe(I):I.minSize=k)});function Pe(I){var k=ve(I);k.forEach(function(P,Y){if(Y>0){var Me=ke[Y-1],pe=u[Me.a],Oe=u[Me.b];pe.size=k[Y-1],Oe.size=P,V(pe.element,pe.size,Me[Zt],pe.i),V(Oe.element,Oe.size,Me[kn],Oe.i)}})}function de(I,k){ke.forEach(function(P){if(k!==!0?P.parent.removeChild(P.gutter):(P.gutter[Kt]("mousedown",P[Ri]),P.gutter[Kt]("touchstart",P[Ri])),I!==!0){var Y=T(s,P.a.size,P[Zt]);Object.keys(Y).forEach(function(Me){u[P.a].element.style[Me]="",u[P.b].element.style[Me]=""})}})}return{setSizes:Pe,getSizes:H,collapse:function(k){Xe(u[k])},destroy:de,parent:v,pairs:ke}};class Im{constructor(e,n,s,i,a,o,l,u,d){this.controlsHost=e,this.magnitudeHost=n,this.phaseHost=s,this.status=i,this.singleButton=a,this.runButton=o,this.stopButton=l,this.saveButton=u,this.resetButton=d,this.reconnectScheduler=new Qa(()=>this.openSocket()),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.magnitudeHost.parentElement??this.magnitudeHost),this.resizeObserver.observe(this.phaseHost.parentElement??this.phaseHost);const v=this.controlsHost.parentElement,f=this.magnitudeHost.closest(".network-plots");if(!v||!f)throw new Error("Network analyzer split panes are missing");this.controlsPane=v,this.plotsPane=f,this.bindActions(),this.scheduleResize()}controlsHost;magnitudeHost;phaseHost;status;singleButton;runButton;stopButton;saveButton;resetButton;state={};subscriptionEnabled=!1;readOnly=!1;magnitudePlot;phasePlot;socket=null;wantsConnection=!1;reconnectScheduler;runId=-1;x=[];magnitude=[];phase=[];real=[];imaginary=[];redrawFrame=null;resizeFrame=null;userScaled=!1;logscale=!0;lastProgress="";resizeObserver;split=null;controlsPane;plotsPane;async initialize(){const[e,n]=await Promise.all([fetch("/api/modules/networkanalyzer/attributes"),fetch("/api/modules/networkanalyzer")]);if(!e.ok||!n.ok)throw new Error("Network analyzer controls failed to load");const s=await e.json(),i=await n.json();this.renderControls(s.attributes??[]),this.applyState(i.state??i)}applyState(e){this.state={...this.state,...e};for(const[o,l]of Object.entries(e)){const u=this.controlsHost.querySelector(`#networkanalyzer-${o.replaceAll("_","-")}`);!u||document.activeElement===u||(u instanceof HTMLInputElement&&u.type==="checkbox"?u.checked=!!l:u.value=String(l))}const n=String(this.state.running_state??"stopped").startsWith("running_"),s=String(this.state.running_state??"stopped").startsWith("paused_");this.runButton.textContent=n?"Pause":s?"Resume":"Continuous",this.runButton.disabled=this.readOnly,this.stopButton.disabled=this.readOnly||!n&&!s;const i=typeof this.state.iq_module=="string"?` on ${this.state.iq_module}`:"",a=`${String(this.state.running_state??"stopped")}${i}`;this.status.textContent=!n&&this.lastProgress?`${this.lastProgress}, ${a}`:a,this.subscriptionEnabled?this.connectSocket():this.closeSocket()}setSubscriptionEnabled(e){this.subscriptionEnabled=e,this.applyState({})}setReadOnly(e){this.readOnly=e,this.saveButton.textContent=e?"Download CSV":"Save Curve"}refreshLayout(){this.ensureSplit(),this.scheduleResize()}getCurveData(){const e=qo(this.x);return e?{x:this.x.slice(0,e),real:this.real.slice(0,e),imaginary:this.imaginary.slice(0,e)}:null}destroy(){this.closeSocket(),this.resizeObserver.disconnect(),this.split?.destroy(),this.magnitudePlot.destroy(),this.phasePlot.destroy()}bindActions(){this.singleButton.addEventListener("click",()=>{this.start("single")}),this.runButton.addEventListener("click",()=>{const e=String(this.state.running_state);this.start(e.startsWith("running_")?"pause":e.startsWith("paused_")?"resume":"continuous")}),this.stopButton.addEventListener("click",()=>{this.stop()}),this.saveButton.addEventListener("click",()=>{if(this.readOnly){this.downloadCsv();return}this.persistCurve().then(()=>{this.downloadCsv(),this.status.textContent="Curve saved"}).catch(e=>{S(this.status,e.message)})}),this.resetButton.addEventListener("click",()=>this.resetZoom())}ensureSplit(){this.split||this.controlsPane.closest(".workspace-panel")?.hidden||(this.split=ea([this.controlsPane,this.plotsPane],{direction:"vertical",sizes:[34,66],minSize:[100,240],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}async start(e){const n=await fetch(`/api/modules/networkanalyzer/actions/${e}`,{method:"POST"});if(!n.ok){S(this.status,`Network analyzer ${e} failed: ${n.status}`);return}const s=await n.json();this.applyState(s.state??{}),this.connectSocket()}async stop(){const e=await fetch("/api/modules/networkanalyzer/actions/stop",{method:"POST"});if(e.ok){const n=await e.json();this.applyState(n.state??{})}this.closeSocket()}connectSocket(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=new WebSocket(`${e}://${window.location.host}/ws/networkanalyzer`);this.socket=n,n.addEventListener("open",()=>{this.socket===n&&this.reconnectScheduler.connected()}),n.addEventListener("message",s=>{if(this.socket!==n)return;const i=JSON.parse(String(s.data));if(i.snapshot)for(const a of i.snapshot)this.showPoint(a);else this.showPoint(i)}),n.addEventListener("close",()=>{if(this.socket===n&&(this.socket=null,this.wantsConnection)){const s=this.reconnectScheduler.schedule();this.status.textContent=`Network Analyzer stream closed; reconnecting${s===null?"":` in ${s} ms`}`}})}closeSocket(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}showPoint(e){e.run_id!==this.runId&&(this.runId=e.run_id,this.x=new Array(e.points).fill(Number.NaN),this.magnitude=new Array(e.points).fill(Number.NaN),this.phase=new Array(e.points).fill(Number.NaN),this.real=new Array(e.points).fill(Number.NaN),this.imaginary=new Array(e.points).fill(Number.NaN),this.userScaled=!1),this.x[e.index]=e.x;const n=Math.hypot(e.real,e.imag);this.magnitude[e.index]=20*Math.log10(Math.max(n,1e-20)),this.phase[e.index]=Math.atan2(e.imag,e.real)*180/Math.PI,this.real[e.index]=e.real,this.imaginary[e.index]=e.imag,this.logscale!==e.logscale&&(this.logscale=e.logscale,this.recreatePlots()),this.scheduleRedraw();const s=e.time_per_point>0?`${Nm(e.time_per_point*1e3)} ms/point`:"";this.lastProgress=`${e.index+1}/${e.points}, average ${e.current_avg}${s?`, ${s}`:""}`,this.status.textContent=this.lastProgress}renderControls(e){this.controlsHost.textContent="";const n=[["Channels",["input","output_direct"]],["Frequency",["start_freq","stop_freq","points","logscale"]],["Setup",["amplitude","acbandwidth"]],["Averaging",["average_per_point","rbw","trace_average","curve_name"]],["Auto Bandwidth",["auto_bandwidth","q_factor_min"]],["Auto Amplitude",["auto_amplitude","target_dbv","auto_amp_min","auto_amp_max"]]],s=new Map(e.map(i=>[i.name,i]));for(const[i,a]of n){const o=document.createElement("fieldset");o.className="network-control-group";const l=document.createElement("legend");l.textContent=i,o.appendChild(l);for(const u of a){const d=s.get(u);d&&o.appendChild(this.createControl(d))}this.controlsHost.appendChild(o)}}createControl(e){const n=document.createElement("label"),s=document.createElement("span");s.textContent=e.label,n.appendChild(s);let i;if(e.type==="select"){const a=document.createElement("select");for(const o of e.options??[]){const l=document.createElement("option");l.value=String(o),l.textContent=String(o),a.appendChild(l)}a.value=String(e.value),i=a}else{const a=document.createElement("input");a.type=e.type==="bool"?"checkbox":e.type,a.type==="checkbox"?a.checked=!!e.value:a.value=String(e.value),e.min!==void 0&&(a.min=String(e.min)),e.max!==void 0&&(a.max=String(e.max)),e.step!==void 0&&(a.step=String(e.step)),i=a}return i.id=`networkanalyzer-${e.name.replaceAll("_","-")}`,i.addEventListener("change",()=>{this.writeAttribute(e,i)}),n.appendChild(i),n}async writeAttribute(e,n){const s=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:e.type==="number"?Number(n.value):n.value,i=await fetch(`/api/modules/networkanalyzer/attributes/${e.name}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:s})});if(!i.ok){S(this.status,`${e.label} update failed: ${i.status}`);return}this.status.textContent=`${e.label} updated`}createPlot(e,n,s,i){return new Re({width:800,height:260,title:n,scales:{x:{time:!1,distr:this.logscale?3:1},y:{auto:!0}},axes:[bt({label:i?"Frequency (Hz)":""}),bt({label:s})],series:[{},{label:n,stroke:We.yellow,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}},hooks:{setScale:[(a,o)=>{(o==="x"||o==="y")&&(this.userScaled=!0)}]}},[[],[]],e)}recreatePlots(){this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.scheduleResize()}scheduleRedraw(){this.redrawFrame===null&&(this.redrawFrame=requestAnimationFrame(()=>{this.redrawFrame=null;const e=qo(this.x);this.magnitudePlot.setData([this.x.slice(0,e),this.magnitude.slice(0,e)]),this.phasePlot.setData([this.x.slice(0,e),this.phase.slice(0,e)])}))}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resizePlot(this.magnitudePlot,this.magnitudeHost),this.resizePlot(this.phasePlot,this.phaseHost)}))}resizePlot(e,n){const s=n.parentElement?.getBoundingClientRect();!s||s.width<100||s.height<100||e.setSize({width:Math.floor(s.width),height:Math.floor(s.height)})}resetZoom(){this.userScaled=!1;const e=Bo(this.x,this.logscale?.03:0,1,this.logscale),n=Bo(this.magnitude,-120,20),s=Bo(this.phase,-180,180);this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",n),this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",s)}downloadCsv(){const e=["x,magnitude_db,phase_deg"];for(let i=0;i<this.x.length;i+=1)Number.isFinite(this.x[i])&&e.push(`${this.x[i]},${this.magnitude[i]},${this.phase[i]}`);const n=URL.createObjectURL(new Blob([`${e.join(`
`)}
`],{type:"text/csv"})),s=document.createElement("a");s.href=n,s.download=`network-analyzer-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`,s.click(),URL.revokeObjectURL(n)}async persistCurve(){const e=qo(this.x);if(e===0)throw new Error("No network analyzer curve to save");const n=this.controlsHost.querySelector("#networkanalyzer-curve-name"),s=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:this.x.slice(0,e),y:this.real.slice(0,e),y_imag:this.imaginary.slice(0,e),params:{...this.currentControlParameters(),name:n?.value||"networkanalyzer curve",module:"networkanalyzer"}})});if(!s.ok)throw new Error(`Save curve failed: ${s.status}`)}currentControlParameters(){const e={};for(const n of this.controlsHost.querySelectorAll("input, select")){const s=n.id.replace(/^networkanalyzer-/,"").replaceAll("-","_");e[s]=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:n instanceof HTMLInputElement&&n.type==="number"?Number(n.value):n.value}return e}}function Nm(t){return t>=100?t.toFixed(0):t>=10?t.toFixed(1):t.toFixed(2)}function Bo(t,e,n,s=!1){const i=t.filter(Number.isFinite);if(i.length===0)return{min:e,max:n};const a=Math.min(...i),o=Math.max(...i);if(s)return{min:a/1.1,max:o*1.1};if(a===o)return{min:a-1,max:o+1};const l=(o-a)*.04;return{min:a-l,max:o+l}}function qo(t){let e=0;for(;e<t.length&&Number.isFinite(t[e]);)e+=1;return e}class Om{constructor(e,n,s,i,a,o,l,u,d,v,f){this.root=e,this.listPane=n,this.plotPane=s,this.paramsPane=i,this.select=a,this.name=o,this.params=l,this.status=u,this.saveParamsButton=d,this.deleteButton=v,this.refreshButton=f;const m=this.requireHost("#curve-viewer-magnitude"),y=this.requireHost("#curve-viewer-phase");this.magnitudePlot=this.createPlot(m,"Curve","Value"),this.phasePlot=this.createPlot(y,"Phase","deg"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotPane),this.bindActions()}root;listPane;plotPane;paramsPane;select;name;params;status;saveParamsButton;deleteButton;refreshButton;magnitudePlot;phasePlot;split=null;resizeObserver;resizeFrame=null;selected=null;loaded=!1;loading=null;async load(){this.loading||(this.params.disabled=!0,this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0,this.loading=this.refreshList().then(()=>{this.loaded=!0}).finally(()=>{this.loading=null,this.params.disabled=!1,this.saveParamsButton.disabled=!this.selected,this.deleteButton.disabled=!this.selected})),await this.loading}refreshLayout(){this.ensureSplit(),this.scheduleResize(),!this.root.hidden&&!this.loaded&&this.load().catch(e=>{S(this.status,e.message)})}bindActions(){const e=n=>{S(this.status,n.message)};this.select.addEventListener("change",()=>{this.loadSelected().catch(e)}),this.refreshButton.addEventListener("click",()=>{this.load().catch(e)}),this.saveParamsButton.addEventListener("click",()=>{this.saveParams().catch(e)}),this.deleteButton.addEventListener("click",()=>{this.deleteSelected().catch(e)})}async refreshList(){const e=this.select.value,n=await fetch("/api/curves?limit=100");if(!n.ok)throw new Error(`Curve list failed: ${n.status}`);const i=(await n.json()).curves??[];this.select.textContent="";for(const a of i){const o=document.createElement("option");o.value=String(a.pk),o.textContent=`${a.pk}: ${a.name}`,this.select.appendChild(o)}i.some(a=>String(a.pk)===e)?this.select.value=e:i[0]&&(this.select.value=String(i[0].pk)),this.status.textContent=`${i.length} curve${i.length===1?"":"s"}`,i.length?await this.loadSelected():this.clear()}async loadSelected(){if(!this.select.value)return this.clear();const e=await fetch(`/api/curves/${encodeURIComponent(this.select.value)}`);if(!e.ok)throw new Error(`Curve load failed: ${e.status}`);const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.saveParamsButton.disabled=!1,this.deleteButton.disabled=!1;const s=Array.isArray(this.selected.y_imag),i=s?this.selected.y.map((l,u)=>20*Math.log10(Math.max(Math.hypot(l,this.selected.y_imag[u]),1e-20))):this.selected.y,a=s?this.selected.y.map((l,u)=>Math.atan2(this.selected.y_imag[u],l)*180/Math.PI):[];this.magnitudePlot.setData([this.selected.x,i]),this.phasePlot.setData([s?this.selected.x:[],a]);const o=this.phasePlot.root.closest(".curve-viewer-plot-frame");o&&(o.hidden=!s),this.plotPane.classList.toggle("is-complex",s),this.status.textContent=`curve ${this.selected.pk}, ${this.selected.points} points`,this.scheduleResize()}async saveParams(){if(!this.selected)return;const e=await fetch(`/api/curves/${this.selected.pk}/params`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({params_yaml:this.params.value})});if(!e.ok){const s=await e.json().catch(()=>({}));S(this.status,s.detail??`Save parameters failed: ${e.status}`);return}const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.status.textContent=`curve ${this.selected.pk} parameters saved`,await this.refreshList()}async deleteSelected(){if(!this.selected)return;const e=this.selected.pk,n=await fetch(`/api/curves/${e}`,{method:"DELETE"});if(!n.ok){S(this.status,`Delete curve failed: ${n.status}`);return}this.selected=null,await this.refreshList(),this.status.textContent=`curve ${e} deleted`}clear(){this.selected=null,this.name.value="",this.params.value="",this.magnitudePlot.setData([[],[]]),this.phasePlot.setData([[],[]]),this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0}ensureSplit(){this.split||this.root.hidden||(this.split=ea([this.listPane,this.plotPane,this.paramsPane],{direction:"horizontal",sizes:[18,57,25],minSize:[140,300,200],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}createPlot(e,n,s){return new Re({width:700,height:260,title:n,scales:{x:{time:!1},y:{auto:!0}},axes:[bt({label:"X"}),bt({label:s})],series:[{},{label:n,stroke:We.green,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}}},[[],[]],e)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=this.plotPane.querySelectorAll(".curve-viewer-plot-frame:not([hidden])"),n=[this.magnitudePlot,this.phasePlot];e.forEach((s,i)=>{const a=s.getBoundingClientRect();a.width>100&&a.height>80&&n[i].setSize({width:Math.floor(a.width),height:Math.floor(a.height)})})}))}requireHost(e){const n=this.root.querySelector(e);if(!n)throw new Error(`Missing curve viewer element ${e}`);return n}}function $m(t,e,n,s){if(!t.length||e.length!==t.length||s&&s.length!==t.length)throw new Error("Curve arrays must have the same nonzero length");const i=new TextEncoder().encode(JSON.stringify({points:t.length,complex:!!s,params:n})),a=s?[t,e,s]:[t,e],o=new ArrayBuffer(8+i.length+a.length*t.length*8),l=new Uint8Array(o);l.set([80,89,67,49]);const u=new DataView(o);u.setUint32(4,i.length,!0),l.set(i,8);let d=8+i.length;for(const v of a)for(const f of v)u.setFloat64(d,f,!0),d+=8;return o}const Gu={scope:["ch1_active","ch2_active","ch_math_active","math_formula","xy_mode"],spectrumanalyzer:["display_unit","display_input1_baseband","display_input2_baseband","display_cross_amplitude","window"],iir:["tf_type","data_curve","plot_data","plot_data_times_filter","plot_measurement"]};function eo(t,e){return Gu[t]?.includes(e)??!1}const Dm=new Set(["show-ch1","show-ch2","scope-xy-mode","scope-math-active","scope-math-formula","zoom-reset","spectrum-zoom-reset","iir-zoom-reset","network-reset","save-curve","spectrum-save-curve","network-save","lockbox-input-plot-select","lockbox-output-plot-select","curve-viewer-select","curve-viewer-refresh","curve-viewer-name","curve-viewer-params","config-module","config-refresh","config-text","hk-refresh","telemetry-refresh","sampler-stats-signal","sampler-stats-duration","sampler-stats-run","register-read-addr","register-read-length","register-read","register-output"]);function Or(t){return t.dataset.controlScope==="view"||!!t.closest(".workspace-pane-selector")||Dm.has(t.id)||/^(spectrum-)?(zoom-(in|out|y-in|y-out)|pan-(left|right|up|down))$/.test(t.id)}const Vc="pyrpl-websocket.plot-views.v1";class Bm{values={};constructor(){try{const e=JSON.parse(window.localStorage.getItem(Vc)??"{}");for(const[n,s]of Object.entries(Gu))for(const i of s){const a=e?.[n]?.[i];["string","number","boolean"].includes(typeof a)&&this.set(n,i,a)}}catch{}}set(e,n,s){if(!eo(e,n))throw new Error(`Not a local plot setting: ${e}.${n}`);(this.values[e]??={})[n]=s;try{window.localStorage.setItem(Vc,JSON.stringify(this.values))}catch{}}get(e){return{...this.values[e]}}merge(e,n){return{...n,...this.values[e]}}}class qm{constructor(e){this.elements=e,e.module.addEventListener("change",()=>{this.load(e.module.value).catch(n=>S(this.elements.status,n.message))}),e.refresh.addEventListener("click",()=>{this.load(e.module.value).catch(n=>S(this.elements.status,n.message))}),e.save.addEventListener("click",()=>{this.save().catch(n=>S(this.elements.status,n.message))})}elements;schema=null;async load(e=this.schema?.module??"pyrpl"){const n=await fetch(`/api/config?module=${encodeURIComponent(e)}`);if(!n.ok)throw new Error(await Yc(n,"Configuration unavailable"));this.apply(await n.json()),this.setStatus(`Loaded ${this.schema?.module}`)}async save(){const e=this.elements.module.value,n=await fetch(`/api/config/branches/${encodeURIComponent(e)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:this.elements.text.value})});if(!n.ok)throw new Error(await Yc(n,"Configuration save failed"));this.apply(await n.json()),this.setStatus(`Saved ${e}`)}getModule(){return this.elements.module.value}getText(){return this.elements.text.value}apply(e){this.schema=e,this.elements.file.textContent=e.configfile,this.elements.module.textContent="";for(const n of e.modules){const s=document.createElement("option");s.value=n,s.textContent=n,this.elements.module.appendChild(s)}this.elements.module.value=e.module,this.elements.text.value=e.text,this.elements.module.disabled=!1,this.elements.text.disabled=!1,this.elements.refresh.disabled=!1,this.elements.save.disabled=!1}setStatus(e){this.elements.status.textContent=e}}async function Yc(t,e){try{return(await t.json()).detail??`${e}: ${t.status}`}catch{return`${e}: ${t.status}`}}const Hc="pyrpl-control-client-id";function Vm(){try{const t=window.sessionStorage.getItem(Hc);if(t)return t;const e=window.crypto.randomUUID();return window.sessionStorage.setItem(Hc,e),e}catch{return`browser-${Date.now()}-${Math.random().toString(16).slice(2)}`}}class Ym{id=Vm();label=`Browser ${this.id.slice(0,8)}`;nativeFetch;heartbeatTimer=null;constructor(){this.nativeFetch=window.fetch.bind(window)}installFetchHeaders(){const e=this.nativeFetch;window.fetch=((n,s={})=>{if(new URL(n instanceof Request?n.url:String(n),window.location.href).origin!==window.location.origin)return e(n,s);const a=new Headers(n instanceof Request?n.headers:void 0);return new Headers(s.headers).forEach((o,l)=>a.set(l,o)),a.set("x-pyrpl-client-id",this.id),a.set("x-pyrpl-client-label",this.label),e(n,{...s,headers:a})})}async initialize(){let e=await this.refresh();return e.policy==="single-writer"&&e.controller===null&&(e=await this.claim(!1)),this.startHeartbeat(e.lease_seconds),e}async refresh(){return this.request("/api/control",{method:"GET"})}async claim(e){return this.request("/api/control/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({label:this.label,force:e})})}release(){window.fetch("/api/control/release",{method:"POST",keepalive:!0}).catch(()=>{})}startHeartbeat(e){this.heartbeatTimer!==null&&window.clearInterval(this.heartbeatTimer);const n=Math.max(2e3,Math.min(1e4,e*400));this.heartbeatTimer=window.setInterval(()=>{this.request("/api/control/heartbeat",{method:"POST"}).catch(()=>{})},n)}async request(e,n){const s=await window.fetch(e,n);if(!s.ok){let i=`Control request failed: ${s.status}`;try{const a=await s.json();a.detail&&(i=a.detail)}catch{}throw new Error(i)}return s.json()}}const Yt=[{id:"scope",title:"Scope",description:"Oscilloscope controls and live waveform",defaultEnabled:!0,defaultSplitSizes:[28,72]},{id:"asg",title:"ASG",description:"Arbitrary signal generator controls",defaultEnabled:!1},{id:"pid",title:"PID",description:"PID controller controls",defaultEnabled:!1},{id:"iq",title:"IQ",description:"IQ modulator and demodulator controls",defaultEnabled:!1},{id:"iir",title:"IIR",description:"Infinite impulse response filter controls",defaultEnabled:!1},{id:"trig",title:"Trigger",description:"DSP trigger controls",defaultEnabled:!1},{id:"pwm",title:"PWM",description:"Auxiliary PWM routing controls",defaultEnabled:!1},{id:"spectrumanalyzer",title:"Spectrum Analyzer",description:"FFT spectrum analyzer controls and plot",defaultEnabled:!1,defaultSplitSizes:[35,65]},{id:"networkanalyzer",title:"Network Analyzer",description:"Coherent swept-frequency response measurement",defaultEnabled:!1,defaultSplitSizes:[34,66]},{id:"curveviewer",title:"Curve Viewer",description:"Browse and manage saved PyRPL curves",defaultEnabled:!1},{id:"pyrplconfig",title:"Configuration",description:"Edit PyRPL YAML configuration branches",defaultEnabled:!1},{id:"lockbox",title:"Lockbox",description:"Model-based lock sequence controls",defaultEnabled:!1},{id:"housekeeping",title:"Housekeeping",description:"LED and expansion connector I/O",defaultEnabled:!1},{id:"telemetry",title:"Sampler & AMS",description:"DSP signal readback, statistics, and AMS DAC controls",defaultEnabled:!1},{id:"registers",title:"Register Debug",description:"Raw monitor_server register read/write",defaultEnabled:!1}];function Hm(t){const e=Yt.find(n=>n.id===t);if(!e)throw new Error(`Unknown panel ${t}`);return e}function nr(t){const e=t.trim();if(!e)throw new Error("Register value is empty");const n=Number(e);if(!Number.isInteger(n)||n<0)throw new Error(`Invalid register integer: ${t}`);return n}function jm(t){const e=t.split(/[\s,]+/).map(n=>n.trim()).filter(Boolean).map(nr);if(e.length===0)throw new Error("At least one register value is required");return e}function Sa(t){return`0x${(t>>>0).toString(16).padStart(8,"0")} (${t>>>0})`}async function jc(t,e,n){const s=await fetch(t,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)});if(!s.ok)throw new Error(`${n}: ${s.status}`);return await s.json()}function Wm(t){async function e(){const s=nr(t.readAddr.value),i=Math.max(1,Math.min(64,Number(t.readLength.value))),a=await jc("/api/register/read",{addr:s,length:i},"Register read failed");t.status.textContent=`read ${a.length} word${a.length===1?"":"s"}`,t.output.value=a.values.map((o,l)=>`${Sa(s+l*4)}: ${Sa(o)}`).join(`
`)}async function n(){const s=nr(t.writeAddr.value),i=jm(t.writeValues.value),a=await jc("/api/register/write",{addr:s,values:i},"Register write failed");t.status.textContent=`wrote ${a.count} word${a.count===1?"":"s"}`,t.output.value=i.map((o,l)=>`${Sa(s+l*4)} <= ${Sa(o)}`).join(`
`)}return t.readButton.addEventListener("click",()=>{e().catch(s=>{S(t.status,s.message)})}),t.writeButton.addEventListener("click",()=>{n().catch(s=>{S(t.status,s.message)})}),{read:e,write:n}}const Ku="pyrpl-websocket.workspace.v1",Zu="tabs",Um=2,$r=3;function sr(){const t=Object.fromEntries(Yt.map(e=>[e.id,{enabled:e.defaultEnabled,splitSizes:e.defaultSplitSizes}]));return{activePanelId:si(t),layoutMode:Zu,splitPanelIds:si(t)?[si(t)]:[],workspaceSplitSizes:xs([],1),panels:t}}function Xm(){let t=null;try{t=JSON.parse(window.localStorage.getItem(Ku)??"")}catch{return sr()}return Ju(t)}function Ju(t){if(!t||typeof t!="object")return sr();const e=t,s={...sr().panels};for(const o of Yt){const l=e.panels?.[o.id];s[o.id]={enabled:typeof l?.enabled=="boolean"?l.enabled:s[o.id].enabled,splitSizes:o.defaultSplitSizes?np(l?.splitSizes,o.defaultSplitSizes):void 0}}const i=e.activePanelId&&s[e.activePanelId]?.enabled?e.activePanelId:si(s),a=ep(Array.isArray(e.splitPanelIds)?e.splitPanelIds:Dr(s).slice(0,Um),s,i);return{activePanelId:i,layoutMode:tp(e.layoutMode),splitPanelIds:a,workspaceSplitSizes:xs(e.workspaceSplitSizes,Math.max(1,a.length)),panels:s}}function Qu(t){window.localStorage.setItem(Ku,JSON.stringify(t))}function si(t){return Dr(t)[0]??null}function Dr(t){return Yt.filter(e=>t[e.id]?.enabled).map(e=>e.id)}function ep(t,e,n=si(e)){const s=Dr(e),i=Array.isArray(t)?t:[],a=[];for(const o of i)if(typeof o=="string"&&s.includes(o)&&!a.includes(o)&&a.push(o),a.length===$r)return a;return a.length>0?a:n&&s.includes(n)?[n]:s.slice(0,1)}function tp(t){return t==="tabs"||t==="split-horizontal"||t==="split-vertical"?t:Zu}function np(t,e=Hm("scope").defaultSplitSizes??[28,72]){if(Array.isArray(t)&&t.length===2){const n=Number(t[0]),s=Number(t[1]);if(Number.isFinite(n)&&Number.isFinite(s)&&n>=15&&s>=35){const i=n+s;return[Math.round(n/i*1e3)/10,Math.round(s/i*1e3)/10]}}return[...e]}function xs(t,e){const n=Array.from({length:e},()=>Math.round(100/e*10)/10);if(!Array.isArray(t)||t.length!==e)return n;const s=t.map(Number);if(s.some(a=>!Number.isFinite(a)||a<10))return n;const i=s.reduce((a,o)=>a+o,0);return i<=0?n:s.map(a=>Math.round(a/i*1e3)/10)}const ta=new Ym,Ls=new Bm;let ir={};ta.installFetchHeaders();const Gm=2;function b(t){const e=document.querySelector(t);if(!e)throw new Error(`Missing UI element ${t}`);return e}const Km=b("#app");Km.innerHTML=`
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
`;const sp=document.createElement("style");sp.textContent=`
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
`;document.head.appendChild(sp);const ip=document.createElement("style");ip.textContent=`
  ${Wu} { display: none !important; }
  .plot-toolbar { display: none; }
  .plot-panel { grid-template-rows: minmax(0, 1fr); }
  .shell:has(#status-bar:not([hidden])) { grid-template-rows: auto minmax(0, 1fr) auto; }
  #status-bar {
    min-width: 0; max-height: 88px; overflow: auto;
    border-top: 1px solid var(--panel-border); padding: 5px 8px;
    background: var(--panel); color: var(--muted); font-size: 11px;
  }
  #status-bar[hidden], #debug-status[hidden], #application-error[hidden] { display: none; }
  #debug-status { display: flex; flex-wrap: wrap; gap: 4px 16px; }
  #debug-status > span { overflow-wrap: anywhere; }
  #application-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #ff9f93; }
`;document.head.appendChild(ip);ym(b(".shell"),wm(window.location.search));const Zm=b("#scope-plot");b("#scope-panel-content");const Br=b("#scope-controls-pane"),ap=b("#scope-plot-pane");b("#spectrum-panel-content");const op=b("#spectrum-controls-pane"),rp=b("#spectrum-plot-pane"),ka=b("#panel-menu"),Jm=b("#workspace"),Ma=b("#workspace-tabs"),Ui=b("#workspace-panels"),lp=b("#scope-panel"),Qm=b("#asg-panel"),eg=b("#pid-panel"),tg=b("#iq-panel"),ng=b("#iir-panel"),sg=b("#trig-panel"),ig=b("#pwm-panel"),cp=b("#spectrumanalyzer-panel"),ag=b("#networkanalyzer-panel"),up=b("#curveviewer-panel"),og=b("#pyrplconfig-panel"),pp=b("#lockbox-panel"),rg=b("#housekeeping-panel"),lg=b("#telemetry-panel"),cg=b("#registers-panel"),Ss={scope:lp,asg:Qm,pid:eg,iq:tg,iir:ng,trig:sg,pwm:ig,spectrumanalyzer:cp,networkanalyzer:ag,curveviewer:up,pyrplconfig:og,lockbox:pp,housekeeping:rg,telemetry:lg,registers:cg},ug=b("#empty-workspace"),At=b("#status"),rt=b("#connect-scope"),fn=b("#single-frame"),Js=b("#stop-scope"),qr=b("#scope-current-average"),fs=b("#save-curve"),ks=b("#scope-curve-name"),pg=b("#zoom-out"),hg=b("#zoom-in"),dg=b("#zoom-y-out"),fg=b("#zoom-y-in"),mg=b("#pan-left"),gg=b("#pan-right"),vg=b("#pan-up"),bg=b("#pan-down"),wg=b("#zoom-reset"),mn=b("#show-ch1"),gn=b("#show-ch2"),di=b("#scope-input1"),fi=b("#scope-input2"),Wn=b("#scope-trigger"),yg=b("#scope-trigger-mode"),Xi=b("#scope-trigger-normal"),Un=b("#scope-trigger-rolling"),Ln=b("#scope-duration"),mi=b("#scope-average"),Ms=b("#scope-xy-mode"),Es=b("#scope-math-active"),Xn=b("#scope-math-formula"),Fn=b("#scope-trace-average"),Gn=b("#scope-trigger-delay"),Tn=b("#scope-threshold"),Kn=b("#scope-hysteresis"),Ct=b("#scope-state-select"),Si=b("#scope-state-name"),hp=b("#scope-state-save"),dp=b("#scope-state-load"),fp=b("#scope-state-delete"),Yi=b("#register-status"),Q=b("#module-status"),Zn=b("#hk-status"),xg=b("#telemetry-refresh"),Wc=b("#sampler-grid"),mp=b("#sampler-status"),ar=b("#sampler-stats-signal"),Sg=b("#sampler-stats-duration"),or=b("#sampler-stats-run"),rr=b("#sampler-stats-output"),to=b("#ams-status"),ii=[0,1,2,3].map(t=>b(`#ams-dac${t}`)),Vo=new Map,La=b("#hk-led"),kg=b("#hk-refresh"),Uc=b("#hk-expansion-grid"),Mg=b("#pid-modules"),Eg=b("#iq-modules"),Cg=b("#iir-modules"),Pg=b("#trig-modules"),Ag=b("#pwm-modules"),zg=b("#spectrum-modules"),_g=b("#spectrum-plot"),zt=b("#spectrum-status"),Mn=b("#spectrum-single"),vt=b("#spectrum-run"),$i=b("#spectrum-stop"),gp=b("#spectrum-current-average"),ms=b("#spectrum-save-curve"),Gi=b("#spectrum-curve-name"),Lg=b("#spectrum-zoom-out"),Fg=b("#spectrum-zoom-in"),Tg=b("#spectrum-zoom-y-out"),Rg=b("#spectrum-zoom-y-in"),Ig=b("#spectrum-pan-left"),Ng=b("#spectrum-pan-right"),Og=b("#spectrum-pan-up"),$g=b("#spectrum-pan-down"),Dg=b("#spectrum-zoom-reset"),Vt=new Im(b("#network-controls"),b("#network-magnitude-plot"),b("#network-phase-plot"),b("#network-status"),b("#network-single"),b("#network-run"),b("#network-stop"),b("#network-save"),b("#network-reset")),Ki=new Om(up,b(".curve-viewer-list-pane"),b(".curve-viewer-plot-pane"),b(".curve-viewer-params-pane"),b("#curve-viewer-select"),b("#curve-viewer-name"),b("#curve-viewer-params"),b("#curve-viewer-status"),b("#curve-viewer-save-params"),b("#curve-viewer-delete"),b("#curve-viewer-refresh")),wn=new _m({root:pp,classSelect:b("#lockbox-class"),status:b("#lockbox-status"),actions:b("#lockbox-actions"),inputs:b("#lockbox-inputs"),outputs:b("#lockbox-outputs"),stages:b("#lockbox-stages"),addStage:b("#lockbox-add-stage"),inputPlot:b("#lockbox-input-plot"),outputPlot:b("#lockbox-output-plot"),inputPlotSelect:b("#lockbox-input-plot-select"),outputPlotSelect:b("#lockbox-output-plot-select")}),Bg=new qm({file:b("#config-file"),module:b("#config-module"),text:b("#config-text"),refresh:b("#config-refresh"),save:b("#config-save"),status:b("#config-status")}),Xc=b("#session-line"),ai=b("#control-status"),Ca=b("#take-control"),Gc=ai.parentElement;Wm({readAddr:b("#register-read-addr"),readLength:b("#register-read-length"),readButton:b("#register-read"),writeAddr:b("#register-write-addr"),writeValues:b("#register-write-values"),writeButton:b("#register-write"),status:Yi,output:b("#register-output")});const Vr=["asg0","asg1"],Cs={asg0:Zc("asg0"),asg1:Zc("asg1")},qg={pid:["pid0","pid1","pid2"],iq:["iq0","iq1","iq2"],iir:["iir"],trig:["trig"],pwm:["pwm0","pwm1"],spectrumanalyzer:["spectrumanalyzer"]},Vg={pid:Mg,iq:Eg,iir:Cg,trig:Pg,pwm:Ag,spectrumanalyzer:zg},Bt=new Map,Yg=[di,fi,Wn,Xi,Un,Ln,mi,Ms,Es,Xn,Fn,Gn,Tn,Kn,Ct,Si,hp,dp,fp,ks];let Pa=null,X=new gm(Zm,(t,e)=>{if(e){S(At,t);return}At.textContent=Pa?`Scope stopped: ${Pa==="spectrumanalyzer"?"Spectrum":Pa} owns the scope resource`:t},t=>{qr.textContent=`${t} / ${Fn.value||"1"}`}),ge=new xm(_g,(t,e)=>{if(e){S(zt,t);return}zt.textContent=t;const n=ge.getRbw(),s=Bt.get("spectrumanalyzer")?.inputs.get("rbw");s&&n!==void 0&&(s.value=String(n))},t=>{const e=Bt.get("spectrumanalyzer")?.inputs.get("trace_average");gp.textContent=`${t} / ${e?.value||"1"}`}),lt=null,Yn=null;const Kc=new Qa(()=>Ap());let vp=0,qt="stopped";const Yr=new Map;let Hr=!1;const Fa=new Map;let wt="observer",vs="stopped",A=Xm(),jr=null,Ta=null,Ra=null,Ia=null,lr=null,cr="";function Qn(t){Qu(t),wt!=="observer"&&fetch("/api/workspace",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspace:t})}).catch(()=>{})}async function Hg(){if(wt==="observer")return;const t=await fetch("/api/workspace");if(!t.ok)return;const e=await t.json();e.workspace&&typeof e.workspace=="object"?(A=Ju(e.workspace),Qu(A)):Qn(A)}function jg(){window.pyrplScope={getFrameSequence:()=>X.getFrameSequence(),getSampleCount:()=>X.getSampleCount(),getXRange:()=>X.getXRange(),getYRange:()=>X.getYRange(),getScopeTimeLabels:()=>X.getFormattedTimeLabelsForCurrentRange(),isChannelVisible:t=>X.getChannelVisible(t),getEventCount:()=>vp,getTraceAverage:()=>X.getTraceAverage(),getRunningState:()=>qt,isPanelEnabled:t=>A.panels[t]?.enabled??!1,getScopeSplitSizes:()=>A.panels.scope.splitSizes??[28,72],getWorkspaceLayoutMode:()=>A.layoutMode,getWorkspaceSplitSizes:()=>A.workspaceSplitSizes,getWorkspaceSplitPanelIds:()=>A.splitPanelIds,getActivePanelId:()=>A.activePanelId,getCsvLineCount:()=>X.exportCsv().trimEnd().split(`
`).length,getDisplayedStats:()=>X.getDisplayedStats(),getDisplayedDataFingerprint:()=>X.getDisplayedDataFingerprint(),getScopeMathStats:()=>X.getMathStats(),getScopeXyStats:()=>X.getXyStats(),moduleStatusText:()=>Q.textContent??"",statusText:()=>At.textContent??"",getSpectrumSeriesCount:()=>ge.getSeriesCount(),getSpectrumBinCount:()=>ge.getBinCount(),getSpectrumAverageCount:()=>ge.getAverageCount(),getSpectrumXRange:()=>ge.getXRange(),getSpectrumYRange:()=>ge.getYRange(),getSpectrumCurveData:()=>ge.getCurveData(),getNetworkAnalyzerCurveData:()=>Vt.getCurveData(),getIirXRange:()=>lt?.getXRange()??null,getIirMagnitudeYRange:()=>lt?.getMagnitudeYRange()??null,getIirPhaseYRange:()=>lt?.getPhaseYRange()??null,getLockboxClassname:()=>wn.getClassname(),getLockboxStageCount:()=>wn.getStageCount()}}function Bn(t,e){return`#${t}-${e.replaceAll("_","-")}`}function Zc(t){return{status:b(`#${t}-status`),waveform:b(Bn(t,"waveform")),frequency:b(Bn(t,"frequency")),amplitude:b(Bn(t,"amplitude")),offset:b(Bn(t,"offset")),triggerSource:b(Bn(t,"trigger_source")),outputDirect:b(Bn(t,"output_direct")),startPhase:b(Bn(t,"start_phase")),cyclesPerBurst:b(Bn(t,"cycles_per_burst")),setup:b(`#${t}-setup`),trigger:b(`#${t}-trigger`),off:b(`#${t}-off`)}}function ki(){Jm.classList.toggle("is-split-workspace",A.layoutMode!=="tabs"),Wg(),Ug();const t=no(),e=A.layoutMode==="tabs"?[]:A.splitPanelIds,n=A.layoutMode!=="tabs"&&e.length>0,s=n?e:A.activePanelId?[A.activePanelId]:[],i=new Set(s),a=t.length>0;Ui.className=`workspace-panels ${n?`is-split ${A.layoutMode==="split-horizontal"?"is-horizontal":"is-vertical"}`:"is-tabs"}`;for(const[o,l]of Object.entries(Ss))l.hidden=!i.has(o);Xg(s),ug.hidden=a,n&&s.length>1?Qg(s):bp(),i.has("scope")?(Gg(),window.requestAnimationFrame(()=>X.refreshLayout())):Kg(),i.has("spectrumanalyzer")?(Zg(),window.requestAnimationFrame(()=>ge.refreshLayout())):Jg(),i.has("lockbox")&&window.requestAnimationFrame(()=>wn.refreshLayout()),i.has("networkanalyzer")&&window.requestAnimationFrame(()=>Vt.refreshLayout()),i.has("curveviewer")&&window.requestAnimationFrame(()=>Ki.refreshLayout()),Ur(),yp(),Vt.setSubscriptionEnabled(A.panels.networkanalyzer.enabled)}function no(){return Yt.filter(t=>A.panels[t.id]?.enabled).map(t=>t.id)}function Wr(t,e,n,s){const i=Yt.filter(u=>t[u.id]?.enabled).map(u=>u.id),a=Math.min($r,i.length),o=Math.min(Math.max(1,n),a);if(o===0)return[];const l=ep(e,t,s);for(const u of i){if(l.length>=o)break;l.includes(u)||l.push(u)}return l.slice(0,o)}function Wg(){ka.textContent="";for(const i of Yt){const a=document.createElement("label");a.className="menu-check";const o=document.createElement("input");o.id=`panel-${i.id}-enabled`,o.type="checkbox",o.checked=A.panels[i.id]?.enabled??!1,o.addEventListener("change",()=>{o.closest("details")?.removeAttribute("open"),tv(i.id,o.checked).catch(u=>{S(Q,u.message),S(Yi,u.message)})});const l=document.createElement("span");l.textContent=i.title,a.append(o,l),ka.appendChild(a)}const t=document.createElement("label");t.className="menu-field";const e=document.createElement("span");e.textContent="Layout";const n=document.createElement("select");n.id="workspace-layout-mode";const s=[["tabs","Tabs"],["split-horizontal","Side by Side"],["split-vertical","Stacked"]];for(const[i,a]of s){const o=document.createElement("option");o.value=i,o.textContent=a,n.appendChild(o)}if(n.value=A.layoutMode,n.addEventListener("change",()=>{av(tp(n.value)).catch(i=>{S(Q,i.message),S(Yi,i.message)})}),t.append(e,n),ka.appendChild(t),A.layoutMode!=="tabs"){const i=no(),a=document.createElement("label");a.className="menu-field";const o=document.createElement("span");o.textContent="Panels";const l=document.createElement("select");l.id="workspace-pane-count";const u=Math.min($r,i.length);for(let d=1;d<=u;d+=1){const v=document.createElement("option");v.value=String(d),v.textContent=String(d),l.appendChild(v)}l.value=String(Math.min(Math.max(1,A.splitPanelIds.length),u)),l.addEventListener("change",()=>{sv(Number(l.value)).catch(d=>{S(Q,d.message),S(Yi,d.message)})}),a.append(o,l),ka.appendChild(a)}}function Ug(){if(Ma.textContent="",Ma.hidden=A.layoutMode!=="tabs",!Ma.hidden)for(const t of Yt){if(!A.panels[t.id]?.enabled)continue;const e=document.createElement("button");e.className=`workspace-tab${A.activePanelId===t.id?" is-active":""}`,e.type="button",e.textContent=t.title,e.addEventListener("click",()=>{nv(t.id).catch(n=>{S(Q,n.message)})}),Ma.appendChild(e)}}function Xg(t){for(const n of Object.values(Ss))n.querySelector(".workspace-pane-selector")?.remove();if(A.layoutMode==="tabs")return;const e=no();for(const[n,s]of t.entries()){const i=Ss[s].querySelector(".panel-header");if(!i)continue;const a=document.createElement("label");a.className="workspace-pane-selector";const o=document.createElement("span");o.textContent="Panel";const l=document.createElement("select");l.id=`workspace-pane-select-${n}`,l.value=s;for(const u of e){const d=document.createElement("option");d.value=u,d.textContent=Yt.find(v=>v.id===u)?.title??u,d.disabled=u!==s&&t.includes(u),l.appendChild(d)}l.value=s,l.addEventListener("change",()=>{iv(n,l.value).catch(u=>{S(Q,u.message),S(Yi,u.message)})}),a.append(o,l),i.appendChild(a)}}function Gg(){Ta||lp.hidden||(Ta=ea([Br,ap],{direction:"vertical",sizes:A.panels.scope.splitSizes,minSize:[132,260],gutterSize:8,snapOffset:24,onDrag:()=>X.refreshLayout(),onDragEnd:t=>{A={...A,panels:{...A.panels,scope:{...A.panels.scope,splitSizes:np(t)}}},Qn(A),X.refreshLayout()}}))}function Kg(){Ta?.destroy(),Ta=null,Br.removeAttribute("style"),ap.removeAttribute("style")}function Zg(){Ra||cp.hidden||(Ra=ea([op,rp],{direction:"vertical",sizes:[32,68],minSize:[96,220],gutterSize:8,snapOffset:16,elementStyle:(t,e)=>({height:`calc(${e}% - 4px)`}),gutterStyle:()=>({height:"8px"}),onDrag:()=>ge.refreshLayout(),onDragEnd:()=>ge.refreshLayout()}))}function Jg(){Ra?.destroy(),Ra=null,op.removeAttribute("style"),rp.removeAttribute("style")}function Qg(t){const e=t.join("|");Ia&&lr===A.layoutMode&&cr===e||(bp(),ev(t),lr=A.layoutMode,cr=e,Ia=ea(t.map(n=>Ss[n]),{direction:A.layoutMode==="split-horizontal"?"horizontal":"vertical",sizes:xs(A.workspaceSplitSizes,t.length),minSize:A.layoutMode==="split-horizontal"?220:140,gutterSize:8,snapOffset:24,elementStyle:(n,s,i)=>({flexBasis:`calc(${s}% - ${i}px)`}),gutterStyle:(n,s)=>({flexBasis:`${s}px`}),onDrag:()=>{X.refreshLayout(),ge.refreshLayout(),wn.refreshLayout(),Vt.refreshLayout(),Ki.refreshLayout()},onDragEnd:n=>{A={...A,workspaceSplitSizes:xs(n,t.length)},Qn(A),X.refreshLayout(),ge.refreshLayout(),wn.refreshLayout(),Vt.refreshLayout(),Ki.refreshLayout()}}))}function ev(t){const e=new Set(t);for(const n of t)Ui.appendChild(Ss[n]);for(const n of Yt)e.has(n.id)||Ui.appendChild(Ss[n.id])}function bp(){Ia?.destroy(),Ia=null,lr=null,cr="";for(const t of Object.values(Ss))t.removeAttribute("style")}async function tv(t,e){const n=A.panels[t],s={...A.panels,[t]:{...n,enabled:e}},i=e&&A.activePanelId===null?t:!e&&A.activePanelId===t?si(s):A.activePanelId,a=Math.min(Math.max(1,A.splitPanelIds.length),Yt.filter(l=>s[l.id]?.enabled).length),o=Wr(s,A.splitPanelIds,a,i);if(A={...A,activePanelId:i,splitPanelIds:o,workspaceSplitSizes:xs(A.workspaceSplitSizes,Math.max(1,o.length)),panels:s},Qn(A),ki(),t==="scope"&&!e){na("Scope panel disabled"),wt!=="observer"&&an("stop").catch(l=>{S(Q,l.message)});return}t==="scope"&&e&&En("scope")&&await wp(),t==="spectrumanalyzer"&&!e&&(bn("Spectrum panel disabled"),wt!=="observer"&&An("stop").catch(l=>{S(zt,l.message)}))}async function nv(t){A.panels[t]?.enabled&&(A={...A,activePanelId:t},Qn(A),ki(),t==="scope"&&window.requestAnimationFrame(()=>X.refreshLayout()),t==="spectrumanalyzer"&&window.requestAnimationFrame(()=>ge.refreshLayout()),t==="lockbox"&&window.requestAnimationFrame(()=>wn.refreshLayout()),t==="networkanalyzer"&&window.requestAnimationFrame(()=>Vt.refreshLayout()),t==="curveviewer"&&window.requestAnimationFrame(()=>Ki.refreshLayout()))}async function sv(t){const e=Wr(A.panels,A.splitPanelIds,t,A.activePanelId);A={...A,splitPanelIds:e,workspaceSplitSizes:xs(A.workspaceSplitSizes,Math.max(1,e.length))},Qn(A),ki()}async function iv(t,e){if(!A.panels[e]?.enabled||t<0||t>=A.splitPanelIds.length)return;const n=[...A.splitPanelIds],s=n.indexOf(e);s>=0?[n[t],n[s]]=[n[s],n[t]]:n[t]=e,A={...A,splitPanelIds:n},Qn(A),ki()}function En(t){return A.layoutMode==="tabs"?A.activePanelId===t:A.splitPanelIds.includes(t)}async function av(t){const e=A.layoutMode==="tabs"&&t!=="tabs"?Wr(A.panels,A.splitPanelIds,Math.min(Gm,no().length),A.activePanelId):A.splitPanelIds;A={...A,layoutMode:t,splitPanelIds:e,workspaceSplitSizes:xs(A.workspaceSplitSizes,Math.max(1,e.length))},Qn(A),ki(),En("scope")&&window.requestAnimationFrame(()=>X.refreshLayout()),En("lockbox")&&window.requestAnimationFrame(()=>wn.refreshLayout()),En("networkanalyzer")&&window.requestAnimationFrame(()=>Vt.refreshLayout()),En("curveviewer")&&window.requestAnimationFrame(()=>Ki.refreshLayout())}async function wp(){if(!A.panels.scope.enabled||!En("scope")){na("Scope panel disabled");return}if(Ur(),qt==="stopped"&&jr?.fake&&wt!=="observer"){if(await Cv(),!A.panels.scope.enabled||!En("scope"))return;await an("continuous")}}function so(t){t.startsWith("running_")&&!qt.startsWith("running_")&&X.resetTraceAveraging(),qt=t,Xr(t),Ur()}function Ur(){Hr&&(A.panels.scope.enabled?Zi():rt.dataset.connected==="true"&&na("Scope panel disabled"))}function Xr(t){const e=Gr();t==="running_continuous"?(rt.textContent="Pause",rt.disabled=!1,fn.textContent="Run single",fn.disabled=!0,Js.disabled=!1):t==="running_single"?(rt.textContent="Run continuous",rt.disabled=!0,fn.textContent="Pause",fn.disabled=!1,Js.disabled=!1):t==="paused_single"||t==="paused_continuous"?(rt.textContent="Resume continuous",rt.disabled=!1,fn.textContent="Resume single",fn.disabled=e,Js.disabled=!1):(rt.textContent="Run continuous",rt.disabled=!1,fn.textContent="Run single",fn.disabled=e,Js.disabled=!0),wt==="observer"&&(rt.disabled=!0,fn.disabled=!0,Js.disabled=!0)}function ov(t){vs=t,t==="running_continuous"?(vt.textContent="Pause",vt.disabled=!1,Mn.textContent="Run single",Mn.disabled=!0,$i.disabled=!1):t==="running_single"?(vt.textContent="Run continuous",vt.disabled=!0,Mn.textContent="Pause",Mn.disabled=!1,$i.disabled=!1):t==="paused_single"||t==="paused_continuous"?(vt.textContent="Resume continuous",vt.disabled=!1,Mn.textContent="Resume single",Mn.disabled=!1,$i.disabled=!1):(vt.textContent="Run continuous",vt.disabled=!1,Mn.textContent="Run single",Mn.disabled=!1,$i.disabled=!0),yp()}function yp(){Hr&&(A.panels.spectrumanalyzer.enabled?Qi():vt.dataset.connected==="true"&&bn("Spectrum panel disabled"))}function Zi(){rt.dataset.connected!=="true"&&(X.connect(),rt.dataset.connected="true")}function na(t="Disconnected"){X.close(),rt.dataset.connected="false",At.textContent=t}async function xp(){rt.dataset.connected==="true"&&(await an("stop"),na("Scope stopped: Spectrum owns the scope resource"))}async function an(t){const e=await fetch(`/api/modules/scope/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Scope action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return s.running_state&&so(s.running_state),["single","continuous","resume_single","resume_continuous"].includes(t)&&X.reconnect(),Q.textContent=`${t}: ${s.running_state??"ok"}`,n}async function rv(){try{const e=await(await fetch("/api/session")).json(),n=e.fake?"fake hardware":e.settings.hostname;return Xc.textContent=`Session: ${n} | reads ${e.reads} | writes ${e.writes}`,e.scope?.running_state&&so(e.scope.running_state),{fake:!!e.fake}}catch{return Xc.textContent="Session unavailable",null}}function Sp(t){return typeof t=="number"?t<.001?`${(t*1e6).toPrecision(4)} us`:t<1?`${(t*1e3).toPrecision(4)} ms`:`${t.toPrecision(4)} s`:t}function vn(t,e){return Array.isArray(e)?e.join(", "):typeof e=="boolean"?String(e):typeof e=="number"&&(t==="duration"||t==="trigger_delay")?Sp(e):typeof e=="number"?Number.isInteger(e)?String(e):String(Number(e.toPrecision(6))):e}function Hn(t,e){t.textContent="";for(const n of e.options??[]){const s=document.createElement("option");s.value=String(n),s.textContent=e.option_labels?.[String(n)]??Sp(n),t.appendChild(s)}t.value=String(e.value)}function Ji(t,e){e=Ls.get("scope")[t]??e,Yr.set(t,e),t==="input1"?di.value=String(e):t==="input2"?fi.value=String(e):t==="trigger_source"?(Wn.value=String(e),Qs()):t==="duration"?(Ln.value=String(e),Qs(),Na()):t==="average"?mi.checked=!!e:t==="ch1_active"?(mn.checked=!!e,X.setChannelVisible(1,mn.checked)):t==="ch2_active"?(gn.checked=!!e,X.setChannelVisible(2,gn.checked)):t==="ch_math_active"?(Es.checked=!!e,bs()):t==="math_formula"?(document.activeElement!==Xn&&(Xn.value=String(e)),bs()):t==="xy_mode"?(Ms.checked=!!e,bs()):t==="rolling_mode"?(Un.checked=!!e,Xi.checked=!e,Qs(),Na()):t==="trace_average"?(Fn.value=String(e),X.setTraceAverage(Number(e)),qr.textContent=`0 / ${e}`):t==="trigger_delay"?(document.activeElement!==Gn&&(Gn.value=String(e)),Qs()):t==="threshold"?(document.activeElement!==Tn&&(Tn.value=String(e)),Qs()):t==="hysteresis"?document.activeElement!==Kn&&(Kn.value=String(e)):t==="curve_name"&&document.activeElement!==ks&&(ks.value=String(e))}function bs(){X.setDisplaySettings({xyMode:Ms.checked,mathActive:Es.checked,mathFormula:Xn.value})}function Gr(){return Un.checked&&Number(Ln.value)>.1}function Na(){const t=Number(Ln.value)>.1;yg.disabled=!t;const e=Gr();Wn.disabled=e,Tn.disabled=e,Kn.disabled=e,Xr(qt)}function Qs(){X.setTimeSettings({duration:Number(Ln.value),triggerDelay:Number(Gn.value||0),triggerSource:Wn.value,rollingMode:Gr(),hardware:jr?.fake===!1,threshold:Number(Yr.get("threshold")??Tn.value??0)})}function nn(t,e){t.value=String(e.value),e.min!==void 0&&(t.min=String(e.min)),e.max!==void 0&&(t.max=String(e.max)),e.step!==void 0&&(t.step=String(e.step))}function Kr(t){for(const[e,n]of Object.entries(t))n!=null&&!Object.is(Yr.get(e),n)&&Ji(e,n);lv(t)}function lv(t){t.running_state&&so(t.running_state),t.current_avg!==void 0&&(qr.textContent=`${t.current_avg} / ${Fn.value||"1"}`),"owner"in t&&cv(typeof t.owner=="string"?t.owner:null)}function cv(t){Pa=t,t&&(At.textContent=`Scope stopped: ${t==="spectrumanalyzer"?"Spectrum":t} owns the scope resource`),Br.classList.toggle("is-owned",t!==null);for(const e of Yg)Or(e)||(e.disabled=t!==null);t===null&&Na(),t&&(Q.textContent=`scope occupied by ${t}`)}async function st(t,e){if(eo("scope",t)){Ls.set("scope",t,e),Ji(t,e),Q.textContent=`${t} = ${vn(t,e)} (local view)`;return}const n=await sa("scope",t,e);["input1","input2","duration","average","trigger_source","trigger_delay","threshold","hysteresis","rolling_mode"].includes(t)&&X.reconnect(),Ji(t,n.value),Q.textContent=`${t} = ${vn(t,n.value)}`}async function sa(t,e,n){const s=await fetch(`/api/modules/${t}/attributes/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:n})});if(!s.ok)throw new Error(`Failed to set ${t}.${e}: ${s.status}`);return s.json()}async function uv(){const t=await fetch("/api/modules/scope/attributes");if(!t.ok)throw new Error(`Scope controls unavailable: ${t.status}`);const e=await t.json(),n=new Map(e.attributes.map(s=>[s.name,s]));Hn(di,n.get("input1")),Hn(fi,n.get("input2")),Hn(Wn,n.get("trigger_source")),Hn(Ln,n.get("duration")),mi.checked=!!n.get("average")?.value,mn.checked=!!(n.get("ch1_active")?.value??!0),X.setChannelVisible(1,mn.checked),gn.checked=!!(n.get("ch2_active")?.value??!0),X.setChannelVisible(2,gn.checked),Es.checked=!!(n.get("ch_math_active")?.value??!1),Xn.value=String(n.get("math_formula")?.value??"ch1 * ch2"),Ms.checked=!!(n.get("xy_mode")?.value??!1),Un.checked=!!(n.get("rolling_mode")?.value??!0),Xi.checked=!Un.checked,nn(Fn,n.get("trace_average")),nn(Gn,n.get("trigger_delay")),nn(Tn,n.get("threshold")),nn(Kn,n.get("hysteresis")),ks.value=String(n.get("curve_name")?.value??"scope curve"),X.setTraceAverage(Number(Fn.value)),bs(),Qs(),Na();for(const[s,i]of Object.entries(Ls.get("scope")))Ji(s,i);Q.textContent="Scope controls ready"}async function pv(){await Promise.all(Vr.map(t=>hv(t)))}async function hv(t){const e=await fetch(`/api/modules/${t}/attributes`);if(!e.ok)throw new Error(`${t} controls unavailable: ${e.status}`);const n=await e.json(),s=new Map(n.attributes.map(a=>[a.name,a])),i=Cs[t];Hn(i.waveform,s.get("waveform")),nn(i.frequency,s.get("frequency")),nn(i.amplitude,s.get("amplitude")),nn(i.offset,s.get("offset")),Hn(i.triggerSource,s.get("trigger_source")),Hn(i.outputDirect,s.get("output_direct")),nn(i.startPhase,s.get("start_phase")),nn(i.cyclesPerBurst,s.get("cycles_per_burst")),i.status.textContent=`${t} controls ready`}function Zr(t,e){for(const[n,s]of Object.entries(e))tl(s)&&Jr(t,n,s)}function Jr(t,e,n){const s=Cs[t];e==="waveform"?s.waveform.value=String(n):e==="frequency"?s.frequency.value=String(n):e==="amplitude"?s.amplitude.value=String(n):e==="offset"?s.offset.value=String(n):e==="trigger_source"?s.triggerSource.value=String(n):e==="output_direct"?s.outputDirect.value=String(n):e==="start_phase"?s.startPhase.value=String(n):e==="cycles_per_burst"&&(s.cyclesPerBurst.value=String(n))}async function qn(t,e,n){const s=await sa(t,e,n);Jr(t,e,s.value),Cs[t].status.textContent=`${e} = ${vn(e,s.value)}`}async function Yo(t,e){const n=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!n.ok)throw new Error(`${t} action ${e} failed: ${n.status}`);const s=await n.json();Zr(t,s.state??{}),Cs[t].status.textContent=`${e}: ok`}function dv(){Uc.textContent="";for(const t of["P","N"]){const e=document.createElement("section");e.className="housekeeping-bank";const n=document.createElement("h3");n.textContent=`Expansion ${t}`,e.appendChild(n);for(let s=0;s<8;s+=1){const i=document.createElement("div");i.className="housekeeping-pin";const a=`expansion_${t}${s}`,o=`${a}_output`,l=document.createElement("span");l.textContent=`${t}${s}`;const u=document.createElement("label"),d=document.createElement("input");d.type="checkbox",d.id=`hk-${a.replaceAll("_","-")}`,d.addEventListener("change",()=>{ur(a,d.checked).catch(m=>{S(Zn,m.message)})}),u.append(d,document.createTextNode(" Value"));const v=document.createElement("label"),f=document.createElement("input");f.type="checkbox",f.id=`hk-${o.replaceAll("_","-")}`,f.addEventListener("change",()=>{ur(o,f.checked).catch(m=>{S(Zn,m.message)})}),v.append(f,document.createTextNode(" Output")),i.append(l,u,v),e.appendChild(i)}Uc.appendChild(e)}}async function kp(){const t=await fetch("/api/modules/hk/attributes");if(t.ok){const s=await t.json(),a=new Map(s.attributes.map(o=>[o.name,o])).get("led");a&&nn(La,a)}const e=await fetch("/api/modules/hk");if(!e.ok)throw new Error(`Housekeeping controls unavailable: ${e.status}`);const n=await e.json();Qr(n.state??{}),Zn.textContent="Housekeeping controls ready"}function Qr(t){for(const[e,n]of Object.entries(t))tl(n)&&el(e,n)}function el(t,e){if(t==="led"){La.value=String(e);return}const n=document.querySelector(`#hk-${t.replaceAll("_","-")}`);n&&(n.checked=!!e)}async function ur(t,e){const n=await sa("hk",t,e);el(t,n.value),Zn.textContent=`${t} = ${vn(t,n.value)}`}async function Mp(){const[t,e]=await Promise.all([fetch("/api/modules/sampler"),fetch("/api/modules/ams")]);if(!t.ok||!e.ok)throw new Error("Sampler or AMS readback unavailable");const n=await t.json(),s=await e.json();Oa(n.state??{}),$a(s.state??{}),mp.textContent="Sampler refreshed",to.textContent="AMS refreshed"}function Oa(t){if(Vo.size===0){Wc.textContent="",ar.textContent="";for(const e of Object.keys(t)){const n=document.createElement("div");n.className="sampler-reading";const s=document.createElement("span");s.textContent=e;const i=document.createElement("output");i.dataset.signal=e,n.append(s,i),Wc.appendChild(n),Vo.set(e,i),ar.add(new Option(e,e))}}for(const[e,n]of Object.entries(t))if(typeof n=="number"){const s=Vo.get(e);s&&(s.value=Di(n))}}function $a(t){ii.forEach((e,n)=>{const s=t[`dac${n}`];typeof s=="number"&&(e.value=s.toFixed(6))})}async function fv(){or.disabled=!0,rr.value="Acquiring...";try{const t=await fetch("/api/sampler/stats",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({signal:ar.value,duration:Number(Sg.value)})});if(!t.ok)throw new Error(`Sampler statistics failed: ${t.status}`);const e=await t.json();rr.value=`mean ${Di(e.mean)} | std ${Di(e.stddev)} | min ${Di(e.min)} | max ${Di(e.max)} | n ${e.count}`}finally{or.disabled=!1}}async function Ep(t){const e=await sa("ams",`dac${t}`,Number(ii[t].value));ii[t].value=Number(e.value).toFixed(6),to.textContent=`DAC${t} = ${ii[t].value} V`}function Di(t){if(!Number.isFinite(t))return"--";const e=Math.abs(t);return e!==0&&(e<1e-4||e>=1e4)?t.toExponential(5):t.toFixed(6)}async function mv(){for(const[t,e]of Object.entries(qg)){const n=Vg[t];t==="iir"&&lt&&(lt.destroy(),lt=null),n.textContent="",await Promise.all(e.map(s=>gv(n,s)))}}async function gv(t,e){const[n,s,i]=await Promise.all([fetch(`/api/modules/${e}/attributes`),fetch(`/api/modules/${e}/actions`),fetch(`/api/modules/${e}`)]);if(!n.ok||!s.ok||!i.ok)throw new Error(`${e} controls unavailable`);const a=await n.json(),o=await s.json(),l=await i.json(),u=document.createElement("section");u.className="module-panel instrument-card",e==="iir"&&u.classList.add("iir-card"),u.dataset.module=e;const d=document.createElement("header");d.className="instrument-card-header";const v=document.createElement("h3");v.textContent=e.toUpperCase();const f=document.createElement("output");f.id=`${e}-status`,f.textContent=`${e} ready`,d.append(v,f);const m=document.createElement("div");m.className=e==="spectrumanalyzer"?"control-row generic-module-row spectrum-module-row":"control-row generic-module-row";const y={status:f,inputs:new Map,fields:new Map,actions:[],card:u,owner:null},E=e==="spectrumanalyzer"?yv(a.attributes):a.attributes;for(const L of E){if(e==="iir"&&vv(L.name))continue;const F=bv(e,L,f);y.inputs.set(L.name,F.input),y.fields.set(L.name,F.label),m.appendChild(F.label)}const R=e==="spectrumanalyzer"?[]:o.actions??[];for(const L of R){const F=document.createElement("button");F.type="button",F.textContent=L.label??L.name,F.addEventListener("click",()=>{xv(e,L.name,f).catch(M=>{S(f,M.message)})}),y.actions.push(F),m.appendChild(F)}if(Bt.set(e,y),u.append(d,m),e==="iir"){const L=document.createElement("section");L.className="iir-plot",u.appendChild(L),lt=new Pm(L,async(F,M)=>{await ti("iir",F,M,f)},F=>{f.textContent=F},()=>wt!=="observer"&&!Bt.get("iir")?.owner,()=>Ls.get("iir")),lt.refresh().catch(F=>{S(f,F.message)})}t.appendChild(u),Ps(e,l.state??{})}function vv(t){return t==="real_poles"||t==="real_zeros"||t==="complex_poles"||t==="complex_zeros"}function bv(t,e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=t==="spectrumanalyzer"?wv(e):e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");Hn(o,e),o.addEventListener("change",()=>{ti(t,e.name,o.value,n).catch(l=>{S(n,l.message)})}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{ti(t,e.name,o.checked,n).catch(l=>{S(n,l.message)})}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",nn(o,e),o.addEventListener("change",()=>{ti(t,e.name,Number(o.value),n).catch(l=>{S(n,l.message)})}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Cp(e.value),o.addEventListener("change",()=>{ti(t,e.name,o.value,n).catch(l=>{S(n,l.message)})}),a=o}return e.readonly&&(a instanceof HTMLSelectElement?a.disabled=!0:a.readOnly=!0),eo(t,e.name)&&(a.dataset.controlScope="view"),a.id=`${t}-${e.name.replaceAll("_","-")}`,s.appendChild(a),{label:s,input:a}}function wv(t){return t.name==="input"?"IQ Input":t.name==="center"?"IQ Center":t.name==="input1_baseband"?"BB Input 1":t.name==="input2_baseband"?"BB Input 2":t.name==="display_input1_baseband"||t.name==="display_input2_baseband"?"Show":t.name==="display_cross_amplitude"?"Cross":t.label}function yv(t){const e=["baseband","display_input1_baseband","input1_baseband","display_input2_baseband","input2_baseband","input","center","acbandwidth","display_cross_amplitude","span","rbw","window","display_unit","trace_average"];return[...t].sort((n,s)=>{const i=e.indexOf(n.name),a=e.indexOf(s.name);return(i===-1?Number.MAX_SAFE_INTEGER:i)-(a===-1?Number.MAX_SAFE_INTEGER:a)})}async function ti(t,e,n,s){if(eo(t,e)&&tl(n)){Ls.set(t,e,n),Da(t,e,n),t==="spectrumanalyzer"&&Ps(t,ir),t==="iir"&&await lt?.refresh(),s.textContent=`${e} = ${vn(e,n)} (local view)`;return}const i=await sa(t,e,n);if(Da(t,e,i.value),s.textContent=`${e} = ${vn(e,i.value)}`,t==="iir"&&lt&&(await lt.refresh(),e==="data_curve")){const a=await fetch("/api/modules/iir");if(a.ok){const o=await a.json();Ps("iir",o.state??{})}}}async function xv(t,e,n){const s=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!s.ok)throw new Error(`${t} action ${e} failed: ${s.status}`);const i=await s.json();Ps(t,i.state??{}),t==="iir"&&lt&&await lt.refresh(),n.textContent=`${e}: ok`}function Ps(t,e){if(t==="spectrumanalyzer"&&(ir={...ir,...e}),e=Ls.merge(t,e),t==="spectrumanalyzer"){if(typeof e.last_action=="string"&&e.last_action,ge.setSettings(e),Sv(e),typeof e.running_state=="string"&&ov(e.running_state),typeof e.current_avg=="number"){const n=Bt.get("spectrumanalyzer")?.inputs.get("trace_average");gp.textContent=`${e.current_avg} / ${n?.value||"1"}`}document.activeElement!==Gi&&typeof e.curve_name=="string"&&(Gi.value=e.curve_name)}for(const[n,s]of Object.entries(e))n==="owner"?kv(t,typeof s=="string"?s:null):Mv(s)&&Da(t,n,s)}function Sv(t){const e=Bt.get("spectrumanalyzer");if(!e)return;const n=!!(t.baseband??!0),s=new Set(["input","center","acbandwidth"]),i=new Set(["input1_baseband","input2_baseband","display_input1_baseband","display_input2_baseband","display_cross_amplitude"]);for(const[a,o]of e.fields)o.hidden=n&&s.has(a)||!n&&i.has(a)}function Da(t,e,n){n=Ls.get(t)[e]??n;const s=Bt.get(t)?.inputs.get(e);s&&(s instanceof HTMLInputElement&&s.type==="checkbox"?s.checked=!!n:s.value=Cp(n))}function kv(t,e){const n=Bt.get(t);if(n){n.owner=e,n.card.classList.toggle("is-owned",e!==null);for(const s of n.inputs.values())s.disabled=e!==null&&!Or(s);for(const s of n.actions)s.disabled=e!==null;e&&(n.status.textContent=`occupied by ${e}`)}}function Mv(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"||Array.isArray(t)&&t.every(e=>typeof e=="number"||typeof e=="string")}function Cp(t){return Array.isArray(t)?t.join(", "):String(t)}function tl(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"}function pr(t){return typeof t=="string"&&Bt.has(t)}async function nl(){const t=await fetch("/api/modules/scope/states");if(!t.ok)return;const e=await t.json();Pp(e.states??[])}function Pp(t){const e=Ct.value;Ct.textContent="";const n=document.createElement("option");n.value="",n.textContent=t.length?"Choose state":"No saved states",Ct.appendChild(n);for(const s of t){const i=document.createElement("option");i.value=s.name,i.textContent=s.name,Ct.appendChild(i)}t.some(s=>s.name===e)?Ct.value=e:t[0]&&(Ct.value=t[0].name,Si.value=t[0].name)}function hr(t){return t==="asg0"||t==="asg1"}function Ap(){if(Yn&&Yn.readyState!==WebSocket.CLOSED)return;const t=window.location.protocol==="https:"?"wss:":"ws:",e=new WebSocket(`${t}//${window.location.host}/ws/events`);Yn=e,e.addEventListener("open",()=>{if(Yn!==e)return;Kc.connected();const n=["scope",...Vr,"hk","ams","sampler",...Bt.keys(),"networkanalyzer","lockbox"];for(const s of n)Ev(s,e).catch(i=>{S(Q,i.message)});dr()}),e.addEventListener("message",n=>{const s=JSON.parse(n.data);if(typeof s.module=="string"&&["module.attribute.changed","module.state.changed"].includes(s.type)&&Fa.set(s.module,(Fa.get(s.module)??0)+1),s.type==="control.changed"){dr();return}if(s.type==="module.attribute.changed"){if(vp+=1,s.module==="scope")Ji(s.attribute,s.value),s.attribute==="run_continuous"&&so(s.value?"running_continuous":"stopped"),Q.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`;else if(hr(s.module)){const i=s.module;Jr(i,s.attribute,s.value),Cs[i].status.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`}else if(s.module==="hk")el(s.attribute,s.value),Zn.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`;else if(s.module==="ams")$a({[s.attribute]:s.value});else if(s.module==="sampler")Oa({[s.attribute]:s.value});else if(s.module==="networkanalyzer")Vt.applyState({[s.attribute]:s.value});else if(pr(s.module)){Da(s.module,s.attribute,s.value),s.module==="iir"&&lt?.refresh().catch(a=>{S(Q,a.message)});const i=Bt.get(s.module);i&&(i.status.textContent=`${s.attribute} = ${vn(s.attribute,s.value)}`)}return}if(s.type!=="module.attribute.changed"||s.module!=="scope"){if(s.type==="module.state.changed"&&s.module==="scope")Kr(s.state),s.state.trigger_test?Q.textContent=Lv(s.state.trigger_test):Q.textContent=`${s.state.last_action}: ${s.state.running_state}`;else if(s.type==="module.state.changed"&&hr(s.module)){const i=s.module;Zr(i,s.state??{}),Cs[i].status.textContent=`${i} state updated`}else if(s.type==="module.state.changed"&&s.module==="hk")Qr(s.state??{}),Zn.textContent="Housekeeping state updated";else if(s.type==="module.state.changed"&&s.module==="ams")$a(s.state??{});else if(s.type==="module.state.changed"&&s.module==="sampler")Oa(s.state??{});else if(s.type==="module.state.changed"&&pr(s.module)){Ps(s.module,s.state??{}),s.module==="iir"&&lt?.refresh().catch(a=>{S(Q,a.message)});const i=Bt.get(s.module);i&&!i.owner&&s.module!=="spectrumanalyzer"&&(i.status.textContent=`${s.module} state updated`)}else s.type==="module.state.changed"&&s.module==="lockbox"?wn.applySchema(s.state).catch(i=>{S(Q,i.message)}):s.type==="module.state.changed"&&s.module==="networkanalyzer"?Vt.applyState(s.state??{}):s.type==="module.states.changed"&&s.module==="scope"&&(Pp(s.states??[]),Q.textContent=`${s.states.length} saved state${s.states.length===1?"":"s"}`);return}}),e.addEventListener("close",()=>{Yn===e&&(Yn=null,Kc.schedule())})}async function Ev(t,e){for(;Yn===e&&e.readyState===WebSocket.OPEN;){const n=Fa.get(t)??0,s=await fetch(t==="lockbox"?"/api/lockbox":`/api/modules/${t}`);if(!s.ok)throw new Error(`${t} state unavailable: ${s.status}`);const i=await s.json(),a=t==="lockbox"?i:i.state;if(Yn!==e)return;if(n===(Fa.get(t)??0)){t==="scope"?Kr(a):hr(t)?Zr(t,a):t==="hk"?Qr(a):t==="ams"?$a(a):t==="sampler"?Oa(a):t==="networkanalyzer"?Vt.applyState(a):t==="lockbox"?await wn.applySchema(a):pr(t)&&Ps(t,a),t==="iir"&&await lt?.refresh();return}}}function zp(){const t=wt==="observer";for(const e of Ui.querySelectorAll("input, select, textarea, button")){const n=t&&!Or(e);e.inert=n,n?e.setAttribute("aria-disabled","true"):e.removeAttribute("aria-disabled")}for(const e of["config-text","curve-viewer-params"])b(`#${e}`).readOnly=t}function sl(t){wt=t.role,Xr(qt),zp(),fs.disabled||(fs.textContent=wt==="observer"?"Download CSV":"Save Curve"),ms.disabled||(ms.textContent=wt==="observer"?"Download CSV":"Save Curve"),Vt.setReadOnly(wt==="observer"),Gc.classList.remove("is-controller","is-observer","is-shared"),Gc.classList.add(`is-${t.role}`),t.role==="shared"?(ai.value="Shared control",Ca.hidden=!0):t.role==="controller"?(ai.value="You have control",Ca.hidden=!0):(ai.value=t.controller?.label?`Observer: ${t.controller.label} has control`:"Observer: control is available",Ca.hidden=!1)}async function dr(){try{sl(await ta.refresh())}catch(t){S(ai,t instanceof Error?t.message:"Control unavailable")}}async function Cv(){At.textContent="Loading one scope frame...";const t=await fetch(`/api/scope/frame?samples=${X.getSampleCount()}`);if(t.status===204){At.textContent="No trigger captured";return}if(!t.ok)throw new Error(`Scope frame request failed: ${t.status}`);const e=await t.arrayBuffer();X.close(),X.showFrame(e),rt.dataset.connected="false"}async function An(t){const e=await fetch(`/api/modules/spectrumanalyzer/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Spectrum action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return Ps("spectrumanalyzer",n.state??{}),zt.textContent=`${t}: ${s.running_state??"ok"}`,n}async function _p(t,e,n,s){const i=await fetch("/api/curves?include_data=false",{method:"POST",headers:{"content-type":"application/octet-stream"},body:$m(t,e,n,s)});if(!i.ok)throw new Error(`Save curve failed: ${i.status}`)}async function Pv(){const t=X.getCurveData();if(!t)throw new Error("No scope curve to save");const n=[[0,mn.checked],[1,gn.checked]].filter(([,i])=>i),s={input1:di.value,input2:fi.value,duration:Number(Ln.value),average:mi.checked,trigger_source:Wn.value,trigger_delay:Number(Gn.value),threshold:Number(Tn.value),hysteresis:Number(Kn.value),ch1_active:mn.checked,ch2_active:gn.checked,ch_math_active:Es.checked,math_formula:Xn.value,xy_mode:Ms.checked,rolling_mode:Un.checked,trace_average:Number(Fn.value)};for(const[i]of n)await _p(t.x,t.channels[i],{...s,name:`${ks.value||"scope curve"} ch${i+1}`,module:"scope",ch:i,curve_unit:"V"});return n.length}async function Av(){const t=ge.getCurveData();if(!t)throw new Error("No spectrum curve to save");for(const[e,n]of t.series.entries())await _p(t.x,n.values,{...ge.getCurveParameters(),name:`${Gi.value||"pyrpl spectrum"} ${n.label.toLowerCase()}`,module:"spectrumanalyzer",ch:n.label==="Cross"?"cross":e,curve_unit:t.unit},n.imaginary);return t.series.length}function Qi(){vt.dataset.connected!=="true"&&(ge.connect(),vt.dataset.connected="true")}function bn(t="Spectrum stopped"){ge.close(),vt.dataset.connected="false",zt.textContent=t}async function Lp(){await An("stop"),(vt.dataset.connected==="true"||ge.isConnected())&&bn("Spectrum stopped: Scope owns the scope resource")}async function zv(){await Lp(),await an("single"),X.resetTraceAveraging(),Zi()}function _v(){return encodeURIComponent(fr())}function fr(){return(Si.value.trim()||Ct.value||"default").trim()}function Fp(){return(Ct.value||Si.value.trim()||"default").trim()}function Lv(t){const e=String(t.source??"unknown"),n=String(t.condition??"condition"),s=Number(t.hysteresis??0);return t.triggered?`triggered ${e} ${n} at sample ${t.index} (hys ${s})`:`no trigger: ${e} ${n} (hys ${s})`}async function Fv(){const t=await fetch(`/api/modules/scope/states/${_v()}/save`,{method:"POST"});if(!t.ok)throw new Error(`Save state failed: ${t.status}`);await nl(),Ct.value=fr(),Q.textContent=`saved state ${fr()}`}async function Tv(){const t=Fp(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}/load`,{method:"POST"});if(!e.ok)throw new Error(`Load state failed: ${e.status}`);const n=await e.json();Kr(n.state),Si.value=t,Q.textContent=`loaded state ${t}`}async function Rv(){const t=Fp(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}`,{method:"DELETE"});if(!e.ok)throw new Error(`Delete state failed: ${e.status}`);await nl(),Q.textContent=`deleted state ${t}`}rt.addEventListener("click",()=>{(async()=>{try{qt==="running_continuous"?await an("pause"):qt==="paused_single"||qt==="paused_continuous"?(await an("resume_continuous"),Zi()):(await Lp(),await an("continuous"),X.resetTraceAveraging(),Zi())}catch(t){S(Q,t instanceof Error?t.message:String(t))}})()});fn.addEventListener("click",()=>{(qt==="running_single"?an("pause"):qt==="paused_single"||qt==="paused_continuous"?an("resume_single").then(()=>Zi()):zv()).catch(e=>{S(At,e.message)})});Js.addEventListener("click",()=>{an("stop").then(()=>{X.resetTraceAveraging(),na()}).catch(t=>{S(At,t.message)})});fs.addEventListener("click",async()=>{if(wt==="observer"){X.downloadCsv(`scope-${Date.now()}.csv`);return}fs.disabled=!0,fs.textContent="Saving…",Q.textContent="Saving curves…";try{const[,t]=await Promise.all([an("save_curve"),Pv()]);X.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),Q.textContent=`saved ${t} curve${t===1?"":"s"}`}catch(t){S(Q,t instanceof Error?t.message:String(t))}finally{fs.disabled=!1,fs.textContent="Save Curve"}});pg.addEventListener("click",()=>X.zoom(1.8));hg.addEventListener("click",()=>X.zoom(.55));dg.addEventListener("click",()=>X.zoomY(1.8));fg.addEventListener("click",()=>X.zoomY(.55));mg.addEventListener("click",()=>X.panX(-.2));gg.addEventListener("click",()=>X.panX(.2));vg.addEventListener("click",()=>X.panY(-.2));bg.addEventListener("click",()=>X.panY(.2));wg.addEventListener("click",()=>X.resetZoom());Mn.addEventListener("click",()=>{(async()=>{try{vs==="running_single"?(await An("pause"),bn("Spectrum paused")):vs==="paused_single"||vs==="paused_continuous"?(bn("Reconnecting spectrum stream"),await An("resume_single"),Qi()):(await xp(),bn("Starting spectrum acquisition"),ge.resetAveraging(),await An("single"),Qi())}catch(t){S(zt,t instanceof Error?t.message:String(t))}})()});vt.addEventListener("click",()=>{(async()=>{try{vs==="running_continuous"?(await An("pause"),bn("Spectrum paused")):vs==="paused_single"||vs==="paused_continuous"?(bn("Reconnecting spectrum stream"),await An("resume_continuous"),Qi()):(await xp(),bn("Starting spectrum acquisition"),ge.resetAveraging(),await An("continuous"),Qi())}catch(t){S(zt,t instanceof Error?t.message:String(t))}})()});$i.addEventListener("click",()=>{An("stop").then(()=>bn()).catch(t=>{S(zt,t.message)})});ms.addEventListener("click",async()=>{if(wt==="observer"){ge.downloadCsv(`spectrum-${Date.now()}.csv`);return}ms.disabled=!0,ms.textContent="Saving…",zt.textContent="Saving curves…";try{const t=await Av();ge.downloadCsv(`spectrum-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),zt.textContent=`saved ${t} curve${t===1?"":"s"}`}catch(t){S(zt,t instanceof Error?t.message:String(t))}finally{ms.disabled=!1,ms.textContent="Save Curve"}});ks.addEventListener("change",()=>{st("curve_name",ks.value).catch(t=>{S(Q,t.message)})});Gi.addEventListener("change",()=>{ti("spectrumanalyzer","curve_name",Gi.value,zt).catch(t=>{S(zt,t.message)})});Lg.addEventListener("click",()=>ge.zoom(1.8));Fg.addEventListener("click",()=>ge.zoom(.55));Tg.addEventListener("click",()=>ge.zoomY(1.8));Rg.addEventListener("click",()=>ge.zoomY(.55));Ig.addEventListener("click",()=>ge.panX(-.2));Ng.addEventListener("click",()=>ge.panX(.2));Og.addEventListener("click",()=>ge.panY(-.2));$g.addEventListener("click",()=>ge.panY(.2));Dg.addEventListener("click",()=>ge.resetZoom());mn.addEventListener("change",()=>{X.setChannelVisible(1,mn.checked),st("ch1_active",mn.checked).catch(t=>{S(Q,t.message),mn.checked=X.getChannelVisible(1)})});gn.addEventListener("change",()=>{X.setChannelVisible(2,gn.checked),st("ch2_active",gn.checked).catch(t=>{S(Q,t.message),gn.checked=X.getChannelVisible(2)})});di.addEventListener("change",()=>{st("input1",di.value).catch(t=>{S(Q,t.message)})});fi.addEventListener("change",()=>{st("input2",fi.value).catch(t=>{S(Q,t.message)})});Wn.addEventListener("change",()=>{st("trigger_source",Wn.value).catch(t=>{S(Q,t.message)})});Xi.addEventListener("change",()=>{Xi.checked&&st("rolling_mode",!1).catch(t=>{S(Q,t.message)})});Un.addEventListener("change",()=>{Un.checked&&st("rolling_mode",!0).catch(t=>{S(Q,t.message)})});Ln.addEventListener("change",()=>{st("duration",Number(Ln.value)).catch(t=>{S(Q,t.message)})});mi.addEventListener("change",()=>{st("average",mi.checked).catch(t=>{S(Q,t.message)})});Ms.addEventListener("change",()=>{bs(),st("xy_mode",Ms.checked).catch(t=>{S(Q,t.message)})});Es.addEventListener("change",()=>{bs(),st("ch_math_active",Es.checked).catch(t=>{S(Q,t.message)})});Xn.addEventListener("change",()=>{bs(),st("math_formula",Xn.value).catch(t=>{S(Q,t.message)})});Fn.addEventListener("change",()=>{st("trace_average",Number(Fn.value)).catch(t=>{S(Q,t.message)})});Gn.addEventListener("change",()=>{st("trigger_delay",Number(Gn.value)).catch(t=>{S(Q,t.message)})});Tn.addEventListener("change",()=>{st("threshold",Number(Tn.value)).catch(t=>{S(Q,t.message)})});Kn.addEventListener("change",()=>{st("hysteresis",Number(Kn.value)).catch(t=>{S(Q,t.message)})});hp.addEventListener("click",()=>{Fv().catch(t=>{S(Q,t.message)})});Ct.addEventListener("change",()=>{Ct.value&&(Si.value=Ct.value)});dp.addEventListener("click",()=>{Tv().catch(t=>{S(Q,t.message)})});fp.addEventListener("click",()=>{Rv().catch(t=>{S(Q,t.message)})});for(const t of Vr){const e=Cs[t];e.waveform.addEventListener("change",()=>{qn(t,"waveform",e.waveform.value).catch(n=>{S(e.status,n.message)})}),e.frequency.addEventListener("change",()=>{qn(t,"frequency",Number(e.frequency.value)).catch(n=>{S(e.status,n.message)})}),e.amplitude.addEventListener("change",()=>{qn(t,"amplitude",Number(e.amplitude.value)).catch(n=>{S(e.status,n.message)})}),e.offset.addEventListener("change",()=>{qn(t,"offset",Number(e.offset.value)).catch(n=>{S(e.status,n.message)})}),e.triggerSource.addEventListener("change",()=>{qn(t,"trigger_source",e.triggerSource.value).catch(n=>{S(e.status,n.message)})}),e.outputDirect.addEventListener("change",()=>{qn(t,"output_direct",e.outputDirect.value).catch(n=>{S(e.status,n.message)})}),e.startPhase.addEventListener("change",()=>{qn(t,"start_phase",Number(e.startPhase.value)).catch(n=>{S(e.status,n.message)})}),e.cyclesPerBurst.addEventListener("change",()=>{qn(t,"cycles_per_burst",Number(e.cyclesPerBurst.value)).catch(n=>{S(e.status,n.message)})}),e.setup.addEventListener("click",()=>{Yo(t,"setup").catch(n=>{S(e.status,n.message)})}),e.trigger.addEventListener("click",()=>{Yo(t,"trigger").catch(n=>{S(e.status,n.message)})}),e.off.addEventListener("click",()=>{Yo(t,"off").catch(n=>{S(e.status,n.message)})})}La.addEventListener("change",()=>{ur("led",Number(La.value)).catch(t=>{S(Zn,t.message)})});kg.addEventListener("click",()=>{kp().catch(t=>{S(Zn,t.message)})});xg.addEventListener("click",()=>{Mp().catch(t=>{S(mp,t.message)})});or.addEventListener("click",()=>{fv().catch(t=>{rr.value=t.message})});ii[2].addEventListener("change",()=>{Ep(2).catch(t=>{S(to,t.message)})});ii[3].addEventListener("change",()=>{Ep(3).catch(t=>{S(to,t.message)})});async function Iv(){try{sl(await ta.initialize())}catch{await dr()}if(jr=await rv(),dv(),await uv(),await nl(),await pv(),await kp(),await Mp(),await mv(),await Vt.initialize(),await Bg.load().catch(t=>{const e=b("#config-status");En("pyrplconfig")?S(e,t.message):e.textContent=t.message}),await wn.load(),Ap(),await Hg(),Hr=!0,ki(),!A.activePanelId){At.textContent="No panel enabled";return}if(!En("scope")){const t=A.layoutMode==="tabs"?A.activePanelId:A.splitPanelIds[0]??A.activePanelId;At.textContent=`${Yt.find(e=>e.id===t)?.title} panel ready`;return}if(!A.panels.scope.enabled){At.textContent="Scope panel disabled";return}await wp()}Ca.addEventListener("click",()=>{ta.claim(!0).then(sl).catch(t=>{S(ai,t.message)})});window.addEventListener("pagehide",()=>ta.release());new MutationObserver(zp).observe(Ui,{childList:!0,subtree:!0});jg();Iv().catch(t=>{S(At,t.message)});
