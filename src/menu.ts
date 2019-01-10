import {CustomElement} from "./element.js";


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
            // Toggle open and close menu
            if (this.container.classList.contains(this.openedClass)){
                this.container.classList.remove(this.openedClass);
            } else {
                this.container.classList.add(this.openedClass);
            }
        };
    }

    static get observedAttributes() {
        return ['collapse-width'];
    }

    get css(){
        // language=CSS
        return `            
            :host {
                --menu-background-color: white;
                --menu-color: black;
                --menu-button-size: 40px;
                --menu-float: right;
                
                position: relative;
            }
            
            ::slotted(*) {
                display: inline;
                margin-right: 20px;
            }
            
            button {
                display: none;
                cursor: pointer;
                color: var(--menu-color);
                background-color: transparent;
                border: 0;
                line-height: var(--menu-button-size);
                font-size: calc(var(--menu-button-size) - 20px);
                padding: 0 10px;
                float: var(--menu-float);
            }
            
            button:focus {
                outline: none;
            }
            
            @media screen and (max-width: ${this.collapseWidth}px) {  
                :host {
                    float: var(--menu-float);
                }         
                       
                ::slotted(*) {
                    display: block;
                } 
                
                div {
                    display: none;
                    position: absolute;
                    top: var(--menu-button-size);
                    right: 0;
                    z-index: 9999;
                }     
                
                div.${this.openedClass} {
                    display: block;
                    background-color: var(--menu-background-color);
                }
                
                button {
                    display: block;
                }
            }
        `;
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
}


customElements.define('collapse-menu', Menu);