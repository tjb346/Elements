import { CustomElement } from "./element.js";
export class Menu extends CustomElement {
    constructor() {
        super();
        this.openedClass = 'opened';
        this.container = document.createElement('div');
        let slot = document.createElement('slot');
        this.container.appendChild(slot);
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.innerText = '\u2630';
        this.button.onclick = (event) => {
            // Toggle open and close menu
            if (this.container.classList.contains(this.openedClass)) {
                this.container.classList.remove(this.openedClass);
            }
            else {
                this.container.classList.add(this.openedClass);
            }
        };
    }
    get css() {
        // language=CSS
        return `            
            :host {
                --menu-background-color: white;
                --menu-color: black;
                --menu-button-size: 40px;
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
            }
            
            @media screen and (max-width: 600px) {                  
                ::slotted(*) {
                    display: block;
                } 
                
                div {
                    display: none;
                    float: left;
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
    updateAttributes(attributes) {
    }
    render(shadowRoot) {
        super.render(shadowRoot);
        shadowRoot.appendChild(this.button);
        shadowRoot.appendChild(this.container);
    }
}
customElements.define('collapse-menu', Menu);