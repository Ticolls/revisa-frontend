"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Upload, FileText, CheckCircle2, Trash2, Download, UserCheck } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { FileUploadZone } from "@/components/uploads/file-upload-zone"

export default function UploadsPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedGabarito, setSelectedGabarito] = useState<File | null>(null)
  const searchParams = useSearchParams()

  const [discipline, setDiscipline] = useState("")
  const [materialType, setMaterialType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [professor, setProfessor] = useState("")

  const [attendingRequest, setAttendingRequest] = useState<{
    id: string
    user: string
    discipline: string
    disciplineName: string
  } | null>(null)

  const [selectedUpload, setSelectedUpload] = useState<(typeof uploads)[0] | null>(null)
  const [uploadToDelete, setUploadToDelete] = useState<(typeof uploads)[0] | null>(null)

  useEffect(() => {
    const disciplineParam = searchParams.get("discipline")
    const materialTypeParam = searchParams.get("materialType")
    const titleParam = searchParams.get("title")
    const descriptionParam = searchParams.get("description")
    const professorParam = searchParams.get("professor")
    const requestId = searchParams.get("requestId")
    const requestUser = searchParams.get("requestUser")
    const disciplineName = searchParams.get("disciplineName")

    if (disciplineParam) setDiscipline(disciplineParam.toLowerCase())
    if (materialTypeParam) setMaterialType(materialTypeParam)
    if (titleParam) setTitle(titleParam)
    if (descriptionParam) setDescription(descriptionParam)
    if (professorParam) setProfessor(professorParam)

    if (requestId && requestUser && disciplineParam && disciplineName) {
      setAttendingRequest({
        id: requestId,
        user: requestUser,
        discipline: disciplineParam,
        disciplineName: disciplineName,
      })
    }
  }, [
    searchParams.get("discipline"),
    searchParams.get("materialType"),
    searchParams.get("title"),
    searchParams.get("description"),
    searchParams.get("professor"),
    searchParams.get("requestId"),
    searchParams.get("requestUser"),
    searchParams.get("disciplineName"),
  ])

  const uploads = [
    {
      id: 1,
      name: "Resumo de Árvores Binárias.pdf",
      discipline: "MATA40",
      disciplineName: "Estruturas de Dados",
      date: "Há 3 dias",
      downloads: 45,
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "Lista Resolvida - SQL.pdf",
      discipline: "MATA60",
      disciplineName: "Banco de Dados",
      date: "Há 1 semana",
      downloads: 32,
      size: "1.8 MB",
    },
    {
      id: 3,
      name: "Slides UML Completo.pptx",
      discipline: "MATA62",
      disciplineName: "Engenharia de Software",
      date: "Há 2 semanas",
      downloads: 28,
      size: "5.2 MB",
    },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsUploading(false)
    setShowSuccess(true)
    setSelectedFile(null)
    setSelectedGabarito(null)

    setAttendingRequest(null)

    setTimeout(() => setShowSuccess(false), 5000)
  }

  const requiresGabarito = materialType === "prova" || materialType === "lista"

  const handleDownload = (upload: (typeof uploads)[0]) => {
    console.log("[v0] Downloading:", upload.name)
    // Implementar lógica de download
  }

  const handleDelete = (upload: (typeof uploads)[0]) => {
    console.log("[v0] Deleting:", upload.name)
    setUploadToDelete(null)
    // Implementar lógica de exclusão
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Uploads</h1>
        <p className="text-muted-foreground">Compartilhe seus materiais com a comunidade REVISA</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-400">
            Material enviado com sucesso! Ele estará disponível para download em breve.
          </AlertDescription>
        </Alert>
      )}

      {attendingRequest && (
        <Alert className="bg-primary/10 border-primary/20">
          <UserCheck className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            Você está atendendo a solicitação de <strong>{attendingRequest.user}</strong> para{" "}
            <strong>{attendingRequest.discipline}</strong> - {attendingRequest.disciplineName}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Novo Upload</CardTitle>
            <CardDescription>Envie um material para ajudar outros estudantes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-discipline">Disciplina</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger id="upload-discipline" className="cursor-pointer">
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mata40" className="cursor-pointer">
                      MATA40 - Estruturas de Dados
                    </SelectItem>
                    <SelectItem value="mata60" className="cursor-pointer">
                      MATA60 - Banco de Dados
                    </SelectItem>
                    <SelectItem value="mata62" className="cursor-pointer">
                      MATA62 - Engenharia de Software
                    </SelectItem>
                    <SelectItem value="mata64" className="cursor-pointer">
                      MATA64 - Inteligência Artificial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-type">Tipo de Material</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger id="upload-type" className="cursor-pointer">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prova" className="cursor-pointer">
                      Provas antigas
                    </SelectItem>
                    <SelectItem value="lista" className="cursor-pointer">
                      Listas de exercícios
                    </SelectItem>
                    <SelectItem value="resumo" className="cursor-pointer">
                      Resumo
                    </SelectItem>
                    <SelectItem value="slides" className="cursor-pointer">
                      Slides
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-title">Título do Material</Label>
                <Input
                  id="upload-title"
                  placeholder="Ex: Resumo de Árvores Binárias"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-description">Descrição (opcional)</Label>
                <Textarea
                  id="upload-description"
                  placeholder="Adicione uma descrição sobre o material..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-professor">Professor (opcional)</Label>
                <Input
                  id="upload-professor"
                  placeholder="Ex: Prof. João Silva"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivo</Label>
                <FileUploadZone
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  accept=".pdf"
                  pdfOnly={true}
                />
              </div>

              {requiresGabarito && (
                <div className="space-y-2">
                  <Label>Gabarito (opcional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Adicione o gabarito para ajudar outros estudantes
                  </p>
                  <FileUploadZone
                    selectedFile={selectedGabarito}
                    onFileSelect={setSelectedGabarito}
                    accept=".pdf"
                    pdfOnly={true}
                  />
                </div>
              )}

              <Button type="submit" className="w-full cursor-pointer" disabled={isUploading || !selectedFile}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-bounce" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer Upload
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Diretrizes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-1">Formato aceito</h4>
              <p>Apenas arquivos PDF</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Tamanho máximo</h4>
              <p>50 MB por arquivo</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Gabarito</h4>
              <p>Para provas antigas e listas de exercícios, você pode adicionar um gabarito opcional.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Conteúdo permitido</h4>
              <p>Apenas materiais acadêmicos relacionados às disciplinas da UFBA.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">Direitos autorais</h4>
              <p>Certifique-se de que você tem permissão para compartilhar o material.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Uploads</CardTitle>
          <CardDescription>Materiais que você compartilhou com a comunidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload) => (
              <Card
                key={upload.id}
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => setSelectedUpload(upload)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-primary">{upload.discipline}</span>
                      </div>
                      <h3 className="font-medium text-sm line-clamp-2 mb-2">{upload.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{upload.date}</span>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{upload.downloads}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUpload} onOpenChange={(open) => !open && setSelectedUpload(null)}>
        <DialogContent className="max-w-2xl max-w-[calc(100vw-2rem)]">
          <DialogHeader>
            <DialogTitle>{selectedUpload?.name}</DialogTitle>
            <DialogDescription>Detalhes do material enviado</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Disciplina</p>
                <p className="text-sm">
                  {selectedUpload?.discipline} - {selectedUpload?.disciplineName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tamanho</p>
                <p className="text-sm">{selectedUpload?.size}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Data de Upload</p>
                <p className="text-sm">{selectedUpload?.date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Downloads</p>
                <p className="text-sm">{selectedUpload?.downloads} downloads</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2 ml-auto">
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedUpload) {
                    setUploadToDelete(selectedUpload)
                    setSelectedUpload(null)
                  }
                }}
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
              <Button onClick={() => selectedUpload && handleDownload(selectedUpload)} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Baixar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!uploadToDelete} onOpenChange={(open) => !open && setUploadToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
            <span className="block mt-2 font-medium text-foreground">{uploadToDelete?.name}</span>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-destructive/10 hover:text-destructive cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => uploadToDelete && handleDelete(uploadToDelete)}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
