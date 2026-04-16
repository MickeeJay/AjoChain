// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IAjoGroup.sol";

contract AjoSavingsGroup is IAjoGroup {
    using SafeERC20 for IERC20;

    address public immutable factory;
    IERC20 public immutable override token;
    string public groupName;
    uint256 public override contributionAmount;
    uint256 public immutable maxMembers;
    uint256 public immutable cycleDuration;
    uint256 public override currentCycle;
    uint256 public cycleStartedAt;
    bool public override isCompleted;

    address[] private _members;
    mapping(address => bool) private _isMember;
    mapping(uint256 => mapping(address => bool)) public override hasContributed;

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
        IERC20 token_,
        uint256 contributionAmount_,
        uint256 maxMembers_,
        uint256 cycleDuration_,
        address creator_
    ) {
        require(factory_ != address(0), "AjoSavingsGroup: factory required");
        require(address(token_) != address(0), "AjoSavingsGroup: token required");
        require(contributionAmount_ > 0, "AjoSavingsGroup: amount required");
        require(maxMembers_ > 1, "AjoSavingsGroup: max members too low");

        factory = factory_;
        groupName = groupName_;
        token = token_;
        contributionAmount = contributionAmount_;
        maxMembers = maxMembers_;
        cycleDuration = cycleDuration_;
        cycleStartedAt = block.timestamp;

        _addMember(creator_);
    }

    function joinGroup() external override whenActive {
        require(!_isMember[msg.sender], "AjoSavingsGroup: already joined");
        require(_members.length < maxMembers, "AjoSavingsGroup: group full");
        _addMember(msg.sender);
    }

    function contribute() external override onlyMember whenActive {
        require(!hasContributed[currentCycle][msg.sender], "AjoSavingsGroup: already contributed");
        hasContributed[currentCycle][msg.sender] = true;
        token.safeTransferFrom(msg.sender, address(this), contributionAmount);
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

        recipient = currentPayoutRecipient();
        amount = token.balanceOf(address(this));
        require(amount > 0, "AjoSavingsGroup: empty pool");

        token.safeTransfer(recipient, amount);
        emit PayoutExecuted(recipient, amount, currentCycle);

        currentCycle += 1;
        cycleStartedAt = block.timestamp;

        if (currentCycle >= _members.length) {
            isCompleted = true;
        }
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
