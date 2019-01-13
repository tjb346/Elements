import { Grabbable } from "./movable.js";
export class Dialog extends Grabbable {
    constructor() {
        super();
        this._parentDialog = null;
        this.deleteButtonClass = 'delete';
        this.expandButtonClass = 'expand';
        this.nameClass = 'name';
        this.headerClass = 'header';
        this.containerClass = 'container';
        this.noPropagate = true; // Don't let clicks effect other dialogs.
        // Event callbacks
        this.onShow = null;
        this.onClose = null;
        this.onRemove = null;
        // Parent is a dialog instance. This dialog will close when parent closes.
        // It won't close when parent is clicked.
        this.nameElement = document.createElement('span');
        this.nameElement.className = this.nameClass;
        this.headerElement = document.createElement('div');
        this.headerElement.className = this.headerClass;
        this.containerElement = document.createElement('div');
        this.containerElement.className = this.containerClass;
        let expandButton = document.createElement('button');
        expandButton.type = 'button';
        expandButton.className = this.expandButtonClass;
        expandButton.onmousedown = (event) => {
            // Prevent from moving dialog.
            event.stopPropagation();
            event.preventDefault();
        };
        expandButton.onclick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.expanded = true;
        };
        let deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = this.deleteButtonClass;
        deleteButton.onmousedown = (event) => {
            // Prevent from moving dialog.
            event.stopPropagation();
            event.preventDefault();
        };
        deleteButton.onclick = (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.visible = false;
        };
        this.headerElement.appendChild(this.nameElement);
        this.headerElement.appendChild(deleteButton);
        this.headerElement.appendChild(expandButton);
        // this.onclick = (event) => {
        //   console.log("STOP");
        //   // Don't let clicks effect other dialogs.
        //   event.stopImmediatePropagation();
        // };
        let slot = document.createElement('slot');
        this.containerElement.appendChild(slot);
        this.documentClickListener = (event) => {
            this.closeOnOutsideClick(event);
        };
    }
    static get observedAttributes() {
        return ['name', 'visible', 'expanded'];
    }
    get css() {
        // language=CSS
        return `     
      :host {
        --dialog-font: 'Open Sans', sans-serif;
        --dialog-background: #ecf2f6;
        --dialog-shadow: 2px 2px 0 0 #444;
        --dialog-header-height: 28px;
        --dialog-header-text-color: black;
        --dialog-header-background-color: #c0d5e8;
        --dialog-item-text-color: #5c6873;
        --button-color: white;
        --button-hover-color: #999;
        --button-height: 30px;
        --button-min-width: 50px;
        --delete-button: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gMUEDkZeUosOwAAAtJJREFUWMPNmL9PFEEUxz+7IfzQkHCGQlBC7uzuYiWUlIaWno20a71/x9ROCxl7WmJ5JViZozwERCyIZ0ICQsFa+Nasm52ZvRXO+yab7CVv5r47853ve28CKiCKE4xW2fsrYA1YBzrAUiH8FOgBe0DXaPWxOIcLQRUiUZw8AjaA99TDW2DbaHXtIxZUIPMG2OZ+sGW02nGRCjxk9oEV7hcHRqtVGykboQZwDkzxMLgBFoxWAyehKE4AGsB3RoMF4Ft+pcKSk3TO6PBZpPE3oYJmpkZIaCqKk/08qSC3Qq7TlEpsB/gALFb8w6/Aa/Gl1HGqt4xWOwCBMJsBrhxkboG20aofxUkAHAHLHjLHQNNolUZx0gIOgUkHqcfAVSi62fKYZxvo5wi2gIFjzEBiUvndlzlcRrxhtPodEMVJ6gjsGK0OS6xhBvghX53HLTBntLouGdOW7SuF0SoIJDcdeHTwHEiLRiakzsQqspV5ViQjsgiALx79rYSSKF1YFM2EJV90DcyLXo6B+bKVkbFHFQ7DWihZ24dl4EJWpIg74KU8d5atvahwCADWgyhOTkpKCBus+rCkIJvObDgNPIK2naB54M6WsUUzoaxMY5jJwxru2pBjPOuImZWYxrCT1yH0oKhDKDO9S0fMZQXzLHfhcRP1hDjnUsWVsZlepqfLvNClhp4rmKcLvVC6Ax98pvdJHp95+rAXAt0KJUSzgun5zLMpc7nQHbvkOiHvm46eqxfFyQugn6vsQtFFmVgngbMoTv6Yp4xpuchI70YowbuOwFSKq1auPvKZXmaeWf2TFWiundiO4mT8Sth8kb/jqIuyiXpDkMlKl56nSz7IutlikZ91Hj9H2HncGK2m811sWaP4dIS92RNgkDfTsWulbcl1YLSa9tTa/3LZMG1LvKHFoDJNrXpapDrXMatDX8eUCH1GiL2rSWQT2DVaXdW+sPpfV3q/AM0PYtQhZQVnAAAAAElFTkSuQmCC);
        --expand-button: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gYHEhUdzt4g4wAAAlJJREFUWMPtmLFr20AUxn+6Oq7imoQUCs2QvyCDh9TQJVshayBbY+rVhUIH/xnlhnbJrTGXbKVdM3XwEmgyZAhkLHhIoVDToXbT0KbLU1CPk6zIqqOhHwgZcXr+9O5J7/teQAa0Ol2s0dHvNWAd2ABWgRVn+QA4BQ6AvjX62I2RhiALkVanWwM2gT3y4Tmwa40eTyIWZCDzDNilGLSt0b00UsEEMh+BRxSLI2t0M4lUEqEl4By4y7/BBbBsjR6mEmp1ugBLwFdmg2XgczxTyvMmnTM7fJLS+DtDE2rmDPgAhMDClAQWgQbwIKmmgliGfG/TGbAl5wC4MyWhqsR75ZBqW6N7AIGkax4YeQLsAC+A3wVuUx14Bzxxrt8DRkrqpp1wc+gU/pw85U2PuViMn8A3z39tWqOpxDLhw4Js0y+gArwEHufIyiHwGrhMWbMH7FekN2WBEjJbObfqTYaeuaakUZYF60q6dlmwoURClAWryqNnbhMripLhP6EshAYl4jNQIsjLglMl7qAsOFBAv0SE+iryTWWANfo46vbbGTzXlXTtPDiU+yd5t2uBVgO+exa9BZ6Khon0UJCD0FVMelSBfY9qqAHjigi0UavTbXsk7KIEiAhdFrAzVYnrGsjx9YdRBHYPOHIWNuRJ6jmVonvUJV7DEfm9yHkEHrf6wzGIX4CTBNk5reu4sEaHcRfrM4oPZ+jN7gPDuFEsnZVOaq5Da3Toqamihg0hMMzc7SN7a41uplikvOOY5o3HMZ5CnxdiOzmJbAPvrdGj3AOr2xrp/QFWN+Jth0cnawAAAABJRU5ErkJggg==);
      
        display: none;
        background: var(--dialog-background);
        box-shadow: var(--dialog-shadow);
        z-index: 10;
        font-family: var(--dialog-font);
        font-weight: bold;
        border: 1px solid black;
      }
      
      :host([visible]) {
        display: block;
      }
    
      :host([expanded]) {
        width: 100%;
        height: 100%;
      }
      
      .${this.headerClass} {
        display: flex;
        box-sizing: border-box;
        height: var(--dialog-header-height);
        padding-left: 4px;
        background-color: var(--dialog-header-background-color);
        color: var(--dialog-header-text-color);
        white-space: nowrap;
        cursor: move;
      }
      
      .${this.nameClass} {
        flex: 1;
        line-height: var(--dialog-header-height);
        margin-left: 4px;
        margin-right: 4px;
        font-size: 14px;
      }
      
      .${this.headerClass} > button {
        border: none;
        background-color: inherit;
        padding: unset;
        width: var(--dialog-header-height);
        height: var(--dialog-header-height);
      }
      
      button {
        display: inline-block;
        float: right;
        width: 18px;
        height: 18px;
        cursor: pointer;
      }
      
      .${this.expandButtonClass}::after {
        display: inline-block;
        width: 100%;
        height: 100%;
        background-size: 18px 18px;
        background-image: var(--expand-button);
        background-repeat: no-repeat;
        background-position: center;
        content: "";
      }
      
      .${this.deleteButtonClass}::after {
        display: inline-block;
        width: 100%;
        height: 100%;
        background-size: 18px 18px;
        background-image: var(--delete-button);
        background-repeat: no-repeat;
        background-position: center;
        content: "";
      }
    `;
    }
    get name() {
        return this.nameElement.innerText;
    }
    /**
     *
     * @param {string} value
     */
    set name(value) {
        this.nameElement.innerText = value;
    }
    get visible() {
        let attr = this.getAttribute('visible');
        return !(attr === null);
    }
    set visible(value) {
        if (value !== this.visible) {
            if (value) {
                this.setAttribute('visible', "true");
                let event = new Event(Dialog.EVENT_OPENED);
                this.dispatchEvent(event);
            }
            else {
                this.removeAttribute('visible');
                let event = new Event(Dialog.EVENT_CLOSED);
                this.dispatchEvent(event);
            }
        }
    }
    get expanded() {
        let attr = this.getAttribute('expanded');
        return !(attr === null);
    }
    set expanded(value) {
        if (value !== this.expanded) {
            if (value) {
                this.setAttribute('expanded', "true");
                this.position = { x: 0, y: 0 };
            }
            else {
                this.removeAttribute('expanded');
            }
        }
    }
    updateAttributes(attributes) {
        this.visible = !(attributes.visible === null);
        this.expanded = !(attributes.expanded === null);
        if (attributes.name === null) {
            this.name = "";
        }
        else {
            this.name = attributes.name;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.style.position = 'fixed';
        document.addEventListener('click', this.documentClickListener);
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.documentClickListener);
    }
    render(shadowRoot) {
        super.render(shadowRoot);
        shadowRoot.appendChild(this.headerElement);
        shadowRoot.appendChild(this.containerElement);
    }
    remove() {
        if (this.onRemove) {
            this.onRemove(this);
        }
        if (this.parentElement) {
            this.parentElement.removeChild(this);
        }
        document.removeEventListener('click', this.documentClickListener);
    }
    /**
     *  Checks if click is in dialog or one of one of its child dialogs and if not closes.
     */
    closeOnOutsideClick(event) {
        if (!event.defaultPrevented) {
            let targets = new Set();
            let target = event.target;
            while (target) {
                targets.add(target);
                target = target.parentElement;
            }
            let isThis = targets.has(this);
            let isChild = false;
            for (let child of this.flatChildren(Dialog)) {
                if (targets.has(child)) {
                    isChild = true;
                }
            }
            if (!(isThis || isChild)) {
                this.visible = false;
            }
        }
    }
    ;
}
/**
 * @event
 */
Dialog.EVENT_OPENED = 'opened';
/**
 * @event
 */
Dialog.EVENT_CLOSED = 'closed';
export class ConfirmDialog extends Dialog {
    constructor() {
        super();
        this._confirmButton = document.createElement('button');
    }
    render(root) {
        super.render(root);
        this._confirmButton.innerText = "Yes";
        this._confirmButton.onclick = this.onConfirmed.bind(this);
        this._confirmButton.className = 'button';
        root.appendChild(this._confirmButton);
    }
    set confirmationText(value) {
        this._confirmButton.innerText = value;
    }
    set disabled(value) {
        this._confirmButton.disabled = Boolean(value);
    }
    onConfirmed(event) {
        event.preventDefault();
        this.visible = false;
        let confirmedEvent = new Event(ConfirmDialog.EVENT_CONFIRMED);
        this.dispatchEvent(confirmedEvent);
    }
}
/**
 * @event
 */
ConfirmDialog.EVENT_CONFIRMED = 'confirmed';
customElements.define('base-dialog', Dialog);
customElements.define('confirm-dialog', ConfirmDialog);
