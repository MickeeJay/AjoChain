// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IAjoFactory.sol";

contract MockReentrantCredential {
    IAjoFactory public factory;
    uint256 public attackMode;

    function setFactory(address factory_) external {
        factory = IAjoFactory(factory_);
    }

    function setAttackMode(uint256 attackMode_) external {
        attackMode = attackMode_;
    }

    function authorizeGroup(address) external {
        if (attackMode == 1) {
            factory.createGroup("Reenter Circle", 1e18, 7, 3);
        } else if (attackMode == 2) {
            factory.joinGroup(0, bytes32(0));
        }
    }
}
