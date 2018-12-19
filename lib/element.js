export class CustomElement extends HTMLElement {
    /**
     * A class whose instances represent a DOM element. May one day be replaces with custom elements
     * via the Web Components spec (https://developer.mozilla.org/en-US/docs/Web/Web_Components).
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
     * @param {type} [type] - Filter by element class
     * @returns HTMLElement[]
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
/**
 * A mixin that makes the element "droppable" via the HTML drag and drop API.
 * @mixin DroppableMixin
 */
export let DroppableMixin = (elementClass) => {
    let mixed = class extends elementClass {
        constructor() {
            super();
            this.dragOverActions = []; // Actions to happen after dragover for dragOverDelay
            this.dragOverDelay = 2000;
            this.timeOuts = [];
            this.addEventListener("dragover", this.handleDragOver.bind(this));
            this.addEventListener("dragenter", this.handleDragEnter.bind(this));
            this.addEventListener("dragleave", this.handleDragLeave.bind(this));
            this.addEventListener("drop", this.handleDrop.bind(this));
        }
        static get dragOverClass() {
            return 'dragover';
        }
        static get pendingActionClass() {
            return 'pending-action';
        }
        get isOver() {
            return this.classList.contains(this.constructor.dragOverClass);
        }
        /**
         * Add callback to be called when dragover starts after the dragover delay.
         * @memberof DroppableMixin#
         * @param {Function} callback
         */
        addDragoverAction(callback) {
            this.dragOverActions.push(callback);
        }
        /**
         * Called when dragover event is triggered.
         * @memberof DroppableMixin#
         */
        handleDragOver(event) {
            event.preventDefault();
        }
        /**
         * Called when dragenter event triggered.
         * @memberof DroppableMixin#
         */
        handleDragEnter(event) {
            event.preventDefault();
            this.classList.add(this.constructor.dragOverClass);
            this.setTimeouts();
        }
        /**
         * Called when dragleave event triggered.
         * @memberof DroppableMixin#
         */
        handleDragLeave(event) {
            event.preventDefault();
            this.classList.remove(this.constructor.dragOverClass);
            this.clearTimeOuts();
        }
        /**
         * Called when drop event triggered.
         * @memberof DroppableMixin#
         */
        handleDrop(event) {
            event.preventDefault();
            this.classList.remove(this.constructor.dragOverClass);
            this.clearTimeOuts();
        }
        /**
         * Set timeouts to call dragover actions.
         * @memberof DroppableMixin#
         */
        setTimeouts() {
            if (this.dragOverActions.length > 0) {
                for (let action of this.dragOverActions) {
                    let timeoutId = window.setTimeout(() => {
                        action();
                    }, this.dragOverDelay);
                    this.timeOuts.push(timeoutId);
                }
                this.classList.add(this.constructor.pendingActionClass);
            }
        }
        /**
         * Remove timeouts to call dragover actions.
         * @memberof DroppableMixin#
         */
        clearTimeOuts() {
            this.classList.remove(this.constructor.pendingActionClass);
            for (let timeout of this.timeOuts) {
                window.clearTimeout(timeout);
            }
            this.timeOuts = [];
        }
    };
    return mixed;
};
/**
 * A mixin that makes the element "draggable" via the HTML drag and drop API.
 * @mixin DraggableMixin
 */
export let DraggableMixin = (elementClass) => {
    let mixed = class extends elementClass {
        constructor() {
            super();
            this.draggable = true;
            this.addEventListener('dragstart', this.handleDragStart.bind(this));
            this.addEventListener('dragend', this.handleDragEnd.bind(this));
        }
        /**
         * The class name of the element when it is being dragged.
         * @memberof DraggableMixin#
         */
        static get draggingClass() {
            return 'dragging';
        }
        /**
         * Called when dragstart event is fired.
         * @memberof DraggableMixin#
         */
        handleDragStart(event) {
            this.classList.add(this.constructor.draggingClass);
        }
        /**
         * Called when dragend event is fired.
         * @memberof DraggableMixin#
         */
        handleDragEnd(event) {
            this.classList.remove(this.constructor.draggingClass);
        }
    };
    return mixed;
};
