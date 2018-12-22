export class CustomElement extends HTMLElement {
    /**
     * Basic element class with some utilities to help extend HTMLElement.
     */
    constructor() {
        super();
        if (this.shadowRoot === null) {
            this.attachShadow({ mode: 'open' });
        }
    }
    static get observedAttributes() {
        return [];
    }
    get css() {
        return null;
    }
    get template() {
        return null;
    }
    connectedCallback() {
        this.refresh();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.refresh();
    }
    /**
     * Remove every child element from shadow dom
     */
    removeShadowChildren() {
        if (this.shadowRoot) {
            while (this.shadowRoot.firstChild) {
                this.shadowRoot.removeChild(this.shadowRoot.firstChild);
            }
        }
    }
    /**
     * Remove every child element
     */
    removeChildren() {
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
    }
    /**
     * Add child to the shadow dom
     */
    appendShadowChild(element) {
        if (this.shadowRoot) {
            this.shadowRoot.appendChild(element);
        }
    }
    /**
     * Add children in bulk to the shadow dom
     */
    appendShadowChildren(elements) {
        if (this.shadowRoot) {
            let frag = document.createDocumentFragment();
            for (let element of elements) {
                frag.appendChild(element);
            }
            this.shadowRoot.appendChild(frag);
        }
    }
    /**
     * Add children in bulk to this element
     */
    appendChildren(elements) {
        let frag = document.createDocumentFragment();
        for (let element of elements) {
            frag.appendChild(element);
        }
        this.appendChild(frag);
    }
    /**
     * All descendents recursively. Optionally filtered by type.
     */
    flatChildren(type) {
        function allChildren(element) {
            let rows = [];
            for (let child of element.children) {
                if (type === undefined || child instanceof type) {
                    rows.push(child);
                }
                rows = rows.concat(allChildren(child));
            }
            return rows;
        }
        return allChildren(this);
    }
    /**
     * Re-render the shadow dom.
     */
    refresh() {
        this.removeShadowChildren();
        let attributes = {};
        for (let attr of this.constructor.observedAttributes) {
            attributes[attr] = this.getAttribute(attr);
        }
        this.updateAttributes(attributes);
        if (this.shadowRoot) {
            this.render(this.shadowRoot);
        }
    }
    /**
     * Render the shadow dom. By default adds the string returned by template to shadow dom innerHTML.
     * @param {ShadowRoot} shadowRoot - The root shadow dom element.
     */
    render(shadowRoot) {
        let css = this.css;
        if (css) {
            let styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.innerHTML = css.toString();
            shadowRoot.appendChild(styleElement);
        }
        let template = this.template;
        if (template) {
            if (!(template instanceof HTMLTemplateElement)) {
                let t = document.createElement('template');
                t.innerHTML = template.toString();
                template = t;
            }
            let clone = document.importNode(template.content, true);
            shadowRoot.appendChild(clone);
        }
    }
}
