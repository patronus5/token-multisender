import React from 'react'
import Web3 from 'web3'
import Web3Modal from "web3modal"
import { providers } from "ethers"
import { ToastContainer, toast } from 'react-toastify'
import WalletConnectProvider from "@walletconnect/web3-provider"
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './Pages/Home/Home'
import Header from './Layouts/Header'
import NetworkInfoModal from './Components/Home/NetworkInfoModal'

import Constant from './Constants/Constant'

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// const infuralURL = Constant.network[2].rpc
// const chainId = Constant.network[2].chainId
// const networkNameForMoralis = Constant.network[2].id
const MORALIS_API_KEY = "WjJr5rVtKg1YsST4o8YsY9F7eMhXTzNUiZ9DymAFOCTyJjm3E9DOi1IkR0heCBd3"

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "e1ca38f0c58f4681bf723d6ebb6da5d2",
    }
  }
}

let web3, web3Modal, defaultProvider
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions,
    theme: "dark",
  });
}

class Container extends React.Component {

  constructor() {
    super()

    let netId = localStorage.getItem('netId')
    if (!netId) {
      netId = 0
    }

    this.state = {
      tokens: [],
      address: '',
      loaded: false,
      provider: null,
      isSigned: false,
      nativeBalance: 0,
      web3Provider: null,
      isNetworkModalOpen: false,
      network: Constant.network[netId],
    }
  }

  connectWallet = async () => {
    if(this.state.isSigned === true) return

    const provider = await web3Modal.connect();
    const web3Provider = new providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const account = await signer.getAddress()
    const nativeBalance = await signer.getBalance()

    web3 = new Web3(provider)

    if(await web3.eth.getChainId() !== this.state.network.chainId) {
      await web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0x" + this.state.network.chainId.toString(16) }]
      })
    }

    this.setState({
      address: account,
      isSigned: true,
      provider,
      web3Provider,
      nativeBalance
    }, async () => {
      this.state.provider.on("accountsChanged", this.handleAccountsChanged)
      this.state.provider.on("chainChanged", this.handleChainChanged)

      if (!this.state.loaded) {
        this.fetchAllTokensInfo()
      }
    })
  }

  disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    window.location.reload()
  }

  openNetworkModal = () => {
    this.setState({
      ...this.state,
      isNetworkModalOpen: true
    })
  }

  closeNetworkModal = () => {
    this.setState({
      ...this.state,
      isNetworkModalOpen: false
    })
  }

  switchNetwork = async (_network, id) => {
    if (!this.state.isSigned) {
      this.displayNotification('You have to connect wallet first', 'warning')
      return
    }

    if (await web3.eth.getChainId() !== _network.chainId) {
      await web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0x" + _network.chainId.toString(16) }]
      }).then(() => {
        localStorage.setItem('netId', id)
      })
    }

    this.setState({
      ...this.state,
      network: _network,
      isNetworkModalOpen: false
    })
  }

  fetchAllTokensInfo = async () => {
    let opts = {
      method: "GET",
      headers: {
          "accept": "application/json",
          "x-api-key": MORALIS_API_KEY
      }
    }
    let apiForTokensBalance = `https://deep-index.moralis.io/api/v2/${this.state.address}/erc20?chain=${this.state.network.id}`
    let response = await fetch(apiForTokensBalance, opts)
    let tokens = await response.json()

    this.setState({
      ...this.state,
      tokens: tokens
    })
  }

  displayNotification = (text, appearance) => {
    let options = {
      autoClose: 2000,
      pauseOnHover: true
    }
    switch(appearance) {
        case 'warning':
            toast.warn(text, options); break
        case 'info':
            toast.info(text, options); break
        case 'error':
            toast.error(text, options); break
        case 'success':
            toast.success(text, options); break
        default:
            break
    }
  }

  handleChainChanged = () => {
    window.location.reload()
  }

  handleAccountsChanged = () => {
    window.location.reload()
  }

  componentDidMount() {
    // defaultProvider = new Web3.providers.HttpProvider(infuralURL)

    if(web3Modal.cachedProvider) {
      this.connectWallet()
      // (async () => {
      //   await web3Modal.clearCachedProvider();
      // })()
    }

    return () => {
      if (this.state.provider.removeListener) {
        this.state.provider.removeListener("accountsChanged", this.handleAccountsChanged)
        this.state.provider.removeListener("chainChanged", this.handleChainChanged)
      }
    }
  }

  // componentWillUnmount() {
  //   (async () => {
  //     await web3Modal.clearCachedProvider();
  //   })()
  // }

  render() {
    return (
      <section className="relative">
        <ToastContainer />
        <NetworkInfoModal
          network={this.state.network}
          isOpen={this.state.isNetworkModalOpen}
          closeModal={this.closeNetworkModal}
          switchNetwork={this.switchNetwork} />
        {!this.state.loading &&
          <div className='w-full'>
            <div className='w-full border-b border-light-gray'>
              <Header
                address={this.state.address}
                network={this.state.network}
                isSigned={this.state.isSigned}
                connectWallet={this.connectWallet}
                openNetworkModal={this.openNetworkModal}
                disconnectWallet={this.disconnectWallet} />
            </div>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    tokens={this.state.tokens}
                    network={this.state.network}
                    address={this.state.address}
                    provider={this.state.provider}
                    displayNotification={this.displayNotification} />
                }/>
            </Routes>
          </div>
        }
        {this.state.loading &&
          <div className='flex flex-col justify-center place-items-center w-full min-h-screen bg-primary'>
            {/* <button disabled type="button" className="py-2.5 px-7 mr-2 text-2xl font-medium bg-primary text-gray-300 rounded-lg inline-flex items-center">
              <svg role="status" className="inline mr-4 w-6 h-6 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2"/>
              </svg>
              Loading...
          </button> */}
          </div>
        }
      </section>
    )
  }
}

function App() {
  return (
    <BrowserRouter>
      <Container />
    </BrowserRouter>
  )
}

export default App