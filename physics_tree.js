// A 2D vector utility
var Vec = function(x, y) {
  this.x = x;
  this.y = y;
}
Vec.prototype = {
  
  // utilities
  dist_from: function(v) { return Math.sqrt(Math.pow(this.x-v.x,2) + Math.pow(this.y-v.y,2)); },
  length: function() { return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2)); },
  
  // new vector returning operations
  add: function(v) { return new Vec(this.x + v.x, this.y + v.y); },
  sub: function(v) { return new Vec(this.x - v.x, this.y - v.y); },
  rotate: function(a) {  // CLOCKWISE
    return new Vec(this.x * Math.cos(a) + this.y * Math.sin(a),
                   -this.x * Math.sin(a) + this.y * Math.cos(a));
  },
  copy: function() { return new Vec(this.x, this.y); },
  
  // in place operations
  scale: function(s) { this.x *= s; this.y *= s; },
  normalize: function() { var d = this.length(); this.scale(1.0/d); }
}

// An abstract fractal object
var Fractal = function(world, depth) {
  //properties
  this.isHead = true;
  this.depth = depth;
  this.rule = new TreeRule();
  this.rad = 30;

  //translation dynamics
  this.m = Math.PI*this.rad*this.rad;
  this.tk = 100;
  this.rk = .05;
  this.tDamping = 0.025;
  this.forceScale = 0.5;

  this.p = new Vec(world.x/2, world.y - this.rad);
  // this.op = new Vec(w.x/2, w.y - this.rad);
  this.v = new Vec(0,0);
  this.a = new Vec(0,0);
  this.eqLength = 170;

  //rotation dynamics
  this.theta = 0;
  this.w = 0;
  this.rDamping = 0;
  this.eqChildThetas = [];

  //world
  this.world = world;

  //nodes
  this.children = this.rule.getChildren(this);

  for(var c=0,clen=this.children.length;c<clen;c++) {
    var child = this.children[c];
    var connection = child.p.sub(this.p);
    this.eqChildThetas.push( Math.atan2(connection.x, connection.y) - this.theta );
  }
}
Fractal.prototype = {
  draw: function(ctx) {
    ctx.fillStyle = "#008000";
    ctx.strokeStyle = "#8B4513";

    //draw children
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        ctx.lineWidth = (5 + this.depth);
        var child = this.children[c];
        ctx.beginPath();
        ctx.moveTo(this.p.x, this.p.y);
        ctx.lineTo(child.p.x, child.p.y);
        ctx.stroke();
        child.draw(ctx);
      }
    }
    //draw self
    // ctx.lineWidth = 2;
    // ctx.beginPath();
    // ctx.arc(this.p.x, this.p.y, this.rad, 0, Math.PI*2, true);
    // ctx.fill();
    // ctx.stroke();
  },
  tick: function(force) {
    force.scale(this.forceScale);
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        var child = this.children[c];
        child.tick(force);
      }
    }
  },
  setRk: function(new_rk) {
    this.rk = new_rk;
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        var child = this.children[c];
        child.setRk(new_rk);
      }
    }
  },
  setTk: function(new_tk) {
    this.tk = new_tk;
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        var child = this.children[c];
        child.setTk(new_tk);
      }
    }
  }
}

// rules for the fractal object - for making a branching tree
var TreeRule = function() {
  // properties
  this.scale = .60;
  this.branchAngles = [Math.PI/6, -Math.PI/6]; //angles of each of the branches
}
TreeRule.prototype = {
  getChildren: function(parentNode) {
    var children = [];
    if(parentNode.depth > 0) {
      if(parentNode.isHead) {
        var p = parentNode.p.add(new Vec(0, -1*parentNode.eqLength));
        children.push( new Node(parentNode, p));
      } else {
        for(var ba=0,balen=this.branchAngles.length;ba<balen;ba++) {
          var vector = parentNode.p.sub(parentNode.parent.p);
          vector.scale(this.scale);
          vector = vector.rotate(this.branchAngles[ba]);
          var p = parentNode.p.add(vector);
          children.push(new Node(parentNode, p));
        }
      }
    }
    return children;
  },
}

