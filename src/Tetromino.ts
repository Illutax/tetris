export class Tetromino {
    static I = new Tetromino('I', [ [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0] ]);
    static J = new Tetromino('J', [ [0, 2, 0], [0, 2, 0], [2, 2, 0,] ]);
    static L = new Tetromino('L', [ [0, 3, 0], [0, 3, 0], [0, 3, 3] ]);
    static O = new Tetromino('O', [ [4, 4], [4, 4] ]);
    static S = new Tetromino('S', [ [5, 5, 0], [0, 5, 5] ]);
    static T = new Tetromino('T', [ [0, 0, 0], [6, 6, 6], [0, 6, 0] ]);
    static Z = new Tetromino('Z', [ [0, 7, 7], [7, 7, 0] ]);

    public static ALL = [
        Tetromino.I,
        Tetromino.J,
        Tetromino.L,
        Tetromino.O,
        Tetromino.S,
        Tetromino.T,
        Tetromino.Z,
    ];

    private readonly _pixels: number[][];
    private readonly _name: string;

    get name()
    {
        return this._name;
    }

    get pixels(): number[][] {
        return this._pixels;
    }

    constructor(name: string, pixels: number[][]) {
        this._name = name;
        this._pixels = pixels;
    }

    public toString = () => {
        return this.pixels
            .map(row => row.map(c => c == 0 ? "." : c).join(""))
            .join("\n");
    }

    copy() {
        return new Tetromino(this.name, this._pixels.map(it => it.slice()));
    }

    rotateCW() {
        const size1 = this._pixels.length;
        const size2 = this._pixels[0].length;
        const newPixels = new Array<Array<number>>(size2);
        for (let y = 0; y < size2; y++) {
            newPixels[y] = new Array<number>(size1)
            for (let x = 0; x < size1; x++) {
                let row = this._pixels[x];
                // console.log(`Getting x:y ${x}:${y} on row: ${row} for size: ${size1}`);
                newPixels[y][x] = row[size2 - y - 1];
            }
        }
        return new Tetromino(this.name, newPixels);
    }

    rotateCCW() {
        const size1 = this._pixels.length;
        const size2 = this._pixels[0].length;
        const newPixels = new Array<Array<number>>(size2);
        for (let y = 0; y < size2; y++) {
            newPixels[y] = new Array<number>(size1)
            for (let x = 0; x < size1; x++) {
                let row = this._pixels[size1 - x - 1];
                // console.log(`Getting x:y ${x}:${y} on row: ${row} for size: ${size1}`);
                newPixels[y][x] = row[y];
            }
        }
        return new Tetromino(this.name, newPixels);
    }
}