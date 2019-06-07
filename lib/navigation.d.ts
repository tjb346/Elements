import { CustomElement } from "./element.js";
/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export declare class Route extends CustomElement {
    /**
     * @event
     */
    static EVENT_NAME_CHANGE: string;
    /**
     * @event
     */
    static EVENT_TITLE_CHANGE: string;
    /**
     * @event
     */
    static EVENT_SHOWN: string;
    /**
     * @event
     */
    static EVENT_HIDDEN: string;
    static nameAttribute: string;
    protected containerId: string;
    constructor();
    static readonly observedAttributes: string[];
    name: string;
    readonly path: string[];
    readonly isRoot: boolean;
    static currentPath(): string[];
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    connectedCallback(): void;
    /**
     * Shows the route.
     */
    show(): void;
    hide(): void;
    updateState(): void;
    private matchesCurrentLocation;
}
export declare abstract class LazyRoute extends Route {
    url: string | null;
    private container;
    protected constructor();
    static readonly observedAttributes: string[];
    readonly loaded: ChildNode | null;
    show(): void;
    /**
     * Render the element shadow dom from the data given in the response.
     * @param response The http response from the url.
     */
    abstract renderResponse(response: Response): void;
    private lazyLoad;
}
export declare class RouterLink extends CustomElement {
    /**
     * @event
     */
    static EVENT_ROUTE_CHANGE: string;
    static routeAttribute: string;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    route: string;
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
}
