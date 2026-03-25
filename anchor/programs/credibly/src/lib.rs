use anchor_lang::prelude::*;

pub mod credential;
pub mod revocation;
pub mod trust;

use credential::*;
use revocation::*;
use trust::*;

declare_id!("7hcwWetbM2Xhdk9Tev5cWSEPzijFqmzy6TFYdbEq8nCr");

#[program]
pub mod credibly {
    use super::*;

    pub fn issue_credential(
        ctx: Context<IssueCredential>,
        credential_hash: [u8; 32],
        ipfs_cid: String,
        holder_did: String,
    ) -> Result<()> {
        credential::issue(ctx, credential_hash, ipfs_cid, holder_did)
    }

    pub fn verify_credential(
        ctx: Context<VerifyCredential>,
        credential_hash: [u8; 32],
    ) -> Result<CredentialStatus> {
        credential::verify(ctx, credential_hash)
    }

    pub fn revoke_credential(
        ctx: Context<RevokeCredential>,
        credential_hash: [u8; 32],
        reason: String,
    ) -> Result<()> {
        revocation::revoke(ctx, credential_hash, reason)
    }

    pub fn register_institution(
        ctx: Context<RegisterInstitution>,
        name: String,
        tier: u8,
        did: String,
    ) -> Result<()> {
        trust::register(ctx, name, tier, did)
    }
}
