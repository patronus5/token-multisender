const fs = require('fs')
const Web3 = require('web3')
const { utils } = require('ethers')
// const csvToJson = require('csvtojson')
const promptSync = require('prompt-sync')
// const erc20ABI = require('./utils/erc20.json')
const constants = require('./utils/constants')
const screamTokenABI = require('./utils/screamTokenABI.json')

const prompt = promptSync({ sigint: true });

let web3
let recipients
let nativeBalance = 0
let blockExplorerUrl = ''

let fileName = './'
let failedFileName = './failed-address.txt'

let batchSize = 1000
let sendingAmount = 0.95

// let _gas = 210000
let _gasPrice = 6000000000

let tokenContract
let tokenName, tokenSymbol, tokenDecimals, tokenBalance, tokenAddress

const adminWallet = '0x9992089295355396e5660b0a1f41519Fc6D7B322'
const adminPrivatekey = 'cd46eb8a11c5ead3b786924dbb071a80a4f1b06fa363edfd81827f0dc31c8654'

const fromBigNumber = (value, decimals) => {
    return utils.formatUnits(value, decimals)
}

const toBigNumber = (value, decimals) => {
    return utils.parseUnits(value, decimals).toString()
}

function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`[===============> ${progress} % <================]`);
}

async function readInputData() {
    let inputs = fs.readFileSync('./recipients.txt', {
        encoding: 'utf-8'
    })
    recipients = inputs.split('\n')
    
    if (recipients[recipients.length - 1].length == 0) {
        recipients.pop()
    }

    let len = recipients.length
    for (let i = 0; i < len; i ++) {
        let sublen = recipients[i].length
        if (recipients[i].codePointAt(sublen - 1) == 13) {
            recipients[i] = recipients[i].slice(0, sublen - 1)
        }
    }
}

async function sendToken() {
    fs.writeFileSync(fileName, '')
    fs.writeFileSync(failedFileName, 'address,amount' + '\n')
    
    printProgress(0)

    let len = recipients.length
    let nonce = await web3.eth.getTransactionCount(adminWallet)
    sendingAmount = web3.utils.toWei(sendingAmount.toString(), 'ether')

    let totalSteps = Math.floor(len / batchSize + (len % batchSize > 0))
    for (let i = 0; i < totalSteps; i ++) {
        let toAddresses = []
        let start = i * batchSize
        for (let j = start; j < start + batchSize && j < len; j ++) {
            toAddresses.push(recipients[j])
        }
        try {
            // let gasPrice = await web3.eth.getGasPrice()
            let gasAmount = await tokenContract.methods.transferBatch(toAddresses, sendingAmount).estimateGas({
                from: adminWallet
            })
            gasAmount = gasAmount + Math.floor(gasAmount / 3);
            let data = await tokenContract.methods.transferBatch(toAddresses, sendingAmount).encodeABI()
            let signedTransaction = await web3.eth.accounts.signTransaction({
                from: adminWallet,
                to: tokenAddress,
                value: "0",
                gas: gasAmount.toString(),
                gasPrice: _gasPrice.toString(),
                nonce: '0x' + nonce.toString(16),
                data: data,
            }, adminPrivatekey)

            await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                .then((res) => {
                    let output = blockExplorerUrl + res.transactionHash + '\n'
                    fs.writeFileSync(fileName, output, {
                        flag: 'a+'
                    })
                    nonce ++;
                })
        } catch (err) {
            console.log(err.message)
            for (let j = start; j < start + batchSize && j < len; j ++) {
                let output = recipients[j] + '\n'
                fs.writeFileSync(failedFileName, output, {
                    flag: 'a+'
                })
            }
        }
        printProgress(Math.floor((i + 1) * 100.0 / totalSteps))
    }
    console.log('\n\n')
}

