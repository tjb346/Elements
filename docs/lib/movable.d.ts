import { CustomElement } from "./element.js";
interface Vector {
    x: number;
    y: number;
}
/**
 An element who's position can be changed.
 */
export declare class Movable extends CustomElement {
    private _position;
    private _velocity;
    private motionTimeout;
    private lastPositionUpdateTime;
    /**
     Affects how fast the element will decelerate when in motion.
     */
    protected frictionCoef: number;
    /**
     Time in seconds between position updates from velocity vector.
     */
    protected timeStep: number;
    constructor();
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    connectedCallback(): void;
    /**
     The current location of the upper left corner of the element to its closes relatively positioned ancestor in pixels.
     */
    position: Vector;
    readonly frictionForce: {
        x: number;
        y: number;
    };
    /**
     The current motion of the element in pixels per second.
     */
    velocity: Vector;
    readonly speed: number;
    center(): void;
}
/**
 An element who's position can be changed by clicking and dragging.
 */
export declare class Grabbable extends Movable {
    onmousedown: (ev: MouseEvent) => any;
    private startPosition;
    private mouseStartPosition;
    protected includeChildren: boolean;
    protected noPropagate: boolean;
    constructor();
    private startDrag;
    private stopDrag;
}
/**
 An element who's position can be changed using the scroll wheel of the mouse.
 */
export declare class Scrollable extends Movable {
    private touchStartPosition;
    private static defaultScrollSpeed;
    /**
     A multiplier for the rate the element moves when scrolled. Can be set with "scroll-speed" attribute .
     */
    protected scrollSpeed: number;
    static scrollSpeedAttribute: string;
    constructor();
    static readonly observedAttributes: string[];
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
}
export {};
