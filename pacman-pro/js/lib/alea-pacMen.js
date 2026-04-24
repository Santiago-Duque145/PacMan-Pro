/**
 * ╔══════════════════════════════════════════╗
 * ║         alea-pacMen  v1.0.0              ║
 * ║  Generador PRNG para juego Pac-Man       ║ 
 * ║  Método: Cuadrado Medio (Von Neumann)    ║
 * ║  Semilla: performance.now() / hrtime     ║
 * ╚══════════════════════════════════════════╝
 */
;(function(root, factory){
    if(typeof module!=='undefined') module.exports=factory();
    else root.AleaPacMen=factory();
  }(typeof self!=='undefined'?self:this,function(){
    'use strict';
  
    /* ── Reloj del procesador como semilla ── */
    function _cpuClock(){
      if(typeof performance!=='undefined'&&performance.now)
        return Math.floor(performance.now()*10000)&0x7fffffff;
      return Date.now()&0x7fffffff;
    }
  
    /* ── Normaliza semilla a n dígitos ── */
    function _normSeed(raw, d){
      const MIN=Math.pow(10,d-1), MAX=Math.pow(10,d)-1;
      let s=(raw==null)?_cpuClock():Math.abs(Math.floor(raw));
      return MIN+(s%(MAX-MIN+1));
    }
  
    /* ── Paso del Cuadrado Medio ── */
    function _midStep(x, d){
      const N=Math.pow(10,d), N2=Math.pow(10,d*2);
      const lo=Math.floor(d/2);
      return Math.floor((x*x%N2)/Math.pow(10,lo))%N;
    }
  
    /* ── LCG (Numerical Recipes) ── */
    const LCG={A:1664525,C:1013904223,M:0x100000000,
      step(x){return(Math.imul(this.A,x)+this.C)>>>0;}};
  
    /* ══════════ Constructor ══════════ */
    function AleaPacMen(opts){
      opts=opts||{};
      this._d     =(opts.digits===6)?6:4;
      this._method=(opts.method==='lcg')?'lcg':'midsquare';
      this._state =_normSeed(opts.seed??null,this._d);
      this._seed0 =this._state;
      this._count =0;
    }
  
    AleaPacMen.prototype={
      constructor:AleaPacMen,
      get seed(){return this._seed0;},
      get count(){return this._count;},
  
      /* Siguiente valor ∈[0,1) */
      next(){
        if(this._method==='lcg'){
          this._state=LCG.step(this._state);
          this._count++;
          return this._state/LCG.M;
        }
        const prev=this._state;
        this._state=_midStep(this._state,this._d);
        this._count++;
        if(this._state===0||this._state===prev){
          this._state=_normSeed(null,this._d);
          this._state=_midStep(this._state,this._d);
        }
        return this._state/Math.pow(10,this._d);
      },
  
      intBetween(a,b){
        if(a>b){let t=a;a=b;b=t;}
        return a+Math.floor(this.next()*(b-a+1));
      },
      floatBetween(a,b){return a+this.next()*(b-a);},
      chance(p){return this.next()<(p??0.5);},
      pick(arr){return arr[Math.floor(this.next()*arr.length)];},
      shuffle(arr){
        for(let i=arr.length-1;i>0;i--){
          const j=this.intBetween(0,i);
          [arr[i],arr[j]]=[arr[j],arr[i]];
        }
        return arr;
      },
  
      /* ─── API Pac-Man ─── */
      ghostDirection(exclude){
        const D=['UP','DOWN','LEFT','RIGHT'];
        const v=exclude?.length?D.filter(d=>!exclude.includes(d)):D;
        return this.pick(v.length?v:D);
      },
      gridPosition(cols,rows,forbidden){
        const b=forbidden||[];
        for(let i=0;i<200;i++){
          const c=this.intBetween(0,cols-1),r=this.intBetween(0,rows-1);
          if(!b.some(([bc,br])=>bc===c&&br===r)) return{col:c,row:r};
        }
        return{col:0,row:0};
      },
      ghostSpeed(level,base=60){
        const f=1+(level-1)*0.08;
        const n=this.floatBetween(-0.05,0.10);
        return Math.round(base*(f+n));
      },
      ghostMode(level){
        const r=this.next();
        const pC=Math.min(0.25+level*0.04,0.75);
        const pS=Math.max(0.30-level*0.02,0.10);
        if(r<pC) return 'chase';
        if(r<pC+pS) return 'scatter';
        return 'frightened';
      },
      generateFood(cols,rows,walls,density=0.85){
        const pellets=[],powerUps=[];
        for(let r=0;r<rows;r++)
          for(let c=0;c<cols;c++){
            if(walls?.[r]?.[c]) continue;
            const v=this.next();
            if(v<density) pellets.push([c,r]);
            else if(v<density+0.04) powerUps.push([c,r]);
          }
        return{pellets,powerUps};
      },
      frightenDuration(level){
        return Math.round(Math.max(6000-level*300,1500)+this.floatBetween(-500,500));
      },
      fruitBonus(level){
        const t=[100,200,300,500,700,1000,2000,3000,5000];
        return t[Math.min(level-1,8)]*(this.chance(0.15)?2:1);
      },
      reset(seed){
        this._state=_normSeed(seed??null,this._d);
        this._seed0=this._state; this._count=0;
      },
      exportState(){return{state:this._state,digits:this._d,method:this._method,count:this._count,seed:this._seed0};},
      importState(s){Object.assign(this,{_state:s.state,_d:s.digits,_method:s.method,_count:s.count,_seed0:s.seed});}
    };
  
    AleaPacMen.create=(opts)=>new AleaPacMen(opts);
    AleaPacMen.VERSION='1.0.0';
    return AleaPacMen;
  }));