import {CustomElement} from "./element.js";


interface Vector {x: number; y: number}


export class Movable extends CustomElement {
  private _position: Vector = {x: 0, y: 0};
  private _velocity: Vector = {x: 0, y: 0};
  private _motionTimeout: number | null = null;
  private _lastPositionUpdateTime: number | null = null;

  constructor(){
    super();
  }

  static get frictionCoef(){
    return 100;
  }

  /**
   Time in seconds between position updates from velocity vector.
   */
  static get timeStep(){
    return .010;
  }

  updateAttributes(attributes: { [p: string]: string | null }): void {
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.position = 'absolute';
    this._lastPositionUpdateTime = null;
    this.position = {x: 0, y: 0};
  }

  get position() : Vector {
    return Object.assign({}, this._position); // Make a copy so it doesn't get modified;
  }

  set position(value: Vector){
    let oldPosition = this._position;
    this._position = {
      x: value.x || 0,
      y: value.y || 0
    };
    this.style.left = `${Math.round(this._position.x).toString()}px`;
    this.style.top = `${Math.round(this._position.y).toString()}px`;

    let time = new Date().getTime();
    if (this._lastPositionUpdateTime !== null){
      let deltaT = (time - this._lastPositionUpdateTime) / 1000;
      this.velocity = {
        x: (this._position.x - oldPosition.x) / deltaT,
        y: (this._position.y - oldPosition.y) / deltaT
      };
    }
    this._lastPositionUpdateTime = time;
  }

  get frictionForce(){
    let vel = this.velocity;
    let xDir = Math.sign(vel.x) || 0;
    let yDir = Math.sign(vel.y) || 0;
    return {
      x: -1 * xDir * (this.constructor as typeof Movable).frictionCoef,
      y: -1 * yDir * (this.constructor as typeof Movable).frictionCoef
    }
  }

  /**
   Vector [x motion, y motion] in pixels per second.
   */
  get velocity(){
    return this._velocity || {
      x: 0,
      y: 0
    };
  }

  set velocity(value) {
    if (this._motionTimeout){
      clearTimeout(this._motionTimeout);
    }
    this._motionTimeout = null;

    let x = value.x;
    let y = value.y;
    this._velocity = {x: x, y: y};

    if (x > 0 || y > 0) {
      if (this.speed < 10) {
        this.velocity = {x: 0, y: 0};
      } else {
        const step = (this.constructor as typeof Movable).timeStep;
        this._motionTimeout = setTimeout(() => {
          // Update position due to velocity
          let currentPosition = this.position;
          this.position = {
            x: currentPosition.x + x * step,
            y: currentPosition.y + y * step
          };

          // Update velocity due to friction
          let frictionForce = this.frictionForce;

          // Calculate new velocity components due to friction.
          let newX = x + frictionForce.x * step;
          let newY = y + frictionForce.y * step;

          // Friction should not change direction. Check here, and set to zero if so.
          if (Math.sign(newX) !== Math.sign(x)) {
            newX = 0;
          }
          if (Math.sign(newY) !== Math.sign(y)) {
            newY = 0;
          }

          this.velocity = {
            x: newX,
            y: newY
          };
        }, step * 1000);
      }
    }
  }

  get speed(){
    let velocity = this.velocity;
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  }
}

export class Grabbable extends Movable {
  constructor(){
    super();

    this.onmousedown = (event) => {
      event.preventDefault();
      this.startDrag();
    };
  }

  startDrag() {
    document.onmousemove = (event) => {
      let scrollLeft = document.documentElement.scrollLeft;
      let scrollTop = document.documentElement.scrollTop;
      this.position = {
        x: scrollLeft + event.clientX,
        y: scrollTop + event.clientY
      };
      this.velocity = {x: 0, y: 0};
    };
    document.onmouseup = this.stopDrag.bind(this);
  }

  stopDrag() {
    document.onmousemove = null;
    document.onmouseup = null;
  }
}

interface TouchData {
  [key : string] : Vector;
  coords: Vector;
  elementPosition: Vector;
}

export class Scrollable extends Movable {
  private _touchStartPosition : {[key: string] :  TouchData} = {};
  private _speed = 0;

  constructor() {
    super();

    this.onwheel = (event : WheelEvent) => {
      let currentPosition = this.position;
      currentPosition.y -= event.deltaY * this.scrollSpeed;
      this.position = currentPosition;
    };

    this.ontouchstart = (event : TouchEvent) => {
      for (let touch of event.targetTouches){
        this._touchStartPosition[touch.identifier] = {
          coords: {x: touch.clientX, y: touch.clientY},
          elementPosition: this.position};
      }
    };

    this.ontouchmove = (event : TouchEvent) => {
      for (let touch of event.targetTouches){
        let startData = this._touchStartPosition[touch.identifier];
        if (startData){
          let deltaX = touch.clientX - startData.coords.x;
          let deltaY = touch.clientY - startData.coords.y;
          this.position = {x: startData.elementPosition.x + deltaX, y: startData.elementPosition.y + deltaY};
        }
      }
    };

    this.ontouchend = (event : TouchEvent) => {
      for (let touch of event.targetTouches){
        delete this._touchStartPosition[touch.identifier];
      }
    };
  }

  static get observedAttributes() {
    return ['scrollSpeed'];
  }

  get scrollSpeed(){
    return this._speed || 1;
  }

  set scrollSpeed(value){
    this._speed = Number(value);
  }
}