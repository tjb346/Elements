// import to define dialog element
import "./dialog.js";
import { Dialog } from "./dialog.js";
import { CustomElement } from "./element.js";
import { Scrollable } from "./movable.js";
import { DraggableMixin, DroppableMixin } from "./draggable.js";
class TableBody extends Scrollable {
    get template() {
        return `
      <slot></slot>
    `;
    }
    get parentHeightDifference() {
        if (this.parentElement === null) {
            return 0;
        }
        return this.parentElement.getBoundingClientRect().height - this.getBoundingClientRect().height;
    }
    get position() {
        return super.position;
    }
    set position(value) {
        value.x = 0; // Don't allow motion in the x direction.
        value.y = Math.min(0, Math.max(this.parentHeightDifference, value.y || 0));
        super.position = value;
    }
}
customElements.define('table-body', TableBody);
class ScrollWindowElement extends CustomElement {
    constructor() {
        super();
        this.view = document.createElement('div');
        this.pane = document.createElement('table-body');
        let slot = document.createElement('slot');
        this.pane.appendChild(slot);
        this.view.appendChild(this.pane);
    }
    updateAttributes(attributes) { }
    render(shadowRoot) {
        super.render(shadowRoot);
        this.view.style.position = 'relative';
        this.view.style.overflowY = 'hidden';
        this.view.style.height = 'inherit';
        this.view.style.width = '100%';
        this.pane.style.width = '100%';
        shadowRoot.appendChild(this.view);
    }
    resetPane() {
        this.pane.position = { x: 0, y: 0 };
        this.pane.velocity = { x: 0, y: 0 };
    }
}
class TableElement extends CustomElement {
    get table() {
        let element = this.parentElement;
        while (element) {
            if (element instanceof Table) {
                return element;
            }
            element = element.parentElement;
        }
        return null;
    }
    updateAttributes(attributes) { }
}
class BaseRow extends TableElement {
    constructor() {
        super();
    }
    get css() {
        // language=CSS
        return `
        :host {
            display: flex;
            width: 100%;
            height: var(--table-row-height, 30px);
            line-height: var(--table-row-height, 30px);
        }
     `;
    }
    get template() {
        return `
      <slot></slot>
    `;
    }
    get hidden() {
        return this.classList.contains(BaseRow.hiddenClass);
    }
    set hidden(value) {
        if (value) {
            this.classList.add(BaseRow.hiddenClass);
        }
        else {
            this.classList.remove(BaseRow.hiddenClass);
        }
    }
    get allColumns() {
        return Array.from(this.children).filter((child) => child instanceof Data);
    }
    getColumn(columnNumber) {
        return this.allColumns[columnNumber] || null;
    }
}
BaseRow.hiddenClass = "hidden";
export class Header extends BaseRow {
    constructor() {
        super();
        this.onclick = (event) => {
            let target = event.target;
            if (target instanceof Data) {
                let table = this.table;
                let column = target.column;
                if (table !== null && column !== null) {
                    table.sortColumn(column);
                }
            }
        };
    }
    get css() {
        // language=CSS
        return super.css + `
        :host {
            color: var(--table-header-text-color, white);
            background: var(--table-header-color, #5c6873);
            text-transform: uppercase;
        }
        
        :host > * {
          cursor: pointer;
        }
        
        a {
            text-decoration: none;
            color: var(--table-header-text-color, white);
            font-weight: bold;
        }
      
        ::slotted(*)::after {
            float: right;
            margin-right: 10px;
        }

        ::slotted(.${Data.ascendingSortClass})::after {
           content: "\\25BC";
        }

        ::slotted(.${Data.descendingSortClass})::after {
            content: "\\25B2";
        }
     `;
    }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('slot', Table.HEADER_SLOT_NAME);
    }
}
/**
 * An row element for use with [[Table]]. Should be a direct child of [[Table]].
 */
