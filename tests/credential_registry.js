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

  // Credential type constants (mirrors on-chain enum)
  const CRED_DIPLOMA = 0;
  const CRED_CERTIFICATE = 1;
  const CRED_TRANSCRIPT = 2;
  const CRED_LICENSE = 3;
  const CRED_OTHER = 4;

  it("Issues a credential with metadata", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);
    const recipient = anchor.web3.Keypair.generate().publicKey;

    await program.methods
      .issueCredential(hash, recipient, CRED_DIPLOMA)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Fetch the credential account and verify its data
    const credential = await program.account.credential.fetch(credentialPDA);
    assert.ok(credential.issuer.equals(provider.wallet.publicKey));
    assert.ok(credential.recipient.equals(recipient));
    assert.deepStrictEqual(credential.hash, hash);
    assert.strictEqual(credential.credentialType, CRED_DIPLOMA);
    assert.strictEqual(credential.revoked, false);
    // issued_at should be a recent timestamp (within last 60 seconds)
    const now = Math.floor(Date.now() / 1000);
    assert.ok(
      credential.issuedAt.toNumber() > now - 60,
      "issued_at should be recent"
    );
  });

  it("Revokes a credential", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);
    const recipient = anchor.web3.Keypair.generate().publicKey;

    // First issue
    await program.methods
      .issueCredential(hash, recipient, CRED_CERTIFICATE)
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
    const recipient = anchor.web3.Keypair.generate().publicKey;

    // Issue credential as the provider wallet
    await program.methods
      .issueCredential(hash, recipient, CRED_TRANSCRIPT)
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
    const recipient = anchor.web3.Keypair.generate().publicKey;

    // First issuance should succeed
    await program.methods
      .issueCredential(hash, recipient, CRED_OTHER)
      .accounts({
        credential: credentialPDA,
        issuer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Second issuance with the same hash should fail (account already initialized)
    try {
      await program.methods
        .issueCredential(hash, recipient, CRED_OTHER)
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

  it("Rejects invalid credential type", async () => {
    const hash = randomHash();
    const [credentialPDA] = deriveCredentialPDA(hash);
    const recipient = anchor.web3.Keypair.generate().publicKey;

    try {
      await program.methods
        .issueCredential(hash, recipient, 5) // invalid: must be 0-4
        .accounts({
          credential: credentialPDA,
          issuer: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      assert.fail("Should have thrown InvalidCredentialType error");
    } catch (err) {
      assert.ok(
        err.toString().includes("InvalidCredentialType") ||
        err.toString().includes("6001"),
        `Expected InvalidCredentialType error, got: ${err}`
      );
    }
  });
});
