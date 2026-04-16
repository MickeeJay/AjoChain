// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAjoFactory {
    event GroupCreated(address indexed group, address indexed creator, string name);

    function cUSD() external view returns (address);

    function createGroup(
        string calldata name,
        IERC20 token,
        uint256 contributionAmount,
        uint256 maxMembers,
        uint256 cycleDuration
    ) external returns (address group);

    function allGroups(uint256 index) external view returns (address);

    function totalGroups() external view returns (uint256);
}