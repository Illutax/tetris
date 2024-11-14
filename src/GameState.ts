import { Tetromino } from "./Tetromino.js";
import { Grid } from "./Grid.js";
import { of, Vec2 } from "./Vec2.js";
import { Message } from "./Message.js";

export class GameState {
    private readonly ONLY_I_PIECES = false;
    private readonly BAG: Generator<Tetromino>;
    private id: number;

    private amountOfNextTetrominoes = 1;
    private nextGravity = 0;

    private _grid: Grid;
    private _currentPos: Vec2;
    private _currentTetromino: Tetromino | undefined;


    private _nextTetromino: Tetromino[];

    private _levelOffset: number;
    private _level: number;
    private _gameTick: number;
    private _totalLinesCleared: number;
    private _totalScore: number;

    private _pause = false;
    private _animating = false;
    private _movedDown = false;
    private touched = false;
    private _clearingLines: number[] = [];

    private _messages: Message[] = []

    //region Getter & Setter
    get messages(): Message[] {
        return this._messages;
    }

    get canMove() {
        return !this.pause && !this.animating;
    }

    get animating() {
        return this._animating;
    }

    set animating(animating) {
        this._animating = animating;
    }

    get totalScore(): number {
        return this._totalScore;
    }

    get pause(): boolean {
        return this._pause;
    }

    set pause(value: boolean) {
        this._pause = value;
    }

    get levelOffset(): number {
        return this._levelOffset;
    }

    set levelOffset(value: number) {
        value = Math.max(0, value);
        this._levelOffset = value;
    }

    get level(): number {
        return this._level + this._levelOffset;
    }

    set movedDown(value: boolean) {
        this._movedDown = value;
    }

    get totalLinesCleared(): number {
        return this._totalLinesCleared;
    }

    get nextTetromino(): Tetromino[] {
        return this._nextTetromino;
    }

    set currentTetromino(value: Tetromino) {
        if (value == null) throw new Error("CANT BE SET TO NULL!", value);
        this._currentTetromino = value;
    }

    get currentTetromino(): Tetromino {
        return this._currentTetromino!;
    }

    get currentPos(): Vec2 {
        return this._currentPos;
    }

    set currentPos(value: Vec2) {
        this._currentPos = value;
    }

    //endregion

    constructor() {
        this.BAG = this.bagRandom();
        this._grid = new Grid();

        this._currentPos = Vec2.ZERO;
        this._levelOffset = 0;
        this._level = 1;
        this._gameTick = 0;
        this._totalLinesCleared = 0;
        this._totalScore = 0;
        this.nextGravity = this.getMs() + this.progression(this.level);
        this._nextTetromino = new Array(this.amountOfNextTetrominoes)
            .fill(Tetromino.I);

        if (!this.ONLY_I_PIECES) {
            this._nextTetromino = this._nextTetromino.map(() => this.getATetromino())
        }

        this.id = Math.floor(Math.random()*(10^16));
    }

    public applyLoad(loadedGameState: GameState) {
        this.id = loadedGameState.id;

        function assignTetromino(currentTetromino1: Tetromino ) {
            return Object.assign(new Tetromino("", []), (currentTetromino1)!);
        }

        let loadedTetromino = assignTetromino(loadedGameState._currentTetromino!);
        let loadedGrid = Object.assign(new Grid(), loadedGameState._grid);

        this._currentTetromino = new Tetromino(loadedTetromino.name, loadedTetromino.pixels);
        this._currentPos = Vec2.ZERO.plus(loadedGameState._currentPos);
        this._grid = loadedGrid;
        this._nextTetromino = loadedGameState._nextTetromino.map(it => assignTetromino(it));

        this._levelOffset = loadedGameState._levelOffset;
        this._level = loadedGameState._level;
        this._gameTick = loadedGameState._gameTick;
        this._totalLinesCleared = loadedGameState._totalLinesCleared;
        this._totalScore = loadedGameState._totalScore;
        this._pause = loadedGameState._pause;
        this._animating = loadedGameState._animating;
        this._movedDown = loadedGameState._movedDown;
        this.touched = loadedGameState.touched;
        this._clearingLines = loadedGameState._clearingLines;
    }

    tick() {
        if (!this.canMove) return;

        this._gameTick++;
        let ms = this.getMs();
        if (ms > this.nextGravity) {
            this.doGravity();
            this.nextGravity = ms + this.progression(this.level);
        }
    }

    progression(x: number): number {
        return Math.max(this.easeOutCubic(x / 13) * 600 + 200, 200);
    }

    easeOutCubic(x: number): number {
        return Math.pow(3, 1 - x);
    }

    getGrid() {
        let grid = this._grid.copy();
        grid.place(this.currentTetromino, this.currentPos);
        return grid;
    }

    fixTetromino() {
        // console.log("Trying to fixTetromino");
        if (this.canMoveDown()) {
            console.error(", but could have moved down", this.getStats());
            return;
        }
        this._grid.place(this.currentTetromino, this.currentPos);
        this.checkLineClear();
        this.pickNextTetromino();
    }

