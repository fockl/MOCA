//export class XY{
class XY{
  constructor(L, J, beta){
    this.J = J;

    this.update_L(L);
    this.update_beta(beta);

    this.target_x = 0;
    this.target_y = 0;
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

  local_update(){
    var x = this.target_x;
    var y = this.target_y;
    x %= this.L;
    y %= this.L;
    this.local_update_local(x,y);
    this.target_x += 1;
    this.target_y += Math.floor(this.target_x/this.L);
    this.target_x %= this.L;
    this.target_y %= this.L;
    return {x:x,y:y}
  }

  get_state(x, y){
    return this.state[x][y];
  }

  get_all_states(){
    return this.state;
  }

  Wolff_update_inner(x, y, base_theta, base_x, base_y, xs, ys){
    if(this.Wolff_Add_flag[x][y]) return;
    this.Wolff_Add_flag[x][y] = true;

    xs.push(x);
    ys.push(y);

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
      this.Wolff_update_inner((x+1)%this.L, y, base_theta, base_x, base_y, xs, ys);
    }
    if(Math.random()<1-Math.exp(2*this.beta*this.J*left_inner*orig_spin_inner)){
      this.Wolff_update_inner((x-1+this.L)%this.L, y, base_theta, base_x, base_y, xs, ys);
    }
    if(Math.random()<1-Math.exp(2*this.beta*this.J*up_inner*orig_spin_inner)){
      this.Wolff_update_inner(x, (y+1)%this.L, base_theta, base_x, base_y, xs, ys);
    }
    if(Math.random()<1-Math.exp(2*this.beta*this.J*down_inner*orig_spin_inner)){
      this.Wolff_update_inner(x, (y-1+this.L)%this.L, base_theta, base_x, base_y, xs, ys);
    }
  }

  Wolff_update(x, y){
    var base_theta = Math.random()*360.0;
    var base_x = Math.cos(base_theta*Math.PI/180.0);
    var base_y = Math.sin(base_theta*Math.PI/180.0);

    var xs = [];
    var ys = [];

    this.Wolff_update_inner(x, y, base_theta, base_x, base_y, xs, ys);

    for(var i=0; i<xs.length; ++i){
      this.Wolff_Add_flag[xs[i]][ys[i]] = false;
    }

    return {xs:xs, ys:ys};
  }

  calc_dtheta_Event_chain(pos_theta){
    var pos_theta_init = pos_theta;
    if(pos_theta<0.0){
      pos_theta += 360.0;
    }else if(pos_theta>=360.0){
      pos_theta -= 360.0;
    }
    var dE = -Math.log(1.0-Math.random())/this.beta;
    var dE_init = dE;
    var dtheta = 0.0;
    if(this.J<0.0){
      if(pos_theta<=180.0){
        if(dE>= -this.J*(1.0+Math.cos(pos_theta*Math.PI/180.0))){
          dE -= -this.J*(1.0+Math.cos(pos_theta*Math.PI/180.0));
          dtheta += 360.0-pos_theta;
          pos_theta = 0.0;
        }else{
          dtheta += -pos_theta;
          dE += -this.J*(1.0-Math.cos(pos_theta*Math.PI/180.0));
          pos_theta = 0.0;
        }
      }else{
        dtheta += 360.0-pos_theta;
        pos_theta = 0.0;
      }
      var shift = Math.floor(dE/(2.0*(-this.J)));
      dE -= shift*2.0*(-this.J);
      dtheta += 360.0*shift;

      var tmp = Math.acos(1.0-dE/(-this.J))*180.0/Math.PI - pos_theta;

      dtheta += tmp;

      /*
      if(dtheta<0.0){
        console.log(dtheta, pos_theta_init, this.J, dE_init);
      }
      */

      return dtheta;
    }else{
      if(pos_theta>=180.0){
        if(dE>= this.J*(1.0-Math.cos(pos_theta*Math.PI/180.0))){
          dE -=  this.J*(1.0-Math.cos(pos_theta*Math.PI/180.0));
          dtheta += 360.0-pos_theta;
          dtheta += 180.0;
          pos_theta = 180.0;
        }else{
          dtheta += (180.0-pos_theta);
          dE +=  this.J*(1.0+Math.cos(pos_theta*Math.PI/180.0));
          pos_theta = 180.0;
        }
      }else{
        dtheta += 180.0-pos_theta;
        pos_theta = 180.0;
      }
      var shift = Math.floor(dE/(2.0*this.J));
      dE -= shift*2.0*this.J;
      dtheta += 360.0*shift;

      var tmp = (360.0-Math.acos(1.0+dE/this.J)*180.0/Math.PI) - pos_theta;

      dtheta += tmp;

      return dtheta;
    }
  }

  Event_chain_update(){
    var pos_x = this.target_x%this.L;
    var pos_y = this.target_y%this.L;
    var pos_state = this.state[pos_x][pos_y];
    var right = this.calc_dtheta_Event_chain(pos_state-this.state[(pos_x+1)%this.L][pos_y]);
    var left = this.calc_dtheta_Event_chain(pos_state-this.state[(pos_x-1+this.L)%this.L][pos_y]);
    var up = this.calc_dtheta_Event_chain(pos_state-this.state[pos_x][(pos_y+1)%this.L]);
    var down = this.calc_dtheta_Event_chain(pos_state-this.state[pos_x][(pos_y-1+this.L)%this.L]);

    var dtheta = right;
    var next_x = (pos_x+1)%this.L;
    var next_y = pos_y;
    if(left<dtheta){
      dtheta = left;
      next_x = (pos_x-1+this.L)%this.L;
      next_y = pos_y;
    }
    if(up<dtheta){
      dtheta = up;
      next_x = pos_x;
      next_y = (pos_y+1)%this.L;
    }
    if(down<dtheta){
      dtheta = down;
      next_x = pos_x;
      next_y = (pos_y-1+this.L)%this.L;
    }

    //console.log(right, left, up, down, dtheta);

    this.state[pos_x][pos_y] += dtheta;
    this.target_x = next_x;
    this.target_y = next_y;

    if(this.state[pos_x][pos_y]<0.0){
      this.state[pos_x][pos_y] = -this.state[pos_x][pos_y];
      var shift = Math.floor(this.state[pos_x][pos_y]/360.0);
      this.state[pos_x][pos_y] -= 360.0*(shift+1);
      this.state[pos_x][pos_y] = -this.state[pos_x][pos_y];
    }else{
      var shift = Math.floor(this.state[pos_x][pos_y]/360.0);
      this.state[pos_x][pos_y] -= 360.0*shift;
    }

    return {x:pos_x, y:pos_y};
  }
}


