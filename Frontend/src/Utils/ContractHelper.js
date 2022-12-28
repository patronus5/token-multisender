import Web3 from 'web3'

import Erc20ABI from '../Constants/ABI/Erc20.json'
import MultiSenderABI from '../Constants/ABI/Multisender.json'

export const getERC20Contract = (_addr, provider) => {
    let web3 = new Web3(provider)
    let contract = new web3.eth.Contract(Erc20ABI, _addr)
    return contract
}

export const getMultiSenderContract = (_addr, provider) => {
    let web3 = new Web3(provider)
    let contract = new web3.eth.Contract(MultiSenderABI, _addr)
    return contract
}