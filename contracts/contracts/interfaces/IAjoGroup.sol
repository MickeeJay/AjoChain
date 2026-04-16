// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAjoGroup {
    event MemberJoined(address indexed member);
    event ContributionMade(address indexed member, uint256 amount, uint256 cycle);
    event PayoutExecuted(address indexed recipient, uint256 amount, uint256 cycle);

    function joinGroup() external;

    function contribute() external;

    function executePayout() external returns (address recipient, uint256 amount);

    function canExecutePayout() external view returns (bool);

    function currentCycle() external view returns (uint256);

    function contributionAmount() external view returns (uint256);

    function token() external view returns (address);

    function members(uint256 index) external view returns (address);

    function memberCount() external view returns (uint256);

    function hasContributed(uint256 cycle, address member) external view returns (bool);

    function currentPayoutRecipient() external view returns (address);

    function isCompleted() external view returns (bool);

    function isMember(address account) external view returns (bool);
}