    public addMessage(message: Message) {
        this.messages.unshift(message);

        setTimeout(() => {
            if (this.messages.length === 0) return;
            this.messages.pop();
        }, 2500)
    }

    public pickNextTetromino() {
        this.currentPos = of(Grid.COLS - 2, 0).div(2);
        // @ts-ignore
        this.currentTetromino = this._nextTetromino.shift();
        this._nextTetromino.push(this.getATetromino());
    }

    private getATetromino() {
        return this.ONLY_I_PIECES
            ? Tetromino.I
            : this.getFairRandomTetromino();
    }

    private getFairRandomTetromino() {
        return this.BAG.next().value;
    }

    private getRandomTetromino() {
        return Tetromino.ALL[Math.floor(Math.random() * 7)].copy();
    }

    * bagRandom(): Generator<Tetromino> {
        let bag = Tetromino.ALL.slice();

        function randomShuffle(array: Tetromino[]) {
            let currentIndex = array.length, randomIndex;

            // While there remain elements to shuffle.
            while (currentIndex != 0) {

                // Pick a remaining element.
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]];
            }

            return array;
        }

        while (true) {
            randomShuffle(bag);
            yield* bag;
        }
    }

    doGravity() {
        // console.log(`doing Gravity. movedDown: ${this._movedDown} touched: ${this.touched}`);
        if (this._movedDown) {
            // console.log("touched")
            this._movedDown = false;
            return false;
        }
        if (this.touched) {
            this.fixTetromino();
            this.touched = false;
            return true;
        }

        let newPos = this.currentPos.plus(of(0, 1));
        if (this.canMoveDown(newPos))
            this.currentPos = newPos;
        else {
            this.touched = true;
        }
        // console.log(`done Gravity. movedDown: ${this._movedDown} touched: ${this.touched}`);
        return true;
    }

    canMoveDown(newPos: Vec2 = this.currentPos.plus(of(0, 1))) {
        return this.inBounds(newPos, this.currentTetromino);
    }

    inBounds(newPos: Vec2, tetromino: Tetromino) {
        return this._grid.inBounds(tetromino, newPos);
    }

    checkLineClear() {
        let i = 0;
        const newGrid = new Array<Array<number>>(Grid.ROWS);
        const clearedLines = [] as number[];
        for (let y = 0; y < Grid.ROWS; y++) {
            let row = this._grid.pixels[Grid.ROWS - y - 1];
            if (!row.every(it => it !== 0)) // not-full
            {
                // console.log(`Filling row ${i}`)
                newGrid[Grid.ROWS - 1 - i++] = row;
            } else {
                clearedLines.push(y);
            }
        }


        // console.log(`Filling ${Grid.ROWS-i} empty rows`)
        for (let n = i; n < Grid.ROWS; n++) {
            newGrid[Grid.ROWS - n - 1] = Grid.makeEmptyRow()
        }

        if (clearedLines.length > 0) {
            // console.log(`Clearing ${clearedLines.length} line(s)`);
            this._clearingLines = clearedLines;
            this.animateClearingLines(clearedLines, newGrid);
        } else {
            this.playSound("plop1.mp3");
        }
    }

    private animateClearingLines(clearedLines: number[], newGrid: Array<number>[]) {
        this.animating = true;
        let linesCleared = clearedLines.length;

        let sfxPath = this.getSoundForClearedAmountOfLines(linesCleared);
        this.playSound(sfxPath);

        setTimeout(() => {
            // scoring
            this._totalLinesCleared += linesCleared;
            this._level = 1 + Math.floor(this._totalLinesCleared / 10);
            this._totalScore += this.getScore(linesCleared, this.level);

            this._grid = new Grid(newGrid);

            this.animating = false;
        }, 600);
    }

    private playSound(sfxFile: string) {
        new Audio(`assets/sounds/${sfxFile}`)
            .play();
    }

    private getSoundForClearedAmountOfLines(linesCleared: number) {
        switch (linesCleared){
            case 1: return "single.mp3";
            case 2: return "double.mp3";
            case 3: return "tripple.mp3";
            case 4: return "tetris.mp3";
            default: throw new Error("Unknown amount of clearedLines")
        }
    }

    private getMs() {
        return new Date().valueOf();
    }

    private getScore(linesCleared: number, level: number) {
        let basePoints = 0;
        switch (linesCleared) {
            case 0:
                return 0;
            case 1:
                basePoints = 40;
                break;
            case 2:
                basePoints = 100;
                break;
            case 3:
                basePoints = 300;
                break;
            case 4:
                basePoints = 1200;
                break;
            default:
                throw new Error(`Unknown amount of lines cleared: ${linesCleared}`);
        }
        return basePoints * level;
    }

    public getStats() {
        return `
        Tick:\t\t\t ${this._gameTick}
        CurrentTetromino:\t ${this.currentTetromino.name} (${this.currentTetromino.pixels})
        Touched: ${this.touched}
        CurrentPos: ${this.currentPos}
        MovedDown: ${this.movedDown}
        Grid:
        ${this._grid.toString()}\
        `;
    }

    get clearingLines() {
        return this._clearingLines;
    }
}