import {Dialog} from "./dialog.js";
import {CustomElement} from "./element.js";
import {Grabbable, Scrollable} from "./movable.js";
import {compareDateStrings, compareNumbers, compareStrings} from "../utils.js";
import {DraggableMixin, DroppableMixin} from "./draggable.js";

class TableBody extends Scrollable {
  get template(){
    return `
      <slot></slot>
    `;
  }

  get parentHeightDifference(){
    if (this.parentElement === null){
      return 0;
    }
    return this.parentElement.getBoundingClientRect().height - this.getBoundingClientRect().height;
  }

  get position(){
    return super.position;
  }

  set position(value){
    value.x = 0; // Don't allow motion in the x direction.
    value.y = Math.min(
        0,
        Math.max(this.parentHeightDifference, value.y || 0)
    );
    super.position = value;
  }
}

customElements.define('table-body', TableBody);

class ScrollWindowElement extends CustomElement {
  public readonly view : HTMLElement;
  public readonly pane : HTMLElement;

  constructor() {
    super();

    this.view = document.createElement('div');
    this.pane = document.createElement('table-body');

    let slot = document.createElement('slot');
    this.pane.appendChild(slot);
    this.view.appendChild(this.pane);
  }

  updateAttributes(attributes: { [p: string]: string | null }): void {}

  render(shadowRoot : ShadowRoot) {
    super.render(shadowRoot);

    this.view.style.position = 'relative';
    this.view.style.overflowY = 'hidden';
    this.view.style.height = 'inherit';
    this.view.style.width = '100%';

    this.pane.style.width = '100%';

    shadowRoot.appendChild(this.view);
  }
}


class TableElement extends CustomElement {
  get table(){
    let element = this.parentElement;
    while (element){
      if (element instanceof Table) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }


  updateAttributes(attributes: { [p: string]: string | null }): void {}
}

class BaseRow extends TableElement {
  protected hiddenClass = "hidden";

  constructor() {
    super();
  }

  get css(){
    // language=CSS
    return `
        :host {
            --selected-item-color: #5d91e5;
            --focus-item-color: #c0d5e8;

            display: flex;
            width: 100%;
            height: var(--table-row-height, 30px);
            line-height: var(--table-row-height, 30px);
        }
     `;
  }

  get template(){
    return `
      <slot></slot>
    `;
  }

  get hidden() : boolean {
    return this.classList.contains(this.hiddenClass);
  }

  set hidden(value : boolean){
    if (value){
      this.classList.add(this.hiddenClass);
    } else {
      this.classList.remove(this.hiddenClass);
    }
  }

  get allColumns() : Data[]{
    return Array.from(this.children).filter((child : Element) => child instanceof Data) as Data[];
  }

  getColumn(columnNumber : number) : Data | null {
    return this.allColumns[columnNumber] || null;
  }
}

export class Header extends BaseRow {
  constructor(){
    super();
    this.setAttribute('slot', Table.HEADER_SLOT_NAME);

    this.onclick = (event) => {
      let target = event.target;
      if (target instanceof Data){
        let table = this.table;
        let column = target.column;
        if (table !== null && column !== null){
          table.sortColumn(column);
        }
      }
    }
  }

  get css(){
    // language=CSS
    return super.css + `
        :host {
            --table-header-text-color: white;
            --table-header-color: #5c6873;
            
            color: var(--table-header-text-color);
            background: var(--table-header-color);
            text-transform: uppercase;
        }
        
        :host > * {
          cursor: pointer;
        }
        
        a {
            text-decoration: none;
            color: var(--table-header-text-color);
            font-weight: bold;
        }
     `;
  }
}


/**
 * An row element for use with [[Table]]. Should be a direct child of [[Table]].
 */
export class Row extends DraggableMixin(DroppableMixin(BaseRow)) {
  static readonly DATA_TRANSFER_TYPE =  "text/table-rows";
  static readonly SELECTED_CLASS = "selected";

