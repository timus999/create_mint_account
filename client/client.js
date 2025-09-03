import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("9VPW6tY8235Ng4Pr2eHg5d6txGPRZTi4MhX3x1j9skfz");
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

(async () => {
  const payer = Keypair.generate();

  // Fund payer
  let sig = await connection.requestAirdrop(payer.publicKey, 2e9);
  await connection.confirmTransaction(sig);

  // Create new mint account
  const mint = Keypair.generate();
  const lamportsForMint = await connection.getMinimumBalanceForRentExemption(82);

  const createMintIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint.publicKey,
    space: 82,
    lamports: lamportsForMint,
    programId: TOKEN_PROGRAM_ID,
  });

  // Call your custom program instruction
  const instruction = new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: mint.publicKey, isSigner: true, isWritable: true },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(0), // empty instruction data
  });

  const tx = new Transaction().add(createMintIx, instruction);
  await sendAndConfirmTransaction(connection, tx, [payer, mint]);

  console.log("✅ Mint initialized via your program:", mint.publicKey.toBase58());
})();
