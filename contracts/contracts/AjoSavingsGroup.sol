// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IAjoGroup.sol";

contract AjoSavingsGroup is IAjoGroup {
    using SafeERC20 for IERC20;

    address public immutable factory;
    address public immutable creator;
    address public immutable override token;
    bytes32 public immutable override inviteCode;
    string public groupName;
    uint256 public override contributionAmount;
    uint256 public immutable maxMembers;
    uint256 public immutable frequencyInDays;
    uint256 public immutable cycleDuration;
    uint256 public override currentCycle;
    uint256 public cycleStartedAt;
    bool public override isCompleted;

    address[] private _members;
    mapping(address => bool) private _isMember;
    mapping(uint256 => mapping(address => bool)) public override hasContributed;

    modifier onlyFactory() {
        require(msg.sender == factory, "AjoSavingsGroup: only factory");
        _;
    }

    modifier onlyMember() {
        require(_isMember[msg.sender], "AjoSavingsGroup: not a member");
        _;
    }

    modifier whenActive() {
        require(!isCompleted, "AjoSavingsGroup: completed");
        _;
    }

    constructor(
        address factory_,
        string memory groupName_,
        address token_,
        uint256 contributionAmount_,
        uint256 frequencyInDays_,
        uint256 maxMembers_,
        address creator_,
        bytes32 inviteCode_
    ) {
        require(factory_ != address(0), "AjoSavingsGroup: factory required");
        require(token_ != address(0), "AjoSavingsGroup: token required");
        require(creator_ != address(0), "AjoSavingsGroup: creator required");
        require(inviteCode_ != bytes32(0), "AjoSavingsGroup: invite code required");
        require(contributionAmount_ > 0, "AjoSavingsGroup: amount required");
        require(maxMembers_ > 1, "AjoSavingsGroup: max members too low");
        require(frequencyInDays_ > 0, "AjoSavingsGroup: frequency required");

        factory = factory_;
        creator = creator_;
        groupName = groupName_;
        token = token_;
        inviteCode = inviteCode_;
        contributionAmount = contributionAmount_;
        maxMembers = maxMembers_;
        frequencyInDays = frequencyInDays_;
        cycleDuration = frequencyInDays_ * 1 days;
        cycleStartedAt = block.timestamp;

        _addMember(creator_);
    }

    function addMember(address account) external override onlyFactory whenActive {
        require(account != address(0), "AjoSavingsGroup: zero address");
        require(!_isMember[account], "AjoSavingsGroup: already joined");
        require(_members.length < maxMembers, "AjoSavingsGroup: group full");
        _addMember(account);
    }

    function contribute() external override onlyMember whenActive {
        require(!hasContributed[currentCycle][msg.sender], "AjoSavingsGroup: already contributed");
        hasContributed[currentCycle][msg.sender] = true;
        IERC20(token).safeTransferFrom(msg.sender, address(this), contributionAmount);
        emit ContributionMade(msg.sender, contributionAmount, currentCycle);
    }

    function canExecutePayout() public view override returns (bool) {
        if (isCompleted || _members.length == 0) {
            return false;
        }

        if (block.timestamp < cycleStartedAt + cycleDuration) {
            return false;
        }

        for (uint256 index = 0; index < _members.length; index++) {
            if (!hasContributed[currentCycle][_members[index]]) {
                return false;
            }
        }

        return true;
    }

    function executePayout() external override whenActive returns (address recipient, uint256 amount) {
        require(canExecutePayout(), "AjoSavingsGroup: payout not ready");

        uint256 executedCycle = currentCycle;
        recipient = currentPayoutRecipient();
        amount = IERC20(token).balanceOf(address(this));
        require(amount > 0, "AjoSavingsGroup: empty pool");

        currentCycle = executedCycle + 1;
        cycleStartedAt = block.timestamp;

        if (currentCycle >= _members.length) {
            isCompleted = true;
        }

        IERC20(token).safeTransfer(recipient, amount);
        emit PayoutExecuted(recipient, amount, executedCycle);
    }

    function currentPayoutRecipient() public view override returns (address) {
        require(_members.length > 0, "AjoSavingsGroup: no members");
        if (currentCycle >= _members.length) {
            return _members[_members.length - 1];
        }
        return _members[currentCycle];
    }

    function memberCount() external view override returns (uint256) {
        return _members.length;
    }

    function members(uint256 index) external view override returns (address) {
        return _members[index];
    }

    function isMember(address account) external view override returns (bool) {
        return _isMember[account];
    }

    function _addMember(address account) internal {
        require(account != address(0), "AjoSavingsGroup: zero address");
        _members.push(account);
        _isMember[account] = true;
        emit MemberJoined(account);
    }
}
