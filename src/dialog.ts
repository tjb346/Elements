import {Grabbable} from "./movable.js";


/**
 * A movable dialog element
 * CSS variables for theming:
 *    --dialog-header-height
 *    --dialog-header-background-color
 *    --dialog-header-text-color
 *    --dialog-background
 *    --dialog-font
 */
export class Dialog extends Grabbable {
  private readonly nameElement : HTMLElement;
  private readonly headerElement : HTMLElement;
  private readonly containerElement : HTMLElement;
  private readonly documentClickListener : (event : MouseEvent) => void;

  private readonly deleteButtonClass = 'delete';
  private readonly expandButtonClass = 'expand';
  private readonly nameClass = 'name';
  private readonly headerClass = 'header';
  private readonly containerClass = 'container';
  protected readonly noPropagate = true; // Don't let clicks effect other dialogs.

  private opened = false;

  // Event callbacks
  public onShow : ((dialog: Dialog) => void) | null = null;
  public onClose : ((dialog: Dialog) => void) | null = null;
  public onRemove : ((dialog: Dialog) => void) | null = null;

  /**
   * @event
   */
  static EVENT_OPENED = 'opened';

  /**
   * @event
   */
  static EVENT_CLOSED = 'closed';

  static DETETE_BUTTON_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gMUEDkZeUosOwAAAtJJREFUWMPNmL9PFEEUxz+7IfzQkHCGQlBC7uzuYiWUlIaWno20a71/x9ROCxl7WmJ5JViZozwERCyIZ0ICQsFa+Nasm52ZvRXO+yab7CVv5r47853ve28CKiCKE4xW2fsrYA1YBzrAUiH8FOgBe0DXaPWxOIcLQRUiUZw8AjaA99TDW2DbaHXtIxZUIPMG2OZ+sGW02nGRCjxk9oEV7hcHRqtVGykboQZwDkzxMLgBFoxWAyehKE4AGsB3RoMF4Ft+pcKSk3TO6PBZpPE3oYJmpkZIaCqKk/08qSC3Qq7TlEpsB/gALFb8w6/Aa/Gl1HGqt4xWOwCBMJsBrhxkboG20aofxUkAHAHLHjLHQNNolUZx0gIOgUkHqcfAVSi62fKYZxvo5wi2gIFjzEBiUvndlzlcRrxhtPodEMVJ6gjsGK0OS6xhBvghX53HLTBntLouGdOW7SuF0SoIJDcdeHTwHEiLRiakzsQqspV5ViQjsgiALx79rYSSKF1YFM2EJV90DcyLXo6B+bKVkbFHFQ7DWihZ24dl4EJWpIg74KU8d5atvahwCADWgyhOTkpKCBus+rCkIJvObDgNPIK2naB54M6WsUUzoaxMY5jJwxru2pBjPOuImZWYxrCT1yH0oKhDKDO9S0fMZQXzLHfhcRP1hDjnUsWVsZlepqfLvNClhp4rmKcLvVC6Ax98pvdJHp95+rAXAt0KJUSzgun5zLMpc7nQHbvkOiHvm46eqxfFyQugn6vsQtFFmVgngbMoTv6Yp4xpuchI70YowbuOwFSKq1auPvKZXmaeWf2TFWiundiO4mT8Sth8kb/jqIuyiXpDkMlKl56nSz7IutlikZ91Hj9H2HncGK2m811sWaP4dIS92RNgkDfTsWulbcl1YLSa9tTa/3LZMG1LvKHFoDJNrXpapDrXMatDX8eUCH1GiL2rSWQT2DVaXdW+sPpfV3q/AM0PYtQhZQVnAAAAAElFTkSuQmCC';
  static EXPAND_BUTTON_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4gYHEhUdzt4g4wAAAlJJREFUWMPtmLFr20AUxn+6Oq7imoQUCs2QvyCDh9TQJVshayBbY+rVhUIH/xnlhnbJrTGXbKVdM3XwEmgyZAhkLHhIoVDToXbT0KbLU1CPk6zIqqOhHwgZcXr+9O5J7/teQAa0Ol2s0dHvNWAd2ABWgRVn+QA4BQ6AvjX62I2RhiALkVanWwM2gT3y4Tmwa40eTyIWZCDzDNilGLSt0b00UsEEMh+BRxSLI2t0M4lUEqEl4By4y7/BBbBsjR6mEmp1ugBLwFdmg2XgczxTyvMmnTM7fJLS+DtDE2rmDPgAhMDClAQWgQbwIKmmgliGfG/TGbAl5wC4MyWhqsR75ZBqW6N7AIGkax4YeQLsAC+A3wVuUx14Bzxxrt8DRkrqpp1wc+gU/pw85U2PuViMn8A3z39tWqOpxDLhw4Js0y+gArwEHufIyiHwGrhMWbMH7FekN2WBEjJbObfqTYaeuaakUZYF60q6dlmwoURClAWryqNnbhMripLhP6EshAYl4jNQIsjLglMl7qAsOFBAv0SE+iryTWWANfo46vbbGTzXlXTtPDiU+yd5t2uBVgO+exa9BZ6Khon0UJCD0FVMelSBfY9qqAHjigi0UavTbXsk7KIEiAhdFrAzVYnrGsjx9YdRBHYPOHIWNuRJ6jmVonvUJV7DEfm9yHkEHrf6wzGIX4CTBNk5reu4sEaHcRfrM4oPZ+jN7gPDuFEsnZVOaq5Da3Toqamihg0hMMzc7SN7a41uplikvOOY5o3HMZ5CnxdiOzmJbAPvrdGj3AOr2xrp/QFWN+Jth0cnawAAAABJRU5ErkJggg==';

