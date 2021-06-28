import { useParams } from 'react-router'
import { Button } from '../components/Button'
import { RoomCode } from '../components/RoomCode'

import logoImage from '../assets/images/logo.svg'

import '../styles/room.scss'
import { FormEvent, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { database } from '../services/firebase'

type FirebaseQuestions = Record<string, {
  author: {
    name: string,
    avatar: string,
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
}>

type Questions = {
  id:string;
  author: {
    name: string,
    avatar: string,
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
}

type RoomParams = {
  id: string;
}

export function Room() {
  const {user} = useAuth()
  const params = useParams<RoomParams>()
  const roomId = params.id
  const [newQestion, setNewQuestion] = useState('')
  const [questions, setQuestions] = useState<Questions[]>([])
  const [title, setTitle] = useState('')
  
  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`)

    roomRef.on('value', room => {
      const databaseRoom = room.val()
      const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {}

      const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,

        }
      })
  
      setTitle(databaseRoom.title)
      setQuestions(parsedQuestions)
    })
  }, [roomId])

  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault()
    if (newQestion.trim() === '') {
      return;
    }

    if (!user) {
      throw new Error('You must be logged in')
    }

    const question = {
      content: newQestion,
      author: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighLighted: false,
      isAnswered: false,
    }

    await database.ref(`rooms/${roomId}/questions`).push(question)
    setNewQuestion('')
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImage} alt="letmeask" />
          <RoomCode code={roomId}/>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <form onSubmit={handleSendQuestion}>
          <textarea 
            placeholder="O que você quer perguntar?"
            onChange={event => setNewQuestion(event.target.value)}
            value={newQestion}
          />
          <div className="form-footer">
            { user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name} />
                <span>{user.name}</span>
              </div>
            ) : (
              <span>Para enviar uma pergunta, <button>faça seu login</button>.</span>
            ) }
            <Button type="submit" disabled={!user}>Enviar pergunta</Button>
          </div>
        </form>
        {JSON.stringify(questions)}
      </main>
    </div>
  )
}