// Samples strict arrow-crossword patterns: every cell is a clue cell (#) or a letter (.); an across word is clued by the
// cell directly left of it, a down word by the cell directly above it; no letter is outside a word.
// At most MAXDEAD clue cells may have no word to clue (they become decorative corner ornaments).
// Row-profile dynamic programming guarantees every sampled walk completes.   usage: sample-templates W H count seed [maxdead]
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
int W,H,R,MAXDEAD=1;
static inline int Lb(int row,int c){return c>=0&&c<W&&((row>>c)&1);}
int dead;
int checkRow(int a,int b,int c1,int c2,int r){
  dead=0;
  for(int c=0;c<W;c++){
    if((b>>c)&1){
      int hz=Lb(b,c-1)||Lb(b,c+1), vt=(r>0&&Lb(a,c))||(r+1<H&&Lb(c1,c));
      if(!hz&&!vt&&r==0&&c==0)return 0; /* a lone letter is a one-letter answer clued from the cell left of it or above it */
      if(c==0&&Lb(b,1))return 0;
      if(r==0&&r+1<H&&Lb(c1,c))return 0;
    } else {
      int ac=Lb(b,c+1)&&Lb(b,c+2), dn=(r+2<H)&&Lb(c1,c)&&Lb(c2,c);
      int sr=Lb(b,c+1)&&!Lb(b,c+2)&&!(r>0&&Lb(a,c+1))&&!(r+1<H&&Lb(c1,c+1));
      int sd=(r+1<H)&&Lb(c1,c)&&!(r+2<H&&Lb(c2,c))&&!Lb(c1,c-1)&&!Lb(c1,c+1);
      if(!ac&&!dn&&!sr&&!sd)dead++;
    }
  }
  return 1;
}
static unsigned long long rs;
static unsigned rnd(){rs^=rs<<13;rs^=rs>>7;rs^=rs<<17;return (unsigned)(rs>>11);}
int main(int argc,char**argv){
  W=atoi(argv[1]);H=atoi(argv[2]);int count=atoi(argv[3]);rs=atoll(argv[4])*2654435761ULL+88172645463325252ULL;if(argc>5)MAXDEAD=atoi(argv[5]);
  R=1<<W;size_t S=(size_t)R*R*R;
  unsigned char **fw=malloc(sizeof(void*)*(H+2)),**bk=malloc(sizeof(void*)*(H+2));
  for(int i=0;i<H+2;i++){fw[i]=malloc(S);memset(fw[i],255,S);bk[i]=NULL;}
  for(int x=0;x<R;x++)for(int y=0;y<R;y++)fw[2][((size_t)0*R+x)*R+y]=0;
  for(int k=2;k<H;k++)for(size_t s=0;s<S;s++){
    if(fw[k][s]==255)continue;int a=s/((size_t)R*R),b=(s/R)%R,c=s%R;
    for(int d=0;d<R;d++){ if(!checkRow(a,b,c,d,k-2))continue; int nc=fw[k][s]+dead; if(nc>MAXDEAD)continue; size_t ns=((size_t)b*R+c)*R+d; if(nc<fw[k+1][ns])fw[k+1][ns]=nc; }
  }
  for(int i=0;i<H+2;i++){bk[i]=malloc(S);memset(bk[i],255,S);}
  for(size_t s=0;s<S;s++){ if(fw[H][s]==255)continue; int a=s/((size_t)R*R),b=(s/R)%R,c=s%R; if(!checkRow(a,b,c,0,H-2))continue; int t=dead; if(!checkRow(b,c,0,0,H-1))continue; t+=dead; bk[H][s]=t; }
  for(int k=H-1;k>=2;k--)for(size_t s=0;s<S;s++){
    if(fw[k][s]==255)continue;int a=s/((size_t)R*R),b=(s/R)%R,c=s%R;int best=255;
    for(int d=0;d<R;d++){ if(!checkRow(a,b,c,d,k-2))continue; int e=dead; size_t ns=((size_t)b*R+c)*R+d; if(bk[k+1][ns]==255)continue; int t=e+bk[k+1][ns]; if(t<best)best=t; }
    bk[k][s]=best;
  }
  // list start states
  size_t *starts=malloc(sizeof(size_t)*R*R);int ns0=0;
  for(int x=0;x<R;x++)for(int y=0;y<R;y++){size_t s=((size_t)0*R+x)*R+y;if(bk[2][s]<=MAXDEAD)starts[ns0++]=s;}
  if(!ns0){fprintf(stderr,"no template exists\n");return 1;}
  int *rows=malloc(sizeof(int)*H);
  for(int n=0;n<count;n++){
    size_t s=starts[rnd()%ns0];int a=0,b=(s/R)%R,c=s%R;rows[0]=b;rows[1]=c;int used=0;
    for(int k=2;k<H;k++){
      int cand[512],nc=0,cd[512];
      for(int d=0;d<R;d++){ if(!checkRow(a,b,c,d,k-2))continue; int e=dead; size_t ns=((size_t)b*R+c)*R+d; if(bk[k+1][ns]==255)continue; if(used+e+bk[k+1][ns]>MAXDEAD)continue; cand[nc]=d;cd[nc]=e;nc++; }
      /* prefer rows with few two-letter runs and about 30% clue cells, so good boards come up often */
      double wgt[512],tot=0;
      for(int i=0;i<nc;i++){int row=cand[i],h2=0,len=0,clues=0;
        for(int x=0;x<=W;x++){ if(x<W&&((row>>x)&1)){len++;} else { if(len==2)h2++; len=0; } if(x<W&&!((row>>x)&1))clues++; }
        double dv=clues-0.3*W; wgt[i]=exp(-(2.2*h2+0.7*dv*dv)); tot+=wgt[i]; }
      double u=(rnd()%1000003)/1000003.0*tot; int pick=nc-1; for(int i=0;i<nc;i++){u-=wgt[i];if(u<=0){pick=i;break;}}
      int d=cand[pick];used+=cd[pick];rows[k]=d;a=b;b=c;c=d;
    }
    for(int r=0;r<H;r++){for(int cc=0;cc<W;cc++)putchar(((rows[r]>>cc)&1)?'.':'#');putchar('\n');}
    putchar('\n');
  }
  return 0;}
