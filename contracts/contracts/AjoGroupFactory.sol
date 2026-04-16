// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IAjoFactory.sol";
import "./AjoCredential.sol";
import "./AjoSavingsGroup.sol";
import "./libraries/Counters.sol";

contract AjoGroupFactory is Ownable, ReentrancyGuard, IAjoFactory {
    using Counters for Counters.Counter;

    error InvalidGroupSize();
    error InvalidContributionAmount();
    error InvalidFrequency();
    error InvalidPotValue();
    error GroupNotFound();
    error InvalidInviteCode();
    error InvalidTokenAddress();
    error InvalidCredentialAddress();

    Counters.Counter private _groupIds;

    address public cUSDToken;
    address public immutable credentialContract;
    mapping(uint256 => address) public groups;
    mapping(address => uint256[]) public userGroups;
    mapping(uint256 => bytes32) private _groupInviteCodes;
    uint256 public groupCount;

    uint256 public constant MAX_GROUP_SIZE = 20;
    uint256 public constant MIN_GROUP_SIZE = 3;
    uint256 public constant MAX_CONTRIBUTION = 50e18;
    uint256 public constant MAX_POT_VALUE = 500e18;

    constructor(address cUSDToken_, address credentialContract_) Ownable() {
        if (cUSDToken_ == address(0)) {
            revert InvalidTokenAddress();
        }

        if (credentialContract_ == address(0)) {
            revert InvalidCredentialAddress();
        }

        cUSDToken = cUSDToken_;
        credentialContract = credentialContract_;
    }

    function createGroup(
        string calldata name,
        uint256 contributionAmount,
        uint256 frequencyInDays,
        uint256 maxMembers
    ) external override nonReentrant {
        if (maxMembers < MIN_GROUP_SIZE || maxMembers > MAX_GROUP_SIZE) {
            revert InvalidGroupSize();
        }

        if (contributionAmount == 0 || contributionAmount > MAX_CONTRIBUTION) {
            revert InvalidContributionAmount();
        }

        if (frequencyInDays != 1 && frequencyInDays != 7 && frequencyInDays != 30) {
            revert InvalidFrequency();
        }

        if (contributionAmount * maxMembers > MAX_POT_VALUE) {
            revert InvalidPotValue();
        }

        uint256 groupId = _groupIds.current();
        _groupIds.increment();
        groupCount = _groupIds.current();

        bytes32 inviteCode = keccak256(
            abi.encodePacked(address(this), msg.sender, groupId, name, contributionAmount, frequencyInDays, maxMembers, cUSDToken)
        );

        _groupInviteCodes[groupId] = inviteCode;
        userGroups[msg.sender].push(groupId);

        AjoSavingsGroup savingsGroup = new AjoSavingsGroup(
            address(this),
            name,
            cUSDToken,
            contributionAmount,
            frequencyInDays,
            maxMembers,
            msg.sender,
            inviteCode
        );

        address groupAddress = address(savingsGroup);
        groups[groupId] = groupAddress;
        AjoCredential(credentialContract).authorizeGroup(groupAddress);
        emit GroupCreated(groupId, groupAddress, msg.sender, name);
    }

    function authorizeGroup(address groupContract) external onlyOwner {
        AjoCredential(credentialContract).authorizeGroup(groupContract);
    }

    function joinGroup(uint256 groupId, bytes32 inviteCode) external override nonReentrant {
        address groupAddress = groups[groupId];
        if (groupAddress == address(0)) {
            revert GroupNotFound();
        }

        bytes32 storedInviteCode = _groupInviteCodes[groupId];
        if (keccak256(abi.encodePacked(inviteCode)) != keccak256(abi.encodePacked(storedInviteCode))) {
            revert InvalidInviteCode();
        }

        userGroups[msg.sender].push(groupId);
        AjoSavingsGroup(groupAddress).addMember(msg.sender);

        emit MemberJoined(groupId, msg.sender);
    }

    function getUserGroups(address user) external view override returns (uint256[] memory) {
        uint256[] storage storedGroups = userGroups[user];
        uint256[] memory results = new uint256[](storedGroups.length);

        for (uint256 index = 0; index < storedGroups.length; ) {
            results[index] = storedGroups[index];
            unchecked {
                ++index;
            }
        }

        return results;
    }

    function getGroupInfo(uint256 groupId) external view override returns (address) {
        return groups[groupId];
    }

    function getActiveGroups(uint256 offset, uint256 limit) external view override returns (uint256[] memory) {
        if (offset >= groupCount || limit == 0) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end < offset || end > groupCount) {
            end = groupCount;
        }

        uint256 resultLength = end - offset;
        uint256[] memory activeGroups = new uint256[](resultLength);

        for (uint256 index = 0; index < resultLength; ) {
            activeGroups[index] = offset + index;
            unchecked {
                ++index;
            }
        }

        return activeGroups;
    }
}
