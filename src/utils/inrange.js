export function isInRange({ value, range }) {
    // checks if a value is in a range. Range is an array of two values [min, max]
    return value >= range[0] && value <= range[1]
}