import Bundlr from "@bundlr-network/client";
import type { VerifiableCredential } from "../ipfs/upload";

// ---------------------------------------------------------------------------
// Env validation
// ---------------------------------------------------------------------------
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Bundlr / Arweave client
// ---------------------------------------------------------------------------
let _bundlr: Bundlr | null = null;

function getBundlrClient(): Bundlr {
  if (_bundlr) return _bundlr;

  const privateKey = requireEnv("ARWEAVE_WALLET_KEY");
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

  _bundlr = new Bundlr(
    "https://node1.bundlr.network",  // Bundlr node
    "solana",                         // currency — pay with SOL
    privateKey,
    { providerUrl: rpcUrl }
  );
  return _bundlr;
}

// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------
async function withRetry<T>(
  fn: () => Promise<T>,
  { maxRetries = 3, baseDelayMs = 500, label = "operation" } = {}
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[Arweave] ${label} failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms…`,
          lastError.message
        );
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw new Error(
    `[Arweave] ${label} failed after ${maxRetries} attempts: ${lastError?.message}`
  );
}

// ---------------------------------------------------------------------------
// Arweave operations
// ---------------------------------------------------------------------------

/**
 * Upload a Verifiable Credential to Arweave via Bundlr.
 * Returns the Arweave transaction ID. Data is permanent and immutable.
 * Retries up to 3 times with exponential backoff.
 */
export async function uploadCredentialToArweave(
  vc: VerifiableCredential
): Promise<string> {
  return withRetry(
    async () => {
      const bundlr = getBundlrClient();
      const data = JSON.stringify(vc);

      // Check cost and fund if necessary
      const size = Buffer.byteLength(data, "utf-8");
      const price = await bundlr.getPrice(size);
      const balance = await bundlr.getLoadedBalance();

      if (balance.isLessThan(price)) {
        // Auto-fund with 1.5x the required amount for headroom
        const fundAmount = price.multipliedBy(1.5).integerValue();
        console.log(
          `[Arweave] Funding Bundlr with ${fundAmount.toString()} lamports…`
        );
        await bundlr.fund(fundAmount);
      }

      const response = await bundlr.upload(data, {
        tags: [
          { name: "Content-Type", value: "application/json" },
          { name: "App-Name", value: "Credibly" },
          { name: "Type", value: "VerifiableCredential" },
        ],
      });

      return response.id;
    },
    { label: "uploadCredentialToArweave" }
  );
}

/**
 * Fetch a Verifiable Credential from Arweave by transaction ID.
 * Retries up to 3 times with exponential backoff.
 */
export async function fetchCredentialFromArweave(
  txId: string
): Promise<VerifiableCredential> {
  const gateway = process.env.ARWEAVE_GATEWAY ?? "https://arweave.net";
  return withRetry(
    async () => {
      const res = await fetch(`${gateway}/${txId}`);
      if (!res.ok) {
        throw new Error(
          `Arweave fetch failed (${res.status}): ${res.statusText}`
        );
      }
      return res.json() as Promise<VerifiableCredential>;
    },
    { label: "fetchCredentialFromArweave" }
  );
}
