// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAjoFactory {
    event GroupCreated(uint256 indexed groupId, address indexed groupAddress, address indexed creator, string name);
    event MemberJoined(uint256 indexed groupId, address indexed member);

    function cUSDToken() external view returns (address);

    function credentialContract() external view returns (address);

    function createGroup(
        string calldata name,
        uint256 contributionAmount,
        uint256 frequencyInDays,
        uint256 maxMembers
    ) external;

    function joinGroup(uint256 groupId, bytes32 inviteCode) external;

    function getUserGroups(address user) external view returns (uint256[] memory);

    function getGroupInfo(uint256 groupId) external view returns (address);

    function getActiveGroups(uint256 offset, uint256 limit) external view returns (uint256[] memory);
}