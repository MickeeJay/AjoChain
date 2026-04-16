// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IAjoFactory.sol";
import "./AjoSavingsGroup.sol";

contract AjoGroupFactory is IAjoFactory {
    address[] private _allGroups;

    function createGroup(
        string calldata name,
        IERC20 token,
        uint256 contributionAmount,
        uint256 maxMembers,
        uint256 cycleDuration
    ) external override returns (address group) {
        AjoSavingsGroup savingsGroup = new AjoSavingsGroup(
            address(this),
            name,
            token,
            contributionAmount,
            maxMembers,
            cycleDuration,
            msg.sender
        );

        group = address(savingsGroup);
        _allGroups.push(group);
        emit GroupCreated(group, msg.sender, name);
    }

    function allGroups(uint256 index) external view override returns (address) {
        return _allGroups[index];
    }

    function totalGroups() external view override returns (uint256) {
        return _allGroups.length;
    }
}
