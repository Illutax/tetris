import {of, Vec2} from "./Vec2.js";
import {GameState} from "./GameState.js";
import {Tetromino} from "./Tetromino.js";
import {GameStateRepository} from "./GameStateRepository";

export class Controls {
    private readonly gameState: GameState;
    private readonly gameStateRepository: GameStateRepository;

    constructor(gameState: GameState, gameStateRepository: GameStateRepository) {
        this.gameState = gameState;
        this.gameStateRepository = gameStateRepository;
    }

    private tryMove(newPos: Vec2): boolean {
        const currentTetromino = this.gameState.currentTetromino;
        if (this.gameState.inBounds(newPos, currentTetromino)) {
            this.gameState.currentPos = newPos;
            return true;
        } else if (this.gameState.inBounds(newPos.plus(of(1, 0)), currentTetromino)) {
            this.gameState.currentPos = newPos.plus(of(1, 0));
            return true;
        } else if (this.gameState.inBounds(newPos.plus(of(-1, 0)), currentTetromino)) {
            this.gameState.currentPos = newPos.plus(of(-1, 0));
            return true;
        }
        return false;
    }

    private tryRotate(newTetromino: Tetromino) {
        const currentPos = this.gameState.currentPos;
        if (this.gameState.inBounds(currentPos, newTetromino)) {
            this.gameState.currentTetromino = newTetromino;
        } else if (this.gameState.inBounds(currentPos.plus(of(1, 0)), newTetromino)) {
            this.gameState.currentPos = currentPos.plus(of(1, 0));
            this.gameState.currentTetromino = newTetromino;
        } else if (this.gameState.inBounds(currentPos.plus(of(-1, 0)), newTetromino)) {
            this.gameState.currentPos = currentPos.plus(of(-1, 0));
            this.gameState.currentTetromino = newTetromino;
        }
    }

    moveLeft() {
        if (!this.gameState.canMove) return;
        const newPos = this.gameState.currentPos.plus(of(-1, 0));
        this.tryMove(newPos);
    }

    moveRight() {
        if (!this.gameState.canMove) return;
        const newPos = this.gameState.currentPos.plus(of(1, 0));
        this.tryMove(newPos);
    }

    moveDown(): boolean {
        if (!this.gameState.canMove) return false;
        const newPos = this.gameState.currentPos.plus(of(0, 1));
        if (this.gameState.inBounds(newPos, this.gameState.currentTetromino)) {
            this.gameState.currentPos = newPos;
            this.gameState.movedDown = true;
            return true;
        }
        return false;
    }

    place() {
        if (!this.gameState.canMove) return;
        while(this.moveDown()) {}
        this.gameState.fixTetromino();
    }

    rotateCW() {
        if (!this.gameState.canMove) return;
        const newTetromino = this.gameState.currentTetromino.rotateCW();
        this.tryRotate(newTetromino);
    }

    rotateCCW() {
        if (!this.gameState.canMove) return;
        const newTetromino = this.gameState.currentTetromino.rotateCCW();
        this.tryRotate(newTetromino);
    }

    pause() {
        this.gameState.pause = !this.gameState.pause;
    }

    incLevel() {
        this.gameState.levelOffset++;
    }

    decLevel() {
        this.gameState.levelOffset--;
    }

    save() {
        this.gameStateRepository.save(this.gameState)
        console.log("Saved");
    }

    load() {
        if (!this.gameStateRepository.savePresent()) {
            throw new Error("Cannot load. No save present!")
        }
        let newGameState = this.gameStateRepository.load();
        console.log("Loaded");
        this.gameState.applyLoad(newGameState);
    }
}