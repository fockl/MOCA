//import {Ising} from "./Ising.js";

/*class Ising{
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
}*/


(function(){
  let L = 5;
  let beta = 0.0;
  let Model;
  let arrow_flag = true;

  function calc_posx(x, y, theta){
    return x*Math.cos(theta) + y*Math.sin(theta);
  }

  function calc_posy(x, y, theta){
    return -x*Math.sin(theta) + y*Math.cos(theta);
  }

  function draw_arrow(ctx, x, y, width, height, theta_orig){
    let ratiox = width/L;
    let ratioy = height/L;
    let shiftx = x+0.5;
    let shifty = y+0.5;
    let theta = Math.PI * theta_orig/180.0;
    let tmpx = calc_posx(0.0, -0.5, theta);
    let tmpy = calc_posy(0.0, -0.5, theta);
    ctx.beginPath();
    ctx.moveTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    tmpx = calc_posx(-0.5, 0.0, theta);
    tmpy = calc_posy(-0.5, 0.0, theta);
    ctx.lineTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    tmpx = calc_posx(-0.25, 0.0, theta);
    tmpy = calc_posy(-0.25, 0.0, theta);
    ctx.lineTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    tmpx = calc_posx(-0.25, 0.5, theta);
    tmpy = calc_posy(-0.25, 0.5, theta);
    ctx.lineTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    tmpx = calc_posx(0.25, 0.5, theta);
    tmpy = calc_posy(0.25, 0.5, theta);
    ctx.lineTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    tmpx = calc_posx(0.25, 0.0, theta);
    tmpy = calc_posy(0.25, 0.0, theta);
    ctx.lineTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    tmpx = calc_posx(0.5, 0.0, theta);
    tmpy = calc_posy(0.5, 0.0, theta);
    ctx.lineTo((tmpx+shiftx)*ratiox, (tmpy+shifty)*ratioy);
    ctx.closePath();
  }

  function draw_xy(x, y){
    var show = document.getElementById("show-range");
    var ctx = show.getContext('2d');
    var width = show.width;
    var height = show.height;

    ctx.clearRect((x)/L*width, (y)/L*height, (x+1)/L*width, (y+1)/L*height);

    const theta = Model.get_state(x, y);

    if(arrow_flag){
      draw_arrow(ctx, x, y, width, height, theta);
      ctx.fillStyle = `hsl(${theta}, 100%, 50%)`;
      ctx.fill();
    }else{
      ctx.fillRect((x)/L*show.width, (y)/L*show.height, (x+1)/L*show.width, (y+1)/L*show.height);
      ctx.fillStyle = `hsl(${theta}, 100%, 50%)`;
    }

  }

  function init_state(){

    var show = document.getElementById("show-range");
    var ctx = show.getContext('2d');
    ctx.clearRect(0, 0, show.width, show.height);

    console.log(`set ${L}x${L} spins`);

    for(let x=0; x<L; ++x){
      for(let y=0; y<L; ++y){
        draw_xy(x,y);
      }
    }

    return;
  }

  function init(){
    Model = new Ising(L,-1,0);
    //Model = new XY(L,-1,0);
    init_state();
  }

  function local_update(){
    for(var x=0; x<L; ++x){
      for(var y=0; y<L; ++y){
        Model.local_update_local(x, y);
        draw_xy(x,y);
      }
    }
    setTimeout(local_update, 0);
  }

  init();
  local_update();

  var out_size = document.getElementById("sizeo");
  out_size.value = L;

  out_size.addEventListener('keyup', SizeKeyUp);
  function SizeKeyUp(){
    console.log(out_size.value);
    if(isNaN(out_size.value)) return;
    if(Number(out_size.value)===0) return;
    if(L===Number(out_size.value)) return;
    var resizing = document.querySelector("#resizing");
    resizing.innerHTML = "RESIZING..."; // cannot be displayed ???

    L = Number(out_size.value);
    if(L<1) L=1;
    //if(L>10000) L=10000;
    out_size.value = L;
    Model.update_L(L);
    init_state();

    resizing.innerHTML = "";
  }

  var slider = document.getElementById("slider1");
  var output = document.getElementById("slider1o");

  var input = slider.getElementsByTagName('input')[0];
  var root = document.documentElement;
  var dragging = false;
  var value = output.value;
  var width = input.clientWidth/2;

  var set_value = function(){
    input.style.left = (value*slider.clientWidth - input.clientWidth/2) + 'px';
    output.value = value;
    Model.update_beta(value);
    beta = value;
  };
  set_value();

  output.addEventListener('keyup', onKeyUp);
  function onKeyUp(){
    console.log("onKeyUp");
    if(isNaN(output.value)) return;
    dot_flag = false;
    if(output.value.length>0){
      if(output.value[output.value.length-1]==='.') dot_flag = true;
    }
    value = Number(output.value);
    if(value<0){
      value = 0;
    }else if(value>1){
      value = 1;
    }
    if(dot_flag) value += '.';
    set_value();
  }

  slider.onclick = function(evt){
    dragging = true;
    document.onmousemove(evt);
    document.onmouseup();
  };

  input.onmousedown = function(evt){
    dragging = true;
    return false;
  };

  document.onmouseup = function(evt){
    if(dragging){
      dragging = false;
      output.value = value;
    }
  };

  document.onmousemove = function(evt){
    if(dragging){
      if(!evt){
        evt = window.event;
      }
      var left = evt.clientX;
      var rect = slider.getBoundingClientRect();
      value = (left-rect.left-width)/slider.clientWidth;
      if(value<0){
        value = 0;
      }else if(value > 1){
        value = 1;
      }
      set_value();
      return false;
    }
  };

  var arrow_button = document.getElementById("arrow_change_button");
  var block_button = document.getElementById("block_change_button");
  console.log(arrow_button);
  console.log(block_button);
  arrow_button.onclick = function(e){arrow_flag = true};
  block_button.onclick = function(e){arrow_flag = false};

  document.getElementById("Ising_button").onclick = function(e){
    delete Model;
    Model = new Ising(L,-1,beta);
  };
  document.getElementById("XY_button").onclick = function(e){
    delete Model;
    Model = new XY(L,-1,beta);
  };
})();
