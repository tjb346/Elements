import {CustomElement} from "./element.js";

export abstract class AbstractInput extends CustomElement {
    public abstract value : any;

    static readonly errorClass = "error";

    static nameAttribute = 'name';
    private static readonly containerId = 'container';
    private static readonly errorSpanId = 'errors';
    protected static readonly inputContainerId = 'input-container';

    private readonly container : HTMLElement;
    private readonly errorMessageSpan : HTMLElement;

    protected readonly inputContainer : HTMLElement;

    protected constructor(){
        super();

        this.container = document.createElement('div');
        this.container.id = AbstractInput.containerId;

        this.inputContainer = document.createElement('div');
        this.inputContainer.id = AbstractInput.inputContainerId;

        this.errorMessageSpan = document.createElement('span');
        this.errorMessageSpan.id = AbstractInput.errorSpanId;

        this.container.appendChild(this.inputContainer);
        this.container.appendChild(this.errorMessageSpan);
    }

    static get observedAttributes() {
        return [AbstractInput.nameAttribute];
    }

    get css(){
        // language=CSS
        return `
           :host {
             --input-height: 40px;
             --input-font-size: 20px;
           }
           
           #${AbstractInput.containerId} {
              position: relative;
              padding-bottom: 15px;
           }
           
           #${AbstractInput.inputContainerId} {
              height: var(--input-height);
           }
           
           #${AbstractInput.errorSpanId} {
              position: absolute;
              bottom: 0;
              font-size: calc(.5 * var(--input-font-size));
              line-height: calc(.5 * var(--input-font-size));
              color: red;
           }
        `
    }

    get name() : string {
        return this.getAttribute(AbstractInput.nameAttribute) || "";
    }

    set name(value : string){
        this.setAttribute(AbstractInput.nameAttribute, value);
    }

    get errorMessage() : string {
        return this.errorMessageSpan.innerText;
    }

    set errorMessage(value : string) {
        this.errorMessageSpan.innerText = value;
        if (value === "") {
            this.inputContainer.classList.remove(Input.errorClass);
        } else {
            this.inputContainer.classList.add(Input.errorClass);
        }
    }

    render(shadowRoot: ShadowRoot): void {
        super.render(shadowRoot);

        shadowRoot.appendChild(this.container);
    }
}

export class Input extends AbstractInput {
    protected input : HTMLInputElement;
    protected label : HTMLLabelElement;

    static valueClass = 'value';
    static typeAttribute = 'type';

    constructor(){
        super();

        this.input = document.createElement("input");
        this.input.oninput = (event) => {
            this.onValueChange();
        };
        this.label = document.createElement('label');
        let slot = document.createElement('slot');
        this.label.appendChild(slot);

        this.inputContainer.appendChild(this.input);
        this.inputContainer.appendChild(this.label);
    }

    static get observedAttributes() {
        return AbstractInput.observedAttributes.concat([Input.typeAttribute]);
    }

    get css(){
        // language=CSS
        return super.css + `
           input {
             width: 100%;
             height: 100%;
             box-sizing: border-box;
             border: 2px solid #888;
             border-radius: 1px;
             background-color: #f8f8f8;
             font-size: var(--input-font-size);
           }
           
           #${AbstractInput.inputContainerId}.${AbstractInput.errorClass} > input {
                border-color: red;
           }
           
           label {
                position: absolute;
                height: 100%;
                left: 5px;
                color: #888;
                font-size: var(--input-font-size);
                transition: 0.2s ease all; 
                pointer-events: none;
           }
           
           input:focus ~ label, input.value ~ label {
              top: 0;
              font-size: calc(.75 * var(--input-font-size));
              line-height: calc(.75 * var(--input-font-size));
              color:#5264AE;
           }
           
           #${AbstractInput.inputContainerId} {
             line-height: var(--input-height);
             padding-top: var(--input-font-size);
           }
        `
    }

    get value() : any {
        return this.input.value;
    }

    set value(value : any){
        this.input.value = value;
        this.onValueChange()
    }

    get type() : string {
        return this.getAttribute(Input.typeAttribute) || "";
    }