  constructor(){
    super();

    this.selected = false;
    this.hidden = false;

    this.onclick = (event) => {
      let table = this.table;
      if (table !== null){
        let includeBetween, selectMultiple;
        if (event.shiftKey){
          includeBetween = true;
          selectMultiple = true;
        }else if (event.ctrlKey || event.metaKey){
          includeBetween = false;
          selectMultiple = true;
        }else{
          includeBetween = false;
          selectMultiple = false;
        }
        table.toggleRowSelection(this, selectMultiple, includeBetween);
      }
    }
  }

  // getters

  get css () {
    // language=CSS
    return super.css + `
        :host(:hover) {
            background: var(--focus-item-color);
            cursor: pointer;
        }
        
        :host(.${Row.SELECTED_CLASS}){
          background-color: var(--selected-item-color);
          color: #fff;
        }
        
        :host(.dragover) {
            background: var(--focus-item-color);
        }
        
        a.button {
          -webkit-appearance: button;
          -moz-appearance: button;
          appearance: button;
        
          text-decoration: none;
          color: initial;
        }
    `;
  }

  get selected(){
    return this.classList.contains(Row.SELECTED_CLASS);
  }

  get data() : string[] {
    let data = [];
    for (let child of this.allColumns){
      data.push(child.data);
    }
    return data;
  }

  // setters

  set selected(value){
    if (value){
      this.classList.add(Row.SELECTED_CLASS);
      this.dispatchEvent(new Event('selected'));
    } else {
      this.classList.remove(Row.SELECTED_CLASS);
      this.dispatchEvent(new Event('deselected'));
    }
  }

  toggleSelected(){
    this.selected = !this.selected;
  }


  handleDragStart(event: DragEvent) {
    super.handleDragStart(event);
    if (event.dataTransfer){
      event.dataTransfer.setData(Row.DATA_TRANSFER_TYPE, JSON.stringify(this.data));
      event.dataTransfer.dropEffect = 'move';
    }
  }
}

export class Data extends TableElement {
  protected ascendingSortClass = 'asc';
  protected descendingSortClass = 'des';

  constructor(){
    super();
  }

  static get observedAttributes() {
    return ['width'];
  }

  get css(){
    // language=CSS
    return `
        :host {
            flex: 1;
            padding: 0;
            text-align: start;
            font-size: calc(4px + .75vw);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        :host::after {
            float: right;
            margin-right: 10px;
        }

        :host(.${this.ascendingSortClass})::after {
           content: "\\25BC";
        }

        :host(.${this.descendingSortClass})::after {
            content: "\\25B2";
        }

    `;
  }

  get template(){
    return `
      <slot></slot>
    `;
  }

  get data() : string {
    return this.innerText;
  }

  set data(value : string){
    this.innerText = value.toString();
  }

  get width() : number | null {
    let flex = this.style.flex;
    if (flex === null){
      return null;
    }
    return Number.parseInt(flex);
  }

  set width(value : number | null){
    if (value === null){
      this.style.flex = null;
    } else {
      this.style.flex = value.toString();
    }
  }

  get column() : number | null {
    let parent = this.parentElement;
    if (parent instanceof BaseRow){
      return parent.allColumns.indexOf(this);
    }
    return null;
  }

  get sortOrder(){
    if (this.classList.contains(this.ascendingSortClass)){
      return 1;
    } else if (this.classList.contains(this.descendingSortClass)){
      return -1;
    }
    return 0;
  }

  updateAttributes(attributes: { [p: string]: string | null }): void {
    let width = null;
    if (attributes.width !== null){
      width = Number.parseInt(attributes.width);
    }
    this.width = width;
  }

  compare(dataElement : Data){
    return this.data.localeCompare(dataElement.data);
  }

