// Input Handler
export class InputHandler {
    constructor(canvas, onInput) {
        this.canvas = canvas;
        this.onInput = onInput;
        this.setupListeners();
    }

    setupListeners() {
        // Keyboard
        this.keydownHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.onInput();
            }
        };
        document.addEventListener('keydown', this.keydownHandler);

        // Mouse
        this.canvas.addEventListener('click', () => this.onInput());

        // Touch
        this.touchHandler = (e) => {
            e.preventDefault();
            this.onInput();
        };
        this.canvas.addEventListener('touchstart', this.touchHandler);
    }

    destroy() {
        document.removeEventListener('keydown', this.keydownHandler);
        this.canvas.removeEventListener('click', () => this.onInput());
        this.canvas.removeEventListener('touchstart', this.touchHandler);
    }
}