import {CustomElement} from "./element.js";

export abstract class AbstractInput extends CustomElement {
  static readonly errorClass = "error";
  static nameAttribute = 'name';
  protected static readonly inputContainerId = 'input-container';
  private static readonly containerId = 'container';
  private static readonly errorSpanId = 'errors';
  public abstract value: any;
  protected readonly inputContainer: HTMLElement;
  private readonly container: HTMLElement;
  private readonly errorMessageSpan: HTMLElement;

  /**
   * @event
   */
  static EVENT_CHANGE = 'change';

  protected constructor() {
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
             --height: var(--input-height, 40px);
             --font-size: calc(.5 * var(--input-height, 40px));
           }
           
           #${AbstractInput.containerId} {
              position: relative;
              padding-bottom: 15px;
           }
           
           #${AbstractInput.errorSpanId} {
              position: absolute;
              bottom: 0;
              font-size: calc(.5 * var(--font-size));
              line-height: calc(.5 * var(--font-size));
              color: red;
           }
        `
  }

  get name(): string {
    return this.getAttribute(AbstractInput.nameAttribute) || "";
  }

  set name(value: string) {
    this.setAttribute(AbstractInput.nameAttribute, value);
  }

  get errorMessage(): string {
    return this.errorMessageSpan.innerText;
  }

  set errorMessage(value: string) {
    this.errorMessageSpan.innerText = value;
    if (value === "") {
      this.inputContainer.classList.remove(AbstractInput.errorClass);
    } else {
      this.inputContainer.classList.add(AbstractInput.errorClass);
    }
  }

  protected onValueChange() {
    let event = new Event(AbstractInput.EVENT_CHANGE);
    this.dispatchEvent(event);
  }
}

export class TextInput extends AbstractInput {
  static valueClass = 'value';
  static typeAttribute = 'type';

  protected input: HTMLInputElement | HTMLTextAreaElement;
  protected label: HTMLLabelElement;

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
    return AbstractInput.observedAttributes.concat([TextInput.typeAttribute]);
  }

  get css() {
    // language=CSS
    return super.css + `
           input, textarea {
             width: 100%;
             height: var(--height);
             box-sizing: border-box;
             border: 2px solid #888;
             border-radius: 1px;
             background-color: #f8f8f8;
             font-size: var(--font-size);
           }
           
           textarea {
               height: calc(2 * var(--height));
           }
           
           #${AbstractInput.inputContainerId}.${AbstractInput.errorClass} > input, #${AbstractInput.inputContainerId}.${AbstractInput.errorClass} > textarea {
                border-color: red;
           }
           
           label {
                position: absolute;
                height: 100%;
                left: 5px;
                color: #888;
                font-size: var(--font-size);
                transition: 0.2s ease all; 
                pointer-events: none;
           }
           
           input:focus ~ label, input.${TextInput.valueClass} ~ label, textarea:focus ~ label, textarea.${TextInput.valueClass} ~ label {
              top: 0;
              font-size: calc(.75 * var(--font-size));
              line-height: calc(.75 * var(--font-size));
              color:#5264AE;
           }
           
           #${AbstractInput.inputContainerId} {
             line-height: var(--height);
             padding-top: var(--font-size);
           }
        `
  }

  get value(): any {
    return this.input.value;
  }

  set value(value: any) {
    this.input.value = value;
    this.onValueChange()
  }

  get type(): string {
    return this.getAttribute(TextInput.typeAttribute) || "";
  }

  set type(value: string) {
    this.setAttribute(TextInput.typeAttribute, value);
  }

  updateFromAttributes(attributes: { [p: string]: string | null }): void {
    let type = attributes[TextInput.typeAttribute] || "";
    if (type === 'textarea') {
      let textArea = document.createElement("textarea") as HTMLTextAreaElement;
      textArea.value = this.input.value;
      // Prevent form submission on enter
      textArea.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.stopImmediatePropagation();
        }
      });
      this.inputContainer.replaceChild(textArea, this.input);
      this.input = textArea;
    } else {
      let input = document.createElement("input") as HTMLInputElement;
      input.type = type;
      input.value = this.input.value;
      this.inputContainer.replaceChild(input, this.input);
      this.input = input;
    }
    this.input.oninput = (event) => {
      this.onValueChange();
    };

    this.input.name = attributes[AbstractInput.nameAttribute] || "";
  }

  protected onValueChange() {
    if (this.input.value) {
      this.input.classList.add(TextInput.valueClass);
    } else {
      this.input.classList.remove(TextInput.valueClass);
    }

    super.onValueChange();
  }
}


export class ArrayInput extends TextInput {
  get value(): string[] {
    return this.input.value.split(',');
  }

  set value(value: string[]) {
    this.input.value = value.join(',');
    this.onValueChange();
  }
}


export class BooleanInput extends AbstractInput {
  private readonly input : HTMLInputElement;
  private readonly label: HTMLLabelElement;
  private checkId = 'check';

  constructor() {
    super();

    this.input = document.createElement("input");
    this.input.type = 'checkbox';
    this.input.oninput = (event) => {
      this.onValueChange();
    };
    this.label = document.createElement('label');
    let slot = document.createElement('slot');
    this.label.appendChild(slot);

    this.inputContainer.appendChild(this.input);
    this.inputContainer.appendChild(this.label);

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
             --checkbox-size: calc(.5 * var(--height));
           }
           
          input {
             width: 100%;
             height: var(--height);
             box-sizing: border-box;
             border: 2px solid #888;
             border-radius: 1px;
             background-color: #f8f8f8;
             font-size: var(--font-size);
           }
           
           #${AbstractInput.inputContainerId}.${AbstractInput.errorClass} > input {
                border-color: red;
           }
           
           label {
                position: absolute;
                height: 100%;
                left: 5px;
                color: #888;
                font-size: var(--font-size);
                transition: 0.2s ease all; 
                pointer-events: none;
           }
           
           #${AbstractInput.inputContainerId} {
             line-height: var(--height);
             padding-top: var(--font-size);
           }
           
            #${AbstractInput.inputContainerId} {
                position: relative;
                padding: 0;
            }
            
            input, #${this.checkId} {
                position: absolute;
                top: calc(.25 * var(--height));
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
                line-height: var(--height);
             }
             
             input:focus ~ label {
                color:#5264AE;
             }
        `;
  }

  get value(): boolean {
    return this.input.checked;
  }

  set value(value: boolean) {
    this.input.checked = value;
    this.onValueChange();
  }

  updateFromAttributes(attributes: { [p: string]: string | null }): void {
    this.input.name = attributes[AbstractInput.nameAttribute] || "";
  }
}


