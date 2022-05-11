
import { useWeb3 } from "@components/providers"
import { Button, ActiveLink } from "@components/ui/common"
import { useAccount } from "@components/hooks/web3"
import { useRouter } from "next/router"


export default function Navbar() {
  const { connect, isLoading, requireInstall } = useWeb3()
  const { account } = useAccount()
  const {pathname} = useRouter()
  
  

  return (
    <section>
      <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
        <nav className="relative" aria-label="Global">
          <div className="flex flex-col xs:flex-row justify-between items-center">
            <div>
              <ActiveLink href="/" >
                <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                  Home
                </a>
              </ActiveLink>
              <ActiveLink href="/marketplace">
                <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                  Marketplace
                </a>
              </ActiveLink>
              <ActiveLink href="/contactpage">
                <a className="font-medium mr-8 text-gray-500 hover:text-gray-900">
                  Contact Us
                </a>
              </ActiveLink>
            </div>
            <div className="text-center">
              <ActiveLink href="/guide">
                <a className="font-medium sm:mr-8 mr-1 text-gray-500 hover:text-gray-900">
                  Guide
                </a>
              </ActiveLink>
              {
                isLoading ?
                <Button
                  disabled={true}
                  onClick={connect} >
                    Loading...
                </Button> : 
                account.data ?
                <Button
                hoverable={false}
                variant="green"
                className="cursor-default"
                >
                  Connected! {account.isAdmin && "Admin"}
                </Button> :
                requireInstall ?
                <Button
              onClick={() => window.open("https://metamask.io/download/", "_blank")}>
                Install MetaMask
            </Button> :
                <Button
                onClick={connect}>
                  Connect Wallet
              </Button> 
              
              }
            
            </div>
          </div>
        </nav>
      </div>
      { account.data &&
        !pathname.includes("/marketplace") && 
        <div className="flex justify-end pt-1 sm:px-6 lg:px-8">
          <div className="text-white bg-green-600 rounded-md p-2">
            {account.data}
          </div>
        </div>
      }
    </section>
  )
}
