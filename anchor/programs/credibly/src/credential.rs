use anchor_lang::prelude::*;

#[account]
pub struct CredentialAccount {
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
    pub holder_did: String,
    pub ipfs_cid: String,
    pub issued_at: i64,
    pub revoked: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CredentialStatus {
    pub exists: bool,
    pub issuer: Pubkey,
    pub issued_at: i64,
    pub revoked: bool,
    pub ipfs_cid: String,
}

#[derive(Accounts)]
#[instruction(credential_hash: [u8; 32])]
pub struct IssueCredential<'info> {
    #[account(
        init,
        payer = issuer,
        space = 8 + 32 + 32 + 200 + 200 + 8 + 1 + 1,
        seeds = [b"credential", credential_hash.as_ref()],
        bump,
    )]
    pub credential_account: Account<'info, CredentialAccount>,

    #[account(mut)]
    pub issuer: Signer<'info>,

    // Enforce issuer is registered in trust registry
    #[account(
        seeds = [b"institution", issuer.key().as_ref()],
        bump = institution_account.bump,
        constraint = institution_account.tier > 0 @ CrediblyError::UnregisteredIssuer
    )]
    pub institution_account: Account<'info, crate::trust::InstitutionAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(credential_hash: [u8; 32])]
pub struct VerifyCredential<'info> {
    #[account(seeds = [b"credential", credential_hash.as_ref()], bump = credential_account.bump)]
    pub credential_account: Account<'info, CredentialAccount>,
}

pub fn issue(
    ctx: Context<IssueCredential>,
    credential_hash: [u8; 32],
    ipfs_cid: String,
    holder_did: String,
) -> Result<()> {
    let account = &mut ctx.accounts.credential_account;
    let clock = Clock::get()?;
    account.credential_hash = credential_hash;
    account.issuer = ctx.accounts.issuer.key();
    account.holder_did = holder_did;
    account.ipfs_cid = ipfs_cid;
    account.issued_at = clock.unix_timestamp;
    account.revoked = false;
    account.bump = ctx.bumps.credential_account;
    emit!(CredentialIssued {
        credential_hash,
        issuer: ctx.accounts.issuer.key(),
        timestamp: clock.unix_timestamp,
    });
    Ok(())
}

pub fn verify(ctx: Context<VerifyCredential>, _credential_hash: [u8; 32]) -> Result<CredentialStatus> {
    let account = &ctx.accounts.credential_account;
    Ok(CredentialStatus {
        exists: true,
        issuer: account.issuer,
        issued_at: account.issued_at,
        revoked: account.revoked,
        ipfs_cid: account.ipfs_cid.clone(),
    })
}

#[event]
pub struct CredentialIssued {
    pub credential_hash: [u8; 32],
    pub issuer: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum CrediblyError {
    #[msg("Institution not in trust registry")]
    UnregisteredIssuer,
}
