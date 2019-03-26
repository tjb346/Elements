import { Grabbable } from "./movable.js";
/**
 * A movable dialog element
 * CSS variables for theming:
 *    --dialog-header-height
 *    --dialog-header-background-color
 *    --dialog-header-text-color
 *    --dialog-background
 *    --dialog-font
 */
export declare class Dialog extends Grabbable {
    private readonly nameElement;
    private readonly headerElement;
    private readonly containerElement;
    private readonly documentClickListener;
    private readonly deleteButtonClass;
    private readonly expandButtonClass;
    private readonly nameClass;
    private readonly headerClass;
    private readonly containerClass;
    protected readonly noPropagate = true;
    private opened;
    onShow: ((dialog: Dialog) => void) | null;
    onClose: ((dialog: Dialog) => void) | null;
    onRemove: ((dialog: Dialog) => void) | null;
    /**
     * @event
     */
    static EVENT_OPENED: string;
    /**
     * @event
     */
    static EVENT_CLOSED: string;
    static DETETE_BUTTON_URL: string;
    static EXPAND_BUTTON_URL: string;
    static expandedAttribute: string;
    static visibleAttribute: string;
    static nameAttribute: string;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    /**
    *
    * @param {string} value
    */
    name: string;
    visible: boolean;
    expanded: boolean;
    updateAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(shadowRoot: ShadowRoot): void;
    remove(): void;
    /**
     *  Checks if click is in dialog or one of one of its child dialogs and if not closes.
     */
    private closeOnOutsideClick;
}
export declare class ConfirmDialog extends Dialog {
    private readonly confirmButton;
    /**
     * @event
     */
    static EVENT_CONFIRMED: string;
    static confirmButtonClass: string;
    constructor();
    readonly css: string;
    render(root: ShadowRoot): void;
    confirmationText: string;
    disabled: boolean | string;
    onConfirmed(event: Event): void;
}