  toggleSortOrder(){
    let next : string | null = this.ascendingSortClass;
    if (this.classList.contains(this.ascendingSortClass)){
      next = this.descendingSortClass;
    } else if (this.classList.contains(this.descendingSortClass)){
      next = null;
    }

    this.classList.remove(
      this.ascendingSortClass,
      this.descendingSortClass
    );

    if (next !== null) {
      this.classList.add(next);
    }
  }
}

type SortData = {
  columnNumber: number,
  sortOrder: number
}


/**
 * An interactive table element. It's children should be either [[Header]] or [[Row]] elements.
 */
export class Table extends DroppableMixin(ScrollWindowElement) {
  private sortStack : Data[];
  private columnsDialog : Dialog;
  private _selectMultiple : boolean;

  static readonly HEADER_SLOT_NAME = 'header';

  protected headerContainerClass = 'header';
  protected showHiddenClass = 'show-hidden';

  public contextMenu : Grabbable | null;

  constructor(){
    super();
    this.sortStack = [];
    this._selectMultiple = false;

    this.columnsDialog = new Dialog();
    this.columnsDialog.name = "Columns";

    this.contextMenu = null;

    // Deselected other rows if selectMultiple is false
    this.onclick = (event) => {
      let element = event.target;
      if (element instanceof Row && !this.selectMultiple) {
        for (let row of this.selectedRows){
          if (row !== element){
            row.selected = false;
          }
        }
      }
    };
  }

  // getters

  static get observedAttributes() {
    return ['select-multiple'];
  }


  get template(): null {
    return null
  }

  get css(){
    // language=CSS
    return `      
        :host {
            --table-row-height: 30px;
            --table-background-color: white;
          
            position: relative;
            padding: 0;
            width: 100%;
            height: 400px;
            background-color: var(--table-background-color);
            border-spacing: 0;
            box-shadow: none;
            color: var(--body-text-color);
        }
        
        a {
            text-decoration: none;
            color: var(--selected-item-color);
            font-weight: bold;
        }
        
        .${this.headerContainerClass} {
            width: 100%;
        }
     `;
  }

  get selectedData(){
    // Depends on length of row and data being the same;
    let data = new Set();
    for (let row of this.selectedRows) {
      data.add(row.data);
    }
    return data;
  }

  get selectedRows() : Row[] {
    return Array.from(this.querySelectorAll(`.${Row.SELECTED_CLASS}`));
  }

  set selectedRows(rows : Row[]) {
    let oldRows = new Set(this.selectedRows);
    let newRows = new Set(rows);
    let addedRows = [...newRows].filter(x => !oldRows.has(x));
    let removedRows = [...oldRows].filter(x => !newRows.has(x));

    for (let row of removedRows){
      row.selected = false;
    }
    for (let row of addedRows){
      row.selected = true;
    }
  }

  get allRows() : Row[] {
    return this.flatChildren(Row);
  }

  get showHidden(){
    return this.classList.contains(this.showHiddenClass);
  }

  get visibleColumnsDialog(){
    let header = this.mainHeader;
    if (header !== null){
      for (let column of header.allColumns){
        let div = document.createElement('div');
        let columnLabel = document.createElement('span');
        let columnCheckbox = document.createElement('input');
        columnCheckbox.type = 'checkbox';
        columnCheckbox.checked = column.visible;
        columnLabel.innerText = column.name;
        columnCheckbox.onchange = () => {
          column.visible = columnCheckbox.checked;
        };
        div.appendChild(columnLabel);
        div.appendChild(columnCheckbox);
        this.columnsDialog.appendChild(div);
      }
    }

    return this.columnsDialog;
  }

  // setters

  /**
   * Whether or not the table will allow for the selection of more than one row at a time.
   */
  get selectMultiple(){
    return this._selectMultiple || false;
  }

  set selectMultiple(value){
    this._selectMultiple = value;
    for (let row of this.flatChildren(Row)){
      row.selected = false;
    }
  }

  set showHidden(value){
    if (value) {
      this.classList.add(this.showHiddenClass);
    } else {
      this.classList.remove(this.showHiddenClass);
    }
  }

  get mainHeader() : Header | null {
    return this.querySelector('table-header');
  }

  updateAttributes(attributes: { [p: string]: string | null }): void {
    let multiSelect = attributes['select-multiple'];
    this.selectMultiple = multiSelect === null;
  }

