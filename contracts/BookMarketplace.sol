//SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract BookMarketplace {

    enum State{
        Purchased,
        Activated,
        Deactivated
    }

    struct Book {
        uint id; 
        uint price;
        bytes32 proof;
        address owner;
        State state; 
    }

    bool public isStopped = false;

    // mapping of bookHash to Book Data
    mapping(bytes32 => Book) private ownedBooks;

    //mapping of bookId to book Hash
    mapping(uint => bytes32) private ownedBookHash;

    // number of all Books + id of the Books
    uint private totalOwnedBooks;

    //admin of the contract
    address payable private owner;

  constructor() {
    setContractOwner(msg.sender);
  }

    /// Book has invalid state!
    error InvalidState();

    /// Order has not be created successfully
    error OrderIsNotCreated();

    /// Book already owned!
    error BookHasOwner();

    /// Sender is not owner of the book!
    error SenderIsNotBookOwner();

    /// Only owner has access!
    error OnlyOwner();


    modifier onlyOwner() {
        if (msg.sender != getContractOwner()){
            revert OnlyOwner();
        }
        _;
    }

    modifier onlyIfNotStopped(){
        require(!isStopped);
        _;
    }

    modifier onlyIfStopped(){
        require(isStopped);
        _;
    }

    // allows money to be transfered to smart contract
    receive() external payable {} 

    // allow contract owner only to withdraw funds from smart contract
    function withdraw(uint amount) external onlyOwner{
       (bool success, ) = owner.call{value: amount}("");
       require(success, "Transfer failed");
    }

    // allow contract owner to withdraw all funds from contract only when contract is stopped
    // in case of emergency
    function withdrawAll() external onlyIfStopped onlyOwner{
       (bool success, ) = owner.call{value: address(this).balance}("");
       require(success, "Transfer failed");
    }

    // destroy smart contract from blockchain and transfer all remaining Ether in contract to owner.
    function selfDestruct() external onlyIfStopped onlyOwner{
        selfdestruct(owner);
    }


    function stopContract() external onlyOwner{
        isStopped = true;
    }

     function restartContract() external onlyOwner{
        isStopped = false;
    }

    function purchaseBook(bytes16 bookId, bytes32 proof) external onlyIfNotStopped payable{
        bytes32 bookHash = keccak256(abi.encodePacked(bookId, msg.sender));
        
        if (hasBookOwnership(bookHash)) {
            revert BookHasOwner();
        }
        
        uint id = totalOwnedBooks++;

        ownedBookHash[id] = bookHash;
        ownedBooks[bookHash] = Book({
            id: id,
            price: msg.value,
            proof: proof,
            state: State.Purchased,
            owner: msg.sender
        });
    }

    function repurchaseBook(bytes32 bookHash) external onlyIfNotStopped payable {
        if (!isOrderCreated(bookHash)) {
            revert OrderIsNotCreated();
        }

        if (!hasBookOwnership(bookHash)) {
            revert SenderIsNotBookOwner();
        }

        Book storage book = ownedBooks[bookHash];

        if (book.state != State.Deactivated) {
            revert InvalidState();
        }

        book.state = State.Purchased;
        book.price = msg.value;
    }
            

    function activateOrder(bytes32 bookHash)external onlyIfNotStopped onlyOwner{
        if(!isOrderCreated(bookHash)){
            revert OrderIsNotCreated();
        }
        Book storage book = ownedBooks[bookHash];
        if (book.state != State.Purchased){
            revert InvalidState();
        }
        book.state = State.Activated;
    }


    function deactivateOrder(bytes32 bookHash)external onlyIfNotStopped onlyOwner{
        if (!isOrderCreated(bookHash)) {
            revert OrderIsNotCreated();
            }
            
        Book storage book = ownedBooks[bookHash];

        if (book.state != State.Purchased) {
            revert InvalidState();
        }

        (bool success, ) = book.owner.call{value: book.price}("");
        require(success, "Transfer failed!");

        book.state = State.Deactivated;
        book.price = 0;
    }


    function transferOwnership(address newOwner) external onlyOwner{
        setContractOwner(newOwner);
    }

    function getOrderCount() external view returns(uint){
        return totalOwnedBooks;
    }

    function getBookHashAtIndex(uint index) external view returns(bytes32){
        return ownedBookHash[index];
    }
    
    function getBookByHash(bytes32 bookHash) external view returns(Book memory){
        return ownedBooks[bookHash];
    }

    function getContractOwner() public view returns(address){
        return owner;
    }

    function hasBookOwnership(bytes32 bookHash) private view returns(bool){
        return ownedBooks[bookHash].owner == msg.sender;
    }

    function isOrderCreated(bytes32 bookHash) private view returns(bool){
        return ownedBooks[bookHash].owner != 0x0000000000000000000000000000000000000000;
    }


    function setContractOwner(address newOwner) private{
        owner = payable(newOwner);

    }
}