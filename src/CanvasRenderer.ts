import { Controls } from "./Controls.js";
import { GameState } from "./GameState.js";
import { Grid } from "./Grid.js";
import { Tetromino } from "./Tetromino.js";
import { of, Vec2 } from "./Vec2.js";
import { Message } from "./Message.js";

export class CanvasRenderer {
    private static readonly PREFERRED_MIN_WIDTH = 1280;
    private static readonly PREFERRED_MIN_HEIGHT = 1024;

    private readonly canvas: HTMLCanvasElement;

    private pausedGameDueToSmallWindow = false;

    constructor(controls: Controls) {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.canvas.tabIndex = 0; // make canvas focus-able

        this.registerInputs(this.canvas, controls);
        this.adjustCanvasToScreen();
    }

    private registerInputs(canvas: HTMLCanvasElement, controls: Controls) {
        canvas.focus();
        canvas.onkeydown = ({key}) => {
            key = key.toLowerCase();
            // console.log(`${key}`);
            if (key === "a" || key === "arrowleft") controls.moveLeft();
            if (key === "d" || key === "arrowright") controls.moveRight();
            if (key === "w" || key === "arrowup") controls.place();
            if (key === "s" || key === "arrowdown") controls.moveDown();
            if (key === "e" || key === " ") controls.rotateCCW();
            if (key === "+") controls.incLevel();
            if (key === "-") controls.decLevel();
            if (key === "q") controls.rotateCW();
            if (key === "p") controls.pause();

            if (key == "f7") controls.load()
            if (key == "f8") controls.save()
            if (key == "r") controls.reset()
            // swallow every key except reload and console
            return key === "f5" || key === "f12";
        };
    }

    private adjustCanvasToScreen() {
        let {x: width, y: height} = this.getCurrentWindowSize();
        // console.log(`actual: ${width}x${height}`);
        const preferredWidth = Math.max(CanvasRenderer.PREFERRED_MIN_WIDTH, width);
        const preferredHeight = Math.max(CanvasRenderer.PREFERRED_MIN_HEIGHT, height);
        // console.log(`preferred: ${preferredWidth}x${preferredHeight}`);
        this.canvas.width = preferredWidth;
        this.canvas.height = preferredHeight;
    }

    public getCurrentWindowSize() {
        let width = document.body.clientWidth - 5;
        let height = document.documentElement.clientHeight - 5;
        return Vec2.of(width, height);
    }

    render(gameState: GameState): void {
        this.canvas.focus();
        this.adjustCanvasToScreen();
        const ctx = this.canvas.getContext("2d", {alpha: false})!;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const level = gameState.level;
        const grid = gameState.getGrid();
        const baseOffset = gameState.getGrid().baseOffset;
        this.drawBorders(ctx, grid);
        this.drawShadowPiece(ctx, gameState.currentTetromino, calculateShadowPos(gameState), level, grid);
        this.drawGrid(ctx, gameState);

        this.drawNextTetromino(ctx, gameState.nextTetromino, level, grid)
        this.drawScores(ctx, gameState.totalLinesCleared, level, gameState.totalScore);

        // Text overlay
        if (gameState.pause) this.drawPausedBanner(ctx, baseOffset);

        let currentWindowSize = this.getCurrentWindowSize();
        if (currentWindowSize.x < CanvasRenderer.PREFERRED_MIN_WIDTH || currentWindowSize.y < CanvasRenderer.PREFERRED_MIN_HEIGHT) {
            this.pausedGameDueToSmallWindow = true;
            gameState.pause = true;
            this.drawText(ctx, "* WINDOW TOO SMALL *", TextDrawRegion.CENTER, Vec2.of(0, 1));
        } else if (this.pausedGameDueToSmallWindow) {
            gameState.pause = false;
            this.pausedGameDueToSmallWindow = false;
        }

        this.drawMessages(ctx, gameState.messages)

        function calculateShadowPos(gameState: GameState): Vec2 {
            let shadow = gameState.currentTetromino.copy();
            const pos = gameState.currentPos;
            let offset = of(0, 0);
            while (gameState.inBounds(pos.plus(offset), shadow)) {
                offset = offset.plus(of(0, 1));
            }
            return of(pos.x, pos.y - 1).plus(offset);
        }
    }

