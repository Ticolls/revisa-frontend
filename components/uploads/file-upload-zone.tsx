"use client"

import type React from "react"

import { useState, useCallback, type DragEvent } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  accept?: string
  pdfOnly?: boolean
}

export function FileUploadZone({ onFileSelect, selectedFile, accept = ".pdf", pdfOnly = true }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files && files[0]) {
        handleFile(files[0])
      }
    },
    [accept, pdfOnly],
  )

  const handleFile = (file: File) => {
    if (pdfOnly && file.type !== "application/pdf") {
      alert("Apenas arquivos PDF são aceitos")
      return
    }

    // Verificar se o arquivo é aceito
    const acceptedTypes = accept.split(",").map((type) => type.trim())
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!acceptedTypes.includes(fileExtension)) {
      alert("Tipo de arquivo não aceito")
      return
    }

    onFileSelect(file)
    setPreview(null)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    onFileSelect(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <Card
          className={cn(
            "border-2 border-dashed transition-all cursor-pointer",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="file-input" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Arraste e solte seu arquivo aqui</h3>
              <p className="text-sm text-muted-foreground mb-4">ou clique para selecionar</p>
              <p className="text-xs text-muted-foreground mt-4">
                {pdfOnly
                  ? "Formato aceito: PDF (máx. 50MB)"
                  : "Formatos aceitos: PDF, DOC, DOCX, PPT, PPTX, TXT (máx. 50MB)"}
              </p>
            </div>
          </label>
          <input id="file-input" type="file" className="hidden" onChange={handleFileInput} accept={accept} />
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 flex items-center justify-center bg-accent rounded-lg">
                <FileText className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{selectedFile.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <p className="text-xs text-muted-foreground mt-1">Tipo: PDF</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="flex-shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
