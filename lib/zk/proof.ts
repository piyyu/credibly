import * as snarkjs from "snarkjs";

export async function generateCredentialProof(input: {
  credentialHashLow: bigint;
  credentialHashHigh: bigint;
  gpa100: bigint;
  salt: bigint;
}) {
  return snarkjs.groth16.fullProve(
    input,
    "/circuits/credentialProof.wasm",
    "/circuits/cred_final.zkey"
  );
}

export async function verifyCredentialProof(proof: object, publicSignals: string[]): Promise<boolean> {
  const vKey = await fetch("/circuits/verification_key.json").then((r) => r.json());
  return snarkjs.groth16.verify(vKey, publicSignals, proof);
}
