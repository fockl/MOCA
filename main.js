(function(){
  let L = 5;
  let beta = 0.0;
  let Model;
  let Update;
  let arrow_flag = true;

  var requestAnimationFrame = window.requestAnimationFrame || 
　　　　　　　　　　　　　　　　　window.mozRequestAnimationFrame ||
                            　window.webkitRequestAnimationFrame || 
　　　　　　　　　　　　　　　　　window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;

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
    const theta = Model.get_state(x, y);

    var show = document.getElementById("show-range");
    var ctx = show.getContext('2d');
    var width = show.width;
    var height = show.height;

    ctx.clearRect((x)/L*width, (y)/L*height, (1)/L*width, (1)/L*height);

    if(arrow_flag){
      draw_arrow(ctx, x, y, width, height, theta);
    }else{
      ctx.fillRect((x)/L*width, (y)/L*height, (1)/L*width, (1)/L*height);
    }
    ctx.fillStyle = `hsl(${theta}, 100%, 50%)`;
    ctx.fill();
  }

  function init_state(){
    this.prev_state = Model.get_all_states();
    console.log(this.prev_state);

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
    Update = "Local";
    init_state();
  }

  function local_update(){
    for(var x=0; x<L; ++x){
      for(var y=0; y<L; ++y){
        Model.local_update_local(x, y);

        if(this.prev_state[x][y]!=Model.get_state(x, y)){
          draw_xy(x,y);
        }
        this.prev_state[x][y] = Model.get_state(x, y);
      }
    }
    /* Too slow
    var {x,y} = Model.local_update();
    if(this.prev_state[x][y]!=Model.get_state(x,y)){
      draw_xy(x, y);
    }
    this.prev_state[x][y] = Model.get_state(x,y);
    */
  }

  function Wolff_update(){
    var xs = [];
    var ys = [];

    while(xs.length<=L){
      var x = Math.floor(Math.random()*L);
      var y = Math.floor(Math.random()*L);
      var {xs:xs_tmp, ys:ys_tmp} = Model.Wolff_update(x, y);
      xs = xs.concat(xs_tmp);
      ys = ys.concat(ys_tmp);
    }

    for(var i=0; i<xs.length; ++i){
      if(this.prev_state[xs[i]][ys[i]]!=Model.get_state(xs[i], ys[i])){
        draw_xy(xs[i], ys[i]);
      }
      this.prev_state[xs[i]][ys[i]] = Model.get_state(xs[i], ys[i]);
    }
  }

  function Event_chain_update(){
    var {x, y} = Model.Event_chain_update();
    draw_xy(x,y);
  }

  function update(){
    if(Update == "Local"){
      local_update();
    }else if(Update == "Wolff"){
      Wolff_update();
    }else if(Update == "Event-chain"){
      Event_chain_update();
    }
    window.requestAnimationFrame(update);
  }

  init();
  update();

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
  arrow_button.onclick = function(e){
    arrow_flag = true;
    for(var x=0; x<this.L; ++x){
      for(var y=0; y<this.L; ++y){
        draw_xy(x,y);
        this.prev_state[x][y] = Model.get_state(x, y);
      }
    }
  };
  block_button.onclick = function(e){
    arrow_flag = false;
    for(var x=0; x<this.L; ++x){
      for(var y=0; y<this.L; ++y){
        draw_xy(x,y);
        this.prev_state[x][y] = Model.get_state(x, y);
      }
    }
  };

  document.getElementById("Ising_button").onclick = function(e){
    delete Model;
    Model = new Ising(L,-1,beta);
  };
  document.getElementById("XY_button").onclick = function(e){
    delete Model;
    Model = new XY(L,-1,beta);
  };
  document.getElementById("local_update_button").onclick = function(e){
    delete Update;
    Update = "Local";
  };
  document.getElementById("Wolff_update_button").onclick = function(e){
    delete Update;
    Update = "Wolff";
  };
  document.getElementById("Event-chain_update_button").onclick = function(e){
    delete Update;
    Update = "Event-chain";
  };
})();
