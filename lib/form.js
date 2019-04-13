var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CustomElement } from "./element.js";
class AbstractInput extends CustomElement {
    constructor() {
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
    get css() {
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
        `;
    }
    get name() {
        return this.getAttribute(AbstractInput.nameAttribute) || "";
    }
    set name(value) {
        this.setAttribute(AbstractInput.nameAttribute, value);
    }
    get errorMessage() {
        return this.errorMessageSpan.innerText;
    }
    set errorMessage(value) {
        this.errorMessageSpan.innerText = value;
        if (value === "") {
            this.inputContainer.classList.remove(Input.errorClass);
        }
        else {
            this.inputContainer.classList.add(Input.errorClass);
        }
    }
    render(shadowRoot) {
        super.render(shadowRoot);
        shadowRoot.appendChild(this.container);
    }
}
AbstractInput.errorClass = "error";
AbstractInput.nameAttribute = 'name';
AbstractInput.containerId = 'container';
AbstractInput.errorSpanId = 'errors';
AbstractInput.inputContainerId = 'input-container';
export class Input extends AbstractInput {
    constructor() {
        super();
        this.input = document.createElement("input");
        this.input.oninput = (event) => {
            if (this.input.value) {
                this.input.classList.add(Input.valueClass);
            }
            else {
                this.input.classList.remove(Input.valueClass);
            }
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
    get css() {
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
        `;
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
    }
    get type() {
        return this.getAttribute(Input.typeAttribute) || "";
    }
    set type(value) {
        this.setAttribute(Input.typeAttribute, value);
    }
    updateAttributes(attributes) {
        this.input.name = attributes[AbstractInput.nameAttribute] || "";
        this.input.type = attributes[Input.typeAttribute] || "";
    }
}
Input.valueClass = 'value';
Input.typeAttribute = 'type';
class ArrayInput extends Input {
    get value() {
        return this.input.value.split(',');
    }
    set value(value) {
        this.input.value = value.join(',');
    }
}
export class BooleanInput extends Input {
    constructor() {
        super();
        this.checkId = 'check';
        this.input.type = 'checkbox';
        let span = document.createElement('span');
        span.id = this.checkId;
        this.inputContainer.appendChild(span);
    }
    get css() {
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
    get value() {
        return this.input.checked;
    }
    set value(value) {
        this.input.checked = value;
    }
}
export class SelectInput extends AbstractInput {
    constructor() {
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
    get multi() {
        return this.getAttribute(SelectInput.multiAttribute) !== null;
    }
    set multi(value) {
        if (value) {
            this.setAttribute(SelectInput.multiAttribute, "");
        }
        else {
            this.removeAttribute(SelectInput.multiAttribute);
        }
    }
    get value() {
        let values = [];
        for (let option of this.flatChildren(SelectOption)) {
            if (option.selected) {
                values.push(option.value);
            }
        }
        if (this.multi) {
            return values;
        }
        else {
            if (values.length === 0) {
                return null;
            }
            return values[0];
        }
    }
    set value(value) {
        for (let option of this.flatChildren(SelectOption)) {
            if (option.value === value) {
                option.selected = true;
                if (!this.multi) {
                    break;
                }
            }
            else {
                option.selected = false;
            }
        }
        this.moveLabel();
    }
    moveLabel() {
        if (this.value === null) {
            this.label.classList.remove(SelectInput.floatClass);
        }
        else {
            this.label.classList.add(SelectInput.floatClass);
        }
    }
    updateAttributes(attributes) { }
}
SelectInput.multiAttribute = 'multi';
SelectInput.floatClass = "float";
export class SelectOption extends CustomElement {
    constructor() {
        super();
        this.option = document.createElement('option');
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
    get value() {
        let value = this.option.value;
        if (value === "") {
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
    set value(value) {
        if (value === null) {
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
    get type() {
        return this.getAttribute(SelectOption.typeAttribute) || 'string';
    }
    set type(value) {
        this.setAttribute(SelectOption.typeAttribute, value);
    }
    get selected() {
        return this.option.selected;
    }
    set selected(value) {
        this.option.selected = value;
    }
    get parentSelect() {
        if (this.parentElement instanceof SelectInput && this.parentElement.shadowRoot) {
            return this.parentElement.shadowRoot.querySelector('select');
        }
        return name;
    }
    updateAttributes(attributes) {
        let value = attributes[SelectOption.valueAttribute];
        if (value !== null) {
            this.option.value = value;
        }
        else {
            this.option.value = "";
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.option.innerText = this.innerText;
        let parentSelect = this.parentSelect;
        if (parentSelect) {
            parentSelect.appendChild(this.option);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        let parentSelect = this.parentSelect;
        if (parentSelect) {
            parentSelect.removeChild(this.option);
        }
    }
}
SelectOption.typeAttribute = 'type';
SelectOption.valueAttribute = 'value';
export class Form extends CustomElement {
    constructor() {
        super();
        this.containerClass = 'container';
        this.successClass = 'success';
        this.errorClass = 'error';
        this.errorMessage = document.createElement('span');
        this.container = document.createElement('div');
        this.container.className = this.containerClass;
        let slot = document.createElement('slot');
        this.container.appendChild(this.errorMessage);
        this.container.appendChild(slot);
        this.onclick = (event) => {
            if (event.target instanceof HTMLButtonElement && event.target.type === "submit") {
                this.submit();
            }
        };
        this.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.submit();
            }
        });
    }
    get css() {
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
            
            .${this.containerClass} {
                max-width: 300px;
            }
        `;
    }
    get action() {
        return this.getAttribute('action');
    }
    set action(value) {
        if (value === null) {
            this.removeAttribute('action');
        }
        else {
            this.setAttribute('action', value);
        }
    }
    get method() {
        return this.getAttribute('method');
    }
    set method(value) {
        if (value === null) {
            this.removeAttribute('method');
        }
        else {
            this.setAttribute('method', value);
        }
    }
    updateAttributes(attributes) { }
    render(shadowRoot) {
        super.render(shadowRoot);
        shadowRoot.appendChild(this.container);
    }
    submit() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            for (let child of this.children) {
                if (child instanceof AbstractInput) {
                    data[child.name] = child.value;
                }
            }
            try {
                let response = yield fetch(this.action || '', {
                    method: this.method || 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    this.onSuccess();
                }
                else {
                    let fieldErrors = {};
                    let errorMessage = response.statusText;
                    if (response.status == 400) {
                        try {
                            fieldErrors = yield response.json();
                        }
                        catch (e) {
                            try {
                                errorMessage = yield response.text();
                            }
                            catch (e) {
                                console.log("Could not parse request data.");
                            }
                        }
                    }
                    this.onError(fieldErrors, errorMessage);
                }
            }
            catch (e) {
                this.onError({}, "Error saving form");
            }
        });
    }
    onSuccess() {
        this.className = this.successClass;
        let event = new Event(Form.EVENT_SUCCESS);
        this.errorMessage.innerText = "";
        for (let child of this.children) {
            if (child instanceof Input) {
                child.errorMessage = "";
            }
        }
        this.dispatchEvent(event);
    }
    onError(fieldErrors, errorMessage) {
        this.className = this.errorClass;
        if (errorMessage) {
            this.errorMessage.innerText = errorMessage;
        }
        console.trace();
        for (let child of this.children) {
            if (child instanceof AbstractInput) {
                let fieldError = fieldErrors[child.name];
                if (fieldError) {
                    child.errorMessage = fieldError;
                }
                else {
                    child.errorMessage = "";
                }
            }
        }
        let event = new Event(Form.EVENT_ERROR);
        this.dispatchEvent(event);
    }
}
/**
 * @event
 */
Form.EVENT_SUCCESS = 'success';
/**
 * @event
 */
Form.EVENT_ERROR = 'error';
customElements.define('form-input', Input);
customElements.define('array-input', ArrayInput);
customElements.define('boolean-input', BooleanInput);
customElements.define('select-input', SelectInput);
customElements.define('select-option', SelectOption);
customElements.define('json-form', Form);
