import {GameState} from "./GameState.js";
import {Controls} from "./Controls.js";
import {CanvasRenderer} from "./CanvasRenderer.js";

export class Main {
    public static tickRate = 100; // max: 120
    private static tickDuration = Math.ceil(1000 / Main.tickRate);

    private readonly gameState: GameState;
    private readonly canvasRenderer: CanvasRenderer;

    constructor() {
        const gameState = new GameState();
        gameState.pickNextTetromino();
        const controls = new Controls(gameState);

        this.gameState = gameState;
        this.canvasRenderer = new CanvasRenderer(gameState, controls);
        this.gameLoop(gameState);
    }

    gameLoop(gameState: GameState): void {
        this.gameState.tick();
        this.canvasRenderer.render(gameState);

        setTimeout(() => this.gameLoop(gameState), Main.tickDuration)
    }

}

new Main();