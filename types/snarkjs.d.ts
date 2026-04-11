declare module "snarkjs" {
    export const groth16: {
        fullProve(input: object, wasmPath: string, zkeyPath: string): Promise<unknown>;
        verify(vKey: object, publicSignals: string[], proof: object): Promise<boolean>;
    };
}
