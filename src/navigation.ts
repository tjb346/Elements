import {CustomElement} from "./element.js";

/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export class Route extends CustomElement {
    private _name : string | null = null;
    private _title : string | null = null;
    protected containerId = 'container';
    protected homeName = 'home';
    protected defaultName = this.homeName;
    protected defaultTitle = 'Home';

    /**
     * @event
     */
    static EVENT_NAME_CHANGE = 'namechange';

    /**
     * @event
     */
    static EVENT_TITLE_CHANGE = 'titlechange';

    constructor() {
        super();

        window.addEventListener('popstate', (event) => {
            event.preventDefault();

            this.updateState();
        });
    }

    static get observedAttributes() {
        return ['name', 'title'];
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {
        if (attributes.name){
            this.name = attributes.name;
        }
        if (attributes.title){
            this.title = attributes.title;
        }
    }

    get name(){
        return this._name || this.defaultName;
    }

    set name(value : string) {
        this._name = value;
        this.dispatchEvent(new CustomEvent(Route.EVENT_NAME_CHANGE, {detail: this.name}));
    }

    get title(){
        if (this._title) {
            return this._title;
        }

        if (this._name && this.name.length > 1){
            return this._name.charAt(0).toUpperCase() + this._name.slice(1);
        }

        return this.defaultTitle;
    }

    set title(value : string){
        if (value){
            value = value.toString();
            this._title = value.charAt(0).toUpperCase() + value.slice(1);
        } else {
            this._title = null;
        }
        this.dispatchEvent(new CustomEvent(Route.EVENT_TITLE_CHANGE, {detail: this.title}));
    }

    get path(){
        let element : HTMLElement | null = this;
        let path = [];
        while (element instanceof Route){
            path.unshift(element.name);
            element = element.parentElement;
        }
        return path.join('/');
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.parentElement instanceof Navigation){
            this.parentElement.addNewRoute(this);
        }
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
    }

    hide(){
        this.style.display = 'none';
    }

    updateState(){
        if (window.location.pathname.startsWith(this.path) ||
            (window.location.pathname === '/' && this.path === this.homeName)){
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

        if (!this.loaded){
            this._lazyLoad();
        }
    }

    private _lazyLoad(){
        let slot = document.createElement('slot');
        this._container.appendChild(slot);

        let templates = this.querySelectorAll('template');
        for (let template of templates){
            let clone = document.importNode(template.content, true);
            this.appendChild(clone);
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

/**
 * A container for [[ Route ]] elements that creates a navigation bar to
 * navigate the routes it contains.
 */
export class Navigation extends Route {
    private nav : HTMLElement;
    private list : HTMLElement;
    protected defaultName = '';

    constructor(){
        super();

        this.nav = document.createElement('nav');
        this.list = document.createElement('ul');
        this.nav.appendChild(this.list);
    }

    get css(){
        // language=CSS
        return `            
            :host {
                width: 100%;
            }
            
            #${this.containerId} {
                display:inline-block;
                margin: 0;
                width: 100%;
                color: #ac072b;
                background-color: #f5e3e7;
            }
            
            nav {
                height: 50px;
            }
            
            nav ul {
              float: right;
              line-height: 2;
            }
            
            nav li {
                display: inline;
                list-style: none;
                margin-right: 20px;
            }
            
            a {
                text-decoration: none;
            }
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        for (let child of this.children){
            if (child instanceof Route){
                this.addNewRoute(child);
            }
        }
    }

    render(shadowRoot : ShadowRoot){
        shadowRoot.appendChild(this.nav);
        super.render(shadowRoot);
    }

    addNewRoute(routeElement : Route){
        if (routeElement instanceof Route) {
            routeElement.updateState();

            let li = document.createElement('li');
            let a = document.createElement('a');
            let path = routeElement.path;
            let title = routeElement.title;
            a.innerText = title;
            a.href = path;
            a.onclick = (event) => {
                event.preventDefault();

                window.history.pushState({}, title, path);
                for (let child of this.children){
                    if (child instanceof Route) {
                        child.updateState();
                    }
                }
            };
            routeElement.addEventListener(Route.EVENT_TITLE_CHANGE, ((event : CustomEvent) => {
                a.innerText = event.detail;
            }) as EventListener );
            li.appendChild(a);
            this.list.appendChild(li);
        }
    }
}

customElements.define('page-route', Route);
customElements.define('lazy-route', LazyRoute);
customElements.define('page-nav', Navigation);