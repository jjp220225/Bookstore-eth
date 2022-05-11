import { useAdmin, useManagedBooks } from '@components/hooks/web3'
import { useWeb3 } from '@components/providers'
import { Button, Message } from '@components/ui/common'
import ManagedBookCard from '@components/ui/book/card/Managed'
import { BaseLayout } from '@components/ui/layout'
import { MarketHeader } from '@components/ui/marketplace'
import { normalizeOwnedBook } from '@utils/normalize'
import { useState, useEffect } from "react"

const VerificationInput = ({onVerify}) => {
  const [ email, setEmail ] = useState("")

  return (
    <div className="flex mr-2 relative rounded-md">
      <input
        value={email}
        onChange={({target: {value}}) => setEmail(value)}
        type="text"
        name="account"
        id="account"
        className="w-96 focus:ring-indigo-500 shadow-md focus:border-indigo-500 block pl-7 p-4 sm:text-sm border-gray-300 rounded-md"
        placeholder="0x2341ab..." />
      <Button
        onClick={() => {
          onVerify(email)
        }}
      >
        Verify
      </Button>
    </div>
  )
  }


export default function ManagedBooks() {
  const [ proofOfOwnership, setProofOfOwnership ] = useState({})
  const { web3, contract } = useWeb3()
  const { account } = useAdmin({redirectTo: "/marketplace"})
  const { managedBooks } = useManagedBooks(account)



  
  // verify book with email proof
  const verifyOrder = (email, { hash, proof }) => {
    if (!email){
      return
    }
    const emailHash = web3.utils.sha3(email)
    const proofToCheck = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: hash }
    )

    proofToCheck === proof ?
      setProofOfOwnership({
        ...proofOfOwnership,
        [hash]: true
      }) :
      setProofOfOwnership({
        ...proofOfOwnership,
        [hash]: false
      })
  }

  const activateOrder = async (bookHash) => {
    try {
      await contract.methods.activateOrder(bookHash)
        .send({
          from: account.data
        })
    } catch(e) {
      console.error(e.message)
    }
  }

  const deactivateOrder = async (bookHash) => {
    try {
      await contract.methods.deactivateOrder(bookHash)
        .send({
          from: account.data
        })
    } catch(e) {
      console.error(e.message)
    }
  }

  if (!account.isAdmin){
    return null
  }



  return (
    <>
      <MarketHeader />
      <section className="grid grid-cols-1">
        { managedBooks.data?.map(book =>
          <ManagedBookCard
            key={book.ownedBookId}
            book={book}
          >
            <VerificationInput
              onVerify={email => {
                verifyOrder(email, {
                  hash: book.hash,
                  proof: book.proof
                })
              }}
            />
            { proofOfOwnership[book.hash] &&
              <div className="mt-2">
                <Message>
                  Verified!
                </Message>
              </div>
            }
            { proofOfOwnership[book.hash] === false &&
              <div className="mt-2">
                <Message type="danger">
                  Wrong Proof!
                </Message>
              </div>
            }
                { book.state === "purchased" &&
              <div className="mt-2">
                <Button
                  onClick={() => activateOrder(book.hash)}
                  variant="green">
                  Activate
                </Button>
                <Button
                  onClick={() => deactivateOrder(book.hash)}
                  variant="red">
                  Deactivate
                </Button>
              </div>
            }
          </ManagedBookCard>
        )}
      </section>
    </>
  )
  
}
ManagedBooks.Layout = BaseLayout
