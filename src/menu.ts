import {CustomElement} from "./element.js";


/**
 * A collapsible menu
 * CSS variables for theming:
 *    --menu-color
 *    --menu-background-color
 *    --menu-button-size
 *    --menu-float
 */
export class Menu extends CustomElement {
    private readonly button : HTMLButtonElement;
    private readonly container : HTMLDivElement;
    private collapseWidth : number = 600;

    protected openedClass = 'opened';

    constructor() {
        super();

        this.container = document.createElement('div');
        let slot = document.createElement('slot');
        this.container.appendChild(slot);

        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerText = '\u2630';
        this.button.onclick = (event : MouseEvent) => {
            this.toggleOpened();
        };

        document.addEventListener('click', (event : MouseEvent) => {
            if (event.target instanceof Element) {
                let element : Element | null = event.target;
                while(element !== null) {
                    if (element === this){
                        return;
                    }
                    element = element.parentElement;
                }
                if (this.opened){
                    this.toggleOpened();
                }
            }
        });
    }

    static get observedAttributes() {
        return ['collapse-width'];
    }

    get css(){
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

    get opened(){
        return this.container.classList.contains(this.openedClass);
    }


    updateAttributes(attributes: { [p: string]: string | null }): void {
        let collapseWidth = attributes['collapse-width'];
        if (collapseWidth != null) {
            this.collapseWidth = Number.parseInt(collapseWidth);
        } else {
            this.collapseWidth = 600;
        }
    }


    render(shadowRoot: ShadowRoot) {
        super.render(shadowRoot);
        shadowRoot.appendChild(this.button);
        shadowRoot.appendChild(this.container);
    }

    toggleOpened(){
        // Toggle open and close menu
        if (this.opened){
            this.container.classList.remove(this.openedClass);
        } else {
            this.container.classList.add(this.openedClass);
        }
    }
}


customElements.define('collapse-menu', Menu);