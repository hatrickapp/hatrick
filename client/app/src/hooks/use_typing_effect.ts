import { useState, useEffect } from 'react'

/**
 * A hook that simulates a typing effect for a given string.
 * 
 * @param text The string to type out.
 * @param speed The speed of typing in milliseconds per character.
 * @returns The current string as it's being typed.
 */
export function useTypingEffect(text: string, speed: number = 40) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    let index = 0
    let intervalId: NodeJS.Timeout
    setDisplayText('')

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index))
          index++
        } else {
          clearInterval(intervalId)
        }
      }, speed)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, speed])

  return displayText
}