    set type(value : string) {
        this.setAttribute(Input.typeAttribute, value);
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {
        this.input.name = attributes[AbstractInput.nameAttribute] || "";
        this.input.type = attributes[Input.typeAttribute] || "";
    }

    protected onValueChange(){
        if (this.input.value) {
            this.input.classList.add(Input.valueClass);
        } else {
            this.input.classList.remove(Input.valueClass);
        }
    }
}

class ArrayInput extends Input {
    get value() : string[] {
        return this.input.value.split(',');
    }

    set value(value : string[]){
        this.input.value = value.join(',');
        this.onValueChange();
    }
}

export class BooleanInput extends Input {
    private checkId = 'check';

    constructor(){
        super();

        this.input.type = 'checkbox';

        let span = document.createElement('span');
        span.id = this.checkId;
        this.inputContainer.appendChild(span);
    }

    static get observedAttributes() {
        return AbstractInput.observedAttributes;
    }

    get css(){
        // language=CSS
        return super.css + `
           :host {
             --checkbox-size: calc(.5 * var(--input-height));
             --input-font-size: 20px;
           }
           
            #${AbstractInput.inputContainerId} {
                position: relative;
                padding: 0;
            }
            
            input, #${this.checkId} {
                position: absolute;
                top: calc(.25 * var(--input-height));
                left: 0;
                width: var(--checkbox-size);
                height: var(--checkbox-size);
                margin: 0;
                padding: 0;
            }
            
            input {
                opacity: 0;
                cursor: pointer;
                z-index: 1;
            }
            
            #${this.checkId} {
                z-index: 0;
                border: 2px solid #5a5a5a;
                border-radius: 1px;
                -webkit-transition: .2s;
                transition: .2s;
            }
            
            input:checked ~ #${this.checkId} {
                border: 2px solid #26a69a;
                background-color: #26a69a;
            }
            
            #${this.checkId}:after {
                content: "";
                display: none;
            }
            
            input:checked ~ #${this.checkId}:after {
                display: block;
                width: calc(.33 * var(--checkbox-size));
                height: calc(.75 * var(--checkbox-size));
                margin-left: calc(.3 * var(--checkbox-size));
                border: solid white;
                border-width: 0 3px 3px 0;
                box-sizing: border-box;
                -webkit-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
                transform: rotate(45deg);
            }
            
            label {
                position: static;
                margin-left: calc(6px + var(--checkbox-size));
                line-height: var(--input-height);
           }
           
           input:focus ~ label, input:valid ~ label {
              font-size: var(--input-font-size);
              line-height: var(--input-height);
           }
        `;
    }

    get value() : boolean {
        return this.input.checked;
    }

    set value(value : boolean){
        this.input.checked = value;
        this.onValueChange();
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {
        this.input.name = attributes[AbstractInput.nameAttribute] || "";
    }
}


export class SelectInput extends AbstractInput {
    static multiAttribute = 'multi';
    private static readonly floatClass = "float";
    protected select : HTMLSelectElement;
    protected label : HTMLLabelElement;

    constructor(){
        super();

        this.select = document.createElement("select");
        this.select.required = true;
        let emptyOption = document.createElement('option');
        this.select.appendChild(emptyOption);
        this.select.onchange = () => {
            this.moveLabel();
        };
        this.label = document.createElement('label');
        let slot = document.createElement('slot');
        this.label.appendChild(slot);

        this.inputContainer.appendChild(this.select);
        this.inputContainer.appendChild(this.label);
    }

    static get observedAttributes() {
        return AbstractInput.observedAttributes.concat([SelectInput.multiAttribute]);
    }

    get css() {
        // language=CSS
        return super.css + `
            select {
                background-color: #f8f8f8;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border: 2px solid #888;
                border-radius: 1px;
            }
            
            option {
                padding: 2px;
                font-size: var(--input-font-size);
            }
            
            #${AbstractInput.inputContainerId}.${AbstractInput.errorClass} > select {
                border-color: red;
            }
            
           label {
                position: absolute;
                height: 100%;
                left: 5px;
                color: #888;
                font-size: var(--input-font-size);
                transition: 0.2s ease all; 
                pointer-events: none;
           }
           
           label.${SelectInput.floatClass} {
              top: 0;
              font-size: calc(.75 * var(--input-font-size));
              line-height: calc(.75 * var(--input-font-size));
              color:#5264AE;
           }
           
           #${AbstractInput.inputContainerId} {
             line-height: var(--input-height);
             padding-top: var(--input-font-size);
           }
        `;
    }

