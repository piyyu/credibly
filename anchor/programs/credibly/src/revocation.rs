use anchor_lang::prelude::*;
use crate::credential::CredentialAccount;

#[derive(Accounts)]
#[instruction(credential_hash: [u8; 32])]
pub struct RevokeCredential<'info> {
    #[account(
        mut,
        seeds = [b"credential", &credential_hash],
        bump = credential_account.bump,
        constraint = credential_account.issuer == issuer.key() @ RevokeError::Unauthorized,
        constraint = !credential_account.revoked @ RevokeError::AlreadyRevoked,
    )]
    pub credential_account: Account<'info, CredentialAccount>,
    pub issuer: Signer<'info>,
}

pub fn revoke(ctx: Context<RevokeCredential>, credential_hash: [u8; 32], reason: String) -> Result<()> {
    ctx.accounts.credential_account.revoked = true;
    emit!(CredentialRevoked {
        credential_hash,
        issuer: ctx.accounts.issuer.key(),
        reason,
        timestamp: Clock::get()?.unix_timestamp,
    });
    Ok(())
}

#[event]
pub struct CredentialRevoked {
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
    pub reason: String,
    pub timestamp: i64,
}

#[error_code]
pub enum RevokeError {
    #[msg("Only the original issuer can revoke")]
    Unauthorized,
    #[msg("Already revoked")]
    AlreadyRevoked,
}
