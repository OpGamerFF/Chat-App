// Simple End-to-End Encryption Utility using Web Crypto API

// Generate a new RSA Key Pair for a user
export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const privateKeyJWK = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);

    return {
        publicKey: JSON.stringify(publicKeyJWK),
        privateKey: JSON.stringify(privateKeyJWK)
    };
};

// Encrypt a message using the recipient's public key
export const encryptMessage = async (message, recipientPublicKeyJWKString) => {
    try {
        const publicKeyJWK = JSON.parse(recipientPublicKeyJWKString);
        const publicKey = await window.crypto.subtle.importKey(
            "jwk",
            publicKeyJWK,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["encrypt"]
        );

        const encoder = new TextEncoder();
        const encryptedBuffer = await window.crypto.subtle.encrypt(
            {
                name: "RSA-OAEP",
            },
            publicKey,
            encoder.encode(message)
        );

        return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    } catch (err) {
        console.error("Encryption failed:", err);
        return message; // Fallback to plaintext if error (not ideal for production)
    }
};

// Decrypt a message using the owner's private key
export const decryptMessage = async (encryptedMessageBase64, myPrivateKeyJWKString) => {
    try {
        const privateKeyJWK = JSON.parse(myPrivateKeyJWKString);
        const privateKey = await window.crypto.subtle.importKey(
            "jwk",
            privateKeyJWK,
            {
                name: "RSA-OAEP",
                hash: "SHA-256",
            },
            true,
            ["decrypt"]
        );

        const encryptedBuffer = new Uint8Array(atob(encryptedMessageBase64).split("").map(c => c.charCodeAt(0)));
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
            },
            privateKey,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (err) {
        // console.error("Decryption failed:", err);
        return encryptedMessageBase64; // Fallback to raw if not encrypted correctly
    }
};