    get multi() : boolean {
        return this.getAttribute(SelectInput.multiAttribute) !== null;
    }

    set multi(value : boolean) {
        if (value) {
            this.setAttribute(SelectInput.multiAttribute, "");
        } else {
            this.removeAttribute(SelectInput.multiAttribute);
        }
    }


    get value(){
        let values = [];
        for (let option of this.flatChildren(SelectOption)){
            if (option.selected) {
                values.push(option.value);
            }
        }

        if (this.multi){
            return values
        } else {
            if (values.length === 0){
                return null;
            }
            return values[0];
        }
    }

    set value(value : any){
        for (let option of this.flatChildren(SelectOption)){
            if (option.value === value) {
                option.selected = true;
                if (!this.multi){
                    break;
                }
            } else {
                option.selected = false;
            }
        }
        this.moveLabel();
    }

    private moveLabel(){
        if (this.value === null){
            this.label.classList.remove(SelectInput.floatClass);
        } else {
            this.label.classList.add(SelectInput.floatClass);
        }
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {}
}

export class SelectOption extends CustomElement {
    static typeAttribute = 'type';
    static valueAttribute = 'value';
    public option : HTMLOptionElement;

    constructor(){
        super();

        this.option = document.createElement('option');

        let observer = new MutationObserver((mutations) => {
            this.option.innerText = this.innerText;
        });
        observer.observe(this, {characterData: true, childList: true, subtree: true});
    }

    static get observedAttributes() {
        return [SelectOption.typeAttribute, SelectOption.valueAttribute];
    }

    get css() {
        // language=CSS
        return `
            :host {
                display: none;
            }
        `;
    }

    get value() : any {
        let value = this.option.value;
        if (value === ""){
            return null;
        }
        switch (this.type) {
            case "number":
                return Number.parseFloat(value);
            case "boolean":
                return Boolean(value);
            default:
                return value;
        }
    }

    set value(value : any){
        if (value === null){
            this.setAttribute(SelectOption.valueAttribute, "");
        }

        switch (this.type) {
            case "number":
                this.setAttribute(SelectOption.valueAttribute, value.toString());
                break;
            case "boolean":
                this.setAttribute(SelectOption.valueAttribute, value ? "true" : "");
                break;
            default:
                this.setAttribute(SelectOption.valueAttribute, value.toString());
        }
    }

    get type() : string {
        return this.getAttribute(SelectOption.typeAttribute) || 'string';
    }

    set type(value : string){
        this.setAttribute(SelectOption.typeAttribute, value);
    }

    get selected() : boolean{
        return this.option.selected;
    }

    set selected(value : boolean){
        this.option.selected = value;
    }

    get parentSelect() : HTMLSelectElement | null {
        if (this.parentElement instanceof SelectInput && this.parentElement.shadowRoot){
            return this.parentElement.shadowRoot.querySelector('select');
        }
        return name;
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {
        let value = attributes[SelectOption.valueAttribute];
        if (value !== null){
            this.option.value = value;
        } else {
            this.option.value = "";
        }
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.option.innerText = this.innerText;
        let parentSelect = this.parentSelect;
        if (parentSelect){
            parentSelect.appendChild(this.option);
        }
    }


    disconnectedCallback(): void {
        super.disconnectedCallback();
        let parentSelect = this.parentSelect;
        if (parentSelect){
            parentSelect.removeChild(this.option);
        }
    }
}


export class Form extends CustomElement {
    private readonly container : HTMLElement;
    private readonly errorMessage : HTMLElement;

    public lastResponse : Response | null = null;

    static containerClass = 'container';
    static loadingClass = 'loading';
    static successClass = 'success';
    static errorClass = 'error';

    /**
     * @event
     */
    static EVENT_SUBMIT = 'submit';

    /**
     * @event
     */
    static EVENT_SUCCESS = 'success';

