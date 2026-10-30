import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

import { createMint, getMint } from "@solana/spl-token";
import { readFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { PublicKey } from "@solana/web3.js";

import {
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
  getAccount,
} from "@solana/spl-token";

// Connect to Solana Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load our existing Solana CLI wallet
const walletPath = join(homedir(), ".config/solana/id.json");

const secretKey = JSON.parse(readFileSync(walletPath, "utf8"));

const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));

async function main() {
  const mint = new PublicKey("8UeLzTVCiDS36niFCaSkgjSjrbivsNp9pruvGbtXnMQZ");

  // Create or retrieve our token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
  );

  console.log("Token Account:", tokenAccount.address.toBase58());

  // Mint 1,000 tokens (9 decimals)
  const amount = 1000n * 10n ** 9n;

  const signature = await mintToChecked(
    connection,
    wallet,
    mint,
    tokenAccount.address,
    wallet,
    amount,
    9,
  );

  console.log("Transaction:", signature);

  // Verify token balance
  const account = await getAccount(connection, tokenAccount.address);

  console.log("Token Balance:", Number(account.amount) / 1e9);
}

main().catch(console.error);
