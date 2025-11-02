/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/code255.json`.
 */
export type Code255 = {
	address: "AMp4gissUxPZdfWReixw6kUdmZmzDQtKwTcnE84dPTxa";
	metadata: {
		name: "code255";
		version: "0.1.0";
		spec: "0.1.0";
		description: "Created with Anchor";
	};
	instructions: [
		{
			name: "createGame";
			discriminator: [124, 69, 75, 66, 184, 220, 72, 206];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "arg";
								path: "gameCode";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "gameCode";
					type: "u64";
				}
			];
		},
		{
			name: "delegateGame";
			discriminator: [116, 183, 70, 107, 112, 223, 122, 210];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "validator";
					optional: true;
				},
				{
					name: "bufferGame";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [98, 117, 102, 102, 101, 114];
							},
							{
								kind: "account";
								path: "game";
							}
						];
						program: {
							kind: "const";
							value: [
								139,
								14,
								3,
								111,
								194,
								181,
								15,
								196,
								211,
								195,
								20,
								137,
								97,
								68,
								160,
								247,
								231,
								48,
								210,
								93,
								112,
								110,
								44,
								244,
								95,
								38,
								180,
								36,
								48,
								73,
								96,
								15
							];
						};
					};
				},
				{
					name: "delegationRecordGame";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									100,
									101,
									108,
									101,
									103,
									97,
									116,
									105,
									111,
									110
								];
							},
							{
								kind: "account";
								path: "game";
							}
						];
						program: {
							kind: "account";
							path: "delegationProgram";
						};
					};
				},
				{
					name: "delegationMetadataGame";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [
									100,
									101,
									108,
									101,
									103,
									97,
									116,
									105,
									111,
									110,
									45,
									109,
									101,
									116,
									97,
									100,
									97,
									116,
									97
								];
							},
							{
								kind: "account";
								path: "game";
							}
						];
						program: {
							kind: "account";
							path: "delegationProgram";
						};
					};
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "arg";
								path: "gameCode";
							}
						];
					};
				},
				{
					name: "ownerProgram";
					address: "AMp4gissUxPZdfWReixw6kUdmZmzDQtKwTcnE84dPTxa";
				},
				{
					name: "delegationProgram";
					address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh";
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "gameCode";
					type: "u64";
				}
			];
		},
		{
			name: "joinGame";
			discriminator: [107, 112, 18, 38, 56, 173, 60, 128];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
					relations: ["game"];
				},
				{
					name: "player";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [112, 108, 97, 121, 101, 114];
							},
							{
								kind: "arg";
								path: "username";
							},
							{
								kind: "account";
								path: "game";
							}
						];
					};
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "account";
								path: "game.game_code";
								account: "game";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "username";
					type: "string";
				}
			];
		},
		{
			name: "processUndelegation";
			discriminator: [196, 28, 41, 206, 48, 37, 51, 167];
			accounts: [
				{
					name: "baseAccount";
					writable: true;
				},
				{
					name: "buffer";
				},
				{
					name: "payer";
					writable: true;
				},
				{
					name: "systemProgram";
				}
			];
			args: [
				{
					name: "accountSeeds";
					type: {
						vec: "bytes";
					};
				}
			];
		},
		{
			name: "requestRoundSeed";
			discriminator: [228, 76, 146, 186, 12, 30, 244, 166];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "arg";
								path: "gameCode";
							}
						];
					};
				},
				{
					name: "oracleQueue";
					writable: true;
					address: "5hBR571xnXppuCPveTrctfTU7tJLSN94nq7kv7FRK5Tc";
				},
				{
					name: "programIdentity";
					pda: {
						seeds: [
							{
								kind: "const";
								value: [105, 100, 101, 110, 116, 105, 116, 121];
							}
						];
					};
				},
				{
					name: "vrfProgram";
					address: "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz";
				},
				{
					name: "slotHashes";
					address: "SysvarS1otHashes111111111111111111111111111";
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "gameCode";
					type: "u64";
				}
			];
		},
		{
			name: "resolveAction";
			discriminator: [255, 71, 111, 208, 53, 160, 174, 28];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
					relations: ["game"];
				},
				{
					name: "player";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [112, 108, 97, 121, 101, 114];
							},
							{
								kind: "account";
								path: "player.username";
								account: "player";
							},
							{
								kind: "account";
								path: "game";
							}
						];
					};
				},
				{
					name: "target";
					writable: true;
					optional: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [112, 108, 97, 121, 101, 114];
							},
							{
								kind: "account";
								path: "target.username";
								account: "player";
							},
							{
								kind: "account";
								path: "game";
							}
						];
					};
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "account";
								path: "game.game_code";
								account: "game";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "players";
					type: {
						vec: "pubkey";
					};
				}
			];
		},
		{
			name: "startRound";
			discriminator: [144, 144, 43, 7, 193, 42, 217, 215];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
					relations: ["game"];
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "account";
								path: "game.game_code";
								account: "game";
							}
						];
					};
				}
			];
			args: [
				{
					name: "players";
					type: {
						vec: "pubkey";
					};
				}
			];
		},
		{
			name: "storeRoundSeed";
			discriminator: [29, 30, 82, 60, 114, 70, 5, 146];
			accounts: [
				{
					name: "vrfProgramIdentity";
					docs: [
						"This check ensure that the vrf_program_identity (which is a PDA) is a signer",
						"enforcing the callback is executed by the VRF program through CPI"
					];
					signer: true;
					address: "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw";
				},
				{
					name: "game";
					writable: true;
				}
			];
			args: [
				{
					name: "randomness";
					type: {
						array: ["u8", 32];
					};
				}
			];
		},
		{
			name: "submitAction";
			discriminator: [222, 59, 32, 151, 194, 137, 175, 150];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
					relations: ["game"];
				},
				{
					name: "player";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [112, 108, 97, 121, 101, 114];
							},
							{
								kind: "account";
								path: "player.username";
								account: "player";
							},
							{
								kind: "account";
								path: "game";
							}
						];
					};
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "account";
								path: "game.game_code";
								account: "game";
							}
						];
					};
				},
				{
					name: "systemProgram";
					address: "11111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "action";
					type: {
						defined: {
							name: "action";
						};
					};
				}
			];
		},
		{
			name: "undelegate";
			discriminator: [131, 148, 180, 198, 91, 104, 42, 238];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "arg";
								path: "gameCode";
							}
						];
					};
				},
				{
					name: "magicProgram";
					address: "Magic11111111111111111111111111111111111111";
				},
				{
					name: "magicContext";
					writable: true;
					address: "MagicContext1111111111111111111111111111111";
				}
			];
			args: [
				{
					name: "gameCode";
					type: "u64";
				}
			];
		},
		{
			name: "updateRoundSeed";
			discriminator: [129, 210, 114, 50, 42, 229, 5, 168];
			accounts: [
				{
					name: "admin";
					writable: true;
					signer: true;
					relations: ["game"];
				},
				{
					name: "game";
					writable: true;
					pda: {
						seeds: [
							{
								kind: "const";
								value: [103, 97, 109, 101];
							},
							{
								kind: "account";
								path: "game.game_code";
								account: "game";
							}
						];
					};
				}
			];
			args: [];
		}
	];
	accounts: [
		{
			name: "game";
			discriminator: [27, 90, 166, 125, 74, 100, 121, 18];
		},
		{
			name: "player";
			discriminator: [205, 222, 112, 7, 165, 155, 206, 218];
		}
	];
	errors: [
		{
			code: 6000;
			name: "outOfRange";
			msg: "The arithemetic operation resulted in an out-of-range value";
		},
		{
			code: 6001;
			name: "notEnoughPlayers";
			msg: "Not enough players to start round";
		},
		{
			code: 6002;
			name: "gameAlreadyStarted";
			msg: "Game already started";
		},
		{
			code: 6003;
			name: "gameRoundNotEnded";
			msg: "Game round has not ended";
		},
		{
			code: 6004;
			name: "playerAlreadySubmittedAction";
			msg: "Player already submitted an action";
		},
		{
			code: 6005;
			name: "playerAlreadyEliminated";
			msg: "Player has already been eliminated";
		},
		{
			code: 6006;
			name: "playerActionNotSubmitted";
			msg: "No player action was submitted";
		},
		{
			code: 6007;
			name: "playerPubkeyNotFound";
			msg: "Player pubkey was not found in the players list";
		},
		{
			code: 6008;
			name: "invalidPlayersHash";
			msg: "Players hash does not match the round players hash";
		},
		{
			code: 6009;
			name: "missingTargetAccount";
			msg: "Target account not provided in the transaction context";
		},
		{
			code: 6010;
			name: "invalidTargetAccount";
			msg: "Target account does not match the target shot";
		}
	];
	types: [
		{
			name: "action";
			type: {
				kind: "enum";
				variants: [
					{
						name: "shoot";
						fields: ["pubkey"];
					},
					{
						name: "forgive";
					}
				];
			};
		},
		{
			name: "game";
			type: {
				kind: "struct";
				fields: [
					{
						name: "bump";
						type: "u8";
					},
					{
						name: "round";
						type: "u8";
					},
					{
						name: "activePlayers";
						type: "u16";
					},
					{
						name: "submittedActions";
						type: "u16";
					},
					{
						name: "gameCode";
						type: "u64";
					},
					{
						name: "roundSeed";
						type: {
							option: {
								array: ["u8", 32];
							};
						};
					},
					{
						name: "playersHash";
						type: {
							option: {
								array: ["u8", 32];
							};
						};
					},
					{
						name: "admin";
						type: "pubkey";
					}
				];
			};
		},
		{
			name: "player";
			type: {
				kind: "struct";
				fields: [
					{
						name: "bump";
						type: "u8";
					},
					{
						name: "isEliminated";
						type: "bool";
					},
					{
						name: "cardNumber";
						type: {
							option: "u16";
						};
					},
					{
						name: "action";
						type: {
							option: {
								defined: {
									name: "action";
								};
							};
						};
					},
					{
						name: "username";
						type: "string";
					}
				];
			};
		}
	];
	constants: [
		{
			name: "gameSeed";
			type: "bytes";
			value: "[103, 97, 109, 101]";
		}
	];
};
