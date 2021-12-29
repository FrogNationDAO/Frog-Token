// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract FrogToken is ERC20Burnable {

    uint256 public constant MAX_SUPPLY = 6900000420 ether;

    constructor(
        address treasureAddress_
    ) ERC20("Frog Nation DAO", "FRG") {
        _mint(treasureAddress_, MAX_SUPPLY);
    }
}