// defines node-level behavior of fractal
var Node = function(parent, p) {
  //properties
  this.isHead = false;
  this.depth = parent.depth - 1;
  this.rule = parent.rule;
  this.rad = parent.rad * parent.rule.scale;

  //translational dynamics
  this.m = Math.PI*this.rad*this.rad;
  this.tk = parent.tk * parent.rule.scale * parent.rule.scale;
  this.rk = parent.rk * parent.rule.scale;
  this.tDamping = parent.tDamping;

  this.p = p;
  // this.op = p.copy();
  this.v = parent.v.copy();
  this.a = parent.a.copy();
  this.eqLength = parent.eqLength*parent.rule.scale;

  //rotational dynamics
  this.theta = parent.theta;
  this.w = parent.w;
  this.rDamping = parent.rDamping;

  //world
  this.world = parent.world;

  //nodes
  this.parent = parent;
  this.children = this.rule.getChildren(this);

  var connection = this.p.sub(this.parent.p);
  this.eqParentTheta = Math.atan2(connection.x, connection.y) - this.theta;
  this.eqChildThetas = [];
  for(var c=0,clen=this.children.length;c<clen;c++) {
    var child = this.children[c];
    var connection = child.p.sub(this.p);
    this.eqChildThetas.push( Math.atan2(connection.x, connection.y) - this.theta );
  }
}
Node.prototype = {
  draw: function(ctx) {
    ctx.fillStyle = "#008000";
    ctx.strokeStyle = "#8B4513";

    //draw children
    if(this.depth > 0 && this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        ctx.lineWidth = (2 + this.depth);
        var child = this.children[c];
        ctx.beginPath();
        ctx.moveTo(this.p.x, this.p.y);
        ctx.lineTo(child.p.x, child.p.y);
        ctx.stroke();
        child.draw(ctx);
      }
    }
    //draw self
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, this.rad, 0, Math.PI*2, true);
    ctx.fill();
    ctx.stroke();
  },
  tick: function(force) {
    //calculate acceleration
    this.a.scale(0);
    var alpha = 0;
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        var child = this.children[c];

        //rotational part
        var connection = child.p.sub(this.p);
        var connectionTheta = Math.atan2(connection.x, connection.y) - this.theta;
        var dtheta = connectionTheta - this.eqChildThetas[c];
        if(dtheta > Math.PI) {
          dtheta = -1*Math.PI + (dtheta - Math.PI);
        }
        dtheta = Math.sin(dtheta);

        if(Math.abs(dtheta) > 0.00001) {
          var child_alpha = this.eqLength*(this.rk*dtheta)*2/(this.m*this.rad*this.rad);

          // translational ---> rotational
          var a_from_rotation = connection.rotate(-Math.PI/2);
          a_from_rotation.normalize();
          a_from_rotation.scale( child.m*Math.pow(child.rad,3)*child_alpha/(2*this.m*this.rad) );
          this.a = this.a.add(a_from_rotation);
        }

        //translational part
        var x = this.p.sub(child.p).length() - this.eqLength;
        if(Math.abs(x) >0.00001) {
          var child_a = this.p.sub(child.p);
          child_a.normalize();
          child_a.scale(-1*this.tk*x/this.m);
          this.a = this.a.add(child_a);
        }

        child.tick(force);
      }
    }

    //acceleration from parent
    //rotational part
    var connection = this.parent.p.sub(this.p);
    var connectionTheta = Math.atan2(connection.x, connection.y) - this.theta;
    var dtheta = connectionTheta - this.eqParentTheta;
    if(dtheta > Math.PI) {
          dtheta = -1*Math.PI + (dtheta - Math.PI);
        }
        dtheta = Math.sin(dtheta);

    if(Math.abs(dtheta) >0.00001) {
      var parent_alpha = this.parent.eqLength*(this.rk*dtheta)*2/(this.m*this.rad*this.rad);

      //translational ---> rotational
      var a_from_rotation = connection.rotate(-Math.PI/2);
      a_from_rotation.normalize();
      a_from_rotation.scale( this.parent.m*Math.pow(this.parent.rad,3)*parent_alpha/(2*this.m*this.rad) );
      this.a = this.a.add(a_from_rotation);
    }

    //translational part
    var x = this.p.sub(this.parent.p).length() - this.parent.eqLength;
    if(Math.abs(x) >0.00001) {
      var parent_a = this.p.sub(this.parent.p);
      parent_a.normalize();
      parent_a.scale(-1*this.tk*x/this.m);
      this.a = this.a.add(parent_a);
    }

    //add wind to acceleration
    var wind_a = force.copy();
    wind_a.scale(2*this.rad/this.m); // force goes with diameter for objects in 2D system
    this.a = this.a.add(wind_a);
    // if (this.depth == 4) {
    //   console.log("a=" + this.a.x + ", " + this.a.y);
    // }

    //update position, velocity
    this.v = this.v.add(this.a);
    this.v.x = this.v.x - this.v.x*this.tDamping;
    this.v.y = this.v.y - this.v.y*this.tDamping;
    // if (this.depth == 4) {
    //   console.log("v=" + this.v.x + ", " + this.v.y);
    // }
    // if (this.depth == 4) {
    //   console.log("p=" + this.p.x + ", " + this.p.y);
    // }
    this.p = this.p.add(this.v);
  },
  setRk: function(new_rk) {
    this.rk = new_rk;
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        var child = this.children[c];
        child.setRk(new_rk);
      }
    }
  },
  setTk: function(new_tk) {
    this.tk = new_tk;
    if(this.children.length > 0) {
      for(var c=0,clen=this.children.length;c<clen;c++) {
        var child = this.children[c];
        child.setTk(new_tk);
      }
    }
  }
}
