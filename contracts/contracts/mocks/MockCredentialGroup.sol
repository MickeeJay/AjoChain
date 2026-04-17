// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../AjoCredential.sol";

contract MockCredentialGroup {
    AjoCredential public immutable credential;

    constructor(address credentialAddress) {
        credential = AjoCredential(credentialAddress);
    }

    function mintCredential(address recipient, AjoCredential.CredentialData calldata data) external returns (uint256) {
        return credential.mint(recipient, data);
    }
}