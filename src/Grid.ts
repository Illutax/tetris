import { Tetromino } from "./Tetromino.js";
import { of, Vec2 } from "./Vec2.js";

export class Grid {
    static readonly COLS = 10; // 10
    static readonly ROWS = 20; // 20
    static readonly NEXT_TETROMINO_OFFSET = of(3, 1);

    static PIXEL_SIZE = 49;
    static GRID_BORDER_SIZES = of(1, 1);

    private readonly _offset = Vec2.ZERO;
    private readonly _pixels: number[][];

    constructor(baseOffset = Vec2.ZERO, pixels = this.empty()) {
        this._offset = baseOffset;
        this._pixels = pixels;
    }

    private empty() {
        const pixels = new Array<Array<number>>(Grid.ROWS);
        for (let y = 0; y < Grid.ROWS; y++) {
            pixels[y] = Grid.makeEmptyRow();
        }
        return pixels;
    }

    public static makeEmptyRow() {
        let row = new Array<number>(Grid.COLS);
        for (let x = 0; x < Grid.COLS; x++) {
            row[x] = 0;
        }
        return row;
    }

    public get pixels(): number[][] {
        return this._pixels;
    }

    public get baseOffset(): Vec2 {
        return this._offset;
    }

    public get offset(): Vec2 {
        return Grid.GRID_BORDER_SIZES.plus(this._offset);
    }

    public toString = () => {
        return this._pixels
            .map(row => row.map(c => c == 0 ? "." : c).join(""))
            .join("\n");
    }

    place(tetromino: Tetromino, pos: Vec2) {
        for (let y = 0; y < tetromino.pixels.length; y++) {
            const row = tetromino.pixels[y];
            for (let x = 0; x < row.length; x++) {
                const cell = row[x];
                if (cell !== 0)
                    this._pixels[pos.y + y][pos.x + x] = cell;
            }
        }
    }

    copy() {
        return new Grid(this._offset, this._pixels.map(it => it.slice()));
    }

    inBounds(tetromino: Tetromino, newPos: Vec2) {
        for (let y = 0; y < tetromino.pixels.length; y++) {
            const tetrominoRow = tetromino.pixels[y];
            for (let x = 0; x < tetrominoRow.length; x++) {
                const cell = tetrominoRow[x];
                if (cell === 0) continue;
                const gridRow = this._pixels[newPos.y + y];
                if (gridRow === undefined || gridRow[newPos.x + x] !== 0) {
                    return false;
                }
            }
        }
        return true;
    }
}