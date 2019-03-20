
/**
 * Basic element class with some utilities to help extend HTMLElement.
 */
export abstract class CustomElement extends HTMLElement {
  /**
   * Is this element connected to the DOM
   */
  public connected : boolean = false;

  protected constructor(){
    super();

    if (this.shadowRoot === null){
      this.attachShadow({mode: 'open'});
    }
  }

  static get observedAttributes(): string[] {
    return [];
  }

  get css(): string {
    return "";
  }

  get template(): string | HTMLTemplateElement | null {
    return null;
  }

  connectedCallback(){
    this.connected = true;
    this.refresh();
  }

  disconnectedCallback(){
    this.connected = false;
  }

  attributeChangedCallback(name : string, oldValue : string | null, newValue : any) {
    if (this.connected){
      this.refresh();
    }
  }

  /**
   * Update the properties on this element from those set on the attributes.
   */
  abstract updateAttributes(attributes : {[name : string] : string | null}) : void;

  /**
   * Remove every child element from shadow dom
   */
  removeShadowChildren(){
    if (this.shadowRoot){
      while (this.shadowRoot.firstChild) {
        this.shadowRoot.removeChild(this.shadowRoot.firstChild);
      }
    }
  }

  /**
   * Remove every child element
   */
  removeChildren(type? : any){
    if (type !== undefined){
      let children = Array.from(this.children);
      for (let child of children){
        if (child instanceof type){
          this.removeChild(child);
        }
      }
    } else {
      while (this.firstChild) {
        this.removeChild(this.firstChild);
      }
    }
  }

  /**
   * Add child to the shadow dom
   */
  appendShadowChild(element : Element){
    if (this.shadowRoot){
      this.shadowRoot.appendChild(element);
    }
  }

  /**
   * Add children in bulk to the shadow dom
   */
  appendShadowChildren(elements : Element[] | NodeList){
    if (this.shadowRoot){
      let frag = document.createDocumentFragment();
      for (let element of elements){
        frag.appendChild(element);
      }
      this.shadowRoot.appendChild(frag);
    }
  }

  /**
   * Add children in bulk to this element
   */
  appendChildren(elements : Element[] | NodeList){
    let frag = document.createDocumentFragment();
    for (let element of elements){
        frag.appendChild(element);
    }
    this.appendChild(frag);
  }

  /**
   * All descendents recursively. Optionally filtered by type.
   */
  flatChildren<T extends Element>(type? : new () => T) {
    function allChildren(element : Element) : T[]{
      let rows : T[] = [];
      for (let child of element.children){
        if (type === undefined || child instanceof type){
          rows.push(child as T);
        }
        rows = rows.concat(allChildren(child));
      }
      return rows;
    }
    return allChildren(this);
  }

  /**
   * Re-render the shadow dom.
   */
  refresh(){
    this.removeShadowChildren();

    let attributes : {[name : string] : string | null} = {};
    for (let attr of (this.constructor as typeof CustomElement).observedAttributes){
      attributes[attr] = this.getAttribute(attr);
    }
    this.updateAttributes(attributes);

    if (this.shadowRoot){
      this.render(this.shadowRoot);
    }
  }

  /**
   * Render the shadow dom. By default adds the string returned by template to shadow dom innerHTML.
   * @param {ShadowRoot} shadowRoot - The root shadow dom element.
   */
  render(shadowRoot : ShadowRoot){
    let css = this.css;
    if (css !== "") {
        let styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.innerHTML= css.toString();
        shadowRoot.appendChild(styleElement);
    }

    let template = this.template;
    if (template) {
      if (!(template instanceof HTMLTemplateElement)){
        let t = document.createElement('template');
        t.innerHTML = template.toString();
        template = t;
      }
      let clone = document.importNode(template.content, true);
      shadowRoot.appendChild(clone);
    }
  }
}
