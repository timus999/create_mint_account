use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    pubkey::Pubkey,
};
use spl_token::instruction as token_instruction;

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Accounts we expect:
    let payer = next_account_info(accounts_iter)?; // payer of rent
    let mint = next_account_info(accounts_iter)?; // new mint account
    let rent_sysvar = next_account_info(accounts_iter)?; // Rent sysvar
    let token_program = next_account_info(accounts_iter)?; // SPL Token Program

    // Example mint authority = payer for simplicity
    let mint_authority = payer.key;

    // Create initialize_mint instruction
    let ix = token_instruction::initialize_mint(
        token_program.key, // token program
        mint.key,          // mint account
        mint_authority,    // authority who can mint tokens
        None,              // optional freeze authority
        9,                 // decimals (like 9 = same as SOL)
    )?;

    // CPI into the SPL Token Program
    invoke(
        &ix,
        &[mint.clone(), rent_sysvar.clone(), token_program.clone()],
    )?;

    msg!("Mint initialized successfully!");
    Ok(())
}
