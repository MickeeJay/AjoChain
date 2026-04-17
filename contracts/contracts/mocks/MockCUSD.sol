// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { AjoSavingsGroup } from "../AjoSavingsGroup.sol";

/// @title Mock Celo Dollar
/// @notice ERC20 test token that can optionally re-enter a savings group during payout.
/// @author GitHub Copilot
contract MockCUSD is ERC20, Ownable {
    /// @notice Target group used by the optional payout reentrancy hook.
    address public targetGroup;

    /// @notice Attack selector; mode 1 re-enters contribute() on payout transfer.
    uint256 public attackMode;

    /// @notice Creates the mock token with a stable test symbol.
    constructor() ERC20("Mock Celo Dollar", "mCUSD") Ownable() {}

    /// @notice Sets the group address used by the reentrancy hook.
    /// @param targetGroup_ Group contract to target during payout.
    function setTargetGroup(address targetGroup_) external {
        targetGroup = targetGroup_;
    }

    /// @notice Enables or disables the reentrancy hook.
    /// @param attackMode_ Mode selector for the hook.
    function setAttackMode(uint256 attackMode_) external {
        attackMode = attackMode_;
    }

    /// @notice Mints mock cUSD to any recipient.
    /// @param to Recipient address.
    /// @param amount Mint amount.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Hooks the underlying ERC20 transfer so the payout path can be attacked.
    /// @param from Token sender.
    /// @param to Token recipient.
    /// @param amount Transfer amount.
    function _transfer(address from, address to, uint256 amount) internal virtual override {
        if (attackMode == 1 && from == targetGroup && to != targetGroup) {
            AjoSavingsGroup(targetGroup).contribute();
        }

        super._transfer(from, to, amount);
    }
}