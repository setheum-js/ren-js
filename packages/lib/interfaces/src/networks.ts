export enum RenNetwork {
    Mainnet = "mainnet",
    Testnet = "testnet",
    Devnet = "devnet",
}

export interface RenNetworkDetails {
    name: string;
    lightnode: string;
    isTestnet: boolean;
}

const renMainnet: RenNetworkDetails = {
    name: RenNetwork.Mainnet,
    lightnode: "https://lightnode-new-mainnet.herokuapp.com",
    isTestnet: false,
};
const renTestnet: RenNetworkDetails = {
    name: RenNetwork.Testnet,
    lightnode: "https://lightnode-new-testnet.herokuapp.com",
    isTestnet: true,
};
const renDevnet: RenNetworkDetails = {
    name: RenNetwork.Devnet,
    lightnode: "https://lightnode-devnet.herokuapp.com",
    isTestnet: true,
};

export const getRenNetworkDetails = (
    renNetwork: RenNetwork | RenNetworkString | RenNetworkDetails,
): RenNetworkDetails => {
    switch (renNetwork) {
        case RenNetwork.Mainnet:
        case RenNetwork.Mainnet as "mainnet":
            return renMainnet;
        case RenNetwork.Testnet:
        case RenNetwork.Testnet as "testnet":
            return renTestnet;
        case RenNetwork.Devnet:
        case RenNetwork.Devnet as "devnet":
            return renDevnet;
        default:
            return renNetwork;
    }
};

export type RenNetworkString = "mainnet" | "testnet" | "devnet";

export const RenNetworks = [
    RenNetwork.Mainnet,
    RenNetwork.Testnet,
    RenNetwork.Devnet,
];
