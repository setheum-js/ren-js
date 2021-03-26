import { Script } from "./script";

const gatewayScript = (gGubKeyHash: Buffer, gHash: Buffer): Script =>
    new Script()
        .addData(gHash)
        .addOp(Script.OP.OP_DROP)
        .addOp(Script.OP.OP_DUP)
        .addOp(Script.OP.OP_HASH160)
        .addData(gGubKeyHash)
        .addOp(Script.OP.OP_EQUALVERIFY)
        .addOp(Script.OP.OP_CHECKSIG);

export const createAddress = (addressToString: (address: Buffer) => string) => (
    gGubKeyHash: Buffer,
    gHash: Buffer,
    prefix: Buffer,
): string =>
    addressToString(gatewayScript(gGubKeyHash, gHash).toAddress(prefix));

export const pubKeyScript = (gGubKeyHash: Buffer, gHash: Buffer) =>
    gatewayScript(gGubKeyHash, gHash).toScriptHashOut();
