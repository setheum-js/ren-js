import { Networks as BNetworks } from "bitcore-lib";
import { Networks as ZNetworks } from "bitcore-lib-zcash";

export enum Network {
    Mainnet = "mainnet",
    Testnet = "testnet",
    Devnet = "devnet",
}

export interface NetworkDetails {
    name: string;
    lightnodeURL: string;

    mercuryURL: {
        btc: string,
        zec: string,
    };
    chainSoName: {
        btc: string,
        zec: string,
    };
    chainSoURL: string;
    masterKey: {
        mpkh: string;
        eth: string;
    };
    bitcoinNetwork: BNetworks.Network;
    zcashNetwork: ZNetworks.Network;
    zBTC: string; // TODO: Use map of tokens
    BTCShifter: string;
}

export const NetworkMainnet: NetworkDetails = {
    name: Network.Mainnet,
    lightnodeURL: "",
    mercuryURL: {
        btc: "",
        zec: "",
    },
    chainSoName: {
        btc: "",
        zec: "",
    },
    chainSoURL: "",
    masterKey: {
        mpkh: "",
        eth: "",
    },
    bitcoinNetwork: BNetworks.mainnet,
    zcashNetwork: ZNetworks.mainnet,
    zBTC: "",
    BTCShifter: "",
};

// Configurations shared by Testnet and Devnet
const generalTestnet = {
    mercuryURL: {
        btc: "https://ren-mercury.herokuapp.com/btc-testnet3",
        zec: "https://ren-mercury.herokuapp.com/zec-testnet",
    },
    chainSoName: {
        btc: "BTCTEST",
        zec: "ZECTEST",
    },
    bitcoinNetwork: BNetworks.testnet,
    zcashNetwork: ZNetworks.testnet,
    chainSoURL: "https://chain.so/api/v2",
};

export const NetworkTestnet: NetworkDetails = {
    name: Network.Testnet,
    lightnodeURL: "https://lightnode-testnet.herokuapp.com",
    ...generalTestnet,
    masterKey: {
        mpkh: "feea966136a436e44c96335455771943452728fc",
        eth: "44Bb4eF43408072bC888Afd1a5986ba0Ce35Cb54",
    },
    zBTC: "0x1aFf7F90Bab456637a17d666D647Ea441A189F2d",
    BTCShifter: "0x8a0E8dfC2389726DF1c0bAB874dd2C9A6031b28f",
};

export const NetworkDevnet: NetworkDetails = {
    name: Network.Devnet,
    lightnodeURL: "https://lightnode-devnet.herokuapp.com",
    ...generalTestnet,
    masterKey: {
        mpkh: "390e916c0f9022ef6cc44f05cd5094b2d9597574",
        eth: "723eb4380e03df6a6f98cc1338b00cfbe5e45218",
    },
    zBTC: "0x4eB1403f565c3e3145Afc3634F16e2F092545C2a",
    BTCShifter: "0x7a40fE9FB464510215C41Eae1216973514eeEBB1",
};

export const stringToNetwork = (network?: NetworkDetails | string | null | undefined): NetworkDetails => {
    if (typeof network === "string") {
        switch (network.toLowerCase()) {
            case "":
            case "mainnet":
                return NetworkMainnet;
            case "testnet":
                return NetworkTestnet;
            case "devnet":
                return NetworkDevnet;
            default:
                throw new Error(`Unsupported network "${network}"`);
        }
    } else if (network === undefined || network === null) {
        return NetworkMainnet;
    } else {
        return network;
    }
};