import { utils } from "ethers"

export const BNBAddress = "-"

export const fromBigNumber = (value, decimals) => {
    return utils.formatUnits(value, decimals)
}

export const toBigNumber = (value, decimals) => {
    return utils.parseUnits(value, decimals).toString()
}