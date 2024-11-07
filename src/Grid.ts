import {Tetromino} from "./Tetromino.js";
import {Vec2, of} from "./Vec2.js";

export class Grid {
    static readonly PIXEL_SIZE = 49;
    static readonly COLS = 10; // 10
    static readonly ROWS = 20; // 20
    static readonly GRID_BORDER_SIZES = of(1, 1);
    static readonly NEXT_TETROMINO_OFFSET = of(3, 1);
    private readonly _pixels: number[][];

    constructor(pixels = this.empty()) {
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
        return new Grid(this._pixels.map(it => it.slice()));
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