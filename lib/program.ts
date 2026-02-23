import { Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idlFile from "../target/idl/credential_registry.json";

export const PROGRAM_ID = new PublicKey(idlFile.address);
export const PROGRAM_IDL: Idl = idlFile as any;

export const deriveCredentialPDA = (hashBuffer: Uint8Array): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), hashBuffer],
    PROGRAM_ID
  )[0];
};

export type CredentialRegistry = {
  "address": "E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU",
  "metadata": {
    "name": "credential_registry",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  // we omit the rest of the types for simplicity, we mostly need the idl object itself
};
