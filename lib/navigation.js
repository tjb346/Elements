import { CustomElement } from "./element.js";
/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export class Route extends CustomElement {
    constructor() {
        super();
        this.localPath = [""];
        this.containerId = 'container';
        window.addEventListener('popstate', (event) => {
            event.preventDefault();
            this.updateState();
        });
        document.addEventListener(RouterLink.EVENT_ROUTE_CHANGE, ((event) => {
            this.updateState();
        }));
    }
    static get observedAttributes() {
        return ['name', 'title'];
    }
    static currentRoute() {
        if (window.location.pathname[window.location.pathname.length - 1] === '/') {
            return window.location.pathname.slice(0, window.location.pathname.length - 1);
        }
        return window.location.pathname;
    }
    static currentPath() {
        return Route.currentRoute().split('/');
    }
    updateAttributes(attributes) {
        if (attributes.name) {
            this.name = attributes.name;
        }
        if (attributes.title) {
            this.title = attributes.title;
        }
    }
    get name() {
        return this.localPath.join('/');
    }
    set name(value) {
        this.localPath = value.split('/');
        this.dispatchEvent(new CustomEvent(Route.EVENT_NAME_CHANGE, { detail: this.name }));
    }
    get path() {
        let parent = this.parentElement;
        let path = this.localPath;
        if (parent instanceof Route) {
            path = parent.path.concat(path);
        }
        return path;
    }
    get isRoot() {
        let element = this.parentElement;
        while (element !== null) {
            if (element instanceof Route) {
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
    render(shadowRoot) {
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
    show() {
        this.style.display = 'block';
        this.dispatchEvent(new Event(Route.EVENT_SHOWN));
    }
    hide() {
        this.style.display = 'none';
        this.dispatchEvent(new Event(Route.EVENT_HIDDEN));
    }
    matchesCurrentLocation() {
        let routePath = this.path;
        let currentPath = Route.currentPath();
        let segmentIndex = 0;
        let match = true;
        while (routePath.length > segmentIndex) {
            let route = routePath[segmentIndex];
            let segmentName = currentPath[segmentIndex];
            if ((route !== segmentName) && !(route === "" && segmentName === undefined)) {
                match = false;
            }
            segmentIndex++;
        }
        return match;
    }
    updateState() {
        if (this.matchesCurrentLocation()) {
            this.show();
        }
        else {
            this.hide();
        }
    }
}
/**
 * @event
 */
Route.EVENT_NAME_CHANGE = 'namechange';
/**
 * @event
 */
Route.EVENT_TITLE_CHANGE = 'titlechange';
/**
 * @event
 */
Route.EVENT_SHOWN = 'show';
/**
 * @event
 */
Route.EVENT_HIDDEN = 'hidden';
export class LazyRoute extends Route {
    constructor() {
        super();
        this.url = null;
        this._container = document.createElement('div');
    }
    static get observedAttributes() {
        return Route.observedAttributes.concat(['url']);
    }
    get loaded() {
        return this._container && this._container.lastChild;
    }
    render(shadowRoot) {
        this._container = document.createElement('div');
        shadowRoot.appendChild(this._container);
    }
    show() {
        super.show();
        if (!this.loaded) {
            if (document.readyState === "loading") {
                document.addEventListener('readystatechange', (event) => {
                    this.show();
                });
            }
            else {
                this.lazyLoad();
            }
        }
    }
    lazyLoad() {
        let slot = document.createElement('slot');
        this._container.appendChild(slot);
        let templates = this.querySelectorAll('template');
        for (let template of templates) {
            let clone = document.importNode(template.content, true);
            if (template.parentElement !== null) {
                template.parentElement.replaceChild(clone, template);
            }
        }
        if (this.url) {
            fetch(this.url)
                .then((response) => {
                this.renderResponse(response);
            })
                .catch(() => {
                this.innerText = "Error loading data.";
            });
        }
    }
}
export class RouterLink extends CustomElement {
    constructor() {
        super();
        this.route = window.location.pathname;
        this.onclick = (event) => {
            let a = document.createElement('a');
            a.href = this.route;
            window.history.pushState({}, "", a.href);
            let customEvent = new CustomEvent(RouterLink.EVENT_ROUTE_CHANGE, { detail: a.href });
            document.dispatchEvent(customEvent);
        };
    }
    static get observedAttributes() {
        return ['route'];
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
    updateAttributes(attributes) {
        if (attributes.route !== null) {
            if (attributes.route.trim() === "") {
                this.route = window.location.pathname;
            }
            else {
                this.route = attributes.route;
            }
        }
        else {
            this.route = window.location.pathname;
        }
    }
    render(shadowRoot) {
        super.render(shadowRoot);
        let slot = document.createElement('slot');
        shadowRoot.appendChild(slot);
    }
}
/**
 * @event
 */
RouterLink.EVENT_ROUTE_CHANGE = 'route-change';
customElements.define('page-route', Route);
customElements.define('lazy-route', LazyRoute);
customElements.define('router-link', RouterLink);
