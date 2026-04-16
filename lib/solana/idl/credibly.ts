/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/credibly.json`.
 */
export type Credibly = {
  "address": "HYLVH9iBUSroAyDViFn6fY7WirfPuv1kG89TCyvAz5fx",
  "metadata": {
    "name": "credibly",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "issueCredential",
      "discriminator": [
        255,
        193,
        171,
        224,
        68,
        171,
        194,
        87
      ],
      "accounts": [
        {
          "name": "credentialAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  101,
                  110,
                  116,
                  105,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "credentialHash"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "writable": true,
          "signer": true
        },
        {
          "name": "institutionAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  115,
                  116,
                  105,
                  116,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "issuer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "credentialHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "ipfsCid",
          "type": "string"
        },
        {
          "name": "holderDid",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerInstitution",
      "discriminator": [
        77,
        234,
        193,
        118,
        107,
        20,
        106,
        52
      ],
      "accounts": [
        {
          "name": "institutionAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  110,
                  115,
                  116,
                  105,
                  116,
                  117,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "institution"
              }
            ]
          }
        },
        {
          "name": "institution"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "tier",
          "type": "u8"
        },
        {
          "name": "did",
          "type": "string"
        }
      ]
    },
    {
      "name": "revokeCredential",
      "discriminator": [
        38,
        123,
        95,
        95,
        223,
        158,
        169,
        87
      ],
      "accounts": [
        {
          "name": "credentialAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  101,
                  110,
                  116,
                  105,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "credentialHash"
              }
            ]
          }
        },
        {
          "name": "issuer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "credentialHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "verifyCredential",
      "discriminator": [
        139,
        189,
        60,
        127,
        32,
        241,
        162,
        134
      ],
      "accounts": [
        {
          "name": "credentialAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  101,
                  110,
                  116,
                  105,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "credentialHash"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "credentialHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ],
      "returns": {
        "defined": {
          "name": "credentialStatus"
        }
      }
    }
  ],
  "accounts": [
    {
      "name": "credentialAccount",
      "discriminator": [
        163,
        33,
        82,
        244,
        191,
        35,
        220,
        78
      ]
    },
    {
      "name": "institutionAccount",
      "discriminator": [
        118,
        156,
        121,
        180,
        222,
        68,
        125,
        116
      ]
    }
  ],
  "events": [
    {
      "name": "credentialIssued",
      "discriminator": [
        194,
        216,
        28,
        159,
        89,
        29,
        72,
        177
      ]
    },
    {
      "name": "credentialRevoked",
      "discriminator": [
        127,
        131,
        241,
        234,
        50,
        139,
        145,
        204
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Only the original issuer can revoke"
    },
    {
      "code": 6001,
      "name": "alreadyRevoked",
      "msg": "Already revoked"
    }
  ],
  "types": [
    {
      "name": "credentialAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "credentialHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "holderDid",
            "type": "string"
          },
          {
            "name": "ipfsCid",
            "type": "string"
          },
          {
            "name": "issuedAt",
            "type": "i64"
          },
          {
            "name": "revoked",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "credentialIssued",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "credentialHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "credentialRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "credentialHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "reason",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "credentialStatus",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "exists",
            "type": "bool"
          },
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "issuedAt",
            "type": "i64"
          },
          {
            "name": "revoked",
            "type": "bool"
          },
          {
            "name": "ipfsCid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "institutionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "institution",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tier",
            "type": "u8"
          },
          {
            "name": "did",
            "type": "string"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
