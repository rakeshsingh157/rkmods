import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'RKMODS - Developer Portal',
  description: 'Publish and manage your apps on the premium RKMODS store.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#131b2e',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
