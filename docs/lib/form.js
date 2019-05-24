var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CustomElement } from "./element.js";
export class AbstractInput extends CustomElement {
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
        this.shadowDOM.appendChild(this.container);
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
        this.onValueChange();
    }
    get type() {
        return this.getAttribute(Input.typeAttribute) || "";
    }
    set type(value) {
        this.setAttribute(Input.typeAttribute, value);
    }
    updateFromAttributes(attributes) {
        this.input.name = attributes[AbstractInput.nameAttribute] || "";
        this.input.type = attributes[Input.typeAttribute] || "";
    }
    onValueChange() {
        if (this.input.value) {
            this.input.classList.add(Input.valueClass);
        }
        else {
            this.input.classList.remove(Input.valueClass);
        }
        let event = new Event(Input.EVENT_CHANGE);
        this.dispatchEvent(event);
    }
}
Input.valueClass = 'value';
Input.typeAttribute = 'type';
/**
 * @event
 */
Input.EVENT_CHANGE = 'change';
export class ArrayInput extends Input {
    get value() {
        return this.input.value.split(',');
    }
    set value(value) {
        this.input.value = value.join(',');
        this.onValueChange();
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
    static get observedAttributes() {
        return AbstractInput.observedAttributes;
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
        this.onValueChange();
    }
    updateFromAttributes(attributes) {
        this.input.name = attributes[AbstractInput.nameAttribute] || "";
    }
}
export class SelectInput extends AbstractInput {
    constructor() {
        super();
        this.emptyOption = null;
        this.select = document.createElement("select");
        this.select.required = true;
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
        return AbstractInput.observedAttributes.concat([SelectInput.multiAttribute, SelectInput.nullableAttribute]);
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
    get nullable() {
        return this.getAttribute(SelectInput.nullableAttribute) !== null;
    }
    set nullable(value) {
        if (value) {
            this.setAttribute(SelectInput.nullableAttribute, "");
        }
        else {
            this.removeAttribute(SelectInput.nullableAttribute);
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
        let valueSet = new Set();
        if (this.multi) {
            for (let item of value) {
                valueSet.add(item);
            }
        }
        else {
            valueSet.add(value);
        }
        for (let option of this.flatChildren(SelectOption)) {
            if (valueSet.has(option.value)) {
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
        if (this.select.selectedOptions.length === 1 && this.select.selectedOptions[0] === this.emptyOption) {
            this.label.classList.remove(SelectInput.floatClass);
        }
        else {
            this.label.classList.add(SelectInput.floatClass);
        }
    }
    updateFromAttributes(attributes) {
        this.select.multiple = this.multi;
        if (this.nullable) {
            if (this.emptyOption === null) {
                this.emptyOption = document.createElement('option');
            }
            this.select.insertBefore(this.emptyOption, this.select.firstChild);
        }
        else {
            if (this.emptyOption !== null) {
                this.select.removeChild(this.emptyOption);
                this.emptyOption = null;
            }
        }
        this.moveLabel();
    }
}
SelectInput.multiAttribute = 'multi';
SelectInput.nullableAttribute = 'nullable';
SelectInput.floatClass = "float";
export class SelectOption extends CustomElement {
    constructor() {
        super();
        this.option = document.createElement('option');
        let observer = new MutationObserver((mutations) => {
            this.option.innerText = this.innerText;
        });
        observer.observe(this, { characterData: true, childList: true, subtree: true });
    }
    static get observedAttributes() {
        return [SelectOption.typeAttribute, SelectOption.valueAttribute, SelectOption.disabledAttribute];
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
    get disabled() {
        return this.hasAttribute(SelectOption.disabledAttribute);
    }
    set disabled(value) {
        if (value) {
            this.setAttribute(SelectOption.disabledAttribute, "");
        }
        else {
            this.removeAttribute(SelectOption.disabledAttribute);
        }
    }
    get parentSelect() {
        if (this.parentElement instanceof SelectInput && this.parentElement.shadowRoot) {
            return this.parentElement.shadowRoot.querySelector('select');
        }
        return name;
    }
    updateFromAttributes(attributes) {
        let value = attributes[SelectOption.valueAttribute];
        if (value !== null) {
            this.option.value = value;
        }
        else {
            this.option.value = "";
        }
        this.option.disabled = this.disabled;
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
        if (this.option.parentElement !== null) {
            this.option.parentElement.removeChild(this.option);
        }
    }
}
SelectOption.typeAttribute = 'type';
SelectOption.valueAttribute = 'value';
SelectOption.disabledAttribute = 'disabled';
export class Form extends CustomElement {
    constructor() {
        super();
        this.lastResponse = null;
        this.errorMessage = document.createElement('span');
        this.container = document.createElement('div');
        this.container.className = Form.containerClass;
        let slot = document.createElement('slot');
        this.container.appendChild(this.errorMessage);
        this.container.appendChild(slot);
        this.shadowDOM.appendChild(this.container);
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
            
            .${Form.containerClass} {
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
    get data() {
        let data = {};
        for (let child of this.children) {
            if (child instanceof AbstractInput) {
                data[child.name] = child.value;
            }
        }
        return data;
    }
    updateFromAttributes(attributes) { }
    getResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            this.classList.remove(Form.errorClass);
            this.classList.remove(Form.successClass);
            return yield fetch(this.action || '', {
                method: this.method || 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.data),
                credentials: 'same-origin',
            });
        });
    }
    handleResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            this.lastResponse = response;
            if (this.lastResponse.ok) {
                this.onSuccess();
            }
            else {
                let fieldErrors = {};
                let errorMessage = this.lastResponse.statusText;
                if (this.lastResponse.status == 400) {
                    try {
                        fieldErrors = yield this.lastResponse.json();
                    }
                    catch (e) {
                        try {
                            errorMessage = yield this.lastResponse.text();
                        }
                        catch (e) {
                            console.log("could not parse response");
                        }
                    }
                }
                this.onError(fieldErrors, errorMessage);
            }
        });
    }
    submit() {
        this.classList.add(Form.loadingClass);
        let event = new Event(Form.EVENT_SUBMIT);
        this.dispatchEvent(event);
        this.getResponse()
            .then((response) => {
            return this.handleResponse(response);
        })
            .catch((error) => {
            this.onError({}, Form.defaultErrorMessage);
        })
            .finally(() => {
            this.classList.remove(Form.loadingClass);
        });
    }
    onSuccess() {
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
    onError(fieldErrors, errorMessage) {
        this.classList.add(Form.errorClass);
        this.errorMessage.innerText = errorMessage || Form.defaultErrorMessage;
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
Form.containerClass = 'container';
Form.loadingClass = 'loading';
Form.successClass = 'success';
Form.errorClass = 'error';
Form.defaultErrorMessage = "Error saving form";
/**
 * @event
 */
Form.EVENT_SUBMIT = 'submit';
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
