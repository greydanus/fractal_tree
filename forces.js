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

var SinForce = function(initial_force, wavelength) {
  this.initial_force = initial_force;
  this.temp;
  this.wavelength = wavelength;
}
SinForce.prototype = {
  get_force: function(time) {
    this.temp = this.initial_force.copy();
    this.temp.scale(Math.sin(2*Math.PI*time/this.wavelength));
    return this.temp;
  },
  new_magnitude: function(mag) {
    if (Math.abs(mag) > 0) {
      this.initial_force.normalize();
      this.initial_force.scale(mag);
    }
  },
  new_wavelength: function(w) {
    if (w > 0) {
      this.wavelength = w;
    }
  },
  draw: function(time,ctx,x,y,maxwidth) {
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    var displacement = this.get_force(time).length()/this.initial_force.length()*maxwidth;
    if (this.get_force(time).x < 0) {
      displacement *=-1;
    }
    ctx.lineTo(x + displacement, y);
    ctx.stroke();
  }
}

var SquareForce = function(initial_force, wavelength) {
  this.initial_force = initial_force;
  this.temp;
  this.wavelength = wavelength;
}
SquareForce.prototype = {
  get_force: function(time) {
    this.temp = this.initial_force.copy();
    if (Math.sin(2*Math.PI*time/this.wavelength) >= 0) {
      this.temp.scale(-1);
    }
    return this.temp;
  },
  new_magnitude: function(mag) {
    if (Math.abs(mag) > 0) {
      this.initial_force.normalize();
      this.initial_force.scale(mag);
    }
  },
  new_wavelength: function(w) {
    if (w > 0) {
      this.wavelength = w;
    }
  },
  draw: function(time,ctx,x,y,maxwidth) {
    ctx.strokeStyle = "#0000FF";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    var displacement = this.get_force(time).length()/this.initial_force.length()*maxwidth;
    if (this.get_force(time).x < 0) {
      displacement *=-1;
    }
    ctx.lineTo(x + displacement, y);
    ctx.stroke();
  }
}

var OnOffForce = function(initial_force) {
  this.initial_force = initial_force;
  this.temp;
  this.wavelength = 0;
  this.mag = 0;
}
OnOffForce.prototype = {
  get_force: function(time) {
    this.temp = this.initial_force.copy();
    this.temp.scale(this.mag);
    return this.temp;
  },
  new_magnitude: function(mag) {
    if (Math.abs(mag) > 0) {
      this.initial_force.normalize();
      this.initial_force.scale(mag);
    }
  },
  new_wavelength: function(w) {
    if (w > 0) {
      this.wavelength = w;
    }
  },
  draw: function(time,ctx,x,y,maxwidth) {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    var displacement = this.get_force(time).length()/this.initial_force.length()*maxwidth;
    if (this.get_force(time).x < 0) {
      displacement *=-1;
    }
    ctx.lineTo(x + displacement, y);
    ctx.stroke();
  }
}