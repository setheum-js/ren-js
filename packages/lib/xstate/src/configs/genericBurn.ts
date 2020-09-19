import { BurnMachineContext, BurnMachineEvent } from "../machines/burn";
import { LockChain, MintChain } from "@renproject/interfaces";
import { Bitcoin, Ethereum } from "@renproject/chains";
import { RenNetwork } from "@renproject/interfaces";
import BigNumber from "bignumber.js";
import { GatewaySession } from "../types/transaction";
import { Sender, MachineOptions, Receiver } from "xstate";

export const burnChainMap: BurnMachineContext["fromChainMap"] = {
    ethereum: (context): MintChain<any> => {
        return Ethereum(context.providers.ethereum, RenNetwork.Testnet).Account(
            {
                address: context.tx.userAddress,
                value: context.tx.suggestedAmount,
            }
        ) as MintChain<any>;
    },
};

export const releaseChainMap: BurnMachineContext["toChainMap"] = {
    bitcoin: (context): LockChain => {
        return Bitcoin().Address(context.tx.destAddress) as any;
    },
};

const burnAndRelease = async (context: BurnMachineContext) => {
    const txHash = Object.keys(context.tx.transactions)[0];
    return await context.sdk.burnAndRelease({
        asset: "BTC",
        to: context.toChainMap[context.tx.destNetwork](context),
        from: context.fromChainMap[context.tx.sourceNetwork](context),
        ...(txHash ? { txHash } : {}),
    });
};

// Format a transaction and prompt the user to sign
const txCreator = async (
    context: BurnMachineContext
): Promise<GatewaySession> => {
    const asset = context.tx.sourceAsset;

    const fees = await context.sdk.getFees();
    const suggestedAmount = new BigNumber(
        Math.floor(
            fees[asset.toLowerCase()].release +
                Number(context.tx.targetAmount) * 1e8
        )
    )
        .decimalPlaces(0)
        .toFixed();

    const newTx: GatewaySession = {
        ...context.tx,
        suggestedAmount,
    };
    context.tx = newTx;

    const burn = await burnAndRelease(context);
    // We immediately submit the burn request
    const hash: string = await new Promise(async (resolve, reject) => {
        try {
            await burn
                .burn()
                .on("transactionHash", (hash: string) => resolve(hash));
        } catch (e) {
            reject(e);
        }
    });

    return {
        ...newTx,
        transactions: {
            [hash]: {
                sourceTxHash: hash,
                sourceTxConfs: 0,
                sourceTxAmount: Number(suggestedAmount),
                rawSourceTx: {},
            },
        },
    };
};

const burnTransactionListener = (context: BurnMachineContext) => (
    callback: Sender<BurnMachineEvent>,
    _receive: Receiver<any>
) => {
    const cleaners: Array<() => void> = [];
    burnAndRelease(context).then(async (burn) => {
        let confirmations = 0;
        const tx = Object.values(context.tx.transactions)[0];
        const burnRef = burn.burn({
            txHash: Object.keys(context.tx.transactions)[0],
        });

        const burnListener = (confs: number) => {
            confirmations = confs;
            callback({
                type: "CONFIRMATION",
                data: { ...tx, sourceTxConfs: confs },
            });
        };
        cleaners.push(() => {
            burnRef._cancel();
            burnRef.removeListener("confirmation", burnListener);
        });

        await burnRef
            ?.on("confirmation", burnListener)
            .catch((error) => callback({ type: "BURN_ERROR", data: error }));

        const releaseListener = (status: string) =>
            status === "confirming"
                ? console.log(`confirming (${confirmations}/15)`)
                : console.log(status);

        const hashListener = (hash: string) => console.log("hash", hash);

        const releaseRef = burn.release();
        cleaners.push(() => {
            releaseRef._cancel();
            releaseRef.removeListener("status", releaseListener);
            releaseRef.removeListener("txHash", hashListener);
        });

        await releaseRef
            .on("status", releaseListener)
            .on("txHash", hashListener)
            .catch((error) => callback({ type: "RELEASE_ERROR", data: error }));
    });

    return () => {
        for (let i of cleaners) {
            i();
        }
    };
};

export const burnConfig: Partial<MachineOptions<
    BurnMachineContext,
    BurnMachineEvent
>> = {
    services: {
        burnCreator: txCreator,
        burnListener: burnTransactionListener,
    },
};
