use anchor_lang::prelude::*;

declare_id!("E4LCAmhHxUgViNTw8DKQ7kiikdnx5bVUSv9s6KGLuqkU");

#[program]
pub mod credential_registry {
    use super::*;

    pub fn issue_credential(ctx: Context<IssueCredential>, hash: [u8; 32]) -> Result<()> {
        let credential = &mut ctx.accounts.credential;
        credential.issuer = ctx.accounts.issuer.key();
        credential.hash = hash;
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
        space = 8 + 80, // Safe allocation (8 discriminator + 32 issuer + 32 hash + 1 bool = 73 bytes real data)
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

#[account]
pub struct Credential {
    pub issuer: Pubkey,
    pub hash: [u8; 32],
    pub revoked: bool,
}

#[error_code]
pub enum CredentialError {
    #[msg("Only the original issuer can revoke this credential.")]
    UnauthorizedRevocation,
}
