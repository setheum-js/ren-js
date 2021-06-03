export enum EthereumNetwork {
    Mainnet = "mainnet",
    Kovan = "kovan",
}

export interface EthereumConfig {
    chain: EthereumNetwork;
    isTestnet?: boolean;
    networkID: number;
    chainLabel: string;
    infura: string;
    etherscan: string;
    addresses: {
        GatewayRegistry: string;
        BasicAdapter: string;
    };
}

export const EthereumKovan: EthereumConfig = {
    chain: EthereumNetwork.Kovan,
    isTestnet: true,
    chainLabel: "Kovan",
    networkID: 42,
    infura: "https://kovan.infura.io",
    etherscan: "https://kovan.etherscan.io",
    addresses: {
        GatewayRegistry: "0x557e211EC5fc9a6737d2C6b7a1aDe3e0C11A8D5D",
        BasicAdapter: "0x7DDFA2e5435027f6e13Ca8Db2f32ebd5551158Bb",
    },
};

export const EthereumMainnet: EthereumConfig = {
    chain: EthereumNetwork.Mainnet,
    chainLabel: "Mainnet",
    networkID: 1,
    infura: "https://mainnet.infura.io",
    etherscan: "https://etherscan.io",
    addresses: {
        GatewayRegistry: "0x503670EC851C55EC1aCFB5230192da921467a24e",
        BasicAdapter: "0xAe65b0f676313Fd715F29D07538d1dc8557f2b1A",
    },
};
