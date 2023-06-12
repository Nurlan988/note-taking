import { Container } from 'react-bootstrap'
import {Routes, Route, Navigate} from 'react-router-dom'
import { useMemo } from 'react'
import {v4 as uuidV4} from 'uuid'

import { NewNote } from './components/NewNote'
import { RawNote, Tag, NoteData } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'

import "bootstrap/dist/css/bootstrap.min.css"
import { NoteList } from './components/NoteList'
import { NoteLayout } from './components/NoteLayout'
import { Note } from './components/Note'
import { EditNote } from './components/EditNote'

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>('NOTES', [])
  const [tags, setTags] = useLocalStorage<Tag[]>('TAGS', [])

  const notesWithTags = useMemo(() => {
    return notes.map(note => {
      return {...note, tags: tags.filter(tag => note.tagIds.includes(tag.id))}
    })
  }, [notes, tags]);

  function onCreateNote({tags, ...data}: NoteData) {
    setNotes(prevNotes => {
      return [...prevNotes, {...data, id: uuidV4(),tagIds: tags.map(tag => tag.id)}]
    })
  }

  function onUpdateNote(id: string, {tags, ...data}: NoteData) {
    setNotes(prevNotes => {
      return prevNotes.map(note => {
        if(note.id === id){
          return {...note, ...data, tagIds: tags.map(tag => tag.id)}
        } else{
          return note
        }
      })
    })
  }

  function addTag(tag: Tag) {
    setTags(prev => [...prev, tag])
  }

  function onDeleteNote(id:string){
    setNotes(prevNotes => {
      return prevNotes.filter(note => note.id !== id)
    })
  }

  function deleteTag(id: string) {
    setTags(prev => {
      return prev.filter(tag => tag.id !==id)
    })
  }

  function updateTag(id: string, label:string) {
    setTags(prev => {
      return prev.map(tag => {
        if(tag.id !==id){
          return {...tag, label}
        }else {
          return tag
        }
      })
    })
  }

  return (
    <Container className='my-4'>
      <Routes>
        <Route path='/' element={
          <NoteList 
            notes={notesWithTags} 
            availableTags={tags}
            onDeleteTag={deleteTag}
            onUpdateTag={updateTag}
          />
        }/>
        <Route 
          path='/new' 
          element={
            <NewNote 
              onSubmit={onCreateNote} 
              onAddTag={addTag} 
              availableTags={tags} 
            />
          }
        />
        <Route path='*' element={<Navigate to='/' />}/>
        <Route path='/:id' element={<NoteLayout notes={notesWithTags}/>}>
          <Route index element={<Note onDelete={onDeleteNote}/>}/>
          <Route 
            path='edit' 
            element={
              <EditNote
                onSubmit={onUpdateNote} 
                onAddTag={addTag} 
                availableTags={tags} 
              />
            }
          />
        </Route>
      </Routes>
    </Container>
  )
}

export default App;
