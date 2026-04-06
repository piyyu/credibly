pragma circom 2.0.0;
include "node_modules/circomlib/circuits/poseidon.circom";

template CredentialProof() {
    // Private — never revealed to verifier
    signal input credentialHashLow;
    signal input credentialHashHigh;
    signal input gpa100;          // GPA x 100, e.g. 380 = 3.80
    signal input salt;

    // Public — shared with verifier
    signal output commitment;

    component hasher = Poseidon(4);
    hasher.inputs[0] <== credentialHashLow;
    hasher.inputs[1] <== credentialHashHigh;
    hasher.inputs[2] <== gpa100;
    hasher.inputs[3] <== salt;

    commitment <== hasher.out;
}

component main { public [credentialHashLow, credentialHashHigh] } = CredentialProof();
