use anchor_lang::prelude::*;

declare_id!("HmbTLCmaGvZhKnn1Zfa1JVnp7vkMV4DYVxPLWBVoN65L");

/// DID Document entry for an institution.
#[account]
pub struct DidDocument {
    /// The institution's Solana wallet / controller.
    pub controller: Pubkey,
    /// The DID string: "did:sol:<pubkey>".
    pub did: String,
    /// Ed25519 verification public key (32 bytes, stored as base58 string).
    pub verification_key: String,
    /// Unix timestamp of registration.
    pub created_at: i64,
    /// PDA bump.
    pub bump: u8,
}

impl DidDocument {
    // 8 (discriminator) + 32 + 4+64 (did string) + 4+64 (vk string) + 8 + 1
    pub const LEN: usize = 8 + 32 + 68 + 68 + 8 + 1;
}

#[program]
pub mod did_registry {
    use super::*;

    /// Register a new DID for an institution.
    pub fn register_did(
        ctx: Context<RegisterDid>,
        did: String,
        verification_key: String,
    ) -> Result<()> {
        require!(did.starts_with("did:sol:"), DidError::InvalidDid);
        let doc = &mut ctx.accounts.did_document;
        doc.controller = ctx.accounts.controller.key();
        doc.did = did;
        doc.verification_key = verification_key;
        doc.created_at = Clock::get()?.unix_timestamp;
        doc.bump = ctx.bumps.did_document;
        Ok(())
    }

    /// Update the verification key for an existing DID.
    pub fn update_verification_key(
        ctx: Context<UpdateDid>,
        new_verification_key: String,
    ) -> Result<()> {
        ctx.accounts.did_document.verification_key = new_verification_key;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(did: String)]
pub struct RegisterDid<'info> {
    #[account(
        init,
        payer = controller,
        space = DidDocument::LEN,
        seeds = [b"did", controller.key().as_ref()],
        bump
    )]
    pub did_document: Account<'info, DidDocument>,

    #[account(mut)]
    pub controller: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDid<'info> {
    #[account(
        mut,
        seeds = [b"did", controller.key().as_ref()],
        bump = did_document.bump,
        has_one = controller
    )]
    pub did_document: Account<'info, DidDocument>,

    pub controller: Signer<'info>,
}

#[error_code]
pub enum DidError {
    #[msg("DID must start with 'did:sol:'")]
    InvalidDid,
}
