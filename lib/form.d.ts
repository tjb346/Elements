import { CustomElement } from "./element.js";
export declare abstract class AbstractInput extends CustomElement {
    static readonly errorClass = "error";
    static nameAttribute: string;
    protected static readonly inputContainerId = "input-container";
    private static readonly containerId;
    private static readonly errorSpanId;
    abstract value: any;
    protected readonly inputContainer: HTMLElement;
    private readonly container;
    private readonly errorMessageSpan;
    /**
     * @event
     */
    static EVENT_CHANGE: string;
    protected constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    name: string;
    errorMessage: string;
    protected onValueChange(): void;
}
export declare class TextInput extends AbstractInput {
    static valueClass: string;
    static typeAttribute: string;
    protected input: HTMLInputElement | HTMLTextAreaElement;
    protected label: HTMLLabelElement;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    value: any;
    type: string;
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    protected onValueChange(): void;
}
export declare class ArrayInput extends TextInput {
    value: string[];
}
export declare class BooleanInput extends AbstractInput {
    private readonly input;
    private readonly label;
    private checkId;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    value: boolean;
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
}
export declare class SelectInput extends AbstractInput {
    static multiAttribute: string;
    static nullableAttribute: string;
    private static readonly floatClass;
    protected select: HTMLSelectElement;
    protected label: HTMLLabelElement;
    private emptyOption;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    multi: boolean;
    nullable: boolean;
    value: any;
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    private moveLabel;
    protected onValueChange(): void;
}
export declare class SelectOption extends CustomElement {
    static typeAttribute: string;
    static valueAttribute: string;
    static disabledAttribute: string;
    option: HTMLOptionElement;
    constructor();
    static readonly observedAttributes: string[];
    readonly css: string;
    value: any;
    type: string;
    selected: boolean;
    disabled: boolean;
    readonly parentSelect: HTMLSelectElement | null;
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export declare class Form extends CustomElement {
    static containerClass: string;
    static loadingClass: string;
    static successClass: string;
    static errorClass: string;
    static defaultErrorMessage: string;
    /**
     * @event
     */
    static EVENT_SUBMIT: string;
    /**
     * @event
     */
    static EVENT_SUCCESS: string;
    /**
     * @event
     */
    static EVENT_ERROR: string;
    lastResponse: Response | null;
    private readonly container;
    private readonly errorMessage;
    constructor();
    readonly css: string;
    action: string | null;
    method: string | null;
    readonly data: {
        [name: string]: any;
    };
    updateFromAttributes(attributes: {
        [p: string]: string | null;
    }): void;
    submit(): void;
    onSuccess(): void;
    onError(fieldErrors: {
        [field: string]: string;
    }, errorMessage: string): void;
    protected getResponse(): Promise<Response>;
    protected handleResponse(response: Response): Promise<void>;
}
