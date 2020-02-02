//export class XY{
class XY{
  constructor(L, J, beta){
    this.J = J;

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
        this.state[x].push(360*Math.random());
      }
    }
    return;
  }

  update_beta(beta){
    this.beta = beta;
    return;
  }

  local_update_local(x, y){
    let x_sum = Math.cos(this.state[x][(y+1)%this.L]*Math.PI/180.0) + Math.cos(this.state[x][(y-1+this.L)%this.L]*Math.PI/180.0) + Math.cos(this.state[(x+1)%this.L][y]*Math.PI/180.0) + Math.cos(this.state[(x-1+this.L)%this.L][y]*Math.PI/180.0);
    let y_sum = Math.sin(this.state[x][(y+1)%this.L]*Math.PI/180.0) + Math.sin(this.state[x][(y-1+this.L)%this.L]*Math.PI/180.0) + Math.sin(this.state[(x+1)%this.L][y]*Math.PI/180.0) + Math.sin(this.state[(x-1+this.L)%this.L][y]*Math.PI/180.0);
    let x_now = Math.cos(this.state[x][y]*Math.PI/180.0);
    let y_now = Math.sin(this.state[x][y]*Math.PI/180.0);

    let new_theta = 360*Math.random();

    let x_after = Math.cos(new_theta*Math.PI/180.0);
    let y_after = Math.sin(new_theta*Math.PI/180.0);

    let E_now = this.J*(x_sum*x_now+y_sum*y_now);
    let E_after = this.J*(x_sum*x_after+y_sum*y_after);

    let a = Math.exp(-this.beta*E_after);
    let b = Math.exp(-this.beta*E_now);

    if(Math.random()<a/(a+b)){
      this.state[x][y] = new_theta;
    }


    return;
  }

  get_state(x, y){
    return this.state[x][y];
  }
}


