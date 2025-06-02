export function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground bg-white/80 backdrop-blur-md">
      <div>
        Made with{' '}
        <a
          href="https://lethang7794.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          ❤️ and ☕
        </a>
        {' in '}
        <a
          href="https://github.com/lethang7794/aws-explorer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Vietnam 🇻🇳
        </a>
      </div>
      <div className="mt-2 text-xs">
        Icons are from{' '}
        <a
          className="underline text-yellow-600 hover:text-yellow-700"
          href="https://aws.amazon.com/architecture/icons/"
        >
          AWS architecture icons
        </a>{' '}
        . Data and images are from{' '}
        <a
          className="underline text-yellow-600 hover:text-yellow-700"
          href="https://docs.aws.amazon.com/"
        >
          AWS Documentation
        </a>
        . Both are wholly owned by{' '}
        <a
          className="underline text-yellow-600 hover:text-yellow-700"
          href="https://aws.amazon.com/"
        >
          Amazon Web Services, Inc
        </a>
        .
      </div>
      <div className="text-xs">
        AWS Explorer is not affiliated with, endorsed by, or in any way
        officially connected with Amazon Web Services (AWS), Amazon.com, Inc.,
        or any of its subsidiaries or affiliates.
      </div>
    </footer>
  )
}
