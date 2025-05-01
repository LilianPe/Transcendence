
// FILE TO INTERACT WITH THE DEPLOYED SMART CONTRACT ON FUJI

/*
SC means Smart Contract

list of view functions :
getPlayers(uint tournament_id)
getScores(uint tournament_id)
getTime(uint tournament_id)

getStatusInBlockchain() : utilitaire pour voir l'etat dans la blockchain

list of onlyOwner functions :
x !!! THEY COST GAS FEES !!! x
addTournament(uint[] _players, uint[] _scores)
removeTournament( uint tournament_id )
clearALL()

*/

import * as dotenv from "dotenv"; // pour get le .env
import { ethers } from "ethers"; // pour interagir avec des SC

// MODULES to read JSON (because changing tsconfig.json would break all the project)
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { Contract, Wallet,  } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const contractJson = JSON.parse(readFileSync(join('/app/src/Blockchain/TournamentScores.json'), 'utf-8'));


dotenv.config();

let PRIVATE_KEY = process.env.METAMASK_KEY;
const CONTRACT_ADDRESS = "0x8440a11d49af29b2E0aED5dD485D0b0848bCB9fe";
const ABI = contractJson.abi;

let wallet: Wallet | undefined;
let provider;
let contract: Contract;

if (PRIVATE_KEY)
{
	provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc"); // Fuji testnet
	wallet = new ethers.Wallet(PRIVATE_KEY, provider);
	contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
}

if (!PRIVATE_KEY)
{
	PRIVATE_KEY="0x0";
	console.log("Clé privée Metamask non définie dans .env (METAMASK_KEY)");

    provider = new ethers.providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    console.log("✅ Contract connected in read-only mode");
}

//. VIEW FUNCTIONS :

// returns an empty array if tournament_id is invalid
export async function SC_getPlayers( tournament_id: number )
{
	console.log("calling getPlayers() from Blockchain SC");
	try
	{
		const players: number[] = await contract.getPlayers(tournament_id);
		console.log("Liste des joueurs (ids) :", players);
		return players;
	}
	catch (error)
	{
		console.error("Error in Smart Contract call :", error);

		// throw error;
		return []; // anti crash
	}
}

// returns an empty array if tournament_id is invalid
export async function SC_getScores( tournament_id: number )
{
	console.log("calling getScores() from Blockchain SC");
	try
	{
		const scores: number[] = await contract.getScores(tournament_id);
		console.log("Liste des scores :", scores);
		return scores;
	}
	catch (error)
	{
		console.error("Error in Smart Contract call :", error);

		// throw error;
		return []; // anti crash
	}
}

// returns -1 if tournament_id is invalid
export async function SC_getTime( tournament_id: number )
{
	console.log("calling getTime() from Blockchain SC");
	try
	{
		const time: number = await contract.getTime(tournament_id);
		console.log("Time :", time);
		return time;
	}
	catch (error)
	{
		console.error("Error in Smart Contract call :", error);

		// throw error;
		return -1; // anti crash
	}
}

// utilitaire pour voir l'etat dans la blockchain
export async function getStatusInBlockchain( tournaments_count: number )
{
	console.log("WHAT IS IN THE BLOCKCHAIN :");

	console.log("");
	console.log( tournaments_count );
	SC_getPlayers( tournaments_count );
	SC_getScores( tournaments_count );
	SC_getTime( tournaments_count );

	console.log("");
}

//. onlyOwner FUNCTIONS

export async function SC_addTournament( players: number[], scores: number[] )
{
	console.log("Calling addTournament() from Blockchain SC");

    if (!contract.signer || !contract.signer._isSigner) {
        console.error("❌ Cannot call addTournament(): No wallet (signer) connected.");
        return null;
    }

	try
	{
		// tx means transaction
		const tx = await contract.addTournament(players, scores);
		console.log("Transaction sent :", tx.hash);
		const receipt = await tx.wait();
		console.log("Transaction confirmed :", receipt.transactionHash);

		//	dans 'receipt' on a :
		//  informations sur le statut de la transaction et les logs générés
		//	si besoin

		return receipt;
	}
	catch (error)
	{
		console.error("Error in Smart Contract call :", error);
		
		return null;
	}
}

export async function SC_removeTournament( tournament_id: number )
{
	console.log("Calling removeTournament() from Blockchain SC");

	try
	{
		const tx = await contract.removeTournament( tournament_id );
		console.log("Transaction sent :", tx.hash);
		const receipt = await tx.wait();
		console.log("Transaction confirmed :", receipt.transactionHash);

		return receipt;
	}
	catch (error)
	{
		console.error("Error in Smart Contract call :", error);
		
		return null;
	}
}

export async function SC_clearALL()
{
	console.log("Calling clearALL() from Blockchain SC");

	try
	{
		const tx = await contract.clearALL();
		console.log("Transaction sent :", tx.hash);
		const receipt = await tx.wait();
		console.log("Transaction confirmed :", receipt.transactionHash);

		return receipt;
	}
	catch (error)
	{
		console.error("Error in Smart Contract call :", error);
		
		return null;
	}
}
