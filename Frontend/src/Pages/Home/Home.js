import React, { useState, useEffect } from 'react'
import { utils } from 'web3'
import { constants } from 'ethers'

import Step1 from '../../Components/Home/Step1'
import Step2 from '../../Components/Home/Step2'
import Step3 from '../../Components/Home/Step3'

import {
    getERC20Contract,
    getMultiSenderContract
} from '../../Utils/ContractHelper'
import { fromBigNumber, toBigNumber } from '../../Utils/Web3Utils'

function Home ({
    tokens,
    address,
    network,
    provider,
    displayNotification
}) {
    let previousOption = null

    const [step, setStep] = useState(0)
    const [options, setOptions] = useState([])
    const [addresses, setAddresses] = useState('')
    const [isApproved, setIsApproved] = useState(false)
    const [recipientInfo, setRecipientInfo] = useState([])
    const [currentOption, setCurrentOption] = useState(null)
    const [errorMessageForStep1, setErrorMessageForStep1] = useState('')
    const [errorMessageForStep2, setErrorMessageForStep2] = useState('')

    const onCSVChanged = (data) => {
        setAddresses(data)
    }

    const checkValidationForCSV = () => {
        let valid = true
        let tempList = []
        let _total = 0
        let recipients = addresses.split('\n')

        if (recipients.length < 2) {
            setErrorMessageForStep1('The distribution list must contain at least 2 addresses.')
            valid = false
        }
        else {
            for (let i = 0; i < recipients.length; i ++) {
                let csv = recipients[i].split(',')
                if (csv.length != 2) {
                    setErrorMessageForStep1('The distribution list contains invalid csv inputs.')
                    valid = false
                    break
                }
                if (!utils.isAddress(csv[0])) {
                    setErrorMessageForStep1('The distribution list contains invalid addresses.')
                    valid = false
                    break
                }
                if (!csv[1].match(/^[0-9]*[.,]?[0-9]*$/)) {
                    setErrorMessageForStep1('The distribution list contains invalid amounts.')
                    valid = false
                    break
                }
                tempList.push(csv)
                _total += parseFloat(csv[1])
            }
        }
        
        if (valid) {
            if (currentOption) {
                let _balance = parseFloat(fromBigNumber(currentOption.value.balance, currentOption.value.decimals))
                if (_total > _balance) {
                    setErrorMessageForStep1('The sum of sending amounts must be less than the token balance.')
                    valid = false
                }
                else {
                    if (previousOption) {
                        if (previousOption.value.token_address !== currentOption.value.token_address) {
                            setIsApproved(false)
                        }
                    }
                    setRecipientInfo(tempList)
                    setErrorMessageForStep1('')
    
                    setStep(1)
                }
           }
           else {
                setErrorMessageForStep1('You have to select the token that you want to send.')
           }
        }
        console.log(valid)
    }

    const onSelectChanged = (selectedOption) => {
        setCurrentOption(selectedOption)
    }

    const calculateTotalAmount = () => {
        if (!currentOption) {
            return 0
        }
        let total = 0
        for (let i = 0; i < recipientInfo.length; i ++) {
            total += parseFloat(recipientInfo[i][1])
        }
        
        return total
    }

    const approveToken = () => {
        if (isApproved) {
            return
        }

        let token = currentOption.value
        let approveAmount = calculateTotalAmount()
        const tokenContract = getERC20Contract(token.token_address, provider)
        tokenContract.methods.approve(network.multisender, constants.MaxUint256).send({
            from: address
        })
        .on('transactionHash', () => {
            displayNotification('Transaction submitted', 'info')
        })
        .on('error', (err) => {
            displayNotification(err.message, 'error')
        })
        .then(() => {
            displayNotification('Transaction success', 'success')
            previousOption = currentOption
            setIsApproved(true)
            setStep(2)
        })
    }

    const multiTransferToken = (isChecked, gas, gasPrice) => {
        const multiSender = getMultiSenderContract(network.multisender, provider)
        let _total = 0
        let _recipients = [], _amounts = []

        for (let i = 0; i < recipientInfo.length; i ++) {
            _amounts.push(toBigNumber(recipientInfo[i][1], currentOption.value.decimals))
            _recipients.push(recipientInfo[i][0])
            _total += parseFloat(recipientInfo[i][1])
        }

        let opts = {
            from: address
        }
        if (isChecked) {
            opts = {
                ...opts,
                gas,
                gasPrice
            }
        }

        multiSender.methods.multiTransferToken(
            currentOption.value.token_address,
            _recipients,
            _amounts,
            toBigNumber(_total.toString(), currentOption.value.decimals)
        ).send(
            opts
        )
        
        .on('transactionHash', () => {
            displayNotification('Transaction submitted', 'info')
        })
        .on('error', (err) => {
            displayNotification(err.message, 'error')
        })
        .then(() => {
            displayNotification('Transaction success', 'success')
        })
    }

    useEffect(() => {
        if (tokens.length) {
            let data = []
            for (let i = 0; i < tokens.length; i ++) {
                data.push({
                    value: tokens[i],
                    label: tokens[i].symbol + ' - ' + tokens[i].token_address
                })
            }
            setOptions(data)
        }
    }, [tokens])
        
    return (
        <section className='w-full flex flex-col justify-center place-items-center py-20 space-y-10'>
            <Step1
                options={options}
                addresses={addresses}
                onCSVChanged={onCSVChanged}
                currentOption={currentOption}
                onSelectChanged={onSelectChanged}
                errorMessage={errorMessageForStep1}
                checkValidationForCSV={checkValidationForCSV} />
            { step > 0 &&
                <Step2
                    isApproved={isApproved}
                    recipients={recipientInfo}
                    approveToken={approveToken}
                    currentOption={currentOption}
                    errorMessage={errorMessageForStep2}
                    calculateTotalAmount={calculateTotalAmount} />
            }
            { step > 1 &&
                <Step3
                    multiTransferToken={multiTransferToken} />
            }
        </section>
    )
}

export default Home