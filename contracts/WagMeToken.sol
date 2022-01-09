// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WagMeToken is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialBalance_,
        address payable feeReceiver_
    ) payable ERC20(name_, symbol_) {
        _mint(feeReceiver_, initialBalance_);
    }
}
