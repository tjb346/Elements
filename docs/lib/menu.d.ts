import { CustomElement } from "./element.js";
/**
 * A collapsible menu
 * CSS variables for theming:
 *    --menu-color
 *    --menu-background-color
 *    --menu-button-size
 *    --menu-float
 */
export declare class Menu extends CustomElement {
    private readonly button;
    private readonly container;
    private collapseWidth;
    protected openedClass: string;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    readonly opened: boolean;
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    render(shadowRoot: ShadowRoot): void;
    toggleOpened(): void;
}