  render(shadowRoot : ShadowRoot){
    let headerContainer = document.createElement('div');
    headerContainer.className = this.headerContainerClass;
    let headerSlot = document.createElement('slot');
    headerSlot.name = Table.HEADER_SLOT_NAME;
    headerContainer.appendChild(headerSlot);
    shadowRoot.appendChild(headerContainer);
    super.render(shadowRoot);
  }

  // Internal Events

  /**
   * Sort the table by the column with the given columnNumber.
   */
  sortColumn(columnNumber : number){
    let header = this.mainHeader;
    if (header){
      let dataElement = header.getColumn(columnNumber);
      if (dataElement) {
        dataElement.toggleSortOrder();
        if (dataElement.sortOrder === 0){
          let index = this.sortStack.indexOf(dataElement);
          if (index){
            this.sortStack.splice(index, 1);
          }
        } else {
          this.sortStack.push(dataElement);
        }
        this.sort();
      }
    }
  }

  private sort(){
    let frag = document.createDocumentFragment();
    let rows = this.allRows;

    // Create array of arrays that have form [column index, sort order] for each column in sort stack.
    let sortData : SortData[] = [];
    for (let dataElement of this.sortStack) {
      let order = dataElement.sortOrder;
      let columnNumber = dataElement.column;
      if (order !== 0 && columnNumber !== null) {
        sortData.unshift({
            columnNumber: columnNumber,
            sortOrder: order
        });
      }
    }
    rows = rows.sort((row1, row2) => {
      for (let items of sortData){
        let dataElement1 = row1.getColumn(items.columnNumber);
        let dataElement2 = row2.getColumn(items.columnNumber);
        if (dataElement1 === null || dataElement2 === null){
          return 0;
        }
        dataElement1.compare(dataElement2);
        let result = items.sortOrder * dataElement1.compare(dataElement2);
        if (result !== 0) {
          return result;
        }
      }
      return 0;
    });
    for (let row of rows){
      frag.appendChild(row);
    }
    this.appendChild(frag);
  }

  /**
  * Toggles the selection of a row. The argument can either be a row element in
  * the table or null. If null it will deselect all rows. A selected event is
  * fired on the row element when a row is first selected and deselect events
  * are similarly fired when its deselected.
  */
  toggleRowSelection(rowElement : Row, selectMultiple : boolean, includeBetween : boolean) {
    if (!this.selectMultiple){
      selectMultiple = false;
      includeBetween = false;
    }

    let oldRows = new Set(this.selectedRows);  // Make copy

    // Initialize new rows. If selectMultiple is true, we include the old selection.
    let newRows;
    if (selectMultiple){
      newRows = new Set(oldRows);
    } else {
      newRows = new Set();
    }

    // If only the toggled rowElement was selected before we remove it. Otherwise we add it.
    if (!includeBetween && oldRows.has(rowElement)){
      newRows.delete(rowElement);
    }else if (rowElement !== null){
      newRows.add(rowElement);
    }

    // Selects the rows between the previously selected rows and the toggled row if
    // includeBetween and selectMultiple are true.
    if (selectMultiple && includeBetween && oldRows.size > 0){
      let children = this.allRows;
      let sliceIndex = children.indexOf(rowElement);
      let sectionIndex = children.indexOf(rowElement);
      for (let row of oldRows){
        let index = children.indexOf(row);
        if (Math.abs(index - sectionIndex) < Math.abs(sliceIndex - sectionIndex)){
          sliceIndex = index;
        }
      }
      let start = Math.min(sliceIndex, sectionIndex) + 1;
      let end = Math.max(sliceIndex, sectionIndex);
      let rowsBetween = children.slice(start, end);
      for (let row of rowsBetween){
        if (this.showHidden || !row.hidden) {
          newRows.add(row);
        }
      }
    }

    this.selectedRows = Array.from(newRows);
  }
}

customElements.define('table-header', Header);
customElements.define('table-row', Row);
customElements.define('table-data', Data);
customElements.define('selectable-table', Table);
