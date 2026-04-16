const { AnchorProvider, Program } = require("@coral-xyz/anchor");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const idl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../lib/solana/idl/credibly.json"), "utf-8"));

async function main() {
  const keypairPath = path.resolve(process.env.HOME, ".config/solana/id.json");
  const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf-8")));
  const authority = Keypair.fromSecretKey(secretKey);

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = {
    publicKey: authority.publicKey,
    signTransaction: async (tx) => { tx.partialSign(authority); return tx; },
    signAllTransactions: async (txs) => { txs.forEach(tx => tx.partialSign(authority)); return txs; },
  };

  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  const program = new Program(idl, provider);

  // 1. Register the CLI wallet as an institution (just in case)
  try {
    await program.methods
      .registerInstitution("CLI Institution", 1, `did:sol:${authority.publicKey.toBase58()}`)
      .accounts({
        institution: authority.publicKey,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
    console.log("Registered CLI wallet as institution.");
  } catch(e) {
    // ignore if already registered
  }

  // 2. Issue a mock credential
  const vc = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "AcademicCredential"],
    issuer: `did:sol:${authority.publicKey.toBase58()}`,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: "did:sol:cli-test-run-" + Date.now(),
      degree: "Test",
      institution: "CLI",
      graduationYear: 2026,
    },
  };

  const sorted = JSON.stringify(vc, Object.keys(vc).sort());
  const credentialHashHex = crypto.createHash("sha256").update(sorted).digest("hex");
  const credentialHash = Buffer.from(credentialHashHex, "hex");

  console.log("Submitting issue transaction...");
  try {
    const txSig = await program.methods
      .issueCredential(
        Array.from(credentialHash),
        "test_cid123",
        vc.credentialSubject.id
      )
      .accounts({ issuer: authority.publicKey })
      .signers([authority])
      .rpc();

    console.log("✅ Success! TX:", txSig);
  } catch (err) {
    console.error("❌ Failed:", err);
  }
}

main();
