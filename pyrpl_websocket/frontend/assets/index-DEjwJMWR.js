(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const Pp=!0,Xe="u-",zp="uplot",_p=Xe+"hz",Lp=Xe+"vt",Fp=Xe+"title",Tp=Xe+"wrap",Np=Xe+"under",$p=Xe+"over",Ip=Xe+"axis",as=Xe+"off",Rp=Xe+"select",Op=Xe+"cursor-x",Dp=Xe+"cursor-y",Bp=Xe+"cursor-pt",qp=Xe+"legend",Vp=Xe+"live",Yp=Xe+"inline",Hp=Xe+"series",jp=Xe+"marker",Jr=Xe+"label",Xp=Xe+"value",Si="width",ki="height",xi="top",Qr="bottom",Rs="left",no="right",Vo="#000",el=Vo+"0",so="mousemove",tl="mousedown",io="mouseup",nl="mouseenter",sl="mouseleave",il="dblclick",Up="resize",Wp="scroll",al="change",ra="dppxchange",Yo="--",si=typeof window<"u",wo=si?document:null,Ys=si?window:null,Gp=si?navigator:null;let ve,Ji;function bo(){let t=devicePixelRatio;ve!=t&&(ve=t,Ji&&So(al,Ji,bo),Ji=matchMedia(`(min-resolution: ${ve-.001}dppx) and (max-resolution: ${ve+.001}dppx)`),rs(al,Ji,bo),Ys.dispatchEvent(new CustomEvent(ra)))}function yt(t,e){if(e!=null){let n=t.classList;!n.contains(e)&&n.add(e)}}function yo(t,e){let n=t.classList;n.contains(e)&&n.remove(e)}function Fe(t,e,n){t.style[e]=n+"px"}function jt(t,e,n,s){let i=wo.createElement(t);return e!=null&&yt(i,e),n?.insertBefore(i,s),i}function Lt(t,e){return jt("div",t,e)}const ol=new WeakMap;function rn(t,e,n,s,i){let a="translate("+e+"px,"+n+"px)",o=ol.get(t);a!=o&&(t.style.transform=a,ol.set(t,a),e<0||n<0||e>s||n>i?yt(t,as):yo(t,as))}const rl=new WeakMap;function ll(t,e,n){let s=e+n,i=rl.get(t);s!=i&&(rl.set(t,s),t.style.background=e,t.style.borderColor=n)}const cl=new WeakMap;function ul(t,e,n,s){let i=e+""+n,a=cl.get(t);i!=a&&(cl.set(t,i),t.style.height=n+"px",t.style.width=e+"px",t.style.marginLeft=s?-e/2+"px":0,t.style.marginTop=s?-n/2+"px":0)}const Ho={passive:!0},Kp={...Ho,capture:!0};function rs(t,e,n,s){e.addEventListener(t,n,s?Kp:Ho)}function So(t,e,n,s){e.removeEventListener(t,n,Ho)}si&&bo();function Xt(t,e,n,s){let i;n=n||0,s=s||e.length-1;let a=s<=2147483647;for(;s-n>1;)i=a?n+s>>1:Mt((n+s)/2),e[i]<t?n=i:s=i;return t-e[n]<=e[s]-t?n:s}function vc(t){return(n,s,i)=>{let a=-1,o=-1;for(let l=s;l<=i;l++)if(t(n[l])){a=l;break}for(let l=i;l>=s;l--)if(t(n[l])){o=l;break}return[a,o]}}const xc=t=>t!=null,wc=t=>t!=null&&t>0,ga=vc(xc),Zp=vc(wc);function Jp(t,e,n,s=0,i=!1){let a=i?Zp:ga,o=i?wc:xc;[e,n]=a(t,e,n);let l=t[e],u=t[e];if(e>-1)if(s==1)l=t[e],u=t[n];else if(s==-1)l=t[n],u=t[e];else for(let d=e;d<=n;d++){let v=t[d];o(v)&&(v<l?l=v:v>u&&(u=v))}return[l??Me,u??-Me]}function va(t,e,n,s){let i=dl(t),a=dl(e);t==e&&(i==-1?(t*=n,e/=n):(t/=n,e*=n));let o=n==10?gn:bc,l=i==1?Mt:Tt,u=a==1?Tt:Mt,d=l(o(He(t))),v=u(o(He(e))),m=Xs(n,d),f=Xs(n,v);return n==10&&(d<0&&(m=Ee(m,-d)),v<0&&(f=Ee(f,-v))),s||n==2?(t=m*i,e=f*a):(t=Mc(t,m),e=xa(e,f)),[t,e]}function jo(t,e,n,s){let i=va(t,e,n,s);return t==0&&(i[0]=0),e==0&&(i[1]=0),i}const Xo=.1,pl={mode:3,pad:Xo},zi={pad:0,soft:null,mode:0},Qp={min:zi,max:zi};function la(t,e,n,s){return wa(n)?hl(t,e,n):(zi.pad=n,zi.soft=s?0:null,zi.mode=s?3:0,hl(t,e,Qp))}function fe(t,e){return t??e}function eh(t,e,n){for(e=fe(e,0),n=fe(n,t.length-1);e<=n;){if(t[e]!=null)return!0;e++}return!1}function hl(t,e,n){let s=n.min,i=n.max,a=fe(s.pad,0),o=fe(i.pad,0),l=fe(s.hard,-Me),u=fe(i.hard,Me),d=fe(s.soft,Me),v=fe(i.soft,-Me),m=fe(s.mode,0),f=fe(i.mode,0),y=e-t,A=gn(y),R=ut(He(t),He(e)),L=gn(R),_=He(L-A);(y<1e-24||_>10)&&(y=0,(t==0||e==0)&&(y=1e-24,m==2&&d!=Me&&(a=0),f==2&&v!=-Me&&(o=0)));let M=y||R||1e3,O=gn(M),P=Xs(10,Mt(O)),K=M*(y==0?t==0?.1:1:a),$=Ee(Mc(t-K,P/10),24),ee=t>=d&&(m==1||m==3&&$<=d||m==2&&$>=d)?d:Me,W=ut(l,$<ee&&t>=ee?ee:Ut(ee,$)),se=M*(y==0?e==0?.1:1:o),J=Ee(xa(e+se,P/10),24),z=e<=v&&(f==1||f==3&&J>=v||f==2&&J<=v)?v:-Me,te=Ut(u,J>z&&e<=z?z:ut(z,J));return W==te&&W==0&&(te=100),[W,te]}const th=new Intl.NumberFormat(si?Gp.language:"en-US"),Uo=t=>th.format(t),Et=Math,aa=Et.PI,He=Et.abs,Mt=Et.floor,Ye=Et.round,Tt=Et.ceil,Ut=Et.min,ut=Et.max,Xs=Et.pow,dl=Et.sign,gn=Et.log10,bc=Et.log2,nh=(t,e=1)=>Et.sinh(t)*e,ao=(t,e=1)=>Et.asinh(t/e),Me=1/0;function fl(t){return(gn((t^t>>31)-(t>>31))|0)+1}function ko(t,e,n){return Ut(ut(t,e),n)}function yc(t){return typeof t=="function"}function le(t){return yc(t)?t:()=>t}const sh=()=>{},Sc=t=>t,kc=(t,e)=>e,ih=t=>null,ml=t=>!0,gl=(t,e)=>t==e,ah=/\.\d*?(?=9{6,}|0{6,})/gm,us=t=>{if(Cc(t)||On.has(t))return t;const e=`${t}`,n=e.match(ah);if(n==null)return t;let s=n[0].length-1;if(e.indexOf("e-")!=-1){let[i,a]=e.split("e");return+`${us(i)}e${a}`}return Ee(t,s)};function ss(t,e){return us(Ee(us(t/e))*e)}function xa(t,e){return us(Tt(us(t/e))*e)}function Mc(t,e){return us(Mt(us(t/e))*e)}function Ee(t,e=0){if(Cc(t))return t;let n=10**e,s=t*n*(1+Number.EPSILON);return Ye(s)/n}const On=new Map;function Ec(t){return((""+t).split(".")[1]||"").length}function Fi(t,e,n,s){let i=[],a=s.map(Ec);for(let o=e;o<n;o++){let l=He(o),u=Ee(Xs(t,o),l);for(let d=0;d<s.length;d++){let v=t==10?+`${s[d]}e${o}`:s[d]*u,m=(o>=0?0:l)+(o>=a[d]?0:a[d]),f=t==10?v:Ee(v,m);i.push(f),On.set(f,m)}}return i}const _i={},Wo=[],Us=[null,null],$n=Array.isArray,Cc=Number.isInteger,oh=t=>t===void 0;function vl(t){return typeof t=="string"}function wa(t){let e=!1;if(t!=null){let n=t.constructor;e=n==null||n==Object}return e}function rh(t){return t!=null&&typeof t=="object"}const lh=Object.getPrototypeOf(Uint8Array),Ac="__proto__";function Ws(t,e=wa){let n;if($n(t)){let s=t.find(i=>i!=null);if($n(s)||e(s)){n=Array(t.length);for(let i=0;i<t.length;i++)n[i]=Ws(t[i],e)}else n=t.slice()}else if(t instanceof lh)n=t.slice();else if(e(t)){n={};for(let s in t)s!=Ac&&(n[s]=Ws(t[s],e))}else n=t;return n}function qe(t){let e=arguments;for(let n=1;n<e.length;n++){let s=e[n];for(let i in s)i!=Ac&&(wa(t[i])?qe(t[i],Ws(s[i])):t[i]=Ws(s[i]))}return t}const ch=0,uh=1,ph=2;function hh(t,e,n){for(let s=0,i,a=-1;s<e.length;s++){let o=e[s];if(o>a){for(i=o-1;i>=0&&t[i]==null;)t[i--]=null;for(i=o+1;i<n&&t[i]==null;)t[a=i++]=null}}}function dh(t,e){if(gh(t)){let o=t[0].slice();for(let l=1;l<t.length;l++)o.push(...t[l].slice(1));return vh(o[0])||(o=mh(o)),o}let n=new Set;for(let o=0;o<t.length;o++){let u=t[o][0],d=u.length;for(let v=0;v<d;v++)n.add(u[v])}let s=[Array.from(n).sort((o,l)=>o-l)],i=s[0].length,a=new Map;for(let o=0;o<i;o++)a.set(s[0][o],o);for(let o=0;o<t.length;o++){let l=t[o],u=l[0];for(let d=1;d<l.length;d++){let v=l[d],m=Array(i).fill(void 0),f=e?e[o][d]:uh,y=[];for(let A=0;A<v.length;A++){let R=v[A],L=a.get(u[A]);R===null?f!=ch&&(m[L]=R,f==ph&&y.push(L)):m[L]=R}hh(m,y,i),s.push(m)}}return s}const fh=typeof queueMicrotask>"u"?t=>Promise.resolve().then(t):queueMicrotask;function mh(t){let e=t[0],n=e.length,s=Array(n);for(let a=0;a<s.length;a++)s[a]=a;s.sort((a,o)=>e[a]-e[o]);let i=[];for(let a=0;a<t.length;a++){let o=t[a],l=Array(n);for(let u=0;u<n;u++)l[u]=o[s[u]];i.push(l)}return i}function gh(t){let e=t[0][0],n=e.length;for(let s=1;s<t.length;s++){let i=t[s][0];if(i.length!=n)return!1;if(i!=e){for(let a=0;a<n;a++)if(i[a]!=e[a])return!1}}return!0}function vh(t,e=100){const n=t.length;if(n<=1)return!0;let s=0,i=n-1;for(;s<=i&&t[s]==null;)s++;for(;i>=s&&t[i]==null;)i--;if(i<=s)return!0;const a=ut(1,Mt((i-s+1)/e));for(let o=t[s],l=s+a;l<=i;l+=a){const u=t[l];if(u!=null){if(u<=o)return!1;o=u}}return!0}const Pc=["January","February","March","April","May","June","July","August","September","October","November","December"],zc=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function _c(t){return t.slice(0,3)}const xh=zc.map(_c),wh=Pc.map(_c),bh={MMMM:Pc,MMM:wh,WWWW:zc,WWW:xh};function wi(t){return(t<10?"0":"")+t}function yh(t){return(t<10?"00":t<100?"0":"")+t}const Sh={YYYY:t=>t.getFullYear(),YY:t=>(t.getFullYear()+"").slice(2),MMMM:(t,e)=>e.MMMM[t.getMonth()],MMM:(t,e)=>e.MMM[t.getMonth()],MM:t=>wi(t.getMonth()+1),M:t=>t.getMonth()+1,DD:t=>wi(t.getDate()),D:t=>t.getDate(),WWWW:(t,e)=>e.WWWW[t.getDay()],WWW:(t,e)=>e.WWW[t.getDay()],HH:t=>wi(t.getHours()),H:t=>t.getHours(),h:t=>{let e=t.getHours();return e==0?12:e>12?e-12:e},AA:t=>t.getHours()>=12?"PM":"AM",aa:t=>t.getHours()>=12?"pm":"am",a:t=>t.getHours()>=12?"p":"a",mm:t=>wi(t.getMinutes()),m:t=>t.getMinutes(),ss:t=>wi(t.getSeconds()),s:t=>t.getSeconds(),fff:t=>yh(t.getMilliseconds())};function Go(t,e){e=e||bh;let n=[],s=/\{([a-z]+)\}|[^{]+/gi,i;for(;i=s.exec(t);)n.push(i[0][0]=="{"?Sh[i[1]]:i[0]);return a=>{let o="";for(let l=0;l<n.length;l++)o+=typeof n[l]=="string"?n[l]:n[l](a,e);return o}}const kh=new Intl.DateTimeFormat().resolvedOptions().timeZone;function Mh(t,e){let n;return e=="UTC"||e=="Etc/UTC"?n=new Date(+t+t.getTimezoneOffset()*6e4):e==kh?n=t:(n=new Date(t.toLocaleString("en-US",{timeZone:e})),n.setMilliseconds(t.getMilliseconds())),n}const Lc=t=>t%1==0,ca=[1,2,2.5,5],Eh=Fi(10,-32,0,ca),Fc=Fi(10,0,32,ca),Ch=Fc.filter(Lc),is=Eh.concat(Fc),Ko=`
`,Tc="{YYYY}",xl=Ko+Tc,Nc="{M}/{D}",Mi=Ko+Nc,Qi=Mi+"/{YY}",$c="{aa}",Ah="{h}:{mm}",Bs=Ah+$c,wl=Ko+Bs,bl=":{ss}",xe=null;function Ic(t){let e=t*1e3,n=e*60,s=n*60,i=s*24,a=i*30,o=i*365,u=(t==1?Fi(10,0,3,ca).filter(Lc):Fi(10,-3,0,ca)).concat([e,e*5,e*10,e*15,e*30,n,n*5,n*10,n*15,n*30,s,s*2,s*3,s*4,s*6,s*8,s*12,i,i*2,i*3,i*4,i*5,i*6,i*7,i*8,i*9,i*10,i*15,a,a*2,a*3,a*4,a*6,o,o*2,o*5,o*10,o*25,o*50,o*100]);const d=[[o,Tc,xe,xe,xe,xe,xe,xe,1],[i*28,"{MMM}",xl,xe,xe,xe,xe,xe,1],[i,Nc,xl,xe,xe,xe,xe,xe,1],[s,"{h}"+$c,Qi,xe,Mi,xe,xe,xe,1],[n,Bs,Qi,xe,Mi,xe,xe,xe,1],[e,bl,Qi+" "+Bs,xe,Mi+" "+Bs,xe,wl,xe,1],[t,bl+".{fff}",Qi+" "+Bs,xe,Mi+" "+Bs,xe,wl,xe,1]];function v(m){return(f,y,A,R,L,_)=>{let M=[],O=L>=o,P=L>=a&&L<o,K=m(A),$=Ee(K*t,3),ee=oo(K.getFullYear(),O?0:K.getMonth(),P||O?1:K.getDate()),W=Ee(ee*t,3);if(P||O){let se=P?L/a:0,J=O?L/o:0,z=$==W?$:Ee(oo(ee.getFullYear()+J,ee.getMonth()+se,1)*t,3),te=new Date(Ye(z/t)),B=te.getFullYear(),Z=te.getMonth();for(let V=0;z<=R;V++){let oe=oo(B+J*V,Z+se*V,1),H=oe-m(Ee(oe*t,3));z=Ee((+oe+H)*t,3),z<=R&&M.push(z)}}else{let se=L>=i?i:L,J=Mt(A)-Mt($),z=W+J+xa($-W,se);M.push(z);let te=m(z),B=te.getHours()+te.getMinutes()/n+te.getSeconds()/s,Z=L/s,V=f.axes[y]._space,oe=_/V;for(;z=Ee(z+L,t==1?0:3),!(z>R);)if(Z>1){let H=Mt(Ee(B+Z,6))%24,ce=m(z).getHours()-H;ce>1&&(ce=-1),z-=ce*s,B=(B+Z)%24;let me=M[M.length-1];Ee((z-me)/L,3)*oe>=.7&&M.push(z)}else M.push(z)}return M}}return[u,d,v]}const[Ph,zh,_h]=Ic(1),[Lh,Fh,Th]=Ic(.001);Fi(2,-53,53,[1]);function yl(t,e){return t.map(n=>n.map((s,i)=>i==0||i==8||s==null?s:e(i==1||n[8]==0?s:n[1]+s)))}function Sl(t,e){return(n,s,i,a,o)=>{let l=e.find(A=>o>=A[0])||e[e.length-1],u,d,v,m,f,y;return s.map(A=>{let R=t(A),L=R.getFullYear(),_=R.getMonth(),M=R.getDate(),O=R.getHours(),P=R.getMinutes(),K=R.getSeconds(),$=L!=u&&l[2]||_!=d&&l[3]||M!=v&&l[4]||O!=m&&l[5]||P!=f&&l[6]||K!=y&&l[7]||l[1];return u=L,d=_,v=M,m=O,f=P,y=K,$(R)})}}function Nh(t,e){let n=Go(e);return(s,i,a,o,l)=>i.map(u=>n(t(u)))}function oo(t,e,n){return new Date(t,e,n)}function kl(t,e){return e(t)}const $h="{YYYY}-{MM}-{DD} {h}:{mm}{aa}";function Ml(t,e){return(n,s,i,a)=>a==null?Yo:e(t(s))}function Ih(t,e){let n=t.series[e];return n.width?n.stroke(t,e):n.points.width?n.points.stroke(t,e):null}function Rh(t,e){return t.series[e].fill(t,e)}const Oh={show:!0,live:!0,isolate:!1,mount:sh,markers:{show:!0,width:2,stroke:Ih,fill:Rh,dash:"solid"},idx:null,idxs:null,values:[]};function Dh(t,e){let n=t.cursor.points,s=Lt(),i=n.size(t,e);Fe(s,Si,i),Fe(s,ki,i);let a=i/-2;Fe(s,"marginLeft",a),Fe(s,"marginTop",a);let o=n.width(t,e,i);return o&&Fe(s,"borderWidth",o),s}function Bh(t,e){let n=t.series[e].points;return n._fill||n._stroke}function qh(t,e){let n=t.series[e].points;return n._stroke||n._fill}function Vh(t,e){return t.series[e].points.size}const ro=[0,0];function Yh(t,e,n){return ro[0]=e,ro[1]=n,ro}function ea(t,e,n,s=!0){return i=>{i.button==0&&(!s||i.target==e)&&n(i)}}function lo(t,e,n,s=!0){return i=>{(!s||i.target==e)&&n(i)}}const Hh={show:!0,x:!0,y:!0,lock:!1,move:Yh,points:{one:!1,show:Dh,size:Vh,width:0,stroke:qh,fill:Bh},bind:{mousedown:ea,mouseup:ea,click:ea,dblclick:ea,mousemove:lo,mouseleave:lo,mouseenter:lo},drag:{setScale:!0,x:!0,y:!1,dist:0,uni:null,click:(t,e)=>{e.stopPropagation(),e.stopImmediatePropagation()},_x:!1,_y:!1},focus:{dist:(t,e,n,s,i)=>s-i,prox:-1,bias:0},hover:{skip:[void 0],prox:null,bias:0},left:-10,top:-10,idx:null,dataIdx:null,idxs:null,event:null},Rc={show:!0,stroke:"rgba(0,0,0,0.07)",width:2},Zo=qe({},Rc,{filter:kc}),Oc=qe({},Zo,{size:10}),Dc=qe({},Rc,{show:!1}),Jo='12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',Bc="bold "+Jo,qc=1.5,El={show:!0,scale:"x",stroke:Vo,space:50,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:Bc,side:2,grid:Zo,ticks:Oc,border:Dc,font:Jo,lineGap:qc,rotate:0},jh="Value",Xh="Time",Cl={show:!0,scale:"x",auto:!1,sorted:1,min:Me,max:-Me,idxs:[]};function Uh(t,e,n,s,i){return e.map(a=>a==null?"":Uo(a))}function Wh(t,e,n,s,i,a,o){let l=[],u=On.get(i)||0;n=o?n:Ee(xa(n,i),u);for(let d=n;d<=s;d=Ee(d+i,u))l.push(Object.is(d,-0)?0:d);return l}function Mo(t,e,n,s,i,a,o){const l=[],u=t.scales[t.axes[e].scale].log,d=u==10?gn:bc,v=Mt(d(n));i=Xs(u,v),u==10&&(i=is[Xt(i,is)]);let m=n,f=i*u;u==10&&(f=is[Xt(f,is)]);do l.push(m),m=m+i,u==10&&!On.has(m)&&(m=Ee(m,On.get(i))),m>=f&&(i=m,f=i*u,u==10&&(f=is[Xt(f,is)]));while(m<=s);return l}function Gh(t,e,n,s,i,a,o){let u=t.scales[t.axes[e].scale].asinh,d=s>u?Mo(t,e,ut(u,n),s,i):[u],v=s>=0&&n<=0?[0]:[];return(n<-u?Mo(t,e,ut(u,-s),-n,i):[u]).reverse().map(f=>-f).concat(v,d)}const Vc=/./,Kh=/[12357]/,Zh=/[125]/,Al=/1/,Eo=(t,e,n,s)=>t.map((i,a)=>e==4&&i==0||a%s==0&&n.test(i.toExponential()[i<0?1:0])?i:null);function Jh(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=t.scales[o],u=t.valToPos,d=a._space,v=u(10,o),m=u(9,o)-v>=d?Vc:u(7,o)-v>=d?Kh:u(5,o)-v>=d?Zh:Al;if(m==Al){let f=He(u(1,o)-v);if(f<d)return Eo(e.slice().reverse(),l.distr,m,Tt(d/f)).reverse()}return Eo(e,l.distr,m,1)}function Qh(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=a._space,u=t.valToPos,d=He(u(1,o)-u(2,o));return d<l?Eo(e.slice().reverse(),3,Vc,Tt(l/d)).reverse():e}function ed(t,e,n,s){return s==null?Yo:e==null?"":Uo(e)}const Pl={show:!0,scale:"y",stroke:Vo,space:30,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:Bc,side:3,grid:Zo,ticks:Oc,border:Dc,font:Jo,lineGap:qc,rotate:0};function td(t,e){let n=3+(t||1)*2;return Ee(n*e,3)}function nd(t,e){let{scale:n,idxs:s}=t.series[0],i=t._data[0],a=t.valToPos(i[s[0]],n,!0),o=t.valToPos(i[s[1]],n,!0),l=He(o-a),u=t.series[e],d=l/(u.points.space*ve);return s[1]-s[0]<=d}const zl={scale:null,auto:!0,sorted:0,min:Me,max:-Me},Yc=(t,e,n,s,i)=>i,_l={show:!0,auto:!0,sorted:0,gaps:Yc,alpha:1,facets:[qe({},zl,{scale:"x"}),qe({},zl,{scale:"y"})]},Ll={scale:"y",auto:!0,sorted:0,show:!0,spanGaps:!1,gaps:Yc,alpha:1,points:{show:nd,filter:null},values:null,min:Me,max:-Me,idxs:[],path:null,clip:null};function sd(t,e,n,s,i){return n/10}const Hc={time:Pp,auto:!0,distr:1,log:10,asinh:1,min:null,max:null,dir:1,ori:0},id=qe({},Hc,{time:!1,ori:1}),Fl={};function jc(t,e){let n=Fl[t];return n||(n={key:t,plots:[],sub(s){n.plots.push(s)},unsub(s){n.plots=n.plots.filter(i=>i!=s)},pub(s,i,a,o,l,u,d){for(let v=0;v<n.plots.length;v++)n.plots[v]!=i&&n.plots[v].pub(s,i,a,o,l,u,d)}},t!=null&&(Fl[t]=n)),n}const Gs=1,Co=2;function vs(t,e,n){const s=t.mode,i=t.series[e],a=s==2?t._data[e]:t._data,o=t.scales,l=t.bbox;let u=a[0],d=s==2?a[1]:a[e],v=s==2?o[i.facets[0].scale]:o[t.series[0].scale],m=s==2?o[i.facets[1].scale]:o[i.scale],f=l.left,y=l.top,A=l.width,R=l.height,L=t.valToPosH,_=t.valToPosV;return v.ori==0?n(i,u,d,v,m,L,_,f,y,A,R,ya,ii,ka,Uc,Gc):n(i,u,d,v,m,_,L,y,f,R,A,Sa,ai,tr,Wc,Kc)}function Qo(t,e){let n=0,s=0,i=fe(t.bands,Wo);for(let a=0;a<i.length;a++){let o=i[a];o.series[0]==e?n=o.dir:o.series[1]==e&&(o.dir==1?s|=1:s|=2)}return[n,s==1?-1:s==2?1:s==3?2:0]}function ad(t,e,n,s,i){let a=t.mode,o=t.series[e],l=a==2?o.facets[1].scale:o.scale,u=t.scales[l];return i==-1?u.min:i==1?u.max:u.distr==3?u.dir==1?u.min:u.max:0}function vn(t,e,n,s,i,a){return vs(t,e,(o,l,u,d,v,m,f,y,A,R,L)=>{let _=o.pxRound;const M=d.dir*(d.ori==0?1:-1),O=d.ori==0?ii:ai;let P,K;M==1?(P=n,K=s):(P=s,K=n);let $=_(m(l[P],d,R,y)),ee=_(f(u[P],v,L,A)),W=_(m(l[K],d,R,y)),se=_(f(a==1?v.max:v.min,v,L,A)),J=new Path2D(i);return O(J,W,se),O(J,$,se),O(J,$,ee),J})}function ba(t,e,n,s,i,a){let o=null;if(t.length>0){o=new Path2D;const l=e==0?ka:tr;let u=n;for(let m=0;m<t.length;m++){let f=t[m];if(f[1]>f[0]){let y=f[0]-u;y>0&&l(o,u,s,y,s+a),u=f[1]}}let d=n+i-u,v=10;d>0&&l(o,u,s-v/2,d,s+a+v)}return o}function od(t,e,n){let s=t[t.length-1];s&&s[0]==e?s[1]=n:t.push([e,n])}function er(t,e,n,s,i,a,o){let l=[],u=t.length;for(let d=i==1?n:s;d>=n&&d<=s;d+=i)if(e[d]===null){let m=d,f=d;if(i==1)for(;++d<=s&&e[d]===null;)f=d;else for(;--d>=n&&e[d]===null;)f=d;let y=a(t[m]),A=f==m?y:a(t[f]),R=m-i;y=o<=0&&R>=0&&R<u?a(t[R]):y;let _=f+i;A=o>=0&&_>=0&&_<u?a(t[_]):A,A>=y&&l.push([y,A])}return l}function Tl(t){return t==0?Sc:t==1?Ye:e=>ss(e,t)}function Xc(t){let e=t==0?ya:Sa,n=t==0?(i,a,o,l,u,d)=>{i.arcTo(a,o,l,u,d)}:(i,a,o,l,u,d)=>{i.arcTo(o,a,u,l,d)},s=t==0?(i,a,o,l,u)=>{i.rect(a,o,l,u)}:(i,a,o,l,u)=>{i.rect(o,a,u,l)};return(i,a,o,l,u,d=0,v=0)=>{d==0&&v==0?s(i,a,o,l,u):(d=Ut(d,l/2,u/2),v=Ut(v,l/2,u/2),e(i,a+d,o),n(i,a+l,o,a+l,o+u,d),n(i,a+l,o+u,a,o+u,v),n(i,a,o+u,a,o,v),n(i,a,o,a+l,o,d),i.closePath())}}const ya=(t,e,n)=>{t.moveTo(e,n)},Sa=(t,e,n)=>{t.moveTo(n,e)},ii=(t,e,n)=>{t.lineTo(e,n)},ai=(t,e,n)=>{t.lineTo(n,e)},ka=Xc(0),tr=Xc(1),Uc=(t,e,n,s,i,a)=>{t.arc(e,n,s,i,a)},Wc=(t,e,n,s,i,a)=>{t.arc(n,e,s,i,a)},Gc=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(e,n,s,i,a,o)},Kc=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(n,e,i,s,o,a)};function Zc(t){return(e,n,s,i,a)=>vs(e,n,(o,l,u,d,v,m,f,y,A,R,L)=>{let{pxRound:_,points:M}=o,O,P;d.ori==0?(O=ya,P=Uc):(O=Sa,P=Wc);const K=Ee(M.width*ve,3);let $=(M.size-M.width)/2*ve,ee=Ee($*2,3),W=new Path2D,se=new Path2D,{left:J,top:z,width:te,height:B}=e.bbox;ka(se,J-ee,z-ee,te+ee*2,B+ee*2);const Z=V=>{if(u[V]!=null){let oe=_(m(l[V],d,R,y)),H=_(f(u[V],v,L,A));O(W,oe+$,H),P(W,oe,H,$,0,aa*2)}};if(a)a.forEach(Z);else for(let V=s;V<=i;V++)Z(V);return{stroke:K>0?W:null,fill:W,clip:se,flags:Gs|Co}})}function Jc(t){return(e,n,s,i,a,o)=>{s!=i&&(a!=s&&o!=s&&t(e,n,s),a!=i&&o!=i&&t(e,n,i),t(e,n,o))}}const rd=Jc(ii),ld=Jc(ai);function Qc(t){const e=fe(t?.alignGaps,0);return(n,s,i,a)=>vs(n,s,(o,l,u,d,v,m,f,y,A,R,L)=>{[i,a]=ga(u,i,a);let _=o.pxRound,M=B=>_(m(B,d,R,y)),O=B=>_(f(B,v,L,A)),P,K;d.ori==0?(P=ii,K=rd):(P=ai,K=ld);const $=d.dir*(d.ori==0?1:-1),ee={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:Gs},W=ee.stroke;let se=!1;if(a-i>=R*4){let B=Y=>n.posToVal(Y,d.key,!0),Z=null,V=null,oe,H,st,ye=M(l[$==1?i:a]),ce=M(l[i]),me=M(l[a]),ie=B($==1?ce+1:me-1);for(let Y=$==1?i:a;Y>=i&&Y<=a;Y+=$){let Se=l[Y],Ce=($==1?Se<ie:Se>ie)?ye:M(Se),he=u[Y];Ce==ye?he!=null?(H=he,Z==null?(P(W,Ce,O(H)),oe=Z=V=H):H<Z?Z=H:H>V&&(V=H)):he===null&&(se=!0):(Z!=null&&K(W,ye,O(Z),O(V),O(oe),O(H)),he!=null?(H=he,P(W,Ce,O(H)),Z=V=oe=H):(Z=V=null,he===null&&(se=!0)),ye=Ce,ie=B(ye+$))}Z!=null&&Z!=V&&st!=ye&&K(W,ye,O(Z),O(V),O(oe),O(H))}else for(let B=$==1?i:a;B>=i&&B<=a;B+=$){let Z=u[B];Z===null?se=!0:Z!=null&&P(W,M(l[B]),O(Z))}let[z,te]=Qo(n,s);if(o.fill!=null||z!=0){let B=ee.fill=new Path2D(W),Z=o.fillTo(n,s,o.min,o.max,z),V=O(Z),oe=M(l[i]),H=M(l[a]);$==-1&&([H,oe]=[oe,H]),P(B,H,V),P(B,oe,V)}if(!o.spanGaps){let B=[];se&&B.push(...er(l,u,i,a,$,M,e)),ee.gaps=B=o.gaps(n,s,i,a,B),ee.clip=ba(B,d.ori,y,A,R,L)}return te!=0&&(ee.band=te==2?[vn(n,s,i,a,W,-1),vn(n,s,i,a,W,1)]:vn(n,s,i,a,W,te)),ee})}function cd(t){const e=fe(t.align,1),n=fe(t.ascDesc,!1),s=fe(t.alignGaps,0),i=fe(t.extend,!1);return(a,o,l,u)=>vs(a,o,(d,v,m,f,y,A,R,L,_,M,O)=>{[l,u]=ga(m,l,u);let P=d.pxRound,{left:K,width:$}=a.bbox,ee=ce=>P(A(ce,f,M,L)),W=ce=>P(R(ce,y,O,_)),se=f.ori==0?ii:ai;const J={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:Gs},z=J.stroke,te=f.dir*(f.ori==0?1:-1);let B=W(m[te==1?l:u]),Z=ee(v[te==1?l:u]),V=Z,oe=Z;i&&e==-1&&(oe=K,se(z,oe,B)),se(z,Z,B);for(let ce=te==1?l:u;ce>=l&&ce<=u;ce+=te){let me=m[ce];if(me==null)continue;let ie=ee(v[ce]),Y=W(me);e==1?se(z,ie,B):se(z,V,Y),se(z,ie,Y),B=Y,V=ie}let H=V;i&&e==1&&(H=K+$,se(z,H,B));let[st,ye]=Qo(a,o);if(d.fill!=null||st!=0){let ce=J.fill=new Path2D(z),me=d.fillTo(a,o,d.min,d.max,st),ie=W(me);se(ce,H,ie),se(ce,oe,ie)}if(!d.spanGaps){let ce=[];ce.push(...er(v,m,l,u,te,ee,s));let me=d.width*ve/2,ie=n||e==1?me:-me,Y=n||e==-1?-me:me;ce.forEach(Se=>{Se[0]+=ie,Se[1]+=Y}),J.gaps=ce=d.gaps(a,o,l,u,ce),J.clip=ba(ce,f.ori,L,_,M,O)}return ye!=0&&(J.band=ye==2?[vn(a,o,l,u,z,-1),vn(a,o,l,u,z,1)]:vn(a,o,l,u,z,ye)),J})}function Nl(t,e,n,s,i,a,o=Me){if(t.length>1){let l=null;for(let u=0,d=1/0;u<t.length;u++)if(e[u]!==void 0){if(l!=null){let v=He(t[u]-t[l]);v<d&&(d=v,o=He(n(t[u],s,i,a)-n(t[l],s,i,a)))}l=u}}return o}function ud(t){t=t||_i;const e=fe(t.size,[.6,Me,1]),n=t.align||0,s=t.gap||0;let i=t.radius;i=i==null?[0,0]:typeof i=="number"?[i,0]:i;const a=le(i),o=1-e[0],l=fe(e[1],Me),u=fe(e[2],1),d=fe(t.disp,_i),v=fe(t.each,y=>{}),{fill:m,stroke:f}=d;return(y,A,R,L)=>vs(y,A,(_,M,O,P,K,$,ee,W,se,J,z)=>{let te=_.pxRound,B=n,Z=s*ve,V=l*ve,oe=u*ve,H,st;P.ori==0?[H,st]=a(y,A):[st,H]=a(y,A);const ye=P.dir*(P.ori==0?1:-1);let ce=P.ori==0?ka:tr,me=P.ori==0?v:(I,Ae,Ve,ys,Gn,en,Kn)=>{v(I,Ae,Ve,Gn,ys,Kn,en)},ie=fe(y.bands,Wo).find(I=>I.series[0]==A),Y=ie!=null?ie.dir:0,Se=_.fillTo(y,A,_.min,_.max,Y),Ue=te(ee(Se,K,z,se)),Ce,he,F,S=J,E=te(_.width*ve),q=!1,ke=null,ue=null,Ie=null,pt=null;m!=null&&(E==0||f!=null)&&(q=!0,ke=m.values(y,A,R,L),ue=new Map,new Set(ke).forEach(I=>{I!=null&&ue.set(I,new Path2D)}),E>0&&(Ie=f.values(y,A,R,L),pt=new Map,new Set(Ie).forEach(I=>{I!=null&&pt.set(I,new Path2D)})));let{x0:It,size:Qt}=d;if(It!=null&&Qt!=null){B=1,M=It.values(y,A,R,L),It.unit==2&&(M=M.map(Ve=>y.posToVal(W+Ve*J,P.key,!0)));let I=Qt.values(y,A,R,L);Qt.unit==2?he=I[0]*J:he=$(I[0],P,J,W)-$(0,P,J,W),S=Nl(M,O,$,P,J,W,S),F=S-he+Z}else S=Nl(M,O,$,P,J,W,S),F=S*o+Z,he=S-F;F<1&&(F=0),E>=he/2&&(E=0),F<5&&(te=Sc);let Vi=F>0,Un=S-F-(Vi?E:0);he=te(ko(Un,oe,V)),Ce=(B==0?he/2:B==ye?0:he)-B*ye*((B==0?Z/2:0)+(Vi?E/2:0));const ot={stroke:null,fill:null,clip:null,band:null,gaps:null,flags:0},bs=q?null:new Path2D;let un=null;if(ie!=null)un=y.data[ie.series[1]];else{let{y0:I,y1:Ae}=d;I!=null&&Ae!=null&&(O=Ae.values(y,A,R,L),un=I.values(y,A,R,L))}let Wn=H*he,ne=st*he;for(let I=ye==1?R:L;I>=R&&I<=L;I+=ye){let Ae=O[I];if(Ae==null)continue;if(un!=null){let ht=un[I]??0;if(Ae-ht==0)continue;Ue=ee(ht,K,z,se)}let Ve=P.distr!=2||d!=null?M[I]:I,ys=$(Ve,P,J,W),Gn=ee(fe(Ae,Se),K,z,se),en=te(ys-Ce),Kn=te(ut(Gn,Ue)),vt=te(Ut(Gn,Ue)),Ct=Kn-vt;if(Ae!=null){let ht=Ae<0?ne:Wn,Rt=Ae<0?Wn:ne;q?(E>0&&Ie[I]!=null&&ce(pt.get(Ie[I]),en,vt+Mt(E/2),he,ut(0,Ct-E),ht,Rt),ke[I]!=null&&ce(ue.get(ke[I]),en,vt+Mt(E/2),he,ut(0,Ct-E),ht,Rt)):ce(bs,en,vt+Mt(E/2),he,ut(0,Ct-E),ht,Rt),me(y,A,I,en-E/2,vt,he+E,Ct)}}return E>0?ot.stroke=q?pt:bs:q||(ot._fill=_.width==0?_._fill:_._stroke??_._fill,ot.width=0),ot.fill=q?ue:bs,ot})}function pd(t,e){const n=fe(e?.alignGaps,0);return(s,i,a,o)=>vs(s,i,(l,u,d,v,m,f,y,A,R,L,_)=>{[a,o]=ga(d,a,o);let M=l.pxRound,O=H=>M(f(H,v,L,A)),P=H=>M(y(H,m,_,R)),K,$,ee;v.ori==0?(K=ya,ee=ii,$=Gc):(K=Sa,ee=ai,$=Kc);const W=v.dir*(v.ori==0?1:-1);let se=O(u[W==1?a:o]),J=se,z=[],te=[];for(let H=W==1?a:o;H>=a&&H<=o;H+=W)if(d[H]!=null){let ye=u[H],ce=O(ye);z.push(J=ce),te.push(P(d[H]))}const B={stroke:t(z,te,K,ee,$,M),fill:null,clip:null,band:null,gaps:null,flags:Gs},Z=B.stroke;let[V,oe]=Qo(s,i);if(l.fill!=null||V!=0){let H=B.fill=new Path2D(Z),st=l.fillTo(s,i,l.min,l.max,V),ye=P(st);ee(H,J,ye),ee(H,se,ye)}if(!l.spanGaps){let H=[];H.push(...er(u,d,a,o,W,O,n)),B.gaps=H=l.gaps(s,i,a,o,H),B.clip=ba(H,v.ori,A,R,L,_)}return oe!=0&&(B.band=oe==2?[vn(s,i,a,o,Z,-1),vn(s,i,a,o,Z,1)]:vn(s,i,a,o,Z,oe)),B})}function hd(t){return pd(dd,t)}function dd(t,e,n,s,i,a){const o=t.length;if(o<2)return null;const l=new Path2D;if(n(l,t[0],e[0]),o==2)s(l,t[1],e[1]);else{let u=Array(o),d=Array(o-1),v=Array(o-1),m=Array(o-1);for(let f=0;f<o-1;f++)v[f]=e[f+1]-e[f],m[f]=t[f+1]-t[f],d[f]=v[f]/m[f];u[0]=d[0];for(let f=1;f<o-1;f++)d[f]===0||d[f-1]===0||d[f-1]>0!=d[f]>0?u[f]=0:(u[f]=3*(m[f-1]+m[f])/((2*m[f]+m[f-1])/d[f-1]+(m[f]+2*m[f-1])/d[f]),isFinite(u[f])||(u[f]=0));u[o-1]=d[o-2];for(let f=0;f<o-1;f++)i(l,t[f]+m[f]/3,e[f]+u[f]*m[f]/3,t[f+1]-m[f]/3,e[f+1]-u[f+1]*m[f]/3,t[f+1],e[f+1])}return l}const Ao=new Set;function $l(){for(let t of Ao)t.syncRect(!0)}si&&(rs(Up,Ys,$l),rs(Wp,Ys,$l,!0),rs(ra,Ys,()=>{Te.pxRatio=ve}));const fd=Qc(),md=Zc();function Il(t,e,n,s){return(s?[t[0],t[1]].concat(t.slice(2)):[t[0]].concat(t.slice(1))).map((a,o)=>Po(a,o,e,n))}function gd(t,e){return t.map((n,s)=>s==0?{}:qe({},e,n))}function Po(t,e,n,s){return qe({},e==0?n:s,t)}function eu(t,e,n){return e==null?Us:[e,n]}const vd=eu;function xd(t,e,n){return e==null?Us:la(e,n,Xo,!0)}function tu(t,e,n,s){return e==null?Us:va(e,n,t.scales[s].log,!1)}const wd=tu;function nu(t,e,n,s){return e==null?Us:jo(e,n,t.scales[s].log,!1)}const bd=nu;function yd(t,e,n,s,i){let a=ut(fl(t),fl(e)),o=e-t,l=Xt(i/s*o,n);do{let u=n[l],d=s*u/o;if(d>=i&&a+(u<5?On.get(u):0)<=17)return[u,d]}while(++l<n.length);return[0,0]}function Rl(t){let e,n;return t=t.replace(/(\d+)px/,(s,i)=>(e=Ye((n=+i)*ve))+"px"),[t,e,n]}function Sd(t){t.show&&[t.font,t.labelFont].forEach(e=>{let n=Ee(e[2]*ve,1);e[0]=e[0].replace(/[0-9.]+px/,n+"px"),e[1]=n})}function Te(t,e,n){const s={mode:fe(t.mode,1)},i=s.mode;function a(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?1-g:g)}function o(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?g:1-g)}function l(r,c,p,h){return c.ori==0?a(r,c,p,h):o(r,c,p,h)}s.valToPosH=a,s.valToPosV=o;let u=!1;s.status=0;const d=s.root=Lt(zp);if(t.id!=null&&(d.id=t.id),yt(d,t.class),t.title){let r=Lt(Fp,d);r.textContent=t.title}const v=jt("canvas"),m=s.ctx=v.getContext("2d"),f=Lt(Tp,d);rs("click",f,r=>{r.target===A&&(ze!=Fs||$e!=Ts)&&tt.click(s,r)},!0);const y=s.under=Lt(Np,f);f.appendChild(v);const A=s.over=Lt($p,f);t=Ws(t);const R=+fe(t.pxAlign,1),L=Tl(R);(t.plugins||[]).forEach(r=>{r.opts&&(t=r.opts(s,t)||t)});const _=t.ms||.001,M=s.series=i==1?Il(t.series||[],Cl,Ll,!1):gd(t.series||[null],_l),O=s.axes=Il(t.axes||[],El,Pl,!0),P=s.scales={},K=s.bands=t.bands||[];K.forEach(r=>{r.fill=le(r.fill||null),r.dir=fe(r.dir,-1)});const $=i==2?M[1].facets[0].scale:M[0].scale,ee={axes:dp,series:lp},W=(t.drawOrder||["axes","series"]).map(r=>ee[r]);function se(r){const c=r.distr==3?p=>gn(p>0?p:r.clamp(s,p,r.min,r.max,r.key)):r.distr==4?p=>ao(p,r.asinh):r.distr==100?p=>r.fwd(p):p=>p;return p=>{let h=c(p),{_min:g,_max:w}=r,b=w-g;return(h-g)/b}}function J(r){let c=P[r];if(c==null){let p=(t.scales||_i)[r]||_i;if(p.from!=null){J(p.from);let h=qe({},P[p.from],p,{key:r});h.valToPct=se(h),P[r]=h}else{c=P[r]=qe({},r==$?Hc:id,p),c.key=r;let h=c.time,g=c.range,w=$n(g);if((r!=$||i==2&&!h)&&(w&&(g[0]==null||g[1]==null)&&(g={min:g[0]==null?pl:{mode:1,hard:g[0],soft:g[0]},max:g[1]==null?pl:{mode:1,hard:g[1],soft:g[1]}},w=!1),!w&&wa(g))){let b=g;g=(k,C,T)=>C==null?Us:la(C,T,b)}c.range=le(g||(h?vd:r==$?c.distr==3?wd:c.distr==4?bd:eu:c.distr==3?tu:c.distr==4?nu:xd)),c.auto=le(w?!1:c.auto),c.clamp=le(c.clamp||sd),c._min=c._max=null,c.valToPct=se(c)}}}J("x"),J("y"),i==1&&M.forEach(r=>{J(r.scale)}),O.forEach(r=>{J(r.scale)});for(let r in t.scales)J(r);const z=P[$],te=z.distr;let B,Z;z.ori==0?(yt(d,_p),B=a,Z=o):(yt(d,Lp),B=o,Z=a);const V={};for(let r in P){let c=P[r];(c.min!=null||c.max!=null)&&(V[r]={min:c.min,max:c.max},c.min=c.max=null)}const oe=t.tzDate||(r=>new Date(Ye(r/_))),H=t.fmtDate||Go,st=_==1?_h(oe):Th(oe),ye=Sl(oe,yl(_==1?zh:Fh,H)),ce=Ml(oe,kl($h,H)),me=[],ie=s.legend=qe({},Oh,t.legend),Y=s.cursor=qe({},Hh,{drag:{y:i==2}},t.cursor),Se=ie.show,Ue=Y.show,Ce=ie.markers;ie.idxs=me,Ce.width=le(Ce.width),Ce.dash=le(Ce.dash),Ce.stroke=le(Ce.stroke),Ce.fill=le(Ce.fill);let he,F,S,E=[],q=[],ke,ue=!1,Ie={};if(ie.live){const r=M[1]?M[1].values:null;ue=r!=null,ke=ue?r(s,1,0):{_:0};for(let c in ke)Ie[c]=Yo}if(Se)if(he=jt("table",qp,d),S=jt("tbody",null,he),ie.mount(s,he),ue){F=jt("thead",null,he,S);let r=jt("tr",null,F);jt("th",null,r);for(var pt in ke)jt("th",Jr,r).textContent=pt}else yt(he,Yp),ie.live&&yt(he,Vp);const It={show:!0},Qt={show:!1};function Vi(r,c){if(c==0&&(ue||!ie.live||i==2))return Us;let p=[],h=jt("tr",Hp,S,S.childNodes[c]);yt(h,r.class),r.show||yt(h,as);let g=jt("th",null,h);if(Ce.show){let k=Lt(jp,g);if(c>0){let C=Ce.width(s,c);C&&(k.style.border=C+"px "+Ce.dash(s,c)+" "+Ce.stroke(s,c)),k.style.background=Ce.fill(s,c)}}let w=Lt(Jr,g);r.label instanceof HTMLElement?w.appendChild(r.label):w.textContent=r.label,c>0&&(Ce.show||(w.style.color=r.width>0?Ce.stroke(s,c):Ce.fill(s,c)),ot("click",g,k=>{if(Y._lock)return;Jn(k);let C=M.indexOf(r);if((k.ctrlKey||k.metaKey)!=ie.isolate){let T=M.some((N,D)=>D>0&&D!=C&&N.show);M.forEach((N,D)=>{D>0&&nn(D,T?D==C?It:Qt:It,!0,Be.setSeries)})}else nn(C,{show:!r.show},!0,Be.setSeries)},!1),ks&&ot(nl,g,k=>{Y._lock||(Jn(k),nn(M.indexOf(r),$s,!0,Be.setSeries))},!1));for(var b in ke){let k=jt("td",Xp,h);k.textContent="--",p.push(k)}return[h,p]}const Un=new Map;function ot(r,c,p,h=!0){const g=Un.get(c)||{},w=Y.bind[r](s,c,p,h);w&&(rs(r,c,g[r]=w),Un.set(c,g))}function bs(r,c,p){const h=Un.get(c)||{};for(let g in h)(r==null||g==r)&&(So(g,c,h[g]),delete h[g]);r==null&&Un.delete(c)}let un=0,Wn=0,ne=0,I=0,Ae=0,Ve=0,ys=Ae,Gn=Ve,en=ne,Kn=I,vt=0,Ct=0,ht=0,Rt=0;s.bbox={};let Ta=!1,Yi=!1,Ss=!1,Zn=!1,Hi=!1,At=!1;function Na(r,c,p){(p||r!=s.width||c!=s.height)&&Sr(r,c),Ps(!1),Ss=!0,Yi=!0,zs()}function Sr(r,c){s.width=un=ne=r,s.height=Wn=I=c,Ae=Ve=0,tp(),np();let p=s.bbox;vt=p.left=ss(Ae*ve,.5),Ct=p.top=ss(Ve*ve,.5),ht=p.width=ss(ne*ve,.5),Rt=p.height=ss(I*ve,.5)}const Ju=3;function Qu(){let r=!1,c=0;for(;!r;){c++;let p=pp(c),h=hp(c);r=c==Ju||p&&h,r||(Sr(s.width,s.height),Yi=!0)}}function ep({width:r,height:c}){Na(r,c)}s.setSize=ep;function tp(){let r=!1,c=!1,p=!1,h=!1;O.forEach((g,w)=>{if(g.show&&g._show){let{side:b,_size:k}=g,C=b%2,T=g.label!=null?g.labelSize:0,N=k+T;N>0&&(C?(ne-=N,b==3?(Ae+=N,h=!0):p=!0):(I-=N,b==0?(Ve+=N,r=!0):c=!0))}}),Qn[0]=r,Qn[1]=p,Qn[2]=c,Qn[3]=h,ne-=Pn[1]+Pn[3],Ae+=Pn[3],I-=Pn[2]+Pn[0],Ve+=Pn[0]}function np(){let r=Ae+ne,c=Ve+I,p=Ae,h=Ve;function g(w,b){switch(w){case 1:return r+=b,r-b;case 2:return c+=b,c-b;case 3:return p-=b,p+b;case 0:return h-=b,h+b}}O.forEach((w,b)=>{if(w.show&&w._show){let k=w.side;w._pos=g(k,w._size),w.label!=null&&(w._lpos=g(k,w.labelSize))}})}if(Y.dataIdx==null){let r=Y.hover,c=r.skip=new Set(r.skip??[]);c.add(void 0);let p=r.prox=le(r.prox),h=r.bias??=0;Y.dataIdx=(g,w,b,k)=>{if(w==0)return b;let C=b,T=p(g,w,b,k)??Me,N=T>=0&&T<Me,D=z.ori==0?ne:I,Q=Y.left,ge=e[0],de=e[w];if(c.has(de[b])){C=null;let re=null,G=null,j;if(h==0||h==-1)for(j=b;re==null&&j-- >0;)c.has(de[j])||(re=j);if(h==0||h==1)for(j=b;G==null&&j++<de.length;)c.has(de[j])||(G=j);if(re!=null||G!=null)if(N){let Le=re==null?-1/0:B(ge[re],z,D,0),Re=G==null?1/0:B(ge[G],z,D,0),Qe=Q-Le,be=Re-Q;Qe<=be?Qe<=T&&(C=re):be<=T&&(C=G)}else C=G==null?re:re==null?G:b-re<=G-b?re:G}else N&&He(Q-B(ge[b],z,D,0))>T&&(C=null);return C}}const Jn=r=>{Y.event=r};Y.idxs=me,Y._lock=!1;let it=Y.points;it.show=le(it.show),it.size=le(it.size),it.stroke=le(it.stroke),it.width=le(it.width),it.fill=le(it.fill);const tn=s.focus=qe({},t.focus||{alpha:.3},Y.focus),ks=tn.prox>=0,Ms=ks&&it.one;let Pt=[],Es=[],Cs=[];function kr(r,c){let p=it.show(s,c);if(p instanceof HTMLElement)return yt(p,Bp),yt(p,r.class),rn(p,-10,-10,ne,I),A.insertBefore(p,Pt[c]),p}function Mr(r,c){if(i==1||c>0){let p=i==1&&P[r.scale].time,h=r.value;r.value=p?vl(h)?Ml(oe,kl(h,H)):h||ce:h||ed,r.label=r.label||(p?Xh:jh)}if(Ms||c>0){r.width=r.width==null?1:r.width,r.paths=r.paths||fd||ih,r.fillTo=le(r.fillTo||ad),r.pxAlign=+fe(r.pxAlign,R),r.pxRound=Tl(r.pxAlign),r.stroke=le(r.stroke||null),r.fill=le(r.fill||null),r._stroke=r._fill=r._paths=r._focus=null;let p=td(ut(1,r.width),1),h=r.points=qe({},{size:p,width:ut(1,p*.2),stroke:r.stroke,space:p*2,paths:md,_stroke:null,_fill:null},r.points);h.show=le(h.show),h.filter=le(h.filter),h.fill=le(h.fill),h.stroke=le(h.stroke),h.paths=le(h.paths),h.pxAlign=r.pxAlign}if(Se){let p=Vi(r,c);E.splice(c,0,p[0]),q.splice(c,0,p[1]),ie.values.push(null)}if(Ue){me.splice(c,0,null);let p=null;Ms?c==0&&(p=kr(r,c)):c>0&&(p=kr(r,c)),Pt.splice(c,0,p),Es.splice(c,0,0),Cs.splice(c,0,0)}Je("addSeries",c)}function sp(r,c){c=c??M.length,r=i==1?Po(r,c,Cl,Ll):Po(r,c,{},_l),M.splice(c,0,r),Mr(M[c],c)}s.addSeries=sp;function ip(r){if(M.splice(r,1),Se){ie.values.splice(r,1),q.splice(r,1);let c=E.splice(r,1)[0];bs(null,c.firstChild),c.remove()}Ue&&(me.splice(r,1),Pt.splice(r,1)[0].remove(),Es.splice(r,1),Cs.splice(r,1)),Je("delSeries",r)}s.delSeries=ip;const Qn=[!1,!1,!1,!1];function ap(r,c){if(r._show=r.show,r.show){let p=r.side%2,h=P[r.scale];h==null&&(r.scale=p?M[1].scale:$,h=P[r.scale]);let g=h.time;r.size=le(r.size),r.space=le(r.space),r.rotate=le(r.rotate),$n(r.incrs)&&r.incrs.forEach(b=>{!On.has(b)&&On.set(b,Ec(b))}),r.incrs=le(r.incrs||(h.distr==2?Ch:g?_==1?Ph:Lh:is)),r.splits=le(r.splits||(g&&h.distr==1?st:h.distr==3?Mo:h.distr==4?Gh:Wh)),r.stroke=le(r.stroke),r.grid.stroke=le(r.grid.stroke),r.ticks.stroke=le(r.ticks.stroke),r.border.stroke=le(r.border.stroke);let w=r.values;r.values=$n(w)&&!$n(w[0])?le(w):g?$n(w)?Sl(oe,yl(w,H)):vl(w)?Nh(oe,w):w||ye:w||Uh,r.filter=le(r.filter||(h.distr>=3&&h.log==10?Jh:h.distr==3&&h.log==2?Qh:kc)),r.font=Rl(r.font),r.labelFont=Rl(r.labelFont),r._size=r.size(s,null,c,0),r._space=r._rotate=r._incrs=r._found=r._splits=r._values=null,r._size>0&&(Qn[c]=!0,r._el=Lt(Ip,f))}}function pi(r,c,p,h){let[g,w,b,k]=p,C=c%2,T=0;return C==0&&(k||w)&&(T=c==0&&!g||c==2&&!b?Ye(El.size/3):0),C==1&&(g||b)&&(T=c==1&&!w||c==3&&!k?Ye(Pl.size/2):0),T}const Er=s.padding=(t.padding||[pi,pi,pi,pi]).map(r=>le(fe(r,pi))),Pn=s._padding=Er.map((r,c)=>r(s,c,Qn,0));let et,We=null,Ge=null;const ji=i==1?M[0].idxs:null;let Ot=null,hi=!1;function Cr(r,c){if(e=r??[],s.data=s._data=e,i==2){et=0;for(let p=1;p<M.length;p++)et+=e[p][0].length}else{e.length==0&&(s.data=s._data=e=[[]]),Ot=e[0],et=Ot.length;let p=e;if(te==2){p=e.slice();let h=p[0]=Array(et);for(let g=0;g<et;g++)h[g]=g}s._data=e=p}if(Ps(!0),Je("setData"),te==2&&(Ss=!0),c!==!1){let p=z;p.auto(s,hi)?$a():_n($,p.min,p.max),Zn=Zn||Y.left>=0,At=!0,zs()}}s.setData=Cr;function $a(){hi=!0;let r,c;i==1&&(et>0?(We=ji[0]=0,Ge=ji[1]=et-1,r=e[0][We],c=e[0][Ge],te==2?(r=We,c=Ge):r==c&&(te==3?[r,c]=va(r,r,z.log,!1):te==4?[r,c]=jo(r,r,z.log,!1):z.time?c=r+Ye(86400/_):[r,c]=la(r,c,Xo,!0))):(We=ji[0]=r=null,Ge=ji[1]=c=null)),_n($,r,c)}let Xi,As,Ia,Ra,Oa,Da,Ba,qa,Va,dt;function Ar(r,c,p,h,g,w){r??=el,p??=Wo,h??="butt",g??=el,w??="round",r!=Xi&&(m.strokeStyle=Xi=r),g!=As&&(m.fillStyle=As=g),c!=Ia&&(m.lineWidth=Ia=c),w!=Oa&&(m.lineJoin=Oa=w),h!=Da&&(m.lineCap=Da=h),p!=Ra&&m.setLineDash(Ra=p)}function Pr(r,c,p,h){c!=As&&(m.fillStyle=As=c),r!=Ba&&(m.font=Ba=r),p!=qa&&(m.textAlign=qa=p),h!=Va&&(m.textBaseline=Va=h)}function Ya(r,c,p,h,g=0){if(h.length>0&&r.auto(s,hi)&&(c==null||c.min==null)){let w=fe(We,0),b=fe(Ge,h.length-1),k=p.min==null?Jp(h,w,b,g,r.distr==3):[p.min,p.max];r.min=Ut(r.min,p.min=k[0]),r.max=ut(r.max,p.max=k[1])}}const zr={min:null,max:null};function op(){for(let h in P){let g=P[h];V[h]==null&&(g.min==null||V[$]!=null&&g.auto(s,hi))&&(V[h]=zr)}for(let h in P){let g=P[h];V[h]==null&&g.from!=null&&V[g.from]!=null&&(V[h]=zr)}V[$]!=null&&Ps(!0);let r={};for(let h in V){let g=V[h];if(g!=null){let w=r[h]=Ws(P[h],rh);if(g.min!=null)qe(w,g);else if(h!=$||i==2)if(et==0&&w.from==null){let b=w.range(s,null,null,h);w.min=b[0],w.max=b[1]}else w.min=Me,w.max=-Me}}if(et>0){M.forEach((h,g)=>{if(i==1){let w=h.scale,b=V[w];if(b==null)return;let k=r[w];if(g==0){let C=k.range(s,k.min,k.max,w);k.min=C[0],k.max=C[1],We=Xt(k.min,e[0]),Ge=Xt(k.max,e[0]),Ge-We>1&&(e[0][We]<k.min&&We++,e[0][Ge]>k.max&&Ge--),h.min=Ot[We],h.max=Ot[Ge]}else h.show&&h.auto&&Ya(k,b,h,e[g],h.sorted);h.idxs[0]=We,h.idxs[1]=Ge}else if(g>0&&h.show&&h.auto){let[w,b]=h.facets,k=w.scale,C=b.scale,[T,N]=e[g],D=r[k],Q=r[C];D!=null&&Ya(D,V[k],w,T,w.sorted),Q!=null&&Ya(Q,V[C],b,N,b.sorted),h.min=b.min,h.max=b.max}});for(let h in r){let g=r[h],w=V[h];if(g.from==null&&(w==null||w.min==null)){let b=g.range(s,g.min==Me?null:g.min,g.max==-Me?null:g.max,h);g.min=b[0],g.max=b[1]}}}for(let h in r){let g=r[h];if(g.from!=null){let w=r[g.from];if(w.min==null)g.min=g.max=null;else{let b=g.range(s,w.min,w.max,h);g.min=b[0],g.max=b[1]}}}let c={},p=!1;for(let h in r){let g=r[h],w=P[h];if(w.min!=g.min||w.max!=g.max){w.min=g.min,w.max=g.max;let b=w.distr;w._min=b==3?gn(w.min):b==4?ao(w.min,w.asinh):b==100?w.fwd(w.min):w.min,w._max=b==3?gn(w.max):b==4?ao(w.max,w.asinh):b==100?w.fwd(w.max):w.max,c[h]=p=!0}}if(p){M.forEach((h,g)=>{i==2?g>0&&c.y&&(h._paths=null):c[h.scale]&&(h._paths=null)});for(let h in c)Ss=!0,Je("setScale",h);Ue&&Y.left>=0&&(Zn=At=!0)}for(let h in V)V[h]=null}function rp(r){let c=ko(We-1,0,et-1),p=ko(Ge+1,0,et-1);for(;r[c]==null&&c>0;)c--;for(;r[p]==null&&p<et-1;)p++;return[c,p]}function lp(){if(et>0){let r=M.some(c=>c._focus)&&dt!=tn.alpha;r&&(m.globalAlpha=dt=tn.alpha),M.forEach((c,p)=>{if(p>0&&c.show&&(_r(p,!1),_r(p,!0),c._paths==null)){let h=dt;dt!=c.alpha&&(m.globalAlpha=dt=c.alpha);let g=i==2?[0,e[p][0].length-1]:rp(e[p]);c._paths=c.paths(s,p,g[0],g[1]),dt!=h&&(m.globalAlpha=dt=h)}}),M.forEach((c,p)=>{if(p>0&&c.show){let h=dt;dt!=c.alpha&&(m.globalAlpha=dt=c.alpha),c._paths!=null&&Lr(p,!1);{let g=c._paths!=null?c._paths.gaps:null,w=c.points.show(s,p,We,Ge,g),b=c.points.filter(s,p,w,g);(w||b)&&(c.points._paths=c.points.paths(s,p,We,Ge,b),Lr(p,!0))}dt!=h&&(m.globalAlpha=dt=h),Je("drawSeries",p)}}),r&&(m.globalAlpha=dt=1)}}function _r(r,c){let p=c?M[r].points:M[r];p._stroke=p.stroke(s,r),p._fill=p.fill(s,r)}function Lr(r,c){let p=c?M[r].points:M[r],{stroke:h,fill:g,clip:w,flags:b,_stroke:k=p._stroke,_fill:C=p._fill,_width:T=p.width}=p._paths;T=Ee(T*ve,3);let N=null,D=T%2/2;c&&C==null&&(C=T>0?"#fff":k);let Q=p.pxAlign==1&&D>0;if(Q&&m.translate(D,D),!c){let ge=vt-T/2,de=Ct-T/2,re=ht+T,G=Rt+T;N=new Path2D,N.rect(ge,de,re,G)}c?Ha(k,T,p.dash,p.cap,C,h,g,b,w):cp(r,k,T,p.dash,p.cap,C,h,g,b,N,w),Q&&m.translate(-D,-D)}function cp(r,c,p,h,g,w,b,k,C,T,N){let D=!1;C!=0&&K.forEach((Q,ge)=>{if(Q.series[0]==r){let de=M[Q.series[1]],re=e[Q.series[1]],G=(de._paths||_i).band;$n(G)&&(G=Q.dir==1?G[0]:G[1]);let j,Le=null;de.show&&G&&eh(re,We,Ge)?(Le=Q.fill(s,ge)||w,j=de._paths.clip):G=null,Ha(c,p,h,g,Le,b,k,C,T,N,j,G),D=!0}}),D||Ha(c,p,h,g,w,b,k,C,T,N)}const Fr=Gs|Co;function Ha(r,c,p,h,g,w,b,k,C,T,N,D){Ar(r,c,p,h,g),(C||T||D)&&(m.save(),C&&m.clip(C),T&&m.clip(T)),D?(k&Fr)==Fr?(m.clip(D),N&&m.clip(N),Wi(g,b),Ui(r,w,c)):k&Co?(Wi(g,b),m.clip(D),Ui(r,w,c)):k&Gs&&(m.save(),m.clip(D),N&&m.clip(N),Wi(g,b),m.restore(),Ui(r,w,c)):(Wi(g,b),Ui(r,w,c)),(C||T||D)&&m.restore()}function Ui(r,c,p){p>0&&(c instanceof Map?c.forEach((h,g)=>{m.strokeStyle=Xi=g,m.stroke(h)}):c!=null&&r&&m.stroke(c))}function Wi(r,c){c instanceof Map?c.forEach((p,h)=>{m.fillStyle=As=h,m.fill(p)}):c!=null&&r&&m.fill(c)}function up(r,c,p,h){let g=O[r],w;if(h<=0)w=[0,0];else{let b=g._space=g.space(s,r,c,p,h),k=g._incrs=g.incrs(s,r,c,p,h,b);w=yd(c,p,k,h,b)}return g._found=w}function ja(r,c,p,h,g,w,b,k,C,T){let N=b%2/2;R==1&&m.translate(N,N),Ar(k,b,C,T,k),m.beginPath();let D,Q,ge,de,re=g+(h==0||h==3?-w:w);p==0?(Q=g,de=re):(D=g,ge=re);for(let G=0;G<r.length;G++)c[G]!=null&&(p==0?D=ge=r[G]:Q=de=r[G],m.moveTo(D,Q),m.lineTo(ge,de));m.stroke(),R==1&&m.translate(-N,-N)}function pp(r){let c=!0;return O.forEach((p,h)=>{if(!p.show)return;let g=P[p.scale];if(g.min==null){p._show&&(c=!1,p._show=!1,Ps(!1));return}else p._show||(c=!1,p._show=!0,Ps(!1));let w=p.side,b=w%2,{min:k,max:C}=g,[T,N]=up(h,k,C,b==0?ne:I);if(N==0)return;let D=g.distr==2,Q=p._splits=p.splits(s,h,k,C,T,N,D),ge=g.distr==2?Q.map(j=>Ot[j]):Q,de=g.distr==2?Ot[Q[1]]-Ot[Q[0]]:T,re=p._values=p.values(s,p.filter(s,ge,h,N,de),h,N,de);p._rotate=w==2?p.rotate(s,re,h,N):0;let G=p._size;p._size=Tt(p.size(s,re,h,r)),G!=null&&p._size!=G&&(c=!1)}),c}function hp(r){let c=!0;return Er.forEach((p,h)=>{let g=p(s,h,Qn,r);g!=Pn[h]&&(c=!1),Pn[h]=g}),c}function dp(){for(let r=0;r<O.length;r++){let c=O[r];if(!c.show||!c._show)continue;let p=c.side,h=p%2,g,w,b=c.stroke(s,r),k=p==0||p==3?-1:1,[C,T]=c._found;if(c.label!=null){let lt=c.labelGap*k,bt=Ye((c._lpos+lt)*ve);Pr(c.labelFont[0],b,"center",p==2?xi:Qr),m.save(),h==1?(g=w=0,m.translate(bt,Ye(Ct+Rt/2)),m.rotate((p==3?-aa:aa)/2)):(g=Ye(vt+ht/2),w=bt);let ns=yc(c.label)?c.label(s,r,C,T):c.label;m.fillText(ns,g,w),m.restore()}if(T==0)continue;let N=P[c.scale],D=h==0?ht:Rt,Q=h==0?vt:Ct,ge=c._splits,de=N.distr==2?ge.map(lt=>Ot[lt]):ge,re=N.distr==2?Ot[ge[1]]-Ot[ge[0]]:C,G=c.ticks,j=c.border,Le=G.show?G.size:0,Re=Ye(Le*ve),Qe=Ye((c.alignTo==2?c._size-Le-c.gap:c.gap)*ve),be=c._rotate*-aa/180,Oe=L(c._pos*ve),xt=(Re+Qe)*k,rt=Oe+xt;w=h==0?rt:0,g=h==1?rt:0;let zt=c.font[0],Dt=c.align==1?Rs:c.align==2?no:be>0?Rs:be<0?no:h==0?"center":p==3?no:Rs,an=be||h==1?"middle":p==2?xi:Qr;Pr(zt,b,Dt,an);let wt=c.font[1]*c.lineGap,_t=ge.map(lt=>L(l(lt,N,D,Q))),Bt=c._values;for(let lt=0;lt<Bt.length;lt++){let bt=Bt[lt];if(bt!=null){h==0?g=_t[lt]:w=_t[lt],bt=""+bt;let ns=bt.indexOf(`
`)==-1?[bt]:bt.split(/\n/gm);for(let ct=0;ct<ns.length;ct++){let Zr=ns[ct];be?(m.save(),m.translate(g,w+ct*wt),m.rotate(be),m.fillText(Zr,0,0),m.restore()):m.fillText(Zr,g,w+ct*wt)}}}G.show&&ja(_t,G.filter(s,de,r,T,re),h,p,Oe,Re,Ee(G.width*ve,3),G.stroke(s,r),G.dash,G.cap);let on=c.grid;on.show&&ja(_t,on.filter(s,de,r,T,re),h,h==0?2:1,h==0?Ct:vt,h==0?Rt:ht,Ee(on.width*ve,3),on.stroke(s,r),on.dash,on.cap),j.show&&ja([Oe],[1],h==0?1:0,h==0?1:2,h==1?Ct:vt,h==1?Rt:ht,Ee(j.width*ve,3),j.stroke(s,r),j.dash,j.cap)}Je("drawAxes")}function Ps(r){M.forEach((c,p)=>{p>0&&(c._paths=null,r&&(i==1?(c.min=null,c.max=null):c.facets.forEach(h=>{h.min=null,h.max=null})))})}let Gi=!1,Xa=!1,di=[];function fp(){Xa=!1;for(let r=0;r<di.length;r++)Je(...di[r]);di.length=0}function zs(){Gi||(fh(Tr),Gi=!0)}function mp(r,c=!1){Gi=!0,Xa=c,r(s),Tr(),c&&di.length>0&&queueMicrotask(fp)}s.batch=mp;function Tr(){if(Ta&&(op(),Ta=!1),Ss&&(Qu(),Ss=!1),Yi){if(Fe(y,Rs,Ae),Fe(y,xi,Ve),Fe(y,Si,ne),Fe(y,ki,I),Fe(A,Rs,Ae),Fe(A,xi,Ve),Fe(A,Si,ne),Fe(A,ki,I),Fe(f,Si,un),Fe(f,ki,Wn),v.width=Ye(un*ve),v.height=Ye(Wn*ve),O.forEach(({_el:r,_show:c,_size:p,_pos:h,side:g})=>{if(r!=null)if(c){let w=g===3||g===0?p:0,b=g%2==1;Fe(r,b?"left":"top",h-w),Fe(r,b?"width":"height",p),Fe(r,b?"top":"left",b?Ve:Ae),Fe(r,b?"height":"width",b?I:ne),yo(r,as)}else yt(r,as)}),Xi=As=Ia=Oa=Da=Ba=qa=Va=Ra=null,dt=1,gi(!0),Ae!=ys||Ve!=Gn||ne!=en||I!=Kn){Ps(!1);let r=ne/en,c=I/Kn;if(Ue&&!Zn&&Y.left>=0){Y.left*=r,Y.top*=c,_s&&rn(_s,Ye(Y.left),0,ne,I),Ls&&rn(Ls,0,Ye(Y.top),ne,I);for(let p=0;p<Pt.length;p++){let h=Pt[p];h!=null&&(Es[p]*=r,Cs[p]*=c,rn(h,Tt(Es[p]),Tt(Cs[p]),ne,I))}}if(_e.show&&!Hi&&_e.left>=0&&_e.width>0){_e.left*=r,_e.width*=r,_e.top*=c,_e.height*=c;for(let p in Ja)Fe(Ns,p,_e[p])}ys=Ae,Gn=Ve,en=ne,Kn=I}Je("setSize"),Yi=!1}un>0&&Wn>0&&(m.clearRect(0,0,v.width,v.height),Je("drawClear"),W.forEach(r=>r()),Je("draw")),_e.show&&Hi&&(Ki(_e),Hi=!1),Ue&&Zn&&(ts(null,!0,!1),Zn=!1),ie.show&&ie.live&&At&&(Ka(),At=!1),u||(u=!0,s.status=1,Je("ready")),hi=!1,Gi=!1}s.redraw=(r,c)=>{Ss=c||!1,r!==!1?_n($,z.min,z.max):zs()};function Ua(r,c){let p=P[r];if(p.from==null){if(et==0){let h=p.range(s,c.min,c.max,r);c.min=h[0],c.max=h[1]}if(c.min>c.max){let h=c.min;c.min=c.max,c.max=h}if(et>1&&c.min!=null&&c.max!=null&&c.max-c.min<1e-16)return;r==$&&p.distr==2&&et>0&&(c.min=Xt(c.min,e[0]),c.max=Xt(c.max,e[0]),c.min==c.max&&c.max++),V[r]=c,Ta=!0,zs()}}s.setScale=Ua;let Wa,Ga,_s,Ls,Nr,$r,Fs,Ts,Ir,Rr,ze,$e,zn=!1;const tt=Y.drag;let Ke=tt.x,Ze=tt.y;Ue&&(Y.x&&(Wa=Lt(Op,A)),Y.y&&(Ga=Lt(Dp,A)),z.ori==0?(_s=Wa,Ls=Ga):(_s=Ga,Ls=Wa),ze=Y.left,$e=Y.top);const _e=s.select=qe({show:!0,over:!0,left:0,width:0,top:0,height:0},t.select),Ns=_e.show?Lt(Rp,_e.over?A:y):null;function Ki(r,c){if(_e.show){for(let p in r)_e[p]=r[p],p in Ja&&Fe(Ns,p,r[p]);c!==!1&&Je("setSelect")}}s.setSelect=Ki;function gp(r){if(M[r].show)Se&&yo(E[r],as);else if(Se&&yt(E[r],as),Ue){let p=Ms?Pt[0]:Pt[r];p!=null&&rn(p,-10,-10,ne,I)}}function _n(r,c,p){Ua(r,{min:c,max:p})}function nn(r,c,p,h){c.focus!=null&&yp(r),c.show!=null&&M.forEach((g,w)=>{w>0&&(r==w||r==null)&&(g.show=c.show,gp(w),i==2?(_n(g.facets[0].scale,null,null),_n(g.facets[1].scale,null,null)):_n(g.scale,null,null),zs())}),p!==!1&&Je("setSeries",r,c),h&&vi("setSeries",s,r,c)}s.setSeries=nn;function vp(r,c){qe(K[r],c)}function xp(r,c){r.fill=le(r.fill||null),r.dir=fe(r.dir,-1),c=c??K.length,K.splice(c,0,r)}function wp(r){r==null?K.length=0:K.splice(r,1)}s.addBand=xp,s.setBand=vp,s.delBand=wp;function bp(r,c){M[r].alpha=c,Ue&&Pt[r]!=null&&(Pt[r].style.opacity=c),Se&&E[r]&&(E[r].style.opacity=c)}let pn,Ln,es;const $s={focus:!0};function yp(r){if(r!=es){let c=r==null,p=tn.alpha!=1;M.forEach((h,g)=>{if(i==1||g>0){let w=c||g==0||g==r;h._focus=c?null:w,p&&bp(g,w?1:tn.alpha)}}),es=r,p&&zs()}}Se&&ks&&ot(sl,he,r=>{Y._lock||(Jn(r),es!=null&&nn(null,$s,!0,Be.setSeries))});function sn(r,c,p){let h=P[c];p&&(r=r/ve-(h.ori==1?Ve:Ae));let g=ne;h.ori==1&&(g=I,r=g-r),h.dir==-1&&(r=g-r);let w=h._min,b=h._max,k=r/g,C=w+(b-w)*k,T=h.distr;return T==3?Xs(10,C):T==4?nh(C,h.asinh):T==100?h.bwd(C):C}function Sp(r,c){let p=sn(r,$,c);return Xt(p,e[0],We,Ge)}s.valToIdx=r=>Xt(r,e[0]),s.posToIdx=Sp,s.posToVal=sn,s.valToPos=(r,c,p)=>P[c].ori==0?a(r,P[c],p?ht:ne,p?vt:0):o(r,P[c],p?Rt:I,p?Ct:0),s.setCursor=(r,c,p)=>{ze=r.left,$e=r.top,ts(null,c,p)};function Or(r,c){Fe(Ns,Rs,_e.left=r),Fe(Ns,Si,_e.width=c)}function Dr(r,c){Fe(Ns,xi,_e.top=r),Fe(Ns,ki,_e.height=c)}let fi=z.ori==0?Or:Dr,mi=z.ori==1?Or:Dr;function kp(){if(Se&&ie.live)for(let r=i==2?1:0;r<M.length;r++){if(r==0&&ue)continue;let c=ie.values[r],p=0;for(let h in c)q[r][p++].firstChild.nodeValue=c[h]}}function Ka(r,c){if(r!=null&&(r.idxs?r.idxs.forEach((p,h)=>{me[h]=p}):oh(r.idx)||me.fill(r.idx),ie.idx=me[0]),Se&&ie.live){for(let p=0;p<M.length;p++)(p>0||i==1&&!ue)&&Mp(p,me[p]);kp()}At=!1,c!==!1&&Je("setLegend")}s.setLegend=Ka;function Mp(r,c){let p=M[r],h=r==0&&te==2?Ot:e[r],g;ue?g=p.values(s,r,c)??Ie:(g=p.value(s,c==null?null:h[c],r,c),g=g==null?Ie:{_:g}),ie.values[r]=g}function ts(r,c,p){Ir=ze,Rr=$e,[ze,$e]=Y.move(s,ze,$e),Y.left=ze,Y.top=$e,Ue&&(_s&&rn(_s,Ye(ze),0,ne,I),Ls&&rn(Ls,0,Ye($e),ne,I));let h,g=We>Ge;pn=Me,Ln=null;let w=z.ori==0?ne:I,b=z.ori==1?ne:I;if(ze<0||et==0||g){h=Y.idx=null;for(let k=0;k<M.length;k++){let C=Pt[k];C!=null&&rn(C,-10,-10,ne,I)}ks&&nn(null,$s,!0,r==null&&Be.setSeries),ie.live&&(me.fill(h),At=!0)}else{let k,C,T;i==1&&(k=z.ori==0?ze:$e,C=sn(k,$),h=Y.idx=Xt(C,e[0],We,Ge),T=B(e[0][h],z,w,0));let N=-10,D=-10,Q=0,ge=0,de=!0,re="",G="";for(let j=i==2?1:0;j<M.length;j++){let Le=M[j],Re=me[j],Qe=Re==null?null:i==1?e[j][Re]:e[j][1][Re],be=Y.dataIdx(s,j,h,C),Oe=be==null?null:i==1?e[j][be]:e[j][1][be];if(At=At||Oe!=Qe||be!=Re,me[j]=be,j>0&&Le.show){let xt=be==null?-10:be==h?T:B(i==1?e[0][be]:e[j][0][be],z,w,0),rt=Oe==null?-10:Z(Oe,i==1?P[Le.scale]:P[Le.facets[1].scale],b,0);if(ks&&Oe!=null){let zt=z.ori==1?ze:$e,Dt=He(tn.dist(s,j,be,rt,zt));if(Dt<pn){let an=tn.bias;if(an!=0){let wt=sn(zt,Le.scale),_t=Oe>=0?1:-1,Bt=wt>=0?1:-1;Bt==_t&&(Bt==1?an==1?Oe>=wt:Oe<=wt:an==1?Oe<=wt:Oe>=wt)&&(pn=Dt,Ln=j)}else pn=Dt,Ln=j}}if(At||Ms){let zt,Dt;z.ori==0?(zt=xt,Dt=rt):(zt=rt,Dt=xt);let an,wt,_t,Bt,on,lt,bt=!0,ns=it.bbox;if(ns!=null){bt=!1;let ct=ns(s,j);_t=ct.left,Bt=ct.top,an=ct.width,wt=ct.height}else _t=zt,Bt=Dt,an=wt=it.size(s,j);if(lt=it.fill(s,j),on=it.stroke(s,j),Ms)j==Ln&&pn<=tn.prox&&(N=_t,D=Bt,Q=an,ge=wt,de=bt,re=lt,G=on);else{let ct=Pt[j];ct!=null&&(Es[j]=_t,Cs[j]=Bt,ul(ct,an,wt,bt),ll(ct,lt,on),rn(ct,Tt(_t),Tt(Bt),ne,I))}}}}if(Ms){let j=tn.prox,Le=es==null?pn<=j:pn>j||Ln!=es;if(At||Le){let Re=Pt[0];Re!=null&&(Es[0]=N,Cs[0]=D,ul(Re,Q,ge,de),ll(Re,re,G),rn(Re,Tt(N),Tt(D),ne,I))}}}if(_e.show&&zn)if(r!=null){let[k,C]=Be.scales,[T,N]=Be.match,[D,Q]=r.cursor.sync.scales,ge=r.cursor.drag;if(Ke=ge._x,Ze=ge._y,Ke||Ze){let{left:de,top:re,width:G,height:j}=r.select,Le=r.scales[D].ori,Re=r.posToVal,Qe,be,Oe,xt,rt,zt=k!=null&&T(k,D),Dt=C!=null&&N(C,Q);zt&&Ke?(Le==0?(Qe=de,be=G):(Qe=re,be=j),Oe=P[k],xt=B(Re(Qe,D),Oe,w,0),rt=B(Re(Qe+be,D),Oe,w,0),fi(Ut(xt,rt),He(rt-xt))):fi(0,w),Dt&&Ze?(Le==1?(Qe=de,be=G):(Qe=re,be=j),Oe=P[C],xt=Z(Re(Qe,Q),Oe,b,0),rt=Z(Re(Qe+be,Q),Oe,b,0),mi(Ut(xt,rt),He(rt-xt))):mi(0,b)}else Qa()}else{let k=He(Ir-Nr),C=He(Rr-$r);if(z.ori==1){let Q=k;k=C,C=Q}Ke=tt.x&&k>=tt.dist,Ze=tt.y&&C>=tt.dist;let T=tt.uni;T!=null?Ke&&Ze&&(Ke=k>=T,Ze=C>=T,!Ke&&!Ze&&(C>k?Ze=!0:Ke=!0)):tt.x&&tt.y&&(Ke||Ze)&&(Ke=Ze=!0);let N,D;Ke&&(z.ori==0?(N=Fs,D=ze):(N=Ts,D=$e),fi(Ut(N,D),He(D-N)),Ze||mi(0,b)),Ze&&(z.ori==1?(N=Fs,D=ze):(N=Ts,D=$e),mi(Ut(N,D),He(D-N)),Ke||fi(0,w)),!Ke&&!Ze&&(fi(0,0),mi(0,0))}if(tt._x=Ke,tt._y=Ze,r==null){if(p){if(Kr!=null){let[k,C]=Be.scales;Be.values[0]=k!=null?sn(z.ori==0?ze:$e,k):null,Be.values[1]=C!=null?sn(z.ori==1?ze:$e,C):null}vi(so,s,ze,$e,ne,I,h)}if(ks){let k=p&&Be.setSeries,C=tn.prox;es==null?pn<=C&&nn(Ln,$s,!0,k):pn>C?nn(null,$s,!0,k):Ln!=es&&nn(Ln,$s,!0,k)}}At&&(ie.idx=h,Ka()),c!==!1&&Je("setCursor")}let Fn=null;Object.defineProperty(s,"rect",{get(){return Fn==null&&gi(!1),Fn}});function gi(r=!1){r?Fn=null:(Fn=A.getBoundingClientRect(),Je("syncRect",Fn))}function Br(r,c,p,h,g,w,b){Y._lock||zn&&r!=null&&r.movementX==0&&r.movementY==0||(Za(r,c,p,h,g,w,b,!1,r!=null),r!=null?ts(null,!0,!0):ts(c,!0,!1))}function Za(r,c,p,h,g,w,b,k,C){if(Fn==null&&gi(!1),Jn(r),r!=null)p=r.clientX-Fn.left,h=r.clientY-Fn.top;else{if(p<0||h<0){ze=-10,$e=-10;return}let[T,N]=Be.scales,D=c.cursor.sync,[Q,ge]=D.values,[de,re]=D.scales,[G,j]=Be.match,Le=c.axes[0].side%2==1,Re=z.ori==0?ne:I,Qe=z.ori==1?ne:I,be=Le?w:g,Oe=Le?g:w,xt=Le?h:p,rt=Le?p:h;if(de!=null?p=G(T,de)?l(Q,P[T],Re,0):-10:p=Re*(xt/be),re!=null?h=j(N,re)?l(ge,P[N],Qe,0):-10:h=Qe*(rt/Oe),z.ori==1){let zt=p;p=h,h=zt}}C&&(c==null||c.cursor.event.type==so)&&((p<=1||p>=ne-1)&&(p=ss(p,ne)),(h<=1||h>=I-1)&&(h=ss(h,I))),k?(Nr=p,$r=h,[Fs,Ts]=Y.move(s,p,h)):(ze=p,$e=h)}const Ja={width:0,height:0,left:0,top:0};function Qa(){Ki(Ja,!1)}let qr,Vr,Yr,Hr;function jr(r,c,p,h,g,w,b){zn=!0,Ke=Ze=tt._x=tt._y=!1,Za(r,c,p,h,g,w,b,!0,!1),r!=null&&(ot(io,wo,Xr,!1),vi(tl,s,Fs,Ts,ne,I,null));let{left:k,top:C,width:T,height:N}=_e;qr=k,Vr=C,Yr=T,Hr=N}function Xr(r,c,p,h,g,w,b){zn=tt._x=tt._y=!1,Za(r,c,p,h,g,w,b,!1,!0);let{left:k,top:C,width:T,height:N}=_e,D=T>0||N>0,Q=qr!=k||Vr!=C||Yr!=T||Hr!=N;if(D&&Q&&Ki(_e),tt.setScale&&D&&Q){let ge=k,de=T,re=C,G=N;if(z.ori==1&&(ge=C,de=N,re=k,G=T),Ke&&_n($,sn(ge,$),sn(ge+de,$)),Ze)for(let j in P){let Le=P[j];j!=$&&Le.from==null&&Le.min!=Me&&_n(j,sn(re+G,j),sn(re,j))}Qa()}else Y.lock&&(Y._lock=!Y._lock,ts(c,!0,r!=null));r!=null&&(bs(io,wo),vi(io,s,ze,$e,ne,I,null))}function Ep(r,c,p,h,g,w,b){if(Y._lock)return;Jn(r);let k=zn;if(zn){let C=!0,T=!0,N=10,D,Q;z.ori==0?(D=Ke,Q=Ze):(D=Ze,Q=Ke),D&&Q&&(C=ze<=N||ze>=ne-N,T=$e<=N||$e>=I-N),D&&C&&(ze=ze<Fs?0:ne),Q&&T&&($e=$e<Ts?0:I),ts(null,!0,!0),zn=!1}ze=-10,$e=-10,me.fill(null),ts(null,!0,!0),k&&(zn=k)}function Ur(r,c,p,h,g,w,b){Y._lock||(Jn(r),$a(),Qa(),r!=null&&vi(il,s,ze,$e,ne,I,null))}function Wr(){O.forEach(Sd),Na(s.width,s.height,!0)}rs(ra,Ys,Wr);const Is={};Is.mousedown=jr,Is.mousemove=Br,Is.mouseup=Xr,Is.dblclick=Ur,Is.setSeries=(r,c,p,h)=>{let g=Be.match[2];p=g(s,c,p),p!=-1&&nn(p,h,!0,!1)},Ue&&(ot(tl,A,jr),ot(so,A,Br),ot(nl,A,r=>{Jn(r),gi(!1)}),ot(sl,A,Ep),ot(il,A,Ur),Ao.add(s),s.syncRect=gi);const Zi=s.hooks=t.hooks||{};function Je(r,c,p){Xa?di.push([r,c,p]):r in Zi&&Zi[r].forEach(h=>{h.call(null,s,c,p)})}(t.plugins||[]).forEach(r=>{for(let c in r.hooks)Zi[c]=(Zi[c]||[]).concat(r.hooks[c])});const Gr=(r,c,p)=>p,Be=qe({key:null,setSeries:!1,filters:{pub:ml,sub:ml},scales:[$,M[1]?M[1].scale:null],match:[gl,gl,Gr],values:[null,null]},Y.sync);Be.match.length==2&&Be.match.push(Gr),Y.sync=Be;const Kr=Be.key,eo=jc(Kr);function vi(r,c,p,h,g,w,b){Be.filters.pub(r,c,p,h,g,w,b)&&eo.pub(r,c,p,h,g,w,b)}eo.sub(s);function Cp(r,c,p,h,g,w,b){Be.filters.sub(r,c,p,h,g,w,b)&&Is[r](null,c,p,h,g,w,b)}s.pub=Cp;function Ap(){eo.unsub(s),Ao.delete(s),Un.clear(),So(ra,Ys,Wr),d.remove(),he?.remove(),Je("destroy")}s.destroy=Ap;function to(){Je("init",t,e),Cr(e||t.data,!1),V[$]?Ua($,V[$]):$a(),Hi=_e.show&&(_e.width>0||_e.height>0),Zn=At=!0,Na(t.width,t.height)}return M.forEach(Mr),O.forEach(ap),n?n instanceof HTMLElement?(n.appendChild(d),to()):n(s,to):to(),s}Te.assign=qe;Te.fmtNum=Uo;Te.rangeNum=la;Te.rangeLog=va;Te.rangeAsinh=jo;Te.orient=vs;Te.pxRatio=ve;Te.join=dh;Te.fmtDate=Go,Te.tzDate=Mh;Te.sync=jc;{Te.addGap=od,Te.clipGaps=ba;let t=Te.paths={points:Zc};t.linear=Qc,t.stepped=cd,t.bars=ud,t.spline=hd}const je={axis:"#93a7b3",grid:"#1c2a33",green:"#4fd17f",red:"#ef6461",orange:"#ff9f43",blue:"#62a8ff",yellow:"#f2c94c"};function mt(t={}){return{stroke:je.axis,grid:{stroke:je.grid,width:1},...t}}var Nt="INUMBER",oi="IOP1",ri="IOP2",li="IOP3",yn="IVAR",ps="IVARNAME",Ks="IFUNCALL",Ma="IFUNDEF",gt="IEXPR",nr="IEXPREVAL",xs="IMEMBER",Ea="IENDSTATEMENT",Zs="IARRAY";function pe(t,e){this.type=t,this.value=e??0}pe.prototype.toString=function(){switch(this.type){case Nt:case oi:case ri:case li:case yn:case ps:case Ea:return this.value;case Ks:return"CALL "+this.value;case Ma:return"DEF "+this.value;case Zs:return"ARRAY "+this.value;case xs:return"."+this.value;default:return"Invalid Instruction"}};function Ca(t){return new pe(oi,t)}function An(t){return new pe(ri,t)}function su(t){return new pe(li,t)}function zo(t,e,n,s,i){for(var a=[],o=[],l,u,d,v,m=0;m<t.length;m++){var f=t[m],y=f.type;if(y===Nt||y===ps)Array.isArray(f.value)?a.push.apply(a,zo(f.value.map(function(A){return new pe(Nt,A)}).concat(new pe(Zs,f.value.length)),e,n,s,i)):a.push(f);else if(y===yn&&Object.hasOwn(i,f.value))f=new pe(Nt,i[f.value]),a.push(f);else if(y===ri&&a.length>1)u=a.pop(),l=a.pop(),v=n[f.value],f=new pe(Nt,v(l.value,u.value)),a.push(f);else if(y===li&&a.length>2)d=a.pop(),u=a.pop(),l=a.pop(),f.value==="?"?a.push(l.value?u.value:d.value):(v=s[f.value],f=new pe(Nt,v(l.value,u.value,d.value)),a.push(f));else if(y===oi&&a.length>0)l=a.pop(),v=e[f.value],f=new pe(Nt,v(l.value)),a.push(f);else if(y===gt){for(;a.length>0;)o.push(a.shift());o.push(new pe(gt,zo(f.value,e,n,s,i)))}else if(y===xs&&a.length>0)l=a.pop(),a.push(new pe(Nt,l.value[f.value]));else{for(;a.length>0;)o.push(a.shift());o.push(f)}}for(;a.length>0;)o.push(a.shift());return o}function iu(t,e,n){for(var s=[],i=0;i<t.length;i++){var a=t[i],o=a.type;if(o===yn&&a.value===e)for(var l=0;l<n.tokens.length;l++){var u=n.tokens[l],d;u.type===oi?d=Ca(u.value):u.type===ri?d=An(u.value):u.type===li?d=su(u.value):d=new pe(u.type,u.value),s.push(d)}else o===gt?s.push(new pe(gt,iu(a.value,e,n))):s.push(a)}return s}function Ol(t,e,n){for(var s in e.functions)if(e.functions[s]===t)return!0;if(t.__expr_eval_safe_def)return!0;for(var i in n)if(typeof n[i]=="object"&&n[i]!==null){for(var a in n[i])if(n[i][a]===t)return!0}return!1}function os(t,e,n){var s=[],i,a,o,l,u,d;if(sr(t))return hn(t,n);for(var v=t.length,m=0;m<v;m++){var f=t[m],y=f.type;if(y===Nt||y===ps)s.push(f.value);else if(y===ri)a=s.pop(),i=s.pop(),f.value==="and"?s.push(i?!!os(a,e,n):!1):f.value==="or"?s.push(i?!0:!!os(a,e,n)):f.value==="="?(l=e.binaryOps[f.value],s.push(l(i,os(a,e,n),n))):(l=e.binaryOps[f.value],s.push(l(hn(i,n),hn(a,n))));else if(y===li)o=s.pop(),a=s.pop(),i=s.pop(),f.value==="?"?s.push(os(i?a:o,e,n)):(l=e.ternaryOps[f.value],s.push(l(hn(i,n),hn(a,n),hn(o,n))));else if(y===yn){if(/^__proto__|prototype|constructor$/.test(f.value))throw new Error("prototype access detected");if(f.value in e.functions)s.push(e.functions[f.value]);else if(f.value in e.unaryOps&&e.parser.isOperatorEnabled(f.value))s.push(e.unaryOps[f.value]);else{var A=n[f.value];if(A!==void 0){if(typeof A=="function"&&!Ol(A,e,n))throw new Error("Variable references an unallowed function: "+f.value);s.push(A)}else throw new Error("undefined variable: "+f.value)}}else if(y===oi)i=s.pop(),l=e.unaryOps[f.value],s.push(l(hn(i,n)));else if(y===Ks){for(d=f.value,u=[];d-- >0;)u.unshift(hn(s.pop(),n));if(l=s.pop(),!Ol(l,e,n))throw new Error("Is not an allowed function.");if(l.apply&&l.call)s.push(l.apply(void 0,u));else throw new Error(l+" is not a function")}else if(y===Ma)s.push((function(){for(var R=s.pop(),L=[],_=f.value;_-- >0;)L.unshift(s.pop());var M=s.pop(),O=function(){for(var P=Object.assign({},n),K=0,$=L.length;K<$;K++)P[L[K]]=arguments[K];return os(R,e,P)};return Object.defineProperty(O,"name",{value:M,writable:!1}),Object.defineProperty(O,"__expr_eval_safe_def",{value:!0,writable:!1}),n[M]=O,O})());else if(y===gt)s.push(kd(f,e));else if(y===nr)s.push(f);else if(y===xs)i=s.pop(),s.push(i[f.value]);else if(y===Ea)s.pop();else if(y===Zs){for(d=f.value,u=[];d-- >0;)u.unshift(s.pop());s.push(u)}else throw new Error("invalid Expression")}if(s.length>1)throw new Error("invalid Expression (parity)");return s[0]===0?0:hn(s[0],n)}function kd(t,e,n){return sr(t)?t:{type:nr,value:function(s){return os(t.value,e,s)}}}function sr(t){return t&&t.type===nr}function hn(t,e){return sr(t)?t.value(e):t}function ir(t,e){for(var n=[],s,i,a,o,l,u,d=0;d<t.length;d++){var v=t[d],m=v.type;if(m===Nt)typeof v.value=="number"&&v.value<0?n.push("("+v.value+")"):Array.isArray(v.value)?n.push("["+v.value.map(Dl).join(", ")+"]"):n.push(Dl(v.value));else if(m===ri)i=n.pop(),s=n.pop(),o=v.value,e?o==="^"?n.push("Math.pow("+s+", "+i+")"):o==="and"?n.push("(!!"+s+" && !!"+i+")"):o==="or"?n.push("(!!"+s+" || !!"+i+")"):o==="||"?n.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }(("+s+"),("+i+")))"):o==="=="?n.push("("+s+" === "+i+")"):o==="!="?n.push("("+s+" !== "+i+")"):o==="["?n.push(s+"[("+i+") | 0]"):n.push("("+s+" "+o+" "+i+")"):o==="["?n.push(s+"["+i+"]"):n.push("("+s+" "+o+" "+i+")");else if(m===li)if(a=n.pop(),i=n.pop(),s=n.pop(),o=v.value,o==="?")n.push("("+s+" ? "+i+" : "+a+")");else throw new Error("invalid Expression");else if(m===yn||m===ps)n.push(v.value);else if(m===oi)s=n.pop(),o=v.value,o==="-"||o==="+"?n.push("("+o+s+")"):e?o==="not"?n.push("(!"+s+")"):o==="!"?n.push("fac("+s+")"):n.push(o+"("+s+")"):o==="!"?n.push("("+s+"!)"):n.push("("+o+" "+s+")");else if(m===Ks){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());o=n.pop(),n.push(o+"("+l.join(", ")+")")}else if(m===Ma){for(i=n.pop(),u=v.value,l=[];u-- >0;)l.unshift(n.pop());s=n.pop(),e?n.push("("+s+" = function("+l.join(", ")+") { return "+i+" })"):n.push("("+s+"("+l.join(", ")+") = "+i+")")}else if(m===xs)s=n.pop(),n.push(s+"."+v.value);else if(m===Zs){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());n.push("["+l.join(", ")+"]")}else if(m===gt)n.push("("+ir(v.value,e)+")");else if(m!==Ea)throw new Error("invalid Expression")}return n.length>1&&(e?n=[n.join(",")]:n=[n.join(";")]),String(n[0])}function Dl(t){return typeof t=="string"?JSON.stringify(t).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"):t}function qs(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}function ar(t,e,n){n=n||{};for(var s=!!n.withMembers,i=null,a=0;a<t.length;a++){var o=t[a];o.type===yn||o.type===ps?!s&&!qs(e,o.value)?e.push(o.value):(i!==null&&(qs(e,i)||e.push(i)),i=o.value):o.type===xs&&s&&i!==null?i+="."+o.value:o.type===gt?ar(o.value,e,n):i!==null&&(qs(e,i)||e.push(i),i=null)}i!==null&&!qs(e,i)&&e.push(i)}function Gt(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}Gt.prototype.simplify=function(t){return t=t||{},new Gt(zo(this.tokens,this.unaryOps,this.binaryOps,this.ternaryOps,t),this.parser)};Gt.prototype.substitute=function(t,e){return e instanceof Gt||(e=this.parser.parse(String(e))),new Gt(iu(this.tokens,t,e),this.parser)};Gt.prototype.evaluate=function(t){return t=t||{},os(this.tokens,this,t)};Gt.prototype.toString=function(){return ir(this.tokens,!1)};Gt.prototype.symbols=function(t){t=t||{};var e=[];return ar(this.tokens,e,t),e};Gt.prototype.variables=function(t){t=t||{};var e=[];ar(this.tokens,e,t);var n=this.functions;return e.filter(function(s){return!(s in n)})};Gt.prototype.toJSFunction=function(t,e){var n=this,s=new Function(t,"with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return "+ir(this.simplify(e).tokens,!0)+"; }");return function(){return s.apply(n,arguments)}};var Ti="TEOF",Pe="TOP",Aa="TNUMBER",au="TSTRING",Sn="TPAREN",Js="TBRACKET",Pa="TCOMMA",or="TNAME",rr="TSEMICOLON";function ou(t,e,n){this.type=t,this.value=e,this.index=n}ou.prototype.toString=function(){return this.type+": "+this.value};function De(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}De.prototype.newToken=function(t,e,n){return new ou(t,e,n??this.pos)};De.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current};De.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent};De.prototype.next=function(){if(this.pos>=this.expression.length)return this.newToken(Ti,"EOF");if(this.isWhitespace()||this.isComment())return this.next();if(this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName())return this.current;this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')};De.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if(n==="'"||n==='"')for(var s=this.expression.indexOf(n,e+1);s>=0&&this.pos<this.expression.length;){if(this.pos=s+1,this.expression.charAt(s-1)!=="\\"){var i=this.expression.substring(e+1,s);this.current=this.newToken(au,this.unescape(i),e),t=!0;break}s=this.expression.indexOf(n,s+1)}return t};De.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return t==="("||t===")"?(this.current=this.newToken(Sn,t),this.pos++,!0):!1};De.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return(t==="["||t==="]")&&this.isOperatorEnabled("[")?(this.current=this.newToken(Js,t),this.pos++,!0):!1};De.prototype.isComma=function(){var t=this.expression.charAt(this.pos);return t===","?(this.current=this.newToken(Pa,","),this.pos++,!0):!1};De.prototype.isSemicolon=function(){var t=this.expression.charAt(this.pos);return t===";"?(this.current=this.newToken(rr,";"),this.pos++,!0):!1};De.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&n!=="."&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(s in this.consts)return this.current=this.newToken(Aa,this.consts[s]),this.pos+=s.length,!0}return!1};De.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(this.isOperatorEnabled(s)&&(s in this.binaryOps||s in this.unaryOps||s in this.ternaryOps))return this.current=this.newToken(Pe,s),this.pos+=s.length,!0}return!1};De.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var s=this.expression.charAt(e);if(s.toUpperCase()===s.toLowerCase()){if(e===this.pos&&(s==="$"||s==="_")){s==="_"&&(n=!0);continue}else if(e===this.pos||!n||s!=="_"&&(s<"0"||s>"9"))break}else n=!0}if(n){var i=this.expression.substring(t,e);return this.current=this.newToken(or,i),this.pos+=i.length,!0}return!1};De.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);(e===" "||e==="	"||e===`
`||e==="\r")&&(t=!0,this.pos++,!(this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var Md=/^[0-9a-f]{4}$/i;De.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var s=t.charAt(++e);switch(s){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+=`
`;break;case"r":n+="\r";break;case"t":n+="	";break;case"u":var i=t.substring(e+1,e+5);Md.test(i)||this.parseError("Illegal escape sequence: \\u"+i),n+=String.fromCharCode(parseInt(i,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+s+'"')}++e;var a=t.indexOf("\\",e);n+=t.substring(e,a<0?t.length:a),e=a}return n};De.prototype.isComment=function(){var t=this.expression.charAt(this.pos);return t==="/"&&this.expression.charAt(this.pos+1)==="*"?(this.pos=this.expression.indexOf("*/",this.pos)+2,this.pos===1&&(this.pos=this.expression.length),!0):!1};De.prototype.isRadixInteger=function(){var t=this.pos;if(t>=this.expression.length-2||this.expression.charAt(t)!=="0")return!1;++t;var e,n;if(this.expression.charAt(t)==="x")e=16,n=/^[0-9a-f]$/i,++t;else if(this.expression.charAt(t)==="b")e=2,n=/^[01]$/i,++t;else return!1;for(var s=!1,i=t;t<this.expression.length;){var a=this.expression.charAt(t);if(n.test(a))t++,s=!0;else break}return s&&(this.current=this.newToken(Aa,parseInt(this.expression.substring(i,t),e)),this.pos=t),s};De.prototype.isNumber=function(){for(var t=!1,e=this.pos,n=e,s=e,i=!1,a=!1,o;e<this.expression.length&&(o=this.expression.charAt(e),o>="0"&&o<="9"||!i&&o===".");)o==="."?i=!0:a=!0,e++,t=a;if(t&&(s=e),o==="e"||o==="E"){e++;for(var l=!0,u=!1;e<this.expression.length;){if(o=this.expression.charAt(e),l&&(o==="+"||o==="-"))l=!1;else if(o>="0"&&o<="9")u=!0,l=!1;else break;e++}u||(e=s)}return t?(this.current=this.newToken(Aa,parseFloat(this.expression.substring(n,e))),this.pos=e):this.pos=s,t};De.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if(e==="+"||e==="-"||e==="*"||e==="/"||e==="%"||e==="^"||e==="?"||e===":"||e===".")this.current=this.newToken(Pe,e);else if(e==="∙"||e==="•")this.current=this.newToken(Pe,"*");else if(e===">")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,">="),this.pos++):this.current=this.newToken(Pe,">");else if(e==="<")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,"<="),this.pos++):this.current=this.newToken(Pe,"<");else if(e==="|")if(this.expression.charAt(this.pos+1)==="|")this.current=this.newToken(Pe,"||"),this.pos++;else return!1;else if(e==="=")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,"=="),this.pos++):this.current=this.newToken(Pe,e);else if(e==="!")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,"!="),this.pos++):this.current=this.newToken(Pe,e);else return!1;return this.pos++,this.isOperatorEnabled(this.current.value)?!0:(this.pos=t,!1)};De.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)};De.prototype.getCoordinates=function(){var t=0,e,n=-1;do t++,e=this.pos-n,n=this.expression.indexOf(`
`,n+1);while(n>=0&&n<this.pos);return{line:t,column:e}};De.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};function Ne(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=n.allowMemberAccess!==!1}Ne.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()};Ne.prototype.tokenMatches=function(t,e){return typeof e>"u"?!0:Array.isArray(e)?qs(e,t.value):typeof e=="function"?e(t):t.value===e};Ne.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()};Ne.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken};Ne.prototype.accept=function(t,e){return this.nextToken.type===t&&this.tokenMatches(this.nextToken,e)?(this.next(),!0):!1};Ne.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}};Ne.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.accept(or)||this.accept(Pe,n))t.push(new pe(yn,this.current.value));else if(this.accept(Aa))t.push(new pe(Nt,this.current.value));else if(this.accept(au))t.push(new pe(Nt,this.current.value));else if(this.accept(Sn,"("))this.parseExpression(t),this.expect(Sn,")");else if(this.accept(Js,"["))if(this.accept(Js,"]"))t.push(new pe(Zs,0));else{var s=this.parseArrayList(t);t.push(new pe(Zs,s))}else throw new Error("unexpected "+this.nextToken)};Ne.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),!this.parseUntilEndStatement(t,e)&&this.pushExpression(t,e))};Ne.prototype.pushExpression=function(t,e){for(var n=0,s=e.length;n<s;n++)t.push(e[n])};Ne.prototype.parseUntilEndStatement=function(t,e){return this.accept(rr)?(this.nextToken&&this.nextToken.type!==Ti&&!(this.nextToken.type===Sn&&this.nextToken.value===")")&&e.push(new pe(Ea)),this.nextToken.type!==Ti&&this.parseExpression(e),t.push(new pe(gt,e)),!0):!1};Ne.prototype.parseArrayList=function(t){for(var e=0;!this.accept(Js,"]");)for(this.parseExpression(t),++e;this.accept(Pa);)this.parseExpression(t),++e;return e};Ne.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(Pe,"=");){var e=t.pop(),n=[],s=t.length-1;if(e.type===Ks){if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var i=0,a=e.value+1;i<a;i++){var o=s-i;t[o].type===yn&&(t[o]=new pe(ps,t[o].value))}this.parseVariableAssignmentExpression(n),t.push(new pe(gt,n)),t.push(new pe(Ma,e.value));continue}if(e.type!==yn&&e.type!==xs)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new pe(ps,e.value)),t.push(new pe(gt,n)),t.push(An("="))}};Ne.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(Pe,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(Pe,":"),this.parseConditionalExpression(n),t.push(new pe(gt,e)),t.push(new pe(gt,n)),t.push(su("?"))}};Ne.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(Pe,"or");){var e=[];this.parseAndExpression(e),t.push(new pe(gt,e)),t.push(An("or"))}};Ne.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(Pe,"and");){var e=[];this.parseComparison(e),t.push(new pe(gt,e)),t.push(An("and"))}};var Ed=["==","!=","<","<=",">=",">","in"];Ne.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(Pe,Ed);){var e=this.current;this.parseAddSub(t),t.push(An(e.value))}};var Cd=["+","-","||"];Ne.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(Pe,Cd);){var e=this.current;this.parseTerm(t),t.push(An(e.value))}};var Ad=["*","/","%"];Ne.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(Pe,Ad);){var e=this.current;this.parseFactor(t),t.push(An(e.value))}};Ne.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.save(),this.accept(Pe,n)){if(this.current.value!=="-"&&this.current.value!=="+"){if(this.nextToken.type===Sn&&this.nextToken.value==="("){this.restore(),this.parseExponential(t);return}else if(this.nextToken.type===rr||this.nextToken.type===Pa||this.nextToken.type===Ti||this.nextToken.type===Sn&&this.nextToken.value===")"){this.restore(),this.parseAtom(t);return}}var s=this.current;this.parseFactor(t),t.push(Ca(s.value))}else this.parseExponential(t)};Ne.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(Pe,"^");)this.parseFactor(t),t.push(An("^"))};Ne.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(Pe,"!");)t.push(Ca("!"))};Ne.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;function n(a){return a.value in e}if(this.accept(Pe,n)){var s=this.current;this.parseAtom(t),t.push(Ca(s.value))}else for(this.parseMemberExpression(t);this.accept(Sn,"(");)if(this.accept(Sn,")"))t.push(new pe(Ks,0));else{var i=this.parseArgumentList(t);t.push(new pe(Ks,i))}};Ne.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(Sn,")");)for(this.parseExpression(t),++e;this.accept(Pa);)this.parseExpression(t),++e;return e};Ne.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(Pe,".")||this.accept(Js,"[");){var e=this.current;if(e.value==="."){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect(or),t.push(new pe(xs,this.current.value))}else if(e.value==="["){if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect(Js,"]"),t.push(An("["))}else throw new Error("unexpected symbol: "+e.value)}};function Pd(t,e){return Number(t)+Number(e)}function zd(t,e){return t-e}function _d(t,e){return t*e}function Ld(t,e){return t/e}function Fd(t,e){return t%e}function Td(t,e){return Array.isArray(t)&&Array.isArray(e)?t.concat(e):""+t+e}function Nd(t,e){return t===e}function $d(t,e){return t!==e}function Id(t,e){return t>e}function Rd(t,e){return t<e}function Od(t,e){return t>=e}function Dd(t,e){return t<=e}function Bd(t,e){return!!(t&&e)}function qd(t,e){return!!(t||e)}function Vd(t,e){return qs(e,t)}function Yd(t){return(Math.exp(t)-Math.exp(-t))/2}function Hd(t){return(Math.exp(t)+Math.exp(-t))/2}function jd(t){return t===1/0?1:t===-1/0?-1:(Math.exp(t)-Math.exp(-t))/(Math.exp(t)+Math.exp(-t))}function Xd(t){return t===-1/0?t:Math.log(t+Math.sqrt(t*t+1))}function Ud(t){return Math.log(t+Math.sqrt(t*t-1))}function Wd(t){return Math.log((1+t)/(1-t))/2}function Bl(t){return Math.log(t)*Math.LOG10E}function Gd(t){return-t}function Kd(t){return!t}function Zd(t){return t<0?Math.ceil(t):Math.floor(t)}function Jd(t){return Math.random()*(t||1)}function ql(t){return lr(t+1)}function Qd(t){return isFinite(t)&&t===Math.round(t)}var ef=4.7421875,co=[.9999999999999971,57.15623566586292,-59.59796035547549,14.136097974741746,-.4919138160976202,3399464998481189e-20,4652362892704858e-20,-9837447530487956e-20,.0001580887032249125,-.00021026444172410488,.00021743961811521265,-.0001643181065367639,8441822398385275e-20,-26190838401581408e-21,36899182659531625e-22];function lr(t){var e,n;if(Qd(t)){if(t<=0)return isFinite(t)?1/0:NaN;if(t>171)return 1/0;for(var s=t-2,i=t-1;s>1;)i*=s,s--;return i===0&&(i=1),i}if(t<.5)return Math.PI/(Math.sin(Math.PI*t)*lr(1-t));if(t>=171.35)return 1/0;if(t>85){var a=t*t,o=a*t,l=o*t,u=l*t;return Math.sqrt(2*Math.PI/t)*Math.pow(t/Math.E,t)*(1+1/(12*t)+1/(288*a)-139/(51840*o)-571/(2488320*l)+163879/(209018880*u)+5246819/(75246796800*u*t))}--t,n=co[0];for(var d=1;d<co.length;++d)n+=co[d]/(t+d);return e=t+ef+.5,Math.sqrt(2*Math.PI)*Math.pow(e,t+.5)*Math.exp(-e)*n}function tf(t){return Array.isArray(t)?t.length:String(t).length}function Vl(){for(var t=0,e=0,n=0;n<arguments.length;n++){var s=Math.abs(arguments[n]),i;e<s?(i=e/s,t=t*i*i+1,e=s):s>0?(i=s/e,t+=i*i):t+=s}return e===1/0?1/0:e*Math.sqrt(t)}function Yl(t,e,n){return t?e:n}function nf(t,e){return typeof e>"u"||+e==0?Math.round(t):(t=+t,e=-+e,isNaN(t)||!(typeof e=="number"&&e%1===0)?NaN:(t=t.toString().split("e"),t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e))),t=t.toString().split("e"),+(t[0]+"e"+(t[1]?+t[1]+e:e))))}function sf(t,e,n){return n&&(n[t]=e),e}function af(t,e){return t[e|0]}function of(t){return arguments.length===1&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function rf(t){return arguments.length===1&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function lf(t,e){if(typeof t!="function")throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map(function(n,s){return t(n,s)})}function cf(t,e,n){if(typeof t!="function")throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce(function(s,i,a){return t(s,i,a)},e)}function uf(t,e){if(typeof t!="function")throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter(function(n,s){return t(n,s)})}function pf(t,e){if(!(Array.isArray(e)||typeof e=="string"))throw new Error("Second argument to indexOf is not a string or array");return e.indexOf(t)}function hf(t,e){if(!Array.isArray(e))throw new Error("Second argument to join is not an array");return e.join(t)}function df(t){return(t>0)-(t<0)||+t}var Hl=1/3;function ff(t){return t<0?-Math.pow(-t,Hl):Math.pow(t,Hl)}function mf(t){return Math.exp(t)-1}function gf(t){return Math.log(1+t)}function vf(t){return Math.log(t)/Math.LN2}function xf(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce(function(e,n){return e+Number(n)},0)}function ws(t){this.options=t||{},this.unaryOps={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh||Yd,cosh:Math.cosh||Hd,tanh:Math.tanh||jd,asinh:Math.asinh||Xd,acosh:Math.acosh||Ud,atanh:Math.atanh||Wd,sqrt:Math.sqrt,cbrt:Math.cbrt||ff,log:Math.log,log2:Math.log2||vf,ln:Math.log,lg:Math.log10||Bl,log10:Math.log10||Bl,expm1:Math.expm1||mf,log1p:Math.log1p||gf,abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,trunc:Math.trunc||Zd,"-":Gd,"+":Number,exp:Math.exp,not:Kd,length:tf,"!":ql,sign:Math.sign||df},this.binaryOps={"+":Pd,"-":zd,"*":_d,"/":Ld,"%":Fd,"^":Math.pow,"||":Td,"==":Nd,"!=":$d,">":Id,"<":Rd,">=":Od,"<=":Dd,and:Bd,or:qd,in:Vd,"=":sf,"[":af},this.ternaryOps={"?":Yl},this.functions={random:Jd,fac:ql,min:rf,max:of,hypot:Math.hypot||Vl,pyt:Math.hypot||Vl,pow:Math.pow,atan2:Math.atan2,if:Yl,gamma:lr,roundTo:nf,map:lf,fold:cf,filter:uf,indexOf:pf,join:hf,sum:xf},this.consts={E:Math.E,PI:Math.PI,true:!0,false:!1}}ws.prototype.parse=function(t){var e=[],n=new Ne(this,new De(this,t),{allowMemberAccess:this.options.allowMemberAccess});return n.parseExpression(e),n.expect(Ti,"EOF"),new Gt(e,this)};ws.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var ru=new ws;ws.parse=function(t){return ru.parse(t)};ws.evaluate=function(t,e){return ru.parse(t).evaluate(e)};var jl={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",and:"logical",or:"logical",not:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};function wf(t){return Object.hasOwn(jl,t)?jl[t]:t}ws.prototype.isOperatorEnabled=function(t){var e=wf(t),n=this.options.operators||{};return!(e in n)||!!n[e]};const bf=new ws({allowMemberAccess:!1,operators:{assignment:!1,comparison:!1,fndef:!1,in:!1,logical:!1}}),yf=new Set(["ch1","ch2","times"]);function Sf(t,e,n,s){const i=t.replace(/\bnp\./g,"").replaceAll("**","^"),a=bf.parse(i),o=a.variables().filter(d=>!yf.has(d));if(o.length>0)throw new Error(`unknown variable ${o[0]}`);const l=a.toJSFunction(["ch1","ch2","times"]),u=new Float32Array(Math.min(e.length,n.length,s.length));for(let d=0;d<u.length;d+=1){const v=Number(l(e[d],n[d],s[d]));u[d]=Number.isFinite(v)?v:Number.NaN}return u}function kf(t,e=250,n=5e3){const s=Math.max(0,Math.floor(t)),i=Math.max(1,Math.floor(e)),a=Math.max(i,Math.floor(n));return Math.min(a,i*2**Math.min(s,20))}class za{constructor(e,n=250,s=5e3,i=(o,l)=>window.setTimeout(o,l),a=o=>window.clearTimeout(o)){this.reconnect=e,this.baseDelay=n,this.maxDelay=s,this.scheduleTimer=i,this.cancelTimer=a}reconnect;baseDelay;maxDelay;scheduleTimer;cancelTimer;attempt=0;timer=null;schedule(){if(this.timer!==null)return null;const e=kf(this.attempt,this.baseDelay,this.maxDelay);return this.attempt+=1,this.timer=this.scheduleTimer(()=>{this.timer=null,this.reconnect()},e),e}connected(){this.cancel()}cancel(e=!0){this.timer!==null&&(this.cancelTimer(this.timer),this.timer=null),e&&(this.attempt=0)}}const Mf="PWS1",Xl=24;function Ef(t){if(t.byteLength<Xl)throw new Error("Scope frame too short");const e=new DataView(t),n=String.fromCharCode(...new Uint8Array(t.slice(0,4)));if(n!==Mf)throw new Error(`Bad frame magic: ${n}`);const s=e.getUint16(4,!0);if(s!==1)throw new Error(`Unsupported scope frame version: ${s}`);const i=e.getUint16(6,!0),a=e.getUint32(8,!0),o=new Float32Array(t,Xl);if(o.length!==a*i)throw new Error("Scope frame payload length does not match metadata");return{channelCount:i,sampleCount:a,sequence:e.getUint32(20,!0),samples:o}}function Cf(t,e){const n=new Float64Array(t.sampleCount),s=new Float32Array(t.sampleCount),i=new Float32Array(t.sampleCount),a=e?.rollingMode?-e.duration:e&&e.triggerSource!=="immediately"?e.triggerDelay-e.duration/2:0,o=e?e.duration:Math.max(0,t.sampleCount-1),l=t.sampleCount>0?o/t.sampleCount:0;for(let u=0;u<t.sampleCount;u+=1)n[u]=e?a+u*l:u,s[u]=t.samples[u*t.channelCount]??0,i[u]=t.channelCount>1?t.samples[u*t.channelCount+1]??0:0;return{x:n,ch1:s,ch2:i}}function Af(t,e,n,s){const i=Math.min(n+1,Math.max(1,Math.floor(s)));if(i<=1||!e||e.ch1.length!==t.ch1.length||e.ch2.length!==t.ch2.length)return{data:t,currentAverage:1};const a=new Float32Array(t.ch1.length),o=new Float32Array(t.ch2.length),l=i-1;for(let u=0;u<t.ch1.length;u+=1)a[u]=(e.ch1[u]*l+t.ch1[u])/i,o[u]=(e.ch2[u]*l+t.ch2[u])/i;return{data:{x:t.x,ch1:a,ch2:o},currentAverage:i}}function Pf(t,e,n,s=4){const i=Math.max(1,n),a=Math.min(i,Math.max(s,e-t));let o=t,l=t+a;return o<0&&(l-=o,o=0),l>i&&(o-=l-i,l=i),{min:Math.max(0,o),max:Math.min(i,Math.max(a,l))}}const zf=2**14,ta=-1.1,bi=1.1;class _f{constructor(e,n,s=()=>{},i=zf){this.plotHost=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new za(()=>this.openSocket()),this.plot=new Te(this.options(),this.emptyData(),this.plotHost),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}plotHost;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;plot;latestFrame=null;receivedFrameCount=0;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;pendingFrame=null;averagedData=null;displayedData=null;currentAverage=0;traceAverage=1;timeSettings=null;channelVisible=[!0,!0];xyMode=!1;mathActive=!1;mathFormula="ch1 * ch2";resizeListener=()=>this.scheduleResize();connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/scope?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Scope stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Scope stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.setStatus("Scope stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Scope stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.handleFrame(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}reconnect(){if(!this.wantsConnection)return;this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close(),this.resetTraceAveraging(),this.openSocket()}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}setSampleCount(e){this.sampleCount=Math.max(1,Math.floor(e)),this.resetAveraging()}getSampleCount(){return this.sampleCount}setTraceAverage(e){this.traceAverage=Math.max(1,Math.floor(e)),this.resetAveraging()}resetTraceAveraging(){this.pendingFrame=null,this.resetAveraging()}getTraceAverage(){return this.traceAverage}setTimeSettings(e){if(this.timeSettings=e,this.resetAveraging(),this.latestFrame&&this.displayedData){const n=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(n)),this.resetYScale()}),this.plot.redraw(!0,!0)}}setChannelVisible(e,n){this.channelVisible[e-1]=n,this.applySeriesVisibility()}getChannelVisible(e){return this.channelVisible[e-1]}setDisplaySettings(e){const n=this.xyMode!==e.xyMode;if(this.xyMode=e.xyMode,this.mathActive=e.mathActive,this.mathFormula=e.mathFormula,this.applySeriesVisibility(),this.latestFrame&&this.displayedData){const s=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),n&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(s)),this.resetYScale()}),this.plot.redraw(!0,!0)}}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.plot.destroy()}showFrame(e){this.handleFrame(e)}resetZoom(){if(!this.latestFrame)return;const e=this.latestFrame;this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(e)),this.resetYScale()})}zoom(e){const n=this.plot.scales.x,s=Number(n.min??0),i=Number(n.max??this.currentMaxX()),a=(s+i)/2,o=Math.max(this.minimumXSpan(),(i-s)*e);this.setXScale(a-o/2,a+o/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-6,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??ta),max:Number(e.max??bi)}}getFormattedTimeLabelsForCurrentRange(e=6){const{min:n,max:s}=this.getXRange(),i=Math.max(2,Math.floor(e)),a=(s-n)/(i-1),o=Array.from({length:i},(l,u)=>n+a*u);return this.formatTimeTicks(this.plot,o)}getFrameSequence(){return this.receivedFrameCount>0?this.receivedFrameCount:null}exportCsv(){if(!this.displayedData)return`time,ch1,ch2
`;const e=["time,ch1,ch2"];for(let n=0;n<this.displayedData.x.length;n+=1)e.push(`${this.displayedData.x[n]},${this.displayedData.ch1[n]},${this.displayedData.ch2[n]}`);return`${e.join(`
`)}
`}getDisplayedStats(){return this.displayedData?{...Wl(this.displayedData.ch1,"ch1"),...Wl(this.displayedData.ch2,"ch2")}:null}getDisplayedDataFingerprint(){if(!this.displayedData)return null;let e=2166136261;const n=Math.max(1,Math.floor(this.displayedData.x.length/512));for(let s=0;s<this.displayedData.x.length;s+=n)e=uo(e,this.displayedData.x[s]),e=uo(e,this.displayedData.ch1[s]),e=uo(e,this.displayedData.ch2[s]);return e>>>0}getMathStats(){return this.xyMode||!this.mathActive?null:Lf(this.plot.data,3,1)}getXyStats(){if(!this.xyMode)return null;const e=_o(this.plot.data,1,0),n=_o(this.plot.data,1,1);if(!e||!n||e.length===0||e.length!==n.length)return null;let s=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,a=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY,l=0;for(let u=0;u<e.length;u+=1)s=Math.min(s,e[u]),i=Math.max(i,e[u]),a=Math.min(a,n[u]),o=Math.max(o,n[u]),l=Math.max(l,Math.abs(e[u]-n[u]));return{xMin:s,xMax:i,yMin:a,yMax:o,maxDelta:l}}getCurveData(){return this.displayedData?{x:Array.from(this.displayedData.x),channels:[Array.from(this.displayedData.ch1),Array.from(this.displayedData.ch2)]}:null}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}options(){return{mode:2,width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1,min:0,max:this.sampleCount-1},y:{auto:!1,min:ta,max:bi}},axes:[mt({label:"Time / CH1",values:(e,n)=>this.formatTimeTicks(e,n)}),mt({label:"Amplitude / CH2"})],series:[{},{label:"CH1 / XY",stroke:je.green,width:1.5,points:{show:!1}},{label:"CH2",stroke:je.red,width:1.5,points:{show:!1}},{label:"Math",stroke:je.blue,width:1.5,points:{show:!1}}]}}emptyData(){return[[],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)]]}handleFrame(e){let n;try{n=Ef(e)}catch(s){this.setStatus(s instanceof Error?s.message:"Invalid scope frame");return}this.receivedFrameCount+=1,this.pendingFrame=n,this.scheduleRender(),this.setStatus(`Frame ${n.sequence}, ${n.sampleCount} samples, ${n.channelCount} channels`)}frameData(e){const n=Cf(e,this.timeSettings??void 0);if(this.timeSettings?.rollingMode)return this.averagedData=null,this.displayedData=n,this.currentAverage=0,this.setCurrentAverage(0),this.plotData(n);const s=Af(n,this.averagedData,this.currentAverage,this.traceAverage);return this.averagedData=s.data,this.displayedData=s.data,this.currentAverage=s.currentAverage,this.setCurrentAverage(this.currentAverage),this.plotData(s.data)}plotData(e){if(this.xyMode){const s=new Float32Array(0);return[[],[e.ch1,e.ch2],[s,s],[s,s]]}let n=new Float32Array(e.x.length).fill(Number.NaN);if(this.mathActive)try{n=Sf(this.mathFormula,e.ch1,e.ch2,e.x)}catch(s){this.setStatus(`Math formula error: ${s instanceof Error?s.message:String(s)}`)}return[[],[e.x,e.ch1],[e.x,e.ch2],[e.x,n]]}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=this.latestFrame===null,s=this.latestFrame!==null&&this.latestFrame.sampleCount!==e.sampleCount;s&&this.resetAveraging(),this.latestFrame=e,this.plot.setData(this.frameData(e),!1),(n||s)&&this.resetZoom(),this.plot.redraw(!0,!0)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resize()}))}resize(){const e=Math.max(320,Math.floor(this.plotHost.clientWidth)),n=Math.max(240,Math.floor(this.plotHost.clientHeight));e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(this.timeSettings&&!this.xyMode){const s=this.defaultXMin(),i=s+this.timeSettings.duration,a=Math.max(Number.EPSILON,this.timeSettings.duration/1024),o=Math.min(i-s,Math.max(a,n-e));let l=e,u=e+o;l<s&&(u+=s-l,l=s),u>i&&(l-=u-i,u=i),this.plot.setScale("x",{min:Math.max(s,l),max:Math.min(i,u)});return}this.plot.setScale("x",Pf(e,n,this.currentMaxX()))}setYScale(e,n){const s=Math.max(1e-6,n-e);this.plot.setScale("y",{min:e,max:e+s})}resetYScale(){this.plot.setScale("y",{min:ta,max:bi})}minimumXSpan(){return this.timeSettings&&!this.xyMode?Math.max(Number.EPSILON,this.timeSettings.duration/1024):4}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-6,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){if(this.xyMode)return bi;if(this.timeSettings){const e=this.defaultXMin();return Math.max(e+Number.EPSILON,e+this.timeSettings.duration)}return Math.max(1,(this.latestFrame?.sampleCount??this.sampleCount)-1)}defaultXScale(e){if(this.xyMode)return{min:ta,max:bi};if(this.timeSettings){const n=this.defaultXMin();return{min:n,max:n+this.timeSettings.duration}}return{min:0,max:Math.max(1,e.sampleCount-1)}}defaultXMin(){return this.timeSettings?this.timeSettings.rollingMode?-this.timeSettings.duration:this.timeSettings.triggerSource==="immediately"?0:this.timeSettings.triggerDelay-this.timeSettings.duration/2:0}resetAveraging(){this.averagedData=null,this.currentAverage=0,this.setCurrentAverage(0)}formatTimeTicks(e,n){if(this.xyMode)return n.map(d=>Ul(d,3));const s=Number(e.scales.x.min??n[0]??0),i=Number(e.scales.x.max??n[n.length-1]??s),a=Math.max(Number.EPSILON,Math.abs(i-s)),o=Ff(Math.max(Number.EPSILON,this.timeSettings?.duration??a)),l=n.length>1?Math.abs(n[1]-n[0])*o.scale:a*o.scale,u=Math.max(0,Math.min(9,Math.ceil(-Math.log10(Math.max(l,Number.EPSILON)))+1));return n.map(d=>`${Ul(d*o.scale,u)} ${o.suffix}`)}applySeriesVisibility(){this.plot.setSeries(1,{show:this.xyMode||this.channelVisible[0]}),this.plot.setSeries(2,{show:!this.xyMode&&this.channelVisible[1]}),this.plot.setSeries(3,{show:!this.xyMode&&this.mathActive})}}function _o(t,e,n){return t[e]?.[n]??null}function Lf(t,e,n){const s=_o(t,e,n);if(!s||s.length===0)return null;let i=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY;for(let o=0;o<s.length;o+=1){const l=s[o];Number.isFinite(l)&&(i=Math.min(i,l),a=Math.max(a,l))}return i===Number.POSITIVE_INFINITY?null:{min:i,max:a}}function Ff(t){return t<1e-6?{scale:1e9,suffix:"ns"}:t<.001?{scale:1e6,suffix:"us"}:t<1?{scale:1e3,suffix:"ms"}:{scale:1,suffix:"s"}}function Ul(t,e){return Number.isFinite(t)?t.toFixed(e).replace(/\.?0+$/,""):"0"}function Wl(t,e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const i of t)n=Math.min(n,i),s=Math.max(s,i);return{[`${e}Min`]:n===Number.POSITIVE_INFINITY?0:n,[`${e}Max`]:s===Number.NEGATIVE_INFINITY?0:s}}function uo(t,e){const n=Math.round(Number.isFinite(e)?e*1e6:0);return t^=n&255,t=Math.imul(t,16777619),t^=n>>8&255,t=Math.imul(t,16777619),t^=n>>16&255,t=Math.imul(t,16777619),t^=n>>24&255,t=Math.imul(t,16777619),t}const Gl=[new Float64Array(0),new Float32Array(0)];class Tf{constructor(e,n,s=()=>{},i=16384){this.host=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.reconnectScheduler=new za(()=>this.openSocket()),this.plot=new Te(this.options("",this.labels),Gl,this.host),this.fftWorker.onmessage=a=>this.handleWorkerResponse(a.data),this.fftWorker.onerror=()=>this.setStatus("Spectrum FFT worker error"),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}host;setStatus;setCurrentAverage;sampleCount;socket=null;wantsConnection=!1;reconnectScheduler;retiredSockets=new WeakSet;plot;latestFrame=null;latestCurveFrame=null;pendingFrame=null;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;labels=["Spectrum"];unit="";averagedFrame=null;currentAverage=0;fftWorker=new Worker(new URL("/assets/spectrum-worker-S9qnYzAn.js",import.meta.url),{type:"module"});workerRequestId=0;workerGeneration=0;settings={baseband:!0,span:976562.5,center:0,window:"blackman",displayUnit:"dB(Vpk^2)",displayInput1Baseband:!0,displayInput2Baseband:!0,displayCrossAmplitude:!0,traceAverage:1,runningState:"stopped",iqBandwidth:[]};resizeListener=()=>this.scheduleResize();setSettings(e){const n={...this.settings,baseband:!!(e.baseband??this.settings.baseband),span:Number(e.span??this.settings.span),center:Number(e.center??this.settings.center),window:String(e.window??this.settings.window),displayUnit:String(e.display_unit??this.settings.displayUnit),displayInput1Baseband:!!(e.display_input1_baseband??this.settings.displayInput1Baseband),displayInput2Baseband:!!(e.display_input2_baseband??this.settings.displayInput2Baseband),displayCrossAmplitude:!!(e.display_cross_amplitude??this.settings.displayCrossAmplitude),traceAverage:Math.max(1,Math.floor(Number(e.trace_average??this.settings.traceAverage))),runningState:String(e.running_state??this.settings.runningState),iqBandwidth:Array.isArray(e.iq_bandwidth)?e.iq_bandwidth.map(Number).filter(Number.isFinite):this.settings.iqBandwidth},s=n.displayUnit!==this.settings.displayUnit,i=n.displayInput1Baseband!==this.settings.displayInput1Baseband||n.displayInput2Baseband!==this.settings.displayInput2Baseband||n.displayCrossAmplitude!==this.settings.displayCrossAmplitude;!(this.settings.runningState==="running_single"&&n.runningState==="stopped")&&Zl(n)!==Zl(this.settings)&&this.resetAveraging(),this.settings=n,(s||i)&&this.averagedFrame&&(this.pendingFrame=Kl(this.averagedFrame,this.settings),this.scheduleRender())}resetAveraging(){this.workerGeneration+=1,this.averagedFrame=null,this.pendingFrame=null,this.currentAverage=0,this.setCurrentAverage(0)}getAverageCount(){return this.currentAverage}connect(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/spectrumanalyzer?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&(this.reconnectScheduler.connected(),this.setStatus("Spectrum stream connected"))},s.onclose=()=>{if(this.socket===s)if(this.socket=null,this.wantsConnection){const i=this.reconnectScheduler.schedule();this.setStatus(`Spectrum stream closed; reconnecting${i===null?"":` in ${i} ms`}`)}else this.retiredSockets.has(s)||this.setStatus("Spectrum stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Spectrum stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.showScopeBuffer(i.data)}}close(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e&&(this.retiredSockets.add(e),e.close())}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}showScopeBuffer(e){this.workerRequestId+=1,this.fftWorker.postMessage({id:this.workerRequestId,generation:this.workerGeneration,buffer:e,settings:{...this.settings,iqBandwidth:[...this.settings.iqBandwidth]}},[e])}handleWorkerResponse(e){if(e.generation!==this.workerGeneration)return;if(e.error||!e.frame){this.setStatus(e.error??"Invalid spectrum frame");return}const n=e.frame,s=this.averageFrame(n);this.setCurrentAverage(this.currentAverage),this.latestCurveFrame=s,this.pendingFrame=Kl(s,this.settings),this.scheduleRender(),this.setStatus(`Spectrum frame ${n.sequence}, ${n.x.length} bins, RBW ${Rf(n.rbw)} Hz`)}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.workerGeneration+=1,this.fftWorker.terminate(),this.plot.destroy()}getSeriesCount(){return this.latestFrame?.series.length??0}getBinCount(){return this.latestFrame?.x.length??0}exportCsv(){if(!this.latestFrame)return`frequency
`;const n=[`frequency,${this.latestFrame.series.map(s=>s.label).join(",")}`];for(let s=0;s<this.latestFrame.x.length;s+=1)n.push([this.latestFrame.x[s],...this.latestFrame.series.map(i=>i.values[s]??"")].join(","));return`${n.join(`
`)}
`}getCurveData(){if(!this.latestCurveFrame)return null;const e=lu(this.latestCurveFrame.series,this.settings);return{x:Array.from(this.latestCurveFrame.x),series:e.map(n=>({label:n.label,values:Array.from(n.values),...n.imaginary?{imaginary:Array.from(n.imaginary)}:{}})),unit:"Vpk^2"}}getCurveParameters(){return{baseband:this.settings.baseband,span:this.settings.span,center:this.settings.center,window:this.settings.window,display_unit:this.settings.displayUnit,trace_average:this.settings.traceAverage,display_input1_baseband:this.settings.displayInput1Baseband,display_input2_baseband:this.settings.displayInput2Baseband,display_cross_amplitude:this.settings.displayCrossAmplitude}}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}resetZoom(){this.latestFrame&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(this.latestFrame)),this.plot.setScale("y",this.defaultYScale(this.latestFrame))})}zoom(e){const{min:n,max:s}=this.getXRange(),i=(n+s)/2,a=Math.max(this.minimumXSpan(),(s-n)*e);this.setXScale(i-a/2,i+a/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-12,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??-120),max:Number(e.max??20)}}options(e,n){return{width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1},y:{auto:!1}},axes:[mt({label:"Frequency (Hz)"}),mt({label:e})],series:[{},...n.map((s,i)=>({label:s,stroke:i===0?je.green:i===1?je.blue:je.yellow,width:1.4,points:{show:!1}}))]}}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=e.series.map(o=>o.label),s=n.join("\0")!==this.labels.join("\0"),i=e.unit!==this.unit,a=this.latestFrame===null;this.latestFrame=e,s||i?(this.labels=n.length?n:["Spectrum"],this.unit=e.unit,this.plot.destroy(),this.plot=new Te(this.options(e.unit,this.labels),this.frameData(e),this.host),this.bindInteractions(),this.scheduleResize()):this.plot.setData(this.frameData(e),!1),(a||s||i)&&this.resetZoom(),this.plot.redraw(!0,!0)}frameData(e){return e.x.length&&e.series.length?[e.x,...e.series.map(n=>n.values)]:Gl}averageFrame(e){const n=Math.max(1,this.settings.traceAverage),s=this.averagedFrame&&this.averagedFrame.x.length===e.x.length&&this.averagedFrame.series.length===e.series.length&&this.averagedFrame.series.every((l,u)=>l.values.length===e.series[u].values.length&&!!l.imaginary==!!e.series[u].imaginary&&(!l.imaginary||l.imaginary.length===e.series[u].imaginary.length));if(n<=1||!s)return this.averagedFrame=$f(e),this.currentAverage=1,e;const i=Math.min(this.currentAverage+1,n),a=i-1,o=e.series.map((l,u)=>{const d=this.averagedFrame.series[u].values,v=new Float64Array(l.values.length);for(let f=0;f<v.length;f+=1)v[f]=(d[f]*a+l.values[f])/i;let m;if(l.imaginary){const f=this.averagedFrame.series[u].imaginary;m=new Float64Array(l.imaginary.length);for(let y=0;y<m.length;y+=1)m[y]=(f[y]*a+l.imaginary[y])/i}return{label:l.label,values:v,...m?{imaginary:m}:{}}});return this.averagedFrame={...e,x:e.x,series:o},this.currentAverage=i,this.averagedFrame}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=window.requestAnimationFrame(()=>{this.resizeFrame=null;const e=Math.max(320,Math.floor(this.host.clientWidth)),n=Math.max(240,Math.floor(this.host.clientHeight));e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(!this.latestFrame)return;const s=this.defaultXScale(this.latestFrame),i=this.minimumXSpan(),a=Math.min(s.max-s.min,Math.max(i,n-e));let o=e,l=e+a;o<s.min&&(l+=s.min-o,o=s.min),l>s.max&&(o-=l-s.max,l=s.max),this.plot.setScale("x",{min:Math.max(s.min,o),max:Math.min(s.max,l)})}setYScale(e,n){const s=Math.max(1e-12,n-e);this.plot.setScale("y",{min:e,max:e+s})}minimumXSpan(){return!this.latestFrame||this.latestFrame.x.length<2?Number.EPSILON:Math.max(Number.EPSILON,Math.abs(this.latestFrame.x[this.latestFrame.x.length-1]-this.latestFrame.x[0])/1024)}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-12,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){return this.latestFrame&&this.latestFrame.x.length?this.latestFrame.x[this.latestFrame.x.length-1]:1}defaultXScale(e){return e.x.length?{min:e.x[0],max:e.x[e.x.length-1]}:{min:0,max:1}}defaultYScale(e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const a of e.series)for(const o of a.values)Number.isFinite(o)&&(n=Math.min(n,o),s=Math.max(s,o));if(n===Number.POSITIVE_INFINITY||s===Number.NEGATIVE_INFINITY)return{min:-120,max:20};const i=Math.max(1e-9,(s-n)*.08);return{min:n-i,max:s+i}}}function Nf(t,e,n){const s=new Float64Array(t.length);for(let i=0;i<t.length;i+=1){const a=Math.max(t[i],Number.EPSILON);e==="dB(Vpk^2)"?s[i]=10*Math.log10(a):e==="Vpk"?s[i]=Math.sqrt(a):e==="Vrms^2"?s[i]=a/2:e==="dB(Vrms^2)"?s[i]=10*Math.log10(a/2+Number.EPSILON):e==="Vrms"?s[i]=Math.sqrt(a)/Math.SQRT2:e==="Vrms^2/Hz"?s[i]=a/2/Math.max(n,Number.EPSILON):e==="dB(Vrms^2/Hz)"?s[i]=10*Math.log10(a/2/Math.max(n,Number.EPSILON)+Number.EPSILON):e==="Vrms/sqrt(Hz)"?s[i]=Math.sqrt(a)/Math.SQRT2/Math.max(n,Number.EPSILON):s[i]=a}return s}function $f(t){return{...t,x:t.x,series:t.series.map(e=>({label:e.label,values:new Float64Array(e.values),...e.imaginary?{imaginary:new Float64Array(e.imaginary)}:{}}))}}function Kl(t,e){const n=lu(t.series,e);return{...t,unit:e.displayUnit,series:n.map(s=>({label:s.label,values:Nf(s.imaginary?If(s.values,s.imaginary):s.values,e.displayUnit,t.rbw)}))}}function Zl(t){return[t.baseband,t.span,t.center,t.window,t.iqBandwidth.join(",")].join("|")}function lu(t,e){return e.baseband?t.filter(n=>n.label==="Input 1"?e.displayInput1Baseband:n.label==="Input 2"?e.displayInput2Baseband:n.label==="Cross"?e.displayCrossAmplitude:!0):t}function If(t,e){const n=new Float64Array(t.length);for(let s=0;s<n.length;s+=1)n[s]=Math.hypot(t[s],e[s]);return n}function Rf(t){return Number.isFinite(t)?Math.abs(t)>=1e3?t.toExponential(3):t.toFixed(3):"0"}const Jl=[new Float64Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0)],Of=[{name:"complex_poles",label:"Complex Poles",kind:"pole",complex:!0},{name:"complex_zeros",label:"Complex Zeros",kind:"zero",complex:!0},{name:"real_poles",label:"Real Poles",kind:"pole",complex:!1},{name:"real_zeros",label:"Real Zeros",kind:"zero",complex:!1}];class Df{constructor(e,n,s){this.host=e,this.setAttribute=n,this.setStatus=s,this.host.innerHTML=`
      <div class="iir-plot-toolbar">
        <button id="iir-zoom-reset" type="button">Reset</button>
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
      <div class="iir-list-grid"></div>
    `;const i=this.host.querySelector('[data-iir-plot="magnitude"]'),a=this.host.querySelector('[data-iir-plot="phase"]');if(!i||!a)throw new Error("Missing IIR plot hosts");this.magnitudeHost=i,this.phaseHost=a,this.magnitudePlot=new Te(this.options("Magnitude (dB)","dB"),Jl,i),this.phasePlot=new Te(this.options("Phase (deg)","deg"),Jl,a),this.installPlotEvents(this.magnitudePlot),this.installPlotEvents(this.phasePlot),this.host.querySelector("#iir-zoom-reset")?.addEventListener("click",()=>this.resetZoom()),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),this.scheduleResize()}host;setAttribute;setStatus;magnitudePlot;phasePlot;magnitudeHost;phaseHost;latest=null;selectedKey=null;resizeFrame=null;resizeObserver=null;clickTimer=null;markerDrag=null;panState=null;zoomState=null;userView=!1;suppressNextClick=!1;windowMouseMove=e=>{const n=this.panState?.plot??this.zoomState?.plot;n&&this.handlePointerMove(n,e)};windowMouseUp=()=>{const e=this.panState?.plot??this.zoomState?.plot;e&&this.endMouseInteraction(e)};async refresh(){const e=await fetch("/api/modules/iir/plot");if(!e.ok)throw new Error(`IIR plot unavailable: ${e.status}`);this.latest=await e.json();const n=Float64Array.from(this.latest.x,y=>Math.log10(Math.max(y,Number.MIN_VALUE))),s=Float32Array.from(this.latest.magnitude),i=Float32Array.from(this.latest.phase),a=Os(this.latest.data_magnitude),o=Os(this.latest.data_phase),l=Os(this.latest.product_magnitude),u=Os(this.latest.product_phase),d=Os(this.latest.measurement_magnitude),v=Os(this.latest.measurement_phase),m=!this.userView||this.magnitudePlot.data[0].length===0;this.magnitudePlot.setData([n,s,a,l,d],!1),this.phasePlot.setData([n,i,o,u,v],!1),m?this.applyDefaultScales():this.linkXScale(this.getXRange()),this.renderMarkers(),this.renderListEditors();const f=this.latest.data_curve_name?` | ${this.latest.data_curve_name}`:"";this.plotStatus().textContent=`${this.latest.tf_type} | ${this.latest.markers.length} pole/zero marker(s)${f}`}destroy(){this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.removeWindowMouseCapture(),this.resizeObserver?.disconnect(),this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.resizeFrame!==null&&cancelAnimationFrame(this.resizeFrame)}options(e,n){return{width:360,height:220,title:e,cursor:{drag:{x:!1,y:!1,setScale:!1}},scales:{x:{time:!1},y:{auto:!1}},axes:[mt({label:"Frequency",values:(s,i)=>i.map(a=>ho(10**a))}),mt({label:n})],series:[{},{label:"Filter design",stroke:je.yellow,width:2},{label:"Data curve",stroke:je.green,width:1.5},{label:"Data x filter",stroke:je.red,width:1.5},{label:"Measurement",stroke:je.orange,width:0,points:{show:!0,size:4,width:1,stroke:je.orange}}],hooks:{draw:[()=>this.renderMarkers()]}}}installPlotEvents(e){const n=e.root;n.addEventListener("contextmenu",i=>i.preventDefault(),{capture:!0}),n.addEventListener("wheel",i=>{i.preventDefault();const a=Math.exp(i.deltaY/500);this.zoomAroundPointer(e,i,a,a)},{passive:!1}),n.addEventListener("pointerdown",i=>{this.startMouseNavigation(e,i)&&n.setPointerCapture(i.pointerId)},{capture:!0}),n.addEventListener("pointermove",i=>this.handlePointerMove(e,i),{capture:!0});const s=i=>this.endPointerInteraction(e,i);n.addEventListener("pointerup",s,{capture:!0}),n.addEventListener("pointercancel",s,{capture:!0}),n.addEventListener("mousedown",i=>{!this.panState&&!this.zoomState&&this.startMouseNavigation(e,i)},{capture:!0}),n.addEventListener("dblclick",i=>{this.clickTimer!==null&&(window.clearTimeout(this.clickTimer),this.clickTimer=null),this.handlePlotClick(e,i,!0).catch(a=>this.setStatus(a.message))}),n.addEventListener("click",i=>{if(this.suppressNextClick){this.suppressNextClick=!1;return}i.detail>1||(this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.clickTimer=window.setTimeout(()=>{this.clickTimer=null,this.handlePlotClick(e,i,!1).catch(a=>this.setStatus(a.message))},220))}),n.addEventListener("mousemove",i=>{this.markerDrag?this.moveDraggedMarker(i):(!this.panState&&!this.zoomState&&i.buttons&&this.startMouseMoveNavigation(e,i),this.handlePointerMove(e,i))},{capture:!0}),n.addEventListener("mouseup",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)},{capture:!0}),n.addEventListener("mouseleave",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)})}async handlePlotClick(e,n,s){if(!this.latest||n.defaultPrevented)return;const i=this.frequencyFromEvent(e,n);if(n.ctrlKey||n.metaKey)await this.addMarker("poles",i,s);else if(n.shiftKey)await this.addMarker("zeros",i,s);else{const a=this.nearestMarker(i);a&&(this.selectedKey=po(a),this.renderMarkers(),this.renderListEditors())}}async addMarker(e,n,s){if(this.latest){if(s){const i=e==="poles"?"complex_poles":"complex_zeros",a=[...this.latest.state[i],ec(-n/10,n)];await this.setAttribute(i,a)}else{const i=e==="poles"?"real_poles":"real_zeros",a=[...this.latest.state[i],-n];await this.setAttribute(i,a)}await this.refresh()}}renderMarkers(){this.latest&&(this.renderMarkersForPlot(this.magnitudePlot,"magnitude"),this.renderMarkersForPlot(this.phasePlot,"phase"))}renderMarkersForPlot(e,n){const s=Array.from(e.over.querySelectorAll(".iir-marker"));for(const i of s)i.remove();for(const i of this.latest?.markers??[]){const a=Math.max(i.frequency,Number.MIN_VALUE),o=e.valToPos(Math.log10(a),"x"),l=e.valToPos(n==="magnitude"?i.magnitude:i.phase,"y");if(!Number.isFinite(o)||!Number.isFinite(l))continue;const u=document.createElement("button");u.type="button",u.className=`iir-marker is-${i.kind} is-${i.shape}`,u.classList.toggle("is-selected",this.selectedKey===po(i)),u.style.left=`${o}px`,u.style.top=`${l}px`,u.title=`${i.list}[${i.index}] ${ho(i.frequency)}`,u.textContent=i.kind==="pole"?"x":"o",u.addEventListener("mousedown",d=>{d.preventDefault(),d.stopPropagation(),this.selectedKey=po(i),this.markerDrag={marker:i,plot:e},u.classList.add("is-dragging"),this.renderListEditors()}),u.addEventListener("pointerdown",d=>d.stopPropagation()),e.over.appendChild(u)}}renderListEditors(){const e=this.host.querySelector(".iir-list-grid");if(!(!e||!this.latest)){e.textContent="";for(const n of Of){const s=[...this.latest.state[n.name]],i=document.createElement("section");i.className="iir-list-editor",i.dataset.list=n.name;const a=document.createElement("header"),o=document.createElement("span");o.textContent=n.label;const l=document.createElement("input");l.type="number",l.min="0",l.max="64",l.step="1",l.value=String(s.length),l.id=`iir-${n.name.replaceAll("_","-")}-count`,l.addEventListener("change",()=>{this.setListCount(n.name,Number(l.value)).catch(f=>this.setStatus(f.message))});const u=document.createElement("button");u.type="button",u.textContent="+",u.title=`Add ${n.label.slice(0,-1).toLowerCase()}`,u.addEventListener("click",()=>{this.appendListValue(n.name).catch(f=>this.setStatus(f.message))});const d=document.createElement("button");d.type="button",d.textContent="-",d.title=`Remove selected ${n.label.slice(0,-1).toLowerCase()}`,d.disabled=s.length===0,d.addEventListener("click",()=>{this.removeListValue(n.name).catch(f=>this.setStatus(f.message))}),a.append(o,l,u,d),i.appendChild(a);const v=document.createElement("input");v.type="text",v.id=`iir-${n.name.replaceAll("_","-")}`,v.value=s.join(", "),v.addEventListener("change",()=>{const f=n.complex?nc(v.value):nc(v.value).map(Number);this.setList(n.name,f).catch(y=>this.setStatus(y.message))}),i.appendChild(v);const m=document.createElement("div");m.className="iir-list-values",s.forEach((f,y)=>{const A=document.createElement("label");A.className="iir-list-value";const R=`${n.name}:${y}`;A.classList.toggle("is-selected",this.selectedKey===R);const L=document.createElement("span");L.textContent=String(y);const _=document.createElement("input");_.type=n.complex?"text":"number",_.step="any",_.value=String(f),_.addEventListener("focus",()=>{this.selectedKey=R,this.renderMarkers(),this.renderListEditors()}),_.addEventListener("change",()=>{const M=[...this.latest.state[n.name]];M[y]=n.complex?_.value:Number(_.value),this.setList(n.name,M).catch(O=>this.setStatus(O.message))}),A.append(L,_),m.appendChild(A)}),i.appendChild(m),e.appendChild(i)}}}async appendListValue(e){if(!this.latest)return;const n=[...this.latest.state[e],tc(e)];await this.setList(e,n)}async removeListValue(e){if(!this.latest)return;const n=[...this.latest.state[e]],s=this.selectedKey?.startsWith(`${e}:`)?Number(this.selectedKey.split(":")[1]):n.length-1;s>=0&&s<n.length&&(n.splice(s,1),this.selectedKey=null,await this.setList(e,n))}async setListCount(e,n){if(!this.latest)return;const s=Math.max(0,Math.min(64,Math.round(Number.isFinite(n)?n:0))),i=[...this.latest.state[e]];for(;i.length<s;)i.push(tc(e));i.length=s,await this.setList(e,i)}async setList(e,n){await this.setAttribute(e,n),await this.refresh()}moveDraggedMarker(e){const n=this.markerDrag;if(!n)return;const s=this.frequencyFromEvent(n.plot,e);this.plotStatus().textContent=`drag ${n.marker.list}[${n.marker.index}] to ${ho(s)}`}async finishDraggedMarker(e){const n=this.markerDrag;if(this.markerDrag=null,!n||!this.latest)return;const s=this.frequencyFromEvent(n.plot,e),i=n.marker;if(i.list==="real_poles"||i.list==="real_zeros"){const a=[...this.latest.state[i.list]];a[i.index]=-s,await this.setAttribute(i.list,a)}else{const a=[...this.latest.state[i.list]],o=Bf(String(a[i.index]));a[i.index]=ec(o.real,s),await this.setAttribute(i.list,a)}await this.refresh()}nearestMarker(e){if(!this.latest?.markers.length)return null;let n=this.latest.markers[0],s=1/0;for(const i of this.latest.markers){const a=Math.max(i.frequency,e)/Math.max(Number.MIN_VALUE,Math.min(i.frequency,e));a<s&&(n=i,s=a)}return n}frequencyFromEvent(e,n){const s=e.over.getBoundingClientRect(),i=Math.max(0,Math.min(s.width,n.clientX-s.left));return 10**Number(e.posToVal(i,"x"))}resetZoom(){this.latest&&(this.userView=!1,this.applyDefaultScales(),this.renderMarkers())}getXRange(){const e=this.magnitudePlot.scales.x;return{min:Number(e.min??this.defaultXScale().min),max:Number(e.max??this.defaultXScale().max)}}getMagnitudeYRange(){return this.getYRange(this.magnitudePlot)}getPhaseYRange(){return this.getYRange(this.phasePlot)}handlePointerMove(e,n){if(this.panState?.plot===e){const s=Math.max(1,e.bbox.width/(devicePixelRatio||1)),i=Math.max(1,e.bbox.height/(devicePixelRatio||1)),a=n.clientX-this.panState.startX,o=n.clientY-this.panState.startY;this.panState.moved||=Math.abs(a)>3||Math.abs(o)>3;const l=this.panState.xMax-this.panState.xMin,u=this.panState.yMax-this.panState.yMin,d=a/s*l,v=o/i*u;this.setXScale(this.panState.xMin-d,this.panState.xMax-d),this.setYScale(e,this.panState.yMin+v,this.panState.yMax+v)}else if(this.zoomState?.plot===e){const s=n.clientX-this.zoomState.startX,i=n.clientY-this.zoomState.startY;this.zoomState.moved||=Math.abs(s)>3||Math.abs(i)>3;const a=Math.exp(-s/260),o=Math.exp(i/260);this.zoomAroundStartScale(e,this.zoomState,a,o)}}startMouseNavigation(e,n){if(n.target.closest(".iir-marker")||n.ctrlKey||n.metaKey||n.shiftKey)return!1;const{min:s,max:i}=this.getXRange(),{min:a,max:o}=this.getYRange(e);return n.button===0?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture(),!0):n.button===1||n.button===2?(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture(),!0):!1}startMouseMoveNavigation(e,n){(n.buttons&1)===1?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture()):((n.buttons&2)===2||(n.buttons&4)===4)&&(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture())}getXRangeAsStart(e){const{min:n,max:s}=this.getXRange(),{min:i,max:a}=this.getYRange(e);return{xMin:n,xMax:s,yMin:i,yMax:a}}endPointerInteraction(e,n){const s=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;if(this.panState?.plot===e||this.zoomState?.plot===e){try{e.root.releasePointerCapture(n.pointerId)}catch{}this.userView||=!!s,this.suppressNextClick||=!!s}this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}endMouseInteraction(e){const n=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;this.userView||=!!n,this.suppressNextClick||=!!n,this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}addWindowMouseCapture(){window.addEventListener("mousemove",this.windowMouseMove),window.addEventListener("mouseup",this.windowMouseUp)}removeWindowMouseCapture(){window.removeEventListener("mousemove",this.windowMouseMove),window.removeEventListener("mouseup",this.windowMouseUp)}zoomAroundPointer(e,n,s,i){const a=e.over.getBoundingClientRect(),o=Math.max(0,Math.min(a.width,n.clientX-a.left)),l=Math.max(0,Math.min(a.height,n.clientY-a.top)),u=Number(e.posToVal(o,"x")),d=Number(e.posToVal(l,"y")),{min:v,max:m}=this.getXRange(),{min:f,max:y}=this.getYRange(e),A=(u-v)/Math.max(Number.EPSILON,m-v),R=(d-f)/Math.max(Number.EPSILON,y-f),L=Math.max(this.minimumXSpan(),(m-v)*s),_=Math.max(1e-12,(y-f)*i);this.setXScale(u-L*A,u+L*(1-A)),this.setYScale(e,d-_*R,d+_*(1-R)),this.userView=!0}zoomAroundStartScale(e,n,s,i){const a=(n.xMin+n.xMax)/2,o=(n.yMin+n.yMax)/2,l=Math.max(this.minimumXSpan(),(n.xMax-n.xMin)*s),u=Math.max(1e-12,(n.yMax-n.yMin)*i);this.setXScale(a-l/2,a+l/2),this.setYScale(e,o-u/2,o+u/2)}setXScale(e,n){const s=this.defaultXScale(),i=Math.min(s.max-s.min,Math.max(this.minimumXSpan(),n-e));let a=e,o=e+i;a<s.min&&(o+=s.min-a,a=s.min),o>s.max&&(a-=o-s.max,o=s.max),this.linkXScale({min:Math.max(s.min,a),max:Math.min(s.max,o)})}setYScale(e,n,s){const i=Math.max(1e-12,s-n);e.setScale("y",{min:n,max:n+i}),this.renderMarkers()}linkXScale(e){this.magnitudePlot.setScale("x",e),this.phasePlot.setScale("x",e),this.renderMarkers()}getYRange(e){const n=e.scales.y,s=e===this.magnitudePlot?this.yScale(Float32Array.from(this.latest?.magnitude??[])):this.yScale(Float32Array.from(this.latest?.phase??[]));return{min:Number(n.min??s.min),max:Number(n.max??s.max)}}applyDefaultScales(){if(!this.latest)return;const e=this.defaultXScale();this.magnitudePlot.batch(()=>{this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",this.yScale(Float32Array.from(this.latest.magnitude)))}),this.phasePlot.batch(()=>{this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",this.yScale(Float32Array.from(this.latest.phase)))})}defaultXScale(){const e=this.latest?.x??[],n=e.length?Math.max(Number.MIN_VALUE,e[0]):10,s=e.length?Math.max(n*1.000001,e[e.length-1]):5e6;return{min:Math.log10(n),max:Math.log10(s)}}minimumXSpan(){const{min:e,max:n}=this.defaultXScale();return Math.max(Number.EPSILON,(n-e)/1024)}yScale(e){if(!e.length)return{min:-260,max:20};let n=1/0,s=-1/0;for(const a of e)Number.isFinite(a)&&(n=Math.min(n,a),s=Math.max(s,a));if(!Number.isFinite(n)||!Number.isFinite(s))return{min:-260,max:20};Math.abs(s-n)<1e-9&&(n-=1,s+=1);const i=(s-n)*.1;return{min:n-i,max:s+i}}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=Ql(this.magnitudeHost),n=Ql(this.phaseHost);!e||!n||(this.magnitudePlot.setSize(e),this.phasePlot.setSize(n),this.renderMarkers())}))}plotStatus(){const e=this.host.querySelector(".iir-plot-status");if(!e)throw new Error("Missing IIR plot status");return e}}function Ql(t){const e=t.getBoundingClientRect(),n=Math.floor(e.width),s=Math.floor(e.height);return n<40||s<40?null:{width:n,height:s}}function Os(t){return Float32Array.from(t,e=>e===null?Number.NaN:e)}function po(t){return`${t.list}:${t.index}`}function ec(t,e){return`${Li(t)}+${Li(Math.abs(e))}j`}function tc(t){return t.startsWith("complex")?"-1000+10000j":-1e4}function nc(t){return t.split(",").map(e=>e.trim()).filter(Boolean)}function Bf(t){const n=t.trim().replace("i","j").match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]\d+(?:\.\d+)?(?:e[+-]?\d+)?)j$/i);return n?{real:Number(n[1]??0),imag:Number(n[2])}:{real:-1,imag:1}}function Li(t){return Number(t.toPrecision(8)).toString()}function ho(t){return t>=1e6?`${Li(t/1e6)} MHz`:t>=1e3?`${Li(t/1e3)} kHz`:`${Li(t)} Hz`}class qf{constructor(e){this.elements=e,e.classSelect.addEventListener("change",()=>{this.setClass(e.classSelect.value).catch(n=>{this.setStatus(n.message)})}),e.addStage.addEventListener("click",()=>{this.requestSchema("/api/lockbox/stages",{method:"POST"}).catch(n=>{this.setStatus(n.message)})}),e.inputPlotSelect.addEventListener("change",()=>{this.refreshInputPlot().catch(n=>this.setStatus(n.message))}),e.outputPlotSelect.addEventListener("change",()=>{this.refreshOutputPlot().catch(n=>this.setStatus(n.message))})}elements;schema=null;inputPlot=null;outputMagnitudePlot=null;outputPhasePlot=null;async load(){const[e,n]=await Promise.all([fetch("/api/lockbox"),fetch("/api/lockbox/actions")]);if(!e.ok||!n.ok)throw new Error("Lockbox controls unavailable");const s=await e.json(),i=await n.json();this.renderActions(i.actions??[]),await this.applySchema(s)}async applySchema(e){this.schema=e,e.actions&&this.renderActions(e.actions),this.populateClassSelect(e),this.renderLockboxAttributes(e.attributes),this.renderInputs(e.inputs),this.renderOutputs(e.outputs),this.renderStages(e.sequence),this.populatePlotSelect(this.elements.inputPlotSelect,e.inputs.map(n=>n.name)),this.populatePlotSelect(this.elements.outputPlotSelect,e.outputs.map(n=>n.name)),this.setStatus(`${e.classname}: ${e.state.current_state??"ready"} | ${e.state.lock_status?"locked":"not locked"}`),await Promise.all([this.refreshInputPlot(),this.refreshOutputPlot()])}refreshLayout(){this.inputPlot?.setSize(this.plotSize(this.elements.inputPlot));const e=this.elements.outputPlot.querySelectorAll(".lockbox-output-plot-frame");e[0]&&this.outputMagnitudePlot?.setSize(this.plotSize(e[0])),e[1]&&this.outputPhasePlot?.setSize(this.plotSize(e[1]))}getStageCount(){return this.schema?.sequence.length??0}getClassname(){return this.schema?.classname??null}populateClassSelect(e){const s=e.attributes.find(i=>i.name==="classname")?.options??[e.classname];this.elements.classSelect.textContent="";for(const i of s){const a=document.createElement("option");a.value=String(i),a.textContent=String(i),this.elements.classSelect.appendChild(a)}this.elements.classSelect.value=e.classname}populatePlotSelect(e,n){const s=e.value;e.textContent="";for(const i of n){const a=document.createElement("option");a.value=i,a.textContent=i,e.appendChild(a)}e.value=n.includes(s)?s:n[0]??""}renderActions(e){this.elements.actions.textContent="";for(const n of e){const s=document.createElement("button");s.type="button",s.textContent=n.label??n.name,s.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/actions/${n.name}`,{method:"POST"}).catch(i=>{this.setStatus(i.message)})}),this.elements.actions.appendChild(s)}}renderLockboxAttributes(e){const n=this.elements.root.querySelector("#lockbox-attributes");if(n){n.textContent="";for(const s of e)s.name!=="classname"&&n.appendChild(this.createAttributeField(s,i=>this.requestSchema(`/api/lockbox/attributes/${s.name}`,this.valueRequest(i))))}}renderInputs(e){this.elements.inputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"input");s.dataset.nodeName=n.name;const i=document.createElement("button");i.type="button",i.textContent="Calibrate",i.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/actions/calibrate`,{method:"POST"}).catch(o=>this.setStatus(o.message))}),s.querySelector(".lockbox-card-title")?.appendChild(i);const a=document.createElement("div");a.className="lockbox-control-row";for(const o of n.attributes)a.appendChild(this.createAttributeField(o,l=>this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/attributes/${o.name}`,this.valueRequest(l))));if(s.appendChild(a),n.calibration){const o=document.createElement("output");o.textContent=Object.entries(n.calibration).filter(([,l])=>typeof l=="number").slice(0,4).map(([l,u])=>`${l} ${Number(u).toPrecision(3)}`).join(" | "),s.appendChild(o)}this.elements.inputs.appendChild(s)}}renderOutputs(e){this.elements.outputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"output");s.dataset.nodeName=n.name;const i=document.createElement("div");i.className="lockbox-control-row";const a=!!n.attributes.find(l=>l.name==="assisted_design")?.value,o=String(n.attributes.find(l=>l.name==="tf_type")?.value??"filter");for(const l of n.attributes){const u=this.createAttributeField(l,d=>this.requestSchema(`/api/lockbox/outputs/${encodeURIComponent(n.name)}/attributes/${l.name}`,this.valueRequest(d)));["p","i"].includes(l.name)&&this.setFieldDisabled(u,a),["desired_unity_gain_frequency","analog_filter_cutoff"].includes(l.name)&&this.setFieldDisabled(u,!a),l.name==="tf_curve"&&this.setFieldDisabled(u,o!=="curve"),i.appendChild(u)}s.appendChild(i),this.elements.outputs.appendChild(s)}}renderStages(e){this.elements.stages.textContent="",e.forEach((n,s)=>{const i=this.createSectionCard(n.name,`stage ${s}`),a=document.createElement("button");a.type="button",a.textContent="Delete",a.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}`,{method:"DELETE"}).catch(v=>{this.setStatus(v.message)})});const o=document.createElement("button");o.type="button",o.textContent="Go to this stage",o.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}/actions/execute`,{method:"POST"}).catch(v=>this.setStatus(v.message))});const l=document.createElement("div");l.className="lockbox-card-actions",l.append(o,a),i.querySelector(".lockbox-card-title")?.appendChild(l);const u=document.createElement("div");u.className="lockbox-control-row";for(const v of n.attributes)u.appendChild(this.createAttributeField(v,m=>this.requestSchema(`/api/lockbox/stages/${s}/attributes/${v.name}`,this.valueRequest(m))));i.appendChild(u);const d=document.createElement("div");d.className="lockbox-stage-output-grid";for(const v of n.outputs){const m=document.createElement("section");m.className="lockbox-stage-output";const f=document.createElement("h4");f.textContent=v.output,m.appendChild(f);for(const y of v.attributes)m.appendChild(this.createAttributeField(y,A=>this.requestSchema(`/api/lockbox/stages/${s}/outputs/${encodeURIComponent(v.output)}/attributes/${y.name}`,this.valueRequest(A))));d.appendChild(m)}i.appendChild(d),this.elements.stages.appendChild(i)})}createSectionCard(e,n){const s=document.createElement("section");s.className="lockbox-card";const i=document.createElement("header");i.className="lockbox-card-title";const a=document.createElement("h3");a.textContent=e;const o=document.createElement("span");return o.textContent=n,i.append(a,o),s.appendChild(i),s}createAttributeField(e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");for(const l of e.options??[]){const u=document.createElement("option");u.value=String(l),u.textContent=String(l),o.appendChild(u)}o.value=String(e.value),o.addEventListener("change",()=>{const l=this.selectValue(o.value,e.options??[]);n(l).catch(u=>this.setStatus(u.message))}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{n(o.checked).catch(l=>this.setStatus(l.message))}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",o.value=String(e.value),e.min!==void 0&&(o.min=String(e.min)),e.max!==void 0&&(o.max=String(e.max)),e.step!==void 0&&(o.step=String(e.step)),o.addEventListener("change",()=>{n(Number(o.value)).catch(l=>this.setStatus(l.message))}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Array.isArray(e.value)?e.value.join(", "):String(e.value??""),o.addEventListener("change",()=>{n(this.textValue(o.value)).catch(l=>this.setStatus(l.message))}),a=o}return a.id=`lockbox-${e.name.replaceAll("_","-")}-${crypto.randomUUID()}`,s.appendChild(a),s}setFieldDisabled(e,n){const s=e.querySelector("input, select");s&&(s.disabled=n),e.classList.toggle("is-disabled",n)}selectValue(e,n){return n.find(i=>String(i)===e)??e}textValue(e){const n=e.split(",").map(s=>s.trim()).filter(Boolean);return n.length>1&&n.every(s=>Number.isFinite(Number(s)))?n.map(s=>Number(s)):e}valueRequest(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:e})}}async setClass(e){await this.requestSchema("/api/lockbox/class",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({classname:e})})}async requestSchema(e,n){const s=await fetch(e,n);if(!s.ok)throw new Error(`Lockbox request failed: ${s.status}`);await this.applySchema(await s.json())}async refreshInputPlot(){const e=this.schema?.inputs.find(i=>i.name===this.elements.inputPlotSelect.value)??this.schema?.inputs[0];if(!e)return;const n=await fetch(`/api/lockbox/inputs/${encodeURIComponent(e.name)}/plot`);if(!n.ok)return;const s=await n.json();this.drawInputPlot(this.elements.inputPlot,"Expected Signal",s)}async refreshOutputPlot(){const e=this.schema?.outputs.find(i=>i.name===this.elements.outputPlotSelect.value)??this.schema?.outputs[0];if(!e)return;const n=await fetch(`/api/lockbox/outputs/${encodeURIComponent(e.name)}/transfer_function`);if(!n.ok)return;const s=await n.json();this.drawOutputPlot(this.elements.outputPlot,s)}drawInputPlot(e,n,s){this.inputPlot?.destroy(),e.textContent="";const i=this.plotSize(e),a=new Te({title:n,width:i.width,height:i.height,scales:{x:{time:!1}},series:[{},...s.series.map((o,l)=>({label:o.label,stroke:l===0?je.green:je.blue,width:2}))],axes:[mt(),mt()]},[s.x,...s.series.map(o=>o.values)],e);this.inputPlot=a}drawOutputPlot(e,n){this.outputMagnitudePlot?.destroy(),this.outputPhasePlot?.destroy(),e.textContent="";const s=document.createElement("div"),i=document.createElement("div");s.className="lockbox-output-plot-frame",i.className="lockbox-output-plot-frame",e.append(s,i);const a=n.series.find(l=>l.label==="magnitude")?.values??[],o=n.series.find(l=>l.label==="phase")?.values??[];this.outputMagnitudePlot=new Te({title:"Open-loop magnitude",...this.outputPlotOptions(this.plotSize(s),!0),series:[{},{label:"magnitude",stroke:je.green,width:2}]},[n.x,a.map(l=>Math.max(1e-30,l))],s),this.outputPhasePlot=new Te({title:"Open-loop phase",...this.outputPlotOptions(this.plotSize(i),!1),series:[{},{label:"phase",stroke:je.blue,width:2}]},[n.x,o],i)}outputPlotOptions(e,n){return{width:e.width,height:e.height,scales:{x:{time:!1,distr:3},y:n?{distr:3}:{auto:!0}},axes:[mt(),mt()]}}plotSize(e){const n=e.getBoundingClientRect();return{width:Math.max(260,Math.floor(n.width||420)),height:Math.max(180,Math.floor(n.height||220))}}setStatus(e){this.elements.status.textContent=e}}var Ft=typeof window<"u"?window:null,cr=Ft===null,Ni=cr?void 0:Ft.document,qt="addEventListener",Vt="removeEventListener",fo="getBoundingClientRect",yi="_a",Yt="_b",dn="_c",na="horizontal",Ht=function(){return!1},Vf=cr?"calc":["","-webkit-","-moz-","-o-"].filter(function(t){var e=Ni.createElement("div");return e.style.cssText="width:"+t+"calc(9px)",!!e.style.length}).shift()+"calc",cu=function(t){return typeof t=="string"||t instanceof String},sc=function(t){if(cu(t)){var e=Ni.querySelector(t);if(!e)throw new Error("Selector "+t+" did not match a DOM element");return e}return t},at=function(t,e,n){var s=t[e];return s!==void 0?s:n},sa=function(t,e,n,s){if(e){if(s==="end")return 0;if(s==="center")return t/2}else if(n){if(s==="start")return 0;if(s==="center")return t/2}return t},Yf=function(t,e){var n=Ni.createElement("div");return n.className="gutter gutter-"+e,n},Hf=function(t,e,n){var s={};return cu(e)?s[t]=e:s[t]=Vf+"("+e+"% - "+n+"px)",s},jf=function(t,e){var n;return n={},n[t]=e+"px",n},Oi=function(t,e){if(e===void 0&&(e={}),cr)return{};var n=t,s,i,a,o,l,u;Array.from&&(n=Array.from(n));var d=sc(n[0]),v=d.parentNode,m=getComputedStyle?getComputedStyle(v):null,f=m?m.flexDirection:null,y=at(e,"sizes")||n.map(function(){return 100/n.length}),A=at(e,"minSize",100),R=Array.isArray(A)?A:n.map(function(){return A}),L=at(e,"maxSize",1/0),_=Array.isArray(L)?L:n.map(function(){return L}),M=at(e,"expandToMin",!1),O=at(e,"gutterSize",10),P=at(e,"gutterAlign","center"),K=at(e,"snapOffset",30),$=Array.isArray(K)?K:n.map(function(){return K}),ee=at(e,"dragInterval",1),W=at(e,"direction",na),se=at(e,"cursor",W===na?"col-resize":"row-resize"),J=at(e,"gutter",Yf),z=at(e,"elementStyle",Hf),te=at(e,"gutterStyle",jf);W===na?(s="width",i="clientX",a="left",o="right",l="clientWidth"):W==="vertical"&&(s="height",i="clientY",a="top",o="bottom",l="clientHeight");function B(F,S,E,q){var ke=z(s,S,E,q);Object.keys(ke).forEach(function(ue){F.style[ue]=ke[ue]})}function Z(F,S,E){var q=te(s,S,E);Object.keys(q).forEach(function(ke){F.style[ke]=q[ke]})}function V(){return u.map(function(F){return F.size})}function oe(F){return"touches"in F?F.touches[0][i]:F[i]}function H(F){var S=u[this.a],E=u[this.b],q=S.size+E.size;S.size=F/this.size*q,E.size=q-F/this.size*q,B(S.element,S.size,this[Yt],S.i),B(E.element,E.size,this[dn],E.i)}function st(F){var S,E=u[this.a],q=u[this.b];this.dragging&&(S=oe(F)-this.start+(this[Yt]-this.dragOffset),ee>1&&(S=Math.round(S/ee)*ee),S<=E.minSize+E.snapOffset+this[Yt]?S=E.minSize+this[Yt]:S>=this.size-(q.minSize+q.snapOffset+this[dn])&&(S=this.size-(q.minSize+this[dn])),S>=E.maxSize-E.snapOffset+this[Yt]?S=E.maxSize+this[Yt]:S<=this.size-(q.maxSize-q.snapOffset+this[dn])&&(S=this.size-(q.maxSize+this[dn])),H.call(this,S),at(e,"onDrag",Ht)(V()))}function ye(){var F=u[this.a].element,S=u[this.b].element,E=F[fo](),q=S[fo]();this.size=E[s]+q[s]+this[Yt]+this[dn],this.start=E[a],this.end=E[o]}function ce(F){if(!getComputedStyle)return null;var S=getComputedStyle(F);if(!S)return null;var E=F[l];return E===0?null:(W===na?E-=parseFloat(S.paddingLeft)+parseFloat(S.paddingRight):E-=parseFloat(S.paddingTop)+parseFloat(S.paddingBottom),E)}function me(F){var S=ce(v);if(S===null||R.reduce(function(ue,Ie){return ue+Ie},0)>S)return F;var E=0,q=[],ke=F.map(function(ue,Ie){var pt=S*ue/100,It=sa(O,Ie===0,Ie===F.length-1,P),Qt=R[Ie]+It;return pt<Qt?(E+=Qt-pt,q.push(0),Qt):(q.push(pt-Qt),pt)});return E===0?F:ke.map(function(ue,Ie){var pt=ue;if(E>0&&q[Ie]-E>0){var It=Math.min(E,q[Ie]-E);E-=It,pt=ue-It}return pt/S*100})}function ie(){var F=this,S=u[F.a].element,E=u[F.b].element;F.dragging&&at(e,"onDragEnd",Ht)(V()),F.dragging=!1,Ft[Vt]("mouseup",F.stop),Ft[Vt]("touchend",F.stop),Ft[Vt]("touchcancel",F.stop),Ft[Vt]("mousemove",F.move),Ft[Vt]("touchmove",F.move),F.stop=null,F.move=null,S[Vt]("selectstart",Ht),S[Vt]("dragstart",Ht),E[Vt]("selectstart",Ht),E[Vt]("dragstart",Ht),S.style.userSelect="",S.style.webkitUserSelect="",S.style.MozUserSelect="",S.style.pointerEvents="",E.style.userSelect="",E.style.webkitUserSelect="",E.style.MozUserSelect="",E.style.pointerEvents="",F.gutter.style.cursor="",F.parent.style.cursor="",Ni.body.style.cursor=""}function Y(F){if(!("button"in F&&F.button!==0)){var S=this,E=u[S.a].element,q=u[S.b].element;S.dragging||at(e,"onDragStart",Ht)(V()),F.preventDefault(),S.dragging=!0,S.move=st.bind(S),S.stop=ie.bind(S),Ft[qt]("mouseup",S.stop),Ft[qt]("touchend",S.stop),Ft[qt]("touchcancel",S.stop),Ft[qt]("mousemove",S.move),Ft[qt]("touchmove",S.move),E[qt]("selectstart",Ht),E[qt]("dragstart",Ht),q[qt]("selectstart",Ht),q[qt]("dragstart",Ht),E.style.userSelect="none",E.style.webkitUserSelect="none",E.style.MozUserSelect="none",E.style.pointerEvents="none",q.style.userSelect="none",q.style.webkitUserSelect="none",q.style.MozUserSelect="none",q.style.pointerEvents="none",S.gutter.style.cursor=se,S.parent.style.cursor=se,Ni.body.style.cursor=se,ye.call(S),S.dragOffset=oe(F)-S.end}}y=me(y);var Se=[];u=n.map(function(F,S){var E={element:sc(F),size:y[S],minSize:R[S],maxSize:_[S],snapOffset:$[S],i:S},q;if(S>0&&(q={a:S-1,b:S,dragging:!1,direction:W,parent:v},q[Yt]=sa(O,S-1===0,!1,P),q[dn]=sa(O,!1,S===n.length-1,P),f==="row-reverse"||f==="column-reverse")){var ke=q.a;q.a=q.b,q.b=ke}if(S>0){var ue=J(S,W,E.element);Z(ue,O,S),q[yi]=Y.bind(q),ue[qt]("mousedown",q[yi]),ue[qt]("touchstart",q[yi]),v.insertBefore(ue,E.element),q.gutter=ue}return B(E.element,E.size,sa(O,S===0,S===n.length-1,P),S),S>0&&Se.push(q),E});function Ue(F){var S=F.i===Se.length,E=S?Se[F.i-1]:Se[F.i];ye.call(E);var q=S?E.size-F.minSize-E[dn]:F.minSize+E[Yt];H.call(E,q)}u.forEach(function(F){var S=F.element[fo]()[s];S<F.minSize&&(M?Ue(F):F.minSize=S)});function Ce(F){var S=me(F);S.forEach(function(E,q){if(q>0){var ke=Se[q-1],ue=u[ke.a],Ie=u[ke.b];ue.size=S[q-1],Ie.size=E,B(ue.element,ue.size,ke[Yt],ue.i),B(Ie.element,Ie.size,ke[dn],Ie.i)}})}function he(F,S){Se.forEach(function(E){if(S!==!0?E.parent.removeChild(E.gutter):(E.gutter[Vt]("mousedown",E[yi]),E.gutter[Vt]("touchstart",E[yi])),F!==!0){var q=z(s,E.a.size,E[Yt]);Object.keys(q).forEach(function(ke){u[E.a].element.style[ke]="",u[E.b].element.style[ke]=""})}})}return{setSizes:Ce,getSizes:V,collapse:function(S){Ue(u[S])},destroy:he,parent:v,pairs:Se}};class Xf{constructor(e,n,s,i,a,o,l,u,d){this.controlsHost=e,this.magnitudeHost=n,this.phaseHost=s,this.status=i,this.singleButton=a,this.runButton=o,this.stopButton=l,this.saveButton=u,this.resetButton=d,this.reconnectScheduler=new za(()=>this.openSocket()),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.magnitudeHost.parentElement??this.magnitudeHost),this.resizeObserver.observe(this.phaseHost.parentElement??this.phaseHost);const v=this.controlsHost.parentElement,m=this.magnitudeHost.closest(".network-plots");if(!v||!m)throw new Error("Network analyzer split panes are missing");this.controlsPane=v,this.plotsPane=m,this.bindActions(),this.scheduleResize()}controlsHost;magnitudeHost;phaseHost;status;singleButton;runButton;stopButton;saveButton;resetButton;magnitudePlot;phasePlot;socket=null;wantsConnection=!1;reconnectScheduler;runId=-1;x=[];magnitude=[];phase=[];real=[];imaginary=[];redrawFrame=null;resizeFrame=null;userScaled=!1;logscale=!0;lastProgress="";resizeObserver;split=null;controlsPane;plotsPane;async initialize(){const[e,n]=await Promise.all([fetch("/api/modules/networkanalyzer/attributes"),fetch("/api/modules/networkanalyzer")]);if(!e.ok||!n.ok)throw new Error("Network analyzer controls failed to load");const s=await e.json(),i=await n.json();this.renderControls(s.attributes??[]),this.applyState(i.state??i)}applyState(e){const n=String(e.running_state??"stopped")!=="stopped";this.runButton.textContent=n?"Running":"Continuous",this.runButton.disabled=n,this.stopButton.disabled=!n;const s=typeof e.iq_module=="string"?` on ${e.iq_module}`:"",i=`${String(e.running_state??"stopped")}${s}`;this.status.textContent=!n&&this.lastProgress?`${this.lastProgress}, ${i}`:i}refreshLayout(){this.ensureSplit(),this.scheduleResize()}destroy(){this.closeSocket(),this.resizeObserver.disconnect(),this.split?.destroy(),this.magnitudePlot.destroy(),this.phasePlot.destroy()}bindActions(){this.singleButton.addEventListener("click",()=>{this.start("single")}),this.runButton.addEventListener("click",()=>{this.start("continuous")}),this.stopButton.addEventListener("click",()=>{this.stop()}),this.saveButton.addEventListener("click",()=>{this.persistCurve().then(()=>{this.downloadCsv(),this.status.textContent="Curve saved"}).catch(e=>{this.status.textContent=e.message})}),this.resetButton.addEventListener("click",()=>this.resetZoom())}ensureSplit(){this.split||this.controlsPane.closest(".workspace-panel")?.hidden||(this.split=Oi([this.controlsPane,this.plotsPane],{direction:"vertical",sizes:[34,66],minSize:[100,240],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}async start(e){const n=await fetch(`/api/modules/networkanalyzer/actions/${e}`,{method:"POST"});if(!n.ok){this.status.textContent=`Network analyzer ${e} failed: ${n.status}`;return}const s=await n.json();this.applyState(s.state??{}),this.connectSocket()}async stop(){const e=await fetch("/api/modules/networkanalyzer/actions/stop",{method:"POST"});if(e.ok){const n=await e.json();this.applyState(n.state??{})}this.closeSocket()}connectSocket(){this.wantsConnection=!0,!(this.socket&&this.socket.readyState<=WebSocket.OPEN)&&(this.reconnectScheduler.cancel(!1),this.openSocket())}openSocket(){if(!this.wantsConnection||this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=new WebSocket(`${e}://${window.location.host}/ws/networkanalyzer`);this.socket=n,n.addEventListener("open",()=>{this.socket===n&&this.reconnectScheduler.connected()}),n.addEventListener("message",s=>{this.socket===n&&this.showPoint(JSON.parse(String(s.data)))}),n.addEventListener("close",()=>{if(this.socket===n&&(this.socket=null,this.wantsConnection)){const s=this.reconnectScheduler.schedule();this.status.textContent=`Network Analyzer stream closed; reconnecting${s===null?"":` in ${s} ms`}`}})}closeSocket(){this.wantsConnection=!1,this.reconnectScheduler.cancel();const e=this.socket;this.socket=null,e?.close()}showPoint(e){e.run_id!==this.runId&&(this.runId=e.run_id,this.x=new Array(e.points).fill(Number.NaN),this.magnitude=new Array(e.points).fill(Number.NaN),this.phase=new Array(e.points).fill(Number.NaN),this.real=new Array(e.points).fill(Number.NaN),this.imaginary=new Array(e.points).fill(Number.NaN),this.userScaled=!1),this.x[e.index]=e.x;const n=Math.hypot(e.real,e.imag);this.magnitude[e.index]=20*Math.log10(Math.max(n,1e-20)),this.phase[e.index]=Math.atan2(e.imag,e.real)*180/Math.PI,this.real[e.index]=e.real,this.imaginary[e.index]=e.imag,this.logscale!==e.logscale&&(this.logscale=e.logscale,this.recreatePlots()),this.scheduleRedraw();const s=e.time_per_point>0?`${Uf(e.time_per_point*1e3)} ms/point`:"";this.lastProgress=`${e.index+1}/${e.points}, average ${e.current_avg}${s?`, ${s}`:""}`,this.status.textContent=this.lastProgress,e.running_state==="stopped"&&(this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0)}renderControls(e){this.controlsHost.textContent="";const n=[["Channels",["input","output_direct"]],["Frequency",["start_freq","stop_freq","points","logscale"]],["Setup",["amplitude","acbandwidth"]],["Averaging",["average_per_point","rbw","trace_average","curve_name"]],["Auto Bandwidth",["auto_bandwidth","q_factor_min"]],["Auto Amplitude",["auto_amplitude","target_dbv","auto_amp_min","auto_amp_max"]]],s=new Map(e.map(i=>[i.name,i]));for(const[i,a]of n){const o=document.createElement("fieldset");o.className="network-control-group";const l=document.createElement("legend");l.textContent=i,o.appendChild(l);for(const u of a){const d=s.get(u);d&&o.appendChild(this.createControl(d))}this.controlsHost.appendChild(o)}}createControl(e){const n=document.createElement("label"),s=document.createElement("span");s.textContent=e.label,n.appendChild(s);let i;if(e.type==="select"){const a=document.createElement("select");for(const o of e.options??[]){const l=document.createElement("option");l.value=String(o),l.textContent=String(o),a.appendChild(l)}a.value=String(e.value),i=a}else{const a=document.createElement("input");a.type=e.type==="bool"?"checkbox":e.type,a.type==="checkbox"?a.checked=!!e.value:a.value=String(e.value),e.min!==void 0&&(a.min=String(e.min)),e.max!==void 0&&(a.max=String(e.max)),e.step!==void 0&&(a.step=String(e.step)),i=a}return i.id=`networkanalyzer-${e.name.replaceAll("_","-")}`,i.addEventListener("change",()=>{this.writeAttribute(e,i)}),n.appendChild(i),n}async writeAttribute(e,n){const s=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:e.type==="number"?Number(n.value):n.value,i=await fetch(`/api/modules/networkanalyzer/attributes/${e.name}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:s})});if(!i.ok){this.status.textContent=`${e.label} update failed: ${i.status}`;return}this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0,this.status.textContent=`${e.label} updated`}createPlot(e,n,s,i){return new Te({width:800,height:260,title:n,scales:{x:{time:!1,distr:this.logscale?3:1},y:{auto:!0}},axes:[mt({label:i?"Frequency (Hz)":""}),mt({label:s})],series:[{},{label:n,stroke:je.yellow,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}},hooks:{setScale:[(a,o)=>{(o==="x"||o==="y")&&(this.userScaled=!0)}]}},[[],[]],e)}recreatePlots(){this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.scheduleResize()}scheduleRedraw(){this.redrawFrame===null&&(this.redrawFrame=requestAnimationFrame(()=>{this.redrawFrame=null;const e=ic(this.x);this.magnitudePlot.setData([this.x.slice(0,e),this.magnitude.slice(0,e)]),this.phasePlot.setData([this.x.slice(0,e),this.phase.slice(0,e)])}))}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resizePlot(this.magnitudePlot,this.magnitudeHost),this.resizePlot(this.phasePlot,this.phaseHost)}))}resizePlot(e,n){const s=n.parentElement?.getBoundingClientRect();!s||s.width<100||s.height<100||e.setSize({width:Math.floor(s.width),height:Math.floor(s.height)})}resetZoom(){this.userScaled=!1;const e=mo(this.x,0,1),n=mo(this.magnitude,-120,20),s=mo(this.phase,-180,180);this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",n),this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",s)}downloadCsv(){const e=["x,magnitude_db,phase_deg"];for(let i=0;i<this.x.length;i+=1)Number.isFinite(this.x[i])&&e.push(`${this.x[i]},${this.magnitude[i]},${this.phase[i]}`);const n=URL.createObjectURL(new Blob([`${e.join(`
`)}
`],{type:"text/csv"})),s=document.createElement("a");s.href=n,s.download=`network-analyzer-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`,s.click(),URL.revokeObjectURL(n)}async persistCurve(){const e=ic(this.x);if(e===0)throw new Error("No network analyzer curve to save");const n=this.controlsHost.querySelector("#networkanalyzer-curve-name"),s=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:this.x.slice(0,e),y:this.real.slice(0,e),y_imag:this.imaginary.slice(0,e),params:{...this.currentControlParameters(),name:n?.value||"networkanalyzer curve",module:"networkanalyzer"}})});if(!s.ok)throw new Error(`Save curve failed: ${s.status}`)}currentControlParameters(){const e={};for(const n of this.controlsHost.querySelectorAll("input, select")){const s=n.id.replace(/^networkanalyzer-/,"").replaceAll("-","_");e[s]=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:n instanceof HTMLInputElement&&n.type==="number"?Number(n.value):n.value}return e}}function Uf(t){return t>=100?t.toFixed(0):t>=10?t.toFixed(1):t.toFixed(2)}function mo(t,e,n){const s=t.filter(Number.isFinite);if(s.length===0)return{min:e,max:n};const i=Math.min(...s),a=Math.max(...s);if(i===a)return{min:i-1,max:a+1};const o=(a-i)*.04;return{min:i-o,max:a+o}}function ic(t){let e=0;for(;e<t.length&&Number.isFinite(t[e]);)e+=1;return e}class Wf{constructor(e,n,s,i,a,o,l,u,d,v,m){this.root=e,this.listPane=n,this.plotPane=s,this.paramsPane=i,this.select=a,this.name=o,this.params=l,this.status=u,this.saveParamsButton=d,this.deleteButton=v,this.refreshButton=m;const f=this.requireHost("#curve-viewer-magnitude"),y=this.requireHost("#curve-viewer-phase");this.magnitudePlot=this.createPlot(f,"Curve","Value"),this.phasePlot=this.createPlot(y,"Phase","deg"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotPane),this.bindActions()}root;listPane;plotPane;paramsPane;select;name;params;status;saveParamsButton;deleteButton;refreshButton;magnitudePlot;phasePlot;split=null;resizeObserver;resizeFrame=null;selected=null;async load(){await this.refreshList()}refreshLayout(){this.ensureSplit(),this.scheduleResize()}bindActions(){this.select.addEventListener("change",()=>{this.loadSelected()}),this.refreshButton.addEventListener("click",()=>{this.refreshList()}),this.saveParamsButton.addEventListener("click",()=>{this.saveParams()}),this.deleteButton.addEventListener("click",()=>{this.deleteSelected()})}async refreshList(){const e=this.select.value,n=await fetch("/api/curves?limit=100");if(!n.ok)throw new Error(`Curve list failed: ${n.status}`);const i=(await n.json()).curves??[];this.select.textContent="";for(const a of i){const o=document.createElement("option");o.value=String(a.pk),o.textContent=`${a.pk}: ${a.name}`,this.select.appendChild(o)}i.some(a=>String(a.pk)===e)?this.select.value=e:i[0]&&(this.select.value=String(i[0].pk)),this.status.textContent=`${i.length} curve${i.length===1?"":"s"}`,i.length?await this.loadSelected():this.clear()}async loadSelected(){if(!this.select.value)return this.clear();const e=await fetch(`/api/curves/${encodeURIComponent(this.select.value)}`);if(!e.ok)throw new Error(`Curve load failed: ${e.status}`);const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.saveParamsButton.disabled=!1,this.deleteButton.disabled=!1;const s=Array.isArray(this.selected.y_imag),i=s?this.selected.y.map((l,u)=>20*Math.log10(Math.max(Math.hypot(l,this.selected.y_imag[u]),1e-20))):this.selected.y,a=s?this.selected.y.map((l,u)=>Math.atan2(this.selected.y_imag[u],l)*180/Math.PI):[];this.magnitudePlot.setData([this.selected.x,i]),this.phasePlot.setData([s?this.selected.x:[],a]);const o=this.phasePlot.root.closest(".curve-viewer-plot-frame");o&&(o.hidden=!s),this.plotPane.classList.toggle("is-complex",s),this.status.textContent=`curve ${this.selected.pk}, ${this.selected.points} points`,this.scheduleResize()}async saveParams(){if(!this.selected)return;const e=await fetch(`/api/curves/${this.selected.pk}/params`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({params_yaml:this.params.value})});if(!e.ok){const s=await e.json().catch(()=>({}));this.status.textContent=s.detail??`Save parameters failed: ${e.status}`;return}const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.status.textContent=`curve ${this.selected.pk} parameters saved`,await this.refreshList()}async deleteSelected(){if(!this.selected)return;const e=this.selected.pk,n=await fetch(`/api/curves/${e}`,{method:"DELETE"});if(!n.ok){this.status.textContent=`Delete curve failed: ${n.status}`;return}this.selected=null,await this.refreshList(),this.status.textContent=`curve ${e} deleted`}clear(){this.selected=null,this.name.value="",this.params.value="",this.magnitudePlot.setData([[],[]]),this.phasePlot.setData([[],[]]),this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0}ensureSplit(){this.split||this.root.hidden||(this.split=Oi([this.listPane,this.plotPane,this.paramsPane],{direction:"horizontal",sizes:[18,57,25],minSize:[140,300,200],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}createPlot(e,n,s){return new Te({width:700,height:260,title:n,scales:{x:{time:!1},y:{auto:!0}},axes:[mt({label:"X"}),mt({label:s})],series:[{},{label:n,stroke:je.green,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}}},[[],[]],e)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=this.plotPane.querySelectorAll(".curve-viewer-plot-frame:not([hidden])"),n=[this.magnitudePlot,this.phasePlot];e.forEach((s,i)=>{const a=s.getBoundingClientRect();a.width>100&&a.height>80&&n[i].setSize({width:Math.floor(a.width),height:Math.floor(a.height)})})}))}requireHost(e){const n=this.root.querySelector(e);if(!n)throw new Error(`Missing curve viewer element ${e}`);return n}}class Gf{constructor(e){this.elements=e,e.module.addEventListener("change",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.refresh.addEventListener("click",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.save.addEventListener("click",()=>{this.save().catch(n=>this.setStatus(n.message))})}elements;schema=null;async load(e=this.schema?.module??"pyrpl"){const n=await fetch(`/api/config?module=${encodeURIComponent(e)}`);if(!n.ok)throw new Error(await ac(n,"Configuration unavailable"));this.apply(await n.json()),this.setStatus(`Loaded ${this.schema?.module}`)}async save(){const e=this.elements.module.value,n=await fetch(`/api/config/branches/${encodeURIComponent(e)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:this.elements.text.value})});if(!n.ok)throw new Error(await ac(n,"Configuration save failed"));this.apply(await n.json()),this.setStatus(`Saved ${e}`)}getModule(){return this.elements.module.value}getText(){return this.elements.text.value}apply(e){this.schema=e,this.elements.file.textContent=e.configfile,this.elements.module.textContent="";for(const n of e.modules){const s=document.createElement("option");s.value=n,s.textContent=n,this.elements.module.appendChild(s)}this.elements.module.value=e.module,this.elements.text.value=e.text,this.elements.module.disabled=!1,this.elements.text.disabled=!1,this.elements.refresh.disabled=!1,this.elements.save.disabled=!1}setStatus(e){this.elements.status.textContent=e}}async function ac(t,e){try{return(await t.json()).detail??`${e}: ${t.status}`}catch{return`${e}: ${t.status}`}}const oc="pyrpl-control-client-id";function Kf(){try{const t=window.sessionStorage.getItem(oc);if(t)return t;const e=window.crypto.randomUUID();return window.sessionStorage.setItem(oc,e),e}catch{return`browser-${Date.now()}-${Math.random().toString(16).slice(2)}`}}class Zf{id=Kf();label=`Browser ${this.id.slice(0,8)}`;nativeFetch;heartbeatTimer=null;constructor(){this.nativeFetch=window.fetch.bind(window)}installFetchHeaders(){const e=this.nativeFetch;window.fetch=((n,s={})=>{if(new URL(n instanceof Request?n.url:String(n),window.location.href).origin!==window.location.origin)return e(n,s);const a=new Headers(n instanceof Request?n.headers:void 0);return new Headers(s.headers).forEach((o,l)=>a.set(l,o)),a.set("x-pyrpl-client-id",this.id),a.set("x-pyrpl-client-label",this.label),e(n,{...s,headers:a})})}async initialize(){let e=await this.refresh();return e.policy==="single-writer"&&e.controller===null&&(e=await this.claim(!1)),this.startHeartbeat(e.lease_seconds),e}async refresh(){return this.request("/api/control",{method:"GET"})}async claim(e){return this.request("/api/control/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({label:this.label,force:e})})}release(){window.fetch("/api/control/release",{method:"POST",keepalive:!0}).catch(()=>{})}startHeartbeat(e){this.heartbeatTimer!==null&&window.clearInterval(this.heartbeatTimer);const n=Math.max(2e3,Math.min(1e4,e*400));this.heartbeatTimer=window.setInterval(()=>{this.request("/api/control/heartbeat",{method:"POST"}).catch(()=>{})},n)}async request(e,n){const s=await window.fetch(e,n);if(!s.ok){let i=`Control request failed: ${s.status}`;try{const a=await s.json();a.detail&&(i=a.detail)}catch{}throw new Error(i)}return s.json()}}const Xn=[{id:"scope",title:"Scope",description:"Oscilloscope controls and live waveform",defaultEnabled:!0,defaultSplitSizes:[28,72]},{id:"asg",title:"ASG",description:"Arbitrary signal generator controls",defaultEnabled:!1},{id:"pid",title:"PID",description:"PID controller controls",defaultEnabled:!1},{id:"iq",title:"IQ",description:"IQ modulator and demodulator controls",defaultEnabled:!1},{id:"iir",title:"IIR",description:"Infinite impulse response filter controls",defaultEnabled:!1},{id:"trig",title:"Trigger",description:"DSP trigger controls",defaultEnabled:!1},{id:"pwm",title:"PWM",description:"Auxiliary PWM routing controls",defaultEnabled:!1},{id:"spectrumanalyzer",title:"Spectrum Analyzer",description:"FFT spectrum analyzer controls and plot",defaultEnabled:!1,defaultSplitSizes:[35,65]},{id:"networkanalyzer",title:"Network Analyzer",description:"Coherent swept-frequency response measurement",defaultEnabled:!1,defaultSplitSizes:[34,66]},{id:"curveviewer",title:"Curve Viewer",description:"Browse and manage saved PyRPL curves",defaultEnabled:!1},{id:"pyrplconfig",title:"Configuration",description:"Edit PyRPL YAML configuration branches",defaultEnabled:!1},{id:"lockbox",title:"Lockbox",description:"Model-based lock sequence controls",defaultEnabled:!1},{id:"housekeeping",title:"Housekeeping",description:"LED and expansion connector I/O",defaultEnabled:!1},{id:"telemetry",title:"Sampler & AMS",description:"DSP signal readback, statistics, and AMS DAC controls",defaultEnabled:!1},{id:"registers",title:"Register Debug",description:"Raw monitor_server register read/write",defaultEnabled:!1}];function Jf(t){const e=Xn.find(n=>n.id===t);if(!e)throw new Error(`Unknown panel ${t}`);return e}function Lo(t){const e=t.trim();if(!e)throw new Error("Register value is empty");const n=Number(e);if(!Number.isInteger(n)||n<0)throw new Error(`Invalid register integer: ${t}`);return n}function Qf(t){const e=t.split(/[\s,]+/).map(n=>n.trim()).filter(Boolean).map(Lo);if(e.length===0)throw new Error("At least one register value is required");return e}function ia(t){return`0x${(t>>>0).toString(16).padStart(8,"0")} (${t>>>0})`}async function rc(t,e,n){const s=await fetch(t,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)});if(!s.ok)throw new Error(`${n}: ${s.status}`);return await s.json()}function em(t){async function e(){const s=Lo(t.readAddr.value),i=Math.max(1,Math.min(64,Number(t.readLength.value))),a=await rc("/api/register/read",{addr:s,length:i},"Register read failed");t.status.textContent=`read ${a.length} word${a.length===1?"":"s"}`,t.output.value=a.values.map((o,l)=>`${ia(s+l*4)}: ${ia(o)}`).join(`
`)}async function n(){const s=Lo(t.writeAddr.value),i=Qf(t.writeValues.value),a=await rc("/api/register/write",{addr:s,values:i},"Register write failed");t.status.textContent=`wrote ${a.count} word${a.count===1?"":"s"}`,t.output.value=i.map((o,l)=>`${ia(s+l*4)} <= ${ia(o)}`).join(`
`)}return t.readButton.addEventListener("click",()=>{e().catch(s=>{t.status.textContent=s.message})}),t.writeButton.addEventListener("click",()=>{n().catch(s=>{t.status.textContent=s.message})}),{read:e,write:n}}const uu="pyrpl-websocket.workspace.v1",pu="tabs",hu=[50,50];function Fo(){const t=Object.fromEntries(Xn.map(e=>[e.id,{enabled:e.defaultEnabled,splitSizes:e.defaultSplitSizes}]));return{activePanelId:ur(t),layoutMode:pu,workspaceSplitSizes:[...hu],panels:t}}function tm(){let t=null;try{t=JSON.parse(window.localStorage.getItem(uu)??"")}catch{return Fo()}return du(t)}function du(t){if(!t||typeof t!="object")return Fo();const e=t,s={...Fo().panels};for(const a of Xn){const o=e.panels?.[a.id];s[a.id]={enabled:typeof o?.enabled=="boolean"?o.enabled:s[a.id].enabled,splitSizes:a.defaultSplitSizes?gu(o?.splitSizes,a.defaultSplitSizes):void 0}}return{activePanelId:e.activePanelId&&s[e.activePanelId]?.enabled?e.activePanelId:ur(s),layoutMode:mu(e.layoutMode),workspaceSplitSizes:To(e.workspaceSplitSizes,hu.length),panels:s}}function fu(t){window.localStorage.setItem(uu,JSON.stringify(t))}function ur(t){return Xn.find(e=>t[e.id]?.enabled)?.id??null}function mu(t){return t==="tabs"||t==="split-horizontal"||t==="split-vertical"?t:pu}function gu(t,e=Jf("scope").defaultSplitSizes??[28,72]){if(Array.isArray(t)&&t.length===2){const n=Number(t[0]),s=Number(t[1]);if(Number.isFinite(n)&&Number.isFinite(s)&&n>=15&&s>=35){const i=n+s;return[Math.round(n/i*1e3)/10,Math.round(s/i*1e3)/10]}}return[...e]}function To(t,e){const n=Array.from({length:e},()=>Math.round(100/e*10)/10);if(!Array.isArray(t)||t.length!==e)return n;const s=t.map(Number);if(s.some(a=>!Number.isFinite(a)||a<10))return n;const i=s.reduce((a,o)=>a+o,0);return i<=0?n:s.map(a=>Math.round(a/i*1e3)/10)}const Di=new Zf;Di.installFetchHeaders();function x(t){const e=document.querySelector(t);if(!e)throw new Error(`Missing UI element ${t}`);return e}const nm=x("#app");nm.innerHTML=`
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
`;const vu=document.createElement("style");vu.textContent=`
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
    height: 45px;
    min-width: 230px;
    margin: 0;
    padding: 16px 0 0;
    border: 0;
  }

  .segmented-control legend {
    position: absolute;
    top: 0;
    left: 0;
    color: var(--muted);
    font-size: 11px;
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
    gap: 6px;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    overflow: hidden;
  }

  .workspace-tabs:empty {
    display: none;
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
    min-height: 0;
    overflow: hidden;
  }

  .workspace-panels.is-tabs {
    display: block;
  }

  .workspace-panels.is-split {
    display: flex;
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
    overflow: hidden;
    background: var(--plot-bg);
  }

  .curve-viewer-content {
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
    grid-template-rows: auto minmax(0, 1fr) auto;
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
    overflow: auto;
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
    gap: 6px;
    min-height: 0;
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
    min-height: 0;
  }

  #lockbox-stages {
    overflow: auto;
  }

  .lockbox-card {
    display: grid;
    gap: 8px;
    min-width: 0;
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 6px;
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
    min-height: 220px;
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
    grid-template-rows: repeat(2, minmax(160px, 1fr));
    gap: 6px;
    min-height: 340px;
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
`;document.head.appendChild(vu);const sm=x("#scope-plot");x("#scope-panel-content");const pr=x("#scope-controls-pane"),xu=x("#scope-plot-pane");x("#spectrum-panel-content");const wu=x("#spectrum-controls-pane"),bu=x("#spectrum-plot-pane"),go=x("#panel-menu"),lc=x("#workspace-tabs"),im=x("#workspace-panels"),yu=x("#scope-panel"),am=x("#asg-panel"),om=x("#pid-panel"),rm=x("#iq-panel"),lm=x("#iir-panel"),cm=x("#trig-panel"),um=x("#pwm-panel"),Su=x("#spectrumanalyzer-panel"),pm=x("#networkanalyzer-panel"),ku=x("#curveviewer-panel"),hm=x("#pyrplconfig-panel"),Mu=x("#lockbox-panel"),dm=x("#housekeeping-panel"),fm=x("#telemetry-panel"),mm=x("#registers-panel"),hr={scope:yu,asg:am,pid:om,iq:rm,iir:lm,trig:cm,pwm:um,spectrumanalyzer:Su,networkanalyzer:pm,curveviewer:ku,pyrplconfig:hm,lockbox:Mu,housekeeping:dm,telemetry:fm,registers:mm},gm=x("#empty-workspace"),Kt=x("#status"),ft=x("#connect-scope"),fn=x("#single-frame"),Ei=x("#stop-scope"),dr=x("#scope-current-average"),vm=x("#save-curve"),hs=x("#scope-curve-name"),xm=x("#zoom-out"),wm=x("#zoom-in"),bm=x("#zoom-y-out"),ym=x("#zoom-y-in"),Sm=x("#pan-left"),km=x("#pan-right"),Mm=x("#pan-up"),Em=x("#pan-down"),Cm=x("#zoom-reset"),ln=x("#show-ch1"),cn=x("#show-ch2"),Qs=x("#scope-input1"),ei=x("#scope-input2"),Dn=x("#scope-trigger"),Am=x("#scope-trigger-mode"),$i=x("#scope-trigger-normal"),Bn=x("#scope-trigger-rolling"),kn=x("#scope-duration"),ti=x("#scope-average"),ds=x("#scope-xy-mode"),fs=x("#scope-math-active"),qn=x("#scope-math-formula"),Mn=x("#scope-trace-average"),Vn=x("#scope-trigger-delay"),Yn=x("#scope-threshold"),Hn=x("#scope-hysteresis"),kt=x("#scope-state-select"),ci=x("#scope-state-name"),Eu=x("#scope-state-save"),Cu=x("#scope-state-load"),Au=x("#scope-state-delete"),No=x("#register-status"),ae=x("#module-status"),jn=x("#hk-status"),Pm=x("#telemetry-refresh"),cc=x("#sampler-grid"),Pu=x("#sampler-status"),$o=x("#sampler-stats-signal"),zm=x("#sampler-stats-duration"),Io=x("#sampler-stats-run"),Ro=x("#sampler-stats-output"),_a=x("#ams-status"),Hs=[0,1,2,3].map(t=>x(`#ams-dac${t}`)),vo=new Map,ua=x("#hk-led"),_m=x("#hk-refresh"),uc=x("#hk-expansion-grid"),Lm=x("#pid-modules"),Fm=x("#iq-modules"),Tm=x("#iir-modules"),Nm=x("#trig-modules"),$m=x("#pwm-modules"),Im=x("#spectrum-modules"),Rm=x("#spectrum-plot"),Jt=x("#spectrum-status"),mn=x("#spectrum-single"),St=x("#spectrum-run"),Ci=x("#spectrum-stop"),zu=x("#spectrum-current-average"),Om=x("#spectrum-save-curve"),Ii=x("#spectrum-curve-name"),Dm=x("#spectrum-zoom-out"),Bm=x("#spectrum-zoom-in"),qm=x("#spectrum-zoom-y-out"),Vm=x("#spectrum-zoom-y-in"),Ym=x("#spectrum-pan-left"),Hm=x("#spectrum-pan-right"),jm=x("#spectrum-pan-up"),Xm=x("#spectrum-pan-down"),Um=x("#spectrum-zoom-reset"),ms=new Xf(x("#network-controls"),x("#network-magnitude-plot"),x("#network-phase-plot"),x("#network-status"),x("#network-single"),x("#network-run"),x("#network-stop"),x("#network-save"),x("#network-reset")),ni=new Wf(ku,x(".curve-viewer-list-pane"),x(".curve-viewer-plot-pane"),x(".curve-viewer-params-pane"),x("#curve-viewer-select"),x("#curve-viewer-name"),x("#curve-viewer-params"),x("#curve-viewer-status"),x("#curve-viewer-save-params"),x("#curve-viewer-delete"),x("#curve-viewer-refresh")),En=new qf({root:Mu,classSelect:x("#lockbox-class"),status:x("#lockbox-status"),actions:x("#lockbox-actions"),inputs:x("#lockbox-inputs"),outputs:x("#lockbox-outputs"),stages:x("#lockbox-stages"),addStage:x("#lockbox-add-stage"),inputPlot:x("#lockbox-input-plot"),outputPlot:x("#lockbox-output-plot"),inputPlotSelect:x("#lockbox-input-plot-select"),outputPlotSelect:x("#lockbox-output-plot-select")}),Wm=new Gf({file:x("#config-file"),module:x("#config-module"),text:x("#config-text"),refresh:x("#config-refresh"),save:x("#config-save"),status:x("#config-status")}),pc=x("#session-line"),js=x("#control-status"),oa=x("#take-control"),hc=js.parentElement;em({readAddr:x("#register-read-addr"),readLength:x("#register-read-length"),readButton:x("#register-read"),writeAddr:x("#register-write-addr"),writeValues:x("#register-write-values"),writeButton:x("#register-write"),status:No,output:x("#register-output")});const _u=["asg0","asg1"],gs={asg0:fc("asg0"),asg1:fc("asg1")},Gm={pid:["pid0","pid1","pid2"],iq:["iq0","iq1","iq2"],iir:["iir"],trig:["trig"],pwm:["pwm0","pwm1"],spectrumanalyzer:["spectrumanalyzer"]},Km={pid:Lm,iq:Fm,iir:Tm,trig:Nm,pwm:$m,spectrumanalyzer:Im},Cn=new Map,Zm=[Qs,ei,Dn,$i,Bn,kn,ti,ds,fs,qn,Mn,Vn,Yn,Hn,kt,ci,Eu,Cu,Au,hs];let U=new _f(sm,t=>{Kt.textContent=t},t=>{dr.textContent=`${t} / ${Mn.value||"1"}`}),we=new Tf(Rm,t=>{Jt.textContent=t},t=>{const e=Cn.get("spectrumanalyzer")?.inputs.get("trace_average");zu.textContent=`${t} / ${e?.value||"1"}`}),$t=null,Ds=null;const dc=new za(()=>Uu());let Lu=0,xn="stopped",ls="stopped",X=tm(),Fu=null,pa=null,ha=null,da=null,Oo=null,Do="";function ui(t){fu(t),fetch("/api/workspace",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspace:t})}).catch(()=>{})}async function Jm(){const t=await fetch("/api/workspace");if(!t.ok)return;const e=await t.json();e.workspace&&typeof e.workspace=="object"?(X=du(e.workspace),fu(X)):ui(X)}function Qm(){window.pyrplScope={getFrameSequence:()=>U.getFrameSequence(),getSampleCount:()=>U.getSampleCount(),getXRange:()=>U.getXRange(),getYRange:()=>U.getYRange(),getScopeTimeLabels:()=>U.getFormattedTimeLabelsForCurrentRange(),isChannelVisible:t=>U.getChannelVisible(t),getEventCount:()=>Lu,getTraceAverage:()=>U.getTraceAverage(),getRunningState:()=>xn,isPanelEnabled:t=>X.panels[t]?.enabled??!1,getScopeSplitSizes:()=>X.panels.scope.splitSizes??[28,72],getWorkspaceLayoutMode:()=>X.layoutMode,getWorkspaceSplitSizes:()=>X.workspaceSplitSizes,getActivePanelId:()=>X.activePanelId,getCsvLineCount:()=>U.exportCsv().trimEnd().split(`
`).length,getDisplayedStats:()=>U.getDisplayedStats(),getDisplayedDataFingerprint:()=>U.getDisplayedDataFingerprint(),getScopeMathStats:()=>U.getMathStats(),getScopeXyStats:()=>U.getXyStats(),moduleStatusText:()=>ae.textContent??"",statusText:()=>Kt.textContent??"",getSpectrumSeriesCount:()=>we.getSeriesCount(),getSpectrumBinCount:()=>we.getBinCount(),getSpectrumAverageCount:()=>we.getAverageCount(),getSpectrumXRange:()=>we.getXRange(),getSpectrumYRange:()=>we.getYRange(),getIirXRange:()=>$t?.getXRange()??null,getIirMagnitudeYRange:()=>$t?.getMagnitudeYRange()??null,getIirPhaseYRange:()=>$t?.getPhaseYRange()??null,getLockboxClassname:()=>En.getClassname(),getLockboxStageCount:()=>En.getStageCount()}}function Tn(t,e){return`#${t}-${e.replaceAll("_","-")}`}function fc(t){return{status:x(`#${t}-status`),waveform:x(Tn(t,"waveform")),frequency:x(Tn(t,"frequency")),amplitude:x(Tn(t,"amplitude")),offset:x(Tn(t,"offset")),triggerSource:x(Tn(t,"trigger_source")),outputDirect:x(Tn(t,"output_direct")),startPhase:x(Tn(t,"start_phase")),cyclesPerBurst:x(Tn(t,"cycles_per_burst")),setup:x(`#${t}-setup`),trigger:x(`#${t}-trigger`),off:x(`#${t}-off`)}}function La(){tg(),ng();const t=eg(),e=X.layoutMode!=="tabs"&&t.length>1,n=e?t:X.activePanelId?[X.activePanelId]:[],s=new Set(n),i=t.length>0;im.className=`workspace-panels ${e?`is-split ${X.layoutMode==="split-horizontal"?"is-horizontal":"is-vertical"}`:"is-tabs"}`;for(const[a,o]of Object.entries(hr))o.hidden=!s.has(a);gm.hidden=i,e?rg(n):Tu(),s.has("scope")?(sg(),window.requestAnimationFrame(()=>U.refreshLayout())):ig(),s.has("spectrumanalyzer")?(ag(),window.requestAnimationFrame(()=>we.refreshLayout())):og(),s.has("lockbox")&&window.requestAnimationFrame(()=>En.refreshLayout()),s.has("networkanalyzer")&&window.requestAnimationFrame(()=>ms.refreshLayout()),s.has("curveviewer")&&window.requestAnimationFrame(()=>ni.refreshLayout())}function eg(){return Xn.filter(t=>X.panels[t.id]?.enabled).map(t=>t.id)}function tg(){go.textContent="";for(const i of Xn){const a=document.createElement("label");a.className="menu-check";const o=document.createElement("input");o.id=`panel-${i.id}-enabled`,o.type="checkbox",o.checked=X.panels[i.id]?.enabled??!1,o.addEventListener("change",()=>{o.closest("details")?.removeAttribute("open"),lg(i.id,o.checked).catch(u=>{ae.textContent=u.message,No.textContent=u.message})});const l=document.createElement("span");l.textContent=i.title,a.append(o,l),go.appendChild(a)}const t=document.createElement("label");t.className="menu-field";const e=document.createElement("span");e.textContent="Layout";const n=document.createElement("select");n.id="workspace-layout-mode";const s=[["tabs","Tabs"],["split-horizontal","Side by Side"],["split-vertical","Stacked"]];for(const[i,a]of s){const o=document.createElement("option");o.value=i,o.textContent=a,n.appendChild(o)}n.value=X.layoutMode,n.addEventListener("change",()=>{ug(mu(n.value)).catch(i=>{ae.textContent=i.message,No.textContent=i.message})}),t.append(e,n),go.appendChild(t)}function ng(){lc.textContent="";for(const t of Xn){if(!X.panels[t.id]?.enabled)continue;const e=document.createElement("button");e.className=`workspace-tab${X.activePanelId===t.id?" is-active":""}`,e.type="button",e.textContent=t.title,e.addEventListener("click",()=>{cg(t.id).catch(n=>{ae.textContent=n.message})}),lc.appendChild(e)}}function sg(){pa||yu.hidden||(pa=Oi([pr,xu],{direction:"vertical",sizes:X.panels.scope.splitSizes,minSize:[132,260],gutterSize:8,snapOffset:24,onDrag:()=>U.refreshLayout(),onDragEnd:t=>{X={...X,panels:{...X.panels,scope:{...X.panels.scope,splitSizes:gu(t)}}},ui(X),U.refreshLayout()}}))}function ig(){pa?.destroy(),pa=null,pr.removeAttribute("style"),xu.removeAttribute("style")}function ag(){ha||Su.hidden||(ha=Oi([wu,bu],{direction:"vertical",sizes:[32,68],minSize:[96,220],gutterSize:8,snapOffset:16,elementStyle:(t,e)=>({height:`calc(${e}% - 4px)`}),gutterStyle:()=>({height:"8px"}),onDrag:()=>we.refreshLayout(),onDragEnd:()=>we.refreshLayout()}))}function og(){ha?.destroy(),ha=null,wu.removeAttribute("style"),bu.removeAttribute("style")}function rg(t){const e=t.join("|");da&&Oo===X.layoutMode&&Do===e||(Tu(),Oo=X.layoutMode,Do=e,da=Oi(t.map(n=>hr[n]),{direction:X.layoutMode==="split-horizontal"?"horizontal":"vertical",sizes:To(X.workspaceSplitSizes,t.length),minSize:220,gutterSize:8,snapOffset:24,onDrag:()=>{U.refreshLayout(),we.refreshLayout(),En.refreshLayout(),ms.refreshLayout(),ni.refreshLayout()},onDragEnd:n=>{X={...X,workspaceSplitSizes:To(n,t.length)},ui(X),U.refreshLayout(),we.refreshLayout(),En.refreshLayout(),ms.refreshLayout(),ni.refreshLayout()}}))}function Tu(){da?.destroy(),da=null,Oo=null,Do="";for(const t of Object.values(hr))t.removeAttribute("style")}async function lg(t,e){const n=X.panels[t],s={...X.panels,[t]:{...n,enabled:e}},i=e&&X.activePanelId===null?t:!e&&X.activePanelId===t?ur(s):X.activePanelId;if(X={...X,activePanelId:i,panels:s},ui(X),La(),t==="scope"&&!e){Fa("Scope panel disabled"),Zt("stop").catch(a=>{ae.textContent=a.message});return}t==="scope"&&e&&X.activePanelId==="scope"&&await Nu(),t==="spectrumanalyzer"&&!e&&(bn("Spectrum panel disabled"),wn("stop").catch(a=>{Jt.textContent=a.message}))}async function cg(t){X.panels[t]?.enabled&&(X={...X,activePanelId:t},ui(X),La(),t==="scope"&&window.requestAnimationFrame(()=>U.refreshLayout()),t==="spectrumanalyzer"&&window.requestAnimationFrame(()=>we.refreshLayout()),t==="lockbox"&&window.requestAnimationFrame(()=>En.refreshLayout()),t==="networkanalyzer"&&window.requestAnimationFrame(()=>ms.refreshLayout()),t==="curveviewer"&&window.requestAnimationFrame(()=>ni.refreshLayout()))}async function ug(t){X={...X,layoutMode:t},ui(X),La(),X.panels.scope.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>U.refreshLayout()),X.panels.lockbox.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>En.refreshLayout()),X.panels.networkanalyzer.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>ms.refreshLayout()),X.panels.curveviewer.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>ni.refreshLayout())}async function Nu(){if(await Fg(),!X.panels.scope.enabled||X.activePanelId!=="scope"){Fa("Scope panel disabled");return}Fu?.fake&&(await Zt("continuous"),Ri())}function fr(t){xn=t,$u(t)}function $u(t){const e=gr();t==="running_continuous"?(ft.textContent="Pause",ft.disabled=!1,fn.textContent="Run single",fn.disabled=!0,Ei.disabled=!1):t==="running_single"?(ft.textContent="Run continuous",ft.disabled=!0,fn.textContent="Pause",fn.disabled=!1,Ei.disabled=!1):t==="paused_single"||t==="paused_continuous"?(ft.textContent="Resume continuous",ft.disabled=!1,fn.textContent="Resume single",fn.disabled=e,Ei.disabled=!1):(ft.textContent="Run continuous",ft.disabled=!1,fn.textContent="Run single",fn.disabled=e,Ei.disabled=!0)}function pg(t){ls=t,t==="running_continuous"?(St.textContent="Pause",St.disabled=!1,mn.textContent="Run single",mn.disabled=!0,Ci.disabled=!1):t==="running_single"?(St.textContent="Run continuous",St.disabled=!0,mn.textContent="Pause",mn.disabled=!1,Ci.disabled=!1):t==="paused_single"||t==="paused_continuous"?(St.textContent="Resume continuous",St.disabled=!1,mn.textContent="Resume single",mn.disabled=!1,Ci.disabled=!1):(St.textContent="Run continuous",St.disabled=!1,mn.textContent="Run single",mn.disabled=!1,Ci.disabled=!0)}function Ri(){ft.dataset.connected!=="true"&&(U.connect(),ft.dataset.connected="true")}function Fa(t="Disconnected"){U.close(),ft.dataset.connected="false",Kt.textContent=t}async function Iu(){ft.dataset.connected==="true"&&(await Zt("stop"),Fa("Scope stopped: Spectrum owns the scope resource"))}async function Zt(t){const e=await fetch(`/api/modules/scope/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Scope action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return s.running_state&&fr(s.running_state),["single","continuous","resume_single","resume_continuous"].includes(t)&&U.reconnect(),ae.textContent=`${t}: ${s.running_state??"ok"}`,n}async function hg(){try{const e=await(await fetch("/api/session")).json(),n=e.fake?"fake hardware":e.settings.hostname;return pc.textContent=`Session: ${n} | reads ${e.reads} | writes ${e.writes}`,e.scope?.running_state&&fr(e.scope.running_state),{fake:!!e.fake}}catch{return pc.textContent="Session unavailable",null}}function Ru(t){return typeof t=="number"?t<.001?`${(t*1e6).toPrecision(4)} us`:t<1?`${(t*1e3).toPrecision(4)} ms`:`${t.toPrecision(4)} s`:t}function In(t,e){return Array.isArray(e)?e.join(", "):typeof e=="boolean"?String(e):typeof e=="number"&&(t==="duration"||t==="trigger_delay")?Ru(e):typeof e=="number"?Number.isInteger(e)?String(e):String(Number(e.toPrecision(6))):e}function Rn(t,e){t.textContent="";for(const n of e.options??[]){const s=document.createElement("option");s.value=String(n),s.textContent=e.option_labels?.[String(n)]??Ru(n),t.appendChild(s)}t.value=String(e.value)}function mr(t,e){t==="input1"?Qs.value=String(e):t==="input2"?ei.value=String(e):t==="trigger_source"?(Dn.value=String(e),Ai()):t==="duration"?(kn.value=String(e),Ai(),fa()):t==="average"?ti.checked=!!e:t==="ch1_active"?(ln.checked=!!e,U.setChannelVisible(1,ln.checked)):t==="ch2_active"?(cn.checked=!!e,U.setChannelVisible(2,cn.checked)):t==="ch_math_active"?(fs.checked=!!e,cs()):t==="math_formula"?(document.activeElement!==qn&&(qn.value=String(e)),cs()):t==="xy_mode"?(ds.checked=!!e,cs()):t==="rolling_mode"?(Bn.checked=!!e,$i.checked=!e,Ai(),fa()):t==="trace_average"?(Mn.value=String(e),U.setTraceAverage(Number(e)),dr.textContent=`0 / ${e}`):t==="trigger_delay"?(document.activeElement!==Vn&&(Vn.value=String(e)),Ai()):t==="threshold"?document.activeElement!==Yn&&(Yn.value=String(e)):t==="hysteresis"?document.activeElement!==Hn&&(Hn.value=String(e)):t==="curve_name"&&document.activeElement!==hs&&(hs.value=String(e))}function cs(){U.setDisplaySettings({xyMode:ds.checked,mathActive:fs.checked,mathFormula:qn.value})}function gr(){return Bn.checked&&Number(kn.value)>.1}function fa(){const t=Number(kn.value)>.1;Am.disabled=!t;const e=gr();Dn.disabled=e,Yn.disabled=e,Hn.disabled=e,$u(xn)}function Ai(){U.setTimeSettings({duration:Number(kn.value),triggerDelay:Number(Vn.value||0),triggerSource:Dn.value,rollingMode:gr()})}function Wt(t,e){t.value=String(e.value),e.min!==void 0&&(t.min=String(e.min)),e.max!==void 0&&(t.max=String(e.max)),e.step!==void 0&&(t.step=String(e.step))}function dg(t){for(const[e,n]of Object.entries(t))n!=null&&mr(e,n);Ou(t)}function Ou(t){t.running_state&&fr(t.running_state),t.current_avg!==void 0&&(dr.textContent=`${t.current_avg} / ${Mn.value||"1"}`),"owner"in t&&fg(typeof t.owner=="string"?t.owner:null)}function fg(t){pr.classList.toggle("is-owned",t!==null);for(const e of Zm)e.disabled=t!==null;t===null&&fa(),t&&(ae.textContent=`scope occupied by ${t}`)}async function nt(t,e){const n=await Bi("scope",t,e);["input1","input2","duration","average","trigger_source","trigger_delay","threshold","hysteresis","rolling_mode"].includes(t)&&U.reconnect(),mr(t,n.value),ae.textContent=`${t} = ${In(t,n.value)}`}async function Bi(t,e,n){const s=await fetch(`/api/modules/${t}/attributes/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:n})});if(!s.ok)throw new Error(`Failed to set ${t}.${e}: ${s.status}`);return s.json()}async function mg(){const t=await fetch("/api/modules/scope/attributes");if(!t.ok)throw new Error(`Scope controls unavailable: ${t.status}`);const e=await t.json(),n=new Map(e.attributes.map(s=>[s.name,s]));Rn(Qs,n.get("input1")),Rn(ei,n.get("input2")),Rn(Dn,n.get("trigger_source")),Rn(kn,n.get("duration")),ti.checked=!!n.get("average")?.value,ln.checked=!!(n.get("ch1_active")?.value??!0),U.setChannelVisible(1,ln.checked),cn.checked=!!(n.get("ch2_active")?.value??!0),U.setChannelVisible(2,cn.checked),fs.checked=!!(n.get("ch_math_active")?.value??!1),qn.value=String(n.get("math_formula")?.value??"ch1 * ch2"),ds.checked=!!(n.get("xy_mode")?.value??!1),Bn.checked=!!(n.get("rolling_mode")?.value??!0),$i.checked=!Bn.checked,Wt(Mn,n.get("trace_average")),Wt(Vn,n.get("trigger_delay")),Wt(Yn,n.get("threshold")),Wt(Hn,n.get("hysteresis")),hs.value=String(n.get("curve_name")?.value??"scope curve"),U.setTraceAverage(Number(Mn.value)),cs(),Ai(),fa(),ae.textContent="Scope controls ready"}async function gg(){await Promise.all(_u.map(t=>vg(t)))}async function vg(t){const e=await fetch(`/api/modules/${t}/attributes`);if(!e.ok)throw new Error(`${t} controls unavailable: ${e.status}`);const n=await e.json(),s=new Map(n.attributes.map(a=>[a.name,a])),i=gs[t];Rn(i.waveform,s.get("waveform")),Wt(i.frequency,s.get("frequency")),Wt(i.amplitude,s.get("amplitude")),Wt(i.offset,s.get("offset")),Rn(i.triggerSource,s.get("trigger_source")),Rn(i.outputDirect,s.get("output_direct")),Wt(i.startPhase,s.get("start_phase")),Wt(i.cyclesPerBurst,s.get("cycles_per_burst")),i.status.textContent=`${t} controls ready`}function Du(t,e){for(const[n,s]of Object.entries(e))ju(s)&&vr(t,n,s)}function vr(t,e,n){const s=gs[t];e==="waveform"?s.waveform.value=String(n):e==="frequency"?s.frequency.value=String(n):e==="amplitude"?s.amplitude.value=String(n):e==="offset"?s.offset.value=String(n):e==="trigger_source"?s.triggerSource.value=String(n):e==="output_direct"?s.outputDirect.value=String(n):e==="start_phase"?s.startPhase.value=String(n):e==="cycles_per_burst"&&(s.cyclesPerBurst.value=String(n))}async function Nn(t,e,n){const s=await Bi(t,e,n);vr(t,e,s.value),gs[t].status.textContent=`${e} = ${In(e,s.value)}`}async function xo(t,e){const n=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!n.ok)throw new Error(`${t} action ${e} failed: ${n.status}`);const s=await n.json();Du(t,s.state??{}),gs[t].status.textContent=`${e}: ok`}function xg(){uc.textContent="";for(const t of["P","N"]){const e=document.createElement("section");e.className="housekeeping-bank";const n=document.createElement("h3");n.textContent=`Expansion ${t}`,e.appendChild(n);for(let s=0;s<8;s+=1){const i=document.createElement("div");i.className="housekeeping-pin";const a=`expansion_${t}${s}`,o=`${a}_output`,l=document.createElement("span");l.textContent=`${t}${s}`;const u=document.createElement("label"),d=document.createElement("input");d.type="checkbox",d.id=`hk-${a.replaceAll("_","-")}`,d.addEventListener("change",()=>{Bo(a,d.checked).catch(f=>{jn.textContent=f.message})}),u.append(d,document.createTextNode(" Value"));const v=document.createElement("label"),m=document.createElement("input");m.type="checkbox",m.id=`hk-${o.replaceAll("_","-")}`,m.addEventListener("change",()=>{Bo(o,m.checked).catch(f=>{jn.textContent=f.message})}),v.append(m,document.createTextNode(" Output")),i.append(l,u,v),e.appendChild(i)}uc.appendChild(e)}}async function Bu(){const t=await fetch("/api/modules/hk/attributes");if(t.ok){const s=await t.json(),a=new Map(s.attributes.map(o=>[o.name,o])).get("led");a&&Wt(ua,a)}const e=await fetch("/api/modules/hk");if(!e.ok)throw new Error(`Housekeeping controls unavailable: ${e.status}`);const n=await e.json();qu(n.state??{}),jn.textContent="Housekeeping controls ready"}function qu(t){for(const[e,n]of Object.entries(t))ju(n)&&xr(e,n)}function xr(t,e){if(t==="led"){ua.value=String(e);return}const n=document.querySelector(`#hk-${t.replaceAll("_","-")}`);n&&(n.checked=!!e)}async function Bo(t,e){const n=await Bi("hk",t,e);xr(t,n.value),jn.textContent=`${t} = ${In(t,n.value)}`}async function Vu(){const[t,e]=await Promise.all([fetch("/api/modules/sampler"),fetch("/api/modules/ams")]);if(!t.ok||!e.ok)throw new Error("Sampler or AMS readback unavailable");const n=await t.json(),s=await e.json();wg(n.state??{}),bg(s.state??{}),Pu.textContent="Sampler refreshed",_a.textContent="AMS refreshed"}function wg(t){if(vo.size===0){cc.textContent="",$o.textContent="";for(const e of Object.keys(t)){const n=document.createElement("div");n.className="sampler-reading";const s=document.createElement("span");s.textContent=e;const i=document.createElement("output");i.dataset.signal=e,n.append(s,i),cc.appendChild(n),vo.set(e,i),$o.add(new Option(e,e))}}for(const[e,n]of Object.entries(t))if(typeof n=="number"){const s=vo.get(e);s&&(s.value=Pi(n))}}function bg(t){Hs.forEach((e,n)=>{const s=t[`dac${n}`];typeof s=="number"&&(e.value=s.toFixed(6))})}async function yg(){Io.disabled=!0,Ro.value="Acquiring...";try{const t=await fetch("/api/sampler/stats",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({signal:$o.value,duration:Number(zm.value)})});if(!t.ok)throw new Error(`Sampler statistics failed: ${t.status}`);const e=await t.json();Ro.value=`mean ${Pi(e.mean)} | std ${Pi(e.stddev)} | min ${Pi(e.min)} | max ${Pi(e.max)} | n ${e.count}`}finally{Io.disabled=!1}}async function Yu(t){const e=await Bi("ams",`dac${t}`,Number(Hs[t].value));Hs[t].value=Number(e.value).toFixed(6),_a.textContent=`DAC${t} = ${Hs[t].value} V`}function Pi(t){if(!Number.isFinite(t))return"--";const e=Math.abs(t);return e!==0&&(e<1e-4||e>=1e4)?t.toExponential(5):t.toFixed(6)}async function Sg(){for(const[t,e]of Object.entries(Gm)){const n=Km[t];t==="iir"&&$t&&($t.destroy(),$t=null),n.textContent="",await Promise.all(e.map(s=>kg(n,s)))}}async function kg(t,e){const[n,s,i]=await Promise.all([fetch(`/api/modules/${e}/attributes`),fetch(`/api/modules/${e}/actions`),fetch(`/api/modules/${e}`)]);if(!n.ok||!s.ok||!i.ok)throw new Error(`${e} controls unavailable`);const a=await n.json(),o=await s.json(),l=await i.json(),u=document.createElement("section");u.className="module-panel instrument-card",e==="iir"&&u.classList.add("iir-card"),u.dataset.module=e;const d=document.createElement("header");d.className="instrument-card-header";const v=document.createElement("h3");v.textContent=e.toUpperCase();const m=document.createElement("output");m.id=`${e}-status`,m.textContent=`${e} ready`,d.append(v,m);const f=document.createElement("div");f.className=e==="spectrumanalyzer"?"control-row generic-module-row spectrum-module-row":"control-row generic-module-row";const y={status:m,inputs:new Map,fields:new Map,actions:[],card:u,owner:null},A=e==="spectrumanalyzer"?Ag(a.attributes):a.attributes;for(const L of A){if(e==="iir"&&Mg(L.name))continue;const _=Eg(e,L,m);y.inputs.set(L.name,_.input),y.fields.set(L.name,_.label),f.appendChild(_.label)}const R=e==="spectrumanalyzer"?[]:o.actions??[];for(const L of R){const _=document.createElement("button");_.type="button",_.textContent=L.label??L.name,_.addEventListener("click",()=>{Pg(e,L.name,m).catch(M=>{m.textContent=M.message})}),y.actions.push(_),f.appendChild(_)}if(Cn.set(e,y),u.append(d,f),e==="iir"){const L=document.createElement("section");L.className="iir-plot",u.appendChild(L),$t=new Df(L,async(_,M)=>{await Vs("iir",_,M,m)},_=>{m.textContent=_}),$t.refresh().catch(_=>{m.textContent=_.message})}t.appendChild(u),qi(e,l.state??{})}function Mg(t){return t==="real_poles"||t==="real_zeros"||t==="complex_poles"||t==="complex_zeros"}function Eg(t,e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=t==="spectrumanalyzer"?Cg(e):e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");Rn(o,e),o.addEventListener("change",()=>{Vs(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{Vs(t,e.name,o.checked,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",Wt(o,e),o.addEventListener("change",()=>{Vs(t,e.name,Number(o.value),n).catch(l=>{n.textContent=l.message})}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Hu(e.value),o.addEventListener("change",()=>{Vs(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}return e.readonly&&(a instanceof HTMLSelectElement?a.disabled=!0:a.readOnly=!0),a.id=`${t}-${e.name.replaceAll("_","-")}`,s.appendChild(a),{label:s,input:a}}function Cg(t){return t.name==="input"?"IQ Input":t.name==="center"?"IQ Center":t.name==="input1_baseband"?"BB Input 1":t.name==="input2_baseband"?"BB Input 2":t.name==="display_input1_baseband"||t.name==="display_input2_baseband"?"Show":t.name==="display_cross_amplitude"?"Cross":t.label}function Ag(t){const e=["baseband","display_input1_baseband","input1_baseband","display_input2_baseband","input2_baseband","input","center","acbandwidth","display_cross_amplitude","span","rbw","window","display_unit","trace_average"];return[...t].sort((n,s)=>{const i=e.indexOf(n.name),a=e.indexOf(s.name);return(i===-1?Number.MAX_SAFE_INTEGER:i)-(a===-1?Number.MAX_SAFE_INTEGER:a)})}async function Vs(t,e,n,s){const i=await Bi(t,e,n);if(wr(t,e,i.value),s.textContent=`${e} = ${In(e,i.value)}`,t==="iir"&&$t&&(await $t.refresh(),e==="data_curve")){const a=await fetch("/api/modules/iir");if(a.ok){const o=await a.json();qi("iir",o.state??{})}}}async function Pg(t,e,n){const s=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!s.ok)throw new Error(`${t} action ${e} failed: ${s.status}`);const i=await s.json();qi(t,i.state??{}),t==="iir"&&$t&&await $t.refresh(),n.textContent=`${e}: ok`}function qi(t,e){if(t==="spectrumanalyzer"){if(we.setSettings(e),zg(e),typeof e.running_state=="string"&&pg(e.running_state),typeof e.current_avg=="number"){const n=Cn.get("spectrumanalyzer")?.inputs.get("trace_average");zu.textContent=`${e.current_avg} / ${n?.value||"1"}`}document.activeElement!==Ii&&typeof e.curve_name=="string"&&(Ii.value=e.curve_name)}for(const[n,s]of Object.entries(e))n==="owner"?_g(t,typeof s=="string"?s:null):Lg(s)&&wr(t,n,s)}function zg(t){const e=Cn.get("spectrumanalyzer");if(!e)return;const n=!!(t.baseband??!0),s=new Set(["input","center","acbandwidth"]),i=new Set(["input1_baseband","input2_baseband","display_input1_baseband","display_input2_baseband","display_cross_amplitude"]);for(const[a,o]of e.fields)o.hidden=n&&s.has(a)||!n&&i.has(a)}function wr(t,e,n){const s=Cn.get(t)?.inputs.get(e);s&&(s instanceof HTMLInputElement&&s.type==="checkbox"?s.checked=!!n:s.value=Hu(n))}function _g(t,e){const n=Cn.get(t);if(n){n.owner=e,n.card.classList.toggle("is-owned",e!==null);for(const s of n.inputs.values())s.disabled=e!==null;for(const s of n.actions)s.disabled=e!==null;e&&(n.status.textContent=`occupied by ${e}`)}}function Lg(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"||Array.isArray(t)&&t.every(e=>typeof e=="number"||typeof e=="string")}function Hu(t){return Array.isArray(t)?t.join(", "):String(t)}function ju(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"}function mc(t){return typeof t=="string"&&Cn.has(t)}async function br(){const t=await fetch("/api/modules/scope/states");if(!t.ok)return;const e=await t.json();Xu(e.states??[])}function Xu(t){const e=kt.value;kt.textContent="";const n=document.createElement("option");n.value="",n.textContent=t.length?"Choose state":"No saved states",kt.appendChild(n);for(const s of t){const i=document.createElement("option");i.value=s.name,i.textContent=s.name,kt.appendChild(i)}t.some(s=>s.name===e)?kt.value=e:t[0]&&(kt.value=t[0].name,ci.value=t[0].name)}function gc(t){return t==="asg0"||t==="asg1"}function Uu(){if(Ds&&Ds.readyState!==WebSocket.CLOSED)return;const t=window.location.protocol==="https:"?"wss:":"ws:",e=new WebSocket(`${t}//${window.location.host}/ws/events`);Ds=e,e.addEventListener("open",()=>{Ds===e&&dc.connected()}),e.addEventListener("message",n=>{const s=JSON.parse(n.data);if(s.type==="control.changed"){Wu();return}if(s.type==="module.attribute.changed"){if(Lu+=1,s.module==="scope")mr(s.attribute,s.value),ae.textContent=`${s.attribute} = ${In(s.attribute,s.value)}`;else if(gc(s.module)){const i=s.module;vr(i,s.attribute,s.value),gs[i].status.textContent=`${s.attribute} = ${In(s.attribute,s.value)}`}else if(s.module==="hk")xr(s.attribute,s.value),jn.textContent=`${s.attribute} = ${In(s.attribute,s.value)}`;else if(mc(s.module)){wr(s.module,s.attribute,s.value);const i=Cn.get(s.module);i&&(i.status.textContent=`${s.attribute} = ${In(s.attribute,s.value)}`)}return}if(s.type!=="module.attribute.changed"||s.module!=="scope"){if(s.type==="module.state.changed"&&s.module==="scope")Ou(s.state),s.state.trigger_test?ae.textContent=Rg(s.state.trigger_test):ae.textContent=`${s.state.last_action}: ${s.state.running_state}`;else if(s.type==="module.state.changed"&&gc(s.module)){const i=s.module;Du(i,s.state??{}),gs[i].status.textContent=`${i} state updated`}else if(s.type==="module.state.changed"&&s.module==="hk")qu(s.state??{}),jn.textContent="Housekeeping state updated";else if(s.type==="module.state.changed"&&mc(s.module)){qi(s.module,s.state??{});const i=Cn.get(s.module);i&&!i.owner&&s.module!=="spectrumanalyzer"&&(i.status.textContent=`${s.module} state updated`)}else s.type==="module.state.changed"&&s.module==="lockbox"?En.applySchema(s.state).catch(i=>{ae.textContent=i.message}):s.type==="module.state.changed"&&s.module==="networkanalyzer"?ms.applyState(s.state??{}):s.type==="module.states.changed"&&s.module==="scope"&&(Xu(s.states??[]),ae.textContent=`${s.states.length} saved state${s.states.length===1?"":"s"}`);return}}),e.addEventListener("close",()=>{Ds===e&&(Ds=null,dc.schedule())})}function yr(t){hc.classList.remove("is-controller","is-observer","is-shared"),hc.classList.add(`is-${t.role}`),t.role==="shared"?(js.value="Shared control",oa.hidden=!0):t.role==="controller"?(js.value="You have control",oa.hidden=!0):(js.value=t.controller?.label?`Observer: ${t.controller.label} has control`:"Observer: control is available",oa.hidden=!1)}async function Wu(){try{yr(await Di.refresh())}catch(t){js.value=t instanceof Error?t.message:"Control unavailable"}}async function Fg(){Kt.textContent="Loading one scope frame...";const t=await fetch(`/api/scope/frame?samples=${U.getSampleCount()}`);if(t.status===204){Kt.textContent="No trigger captured";return}if(!t.ok)throw new Error(`Scope frame request failed: ${t.status}`);const e=await t.arrayBuffer();U.close(),U.showFrame(e),ft.dataset.connected="false"}async function wn(t){const e=await fetch(`/api/modules/spectrumanalyzer/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Spectrum action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return qi("spectrumanalyzer",n.state??{}),Jt.textContent=`${t}: ${s.running_state??"ok"}`,n}async function Gu(t,e,n,s){const i=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:t,y:e,y_imag:s,params:n})});if(!i.ok)throw new Error(`Save curve failed: ${i.status}`)}async function Tg(){const t=U.getCurveData();if(!t)throw new Error("No scope curve to save");const n=[[0,ln.checked],[1,cn.checked]].filter(([,i])=>i),s={input1:Qs.value,input2:ei.value,duration:Number(kn.value),average:ti.checked,trigger_source:Dn.value,trigger_delay:Number(Vn.value),threshold:Number(Yn.value),hysteresis:Number(Hn.value),ch1_active:ln.checked,ch2_active:cn.checked,ch_math_active:fs.checked,math_formula:qn.value,xy_mode:ds.checked,rolling_mode:Bn.checked,trace_average:Number(Mn.value)};return await Promise.all(n.map(([i])=>Gu(t.x,t.channels[i],{...s,name:`${hs.value||"scope curve"} ch${i+1}`,module:"scope",ch:i,curve_unit:"V"}))),n.length}async function Ng(){const t=we.getCurveData();if(!t)throw new Error("No spectrum curve to save");return await Promise.all(t.series.map((e,n)=>Gu(t.x,e.values,{...we.getCurveParameters(),name:`${Ii.value||"pyrpl spectrum"} ${e.label.toLowerCase()}`,module:"spectrumanalyzer",ch:e.label==="Cross"?"cross":n,curve_unit:t.unit},e.imaginary))),t.series.length}function ma(){St.dataset.connected!=="true"&&(we.connect(),St.dataset.connected="true")}function bn(t="Spectrum stopped"){we.close(),St.dataset.connected="false",Jt.textContent=t}async function Ku(){await wn("stop"),(St.dataset.connected==="true"||we.isConnected())&&bn("Spectrum stopped: Scope owns the scope resource")}async function $g(){await Ku(),await Zt("single"),U.resetTraceAveraging(),Ri()}function Ig(){return encodeURIComponent(qo())}function qo(){return(ci.value.trim()||kt.value||"default").trim()}function Zu(){return(kt.value||ci.value.trim()||"default").trim()}function Rg(t){const e=String(t.source??"unknown"),n=String(t.condition??"condition"),s=Number(t.hysteresis??0);return t.triggered?`triggered ${e} ${n} at sample ${t.index} (hys ${s})`:`no trigger: ${e} ${n} (hys ${s})`}async function Og(){const t=await fetch(`/api/modules/scope/states/${Ig()}/save`,{method:"POST"});if(!t.ok)throw new Error(`Save state failed: ${t.status}`);await br(),kt.value=qo(),ae.textContent=`saved state ${qo()}`}async function Dg(){const t=Zu(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}/load`,{method:"POST"});if(!e.ok)throw new Error(`Load state failed: ${e.status}`);const n=await e.json();dg(n.state),ci.value=t,ae.textContent=`loaded state ${t}`}async function Bg(){const t=Zu(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}`,{method:"DELETE"});if(!e.ok)throw new Error(`Delete state failed: ${e.status}`);await br(),ae.textContent=`deleted state ${t}`}ft.addEventListener("click",()=>{(async()=>{try{xn==="running_continuous"?await Zt("pause"):xn==="paused_single"||xn==="paused_continuous"?(await Zt("resume_continuous"),Ri()):(await Ku(),await Zt("continuous"),U.resetTraceAveraging(),Ri())}catch(t){ae.textContent=t instanceof Error?t.message:String(t)}})()});fn.addEventListener("click",()=>{(xn==="running_single"?Zt("pause"):xn==="paused_single"||xn==="paused_continuous"?Zt("resume_single").then(()=>Ri()):$g()).catch(e=>{Kt.textContent=e.message})});Ei.addEventListener("click",()=>{Zt("stop").then(()=>{U.resetTraceAveraging(),Fa()}).catch(t=>{Kt.textContent=t.message})});vm.addEventListener("click",()=>{Promise.all([Zt("save_curve"),Tg()]).then(([,t])=>{U.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),ae.textContent=`saved ${t} curve${t===1?"":"s"}`}).catch(t=>{ae.textContent=t.message})});xm.addEventListener("click",()=>U.zoom(1.8));wm.addEventListener("click",()=>U.zoom(.55));bm.addEventListener("click",()=>U.zoomY(1.8));ym.addEventListener("click",()=>U.zoomY(.55));Sm.addEventListener("click",()=>U.panX(-.2));km.addEventListener("click",()=>U.panX(.2));Mm.addEventListener("click",()=>U.panY(-.2));Em.addEventListener("click",()=>U.panY(.2));Cm.addEventListener("click",()=>U.resetZoom());mn.addEventListener("click",()=>{(async()=>{try{ls==="running_single"?(await wn("pause"),bn("Spectrum paused")):ls==="paused_single"||ls==="paused_continuous"?(bn("Reconnecting spectrum stream"),await wn("resume_single"),ma()):(await Iu(),bn("Starting spectrum acquisition"),we.resetAveraging(),await wn("single"),ma())}catch(t){Jt.textContent=t instanceof Error?t.message:String(t)}})()});St.addEventListener("click",()=>{(async()=>{try{ls==="running_continuous"?(await wn("pause"),bn("Spectrum paused")):ls==="paused_single"||ls==="paused_continuous"?(bn("Reconnecting spectrum stream"),await wn("resume_continuous"),ma()):(await Iu(),bn("Starting spectrum acquisition"),we.resetAveraging(),await wn("continuous"),ma())}catch(t){Jt.textContent=t instanceof Error?t.message:String(t)}})()});Ci.addEventListener("click",()=>{wn("stop").then(()=>bn()).catch(t=>{Jt.textContent=t.message})});Om.addEventListener("click",()=>{Ng().then(t=>{we.downloadCsv(`spectrum-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),Jt.textContent=`saved ${t} curve${t===1?"":"s"}`}).catch(t=>{Jt.textContent=t.message})});hs.addEventListener("change",()=>{nt("curve_name",hs.value).catch(t=>{ae.textContent=t.message})});Ii.addEventListener("change",()=>{Vs("spectrumanalyzer","curve_name",Ii.value,Jt).catch(t=>{Jt.textContent=t.message})});Dm.addEventListener("click",()=>we.zoom(1.8));Bm.addEventListener("click",()=>we.zoom(.55));qm.addEventListener("click",()=>we.zoomY(1.8));Vm.addEventListener("click",()=>we.zoomY(.55));Ym.addEventListener("click",()=>we.panX(-.2));Hm.addEventListener("click",()=>we.panX(.2));jm.addEventListener("click",()=>we.panY(-.2));Xm.addEventListener("click",()=>we.panY(.2));Um.addEventListener("click",()=>we.resetZoom());ln.addEventListener("change",()=>{U.setChannelVisible(1,ln.checked),nt("ch1_active",ln.checked).catch(t=>{ae.textContent=t.message,ln.checked=U.getChannelVisible(1)})});cn.addEventListener("change",()=>{U.setChannelVisible(2,cn.checked),nt("ch2_active",cn.checked).catch(t=>{ae.textContent=t.message,cn.checked=U.getChannelVisible(2)})});Qs.addEventListener("change",()=>{nt("input1",Qs.value).catch(t=>{ae.textContent=t.message})});ei.addEventListener("change",()=>{nt("input2",ei.value).catch(t=>{ae.textContent=t.message})});Dn.addEventListener("change",()=>{nt("trigger_source",Dn.value).catch(t=>{ae.textContent=t.message})});$i.addEventListener("change",()=>{$i.checked&&nt("rolling_mode",!1).catch(t=>{ae.textContent=t.message})});Bn.addEventListener("change",()=>{Bn.checked&&nt("rolling_mode",!0).catch(t=>{ae.textContent=t.message})});kn.addEventListener("change",()=>{nt("duration",Number(kn.value)).catch(t=>{ae.textContent=t.message})});ti.addEventListener("change",()=>{nt("average",ti.checked).catch(t=>{ae.textContent=t.message})});ds.addEventListener("change",()=>{cs(),nt("xy_mode",ds.checked).catch(t=>{ae.textContent=t.message})});fs.addEventListener("change",()=>{cs(),nt("ch_math_active",fs.checked).catch(t=>{ae.textContent=t.message})});qn.addEventListener("change",()=>{cs(),nt("math_formula",qn.value).catch(t=>{ae.textContent=t.message})});Mn.addEventListener("change",()=>{nt("trace_average",Number(Mn.value)).catch(t=>{ae.textContent=t.message})});Vn.addEventListener("change",()=>{nt("trigger_delay",Number(Vn.value)).catch(t=>{ae.textContent=t.message})});Yn.addEventListener("change",()=>{nt("threshold",Number(Yn.value)).catch(t=>{ae.textContent=t.message})});Hn.addEventListener("change",()=>{nt("hysteresis",Number(Hn.value)).catch(t=>{ae.textContent=t.message})});Eu.addEventListener("click",()=>{Og().catch(t=>{ae.textContent=t.message})});kt.addEventListener("change",()=>{kt.value&&(ci.value=kt.value)});Cu.addEventListener("click",()=>{Dg().catch(t=>{ae.textContent=t.message})});Au.addEventListener("click",()=>{Bg().catch(t=>{ae.textContent=t.message})});for(const t of _u){const e=gs[t];e.waveform.addEventListener("change",()=>{Nn(t,"waveform",e.waveform.value).catch(n=>{e.status.textContent=n.message})}),e.frequency.addEventListener("change",()=>{Nn(t,"frequency",Number(e.frequency.value)).catch(n=>{e.status.textContent=n.message})}),e.amplitude.addEventListener("change",()=>{Nn(t,"amplitude",Number(e.amplitude.value)).catch(n=>{e.status.textContent=n.message})}),e.offset.addEventListener("change",()=>{Nn(t,"offset",Number(e.offset.value)).catch(n=>{e.status.textContent=n.message})}),e.triggerSource.addEventListener("change",()=>{Nn(t,"trigger_source",e.triggerSource.value).catch(n=>{e.status.textContent=n.message})}),e.outputDirect.addEventListener("change",()=>{Nn(t,"output_direct",e.outputDirect.value).catch(n=>{e.status.textContent=n.message})}),e.startPhase.addEventListener("change",()=>{Nn(t,"start_phase",Number(e.startPhase.value)).catch(n=>{e.status.textContent=n.message})}),e.cyclesPerBurst.addEventListener("change",()=>{Nn(t,"cycles_per_burst",Number(e.cyclesPerBurst.value)).catch(n=>{e.status.textContent=n.message})}),e.setup.addEventListener("click",()=>{xo(t,"setup").catch(n=>{e.status.textContent=n.message})}),e.trigger.addEventListener("click",()=>{xo(t,"trigger").catch(n=>{e.status.textContent=n.message})}),e.off.addEventListener("click",()=>{xo(t,"off").catch(n=>{e.status.textContent=n.message})})}ua.addEventListener("change",()=>{Bo("led",Number(ua.value)).catch(t=>{jn.textContent=t.message})});_m.addEventListener("click",()=>{Bu().catch(t=>{jn.textContent=t.message})});Pm.addEventListener("click",()=>{Vu().catch(t=>{Pu.textContent=t.message})});Io.addEventListener("click",()=>{yg().catch(t=>{Ro.value=t.message})});Hs[2].addEventListener("change",()=>{Yu(2).catch(t=>{_a.textContent=t.message})});Hs[3].addEventListener("change",()=>{Yu(3).catch(t=>{_a.textContent=t.message})});async function qg(){try{yr(await Di.initialize())}catch{await Wu()}if(Fu=await hg(),xg(),await mg(),await br(),await gg(),await Bu(),await Vu(),await Sg(),await ms.initialize(),await ni.load(),await Wm.load().catch(t=>{x("#config-status").textContent=t.message}),await En.load(),Uu(),await Jm(),La(),!X.activePanelId){Kt.textContent="No panel enabled";return}if(X.activePanelId!=="scope"){Kt.textContent=`${Xn.find(t=>t.id===X.activePanelId)?.title} panel ready`;return}if(!X.panels.scope.enabled){Kt.textContent="Scope panel disabled";return}await Nu()}oa.addEventListener("click",()=>{Di.claim(!0).then(yr).catch(t=>{js.value=t.message})});window.addEventListener("pagehide",()=>Di.release());Qm();qg().catch(t=>{Kt.textContent=t.message});
