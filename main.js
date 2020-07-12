(function(){
  var L = 5;
  var beta = 1.0E-3;
  var Model;
  var Update;
  var arrow_flag = true;
  var prev_state;

  var array_max = 101;
  var energy_array = [];
  var magnet_array = [];
  var energy_cor_array = [];
  var magnet_cor_array = [];
  var cor_counter_array = [];
  var energy_ave = 0.0;
  var magnet_ave = 0.0;

  var EPS = 1.0E-12;

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

    ctx.fillStyle = `hsl(${theta}, 100%, 50%)`;
    if(arrow_flag){
      draw_arrow(ctx, x, y, width, height, theta);
    }else{
      ctx.beginPath();
      ctx.fillRect((x)/L*width, (y)/L*height, (1)/L*width, (1)/L*height);
      ctx.closePath();
    }
    ctx.fill();
  }

  function show_edge_init(name){
    var show = document.getElementById(name);
    var ctx = show.getContext('2d');
    ctx.clearRect(0, 0, show.width, show.height);
    ctx.beginPath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.rect(0, 0, show.width, show.height);
    ctx.closePath();
    ctx.stroke();
  }

  function draw_energy_and_magnet(){
    var inv_array_max = 1.0/(array_max-1.0);

    var show1 = document.getElementById("show-energy");
    var ctx1 = show1.getContext('2d');
    var width1 = show1.width;
    var height1 = show1.height;

    show_edge_init("show-energy");

    ctx1.beginPath();
    ctx1.strokeStyle = "#f00";
    ctx1.lineWidth = 2;
    ctx1.moveTo(width1, (2.0-energy_array[0])/4.0*height1);
    for(var i=1; i<energy_array.length; ++i){
      ctx1.lineTo(width1-i*inv_array_max*width1, (2.0-energy_array[i])/4.0*height1);
    }
    ctx1.stroke();

    var show2 = document.getElementById("show-magnet");
    var ctx2 = show2.getContext('2d');
    var width2 = show2.width;
    var height2 = show2.height;

    show_edge_init("show-magnet");

    ctx2.beginPath();
    ctx2.strokeStyle = "#00f";
    ctx2.lineWidth = 2;
    ctx2.moveTo(width2, (1.0-magnet_array[0])*height2);
    for(var i=1; i<magnet_array.length; ++i){
      ctx2.lineTo(width2-i*inv_array_max*width2, (1.0-magnet_array[i])*height2);
    }
    ctx2.stroke();
  }

  function draw_cor_energy_and_magnet(){
    var inv_array_max = 1.0/(array_max-1.0);

    var show1 = document.getElementById("show-energy-cor");
    var ctx1 = show1.getContext('2d');
    var width1 = show1.width;
    var height1 = show1.height;

    //console.log(energy_sum*energy_sum);
    if(cor_counter_array.length>0){
      if(cor_counter_array[0]%100==0){
        console.log(energy_cor_array[0], energy_cor_array[0]-energy_ave*energy_ave);
        console.log(energy_cor_array);
        console.log(magnet_cor_array[0], magnet_cor_array[0]-magnet_ave*magnet_ave);
        console.log(magnet_cor_array);
      }
    }
    //console.log(energy_cor_array);
    //console.log(cor_counter_array);

    //show_edge_init("show-energy-cor");

    ctx1.beginPath();
    ctx1.strokeStyle = "#f00";
    ctx1.lineWidth = 2;
    if(cor_counter_array.length>0){
      var cor_energy_normalize = energy_cor_array[0]-energy_ave*energy_ave + EPS/cor_counter_array[0];
      var inv_cor_energy_normalize = 1.0/cor_energy_normalize;
      ctx1.moveTo(0, 0);
      for(var i=1; i<energy_cor_array.length; ++i){
        var cor_value = (energy_cor_array[i] - energy_ave*energy_ave)*inv_cor_energy_normalize;
        if(cor_value<0.0){
          cor_value=0.0;
        }else if(cor_value>1.0){
          cor_value=1.0;
        }
        ctx1.lineTo(i*inv_array_max*width1, (1-cor_value)*height1);

        /*
        cor_value = Math.log(cor_value + EPS)/3.0;
        if(cor_value>0.0){
          cor_value = 0.0;
        }
        ctx1.lineTo(i*inv_array_max*width1, -cor_value*height1);
        */
      }
    }
    ctx1.stroke();

    var show2 = document.getElementById("show-magnet-cor");
    var ctx2 = show2.getContext('2d');
    var width2 = show2.width;
    var height2 = show2.height;

    show_edge_init("show-magnet-cor");

    ctx2.beginPath();
    ctx2.strokeStyle = "#00f";
    ctx2.lineWidth = 2;
    if(cor_counter_array.length>0){
      var cor_magnet_normalize = magnet_cor_array[0]-magnet_ave*magnet_ave + EPS/cor_counter_array[0];
      var inv_cor_magnet_normalize = 1.0/cor_magnet_normalize;
      ctx2.moveTo(0, 0);
      for(var i=1; i<magnet_cor_array.length; ++i){
        var cor_value = (magnet_cor_array[i] - magnet_ave*magnet_ave)*inv_cor_magnet_normalize;
        if(cor_value<0.0){
          cor_value=0.0;
        }else if(cor_value>1.0){
          cor_value=1.0;
        }
        ctx2.lineTo(i*inv_array_max*width2, (1-cor_value)*height2);

        /*
        cor_value = Math.log(cor_value + EPS)/3.0;
        if(cor_value>0.0){
          cor_value = 0.0;
        }
        ctx2.lineTo(i*inv_array_max*width2, -cor_value*height2);
        */
      }
    }
    ctx2.stroke();
  }

  function redraw_all(){
    var show = document.getElementById("show-range");
    var ctx = show.getContext('2d');
    var width = show.width;
    var height = show.height;

    ctx.clearRect(0, 0, width, height);

    if(arrow_flag){
      for(var x=0; x<L; ++x){
        for(var y=0; y<L; ++y){
          var theta = Model.get_state(x, y);
          ctx.fillStyle = `hsl(${theta}, 100%, 50%)`;
          draw_arrow(ctx, x, y, width, height, theta);
          ctx.fill();
          prev_state[x][y] = theta;
        }
      }
    }else{
      for(var x=0; x<L; ++x){
        for(var y=0; y<L; ++y){
          var theta = Model.get_state(x, y);
          ctx.beginPath();
          ctx.fillStyle = `hsl(${theta}, 100%, 50%)`;
          ctx.fillRect(x/L*width, y/L*height, 1/L*width, 1/L*height);
          ctx.closePath();
          ctx.fill();
          prev_state[x][y] = theta;
        }
      }
    }
  }

  function init_state(){
    prev_state = Model.get_all_states();
    //console.log(prev_state);
    
    redraw_all();
    console.log(`set ${L}x${L} spins`);

    var e = Model.calc_energy();
    var m = Model.calc_magnet();

    energy_array = [e];
    magnet_array = [m];

    energy_cor_array = [e*e];
    magnet_cor_array = [m*m];

    energy_ave = e;
    magnet_ave = m;

    cor_counter_array = [1];

    draw_energy_and_magnet();
    //draw_cor_energy_and_magnet();

    return;
  }


  function init(){
    Model = new Ising(L,-1,0);
    //Model = new XY(L,-1,0);
    Update = "Local";
    init_state();

    show_edge_init("show-energy");
    show_edge_init("show-magnet");
    //show_edge_init("show-energy-cor");
    //show_edge_init("show-magnet-cor");
  }

  function cor_init(){
    console.log("cor_init");
    energy_cor_array = [];
    magnet_cor_array = [];
    cor_counter_array = []
    energy_ave = 0.0;
    magnet_ave = 0.0;
  }

  function local_update(){
    for(var x=0; x<L; ++x){
      for(var y=0; y<L; ++y){
        Model.local_update_local(x, y);

        if(prev_state[x][y]!=Model.get_state(x, y)){
          draw_xy(x,y);
        }
        //console.log(x,y,prev_state[x][y], Model.get_state(x,y));
        prev_state[x][y] = Model.get_state(x, y);
      }
    }
    /* Too slow
    var {x,y} = Model.local_update();
    if(prev_state[x][y]!=Model.get_state(x,y)){
      draw_xy(x, y);
    }
    prev_state[x][y] = Model.get_state(x,y);
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
      if(prev_state[xs[i]][ys[i]]!=Model.get_state(xs[i], ys[i])){
        draw_xy(xs[i], ys[i]);
      }
      prev_state[xs[i]][ys[i]] = Model.get_state(xs[i], ys[i]);
    }
  }

  function Event_chain_update(){
    var xs = [];
    var ys = [];

    while(xs.length<=L){
      var {x, y} = Model.Event_chain_update();
      xs.push(x);
      ys.push(y);
    }

    for(var i=0; i<xs.length; ++i){
      if(prev_state[xs[i]][ys[i]]!=Model.get_state(xs[i], ys[i])){
        draw_xy(xs[i], ys[i]);
      }
      prev_state[xs[i]][ys[i]] = Model.get_state(xs[i], ys[i]);
    }
  }

  function update(){
    //console.log(Update);
    if(Update == "Local"){
      local_update();
    }else if(Update == "Wolff"){
      Wolff_update();
    }else if(Update == "Event-chain"){
      Event_chain_update();
    }
    redraw_all();
    window.requestAnimationFrame(update);

    var e = Model.calc_energy();
    var m = Model.calc_magnet();

    energy_array.unshift(e);
    magnet_array.unshift(m);

    if(energy_array.length != magnet_array.length){
      alert("energy_array.length != magnet_array.length");
    }
    if(energy_array.length>array_max){
      energy_array.pop();
      magnet_array.pop();
    }

    if(energy_cor_array.length != magnet_cor_array.length){
      alert("energy_cor_array.length != magnet_cor_array.length");
    }

    if(cor_counter_array.length>0){
      var coef = 1.0/(cor_counter_array[0]+1);

      energy_ave = energy_ave*(1.0-coef) + e*coef;
      magnet_ave = magnet_ave*(1.0-coef) + m*coef;

      for(var i=0; i<energy_cor_array.length; ++i){
        coef = 1.0/(cor_counter_array[i]+1);
        energy_cor_array[i] = energy_cor_array[i]*(1.0-coef) + e*energy_array[i]*coef;
        magnet_cor_array[i] = magnet_cor_array[i]*(1.0-coef) + m*magnet_array[i]*coef;
        cor_counter_array[i] += 1;
      }
    }

    if(energy_cor_array.length < energy_array.length){
      energy_cor_array.push(e*energy_array[energy_cor_array.length]);
      magnet_cor_array.push(m*magnet_array[magnet_cor_array.length]);
      cor_counter_array.push(1);
    }

    draw_energy_and_magnet();
    //draw_cor_energy_and_magnet();
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
    beta = value;
    if(beta<1.0E-3){
      beta = 1.0E-3;
    }else if(beta > 1.0){
      beta = 1.0;
    }
    cor_init();
    Model.update_beta(beta);
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
    if(value<1.0E-3){
      value = 1.0E-3;
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

  arrow_button.onclick = function(e){
    arrow_flag = true;
    console.log(arrow_button);
    redraw_all();
  };
  block_button.onclick = function(e){
    arrow_flag = false;
    console.log(block_button);
    redraw_all();
  };

  document.getElementById("Ising_button").onclick = function(e){
    delete Model;
    Model = new Ising(L,-1,beta);
    redraw_all();
    cor_init();
  };
  document.getElementById("XY_button").onclick = function(e){
    delete Model;
    Model = new XY(L,-1,beta);
    redraw_all();
    cor_init();
  };
  document.getElementById("local_update_button").onclick = function(e){
    delete Update;
    Update = "Local";
    cor_init();
  };
  document.getElementById("Wolff_update_button").onclick = function(e){
    delete Update;
    Update = "Wolff";
    cor_init();
  };
  document.getElementById("Event-chain_update_button").onclick = function(e){
    delete Update;
    Update = "Event-chain";
    cor_init();
  };
})();
