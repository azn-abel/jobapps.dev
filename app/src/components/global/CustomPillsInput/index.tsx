import { useState } from 'react'
import { PillsInput, Pill } from '@mantine/core'
import { SetStateAction } from 'jotai'

export default function CustomPillsInput({
  tags,
  setTags,
  description,
  showLabel,
  readOnly,
  unstyled,
}: {
  tags: string[]
  setTags: React.Dispatch<SetStateAction<string[]>>
  description?: string
  showLabel?: boolean
  readOnly?: boolean
  unstyled?: boolean
}) {
  const [inputValue, setInputValue] = useState('')

  const handleAdd = () => {
    const trimmed = inputValue.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInputValue('')
  }

  const handleDelete = () => {
    setTags([...tags].slice(0, tags.length - 1))
  }

  return (
    <>
      <PillsInput
        label={showLabel && 'Tags'}
        description={description || null}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
          } else if (['Backspace', 'Delete'].includes(e.key)) {
            if (inputValue === '') {
              e.preventDefault()
              handleDelete()
            }
          }
        }}
        variant={unstyled ? 'unstyled' : 'default'}
      >
        {tags.map((tag) => (
          <Pill
            key={tag}
            withRemoveButton
            onRemove={() => setTags(tags.filter((t) => t !== tag))}
            mr={4}
          >
            {tag}
          </Pill>
        ))}
        {readOnly || (
          <PillsInput.Field
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            placeholder="Add tag and press Enter"
          />
        )}
      </PillsInput>
    </>
  )
}
