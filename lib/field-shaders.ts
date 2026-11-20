/* 感性场着色器：logo 采样 → curl 噪声 → 感性签名 → 封面图 */
export const NOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);} vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
i=mod(i,289.0);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
vec3 curl(vec3 p){ const float e=.1; vec3 dx=vec3(e,0,0),dy=vec3(0,e,0),dz=vec3(0,0,e);
  float x=snoise(p+dy)-snoise(p-dy)-(snoise(p+dz+vec3(31.4))-snoise(p-dz+vec3(31.4)));
  float y=snoise(p+dz+vec3(31.4))-snoise(p-dz+vec3(31.4))-(snoise(p+dx+vec3(-17.1))-snoise(p-dx+vec3(-17.1)));
  float z=snoise(p+dx+vec3(-17.1))-snoise(p-dx+vec3(-17.1))-(snoise(p+dy)-snoise(p-dy));
  return vec3(x,y,z)/(2.*e); }
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
`

export const VERT = `
uniform float uTime,uMorph,uSize,uPR,uYou,uFocus,uFocusAmt,uTurb,uLinger,uWarmAll;
uniform vec3 uMouse; uniform float uMouseAmt;
uniform vec3 uK[8]; uniform vec3 uC[8];
uniform float uImg,uImgG,uLogoS,uImgAsp,uImgW,uPort,uDark;
#define port2 (uPort>.5)
uniform vec3 uImgC,uLogoOff; uniform sampler2D uCover;
attribute vec2 aUV;
attribute vec3 aLogo; attribute vec4 aRand; attribute float aType,aGroup,aT; attribute vec2 aPair;
varying vec3 vCol; varying float vA;
${NOISE}
vec3 signature(int g,float t,vec4 r){
  vec3 k=uK[g];
  float q=2.+floor((k.y+1.)*1.5+.5);                 // 自主度 → 起伏次数 2..5
  float ang=t*6.28318; float R=.82; float a=.14+.12*(k.z+1.)*.5;
  vec3 p=vec3((R+a*cos(q*ang))*cos(ang),(R+a*cos(q*ang))*sin(ang),a*sin(q*ang));
  float spread=mix(.018,.15,(k.z+1.)*.5)*(g==7?.7:1.);            // 余韵 → 颗粒扩散
  vec3 j=(r.xyz-.5)*2.; p+=j*spread*(.35+r.w*r.w*1.4);
  p.xy=rot(uTime*(.08+.22*(k.x+1.)*.5)+float(g))*p.xy;
  p.yz=rot(1.05)*p.yz;
  return p;
}
void main(){
  int g=int(aGroup+.5);
  float gold; vec3 target; float alpha; float scaleG=1.;
  if(g<8){
    scaleG = g==7 ? .95*uYou : .64;
    target=signature(g,aT,aRand)*scaleG+uC[g];
    float warmth=(uK[g].x+1.)*.5;
    gold=step(aRand.w,warmth*.85+.06);
    alpha=gold>.5?.9:.62;
    if(g==7){ target=signature(g,aT,aRand)*scaleG*(1.-uImg)+uC[g]; vec3 dust=(aRand.xyz-.5)*vec3(16.,9.,6.); target=mix(dust,target,uYou); alpha=mix(.22,.9,uYou); }
  } else {
    vec3 A=uC[int(aPair.x+.5)], B=uC[int(aPair.y+.5)];
    float s=fract(aT+uTime*(.05+.06*aRand.x)*(1.15-uLinger*.5));
    vec3 mid=(A+B)*.5; vec3 n=normalize(cross(B-A,vec3(0,0,1))+vec3(1e-4));
    target=mix(A,B,s)+n*sin(s*3.14159)*(.55+aRand.y*.5)+(aRand.xyz-.5)*.12;
    gold=step(aRand.z,.55); alpha=.42*sin(s*3.14159);
  }
  // 滚动形变：带错峰的扩散
  float m=clamp(uMorph*1.45-aRand.y*.45,0.,1.); m=m*m*(3.-2.*m);
  vec3 pos=mix(aLogo*uLogoS+uLogoOff,target,m);
  float turb=uTurb*(1.+sin(m*3.14159)*5.);
  pos+=curl(pos*.55+vec3(0,0,uTime*.07))*turb*(.6+aRand.z*.8);
  pos+=curl(pos*.55+vec3(9.,0,uTime*.04))*sin(m*3.14159)*.9;
  // 悬停：该作品的粒子飞到中心，拼成真实封面图
  float ia=uImg; float ia2=clamp(ia*1.7-aRand.y*.7,0.,1.); ia2=ia2*ia2*(3.-2.*ia2);
  float H=uImgW/uImgAsp; vec3 aImg=vec3((aUV.x-.5)*uImgW,(aUV.y-.5)*H,(aRand.z-.5)*.06);
  vec3 tex=texture2D(uCover,aUV).rgb; float bgd=length(tex-mix(vec3(.94,.925,.895),vec3(.06,.065,.075),uDark));
  vec3 imgP=uImgC+aImg+curl(aImg*2.+vec3(uTime*.2))*.012;
  pos=mix(pos,imgP+curl(pos*.8+uTime*.1)*sin(ia2*3.14159)*.6,ia2);
  // 鼠标：像搅动墨
  vec3 d=pos-uMouse; float dl=length(d.xy); float f=exp(-dl*dl/.8)*uMouseAmt;
  pos.xy+=normalize(d.xy+1e-4)*f*1.1; pos.xy+=vec2(-d.y,d.x)*f*1.1; pos.z+=f*.9; pos+=curl(pos*1.4+vec3(uTime*.3))*f*.35;
  // 颜色
  float logoGold=aType; float cg=mix(logoGold,gold,m);
  vec3 ink=mix(vec3(.075,.085,.105),vec3(.9,.89,.86),uDark), gl=vec3(.93,.68,.11);
  vCol=mix(mix(ink,gl,cg),tex*.96,ia2);
  float a0=mix(cg>.5?.88:.62,alpha,m);
  float isF=(g==int(uFocus+.5)&&g<7)?uFocusAmt:0.;
  vA=a0*(1.-uFocusAmt*.55*(1.-isF)*step(.5,m)*float(g<7))+isF*.1;
  vA=mix(vA,smoothstep(.03,.2,bgd),ia2);
  vec4 mv=modelViewMatrix*vec4(pos,1.);
  gl_Position=projectionMatrix*mv;
  float sz=mix(uSize*(.55+aRand.x*.9)*(cg>.5?1.15:1.)*(1.+isF*.6),uSize*(port2?1.5:1.3),ia2);
  gl_PointSize=sz*uPR*(14./-mv.z);
}`

export const FRAG = `
varying vec3 vCol; varying float vA;
void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); if(d>.5) discard; float a=smoothstep(.5,.15,d)*vA; gl_FragColor=vec4(vCol,a); }`
