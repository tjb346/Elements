import { CustomElement } from "./element.js";
export declare class Menu extends CustomElement {
    private readonly button;
    private readonly container;
    private collapseWidth;
    protected openedClass: string;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    render(shadowRoot: ShadowRoot): void;
}
