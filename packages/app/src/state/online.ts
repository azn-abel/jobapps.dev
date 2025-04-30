import { atom } from 'jotai'

const isOnlineAtom = atom<boolean>(
  typeof navigator !== 'undefined' ? navigator.onLine : true
)

isOnlineAtom.onMount = (setAtom) => {
  const updateOnlineStatus = () => {
    setAtom(navigator.onLine)
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  updateOnlineStatus()

  return () => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
  }
}

export { isOnlineAtom }
