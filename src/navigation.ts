import {CustomElement} from "./element.js";

/**
 * Router element that contains the html to be shown when the route matches the name
 * of this element.
 */
export class Route extends CustomElement {
    private _name : string | null = null;
    private _title : string | null = null;
    protected containerId = 'container';
    protected homeName = '';
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
    }

    static get observedAttributes() {
        return ['name', 'title'];
    }

    static currentPath() : string[] {
        return window.location.pathname.split('/');
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

    get path() : string[] {
        let path =  this.name.split('/');
        let parent = this.parentElement;
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
        if (this.parentElement instanceof Navigation){
            this.parentElement.addNewRoute(this);
        }
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
            if ((route !== segmentName) || (route === "" && segmentName === undefined)){
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

/**
 * A container for [[ Route ]] elements that creates a navigation bar to
 * navigate the routes it contains.
 */
export class Navigation extends Route {
    private nav : HTMLElement;
    private menuButton : HTMLElement;
    private list : HTMLElement;
    protected defaultName = '';
    protected openedClass = 'opened';

    constructor(){
        super();

        this.nav = document.createElement('nav');
        this.nav.onclick = (event : MouseEvent) => {
            event.stopPropagation();  // to prevent clicks inside from closing menu
        };
        this.list = document.createElement('ul');
        this.menuButton = document.createElement('button');
        this.menuButton.innerText = '\u2630';
        this.menuButton.onclick = (event : MouseEvent) => {
            // Toggle open and close menu
            if (this.list.classList.contains(this.openedClass)){
                this.list.classList.remove(this.openedClass);
            } else {
                this.list.classList.add(this.openedClass);
            }
        };
        document.addEventListener('click', (event : MouseEvent) => {
            this.list.classList.remove(this.openedClass); // close menu when click outside nav
        });
        this.nav.appendChild(this.menuButton);
        this.nav.appendChild(this.list);
    }

    get css(){
        // language=CSS
        return `            
            :host {
                --nav-height: 50px;
                --nav-background-color: black;
                --nav-text-color: white;
                --nav-link-color: inherit;
                --nav-link-hover-color: grey;
                --nav-container-background: white;
                --nav-collapse-size: 600px;
                 
                position: relative;
                width: 100%;
            }
            
            #${this.containerId} {
                display:inline-block;
                margin: 0;
                width: 100%;
                background-color: var(--nav-container-background);
            }
            
            nav {
                height: var(--nav-height);
                color: var(--nav-text-color);
                background-color: var(--nav-background-color);
            }
            
            nav button {
                display: none;
                float: left;
                padding: 0 0 0 10px;
                border: 0;
                line-height: var(--nav-height);
                font-size: calc(var(--nav-height) - 20px);
                color: var(--nav-text-color);
                background-color: transparent;
                cursor: pointer;
            }
            
            nav ul {
              margin: 0;
              padding: 0;
              float: right;
              line-height: var(--nav-height);
            }
            
            nav li {
                display: inline;
                list-style: none;
                margin-right: 20px;
            }
            
            a {
                text-decoration: none;
                color: var(--nav-link-color);
            }
            
            a:hover {
                color: var(--nav-link-hover-color);
            }
            
            @media screen and (max-width: 600px) {
                nav button {
                    display: block;
                }
            
                nav ul {
                    position: absolute;
                    top: var(--nav-height);
                    left: 0;
                    padding: 10px;
                    display: none;
                    float: left;
                    line-height: normal;
                    background-color: var(--nav-background-color);
                    z-index: 9999;
                }
                
                nav ul.${this.openedClass} {
                    display: block;
                }
            
                nav li {
                    display: block;
                    padding: 15px;
                    margin: 0;
                }
            }
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        for (let child of this.children){
            if (child instanceof Route){
                this.addNewRoute(child);
                child.updateState();
            }
        }
    }

    render(shadowRoot : ShadowRoot){
        shadowRoot.appendChild(this.nav);
        super.render(shadowRoot);
    }

    addNewRoute(routeElement : Route){
        if (routeElement instanceof Route) {
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.innerText = routeElement.title;
            a.href = routeElement.path.join('/');
            a.onclick = (event) => {
                event.preventDefault();

                window.history.pushState({}, routeElement.title, routeElement.path.join('/'));
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

const rootPath = Route.currentPath();

customElements.define('page-route', Route);
customElements.define('lazy-route', LazyRoute);
customElements.define('page-nav', Navigation);