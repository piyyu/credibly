const anchor = require("@coral-xyz/anchor");

describe("credential_registry", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  it("Is initialized!", async () => {
    // Add your test here.
    const program = anchor.workspace.credentialRegistry;
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
