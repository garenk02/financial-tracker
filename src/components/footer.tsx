interface FooterProps {
  className?: string
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`border-t py-6 md:py-0 ${className}`}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Financial Tracker PWA. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
