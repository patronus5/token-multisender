import React, { useState, useEffect } from 'react'
import Select from 'react-select'
import CSVReader from 'react-csv-reader'

import { fromBigNumber } from '../../Utils/Web3Utils'

function Step1 ({
    options,
    addresses,
    errorMessage,
    onCSVChanged,
    currentOption,
    onSelectChanged,
    checkValidationForCSV
}) {
    const onCSVFileLoaded = (data, fileInfo, originalFile) => {
        if (data && data.length > 0) {
            onCSVChanged(data.join('\n'))
        }
    }

    const calculateBalance = () => {
        let token = currentOption.value
        let balance = fromBigNumber(token.balance, token.decimals)
        return balance
    }

    return (
        <div className='max-w-2xl w-full flex flex-col justify-center place-items-center border-2 border-gray-400 rounded-xl p-5 space-y-6'>
            <div className='w-full flex flex-col space-y-3'>
                <div className='w-full flex flex-row justify-between text-white text-sm'>
                    <h1>Token address</h1>
                    { currentOption &&
                        <p>Balance: {calculateBalance()}</p>
                    }
                </div>
                <Select
                    className='w-full rounded-xl'
                    placeholder='Select token address'
                    onChange={onSelectChanged}
                    options={options}
                />
            </div>
            <div className='w-full flex flex-col space-y-3'>
                <h1 className='text-white text-sm'>
                    Please provide a list of recipients
                </h1>
                <textarea
                    className='w-full h-60 bg-transparent text-white border border-gray-400 rounded-xl px-3 py-2 resize-none'
                    value={addresses}
                    onChange={(e) => onCSVChanged(e.target.value)}
                />
                <div className='flex place-items-center justify-end'>
                    <CSVReader
                        onFileLoaded={onCSVFileLoaded} />
                </div>
            </div>
            { errorMessage !== '' && 
                <div className='w-full'>
                    <h1 className='w-full rounded-xl bg-red-700 bg-opacity-30 text-white text-sm px-5 py-2'>{errorMessage}</h1>
                </div>
            }
            <div className='w-full'>
                <button
                    className='w-full bg-yellow hover:bg-opacity-90 text-gray-800 px-5 py-3 rounded-xl'
                    onClick={checkValidationForCSV}>
                    Continue
                </button>
            </div>
        </div>
    )
}

export default Step1