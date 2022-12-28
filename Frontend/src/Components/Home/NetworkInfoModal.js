import React, { Fragment } from "react"
import { Dialog, Transition } from '@headlessui/react'

import {
    XIcon
} from "@heroicons/react/outline"

import Constant from "../../Constants/Constant"

function NetworkInfoModal({
    isOpen,
    network,
    closeModal,
    switchNetwork
}) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={closeModal}
            >
                <div className="min-h-screen text-center px-16px">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0 scale-100"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full max-w-26rem overflow-auto text-left align-middle transition-all transform bg-light-gray shadow-xl rounded-xl">
                            <Dialog.Title
                                as="h3"
                                className="flex justify-between text-xl font-bold text-white dark:text-gray-300 py-4 px-6 border-b-[1px] shadow-md"
                            >
                                <div className="flex items-center">
                                    <h1 className="text-white text-xl">Switch Network</h1>
                                </div>
                                <button>
                                    <XIcon
                                        className="inline h-6 text-gray-300 hover:text-gray-400 outline-none"
                                        onClick={closeModal} />
                                </button>
                            </Dialog.Title>
                            <div className="w-full flex flex-wrap py-5 px-2">
                                { Constant.network.map((item, i) => {
                                    return (
                                        <div className="w-1/3 px-2 my-3" key={i}>
                                            { network.chainId !== item.chainId &&
                                                <button
                                                    className="w-full text-white text-center text-sm border border-gray-400 transition-all duration-800 hover:bg-gray-500 hover:border-transparent rounded-lg py-2"
                                                    onClick={() => switchNetwork(item, i)}
                                                >
                                                    {item.name}
                                                </button>
                                            }
                                            { network.chainId === item.chainId &&
                                                <button
                                                    className="w-full bg-gray-500 text-white text-center text-sm transition-all duration-800 rounded-lg py-2"
                                                    onClick={() => switchNetwork(item, i)}
                                                >
                                                    {item.name}
                                                </button>
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}

export default NetworkInfoModal