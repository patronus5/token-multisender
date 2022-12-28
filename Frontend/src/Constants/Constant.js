const Constant =  {
    network: [
        {
            id: 'eth',
            name: 'Ethreum',
            rpc: 'https://mainnet.infura.io/v3/',
            chainId: 1,
            multisender: ""
        },
        {
            id: 'bsc',
            name: 'Binance',
            rpc: 'https://bsc-dataseed1.binance.org',
            chainId: 56,
            multisender: ""
        },
        {
            id: 'rinkeby',
            name: 'Rinkeby',
            rpc: 'https://rinkeby.infura.io/v3/',
            chainId: 4,
            multisender: "0xfBf7119CE4AB5542E20c3ff80C5d665dE67ADd47"
        },
        {
            id: 'polygon',
            name: 'Polygon',
            rpc: 'https://polygon-rpc.com',
            chainId: 137,
            multisender: ""
        },
        {
            id: 'avalanche',
            name: 'Avalanche',
            rpc: 'https://api.avax.network/ext/bc/C/rpc',
            chainId: 43114,
            multisender: ""
        },
        {
            id: 'fantom',
            name: 'Fantom',
            rpc: 'https://rpc.ftm.tools',
            chainId: 250,
            multisender: ""
        },
        {
            id: 'cronos',
            name: 'Cronos',
            rpc: 'https://evm.cronos.org',
            chainId: 25,
            multisender: ""
        }
    ]
}

export default Constant