export class Row extends DraggableMixin(DroppableMixin(BaseRow)) {
    constructor() {
        super();
        this.selected = false;
        this.hidden = false;
        this.onclick = (event) => {
            let table = this.table;
            if (table !== null) {
                let includeBetween, selectMultiple;
                if (event.shiftKey) {
                    includeBetween = true;
                    selectMultiple = true;
                }
                else if (event.ctrlKey || event.metaKey) {
                    includeBetween = false;
                    selectMultiple = true;
                }
                else {
                    includeBetween = false;
                    selectMultiple = false;
                }
                table.toggleRowSelection(this, selectMultiple, includeBetween);
            }
        };
    }
    // getters
    get css() {
        // language=CSS
        return super.css + `
        :host(:hover) {
            background: var(--table-focus-item-color, #c0d5e8);
            cursor: pointer;
        }
        
        :host(.${Row.SELECTED_CLASS}){
          background-color: var(--table-selected-item-color, #5d91e5);
          color: #fff;
        }
        
        :host(.dragover) {
            background: var(--table-focus-item-color, #c0d5e8);
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
    get selected() {
        return this.classList.contains(Row.SELECTED_CLASS);
    }
    get data() {
        let data = [];
        for (let child of this.allColumns) {
            data.push(child.data);
        }
        return data;
    }
    // setters
    set selected(value) {
        if (value) {
            this.classList.add(Row.SELECTED_CLASS);
            this.dispatchEvent(new Event('selected'));
        }
        else {
            this.classList.remove(Row.SELECTED_CLASS);
            this.dispatchEvent(new Event('deselected'));
        }
    }
    toggleSelected() {
        this.selected = !this.selected;
    }
    handleDragStart(event) {
        super.handleDragStart(event);
        if (event.dataTransfer) {
            event.dataTransfer.setData(Row.DATA_TRANSFER_TYPE, JSON.stringify(this.data));
            event.dataTransfer.dropEffect = 'move';
        }
    }
    compare(row, columnNumber) {
        let dataElement1 = this.getColumn(columnNumber);
        let dataElement2 = row.getColumn(columnNumber);
        if (dataElement1 === null || dataElement2 === null) {
            return 0;
        }
        return dataElement1.compare(dataElement2);
    }
}
Row.DATA_TRANSFER_TYPE = "text/table-rows";
Row.SELECTED_CLASS = "selected";
export class Data extends TableElement {
    constructor() {
        super();
    }
    static get observedAttributes() {
        return [Data.widthAttribute];
    }
    get css() {
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
      
        :host(.${Data.hiddenClass}) {
            display: none;
        }
    `;
    }
    get template() {
        return `
      <slot></slot>
    `;
    }
    get data() {
        return this.innerText;
    }
    set data(value) {
        this.innerText = value.toString();
    }
    get width() {
        let stringWidth = this.getAttribute(Data.widthAttribute);
        if (stringWidth === null) {
            return null;
        }
        else {
            return Number.parseInt(stringWidth);
        }
    }
    set width(value) {
        if (value === null) {
            this.removeAttribute(Data.widthAttribute);
        }
        else {
            this.setAttribute(Data.widthAttribute, value.toString());
        }
    }
    get hidden() {
        return this.classList.contains(Data.hiddenClass);
    }
    set hidden(value) {
        if (value) {
            this.classList.add(Data.hiddenClass);
        }
        else {
            this.classList.remove(Data.hiddenClass);
        }
    }
    get column() {
        let parent = this.parentElement;
        if (parent instanceof BaseRow) {
            return parent.allColumns.indexOf(this);
        }
        return null;
    }
    get sortOrder() {
        if (this.classList.contains(Data.ascendingSortClass)) {
            return 1;
        }
        else if (this.classList.contains(Data.descendingSortClass)) {
            return -1;
        }
        return 0;
    }
    set sortOrder(value) {
        switch (value) {
            case -1:
                this.classList.remove(Data.ascendingSortClass);
                this.classList.add(Data.descendingSortClass);
                break;
            case 0:
                this.classList.remove(Data.descendingSortClass);
                this.classList.remove(Data.ascendingSortClass);
                break;
            case 1:
                this.classList.remove(Data.descendingSortClass);
                this.classList.add(Data.ascendingSortClass);
                break;
        }
    }
    updateAttributes(attributes) {
        let width = attributes[Data.widthAttribute];
        if (width === null) {
            this.style.flex = null;
        }
        else {
            let parsed = Number.parseInt(width);
            if (!isNaN(parsed)) {
                this.style.flex = parsed.toString();
            }
        }
    }
    compare(dataElement) {
        return this.data.localeCompare(dataElement.data);
    }
}
Data.ascendingSortClass = 'asc';
Data.descendingSortClass = 'des';
Data.hiddenClass = 'hidden';
Data.widthAttribute = 'width';
/**
 * An interactive table element. It's children should be either [[Header]] or [[Row]] elements.
 * [[ Dialog ]] elements can also be added as children and will act as a context menu.
 *
 * CSS variables for theming:
 *    --table-row-height
 *    --table-header-text-color
 *    --table-header-color
 *    --table-focus-item-color
 *    --table-selected-item-color
 *    --table-body-text-color
 **/