    private drawGrid(ctx: CanvasRenderingContext2D, gameState: GameState) {
        const animating = gameState.animating;
        const clearingLines = gameState.clearingLines;
        const grid = gameState.getGrid();

        // if (animating) console.log(`drawing with ${clearingLines}`)
        for (let y = 0; y < Grid.ROWS; y++) {
            const lineBeingCleared = animating && clearingLines.indexOf(Grid.ROWS - y - 1) > -1;
            // if (animating) console.log(`line ${y} being cleared ${lineBeingCleared}`)
            for (let x = 0; x < Grid.COLS; x++) {
                let cell = grid.pixels[y][x];
                if (cell !== 0) {
                    const color = this.colorFromCell(cell) + (lineBeingCleared ? "44" : "FF");
                    this.drawCell(ctx, of(x, y), color, gameState.level, grid);
                }
            }
        }
    }

    private drawShadowPiece(ctx: CanvasRenderingContext2D, tetromino: Tetromino, shadowPos: Vec2, level: number, grid: Grid) {
        const tetrominoY = tetromino.pixels.length;
        const tetrominoX = tetromino.pixels[0].length;

        for (let y = 0; y < tetrominoY; y++) {
            for (let x = 0; x < tetrominoX; x++) {
                let cell = tetromino.pixels[y][x];
                if (cell !== 0) {
                    const color = this.colorFromCell(cell);
                    this.drawCell(ctx, of(x, y).plus(shadowPos), `${color}44`, level, grid);
                }
            }
        }
    }

    private drawNextTetromino(ctx: CanvasRenderingContext2D, nextTetrominoes: Tetromino[], level: number, grid: Grid) {
        let offset = Grid.NEXT_TETROMINO_OFFSET.plus(of(Grid.COLS, 0));
        for (const nextTetromino of nextTetrominoes) {
            const tetrominoY = nextTetromino.pixels.length;
            const tetrominoX = nextTetromino.pixels[0].length;

            for (let y = 0; y < tetrominoY; y++) {
                for (let x = 0; x < tetrominoX; x++) {
                    let cell = nextTetromino.pixels[y][x];
                    if (cell !== 0) {
                        const color = this.colorFromCell(cell);
                        this.drawCell(ctx, offset.plus(of(x, y)), color, level, grid);
                    }
                }
            }
            offset = offset.plus(of(0, tetrominoY + 1));
        }
    }

    public drawCell(ctx: CanvasRenderingContext2D, pos: Vec2, color: string, level: number, grid: Grid) {
        let fn: (ctx: CanvasRenderingContext2D, pos: Vec2, color: string, grid: Grid) => void;
        if (level < 10) {
            fn = this.drawCellDefaultFill;
        } else if (level < 20) {
            fn = this.drawCellWireFrame;
        } else {
            fn = this.drawCell3D;
        }
        fn.apply(this, [ctx, pos, color, grid]);
    }

    private drawCell3D(ctx: CanvasRenderingContext2D, pos: Vec2, color: string, grid: Grid) {
        const size = Grid.PIXEL_SIZE;
        const offset = grid.baseOffset;
        const thickness = 2;
        ctx.fillStyle = "#222";
        ctx.fillRect(
            (offset.x + pos.x) * size, // x
            (offset.y + pos.y) * size, // y
            size, // width
            size // height
        );
        ctx.fillStyle = "#DDD";
        ctx.fillRect(
            (offset.x + pos.x) * size + thickness, // x
            (offset.y + pos.y) * size, // y
            size - 2 * thickness, // width
            thickness  // height
        );

        ctx.fillStyle = color;
        ctx.fillRect(
            (offset.x + pos.x) * size + thickness, // x
            (offset.y + pos.y) * size + thickness, // y
            size - 2 * thickness, // width
            size - 2 * thickness  // height
        );
    }

