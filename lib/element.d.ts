export declare abstract class CustomElement extends HTMLElement {
    /**
     * Basic element class with some utilities to help extend HTMLElement.
     */
    protected constructor();
    static readonly observedAttributes: string[];
    readonly css: string | null;
    readonly template: string | HTMLTemplateElement | null;
    connectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: any): void;
    /**
     * Update the properties on this element from those set on the attributes.
     */
    abstract updateAttributes(attributes: {
        [name: string]: string | null;
    }): void;
    /**
     * Remove every child element from shadow dom
     */
    removeShadowChildren(): void;
    /**
     * Remove every child element
     */
    removeChildren(): void;
    /**
     * Add child to the shadow dom
     */
    appendShadowChild(element: Element): void;
    /**
     * Add children in bulk to the shadow dom
     */
    appendShadowChildren(elements: Element[] | NodeList): void;
    /**
     * Add children in bulk to this element
     */
    appendChildren(elements: Element[] | NodeList): void;
    /**
     * All descendents recursively. Optionally filtered by type.
     */
    flatChildren<T extends Element>(type?: new () => T): T[];
    /**
     * Re-render the shadow dom.
     */
    refresh(): void;
    /**
     * Render the shadow dom. By default adds the string returned by template to shadow dom innerHTML.
     * @param {ShadowRoot} shadowRoot - The root shadow dom element.
     */
    render(shadowRoot: ShadowRoot): void;
}
