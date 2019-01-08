import { CustomElement } from "./element.js";
/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export declare class Route extends CustomElement {
    private _name;
    private _title;
    protected containerId: string;
    protected rootRoute: string;
    protected defaultTitle: string;
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
    constructor();
    static readonly observedAttributes: string[];
    static currentRoute(): string;
    static currentPath(): string[];
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    readonly defaultName: string;
    name: string;
    title: string;
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
    private _container;
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
    private route;
    /**
     * @event
     */
    static EVENT_ROUTE_CHANGE: string;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    render(shadowRoot: ShadowRoot): void;
}
