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
    this.Wolff_Add_flag = [];
    for(let x=0; x<L; ++x){
      this.state.push([]);
      this.Wolff_Add_flag.push([]);
      for(let y=0; y<L; ++y){
        this.state[x].push(360*Math.random());
        this.Wolff_Add_flag[x].push(false);
      }
    }
    return;
  }

  update_beta(beta){
    this.beta = beta;
    return;
  }

  local_update_local(x, y){
    var right = this.state[(x+1)%this.L][y];
    var left  = this.state[(x-1+this.L)%this.L][y];
    var up    = this.state[x][(y+1)%this.L];
    var down  = this.state[x][(y-1+this.L)%this.L];

    let x_sum = Math.cos(up*Math.PI/180.0) + Math.cos(down*Math.PI/180.0) + Math.cos(right*Math.PI/180.0) + Math.cos(left*Math.PI/180.0);
    let y_sum = Math.sin(up*Math.PI/180.0) + Math.sin(down*Math.PI/180.0) + Math.sin(right*Math.PI/180.0) + Math.sin(left*Math.PI/180.0);
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

  Wolff_update_inner(x, y, base_theta, base_x, base_y){
    if(this.Wolff_Add_flag[x][y]) return;
    this.Wolff_Add_flag[x][y] = true;

    var orig_spin = this.state[x][y];

    this.state[x][y] += 90-base_theta;
    this.state[x][y] = -this.state[x][y];
    this.state[x][y] -= 90-base_theta;
    if(this.state[x][y]<0) this.state[x][y] += 360.0;
    if(this.state[x][y]>360.0) this.state[x][y] -= 360.0;


    var right = this.state[(x+1)%this.L][y];
    var left  = this.state[(x-1+this.L)%this.L][y];
    var up    = this.state[x][(y+1)%this.L];
    var down  = this.state[x][(y-1+this.L)%this.L];

    var orig_spin_inner = Math.cos(orig_spin*Math.PI/180.0)*base_x + Math.sin(orig_spin*Math.PI/180.0)*base_y;

    var right_inner = Math.cos(right*Math.PI/180.0)*base_x + Math.sin(right*Math.PI/180.0)*base_y;
    var left_inner  = Math.cos(left*Math.PI/180.0)*base_x  + Math.sin(left*Math.PI/180.0)*base_y;
    var up_inner    = Math.cos(up*Math.PI/180.0)*base_x    + Math.sin(up*Math.PI/180.0)*base_y;
    var down_inner  = Math.cos(down*Math.PI/180.0)*base_x  + Math.sin(down*Math.PI/180.0)*base_y;

    if(Math.random()<1-Math.exp(2*this.beta*this.J*right_inner*orig_spin_inner)){
      this.Wolff_update_inner((x+1)%this.L, y, base_theta, base_x, base_y);
    }
    if(Math.random()<1-Math.exp(2*this.beta*this.J*left_inner*orig_spin_inner)){
      this.Wolff_update_inner((x-1+this.L)%this.L, y, base_theta, base_x, base_y);
    }
    if(Math.random()<1-Math.exp(2*this.beta*this.J*up_inner*orig_spin_inner)){
      this.Wolff_update_inner(x, (y+1)%this.L, base_theta, base_x, base_y);
    }
    if(Math.random()<1-Math.exp(2*this.beta*this.J*down_inner*orig_spin_inner)){
      this.Wolff_update_inner(x, (y-1+this.L)%this.L, base_theta, base_x, base_y);
    }
  }

  Wolff_update(x, y){
    for(var i=0; i<this.L; ++i){
      for(var j=0; j<this.L; ++j){
        this.Wolff_Add_flag[i][j] = false;
      }
    }
    var base_theta = Math.random()*360.0;
    var base_x = Math.cos(base_theta*Math.PI/180.0);
    var base_y = Math.sin(base_theta*Math.PI/180.0);

    this.Wolff_update_inner(x, y, base_theta, base_x, base_y);
  }
}


