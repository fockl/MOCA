//export class Ising{
class Ising{
  constructor(L, J, beta){
    this.J = J;

    this.local_prob = [];
    for(var i=0; i<2; ++i){
      this.local_prob.push([]);
      for(var j=0; j<5; ++j){
        this.local_prob[i].push(1);
      }
    }
    this.update_L(L);
    this.update_beta(beta);
    return;
  }

  update_L(L){
    this.L = L;
    this.state = [];
    for(let x=0; x<L; ++x){
      this.state.push([]);
      for(let y=0; y<L; ++y){
        let tmp = Math.random();
        if(tmp>=0.5) this.state[x].push(-1);
        else         this.state[x].push(1);
      }
    }
    return;
  }

  update_beta(beta){
    this.beta = beta;
    for(let i=0; i<2; ++i){
      for(let j=0; j<5; ++j){
        let now = i*2-1;
        let around = j*2-4;
        let E_now = this.J*now*around;
        let E_after = -E_now;
        let a = Math.exp(-beta*E_after);
        let b = Math.exp(-beta*E_now);
        this.local_prob[i][j] = a/(a+b);
      }
    }
    return;
  }

  local_update_local(x, y){
    var around = Math.round((this.state[(x+1)%this.L][y]+this.state[(x-1+this.L)%this.L][y]+this.state[x][(y+1)%this.L]+this.state[x][(y-1+this.L)%this.L]));
    var around_index = (around+4)/2;
    var now_index = (Math.round(this.state[x][y]+1))/2;
    if(Math.random()<this.local_prob[now_index][around_index]){
      this.state[x][y] *= -1;
    }
    return;
  }

  get_state(x, y){
    return (this.state[x][y]+1)*90;
  }
}


