import {CustomElement} from "./element.js";


/**
 * A collapsible menu. Requires page have <meta name="viewport" content="width=device-width"> set in HTML to collapse.
 * CSS variables for theming:
 *    --menu-color
 *    --menu-background-color
 *    --menu-button-size
 *    --menu-float
 */
export class Menu extends CustomElement {
  static defaultCollapseWidth = 600;
  static collapseWidthAttribute = 'collapse-width';
  protected openedClass = 'opened';
  private readonly button: HTMLButtonElement;
  private readonly container: HTMLDivElement;

  constructor() {
    super();

    this.container = document.createElement('div');
    let slot = document.createElement('slot');
    this.container.appendChild(slot);

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.textContent = '\u2630';
    this.button.onclick = (event: MouseEvent) => {
      this.toggleOpened();
    };

    this.shadowDOM.appendChild(this.button);
    this.shadowDOM.appendChild(this.container);

    document.documentElement.addEventListener('click', (event: MouseEvent) => {
      this.handleEvent(event);
    });
    document.documentElement.addEventListener('touchstart', (event: TouchEvent) => {
      this.handleEvent(event);
    });
  }

  static get observedAttributes() {
    return [Menu.collapseWidthAttribute];
  }

  get css() {
    // language=CSS
    return `            
            :host {
                --button-size: var(--menu-button-size, 40px);
                
                position: relative;
            }
            
            ::slotted(*) {
                display: inline;
                margin-right: 20px;
            }
            
            button {
                display: none;
                cursor: pointer;
                color: var(--menu-color, white);
                background-color: transparent;
                border: 0;
                line-height: var(--button-size);
                font-size: calc(var(--button-size) - 20px);
                padding: 0 10px;
                float: var(--menu-float, right);
            }
            
            button:focus {
                outline: none;
            }
            
            @media screen and (max-width: ${this.collapseWidth}px) {  
                :host {
                    float: var(--menu-float, right);
                }         
                       
                ::slotted(*) {
                    display: block;
                } 
                
                div {
                    display: none;
                    position: absolute;
                    top: var(--button-size);
                    right: 0;
                    z-index: 9999;
                }     
                
                div.${this.openedClass} {
                    display: block;
                    background-color: var(--menu-background-color, white);
                }
                
                button {
                    display: block;
                }
            }
        `;
  }

  get opened() {
    return this.container.classList.contains(this.openedClass);
  }

  get collapseWidth(): number {
    let attr = this.getAttribute(Menu.collapseWidthAttribute);
    if (attr === null) {
      return Menu.defaultCollapseWidth;
    } else {
      return parseInt(attr) || Menu.defaultCollapseWidth;
    }
  }

  set collapseWidth(value: number) {
    this.setAttribute(Menu.collapseWidthAttribute, value.toString());
  }

  updateFromAttributes(attributes: { [p: string]: string | null }): void {
  }

  toggleOpened() {
    // Toggle open and close menu
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.container.classList.add(this.openedClass);
  }

  close() {
    this.container.classList.remove(this.openedClass);
  }

  isOutsideTarget(event: Event) {
    let node = event.target;
    while (node !== null && node instanceof Node) {
      if (node === this) {
        return false;
      }
      node = node.parentNode;
    }
    return true;
  }

  handleEvent(event: Event) {
    if (this.opened && this.isOutsideTarget(event)) {
      this.close();
    }
  }
}


customElements.define('collapse-menu', Menu);