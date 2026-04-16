const { AnchorProvider, Program } = require("@coral-xyz/anchor");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");

const idl = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../lib/solana/idl/credibly.json"), "utf-8"));
const INSTITUTION_PUBKEY = new PublicKey("733z2zxFRK651ZGPYRpJyfW1K4VD94ss4jYyixLs8xgF");

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

  console.log("Authority (payer):", authority.publicKey.toBase58());
  console.log("Institution wallet:", INSTITUTION_PUBKEY.toBase58());

  try {
    const txSig = await program.methods
      .registerInstitution("Credibly Demo Institution", 1, `did:sol:${INSTITUTION_PUBKEY.toBase58()}`)
      .accounts({
        institution: INSTITUTION_PUBKEY,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    console.log("✅ Institution registered!");
    console.log("TX:", txSig);
    console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
  } catch (err) {
    if (err.message?.includes("already in use")) {
      console.log("ℹ️  Already registered.");
    } else {
      console.error("❌ Failed:", err.message);
    }
  }
}

main();
