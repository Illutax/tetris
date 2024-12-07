import { GameState } from "./GameState.js";
import { Controls } from "./Controls.js";
import { CanvasRenderer } from "./CanvasRenderer.js";
import { GameStateRepository } from "./GameStateRepository.js";
import { Message } from "./Message.js";
import { AudioManager } from "./AudioManager.js";

export class Main {
    public static PLAYER_TWO_ENABLED = false;
    public static tickRate = 100; // max: 120
    private static tickDuration = Math.ceil(1000 / Main.tickRate);

    private readonly gameStateRepository: GameStateRepository;

    private canvasRenderer: CanvasRenderer | null = null;
    private gameStates: GameState[] = [];
    private gameLoopId: number = -1;

    static {
        this.PLAYER_TWO_ENABLED = this.isTwoPlayerFlagIsSet();
    }

    constructor() {
        this.gameStateRepository = new GameStateRepository();

        const audioManager = new AudioManager("assets/sounds");
        audioManager.preloadAllSounds();

        const gameState = new GameState(audioManager);

        if (this.gameStateRepository.savePresent()) {
            gameState.applyLoad(this.gameStateRepository.load());
            gameState.pause = true;
            gameState.addMessage(new Message("Loaded save state"));
        } else {
            gameState.pickNextTetromino();
        }
        window.onbeforeunload = () => {
            this.gameStateRepository.save(gameState);
        }

        document.getElementById("reset")!.onclick = () => {
            const gameState = new GameState(audioManager);
            gameState.pickNextTetromino();
            this.gameStates[0].applyLoad(gameState);
            this.gameStateRepository.deleteSave();
        }

        const controls1 = this.init(gameState);
        let controls2: Controls | undefined = undefined;
        this.gameStates[0] = gameState;
        if (Main.PLAYER_TWO_ENABLED) {
            const gameState2 = new GameState(audioManager, true);
            gameState2.pickNextTetromino();
            controls2 = this.init(gameState2, true);
            if (gameState.pause) {
                gameState2.pause = true;
            }
            this.gameStates[1] = gameState2;
        }

        this.canvasRenderer = new CanvasRenderer(controls1, controls2);
        clearInterval(this.gameLoopId);
        this.gameLoop();
    }

    gameLoop(): void {
        for (const gameState of this.gameStates) {
            gameState!.tick();
        }

        this.canvasRenderer!.render(this.gameStates);
        this.gameLoopId = setTimeout(() => this.gameLoop(), Main.tickDuration);
    }

    init(gameState: GameState, isPlayerTwo = false) {
        console.log("initializing", gameState);
        return new Controls(gameState, this.gameStateRepository, isPlayerTwo);
    }

    static isTwoPlayerFlagIsSet() {
      return localStorage.getItem("PLAYER_TWO_ENABLED") == "true";
    }

}

new Main();