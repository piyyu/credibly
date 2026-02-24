use anchor_lang::prelude::*;

declare_id!("F4wFketKAQzZUTcHLET6QtRz9DYejhKVVdwwSLFcGB8C");

#[program]
pub mod credential_registry {
    use super::*;

    pub fn issue_credential(
        ctx: Context<IssueCredential>,
        hash: [u8; 32],
        recipient: Pubkey,
        credential_type: u8,
    ) -> Result<()> {
        require!(
            credential_type <= 4,
            CredentialError::InvalidCredentialType
        );
        let credential = &mut ctx.accounts.credential;
        credential.issuer = ctx.accounts.issuer.key();
        credential.recipient = recipient;
        credential.hash = hash;
        credential.issued_at = Clock::get()?.unix_timestamp;
        credential.credential_type = credential_type;
        credential.revoked = false;
        Ok(())
    }

    pub fn revoke_credential(ctx: Context<RevokeCredential>, hash: [u8; 32]) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        require!(
            credential.issuer == ctx.accounts.issuer.key(),
            CredentialError::UnauthorizedRevocation
        );
        credential.revoked = true;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(hash: [u8; 32])]
pub struct IssueCredential<'info> {
    #[account(
        init,
        payer = issuer,
        space = Credential::SPACE,
        seeds = [b"credential", hash.as_ref()],
        bump
    )]
    pub credential: Account<'info, Credential>,
    #[account(mut)]
    pub issuer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(hash: [u8; 32])]
pub struct RevokeCredential<'info> {
    #[account(
        mut,
        seeds = [b"credential", hash.as_ref()],
        bump
    )]
    pub credential: Account<'info, Credential>,
    pub issuer: Signer<'info>,
}

/// On-chain credential record with full metadata.
///
/// Layout (Borsh-serialized, field order):
///   [0..7]     discriminator   (8 bytes)
///   [8..39]    issuer           (32 bytes — Pubkey)
///   [40..71]   recipient        (32 bytes — Pubkey)
///   [72..103]  hash             (32 bytes — [u8; 32])
///   [104..111] issued_at        (8 bytes  — i64 unix timestamp)
///   [112]      credential_type  (1 byte   — u8 enum 0-4)
///   [113]      revoked          (1 byte   — bool)
///   Total: 114 bytes
#[account]
pub struct Credential {
    pub issuer: Pubkey,        // 32
    pub recipient: Pubkey,     // 32
    pub hash: [u8; 32],        // 32
    pub issued_at: i64,        // 8
    pub credential_type: u8,   // 1  (0=Diploma, 1=Certificate, 2=Transcript, 3=License, 4=Other)
    pub revoked: bool,         // 1
}

impl Credential {
    /// 8 (discriminator) + 32 + 32 + 32 + 8 + 1 + 1 = 114
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + 1 + 1;
}

#[error_code]
pub enum CredentialError {
    #[msg("Only the original issuer can revoke this credential.")]
    UnauthorizedRevocation,
    #[msg("Invalid credential type. Must be 0–4 (Diploma, Certificate, Transcript, License, Other).")]
    InvalidCredentialType,
}
