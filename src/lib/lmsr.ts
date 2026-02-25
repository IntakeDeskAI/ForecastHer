/**
 * Logarithmic Market Scoring Rule (LMSR) implementation.
 *
 * The LMSR is an automated market maker that provides instant liquidity
 * for prediction markets. It was invented by Robin Hanson.
 *
 * Cost function: C(q) = b * ln(e^(q_yes/b) + e^(q_no/b))
 * Price of YES:  p_yes = e^(q_yes/b) / (e^(q_yes/b) + e^(q_no/b))
 * Price of NO:   p_no  = 1 - p_yes
 *
 * Where:
 *   q_yes, q_no = total outstanding shares for each outcome
 *   b = liquidity parameter (higher = more stable prices)
 */

/**
 * Calculate the current YES probability/price.
 */
export function yesPrice(yesShares: number, noShares: number, b: number): number {
  const expYes = Math.exp(yesShares / b);
  const expNo = Math.exp(noShares / b);
  return expYes / (expYes + expNo);
}

/**
 * Calculate the current NO probability/price.
 */
export function noPrice(yesShares: number, noShares: number, b: number): number {
  return 1 - yesPrice(yesShares, noShares, b);
}

/**
 * Cost function C(q_yes, q_no).
 */
export function costFunction(yesShares: number, noShares: number, b: number): number {
  const maxQ = Math.max(yesShares / b, noShares / b);
  // Use log-sum-exp trick for numerical stability
  return b * (maxQ + Math.log(Math.exp(yesShares / b - maxQ) + Math.exp(noShares / b - maxQ)));
}

/**
 * Calculate the cost to buy `amount` shares of a given side.
 * Returns the dollar cost (positive for buys).
 */
export function costToBuy(
  side: "yes" | "no",
  amount: number,
  yesShares: number,
  noShares: number,
  b: number
): number {
  const newYes = side === "yes" ? yesShares + amount : yesShares;
  const newNo = side === "no" ? noShares + amount : noShares;
  return costFunction(newYes, newNo, b) - costFunction(yesShares, noShares, b);
}

/**
 * Calculate the refund from selling `amount` shares of a given side.
 * Returns a positive number representing dollars received back.
 */
export function costToSell(
  side: "yes" | "no",
  amount: number,
  yesShares: number,
  noShares: number,
  b: number
): number {
  const newYes = side === "yes" ? yesShares - amount : yesShares;
  const newNo = side === "no" ? noShares - amount : noShares;
  return costFunction(yesShares, noShares, b) - costFunction(newYes, newNo, b);
}

/**
 * Given a dollar amount to spend, calculate how many shares you get.
 * Uses binary search for numerical precision.
 */
export function sharesToBuy(
  side: "yes" | "no",
  dollarAmount: number,
  yesShares: number,
  noShares: number,
  b: number
): number {
  let lo = 0;
  let hi = dollarAmount * 100; // upper bound — shares can't exceed this
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const cost = costToBuy(side, mid, yesShares, noShares, b);
    if (cost < dollarAmount) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/**
 * Format a price as cents (e.g., 0.42 → "42¢")
 */
export function formatPrice(price: number): string {
  return `${Math.round(price * 100)}¢`;
}

/**
 * Format a price as a percentage (e.g., 0.42 → "42%")
 */
export function formatPct(price: number): string {
  return `${Math.round(price * 100)}%`;
}
