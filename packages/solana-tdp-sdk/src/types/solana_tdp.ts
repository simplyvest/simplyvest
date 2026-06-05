/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solana_tdp.json`.
 */
export type SolanaTdp = {
  address: "6VkmhxbTH9dnzAE7Scpxn6R3HeXYtY4oZffAFMAYvECk";
  metadata: {
    name: "solanaTdp";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Solana Token Distribution Protocol";
  };
  instructions: [
    {
      name: "cancel";
      discriminator: [232, 219, 223, 41, 219, 236, 220, 190];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
        },
        {
          name: "recipient";
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 114, 101, 97, 109];
              },
              {
                kind: "account";
                path: "sender";
              },
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "account";
                path: "stream.mint";
                account: "streamAccount";
              },
              {
                kind: "account";
                path: "stream.vesting_count";
                account: "streamAccount";
              },
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "stream";
              },
            ];
          };
        },
        {
          name: "senderToken";
          docs: [
            "Creator's token account to receive returned unvested tokens.",
            "Must exist (creator funded the stream from this or another account for the same mint).",
          ];
          writable: true;
        },
        {
          name: "recipientToken";
          docs: ["Recipient's ATA — created if missing (payer = sender/creator)."];
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "mint";
          docs: ["The mint for the stream. Must match stream.mint."];
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "cancelMilestone";
      discriminator: [106, 24, 203, 155, 226, 62, 27, 15];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101,
                  45,
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                ];
              },
              {
                kind: "account";
                path: "stream.creator";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.recipient";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.mint";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.vesting_count";
                account: "milestoneStreamAccount";
              },
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "stream";
              },
            ];
          };
        },
        {
          name: "senderToken";
          writable: true;
        },
        {
          name: "mint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
      ];
      args: [];
    },
    {
      name: "createMilestoneStream";
      discriminator: [162, 112, 235, 171, 104, 156, 63, 203];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
        },
        {
          name: "recipient";
        },
        {
          name: "milestoneAuthority";
        },
        {
          name: "creatorConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 114, 101, 97, 116, 111, 114, 95, 99, 111, 110, 102, 105, 103];
              },
              {
                kind: "account";
                path: "sender";
              },
            ];
          };
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101,
                  45,
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                ];
              },
              {
                kind: "account";
                path: "sender";
              },
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "creator_config.vesting_count";
                account: "creatorConfig";
              },
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "stream";
              },
            ];
          };
        },
        {
          name: "senderToken";
          writable: true;
        },
        {
          name: "mint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: {
              name: "createMilestoneStreamParams";
            };
          };
        },
      ];
    },
    {
      name: "createStream";
      discriminator: [71, 188, 111, 127, 108, 40, 229, 158];
      accounts: [
        {
          name: "sender";
          writable: true;
          signer: true;
        },
        {
          name: "recipient";
        },
        {
          name: "creatorConfig";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [99, 114, 101, 97, 116, 111, 114, 95, 99, 111, 110, 102, 105, 103];
              },
              {
                kind: "account";
                path: "sender";
              },
            ];
          };
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 114, 101, 97, 109];
              },
              {
                kind: "account";
                path: "sender";
              },
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "creator_config.vesting_count";
                account: "creatorConfig";
              },
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "stream";
              },
            ];
          };
        },
        {
          name: "senderToken";
          writable: true;
        },
        {
          name: "mint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "rent";
          address: "SysvarRent111111111111111111111111111111111";
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: {
              name: "createStreamParams";
            };
          };
        },
      ];
    },
    {
      name: "triggerMilestone";
      discriminator: [86, 182, 184, 68, 250, 228, 213, 28];
      accounts: [
        {
          name: "milestoneAuthority";
          signer: true;
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101,
                  45,
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                ];
              },
              {
                kind: "account";
                path: "stream.creator";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.recipient";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.mint";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.vesting_count";
                account: "milestoneStreamAccount";
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: "recipient";
          writable: true;
          signer: true;
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [115, 116, 114, 101, 97, 109];
              },
              {
                kind: "account";
                path: "stream.creator";
                account: "streamAccount";
              },
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "account";
                path: "stream.mint";
                account: "streamAccount";
              },
              {
                kind: "account";
                path: "stream.vesting_count";
                account: "streamAccount";
              },
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "stream";
              },
            ];
          };
        },
        {
          name: "recipientToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "sender";
          writable: true;
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "mint";
          docs: ["The mint for the stream. Must match stream.mint."];
        },
      ];
      args: [
        {
          name: "params";
          type: {
            defined: {
              name: "withdrawParams";
            };
          };
        },
      ];
    },
    {
      name: "withdrawMilestone";
      discriminator: [3, 250, 151, 3, 137, 47, 146, 142];
      accounts: [
        {
          name: "recipient";
          writable: true;
          signer: true;
        },
        {
          name: "stream";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  109,
                  105,
                  108,
                  101,
                  115,
                  116,
                  111,
                  110,
                  101,
                  45,
                  115,
                  116,
                  114,
                  101,
                  97,
                  109,
                ];
              },
              {
                kind: "account";
                path: "stream.creator";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.recipient";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.mint";
                account: "milestoneStreamAccount";
              },
              {
                kind: "account";
                path: "stream.vesting_count";
                account: "milestoneStreamAccount";
              },
            ];
          };
        },
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "stream";
              },
            ];
          };
        },
        {
          name: "recipientToken";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "account";
                path: "recipient";
              },
              {
                kind: "const";
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: "account";
                path: "mint";
              },
            ];
            program: {
              kind: "const";
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: "sender";
          writable: true;
        },
        {
          name: "mint";
        },
        {
          name: "tokenProgram";
          address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
        },
        {
          name: "associatedTokenProgram";
          address: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "creatorConfig";
      discriminator: [208, 169, 98, 27, 194, 199, 95, 86];
    },
    {
      name: "milestoneStreamAccount";
      discriminator: [32, 129, 16, 253, 73, 199, 39, 42];
    },
    {
      name: "streamAccount";
      discriminator: [243, 60, 164, 106, 199, 192, 110, 53];
    },
  ];
  events: [
    {
      name: "milestoneCancelled";
      discriminator: [141, 250, 228, 100, 119, 156, 95, 240];
    },
    {
      name: "milestoneCompleted";
      discriminator: [44, 25, 3, 4, 74, 141, 142, 66];
    },
    {
      name: "milestoneStreamCreated";
      discriminator: [241, 217, 231, 247, 190, 105, 149, 26];
    },
    {
      name: "milestoneTriggered";
      discriminator: [98, 110, 92, 203, 209, 32, 45, 166];
    },
    {
      name: "streamCancelled";
      discriminator: [91, 215, 29, 237, 194, 6, 184, 92];
    },
    {
      name: "streamCompleted";
      discriminator: [142, 179, 19, 243, 253, 252, 137, 61];
    },
    {
      name: "streamCreated";
      discriminator: [93, 150, 91, 15, 166, 8, 251, 166];
    },
    {
      name: "tokensClaimed";
      discriminator: [25, 128, 244, 55, 241, 136, 200, 91];
    },
  ];
  errors: [
    {
      code: 6000;
      name: "zeroAmount";
      msg: "Amount must be greater than zero.";
    },
    {
      code: 6001;
      name: "invalidTimeRange";
      msg: "start_time must be before end_time.";
    },
    {
      code: 6002;
      name: "invalidCliffTime";
      msg: "cliff_time must be between start_time and end_time.";
    },
    {
      code: 6003;
      name: "durationTooShort";
      msg: "Stream duration must be at least 60 seconds.";
    },
    {
      code: 6004;
      name: "insufficientBalance";
      msg: "Sender does not have enough token balance.";
    },
    {
      code: 6005;
      name: "unsupportedTokenProgram";
      msg: "Unsupported token program. Only SPL Token is supported.";
    },
    {
      code: 6006;
      name: "tokenHasTransferHook";
      msg: "Token mint has a transfer hook; not supported.";
    },
    {
      code: 6007;
      name: "cliffNotReached";
      msg: "Cliff time has not been reached yet.";
    },
    {
      code: 6008;
      name: "nothingToWithdraw";
      msg: "No tokens are available to withdraw at this time.";
    },
    {
      code: 6009;
      name: "alreadyCancelled";
      msg: "Stream is already cancelled.";
    },
    {
      code: 6010;
      name: "fullyVested";
      msg: "Stream is fully vested; no tokens remain to cancel.";
    },
    {
      code: 6011;
      name: "startTimeInPast";
      msg: "Stream start time must be in the future.";
    },
    {
      code: 6012;
      name: "streamExpired";
      msg: "Stream duration has ended; no cancel allowed.";
    },
    {
      code: 6013;
      name: "exceedsClaimable";
      msg: "Requested amount exceeds claimable tokens.";
    },
    {
      code: 6014;
      name: "unauthorized";
      msg: "You are not authorized to perform this action.";
    },
  ];
  types: [
    {
      name: "createMilestoneStreamParams";
      docs: ["Parameters for creating a milestone stream (no time params)"];
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "createStreamParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "cliffTime";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "creatorConfig";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "vestingCount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "milestoneCancelled";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "returnedToCreator";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "milestoneCompleted";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "milestoneStreamAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "vault";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "amountWithdrawn";
            type: "u64";
          },
          {
            name: "milestoneAuthority";
            type: "pubkey";
          },
          {
            name: "milestoneReached";
            type: "bool";
          },
          {
            name: "cancelled";
            type: "bool";
          },
          {
            name: "vestingCount";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "vaultBump";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "milestoneStreamCreated";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "milestoneAuthority";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "milestoneTriggered";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "milestoneAuthority";
            type: "pubkey";
          },
        ];
      };
    },
    {
      name: "streamAccount";
      type: {
        kind: "struct";
        fields: [
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "vault";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "amountWithdrawn";
            type: "u64";
          },
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
          {
            name: "cliffTime";
            type: "i64";
          },
          {
            name: "vestingCount";
            type: "u64";
          },
          {
            name: "cancelled";
            type: "bool";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "vaultBump";
            type: "u8";
          },
        ];
      };
    },
    {
      name: "streamCancelled";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "vestedToRecipient";
            type: "u64";
          },
          {
            name: "returnedToCreator";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "streamCompleted";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "totalAmount";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "streamCreated";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "creator";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "mint";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "startTime";
            type: "i64";
          },
          {
            name: "cliffTime";
            type: "i64";
          },
          {
            name: "endTime";
            type: "i64";
          },
        ];
      };
    },
    {
      name: "tokensClaimed";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stream";
            type: "pubkey";
          },
          {
            name: "recipient";
            type: "pubkey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "claimed";
            type: "u64";
          },
          {
            name: "totalClaimed";
            type: "u64";
          },
        ];
      };
    },
    {
      name: "withdrawParams";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          },
        ];
      };
    },
  ];
};
