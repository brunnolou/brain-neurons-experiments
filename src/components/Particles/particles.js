import { pointFromVector } from "@popmotion/popcorn";

const PARTICLE_QUANT = 12 * 12;
const BOUNCE = -1;
const PARTICLE_COLOR = "#555";
const ARC_RADIUS = 10;
const SPEED = 1;
const GLOBAL_MOTION_PERCENTAGE = 0.2;

/**
 * Particles lib class
 *
 * @class Particles
 * @constructor
 */

const Particles = function(
  domElement,
  { canvasWidth, canvasHeight, globalMotion, globalMotionAngle = 0 }
) {
  // if element doesnt exist in the DOM return early
  if (!domElement) return;

  /**
   * A reference to the containing DOM element.
   *
   * @default null
   * @property {jQuery} domElement
   * @public
   */
  this.domElement = domElement;

  /**
   * Initial timestamp use to for baseline of animation loop
   *
   * @default null
   * @property lastTimeStamp
   * @type {number}
   * @public
   */
  this.lastTimeStamp = null;

  /**
   * array representing particles
   *
   * @default empty array
   * @property lastTimeStamp
   * @type {array}
   * @public
   */
  this.particles = [];

  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;
  this.globalMotionAngle = globalMotionAngle;
  this.globalMotion = globalMotion;
  this.isLeftOrRight = this.globalMotionAngle && Math.random() > 0.5 ? 180 : 0;

  this.init();
};

var proto = Particles.prototype;

/**
 * Initializes the class.
 * Runs a single setupHandlers call, followed by createChildren and layout.
 * Exits early if it is already initialized.
 *
 * @method init
 * @private
 */
proto.init = function() {
  this.createChildren()
    .layout()
    .enable();
};

/**
 * Create any child objects or references to DOM elements.
 * Should only be run on initialization of the view.
 *
 * @method createChildren
 * @returns {Particles}
 * @private
 */
proto.createChildren = function() {
  this.canvas = this.domElement;
  this.context = this.canvas.getContext("2d");
  this.lastTimeStamp = new Date().getTime();

  return this;
};

/**
 * handles layout of DOM elements
 *
 * @method layout
 * @returns {ParticlesController}
 * @private
 */
proto.layout = function() {
  window.requestAnimFrame = (function() {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame
    );
  })();

  return this;
};

/**
 * Remove any child objects or references to DOM elements.
 *
 * @method removeChildren
 * @returns {Particles}
 * @public
 */
proto.removeChildren = function() {
  this.context = null;
  this.canvasWidth = null;
  this.canvasHeight = null;
  this.lastTimeStamp = null;

  return this;
};

/**
 * Enables the component.
 * Performs any event binding to handlers.
 * Exits early if it is already enabled.
 *
 * @method enable
 * @public
 */
proto.enable = function() {
  this.createParticleData();
  this.renderLoop();
};

//////////////////////////////////////////////////////////////////////////////////
// HELPER METHODS
//////////////////////////////////////////////////////////////////////////////////

/**
 * Creates particle data objects
 *
 * @method createParticleData
 * @private
 */
proto.createParticleData = function() {
  var i = 0;
  var l = PARTICLE_QUANT;

  for (; i < l; i++) {
    this.particles[i] = {
      hasGlobalMotion: this.globalMotion && i / l > 1 - GLOBAL_MOTION_PERCENTAGE
    };
    this.setParticleData(this.particles[i]);
  }
};

/**
 * Sets the base particle data
 *
 * @method setParticleData
 * @private
 */
proto.setParticleData = function(particle) {
  const hasGlobalMotion = particle.hasGlobalMotion;

  particle.x = Math.random() * this.canvasWidth;
  particle.y = Math.random() * this.canvasHeight;
  particle.z = Math.random() * this.canvasHeight;
  const direction = pointFromVector(
    { x: 0, y: 0 },
    hasGlobalMotion
      ? this.globalMotionAngle + this.isLeftOrRight + 10 * (Math.random() - 0.5)
      : 360 * Math.random(),
    SPEED
  );

  particle.vx = direction.x;
  particle.vy = direction.y;
  particle.vz = (Math.random() - 0.5) * SPEED * 2;
};

/**
 * Updates the particle data object
 *
 * @method update
 * @private
 */
proto.update = function() {
  var i = 0;
  var l = PARTICLE_QUANT;

  for (; i < l; i++) {
    var particle = this.particles[i];

    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.z += particle.vz;

    // if (particle.x > this.canvasWidth) {
    //   particle.x = this.canvasWidth;
    //   particle.vx *= BOUNCE;
    // } else if (particle.x < 0) {
    //   particle.x = 0;
    //   particle.vx *= BOUNCE;
    // }

    // if (particle.y > this.canvasHeight) {
    //   particle.y = this.canvasHeight;
    //   particle.vy *= BOUNCE;
    // } else if (particle.y < 0) {
    //   particle.y = 0;
    //   particle.vy *= BOUNCE;
    // }

    // if (particle.z > this.canvasHeight) {
    //   particle.z = this.canvasHeight;
    //   particle.vz *= BOUNCE;
    // } else if (particle.z < 0) {
    //   particle.z = 0;
    //   particle.vz *= BOUNCE;
    // }

    if (particle.x - ARC_RADIUS > this.canvasWidth) {
      particle.x = 0;
    } else if (particle.x + ARC_RADIUS < 0) {
      particle.x = this.canvasWidth;
    }

    if (particle.y - ARC_RADIUS > this.canvasHeight) {
      particle.y = 0;
    } else if (particle.y + ARC_RADIUS < 0) {
      particle.y = this.canvasHeight;
    }

    if (particle.z > this.canvasHeight) {
      particle.z = this.canvasHeight;
      particle.vz *= BOUNCE;
    } else if (particle.z < 0) {
      particle.z = 0;
      particle.vz *= BOUNCE;
    }
  }
};

/**
 * Renders the particle on the canvas
 *
 * @method draw
 * @private
 */
proto.draw = function() {
  var i = 0;

  if (!this.context) {
    return;
  }

  this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  this.context.fillStyle = PARTICLE_COLOR;

  for (; i < PARTICLE_QUANT; i++) {
    var particle = this.particles[i];
    this.context.save();
    this.context.beginPath();
    this.context.arc(particle.x, particle.y, ARC_RADIUS, 0, Math.PI * 2);
    this.context.fill();
    this.context.restore();
  }
};

/**
 * Creates the animation loop
 *
 * @method renderLoop
 * @private
 */
proto.renderLoop = function() {
  requestAnimationFrame(this.renderLoop.bind(this));
  this.update();
  // this.draw();
};

export default Particles;
