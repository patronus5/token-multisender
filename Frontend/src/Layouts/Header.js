import React, { useState } from 'react'

function Header(props) {
    const address = props.address
    const isSigned = props.isSigned
    const [isOpen, setIsOpen] = useState(false)

    const convertAddresstoName = (addr) => {
        const len = address.length
        return addr.slice(0, 6) + '...' + address.slice(len - 4, len)
    }

    const connectWallet = () => {
        if(!isSigned) {
            props.connectWallet()
        } else {
            props.disconnectWallet()
        }
    }

    return (
        <nav className="relative flex flex-wrap items-center justify-between w-full px-2 navbar-expand-lg bg-primary-light">
            <div className="flex flex-wrap items-center justify-between w-full px-5 mini-phone:px-1 mx-auto py-5">
                <div className="w-full relative flex justify-between lg:w-auto px-4 lg:static lg:block lg:justify-start">
                    <a className="flex place-items-center h-12 pr-12 py-2" href="/">
                        <img className='h-full object-contain' src='/images/logo.png' alt='logo_img' />
                        <span className='text-white text-2xl pb-1 px-3'>Multisender</span>
                    </a>
                    <button className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
                            onClick={() => {setIsOpen(!isOpen)}}>
                        <span className="block relative w-5 h-px rounded-sm bg-white"></span>
                        <span className="block relative w-5 h-px rounded-sm bg-white mt-1"></span>
                        <span className="block relative w-5 h-px rounded-sm bg-white mt-1"></span>
                    </button>
                </div>
                <div className={`flex flex-col w-full lg:w-auto items-center place-items-center overflow-hidden space-y-3 transition-all duration-500 lg:py-0 lg:space-y-0 lg:space-x-3 lg:flex-row
                                    ${isOpen === true?'desktop-min:max-h-96 desktop-min:py-2':'desktop-min:max-h-0'}`}>
                    {/* <ul className="flex flex-row list-none lg:ml-auto">
                        <li className="nav-item">
                            <a className="px-3 py-2 flex items-center text-xs uppercase leading-snug text-white hover:opacity-75"
                                href='https://twitter.com/memenationbsc' target="_blank" rel="noopener noreferrer">
                                <span className='text-gray-600 text-xl cursor-pointer'>
                                    <i className='fab fa-twitter'></i>
                                </span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="px-3 py-2 flex items-center text-xs uppercase leading-snug text-white hover:opacity-75"
                                href='https://t.me/memenation_portal' target="_blank" rel="noopener noreferrer">
                                <span className='text-gray-600 text-xl cursor-pointer'>
                                    <i className='fab fa-telegram'></i>
                                </span>
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="px-3 py-2 flex items-center text-xs uppercase leading-snug text-white hover:opacity-75"
                                href='https://memenation.io' target="_blank" rel="noopener noreferrer">
                                <span className='text-gray-600 text-xl cursor-pointer'>
                                    <i className='fas fa-globe'></i>
                                </span>
                            </a>
                        </li>
                    </ul> */}
                    <button
                        className="bg-light-gray hover:bg-opacity-80 text-white text-sm font-medium px-5 py-1.5 rounded-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        onClick={props.openNetworkModal}
                    >
                        {props.network.name}
                    </button>
                    <button
                        className="bg-light-gray hover:bg-opacity-80 text-white text-sm font-medium px-5 py-1.5 rounded-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        onClick={connectWallet}>
                        { isSigned === true
                            ? `Disconnect | ${convertAddresstoName(address)}`
                            : "Connect to a wallet" }
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Header