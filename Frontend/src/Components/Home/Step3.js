import React, { useState, useEffect } from 'react'

function Step3 ({
    multiTransferToken
}) {
    const [gas, setGas] = useState('')
    const [gasPrice, setGasPrice] = useState('')
    const [isChecked, setIsChecked] = useState(false)

    useEffect(() => {
        console.log(isChecked)
    }, [isChecked])

    return (
        <div className='max-w-2xl w-full flex flex-col justify-center place-items-center border-2 border-gray-400 rounded-xl p-5 space-y-2'>
            <div className='w-full flex flex-col space-y-3'>
                <div className='flex items-center space-x-2'>
                    <input type="checkbox" name="customGas" onClick={(e) => setIsChecked(e.target.checked)} />
                    <label className='text-white' htmlFor="customGas">Customize Gas</label>
                </div>
                <div className='w-full flex flex-col space-y-2'>
                    <h1 className='text-white font-bold px-1.5'>Gas</h1>
                    <input
                        className='w-full px-5 py-2 text-white bg-transparent focus:bg-gray-600 border border-gray-400 focus:outline-none rounded-xl'
                        placeholder='Input GasLimit here...' disabled={!isChecked}
                        onChange={(e) => setGas(e.target.value)} />
                </div>
                <div className='w-full flex flex-col space-y-2'>
                    <h1 className='text-white font-bold px-1.5'>Gas Price</h1>
                    <input
                        className='w-full px-5 py-2 text-white bg-transparent focus:bg-gray-600 border border-gray-400 focus:outline-none rounded-xl'
                        placeholder='Input GasPrice here...' disabled={!isChecked}
                        onChange={(e) => setGasPrice(e.target.value)} />
                </div>
            </div>
            <div className='w-full'>
                <button
                    className='w-full bg-yellow hover:bg-opacity-90 text-gray-800 px-5 py-3 rounded-xl mt-5'
                    onClick={(e) => multiTransferToken(isChecked, gas, gasPrice)}
                >
                    Send Transaction
                </button>
            </div>
        </div>
    )
}

export default Step3