    private drawCellWireFrame(ctx: CanvasRenderingContext2D, pos: Vec2, color: string, grid: Grid) {
        const size = Grid.PIXEL_SIZE;
        const offset = grid.baseOffset;
        ctx.fillStyle = color;
        ctx.fillRect(
            (offset.x + pos.x) * size, // x
            (offset.y + pos.y) * size, // y
            size, // width
            size  // height
        );
        const thickness = 10;
        ctx.fillStyle = "#000";
        ctx.fillRect(
            (offset.x + pos.x) * size + thickness, // x
            (offset.y + pos.y) * size + thickness, // y
            size - 2 * thickness, // width
            size - 2 * thickness  // height
        );
    }

    private drawCellDefaultFill(ctx: CanvasRenderingContext2D, pos: Vec2, color: string, grid: Grid) {
        const size = Grid.PIXEL_SIZE;
        const offset = grid.baseOffset;
        ctx.fillStyle = color;
        ctx.fillRect(
            (offset.x + pos.x) * size, // x
            (offset.y + pos.y) * size, // y
            size, // width
            size  // height
        );
    }

    private drawBorders(ctx: CanvasRenderingContext2D, grid: Grid) {
        ctx.fillStyle = "#888";
        ctx.strokeStyle
        const size = Grid.PIXEL_SIZE;
        const offset = grid.baseOffset;
        const borderOffset = Grid.GRID_BORDER_SIZES;
        ctx.fillRect(
            (offset.x - borderOffset.x) * size,
            (offset.y - borderOffset.x) * size,
            (Grid.COLS + 2 * borderOffset.x) * size,
            (Grid.ROWS + 2 * borderOffset.y) * size
        )

        ctx.fillStyle = "#000";
        const borderThickness = 1;
        ctx.fillRect(
            offset.x * size,
            offset.y * size,
            Grid.COLS * size,
            Grid.ROWS * size
        )
    }

    private colorFromCell(cell: number) {
        switch (cell) {
            case 1:
                return "#00F0F0";
            case 2:
                return "#0000F0";
            case 3:
                return "#F0A000";
            case 4:
                return "#F0F000";
            case 5:
                return "#00F000";
            case 6:
                return "#A000F0";
            case 7:
                return "#F00000";
            default:
                throw new Error(`WTF IS ${cell}`)
        }
    }

    private drawScores(ctx: CanvasRenderingContext2D,
                       totalLinesCleared: number,
                       level: number,
                       score: number) {
        const pos = of(Grid.COLS + Grid.NEXT_TETROMINO_OFFSET.x, Grid.NEXT_TETROMINO_OFFSET.y).mult(Grid.PIXEL_SIZE);
        ctx.font = "40px Arial";
        ctx.textAlign = "start";
        ctx.fillStyle = "#DDD";
        ctx.fillText(`Level: ${level} Score: ${score} Lines: ${totalLinesCleared} `, pos.x, 42);
    }

    private drawPausedBanner(ctx: CanvasRenderingContext2D, baseOffset: Vec2) {
        this.drawText(ctx, "* PAUSED *", TextDrawRegion.CENTER, baseOffset);
    }

    private drawText(ctx: CanvasRenderingContext2D, text: string, region: TextDrawRegion, offset: Vec2 = Vec2.ZERO) {
        let pos: Vec2;
        switch (region) {
            case TextDrawRegion.CENTER:
                pos = of(Grid.COLS, Grid.ROWS)
                    .plus(offset).plus(offset)
                    .mult(Grid.PIXEL_SIZE)
                    .div(2);
                ctx.textAlign = "center";
                break;
            case TextDrawRegion.TOP_LEFT:
                pos = Grid.GRID_BORDER_SIZES
                    .plus(offset)
                    .mult(Grid.PIXEL_SIZE);
                ctx.textAlign = "start";
                break;
        }

        ctx.font = `${Grid.PIXEL_SIZE}px Arial`;
        ctx.strokeStyle = "#DDD";
        ctx.fillStyle = "#DDD";
        ctx.fillText(text, pos.x + offset.x, pos.y + offset.y);
    }

    private drawMessages(ctx: CanvasRenderingContext2D, messages: Message[]) {
        if (messages.length === 0) return;
        // console.log("Drawing messages", messages)
        for (let i = 0; i < messages.length; i++) {
            this.drawText(ctx, messages[i].text, TextDrawRegion.TOP_LEFT, Vec2.of(0, i));
        }
    }
}

enum TextDrawRegion {
    CENTER, TOP_LEFT
}