import {CustomElement} from "./element.js";

/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export class Route extends CustomElement {
    private localPath : string[] = [""];
    protected containerId = 'container';

    /**
     * @event
     */
    static EVENT_NAME_CHANGE = 'namechange';

    /**
     * @event
     */
    static EVENT_TITLE_CHANGE = 'titlechange';

    /**
     * @event
     */
    static EVENT_SHOWN = 'show';

    /**
     * @event
     */
    static EVENT_HIDDEN = 'hidden';

    constructor() {
        super();

        window.addEventListener('popstate', (event) => {
            event.preventDefault();

            this.updateState();
        });

        document.addEventListener(RouterLink.EVENT_ROUTE_CHANGE, ((event : CustomEvent)  => {
            this.updateState();
        }) as EventListener );
    }

    static get observedAttributes() {
        return ['name', 'title'];
    }

    static currentRoute() : string {
        if (window.location.pathname[window.location.pathname.length - 1] === '/'){
            return window.location.pathname.slice(0, window.location.pathname.length - 1);
        }
        return window.location.pathname;
    }

    static currentPath() : string[] {
        return Route.currentRoute().split('/');
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {
        if (attributes.name){
            this.name = attributes.name;
        }
        if (attributes.title){
            this.title = attributes.title;
        }
    }

    get name() : string {
        return this.localPath.join('/');
    }

    set name(value : string) {
        this.localPath = value.split('/');
        this.dispatchEvent(new CustomEvent(Route.EVENT_NAME_CHANGE, {detail: this.name}));
    }

    get path() : string[] {
        let parent = this.parentElement;
        let path = this.localPath;
        if (parent instanceof Route){
            path = parent.path.concat(path);
        }
        return path;
    }

    get isRoot() : boolean{
        let element : HTMLElement | null = this.parentElement;
        while (element !== null){
            if (element instanceof Route){
                return false;
            }
            element = element.parentElement;
        }
        return true;
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateState();
    }

    render(shadowRoot : ShadowRoot){
        super.render(shadowRoot);
        let container = document.createElement('div');
        container.id = this.containerId;
        let slot = document.createElement('slot');
        container.appendChild(slot);
        shadowRoot.appendChild(container);
    }

    /**
     * Shows the route.
     */
    show(){
        this.style.display = 'block';
        this.dispatchEvent(new Event(Route.EVENT_SHOWN));
    }

    hide(){
        this.style.display = 'none';
        this.dispatchEvent(new Event(Route.EVENT_HIDDEN));
    }

    private matchesCurrentLocation(){
        let routePath = this.path;
        let currentPath = Route.currentPath();
        let segmentIndex = 0;
        let match = true;
        while (routePath.length > segmentIndex){
            let route = routePath[segmentIndex];
            let segmentName = currentPath[segmentIndex];
            if ((route !== segmentName) && !(route === "" && segmentName === undefined)){
                match = false;
            }
            segmentIndex ++;
        }
        return match;
    }

    updateState(){
        if (this.matchesCurrentLocation()){
            this.show();
        } else {
            this.hide();
        }
    }
}

export abstract class LazyRoute extends Route {
    private _container : HTMLElement;
    public url : string | null = null;

    protected constructor(){
        super();
        this._container = document.createElement('div');
    }

    static get observedAttributes() {
        return Route.observedAttributes.concat(['url']);
    }

    get loaded(){
        return this._container && this._container.lastChild;
    }

    render(shadowRoot : ShadowRoot){
        this._container = document.createElement('div');
        shadowRoot.appendChild(this._container);
    }

    show(){
        super.show();

        if (!this.loaded) {
            if (document.readyState === "loading") {
                document.addEventListener('readystatechange', (event : Event) => {
                    this.show();
                });
            } else {
                this.lazyLoad();
            }
        }
    }

    private lazyLoad(){
        let slot = document.createElement('slot');
        this._container.appendChild(slot);

        let templates = this.querySelectorAll('template');
        for (let template of templates){
            let clone = document.importNode(template.content, true);
            if (template.parentElement !== null) {
                template.parentElement.replaceChild(clone, template);
            }
        }

        if (this.url){
            fetch(this.url)
                .then((response) => {
                    this.renderResponse(response);
                })
                .catch(() => {
                    this.innerText = "Error loading data."
                })
        }
    }

    /**
     * Render the element shadow dom from the data given in the response.
     * @param response The http response from the url.
     */
    abstract renderResponse(response : Response) : void;
}

export class RouterLink extends CustomElement {
    /**
     * @event
     */
    static EVENT_ROUTE_CHANGE = 'route-change';

    static routeAttribute = 'route';

    constructor() {
        super();

        this.onclick = (event) => {
            let url = new URL(this.route, window.location.href).toString();
            window.history.pushState({}, "", url);

            let customEvent = new CustomEvent(RouterLink.EVENT_ROUTE_CHANGE, {detail: url});
            document.dispatchEvent(customEvent);
        };
    }

    static get observedAttributes() {
        return [RouterLink.routeAttribute];
    }

    get css() {
        // language=CSS
        return `
            :host {
                --link-color: inherit;
                --link-hover-color: grey;
                
                cursor: pointer;
                text-decoration: underline;
                color: var(--link-color);
            }
            
            :host(:hover) {
                color: var(--link-hover-color);
            }

        `;
    }

    get route() : string {
        return this.getAttribute(RouterLink.routeAttribute) || '/'
    }

    set route(value : string) {
        this.setAttribute(RouterLink.routeAttribute, value.trim());
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {}


    render(shadowRoot: ShadowRoot) {
        super.render(shadowRoot);
        let slot = document.createElement('slot');
        shadowRoot.appendChild(slot);
    }
}

customElements.define('page-route', Route);
customElements.define('lazy-route', LazyRoute);
customElements.define('router-link', RouterLink);