export class Table extends DroppableMixin(ScrollWindowElement) {
    constructor() {
        super();
        this.sortOrder = [];
        this.columnsDialog = new Dialog();
        this.columnsDialog.name = "Columns";
        // Deselected other rows if selectMultiple is false
        this.onclick = (event) => {
            let element = event.target;
            if (element instanceof Row && !this.selectMultiple) {
                for (let row of this.selectedRows) {
                    if (row !== element) {
                        row.selected = false;
                    }
                }
            }
        };
        this.oncontextmenu = (event) => {
            // allow for adding Dialog elements as children. These will function as context menus.
            let dialogs = this.flatChildren(Dialog);
            if (dialogs.length > 0) {
                event.preventDefault();
                for (let dialog of dialogs) {
                    dialog.position = { x: event.pageX - window.pageXOffset, y: event.pageY - window.pageYOffset };
                    dialog.velocity = { x: 0, y: 0 };
                    dialog.visible = true;
                }
            }
        };
    }
    // getters
    static get observedAttributes() {
        return [Table.selectMultipleAttribute];
    }
    get template() {
        return null;
    }
    get css() {
        // language=CSS
        return `      
        :host {          
            position: relative;
            padding: 0;
            width: 100%;
            height: 400px;
            border-spacing: 0;
            box-shadow: none;
            color: var(--table-body-text-color, black);
        }
        
        :host(:not(.${Table.showHiddenClass})) ::slotted(.${BaseRow.hiddenClass}) {
            display: none;
        }
        
        a {
            text-decoration: none;
            color: var(--table-selected-item-color, #5d91e5);
            font-weight: bold;
        }
        
        .${Table.headerContainerClass} {
            width: 100%;
        }
        
        table-body {
            background-color: var(--table-background-color);
        }
     `;
    }
    get selectedData() {
        // Depends on length of row and data being the same;
        let data = new Set();
        for (let row of this.selectedRows) {
            data.add(row.data);
        }
        return data;
    }
    get selectedRows() {
        return Array.from(this.querySelectorAll(`.${Row.SELECTED_CLASS}`));
    }
    set selectedRows(rows) {
        let oldRows = new Set(this.selectedRows);
        let newRows = new Set(rows);
        let addedRows = [...newRows].filter(x => !oldRows.has(x));
        let removedRows = [...oldRows].filter(x => !newRows.has(x));
        for (let row of removedRows) {
            row.selected = false;
        }
        for (let row of addedRows) {
            row.selected = true;
        }
        let event = new Event(Table.EVENT_SELECTION_CHANGED);
        this.dispatchEvent(event);
    }
    get rows() {
        return this.flatChildren(Row);
    }
    set rows(value) {
        this.removeChildren(Row);
        this.appendChildren(value);
        this.resetPane();
    }
    // setters
    /**
     * Whether or not the table will allow for the selection of more than one row at a time.
     */
    get selectMultiple() {
        return this.getAttribute(Table.selectMultipleAttribute) !== null;
    }
    set selectMultiple(value) {
        if (value) {
            this.setAttribute(Table.selectMultipleAttribute, "");
        }
        else {
            this.removeAttribute(Table.selectMultipleAttribute);
        }
    }
    get showHidden() {
        return this.classList.contains(Table.showHiddenClass);
    }
    set showHidden(value) {
        if (value) {
            this.classList.add(Table.showHiddenClass);
        }
        else {
            this.classList.remove(Table.showHiddenClass);
        }
    }
    get mainHeader() {
        for (let child of this.children) {
            if (child instanceof Header) {
                return child;
            }
        }
        return null;
    }
    get sortMap() {
        return this.sortOrder.reduce((sortMap, sortData) => {
            sortMap[sortData.columnNumber] = sortData.sortOrder;
            return sortMap;
        }, {});
    }
    updateAttributes(attributes) {
        for (let row of this.rows) {
            row.selected = false;
        }
    }
    render(shadowRoot) {
        let headerContainer = document.createElement('div');
        headerContainer.className = Table.headerContainerClass;
        let headerSlot = document.createElement('slot');
        headerSlot.name = Table.HEADER_SLOT_NAME;
        headerContainer.appendChild(headerSlot);
        shadowRoot.appendChild(headerContainer);
        shadowRoot.appendChild(this.columnsDialog);
        super.render(shadowRoot);
    }
    // Internal Events
    /**
     * Sort the table by the column with the given columnNumber.
     */
    sortColumn(columnNumber) {
        // Get existing value if it exists
        let sortOrderValue = this.sortMap[columnNumber] || 0;
        // Remove existing from sort order
        this.sortOrder = this.sortOrder.filter((sortData) => {
            return sortData.columnNumber !== columnNumber;
        });
        if (sortOrderValue !== null) {
            switch (sortOrderValue) {
                case -1:
                    sortOrderValue = 0;
                    break;
                case 0:
                    sortOrderValue = 1;
                    break;
                case 1:
                    sortOrderValue = -1;
                    break;
            }
            if (sortOrderValue !== 0) {
                this.sortOrder.unshift({
                    columnNumber: columnNumber,
                    sortOrder: sortOrderValue,
                });
            }
        }
        this.sort();
        this.updateColumnSortOrders();
    }
    updateColumnSortOrders() {
        let sortMap = this.sortMap;
        for (let row of this.flatChildren(BaseRow)) {
            let columns = row.allColumns;
            for (let i = 0; i < columns.length; i++) {
                let column = columns[i];
                let sortOrderValue = sortMap[i];
                if (sortOrderValue === undefined) {
                    column.sortOrder = 0;
                }
                else {
                    column.sortOrder = sortOrderValue;
                }
            }
        }
    }
    sort() {
        let rows = this.rows;
        rows = rows.sort((row1, row2) => {
            for (let sortData of this.sortOrder) {
                let result = sortData.sortOrder * row1.compare(row2, sortData.columnNumber);
                if (result !== 0) {
                    return result;
                }
            }
            return 0;
        });
        this.rows = rows;
    }
    showVisibleColumnsDialog(positionX, positionY) {
        this.columnsDialog.removeChildren();
        let items = [];
        let header = this.mainHeader;
        if (header !== null) {
            let columns = header.allColumns;
            for (let columnNumber = 0; columnNumber < columns.length; columnNumber++) {
                const headerColumnData = columns[columnNumber];
                let div = document.createElement('div');
                let columnLabel = document.createElement('span');
                let columnCheckbox = document.createElement('input');
                columnCheckbox.type = 'checkbox';
                columnCheckbox.checked = !headerColumnData.hidden;
                columnLabel.innerText = headerColumnData.data;
                columnCheckbox.onchange = () => {
                    for (let row of this.flatChildren(BaseRow)) {
                        let columnData = row.getColumn(columnNumber);
                        if (columnData !== null) {
                            columnData.hidden = !columnCheckbox.checked;
                        }
                    }
                };
                div.appendChild(columnLabel);
                div.appendChild(columnCheckbox);
                items.push(div);
            }
        }
        this.columnsDialog.appendChildren(items);
        this.columnsDialog.visible = true;
        this.columnsDialog.position = { x: positionX, y: positionY };
        this.columnsDialog.velocity = { x: 0, y: 0 };
    }
    /**
    * Toggles the selection of a row. The argument can either be a row element in
    * the table or null. If null it will deselect all rows. A selected event is
    * fired on the row element when a row is first selected and deselect events
    * are similarly fired when its deselected.
    */
    toggleRowSelection(rowElement, selectMultiple, includeBetween) {
        if (!this.selectMultiple) {
            selectMultiple = false;
            includeBetween = false;
        }
        let oldRows = new Set(this.selectedRows); // Make copy
        // Initialize new rows. If selectMultiple is true, we include the old selection.
        let newRows;
        if (selectMultiple) {
            newRows = new Set(oldRows);
        }
        else {
            newRows = new Set();
        }
        // If only the toggled rowElement was selected before we remove it. Otherwise we add it.
        if (!includeBetween && oldRows.has(rowElement)) {
            newRows.delete(rowElement);
        }
        else if (rowElement !== null) {
            newRows.add(rowElement);
        }
        // Selects the rows between the previously selected rows and the toggled row if
        // includeBetween and selectMultiple are true.
        if (selectMultiple && includeBetween && oldRows.size > 0) {
            let children = this.rows;
            let sliceIndex = children.indexOf(rowElement);
            let sectionIndex = children.indexOf(rowElement);
            for (let row of oldRows) {
                let index = children.indexOf(row);
                if (Math.abs(index - sectionIndex) < Math.abs(sliceIndex - sectionIndex)) {
                    sliceIndex = index;
                }
            }
            let start = Math.min(sliceIndex, sectionIndex) + 1;
            let end = Math.max(sliceIndex, sectionIndex);
            let rowsBetween = children.slice(start, end);
            for (let row of rowsBetween) {
                if (this.showHidden || !row.hidden) {
                    newRows.add(row);
                }
            }
        }
        this.selectedRows = Array.from(newRows);
    }
}
Table.HEADER_SLOT_NAME = 'header';
Table.headerContainerClass = 'header';
Table.showHiddenClass = 'show-hidden';
Table.selectMultipleAttribute = 'select-multiple';
/**
 * @event
 */
Table.EVENT_SELECTION_CHANGED = 'selectionchanged';
customElements.define('table-header', Header);
customElements.define('table-row', Row);
customElements.define('table-data', Data);
customElements.define('selectable-table', Table);
