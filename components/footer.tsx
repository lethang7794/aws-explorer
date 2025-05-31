export function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-muted-foreground bg-white/80 backdrop-blur-md">
      <div>
        Made by{' '}
        <a
          href="https://lethang7794.github.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          Thắng
        </a>
        .&nbsp;Open-sourced at{' '}
        <a
          href="https://github.com/lethang7794/aws-explorer"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          aws-explorer
        </a>
        .
      </div>
    </footer>
  )
}
