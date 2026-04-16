// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AjoSavingsGroup is ReentrancyGuard {
    using SafeERC20 for IERC20;

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

    error OnlyFactory();
    error OnlyCreator();
    error OnlyMember();
    error OnlyForming();
    error OnlyActive();
    error OnlyPaused();
    error GroupFull();
    error InvalidAddress();
    error InvalidState();
    error RoundExpired();
    error AlreadyContributed();
    error AllowanceTooLow();
    error InsufficientMembers();
    error InsufficientVotes();

    event MemberAdded(address member, uint256 timestamp);
    event GroupStarted(uint256 startTime, address[] memberOrder);
    event ContributionReceived(address member, uint256 round, uint256 amount);
    event RoundCompleted(uint256 round, address recipient, uint256 amount);
    event GroupCompleted(uint256 totalCycles, uint256 completedAt);

    uint256 public constant MIN_GROUP_SIZE = 3;

    address public immutable factory;
    address public immutable creator;
    address public immutable cUSDToken;
    string public name;
    uint256 public immutable contributionAmount;
    uint256 public immutable frequencyInDays;
    uint256 public immutable maxMembers;
    uint256 public currentRound;
    uint256 public roundStartTime;
    uint256 public payoutIndex;
    bytes32 public immutable inviteCode;
    GroupStatus public status;
    address[] public memberOrder;
    mapping(address => Member) public members;

    address[] private _memberRoster;
    mapping(address => uint256) private _memberRosterIndex;
    mapping(address => bool) public pauseVotes;
    mapping(address => bool) private _pauseVoteRecorded;
    uint256 public pauseSupportVotes;
    uint256 public pauseOppositionVotes;

    modifier onlyFactory() {
        if (msg.sender != factory) revert OnlyFactory();
        _;
    }

    modifier onlyCreator() {
        if (msg.sender != creator) revert OnlyCreator();
        _;
    }

    modifier onlyMember() {
        if (!members[msg.sender].isActive) revert OnlyMember();
        _;
    }

    modifier onlyForming() {
        if (status != GroupStatus.FORMING) revert OnlyForming();
        _;
    }

    modifier onlyActive() {
        if (status != GroupStatus.ACTIVE) revert OnlyActive();
        _;
    }

    modifier onlyPaused() {
        if (status != GroupStatus.PAUSED) revert OnlyPaused();
        _;
    }

    constructor(
        address factory_,
        string memory name_,
        address cUSDToken_,
        uint256 contributionAmount_,
        uint256 frequencyInDays_,
        uint256 maxMembers_,
        address creator_,
        bytes32 inviteCode_
    ) {
        if (factory_ == address(0) || cUSDToken_ == address(0) || creator_ == address(0)) {
            revert InvalidAddress();
        }

        if (inviteCode_ == bytes32(0)) {
            revert InvalidAddress();
        }

        if (contributionAmount_ == 0 || frequencyInDays_ == 0 || maxMembers_ < MIN_GROUP_SIZE) {
            revert InvalidState();
        }

        factory = factory_;
        creator = creator_;
        cUSDToken = cUSDToken_;
        name = name_;
        contributionAmount = contributionAmount_;
        frequencyInDays = frequencyInDays_;
        maxMembers = maxMembers_;
        inviteCode = inviteCode_;
        status = GroupStatus.FORMING;

        _addMemberInternal(creator_);
    }

    function addMember(address newMember) external onlyFactory onlyForming {
        if (newMember == address(0)) revert InvalidAddress();
        if (_memberRoster.length >= maxMembers) revert GroupFull();
        if (members[newMember].isActive) revert InvalidState();

        _addMemberInternal(newMember);
    }

    function startGroup() external onlyCreator onlyForming {
        if (_memberRoster.length < MIN_GROUP_SIZE) revert InsufficientMembers();

        delete memberOrder;
        address[] memory roster = _copyRoster();
        memberOrder = _shuffleRoster(roster);
        status = GroupStatus.ACTIVE;
        currentRound = 0;
        payoutIndex = 0;
        roundStartTime = block.timestamp;

        emit GroupStarted(roundStartTime, memberOrder);
    }

    function contribute() external nonReentrant onlyMember onlyActive {
        if (block.timestamp >= _roundDeadline()) revert RoundExpired();

        Member storage member = members[msg.sender];
        if (member.hasContributedThisRound) revert AlreadyContributed();

        IERC20 paymentToken = IERC20(cUSDToken);
        if (paymentToken.allowance(msg.sender, address(this)) < contributionAmount) revert AllowanceTooLow();

        paymentToken.safeTransferFrom(msg.sender, address(this), contributionAmount);

        member.hasContributedThisRound = true;
        member.totalContributed += contributionAmount;

        emit ContributionReceived(msg.sender, currentRound, contributionAmount);

        if (_allMembersContributed()) {
            _executeRoundPayout();
        }
    }

    function executePayout() external nonReentrant onlyActive returns (address recipient, uint256 amount) {
        if (!canExecutePayout()) revert InvalidState();
        (recipient, amount) = _executeRoundPayout();
    }

    function canExecutePayout() public view returns (bool) {
        return status == GroupStatus.ACTIVE && memberOrder.length > 0 && _allMembersContributed();
    }

    function currentPayoutRecipient() public view returns (address) {
        if (memberOrder.length == 0) {
            return address(0);
        }

        if (payoutIndex < memberOrder.length) {
            return memberOrder[payoutIndex];
        }

        return memberOrder[memberOrder.length - 1];
    }

    function memberCount() external view returns (uint256) {
        return _memberRoster.length;
    }

    function currentCycle() external view returns (uint256) {
        return currentRound;
    }

    function isCompleted() external view returns (bool) {
        return status == GroupStatus.COMPLETED;
    }

    function isMember(address account) external view returns (bool) {
        return members[account].isActive;
    }

    function token() external view returns (address) {
        return cUSDToken;
    }

    function groupName() external view returns (string memory) {
        return name;
    }

    function cycleStartedAt() external view returns (uint256) {
        return roundStartTime;
    }

    function cycleDuration() external view returns (uint256) {
        return frequencyInDays * 1 days;
    }

    function emergencyExit() external onlyMember onlyForming {
        _removeActiveMember(msg.sender);
    }

    function voteOnPause(bool pause) external onlyMember {
        if (status != GroupStatus.ACTIVE && status != GroupStatus.PAUSED) revert InvalidState();

        bool hasRecorded = _pauseVoteRecorded[msg.sender];
        bool previousChoice = pauseVotes[msg.sender];

        if (hasRecorded) {
            if (previousChoice == pause) {
                return;
            }

            if (previousChoice) {
                pauseSupportVotes -= 1;
            } else {
                pauseOppositionVotes -= 1;
            }
        } else {
            _pauseVoteRecorded[msg.sender] = true;
        }

        pauseVotes[msg.sender] = pause;

        if (pause) {
            pauseSupportVotes += 1;
        } else {
            pauseOppositionVotes += 1;
        }
    }

    function pauseRound(bool pause) external onlyCreator {
        if (pause) {
            if (status != GroupStatus.ACTIVE) revert InvalidState();
            if (!_hasVoteThreshold(pauseSupportVotes)) revert InsufficientVotes();
            status = GroupStatus.PAUSED;
        } else {
            if (status != GroupStatus.PAUSED) revert InvalidState();
            if (!_hasVoteThreshold(pauseOppositionVotes)) revert InsufficientVotes();
            status = GroupStatus.ACTIVE;
        }

        _clearPauseVotes();
    }

    function getGroupState()
        external
        view
        returns (GroupState memory state)
    {
        state.status = status;
        state.factory = factory;
        state.creator = creator;
        state.cUSDToken = cUSDToken;
        state.name = name;
        state.contributionAmount = contributionAmount;
        state.frequencyInDays = frequencyInDays;
        state.maxMembers = maxMembers;
        state.currentRound = currentRound;
        state.roundStartTime = roundStartTime;
        state.payoutIndex = payoutIndex;
        state.inviteCode = inviteCode;
        state.memberOrder = memberOrder;
        state.activeMembers = _copyRoster();
        state.pauseSupportVotes = pauseSupportVotes;
        state.pauseOppositionVotes = pauseOppositionVotes;
        state.remainingTime = getRemainingTime();
    }

    function getRemainingTime() public view returns (uint256) {
        if (status == GroupStatus.COMPLETED || roundStartTime == 0) {
            return 0;
        }

        uint256 deadline = _roundDeadline();
        if (block.timestamp >= deadline) {
            return 0;
        }

        return deadline - block.timestamp;
    }

    function _executeRoundPayout() internal returns (address recipient, uint256 amount) {
        if (!canExecutePayout()) revert InvalidState();

        recipient = memberOrder[payoutIndex];
        amount = contributionAmount * memberOrder.length;

        uint256 balance = IERC20(cUSDToken).balanceOf(address(this));
        if (balance < amount) revert InvalidState();

        uint256 completedRound = currentRound;

        currentRound += 1;
        payoutIndex += 1;
        roundStartTime = block.timestamp;

        for (uint256 index = 0; index < memberOrder.length; ) {
            address memberAddress = memberOrder[index];
            Member storage member = members[memberAddress];
            member.hasContributedThisRound = false;
            member.roundsCompleted += 1;

            unchecked {
                ++index;
            }
        }

        IERC20(cUSDToken).safeTransfer(recipient, amount);

        emit RoundCompleted(completedRound, recipient, amount);

        if (currentRound >= memberOrder.length) {
            status = GroupStatus.COMPLETED;
            _mintCompletionCredential();
            emit GroupCompleted(currentRound, block.timestamp);
        }

        return (recipient, amount);
    }

    function _addMemberInternal(address account) internal {
        Member storage member = members[account];
        member.wallet = account;
        member.hasContributedThisRound = false;
        member.totalContributed = 0;
        member.roundsCompleted = 0;
        member.isActive = true;

        _memberRosterIndex[account] = _memberRoster.length + 1;
        _memberRoster.push(account);

        emit MemberAdded(account, block.timestamp);
    }

    function _removeActiveMember(address account) internal {
        uint256 rosterIndex = _memberRosterIndex[account];
        if (rosterIndex == 0) revert InvalidState();

        uint256 index = rosterIndex - 1;
        uint256 lastIndex = _memberRoster.length - 1;

        if (index != lastIndex) {
            address lastMember = _memberRoster[lastIndex];
            _memberRoster[index] = lastMember;
            _memberRosterIndex[lastMember] = rosterIndex;
        }

        _memberRoster.pop();
        delete _memberRosterIndex[account];

        Member storage member = members[account];
        member.hasContributedThisRound = false;
        member.totalContributed = 0;
        member.roundsCompleted = 0;
        member.isActive = false;
    }

    function _shuffleRoster(address[] memory roster) internal view returns (address[] memory) {
        if (roster.length < 2) {
            return roster;
        }

        uint256 seed = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), address(this), creator, roster.length, block.timestamp))
        );

        for (uint256 index = roster.length - 1; index > 0; ) {
            uint256 swapIndex = uint256(keccak256(abi.encodePacked(seed, index))) % (index + 1);
            (roster[index], roster[swapIndex]) = (roster[swapIndex], roster[index]);

            unchecked {
                --index;
            }
        }

        return roster;
    }

    function _copyRoster() internal view returns (address[] memory activeMembers_) {
        activeMembers_ = new address[](_memberRoster.length);

        for (uint256 index = 0; index < _memberRoster.length; ) {
            activeMembers_[index] = _memberRoster[index];

            unchecked {
                ++index;
            }
        }
    }

    function _clearPauseVotes() internal {
        for (uint256 index = 0; index < _memberRoster.length; ) {
            address memberAddress = _memberRoster[index];
            pauseVotes[memberAddress] = false;
            _pauseVoteRecorded[memberAddress] = false;

            unchecked {
                ++index;
            }
        }

        pauseSupportVotes = 0;
        pauseOppositionVotes = 0;
    }

    function _hasVoteThreshold(uint256 voteCount) internal view returns (bool) {
        if (_memberRoster.length == 0) {
            return false;
        }

        return voteCount * 100 >= _memberRoster.length * 60;
    }

    function _roundDeadline() internal view returns (uint256) {
        return roundStartTime + (frequencyInDays * 1 days);
    }

    function _allMembersContributed() internal view returns (bool) {
        if (memberOrder.length == 0) {
            return false;
        }

        for (uint256 index = 0; index < memberOrder.length; ) {
            address memberAddress = memberOrder[index];
            Member storage member = members[memberAddress];

            if (!member.isActive || !member.hasContributedThisRound) {
                return false;
            }

            unchecked {
                ++index;
            }
        }

        return true;
    }

    function _mintCompletionCredential() internal {}
}