import { NumberValue } from "../../utils/value";
import { RenContract } from "../renVM";
import {
    AllParams2, BaseContractCall, ContractCallMultiple, DetailedContractCall, provider,
} from "./common";

export type MintContractCallInline = BaseContractCall | DetailedContractCall;

export type MintContractCall = MintContractCallInline | ContractCallMultiple<DetailedContractCall>;
export type MintContractCallIndividual = MintContractCallInline | { contractCalls?: [DetailedContractCall] };

/*******************************************************************************
 * Option 1: Provide details to generate a gateway address.
 ******************************************************************************/

export type ShiftInFromDetails = MintContractCall & {

    /**
     * The token, including the origin and destination chains
     */
    sendToken: RenContract | "BTC" | "ZEC" | "BCH";

    /**
     * The amount of `sendToken` to be sent
     */
    requiredAmount?: NumberValue | { min?: NumberValue, max?: NumberValue };

    /**
     * An option to override the default nonce generated randomly
     */
    nonce?: string;

    web3Provider?: provider; // A Web3 provider
    /**
     * Allow confirmationless providers to provide the shifted tokens
     * before RenVM has provided a signature, at the cost of a fee.
     * Currently, the the fee's default is a fixed value but may be fetched from
     * various confirmationless providers in the future to get the best price.
     */
    confirmationless?: true;
    confirmationlessFee?: NumberValue;
};

// export type ShiftInFromDetailsStandard = ShiftInFromDetailsCommon & {
//     confirmationless?: false;
// };

// export type ShiftInFromDetailsConfirmationless = ShiftInFromDetailsCommon & { // & MintContractCallIndividual
//     web3Provider: provider; // A Web3 provider
//     /**
//      * Allow confirmationless providers to provide the shifted tokens
//      * before RenVM has provided a signature, at the cost of a fee.
//      * Currently, the the fee's default is a fixed value but may be fetched from
//      * various confirmationless providers in the future to get the best price.
//      */
//     confirmationless?: true;
//     confirmationlessFee?: NumberValue;
// };

// export type ShiftInFromDetails = ShiftInFromDetailsStandard | ShiftInFromDetailsConfirmationless;

/*******************************************************************************
 * Option 2: Recover from a Ren transaction hash.
 ******************************************************************************/

export type ShiftInFromRenTxHash = MintContractCall & {
    renTxHash: string; // Provide the transaction hash returned from RenVM to continue a previous shiftIn.
};

/******************************************************************************/

// `ShiftInParamsAll` is used internally by RenJS.

export type ShiftInParams = ShiftInFromRenTxHash | ShiftInFromDetails;
export type ShiftInParamsAll = AllParams2<ShiftInFromDetails & { sendToken: RenContract }, ShiftInFromRenTxHash> & ContractCallMultiple<DetailedContractCall>;