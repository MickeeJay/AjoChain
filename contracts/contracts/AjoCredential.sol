// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract AjoCredential is ERC721, Ownable {
    using Strings for uint256;

    struct CredentialData {
        address recipient;
        address groupContract;
        uint256 cyclesCompleted;
        uint256 totalSaved;
        uint256 completedAt;
        string groupName;
    }

    error InvalidAddress();
    error InvalidCredentialData();
    error NonTransferableToken();
    error UnauthorizedGroup();

    event GroupAuthorized(address indexed groupContract);
    event CredentialMinted(uint256 indexed tokenId, address indexed recipient, address indexed groupContract, uint256 totalSaved);

    uint256 private _nextTokenId = 1;

    mapping(address => bool) public authorizedGroups;
    mapping(uint256 => CredentialData) public credentials;
    mapping(address => uint256[]) private _userCredentials;

    constructor() ERC721("AjoChain Savings Certificate", "AJOCERT") Ownable() {}

    function authorizeGroup(address groupContract) external onlyOwner {
        if (groupContract == address(0) || groupContract.code.length == 0) {
            revert InvalidAddress();
        }

        authorizedGroups[groupContract] = true;
        emit GroupAuthorized(groupContract);
    }

    function mint(address recipient, CredentialData calldata data) external returns (uint256 tokenId) {
        if (!authorizedGroups[msg.sender] || msg.sender.code.length == 0) {
            revert UnauthorizedGroup();
        }

        if (
            recipient == address(0) ||
            data.recipient != recipient ||
            data.groupContract != msg.sender ||
            data.groupContract == address(0) ||
            data.cyclesCompleted == 0 ||
            data.totalSaved == 0 ||
            data.completedAt == 0
        ) {
            revert InvalidCredentialData();
        }

        tokenId = _nextTokenId;
        _nextTokenId = tokenId + 1;

        _safeMint(recipient, tokenId);

        credentials[tokenId] = CredentialData({
            recipient: recipient,
            groupContract: data.groupContract,
            cyclesCompleted: data.cyclesCompleted,
            totalSaved: data.totalSaved,
            completedAt: data.completedAt,
            groupName: data.groupName
        });

        _userCredentials[recipient].push(tokenId);

        emit CredentialMinted(tokenId, recipient, data.groupContract, data.totalSaved);
    }

    function getCredentials(address user) external view returns (uint256[] memory) {
        uint256[] storage storedTokens = _userCredentials[user];
        uint256[] memory tokens = new uint256[](storedTokens.length);

        for (uint256 index = 0; index < storedTokens.length; ) {
            tokens[index] = storedTokens[index];

            unchecked {
                ++index;
            }
        }

        return tokens;
    }

    function getUserReputation(address user) external view returns (uint256 reputation) {
        uint256[] storage storedTokens = _userCredentials[user];

        for (uint256 index = 0; index < storedTokens.length; ) {
            reputation += credentials[storedTokens[index]].cyclesCompleted;

            unchecked {
                ++index;
            }
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        CredentialData storage credential = credentials[tokenId];
        string memory image = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1200\" height=\"675\" viewBox=\"0 0 1200 675\">",
                            "<defs><linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">",
                            "<stop offset=\"0%\" stop-color=\"#34d399\"/>",
                            "<stop offset=\"100%\" stop-color=\"#065f46\"/>",
                            "</linearGradient></defs>",
                            "<rect width=\"1200\" height=\"675\" rx=\"42\" fill=\"url(#bg)\"/>",
                            "<rect x=\"64\" y=\"64\" width=\"1072\" height=\"547\" rx=\"32\" fill=\"rgba(255,255,255,0.08)\" stroke=\"rgba(255,255,255,0.25)\"/>",
                            "<text x=\"96\" y=\"170\" fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"78\" font-weight=\"700\">AjoChain</text>",
                            "<text x=\"96\" y=\"245\" fill=\"#dcfce7\" font-family=\"Arial, sans-serif\" font-size=\"40\">Savings Certificate</text>",
                            "<text x=\"96\" y=\"360\" fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"38\">Cycles Completed</text>",
                            "<text x=\"96\" y=\"470\" fill=\"#ffffff\" font-family=\"Arial, sans-serif\" font-size=\"104\" font-weight=\"700\">",
                            credential.cyclesCompleted.toString(),
                            "</text>",
                            "</svg>"
                        )
                    )
                )
            )
        );

        string memory json = string(
            abi.encodePacked(
                "{\"name\":\"AjoChain Savings Certificate\",\"description\":\"On-chain certificate issued to members who complete a savings cycle in AjoChain.\",\"image\":\"",
                image,
                "\",\"attributes\":[",
                "{\"trait_type\":\"groupName\",\"value\":\"",
                credential.groupName,
                "\"},",
                "{\"trait_type\":\"cyclesCompleted\",\"display_type\":\"number\",\"value\":",
                credential.cyclesCompleted.toString(),
                "},",
                "{\"trait_type\":\"totalSaved\",\"display_type\":\"number\",\"value\":",
                credential.totalSaved.toString(),
                "},",
                "{\"trait_type\":\"completedAt\",\"display_type\":\"date\",\"value\":",
                credential.completedAt.toString(),
                "}]}"
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    function _beforeTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual override {
        if (from != address(0)) {
            revert NonTransferableToken();
        }

        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}