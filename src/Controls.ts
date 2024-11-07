import {of, Vec2} from "./Vec2.js";
import {GameState} from "./GameState.js";
import {Tetromino} from "./Tetromino.js";

export class Controls {
    private readonly _gameState: GameState;

    constructor(gameState: GameState) {
        this._gameState = gameState;
    }

    private tryMove(newPos: Vec2): boolean {
        const currentTetromino = this._gameState.currentTetromino;
        if (this._gameState.inBounds(newPos, currentTetromino)) {
            this._gameState.currentPos = newPos;
            return true;
        } else if (this._gameState.inBounds(newPos.plus(of(1, 0)), currentTetromino)) {
            this._gameState.currentPos = newPos.plus(of(1, 0));
            return true;
        } else if (this._gameState.inBounds(newPos.plus(of(-1, 0)), currentTetromino)) {
            this._gameState.currentPos = newPos.plus(of(-1, 0));
            return true;
        }
        return false;
    }

    private tryRotate(newTetromino: Tetromino) {
        const currentPos = this._gameState.currentPos;
        if (this._gameState.inBounds(currentPos, newTetromino)) {
            this._gameState.currentTetromino = newTetromino;
        } else if (this._gameState.inBounds(currentPos.plus(of(1, 0)), newTetromino)) {
            this._gameState.currentPos = currentPos.plus(of(1, 0));
            this._gameState.currentTetromino = newTetromino;
        } else if (this._gameState.inBounds(currentPos.plus(of(-1, 0)), newTetromino)) {
            this._gameState.currentPos = currentPos.plus(of(-1, 0));
            this._gameState.currentTetromino = newTetromino;
        }
    }

    moveLeft() {
        if (!this._gameState.canMove) return;
        const newPos = this._gameState.currentPos.plus(of(-1, 0));
        this.tryMove(newPos);
    }

    moveRight() {
        if (!this._gameState.canMove) return;
        const newPos = this._gameState.currentPos.plus(of(1, 0));
        this.tryMove(newPos);
    }

    moveDown(): boolean {
        if (!this._gameState.canMove) return false;
        const newPos = this._gameState.currentPos.plus(of(0, 1));
        if (this._gameState.inBounds(newPos, this._gameState.currentTetromino)) {
            this._gameState.currentPos = newPos;
            this._gameState.movedDown = true;
            return true;
        }
        return false;
    }

    place() {
        if (!this._gameState.canMove) return;
        while(this.moveDown()) {}
        this._gameState.fixTetromino();
    }

    rotateCW() {
        if (!this._gameState.canMove) return;
        const newTetromino = this._gameState.currentTetromino.rotateCW();
        this.tryRotate(newTetromino);
    }

    rotateCCW() {
        if (!this._gameState.canMove) return;
        const newTetromino = this._gameState.currentTetromino.rotateCCW();
        this.tryRotate(newTetromino);
    }

    pause() {
        this._gameState.pause = !this._gameState.pause;
    }

    incLevel() {
        this._gameState.levelOffset++;
    }

    decLevel() {
        this._gameState.levelOffset--;
    }

}