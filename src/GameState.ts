import {Tetromino} from "./Tetromino.js";
import {Grid} from "./Grid.js";
import {of, Vec2} from "./Vec2.js";

export class GameState {
    private readonly ONLY_I_PIECES = false;
    private readonly BAG = this.bagRandom();

    private amountOfNextTetrominoes = 1;
    private nextGravity = 0;

    private _grid: Grid;
    private _currentPos: Vec2 = Vec2.ZERO;
    private _currentTetromino: Tetromino | undefined;


    private _nextTetromino: Array<Tetromino>;

    private _levelOffset = 0;
    private _level = 1;
    private _gameTick = 0;
    private _totalLinesCleared = 1;
    private _totalScore = 0;

    private _pause = false;
    private _animating = false;
    private _movedDown = false;
    private touched = false;
    private _clearingLines: number[] = [];

    //region Getter & Setter
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
        this._grid = new Grid();
        this._level = 1;
        this.nextGravity = this.getMs() + this.progression(this.level);
        this._nextTetromino = new Array(this.amountOfNextTetrominoes)
            .fill(Tetromino.I);

        if (!this.ONLY_I_PIECES) {
            this._nextTetromino = this._nextTetromino.map(() => this.getATetromino())
        }
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
        }
    }

    private animateClearingLines(clearedLines: number[], newGrid: Array<number>[]) {
        this.animating = true;
        let linesCleared = clearedLines.length;

        setTimeout(() => {
            // scoring
            this._totalLinesCleared += linesCleared;
            this._level = 1 + Math.floor(this._totalLinesCleared / 10);
            this._totalScore += this.getScore(linesCleared, this.level);

            this._grid = new Grid(newGrid);

            this.animating = false;
        }, 600);
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