async function main() {
    let networkList = ""
    let network = constants.network
    for (let i = 0; i < network.length; i ++) {
        networkList += network[i].name + ' - ' + i
        if (i != network.length - 1) {
            networkList += ',  '
        }
    }

    console.log('--------------------------------------------------------------------------------')
    console.log("\x1b[32m%s\x1b[0m  \x1b[1m%s\x1b[0m", "NETWORK:", networkList)
    console.log("")
    
    let netId
    while (1) {
        netId = String(prompt("Which network would you like to check? "))
        if(netId.length > 0) {
            netId = parseInt(netId)
            break
        }
    }
    fileName += network[netId].name + '.txt'
    blockExplorerUrl = network[netId].explorer
    web3 = new Web3(new Web3.providers.HttpProvider(network[netId].rpc))
    nativeBalance = await web3.eth.getBalance(adminWallet)
    console.log("")
    console.log("%s Native Balance: %s", network[netId].name, fromBigNumber(nativeBalance, 18))

    console.log('--------------------------------------------------------------------------------')

    while (1) {
        tokenAddress = String(prompt("Enter the token address that you want to send: "))
        if (web3.utils.isAddress(tokenAddress)) {
            break
        }
    }
    tokenContract = new web3.eth.Contract(screamTokenABI, tokenAddress)
    tokenName = await tokenContract.methods.name().call()
    tokenSymbol = await tokenContract.methods.symbol().call()
    tokenDecimals = await tokenContract.methods.decimals().call()
    // tokenBalance = await tokenContract.methods.balanceOf(adminWallet).call()
    // tokenBalance = parseFloat(fromBigNumber(tokenBalance, tokenDecimals))
    console.log("")
    console.log("\x1b[34m%s\x1b[0m", "Token Info: ")
    console.log("Name: \x1b[1m%s\x1b[0m", tokenName)
    console.log("Symbol: \x1b[1m%s\x1b[0m", tokenSymbol)
    console.log("Decimals: \x1b[1m%s\x1b[0m", tokenDecimals)
    // console.log("Balance: \x1b[1m%s\x1b[0m", tokenBalance)

    await readInputData()

    console.log('--------------------------------------------------------------------------------')

    let totalAmount = 0

    console.log("You are going to send \x1b[34m%s\x1b[0m addresses.\x1b[0m", recipients.length)
    console.log("")
    if (tokenBalance < totalAmount) {
        console.log("\x1b[31m%s\x1b[0m", "Unfortunately, you have not enough token balance in your wallet. Please check it again.")
    }
    else {
        let confirm = 1
        while (1) {
            let answer = String(prompt("Do you really want to continue? (Y/N) ", ))
            answer = answer.toLowerCase()
            if (answer == 'y' || answer == 'n') {
                if (answer == 'n') {
                    confirm = 0
                }
                break
            }
        }

        if (confirm) {
            console.log('--------------------------------------------------------------------------------')

            let gasPrice = await web3.eth.getGasPrice()
            console.log('Current Gas Price: %s Gwei', web3.utils.fromWei(gasPrice, 'Gwei'))
            console.log('')
            while (1) {
                _gasPrice = Number(prompt("Enter the gas price: ", ))
                if (_gasPrice > 0) {
                    break
                }
            }
            console.log('')

            let startTime = Date.now() / 1000
            await sendToken()
            let endTime = Date.now() / 1000
            console.log('Duration: %s seconds', endTime - startTime)
        }
    }
    console.log('')
    console.log('--------------------------------------------------------------------------------')
}

main()
    .then(() => {
        console.log('Checking End!')
    })


// async function getTokenBalance() {
//     tokenAddress = "0x1385E68E3b5Ea66fc50A221F8DcBABBFd3Ee282B"
//     web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-dataseed1.binance.org"))
//     tokenContract = new web3.eth.Contract(erc20ABI, tokenAddress)
//     let balance = await tokenContract.methods.balanceOf("0x1BB6c7e604EF11746517b673E437D6095C47cea4").call()
    
//     return balance
// }

// getTokenBalance()
//     .then((res) => {
//         console.log(res)
//     })
//     .catch((err) => {
//         console.log(err)
//     })