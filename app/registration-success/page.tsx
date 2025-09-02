export default function RegistrationSuccess() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full'>
                <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                        className='w-8 h-8 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                        />
                    </svg>
                </div>

                <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                    Account Created Successfully!
                </h1>

                <p className='text-gray-600 mb-6'>
                    Your Tata Mali account has been created. You should receive a welcome message on
                    WhatsApp shortly.
                </p>

                <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                    <p className='text-green-800 text-sm'>
                        You can now close this page and return to WhatsApp to start using your Tata
                        Mali account.
                    </p>
                </div>

                <div className='text-sm text-gray-500'>
                    <p>What you can do now:</p>
                    <ul className='mt-2 space-y-1'>
                        <li>• Check your account balance</li>
                        <li>• Send money to contacts</li>
                        <li>• Receive payments</li>
                        <li>• Download the mobile app</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
