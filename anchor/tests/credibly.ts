import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Credibly } from "../target/types/credibly";
import { assert } from "chai";
import * as crypto from "crypto";

describe("credibly", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Credibly as Program<Credibly>;
  const provider = anchor.getProvider() as anchor.AnchorProvider;

  // Derive PDAs
  const [instPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("institution"), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  const hash = Array.from(crypto.createHash("sha256").update("test-vc").digest());
  const [credPDA] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("credential"), Buffer.from(hash)],
    program.programId
  );

  it("registers institution", async () => {
    await program.methods
      .registerInstitution("IIT Delhi", 1, "did:sol:iit-delhi")
      .accounts({
        institution: provider.wallet.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();
    const account = await program.account.institutionAccount.fetch(instPDA);
    assert.equal(account.name, "IIT Delhi");
    assert.equal(account.tier, 1);
  });

  it("issues credential", async () => {
    await program.methods
      .issueCredential(hash, "QmTestCID123", "did:sol:student-001")
      .accounts({
        issuer: provider.wallet.publicKey,
      })
      .rpc();
    const account = await program.account.credentialAccount.fetch(credPDA);
    assert.isFalse(account.revoked);
    assert.equal(account.ipfsCid, "QmTestCID123");
  });

  it("verifies credential", async () => {
    const status = await program.methods
      .verifyCredential(hash)
      .accounts({})
      .view();
    assert.isTrue(status.exists);
    assert.isFalse(status.revoked);
    assert.equal(status.ipfsCid, "QmTestCID123");
  });

  it("revokes credential", async () => {
    await program.methods
      .revokeCredential(hash, "Misconduct discovered")
      .accounts({
        issuer: provider.wallet.publicKey,
      })
      .rpc();
    const account = await program.account.credentialAccount.fetch(credPDA);
    assert.isTrue(account.revoked);
  });
});