  static expandedAttribute = 'expanded';
  static visibleAttribute = 'visible';
  static nameAttribute = 'name';

  constructor(){
    super();

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
    expandButton.className =  this.expandButtonClass;
    expandButton.onmousedown =(event) => {
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
    deleteButton.onmousedown =(event) => {
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
    }
  }

  static get observedAttributes(): string[] {
    return [Dialog.nameAttribute, Dialog.visibleAttribute, Dialog.expandedAttribute];
  }

  get css(){
    // language=CSS
    return  super.css + `     
      :host {
        --header-height: var(--dialog-header-height, 28px);
        --delete-button: url(${Dialog.DETETE_BUTTON_URL});
        --expand-button: url(${Dialog.EXPAND_BUTTON_URL});
      
        display: none;
        background: var(--dialog-background, #ecf2f6);
        box-shadow: var(--dialog-shadow, 2px 2px 0 0 #444);
        z-index: 10;
        font-family: var(--dialog-font, sans-serif);
        font-weight: bold;
        border: 1px solid black;
      }
      
      :host([${Dialog.visibleAttribute}]) {
        display: block;
      }
    
      :host([${Dialog.expandedAttribute}]) {
        width: 100%;
        height: 100%;
      }
      
      .${this.headerClass} {
        display: flex;
        box-sizing: border-box;
        height: var(--header-height);
        padding-left: 4px;
        background-color: var(--dialog-header-background-color, #c0d5e8);
        color: var(--dialog-header-text-color, black);
        white-space: nowrap;
        cursor: move;
      }
      
      .${this.nameClass} {
        flex: 1;
        line-height: var(--header-height);
        margin-left: 4px;
        margin-right: 4px;
        font-size: 14px;
      }
      
      .${this.headerClass} > button {
        float: right;
        cursor: pointer;
        border: none;
        margin: 0;
        background-color: inherit;
        padding: unset;
        width: var(--header-height);
        height: var(--header-height);
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

  get name() : string {
    return this.getAttribute(Dialog.nameAttribute) || "";
  }

  /**
   *
   * @param {string} value
   */
  set name(value : string){
    this.setAttribute(Dialog.nameAttribute, value);
  }

  get visible() : boolean {
    return this.getAttribute(Dialog.visibleAttribute) !== null;
  }

  set visible(value : boolean){
    if (value){
      this.setAttribute(Dialog.visibleAttribute, "");
    } else {
      this.removeAttribute(Dialog.visibleAttribute);
    }
  }

  get expanded() : boolean {
    return  this.getAttribute(Dialog.expandedAttribute) !== null;
  }

  set expanded(value : boolean) {
    if (value){
      this.setAttribute(Dialog.expandedAttribute, "");
    } else {
      this.removeAttribute(Dialog.expandedAttribute);
    }
  }

  updateAttributes(attributes: { [p: string]: string | null }): void {
    let name = attributes[Dialog.nameAttribute];
    let visible = attributes[Dialog.visibleAttribute];
    let expanded = attributes[Dialog.expandedAttribute];

    if (expanded !== null){
      this.position = {x: 0, y: 0};
    }

    if (name === null) {
      this.nameElement.innerText = "";
    } else {
      this.nameElement.innerText = name;
    }

    if (visible === null){
      if (this.opened){
        this.opened = false;
        let event = new Event(Dialog.EVENT_CLOSED);
        this.dispatchEvent(event);
      }
    } else {
      if (!this.opened){
        this.opened = true;
        let event = new Event(Dialog.EVENT_OPENED);
        this.dispatchEvent(event);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.style.position = 'fixed';

    // Add to body because in FireFox document click listeners prevent contextmenu listeners
    document.body.addEventListener('click', this.documentClickListener);
  }

  disconnectedCallback(){
    document.body.removeEventListener('click', this.documentClickListener);
  }

  render(shadowRoot : ShadowRoot){
    super.render(shadowRoot);

    shadowRoot.appendChild(this.headerElement);
    shadowRoot.appendChild(this.containerElement);
  }

  remove(){
    if (this.onRemove){
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
  private closeOnOutsideClick(event : MouseEvent) {
    if (!event.defaultPrevented){
      let targets : Set<EventTarget> = new Set(event.composedPath());
      if (targets.has(this)){
        return;
      }
      for (let child of this.flatChildren(Dialog)){
        if (targets.has(child)){
          return;
        }
      }
      this.visible = false;
    }
  };
}

export class ConfirmDialog extends Dialog {
  private readonly confirmButton : HTMLButtonElement;

  /**
   * @event
   */
  static EVENT_CONFIRMED = 'confirmed';

  static confirmButtonClass = 'confirm';

  constructor(){
    super();

    this.confirmButton = document.createElement('button');
    this.confirmButton.className = ConfirmDialog.confirmButtonClass;
    this.confirmButton.innerText = "Yes";
    this.confirmButton.onclick = this.onConfirmed.bind(this);
  }

  get css(){
    // language=CSS
    return  super.css + `
        .${ConfirmDialog.confirmButtonClass} {
            float: right;
            margin: 2px;
            cursor: pointer;
        }
    `
  }


  render(root : ShadowRoot) {
    super.render(root);

    root.appendChild(this.confirmButton);
  }

  set confirmationText(value : string){
    this.confirmButton.innerText = value;
  }

  set disabled(value : boolean | string){
    this.confirmButton.disabled = Boolean(value);
  }

  onConfirmed(event : Event){
    event.preventDefault();

    this.visible = false;

    let confirmedEvent = new Event(ConfirmDialog.EVENT_CONFIRMED);
    this.dispatchEvent(confirmedEvent);
  }
}


customElements.define('base-dialog', Dialog);
customElements.define('confirm-dialog', ConfirmDialog);
