import {Draggable} from "./movable";

// language=CSS
const styleText = `    
  :host {
    display: flex;
    flex-direction: column;
    background: var(--dialog-background);
    box-shadow: var(--dialog-shadow);
    z-index: 10;
    font-family: var(--dialog-font);
    font-weight: bold;
    border: 1px solid black;
  }
  
  .header {
    box-sizing: border-box;
    height: var(--dialog-header-height);
    padding-left: 4px;
    background-color: var(--dialog-header-background-color);
    color: var(--dialog-header-text-color);
    cursor: move;
  }
  
  .header > .name {
    line-height: var(--dialog-header-height);
    margin-left: 4px;
    font-size: 14px;
  }
  
  .header > .dialog-button {
    width: var(--dialog-header-height);
    height: var(--dialog-header-height);
  }
  
  ::slotted(.dialog-item) {
    display: block;
    padding: 12px;
    cursor: pointer;
    color: var(--dialog-item-text-color);
  }

  ::slotted(.dialog-item input[type="checkbox"]) {
    float: right;
  }

  ::slotted(.dialog-item.drag-element) {
    position: absolute;
    padding: 0;
    margin: 0;
    width: 15px;
    height: 15px;
    top: 0;
    left: 0;
    cursor: move;
    font-size: 15px;
    line-height: 15px;
    text-align: center;
  }
  
  
  /* Should be the same as .file-browser-container .button */
  ::slotted(.button) {
    position: relative;
    box-sizing: border-box;
    text-align: center;
    min-width: var(--button-min-width);
    padding: 0 5px;
    overflow: hidden;
    text-transform: uppercase;
    border-radius: 4px;
    outline-color: #ccc;
    background-color: var(--button-color);
    line-height: var(--button-height);
    height: var(--button-height);
  
    float: right;
    margin: 10px;
  }
  
  /* Should be the same as .file-browser-container .button:hover */
  ::slotted(.button:hover) {
    cursor: pointer;
    background-color: var(--button-hover-color);
  }
  
  .dialog-button {
    display: inline-block;
    float: right;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .dialog-button.expand::after {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-size: 18px 18px;
    background-image: var(--expand-button);
    background-repeat: no-repeat;
    background-position: center;
    content: "";
  }
  
  .dialog-button.delete::after {
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

export class Dialog extends Draggable {
  private itemClass = 'dialog-item';
  private _parent : Dialog | null = null;
  private _children : Set<Dialog> = new Set();
  private _nameElement : HTMLElement;
  private _headerElement : HTMLElement;
  private _fullScreen = false;
  private _itemElement : HTMLElement;
  private _clickListener : (event : MouseEvent) => void;

  // Event callbacks
  public onShow : ((dialog: Dialog) => void) | null = null;
  public onClose : ((dialog: Dialog) => void) | null = null;
  public onRemove : ((dialog: Dialog) => void) | null = null;

  constructor(){
    super();

    // Parent is a dialog instance. This dialog will close when parent closes.
    // It won't close when parent is clicked.
    this._nameElement = document.createElement('span');
    this._nameElement.className = 'name';

    this._headerElement = document.createElement('div');
    this._headerElement.className = 'header';

    this._itemElement = document.createElement('div');
    this._itemElement.className = 'items';

    this.style.display = 'none';

    // Listener to close dialog when clicked outside. Checks if click is in
    // dialog or one of one of its child dialogs and if not closes.
    this._clickListener = (event : MouseEvent) => {
      if (!event.defaultPrevented){
        let targets : Set<Element> = new Set();
        let target : Element | null = event.target as Element;
        while (target) {
          targets.add(target);
          target = target.parentElement;
        }

        let isThis = targets.has(this);
        let isChild = false;
        for (let child of this.flatChildDialogs){
          if (targets.has(child)){
            isChild = true;
          }
        }

        if (!(isThis || isChild)){
          this.close();
        }
      }
    };

    this.center();
    this.items = [];
  }

  get childDialogs(){
    return this._children;
  }

  get flatChildDialogs(){
      let childSet = new Set();
      for (let child of this.childDialogs){
          childSet.add(child);
          for (let flatChildren of child.flatChildDialogs){
              childSet.add(flatChildren);
          }
      }
      return childSet;
  }

  get css(){
    return styleText;
  }

  get name(){
    return this._nameElement.innerText;
  }

  /**
   *
   * @param {string} value
   */
  set name(value : string){
    this._nameElement.innerText = value;
  }

  /**
   *
   * @param {HTMLElement[]} elements
   */
  set items(elements : HTMLElement[]){
    this.removeChildren();
    for (let element of elements){
      element.classList.add(this.itemClass);
    }
    this.appendChildren(elements);
  }

  set parent(value : Dialog | null){
    if (value === null){
      if (this._parent){
        this._parent.childDialogs.delete(this);
      }
      this._parent = null;
    } else {
      value.childDialogs.add(this);
    }
  }

  render(shadowRoot : ShadowRoot){
    super.render(shadowRoot);

    this._nameElement = document.createElement('span');
    this._nameElement.className = this.name;

    this._headerElement = document.createElement('div');
    this._headerElement.className = 'header';

    this._itemElement = document.createElement('div');
    this._itemElement.className = 'items';

    let expandButton = document.createElement('div');
    expandButton.className = 'dialog-button expand';
    expandButton.onmousedown =(event) => {
      // Prevent from moving dialog.
      event.stopPropagation();
      event.preventDefault();
    };
    expandButton.onclick = (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (this._fullScreen){
        this.center();
      } else {
        this.expand();
      }
    };
    let deleteButton = document.createElement('div');
    deleteButton.className = 'dialog-button delete';
    deleteButton.onmousedown =(event) => {
      // Prevent from moving dialog.
      event.stopPropagation();
      event.preventDefault();
    };
    deleteButton.onclick = (event) => {
      event.stopPropagation();
      event.preventDefault();
      this.close();
    };
    this._headerElement.appendChild(this._nameElement);
    this._headerElement.appendChild(deleteButton);
    this._headerElement.appendChild(expandButton);

    let slot = document.createElement('slot');
    slot.innerHTML= '<span>SLOT</span>';
    this._itemElement.appendChild(slot);

    shadowRoot.appendChild(this._headerElement);
    shadowRoot.appendChild(this._itemElement);
  }

  show(){
    if (this.onShow){
      this.onShow(this);
    }
    this.style.display = 'block';
    document.addEventListener('click', this._clickListener);
  }

  close(){
    for (let child of this._children) {
      child.close();
    }

    if (this.onClose){
      this.onClose(this);
    }
    this.style.display = 'none';
    document.removeEventListener('click', this._clickListener);
  }

  remove(){
    for (let child of this._children) {
      child.remove();
    }

    if (this.onRemove){
      this.onRemove(this);
    }
    if (this.parentElement) {
      this.parentElement.removeChild(this);
    }
    document.removeEventListener('click', this._clickListener);
  }

  center(){
    super.center();
    this._fullScreen = false;
  }

  expand(){
    super.expand();
    this._fullScreen = true;
  }
}

export class ConfirmDialog extends Dialog {
  private _confirmButton : HTMLButtonElement;

  public onConfirmed : ((event : Event) => void) | null;

  constructor(){
    super();

    this._confirmButton = document.createElement('button');
    this.onConfirmed = null;
  }

  render(root : ShadowRoot) {
    super.render(root);

    this._confirmButton.innerText = "Yes";
    this._confirmButton.onclick = this._onConfirmed.bind(this);
    this._confirmButton.className = 'button';
    root.appendChild(this._confirmButton);
  }

  set confirmationText(value : string){
    this._confirmButton.innerText = value;
  }

  set disabled(value : boolean | string){
    this._confirmButton.disabled = Boolean(value);
  }

  _onConfirmed(event : Event){
    event.preventDefault();

    this.close();
    if (this.onConfirmed){
      this.onConfirmed(event);
    }
  }
}


customElements.define('base-dialog', Dialog);
customElements.define('confirm-dialog', ConfirmDialog);
