pragma solidity ^0.6.0;

contract Ownable {
    address payable public owner;
    address payable public owner2;
    address payable public owner3;
    mapping (address=>bool) public isOwner;

    modifier isValidAddress(address _addr) {
        require(_addr != address(0), "Invalid-address");
        _;
    }

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Only-owner-can-take-action");
        _;
    }
    constructor (address payable _owner2, address payable _owner3) public {
        setOwner(_owner2, _owner3);
    }

    function setOwner(address payable _owner2, address payable _owner3) 
    isValidAddress(_owner2) isValidAddress(_owner3)
    internal {
        owner = msg.sender;
        owner2 = _owner2;
        owner3 = _owner3;
        isOwner[msg.sender] = true;
        isOwner[_owner2] = true;
        isOwner[_owner3] = true;
    }
}