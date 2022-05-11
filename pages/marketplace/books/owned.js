import { useAccount, useOwnedBooks, useWalletInfo } from '@components/hooks/web3'
import { useWeb3 } from '@components/providers'
import { Button, Message } from '@components/ui/common'
import { OwnedCard } from '@components/ui/book'
import { BaseLayout } from '@components/ui/layout'
import { MarketHeader } from '@components/ui/marketplace'
import { getAllBooks } from '@content/books/fetcher'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function OwnedBooks({ books }) {
  const router = useRouter()
  const { account } = useAccount()
  const { requireInstall } = useWeb3()
  const { ownedBooks } = useOwnedBooks(books, account.data)

  return (
    <>
      <MarketHeader />
      <section className="grid grid-cols-1">
        {ownedBooks.isEmpty && (
          <div>
            <Message type="happy">
              <div>You dont own any Books!</div>
              <Link href="/marketplace">
                <a className="font-normal hover:underline">
                  <li>Click here to browse books</li>
                </a>
              </Link>
            </Message>
          </div>
        )}
        {account.isEmpty && (
          <div className="w-1/2">
            <Message type="warning">
              <div>Please connect to a Metamask account</div>
            </Message>
          </div>
        )}
        {requireInstall && (
          <div className="w-1/2">
            <Message type="warning">
              <div>Please install Metamask</div>
            </Message>
          </div>
        )}
        {ownedBooks.data?.map((book) => (
          <OwnedCard key={book.id} book={book}>
            {/* <Message>
                            My Custom Message!
                        </Message> */}
            <Button onClick={() => router.push(`/books/${book.slug}`)}>
              Read the Book
            </Button>
          </OwnedCard>
        ))}
      </section>
    </>
  )
}

export function getStaticProps() {
  const { data } = getAllBooks()
  return {
    props: {
      books: data,
    },
  }
}

OwnedBooks.Layout = BaseLayout
