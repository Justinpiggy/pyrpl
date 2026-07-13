(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function n(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=n(i);fetch(i.href,a)}})();const yp=!0,Xe="u-",wp="uplot",Sp=Xe+"hz",kp=Xe+"vt",Mp=Xe+"title",Ep=Xe+"wrap",Cp=Xe+"under",Ap=Xe+"over",Pp=Xe+"axis",as=Xe+"off",zp=Xe+"select",_p=Xe+"cursor-x",Lp=Xe+"cursor-y",Fp=Xe+"cursor-pt",Tp=Xe+"legend",Np=Xe+"live",Ip=Xe+"inline",$p=Xe+"series",Rp=Xe+"marker",Wr=Xe+"label",Op=Xe+"value",wi="width",Si="height",vi="top",Gr="bottom",Rs="left",Ja="right",Do="#000",Kr=Do+"0",Qa="mousemove",Zr="mousedown",eo="mouseup",Jr="mouseenter",Qr="mouseleave",el="dblclick",Dp="resize",Bp="scroll",tl="change",ia="dppxchange",Bo="--",ni=typeof window<"u",mo=ni?document:null,qs=ni?window:null,Vp=ni?navigator:null;let ve,Ki;function go(){let t=devicePixelRatio;ve!=t&&(ve=t,Ki&&xo(tl,Ki,go),Ki=matchMedia(`(min-resolution: ${ve-.001}dppx) and (max-resolution: ${ve+.001}dppx)`),rs(tl,Ki,go),qs.dispatchEvent(new CustomEvent(ia)))}function wt(t,e){if(e!=null){let n=t.classList;!n.contains(e)&&n.add(e)}}function vo(t,e){let n=t.classList;n.contains(e)&&n.remove(e)}function Fe(t,e,n){t.style[e]=n+"px"}function jt(t,e,n,s){let i=mo.createElement(t);return e!=null&&wt(i,e),n?.insertBefore(i,s),i}function Lt(t,e){return jt("div",t,e)}const nl=new WeakMap;function rn(t,e,n,s,i){let a="translate("+e+"px,"+n+"px)",o=nl.get(t);a!=o&&(t.style.transform=a,nl.set(t,a),e<0||n<0||e>s||n>i?wt(t,as):vo(t,as))}const sl=new WeakMap;function il(t,e,n){let s=e+n,i=sl.get(t);s!=i&&(sl.set(t,s),t.style.background=e,t.style.borderColor=n)}const al=new WeakMap;function ol(t,e,n,s){let i=e+""+n,a=al.get(t);i!=a&&(al.set(t,i),t.style.height=n+"px",t.style.width=e+"px",t.style.marginLeft=s?-e/2+"px":0,t.style.marginTop=s?-n/2+"px":0)}const Vo={passive:!0},Yp={...Vo,capture:!0};function rs(t,e,n,s){e.addEventListener(t,n,s?Yp:Vo)}function xo(t,e,n,s){e.removeEventListener(t,n,Vo)}ni&&go();function Xt(t,e,n,s){let i;n=n||0,s=s||e.length-1;let a=s<=2147483647;for(;s-n>1;)i=a?n+s>>1:Mt((n+s)/2),e[i]<t?n=i:s=i;return t-e[n]<=e[s]-t?n:s}function uc(t){return(n,s,i)=>{let a=-1,o=-1;for(let l=s;l<=i;l++)if(t(n[l])){a=l;break}for(let l=i;l>=s;l--)if(t(n[l])){o=l;break}return[a,o]}}const pc=t=>t!=null,hc=t=>t!=null&&t>0,da=uc(pc),qp=uc(hc);function Hp(t,e,n,s=0,i=!1){let a=i?qp:da,o=i?hc:pc;[e,n]=a(t,e,n);let l=t[e],u=t[e];if(e>-1)if(s==1)l=t[e],u=t[n];else if(s==-1)l=t[n],u=t[e];else for(let d=e;d<=n;d++){let v=t[d];o(v)&&(v<l?l=v:v>u&&(u=v))}return[l??Me,u??-Me]}function fa(t,e,n,s){let i=cl(t),a=cl(e);t==e&&(i==-1?(t*=n,e/=n):(t/=n,e*=n));let o=n==10?gn:dc,l=i==1?Mt:Tt,u=a==1?Tt:Mt,d=l(o(He(t))),v=u(o(He(e))),f=js(n,d),m=js(n,v);return n==10&&(d<0&&(f=Ee(f,-d)),v<0&&(m=Ee(m,-v))),s||n==2?(t=f*i,e=m*a):(t=vc(t,f),e=ma(e,m)),[t,e]}function Yo(t,e,n,s){let i=fa(t,e,n,s);return t==0&&(i[0]=0),e==0&&(i[1]=0),i}const qo=.1,rl={mode:3,pad:qo},Pi={pad:0,soft:null,mode:0},jp={min:Pi,max:Pi};function aa(t,e,n,s){return ga(n)?ll(t,e,n):(Pi.pad=n,Pi.soft=s?0:null,Pi.mode=s?3:0,ll(t,e,jp))}function fe(t,e){return t??e}function Xp(t,e,n){for(e=fe(e,0),n=fe(n,t.length-1);e<=n;){if(t[e]!=null)return!0;e++}return!1}function ll(t,e,n){let s=n.min,i=n.max,a=fe(s.pad,0),o=fe(i.pad,0),l=fe(s.hard,-Me),u=fe(i.hard,Me),d=fe(s.soft,Me),v=fe(i.soft,-Me),f=fe(s.mode,0),m=fe(i.mode,0),y=e-t,k=gn(y),F=ut(He(t),He(e)),_=gn(F),P=He(_-k);(y<1e-24||P>10)&&(y=0,(t==0||e==0)&&(y=1e-24,f==2&&d!=Me&&(a=0),m==2&&v!=-Me&&(o=0)));let M=y||F||1e3,$=gn(M),z=js(10,Mt($)),K=M*(y==0?t==0?.1:1:a),R=Ee(vc(t-K,z/10),24),ee=t>=d&&(f==1||f==3&&R<=d||f==2&&R>=d)?d:Me,W=ut(l,R<ee&&t>=ee?ee:Ut(ee,R)),se=M*(y==0?e==0?.1:1:o),J=Ee(ma(e+se,z/10),24),L=e<=v&&(m==1||m==3&&J>=v||m==2&&J<=v)?v:-Me,te=Ut(u,J>L&&e<=L?L:ut(L,J));return W==te&&W==0&&(te=100),[W,te]}const Up=new Intl.NumberFormat(ni?Vp.language:"en-US"),Ho=t=>Up.format(t),Et=Math,sa=Et.PI,He=Et.abs,Mt=Et.floor,qe=Et.round,Tt=Et.ceil,Ut=Et.min,ut=Et.max,js=Et.pow,cl=Et.sign,gn=Et.log10,dc=Et.log2,Wp=(t,e=1)=>Et.sinh(t)*e,to=(t,e=1)=>Et.asinh(t/e),Me=1/0;function ul(t){return(gn((t^t>>31)-(t>>31))|0)+1}function bo(t,e,n){return Ut(ut(t,e),n)}function fc(t){return typeof t=="function"}function le(t){return fc(t)?t:()=>t}const Gp=()=>{},mc=t=>t,gc=(t,e)=>e,Kp=t=>null,pl=t=>!0,hl=(t,e)=>t==e,Zp=/\.\d*?(?=9{6,}|0{6,})/gm,us=t=>{if(bc(t)||On.has(t))return t;const e=`${t}`,n=e.match(Zp);if(n==null)return t;let s=n[0].length-1;if(e.indexOf("e-")!=-1){let[i,a]=e.split("e");return+`${us(i)}e${a}`}return Ee(t,s)};function ss(t,e){return us(Ee(us(t/e))*e)}function ma(t,e){return us(Tt(us(t/e))*e)}function vc(t,e){return us(Mt(us(t/e))*e)}function Ee(t,e=0){if(bc(t))return t;let n=10**e,s=t*n*(1+Number.EPSILON);return qe(s)/n}const On=new Map;function xc(t){return((""+t).split(".")[1]||"").length}function Li(t,e,n,s){let i=[],a=s.map(xc);for(let o=e;o<n;o++){let l=He(o),u=Ee(js(t,o),l);for(let d=0;d<s.length;d++){let v=t==10?+`${s[d]}e${o}`:s[d]*u,f=(o>=0?0:l)+(o>=a[d]?0:a[d]),m=t==10?v:Ee(v,f);i.push(m),On.set(m,f)}}return i}const zi={},jo=[],Xs=[null,null],In=Array.isArray,bc=Number.isInteger,Jp=t=>t===void 0;function dl(t){return typeof t=="string"}function ga(t){let e=!1;if(t!=null){let n=t.constructor;e=n==null||n==Object}return e}function Qp(t){return t!=null&&typeof t=="object"}const eh=Object.getPrototypeOf(Uint8Array),yc="__proto__";function Us(t,e=ga){let n;if(In(t)){let s=t.find(i=>i!=null);if(In(s)||e(s)){n=Array(t.length);for(let i=0;i<t.length;i++)n[i]=Us(t[i],e)}else n=t.slice()}else if(t instanceof eh)n=t.slice();else if(e(t)){n={};for(let s in t)s!=yc&&(n[s]=Us(t[s],e))}else n=t;return n}function Ve(t){let e=arguments;for(let n=1;n<e.length;n++){let s=e[n];for(let i in s)i!=yc&&(ga(t[i])?Ve(t[i],Us(s[i])):t[i]=Us(s[i]))}return t}const th=0,nh=1,sh=2;function ih(t,e,n){for(let s=0,i,a=-1;s<e.length;s++){let o=e[s];if(o>a){for(i=o-1;i>=0&&t[i]==null;)t[i--]=null;for(i=o+1;i<n&&t[i]==null;)t[a=i++]=null}}}function ah(t,e){if(lh(t)){let o=t[0].slice();for(let l=1;l<t.length;l++)o.push(...t[l].slice(1));return ch(o[0])||(o=rh(o)),o}let n=new Set;for(let o=0;o<t.length;o++){let u=t[o][0],d=u.length;for(let v=0;v<d;v++)n.add(u[v])}let s=[Array.from(n).sort((o,l)=>o-l)],i=s[0].length,a=new Map;for(let o=0;o<i;o++)a.set(s[0][o],o);for(let o=0;o<t.length;o++){let l=t[o],u=l[0];for(let d=1;d<l.length;d++){let v=l[d],f=Array(i).fill(void 0),m=e?e[o][d]:nh,y=[];for(let k=0;k<v.length;k++){let F=v[k],_=a.get(u[k]);F===null?m!=th&&(f[_]=F,m==sh&&y.push(_)):f[_]=F}ih(f,y,i),s.push(f)}}return s}const oh=typeof queueMicrotask>"u"?t=>Promise.resolve().then(t):queueMicrotask;function rh(t){let e=t[0],n=e.length,s=Array(n);for(let a=0;a<s.length;a++)s[a]=a;s.sort((a,o)=>e[a]-e[o]);let i=[];for(let a=0;a<t.length;a++){let o=t[a],l=Array(n);for(let u=0;u<n;u++)l[u]=o[s[u]];i.push(l)}return i}function lh(t){let e=t[0][0],n=e.length;for(let s=1;s<t.length;s++){let i=t[s][0];if(i.length!=n)return!1;if(i!=e){for(let a=0;a<n;a++)if(i[a]!=e[a])return!1}}return!0}function ch(t,e=100){const n=t.length;if(n<=1)return!0;let s=0,i=n-1;for(;s<=i&&t[s]==null;)s++;for(;i>=s&&t[i]==null;)i--;if(i<=s)return!0;const a=ut(1,Mt((i-s+1)/e));for(let o=t[s],l=s+a;l<=i;l+=a){const u=t[l];if(u!=null){if(u<=o)return!1;o=u}}return!0}const wc=["January","February","March","April","May","June","July","August","September","October","November","December"],Sc=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];function kc(t){return t.slice(0,3)}const uh=Sc.map(kc),ph=wc.map(kc),hh={MMMM:wc,MMM:ph,WWWW:Sc,WWW:uh};function xi(t){return(t<10?"0":"")+t}function dh(t){return(t<10?"00":t<100?"0":"")+t}const fh={YYYY:t=>t.getFullYear(),YY:t=>(t.getFullYear()+"").slice(2),MMMM:(t,e)=>e.MMMM[t.getMonth()],MMM:(t,e)=>e.MMM[t.getMonth()],MM:t=>xi(t.getMonth()+1),M:t=>t.getMonth()+1,DD:t=>xi(t.getDate()),D:t=>t.getDate(),WWWW:(t,e)=>e.WWWW[t.getDay()],WWW:(t,e)=>e.WWW[t.getDay()],HH:t=>xi(t.getHours()),H:t=>t.getHours(),h:t=>{let e=t.getHours();return e==0?12:e>12?e-12:e},AA:t=>t.getHours()>=12?"PM":"AM",aa:t=>t.getHours()>=12?"pm":"am",a:t=>t.getHours()>=12?"p":"a",mm:t=>xi(t.getMinutes()),m:t=>t.getMinutes(),ss:t=>xi(t.getSeconds()),s:t=>t.getSeconds(),fff:t=>dh(t.getMilliseconds())};function Xo(t,e){e=e||hh;let n=[],s=/\{([a-z]+)\}|[^{]+/gi,i;for(;i=s.exec(t);)n.push(i[0][0]=="{"?fh[i[1]]:i[0]);return a=>{let o="";for(let l=0;l<n.length;l++)o+=typeof n[l]=="string"?n[l]:n[l](a,e);return o}}const mh=new Intl.DateTimeFormat().resolvedOptions().timeZone;function gh(t,e){let n;return e=="UTC"||e=="Etc/UTC"?n=new Date(+t+t.getTimezoneOffset()*6e4):e==mh?n=t:(n=new Date(t.toLocaleString("en-US",{timeZone:e})),n.setMilliseconds(t.getMilliseconds())),n}const Mc=t=>t%1==0,oa=[1,2,2.5,5],vh=Li(10,-32,0,oa),Ec=Li(10,0,32,oa),xh=Ec.filter(Mc),is=vh.concat(Ec),Uo=`
`,Cc="{YYYY}",fl=Uo+Cc,Ac="{M}/{D}",ki=Uo+Ac,Zi=ki+"/{YY}",Pc="{aa}",bh="{h}:{mm}",Bs=bh+Pc,ml=Uo+Bs,gl=":{ss}",xe=null;function zc(t){let e=t*1e3,n=e*60,s=n*60,i=s*24,a=i*30,o=i*365,u=(t==1?Li(10,0,3,oa).filter(Mc):Li(10,-3,0,oa)).concat([e,e*5,e*10,e*15,e*30,n,n*5,n*10,n*15,n*30,s,s*2,s*3,s*4,s*6,s*8,s*12,i,i*2,i*3,i*4,i*5,i*6,i*7,i*8,i*9,i*10,i*15,a,a*2,a*3,a*4,a*6,o,o*2,o*5,o*10,o*25,o*50,o*100]);const d=[[o,Cc,xe,xe,xe,xe,xe,xe,1],[i*28,"{MMM}",fl,xe,xe,xe,xe,xe,1],[i,Ac,fl,xe,xe,xe,xe,xe,1],[s,"{h}"+Pc,Zi,xe,ki,xe,xe,xe,1],[n,Bs,Zi,xe,ki,xe,xe,xe,1],[e,gl,Zi+" "+Bs,xe,ki+" "+Bs,xe,ml,xe,1],[t,gl+".{fff}",Zi+" "+Bs,xe,ki+" "+Bs,xe,ml,xe,1]];function v(f){return(m,y,k,F,_,P)=>{let M=[],$=_>=o,z=_>=a&&_<o,K=f(k),R=Ee(K*t,3),ee=no(K.getFullYear(),$?0:K.getMonth(),z||$?1:K.getDate()),W=Ee(ee*t,3);if(z||$){let se=z?_/a:0,J=$?_/o:0,L=R==W?R:Ee(no(ee.getFullYear()+J,ee.getMonth()+se,1)*t,3),te=new Date(qe(L/t)),B=te.getFullYear(),Z=te.getMonth();for(let Y=0;L<=F;Y++){let oe=no(B+J*Y,Z+se*Y,1),H=oe-f(Ee(oe*t,3));L=Ee((+oe+H)*t,3),L<=F&&M.push(L)}}else{let se=_>=i?i:_,J=Mt(k)-Mt(R),L=W+J+ma(R-W,se);M.push(L);let te=f(L),B=te.getHours()+te.getMinutes()/n+te.getSeconds()/s,Z=_/s,Y=m.axes[y]._space,oe=P/Y;for(;L=Ee(L+_,t==1?0:3),!(L>F);)if(Z>1){let H=Mt(Ee(B+Z,6))%24,ce=f(L).getHours()-H;ce>1&&(ce=-1),L-=ce*s,B=(B+Z)%24;let me=M[M.length-1];Ee((L-me)/_,3)*oe>=.7&&M.push(L)}else M.push(L)}return M}}return[u,d,v]}const[yh,wh,Sh]=zc(1),[kh,Mh,Eh]=zc(.001);Li(2,-53,53,[1]);function vl(t,e){return t.map(n=>n.map((s,i)=>i==0||i==8||s==null?s:e(i==1||n[8]==0?s:n[1]+s)))}function xl(t,e){return(n,s,i,a,o)=>{let l=e.find(k=>o>=k[0])||e[e.length-1],u,d,v,f,m,y;return s.map(k=>{let F=t(k),_=F.getFullYear(),P=F.getMonth(),M=F.getDate(),$=F.getHours(),z=F.getMinutes(),K=F.getSeconds(),R=_!=u&&l[2]||P!=d&&l[3]||M!=v&&l[4]||$!=f&&l[5]||z!=m&&l[6]||K!=y&&l[7]||l[1];return u=_,d=P,v=M,f=$,m=z,y=K,R(F)})}}function Ch(t,e){let n=Xo(e);return(s,i,a,o,l)=>i.map(u=>n(t(u)))}function no(t,e,n){return new Date(t,e,n)}function bl(t,e){return e(t)}const Ah="{YYYY}-{MM}-{DD} {h}:{mm}{aa}";function yl(t,e){return(n,s,i,a)=>a==null?Bo:e(t(s))}function Ph(t,e){let n=t.series[e];return n.width?n.stroke(t,e):n.points.width?n.points.stroke(t,e):null}function zh(t,e){return t.series[e].fill(t,e)}const _h={show:!0,live:!0,isolate:!1,mount:Gp,markers:{show:!0,width:2,stroke:Ph,fill:zh,dash:"solid"},idx:null,idxs:null,values:[]};function Lh(t,e){let n=t.cursor.points,s=Lt(),i=n.size(t,e);Fe(s,wi,i),Fe(s,Si,i);let a=i/-2;Fe(s,"marginLeft",a),Fe(s,"marginTop",a);let o=n.width(t,e,i);return o&&Fe(s,"borderWidth",o),s}function Fh(t,e){let n=t.series[e].points;return n._fill||n._stroke}function Th(t,e){let n=t.series[e].points;return n._stroke||n._fill}function Nh(t,e){return t.series[e].points.size}const so=[0,0];function Ih(t,e,n){return so[0]=e,so[1]=n,so}function Ji(t,e,n,s=!0){return i=>{i.button==0&&(!s||i.target==e)&&n(i)}}function io(t,e,n,s=!0){return i=>{(!s||i.target==e)&&n(i)}}const $h={show:!0,x:!0,y:!0,lock:!1,move:Ih,points:{one:!1,show:Lh,size:Nh,width:0,stroke:Th,fill:Fh},bind:{mousedown:Ji,mouseup:Ji,click:Ji,dblclick:Ji,mousemove:io,mouseleave:io,mouseenter:io},drag:{setScale:!0,x:!0,y:!1,dist:0,uni:null,click:(t,e)=>{e.stopPropagation(),e.stopImmediatePropagation()},_x:!1,_y:!1},focus:{dist:(t,e,n,s,i)=>s-i,prox:-1,bias:0},hover:{skip:[void 0],prox:null,bias:0},left:-10,top:-10,idx:null,dataIdx:null,idxs:null,event:null},_c={show:!0,stroke:"rgba(0,0,0,0.07)",width:2},Wo=Ve({},_c,{filter:gc}),Lc=Ve({},Wo,{size:10}),Fc=Ve({},_c,{show:!1}),Go='12px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',Tc="bold "+Go,Nc=1.5,wl={show:!0,scale:"x",stroke:Do,space:50,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:Tc,side:2,grid:Wo,ticks:Lc,border:Fc,font:Go,lineGap:Nc,rotate:0},Rh="Value",Oh="Time",Sl={show:!0,scale:"x",auto:!1,sorted:1,min:Me,max:-Me,idxs:[]};function Dh(t,e,n,s,i){return e.map(a=>a==null?"":Ho(a))}function Bh(t,e,n,s,i,a,o){let l=[],u=On.get(i)||0;n=o?n:Ee(ma(n,i),u);for(let d=n;d<=s;d=Ee(d+i,u))l.push(Object.is(d,-0)?0:d);return l}function yo(t,e,n,s,i,a,o){const l=[],u=t.scales[t.axes[e].scale].log,d=u==10?gn:dc,v=Mt(d(n));i=js(u,v),u==10&&(i=is[Xt(i,is)]);let f=n,m=i*u;u==10&&(m=is[Xt(m,is)]);do l.push(f),f=f+i,u==10&&!On.has(f)&&(f=Ee(f,On.get(i))),f>=m&&(i=f,m=i*u,u==10&&(m=is[Xt(m,is)]));while(f<=s);return l}function Vh(t,e,n,s,i,a,o){let u=t.scales[t.axes[e].scale].asinh,d=s>u?yo(t,e,ut(u,n),s,i):[u],v=s>=0&&n<=0?[0]:[];return(n<-u?yo(t,e,ut(u,-s),-n,i):[u]).reverse().map(m=>-m).concat(v,d)}const Ic=/./,Yh=/[12357]/,qh=/[125]/,kl=/1/,wo=(t,e,n,s)=>t.map((i,a)=>e==4&&i==0||a%s==0&&n.test(i.toExponential()[i<0?1:0])?i:null);function Hh(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=t.scales[o],u=t.valToPos,d=a._space,v=u(10,o),f=u(9,o)-v>=d?Ic:u(7,o)-v>=d?Yh:u(5,o)-v>=d?qh:kl;if(f==kl){let m=He(u(1,o)-v);if(m<d)return wo(e.slice().reverse(),l.distr,f,Tt(d/m)).reverse()}return wo(e,l.distr,f,1)}function jh(t,e,n,s,i){let a=t.axes[n],o=a.scale,l=a._space,u=t.valToPos,d=He(u(1,o)-u(2,o));return d<l?wo(e.slice().reverse(),3,Ic,Tt(l/d)).reverse():e}function Xh(t,e,n,s){return s==null?Bo:e==null?"":Ho(e)}const Ml={show:!0,scale:"y",stroke:Do,space:30,gap:5,alignTo:1,size:50,labelGap:0,labelSize:30,labelFont:Tc,side:3,grid:Wo,ticks:Lc,border:Fc,font:Go,lineGap:Nc,rotate:0};function Uh(t,e){let n=3+(t||1)*2;return Ee(n*e,3)}function Wh(t,e){let{scale:n,idxs:s}=t.series[0],i=t._data[0],a=t.valToPos(i[s[0]],n,!0),o=t.valToPos(i[s[1]],n,!0),l=He(o-a),u=t.series[e],d=l/(u.points.space*ve);return s[1]-s[0]<=d}const El={scale:null,auto:!0,sorted:0,min:Me,max:-Me},$c=(t,e,n,s,i)=>i,Cl={show:!0,auto:!0,sorted:0,gaps:$c,alpha:1,facets:[Ve({},El,{scale:"x"}),Ve({},El,{scale:"y"})]},Al={scale:"y",auto:!0,sorted:0,show:!0,spanGaps:!1,gaps:$c,alpha:1,points:{show:Wh,filter:null},values:null,min:Me,max:-Me,idxs:[],path:null,clip:null};function Gh(t,e,n,s,i){return n/10}const Rc={time:yp,auto:!0,distr:1,log:10,asinh:1,min:null,max:null,dir:1,ori:0},Kh=Ve({},Rc,{time:!1,ori:1}),Pl={};function Oc(t,e){let n=Pl[t];return n||(n={key:t,plots:[],sub(s){n.plots.push(s)},unsub(s){n.plots=n.plots.filter(i=>i!=s)},pub(s,i,a,o,l,u,d){for(let v=0;v<n.plots.length;v++)n.plots[v]!=i&&n.plots[v].pub(s,i,a,o,l,u,d)}},t!=null&&(Pl[t]=n)),n}const Ws=1,So=2;function vs(t,e,n){const s=t.mode,i=t.series[e],a=s==2?t._data[e]:t._data,o=t.scales,l=t.bbox;let u=a[0],d=s==2?a[1]:a[e],v=s==2?o[i.facets[0].scale]:o[t.series[0].scale],f=s==2?o[i.facets[1].scale]:o[i.scale],m=l.left,y=l.top,k=l.width,F=l.height,_=t.valToPosH,P=t.valToPosV;return v.ori==0?n(i,u,d,v,f,_,P,m,y,k,F,xa,si,ya,Bc,Yc):n(i,u,d,v,f,P,_,y,m,F,k,ba,ii,Jo,Vc,qc)}function Ko(t,e){let n=0,s=0,i=fe(t.bands,jo);for(let a=0;a<i.length;a++){let o=i[a];o.series[0]==e?n=o.dir:o.series[1]==e&&(o.dir==1?s|=1:s|=2)}return[n,s==1?-1:s==2?1:s==3?2:0]}function Zh(t,e,n,s,i){let a=t.mode,o=t.series[e],l=a==2?o.facets[1].scale:o.scale,u=t.scales[l];return i==-1?u.min:i==1?u.max:u.distr==3?u.dir==1?u.min:u.max:0}function vn(t,e,n,s,i,a){return vs(t,e,(o,l,u,d,v,f,m,y,k,F,_)=>{let P=o.pxRound;const M=d.dir*(d.ori==0?1:-1),$=d.ori==0?si:ii;let z,K;M==1?(z=n,K=s):(z=s,K=n);let R=P(f(l[z],d,F,y)),ee=P(m(u[z],v,_,k)),W=P(f(l[K],d,F,y)),se=P(m(a==1?v.max:v.min,v,_,k)),J=new Path2D(i);return $(J,W,se),$(J,R,se),$(J,R,ee),J})}function va(t,e,n,s,i,a){let o=null;if(t.length>0){o=new Path2D;const l=e==0?ya:Jo;let u=n;for(let f=0;f<t.length;f++){let m=t[f];if(m[1]>m[0]){let y=m[0]-u;y>0&&l(o,u,s,y,s+a),u=m[1]}}let d=n+i-u,v=10;d>0&&l(o,u,s-v/2,d,s+a+v)}return o}function Jh(t,e,n){let s=t[t.length-1];s&&s[0]==e?s[1]=n:t.push([e,n])}function Zo(t,e,n,s,i,a,o){let l=[],u=t.length;for(let d=i==1?n:s;d>=n&&d<=s;d+=i)if(e[d]===null){let f=d,m=d;if(i==1)for(;++d<=s&&e[d]===null;)m=d;else for(;--d>=n&&e[d]===null;)m=d;let y=a(t[f]),k=m==f?y:a(t[m]),F=f-i;y=o<=0&&F>=0&&F<u?a(t[F]):y;let P=m+i;k=o>=0&&P>=0&&P<u?a(t[P]):k,k>=y&&l.push([y,k])}return l}function zl(t){return t==0?mc:t==1?qe:e=>ss(e,t)}function Dc(t){let e=t==0?xa:ba,n=t==0?(i,a,o,l,u,d)=>{i.arcTo(a,o,l,u,d)}:(i,a,o,l,u,d)=>{i.arcTo(o,a,u,l,d)},s=t==0?(i,a,o,l,u)=>{i.rect(a,o,l,u)}:(i,a,o,l,u)=>{i.rect(o,a,u,l)};return(i,a,o,l,u,d=0,v=0)=>{d==0&&v==0?s(i,a,o,l,u):(d=Ut(d,l/2,u/2),v=Ut(v,l/2,u/2),e(i,a+d,o),n(i,a+l,o,a+l,o+u,d),n(i,a+l,o+u,a,o+u,v),n(i,a,o+u,a,o,v),n(i,a,o,a+l,o,d),i.closePath())}}const xa=(t,e,n)=>{t.moveTo(e,n)},ba=(t,e,n)=>{t.moveTo(n,e)},si=(t,e,n)=>{t.lineTo(e,n)},ii=(t,e,n)=>{t.lineTo(n,e)},ya=Dc(0),Jo=Dc(1),Bc=(t,e,n,s,i,a)=>{t.arc(e,n,s,i,a)},Vc=(t,e,n,s,i,a)=>{t.arc(n,e,s,i,a)},Yc=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(e,n,s,i,a,o)},qc=(t,e,n,s,i,a,o)=>{t.bezierCurveTo(n,e,i,s,o,a)};function Hc(t){return(e,n,s,i,a)=>vs(e,n,(o,l,u,d,v,f,m,y,k,F,_)=>{let{pxRound:P,points:M}=o,$,z;d.ori==0?($=xa,z=Bc):($=ba,z=Vc);const K=Ee(M.width*ve,3);let R=(M.size-M.width)/2*ve,ee=Ee(R*2,3),W=new Path2D,se=new Path2D,{left:J,top:L,width:te,height:B}=e.bbox;ya(se,J-ee,L-ee,te+ee*2,B+ee*2);const Z=Y=>{if(u[Y]!=null){let oe=P(f(l[Y],d,F,y)),H=P(m(u[Y],v,_,k));$(W,oe+R,H),z(W,oe,H,R,0,sa*2)}};if(a)a.forEach(Z);else for(let Y=s;Y<=i;Y++)Z(Y);return{stroke:K>0?W:null,fill:W,clip:se,flags:Ws|So}})}function jc(t){return(e,n,s,i,a,o)=>{s!=i&&(a!=s&&o!=s&&t(e,n,s),a!=i&&o!=i&&t(e,n,i),t(e,n,o))}}const Qh=jc(si),ed=jc(ii);function Xc(t){const e=fe(t?.alignGaps,0);return(n,s,i,a)=>vs(n,s,(o,l,u,d,v,f,m,y,k,F,_)=>{[i,a]=da(u,i,a);let P=o.pxRound,M=B=>P(f(B,d,F,y)),$=B=>P(m(B,v,_,k)),z,K;d.ori==0?(z=si,K=Qh):(z=ii,K=ed);const R=d.dir*(d.ori==0?1:-1),ee={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:Ws},W=ee.stroke;let se=!1;if(a-i>=F*4){let B=q=>n.posToVal(q,d.key,!0),Z=null,Y=null,oe,H,st,we=M(l[R==1?i:a]),ce=M(l[i]),me=M(l[a]),ie=B(R==1?ce+1:me-1);for(let q=R==1?i:a;q>=i&&q<=a;q+=R){let Se=l[q],Ce=(R==1?Se<ie:Se>ie)?we:M(Se),he=u[q];Ce==we?he!=null?(H=he,Z==null?(z(W,Ce,$(H)),oe=Z=Y=H):H<Z?Z=H:H>Y&&(Y=H)):he===null&&(se=!0):(Z!=null&&K(W,we,$(Z),$(Y),$(oe),$(H)),he!=null?(H=he,z(W,Ce,$(H)),Z=Y=oe=H):(Z=Y=null,he===null&&(se=!0)),we=Ce,ie=B(we+R))}Z!=null&&Z!=Y&&st!=we&&K(W,we,$(Z),$(Y),$(oe),$(H))}else for(let B=R==1?i:a;B>=i&&B<=a;B+=R){let Z=u[B];Z===null?se=!0:Z!=null&&z(W,M(l[B]),$(Z))}let[L,te]=Ko(n,s);if(o.fill!=null||L!=0){let B=ee.fill=new Path2D(W),Z=o.fillTo(n,s,o.min,o.max,L),Y=$(Z),oe=M(l[i]),H=M(l[a]);R==-1&&([H,oe]=[oe,H]),z(B,H,Y),z(B,oe,Y)}if(!o.spanGaps){let B=[];se&&B.push(...Zo(l,u,i,a,R,M,e)),ee.gaps=B=o.gaps(n,s,i,a,B),ee.clip=va(B,d.ori,y,k,F,_)}return te!=0&&(ee.band=te==2?[vn(n,s,i,a,W,-1),vn(n,s,i,a,W,1)]:vn(n,s,i,a,W,te)),ee})}function td(t){const e=fe(t.align,1),n=fe(t.ascDesc,!1),s=fe(t.alignGaps,0),i=fe(t.extend,!1);return(a,o,l,u)=>vs(a,o,(d,v,f,m,y,k,F,_,P,M,$)=>{[l,u]=da(f,l,u);let z=d.pxRound,{left:K,width:R}=a.bbox,ee=ce=>z(k(ce,m,M,_)),W=ce=>z(F(ce,y,$,P)),se=m.ori==0?si:ii;const J={stroke:new Path2D,fill:null,clip:null,band:null,gaps:null,flags:Ws},L=J.stroke,te=m.dir*(m.ori==0?1:-1);let B=W(f[te==1?l:u]),Z=ee(v[te==1?l:u]),Y=Z,oe=Z;i&&e==-1&&(oe=K,se(L,oe,B)),se(L,Z,B);for(let ce=te==1?l:u;ce>=l&&ce<=u;ce+=te){let me=f[ce];if(me==null)continue;let ie=ee(v[ce]),q=W(me);e==1?se(L,ie,B):se(L,Y,q),se(L,ie,q),B=q,Y=ie}let H=Y;i&&e==1&&(H=K+R,se(L,H,B));let[st,we]=Ko(a,o);if(d.fill!=null||st!=0){let ce=J.fill=new Path2D(L),me=d.fillTo(a,o,d.min,d.max,st),ie=W(me);se(ce,H,ie),se(ce,oe,ie)}if(!d.spanGaps){let ce=[];ce.push(...Zo(v,f,l,u,te,ee,s));let me=d.width*ve/2,ie=n||e==1?me:-me,q=n||e==-1?-me:me;ce.forEach(Se=>{Se[0]+=ie,Se[1]+=q}),J.gaps=ce=d.gaps(a,o,l,u,ce),J.clip=va(ce,m.ori,_,P,M,$)}return we!=0&&(J.band=we==2?[vn(a,o,l,u,L,-1),vn(a,o,l,u,L,1)]:vn(a,o,l,u,L,we)),J})}function _l(t,e,n,s,i,a,o=Me){if(t.length>1){let l=null;for(let u=0,d=1/0;u<t.length;u++)if(e[u]!==void 0){if(l!=null){let v=He(t[u]-t[l]);v<d&&(d=v,o=He(n(t[u],s,i,a)-n(t[l],s,i,a)))}l=u}}return o}function nd(t){t=t||zi;const e=fe(t.size,[.6,Me,1]),n=t.align||0,s=t.gap||0;let i=t.radius;i=i==null?[0,0]:typeof i=="number"?[i,0]:i;const a=le(i),o=1-e[0],l=fe(e[1],Me),u=fe(e[2],1),d=fe(t.disp,zi),v=fe(t.each,y=>{}),{fill:f,stroke:m}=d;return(y,k,F,_)=>vs(y,k,(P,M,$,z,K,R,ee,W,se,J,L)=>{let te=P.pxRound,B=n,Z=s*ve,Y=l*ve,oe=u*ve,H,st;z.ori==0?[H,st]=a(y,k):[st,H]=a(y,k);const we=z.dir*(z.ori==0?1:-1);let ce=z.ori==0?ya:Jo,me=z.ori==0?v:(O,Ae,Ye,ws,Gn,en,Kn)=>{v(O,Ae,Ye,Gn,ws,Kn,en)},ie=fe(y.bands,jo).find(O=>O.series[0]==k),q=ie!=null?ie.dir:0,Se=P.fillTo(y,k,P.min,P.max,q),Ue=te(ee(Se,K,L,se)),Ce,he,T,S=J,C=te(P.width*ve),V=!1,ke=null,ue=null,$e=null,pt=null;f!=null&&(C==0||m!=null)&&(V=!0,ke=f.values(y,k,F,_),ue=new Map,new Set(ke).forEach(O=>{O!=null&&ue.set(O,new Path2D)}),C>0&&($e=m.values(y,k,F,_),pt=new Map,new Set($e).forEach(O=>{O!=null&&pt.set(O,new Path2D)})));let{x0:$t,size:Qt}=d;if($t!=null&&Qt!=null){B=1,M=$t.values(y,k,F,_),$t.unit==2&&(M=M.map(Ye=>y.posToVal(W+Ye*J,z.key,!0)));let O=Qt.values(y,k,F,_);Qt.unit==2?he=O[0]*J:he=R(O[0],z,J,W)-R(0,z,J,W),S=_l(M,$,R,z,J,W,S),T=S-he+Z}else S=_l(M,$,R,z,J,W,S),T=S*o+Z,he=S-T;T<1&&(T=0),C>=he/2&&(C=0),T<5&&(te=mc);let Bi=T>0,Un=S-T-(Bi?C:0);he=te(bo(Un,oe,Y)),Ce=(B==0?he/2:B==we?0:he)-B*we*((B==0?Z/2:0)+(Bi?C/2:0));const ot={stroke:null,fill:null,clip:null,band:null,gaps:null,flags:0},ys=V?null:new Path2D;let un=null;if(ie!=null)un=y.data[ie.series[1]];else{let{y0:O,y1:Ae}=d;O!=null&&Ae!=null&&($=Ae.values(y,k,F,_),un=O.values(y,k,F,_))}let Wn=H*he,ne=st*he;for(let O=we==1?F:_;O>=F&&O<=_;O+=we){let Ae=$[O];if(Ae==null)continue;if(un!=null){let ht=un[O]??0;if(Ae-ht==0)continue;Ue=ee(ht,K,L,se)}let Ye=z.distr!=2||d!=null?M[O]:O,ws=R(Ye,z,J,W),Gn=ee(fe(Ae,Se),K,L,se),en=te(ws-Ce),Kn=te(ut(Gn,Ue)),vt=te(Ut(Gn,Ue)),Ct=Kn-vt;if(Ae!=null){let ht=Ae<0?ne:Wn,Rt=Ae<0?Wn:ne;V?(C>0&&$e[O]!=null&&ce(pt.get($e[O]),en,vt+Mt(C/2),he,ut(0,Ct-C),ht,Rt),ke[O]!=null&&ce(ue.get(ke[O]),en,vt+Mt(C/2),he,ut(0,Ct-C),ht,Rt)):ce(ys,en,vt+Mt(C/2),he,ut(0,Ct-C),ht,Rt),me(y,k,O,en-C/2,vt,he+C,Ct)}}return C>0?ot.stroke=V?pt:ys:V||(ot._fill=P.width==0?P._fill:P._stroke??P._fill,ot.width=0),ot.fill=V?ue:ys,ot})}function sd(t,e){const n=fe(e?.alignGaps,0);return(s,i,a,o)=>vs(s,i,(l,u,d,v,f,m,y,k,F,_,P)=>{[a,o]=da(d,a,o);let M=l.pxRound,$=H=>M(m(H,v,_,k)),z=H=>M(y(H,f,P,F)),K,R,ee;v.ori==0?(K=xa,ee=si,R=Yc):(K=ba,ee=ii,R=qc);const W=v.dir*(v.ori==0?1:-1);let se=$(u[W==1?a:o]),J=se,L=[],te=[];for(let H=W==1?a:o;H>=a&&H<=o;H+=W)if(d[H]!=null){let we=u[H],ce=$(we);L.push(J=ce),te.push(z(d[H]))}const B={stroke:t(L,te,K,ee,R,M),fill:null,clip:null,band:null,gaps:null,flags:Ws},Z=B.stroke;let[Y,oe]=Ko(s,i);if(l.fill!=null||Y!=0){let H=B.fill=new Path2D(Z),st=l.fillTo(s,i,l.min,l.max,Y),we=z(st);ee(H,J,we),ee(H,se,we)}if(!l.spanGaps){let H=[];H.push(...Zo(u,d,a,o,W,$,n)),B.gaps=H=l.gaps(s,i,a,o,H),B.clip=va(H,v.ori,k,F,_,P)}return oe!=0&&(B.band=oe==2?[vn(s,i,a,o,Z,-1),vn(s,i,a,o,Z,1)]:vn(s,i,a,o,Z,oe)),B})}function id(t){return sd(ad,t)}function ad(t,e,n,s,i,a){const o=t.length;if(o<2)return null;const l=new Path2D;if(n(l,t[0],e[0]),o==2)s(l,t[1],e[1]);else{let u=Array(o),d=Array(o-1),v=Array(o-1),f=Array(o-1);for(let m=0;m<o-1;m++)v[m]=e[m+1]-e[m],f[m]=t[m+1]-t[m],d[m]=v[m]/f[m];u[0]=d[0];for(let m=1;m<o-1;m++)d[m]===0||d[m-1]===0||d[m-1]>0!=d[m]>0?u[m]=0:(u[m]=3*(f[m-1]+f[m])/((2*f[m]+f[m-1])/d[m-1]+(f[m]+2*f[m-1])/d[m]),isFinite(u[m])||(u[m]=0));u[o-1]=d[o-2];for(let m=0;m<o-1;m++)i(l,t[m]+f[m]/3,e[m]+u[m]*f[m]/3,t[m+1]-f[m]/3,e[m+1]-u[m+1]*f[m]/3,t[m+1],e[m+1])}return l}const ko=new Set;function Ll(){for(let t of ko)t.syncRect(!0)}ni&&(rs(Dp,qs,Ll),rs(Bp,qs,Ll,!0),rs(ia,qs,()=>{Te.pxRatio=ve}));const od=Xc(),rd=Hc();function Fl(t,e,n,s){return(s?[t[0],t[1]].concat(t.slice(2)):[t[0]].concat(t.slice(1))).map((a,o)=>Mo(a,o,e,n))}function ld(t,e){return t.map((n,s)=>s==0?{}:Ve({},e,n))}function Mo(t,e,n,s){return Ve({},e==0?n:s,t)}function Uc(t,e,n){return e==null?Xs:[e,n]}const cd=Uc;function ud(t,e,n){return e==null?Xs:aa(e,n,qo,!0)}function Wc(t,e,n,s){return e==null?Xs:fa(e,n,t.scales[s].log,!1)}const pd=Wc;function Gc(t,e,n,s){return e==null?Xs:Yo(e,n,t.scales[s].log,!1)}const hd=Gc;function dd(t,e,n,s,i){let a=ut(ul(t),ul(e)),o=e-t,l=Xt(i/s*o,n);do{let u=n[l],d=s*u/o;if(d>=i&&a+(u<5?On.get(u):0)<=17)return[u,d]}while(++l<n.length);return[0,0]}function Tl(t){let e,n;return t=t.replace(/(\d+)px/,(s,i)=>(e=qe((n=+i)*ve))+"px"),[t,e,n]}function fd(t){t.show&&[t.font,t.labelFont].forEach(e=>{let n=Ee(e[2]*ve,1);e[0]=e[0].replace(/[0-9.]+px/,n+"px"),e[1]=n})}function Te(t,e,n){const s={mode:fe(t.mode,1)},i=s.mode;function a(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?1-g:g)}function o(r,c,p,h){let g=c.valToPct(r);return h+p*(c.dir==-1?g:1-g)}function l(r,c,p,h){return c.ori==0?a(r,c,p,h):o(r,c,p,h)}s.valToPosH=a,s.valToPosV=o;let u=!1;s.status=0;const d=s.root=Lt(wp);if(t.id!=null&&(d.id=t.id),wt(d,t.class),t.title){let r=Lt(Mp,d);r.textContent=t.title}const v=jt("canvas"),f=s.ctx=v.getContext("2d"),m=Lt(Ep,d);rs("click",m,r=>{r.target===k&&(ze!=Fs||Ie!=Ts)&&tt.click(s,r)},!0);const y=s.under=Lt(Cp,m);m.appendChild(v);const k=s.over=Lt(Ap,m);t=Us(t);const F=+fe(t.pxAlign,1),_=zl(F);(t.plugins||[]).forEach(r=>{r.opts&&(t=r.opts(s,t)||t)});const P=t.ms||.001,M=s.series=i==1?Fl(t.series||[],Sl,Al,!1):ld(t.series||[null],Cl),$=s.axes=Fl(t.axes||[],wl,Ml,!0),z=s.scales={},K=s.bands=t.bands||[];K.forEach(r=>{r.fill=le(r.fill||null),r.dir=fe(r.dir,-1)});const R=i==2?M[1].facets[0].scale:M[0].scale,ee={axes:ap,series:ep},W=(t.drawOrder||["axes","series"]).map(r=>ee[r]);function se(r){const c=r.distr==3?p=>gn(p>0?p:r.clamp(s,p,r.min,r.max,r.key)):r.distr==4?p=>to(p,r.asinh):r.distr==100?p=>r.fwd(p):p=>p;return p=>{let h=c(p),{_min:g,_max:b}=r,w=b-g;return(h-g)/w}}function J(r){let c=z[r];if(c==null){let p=(t.scales||zi)[r]||zi;if(p.from!=null){J(p.from);let h=Ve({},z[p.from],p,{key:r});h.valToPct=se(h),z[r]=h}else{c=z[r]=Ve({},r==R?Rc:Kh,p),c.key=r;let h=c.time,g=c.range,b=In(g);if((r!=R||i==2&&!h)&&(b&&(g[0]==null||g[1]==null)&&(g={min:g[0]==null?rl:{mode:1,hard:g[0],soft:g[0]},max:g[1]==null?rl:{mode:1,hard:g[1],soft:g[1]}},b=!1),!b&&ga(g))){let w=g;g=(E,A,N)=>A==null?Xs:aa(A,N,w)}c.range=le(g||(h?cd:r==R?c.distr==3?pd:c.distr==4?hd:Uc:c.distr==3?Wc:c.distr==4?Gc:ud)),c.auto=le(b?!1:c.auto),c.clamp=le(c.clamp||Gh),c._min=c._max=null,c.valToPct=se(c)}}}J("x"),J("y"),i==1&&M.forEach(r=>{J(r.scale)}),$.forEach(r=>{J(r.scale)});for(let r in t.scales)J(r);const L=z[R],te=L.distr;let B,Z;L.ori==0?(wt(d,Sp),B=a,Z=o):(wt(d,kp),B=o,Z=a);const Y={};for(let r in z){let c=z[r];(c.min!=null||c.max!=null)&&(Y[r]={min:c.min,max:c.max},c.min=c.max=null)}const oe=t.tzDate||(r=>new Date(qe(r/P))),H=t.fmtDate||Xo,st=P==1?Sh(oe):Eh(oe),we=xl(oe,vl(P==1?wh:Mh,H)),ce=yl(oe,bl(Ah,H)),me=[],ie=s.legend=Ve({},_h,t.legend),q=s.cursor=Ve({},$h,{drag:{y:i==2}},t.cursor),Se=ie.show,Ue=q.show,Ce=ie.markers;ie.idxs=me,Ce.width=le(Ce.width),Ce.dash=le(Ce.dash),Ce.stroke=le(Ce.stroke),Ce.fill=le(Ce.fill);let he,T,S,C=[],V=[],ke,ue=!1,$e={};if(ie.live){const r=M[1]?M[1].values:null;ue=r!=null,ke=ue?r(s,1,0):{_:0};for(let c in ke)$e[c]=Bo}if(Se)if(he=jt("table",Tp,d),S=jt("tbody",null,he),ie.mount(s,he),ue){T=jt("thead",null,he,S);let r=jt("tr",null,T);jt("th",null,r);for(var pt in ke)jt("th",Wr,r).textContent=pt}else wt(he,Ip),ie.live&&wt(he,Np);const $t={show:!0},Qt={show:!1};function Bi(r,c){if(c==0&&(ue||!ie.live||i==2))return Xs;let p=[],h=jt("tr",$p,S,S.childNodes[c]);wt(h,r.class),r.show||wt(h,as);let g=jt("th",null,h);if(Ce.show){let E=Lt(Rp,g);if(c>0){let A=Ce.width(s,c);A&&(E.style.border=A+"px "+Ce.dash(s,c)+" "+Ce.stroke(s,c)),E.style.background=Ce.fill(s,c)}}let b=Lt(Wr,g);r.label instanceof HTMLElement?b.appendChild(r.label):b.textContent=r.label,c>0&&(Ce.show||(b.style.color=r.width>0?Ce.stroke(s,c):Ce.fill(s,c)),ot("click",g,E=>{if(q._lock)return;Jn(E);let A=M.indexOf(r);if((E.ctrlKey||E.metaKey)!=ie.isolate){let N=M.some((I,D)=>D>0&&D!=A&&I.show);M.forEach((I,D)=>{D>0&&nn(D,N?D==A?$t:Qt:$t,!0,Be.setSeries)})}else nn(A,{show:!r.show},!0,Be.setSeries)},!1),ks&&ot(Jr,g,E=>{q._lock||(Jn(E),nn(M.indexOf(r),Is,!0,Be.setSeries))},!1));for(var w in ke){let E=jt("td",Op,h);E.textContent="--",p.push(E)}return[h,p]}const Un=new Map;function ot(r,c,p,h=!0){const g=Un.get(c)||{},b=q.bind[r](s,c,p,h);b&&(rs(r,c,g[r]=b),Un.set(c,g))}function ys(r,c,p){const h=Un.get(c)||{};for(let g in h)(r==null||g==r)&&(xo(g,c,h[g]),delete h[g]);r==null&&Un.delete(c)}let un=0,Wn=0,ne=0,O=0,Ae=0,Ye=0,ws=Ae,Gn=Ye,en=ne,Kn=O,vt=0,Ct=0,ht=0,Rt=0;s.bbox={};let za=!1,Vi=!1,Ss=!1,Zn=!1,Yi=!1,At=!1;function _a(r,c,p){(p||r!=s.width||c!=s.height)&&xr(r,c),Ps(!1),Ss=!0,Vi=!0,zs()}function xr(r,c){s.width=un=ne=r,s.height=Wn=O=c,Ae=Ye=0,Uu(),Wu();let p=s.bbox;vt=p.left=ss(Ae*ve,.5),Ct=p.top=ss(Ye*ve,.5),ht=p.width=ss(ne*ve,.5),Rt=p.height=ss(O*ve,.5)}const Hu=3;function ju(){let r=!1,c=0;for(;!r;){c++;let p=sp(c),h=ip(c);r=c==Hu||p&&h,r||(xr(s.width,s.height),Vi=!0)}}function Xu({width:r,height:c}){_a(r,c)}s.setSize=Xu;function Uu(){let r=!1,c=!1,p=!1,h=!1;$.forEach((g,b)=>{if(g.show&&g._show){let{side:w,_size:E}=g,A=w%2,N=g.label!=null?g.labelSize:0,I=E+N;I>0&&(A?(ne-=I,w==3?(Ae+=I,h=!0):p=!0):(O-=I,w==0?(Ye+=I,r=!0):c=!0))}}),Qn[0]=r,Qn[1]=p,Qn[2]=c,Qn[3]=h,ne-=Pn[1]+Pn[3],Ae+=Pn[3],O-=Pn[2]+Pn[0],Ye+=Pn[0]}function Wu(){let r=Ae+ne,c=Ye+O,p=Ae,h=Ye;function g(b,w){switch(b){case 1:return r+=w,r-w;case 2:return c+=w,c-w;case 3:return p-=w,p+w;case 0:return h-=w,h+w}}$.forEach((b,w)=>{if(b.show&&b._show){let E=b.side;b._pos=g(E,b._size),b.label!=null&&(b._lpos=g(E,b.labelSize))}})}if(q.dataIdx==null){let r=q.hover,c=r.skip=new Set(r.skip??[]);c.add(void 0);let p=r.prox=le(r.prox),h=r.bias??=0;q.dataIdx=(g,b,w,E)=>{if(b==0)return w;let A=w,N=p(g,b,w,E)??Me,I=N>=0&&N<Me,D=L.ori==0?ne:O,Q=q.left,ge=e[0],de=e[b];if(c.has(de[w])){A=null;let re=null,G=null,j;if(h==0||h==-1)for(j=w;re==null&&j-- >0;)c.has(de[j])||(re=j);if(h==0||h==1)for(j=w;G==null&&j++<de.length;)c.has(de[j])||(G=j);if(re!=null||G!=null)if(I){let Le=re==null?-1/0:B(ge[re],L,D,0),Re=G==null?1/0:B(ge[G],L,D,0),Qe=Q-Le,be=Re-Q;Qe<=be?Qe<=N&&(A=re):be<=N&&(A=G)}else A=G==null?re:re==null?G:w-re<=G-w?re:G}else I&&He(Q-B(ge[w],L,D,0))>N&&(A=null);return A}}const Jn=r=>{q.event=r};q.idxs=me,q._lock=!1;let it=q.points;it.show=le(it.show),it.size=le(it.size),it.stroke=le(it.stroke),it.width=le(it.width),it.fill=le(it.fill);const tn=s.focus=Ve({},t.focus||{alpha:.3},q.focus),ks=tn.prox>=0,Ms=ks&&it.one;let Pt=[],Es=[],Cs=[];function br(r,c){let p=it.show(s,c);if(p instanceof HTMLElement)return wt(p,Fp),wt(p,r.class),rn(p,-10,-10,ne,O),k.insertBefore(p,Pt[c]),p}function yr(r,c){if(i==1||c>0){let p=i==1&&z[r.scale].time,h=r.value;r.value=p?dl(h)?yl(oe,bl(h,H)):h||ce:h||Xh,r.label=r.label||(p?Oh:Rh)}if(Ms||c>0){r.width=r.width==null?1:r.width,r.paths=r.paths||od||Kp,r.fillTo=le(r.fillTo||Zh),r.pxAlign=+fe(r.pxAlign,F),r.pxRound=zl(r.pxAlign),r.stroke=le(r.stroke||null),r.fill=le(r.fill||null),r._stroke=r._fill=r._paths=r._focus=null;let p=Uh(ut(1,r.width),1),h=r.points=Ve({},{size:p,width:ut(1,p*.2),stroke:r.stroke,space:p*2,paths:rd,_stroke:null,_fill:null},r.points);h.show=le(h.show),h.filter=le(h.filter),h.fill=le(h.fill),h.stroke=le(h.stroke),h.paths=le(h.paths),h.pxAlign=r.pxAlign}if(Se){let p=Bi(r,c);C.splice(c,0,p[0]),V.splice(c,0,p[1]),ie.values.push(null)}if(Ue){me.splice(c,0,null);let p=null;Ms?c==0&&(p=br(r,c)):c>0&&(p=br(r,c)),Pt.splice(c,0,p),Es.splice(c,0,0),Cs.splice(c,0,0)}Je("addSeries",c)}function Gu(r,c){c=c??M.length,r=i==1?Mo(r,c,Sl,Al):Mo(r,c,{},Cl),M.splice(c,0,r),yr(M[c],c)}s.addSeries=Gu;function Ku(r){if(M.splice(r,1),Se){ie.values.splice(r,1),V.splice(r,1);let c=C.splice(r,1)[0];ys(null,c.firstChild),c.remove()}Ue&&(me.splice(r,1),Pt.splice(r,1)[0].remove(),Es.splice(r,1),Cs.splice(r,1)),Je("delSeries",r)}s.delSeries=Ku;const Qn=[!1,!1,!1,!1];function Zu(r,c){if(r._show=r.show,r.show){let p=r.side%2,h=z[r.scale];h==null&&(r.scale=p?M[1].scale:R,h=z[r.scale]);let g=h.time;r.size=le(r.size),r.space=le(r.space),r.rotate=le(r.rotate),In(r.incrs)&&r.incrs.forEach(w=>{!On.has(w)&&On.set(w,xc(w))}),r.incrs=le(r.incrs||(h.distr==2?xh:g?P==1?yh:kh:is)),r.splits=le(r.splits||(g&&h.distr==1?st:h.distr==3?yo:h.distr==4?Vh:Bh)),r.stroke=le(r.stroke),r.grid.stroke=le(r.grid.stroke),r.ticks.stroke=le(r.ticks.stroke),r.border.stroke=le(r.border.stroke);let b=r.values;r.values=In(b)&&!In(b[0])?le(b):g?In(b)?xl(oe,vl(b,H)):dl(b)?Ch(oe,b):b||we:b||Dh,r.filter=le(r.filter||(h.distr>=3&&h.log==10?Hh:h.distr==3&&h.log==2?jh:gc)),r.font=Tl(r.font),r.labelFont=Tl(r.labelFont),r._size=r.size(s,null,c,0),r._space=r._rotate=r._incrs=r._found=r._splits=r._values=null,r._size>0&&(Qn[c]=!0,r._el=Lt(Pp,m))}}function ui(r,c,p,h){let[g,b,w,E]=p,A=c%2,N=0;return A==0&&(E||b)&&(N=c==0&&!g||c==2&&!w?qe(wl.size/3):0),A==1&&(g||w)&&(N=c==1&&!b||c==3&&!E?qe(Ml.size/2):0),N}const wr=s.padding=(t.padding||[ui,ui,ui,ui]).map(r=>le(fe(r,ui))),Pn=s._padding=wr.map((r,c)=>r(s,c,Qn,0));let et,We=null,Ge=null;const qi=i==1?M[0].idxs:null;let Ot=null,pi=!1;function Sr(r,c){if(e=r??[],s.data=s._data=e,i==2){et=0;for(let p=1;p<M.length;p++)et+=e[p][0].length}else{e.length==0&&(s.data=s._data=e=[[]]),Ot=e[0],et=Ot.length;let p=e;if(te==2){p=e.slice();let h=p[0]=Array(et);for(let g=0;g<et;g++)h[g]=g}s._data=e=p}if(Ps(!0),Je("setData"),te==2&&(Ss=!0),c!==!1){let p=L;p.auto(s,pi)?La():_n(R,p.min,p.max),Zn=Zn||q.left>=0,At=!0,zs()}}s.setData=Sr;function La(){pi=!0;let r,c;i==1&&(et>0?(We=qi[0]=0,Ge=qi[1]=et-1,r=e[0][We],c=e[0][Ge],te==2?(r=We,c=Ge):r==c&&(te==3?[r,c]=fa(r,r,L.log,!1):te==4?[r,c]=Yo(r,r,L.log,!1):L.time?c=r+qe(86400/P):[r,c]=aa(r,c,qo,!0))):(We=qi[0]=r=null,Ge=qi[1]=c=null)),_n(R,r,c)}let Hi,As,Fa,Ta,Na,Ia,$a,Ra,Oa,dt;function kr(r,c,p,h,g,b){r??=Kr,p??=jo,h??="butt",g??=Kr,b??="round",r!=Hi&&(f.strokeStyle=Hi=r),g!=As&&(f.fillStyle=As=g),c!=Fa&&(f.lineWidth=Fa=c),b!=Na&&(f.lineJoin=Na=b),h!=Ia&&(f.lineCap=Ia=h),p!=Ta&&f.setLineDash(Ta=p)}function Mr(r,c,p,h){c!=As&&(f.fillStyle=As=c),r!=$a&&(f.font=$a=r),p!=Ra&&(f.textAlign=Ra=p),h!=Oa&&(f.textBaseline=Oa=h)}function Da(r,c,p,h,g=0){if(h.length>0&&r.auto(s,pi)&&(c==null||c.min==null)){let b=fe(We,0),w=fe(Ge,h.length-1),E=p.min==null?Hp(h,b,w,g,r.distr==3):[p.min,p.max];r.min=Ut(r.min,p.min=E[0]),r.max=ut(r.max,p.max=E[1])}}const Er={min:null,max:null};function Ju(){for(let h in z){let g=z[h];Y[h]==null&&(g.min==null||Y[R]!=null&&g.auto(s,pi))&&(Y[h]=Er)}for(let h in z){let g=z[h];Y[h]==null&&g.from!=null&&Y[g.from]!=null&&(Y[h]=Er)}Y[R]!=null&&Ps(!0);let r={};for(let h in Y){let g=Y[h];if(g!=null){let b=r[h]=Us(z[h],Qp);if(g.min!=null)Ve(b,g);else if(h!=R||i==2)if(et==0&&b.from==null){let w=b.range(s,null,null,h);b.min=w[0],b.max=w[1]}else b.min=Me,b.max=-Me}}if(et>0){M.forEach((h,g)=>{if(i==1){let b=h.scale,w=Y[b];if(w==null)return;let E=r[b];if(g==0){let A=E.range(s,E.min,E.max,b);E.min=A[0],E.max=A[1],We=Xt(E.min,e[0]),Ge=Xt(E.max,e[0]),Ge-We>1&&(e[0][We]<E.min&&We++,e[0][Ge]>E.max&&Ge--),h.min=Ot[We],h.max=Ot[Ge]}else h.show&&h.auto&&Da(E,w,h,e[g],h.sorted);h.idxs[0]=We,h.idxs[1]=Ge}else if(g>0&&h.show&&h.auto){let[b,w]=h.facets,E=b.scale,A=w.scale,[N,I]=e[g],D=r[E],Q=r[A];D!=null&&Da(D,Y[E],b,N,b.sorted),Q!=null&&Da(Q,Y[A],w,I,w.sorted),h.min=w.min,h.max=w.max}});for(let h in r){let g=r[h],b=Y[h];if(g.from==null&&(b==null||b.min==null)){let w=g.range(s,g.min==Me?null:g.min,g.max==-Me?null:g.max,h);g.min=w[0],g.max=w[1]}}}for(let h in r){let g=r[h];if(g.from!=null){let b=r[g.from];if(b.min==null)g.min=g.max=null;else{let w=g.range(s,b.min,b.max,h);g.min=w[0],g.max=w[1]}}}let c={},p=!1;for(let h in r){let g=r[h],b=z[h];if(b.min!=g.min||b.max!=g.max){b.min=g.min,b.max=g.max;let w=b.distr;b._min=w==3?gn(b.min):w==4?to(b.min,b.asinh):w==100?b.fwd(b.min):b.min,b._max=w==3?gn(b.max):w==4?to(b.max,b.asinh):w==100?b.fwd(b.max):b.max,c[h]=p=!0}}if(p){M.forEach((h,g)=>{i==2?g>0&&c.y&&(h._paths=null):c[h.scale]&&(h._paths=null)});for(let h in c)Ss=!0,Je("setScale",h);Ue&&q.left>=0&&(Zn=At=!0)}for(let h in Y)Y[h]=null}function Qu(r){let c=bo(We-1,0,et-1),p=bo(Ge+1,0,et-1);for(;r[c]==null&&c>0;)c--;for(;r[p]==null&&p<et-1;)p++;return[c,p]}function ep(){if(et>0){let r=M.some(c=>c._focus)&&dt!=tn.alpha;r&&(f.globalAlpha=dt=tn.alpha),M.forEach((c,p)=>{if(p>0&&c.show&&(Cr(p,!1),Cr(p,!0),c._paths==null)){let h=dt;dt!=c.alpha&&(f.globalAlpha=dt=c.alpha);let g=i==2?[0,e[p][0].length-1]:Qu(e[p]);c._paths=c.paths(s,p,g[0],g[1]),dt!=h&&(f.globalAlpha=dt=h)}}),M.forEach((c,p)=>{if(p>0&&c.show){let h=dt;dt!=c.alpha&&(f.globalAlpha=dt=c.alpha),c._paths!=null&&Ar(p,!1);{let g=c._paths!=null?c._paths.gaps:null,b=c.points.show(s,p,We,Ge,g),w=c.points.filter(s,p,b,g);(b||w)&&(c.points._paths=c.points.paths(s,p,We,Ge,w),Ar(p,!0))}dt!=h&&(f.globalAlpha=dt=h),Je("drawSeries",p)}}),r&&(f.globalAlpha=dt=1)}}function Cr(r,c){let p=c?M[r].points:M[r];p._stroke=p.stroke(s,r),p._fill=p.fill(s,r)}function Ar(r,c){let p=c?M[r].points:M[r],{stroke:h,fill:g,clip:b,flags:w,_stroke:E=p._stroke,_fill:A=p._fill,_width:N=p.width}=p._paths;N=Ee(N*ve,3);let I=null,D=N%2/2;c&&A==null&&(A=N>0?"#fff":E);let Q=p.pxAlign==1&&D>0;if(Q&&f.translate(D,D),!c){let ge=vt-N/2,de=Ct-N/2,re=ht+N,G=Rt+N;I=new Path2D,I.rect(ge,de,re,G)}c?Ba(E,N,p.dash,p.cap,A,h,g,w,b):tp(r,E,N,p.dash,p.cap,A,h,g,w,I,b),Q&&f.translate(-D,-D)}function tp(r,c,p,h,g,b,w,E,A,N,I){let D=!1;A!=0&&K.forEach((Q,ge)=>{if(Q.series[0]==r){let de=M[Q.series[1]],re=e[Q.series[1]],G=(de._paths||zi).band;In(G)&&(G=Q.dir==1?G[0]:G[1]);let j,Le=null;de.show&&G&&Xp(re,We,Ge)?(Le=Q.fill(s,ge)||b,j=de._paths.clip):G=null,Ba(c,p,h,g,Le,w,E,A,N,I,j,G),D=!0}}),D||Ba(c,p,h,g,b,w,E,A,N,I)}const Pr=Ws|So;function Ba(r,c,p,h,g,b,w,E,A,N,I,D){kr(r,c,p,h,g),(A||N||D)&&(f.save(),A&&f.clip(A),N&&f.clip(N)),D?(E&Pr)==Pr?(f.clip(D),I&&f.clip(I),Xi(g,w),ji(r,b,c)):E&So?(Xi(g,w),f.clip(D),ji(r,b,c)):E&Ws&&(f.save(),f.clip(D),I&&f.clip(I),Xi(g,w),f.restore(),ji(r,b,c)):(Xi(g,w),ji(r,b,c)),(A||N||D)&&f.restore()}function ji(r,c,p){p>0&&(c instanceof Map?c.forEach((h,g)=>{f.strokeStyle=Hi=g,f.stroke(h)}):c!=null&&r&&f.stroke(c))}function Xi(r,c){c instanceof Map?c.forEach((p,h)=>{f.fillStyle=As=h,f.fill(p)}):c!=null&&r&&f.fill(c)}function np(r,c,p,h){let g=$[r],b;if(h<=0)b=[0,0];else{let w=g._space=g.space(s,r,c,p,h),E=g._incrs=g.incrs(s,r,c,p,h,w);b=dd(c,p,E,h,w)}return g._found=b}function Va(r,c,p,h,g,b,w,E,A,N){let I=w%2/2;F==1&&f.translate(I,I),kr(E,w,A,N,E),f.beginPath();let D,Q,ge,de,re=g+(h==0||h==3?-b:b);p==0?(Q=g,de=re):(D=g,ge=re);for(let G=0;G<r.length;G++)c[G]!=null&&(p==0?D=ge=r[G]:Q=de=r[G],f.moveTo(D,Q),f.lineTo(ge,de));f.stroke(),F==1&&f.translate(-I,-I)}function sp(r){let c=!0;return $.forEach((p,h)=>{if(!p.show)return;let g=z[p.scale];if(g.min==null){p._show&&(c=!1,p._show=!1,Ps(!1));return}else p._show||(c=!1,p._show=!0,Ps(!1));let b=p.side,w=b%2,{min:E,max:A}=g,[N,I]=np(h,E,A,w==0?ne:O);if(I==0)return;let D=g.distr==2,Q=p._splits=p.splits(s,h,E,A,N,I,D),ge=g.distr==2?Q.map(j=>Ot[j]):Q,de=g.distr==2?Ot[Q[1]]-Ot[Q[0]]:N,re=p._values=p.values(s,p.filter(s,ge,h,I,de),h,I,de);p._rotate=b==2?p.rotate(s,re,h,I):0;let G=p._size;p._size=Tt(p.size(s,re,h,r)),G!=null&&p._size!=G&&(c=!1)}),c}function ip(r){let c=!0;return wr.forEach((p,h)=>{let g=p(s,h,Qn,r);g!=Pn[h]&&(c=!1),Pn[h]=g}),c}function ap(){for(let r=0;r<$.length;r++){let c=$[r];if(!c.show||!c._show)continue;let p=c.side,h=p%2,g,b,w=c.stroke(s,r),E=p==0||p==3?-1:1,[A,N]=c._found;if(c.label!=null){let lt=c.labelGap*E,yt=qe((c._lpos+lt)*ve);Mr(c.labelFont[0],w,"center",p==2?vi:Gr),f.save(),h==1?(g=b=0,f.translate(yt,qe(Ct+Rt/2)),f.rotate((p==3?-sa:sa)/2)):(g=qe(vt+ht/2),b=yt);let ns=fc(c.label)?c.label(s,r,A,N):c.label;f.fillText(ns,g,b),f.restore()}if(N==0)continue;let I=z[c.scale],D=h==0?ht:Rt,Q=h==0?vt:Ct,ge=c._splits,de=I.distr==2?ge.map(lt=>Ot[lt]):ge,re=I.distr==2?Ot[ge[1]]-Ot[ge[0]]:A,G=c.ticks,j=c.border,Le=G.show?G.size:0,Re=qe(Le*ve),Qe=qe((c.alignTo==2?c._size-Le-c.gap:c.gap)*ve),be=c._rotate*-sa/180,Oe=_(c._pos*ve),xt=(Re+Qe)*E,rt=Oe+xt;b=h==0?rt:0,g=h==1?rt:0;let zt=c.font[0],Dt=c.align==1?Rs:c.align==2?Ja:be>0?Rs:be<0?Ja:h==0?"center":p==3?Ja:Rs,an=be||h==1?"middle":p==2?vi:Gr;Mr(zt,w,Dt,an);let bt=c.font[1]*c.lineGap,_t=ge.map(lt=>_(l(lt,I,D,Q))),Bt=c._values;for(let lt=0;lt<Bt.length;lt++){let yt=Bt[lt];if(yt!=null){h==0?g=_t[lt]:b=_t[lt],yt=""+yt;let ns=yt.indexOf(`
`)==-1?[yt]:yt.split(/\n/gm);for(let ct=0;ct<ns.length;ct++){let Ur=ns[ct];be?(f.save(),f.translate(g,b+ct*bt),f.rotate(be),f.fillText(Ur,0,0),f.restore()):f.fillText(Ur,g,b+ct*bt)}}}G.show&&Va(_t,G.filter(s,de,r,N,re),h,p,Oe,Re,Ee(G.width*ve,3),G.stroke(s,r),G.dash,G.cap);let on=c.grid;on.show&&Va(_t,on.filter(s,de,r,N,re),h,h==0?2:1,h==0?Ct:vt,h==0?Rt:ht,Ee(on.width*ve,3),on.stroke(s,r),on.dash,on.cap),j.show&&Va([Oe],[1],h==0?1:0,h==0?1:2,h==1?Ct:vt,h==1?Rt:ht,Ee(j.width*ve,3),j.stroke(s,r),j.dash,j.cap)}Je("drawAxes")}function Ps(r){M.forEach((c,p)=>{p>0&&(c._paths=null,r&&(i==1?(c.min=null,c.max=null):c.facets.forEach(h=>{h.min=null,h.max=null})))})}let Ui=!1,Ya=!1,hi=[];function op(){Ya=!1;for(let r=0;r<hi.length;r++)Je(...hi[r]);hi.length=0}function zs(){Ui||(oh(zr),Ui=!0)}function rp(r,c=!1){Ui=!0,Ya=c,r(s),zr(),c&&hi.length>0&&queueMicrotask(op)}s.batch=rp;function zr(){if(za&&(Ju(),za=!1),Ss&&(ju(),Ss=!1),Vi){if(Fe(y,Rs,Ae),Fe(y,vi,Ye),Fe(y,wi,ne),Fe(y,Si,O),Fe(k,Rs,Ae),Fe(k,vi,Ye),Fe(k,wi,ne),Fe(k,Si,O),Fe(m,wi,un),Fe(m,Si,Wn),v.width=qe(un*ve),v.height=qe(Wn*ve),$.forEach(({_el:r,_show:c,_size:p,_pos:h,side:g})=>{if(r!=null)if(c){let b=g===3||g===0?p:0,w=g%2==1;Fe(r,w?"left":"top",h-b),Fe(r,w?"width":"height",p),Fe(r,w?"top":"left",w?Ye:Ae),Fe(r,w?"height":"width",w?O:ne),vo(r,as)}else wt(r,as)}),Hi=As=Fa=Na=Ia=$a=Ra=Oa=Ta=null,dt=1,mi(!0),Ae!=ws||Ye!=Gn||ne!=en||O!=Kn){Ps(!1);let r=ne/en,c=O/Kn;if(Ue&&!Zn&&q.left>=0){q.left*=r,q.top*=c,_s&&rn(_s,qe(q.left),0,ne,O),Ls&&rn(Ls,0,qe(q.top),ne,O);for(let p=0;p<Pt.length;p++){let h=Pt[p];h!=null&&(Es[p]*=r,Cs[p]*=c,rn(h,Tt(Es[p]),Tt(Cs[p]),ne,O))}}if(_e.show&&!Yi&&_e.left>=0&&_e.width>0){_e.left*=r,_e.width*=r,_e.top*=c,_e.height*=c;for(let p in Wa)Fe(Ns,p,_e[p])}ws=Ae,Gn=Ye,en=ne,Kn=O}Je("setSize"),Vi=!1}un>0&&Wn>0&&(f.clearRect(0,0,v.width,v.height),Je("drawClear"),W.forEach(r=>r()),Je("draw")),_e.show&&Yi&&(Wi(_e),Yi=!1),Ue&&Zn&&(ts(null,!0,!1),Zn=!1),ie.show&&ie.live&&At&&(Xa(),At=!1),u||(u=!0,s.status=1,Je("ready")),pi=!1,Ui=!1}s.redraw=(r,c)=>{Ss=c||!1,r!==!1?_n(R,L.min,L.max):zs()};function qa(r,c){let p=z[r];if(p.from==null){if(et==0){let h=p.range(s,c.min,c.max,r);c.min=h[0],c.max=h[1]}if(c.min>c.max){let h=c.min;c.min=c.max,c.max=h}if(et>1&&c.min!=null&&c.max!=null&&c.max-c.min<1e-16)return;r==R&&p.distr==2&&et>0&&(c.min=Xt(c.min,e[0]),c.max=Xt(c.max,e[0]),c.min==c.max&&c.max++),Y[r]=c,za=!0,zs()}}s.setScale=qa;let Ha,ja,_s,Ls,_r,Lr,Fs,Ts,Fr,Tr,ze,Ie,zn=!1;const tt=q.drag;let Ke=tt.x,Ze=tt.y;Ue&&(q.x&&(Ha=Lt(_p,k)),q.y&&(ja=Lt(Lp,k)),L.ori==0?(_s=Ha,Ls=ja):(_s=ja,Ls=Ha),ze=q.left,Ie=q.top);const _e=s.select=Ve({show:!0,over:!0,left:0,width:0,top:0,height:0},t.select),Ns=_e.show?Lt(zp,_e.over?k:y):null;function Wi(r,c){if(_e.show){for(let p in r)_e[p]=r[p],p in Wa&&Fe(Ns,p,r[p]);c!==!1&&Je("setSelect")}}s.setSelect=Wi;function lp(r){if(M[r].show)Se&&vo(C[r],as);else if(Se&&wt(C[r],as),Ue){let p=Ms?Pt[0]:Pt[r];p!=null&&rn(p,-10,-10,ne,O)}}function _n(r,c,p){qa(r,{min:c,max:p})}function nn(r,c,p,h){c.focus!=null&&dp(r),c.show!=null&&M.forEach((g,b)=>{b>0&&(r==b||r==null)&&(g.show=c.show,lp(b),i==2?(_n(g.facets[0].scale,null,null),_n(g.facets[1].scale,null,null)):_n(g.scale,null,null),zs())}),p!==!1&&Je("setSeries",r,c),h&&gi("setSeries",s,r,c)}s.setSeries=nn;function cp(r,c){Ve(K[r],c)}function up(r,c){r.fill=le(r.fill||null),r.dir=fe(r.dir,-1),c=c??K.length,K.splice(c,0,r)}function pp(r){r==null?K.length=0:K.splice(r,1)}s.addBand=up,s.setBand=cp,s.delBand=pp;function hp(r,c){M[r].alpha=c,Ue&&Pt[r]!=null&&(Pt[r].style.opacity=c),Se&&C[r]&&(C[r].style.opacity=c)}let pn,Ln,es;const Is={focus:!0};function dp(r){if(r!=es){let c=r==null,p=tn.alpha!=1;M.forEach((h,g)=>{if(i==1||g>0){let b=c||g==0||g==r;h._focus=c?null:b,p&&hp(g,b?1:tn.alpha)}}),es=r,p&&zs()}}Se&&ks&&ot(Qr,he,r=>{q._lock||(Jn(r),es!=null&&nn(null,Is,!0,Be.setSeries))});function sn(r,c,p){let h=z[c];p&&(r=r/ve-(h.ori==1?Ye:Ae));let g=ne;h.ori==1&&(g=O,r=g-r),h.dir==-1&&(r=g-r);let b=h._min,w=h._max,E=r/g,A=b+(w-b)*E,N=h.distr;return N==3?js(10,A):N==4?Wp(A,h.asinh):N==100?h.bwd(A):A}function fp(r,c){let p=sn(r,R,c);return Xt(p,e[0],We,Ge)}s.valToIdx=r=>Xt(r,e[0]),s.posToIdx=fp,s.posToVal=sn,s.valToPos=(r,c,p)=>z[c].ori==0?a(r,z[c],p?ht:ne,p?vt:0):o(r,z[c],p?Rt:O,p?Ct:0),s.setCursor=(r,c,p)=>{ze=r.left,Ie=r.top,ts(null,c,p)};function Nr(r,c){Fe(Ns,Rs,_e.left=r),Fe(Ns,wi,_e.width=c)}function Ir(r,c){Fe(Ns,vi,_e.top=r),Fe(Ns,Si,_e.height=c)}let di=L.ori==0?Nr:Ir,fi=L.ori==1?Nr:Ir;function mp(){if(Se&&ie.live)for(let r=i==2?1:0;r<M.length;r++){if(r==0&&ue)continue;let c=ie.values[r],p=0;for(let h in c)V[r][p++].firstChild.nodeValue=c[h]}}function Xa(r,c){if(r!=null&&(r.idxs?r.idxs.forEach((p,h)=>{me[h]=p}):Jp(r.idx)||me.fill(r.idx),ie.idx=me[0]),Se&&ie.live){for(let p=0;p<M.length;p++)(p>0||i==1&&!ue)&&gp(p,me[p]);mp()}At=!1,c!==!1&&Je("setLegend")}s.setLegend=Xa;function gp(r,c){let p=M[r],h=r==0&&te==2?Ot:e[r],g;ue?g=p.values(s,r,c)??$e:(g=p.value(s,c==null?null:h[c],r,c),g=g==null?$e:{_:g}),ie.values[r]=g}function ts(r,c,p){Fr=ze,Tr=Ie,[ze,Ie]=q.move(s,ze,Ie),q.left=ze,q.top=Ie,Ue&&(_s&&rn(_s,qe(ze),0,ne,O),Ls&&rn(Ls,0,qe(Ie),ne,O));let h,g=We>Ge;pn=Me,Ln=null;let b=L.ori==0?ne:O,w=L.ori==1?ne:O;if(ze<0||et==0||g){h=q.idx=null;for(let E=0;E<M.length;E++){let A=Pt[E];A!=null&&rn(A,-10,-10,ne,O)}ks&&nn(null,Is,!0,r==null&&Be.setSeries),ie.live&&(me.fill(h),At=!0)}else{let E,A,N;i==1&&(E=L.ori==0?ze:Ie,A=sn(E,R),h=q.idx=Xt(A,e[0],We,Ge),N=B(e[0][h],L,b,0));let I=-10,D=-10,Q=0,ge=0,de=!0,re="",G="";for(let j=i==2?1:0;j<M.length;j++){let Le=M[j],Re=me[j],Qe=Re==null?null:i==1?e[j][Re]:e[j][1][Re],be=q.dataIdx(s,j,h,A),Oe=be==null?null:i==1?e[j][be]:e[j][1][be];if(At=At||Oe!=Qe||be!=Re,me[j]=be,j>0&&Le.show){let xt=be==null?-10:be==h?N:B(i==1?e[0][be]:e[j][0][be],L,b,0),rt=Oe==null?-10:Z(Oe,i==1?z[Le.scale]:z[Le.facets[1].scale],w,0);if(ks&&Oe!=null){let zt=L.ori==1?ze:Ie,Dt=He(tn.dist(s,j,be,rt,zt));if(Dt<pn){let an=tn.bias;if(an!=0){let bt=sn(zt,Le.scale),_t=Oe>=0?1:-1,Bt=bt>=0?1:-1;Bt==_t&&(Bt==1?an==1?Oe>=bt:Oe<=bt:an==1?Oe<=bt:Oe>=bt)&&(pn=Dt,Ln=j)}else pn=Dt,Ln=j}}if(At||Ms){let zt,Dt;L.ori==0?(zt=xt,Dt=rt):(zt=rt,Dt=xt);let an,bt,_t,Bt,on,lt,yt=!0,ns=it.bbox;if(ns!=null){yt=!1;let ct=ns(s,j);_t=ct.left,Bt=ct.top,an=ct.width,bt=ct.height}else _t=zt,Bt=Dt,an=bt=it.size(s,j);if(lt=it.fill(s,j),on=it.stroke(s,j),Ms)j==Ln&&pn<=tn.prox&&(I=_t,D=Bt,Q=an,ge=bt,de=yt,re=lt,G=on);else{let ct=Pt[j];ct!=null&&(Es[j]=_t,Cs[j]=Bt,ol(ct,an,bt,yt),il(ct,lt,on),rn(ct,Tt(_t),Tt(Bt),ne,O))}}}}if(Ms){let j=tn.prox,Le=es==null?pn<=j:pn>j||Ln!=es;if(At||Le){let Re=Pt[0];Re!=null&&(Es[0]=I,Cs[0]=D,ol(Re,Q,ge,de),il(Re,re,G),rn(Re,Tt(I),Tt(D),ne,O))}}}if(_e.show&&zn)if(r!=null){let[E,A]=Be.scales,[N,I]=Be.match,[D,Q]=r.cursor.sync.scales,ge=r.cursor.drag;if(Ke=ge._x,Ze=ge._y,Ke||Ze){let{left:de,top:re,width:G,height:j}=r.select,Le=r.scales[D].ori,Re=r.posToVal,Qe,be,Oe,xt,rt,zt=E!=null&&N(E,D),Dt=A!=null&&I(A,Q);zt&&Ke?(Le==0?(Qe=de,be=G):(Qe=re,be=j),Oe=z[E],xt=B(Re(Qe,D),Oe,b,0),rt=B(Re(Qe+be,D),Oe,b,0),di(Ut(xt,rt),He(rt-xt))):di(0,b),Dt&&Ze?(Le==1?(Qe=de,be=G):(Qe=re,be=j),Oe=z[A],xt=Z(Re(Qe,Q),Oe,w,0),rt=Z(Re(Qe+be,Q),Oe,w,0),fi(Ut(xt,rt),He(rt-xt))):fi(0,w)}else Ga()}else{let E=He(Fr-_r),A=He(Tr-Lr);if(L.ori==1){let Q=E;E=A,A=Q}Ke=tt.x&&E>=tt.dist,Ze=tt.y&&A>=tt.dist;let N=tt.uni;N!=null?Ke&&Ze&&(Ke=E>=N,Ze=A>=N,!Ke&&!Ze&&(A>E?Ze=!0:Ke=!0)):tt.x&&tt.y&&(Ke||Ze)&&(Ke=Ze=!0);let I,D;Ke&&(L.ori==0?(I=Fs,D=ze):(I=Ts,D=Ie),di(Ut(I,D),He(D-I)),Ze||fi(0,w)),Ze&&(L.ori==1?(I=Fs,D=ze):(I=Ts,D=Ie),fi(Ut(I,D),He(D-I)),Ke||di(0,b)),!Ke&&!Ze&&(di(0,0),fi(0,0))}if(tt._x=Ke,tt._y=Ze,r==null){if(p){if(Xr!=null){let[E,A]=Be.scales;Be.values[0]=E!=null?sn(L.ori==0?ze:Ie,E):null,Be.values[1]=A!=null?sn(L.ori==1?ze:Ie,A):null}gi(Qa,s,ze,Ie,ne,O,h)}if(ks){let E=p&&Be.setSeries,A=tn.prox;es==null?pn<=A&&nn(Ln,Is,!0,E):pn>A?nn(null,Is,!0,E):Ln!=es&&nn(Ln,Is,!0,E)}}At&&(ie.idx=h,Xa()),c!==!1&&Je("setCursor")}let Fn=null;Object.defineProperty(s,"rect",{get(){return Fn==null&&mi(!1),Fn}});function mi(r=!1){r?Fn=null:(Fn=k.getBoundingClientRect(),Je("syncRect",Fn))}function $r(r,c,p,h,g,b,w){q._lock||zn&&r!=null&&r.movementX==0&&r.movementY==0||(Ua(r,c,p,h,g,b,w,!1,r!=null),r!=null?ts(null,!0,!0):ts(c,!0,!1))}function Ua(r,c,p,h,g,b,w,E,A){if(Fn==null&&mi(!1),Jn(r),r!=null)p=r.clientX-Fn.left,h=r.clientY-Fn.top;else{if(p<0||h<0){ze=-10,Ie=-10;return}let[N,I]=Be.scales,D=c.cursor.sync,[Q,ge]=D.values,[de,re]=D.scales,[G,j]=Be.match,Le=c.axes[0].side%2==1,Re=L.ori==0?ne:O,Qe=L.ori==1?ne:O,be=Le?b:g,Oe=Le?g:b,xt=Le?h:p,rt=Le?p:h;if(de!=null?p=G(N,de)?l(Q,z[N],Re,0):-10:p=Re*(xt/be),re!=null?h=j(I,re)?l(ge,z[I],Qe,0):-10:h=Qe*(rt/Oe),L.ori==1){let zt=p;p=h,h=zt}}A&&(c==null||c.cursor.event.type==Qa)&&((p<=1||p>=ne-1)&&(p=ss(p,ne)),(h<=1||h>=O-1)&&(h=ss(h,O))),E?(_r=p,Lr=h,[Fs,Ts]=q.move(s,p,h)):(ze=p,Ie=h)}const Wa={width:0,height:0,left:0,top:0};function Ga(){Wi(Wa,!1)}let Rr,Or,Dr,Br;function Vr(r,c,p,h,g,b,w){zn=!0,Ke=Ze=tt._x=tt._y=!1,Ua(r,c,p,h,g,b,w,!0,!1),r!=null&&(ot(eo,mo,Yr,!1),gi(Zr,s,Fs,Ts,ne,O,null));let{left:E,top:A,width:N,height:I}=_e;Rr=E,Or=A,Dr=N,Br=I}function Yr(r,c,p,h,g,b,w){zn=tt._x=tt._y=!1,Ua(r,c,p,h,g,b,w,!1,!0);let{left:E,top:A,width:N,height:I}=_e,D=N>0||I>0,Q=Rr!=E||Or!=A||Dr!=N||Br!=I;if(D&&Q&&Wi(_e),tt.setScale&&D&&Q){let ge=E,de=N,re=A,G=I;if(L.ori==1&&(ge=A,de=I,re=E,G=N),Ke&&_n(R,sn(ge,R),sn(ge+de,R)),Ze)for(let j in z){let Le=z[j];j!=R&&Le.from==null&&Le.min!=Me&&_n(j,sn(re+G,j),sn(re,j))}Ga()}else q.lock&&(q._lock=!q._lock,ts(c,!0,r!=null));r!=null&&(ys(eo,mo),gi(eo,s,ze,Ie,ne,O,null))}function vp(r,c,p,h,g,b,w){if(q._lock)return;Jn(r);let E=zn;if(zn){let A=!0,N=!0,I=10,D,Q;L.ori==0?(D=Ke,Q=Ze):(D=Ze,Q=Ke),D&&Q&&(A=ze<=I||ze>=ne-I,N=Ie<=I||Ie>=O-I),D&&A&&(ze=ze<Fs?0:ne),Q&&N&&(Ie=Ie<Ts?0:O),ts(null,!0,!0),zn=!1}ze=-10,Ie=-10,me.fill(null),ts(null,!0,!0),E&&(zn=E)}function qr(r,c,p,h,g,b,w){q._lock||(Jn(r),La(),Ga(),r!=null&&gi(el,s,ze,Ie,ne,O,null))}function Hr(){$.forEach(fd),_a(s.width,s.height,!0)}rs(ia,qs,Hr);const $s={};$s.mousedown=Vr,$s.mousemove=$r,$s.mouseup=Yr,$s.dblclick=qr,$s.setSeries=(r,c,p,h)=>{let g=Be.match[2];p=g(s,c,p),p!=-1&&nn(p,h,!0,!1)},Ue&&(ot(Zr,k,Vr),ot(Qa,k,$r),ot(Jr,k,r=>{Jn(r),mi(!1)}),ot(Qr,k,vp),ot(el,k,qr),ko.add(s),s.syncRect=mi);const Gi=s.hooks=t.hooks||{};function Je(r,c,p){Ya?hi.push([r,c,p]):r in Gi&&Gi[r].forEach(h=>{h.call(null,s,c,p)})}(t.plugins||[]).forEach(r=>{for(let c in r.hooks)Gi[c]=(Gi[c]||[]).concat(r.hooks[c])});const jr=(r,c,p)=>p,Be=Ve({key:null,setSeries:!1,filters:{pub:pl,sub:pl},scales:[R,M[1]?M[1].scale:null],match:[hl,hl,jr],values:[null,null]},q.sync);Be.match.length==2&&Be.match.push(jr),q.sync=Be;const Xr=Be.key,Ka=Oc(Xr);function gi(r,c,p,h,g,b,w){Be.filters.pub(r,c,p,h,g,b,w)&&Ka.pub(r,c,p,h,g,b,w)}Ka.sub(s);function xp(r,c,p,h,g,b,w){Be.filters.sub(r,c,p,h,g,b,w)&&$s[r](null,c,p,h,g,b,w)}s.pub=xp;function bp(){Ka.unsub(s),ko.delete(s),Un.clear(),xo(ia,qs,Hr),d.remove(),he?.remove(),Je("destroy")}s.destroy=bp;function Za(){Je("init",t,e),Sr(e||t.data,!1),Y[R]?qa(R,Y[R]):La(),Yi=_e.show&&(_e.width>0||_e.height>0),Zn=At=!0,_a(t.width,t.height)}return M.forEach(yr),$.forEach(Zu),n?n instanceof HTMLElement?(n.appendChild(d),Za()):n(s,Za):Za(),s}Te.assign=Ve;Te.fmtNum=Ho;Te.rangeNum=aa;Te.rangeLog=fa;Te.rangeAsinh=Yo;Te.orient=vs;Te.pxRatio=ve;Te.join=ah;Te.fmtDate=Xo,Te.tzDate=gh;Te.sync=Oc;{Te.addGap=Jh,Te.clipGaps=va;let t=Te.paths={points:Hc};t.linear=Xc,t.stepped=td,t.bars=nd,t.spline=id}const je={axis:"#93a7b3",grid:"#1c2a33",green:"#4fd17f",red:"#ef6461",orange:"#ff9f43",blue:"#62a8ff",yellow:"#f2c94c"};function mt(t={}){return{stroke:je.axis,grid:{stroke:je.grid,width:1},...t}}var Nt="INUMBER",ai="IOP1",oi="IOP2",ri="IOP3",wn="IVAR",ps="IVARNAME",Gs="IFUNCALL",wa="IFUNDEF",gt="IEXPR",Qo="IEXPREVAL",xs="IMEMBER",Sa="IENDSTATEMENT",Ks="IARRAY";function pe(t,e){this.type=t,this.value=e??0}pe.prototype.toString=function(){switch(this.type){case Nt:case ai:case oi:case ri:case wn:case ps:case Sa:return this.value;case Gs:return"CALL "+this.value;case wa:return"DEF "+this.value;case Ks:return"ARRAY "+this.value;case xs:return"."+this.value;default:return"Invalid Instruction"}};function ka(t){return new pe(ai,t)}function An(t){return new pe(oi,t)}function Kc(t){return new pe(ri,t)}function Eo(t,e,n,s,i){for(var a=[],o=[],l,u,d,v,f=0;f<t.length;f++){var m=t[f],y=m.type;if(y===Nt||y===ps)Array.isArray(m.value)?a.push.apply(a,Eo(m.value.map(function(k){return new pe(Nt,k)}).concat(new pe(Ks,m.value.length)),e,n,s,i)):a.push(m);else if(y===wn&&Object.hasOwn(i,m.value))m=new pe(Nt,i[m.value]),a.push(m);else if(y===oi&&a.length>1)u=a.pop(),l=a.pop(),v=n[m.value],m=new pe(Nt,v(l.value,u.value)),a.push(m);else if(y===ri&&a.length>2)d=a.pop(),u=a.pop(),l=a.pop(),m.value==="?"?a.push(l.value?u.value:d.value):(v=s[m.value],m=new pe(Nt,v(l.value,u.value,d.value)),a.push(m));else if(y===ai&&a.length>0)l=a.pop(),v=e[m.value],m=new pe(Nt,v(l.value)),a.push(m);else if(y===gt){for(;a.length>0;)o.push(a.shift());o.push(new pe(gt,Eo(m.value,e,n,s,i)))}else if(y===xs&&a.length>0)l=a.pop(),a.push(new pe(Nt,l.value[m.value]));else{for(;a.length>0;)o.push(a.shift());o.push(m)}}for(;a.length>0;)o.push(a.shift());return o}function Zc(t,e,n){for(var s=[],i=0;i<t.length;i++){var a=t[i],o=a.type;if(o===wn&&a.value===e)for(var l=0;l<n.tokens.length;l++){var u=n.tokens[l],d;u.type===ai?d=ka(u.value):u.type===oi?d=An(u.value):u.type===ri?d=Kc(u.value):d=new pe(u.type,u.value),s.push(d)}else o===gt?s.push(new pe(gt,Zc(a.value,e,n))):s.push(a)}return s}function Nl(t,e,n){for(var s in e.functions)if(e.functions[s]===t)return!0;if(t.__expr_eval_safe_def)return!0;for(var i in n)if(typeof n[i]=="object"&&n[i]!==null){for(var a in n[i])if(n[i][a]===t)return!0}return!1}function os(t,e,n){var s=[],i,a,o,l,u,d;if(er(t))return hn(t,n);for(var v=t.length,f=0;f<v;f++){var m=t[f],y=m.type;if(y===Nt||y===ps)s.push(m.value);else if(y===oi)a=s.pop(),i=s.pop(),m.value==="and"?s.push(i?!!os(a,e,n):!1):m.value==="or"?s.push(i?!0:!!os(a,e,n)):m.value==="="?(l=e.binaryOps[m.value],s.push(l(i,os(a,e,n),n))):(l=e.binaryOps[m.value],s.push(l(hn(i,n),hn(a,n))));else if(y===ri)o=s.pop(),a=s.pop(),i=s.pop(),m.value==="?"?s.push(os(i?a:o,e,n)):(l=e.ternaryOps[m.value],s.push(l(hn(i,n),hn(a,n),hn(o,n))));else if(y===wn){if(/^__proto__|prototype|constructor$/.test(m.value))throw new Error("prototype access detected");if(m.value in e.functions)s.push(e.functions[m.value]);else if(m.value in e.unaryOps&&e.parser.isOperatorEnabled(m.value))s.push(e.unaryOps[m.value]);else{var k=n[m.value];if(k!==void 0){if(typeof k=="function"&&!Nl(k,e,n))throw new Error("Variable references an unallowed function: "+m.value);s.push(k)}else throw new Error("undefined variable: "+m.value)}}else if(y===ai)i=s.pop(),l=e.unaryOps[m.value],s.push(l(hn(i,n)));else if(y===Gs){for(d=m.value,u=[];d-- >0;)u.unshift(hn(s.pop(),n));if(l=s.pop(),!Nl(l,e,n))throw new Error("Is not an allowed function.");if(l.apply&&l.call)s.push(l.apply(void 0,u));else throw new Error(l+" is not a function")}else if(y===wa)s.push((function(){for(var F=s.pop(),_=[],P=m.value;P-- >0;)_.unshift(s.pop());var M=s.pop(),$=function(){for(var z=Object.assign({},n),K=0,R=_.length;K<R;K++)z[_[K]]=arguments[K];return os(F,e,z)};return Object.defineProperty($,"name",{value:M,writable:!1}),Object.defineProperty($,"__expr_eval_safe_def",{value:!0,writable:!1}),n[M]=$,$})());else if(y===gt)s.push(md(m,e));else if(y===Qo)s.push(m);else if(y===xs)i=s.pop(),s.push(i[m.value]);else if(y===Sa)s.pop();else if(y===Ks){for(d=m.value,u=[];d-- >0;)u.unshift(s.pop());s.push(u)}else throw new Error("invalid Expression")}if(s.length>1)throw new Error("invalid Expression (parity)");return s[0]===0?0:hn(s[0],n)}function md(t,e,n){return er(t)?t:{type:Qo,value:function(s){return os(t.value,e,s)}}}function er(t){return t&&t.type===Qo}function hn(t,e){return er(t)?t.value(e):t}function tr(t,e){for(var n=[],s,i,a,o,l,u,d=0;d<t.length;d++){var v=t[d],f=v.type;if(f===Nt)typeof v.value=="number"&&v.value<0?n.push("("+v.value+")"):Array.isArray(v.value)?n.push("["+v.value.map(Il).join(", ")+"]"):n.push(Il(v.value));else if(f===oi)i=n.pop(),s=n.pop(),o=v.value,e?o==="^"?n.push("Math.pow("+s+", "+i+")"):o==="and"?n.push("(!!"+s+" && !!"+i+")"):o==="or"?n.push("(!!"+s+" || !!"+i+")"):o==="||"?n.push("(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }(("+s+"),("+i+")))"):o==="=="?n.push("("+s+" === "+i+")"):o==="!="?n.push("("+s+" !== "+i+")"):o==="["?n.push(s+"[("+i+") | 0]"):n.push("("+s+" "+o+" "+i+")"):o==="["?n.push(s+"["+i+"]"):n.push("("+s+" "+o+" "+i+")");else if(f===ri)if(a=n.pop(),i=n.pop(),s=n.pop(),o=v.value,o==="?")n.push("("+s+" ? "+i+" : "+a+")");else throw new Error("invalid Expression");else if(f===wn||f===ps)n.push(v.value);else if(f===ai)s=n.pop(),o=v.value,o==="-"||o==="+"?n.push("("+o+s+")"):e?o==="not"?n.push("(!"+s+")"):o==="!"?n.push("fac("+s+")"):n.push(o+"("+s+")"):o==="!"?n.push("("+s+"!)"):n.push("("+o+" "+s+")");else if(f===Gs){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());o=n.pop(),n.push(o+"("+l.join(", ")+")")}else if(f===wa){for(i=n.pop(),u=v.value,l=[];u-- >0;)l.unshift(n.pop());s=n.pop(),e?n.push("("+s+" = function("+l.join(", ")+") { return "+i+" })"):n.push("("+s+"("+l.join(", ")+") = "+i+")")}else if(f===xs)s=n.pop(),n.push(s+"."+v.value);else if(f===Ks){for(u=v.value,l=[];u-- >0;)l.unshift(n.pop());n.push("["+l.join(", ")+"]")}else if(f===gt)n.push("("+tr(v.value,e)+")");else if(f!==Sa)throw new Error("invalid Expression")}return n.length>1&&(e?n=[n.join(",")]:n=[n.join(";")]),String(n[0])}function Il(t){return typeof t=="string"?JSON.stringify(t).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029"):t}function Vs(t,e){for(var n=0;n<t.length;n++)if(t[n]===e)return!0;return!1}function nr(t,e,n){n=n||{};for(var s=!!n.withMembers,i=null,a=0;a<t.length;a++){var o=t[a];o.type===wn||o.type===ps?!s&&!Vs(e,o.value)?e.push(o.value):(i!==null&&(Vs(e,i)||e.push(i)),i=o.value):o.type===xs&&s&&i!==null?i+="."+o.value:o.type===gt?nr(o.value,e,n):i!==null&&(Vs(e,i)||e.push(i),i=null)}i!==null&&!Vs(e,i)&&e.push(i)}function Gt(t,e){this.tokens=t,this.parser=e,this.unaryOps=e.unaryOps,this.binaryOps=e.binaryOps,this.ternaryOps=e.ternaryOps,this.functions=e.functions}Gt.prototype.simplify=function(t){return t=t||{},new Gt(Eo(this.tokens,this.unaryOps,this.binaryOps,this.ternaryOps,t),this.parser)};Gt.prototype.substitute=function(t,e){return e instanceof Gt||(e=this.parser.parse(String(e))),new Gt(Zc(this.tokens,t,e),this.parser)};Gt.prototype.evaluate=function(t){return t=t||{},os(this.tokens,this,t)};Gt.prototype.toString=function(){return tr(this.tokens,!1)};Gt.prototype.symbols=function(t){t=t||{};var e=[];return nr(this.tokens,e,t),e};Gt.prototype.variables=function(t){t=t||{};var e=[];nr(this.tokens,e,t);var n=this.functions;return e.filter(function(s){return!(s in n)})};Gt.prototype.toJSFunction=function(t,e){var n=this,s=new Function(t,"with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return "+tr(this.simplify(e).tokens,!0)+"; }");return function(){return s.apply(n,arguments)}};var Fi="TEOF",Pe="TOP",Ma="TNUMBER",Jc="TSTRING",Sn="TPAREN",Zs="TBRACKET",Ea="TCOMMA",sr="TNAME",ir="TSEMICOLON";function Qc(t,e,n){this.type=t,this.value=e,this.index=n}Qc.prototype.toString=function(){return this.type+": "+this.value};function De(t,e){this.pos=0,this.current=null,this.unaryOps=t.unaryOps,this.binaryOps=t.binaryOps,this.ternaryOps=t.ternaryOps,this.consts=t.consts,this.expression=e,this.savedPosition=0,this.savedCurrent=null,this.options=t.options,this.parser=t}De.prototype.newToken=function(t,e,n){return new Qc(t,e,n??this.pos)};De.prototype.save=function(){this.savedPosition=this.pos,this.savedCurrent=this.current};De.prototype.restore=function(){this.pos=this.savedPosition,this.current=this.savedCurrent};De.prototype.next=function(){if(this.pos>=this.expression.length)return this.newToken(Fi,"EOF");if(this.isWhitespace()||this.isComment())return this.next();if(this.isRadixInteger()||this.isNumber()||this.isOperator()||this.isString()||this.isParen()||this.isBracket()||this.isComma()||this.isSemicolon()||this.isNamedOp()||this.isConst()||this.isName())return this.current;this.parseError('Unknown character "'+this.expression.charAt(this.pos)+'"')};De.prototype.isString=function(){var t=!1,e=this.pos,n=this.expression.charAt(e);if(n==="'"||n==='"')for(var s=this.expression.indexOf(n,e+1);s>=0&&this.pos<this.expression.length;){if(this.pos=s+1,this.expression.charAt(s-1)!=="\\"){var i=this.expression.substring(e+1,s);this.current=this.newToken(Jc,this.unescape(i),e),t=!0;break}s=this.expression.indexOf(n,s+1)}return t};De.prototype.isParen=function(){var t=this.expression.charAt(this.pos);return t==="("||t===")"?(this.current=this.newToken(Sn,t),this.pos++,!0):!1};De.prototype.isBracket=function(){var t=this.expression.charAt(this.pos);return(t==="["||t==="]")&&this.isOperatorEnabled("[")?(this.current=this.newToken(Zs,t),this.pos++,!0):!1};De.prototype.isComma=function(){var t=this.expression.charAt(this.pos);return t===","?(this.current=this.newToken(Ea,","),this.pos++,!0):!1};De.prototype.isSemicolon=function(){var t=this.expression.charAt(this.pos);return t===";"?(this.current=this.newToken(ir,";"),this.pos++,!0):!1};De.prototype.isConst=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&n!=="."&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(s in this.consts)return this.current=this.newToken(Ma,this.consts[s]),this.pos+=s.length,!0}return!1};De.prototype.isNamedOp=function(){for(var t=this.pos,e=t;e<this.expression.length;e++){var n=this.expression.charAt(e);if(n.toUpperCase()===n.toLowerCase()&&(e===this.pos||n!=="_"&&(n<"0"||n>"9")))break}if(e>t){var s=this.expression.substring(t,e);if(this.isOperatorEnabled(s)&&(s in this.binaryOps||s in this.unaryOps||s in this.ternaryOps))return this.current=this.newToken(Pe,s),this.pos+=s.length,!0}return!1};De.prototype.isName=function(){for(var t=this.pos,e=t,n=!1;e<this.expression.length;e++){var s=this.expression.charAt(e);if(s.toUpperCase()===s.toLowerCase()){if(e===this.pos&&(s==="$"||s==="_")){s==="_"&&(n=!0);continue}else if(e===this.pos||!n||s!=="_"&&(s<"0"||s>"9"))break}else n=!0}if(n){var i=this.expression.substring(t,e);return this.current=this.newToken(sr,i),this.pos+=i.length,!0}return!1};De.prototype.isWhitespace=function(){for(var t=!1,e=this.expression.charAt(this.pos);(e===" "||e==="	"||e===`
`||e==="\r")&&(t=!0,this.pos++,!(this.pos>=this.expression.length));)e=this.expression.charAt(this.pos);return t};var gd=/^[0-9a-f]{4}$/i;De.prototype.unescape=function(t){var e=t.indexOf("\\");if(e<0)return t;for(var n=t.substring(0,e);e>=0;){var s=t.charAt(++e);switch(s){case"'":n+="'";break;case'"':n+='"';break;case"\\":n+="\\";break;case"/":n+="/";break;case"b":n+="\b";break;case"f":n+="\f";break;case"n":n+=`
`;break;case"r":n+="\r";break;case"t":n+="	";break;case"u":var i=t.substring(e+1,e+5);gd.test(i)||this.parseError("Illegal escape sequence: \\u"+i),n+=String.fromCharCode(parseInt(i,16)),e+=4;break;default:throw this.parseError('Illegal escape sequence: "\\'+s+'"')}++e;var a=t.indexOf("\\",e);n+=t.substring(e,a<0?t.length:a),e=a}return n};De.prototype.isComment=function(){var t=this.expression.charAt(this.pos);return t==="/"&&this.expression.charAt(this.pos+1)==="*"?(this.pos=this.expression.indexOf("*/",this.pos)+2,this.pos===1&&(this.pos=this.expression.length),!0):!1};De.prototype.isRadixInteger=function(){var t=this.pos;if(t>=this.expression.length-2||this.expression.charAt(t)!=="0")return!1;++t;var e,n;if(this.expression.charAt(t)==="x")e=16,n=/^[0-9a-f]$/i,++t;else if(this.expression.charAt(t)==="b")e=2,n=/^[01]$/i,++t;else return!1;for(var s=!1,i=t;t<this.expression.length;){var a=this.expression.charAt(t);if(n.test(a))t++,s=!0;else break}return s&&(this.current=this.newToken(Ma,parseInt(this.expression.substring(i,t),e)),this.pos=t),s};De.prototype.isNumber=function(){for(var t=!1,e=this.pos,n=e,s=e,i=!1,a=!1,o;e<this.expression.length&&(o=this.expression.charAt(e),o>="0"&&o<="9"||!i&&o===".");)o==="."?i=!0:a=!0,e++,t=a;if(t&&(s=e),o==="e"||o==="E"){e++;for(var l=!0,u=!1;e<this.expression.length;){if(o=this.expression.charAt(e),l&&(o==="+"||o==="-"))l=!1;else if(o>="0"&&o<="9")u=!0,l=!1;else break;e++}u||(e=s)}return t?(this.current=this.newToken(Ma,parseFloat(this.expression.substring(n,e))),this.pos=e):this.pos=s,t};De.prototype.isOperator=function(){var t=this.pos,e=this.expression.charAt(this.pos);if(e==="+"||e==="-"||e==="*"||e==="/"||e==="%"||e==="^"||e==="?"||e===":"||e===".")this.current=this.newToken(Pe,e);else if(e==="∙"||e==="•")this.current=this.newToken(Pe,"*");else if(e===">")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,">="),this.pos++):this.current=this.newToken(Pe,">");else if(e==="<")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,"<="),this.pos++):this.current=this.newToken(Pe,"<");else if(e==="|")if(this.expression.charAt(this.pos+1)==="|")this.current=this.newToken(Pe,"||"),this.pos++;else return!1;else if(e==="=")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,"=="),this.pos++):this.current=this.newToken(Pe,e);else if(e==="!")this.expression.charAt(this.pos+1)==="="?(this.current=this.newToken(Pe,"!="),this.pos++):this.current=this.newToken(Pe,e);else return!1;return this.pos++,this.isOperatorEnabled(this.current.value)?!0:(this.pos=t,!1)};De.prototype.isOperatorEnabled=function(t){return this.parser.isOperatorEnabled(t)};De.prototype.getCoordinates=function(){var t=0,e,n=-1;do t++,e=this.pos-n,n=this.expression.indexOf(`
`,n+1);while(n>=0&&n<this.pos);return{line:t,column:e}};De.prototype.parseError=function(t){var e=this.getCoordinates();throw new Error("parse error ["+e.line+":"+e.column+"]: "+t)};function Ne(t,e,n){this.parser=t,this.tokens=e,this.current=null,this.nextToken=null,this.next(),this.savedCurrent=null,this.savedNextToken=null,this.allowMemberAccess=n.allowMemberAccess!==!1}Ne.prototype.next=function(){return this.current=this.nextToken,this.nextToken=this.tokens.next()};Ne.prototype.tokenMatches=function(t,e){return typeof e>"u"?!0:Array.isArray(e)?Vs(e,t.value):typeof e=="function"?e(t):t.value===e};Ne.prototype.save=function(){this.savedCurrent=this.current,this.savedNextToken=this.nextToken,this.tokens.save()};Ne.prototype.restore=function(){this.tokens.restore(),this.current=this.savedCurrent,this.nextToken=this.savedNextToken};Ne.prototype.accept=function(t,e){return this.nextToken.type===t&&this.tokenMatches(this.nextToken,e)?(this.next(),!0):!1};Ne.prototype.expect=function(t,e){if(!this.accept(t,e)){var n=this.tokens.getCoordinates();throw new Error("parse error ["+n.line+":"+n.column+"]: Expected "+(e||t))}};Ne.prototype.parseAtom=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.accept(sr)||this.accept(Pe,n))t.push(new pe(wn,this.current.value));else if(this.accept(Ma))t.push(new pe(Nt,this.current.value));else if(this.accept(Jc))t.push(new pe(Nt,this.current.value));else if(this.accept(Sn,"("))this.parseExpression(t),this.expect(Sn,")");else if(this.accept(Zs,"["))if(this.accept(Zs,"]"))t.push(new pe(Ks,0));else{var s=this.parseArrayList(t);t.push(new pe(Ks,s))}else throw new Error("unexpected "+this.nextToken)};Ne.prototype.parseExpression=function(t){var e=[];this.parseUntilEndStatement(t,e)||(this.parseVariableAssignmentExpression(e),!this.parseUntilEndStatement(t,e)&&this.pushExpression(t,e))};Ne.prototype.pushExpression=function(t,e){for(var n=0,s=e.length;n<s;n++)t.push(e[n])};Ne.prototype.parseUntilEndStatement=function(t,e){return this.accept(ir)?(this.nextToken&&this.nextToken.type!==Fi&&!(this.nextToken.type===Sn&&this.nextToken.value===")")&&e.push(new pe(Sa)),this.nextToken.type!==Fi&&this.parseExpression(e),t.push(new pe(gt,e)),!0):!1};Ne.prototype.parseArrayList=function(t){for(var e=0;!this.accept(Zs,"]");)for(this.parseExpression(t),++e;this.accept(Ea);)this.parseExpression(t),++e;return e};Ne.prototype.parseVariableAssignmentExpression=function(t){for(this.parseConditionalExpression(t);this.accept(Pe,"=");){var e=t.pop(),n=[],s=t.length-1;if(e.type===Gs){if(!this.tokens.isOperatorEnabled("()="))throw new Error("function definition is not permitted");for(var i=0,a=e.value+1;i<a;i++){var o=s-i;t[o].type===wn&&(t[o]=new pe(ps,t[o].value))}this.parseVariableAssignmentExpression(n),t.push(new pe(gt,n)),t.push(new pe(wa,e.value));continue}if(e.type!==wn&&e.type!==xs)throw new Error("expected variable for assignment");this.parseVariableAssignmentExpression(n),t.push(new pe(ps,e.value)),t.push(new pe(gt,n)),t.push(An("="))}};Ne.prototype.parseConditionalExpression=function(t){for(this.parseOrExpression(t);this.accept(Pe,"?");){var e=[],n=[];this.parseConditionalExpression(e),this.expect(Pe,":"),this.parseConditionalExpression(n),t.push(new pe(gt,e)),t.push(new pe(gt,n)),t.push(Kc("?"))}};Ne.prototype.parseOrExpression=function(t){for(this.parseAndExpression(t);this.accept(Pe,"or");){var e=[];this.parseAndExpression(e),t.push(new pe(gt,e)),t.push(An("or"))}};Ne.prototype.parseAndExpression=function(t){for(this.parseComparison(t);this.accept(Pe,"and");){var e=[];this.parseComparison(e),t.push(new pe(gt,e)),t.push(An("and"))}};var vd=["==","!=","<","<=",">=",">","in"];Ne.prototype.parseComparison=function(t){for(this.parseAddSub(t);this.accept(Pe,vd);){var e=this.current;this.parseAddSub(t),t.push(An(e.value))}};var xd=["+","-","||"];Ne.prototype.parseAddSub=function(t){for(this.parseTerm(t);this.accept(Pe,xd);){var e=this.current;this.parseTerm(t),t.push(An(e.value))}};var bd=["*","/","%"];Ne.prototype.parseTerm=function(t){for(this.parseFactor(t);this.accept(Pe,bd);){var e=this.current;this.parseFactor(t),t.push(An(e.value))}};Ne.prototype.parseFactor=function(t){var e=this.tokens.unaryOps;function n(i){return i.value in e}if(this.save(),this.accept(Pe,n)){if(this.current.value!=="-"&&this.current.value!=="+"){if(this.nextToken.type===Sn&&this.nextToken.value==="("){this.restore(),this.parseExponential(t);return}else if(this.nextToken.type===ir||this.nextToken.type===Ea||this.nextToken.type===Fi||this.nextToken.type===Sn&&this.nextToken.value===")"){this.restore(),this.parseAtom(t);return}}var s=this.current;this.parseFactor(t),t.push(ka(s.value))}else this.parseExponential(t)};Ne.prototype.parseExponential=function(t){for(this.parsePostfixExpression(t);this.accept(Pe,"^");)this.parseFactor(t),t.push(An("^"))};Ne.prototype.parsePostfixExpression=function(t){for(this.parseFunctionCall(t);this.accept(Pe,"!");)t.push(ka("!"))};Ne.prototype.parseFunctionCall=function(t){var e=this.tokens.unaryOps;function n(a){return a.value in e}if(this.accept(Pe,n)){var s=this.current;this.parseAtom(t),t.push(ka(s.value))}else for(this.parseMemberExpression(t);this.accept(Sn,"(");)if(this.accept(Sn,")"))t.push(new pe(Gs,0));else{var i=this.parseArgumentList(t);t.push(new pe(Gs,i))}};Ne.prototype.parseArgumentList=function(t){for(var e=0;!this.accept(Sn,")");)for(this.parseExpression(t),++e;this.accept(Ea);)this.parseExpression(t),++e;return e};Ne.prototype.parseMemberExpression=function(t){for(this.parseAtom(t);this.accept(Pe,".")||this.accept(Zs,"[");){var e=this.current;if(e.value==="."){if(!this.allowMemberAccess)throw new Error('unexpected ".", member access is not permitted');this.expect(sr),t.push(new pe(xs,this.current.value))}else if(e.value==="["){if(!this.tokens.isOperatorEnabled("["))throw new Error('unexpected "[]", arrays are disabled');this.parseExpression(t),this.expect(Zs,"]"),t.push(An("["))}else throw new Error("unexpected symbol: "+e.value)}};function yd(t,e){return Number(t)+Number(e)}function wd(t,e){return t-e}function Sd(t,e){return t*e}function kd(t,e){return t/e}function Md(t,e){return t%e}function Ed(t,e){return Array.isArray(t)&&Array.isArray(e)?t.concat(e):""+t+e}function Cd(t,e){return t===e}function Ad(t,e){return t!==e}function Pd(t,e){return t>e}function zd(t,e){return t<e}function _d(t,e){return t>=e}function Ld(t,e){return t<=e}function Fd(t,e){return!!(t&&e)}function Td(t,e){return!!(t||e)}function Nd(t,e){return Vs(e,t)}function Id(t){return(Math.exp(t)-Math.exp(-t))/2}function $d(t){return(Math.exp(t)+Math.exp(-t))/2}function Rd(t){return t===1/0?1:t===-1/0?-1:(Math.exp(t)-Math.exp(-t))/(Math.exp(t)+Math.exp(-t))}function Od(t){return t===-1/0?t:Math.log(t+Math.sqrt(t*t+1))}function Dd(t){return Math.log(t+Math.sqrt(t*t-1))}function Bd(t){return Math.log((1+t)/(1-t))/2}function $l(t){return Math.log(t)*Math.LOG10E}function Vd(t){return-t}function Yd(t){return!t}function qd(t){return t<0?Math.ceil(t):Math.floor(t)}function Hd(t){return Math.random()*(t||1)}function Rl(t){return ar(t+1)}function jd(t){return isFinite(t)&&t===Math.round(t)}var Xd=4.7421875,ao=[.9999999999999971,57.15623566586292,-59.59796035547549,14.136097974741746,-.4919138160976202,3399464998481189e-20,4652362892704858e-20,-9837447530487956e-20,.0001580887032249125,-.00021026444172410488,.00021743961811521265,-.0001643181065367639,8441822398385275e-20,-26190838401581408e-21,36899182659531625e-22];function ar(t){var e,n;if(jd(t)){if(t<=0)return isFinite(t)?1/0:NaN;if(t>171)return 1/0;for(var s=t-2,i=t-1;s>1;)i*=s,s--;return i===0&&(i=1),i}if(t<.5)return Math.PI/(Math.sin(Math.PI*t)*ar(1-t));if(t>=171.35)return 1/0;if(t>85){var a=t*t,o=a*t,l=o*t,u=l*t;return Math.sqrt(2*Math.PI/t)*Math.pow(t/Math.E,t)*(1+1/(12*t)+1/(288*a)-139/(51840*o)-571/(2488320*l)+163879/(209018880*u)+5246819/(75246796800*u*t))}--t,n=ao[0];for(var d=1;d<ao.length;++d)n+=ao[d]/(t+d);return e=t+Xd+.5,Math.sqrt(2*Math.PI)*Math.pow(e,t+.5)*Math.exp(-e)*n}function Ud(t){return Array.isArray(t)?t.length:String(t).length}function Ol(){for(var t=0,e=0,n=0;n<arguments.length;n++){var s=Math.abs(arguments[n]),i;e<s?(i=e/s,t=t*i*i+1,e=s):s>0?(i=s/e,t+=i*i):t+=s}return e===1/0?1/0:e*Math.sqrt(t)}function Dl(t,e,n){return t?e:n}function Wd(t,e){return typeof e>"u"||+e==0?Math.round(t):(t=+t,e=-+e,isNaN(t)||!(typeof e=="number"&&e%1===0)?NaN:(t=t.toString().split("e"),t=Math.round(+(t[0]+"e"+(t[1]?+t[1]-e:-e))),t=t.toString().split("e"),+(t[0]+"e"+(t[1]?+t[1]+e:e))))}function Gd(t,e,n){return n&&(n[t]=e),e}function Kd(t,e){return t[e|0]}function Zd(t){return arguments.length===1&&Array.isArray(t)?Math.max.apply(Math,t):Math.max.apply(Math,arguments)}function Jd(t){return arguments.length===1&&Array.isArray(t)?Math.min.apply(Math,t):Math.min.apply(Math,arguments)}function Qd(t,e){if(typeof t!="function")throw new Error("First argument to map is not a function");if(!Array.isArray(e))throw new Error("Second argument to map is not an array");return e.map(function(n,s){return t(n,s)})}function ef(t,e,n){if(typeof t!="function")throw new Error("First argument to fold is not a function");if(!Array.isArray(n))throw new Error("Second argument to fold is not an array");return n.reduce(function(s,i,a){return t(s,i,a)},e)}function tf(t,e){if(typeof t!="function")throw new Error("First argument to filter is not a function");if(!Array.isArray(e))throw new Error("Second argument to filter is not an array");return e.filter(function(n,s){return t(n,s)})}function nf(t,e){if(!(Array.isArray(e)||typeof e=="string"))throw new Error("Second argument to indexOf is not a string or array");return e.indexOf(t)}function sf(t,e){if(!Array.isArray(e))throw new Error("Second argument to join is not an array");return e.join(t)}function af(t){return(t>0)-(t<0)||+t}var Bl=1/3;function of(t){return t<0?-Math.pow(-t,Bl):Math.pow(t,Bl)}function rf(t){return Math.exp(t)-1}function lf(t){return Math.log(1+t)}function cf(t){return Math.log(t)/Math.LN2}function uf(t){if(!Array.isArray(t))throw new Error("Sum argument is not an array");return t.reduce(function(e,n){return e+Number(n)},0)}function bs(t){this.options=t||{},this.unaryOps={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,sinh:Math.sinh||Id,cosh:Math.cosh||$d,tanh:Math.tanh||Rd,asinh:Math.asinh||Od,acosh:Math.acosh||Dd,atanh:Math.atanh||Bd,sqrt:Math.sqrt,cbrt:Math.cbrt||of,log:Math.log,log2:Math.log2||cf,ln:Math.log,lg:Math.log10||$l,log10:Math.log10||$l,expm1:Math.expm1||rf,log1p:Math.log1p||lf,abs:Math.abs,ceil:Math.ceil,floor:Math.floor,round:Math.round,trunc:Math.trunc||qd,"-":Vd,"+":Number,exp:Math.exp,not:Yd,length:Ud,"!":Rl,sign:Math.sign||af},this.binaryOps={"+":yd,"-":wd,"*":Sd,"/":kd,"%":Md,"^":Math.pow,"||":Ed,"==":Cd,"!=":Ad,">":Pd,"<":zd,">=":_d,"<=":Ld,and:Fd,or:Td,in:Nd,"=":Gd,"[":Kd},this.ternaryOps={"?":Dl},this.functions={random:Hd,fac:Rl,min:Jd,max:Zd,hypot:Math.hypot||Ol,pyt:Math.hypot||Ol,pow:Math.pow,atan2:Math.atan2,if:Dl,gamma:ar,roundTo:Wd,map:Qd,fold:ef,filter:tf,indexOf:nf,join:sf,sum:uf},this.consts={E:Math.E,PI:Math.PI,true:!0,false:!1}}bs.prototype.parse=function(t){var e=[],n=new Ne(this,new De(this,t),{allowMemberAccess:this.options.allowMemberAccess});return n.parseExpression(e),n.expect(Fi,"EOF"),new Gt(e,this)};bs.prototype.evaluate=function(t,e){return this.parse(t).evaluate(e)};var eu=new bs;bs.parse=function(t){return eu.parse(t)};bs.evaluate=function(t,e){return eu.parse(t).evaluate(e)};var Vl={"+":"add","-":"subtract","*":"multiply","/":"divide","%":"remainder","^":"power","!":"factorial","<":"comparison",">":"comparison","<=":"comparison",">=":"comparison","==":"comparison","!=":"comparison","||":"concatenate",and:"logical",or:"logical",not:"logical","?":"conditional",":":"conditional","=":"assignment","[":"array","()=":"fndef"};function pf(t){return Object.hasOwn(Vl,t)?Vl[t]:t}bs.prototype.isOperatorEnabled=function(t){var e=pf(t),n=this.options.operators||{};return!(e in n)||!!n[e]};const hf=new bs({allowMemberAccess:!1,operators:{assignment:!1,comparison:!1,fndef:!1,in:!1,logical:!1}}),df=new Set(["ch1","ch2","times"]);function ff(t,e,n,s){const i=t.replace(/\bnp\./g,"").replaceAll("**","^"),a=hf.parse(i),o=a.variables().filter(d=>!df.has(d));if(o.length>0)throw new Error(`unknown variable ${o[0]}`);const l=a.toJSFunction(["ch1","ch2","times"]),u=new Float32Array(Math.min(e.length,n.length,s.length));for(let d=0;d<u.length;d+=1){const v=Number(l(e[d],n[d],s[d]));u[d]=Number.isFinite(v)?v:Number.NaN}return u}const mf="PWS1",Yl=24;function tu(t){if(t.byteLength<Yl)throw new Error("Scope frame too short");const e=new DataView(t),n=String.fromCharCode(...new Uint8Array(t.slice(0,4)));if(n!==mf)throw new Error(`Bad frame magic: ${n}`);const s=e.getUint16(4,!0);if(s!==1)throw new Error(`Unsupported scope frame version: ${s}`);const i=e.getUint16(6,!0),a=e.getUint32(8,!0),o=new Float32Array(t,Yl);if(o.length!==a*i)throw new Error("Scope frame payload length does not match metadata");return{channelCount:i,sampleCount:a,sequence:e.getUint32(20,!0),samples:o}}function gf(t,e){const n=new Float64Array(t.sampleCount),s=new Float32Array(t.sampleCount),i=new Float32Array(t.sampleCount),a=e?.rollingMode?-e.duration:e&&e.triggerSource!=="immediately"?e.triggerDelay-e.duration/2:0,o=e?e.duration:Math.max(0,t.sampleCount-1),l=t.sampleCount>0?o/t.sampleCount:0;for(let u=0;u<t.sampleCount;u+=1)n[u]=e?a+u*l:u,s[u]=t.samples[u*t.channelCount]??0,i[u]=t.channelCount>1?t.samples[u*t.channelCount+1]??0:0;return{x:n,ch1:s,ch2:i}}function vf(t,e,n,s){const i=Math.min(n+1,Math.max(1,Math.floor(s)));if(i<=1||!e||e.ch1.length!==t.ch1.length||e.ch2.length!==t.ch2.length)return{data:t,currentAverage:1};const a=new Float32Array(t.ch1.length),o=new Float32Array(t.ch2.length),l=i-1;for(let u=0;u<t.ch1.length;u+=1)a[u]=(e.ch1[u]*l+t.ch1[u])/i,o[u]=(e.ch2[u]*l+t.ch2[u])/i;return{data:{x:t.x,ch1:a,ch2:o},currentAverage:i}}function xf(t,e,n,s=4){const i=Math.max(1,n),a=Math.min(i,Math.max(s,e-t));let o=t,l=t+a;return o<0&&(l-=o,o=0),l>i&&(o-=l-i,l=i),{min:Math.max(0,o),max:Math.min(i,Math.max(a,l))}}const bf=2**14,Qi=-1.1,bi=1.1;class yf{constructor(e,n,s=()=>{},i=bf){this.plotHost=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.plot=new Te(this.options(),this.emptyData(),this.plotHost),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}plotHost;setStatus;setCurrentAverage;sampleCount;socket=null;plot;latestFrame=null;receivedFrameCount=0;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;pendingFrame=null;averagedData=null;displayedData=null;currentAverage=0;traceAverage=1;timeSettings=null;channelVisible=[!0,!0];xyMode=!1;mathActive=!1;mathFormula="ch1 * ch2";resizeListener=()=>this.scheduleResize();connect(){if(this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/scope?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&this.setStatus("Scope stream connected")},s.onclose=()=>{this.socket===s&&(this.socket=null,this.setStatus("Scope stream closed"))},s.onerror=()=>{this.socket===s&&this.setStatus("Scope stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.handleFrame(i.data)}}close(){const e=this.socket;this.socket=null,e?.close()}reconnect(){this.isConnected()&&(this.close(),this.resetTraceAveraging(),this.connect())}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}setSampleCount(e){this.sampleCount=Math.max(1,Math.floor(e)),this.resetAveraging()}getSampleCount(){return this.sampleCount}setTraceAverage(e){this.traceAverage=Math.max(1,Math.floor(e)),this.resetAveraging()}resetTraceAveraging(){this.pendingFrame=null,this.resetAveraging()}getTraceAverage(){return this.traceAverage}setTimeSettings(e){if(this.timeSettings=e,this.resetAveraging(),this.latestFrame&&this.displayedData){const n=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(n)),this.resetYScale()}),this.plot.redraw(!0,!0)}}setChannelVisible(e,n){this.channelVisible[e-1]=n,this.applySeriesVisibility()}getChannelVisible(e){return this.channelVisible[e-1]}setDisplaySettings(e){const n=this.xyMode!==e.xyMode;if(this.xyMode=e.xyMode,this.mathActive=e.mathActive,this.mathFormula=e.mathFormula,this.applySeriesVisibility(),this.latestFrame&&this.displayedData){const s=this.latestFrame;this.plot.setData(this.plotData(this.displayedData),!1),n&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(s)),this.resetYScale()}),this.plot.redraw(!0,!0)}}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.plot.destroy()}showFrame(e){this.handleFrame(e)}resetZoom(){if(!this.latestFrame)return;const e=this.latestFrame;this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(e)),this.resetYScale()})}zoom(e){const n=this.plot.scales.x,s=Number(n.min??0),i=Number(n.max??this.currentMaxX()),a=(s+i)/2,o=Math.max(this.minimumXSpan(),(i-s)*e);this.setXScale(a-o/2,a+o/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-6,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??Qi),max:Number(e.max??bi)}}getFormattedTimeLabelsForCurrentRange(e=6){const{min:n,max:s}=this.getXRange(),i=Math.max(2,Math.floor(e)),a=(s-n)/(i-1),o=Array.from({length:i},(l,u)=>n+a*u);return this.formatTimeTicks(this.plot,o)}getFrameSequence(){return this.receivedFrameCount>0?this.receivedFrameCount:null}exportCsv(){if(!this.displayedData)return`time,ch1,ch2
`;const e=["time,ch1,ch2"];for(let n=0;n<this.displayedData.x.length;n+=1)e.push(`${this.displayedData.x[n]},${this.displayedData.ch1[n]},${this.displayedData.ch2[n]}`);return`${e.join(`
`)}
`}getDisplayedStats(){return this.displayedData?{...Hl(this.displayedData.ch1,"ch1"),...Hl(this.displayedData.ch2,"ch2")}:null}getDisplayedDataFingerprint(){if(!this.displayedData)return null;let e=2166136261;const n=Math.max(1,Math.floor(this.displayedData.x.length/512));for(let s=0;s<this.displayedData.x.length;s+=n)e=oo(e,this.displayedData.x[s]),e=oo(e,this.displayedData.ch1[s]),e=oo(e,this.displayedData.ch2[s]);return e>>>0}getMathStats(){return this.xyMode||!this.mathActive?null:wf(this.plot.data,3,1)}getXyStats(){if(!this.xyMode)return null;const e=Co(this.plot.data,1,0),n=Co(this.plot.data,1,1);if(!e||!n||e.length===0||e.length!==n.length)return null;let s=Number.POSITIVE_INFINITY,i=Number.NEGATIVE_INFINITY,a=Number.POSITIVE_INFINITY,o=Number.NEGATIVE_INFINITY,l=0;for(let u=0;u<e.length;u+=1)s=Math.min(s,e[u]),i=Math.max(i,e[u]),a=Math.min(a,n[u]),o=Math.max(o,n[u]),l=Math.max(l,Math.abs(e[u]-n[u]));return{xMin:s,xMax:i,yMin:a,yMax:o,maxDelta:l}}getCurveData(){return this.displayedData?{x:Array.from(this.displayedData.x),channels:[Array.from(this.displayedData.ch1),Array.from(this.displayedData.ch2)]}:null}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}options(){return{mode:2,width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1,min:0,max:this.sampleCount-1},y:{auto:!1,min:Qi,max:bi}},axes:[mt({label:"Time / CH1",values:(e,n)=>this.formatTimeTicks(e,n)}),mt({label:"Amplitude / CH2"})],series:[{},{label:"CH1 / XY",stroke:je.green,width:1.5,points:{show:!1}},{label:"CH2",stroke:je.red,width:1.5,points:{show:!1}},{label:"Math",stroke:je.blue,width:1.5,points:{show:!1}}]}}emptyData(){return[[],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)],[new Float64Array(0),new Float32Array(0)]]}handleFrame(e){let n;try{n=tu(e)}catch(s){this.setStatus(s instanceof Error?s.message:"Invalid scope frame");return}this.receivedFrameCount+=1,this.pendingFrame=n,this.scheduleRender(),this.setStatus(`Frame ${n.sequence}, ${n.sampleCount} samples, ${n.channelCount} channels`)}frameData(e){const n=gf(e,this.timeSettings??void 0);if(this.timeSettings?.rollingMode)return this.averagedData=null,this.displayedData=n,this.currentAverage=0,this.setCurrentAverage(0),this.plotData(n);const s=vf(n,this.averagedData,this.currentAverage,this.traceAverage);return this.averagedData=s.data,this.displayedData=s.data,this.currentAverage=s.currentAverage,this.setCurrentAverage(this.currentAverage),this.plotData(s.data)}plotData(e){if(this.xyMode){const s=new Float32Array(0);return[[],[e.ch1,e.ch2],[s,s],[s,s]]}let n=new Float32Array(e.x.length).fill(Number.NaN);if(this.mathActive)try{n=ff(this.mathFormula,e.ch1,e.ch2,e.x)}catch(s){this.setStatus(`Math formula error: ${s instanceof Error?s.message:String(s)}`)}return[[],[e.x,e.ch1],[e.x,e.ch2],[e.x,n]]}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=this.latestFrame===null,s=this.latestFrame!==null&&this.latestFrame.sampleCount!==e.sampleCount;s&&this.resetAveraging(),this.latestFrame=e,this.plot.setData(this.frameData(e),!1),(n||s)&&this.resetZoom(),this.plot.redraw(!0,!0)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resize()}))}resize(){const e=Math.max(320,Math.floor(this.plotHost.clientWidth)),n=Math.max(240,Math.floor(this.plotHost.clientHeight));e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(this.timeSettings&&!this.xyMode){const s=this.defaultXMin(),i=s+this.timeSettings.duration,a=Math.max(Number.EPSILON,this.timeSettings.duration/1024),o=Math.min(i-s,Math.max(a,n-e));let l=e,u=e+o;l<s&&(u+=s-l,l=s),u>i&&(l-=u-i,u=i),this.plot.setScale("x",{min:Math.max(s,l),max:Math.min(i,u)});return}this.plot.setScale("x",xf(e,n,this.currentMaxX()))}setYScale(e,n){const s=Math.max(1e-6,n-e);this.plot.setScale("y",{min:e,max:e+s})}resetYScale(){this.plot.setScale("y",{min:Qi,max:bi})}minimumXSpan(){return this.timeSettings&&!this.xyMode?Math.max(Number.EPSILON,this.timeSettings.duration/1024):4}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-6,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){if(this.xyMode)return bi;if(this.timeSettings){const e=this.defaultXMin();return Math.max(e+Number.EPSILON,e+this.timeSettings.duration)}return Math.max(1,(this.latestFrame?.sampleCount??this.sampleCount)-1)}defaultXScale(e){if(this.xyMode)return{min:Qi,max:bi};if(this.timeSettings){const n=this.defaultXMin();return{min:n,max:n+this.timeSettings.duration}}return{min:0,max:Math.max(1,e.sampleCount-1)}}defaultXMin(){return this.timeSettings?this.timeSettings.rollingMode?-this.timeSettings.duration:this.timeSettings.triggerSource==="immediately"?0:this.timeSettings.triggerDelay-this.timeSettings.duration/2:0}resetAveraging(){this.averagedData=null,this.currentAverage=0,this.setCurrentAverage(0)}formatTimeTicks(e,n){if(this.xyMode)return n.map(d=>ql(d,3));const s=Number(e.scales.x.min??n[0]??0),i=Number(e.scales.x.max??n[n.length-1]??s),a=Math.max(Number.EPSILON,Math.abs(i-s)),o=Sf(Math.max(Number.EPSILON,this.timeSettings?.duration??a)),l=n.length>1?Math.abs(n[1]-n[0])*o.scale:a*o.scale,u=Math.max(0,Math.min(9,Math.ceil(-Math.log10(Math.max(l,Number.EPSILON)))+1));return n.map(d=>`${ql(d*o.scale,u)} ${o.suffix}`)}applySeriesVisibility(){this.plot.setSeries(1,{show:this.xyMode||this.channelVisible[0]}),this.plot.setSeries(2,{show:!this.xyMode&&this.channelVisible[1]}),this.plot.setSeries(3,{show:!this.xyMode&&this.mathActive})}}function Co(t,e,n){return t[e]?.[n]??null}function wf(t,e,n){const s=Co(t,e,n);if(!s||s.length===0)return null;let i=Number.POSITIVE_INFINITY,a=Number.NEGATIVE_INFINITY;for(let o=0;o<s.length;o+=1){const l=s[o];Number.isFinite(l)&&(i=Math.min(i,l),a=Math.max(a,l))}return i===Number.POSITIVE_INFINITY?null:{min:i,max:a}}function Sf(t){return t<1e-6?{scale:1e9,suffix:"ns"}:t<.001?{scale:1e6,suffix:"us"}:t<1?{scale:1e3,suffix:"ms"}:{scale:1,suffix:"s"}}function ql(t,e){return Number.isFinite(t)?t.toFixed(e).replace(/\.?0+$/,""):"0"}function Hl(t,e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const i of t)n=Math.min(n,i),s=Math.max(s,i);return{[`${e}Min`]:n===Number.POSITIVE_INFINITY?0:n,[`${e}Max`]:s===Number.NEGATIVE_INFINITY?0:s}}function oo(t,e){const n=Math.round(Number.isFinite(e)?e*1e6:0);return t^=n&255,t=Math.imul(t,16777619),t^=n>>8&255,t=Math.imul(t,16777619),t^=n>>16&255,t=Math.imul(t,16777619),t^=n>>24&255,t=Math.imul(t,16777619),t}const jl=[new Float64Array(0),new Float32Array(0)];class kf{constructor(e,n,s=()=>{},i=16384){this.host=e,this.setStatus=n,this.setCurrentAverage=s,this.sampleCount=i,this.plot=new Te(this.options("",this.labels),jl,this.host),window.addEventListener("resize",this.resizeListener),this.bindInteractions(),this.scheduleResize()}host;setStatus;setCurrentAverage;sampleCount;socket=null;retiredSockets=new WeakSet;plot;latestFrame=null;latestCurveFrame=null;pendingFrame=null;panState=null;zoomState=null;plotSize={width:0,height:0};resizeFrame=null;renderFrame=null;labels=["Spectrum"];unit="";averagedFrame=null;currentAverage=0;settings={baseband:!0,span:976562.5,center:0,window:"blackman",displayUnit:"dB(Vpk^2)",displayInput1Baseband:!0,displayInput2Baseband:!0,displayCrossAmplitude:!0,traceAverage:1,runningState:"stopped"};resizeListener=()=>this.scheduleResize();setSettings(e){const n={...this.settings,baseband:!!(e.baseband??this.settings.baseband),span:Number(e.span??this.settings.span),center:Number(e.center??this.settings.center),window:String(e.window??this.settings.window),displayUnit:String(e.display_unit??this.settings.displayUnit),displayInput1Baseband:!!(e.display_input1_baseband??this.settings.displayInput1Baseband),displayInput2Baseband:!!(e.display_input2_baseband??this.settings.displayInput2Baseband),displayCrossAmplitude:!!(e.display_cross_amplitude??this.settings.displayCrossAmplitude),traceAverage:Math.max(1,Math.floor(Number(e.trace_average??this.settings.traceAverage))),runningState:String(e.running_state??this.settings.runningState)};!(this.settings.runningState==="running_single"&&n.runningState==="stopped")&&Ul(n)!==Ul(this.settings)&&this.resetAveraging(),this.settings=n}resetAveraging(){this.averagedFrame=null,this.pendingFrame=null,this.currentAverage=0,this.setCurrentAverage(0)}getAverageCount(){return this.currentAverage}connect(){if(this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws",n=window.location.host||"127.0.0.1:8000",s=new WebSocket(`${e}://${n}/ws/spectrumanalyzer?samples=${this.sampleCount}`);this.socket=s,s.binaryType="arraybuffer",s.onopen=()=>{this.socket===s&&this.setStatus("Spectrum stream connected")},s.onclose=()=>{this.socket===s&&(this.socket=null),this.retiredSockets.has(s)||this.setStatus("Spectrum stream closed")},s.onerror=()=>{this.socket===s&&this.setStatus("Spectrum stream error")},s.onmessage=i=>{this.socket===s&&i.data instanceof ArrayBuffer&&this.showScopeBuffer(i.data)}}close(){const e=this.socket;this.socket=null,e&&(this.retiredSockets.add(e),e.close())}isConnected(){return this.socket!==null&&this.socket.readyState<=WebSocket.OPEN}showScopeBuffer(e){let n;try{n=Mf(e,this.settings)}catch(i){this.setStatus(i instanceof Error?i.message:"Invalid spectrum frame");return}const s=this.averageFrame(n);this.setCurrentAverage(this.currentAverage),this.latestCurveFrame=s,this.pendingFrame=Lf(s,this.settings.displayUnit),this.scheduleRender(),this.setStatus(`Spectrum frame ${n.sequence}, ${n.x.length} bins, RBW ${Ff(n.rbw)} Hz`)}refreshLayout(){this.scheduleResize(),this.plot.redraw(!0,!0)}destroy(){this.close(),window.removeEventListener("resize",this.resizeListener),this.resizeFrame!==null&&(cancelAnimationFrame(this.resizeFrame),this.resizeFrame=null),this.renderFrame!==null&&(cancelAnimationFrame(this.renderFrame),this.renderFrame=null),this.plot.destroy()}getSeriesCount(){return this.latestFrame?.series.length??0}exportCsv(){if(!this.latestFrame)return`frequency
`;const n=[`frequency,${this.latestFrame.series.map(s=>s.label).join(",")}`];for(let s=0;s<this.latestFrame.x.length;s+=1)n.push([this.latestFrame.x[s],...this.latestFrame.series.map(i=>i.values[s]??"")].join(","));return`${n.join(`
`)}
`}getCurveData(){return this.latestCurveFrame?{x:Array.from(this.latestCurveFrame.x),series:this.latestCurveFrame.series.map(e=>({label:e.label,values:Array.from(e.values)})),unit:"Vpk^2"}:null}getCurveParameters(){return{baseband:this.settings.baseband,span:this.settings.span,center:this.settings.center,window:this.settings.window,display_unit:this.settings.displayUnit,trace_average:this.settings.traceAverage,display_input1_baseband:this.settings.displayInput1Baseband,display_input2_baseband:this.settings.displayInput2Baseband,display_cross_amplitude:this.settings.displayCrossAmplitude}}downloadCsv(e){const n=new Blob([this.exportCsv()],{type:"text/csv;charset=utf-8"}),s=URL.createObjectURL(n),i=document.createElement("a");i.href=s,i.download=e,document.body.appendChild(i),i.click(),i.remove(),window.setTimeout(()=>URL.revokeObjectURL(s),0)}resetZoom(){this.latestFrame&&this.plot.batch(()=>{this.plot.setScale("x",this.defaultXScale(this.latestFrame)),this.plot.setScale("y",this.defaultYScale(this.latestFrame))})}zoom(e){const{min:n,max:s}=this.getXRange(),i=(n+s)/2,a=Math.max(this.minimumXSpan(),(s-n)*e);this.setXScale(i-a/2,i+a/2)}zoomY(e){const{min:n,max:s}=this.getYRange(),i=(n+s)/2,a=Math.max(1e-12,(s-n)*e);this.setYScale(i-a/2,i+a/2)}panX(e){const{min:n,max:s}=this.getXRange(),i=(s-n)*e;this.setXScale(n+i,s+i)}panY(e){const{min:n,max:s}=this.getYRange(),i=(s-n)*e;this.setYScale(n+i,s+i)}getXRange(){const e=this.plot.scales.x;return{min:Number(e.min??0),max:Number(e.max??this.currentMaxX())}}getYRange(){const e=this.plot.scales.y;return{min:Number(e.min??-120),max:Number(e.max??20)}}options(e,n){return{width:900,height:420,padding:[8,10,0,0],legend:{show:!0,live:!0},cursor:{drag:{x:!1,y:!1,setScale:!1},focus:{prox:24},points:{size:5}},scales:{x:{time:!1,auto:!1},y:{auto:!1}},axes:[mt({label:"Frequency (Hz)"}),mt({label:e})],series:[{},...n.map((s,i)=>({label:s,stroke:i===0?je.green:i===1?je.blue:je.yellow,width:1.4,points:{show:!1}}))]}}scheduleRender(){this.renderFrame===null&&(this.renderFrame=requestAnimationFrame(()=>{this.renderFrame=null,this.renderPendingFrame()}))}renderPendingFrame(){if(!this.pendingFrame)return;const e=this.pendingFrame;this.pendingFrame=null;const n=e.series.map(o=>o.label),s=n.join("\0")!==this.labels.join("\0"),i=e.unit!==this.unit,a=this.latestFrame===null;this.latestFrame=e,s||i?(this.labels=n.length?n:["Spectrum"],this.unit=e.unit,this.plot.destroy(),this.plot=new Te(this.options(e.unit,this.labels),this.frameData(e),this.host),this.bindInteractions(),this.scheduleResize()):this.plot.setData(this.frameData(e),!1),(a||s||i)&&this.resetZoom(),this.plot.redraw(!0,!0)}frameData(e){return e.x.length&&e.series.length?[e.x,...e.series.map(n=>n.values)]:jl}averageFrame(e){const n=Math.max(1,this.settings.traceAverage),s=this.averagedFrame&&this.averagedFrame.x.length===e.x.length&&this.averagedFrame.series.length===e.series.length&&this.averagedFrame.series.every((l,u)=>l.values.length===e.series[u].values.length);if(n<=1||!s)return this.averagedFrame=_f(e),this.currentAverage=1,e;const i=Math.min(this.currentAverage+1,n),a=i-1,o=e.series.map((l,u)=>{const d=this.averagedFrame.series[u].values,v=new Float64Array(l.values.length);for(let f=0;f<v.length;f+=1)v[f]=(d[f]*a+l.values[f])/i;return{label:l.label,values:v}});return this.averagedFrame={...e,x:e.x,series:o},this.currentAverage=i,this.averagedFrame}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=window.requestAnimationFrame(()=>{this.resizeFrame=null;const e=Math.max(320,Math.floor(this.host.clientWidth)),n=Math.max(240,Math.floor(this.host.clientHeight));e===this.plotSize.width&&n===this.plotSize.height||(this.plotSize={width:e,height:n},this.plot.setSize({width:e,height:n}))}))}bindInteractions(){const e=this.plot.over;e.addEventListener("contextmenu",s=>s.preventDefault()),e.addEventListener("pointerdown",s=>{const{min:i,max:a}=this.getXRange(),{min:o,max:l}=this.getYRange();if(s.button===0){this.panState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-panning");return}s.button!==1&&s.button!==2||(this.zoomState={startX:s.clientX,startY:s.clientY,xMin:i,xMax:a,yMin:o,yMax:l},e.setPointerCapture(s.pointerId),e.classList.add("is-zooming"))}),e.addEventListener("pointermove",s=>{if(this.panState){const i=Math.max(1,this.plot.bbox.width/(devicePixelRatio||1)),a=Math.max(1,this.plot.bbox.height/(devicePixelRatio||1)),o=this.panState.xMax-this.panState.xMin,l=this.panState.yMax-this.panState.yMin,u=(s.clientX-this.panState.startX)/i*o,d=(s.clientY-this.panState.startY)/a*l;this.setXScale(this.panState.xMin-u,this.panState.xMax-u),this.setYScale(this.panState.yMin+d,this.panState.yMax+d)}else if(this.zoomState){const i=s.clientX-this.zoomState.startX,a=s.clientY-this.zoomState.startY,o=Math.exp(-i/260),l=Math.exp(a/260);this.zoomAroundStartScale(this.zoomState,o,l)}});const n=s=>{if(this.panState||this.zoomState)try{e.releasePointerCapture(s.pointerId)}catch{}this.panState=null,this.zoomState=null,e.classList.remove("is-panning"),e.classList.remove("is-zooming")};e.addEventListener("pointerup",n),e.addEventListener("pointercancel",n),e.addEventListener("dblclick",()=>this.resetZoom())}setXScale(e,n){if(!this.latestFrame)return;const s=this.defaultXScale(this.latestFrame),i=this.minimumXSpan(),a=Math.min(s.max-s.min,Math.max(i,n-e));let o=e,l=e+a;o<s.min&&(l+=s.min-o,o=s.min),l>s.max&&(o-=l-s.max,l=s.max),this.plot.setScale("x",{min:Math.max(s.min,o),max:Math.min(s.max,l)})}setYScale(e,n){const s=Math.max(1e-12,n-e);this.plot.setScale("y",{min:e,max:e+s})}minimumXSpan(){return!this.latestFrame||this.latestFrame.x.length<2?Number.EPSILON:Math.max(Number.EPSILON,Math.abs(this.latestFrame.x[this.latestFrame.x.length-1]-this.latestFrame.x[0])/1024)}zoomAroundStartScale(e,n,s){const i=(e.xMin+e.xMax)/2,a=(e.yMin+e.yMax)/2,o=Math.max(this.minimumXSpan(),(e.xMax-e.xMin)*n),l=Math.max(1e-12,(e.yMax-e.yMin)*s);this.setXScale(i-o/2,i+o/2),this.setYScale(a-l/2,a+l/2)}currentMaxX(){return this.latestFrame&&this.latestFrame.x.length?this.latestFrame.x[this.latestFrame.x.length-1]:1}defaultXScale(e){return e.x.length?{min:e.x[0],max:e.x[e.x.length-1]}:{min:0,max:1}}defaultYScale(e){let n=Number.POSITIVE_INFINITY,s=Number.NEGATIVE_INFINITY;for(const a of e.series)for(const o of a.values)Number.isFinite(o)&&(n=Math.min(n,o),s=Math.max(s,o));if(n===Number.POSITIVE_INFINITY||s===Number.NEGATIVE_INFINITY)return{min:-120,max:20};const i=Math.max(1e-9,(s-n)*.08);return{min:n-i,max:s+i}}}function Mf(t,e){const n=tu(t),s=zf(n.sampleCount),i=Pf(e.window,s),a=new Float64Array(s),o=new Float64Array(s);for(let y=0;y<s;y+=1)a[y]=(n.samples[y*n.channelCount]??0)*i[y],o[y]=(n.samples[y*n.channelCount+1]??0)*i[y];const l=i.reduce((y,k)=>y+k,0),u=i.reduce((y,k)=>y+k*k,0),d=l===0?0:e.span*u/(l*l);if(e.baseband){const y=Xl(a),k=Xl(o),F=new Float64Array(y.real.length);for(let P=0;P<F.length;P+=1)F[P]=P*e.span/s;const _=[];return e.displayInput1Baseband&&_.push({label:"Input 1",values:Ao(y)}),e.displayInput2Baseband&&_.push({label:"Input 2",values:Ao(k)}),e.displayCrossAmplitude&&_.push({label:"Cross",values:Ef(y,k)}),{sequence:n.sequence,x:F,series:_,span:e.span,center:e.center,rbw:d,unit:e.displayUnit,running_state:e.runningState}}const v=nu(a,o),f=Cf(v),m=new Float64Array(f.length);for(let y=0;y<m.length;y+=1)m[y]=e.center+(y-f.length/2)*e.span/s;return{sequence:n.sequence,x:m,series:[{label:"IQ",values:f}],span:e.span,center:e.center,rbw:d,unit:e.displayUnit,running_state:e.runningState}}function Xl(t){const e=new Float64Array(t.length),n=nu(t,e),s=t.length/2+1;return{real:n.real.slice(0,s),imag:n.imag.slice(0,s)}}function nu(t,e){const n=t.length,s=new Float64Array(t),i=new Float64Array(e);for(let a=1,o=0;a<n;a+=1){let l=n>>1;for(;o&l;l>>=1)o^=l;if(o^=l,a<o){const u=s[a];s[a]=s[o],s[o]=u;const d=i[a];i[a]=i[o],i[o]=d}}for(let a=2;a<=n;a<<=1){const o=-2*Math.PI/a,l=Math.cos(o),u=Math.sin(o);for(let d=0;d<n;d+=a){let v=1,f=0;for(let m=0;m<a/2;m+=1){const y=d+m,k=y+a/2,F=s[y],_=i[y],P=s[k]*v-i[k]*f,M=s[k]*f+i[k]*v;s[y]=F+P,i[y]=_+M,s[k]=F-P,i[k]=_-M;const $=v*l-f*u;f=v*u+f*l,v=$}}}return{real:s,imag:i}}function Ao(t){const e=new Float64Array(t.real.length);for(let n=0;n<e.length;n+=1)e[n]=t.real[n]*t.real[n]+t.imag[n]*t.imag[n];return e}function Ef(t,e){const n=new Float64Array(t.real.length);for(let s=0;s<n.length;s+=1){const i=t.real[s]*e.real[s]+t.imag[s]*e.imag[s],a=t.real[s]*e.imag[s]-t.imag[s]*e.real[s];n[s]=Math.hypot(i,a)}return n}function Cf(t){const e=Ao(t),n=new Float64Array(e.length),s=Math.floor(e.length/2);return n.set(e.slice(s),0),n.set(e.slice(0,s),e.length-s),n}function Af(t,e,n){const s=new Float64Array(t.length);for(let i=0;i<t.length;i+=1){const a=Math.max(t[i],Number.EPSILON);e==="dB(Vpk^2)"?s[i]=10*Math.log10(a):e==="Vpk"?s[i]=Math.sqrt(a):e==="Vrms^2"?s[i]=a/2:e==="dB(Vrms^2)"?s[i]=10*Math.log10(a/2+Number.EPSILON):e==="Vrms"?s[i]=Math.sqrt(a)/Math.SQRT2:e==="Vrms^2/Hz"?s[i]=a/2/Math.max(n,Number.EPSILON):e==="dB(Vrms^2/Hz)"?s[i]=10*Math.log10(a/2/Math.max(n,Number.EPSILON)+Number.EPSILON):e==="Vrms/sqrt(Hz)"?s[i]=Math.sqrt(a)/Math.SQRT2/Math.max(n,Number.EPSILON):s[i]=a}return s}function Pf(t,e){const n=new Float64Array(e);for(let a=0;a<e;a+=1){const o=e>1?2*Math.PI*a/(e-1):0;if(t==="boxcar")n[a]=1;else if(t==="hamming")n[a]=.54-.46*Math.cos(o);else if(t==="flattop")n[a]=.21557895-.41663158*Math.cos(o)+.277263158*Math.cos(2*o)-.083578947*Math.cos(3*o)+.006947368*Math.cos(4*o);else if(t==="gaussian"){const l=(e-1)/2,u=Math.max(1,e/10);n[a]=Math.exp(-.5*((a-l)/u)**2)}else n[a]=.42-.5*Math.cos(o)+.08*Math.cos(2*o)}const s=n.reduce((a,o)=>a+o,0),i=s?2/s:1;for(let a=0;a<n.length;a+=1)n[a]*=i;return n}function zf(t){return 2**Math.floor(Math.log2(Math.max(2,t)))}function _f(t){return{...t,x:t.x,series:t.series.map(e=>({label:e.label,values:new Float64Array(e.values)}))}}function Lf(t,e){return{...t,unit:e,series:t.series.map(n=>({label:n.label,values:Af(n.values,e,t.rbw)}))}}function Ul(t){return[t.baseband,t.span,t.center,t.window,t.displayUnit,t.displayInput1Baseband,t.displayInput2Baseband,t.displayCrossAmplitude].join("|")}function Ff(t){return Number.isFinite(t)?Math.abs(t)>=1e3?t.toExponential(3):t.toFixed(3):"0"}const Wl=[new Float64Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0),new Float32Array(0)],Tf=[{name:"complex_poles",label:"Complex Poles",kind:"pole",complex:!0},{name:"complex_zeros",label:"Complex Zeros",kind:"zero",complex:!0},{name:"real_poles",label:"Real Poles",kind:"pole",complex:!1},{name:"real_zeros",label:"Real Zeros",kind:"zero",complex:!1}];class Nf{constructor(e,n,s){this.host=e,this.setAttribute=n,this.setStatus=s,this.host.innerHTML=`
      <div class="iir-plot-toolbar">
        <button id="iir-zoom-reset" type="button">Reset</button>
        <output class="iir-plot-status">IIR plot loading...</output>
      </div>
      <div class="iir-plot-grid">
        <div class="iir-plot-frame" data-iir-plot="magnitude"></div>
        <div class="iir-plot-frame" data-iir-plot="phase"></div>
      </div>
      <div class="iir-list-grid"></div>
    `;const i=this.host.querySelector('[data-iir-plot="magnitude"]'),a=this.host.querySelector('[data-iir-plot="phase"]');if(!i||!a)throw new Error("Missing IIR plot hosts");this.magnitudeHost=i,this.phaseHost=a,this.magnitudePlot=new Te(this.options("Magnitude (dB)","dB"),Wl,i),this.phasePlot=new Te(this.options("Phase (deg)","deg"),Wl,a),this.installPlotEvents(this.magnitudePlot),this.installPlotEvents(this.phasePlot),this.host.querySelector("#iir-zoom-reset")?.addEventListener("click",()=>this.resetZoom()),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.host),this.scheduleResize()}host;setAttribute;setStatus;magnitudePlot;phasePlot;magnitudeHost;phaseHost;latest=null;selectedKey=null;resizeFrame=null;resizeObserver=null;clickTimer=null;markerDrag=null;panState=null;zoomState=null;userView=!1;suppressNextClick=!1;windowMouseMove=e=>{const n=this.panState?.plot??this.zoomState?.plot;n&&this.handlePointerMove(n,e)};windowMouseUp=()=>{const e=this.panState?.plot??this.zoomState?.plot;e&&this.endMouseInteraction(e)};async refresh(){const e=await fetch("/api/modules/iir/plot");if(!e.ok)throw new Error(`IIR plot unavailable: ${e.status}`);this.latest=await e.json();const n=Float64Array.from(this.latest.x,y=>Math.log10(Math.max(y,Number.MIN_VALUE))),s=Float32Array.from(this.latest.magnitude),i=Float32Array.from(this.latest.phase),a=Os(this.latest.data_magnitude),o=Os(this.latest.data_phase),l=Os(this.latest.product_magnitude),u=Os(this.latest.product_phase),d=Os(this.latest.measurement_magnitude),v=Os(this.latest.measurement_phase),f=!this.userView||this.magnitudePlot.data[0].length===0;this.magnitudePlot.setData([n,s,a,l,d],!1),this.phasePlot.setData([n,i,o,u,v],!1),f?this.applyDefaultScales():this.linkXScale(this.getXRange()),this.renderMarkers(),this.renderListEditors();const m=this.latest.data_curve_name?` | ${this.latest.data_curve_name}`:"";this.plotStatus().textContent=`${this.latest.tf_type} | ${this.latest.markers.length} pole/zero marker(s)${m}`}destroy(){this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.removeWindowMouseCapture(),this.resizeObserver?.disconnect(),this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.resizeFrame!==null&&cancelAnimationFrame(this.resizeFrame)}options(e,n){return{width:360,height:220,title:e,cursor:{drag:{x:!1,y:!1,setScale:!1}},scales:{x:{time:!1},y:{auto:!1}},axes:[mt({label:"Frequency",values:(s,i)=>i.map(a=>lo(10**a))}),mt({label:n})],series:[{},{label:"Filter design",stroke:je.yellow,width:2},{label:"Data curve",stroke:je.green,width:1.5},{label:"Data x filter",stroke:je.red,width:1.5},{label:"Measurement",stroke:je.orange,width:0,points:{show:!0,size:4,width:1,stroke:je.orange}}],hooks:{draw:[()=>this.renderMarkers()]}}}installPlotEvents(e){const n=e.root;n.addEventListener("contextmenu",i=>i.preventDefault(),{capture:!0}),n.addEventListener("wheel",i=>{i.preventDefault();const a=Math.exp(i.deltaY/500);this.zoomAroundPointer(e,i,a,a)},{passive:!1}),n.addEventListener("pointerdown",i=>{this.startMouseNavigation(e,i)&&n.setPointerCapture(i.pointerId)},{capture:!0}),n.addEventListener("pointermove",i=>this.handlePointerMove(e,i),{capture:!0});const s=i=>this.endPointerInteraction(e,i);n.addEventListener("pointerup",s,{capture:!0}),n.addEventListener("pointercancel",s,{capture:!0}),n.addEventListener("mousedown",i=>{!this.panState&&!this.zoomState&&this.startMouseNavigation(e,i)},{capture:!0}),n.addEventListener("dblclick",i=>{this.clickTimer!==null&&(window.clearTimeout(this.clickTimer),this.clickTimer=null),this.handlePlotClick(e,i,!0).catch(a=>this.setStatus(a.message))}),n.addEventListener("click",i=>{if(this.suppressNextClick){this.suppressNextClick=!1;return}i.detail>1||(this.clickTimer!==null&&window.clearTimeout(this.clickTimer),this.clickTimer=window.setTimeout(()=>{this.clickTimer=null,this.handlePlotClick(e,i,!1).catch(a=>this.setStatus(a.message))},220))}),n.addEventListener("mousemove",i=>{this.markerDrag?this.moveDraggedMarker(i):(!this.panState&&!this.zoomState&&i.buttons&&this.startMouseMoveNavigation(e,i),this.handlePointerMove(e,i))},{capture:!0}),n.addEventListener("mouseup",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)},{capture:!0}),n.addEventListener("mouseleave",i=>{this.markerDrag?this.finishDraggedMarker(i).catch(a=>this.setStatus(a.message)):this.endMouseInteraction(e)})}async handlePlotClick(e,n,s){if(!this.latest||n.defaultPrevented)return;const i=this.frequencyFromEvent(e,n);if(n.ctrlKey||n.metaKey)await this.addMarker("poles",i,s);else if(n.shiftKey)await this.addMarker("zeros",i,s);else{const a=this.nearestMarker(i);a&&(this.selectedKey=ro(a),this.renderMarkers(),this.renderListEditors())}}async addMarker(e,n,s){if(this.latest){if(s){const i=e==="poles"?"complex_poles":"complex_zeros",a=[...this.latest.state[i],Kl(-n/10,n)];await this.setAttribute(i,a)}else{const i=e==="poles"?"real_poles":"real_zeros",a=[...this.latest.state[i],-n];await this.setAttribute(i,a)}await this.refresh()}}renderMarkers(){this.latest&&(this.renderMarkersForPlot(this.magnitudePlot,"magnitude"),this.renderMarkersForPlot(this.phasePlot,"phase"))}renderMarkersForPlot(e,n){const s=Array.from(e.over.querySelectorAll(".iir-marker"));for(const i of s)i.remove();for(const i of this.latest?.markers??[]){const a=Math.max(i.frequency,Number.MIN_VALUE),o=e.valToPos(Math.log10(a),"x"),l=e.valToPos(n==="magnitude"?i.magnitude:i.phase,"y");if(!Number.isFinite(o)||!Number.isFinite(l))continue;const u=document.createElement("button");u.type="button",u.className=`iir-marker is-${i.kind} is-${i.shape}`,u.classList.toggle("is-selected",this.selectedKey===ro(i)),u.style.left=`${o}px`,u.style.top=`${l}px`,u.title=`${i.list}[${i.index}] ${lo(i.frequency)}`,u.textContent=i.kind==="pole"?"x":"o",u.addEventListener("mousedown",d=>{d.preventDefault(),d.stopPropagation(),this.selectedKey=ro(i),this.markerDrag={marker:i,plot:e},u.classList.add("is-dragging"),this.renderListEditors()}),u.addEventListener("pointerdown",d=>d.stopPropagation()),e.over.appendChild(u)}}renderListEditors(){const e=this.host.querySelector(".iir-list-grid");if(!(!e||!this.latest)){e.textContent="";for(const n of Tf){const s=[...this.latest.state[n.name]],i=document.createElement("section");i.className="iir-list-editor",i.dataset.list=n.name;const a=document.createElement("header"),o=document.createElement("span");o.textContent=n.label;const l=document.createElement("input");l.type="number",l.min="0",l.max="64",l.step="1",l.value=String(s.length),l.id=`iir-${n.name.replaceAll("_","-")}-count`,l.addEventListener("change",()=>{this.setListCount(n.name,Number(l.value)).catch(m=>this.setStatus(m.message))});const u=document.createElement("button");u.type="button",u.textContent="+",u.title=`Add ${n.label.slice(0,-1).toLowerCase()}`,u.addEventListener("click",()=>{this.appendListValue(n.name).catch(m=>this.setStatus(m.message))});const d=document.createElement("button");d.type="button",d.textContent="-",d.title=`Remove selected ${n.label.slice(0,-1).toLowerCase()}`,d.disabled=s.length===0,d.addEventListener("click",()=>{this.removeListValue(n.name).catch(m=>this.setStatus(m.message))}),a.append(o,l,u,d),i.appendChild(a);const v=document.createElement("input");v.type="text",v.id=`iir-${n.name.replaceAll("_","-")}`,v.value=s.join(", "),v.addEventListener("change",()=>{const m=n.complex?Jl(v.value):Jl(v.value).map(Number);this.setList(n.name,m).catch(y=>this.setStatus(y.message))}),i.appendChild(v);const f=document.createElement("div");f.className="iir-list-values",s.forEach((m,y)=>{const k=document.createElement("label");k.className="iir-list-value";const F=`${n.name}:${y}`;k.classList.toggle("is-selected",this.selectedKey===F);const _=document.createElement("span");_.textContent=String(y);const P=document.createElement("input");P.type=n.complex?"text":"number",P.step="any",P.value=String(m),P.addEventListener("focus",()=>{this.selectedKey=F,this.renderMarkers(),this.renderListEditors()}),P.addEventListener("change",()=>{const M=[...this.latest.state[n.name]];M[y]=n.complex?P.value:Number(P.value),this.setList(n.name,M).catch($=>this.setStatus($.message))}),k.append(_,P),f.appendChild(k)}),i.appendChild(f),e.appendChild(i)}}}async appendListValue(e){if(!this.latest)return;const n=[...this.latest.state[e],Zl(e)];await this.setList(e,n)}async removeListValue(e){if(!this.latest)return;const n=[...this.latest.state[e]],s=this.selectedKey?.startsWith(`${e}:`)?Number(this.selectedKey.split(":")[1]):n.length-1;s>=0&&s<n.length&&(n.splice(s,1),this.selectedKey=null,await this.setList(e,n))}async setListCount(e,n){if(!this.latest)return;const s=Math.max(0,Math.min(64,Math.round(Number.isFinite(n)?n:0))),i=[...this.latest.state[e]];for(;i.length<s;)i.push(Zl(e));i.length=s,await this.setList(e,i)}async setList(e,n){await this.setAttribute(e,n),await this.refresh()}moveDraggedMarker(e){const n=this.markerDrag;if(!n)return;const s=this.frequencyFromEvent(n.plot,e);this.plotStatus().textContent=`drag ${n.marker.list}[${n.marker.index}] to ${lo(s)}`}async finishDraggedMarker(e){const n=this.markerDrag;if(this.markerDrag=null,!n||!this.latest)return;const s=this.frequencyFromEvent(n.plot,e),i=n.marker;if(i.list==="real_poles"||i.list==="real_zeros"){const a=[...this.latest.state[i.list]];a[i.index]=-s,await this.setAttribute(i.list,a)}else{const a=[...this.latest.state[i.list]],o=If(String(a[i.index]));a[i.index]=Kl(o.real,s),await this.setAttribute(i.list,a)}await this.refresh()}nearestMarker(e){if(!this.latest?.markers.length)return null;let n=this.latest.markers[0],s=1/0;for(const i of this.latest.markers){const a=Math.max(i.frequency,e)/Math.max(Number.MIN_VALUE,Math.min(i.frequency,e));a<s&&(n=i,s=a)}return n}frequencyFromEvent(e,n){const s=e.over.getBoundingClientRect(),i=Math.max(0,Math.min(s.width,n.clientX-s.left));return 10**Number(e.posToVal(i,"x"))}resetZoom(){this.latest&&(this.userView=!1,this.applyDefaultScales(),this.renderMarkers())}getXRange(){const e=this.magnitudePlot.scales.x;return{min:Number(e.min??this.defaultXScale().min),max:Number(e.max??this.defaultXScale().max)}}getMagnitudeYRange(){return this.getYRange(this.magnitudePlot)}getPhaseYRange(){return this.getYRange(this.phasePlot)}handlePointerMove(e,n){if(this.panState?.plot===e){const s=Math.max(1,e.bbox.width/(devicePixelRatio||1)),i=Math.max(1,e.bbox.height/(devicePixelRatio||1)),a=n.clientX-this.panState.startX,o=n.clientY-this.panState.startY;this.panState.moved||=Math.abs(a)>3||Math.abs(o)>3;const l=this.panState.xMax-this.panState.xMin,u=this.panState.yMax-this.panState.yMin,d=a/s*l,v=o/i*u;this.setXScale(this.panState.xMin-d,this.panState.xMax-d),this.setYScale(e,this.panState.yMin+v,this.panState.yMax+v)}else if(this.zoomState?.plot===e){const s=n.clientX-this.zoomState.startX,i=n.clientY-this.zoomState.startY;this.zoomState.moved||=Math.abs(s)>3||Math.abs(i)>3;const a=Math.exp(-s/260),o=Math.exp(i/260);this.zoomAroundStartScale(e,this.zoomState,a,o)}}startMouseNavigation(e,n){if(n.target.closest(".iir-marker")||n.ctrlKey||n.metaKey||n.shiftKey)return!1;const{min:s,max:i}=this.getXRange(),{min:a,max:o}=this.getYRange(e);return n.button===0?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture(),!0):n.button===1||n.button===2?(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,xMin:s,xMax:i,yMin:a,yMax:o,moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture(),!0):!1}startMouseMoveNavigation(e,n){(n.buttons&1)===1?(this.panState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-panning"),this.addWindowMouseCapture()):((n.buttons&2)===2||(n.buttons&4)===4)&&(this.zoomState={plot:e,startX:n.clientX,startY:n.clientY,...this.getXRangeAsStart(e),moved:!1},e.over.classList.add("is-zooming"),this.addWindowMouseCapture())}getXRangeAsStart(e){const{min:n,max:s}=this.getXRange(),{min:i,max:a}=this.getYRange(e);return{xMin:n,xMax:s,yMin:i,yMax:a}}endPointerInteraction(e,n){const s=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;if(this.panState?.plot===e||this.zoomState?.plot===e){try{e.root.releasePointerCapture(n.pointerId)}catch{}this.userView||=!!s,this.suppressNextClick||=!!s}this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}endMouseInteraction(e){const n=this.panState?.plot===e&&this.panState.moved||this.zoomState?.plot===e&&this.zoomState.moved;this.userView||=!!n,this.suppressNextClick||=!!n,this.panState?.plot===e&&(this.panState=null),this.zoomState?.plot===e&&(this.zoomState=null),e.over.classList.remove("is-panning"),e.over.classList.remove("is-zooming"),this.removeWindowMouseCapture()}addWindowMouseCapture(){window.addEventListener("mousemove",this.windowMouseMove),window.addEventListener("mouseup",this.windowMouseUp)}removeWindowMouseCapture(){window.removeEventListener("mousemove",this.windowMouseMove),window.removeEventListener("mouseup",this.windowMouseUp)}zoomAroundPointer(e,n,s,i){const a=e.over.getBoundingClientRect(),o=Math.max(0,Math.min(a.width,n.clientX-a.left)),l=Math.max(0,Math.min(a.height,n.clientY-a.top)),u=Number(e.posToVal(o,"x")),d=Number(e.posToVal(l,"y")),{min:v,max:f}=this.getXRange(),{min:m,max:y}=this.getYRange(e),k=(u-v)/Math.max(Number.EPSILON,f-v),F=(d-m)/Math.max(Number.EPSILON,y-m),_=Math.max(this.minimumXSpan(),(f-v)*s),P=Math.max(1e-12,(y-m)*i);this.setXScale(u-_*k,u+_*(1-k)),this.setYScale(e,d-P*F,d+P*(1-F)),this.userView=!0}zoomAroundStartScale(e,n,s,i){const a=(n.xMin+n.xMax)/2,o=(n.yMin+n.yMax)/2,l=Math.max(this.minimumXSpan(),(n.xMax-n.xMin)*s),u=Math.max(1e-12,(n.yMax-n.yMin)*i);this.setXScale(a-l/2,a+l/2),this.setYScale(e,o-u/2,o+u/2)}setXScale(e,n){const s=this.defaultXScale(),i=Math.min(s.max-s.min,Math.max(this.minimumXSpan(),n-e));let a=e,o=e+i;a<s.min&&(o+=s.min-a,a=s.min),o>s.max&&(a-=o-s.max,o=s.max),this.linkXScale({min:Math.max(s.min,a),max:Math.min(s.max,o)})}setYScale(e,n,s){const i=Math.max(1e-12,s-n);e.setScale("y",{min:n,max:n+i}),this.renderMarkers()}linkXScale(e){this.magnitudePlot.setScale("x",e),this.phasePlot.setScale("x",e),this.renderMarkers()}getYRange(e){const n=e.scales.y,s=e===this.magnitudePlot?this.yScale(Float32Array.from(this.latest?.magnitude??[])):this.yScale(Float32Array.from(this.latest?.phase??[]));return{min:Number(n.min??s.min),max:Number(n.max??s.max)}}applyDefaultScales(){if(!this.latest)return;const e=this.defaultXScale();this.magnitudePlot.batch(()=>{this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",this.yScale(Float32Array.from(this.latest.magnitude)))}),this.phasePlot.batch(()=>{this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",this.yScale(Float32Array.from(this.latest.phase)))})}defaultXScale(){const e=this.latest?.x??[],n=e.length?Math.max(Number.MIN_VALUE,e[0]):10,s=e.length?Math.max(n*1.000001,e[e.length-1]):5e6;return{min:Math.log10(n),max:Math.log10(s)}}minimumXSpan(){const{min:e,max:n}=this.defaultXScale();return Math.max(Number.EPSILON,(n-e)/1024)}yScale(e){if(!e.length)return{min:-260,max:20};let n=1/0,s=-1/0;for(const a of e)Number.isFinite(a)&&(n=Math.min(n,a),s=Math.max(s,a));if(!Number.isFinite(n)||!Number.isFinite(s))return{min:-260,max:20};Math.abs(s-n)<1e-9&&(n-=1,s+=1);const i=(s-n)*.1;return{min:n-i,max:s+i}}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=Gl(this.magnitudeHost),n=Gl(this.phaseHost);!e||!n||(this.magnitudePlot.setSize(e),this.phasePlot.setSize(n),this.renderMarkers())}))}plotStatus(){const e=this.host.querySelector(".iir-plot-status");if(!e)throw new Error("Missing IIR plot status");return e}}function Gl(t){const e=t.getBoundingClientRect(),n=Math.floor(e.width),s=Math.floor(e.height);return n<40||s<40?null:{width:n,height:s}}function Os(t){return Float32Array.from(t,e=>e===null?Number.NaN:e)}function ro(t){return`${t.list}:${t.index}`}function Kl(t,e){return`${_i(t)}+${_i(Math.abs(e))}j`}function Zl(t){return t.startsWith("complex")?"-1000+10000j":-1e4}function Jl(t){return t.split(",").map(e=>e.trim()).filter(Boolean)}function If(t){const n=t.trim().replace("i","j").match(/^([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]\d+(?:\.\d+)?(?:e[+-]?\d+)?)j$/i);return n?{real:Number(n[1]??0),imag:Number(n[2])}:{real:-1,imag:1}}function _i(t){return Number(t.toPrecision(8)).toString()}function lo(t){return t>=1e6?`${_i(t/1e6)} MHz`:t>=1e3?`${_i(t/1e3)} kHz`:`${_i(t)} Hz`}class $f{constructor(e){this.elements=e,e.classSelect.addEventListener("change",()=>{this.setClass(e.classSelect.value).catch(n=>{this.setStatus(n.message)})}),e.addStage.addEventListener("click",()=>{this.requestSchema("/api/lockbox/stages",{method:"POST"}).catch(n=>{this.setStatus(n.message)})}),e.inputPlotSelect.addEventListener("change",()=>{this.refreshInputPlot().catch(n=>this.setStatus(n.message))}),e.outputPlotSelect.addEventListener("change",()=>{this.refreshOutputPlot().catch(n=>this.setStatus(n.message))})}elements;schema=null;inputPlot=null;outputMagnitudePlot=null;outputPhasePlot=null;async load(){const[e,n]=await Promise.all([fetch("/api/lockbox"),fetch("/api/lockbox/actions")]);if(!e.ok||!n.ok)throw new Error("Lockbox controls unavailable");const s=await e.json(),i=await n.json();this.renderActions(i.actions??[]),await this.applySchema(s)}async applySchema(e){this.schema=e,this.populateClassSelect(e),this.renderLockboxAttributes(e.attributes),this.renderInputs(e.inputs),this.renderOutputs(e.outputs),this.renderStages(e.sequence),this.populatePlotSelect(this.elements.inputPlotSelect,e.inputs.map(n=>n.name)),this.populatePlotSelect(this.elements.outputPlotSelect,e.outputs.map(n=>n.name)),this.setStatus(`${e.classname}: ${e.state.current_state??"ready"} | ${e.state.lock_status?"locked":"not locked"}`),await Promise.all([this.refreshInputPlot(),this.refreshOutputPlot()])}refreshLayout(){this.inputPlot?.setSize(this.plotSize(this.elements.inputPlot));const e=this.elements.outputPlot.querySelectorAll(".lockbox-output-plot-frame");e[0]&&this.outputMagnitudePlot?.setSize(this.plotSize(e[0])),e[1]&&this.outputPhasePlot?.setSize(this.plotSize(e[1]))}getStageCount(){return this.schema?.sequence.length??0}getClassname(){return this.schema?.classname??null}populateClassSelect(e){const s=e.attributes.find(i=>i.name==="classname")?.options??[e.classname];this.elements.classSelect.textContent="";for(const i of s){const a=document.createElement("option");a.value=String(i),a.textContent=String(i),this.elements.classSelect.appendChild(a)}this.elements.classSelect.value=e.classname}populatePlotSelect(e,n){const s=e.value;e.textContent="";for(const i of n){const a=document.createElement("option");a.value=i,a.textContent=i,e.appendChild(a)}e.value=n.includes(s)?s:n[0]??""}renderActions(e){this.elements.actions.textContent="";for(const n of e){const s=document.createElement("button");s.type="button",s.textContent=n.label??n.name,s.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/actions/${n.name}`,{method:"POST"}).catch(i=>{this.setStatus(i.message)})}),this.elements.actions.appendChild(s)}}renderLockboxAttributes(e){const n=this.elements.root.querySelector("#lockbox-attributes");if(n){n.textContent="";for(const s of e)s.name!=="classname"&&n.appendChild(this.createAttributeField(s,i=>this.requestSchema(`/api/lockbox/attributes/${s.name}`,this.valueRequest(i))))}}renderInputs(e){this.elements.inputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"input");s.dataset.nodeName=n.name;const i=document.createElement("button");i.type="button",i.textContent="Calibrate",i.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/actions/calibrate`,{method:"POST"}).catch(o=>this.setStatus(o.message))}),s.querySelector(".lockbox-card-title")?.appendChild(i);const a=document.createElement("div");a.className="lockbox-control-row";for(const o of n.attributes)a.appendChild(this.createAttributeField(o,l=>this.requestSchema(`/api/lockbox/inputs/${encodeURIComponent(n.name)}/attributes/${o.name}`,this.valueRequest(l))));if(s.appendChild(a),n.calibration){const o=document.createElement("output");o.textContent=Object.entries(n.calibration).filter(([,l])=>typeof l=="number").slice(0,4).map(([l,u])=>`${l} ${Number(u).toPrecision(3)}`).join(" | "),s.appendChild(o)}this.elements.inputs.appendChild(s)}}renderOutputs(e){this.elements.outputs.textContent="";for(const n of e){const s=this.createSectionCard(n.name,n.kind??"output");s.dataset.nodeName=n.name;const i=document.createElement("div");i.className="lockbox-control-row";const a=!!n.attributes.find(l=>l.name==="assisted_design")?.value,o=String(n.attributes.find(l=>l.name==="tf_type")?.value??"filter");for(const l of n.attributes){const u=this.createAttributeField(l,d=>this.requestSchema(`/api/lockbox/outputs/${encodeURIComponent(n.name)}/attributes/${l.name}`,this.valueRequest(d)));["p","i"].includes(l.name)&&this.setFieldDisabled(u,a),["desired_unity_gain_frequency","analog_filter_cutoff"].includes(l.name)&&this.setFieldDisabled(u,!a),l.name==="tf_curve"&&this.setFieldDisabled(u,o!=="curve"),i.appendChild(u)}s.appendChild(i),this.elements.outputs.appendChild(s)}}renderStages(e){this.elements.stages.textContent="",e.forEach((n,s)=>{const i=this.createSectionCard(n.name,`stage ${s}`),a=document.createElement("button");a.type="button",a.textContent="Delete",a.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}`,{method:"DELETE"}).catch(v=>{this.setStatus(v.message)})});const o=document.createElement("button");o.type="button",o.textContent="Go to this stage",o.addEventListener("click",()=>{this.requestSchema(`/api/lockbox/stages/${s}/actions/execute`,{method:"POST"}).catch(v=>this.setStatus(v.message))});const l=document.createElement("div");l.className="lockbox-card-actions",l.append(o,a),i.querySelector(".lockbox-card-title")?.appendChild(l);const u=document.createElement("div");u.className="lockbox-control-row";for(const v of n.attributes)u.appendChild(this.createAttributeField(v,f=>this.requestSchema(`/api/lockbox/stages/${s}/attributes/${v.name}`,this.valueRequest(f))));i.appendChild(u);const d=document.createElement("div");d.className="lockbox-stage-output-grid";for(const v of n.outputs){const f=document.createElement("section");f.className="lockbox-stage-output";const m=document.createElement("h4");m.textContent=v.output,f.appendChild(m);for(const y of v.attributes)f.appendChild(this.createAttributeField(y,k=>this.requestSchema(`/api/lockbox/stages/${s}/outputs/${encodeURIComponent(v.output)}/attributes/${y.name}`,this.valueRequest(k))));d.appendChild(f)}i.appendChild(d),this.elements.stages.appendChild(i)})}createSectionCard(e,n){const s=document.createElement("section");s.className="lockbox-card";const i=document.createElement("header");i.className="lockbox-card-title";const a=document.createElement("h3");a.textContent=e;const o=document.createElement("span");return o.textContent=n,i.append(a,o),s.appendChild(i),s}createAttributeField(e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");for(const l of e.options??[]){const u=document.createElement("option");u.value=String(l),u.textContent=String(l),o.appendChild(u)}o.value=String(e.value),o.addEventListener("change",()=>{const l=this.selectValue(o.value,e.options??[]);n(l).catch(u=>this.setStatus(u.message))}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{n(o.checked).catch(l=>this.setStatus(l.message))}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",o.value=String(e.value),e.min!==void 0&&(o.min=String(e.min)),e.max!==void 0&&(o.max=String(e.max)),e.step!==void 0&&(o.step=String(e.step)),o.addEventListener("change",()=>{n(Number(o.value)).catch(l=>this.setStatus(l.message))}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Array.isArray(e.value)?e.value.join(", "):String(e.value??""),o.addEventListener("change",()=>{n(this.textValue(o.value)).catch(l=>this.setStatus(l.message))}),a=o}return a.id=`lockbox-${e.name.replaceAll("_","-")}-${crypto.randomUUID()}`,s.appendChild(a),s}setFieldDisabled(e,n){const s=e.querySelector("input, select");s&&(s.disabled=n),e.classList.toggle("is-disabled",n)}selectValue(e,n){return n.find(i=>String(i)===e)??e}textValue(e){const n=e.split(",").map(s=>s.trim()).filter(Boolean);return n.length>1&&n.every(s=>Number.isFinite(Number(s)))?n.map(s=>Number(s)):e}valueRequest(e){return{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:e})}}async setClass(e){await this.requestSchema("/api/lockbox/class",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({classname:e})})}async requestSchema(e,n){const s=await fetch(e,n);if(!s.ok)throw new Error(`Lockbox request failed: ${s.status}`);await this.applySchema(await s.json())}async refreshInputPlot(){const e=this.schema?.inputs.find(i=>i.name===this.elements.inputPlotSelect.value)??this.schema?.inputs[0];if(!e)return;const n=await fetch(`/api/lockbox/inputs/${encodeURIComponent(e.name)}/plot`);if(!n.ok)return;const s=await n.json();this.drawInputPlot(this.elements.inputPlot,"Expected Signal",s)}async refreshOutputPlot(){const e=this.schema?.outputs.find(i=>i.name===this.elements.outputPlotSelect.value)??this.schema?.outputs[0];if(!e)return;const n=await fetch(`/api/lockbox/outputs/${encodeURIComponent(e.name)}/transfer_function`);if(!n.ok)return;const s=await n.json();this.drawOutputPlot(this.elements.outputPlot,s)}drawInputPlot(e,n,s){this.inputPlot?.destroy(),e.textContent="";const i=this.plotSize(e),a=new Te({title:n,width:i.width,height:i.height,scales:{x:{time:!1}},series:[{},...s.series.map((o,l)=>({label:o.label,stroke:l===0?je.green:je.blue,width:2}))],axes:[mt(),mt()]},[s.x,...s.series.map(o=>o.values)],e);this.inputPlot=a}drawOutputPlot(e,n){this.outputMagnitudePlot?.destroy(),this.outputPhasePlot?.destroy(),e.textContent="";const s=document.createElement("div"),i=document.createElement("div");s.className="lockbox-output-plot-frame",i.className="lockbox-output-plot-frame",e.append(s,i);const a=n.series.find(l=>l.label==="magnitude")?.values??[],o=n.series.find(l=>l.label==="phase")?.values??[];this.outputMagnitudePlot=new Te({title:"Open-loop magnitude",...this.outputPlotOptions(this.plotSize(s),!0),series:[{},{label:"magnitude",stroke:je.green,width:2}]},[n.x,a.map(l=>Math.max(1e-30,l))],s),this.outputPhasePlot=new Te({title:"Open-loop phase",...this.outputPlotOptions(this.plotSize(i),!1),series:[{},{label:"phase",stroke:je.blue,width:2}]},[n.x,o],i)}outputPlotOptions(e,n){return{width:e.width,height:e.height,scales:{x:{time:!1,distr:3},y:n?{distr:3}:{auto:!0}},axes:[mt(),mt()]}}plotSize(e){const n=e.getBoundingClientRect();return{width:Math.max(260,Math.floor(n.width||420)),height:Math.max(180,Math.floor(n.height||220))}}setStatus(e){this.elements.status.textContent=e}}var Ft=typeof window<"u"?window:null,or=Ft===null,Ti=or?void 0:Ft.document,Vt="addEventListener",Yt="removeEventListener",co="getBoundingClientRect",yi="_a",qt="_b",dn="_c",ea="horizontal",Ht=function(){return!1},Rf=or?"calc":["","-webkit-","-moz-","-o-"].filter(function(t){var e=Ti.createElement("div");return e.style.cssText="width:"+t+"calc(9px)",!!e.style.length}).shift()+"calc",su=function(t){return typeof t=="string"||t instanceof String},Ql=function(t){if(su(t)){var e=Ti.querySelector(t);if(!e)throw new Error("Selector "+t+" did not match a DOM element");return e}return t},at=function(t,e,n){var s=t[e];return s!==void 0?s:n},ta=function(t,e,n,s){if(e){if(s==="end")return 0;if(s==="center")return t/2}else if(n){if(s==="start")return 0;if(s==="center")return t/2}return t},Of=function(t,e){var n=Ti.createElement("div");return n.className="gutter gutter-"+e,n},Df=function(t,e,n){var s={};return su(e)?s[t]=e:s[t]=Rf+"("+e+"% - "+n+"px)",s},Bf=function(t,e){var n;return n={},n[t]=e+"px",n},Ri=function(t,e){if(e===void 0&&(e={}),or)return{};var n=t,s,i,a,o,l,u;Array.from&&(n=Array.from(n));var d=Ql(n[0]),v=d.parentNode,f=getComputedStyle?getComputedStyle(v):null,m=f?f.flexDirection:null,y=at(e,"sizes")||n.map(function(){return 100/n.length}),k=at(e,"minSize",100),F=Array.isArray(k)?k:n.map(function(){return k}),_=at(e,"maxSize",1/0),P=Array.isArray(_)?_:n.map(function(){return _}),M=at(e,"expandToMin",!1),$=at(e,"gutterSize",10),z=at(e,"gutterAlign","center"),K=at(e,"snapOffset",30),R=Array.isArray(K)?K:n.map(function(){return K}),ee=at(e,"dragInterval",1),W=at(e,"direction",ea),se=at(e,"cursor",W===ea?"col-resize":"row-resize"),J=at(e,"gutter",Of),L=at(e,"elementStyle",Df),te=at(e,"gutterStyle",Bf);W===ea?(s="width",i="clientX",a="left",o="right",l="clientWidth"):W==="vertical"&&(s="height",i="clientY",a="top",o="bottom",l="clientHeight");function B(T,S,C,V){var ke=L(s,S,C,V);Object.keys(ke).forEach(function(ue){T.style[ue]=ke[ue]})}function Z(T,S,C){var V=te(s,S,C);Object.keys(V).forEach(function(ke){T.style[ke]=V[ke]})}function Y(){return u.map(function(T){return T.size})}function oe(T){return"touches"in T?T.touches[0][i]:T[i]}function H(T){var S=u[this.a],C=u[this.b],V=S.size+C.size;S.size=T/this.size*V,C.size=V-T/this.size*V,B(S.element,S.size,this[qt],S.i),B(C.element,C.size,this[dn],C.i)}function st(T){var S,C=u[this.a],V=u[this.b];this.dragging&&(S=oe(T)-this.start+(this[qt]-this.dragOffset),ee>1&&(S=Math.round(S/ee)*ee),S<=C.minSize+C.snapOffset+this[qt]?S=C.minSize+this[qt]:S>=this.size-(V.minSize+V.snapOffset+this[dn])&&(S=this.size-(V.minSize+this[dn])),S>=C.maxSize-C.snapOffset+this[qt]?S=C.maxSize+this[qt]:S<=this.size-(V.maxSize-V.snapOffset+this[dn])&&(S=this.size-(V.maxSize+this[dn])),H.call(this,S),at(e,"onDrag",Ht)(Y()))}function we(){var T=u[this.a].element,S=u[this.b].element,C=T[co](),V=S[co]();this.size=C[s]+V[s]+this[qt]+this[dn],this.start=C[a],this.end=C[o]}function ce(T){if(!getComputedStyle)return null;var S=getComputedStyle(T);if(!S)return null;var C=T[l];return C===0?null:(W===ea?C-=parseFloat(S.paddingLeft)+parseFloat(S.paddingRight):C-=parseFloat(S.paddingTop)+parseFloat(S.paddingBottom),C)}function me(T){var S=ce(v);if(S===null||F.reduce(function(ue,$e){return ue+$e},0)>S)return T;var C=0,V=[],ke=T.map(function(ue,$e){var pt=S*ue/100,$t=ta($,$e===0,$e===T.length-1,z),Qt=F[$e]+$t;return pt<Qt?(C+=Qt-pt,V.push(0),Qt):(V.push(pt-Qt),pt)});return C===0?T:ke.map(function(ue,$e){var pt=ue;if(C>0&&V[$e]-C>0){var $t=Math.min(C,V[$e]-C);C-=$t,pt=ue-$t}return pt/S*100})}function ie(){var T=this,S=u[T.a].element,C=u[T.b].element;T.dragging&&at(e,"onDragEnd",Ht)(Y()),T.dragging=!1,Ft[Yt]("mouseup",T.stop),Ft[Yt]("touchend",T.stop),Ft[Yt]("touchcancel",T.stop),Ft[Yt]("mousemove",T.move),Ft[Yt]("touchmove",T.move),T.stop=null,T.move=null,S[Yt]("selectstart",Ht),S[Yt]("dragstart",Ht),C[Yt]("selectstart",Ht),C[Yt]("dragstart",Ht),S.style.userSelect="",S.style.webkitUserSelect="",S.style.MozUserSelect="",S.style.pointerEvents="",C.style.userSelect="",C.style.webkitUserSelect="",C.style.MozUserSelect="",C.style.pointerEvents="",T.gutter.style.cursor="",T.parent.style.cursor="",Ti.body.style.cursor=""}function q(T){if(!("button"in T&&T.button!==0)){var S=this,C=u[S.a].element,V=u[S.b].element;S.dragging||at(e,"onDragStart",Ht)(Y()),T.preventDefault(),S.dragging=!0,S.move=st.bind(S),S.stop=ie.bind(S),Ft[Vt]("mouseup",S.stop),Ft[Vt]("touchend",S.stop),Ft[Vt]("touchcancel",S.stop),Ft[Vt]("mousemove",S.move),Ft[Vt]("touchmove",S.move),C[Vt]("selectstart",Ht),C[Vt]("dragstart",Ht),V[Vt]("selectstart",Ht),V[Vt]("dragstart",Ht),C.style.userSelect="none",C.style.webkitUserSelect="none",C.style.MozUserSelect="none",C.style.pointerEvents="none",V.style.userSelect="none",V.style.webkitUserSelect="none",V.style.MozUserSelect="none",V.style.pointerEvents="none",S.gutter.style.cursor=se,S.parent.style.cursor=se,Ti.body.style.cursor=se,we.call(S),S.dragOffset=oe(T)-S.end}}y=me(y);var Se=[];u=n.map(function(T,S){var C={element:Ql(T),size:y[S],minSize:F[S],maxSize:P[S],snapOffset:R[S],i:S},V;if(S>0&&(V={a:S-1,b:S,dragging:!1,direction:W,parent:v},V[qt]=ta($,S-1===0,!1,z),V[dn]=ta($,!1,S===n.length-1,z),m==="row-reverse"||m==="column-reverse")){var ke=V.a;V.a=V.b,V.b=ke}if(S>0){var ue=J(S,W,C.element);Z(ue,$,S),V[yi]=q.bind(V),ue[Vt]("mousedown",V[yi]),ue[Vt]("touchstart",V[yi]),v.insertBefore(ue,C.element),V.gutter=ue}return B(C.element,C.size,ta($,S===0,S===n.length-1,z),S),S>0&&Se.push(V),C});function Ue(T){var S=T.i===Se.length,C=S?Se[T.i-1]:Se[T.i];we.call(C);var V=S?C.size-T.minSize-C[dn]:T.minSize+C[qt];H.call(C,V)}u.forEach(function(T){var S=T.element[co]()[s];S<T.minSize&&(M?Ue(T):T.minSize=S)});function Ce(T){var S=me(T);S.forEach(function(C,V){if(V>0){var ke=Se[V-1],ue=u[ke.a],$e=u[ke.b];ue.size=S[V-1],$e.size=C,B(ue.element,ue.size,ke[qt],ue.i),B($e.element,$e.size,ke[dn],$e.i)}})}function he(T,S){Se.forEach(function(C){if(S!==!0?C.parent.removeChild(C.gutter):(C.gutter[Yt]("mousedown",C[yi]),C.gutter[Yt]("touchstart",C[yi])),T!==!0){var V=L(s,C.a.size,C[qt]);Object.keys(V).forEach(function(ke){u[C.a].element.style[ke]="",u[C.b].element.style[ke]=""})}})}return{setSizes:Ce,getSizes:Y,collapse:function(S){Ue(u[S])},destroy:he,parent:v,pairs:Se}};class Vf{constructor(e,n,s,i,a,o,l,u,d){this.controlsHost=e,this.magnitudeHost=n,this.phaseHost=s,this.status=i,this.singleButton=a,this.runButton=o,this.stopButton=l,this.saveButton=u,this.resetButton=d,this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.magnitudeHost.parentElement??this.magnitudeHost),this.resizeObserver.observe(this.phaseHost.parentElement??this.phaseHost);const v=this.controlsHost.parentElement,f=this.magnitudeHost.closest(".network-plots");if(!v||!f)throw new Error("Network analyzer split panes are missing");this.controlsPane=v,this.plotsPane=f,this.bindActions(),this.scheduleResize()}controlsHost;magnitudeHost;phaseHost;status;singleButton;runButton;stopButton;saveButton;resetButton;magnitudePlot;phasePlot;socket=null;runId=-1;x=[];magnitude=[];phase=[];real=[];imaginary=[];redrawFrame=null;resizeFrame=null;userScaled=!1;logscale=!0;lastProgress="";resizeObserver;split=null;controlsPane;plotsPane;async initialize(){const[e,n]=await Promise.all([fetch("/api/modules/networkanalyzer/attributes"),fetch("/api/modules/networkanalyzer")]);if(!e.ok||!n.ok)throw new Error("Network analyzer controls failed to load");const s=await e.json(),i=await n.json();this.renderControls(s.attributes??[]),this.applyState(i.state??i)}applyState(e){const n=String(e.running_state??"stopped")!=="stopped";this.runButton.textContent=n?"Running":"Continuous",this.runButton.disabled=n,this.stopButton.disabled=!n;const s=typeof e.iq_module=="string"?` on ${e.iq_module}`:"",i=`${String(e.running_state??"stopped")}${s}`;this.status.textContent=!n&&this.lastProgress?`${this.lastProgress}, ${i}`:i}refreshLayout(){this.ensureSplit(),this.scheduleResize()}destroy(){this.closeSocket(),this.resizeObserver.disconnect(),this.split?.destroy(),this.magnitudePlot.destroy(),this.phasePlot.destroy()}bindActions(){this.singleButton.addEventListener("click",()=>{this.start("single")}),this.runButton.addEventListener("click",()=>{this.start("continuous")}),this.stopButton.addEventListener("click",()=>{this.stop()}),this.saveButton.addEventListener("click",()=>{this.persistCurve().then(()=>{this.downloadCsv(),this.status.textContent="Curve saved"}).catch(e=>{this.status.textContent=e.message})}),this.resetButton.addEventListener("click",()=>this.resetZoom())}ensureSplit(){this.split||this.controlsPane.closest(".workspace-panel")?.hidden||(this.split=Ri([this.controlsPane,this.plotsPane],{direction:"vertical",sizes:[34,66],minSize:[100,240],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}async start(e){const n=await fetch(`/api/modules/networkanalyzer/actions/${e}`,{method:"POST"});if(!n.ok){this.status.textContent=`Network analyzer ${e} failed: ${n.status}`;return}const s=await n.json();this.applyState(s.state??{}),this.connectSocket()}async stop(){const e=await fetch("/api/modules/networkanalyzer/actions/stop",{method:"POST"});if(e.ok){const n=await e.json();this.applyState(n.state??{})}this.closeSocket()}connectSocket(){if(this.socket&&this.socket.readyState<=WebSocket.OPEN)return;const e=window.location.protocol==="https:"?"wss":"ws";this.socket=new WebSocket(`${e}://${window.location.host}/ws/networkanalyzer`),this.socket.addEventListener("message",n=>this.showPoint(JSON.parse(String(n.data)))),this.socket.addEventListener("close",()=>{this.socket=null})}closeSocket(){this.socket?.close(),this.socket=null}showPoint(e){e.run_id!==this.runId&&(this.runId=e.run_id,this.x=new Array(e.points).fill(Number.NaN),this.magnitude=new Array(e.points).fill(Number.NaN),this.phase=new Array(e.points).fill(Number.NaN),this.real=new Array(e.points).fill(Number.NaN),this.imaginary=new Array(e.points).fill(Number.NaN),this.userScaled=!1),this.x[e.index]=e.x;const n=Math.hypot(e.real,e.imag);this.magnitude[e.index]=20*Math.log10(Math.max(n,1e-20)),this.phase[e.index]=Math.atan2(e.imag,e.real)*180/Math.PI,this.real[e.index]=e.real,this.imaginary[e.index]=e.imag,this.logscale!==e.logscale&&(this.logscale=e.logscale,this.recreatePlots()),this.scheduleRedraw();const s=e.time_per_point>0?`${Yf(e.time_per_point*1e3)} ms/point`:"";this.lastProgress=`${e.index+1}/${e.points}, average ${e.current_avg}${s?`, ${s}`:""}`,this.status.textContent=this.lastProgress,e.running_state==="stopped"&&(this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0)}renderControls(e){this.controlsHost.textContent="";const n=[["Channels",["input","output_direct"]],["Frequency",["start_freq","stop_freq","points","logscale"]],["Setup",["amplitude","acbandwidth"]],["Averaging",["average_per_point","rbw","trace_average","curve_name"]],["Auto Bandwidth",["auto_bandwidth","q_factor_min"]],["Auto Amplitude",["auto_amplitude","target_dbv","auto_amp_min","auto_amp_max"]]],s=new Map(e.map(i=>[i.name,i]));for(const[i,a]of n){const o=document.createElement("fieldset");o.className="network-control-group";const l=document.createElement("legend");l.textContent=i,o.appendChild(l);for(const u of a){const d=s.get(u);d&&o.appendChild(this.createControl(d))}this.controlsHost.appendChild(o)}}createControl(e){const n=document.createElement("label"),s=document.createElement("span");s.textContent=e.label,n.appendChild(s);let i;if(e.type==="select"){const a=document.createElement("select");for(const o of e.options??[]){const l=document.createElement("option");l.value=String(o),l.textContent=String(o),a.appendChild(l)}a.value=String(e.value),i=a}else{const a=document.createElement("input");a.type=e.type==="bool"?"checkbox":e.type,a.type==="checkbox"?a.checked=!!e.value:a.value=String(e.value),e.min!==void 0&&(a.min=String(e.min)),e.max!==void 0&&(a.max=String(e.max)),e.step!==void 0&&(a.step=String(e.step)),i=a}return i.id=`networkanalyzer-${e.name.replaceAll("_","-")}`,i.addEventListener("change",()=>{this.writeAttribute(e,i)}),n.appendChild(i),n}async writeAttribute(e,n){const s=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:e.type==="number"?Number(n.value):n.value,i=await fetch(`/api/modules/networkanalyzer/attributes/${e.name}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:s})});if(!i.ok){this.status.textContent=`${e.label} update failed: ${i.status}`;return}this.closeSocket(),this.runButton.disabled=!1,this.stopButton.disabled=!0,this.status.textContent=`${e.label} updated`}createPlot(e,n,s,i){return new Te({width:800,height:260,title:n,scales:{x:{time:!1,distr:this.logscale?3:1},y:{auto:!0}},axes:[mt({label:i?"Frequency (Hz)":""}),mt({label:s})],series:[{},{label:n,stroke:je.yellow,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}},hooks:{setScale:[(a,o)=>{(o==="x"||o==="y")&&(this.userScaled=!0)}]}},[[],[]],e)}recreatePlots(){this.magnitudePlot.destroy(),this.phasePlot.destroy(),this.magnitudePlot=this.createPlot(this.magnitudeHost,"Magnitude (dB)","dB",!0),this.phasePlot=this.createPlot(this.phaseHost,"Phase (deg)","deg",!1),this.scheduleResize()}scheduleRedraw(){this.redrawFrame===null&&(this.redrawFrame=requestAnimationFrame(()=>{this.redrawFrame=null;const e=ec(this.x);this.magnitudePlot.setData([this.x.slice(0,e),this.magnitude.slice(0,e)]),this.phasePlot.setData([this.x.slice(0,e),this.phase.slice(0,e)])}))}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null,this.resizePlot(this.magnitudePlot,this.magnitudeHost),this.resizePlot(this.phasePlot,this.phaseHost)}))}resizePlot(e,n){const s=n.parentElement?.getBoundingClientRect();!s||s.width<100||s.height<100||e.setSize({width:Math.floor(s.width),height:Math.floor(s.height)})}resetZoom(){this.userScaled=!1;const e=uo(this.x,0,1),n=uo(this.magnitude,-120,20),s=uo(this.phase,-180,180);this.magnitudePlot.setScale("x",e),this.magnitudePlot.setScale("y",n),this.phasePlot.setScale("x",e),this.phasePlot.setScale("y",s)}downloadCsv(){const e=["x,magnitude_db,phase_deg"];for(let i=0;i<this.x.length;i+=1)Number.isFinite(this.x[i])&&e.push(`${this.x[i]},${this.magnitude[i]},${this.phase[i]}`);const n=URL.createObjectURL(new Blob([`${e.join(`
`)}
`],{type:"text/csv"})),s=document.createElement("a");s.href=n,s.download=`network-analyzer-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`,s.click(),URL.revokeObjectURL(n)}async persistCurve(){const e=ec(this.x);if(e===0)throw new Error("No network analyzer curve to save");const n=this.controlsHost.querySelector("#networkanalyzer-curve-name"),s=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:this.x.slice(0,e),y:this.real.slice(0,e),y_imag:this.imaginary.slice(0,e),params:{...this.currentControlParameters(),name:n?.value||"networkanalyzer curve",module:"networkanalyzer"}})});if(!s.ok)throw new Error(`Save curve failed: ${s.status}`)}currentControlParameters(){const e={};for(const n of this.controlsHost.querySelectorAll("input, select")){const s=n.id.replace(/^networkanalyzer-/,"").replaceAll("-","_");e[s]=n instanceof HTMLInputElement&&n.type==="checkbox"?n.checked:n instanceof HTMLInputElement&&n.type==="number"?Number(n.value):n.value}return e}}function Yf(t){return t>=100?t.toFixed(0):t>=10?t.toFixed(1):t.toFixed(2)}function uo(t,e,n){const s=t.filter(Number.isFinite);if(s.length===0)return{min:e,max:n};const i=Math.min(...s),a=Math.max(...s);if(i===a)return{min:i-1,max:a+1};const o=(a-i)*.04;return{min:i-o,max:a+o}}function ec(t){let e=0;for(;e<t.length&&Number.isFinite(t[e]);)e+=1;return e}class qf{constructor(e,n,s,i,a,o,l,u,d,v,f){this.root=e,this.listPane=n,this.plotPane=s,this.paramsPane=i,this.select=a,this.name=o,this.params=l,this.status=u,this.saveParamsButton=d,this.deleteButton=v,this.refreshButton=f;const m=this.requireHost("#curve-viewer-magnitude"),y=this.requireHost("#curve-viewer-phase");this.magnitudePlot=this.createPlot(m,"Curve","Value"),this.phasePlot=this.createPlot(y,"Phase","deg"),this.resizeObserver=new ResizeObserver(()=>this.scheduleResize()),this.resizeObserver.observe(this.plotPane),this.bindActions()}root;listPane;plotPane;paramsPane;select;name;params;status;saveParamsButton;deleteButton;refreshButton;magnitudePlot;phasePlot;split=null;resizeObserver;resizeFrame=null;selected=null;async load(){await this.refreshList()}refreshLayout(){this.ensureSplit(),this.scheduleResize()}bindActions(){this.select.addEventListener("change",()=>{this.loadSelected()}),this.refreshButton.addEventListener("click",()=>{this.refreshList()}),this.saveParamsButton.addEventListener("click",()=>{this.saveParams()}),this.deleteButton.addEventListener("click",()=>{this.deleteSelected()})}async refreshList(){const e=this.select.value,n=await fetch("/api/curves?limit=100");if(!n.ok)throw new Error(`Curve list failed: ${n.status}`);const i=(await n.json()).curves??[];this.select.textContent="";for(const a of i){const o=document.createElement("option");o.value=String(a.pk),o.textContent=`${a.pk}: ${a.name}`,this.select.appendChild(o)}i.some(a=>String(a.pk)===e)?this.select.value=e:i[0]&&(this.select.value=String(i[0].pk)),this.status.textContent=`${i.length} curve${i.length===1?"":"s"}`,i.length?await this.loadSelected():this.clear()}async loadSelected(){if(!this.select.value)return this.clear();const e=await fetch(`/api/curves/${encodeURIComponent(this.select.value)}`);if(!e.ok)throw new Error(`Curve load failed: ${e.status}`);const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.saveParamsButton.disabled=!1,this.deleteButton.disabled=!1;const s=Array.isArray(this.selected.y_imag),i=s?this.selected.y.map((l,u)=>20*Math.log10(Math.max(Math.hypot(l,this.selected.y_imag[u]),1e-20))):this.selected.y,a=s?this.selected.y.map((l,u)=>Math.atan2(this.selected.y_imag[u],l)*180/Math.PI):[];this.magnitudePlot.setData([this.selected.x,i]),this.phasePlot.setData([s?this.selected.x:[],a]);const o=this.phasePlot.root.closest(".curve-viewer-plot-frame");o&&(o.hidden=!s),this.plotPane.classList.toggle("is-complex",s),this.status.textContent=`curve ${this.selected.pk}, ${this.selected.points} points`,this.scheduleResize()}async saveParams(){if(!this.selected)return;const e=await fetch(`/api/curves/${this.selected.pk}/params`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({params_yaml:this.params.value})});if(!e.ok){const s=await e.json().catch(()=>({}));this.status.textContent=s.detail??`Save parameters failed: ${e.status}`;return}const n=await e.json();this.selected=n.curve,this.name.value=this.selected.name,this.params.value=this.selected.params_yaml,this.status.textContent=`curve ${this.selected.pk} parameters saved`,await this.refreshList()}async deleteSelected(){if(!this.selected)return;const e=this.selected.pk,n=await fetch(`/api/curves/${e}`,{method:"DELETE"});if(!n.ok){this.status.textContent=`Delete curve failed: ${n.status}`;return}this.selected=null,await this.refreshList(),this.status.textContent=`curve ${e} deleted`}clear(){this.selected=null,this.name.value="",this.params.value="",this.magnitudePlot.setData([[],[]]),this.phasePlot.setData([[],[]]),this.saveParamsButton.disabled=!0,this.deleteButton.disabled=!0}ensureSplit(){this.split||this.root.hidden||(this.split=Ri([this.listPane,this.plotPane,this.paramsPane],{direction:"horizontal",sizes:[18,57,25],minSize:[140,300,200],gutterSize:8,onDrag:()=>this.scheduleResize(),onDragEnd:()=>this.scheduleResize()}))}createPlot(e,n,s){return new Te({width:700,height:260,title:n,scales:{x:{time:!1},y:{auto:!0}},axes:[mt({label:"X"}),mt({label:s})],series:[{},{label:n,stroke:je.green,width:1.5}],cursor:{drag:{x:!0,y:!0,setScale:!0}}},[[],[]],e)}scheduleResize(){this.resizeFrame===null&&(this.resizeFrame=requestAnimationFrame(()=>{this.resizeFrame=null;const e=this.plotPane.querySelectorAll(".curve-viewer-plot-frame:not([hidden])"),n=[this.magnitudePlot,this.phasePlot];e.forEach((s,i)=>{const a=s.getBoundingClientRect();a.width>100&&a.height>80&&n[i].setSize({width:Math.floor(a.width),height:Math.floor(a.height)})})}))}requireHost(e){const n=this.root.querySelector(e);if(!n)throw new Error(`Missing curve viewer element ${e}`);return n}}class Hf{constructor(e){this.elements=e,e.module.addEventListener("change",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.refresh.addEventListener("click",()=>{this.load(e.module.value).catch(n=>this.setStatus(n.message))}),e.save.addEventListener("click",()=>{this.save().catch(n=>this.setStatus(n.message))})}elements;schema=null;async load(e=this.schema?.module??"pyrpl"){const n=await fetch(`/api/config?module=${encodeURIComponent(e)}`);if(!n.ok)throw new Error(await tc(n,"Configuration unavailable"));this.apply(await n.json()),this.setStatus(`Loaded ${this.schema?.module}`)}async save(){const e=this.elements.module.value,n=await fetch(`/api/config/branches/${encodeURIComponent(e)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text:this.elements.text.value})});if(!n.ok)throw new Error(await tc(n,"Configuration save failed"));this.apply(await n.json()),this.setStatus(`Saved ${e}`)}getModule(){return this.elements.module.value}getText(){return this.elements.text.value}apply(e){this.schema=e,this.elements.file.textContent=e.configfile,this.elements.module.textContent="";for(const n of e.modules){const s=document.createElement("option");s.value=n,s.textContent=n,this.elements.module.appendChild(s)}this.elements.module.value=e.module,this.elements.text.value=e.text,this.elements.module.disabled=!1,this.elements.text.disabled=!1,this.elements.refresh.disabled=!1,this.elements.save.disabled=!1}setStatus(e){this.elements.status.textContent=e}}async function tc(t,e){try{return(await t.json()).detail??`${e}: ${t.status}`}catch{return`${e}: ${t.status}`}}const Xn=[{id:"scope",title:"Scope",description:"Oscilloscope controls and live waveform",defaultEnabled:!0,defaultSplitSizes:[28,72]},{id:"asg",title:"ASG",description:"Arbitrary signal generator controls",defaultEnabled:!1},{id:"pid",title:"PID",description:"PID controller controls",defaultEnabled:!1},{id:"iq",title:"IQ",description:"IQ modulator and demodulator controls",defaultEnabled:!1},{id:"iir",title:"IIR",description:"Infinite impulse response filter controls",defaultEnabled:!1},{id:"trig",title:"Trigger",description:"DSP trigger controls",defaultEnabled:!1},{id:"pwm",title:"PWM",description:"Auxiliary PWM routing controls",defaultEnabled:!1},{id:"spectrumanalyzer",title:"Spectrum Analyzer",description:"FFT spectrum analyzer controls and plot",defaultEnabled:!1,defaultSplitSizes:[35,65]},{id:"networkanalyzer",title:"Network Analyzer",description:"Coherent swept-frequency response measurement",defaultEnabled:!1,defaultSplitSizes:[34,66]},{id:"curveviewer",title:"Curve Viewer",description:"Browse and manage saved PyRPL curves",defaultEnabled:!1},{id:"pyrplconfig",title:"Configuration",description:"Edit PyRPL YAML configuration branches",defaultEnabled:!1},{id:"lockbox",title:"Lockbox",description:"Model-based lock sequence controls",defaultEnabled:!1},{id:"housekeeping",title:"Housekeeping",description:"LED and expansion connector I/O",defaultEnabled:!1},{id:"telemetry",title:"Sampler & AMS",description:"DSP signal readback, statistics, and AMS DAC controls",defaultEnabled:!1},{id:"registers",title:"Register Debug",description:"Raw monitor_server register read/write",defaultEnabled:!1}];function jf(t){const e=Xn.find(n=>n.id===t);if(!e)throw new Error(`Unknown panel ${t}`);return e}function Po(t){const e=t.trim();if(!e)throw new Error("Register value is empty");const n=Number(e);if(!Number.isInteger(n)||n<0)throw new Error(`Invalid register integer: ${t}`);return n}function Xf(t){const e=t.split(/[\s,]+/).map(n=>n.trim()).filter(Boolean).map(Po);if(e.length===0)throw new Error("At least one register value is required");return e}function na(t){return`0x${(t>>>0).toString(16).padStart(8,"0")} (${t>>>0})`}async function nc(t,e,n){const s=await fetch(t,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(e)});if(!s.ok)throw new Error(`${n}: ${s.status}`);return await s.json()}function Uf(t){async function e(){const s=Po(t.readAddr.value),i=Math.max(1,Math.min(64,Number(t.readLength.value))),a=await nc("/api/register/read",{addr:s,length:i},"Register read failed");t.status.textContent=`read ${a.length} word${a.length===1?"":"s"}`,t.output.value=a.values.map((o,l)=>`${na(s+l*4)}: ${na(o)}`).join(`
`)}async function n(){const s=Po(t.writeAddr.value),i=Xf(t.writeValues.value),a=await nc("/api/register/write",{addr:s,values:i},"Register write failed");t.status.textContent=`wrote ${a.count} word${a.count===1?"":"s"}`,t.output.value=i.map((o,l)=>`${na(s+l*4)} <= ${na(o)}`).join(`
`)}return t.readButton.addEventListener("click",()=>{e().catch(s=>{t.status.textContent=s.message})}),t.writeButton.addEventListener("click",()=>{n().catch(s=>{t.status.textContent=s.message})}),{read:e,write:n}}const iu="pyrpl-websocket.workspace.v1",au="tabs",ou=[50,50];function zo(){const t=Object.fromEntries(Xn.map(e=>[e.id,{enabled:e.defaultEnabled,splitSizes:e.defaultSplitSizes}]));return{activePanelId:rr(t),layoutMode:au,workspaceSplitSizes:[...ou],panels:t}}function Wf(){let t=null;try{t=JSON.parse(window.localStorage.getItem(iu)??"")}catch{return zo()}return ru(t)}function ru(t){if(!t||typeof t!="object")return zo();const e=t,s={...zo().panels};for(const a of Xn){const o=e.panels?.[a.id];s[a.id]={enabled:typeof o?.enabled=="boolean"?o.enabled:s[a.id].enabled,splitSizes:a.defaultSplitSizes?uu(o?.splitSizes,a.defaultSplitSizes):void 0}}return{activePanelId:e.activePanelId&&s[e.activePanelId]?.enabled?e.activePanelId:rr(s),layoutMode:cu(e.layoutMode),workspaceSplitSizes:_o(e.workspaceSplitSizes,ou.length),panels:s}}function lu(t){window.localStorage.setItem(iu,JSON.stringify(t))}function rr(t){return Xn.find(e=>t[e.id]?.enabled)?.id??null}function cu(t){return t==="tabs"||t==="split-horizontal"||t==="split-vertical"?t:au}function uu(t,e=jf("scope").defaultSplitSizes??[28,72]){if(Array.isArray(t)&&t.length===2){const n=Number(t[0]),s=Number(t[1]);if(Number.isFinite(n)&&Number.isFinite(s)&&n>=15&&s>=35){const i=n+s;return[Math.round(n/i*1e3)/10,Math.round(s/i*1e3)/10]}}return[...e]}function _o(t,e){const n=Array.from({length:e},()=>Math.round(100/e*10)/10);if(!Array.isArray(t)||t.length!==e)return n;const s=t.map(Number);if(s.some(a=>!Number.isFinite(a)||a<10))return n;const i=s.reduce((a,o)=>a+o,0);return i<=0?n:s.map(a=>Math.round(a/i*1e3)/10)}function x(t){const e=document.querySelector(t);if(!e)throw new Error(`Missing UI element ${t}`);return e}const Gf=x("#app");Gf.innerHTML=`
  <section class="shell">
    <header class="topbar">
      <div>
        <h1>PyRPL WebSocket</h1>
        <p id="session-line">TypeScript oscilloscope frontend</p>
      </div>
      <nav class="menubar" aria-label="Workspace menu">
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
`;const pu=document.createElement("style");pu.textContent=`
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
	    .topbar,
      .menubar,
	    .module-panel,
	    .plot-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .actions button,
    .zoom-actions button {
      flex: 1 1 120px;
    }

    .menubar {
      margin-left: 0;
    }

    .menu-content {
      left: 0;
      right: auto;
    }

	    .zoom-actions {
	      width: 100%;
	    }
	
	    .module-panel {
	      display: grid;
	      grid-template-columns: 1fr;
	    }

      .signal-row,
      .tune-row,
      .register-row,
      .spectrum-content,
      .lockbox-grid,
      .lockbox-header-controls {
        grid-template-columns: 1fr;
      }
	
	    .module-panel output {
	      grid-column: 1 / -1;
	    }
	  }
`;document.head.appendChild(pu);const Kf=x("#scope-plot");x("#scope-panel-content");const lr=x("#scope-controls-pane"),hu=x("#scope-plot-pane");x("#spectrum-panel-content");const du=x("#spectrum-controls-pane"),fu=x("#spectrum-plot-pane"),po=x("#panel-menu"),sc=x("#workspace-tabs"),Zf=x("#workspace-panels"),mu=x("#scope-panel"),Jf=x("#asg-panel"),Qf=x("#pid-panel"),em=x("#iq-panel"),tm=x("#iir-panel"),nm=x("#trig-panel"),sm=x("#pwm-panel"),gu=x("#spectrumanalyzer-panel"),im=x("#networkanalyzer-panel"),vu=x("#curveviewer-panel"),am=x("#pyrplconfig-panel"),xu=x("#lockbox-panel"),om=x("#housekeeping-panel"),rm=x("#telemetry-panel"),lm=x("#registers-panel"),cr={scope:mu,asg:Jf,pid:Qf,iq:em,iir:tm,trig:nm,pwm:sm,spectrumanalyzer:gu,networkanalyzer:im,curveviewer:vu,pyrplconfig:am,lockbox:xu,housekeeping:om,telemetry:rm,registers:lm},cm=x("#empty-workspace"),Kt=x("#status"),ft=x("#connect-scope"),fn=x("#single-frame"),Mi=x("#stop-scope"),ur=x("#scope-current-average"),um=x("#save-curve"),hs=x("#scope-curve-name"),pm=x("#zoom-out"),hm=x("#zoom-in"),dm=x("#zoom-y-out"),fm=x("#zoom-y-in"),mm=x("#pan-left"),gm=x("#pan-right"),vm=x("#pan-up"),xm=x("#pan-down"),bm=x("#zoom-reset"),ln=x("#show-ch1"),cn=x("#show-ch2"),Js=x("#scope-input1"),Qs=x("#scope-input2"),Dn=x("#scope-trigger"),ym=x("#scope-trigger-mode"),Ni=x("#scope-trigger-normal"),Bn=x("#scope-trigger-rolling"),kn=x("#scope-duration"),ei=x("#scope-average"),ds=x("#scope-xy-mode"),fs=x("#scope-math-active"),Vn=x("#scope-math-formula"),Mn=x("#scope-trace-average"),Yn=x("#scope-trigger-delay"),qn=x("#scope-threshold"),Hn=x("#scope-hysteresis"),kt=x("#scope-state-select"),li=x("#scope-state-name"),bu=x("#scope-state-save"),yu=x("#scope-state-load"),wu=x("#scope-state-delete"),Lo=x("#register-status"),ae=x("#module-status"),jn=x("#hk-status"),wm=x("#telemetry-refresh"),ic=x("#sampler-grid"),Su=x("#sampler-status"),Fo=x("#sampler-stats-signal"),Sm=x("#sampler-stats-duration"),To=x("#sampler-stats-run"),No=x("#sampler-stats-output"),Ca=x("#ams-status"),Hs=[0,1,2,3].map(t=>x(`#ams-dac${t}`)),ho=new Map,ra=x("#hk-led"),km=x("#hk-refresh"),ac=x("#hk-expansion-grid"),Mm=x("#pid-modules"),Em=x("#iq-modules"),Cm=x("#iir-modules"),Am=x("#trig-modules"),Pm=x("#pwm-modules"),zm=x("#spectrum-modules"),_m=x("#spectrum-plot"),Jt=x("#spectrum-status"),mn=x("#spectrum-single"),St=x("#spectrum-run"),Ei=x("#spectrum-stop"),ku=x("#spectrum-current-average"),Lm=x("#spectrum-save-curve"),Ii=x("#spectrum-curve-name"),Fm=x("#spectrum-zoom-out"),Tm=x("#spectrum-zoom-in"),Nm=x("#spectrum-zoom-y-out"),Im=x("#spectrum-zoom-y-in"),$m=x("#spectrum-pan-left"),Rm=x("#spectrum-pan-right"),Om=x("#spectrum-pan-up"),Dm=x("#spectrum-pan-down"),Bm=x("#spectrum-zoom-reset"),ms=new Vf(x("#network-controls"),x("#network-magnitude-plot"),x("#network-phase-plot"),x("#network-status"),x("#network-single"),x("#network-run"),x("#network-stop"),x("#network-save"),x("#network-reset")),ti=new qf(vu,x(".curve-viewer-list-pane"),x(".curve-viewer-plot-pane"),x(".curve-viewer-params-pane"),x("#curve-viewer-select"),x("#curve-viewer-name"),x("#curve-viewer-params"),x("#curve-viewer-status"),x("#curve-viewer-save-params"),x("#curve-viewer-delete"),x("#curve-viewer-refresh")),En=new $f({root:xu,classSelect:x("#lockbox-class"),status:x("#lockbox-status"),actions:x("#lockbox-actions"),inputs:x("#lockbox-inputs"),outputs:x("#lockbox-outputs"),stages:x("#lockbox-stages"),addStage:x("#lockbox-add-stage"),inputPlot:x("#lockbox-input-plot"),outputPlot:x("#lockbox-output-plot"),inputPlotSelect:x("#lockbox-input-plot-select"),outputPlotSelect:x("#lockbox-output-plot-select")}),Vm=new Hf({file:x("#config-file"),module:x("#config-module"),text:x("#config-text"),refresh:x("#config-refresh"),save:x("#config-save"),status:x("#config-status")}),oc=x("#session-line");Uf({readAddr:x("#register-read-addr"),readLength:x("#register-read-length"),readButton:x("#register-read"),writeAddr:x("#register-write-addr"),writeValues:x("#register-write-values"),writeButton:x("#register-write"),status:Lo,output:x("#register-output")});const Mu=["asg0","asg1"],gs={asg0:rc("asg0"),asg1:rc("asg1")},Ym={pid:["pid0","pid1","pid2"],iq:["iq0","iq1","iq2"],iir:["iir"],trig:["trig"],pwm:["pwm0","pwm1"],spectrumanalyzer:["spectrumanalyzer"]},qm={pid:Mm,iq:Em,iir:Cm,trig:Am,pwm:Pm,spectrumanalyzer:zm},Cn=new Map,Hm=[Js,Qs,Dn,Ni,Bn,kn,ei,ds,fs,Vn,Mn,Yn,qn,Hn,kt,li,bu,yu,wu,hs];let U=new yf(Kf,t=>{Kt.textContent=t},t=>{ur.textContent=`${t} / ${Mn.value||"1"}`}),ye=new kf(_m,t=>{Jt.textContent=t},t=>{const e=Cn.get("spectrumanalyzer")?.inputs.get("trace_average");ku.textContent=`${t} / ${e?.value||"1"}`}),It=null,Ds=null,Eu=0,xn="stopped",ls="stopped",X=Wf(),Cu=null,la=null,ca=null,ua=null,Io=null,$o="";function ci(t){lu(t),fetch("/api/workspace",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({workspace:t})}).catch(()=>{})}async function jm(){const t=await fetch("/api/workspace");if(!t.ok)return;const e=await t.json();e.workspace&&typeof e.workspace=="object"?(X=ru(e.workspace),lu(X)):ci(X)}function Xm(){window.pyrplScope={getFrameSequence:()=>U.getFrameSequence(),getSampleCount:()=>U.getSampleCount(),getXRange:()=>U.getXRange(),getYRange:()=>U.getYRange(),getScopeTimeLabels:()=>U.getFormattedTimeLabelsForCurrentRange(),isChannelVisible:t=>U.getChannelVisible(t),getEventCount:()=>Eu,getTraceAverage:()=>U.getTraceAverage(),getRunningState:()=>xn,isPanelEnabled:t=>X.panels[t]?.enabled??!1,getScopeSplitSizes:()=>X.panels.scope.splitSizes??[28,72],getWorkspaceLayoutMode:()=>X.layoutMode,getWorkspaceSplitSizes:()=>X.workspaceSplitSizes,getActivePanelId:()=>X.activePanelId,getCsvLineCount:()=>U.exportCsv().trimEnd().split(`
`).length,getDisplayedStats:()=>U.getDisplayedStats(),getDisplayedDataFingerprint:()=>U.getDisplayedDataFingerprint(),getScopeMathStats:()=>U.getMathStats(),getScopeXyStats:()=>U.getXyStats(),moduleStatusText:()=>ae.textContent??"",statusText:()=>Kt.textContent??"",getSpectrumSeriesCount:()=>ye.getSeriesCount(),getSpectrumAverageCount:()=>ye.getAverageCount(),getSpectrumXRange:()=>ye.getXRange(),getSpectrumYRange:()=>ye.getYRange(),getIirXRange:()=>It?.getXRange()??null,getIirMagnitudeYRange:()=>It?.getMagnitudeYRange()??null,getIirPhaseYRange:()=>It?.getPhaseYRange()??null,getLockboxClassname:()=>En.getClassname(),getLockboxStageCount:()=>En.getStageCount()}}function Tn(t,e){return`#${t}-${e.replaceAll("_","-")}`}function rc(t){return{status:x(`#${t}-status`),waveform:x(Tn(t,"waveform")),frequency:x(Tn(t,"frequency")),amplitude:x(Tn(t,"amplitude")),offset:x(Tn(t,"offset")),triggerSource:x(Tn(t,"trigger_source")),outputDirect:x(Tn(t,"output_direct")),startPhase:x(Tn(t,"start_phase")),cyclesPerBurst:x(Tn(t,"cycles_per_burst")),setup:x(`#${t}-setup`),trigger:x(`#${t}-trigger`),off:x(`#${t}-off`)}}function Aa(){Wm(),Gm();const t=Um(),e=X.layoutMode!=="tabs"&&t.length>1,n=e?t:X.activePanelId?[X.activePanelId]:[],s=new Set(n),i=t.length>0;Zf.className=`workspace-panels ${e?`is-split ${X.layoutMode==="split-horizontal"?"is-horizontal":"is-vertical"}`:"is-tabs"}`;for(const[a,o]of Object.entries(cr))o.hidden=!s.has(a);cm.hidden=i,e?eg(n):Au(),s.has("scope")?(Km(),window.requestAnimationFrame(()=>U.refreshLayout())):Zm(),s.has("spectrumanalyzer")?(Jm(),window.requestAnimationFrame(()=>ye.refreshLayout())):Qm(),s.has("lockbox")&&window.requestAnimationFrame(()=>En.refreshLayout()),s.has("networkanalyzer")&&window.requestAnimationFrame(()=>ms.refreshLayout()),s.has("curveviewer")&&window.requestAnimationFrame(()=>ti.refreshLayout())}function Um(){return Xn.filter(t=>X.panels[t.id]?.enabled).map(t=>t.id)}function Wm(){po.textContent="";for(const i of Xn){const a=document.createElement("label");a.className="menu-check";const o=document.createElement("input");o.id=`panel-${i.id}-enabled`,o.type="checkbox",o.checked=X.panels[i.id]?.enabled??!1,o.addEventListener("change",()=>{o.closest("details")?.removeAttribute("open"),tg(i.id,o.checked).catch(u=>{ae.textContent=u.message,Lo.textContent=u.message})});const l=document.createElement("span");l.textContent=i.title,a.append(o,l),po.appendChild(a)}const t=document.createElement("label");t.className="menu-field";const e=document.createElement("span");e.textContent="Layout";const n=document.createElement("select");n.id="workspace-layout-mode";const s=[["tabs","Tabs"],["split-horizontal","Side by Side"],["split-vertical","Stacked"]];for(const[i,a]of s){const o=document.createElement("option");o.value=i,o.textContent=a,n.appendChild(o)}n.value=X.layoutMode,n.addEventListener("change",()=>{sg(cu(n.value)).catch(i=>{ae.textContent=i.message,Lo.textContent=i.message})}),t.append(e,n),po.appendChild(t)}function Gm(){sc.textContent="";for(const t of Xn){if(!X.panels[t.id]?.enabled)continue;const e=document.createElement("button");e.className=`workspace-tab${X.activePanelId===t.id?" is-active":""}`,e.type="button",e.textContent=t.title,e.addEventListener("click",()=>{ng(t.id).catch(n=>{ae.textContent=n.message})}),sc.appendChild(e)}}function Km(){la||mu.hidden||(la=Ri([lr,hu],{direction:"vertical",sizes:X.panels.scope.splitSizes,minSize:[132,260],gutterSize:8,snapOffset:24,onDrag:()=>U.refreshLayout(),onDragEnd:t=>{X={...X,panels:{...X.panels,scope:{...X.panels.scope,splitSizes:uu(t)}}},ci(X),U.refreshLayout()}}))}function Zm(){la?.destroy(),la=null,lr.removeAttribute("style"),hu.removeAttribute("style")}function Jm(){ca||gu.hidden||(ca=Ri([du,fu],{direction:"vertical",sizes:[32,68],minSize:[96,220],gutterSize:8,snapOffset:16,elementStyle:(t,e)=>({height:`calc(${e}% - 4px)`}),gutterStyle:()=>({height:"8px"}),onDrag:()=>ye.refreshLayout(),onDragEnd:()=>ye.refreshLayout()}))}function Qm(){ca?.destroy(),ca=null,du.removeAttribute("style"),fu.removeAttribute("style")}function eg(t){const e=t.join("|");ua&&Io===X.layoutMode&&$o===e||(Au(),Io=X.layoutMode,$o=e,ua=Ri(t.map(n=>cr[n]),{direction:X.layoutMode==="split-horizontal"?"horizontal":"vertical",sizes:_o(X.workspaceSplitSizes,t.length),minSize:220,gutterSize:8,snapOffset:24,onDrag:()=>{U.refreshLayout(),ye.refreshLayout(),En.refreshLayout(),ms.refreshLayout(),ti.refreshLayout()},onDragEnd:n=>{X={...X,workspaceSplitSizes:_o(n,t.length)},ci(X),U.refreshLayout(),ye.refreshLayout(),En.refreshLayout(),ms.refreshLayout(),ti.refreshLayout()}}))}function Au(){ua?.destroy(),ua=null,Io=null,$o="";for(const t of Object.values(cr))t.removeAttribute("style")}async function tg(t,e){const n=X.panels[t],s={...X.panels,[t]:{...n,enabled:e}},i=e&&X.activePanelId===null?t:!e&&X.activePanelId===t?rr(s):X.activePanelId;if(X={...X,activePanelId:i,panels:s},ci(X),Aa(),t==="scope"&&!e){Pa("Scope panel disabled"),Zt("stop").catch(a=>{ae.textContent=a.message});return}t==="scope"&&e&&X.activePanelId==="scope"&&await Pu(),t==="spectrumanalyzer"&&!e&&(yn("Spectrum panel disabled"),bn("stop").catch(a=>{Jt.textContent=a.message}))}async function ng(t){X.panels[t]?.enabled&&(X={...X,activePanelId:t},ci(X),Aa(),t==="scope"&&window.requestAnimationFrame(()=>U.refreshLayout()),t==="spectrumanalyzer"&&window.requestAnimationFrame(()=>ye.refreshLayout()),t==="lockbox"&&window.requestAnimationFrame(()=>En.refreshLayout()),t==="networkanalyzer"&&window.requestAnimationFrame(()=>ms.refreshLayout()),t==="curveviewer"&&window.requestAnimationFrame(()=>ti.refreshLayout()))}async function sg(t){X={...X,layoutMode:t},ci(X),Aa(),X.panels.scope.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>U.refreshLayout()),X.panels.lockbox.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>En.refreshLayout()),X.panels.networkanalyzer.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>ms.refreshLayout()),X.panels.curveviewer.enabled&&t!=="tabs"&&window.requestAnimationFrame(()=>ti.refreshLayout())}async function Pu(){if(await Cg(),!X.panels.scope.enabled||X.activePanelId!=="scope"){Pa("Scope panel disabled");return}Cu?.fake&&(await Zt("continuous"),$i())}function pr(t){xn=t,zu(t)}function zu(t){const e=dr();t==="running_continuous"?(ft.textContent="Pause",ft.disabled=!1,fn.textContent="Run single",fn.disabled=!0,Mi.disabled=!1):t==="running_single"?(ft.textContent="Run continuous",ft.disabled=!0,fn.textContent="Pause",fn.disabled=!1,Mi.disabled=!1):t==="paused_single"||t==="paused_continuous"?(ft.textContent="Resume continuous",ft.disabled=!1,fn.textContent="Resume single",fn.disabled=e,Mi.disabled=!1):(ft.textContent="Run continuous",ft.disabled=!1,fn.textContent="Run single",fn.disabled=e,Mi.disabled=!0)}function ig(t){ls=t,t==="running_continuous"?(St.textContent="Pause",St.disabled=!1,mn.textContent="Run single",mn.disabled=!0,Ei.disabled=!1):t==="running_single"?(St.textContent="Run continuous",St.disabled=!0,mn.textContent="Pause",mn.disabled=!1,Ei.disabled=!1):t==="paused_single"||t==="paused_continuous"?(St.textContent="Resume continuous",St.disabled=!1,mn.textContent="Resume single",mn.disabled=!1,Ei.disabled=!1):(St.textContent="Run continuous",St.disabled=!1,mn.textContent="Run single",mn.disabled=!1,Ei.disabled=!0)}function $i(){ft.dataset.connected!=="true"&&(U.connect(),ft.dataset.connected="true")}function Pa(t="Disconnected"){U.close(),ft.dataset.connected="false",Kt.textContent=t}async function _u(){ft.dataset.connected==="true"&&(await Zt("stop"),Pa("Scope stopped: Spectrum owns the scope resource"))}async function Zt(t){const e=await fetch(`/api/modules/scope/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Scope action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return s.running_state&&pr(s.running_state),["single","continuous","resume_single","resume_continuous"].includes(t)&&U.reconnect(),ae.textContent=`${t}: ${s.running_state??"ok"}`,n}async function ag(){try{const e=await(await fetch("/api/session")).json(),n=e.fake?"fake hardware":e.settings.hostname;return oc.textContent=`Session: ${n} | reads ${e.reads} | writes ${e.writes}`,e.scope?.running_state&&pr(e.scope.running_state),{fake:!!e.fake}}catch{return oc.textContent="Session unavailable",null}}function Lu(t){return typeof t=="number"?t<.001?`${(t*1e6).toPrecision(4)} us`:t<1?`${(t*1e3).toPrecision(4)} ms`:`${t.toPrecision(4)} s`:t}function $n(t,e){return Array.isArray(e)?e.join(", "):typeof e=="boolean"?String(e):typeof e=="number"&&(t==="duration"||t==="trigger_delay")?Lu(e):typeof e=="number"?Number.isInteger(e)?String(e):String(Number(e.toPrecision(6))):e}function Rn(t,e){t.textContent="";for(const n of e.options??[]){const s=document.createElement("option");s.value=String(n),s.textContent=e.option_labels?.[String(n)]??Lu(n),t.appendChild(s)}t.value=String(e.value)}function hr(t,e){t==="input1"?Js.value=String(e):t==="input2"?Qs.value=String(e):t==="trigger_source"?(Dn.value=String(e),Ci()):t==="duration"?(kn.value=String(e),Ci(),pa()):t==="average"?ei.checked=!!e:t==="ch1_active"?(ln.checked=!!e,U.setChannelVisible(1,ln.checked)):t==="ch2_active"?(cn.checked=!!e,U.setChannelVisible(2,cn.checked)):t==="ch_math_active"?(fs.checked=!!e,cs()):t==="math_formula"?(document.activeElement!==Vn&&(Vn.value=String(e)),cs()):t==="xy_mode"?(ds.checked=!!e,cs()):t==="rolling_mode"?(Bn.checked=!!e,Ni.checked=!e,Ci(),pa()):t==="trace_average"?(Mn.value=String(e),U.setTraceAverage(Number(e)),ur.textContent=`0 / ${e}`):t==="trigger_delay"?(document.activeElement!==Yn&&(Yn.value=String(e)),Ci()):t==="threshold"?document.activeElement!==qn&&(qn.value=String(e)):t==="hysteresis"?document.activeElement!==Hn&&(Hn.value=String(e)):t==="curve_name"&&document.activeElement!==hs&&(hs.value=String(e))}function cs(){U.setDisplaySettings({xyMode:ds.checked,mathActive:fs.checked,mathFormula:Vn.value})}function dr(){return Bn.checked&&Number(kn.value)>.1}function pa(){const t=Number(kn.value)>.1;ym.disabled=!t;const e=dr();Dn.disabled=e,qn.disabled=e,Hn.disabled=e,zu(xn)}function Ci(){U.setTimeSettings({duration:Number(kn.value),triggerDelay:Number(Yn.value||0),triggerSource:Dn.value,rollingMode:dr()})}function Wt(t,e){t.value=String(e.value),e.min!==void 0&&(t.min=String(e.min)),e.max!==void 0&&(t.max=String(e.max)),e.step!==void 0&&(t.step=String(e.step))}function og(t){for(const[e,n]of Object.entries(t))n!=null&&hr(e,n);Fu(t)}function Fu(t){t.running_state&&pr(t.running_state),t.current_avg!==void 0&&(ur.textContent=`${t.current_avg} / ${Mn.value||"1"}`),"owner"in t&&rg(typeof t.owner=="string"?t.owner:null)}function rg(t){lr.classList.toggle("is-owned",t!==null);for(const e of Hm)e.disabled=t!==null;t===null&&pa(),t&&(ae.textContent=`scope occupied by ${t}`)}async function nt(t,e){const n=await Oi("scope",t,e);["input1","input2","duration","average","trigger_source","trigger_delay","threshold","hysteresis","rolling_mode"].includes(t)&&U.reconnect(),hr(t,n.value),ae.textContent=`${t} = ${$n(t,n.value)}`}async function Oi(t,e,n){const s=await fetch(`/api/modules/${t}/attributes/${e}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({value:n})});if(!s.ok)throw new Error(`Failed to set ${t}.${e}: ${s.status}`);return s.json()}async function lg(){const t=await fetch("/api/modules/scope/attributes");if(!t.ok)throw new Error(`Scope controls unavailable: ${t.status}`);const e=await t.json(),n=new Map(e.attributes.map(s=>[s.name,s]));Rn(Js,n.get("input1")),Rn(Qs,n.get("input2")),Rn(Dn,n.get("trigger_source")),Rn(kn,n.get("duration")),ei.checked=!!n.get("average")?.value,ln.checked=!!(n.get("ch1_active")?.value??!0),U.setChannelVisible(1,ln.checked),cn.checked=!!(n.get("ch2_active")?.value??!0),U.setChannelVisible(2,cn.checked),fs.checked=!!(n.get("ch_math_active")?.value??!1),Vn.value=String(n.get("math_formula")?.value??"ch1 * ch2"),ds.checked=!!(n.get("xy_mode")?.value??!1),Bn.checked=!!(n.get("rolling_mode")?.value??!0),Ni.checked=!Bn.checked,Wt(Mn,n.get("trace_average")),Wt(Yn,n.get("trigger_delay")),Wt(qn,n.get("threshold")),Wt(Hn,n.get("hysteresis")),hs.value=String(n.get("curve_name")?.value??"scope curve"),U.setTraceAverage(Number(Mn.value)),cs(),Ci(),pa(),ae.textContent="Scope controls ready"}async function cg(){await Promise.all(Mu.map(t=>ug(t)))}async function ug(t){const e=await fetch(`/api/modules/${t}/attributes`);if(!e.ok)throw new Error(`${t} controls unavailable: ${e.status}`);const n=await e.json(),s=new Map(n.attributes.map(a=>[a.name,a])),i=gs[t];Rn(i.waveform,s.get("waveform")),Wt(i.frequency,s.get("frequency")),Wt(i.amplitude,s.get("amplitude")),Wt(i.offset,s.get("offset")),Rn(i.triggerSource,s.get("trigger_source")),Rn(i.outputDirect,s.get("output_direct")),Wt(i.startPhase,s.get("start_phase")),Wt(i.cyclesPerBurst,s.get("cycles_per_burst")),i.status.textContent=`${t} controls ready`}function Tu(t,e){for(const[n,s]of Object.entries(e))Du(s)&&fr(t,n,s)}function fr(t,e,n){const s=gs[t];e==="waveform"?s.waveform.value=String(n):e==="frequency"?s.frequency.value=String(n):e==="amplitude"?s.amplitude.value=String(n):e==="offset"?s.offset.value=String(n):e==="trigger_source"?s.triggerSource.value=String(n):e==="output_direct"?s.outputDirect.value=String(n):e==="start_phase"?s.startPhase.value=String(n):e==="cycles_per_burst"&&(s.cyclesPerBurst.value=String(n))}async function Nn(t,e,n){const s=await Oi(t,e,n);fr(t,e,s.value),gs[t].status.textContent=`${e} = ${$n(e,s.value)}`}async function fo(t,e){const n=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!n.ok)throw new Error(`${t} action ${e} failed: ${n.status}`);const s=await n.json();Tu(t,s.state??{}),gs[t].status.textContent=`${e}: ok`}function pg(){ac.textContent="";for(const t of["P","N"]){const e=document.createElement("section");e.className="housekeeping-bank";const n=document.createElement("h3");n.textContent=`Expansion ${t}`,e.appendChild(n);for(let s=0;s<8;s+=1){const i=document.createElement("div");i.className="housekeeping-pin";const a=`expansion_${t}${s}`,o=`${a}_output`,l=document.createElement("span");l.textContent=`${t}${s}`;const u=document.createElement("label"),d=document.createElement("input");d.type="checkbox",d.id=`hk-${a.replaceAll("_","-")}`,d.addEventListener("change",()=>{Ro(a,d.checked).catch(m=>{jn.textContent=m.message})}),u.append(d,document.createTextNode(" Value"));const v=document.createElement("label"),f=document.createElement("input");f.type="checkbox",f.id=`hk-${o.replaceAll("_","-")}`,f.addEventListener("change",()=>{Ro(o,f.checked).catch(m=>{jn.textContent=m.message})}),v.append(f,document.createTextNode(" Output")),i.append(l,u,v),e.appendChild(i)}ac.appendChild(e)}}async function Nu(){const t=await fetch("/api/modules/hk/attributes");if(t.ok){const s=await t.json(),a=new Map(s.attributes.map(o=>[o.name,o])).get("led");a&&Wt(ra,a)}const e=await fetch("/api/modules/hk");if(!e.ok)throw new Error(`Housekeeping controls unavailable: ${e.status}`);const n=await e.json();Iu(n.state??{}),jn.textContent="Housekeeping controls ready"}function Iu(t){for(const[e,n]of Object.entries(t))Du(n)&&mr(e,n)}function mr(t,e){if(t==="led"){ra.value=String(e);return}const n=document.querySelector(`#hk-${t.replaceAll("_","-")}`);n&&(n.checked=!!e)}async function Ro(t,e){const n=await Oi("hk",t,e);mr(t,n.value),jn.textContent=`${t} = ${$n(t,n.value)}`}async function $u(){const[t,e]=await Promise.all([fetch("/api/modules/sampler"),fetch("/api/modules/ams")]);if(!t.ok||!e.ok)throw new Error("Sampler or AMS readback unavailable");const n=await t.json(),s=await e.json();hg(n.state??{}),dg(s.state??{}),Su.textContent="Sampler refreshed",Ca.textContent="AMS refreshed"}function hg(t){if(ho.size===0){ic.textContent="",Fo.textContent="";for(const e of Object.keys(t)){const n=document.createElement("div");n.className="sampler-reading";const s=document.createElement("span");s.textContent=e;const i=document.createElement("output");i.dataset.signal=e,n.append(s,i),ic.appendChild(n),ho.set(e,i),Fo.add(new Option(e,e))}}for(const[e,n]of Object.entries(t))if(typeof n=="number"){const s=ho.get(e);s&&(s.value=Ai(n))}}function dg(t){Hs.forEach((e,n)=>{const s=t[`dac${n}`];typeof s=="number"&&(e.value=s.toFixed(6))})}async function fg(){To.disabled=!0,No.value="Acquiring...";try{const t=await fetch("/api/sampler/stats",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({signal:Fo.value,duration:Number(Sm.value)})});if(!t.ok)throw new Error(`Sampler statistics failed: ${t.status}`);const e=await t.json();No.value=`mean ${Ai(e.mean)} | std ${Ai(e.stddev)} | min ${Ai(e.min)} | max ${Ai(e.max)} | n ${e.count}`}finally{To.disabled=!1}}async function Ru(t){const e=await Oi("ams",`dac${t}`,Number(Hs[t].value));Hs[t].value=Number(e.value).toFixed(6),Ca.textContent=`DAC${t} = ${Hs[t].value} V`}function Ai(t){if(!Number.isFinite(t))return"--";const e=Math.abs(t);return e!==0&&(e<1e-4||e>=1e4)?t.toExponential(5):t.toFixed(6)}async function mg(){for(const[t,e]of Object.entries(Ym)){const n=qm[t];t==="iir"&&It&&(It.destroy(),It=null),n.textContent="",await Promise.all(e.map(s=>gg(n,s)))}}async function gg(t,e){const[n,s,i]=await Promise.all([fetch(`/api/modules/${e}/attributes`),fetch(`/api/modules/${e}/actions`),fetch(`/api/modules/${e}`)]);if(!n.ok||!s.ok||!i.ok)throw new Error(`${e} controls unavailable`);const a=await n.json(),o=await s.json(),l=await i.json(),u=document.createElement("section");u.className="module-panel instrument-card",e==="iir"&&u.classList.add("iir-card"),u.dataset.module=e;const d=document.createElement("header");d.className="instrument-card-header";const v=document.createElement("h3");v.textContent=e.toUpperCase();const f=document.createElement("output");f.id=`${e}-status`,f.textContent=`${e} ready`,d.append(v,f);const m=document.createElement("div");m.className=e==="spectrumanalyzer"?"control-row generic-module-row spectrum-module-row":"control-row generic-module-row";const y={status:f,inputs:new Map,fields:new Map,actions:[],card:u,owner:null},k=e==="spectrumanalyzer"?yg(a.attributes):a.attributes;for(const _ of k){if(e==="iir"&&vg(_.name))continue;const P=xg(e,_,f);y.inputs.set(_.name,P.input),y.fields.set(_.name,P.label),m.appendChild(P.label)}const F=e==="spectrumanalyzer"?[]:o.actions??[];for(const _ of F){const P=document.createElement("button");P.type="button",P.textContent=_.label??_.name,P.addEventListener("click",()=>{wg(e,_.name,f).catch(M=>{f.textContent=M.message})}),y.actions.push(P),m.appendChild(P)}if(Cn.set(e,y),u.append(d,m),e==="iir"){const _=document.createElement("section");_.className="iir-plot",u.appendChild(_),It=new Nf(_,async(P,M)=>{await Ys("iir",P,M,f)},P=>{f.textContent=P}),It.refresh().catch(P=>{f.textContent=P.message})}t.appendChild(u),Di(e,l.state??{})}function vg(t){return t==="real_poles"||t==="real_zeros"||t==="complex_poles"||t==="complex_zeros"}function xg(t,e,n){const s=document.createElement("label");s.dataset.attribute=e.name;const i=document.createElement("span");i.textContent=t==="spectrumanalyzer"?bg(e):e.label,s.appendChild(i);let a;if(e.type==="select"){const o=document.createElement("select");Rn(o,e),o.addEventListener("change",()=>{Ys(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="bool"){const o=document.createElement("input");o.type="checkbox",o.checked=!!e.value,o.addEventListener("change",()=>{Ys(t,e.name,o.checked,n).catch(l=>{n.textContent=l.message})}),a=o}else if(e.type==="number"){const o=document.createElement("input");o.type="number",Wt(o,e),o.addEventListener("change",()=>{Ys(t,e.name,Number(o.value),n).catch(l=>{n.textContent=l.message})}),a=o}else{const o=document.createElement("input");o.type="text",o.value=Ou(e.value),o.addEventListener("change",()=>{Ys(t,e.name,o.value,n).catch(l=>{n.textContent=l.message})}),a=o}return e.readonly&&(a instanceof HTMLSelectElement?a.disabled=!0:a.readOnly=!0),a.id=`${t}-${e.name.replaceAll("_","-")}`,s.appendChild(a),{label:s,input:a}}function bg(t){return t.name==="input"?"IQ Input":t.name==="center"?"IQ Center":t.name==="input1_baseband"?"BB Input 1":t.name==="input2_baseband"?"BB Input 2":t.name==="display_input1_baseband"||t.name==="display_input2_baseband"?"Show":t.name==="display_cross_amplitude"?"Cross":t.label}function yg(t){const e=["baseband","display_input1_baseband","input1_baseband","display_input2_baseband","input2_baseband","input","center","acbandwidth","display_cross_amplitude","span","rbw","window","display_unit","trace_average"];return[...t].sort((n,s)=>{const i=e.indexOf(n.name),a=e.indexOf(s.name);return(i===-1?Number.MAX_SAFE_INTEGER:i)-(a===-1?Number.MAX_SAFE_INTEGER:a)})}async function Ys(t,e,n,s){const i=await Oi(t,e,n);if(gr(t,e,i.value),s.textContent=`${e} = ${$n(e,i.value)}`,t==="iir"&&It&&(await It.refresh(),e==="data_curve")){const a=await fetch("/api/modules/iir");if(a.ok){const o=await a.json();Di("iir",o.state??{})}}}async function wg(t,e,n){const s=await fetch(`/api/modules/${t}/actions/${e}`,{method:"POST"});if(!s.ok)throw new Error(`${t} action ${e} failed: ${s.status}`);const i=await s.json();Di(t,i.state??{}),t==="iir"&&It&&await It.refresh(),n.textContent=`${e}: ok`}function Di(t,e){if(t==="spectrumanalyzer"){if(ye.setSettings(e),Sg(e),typeof e.running_state=="string"&&ig(e.running_state),typeof e.current_avg=="number"){const n=Cn.get("spectrumanalyzer")?.inputs.get("trace_average");ku.textContent=`${e.current_avg} / ${n?.value||"1"}`}document.activeElement!==Ii&&typeof e.curve_name=="string"&&(Ii.value=e.curve_name)}for(const[n,s]of Object.entries(e))n==="owner"?kg(t,typeof s=="string"?s:null):Mg(s)&&gr(t,n,s)}function Sg(t){const e=Cn.get("spectrumanalyzer");if(!e)return;const n=!!(t.baseband??!0),s=new Set(["input","center","acbandwidth"]),i=new Set(["input1_baseband","input2_baseband","display_input1_baseband","display_input2_baseband","display_cross_amplitude"]);for(const[a,o]of e.fields)o.hidden=n&&s.has(a)||!n&&i.has(a)}function gr(t,e,n){const s=Cn.get(t)?.inputs.get(e);s&&(s instanceof HTMLInputElement&&s.type==="checkbox"?s.checked=!!n:s.value=Ou(n))}function kg(t,e){const n=Cn.get(t);if(n){n.owner=e,n.card.classList.toggle("is-owned",e!==null);for(const s of n.inputs.values())s.disabled=e!==null;for(const s of n.actions)s.disabled=e!==null;e&&(n.status.textContent=`occupied by ${e}`)}}function Mg(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"||Array.isArray(t)&&t.every(e=>typeof e=="number"||typeof e=="string")}function Ou(t){return Array.isArray(t)?t.join(", "):String(t)}function Du(t){return typeof t=="string"||typeof t=="number"||typeof t=="boolean"}function lc(t){return typeof t=="string"&&Cn.has(t)}async function vr(){const t=await fetch("/api/modules/scope/states");if(!t.ok)return;const e=await t.json();Bu(e.states??[])}function Bu(t){const e=kt.value;kt.textContent="";const n=document.createElement("option");n.value="",n.textContent=t.length?"Choose state":"No saved states",kt.appendChild(n);for(const s of t){const i=document.createElement("option");i.value=s.name,i.textContent=s.name,kt.appendChild(i)}t.some(s=>s.name===e)?kt.value=e:t[0]&&(kt.value=t[0].name,li.value=t[0].name)}function cc(t){return t==="asg0"||t==="asg1"}function Eg(){if(Ds&&Ds.readyState!==WebSocket.CLOSED)return;const t=window.location.protocol==="https:"?"wss:":"ws:";Ds=new WebSocket(`${t}//${window.location.host}/ws/events`),Ds.addEventListener("message",e=>{const n=JSON.parse(e.data);if(n.type==="module.attribute.changed"){if(Eu+=1,n.module==="scope")hr(n.attribute,n.value),ae.textContent=`${n.attribute} = ${$n(n.attribute,n.value)}`;else if(cc(n.module)){const s=n.module;fr(s,n.attribute,n.value),gs[s].status.textContent=`${n.attribute} = ${$n(n.attribute,n.value)}`}else if(n.module==="hk")mr(n.attribute,n.value),jn.textContent=`${n.attribute} = ${$n(n.attribute,n.value)}`;else if(lc(n.module)){gr(n.module,n.attribute,n.value);const s=Cn.get(n.module);s&&(s.status.textContent=`${n.attribute} = ${$n(n.attribute,n.value)}`)}return}if(n.type!=="module.attribute.changed"||n.module!=="scope"){if(n.type==="module.state.changed"&&n.module==="scope")Fu(n.state),n.state.trigger_test?ae.textContent=Lg(n.state.trigger_test):ae.textContent=`${n.state.last_action}: ${n.state.running_state}`;else if(n.type==="module.state.changed"&&cc(n.module)){const s=n.module;Tu(s,n.state??{}),gs[s].status.textContent=`${s} state updated`}else if(n.type==="module.state.changed"&&n.module==="hk")Iu(n.state??{}),jn.textContent="Housekeeping state updated";else if(n.type==="module.state.changed"&&lc(n.module)){Di(n.module,n.state??{});const s=Cn.get(n.module);s&&!s.owner&&n.module!=="spectrumanalyzer"&&(s.status.textContent=`${n.module} state updated`)}else n.type==="module.state.changed"&&n.module==="lockbox"?En.applySchema(n.state).catch(s=>{ae.textContent=s.message}):n.type==="module.state.changed"&&n.module==="networkanalyzer"?ms.applyState(n.state??{}):n.type==="module.states.changed"&&n.module==="scope"&&(Bu(n.states??[]),ae.textContent=`${n.states.length} saved state${n.states.length===1?"":"s"}`);return}}),Ds.addEventListener("close",()=>{Ds=null})}async function Cg(){Kt.textContent="Loading one scope frame...";const t=await fetch(`/api/scope/frame?samples=${U.getSampleCount()}`);if(t.status===204){Kt.textContent="No trigger captured";return}if(!t.ok)throw new Error(`Scope frame request failed: ${t.status}`);const e=await t.arrayBuffer();U.close(),U.showFrame(e),ft.dataset.connected="false"}async function bn(t){const e=await fetch(`/api/modules/spectrumanalyzer/actions/${t}`,{method:"POST"});if(!e.ok)throw new Error(`Spectrum action ${t} failed: ${e.status}`);const n=await e.json(),s=n.state;return Di("spectrumanalyzer",n.state??{}),Jt.textContent=`${t}: ${s.running_state??"ok"}`,n}async function Vu(t,e,n,s){const i=await fetch("/api/curves",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({x:t,y:e,y_imag:s,params:n})});if(!i.ok)throw new Error(`Save curve failed: ${i.status}`)}async function Ag(){const t=U.getCurveData();if(!t)throw new Error("No scope curve to save");const n=[[0,ln.checked],[1,cn.checked]].filter(([,i])=>i),s={input1:Js.value,input2:Qs.value,duration:Number(kn.value),average:ei.checked,trigger_source:Dn.value,trigger_delay:Number(Yn.value),threshold:Number(qn.value),hysteresis:Number(Hn.value),ch1_active:ln.checked,ch2_active:cn.checked,ch_math_active:fs.checked,math_formula:Vn.value,xy_mode:ds.checked,rolling_mode:Bn.checked,trace_average:Number(Mn.value)};return await Promise.all(n.map(([i])=>Vu(t.x,t.channels[i],{...s,name:`${hs.value||"scope curve"} ch${i+1}`,module:"scope",ch:i,curve_unit:"V"}))),n.length}async function Pg(){const t=ye.getCurveData();if(!t)throw new Error("No spectrum curve to save");return await Promise.all(t.series.map((e,n)=>Vu(t.x,e.values,{...ye.getCurveParameters(),name:`${Ii.value||"pyrpl spectrum"} ${e.label.toLowerCase()}`,module:"spectrumanalyzer",ch:e.label==="Cross"?"cross":n,curve_unit:t.unit}))),t.series.length}function ha(){St.dataset.connected!=="true"&&(ye.connect(),St.dataset.connected="true")}function yn(t="Spectrum stopped"){ye.close(),St.dataset.connected="false",Jt.textContent=t}async function Yu(){await bn("stop"),(St.dataset.connected==="true"||ye.isConnected())&&yn("Spectrum stopped: Scope owns the scope resource")}async function zg(){await Yu(),await Zt("single"),U.resetTraceAveraging(),$i()}function _g(){return encodeURIComponent(Oo())}function Oo(){return(li.value.trim()||kt.value||"default").trim()}function qu(){return(kt.value||li.value.trim()||"default").trim()}function Lg(t){const e=String(t.source??"unknown"),n=String(t.condition??"condition"),s=Number(t.hysteresis??0);return t.triggered?`triggered ${e} ${n} at sample ${t.index} (hys ${s})`:`no trigger: ${e} ${n} (hys ${s})`}async function Fg(){const t=await fetch(`/api/modules/scope/states/${_g()}/save`,{method:"POST"});if(!t.ok)throw new Error(`Save state failed: ${t.status}`);await vr(),kt.value=Oo(),ae.textContent=`saved state ${Oo()}`}async function Tg(){const t=qu(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}/load`,{method:"POST"});if(!e.ok)throw new Error(`Load state failed: ${e.status}`);const n=await e.json();og(n.state),li.value=t,ae.textContent=`loaded state ${t}`}async function Ng(){const t=qu(),e=await fetch(`/api/modules/scope/states/${encodeURIComponent(t)}`,{method:"DELETE"});if(!e.ok)throw new Error(`Delete state failed: ${e.status}`);await vr(),ae.textContent=`deleted state ${t}`}ft.addEventListener("click",()=>{(async()=>{try{xn==="running_continuous"?await Zt("pause"):xn==="paused_single"||xn==="paused_continuous"?(await Zt("resume_continuous"),$i()):(await Yu(),await Zt("continuous"),U.resetTraceAveraging(),$i())}catch(t){ae.textContent=t instanceof Error?t.message:String(t)}})()});fn.addEventListener("click",()=>{(xn==="running_single"?Zt("pause"):xn==="paused_single"||xn==="paused_continuous"?Zt("resume_single").then(()=>$i()):zg()).catch(e=>{Kt.textContent=e.message})});Mi.addEventListener("click",()=>{Zt("stop").then(()=>{U.resetTraceAveraging(),Pa()}).catch(t=>{Kt.textContent=t.message})});um.addEventListener("click",()=>{Promise.all([Zt("save_curve"),Ag()]).then(([,t])=>{U.downloadCsv(`scope-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),ae.textContent=`saved ${t} curve${t===1?"":"s"}`}).catch(t=>{ae.textContent=t.message})});pm.addEventListener("click",()=>U.zoom(1.8));hm.addEventListener("click",()=>U.zoom(.55));dm.addEventListener("click",()=>U.zoomY(1.8));fm.addEventListener("click",()=>U.zoomY(.55));mm.addEventListener("click",()=>U.panX(-.2));gm.addEventListener("click",()=>U.panX(.2));vm.addEventListener("click",()=>U.panY(-.2));xm.addEventListener("click",()=>U.panY(.2));bm.addEventListener("click",()=>U.resetZoom());mn.addEventListener("click",()=>{(async()=>{try{ls==="running_single"?(await bn("pause"),yn("Spectrum paused")):ls==="paused_single"||ls==="paused_continuous"?(yn("Reconnecting spectrum stream"),await bn("resume_single"),ha()):(await _u(),yn("Starting spectrum acquisition"),ye.resetAveraging(),await bn("single"),ha())}catch(t){Jt.textContent=t instanceof Error?t.message:String(t)}})()});St.addEventListener("click",()=>{(async()=>{try{ls==="running_continuous"?(await bn("pause"),yn("Spectrum paused")):ls==="paused_single"||ls==="paused_continuous"?(yn("Reconnecting spectrum stream"),await bn("resume_continuous"),ha()):(await _u(),yn("Starting spectrum acquisition"),ye.resetAveraging(),await bn("continuous"),ha())}catch(t){Jt.textContent=t instanceof Error?t.message:String(t)}})()});Ei.addEventListener("click",()=>{bn("stop").then(()=>yn()).catch(t=>{Jt.textContent=t.message})});Lm.addEventListener("click",()=>{Pg().then(t=>{ye.downloadCsv(`spectrum-${new Date().toISOString().replace(/[:.]/g,"-")}.csv`),Jt.textContent=`saved ${t} curve${t===1?"":"s"}`}).catch(t=>{Jt.textContent=t.message})});hs.addEventListener("change",()=>{nt("curve_name",hs.value).catch(t=>{ae.textContent=t.message})});Ii.addEventListener("change",()=>{Ys("spectrumanalyzer","curve_name",Ii.value,Jt).catch(t=>{Jt.textContent=t.message})});Fm.addEventListener("click",()=>ye.zoom(1.8));Tm.addEventListener("click",()=>ye.zoom(.55));Nm.addEventListener("click",()=>ye.zoomY(1.8));Im.addEventListener("click",()=>ye.zoomY(.55));$m.addEventListener("click",()=>ye.panX(-.2));Rm.addEventListener("click",()=>ye.panX(.2));Om.addEventListener("click",()=>ye.panY(-.2));Dm.addEventListener("click",()=>ye.panY(.2));Bm.addEventListener("click",()=>ye.resetZoom());ln.addEventListener("change",()=>{U.setChannelVisible(1,ln.checked),nt("ch1_active",ln.checked).catch(t=>{ae.textContent=t.message,ln.checked=U.getChannelVisible(1)})});cn.addEventListener("change",()=>{U.setChannelVisible(2,cn.checked),nt("ch2_active",cn.checked).catch(t=>{ae.textContent=t.message,cn.checked=U.getChannelVisible(2)})});Js.addEventListener("change",()=>{nt("input1",Js.value).catch(t=>{ae.textContent=t.message})});Qs.addEventListener("change",()=>{nt("input2",Qs.value).catch(t=>{ae.textContent=t.message})});Dn.addEventListener("change",()=>{nt("trigger_source",Dn.value).catch(t=>{ae.textContent=t.message})});Ni.addEventListener("change",()=>{Ni.checked&&nt("rolling_mode",!1).catch(t=>{ae.textContent=t.message})});Bn.addEventListener("change",()=>{Bn.checked&&nt("rolling_mode",!0).catch(t=>{ae.textContent=t.message})});kn.addEventListener("change",()=>{nt("duration",Number(kn.value)).catch(t=>{ae.textContent=t.message})});ei.addEventListener("change",()=>{nt("average",ei.checked).catch(t=>{ae.textContent=t.message})});ds.addEventListener("change",()=>{cs(),nt("xy_mode",ds.checked).catch(t=>{ae.textContent=t.message})});fs.addEventListener("change",()=>{cs(),nt("ch_math_active",fs.checked).catch(t=>{ae.textContent=t.message})});Vn.addEventListener("change",()=>{cs(),nt("math_formula",Vn.value).catch(t=>{ae.textContent=t.message})});Mn.addEventListener("change",()=>{nt("trace_average",Number(Mn.value)).catch(t=>{ae.textContent=t.message})});Yn.addEventListener("change",()=>{nt("trigger_delay",Number(Yn.value)).catch(t=>{ae.textContent=t.message})});qn.addEventListener("change",()=>{nt("threshold",Number(qn.value)).catch(t=>{ae.textContent=t.message})});Hn.addEventListener("change",()=>{nt("hysteresis",Number(Hn.value)).catch(t=>{ae.textContent=t.message})});bu.addEventListener("click",()=>{Fg().catch(t=>{ae.textContent=t.message})});kt.addEventListener("change",()=>{kt.value&&(li.value=kt.value)});yu.addEventListener("click",()=>{Tg().catch(t=>{ae.textContent=t.message})});wu.addEventListener("click",()=>{Ng().catch(t=>{ae.textContent=t.message})});for(const t of Mu){const e=gs[t];e.waveform.addEventListener("change",()=>{Nn(t,"waveform",e.waveform.value).catch(n=>{e.status.textContent=n.message})}),e.frequency.addEventListener("change",()=>{Nn(t,"frequency",Number(e.frequency.value)).catch(n=>{e.status.textContent=n.message})}),e.amplitude.addEventListener("change",()=>{Nn(t,"amplitude",Number(e.amplitude.value)).catch(n=>{e.status.textContent=n.message})}),e.offset.addEventListener("change",()=>{Nn(t,"offset",Number(e.offset.value)).catch(n=>{e.status.textContent=n.message})}),e.triggerSource.addEventListener("change",()=>{Nn(t,"trigger_source",e.triggerSource.value).catch(n=>{e.status.textContent=n.message})}),e.outputDirect.addEventListener("change",()=>{Nn(t,"output_direct",e.outputDirect.value).catch(n=>{e.status.textContent=n.message})}),e.startPhase.addEventListener("change",()=>{Nn(t,"start_phase",Number(e.startPhase.value)).catch(n=>{e.status.textContent=n.message})}),e.cyclesPerBurst.addEventListener("change",()=>{Nn(t,"cycles_per_burst",Number(e.cyclesPerBurst.value)).catch(n=>{e.status.textContent=n.message})}),e.setup.addEventListener("click",()=>{fo(t,"setup").catch(n=>{e.status.textContent=n.message})}),e.trigger.addEventListener("click",()=>{fo(t,"trigger").catch(n=>{e.status.textContent=n.message})}),e.off.addEventListener("click",()=>{fo(t,"off").catch(n=>{e.status.textContent=n.message})})}ra.addEventListener("change",()=>{Ro("led",Number(ra.value)).catch(t=>{jn.textContent=t.message})});km.addEventListener("click",()=>{Nu().catch(t=>{jn.textContent=t.message})});wm.addEventListener("click",()=>{$u().catch(t=>{Su.textContent=t.message})});To.addEventListener("click",()=>{fg().catch(t=>{No.value=t.message})});Hs[2].addEventListener("change",()=>{Ru(2).catch(t=>{Ca.textContent=t.message})});Hs[3].addEventListener("change",()=>{Ru(3).catch(t=>{Ca.textContent=t.message})});async function Ig(){if(Cu=await ag(),pg(),await lg(),await vr(),await cg(),await Nu(),await $u(),await mg(),await ms.initialize(),await ti.load(),await Vm.load().catch(t=>{x("#config-status").textContent=t.message}),await En.load(),Eg(),await jm(),Aa(),!X.activePanelId){Kt.textContent="No panel enabled";return}if(X.activePanelId!=="scope"){Kt.textContent=`${Xn.find(t=>t.id===X.activePanelId)?.title} panel ready`;return}if(!X.panels.scope.enabled){Kt.textContent="Scope panel disabled";return}await Pu()}Xm();Ig().catch(t=>{Kt.textContent=t.message});
