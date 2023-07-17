


export namespace MathUtils {

    /**
     * Clamp value to min..=max range.
     * @param value 
     * @param min 
     * @param max 
     * @returns 
     */
    export function clamp(value: number, min: number, max: number): number {
        return value < min ? min : (value > max ? max : value);
    }

    /**
     * Linear interpolate.  
     */
    export function lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    /**
     * Bilinear interpolation.  
     */
    export function bilinear(a: number, b: number, c: number, d: number, t1: number, t2: number): number {
        // return MathUtils.lerp(MathUtils.lerp(a, b, t1), MathUtils.lerp(c, d, t1), t2);
        return (1 - t1) * (1 - t2) * a + t1 * (1 - t2) * b + (1 - t1) * t2 * c + t1 * t2 * d; 
    }

    /**
     * Sign a value with epsilon range.
     * @param x 
     * @param EPSILON 
     * @returns The sign of the value.
     */
    export function signEps(x: number, EPSILON: number = Number.EPSILON): -1 | 0 | 1 {
        return x > EPSILON ? 1 : (x < EPSILON ? -1 : 0);
    }

}


