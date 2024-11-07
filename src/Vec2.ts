export class Vec2 {
    readonly x: number;
    readonly y: number;
    public static ZERO = Vec2.of(0,0);

    private constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static of(x: number, y: number) {
        return new Vec2(x, y);
    }

    plus(dir: Vec2) {
        return Vec2.of(this.x + dir.x, this.y + dir.y);
    }

    mult(factor: number) {
        return Vec2.of(this.x * factor, this.y * factor)
    }

    div(dividend: number) {
        if (dividend === 0) throw new Error("Can't divide by 0!");
        return Vec2.of(this.x / dividend, this.y / dividend);
    }

    toString() {
        return `(${this.x}; ${this.y})`;
    }
}

export function of(x: number, y: number) {
    return Vec2.of(x, y);
}