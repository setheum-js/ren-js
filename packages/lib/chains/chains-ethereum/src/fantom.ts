import {
    getRenNetworkDetails,
    RenNetwork,
    RenNetworkDetails,
    RenNetworkString,
} from "@renproject/interfaces";
import { Callable, utilsWithChainNetwork } from "@renproject/utils";
import { provider } from "web3-providers";
import { EthAddress, EthTransaction, NetworkInput } from "./base";

import { EthereumClass } from "./ethereum";
import { EthereumConfig } from "./utils/networks";
import { addressIsValid } from "./utils/utils";

export const renFantomDevnet: EthereumConfig = {
    name: "Fantom Devnet",
    chain: "fantomDevnet",
    isTestnet: true,
    chainLabel: "Fantom Devnet",
    networkID: 0xfa2,
    infura: "https://rpc.testnet.fantom.network/",
    etherscan: "https://explorer.testnet.fantom.network/",
    addresses: {
        GatewayRegistry: "0xD881213F5ABF783d93220e6bD3Cc21706A8dc1fC",
        BasicAdapter: "0xD087b0540e172553c12DEEeCDEf3dFD21Ec02066",
    },
};

export const FantomConfigMap = {
    [RenNetwork.DevnetVDot3]: renFantomDevnet,
};

const resolveFantomNetwork = (
    renNetwork:
        | RenNetwork
        | RenNetworkString
        | RenNetworkDetails
        | EthereumConfig,
) => {
    if ((renNetwork as EthereumConfig).addresses) {
        return renNetwork as EthereumConfig;
    } else {
        const details = getRenNetworkDetails(
            renNetwork as RenNetwork | RenNetworkString | RenNetworkDetails,
        );
        if (details.isTestnet && details.name === RenNetwork.DevnetVDot3) {
            return renFantomDevnet;
        }
        throw new Error(`Unsupported network ${details}`);
        // return details.isTestnet
        //     ? details.name === RenNetwork.DevnetVDot3
        //         ? renFantomDevnet
        //         : renFantomTestnet
        //     : renFantomMainnet;
    }
};

export class FantomClass extends EthereumClass {
    public static chain = "Fantom";
    public chain = FantomClass.chain;
    public name = FantomClass.chain;
    public legacyName = undefined;

    public static utils = {
        resolveChainNetwork: resolveFantomNetwork,
        addressIsValid,
        addressExplorerLink: (
            address: EthAddress,
            // TODO: Change the following 4 networks to mainnet.
            network: NetworkInput = renFantomDevnet,
        ): string =>
            `${
                (Fantom.utils.resolveChainNetwork(network) || renFantomDevnet)
                    .etherscan
            }/address/${address}`,

        transactionExplorerLink: (
            transaction: EthTransaction,
            network: NetworkInput = renFantomDevnet,
        ): string =>
            `${
                (Fantom.utils.resolveChainNetwork(network) || renFantomDevnet)
                    .etherscan
            }/tx/${transaction}`,
    };

    public utils = utilsWithChainNetwork(
        FantomClass.utils,
        () => this.renNetworkDetails,
    );

    constructor(
        web3Provider: provider,
        renNetwork:
            | RenNetwork
            | RenNetworkString
            | RenNetworkDetails
            | EthereumConfig,
    ) {
        // To be compatible with the Ethereum chain class, the first parameter
        // is a web3Provider and the second the RenVM network. However,
        super(web3Provider, resolveFantomNetwork(renNetwork));
    }

    initialize = (
        renNetwork: RenNetwork | RenNetworkString | RenNetworkDetails,
    ) => {
        this.renNetworkDetails =
            this.renNetworkDetails ||
            FantomConfigMap[getRenNetworkDetails(renNetwork).name];

        if (!this.renNetworkDetails) {
            throw new Error(
                `Unable to set ${this.name} network for RenVM network ${
                    getRenNetworkDetails(renNetwork).name
                }. Please provide ${this.name} network details to ${
                    this.name
                } constructor.`,
            );
        }
        return this;
    };
}

export type Fantom = FantomClass;
// @dev Removes any static fields, except `utils`.
export const Fantom = Callable(FantomClass);
