import { CustomElement } from "./element.js";
/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export class Route extends CustomElement {
    constructor() {
        super();
        this.containerId = 'container';
        let container = document.createElement('div');
        container.id = this.containerId;
        let slot = document.createElement('slot');
        container.appendChild(slot);
        this.shadowDOM.appendChild(container);
        window.addEventListener('popstate', (event) => {
            event.preventDefault();
            this.updateState();
        });
        document.addEventListener(RouterLink.EVENT_ROUTE_CHANGE, ((event) => {
            this.updateState();
        }));
    }
    static get observedAttributes() {
        return [Route.nameAttribute];
    }
    static currentPath() {
        let path = window.location.pathname;
        if (path[path.length - 1] === '/') {
            path = path.slice(0, path.length - 1);
        }
        if (path[0] === "/") {
            path = path.slice(1);
        }
        return path.split('/');
    }
    updateFromAttributes(attributes) {
        this.dispatchEvent(new Event(Route.EVENT_NAME_CHANGE));
    }
    get name() {
        let name = this.getAttribute(Route.nameAttribute);
        if (name === null) {
            return '';
        }
        return name.trim();
    }
    set name(value) {
        this.setAttribute(Route.nameAttribute, value.trim());
    }
    get path() {
        let parent = this.parentElement;
        let path = [this.name];
        while (parent !== null) {
            if (parent instanceof Route) {
                return parent.path.concat(path);
            }
            parent = parent.parentElement;
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
        while (routePath.length > segmentIndex) {
            let route = routePath[segmentIndex];
            let segmentName = currentPath[segmentIndex] || "";
            if (route !== segmentName && !(route === "" && segmentName === 'index.html')) {
                return false;
            }
            segmentIndex++;
        }
        return true;
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
Route.nameAttribute = 'name';
export class LazyRoute extends Route {
    constructor() {
        super();
        this.url = null;
        this.container = document.createElement('div');
        this.shadowDOM.appendChild(this.container);
    }
    static get observedAttributes() {
        return Route.observedAttributes.concat(['url']);
    }
    get loaded() {
        return this.container && this.container.lastChild;
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
        this.container.appendChild(slot);
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
        let slot = document.createElement('slot');
        this.shadowDOM.appendChild(slot);
        this.onclick = (event) => {
            let url = new URL(this.route, window.location.href).toString();
            window.history.pushState({}, "", url);
            window.scroll(0, 0);
            let customEvent = new Event(RouterLink.EVENT_ROUTE_CHANGE);
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
    get route() {
        let route = this.getAttribute(RouterLink.routeAttribute);
        if (route === null) {
            return "";
        }
        return route.trim();
    }
    set route(value) {
        this.setAttribute(RouterLink.routeAttribute, value.trim());
    }
    updateFromAttributes(attributes) { }
}
/**
 * @event
 */
RouterLink.EVENT_ROUTE_CHANGE = 'route-change';
RouterLink.routeAttribute = 'route';
customElements.define('page-route', Route);
customElements.define('lazy-route', LazyRoute);
customElements.define('router-link', RouterLink);
