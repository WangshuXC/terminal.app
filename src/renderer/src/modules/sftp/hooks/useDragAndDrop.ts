import { useState, useCallback, DragEvent, useRef } from 'react'

export interface DragDropHandlers {
  onDragEnter: (e: DragEvent) => void
  onDragLeave: (e: DragEvent) => void
  onDragOver: (e: DragEvent) => void
  onDrop: (e: DragEvent) => void
}

export interface UseDragAndDropOptions {
  onFilesDropped: (files: FileList) => void
  accept?: string[]
  multiple?: boolean
}

export const useDragAndDrop = ({
  onFilesDropped,
  accept = [],
  multiple = true
}: UseDragAndDropOptions) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounterRef = useRef(0)

  const validateFiles = useCallback(
    (files: FileList): boolean => {
      if (!multiple && files.length > 1) {
        return false
      }

      if (accept.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const isAccepted = accept.some((type) => {
            if (type.startsWith('.')) {
              return file.name.toLowerCase().endsWith(type.toLowerCase())
            }
            return file.type.match(type.replace('*', '.*'))
          })
          if (!isAccepted) {
            return false
          }
        }
      }

      return true
    },
    [accept, multiple]
  )

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current += 1

    if (e.dataTransfer?.items) {
      const hasFiles = Array.from(e.dataTransfer.items).some((item) => item.kind === 'file')
      if (hasFiles) {
        setIsDragOver(true)
      }
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      setIsDragOver(false)
      dragCounterRef.current = 0

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        if (validateFiles(files)) {
          onFilesDropped(files)
        } else {
          console.warn('Dropped files do not match accepted types or multiple files not allowed')
        }
      }
    },
    [onFilesDropped, validateFiles]
  )

  const dragHandlers: DragDropHandlers = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop
  }

  return {
    isDragOver,
    dragHandlers
  }
}
