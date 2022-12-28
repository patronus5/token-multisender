const fs = require('fs')
const bs58 = require('bs58')
const axios = require('axios')
const csvToJson = require('csvtojson')
const web3 = require('@solana/web3.js')
const promptSync = require('prompt-sync')
const constants = require('./utils/constants')
const {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    Token
} = require('@solana/spl-token')

const prompt = promptSync({ sigint: true });

let recipients
let fileName = './'
let nativeBalance = 0
let blockExplorerUrl = ''
let failedFileName = './failed-address.csv'

let tokenDecimals, tokenBalance
let adminTokenAccount, tokenMint

const adminPrivatekey = ''
const u8Array = bs58.decode(adminPrivatekey)
const secretKey = Uint8Array.from(u8Array)
let keypair = web3.Keypair.fromSecretKey(secretKey)

const fromBigNumber = (value, decimals) => {
    return parseFloat(value) / Math.pow(10, decimals)
}

const toBigNumber = (value, decimals) => {
    return parseInt(parseFloat(value) * Math.pow(10, decimals))
}

function printProgress(progress){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`[===============> ${progress} % <================]`);
}

async function readInputData() {
    recipients = await csvToJson({
        trim: true
    }).fromFile('./input.csv')
}

async function sendToken() {
    fs.writeFileSync(fileName, '')
    fs.writeFileSync(failedFileName, 'address,amount' + '\n')

    printProgress(0)

    let batches = 10
    let len = recipients.length
    tokenMint = new web3.PublicKey(tokenMint)
    for (let step = 0; step < Math.floor(len / batches) + (len % batches > 0); step ++) {
        const transaction = new web3.Transaction()
        let ii = 0
        for (let i = step * batches; i < ((step + 1) * batches ) && i < len; i ++) {
            let userPubKey = new web3.PublicKey(recipients[i].address)
            try {
                let userTokenAccount = await Token.getAssociatedTokenAddress(
                    ASSOCIATED_TOKEN_PROGRAM_ID,
                    TOKEN_PROGRAM_ID,
                    tokenMint,
                    userPubKey,
                    false
                )
                let url = `https://public-api.solscan.io/account/${userTokenAccount.toString()}`
                let response = await axios(url, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                    }
                })
                let data = response.data
                if (data?.type != 'token_account') {
                    let instructionTx = Token.createAssociatedTokenAccountInstruction(
                        ASSOCIATED_TOKEN_PROGRAM_ID,
                        TOKEN_PROGRAM_ID,
                        tokenMint,
                        userTokenAccount,
                        userPubKey,
                        keypair.publicKey
                    )
                    transaction.add(instructionTx)
                }
                // let userTokenAccount = await getOrCreateAssociatedTokenAccount(
                //     connection,
                //     keypair,
                //     tokenMint,
                //     userPubKey
                // )
                transaction.add(
                    Token.createTransferInstruction(
                        TOKEN_PROGRAM_ID,
                        adminTokenAccount,
                        userTokenAccount,
                        keypair.publicKey,
                        [],
                        toBigNumber(recipients[i].amount, tokenDecimals)
                    )
                )
                ii ++
            } catch (error) {
                // console.log("error")
                // let output = recipients[i].address + ',' + recipients[i].amount + '\n'
                // fs.writeFileSync(failedFileName, output, {
                //     flag: 'a+'
                // })
            }
        }
        if (ii == 0) continue;

        console.log(ii)
        try {
            transaction.feePayer = keypair.publicKey
            transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash
            await connection.sendTransaction(
                transaction,
                [keypair],
                {
                    preflightCommitment: 'confirmed',
                }
            ).then((tx) => {
                let output = blockExplorerUrl + tx + '\n'
                console.log(output)
                fs.writeFileSync(fileName, output, {
                    flag: 'a+'
                })
            })
        } catch (error) {
            console.log(error)
            for (let i = step * batches; i < ((step + 1) * batches ) && i < len; i ++) {
                let output = recipients[i].address + ',' + recipients[i].amount + '\n'
                fs.writeFileSync(failedFileName, output, {
                    flag: 'a+'
                })
            }
        }
        
        let progress = (step + 1) * batches
        if (progress > len) {
            progress = len
        }
        printProgress(Math.floor(progress * 100.0 / len))
    }
    console.log('\n\n')
}

