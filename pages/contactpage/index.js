import { Button } from '@components/ui/common'
import { BaseLayout } from '@components/ui/layout'


export default function Contact() {
  return (
    <>
    <h2 className="text-4xl font-normal text-center mt-8 mb-6">
        Dispute a transaction
    </h2>

    <div className="w-full md:w-96 md:max-w-full mx-auto">
      
      <div className="p-6 border border-gray-300 sm:rounded-md">
        <form method="POST">
          <label className="block mb-6">
            <span className="text-gray-700">Enter your name</span>
            <input
              type="text"
              name="name"
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Full Name..."
            />
          </label>
          <label className="block mb-6">
            <span className="text-gray-700">Email address</span>
            <input
              name="email"
              type="email"
              className="block w-full mt-2 border-gray-300 rounded-md  focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="example@bookstore.com"
              required
            />
          </label>
          <label className="block mb-6">
            <span className="text-gray-700"> Order Proof Hash </span>
            <input
              name="OrderHash"
              type="OrderHash"
              className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="0x000..."
              required
            />
          </label>
          <label className="block mb-6">
            <span className="text-gray-700">Message</span>
            <textarea
              name="message"
              className="block w-full mt-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows="4"
              placeholder="Tell us how we can help."
            ></textarea>
          </label>
          <div className="mb-6">
            <Button
              variant = "purple"
            >
              Contact Us
            </Button>
          </div>
        </form>
      </div>
    </div>
  </>
  )
}

Contact.Layout = BaseLayout