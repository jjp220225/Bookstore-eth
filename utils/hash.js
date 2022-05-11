

export const createBookHash = (web3) => (bookId, account) => {
    const hexBookId = web3.utils.utf8ToHex(bookId)
    const bookHash = web3.utils.soliditySha3(
        {type: "bytes16", value: hexBookId},
        {type: "address", value: account}
    )

    return bookHash
}