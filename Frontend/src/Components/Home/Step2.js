import React, { useState, useEffect } from 'react'

import { fromBigNumber } from '../../Utils/Web3Utils'

function Step2 ({
    isApproved,
    recipients,
    approveToken,
    errorMessage,
    currentOption,
    calculateTotalAmount
}) {
    const calculateBalance = () => {
        if (!currentOption) {
            return 0
        }
        let token = currentOption.value
        let balance = fromBigNumber(token.balance, token.decimals)
        balance = parseFloat(parseFloat(balance).toFixed(5))
        return balance
    }

    return (
        <div className='max-w-2xl w-full flex flex-col justify-center place-items-center border-2 border-gray-400 rounded-xl p-5 space-y-2'>
            <div className='w-full flex flex-wrap justify-between'>
                <div className='w-49% flex flex-col justify-center text-center border border-gray-500 rounded-xl py-4 space-y-2'>
                    <h1 className='text-white text-2xl font-bold'>{recipients.length}</h1>
                    <p className='text-sm text-gray-500'>Total recipients</p>
                </div>
                <div className='w-49% flex flex-col justify-center text-center border border-gray-500 rounded-xl py-4 space-y-2'>
                    <h1 className='text-white text-2xl font-bold'>0 {currentOption.value.symbol}</h1>
                    <p className='text-sm text-gray-500'>Your current multisender Massdrop approval</p>
                </div>
            </div>
            <div className='w-full flex flex-wrap justify-between'>
                <div className='w-49% flex flex-col justify-center text-center border border-gray-500 rounded-xl py-4 space-y-2'>
                    <h1 className='text-white text-2xl font-bold'>{calculateTotalAmount()} {currentOption.value.symbol}</h1>
                    <p className='text-sm text-gray-500'>Total amount of tokens to send</p>
                </div>
                <div className='w-49% flex flex-col justify-center text-center border border-gray-500 rounded-xl py-4 space-y-2'>
                    <h1 className='text-white text-2xl font-bold'>{calculateBalance()} {currentOption.value.symbol}</h1>
                    <p className='text-sm text-gray-500'>Your token balance</p>
                </div>
            </div>
            { errorMessage !== '' && 
                <div className='w-full'>
                    <h1 className='w-full rounded-xl bg-red-700 bg-opacity-30 text-white text-sm px-5 py-2'>{errorMessage}</h1>
                </div>
            }
            <div className='w-full'>
                { !isApproved &&
                    <button
                        className='w-full bg-yellow hover:bg-opacity-90 text-gray-800 px-5 py-3 rounded-xl mt-5'
                        onClick={approveToken}
                    >
                        Approve
                    </button>
                }
                { isApproved &&
                    <div className='w-full bg-light-gray text-gray-300 text-center px-5 py-3 rounded-xl mt-5'>
                        Approved
                    </div>
                }
            </div>
        </div>
    )
}

export default Step2