async function main() {
    let netId = 0
    let network = constants.network
    fileName += network[netId].name + '.txt'
    blockExplorerUrl = network[netId].explorer
    connection = new web3.Connection(network[netId].rpc, {
        preflightCommitment: 'processed',
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 16000
    })
    nativeBalance = await connection.getBalance(keypair.publicKey)
    console.log('--------------------------------------------------------------------------------')
    console.log("\x1b[34m%s %s SOL\x1b[0m", "Current Balance:", fromBigNumber(nativeBalance, 9))

    console.log('--------------------------------------------------------------------------------')
    while (1) {
        tokenMint = String(prompt("Enter the token address that you want to send: "))
        if (tokenMint != '') {
            break
        }
    }
    let adminTokensInfo = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
          filters: [
            {
              dataSize: 165, // number of bytes
            },
            {
              memcmp: {
                offset: 32, // number of bytes
                bytes: keypair.publicKey.toBase58(), // base58 encoded string
              },
            },
          ],
        }
    )
    for (let i = 0; i < adminTokensInfo.length; i ++) {
        let data = adminTokensInfo[i].account.data.parsed.info
        if (data.mint == tokenMint) {
            tokenBalance = data.tokenAmount.uiAmount
            tokenDecimals = data.tokenAmount.decimals
            adminTokenAccount = adminTokensInfo[i].pubkey
            break
        }
    }
    console.log("")
    console.log("\x1b[34m%s\x1b[0m", "Token Info: ")
    console.log("Decimals: \x1b[1m%s\x1b[0m", tokenDecimals)
    console.log("Balance: \x1b[1m%s\x1b[0m", tokenBalance)

    await readInputData()

    console.log('--------------------------------------------------------------------------------')
    let totalAmount = 0
    recipients.forEach((recipient) => {
        totalAmount += parseFloat(recipient.amount)
    })

    console.log("You are going to send \x1b[34m%s tokens\x1b[0m to \x1b[34m%s\x1b[0m addresses.\x1b[0m", totalAmount, recipients.length)
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
        console.log('Process End!')
    })


/*

// Getting token holder with some filter

async function isInvalidAddress(account) {
    let url = `https://public-api.solscan.io/account/${account}`
    try {
        let response = await axios(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            }
        })
        let data = response.data
        if (data?.type == "system_account") {
            return false
        }
        else {
            return true
        }
    } catch (e) {
        return true
    }
}

async function getHoldersOfToken(tokenAddress, totalNumberOfHolder) {
    let amount = "0.0001"
    let limit = 100, offset = 0
    let totalStep = Math.floor(totalNumberOfHolder / limit) + (totalNumberOfHolder % limit > 0)

    fs.writeFileSync('./holders.txt', '', {
    })
    
    for (let i = 0; i < totalStep; i ++) {
        let url = `https://public-api.solscan.io/token/holders?tokenAddress=${tokenAddress}&limit=${limit}&offset=${offset}`
        try {
            let response = await axios(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                }
            })
            let data = response.data.data
            for (let j = 0; j < data.length; j ++) {
                let isInvalid = await isInvalidAddress(data[j].owner)
                // console.log("%s %s",data[j].owner, isInvalid)
                if (isInvalid) {
                    continue
                }
                let output = data[j].owner + ',' + amount + '\n'
                fs.writeFileSync('./holders.txt', output, {
                    flag: 'a+'
                })
            }
            offset += limit

            console.log(offset)
        } catch (e) {
            console.log(e)
        }
    }
}

getHoldersOfToken("HovGjrBGTfna4dvg6exkMxXuexB3tUfEZKcut8AWowXj", 5000)
    .then(() => {
        console.log('succeed')
    })
    .catch(() => {
        console.log('failed')
    })

*/
