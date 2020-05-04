pragma solidity ^0.6.0;
import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is Ownable, ERC20 {
    // rates Wei / Token, eg: 1 Wei = 1 tokens
    uint256 public tokenRates;

    event RatesSetted(uint256 indexed _rates, uint256 indexed _time);

    constructor (address payable _owner2, address payable _owner3, uint256 _rates) 
    Ownable(_owner2, _owner3 ) ERC20("DefiToken", "DFT")
    public {
        require(_rates > 0, "Invalid-rates");
        tokenRates = _rates;
        _mint(owner, 1000000);
        _mint(owner2, 1000000);
        _mint(owner3, 1000000);
        emit RatesSetted(_rates, now);
    }
    receive() external payable {
        uint256 transferAmount = msg.value / 3;
        transferETH(transferAmount);
    }

    function setRates(uint256 _newRates) onlyOwner public{
        require(_newRates > 0, "Invalid-rates");
        tokenRates = _newRates;
        emit RatesSetted(_newRates, now);
    }
    
    function payTokenViaETH() public payable {
        require(msg.value > 0, "Invalid-value");
        uint256 mintAmount = msg.value * tokenRates;
        uint256 transferAmount = msg.value/3;
        require(transferETH(transferAmount), "Can-not-transfer");
        _mint(msg.sender, mintAmount);
    }

    function transferETH(uint256 _transferAmount) internal returns (bool){
        owner.transfer(_transferAmount);
        owner2.transfer(_transferAmount);
        owner3.transfer(_transferAmount);
        return true;
    }    
}