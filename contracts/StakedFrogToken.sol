// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakedFrogToken is IERC20 {

    string public constant symbol = "sFRG";
    string public constant name = "Staked Frog Nation DAO";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    uint256 public lockPeriod = 24 hours;

    mapping(address => uint256) private _lockedUntil;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    IERC20 public immutable token;

    constructor(
        address token_
    ) {
        token = IERC20(token_);
    }

    function approve(
        address spender,
        uint256 shares
    ) public override returns (bool) {
        _allowances[msg.sender][spender] = shares;
        emit Approval(msg.sender, spender, shares);
        return true;
    }

    function mint(
        uint256 amount
    ) public returns (bool) {
        _mint(msg.sender, amount);
        return true;
    }

    function burn(
        uint256 shares
    ) public returns (bool) {
        _burn(msg.sender, shares);
        return true;
    }

    function burnFrom(
        address account,
        uint256 shares
    ) public returns (bool) {
        _useAllowance(account, shares);
        _burn(account, shares);
        return true;
    }

    function transfer(
        address to,
        uint256 shares
    ) public returns (bool) {
        _transfer(msg.sender, to, shares);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 shares
    ) public returns (bool) {
        _useAllowance(from, shares);
        _transfer(from, to, shares);
        return true;
    }

    function allowance(
        address owner,
        address spender
    ) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function balanceOf(
        address account
    ) public view returns (uint256) {
        return _balances[account];
    }

    function lockedUntil(
        address account
    ) public view returns (uint256) {
        return _lockedUntil[account];
    }

    function _transfer(
        address from,
        address to,
        uint256 shares
    ) internal {
        require(from != address(0), "transfer from the zero address");
        require(to != address(0), "transfer to the zero address");
        require(block.timestamp >= _lockedUntil[from], "locked");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= shares, "transfer amount exceeds balance");

        _balances[from] = fromBalance - shares;
        _balances[to] += shares;

        emit Transfer(from, to, shares);
    }

    function _mint(
        address account,
        uint256 amount
    ) internal {
        require(account != address(0), "transfer to the zero address");

        uint256 totalTokens = token.balanceOf(address(this));
        uint256 shares = totalSupply == 0 ? amount : (amount * totalSupply) / totalTokens;

        _lockedUntil[account] = block.timestamp + lockPeriod;
        _balances[account] += shares;
        totalSupply += shares;

        token.transferFrom(account, address(this), amount);
        emit Transfer(address(0), account, shares);
    }

    function _burn(
        address account,
        uint256 shares
    ) internal {
        require(account != address(0), "transfer to the zero address");
        require(block.timestamp >= _lockedUntil[account], "locked");

        uint256 accountBalance = _balances[account];
        require(accountBalance >= shares, "burn amount exceeds balance");

        uint256 totalTokens = token.balanceOf(address(this));
        uint256 amount = (shares * totalTokens) / totalSupply;

        _balances[account] = accountBalance - shares;
        totalSupply -= shares;

        token.transfer(account, amount);
        emit Transfer(account, address(0), shares);
    }

    function _useAllowance(
        address from,
        uint256 shares
    ) internal {
        if (msg.sender != from) {
            uint256 spenderAllowance = _allowances[from][msg.sender];
            if (spenderAllowance != type(uint256).max) {
                require(spenderAllowance >= shares, "low allowance");
                _allowances[from][msg.sender] = spenderAllowance - shares;
            }
        }
    }

}
