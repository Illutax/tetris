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

    private lastTick = 0;

    private readonly gameStateRepository: GameStateRepository;

    private canvasRenderer: CanvasRenderer | null = null;
    private gameStates: GameState[] = [];
    private audioManager: AudioManager;

    static {
        this.PLAYER_TWO_ENABLED = this.isTwoPlayerFlagIsSet();
    }

    constructor() {
        this.gameStateRepository = new GameStateRepository();

        this.audioManager = new AudioManager("assets");
        this.audioManager.preloadAllSounds();

        const gameState = new GameState(this.audioManager);

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
            const gameState = new GameState(this.audioManager);
            gameState.pickNextTetromino();
            this.gameStates[0].applyLoad(gameState);
            this.gameStateRepository.deleteSave();
        }

        const controls1 = this.init(gameState);
        let controls2: Controls | undefined = undefined;
        this.gameStates[0] = gameState;
        if (Main.PLAYER_TWO_ENABLED) {
            const gameState2 = new GameState(this.audioManager, true);
            gameState2.pickNextTetromino();
            controls2 = this.init(gameState2, true);
            if (gameState.pause) {
                gameState2.pause = true;
            }
            this.gameStates[1] = gameState2;
        }

        this.canvasRenderer = new CanvasRenderer(controls1, controls2);
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(timestamp: DOMHighResTimeStamp): void {
        const elapsed = timestamp - this.lastTick;
        if (elapsed > Main.tickDuration) {
            this.lastTick = timestamp;
            for (const gameState of this.gameStates) {
                gameState!.tick();
            }

        }
        this.canvasRenderer!.render(this.gameStates);
        requestAnimationFrame(this.gameLoop.bind(this))
    }

    init(gameState: GameState, isPlayerTwo = false) {
        console.log("initializing", gameState);
        return new Controls(gameState, this.gameStateRepository, isPlayerTwo);
    }

    static isTwoPlayerFlagIsSet() {
        return localStorage.getItem("PLAYER_TWO_ENABLED") == "true";
    }

    private musicPlaying = false;

    public startMusic() {
        if (!this.musicPlaying) {
            this.audioManager.playMusic("Tetris Remix Ghost and Kozmos Collab.mp3")
            this.musicPlaying = true;
            console.log("Start playing")
        }
    }
}

const main = new Main();

// window.addEventListener('click', () => main.startMusic())