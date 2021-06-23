import { useState } from "react"

export function Button() {
  const [state, setstate] = useState(0)

  function handleClick() {
    setstate(state + 1)
    console.log(state)
  }
  return (
    <button onClick={handleClick}>{state}</button>
  )
}