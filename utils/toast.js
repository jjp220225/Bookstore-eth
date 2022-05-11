// Toastify code src: https://fkhadra.github.io/react-toastify/promise#toastloading

import { toast } from "react-toastify"


export const withToast = (promise) => {
    position: toast.POSITION.BOTTOM_RIGHT,

    toast.promise(promise, {
      pending: {
        position: toast.POSITION.TOP_CENTER,
        render() {
          return (
            <div className="p-8 py-4">
                <p className="mb-2">
                    Your order is being processed...
                </p>
                <p>
                    Please be patient, this may take some time.
                </p>

            </div>)
        },
        icon: false,
      },
      success: {
        position: toast.POSITION.TOP_CENTER,
        render({ data }) {
          return (
            <div>
                <p className="font-bold">Tx: {data.transactionHash.slice(0,18)}...</p>
                <p>is successful </p>
                <a 
                    href={`https://ropsten.etherscan.io/tx/${data.transactionHash}`}
                    target="_blank"
                >
                    <i className="text-indigo-700 underline">See order info</i>
                </a>
            </div>
        )
        },
        // other options
        icon: '✅',
      },
      error: {
        position: toast.POSITION.TOP_CENTER,
        render({ data }) {
          // When the promise reject, data will contains the error
          return <div>{data.message ?? "Order was unsuccessful"}</div> 
        },
      },
    },
    {
        closeButton: true
    }
    
    )

}