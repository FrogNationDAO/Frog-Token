// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract WagMeToFrog is Ownable {

    IERC20 public immutable frogToken;
    IERC20 public immutable wagMeToken;

    event Claimed(address indexed owner, uint256 amount);

    constructor(
        address frogTokenAddress_,
        address wagMeTokenAddress_
    ) {
        frogToken = IERC20(frogTokenAddress_);
        wagMeToken = IERC20(wagMeTokenAddress_);
    }

    function claim(
    ) public {
        address account = msg.sender;
        uint256 balance = wagMeToken.balanceOf(account);
        require(wagMeToken.allowance(account, address(this)) >= balance, "NOT_APPROVED");

        wagMeToken.transferFrom(account, address(this), balance);
        frogToken.transfer(account, balance);

        emit Claimed(account, balance);
    }

    function withdraw(
    ) public onlyOwner {
        uint256 balance = frogToken.balanceOf(address(this));
        frogToken.transfer(msg.sender, balance);
    }
}
