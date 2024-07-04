import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const projectId = '7f95d1f1c17ef0a74d200dce7ab17fef'; // Replace with your actual project ID

const metadata = {
  name: 'SolidVote',
  description: 'Web3Modal Example',
  url: 'https://solidvotedapp.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, arbitrum];
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
  mobileLinks: [
    {
      name: 'MetaMask',
      logo: 'https://avatars.githubusercontent.com/u/47768229?s=200&v=4',
      deepLink: 'https://metamask.app.link/dapp/YOUR_APP_URL', // Replace YOUR_APP_URL with your app's URL
    },
    {
      name: 'WalletConnect',
      logo: 'https://walletconnect.org/walletconnect-logo.png', // Replace with correct WalletConnect logo URL
      deepLink: 'wc://',
    },
  ],
  desktopLinks: [
    {
      name: 'MetaMask',
      logo: 'https://avatars.githubusercontent.com/u/47768229?s=200&v=4',
      deepLink: 'metamask://',
    },
    {
      name: 'WalletConnect',
      logo: 'https://walletconnect.org/walletconnect-logo.png', // Replace with correct WalletConnect logo URL
      deepLink: 'https://walletconnect.org',
    },
  ],
});

export function Web3ModalProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}