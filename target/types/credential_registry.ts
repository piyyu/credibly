/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/credential_registry.json`.
 */
export type CredentialRegistry = {
  "address": "F4wFketKAQzZUTcHLET6QtRz9DYejhKVVdwwSLFcGB8C",
  "metadata": {
    "name": "credentialRegistry",
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
          "name": "credential",
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
                "path": "hash"
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "recipient",
          "type": "pubkey"
        },
        {
          "name": "credentialType",
          "type": "u8"
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
          "name": "credential",
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
                "path": "hash"
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
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "credential",
      "discriminator": [
        145,
        44,
        68,
        220,
        67,
        46,
        100,
        135
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedRevocation",
      "msg": "Only the original issuer can revoke this credential."
    },
    {
      "code": 6001,
      "name": "invalidCredentialType",
      "msg": "Invalid credential type. Must be 0–4 (Diploma, Certificate, Transcript, License, Other)."
    }
  ],
  "types": [
    {
      "name": "credential",
      "docs": [
        "On-chain credential record with full metadata.",
        "",
        "Layout (Borsh-serialized, field order):",
        "[0..7]     discriminator   (8 bytes)",
        "[8..39]    issuer           (32 bytes — Pubkey)",
        "[40..71]   recipient        (32 bytes — Pubkey)",
        "[72..103]  hash             (32 bytes — [u8; 32])",
        "[104..111] issued_at        (8 bytes  — i64 unix timestamp)",
        "[112]      credential_type  (1 byte   — u8 enum 0-4)",
        "[113]      revoked          (1 byte   — bool)",
        "Total: 114 bytes"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "issuer",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "issuedAt",
            "type": "i64"
          },
          {
            "name": "credentialType",
            "type": "u8"
          },
          {
            "name": "revoked",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
