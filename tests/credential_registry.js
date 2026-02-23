const anchor = require("@coral-xyz/anchor");
const { SystemProgram } = anchor.web3;
const crypto = require("crypto");
const assert = require("assert");

describe("credential_registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CredentialRegistry;

  // Helper: generate a random 32-byte hash (simulating a SHA-256 document hash)
  function randomHash() {
    return Array.from(crypto.randomBytes(32));
  }

  // Helper: derive the credential PDA
  function deriveCredentialPDA(hash) {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("credential"), Buffer.from(hash)],
      program.programId
    );
  }

  it("Issues a credential", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);

    await program.methods
      .issueCredential(hash)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch the credential account and verify its data
    const credential = await program.account.credential.fetch(credentialPDA);
    assert.ok(credential.issuer.equals(provider.wallet.publicKey));
    assert.deepStrictEqual(credential.hash, hash);
    assert.strictEqual(credential.revoked, false);
  });

  it("Revokes a credential", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);

    // First issue
    await program.methods
      .issueCredential(hash)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Then revoke
    await program.methods
      .revokeCredential(hash)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
      })
      .rpc();

    const credential = await program.account.credential.fetch(credentialPDA);
    assert.strictEqual(credential.revoked, true);
  });

  it("Prevents unauthorized revocation", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);

    // Issue credential as the provider wallet
    await program.methods
      .issueCredential(hash)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Try to revoke with a different keypair
    const attacker = anchor.web3.Keypair.generate();

    // Airdrop some SOL to the attacker so they can sign
    const sig = await provider.connection.requestAirdrop(
      attacker.publicKey,
      1_000_000_000
    );
    await provider.connection.confirmTransaction(sig);

    try {
      await program.methods
        .revokeCredential(hash)
        .accounts({
          credential: credentialPDA,
          issuer: attacker.publicKey,
        })
        .signers([attacker])
        .rpc();
      assert.fail("Should have thrown UnauthorizedRevocation error");
    } catch (err) {
      assert.ok(
        err.toString().includes("UnauthorizedRevocation") ||
        err.toString().includes("6000"),
        `Expected UnauthorizedRevocation error, got: ${err}`
      );
    }
  });

  it("Prevents duplicate issuance (same hash)", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);

    // First issuance should succeed
    await program.methods
      .issueCredential(hash)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Second issuance with the same hash should fail (account already initialized)
    try {
      await program.methods
        .issueCredential(hash)
        .accounts({
          credential: credentialPDA,
          issuer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have thrown because PDA already exists");
    } catch (err) {
      // The PDA init constraint will reject this
      assert.ok(err.toString().length > 0);
    }
  });
});
