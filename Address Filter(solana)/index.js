const fs = require('fs')
const axios = require('axios')
const promptSync = require('prompt-sync')

const prompt = promptSync({ sigint: true })

function printProgress(progress, currentNumber){
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`Filtered ${progress} addresses. And found ${currentNumber} addresses.`);
}

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
    let limit = 100, offset = 0, currentNumber = 0
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
                printProgress(Math.floor(i * limit + j + 1), currentNumber)
                let isInvalid = await isInvalidAddress(data[j].owner)
                // console.log("%s %s",data[j].owner, isInvalid)
                if (isInvalid) {
                    continue
                }
                let output = data[j].owner + ',' + amount + '\n'
                fs.writeFileSync('./holders.txt', output, {
                    flag: 'a+'
                })
                currentNumber ++
            }
            offset += limit
        } catch (e) {
            console.log(e)
        }
    }
    console.log('')
}

async function main() {
    let tokenAddress, totalNumberOfHolder

    console.log('--------------------------------------------------------------------------------')
    while (1) {
        tokenAddress = String(prompt("Enter the token address that you want to scan: "))
        if (tokenAddress != '') {
            break
        }
    }

    while (1) {
        totalNumberOfHolder = Number(prompt("Enter the total number of holders of current token: "))
        if (totalNumberOfHolder > 0) {
            break
        }
    }
    try {
        console.log('--------------------------------------------------------------------------------')
        let startTime = Date.now() / 1000
        await getHoldersOfToken(tokenAddress, totalNumberOfHolder)
        let endTime = Date.now() / 1000
        console.log('Duration: %s seconds', endTime - startTime)
        console.log('')
        console.log('--------------------------------------------------------------------------------')
    } catch (e) {
        console.log(e)
    }
}

main()
    .then(() => {
        console.log('succeed')
    })
    .catch(() => {
        console.log('failed')
    })
