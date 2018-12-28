

export function DroppableMixin<T extends new(...args: any[]) => HTMLElement>(ElementClass : T) {
    abstract class Droppable extends ElementClass {
        // Have to make the below public instead of private due to https://github.com/Microsoft/TypeScript/issues/24226
        public dragOverActions : (() => void)[] = []; // Actions to happen after dragover for dragOverDelay
        public dragOverDelay = 2000;
        public timeOuts : number[] = [];

        protected constructor(...args: any[]) {
            super(...args);

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
            return this.classList.contains((this.constructor as typeof Droppable).dragOverClass);
        }

        /**
         * Add callback to be called when dragover starts after the dragover delay.
         */
        addDragoverAction(callback : () => void){
            this.dragOverActions.push(callback);
        }

        /**
         * Called when dragover event is triggered.
         */
        handleDragOver(event : Event){
            event.preventDefault();
        }

        /**
         * Called when dragenter event triggered.
         */
        handleDragEnter(event : Event){
            event.preventDefault();

            this.classList.add((this.constructor as typeof Droppable).dragOverClass);
            this.setTimeouts();
        }

        /**
         * Called when dragleave event triggered.
         */
        handleDragLeave(event : Event){
            event.preventDefault();

            this.classList.remove((this.constructor as typeof Droppable).dragOverClass);
            this.clearTimeOuts();
        }

        /**
         * Called when drop event triggered.
         */
        handleDrop(event : Event){
            event.preventDefault();

            this.classList.remove((this.constructor as typeof Droppable).dragOverClass);
            this.clearTimeOuts();
        }

        /**
         * Set timeouts to call dragover actions.
         */
        setTimeouts(){
            if (this.dragOverActions.length > 0){
                for (let action of this.dragOverActions){
                    let timeoutId = window.setTimeout(() => {
                        action();
                    }, this.dragOverDelay);
                    this.timeOuts.push(timeoutId);
                }
                this.classList.add((this.constructor as typeof Droppable).pendingActionClass);
            }
        }

        /**
         * Remove timeouts to call dragover actions.
         */
        clearTimeOuts(){
            this.classList.remove((this.constructor as typeof Droppable).pendingActionClass);
            for (let timeout of this.timeOuts){
                window.clearTimeout(timeout);
            }
            this.timeOuts = [];
        }
    }
    return Droppable;
}

export function DraggableMixin<T extends new(...args: any[]) => HTMLElement>(ElementClass : T) {
    class Draggable extends ElementClass {
        protected constructor(...args: any[]) {
            super(...args);

            this.draggable = true;
            this.addEventListener('dragstart', this.handleDragStart.bind(this));
            this.addEventListener('dragend', this.handleDragEnd.bind(this));
        }

        /**
         * The class name of the element when it is being dragged.
         */
        static get draggingClass(){
            return 'dragging';
        }

        /**
         * Called when dragstart event is fired.
         */
        handleDragStart(event : DragEvent){
            this.classList.add((this.constructor as typeof Draggable).draggingClass);
        }

        /**
         * Called when dragend event is fired.
         */
        handleDragEnd(event : DragEvent){
            this.classList.remove((this.constructor as typeof Draggable).draggingClass);
        }
    }
    return Draggable;
}
