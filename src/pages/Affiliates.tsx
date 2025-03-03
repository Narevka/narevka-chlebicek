
import { Button } from "@/components/ui/button";

const Affiliates = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Join Our Affiliate Program
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-xl text-gray-500">
            Earn up to 30% commission on every referral you bring to Chatbase.
          </p>
        </div>

        <div className="mt-16">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:py-16">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                      How it works
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-black text-white">
                            1
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Sign up</h3>
                          <p className="mt-2 text-gray-600">
                            Join our affiliate program for free. No minimum requirements to get started.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-black text-white">
                            2
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Promote</h3>
                          <p className="mt-2 text-gray-600">
                            Share your unique affiliate link on your website, social media, or email list.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-10 w-10 rounded-md bg-black text-white">
                            3
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">Earn</h3>
                          <p className="mt-2 text-gray-600">
                            Get paid 30% commission for every new customer who signs up through your link.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-8 shadow-lg">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Join Today</h3>
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                          Website (optional)
                        </label>
                        <input
                          type="url"
                          id="website"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div className="pt-4">
                        <Button className="w-full">Apply Now</Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliates;
