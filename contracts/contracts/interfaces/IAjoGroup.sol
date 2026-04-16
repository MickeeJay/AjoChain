// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAjoGroup {
    enum GroupStatus {
        FORMING,
        ACTIVE,
        COMPLETED,
        PAUSED
    }

    struct Member {
        address wallet;
        bool hasContributedThisRound;
        uint256 totalContributed;
        uint256 roundsCompleted;
        bool isActive;
    }

    struct GroupState {
        GroupStatus status;
        address factory;
        address creator;
        address cUSDToken;
        string name;
        uint256 contributionAmount;
        uint256 frequencyInDays;
        uint256 maxMembers;
        uint256 currentRound;
        uint256 roundStartTime;
        uint256 payoutIndex;
        bytes32 inviteCode;
        address[] memberOrder;
        address[] activeMembers;
        uint256 pauseSupportVotes;
        uint256 pauseOppositionVotes;
        uint256 remainingTime;
    }

    event MemberAdded(address member, uint256 timestamp);
    event GroupStarted(uint256 startTime, address[] memberOrder);
    event ContributionReceived(address member, uint256 round, uint256 amount);
    event RoundCompleted(uint256 round, address recipient, uint256 amount);
    event GroupCompleted(uint256 totalCycles, uint256 completedAt);

    function addMember(address newMember) external;

    function startGroup() external;

    function contribute() external;

    function executePayout() external returns (address recipient, uint256 amount);

    function pauseRound(bool pause) external;

    function emergencyExit() external;

    function voteOnPause(bool pause) external;

    function getGroupState() external view returns (GroupState memory);

    function getRemainingTime() external view returns (uint256);

    function canExecutePayout() external view returns (bool);

    function currentCycle() external view returns (uint256);

    function contributionAmount() external view returns (uint256);

    function token() external view returns (address);

    function members(address account)
        external
        view
        returns (
            address wallet,
            bool hasContributedThisRound,
            uint256 totalContributed,
            uint256 roundsCompleted,
            bool isActive
        );

    function memberOrder(uint256 index) external view returns (address);

    function memberCount() external view returns (uint256);

    function currentPayoutRecipient() external view returns (address);

    function isCompleted() external view returns (bool);

    function isMember(address account) external view returns (bool);

    function inviteCode() external view returns (bytes32);

    function status() external view returns (GroupStatus);

    function factory() external view returns (address);

    function creator() external view returns (address);

    function cUSDToken() external view returns (address);

    function name() external view returns (string memory);

    function frequencyInDays() external view returns (uint256);

    function maxMembers() external view returns (uint256);

    function currentRound() external view returns (uint256);

    function roundStartTime() external view returns (uint256);

    function payoutIndex() external view returns (uint256);

    function pauseVotes(address account) external view returns (bool);
}