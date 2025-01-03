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
    private readonly audioManager: AudioManager;

    private canvasRenderer: CanvasRenderer | null = null;
    private gameStates: GameState[] = [];

    static {
        this.PLAYER_TWO_ENABLED = this.isTwoPlayerFlagIsSet();
    }

    constructor() {
        this.gameStateRepository = new GameStateRepository();

        this.audioManager = new AudioManager("assets");
        this.audioManager.preloadAllSounds();

        const gameState = new GameState(this.audioManager);
        this.loadIfPresent(1, gameState);

        const controls1 = this.init(gameState);
        let controls2: Controls | undefined = undefined;
        this.gameStates[0] = gameState;
        if (Main.PLAYER_TWO_ENABLED) {
            const gameState2 = new GameState(this.audioManager, true);
            this.loadIfPresent(2, gameState2);
            controls2 = this.init(gameState2, true);
            if (gameState.pause) {
                gameState2.pause = true;
            }
            this.gameStates[1] = gameState2;
        }

        this.registerResetButton();
        this.registerPlayerTwoCheckbox();
        this.registerOnBeforeUnload();
        this.canvasRenderer = new CanvasRenderer(controls1, controls2);
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    private loadIfPresent(id: number, gameState: GameState) {
        console.log(`Trying to load ${id}`);
        if (this.gameStateRepository.savePresent(id)) {
            gameState.applyLoad(this.gameStateRepository.load(id));
            gameState.pause = true;
            gameState.addMessage(new Message(`Loaded save state ${id}`));
        } else {
            gameState.pickNextTetromino();
        }
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

    // region eventhandler
    private registerOnBeforeUnload() {
        window.onbeforeunload = () => {
            console.log("Saving gamestate1")
            this.gameStateRepository.save(1, this.gameStates[0]);
            console.log(Main.PLAYER_TWO_ENABLED, this.gameStates);
            if (Main.PLAYER_TWO_ENABLED) {
                console.log("Saving gamestate2")
                this.gameStateRepository.save(2, this.gameStates[1]);
            }
        }
    }

    private registerResetButton() {
        document.getElementById("reset")!.onclick = () => {
            const gameState = new GameState(this.audioManager);
            gameState.pickNextTetromino();
            this.gameStates[0].applyLoad(gameState);
            const ids = Main.PLAYER_TWO_ENABLED ? [1, 2] : [1]
            this.gameStateRepository.deleteSaves(ids);
        }
    }

    private registerPlayerTwoCheckbox() {
        const twoPlayerCheckbox = document.getElementById("two-player")! as HTMLInputElement;
        twoPlayerCheckbox.onclick = (_) => {
            const value = twoPlayerCheckbox.checked.toString();
            localStorage.setItem("PLAYER_TWO_ENABLED", value);
            location.reload();
        }
        twoPlayerCheckbox.checked = Main.isTwoPlayerFlagIsSet();
    }

    //endregion

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