    /**
     * @event
     */
    static EVENT_ERROR = 'error';

    constructor(){
        super();

        this.errorMessage = document.createElement('span');
        this.container = document.createElement('div');
        this.container.className = Form.containerClass;
        let slot = document.createElement('slot');
        this.container.appendChild(this.errorMessage);
        this.container.appendChild(slot);
        this.onclick = (event : MouseEvent) => {
            if (event.target instanceof HTMLButtonElement && event.target.type === "submit"){
                this.submit();
            }
        };
        this.addEventListener('keydown', (event : KeyboardEvent) => {
            if (event.key === 'Enter') {
                this.submit();
            }
        });
    }

    get css(){
        // language=CSS
        return `
            :host {
               --form-button-color: #71816D;
               --form-button-hover-color: #B6B4AE;
                
               display: block;
            }
            
            span {
                display: inline-block;
                color: red;
                height: 18px;
                font-size: 16px;
                line-height: 16px;
            }
            
            .${Form.containerClass} {
                max-width: 300px;
            }
        `
    }

    get action() : string | null {
        return this.getAttribute('action');
    }

    set action(value : string | null){
        if (value === null) {
            this.removeAttribute('action');
        } else {
            this.setAttribute('action', value);
        }
    }

    get method() : string | null {
        return this.getAttribute('method');
    }

    set method(value : string | null){
        if (value === null) {
            this.removeAttribute('method');
        } else {
            this.setAttribute('method', value);
        }
    }

    updateAttributes(attributes: { [p: string]: string | null }): void {}

    render(shadowRoot: ShadowRoot): void {
        super.render(shadowRoot);

        shadowRoot.appendChild(this.container);
    }

    protected async getResponse() : Promise<Response> {
        this.classList.remove(Form.errorClass);
        this.classList.remove(Form.successClass);

        let data: { [name: string]: any } = {};
        for (let child of this.children) {
            if (child instanceof AbstractInput) {
                data[child.name] = child.value;
            }
        }

        return await fetch(this.action || '', {
            method: this.method || 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    protected async handleResponse(response : Response){
        this.lastResponse = response;

        if (this.lastResponse.ok) {
            this.onSuccess();
        } else {
            let fieldErrors = {};
            let errorMessage = this.lastResponse.statusText;
            if (this.lastResponse.status == 400){
                try {
                    fieldErrors = await this.lastResponse.json();
                } catch (e) {
                    try {
                        errorMessage = await this.lastResponse.text();
                    } catch (e) {
                        console.log("could not parse response");
                    }
                }
            }
            this.onError(fieldErrors, errorMessage);
        }
    }

    submit(){
        this.classList.add(Form.loadingClass);
        let event = new Event(Form.EVENT_SUBMIT);
        this.dispatchEvent(event);
        this.getResponse()
          .then((response : Response) => {
              return this.handleResponse(response);
          })
          .catch((error : Error) => {
              this.onError({}, "Error saving form");
          })
          .finally(() => {
              this.classList.remove(Form.loadingClass);
          })
    }

    onSuccess(){
        this.classList.add(Form.successClass);
        let event = new Event(Form.EVENT_SUCCESS);
        this.errorMessage.innerText = "";
        for (let child of this.children) {
            if (child instanceof Input) {
                child.errorMessage = "";
            }
        }
        this.dispatchEvent(event);
    }

    onError(fieldErrors : {[field : string]: string}, errorMessage : string){
        this.classList.add(Form.errorClass);
        if (errorMessage) {
            this.errorMessage.innerText = errorMessage;
        }

        for (let child of this.children) {
            if (child instanceof AbstractInput) {
                let fieldError = fieldErrors[child.name];
                if (fieldError){
                    child.errorMessage = fieldError;
                } else {
                    child.errorMessage = "";
                }
            }
        }
        let event = new Event(Form.EVENT_ERROR);
        this.dispatchEvent(event);
    }
}

customElements.define('form-input', Input);
customElements.define('array-input', ArrayInput);
customElements.define('boolean-input', BooleanInput);
customElements.define('select-input', SelectInput);
customElements.define('select-option', SelectOption);
customElements.define('json-form', Form);