import { CustomElement } from "./element.js";
/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export declare class Route extends CustomElement {
    protected containerId: string;
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
    constructor();
    static readonly observedAttributes: string[];
    static currentPath(): string[];
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    name: string;
    readonly path: string[];
    readonly isRoot: boolean;
    connectedCallback(): void;
    render(shadowRoot: ShadowRoot): void;
    /**
     * Shows the route.
     */
    show(): void;
    hide(): void;
    private matchesCurrentLocation;
    updateState(): void;
}
export declare abstract class LazyRoute extends Route {
    private container;
    url: string | null;
    protected constructor();
    static readonly observedAttributes: string[];
    readonly loaded: ChildNode | null;
    render(shadowRoot: ShadowRoot): void;
    show(): void;
    private lazyLoad;
    /**
     * Render the element shadow dom from the data given in the response.
     * @param response The http response from the url.
     */
    abstract renderResponse(response: Response): void;
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
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    render(shadowRoot: ShadowRoot): void;
}
