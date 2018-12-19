import { CustomElement } from "./element";
export class Movable extends CustomElement {
    constructor() {
        super();
        this._position = { x: 0, y: 0 };
        this._velocity = { x: 0, y: 0 };
        this._motionTimeout = null;
        this._lastPositionUpdateTime = null;
    }
    static get frictionCoef() {
        return 100;
    }
    /**
     Time in seconds between position updates from velocity vector.
     */
    static get timeStep() {
        return .010;
    }
    updateAttributes(attributes) {
    }
    connectedCallback() {
        super.connectedCallback();
        this.style.position = 'absolute';
        this._lastPositionUpdateTime = null;
        this.position = { x: 0, y: 0 };
    }
    get position() {
        return Object.assign({}, this._position); // Make a copy so it doesn't get modified;
    }
    set position(value) {
        let oldPosition = this._position;
        this._position = {
            x: Number(value.x || 0),
            y: Number(value.y || 0)
        };
        this.style.left = Math.round(this._position.x).toString();
        this.style.top = Math.round(this._position.y).toString();
        let time = new Date().getTime();
        if (this._lastPositionUpdateTime !== null) {
            let deltaT = (time - this._lastPositionUpdateTime) / 1000;
            this.velocity = {
                x: (this._position.x - oldPosition.x) / deltaT,
                y: (this._position.y - oldPosition.y) / deltaT
            };
        }
        this._lastPositionUpdateTime = time;
    }
    center() {
        this.style.position = 'fixed';
        this.style.top = '50%';
        this.style.left = '50%';
        this.style.width = null;
        this.style.height = null;
        this.style.transform = 'translate(-50%, -50%)';
    }
    expand() {
        this.style.position = 'fixed';
        this.style.transform = null;
        this.style.top = '0';
        this.style.left = '0';
        this.style.width = '100%';
        this.style.height = '100%';
    }
    get frictionForce() {
        let vel = this.velocity;
        let xDir = Math.sign(vel.x) || 0;
        let yDir = Math.sign(vel.y) || 0;
        return {
            x: -1 * xDir * this.constructor.frictionCoef,
            y: -1 * yDir * this.constructor.frictionCoef
        };
    }
    /**
     Vector [x motion, y motion] in pixels per second.
     */
    get velocity() {
        return this._velocity || {
            x: 0,
            y: 0
        };
    }
    set velocity(value) {
        if (this._motionTimeout) {
            clearTimeout(this._motionTimeout);
        }
        this._motionTimeout = null;
        let x = value.x;
        let y = value.y;
        this._velocity = { x: x, y: y };
        if (x > 0 || y > 0) {
            if (this.speed < 10) {
                this.velocity = { x: 0, y: 0 };
            }
            else {
                const step = this.constructor.timeStep;
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
    get speed() {
        let velocity = this.velocity;
        return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    }
}
export class Draggable extends Movable {
    constructor() {
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
        };
        document.onmouseup = this.stopDrag.bind(this);
    }
    stopDrag() {
        document.onmousemove = null;
        document.onmouseup = null;
    }
}
export class Scrollable extends Movable {
    constructor() {
        super();
        this._touchStartPosition = {};
        this._speed = 0;
        this.onwheel = (event) => {
            let currentPosition = this.position;
            currentPosition.y -= event.deltaY * this.scrollSpeed;
            this.position = currentPosition;
        };
        this.ontouchstart = (event) => {
            for (let touch of event.targetTouches) {
                this._touchStartPosition[touch.identifier] = {
                    coords: { x: touch.clientX, y: touch.clientY },
                    elementPosition: this.position
                };
            }
        };
        this.ontouchmove = (event) => {
            for (let touch of event.targetTouches) {
                let startData = this._touchStartPosition[touch.identifier];
                if (startData) {
                    let deltaX = touch.clientX - startData.coords.x;
                    let deltaY = touch.clientY - startData.coords.y;
                    this.position = { x: startData.elementPosition.x + deltaX, y: startData.elementPosition.y + deltaY };
                }
            }
        };
        this.ontouchend = (event) => {
            for (let touch of event.targetTouches) {
                delete this._touchStartPosition[touch.identifier];
            }
        };
    }
    static get observedAttributes() {
        return ['scrollSpeed'];
    }
    get scrollSpeed() {
        return this._speed || 1;
    }
    set scrollSpeed(value) {
        this._speed = Number(value);
    }
}
