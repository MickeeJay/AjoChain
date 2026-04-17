// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { AjoCredential } from "../AjoCredential.sol";
import { AjoSavingsGroup } from "../AjoSavingsGroup.sol";
import { IAjoFactory } from "../interfaces/IAjoFactory.sol";

/// @title Mock Reentrant Credential
/// @notice Credential mock that can re-enter the factory or group during authorization and minting.
/// @author AjoChain
contract MockReentrantCredential {
    /// @notice Factory used for createGroup and joinGroup reentrancy tests.
    IAjoFactory public factory;

    /// @notice Group captured during authorizeGroup so mint can re-enter the payout path.
    address public targetGroup;

    /// @notice Controls which attack path is triggered.
    uint256 public attackMode;

    /// @notice Binds the target factory for reentrancy tests.
    /// @param factory_ Factory address used by the attack modes.
    function setFactory(address factory_) external {
        factory = IAjoFactory(factory_);
    }

    /// @notice Selects the active attack mode.
    /// @param attackMode_ Attack mode selector.
    function setAttackMode(uint256 attackMode_) external {
        attackMode = attackMode_;
    }

    /// @notice Captures the authorized group and optionally re-enters the factory.
    /// @param groupContract Newly authorized group contract.
    function authorizeGroup(address groupContract) external {
        targetGroup = groupContract;

        if (attackMode == 1) {
            factory.createGroup("Reenter Circle", 1e18, 7, 3);
        } else if (attackMode == 2) {
            factory.joinGroup(0, bytes32(0));
        }
    }

    /// @notice Re-enters the group contribution flow during credential minting.
    /// @param recipient Ignored recipient argument required by the credential interface.
    /// @param data Credential payload supplied by the group.
    /// @return tokenId Dummy token id returned only if reentrancy does not revert.
    function mint(address recipient, AjoCredential.CredentialData calldata data) external returns (uint256 tokenId) {
        recipient;
        data;

        if (attackMode == 3 && targetGroup != address(0)) {
            AjoSavingsGroup(targetGroup).contribute();
        }

        return tokenId;
    }
}
