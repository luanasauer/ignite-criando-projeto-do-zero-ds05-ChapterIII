
import Link from 'next/link'
import styles from './header.module.scss'
export default function Header() {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="/images/Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
