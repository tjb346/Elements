import { CustomElement } from "./element.js";
export declare class Menu extends CustomElement {
    private readonly button;
    private readonly container;
    protected openedClass: string;
    constructor();
    readonly css: string;
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    render(shadowRoot: ShadowRoot): void;
}
