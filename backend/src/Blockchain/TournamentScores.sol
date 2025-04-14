// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
8.031 AVAX 4/14 11:57pm
NOTES

THIS SMART CONTRACT IS ALREADY DEPLOYED (in 0x8440a11d49af29b2E0aED5dD485D0b0848bCB9fe) in Fuji Testnet,
I copied it right here so everyone can see how it works :)
A SC code is 100% public on the blockchain anyway

*/

contract TournamentScores
{
	// following values are stored in EVM storage side ↓
	address		public owner;	// 0x... variable to store the owner's wallet adress (not private key)

	struct Tournament
	{
		uint		tournament_id;
		uint		time;
		uint[]		players_ids;
		uint[]		scores;
	}

	// Array to store multiple tournaments
	Tournament[] private tournaments;

	// Set owner when contract is deployed
	constructor()
	{
		//	msg.sender is a built-in variable in Solidity.
		//	It’s the address of whoever calls a function or deploys the contract.
		owner = msg.sender;
	}

	// Only owner can call functions with this modifier
	modifier onlyOwner()
	{
		// check this
		require(msg.sender == owner, "Only owner can call this");
		// then execute what comes next (the function)
		_;
	}

	// Custom getters for arrays
	function getPlayers(uint tournament_id) public view returns (uint[] memory)
	{
		require(tournament_id < tournaments.length, "Invalid tournament id");
		return tournaments[tournament_id].players_ids;
	}

	function getScores(uint tournament_id) public view returns (uint[] memory)
	{
		require(tournament_id <tournaments.length, "Invalid tournament id");
		return tournaments[tournament_id].scores;
	}

	function getTime(uint tournament_id) public view returns (uint)
	{
		require(tournament_id < tournaments.length, "Invalid tournament id");
		return tournaments[tournament_id].time;
	}

	//							  	  ↓ EVM memory place not storage
	function addTournament(uint[] memory _players, uint[] memory _scores) external onlyOwner
	{
		// check same size else error
		require(_players.length == _scores.length, "Players and scores must match");
		
		// create and push in one shot to avoid copying
		tournaments.push( Tournament(tournaments.length, block.timestamp, _players, _scores) );
	}

	//							   ↓ no 'memory' because uint is by default
	function removeTournament( uint tournament_id ) external onlyOwner
	{
		require(tournament_id < tournaments.length, "Invalid tournament id");
	
		// SHIFT AND POP
		for (uint i = tournament_id; i < tournaments.length - 1; i++)
		{
			tournaments[i] = tournaments[i + 1];
		}
		tournaments.pop();
	}

	function clearALL() external onlyOwner
	{
		// delete it like bzero() c++
		delete tournaments;
	}
}

/*
NOTES

private means :
Only the contract itself can call the function.
External calls (from wallets, other contracts, or your backend) are blocked.

but here we need extern calls from our js backend,
that's why 'onlyOwner' and not private

*/