export class SelectInput extends AbstractInput {
  static multiAttribute = 'multi';
  static nullableAttribute = 'nullable';

  private static readonly floatClass = "float";
  protected select: HTMLSelectElement;
  protected label: HTMLLabelElement;
  private emptyOption: HTMLOptionElement | null = null;

  constructor() {
    super();

    this.select = document.createElement("select");
    this.select.required = true;

    this.select.onchange = () => {
      this.onValueChange();
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
                height: var(--height);
                box-sizing: border-box;
                border: 2px solid #888;
                border-radius: 1px;
            }
            
            select[multiple] {
                height: calc(2 * var(--height));
            }
            
            option {
                padding: 2px;
                font-size: var(--font-size);
            }
            
            #${AbstractInput.inputContainerId}.${AbstractInput.errorClass} > select {
                border-color: red;
            }
            
           label {
                position: absolute;
                height: 100%;
                left: 5px;
                color: #888;
                font-size: var(--font-size);
                transition: 0.2s ease all; 
                pointer-events: none;
           }
           
           label.${SelectInput.floatClass} {
              top: 0;
              font-size: calc(.75 * var(--font-size));
              line-height: calc(.75 * var(--font-size));
              color:#5264AE;
           }
           
           #${AbstractInput.inputContainerId} {
             line-height: var(--height);
             padding-top: var(--font-size);
           }
        `;
  }

  get multi(): boolean {
    return this.getAttribute(SelectInput.multiAttribute) !== null;
  }

  set multi(value: boolean) {
    if (value) {
      this.setAttribute(SelectInput.multiAttribute, "");
    } else {
      this.removeAttribute(SelectInput.multiAttribute);
    }
  }

  get nullable(): boolean {
    return this.getAttribute(SelectInput.nullableAttribute) !== null;
  }

  set nullable(value: boolean) {
    if (value) {
      this.setAttribute(SelectInput.nullableAttribute, "");
    } else {
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
      return values
    } else {
      if (values.length === 0) {
        return null;
      }
      return values[0];
    }
  }

  set value(value: any) {
    let valueSet = new Set();
    if (this.multi) {
      for (let item of value) {
        valueSet.add(item);
      }
    } else {
      valueSet.add(value);
    }

    for (let option of this.flatChildren(SelectOption)) {
      if (valueSet.has(option.value)) {
        option.selected = true;
        if (!this.multi) {
          break;
        }
      } else {
        option.selected = false;
      }
    }
    this.onValueChange();
  }

  updateFromAttributes(attributes: { [p: string]: string | null }): void {
    this.select.multiple = this.multi;
    if (this.nullable) {
      if (this.emptyOption === null) {
        this.emptyOption = document.createElement('option');
      }
      this.select.insertBefore(this.emptyOption, this.select.firstChild);
    } else {
      if (this.emptyOption !== null) {
        this.select.removeChild(this.emptyOption);
        this.emptyOption = null;
      }
    }

    this.moveLabel();
  }

  private moveLabel() {
    if (this.select.selectedOptions.length === 1 && this.select.selectedOptions[0] === this.emptyOption) {
      this.label.classList.remove(SelectInput.floatClass);
    } else {
      this.label.classList.add(SelectInput.floatClass);
    }
  }

  protected onValueChange() {
    this.moveLabel();
    super.onValueChange();
  }
}

export class SelectOption extends CustomElement {
  static typeAttribute = 'type';
  static valueAttribute = 'value';
  static disabledAttribute = 'disabled';

  public option: HTMLOptionElement;

  constructor() {
    super();

    this.option = document.createElement('option');

    let observer = new MutationObserver((mutations) => {
      this.option.innerText = this.innerText;
    });
    observer.observe(this, {characterData: true, childList: true, subtree: true});
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

  get value(): any {
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

  set value(value: any) {
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

  get type(): string {
    return this.getAttribute(SelectOption.typeAttribute) || 'string';
  }

  set type(value: string) {
    this.setAttribute(SelectOption.typeAttribute, value);
  }

  get selected(): boolean {
    return this.option.selected;
  }

  set selected(value: boolean) {
    this.option.selected = value;
  }

  get disabled(): boolean {
    return this.hasAttribute(SelectOption.disabledAttribute);
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute(SelectOption.disabledAttribute, "");
    } else {
      this.removeAttribute(SelectOption.disabledAttribute);
    }
  }

  get parentSelect(): HTMLSelectElement | null {
    if (this.parentElement instanceof SelectInput && this.parentElement.shadowRoot) {
      return this.parentElement.shadowRoot.querySelector('select');
    }
    return name;
  }

  updateFromAttributes(attributes: { [p: string]: string | null }): void {
    let value = attributes[SelectOption.valueAttribute];
    if (value !== null) {
      this.option.value = value;
    } else {
      this.option.value = "";
    }

    this.option.disabled = this.disabled;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.option.innerText = this.innerText;
    let parentSelect = this.parentSelect;
    if (parentSelect) {
      parentSelect.appendChild(this.option);
    }
  }


  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.option.parentElement !== null) {
      this.option.parentElement.removeChild(this.option);
    }
  }
}


export class Form extends CustomElement {
  static containerClass = 'container';
  static loadingClass = 'loading';
  static successClass = 'success';
  static errorClass = 'error';
  static defaultErrorMessage = "Error saving form";
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
  public lastResponse: Response | null = null;
  private readonly container: HTMLElement;
  private readonly errorMessage: HTMLElement;

  constructor() {
    super();

    this.errorMessage = document.createElement('span');
    this.container = document.createElement('div');
    this.container.className = Form.containerClass;
    let slot = document.createElement('slot');
    this.container.appendChild(this.errorMessage);
    this.container.appendChild(slot);
    this.shadowDOM.appendChild(this.container);

    this.onclick = (event: MouseEvent) => {
      if (event.target instanceof HTMLButtonElement && event.target.type === "submit") {
        this.submit();
      }
    };
    this.addEventListener('keydown', (event: KeyboardEvent) => {
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
        `
  }

  get action(): string | null {
    return this.getAttribute('action');
  }

  set action(value: string | null) {
    if (value === null) {
      this.removeAttribute('action');
    } else {
      this.setAttribute('action', value);
    }
  }

  get method(): string | null {
    return this.getAttribute('method');
  }

  set method(value: string | null) {
    if (value === null) {
      this.removeAttribute('method');
    } else {
      this.setAttribute('method', value);
    }
  }

  get data(): { [name: string]: any } {
    let data: { [name: string]: any } = {};
    for (let child of this.children) {
      if (child instanceof AbstractInput) {
        data[child.name] = child.value;
      }
    }
    return data;
  }

  updateFromAttributes(attributes: { [p: string]: string | null }): void {
  }

  submit() {
    this.classList.add(Form.loadingClass);
    let event = new Event(Form.EVENT_SUBMIT);
    this.dispatchEvent(event);
    this.getResponse()
      .then((response: Response) => {
        return this.handleResponse(response);
      })
      .catch((error: Error) => {
        this.onError({}, Form.defaultErrorMessage);
      })
      .finally(() => {
        this.classList.remove(Form.loadingClass);
      })
  }

  onSuccess() {
    this.classList.add(Form.successClass);
    let event = new Event(Form.EVENT_SUCCESS);
    this.errorMessage.innerText = "";
    for (let child of this.children) {
      if (child instanceof AbstractInput) {
        child.errorMessage = "";
      }
    }
    this.dispatchEvent(event);
  }

  onError(fieldErrors: { [field: string]: string }, errorMessage: string) {
    this.classList.add(Form.errorClass);
    this.errorMessage.innerText = errorMessage || Form.defaultErrorMessage;

    for (let child of this.children) {
      if (child instanceof AbstractInput) {
        let fieldError = fieldErrors[child.name];
        if (fieldError) {
          child.errorMessage = fieldError;
        } else {
          child.errorMessage = "";
        }
      }
    }
    let event = new Event(Form.EVENT_ERROR);
    this.dispatchEvent(event);
  }

  protected async getResponse(): Promise<Response> {
    this.classList.remove(Form.errorClass);
    this.classList.remove(Form.successClass);

    return await fetch(this.action || '', {
      method: this.method || 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.data),
      credentials: 'same-origin',
    });
  }

  protected async handleResponse(response: Response) {
    this.lastResponse = response;

    if (this.lastResponse.ok) {
      this.onSuccess();
    } else {
      let fieldErrors = {};
      let errorMessage = this.lastResponse.statusText;
      if (this.lastResponse.status == 400) {
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
}

customElements.define('form-input', TextInput);
customElements.define('array-input', ArrayInput);
customElements.define('boolean-input', BooleanInput);
customElements.define('select-input', SelectInput);
customElements.define('select-option', SelectOption);
customElements.define('json-form', Form);