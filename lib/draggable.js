export function DroppableMixin(ElementClass) {
    class Droppable extends ElementClass {
        constructor(...args) {
            super(...args);
            this.dragOverActions = []; // Actions to happen after dragover for dragOverDelay
            this.dragOverDelay = 2000;
            this.timeOuts = [];
            this.addEventListener("dragover", this.handleDragOver.bind(this));
            this.addEventListener("dragenter", this.handleDragEnter.bind(this));
            this.addEventListener("dragleave", this.handleDragLeave.bind(this));
            this.addEventListener("drop", this.handleDrop.bind(this));
        }
        get template() {
            return `
            <slot></slot>
        `;
        }
        static get dragOverClass() {
            return 'dragover';
        }
        static get pendingActionClass() {
            return 'pending-action';
        }
        get isOver() {
            return this.classList.contains(this.constructor.dragOverClass);
        }
        /**
         * Add callback to be called when dragover starts after the dragover delay.
         */
        addDragoverAction(callback) {
            this.dragOverActions.push(callback);
        }
        /**
         * Called when dragover event is triggered.
         */
        handleDragOver(event) {
            event.preventDefault();
        }
        /**
         * Called when dragenter event triggered.
         */
        handleDragEnter(event) {
            event.preventDefault();
            this.classList.add(this.constructor.dragOverClass);
            this.setTimeouts();
        }
        /**
         * Called when dragleave event triggered.
         */
        handleDragLeave(event) {
            event.preventDefault();
            this.classList.remove(this.constructor.dragOverClass);
            this.clearTimeOuts();
        }
        /**
         * Called when drop event triggered.
         */
        handleDrop(event) {
            event.preventDefault();
            this.classList.remove(this.constructor.dragOverClass);
            this.clearTimeOuts();
        }
        /**
         * Set timeouts to call dragover actions.
         */
        setTimeouts() {
            if (this.dragOverActions.length > 0) {
                for (let action of this.dragOverActions) {
                    let timeoutId = window.setTimeout(() => {
                        action();
                    }, this.dragOverDelay);
                    this.timeOuts.push(timeoutId);
                }
                this.classList.add(this.constructor.pendingActionClass);
            }
        }
        /**
         * Remove timeouts to call dragover actions.
         */
        clearTimeOuts() {
            this.classList.remove(this.constructor.pendingActionClass);
            for (let timeout of this.timeOuts) {
                window.clearTimeout(timeout);
            }
            this.timeOuts = [];
        }
    }
    return Droppable;
}
export function DraggableMixin(ElementClass) {
    class Draggable extends ElementClass {
        constructor(...args) {
            super(...args);
            this.draggable = true;
            this.addEventListener('dragstart', this.handleDragStart.bind(this));
            this.addEventListener('dragend', this.handleDragEnd.bind(this));
        }
        /**
         * The class name of the element when it is being dragged.
         */
        static get draggingClass() {
            return 'dragging';
        }
        /**
         * Called when dragstart event is fired.
         */
        handleDragStart(event) {
            this.classList.add(this.constructor.draggingClass);
        }
        /**
         * Called when dragend event is fired.
         */
        handleDragEnd(event) {
            this.classList.remove(this.constructor.draggingClass);
        }
    }
    return Draggable;
}
