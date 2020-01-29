(function(){
  var L = 5;

  var state = []
  const J = -1;

  var local_prob = [];

  var arrow_flag = true;

  function draw_xy(x, y){
    var show = document.getElementById("show-range");
    var ctx = show.getContext('2d');
    var width = show.width;
    var height = show.height;

    ctx.clearRect((x)/L*width, (y)/L*height, (x+1)/L*width, (y+1)/L*height);

    if(arrow_flag){
      if(state[x][y]==1){
        ctx.beginPath();
        ctx.moveTo((x+0.5)/L*width, y/L*height);
        ctx.lineTo((x)/L*width, (y+0.5)/L*height);
        ctx.lineTo((x+0.25)/L*width, (y+0.5)/L*height);
        ctx.lineTo((x+0.25)/L*width, (y+1.0)/L*height);
        ctx.lineTo((x+0.75)/L*width, (y+1.0)/L*height);
        ctx.lineTo((x+0.75)/L*width, (y+0.5)/L*height);
        ctx.lineTo((x+1.0)/L*width, (y+0.5)/L*height);
        ctx.closePath();

        ctx.fillStyle = 'red';
      }else{
        ctx.beginPath();
        ctx.moveTo((x+0.5)/L*width, (y+1.0)/L*height);
        ctx.lineTo((x)/L*width, (y+0.5)/L*height);
        ctx.lineTo((x+0.25)/L*width, (y+0.5)/L*height);
        ctx.lineTo((x+0.25)/L*width, (y)/L*height);
        ctx.lineTo((x+0.75)/L*width, (y)/L*height);
        ctx.lineTo((x+0.75)/L*width, (y+0.5)/L*height);
        ctx.lineTo((x+1.0)/L*width, (y+0.5)/L*height);
        ctx.closePath();

        ctx.fillStyle = 'blue';
      }
    }else{
      ctx.fillRect((x)/L*show.width, (y)/L*show.height, (x+1)/L*show.width, (y+1)/L*show.height);
      if(state[x][y]==1){
        ctx.fillStyle = 'red';
      }else{
        ctx.fillStyle = 'blue';
      }
    }

    ctx.fill();
  }

  function init_state(){

    var show = document.getElementById("show-range");
    var ctx = show.getContext('2d');
    ctx.clearRect(0, 0, show.width, show.height);

    console.log(`set ${L}x${L} spins`);

    state = [];
    for(var x=0; x<L; x++){
      state.push([]);
      for(var y=0; y<L; y++){
        var tmp = Math.random();
        if(tmp>=0.5){
          state[x].push(1);
        }else{
          state[x].push(-1);
        }

        draw_xy(x, y);
      }
    }
  }

  function init(){
    var show = document.createElement("canvas");
    show.setAttribute("class", "show-range");
    show.setAttribute("id", "show-range");
    show.style.width = 300 + "px";
    show.style.height = 300 + "px";
    show.style.left = 250 + "px";
    show.style.top = 150 + "px";
    show.style.position = "absolute";
    document.body.appendChild(show);

    init_state();

    for(var i=0; i<2; ++i){
      local_prob.push([]);
      for(var j=0; j<5; ++j){
        local_prob[i].push(1);
      }
    }
  }

  function local_prob_update(beta){
    for(var i=0; i<2; ++i){
      for(var j=0; j<5; ++j){
        now = i*2-1;
        around = j*2-4;
        E_now = J*now*around;
        E_after = -E_now;
        //local_prob[i][j] = Math.exp(-beta*(E_after-E_now)); // Metropolis
        var a = Math.exp(-beta*E_after);
        var b = Math.exp(-beta*E_now);
        local_prob[i][j] = a/(a+b); // heatbath
      }
    }
  }

  function local_update_local(x, y){
    var around = state[(x+1)%L][y]+state[(x-1+L)%L][y]+state[x][(y+1)%L]+state[x][(y-1+L)%L];
    var around_index = (around+4)/2;
    var now_index = (state[x][y]+1)/2;
    if(Math.random()<local_prob[now_index][around_index]){
      state[x][y] *= -1;
    }else{
      //console.log("rejected");
    }
  }

  function local_update(){
    //console.log("local_update() start");
    for(var x=0; x<L; ++x){
      for(var y=0; y<L; ++y){
        local_update_local(x, y);
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
    local_prob_update(value);
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
})();
