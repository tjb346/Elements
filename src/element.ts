

export abstract class CustomElement extends HTMLElement {
  /**
   * A class whose instances represent a DOM element. May one day be replaces with custom elements
   * via the Web Components spec (https://developer.mozilla.org/en-US/docs/Web/Web_Components).
   */
  protected constructor(){
    super();

    if (this.shadowRoot === null){
      this.attachShadow({mode: 'open'});
    }
  }

  static get observedAttributes(): string[] {
    return [];
  }

  get css(): string | null{
    return null;
  }

  get template(): string | HTMLTemplateElement | null {
    return null;
  }

  connectedCallback(){
    this.refresh();
  }

  attributeChangedCallback(name : string, oldValue : string | null, newValue : any) {
    this.refresh();
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
  removeChildren(){
    while (this.firstChild) {
        this.removeChild(this.firstChild);
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
   * @param {type} [type] - Filter by element class
   * @returns HTMLElement[]
   */
  flatChildren(type? : new () => Element){
    function allChildren(element : Element) : Element[]{
      let rows : Element[] = [];
      for (let child of element.children){
        if (type === undefined || child instanceof type){
          rows.push(child);
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
    if (css) {
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

/**
 * A mixin that makes the element "droppable" via the HTML drag and drop API.
 * @mixin DroppableMixin
 */
export let DroppableMixin = (elementClass : new () => HTMLElement) => {
  let mixed = class extends elementClass {
    private dragOverActions : (() => void)[] = []; // Actions to happen after dragover for dragOverDelay
    private dragOverDelay = 2000;
    private timeOuts : number[] = [];

    constructor() {
      super();

      this.addEventListener("dragover", this.handleDragOver.bind(this));
      this.addEventListener("dragenter", this.handleDragEnter.bind(this));
      this.addEventListener("dragleave", this.handleDragLeave.bind(this));
      this.addEventListener("drop", this.handleDrop.bind(this));
    }

    static get dragOverClass(){
      return 'dragover';
    }

    static get pendingActionClass(){
      return 'pending-action';
    }

    get isOver(){
      return this.classList.contains((this.constructor as typeof mixed).dragOverClass);
    }

    /**
     * Add callback to be called when dragover starts after the dragover delay.
     * @memberof DroppableMixin#
     * @param {Function} callback
     */
    addDragoverAction(callback : () => void){
      this.dragOverActions.push(callback);
    }

    /**
     * Called when dragover event is triggered.
     * @memberof DroppableMixin#
     */
    handleDragOver(event : Event){
      event.preventDefault();
    }

    /**
     * Called when dragenter event triggered.
     * @memberof DroppableMixin#
     */
    handleDragEnter(event : Event){
      event.preventDefault();

      this.classList.add((this.constructor as typeof mixed).dragOverClass);
      this.setTimeouts();
    }

    /**
     * Called when dragleave event triggered.
     * @memberof DroppableMixin#
     */
    handleDragLeave(event : Event){
      event.preventDefault();

      this.classList.remove((this.constructor as typeof mixed).dragOverClass);
      this.clearTimeOuts();
    }

    /**
     * Called when drop event triggered.
     * @memberof DroppableMixin#
     */
    handleDrop(event : Event){
      event.preventDefault();

      this.classList.remove((this.constructor as typeof mixed).dragOverClass);
      this.clearTimeOuts();
    }

    /**
     * Set timeouts to call dragover actions.
     * @memberof DroppableMixin#
     */
    setTimeouts(){
      if (this.dragOverActions.length > 0){
        for (let action of this.dragOverActions){
          let timeoutId = window.setTimeout(() => {
            action();
          }, this.dragOverDelay);
          this.timeOuts.push(timeoutId);
        }
        this.classList.add((this.constructor as typeof mixed).pendingActionClass);
      }
    }

    /**
     * Remove timeouts to call dragover actions.
     * @memberof DroppableMixin#
     */
    clearTimeOuts(){
      this.classList.remove((this.constructor as typeof mixed).pendingActionClass);
      for (let timeout of this.timeOuts){
        window.clearTimeout(timeout);
      }
      this.timeOuts = [];
    }
  };
  return mixed;
};

/**
 * A mixin that makes the element "draggable" via the HTML drag and drop API.
 * @mixin DraggableMixin
 */
export let DraggableMixin = (elementClass : new () => HTMLElement) => {
  let mixed = class extends elementClass {
    constructor() {
      super();

      this.draggable = true;
      this.addEventListener('dragstart', this.handleDragStart.bind(this));
      this.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    /**
     * The class name of the element when it is being dragged.
     * @memberof DraggableMixin#
     */
    static get draggingClass(){
      return 'dragging';
    }

    /**
     * Called when dragstart event is fired.
     * @memberof DraggableMixin#
     */
    handleDragStart(event : Event){
      this.classList.add((this.constructor as typeof mixed).draggingClass);
    }

    /**
     * Called when dragend event is fired.
     * @memberof DraggableMixin#
     */
    handleDragEnd(event : Event){
      this.classList.remove((this.constructor as typeof mixed).draggingClass);
    }
  };
  return mixed;
};

