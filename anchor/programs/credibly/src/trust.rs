use anchor_lang::prelude::*;

#[account]
pub struct InstitutionAccount {
    pub authority: Pubkey,
    pub institution: Pubkey,
    pub name: String,
    pub tier: u8,        // 1 = UGC-accredited, 2 = training provider
    pub did: String,
    pub registered_at: i64,
    pub bump: u8,
}

#[derive(Accounts)]
pub struct RegisterInstitution<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 200 + 1 + 200 + 8 + 1,
        seeds = [b"institution", institution.key().as_ref()],
        bump,
    )]
    pub institution_account: Account<'info, InstitutionAccount>,

    /// CHECK: Institution wallet being registered
    pub institution: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register(ctx: Context<RegisterInstitution>, name: String, tier: u8, did: String) -> Result<()> {
    let account = &mut ctx.accounts.institution_account;
    account.authority = ctx.accounts.authority.key();
    account.institution = ctx.accounts.institution.key();
    account.name = name;
    account.tier = tier;
    account.did = did;
    account.registered_at = Clock::get()?.unix_timestamp;
    account.bump = ctx.bumps.institution_account;
    Ok(())
}
