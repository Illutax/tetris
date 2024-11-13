import { GameState } from "./GameState.js";
import { Controls } from "./Controls.js";
import { CanvasRenderer } from "./CanvasRenderer.js";
import { GameStateRepository } from "./GameStateRepository.js";

export class Main {
    public static tickRate = 100; // max: 120
    private static tickDuration = Math.ceil(1000 / Main.tickRate);

    private readonly gameStateRepository: GameStateRepository;

    private canvasRenderer: CanvasRenderer | null = null;
    private gameState: GameState | null = null;
    private gameLoopId: number = -1;

    constructor() {
        this.gameStateRepository = new GameStateRepository();
        const gameState = new GameState();
        gameState.pickNextTetromino();
        this.init(gameState);
    }

    gameLoop(): void {
        this.gameState!.tick();
        this.canvasRenderer!.render(this.gameState!);

        this.gameLoopId = setTimeout(() => this.gameLoop(), Main.tickDuration);
    }

    init(gameState: GameState) {
        console.log("initializing", gameState);
        clearInterval(this.gameLoopId);
        const controls = new Controls(gameState, this.gameStateRepository);
        this.canvasRenderer = new CanvasRenderer(controls);
        this.gameState = gameState;
        this.gameLoop();
    }

}

new Main();