use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Stores a revocation record for a single credential (cNFT).
/// One PDA per mint address.
#[account]
pub struct RevocationRecord {
    /// The cNFT mint address for the credential.
    pub mint_address: Pubkey,
    /// Whether this credential has been revoked.
    pub is_revoked: bool,
    /// Who issued the revocation (institution wallet).
    pub revoked_by: Pubkey,
    /// Unix timestamp of revocation (0 if not revoked).
    pub revoked_at: i64,
    /// Bump seed for the PDA.
    pub bump: u8,
}

impl RevocationRecord {
    pub const LEN: usize = 8 + 32 + 1 + 32 + 8 + 1;
}

#[program]
pub mod revocation_registry {
    use super::*;

    /// Register a new credential in the revocation registry (not revoked by default).
    pub fn register_credential(ctx: Context<RegisterCredential>, mint_address: Pubkey) -> Result<()> {
        let record = &mut ctx.accounts.revocation_record;
        record.mint_address = mint_address;
        record.is_revoked = false;
        record.revoked_by = Pubkey::default();
        record.revoked_at = 0;
        record.bump = ctx.bumps.revocation_record;
        Ok(())
    }

    /// Revoke a credential. Only the institution signer can call this.
    pub fn revoke_credential(ctx: Context<RevokeCredential>) -> Result<()> {
        let record = &mut ctx.accounts.revocation_record;
        require!(!record.is_revoked, RevocationError::AlreadyRevoked);
        record.is_revoked = true;
        record.revoked_by = ctx.accounts.authority.key();
        record.revoked_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(mint_address: Pubkey)]
pub struct RegisterCredential<'info> {
    #[account(
        init,
        payer = authority,
        space = RevocationRecord::LEN,
        seeds = [b"revocation", mint_address.as_ref()],
        bump
    )]
    pub revocation_record: Account<'info, RevocationRecord>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    #[account(
        mut,
        seeds = [b"revocation", revocation_record.mint_address.as_ref()],
        bump = revocation_record.bump
    )]
    pub revocation_record: Account<'info, RevocationRecord>,

    pub authority: Signer<'info>,
}

#[error_code]
pub enum RevocationError {
    #[msg("This credential has already been revoked.")]
    AlreadyRevoked,
}
