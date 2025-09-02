import Image from 'next/image'
export default function DownloadPage() {
    return (
        <main style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
            <h1>Download App</h1>
            <p>Get the Tata Mali app for your device:</p>
            <ul>
                <li>
                    <a
                        href='https://play.google.com/store/apps/details?id=com.tatamali'
                        target='_blank'
                        rel='noopener'
                    >
                        Android (Google Play)
                    </a>
                </li>
                <li>
                    <a href='https://apps.apple.com/app/id000000' target='_blank' rel='noopener'>
                        iOS (App Store)
                    </a>
                </li>
            </ul>
            <h2>Scan QR to Download</h2>
            <Image src='/qrcode-app.png' alt='App QR Code' width={200} height={200} />
            <p>
                Or visit <b>tatamali.com/download</b> on your phone.
            </p>
        </main>
    )
}
