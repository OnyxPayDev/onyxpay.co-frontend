import BigNumber from "bignumber.js";

export function decodeAmount(amount, decimals) {
	let amountBN = new BigNumber(amount);
	amountBN = amountBN.shiftedBy(-decimals);

	return amountBN.toString();
}

export function convertAsset(asset, rate) {
	let amountBN = new BigNumber(asset.amount);
	amountBN = amountBN.div(Math.pow(10, asset.decimals));

	let excRate = new BigNumber(rate.rate);
	excRate = excRate.div(Math.pow(10, rate.decimals));

	return amountBN.times(excRate).toString();
}

export function addAmounts(a, b) {
	return new BigNumber(a).plus(new BigNumber(b)).toString();
}
