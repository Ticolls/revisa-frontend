"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
import {
  Upload,
  FileText,
  CheckCircle2,
  Trash2,
  Download,
  UserCheck,
  Loader2,
  Calendar,
  Check,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { FileUploadZone } from "@/components/uploads/file-upload-zone"
import { withAuth } from "@/lib/auth/protected-route"
import { materialService } from "@/lib/api/services/material.service"
import { disciplineService } from "@/lib/api/services/discipline.service"
import { requestService } from "@/lib/api/services/request.service"
import { toast } from "sonner"
import { MaterialType } from "@/lib/api/types"
import type { Material, Discipline, CreateMaterialRequest, UpdateMaterialRequest } from "@/lib/api/types"
import { cn } from "@/lib/utils"

type LockedFields = {
  discipline: boolean
  type: boolean
  title: boolean
  professor: boolean
}

const createUnlockedFields = (): LockedFields => ({
  discipline: false,
  type: false,
  title: false,
  professor: false,
})

const UPLOADS_PAGE_SIZE = 10
const TITLE_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 300
const PROFESSOR_MAX_LENGTH = 50

const MATERIAL_TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: MaterialType.EXAM, label: "Provas antigas" },
  { value: MaterialType.EXERCISE_SHEET, label: "Listas de exercícios" },
  { value: MaterialType.SUMMARY, label: "Resumo" },
  { value: MaterialType.SLIDE, label: "Slides" },
]

function UploadsPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedGabarito, setSelectedGabarito] = useState<File | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const [disciplineId, setDisciplineId] = useState("")
  const [materialType, setMaterialType] = useState<MaterialType | "">("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [professor, setProfessor] = useState("")

  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [isLoadingDisciplines, setIsLoadingDisciplines] = useState(true)
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false)
  const [disciplineSearch, setDisciplineSearch] = useState("")
  
  const [uploads, setUploads] = useState<Material[]>([])
  const [isLoadingUploads, setIsLoadingUploads] = useState(true)
  const [totalUploads, setTotalUploads] = useState(0)
  const [uploadsPage, setUploadsPage] = useState(1)

  const [attendingRequest, setAttendingRequest] = useState<{
    id: string
    disciplineCode: string
    disciplineName: string
  } | null>(null)

  const [selectedUpload, setSelectedUpload] = useState<Material | null>(null)
  const [isUpdatingUpload, setIsUpdatingUpload] = useState(false)
  const [editDisciplineId, setEditDisciplineId] = useState("")
  const [editDisciplineDropdownOpen, setEditDisciplineDropdownOpen] = useState(false)
  const [editDisciplineSearch, setEditDisciplineSearch] = useState("")
  const [editMaterialType, setEditMaterialType] = useState<MaterialType | "">("")
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editProfessor, setEditProfessor] = useState("")
  const [replacementFile, setReplacementFile] = useState<File | null>(null)
  const [replacementAnswerKey, setReplacementAnswerKey] = useState<File | null>(null)
  const [uploadToDelete, setUploadToDelete] = useState<Material | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPrefillingRequest, setIsPrefillingRequest] = useState(false)
  const [lockedFields, setLockedFields] = useState<LockedFields>(() => createUnlockedFields())

  const resetLockedFields = () => setLockedFields(createUnlockedFields())

  const selectedDiscipline = useMemo(
    () => disciplines.find((discipline) => discipline.id === disciplineId),
    [disciplines, disciplineId],
  )

  const filteredDisciplines = useMemo(() => {
    const query = disciplineSearch.trim().toLowerCase()

    if (!query) return disciplines

    return disciplines.filter((discipline) => {
      const label = `${discipline.code} ${discipline.name}`.toLowerCase()
      return label.includes(query)
    })
  }, [disciplines, disciplineSearch])

  const editRequiresGabarito = editMaterialType === "EXAM" || editMaterialType === "EXERCISE_SHEET"

  const editSelectedDiscipline = useMemo(
    () => disciplines.find((discipline) => discipline.id === editDisciplineId),
    [disciplines, editDisciplineId],
  )

  const filteredEditDisciplines = useMemo(() => {
    const query = editDisciplineSearch.trim().toLowerCase()

    if (!query) return disciplines

    return disciplines.filter((discipline) => {
      const label = `${discipline.code} ${discipline.name}`.toLowerCase()
      return label.includes(query)
    })
  }, [disciplines, editDisciplineSearch])

  useEffect(() => {
    if (!selectedUpload) return

    setEditDisciplineId(selectedUpload.disciplineId)
    setEditMaterialType(selectedUpload.type)
    setEditTitle(selectedUpload.title)
    setEditDescription(selectedUpload.description ?? "")
    setEditProfessor(selectedUpload.professor ?? "")
    setEditDisciplineDropdownOpen(false)
    setEditDisciplineSearch("")
    setReplacementFile(null)
    setReplacementAnswerKey(null)
  }, [selectedUpload])

  const loadMyUploads = async (page = 1) => {
    try {
      setIsLoadingUploads(true)
      const response = await materialService.getMyUploads(page, UPLOADS_PAGE_SIZE)
      setUploads(response.materials)
      setTotalUploads(response.total)
      setUploadsPage(page)
    } catch (error) {
      console.error("Erro ao carregar uploads:", error)
      toast.error("Erro ao carregar seus uploads")
    } finally {
      setIsLoadingUploads(false)
    }
  }

  // Carregar disciplinas
  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoadingDisciplines(true)
        const response = await disciplineService.getDisciplines({ limit: 1000 })
        setDisciplines(response.disciplines)
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error)
        toast.error("Erro ao carregar disciplinas")
      } finally {
        setIsLoadingDisciplines(false)
      }
    }

    fetchDisciplines()
  }, [])

  // Carregar meus uploads
  useEffect(() => {
    loadMyUploads(1)
  }, [])

  // Preencher formulário via query params
  useEffect(() => {
    const disciplineIdParam = searchParams.get("disciplineId")
    const disciplineCodeParam = searchParams.get("disciplineCode") ?? searchParams.get("discipline")
    const materialTypeParam = searchParams.get("materialType") as MaterialType | null
    const titleParam = searchParams.get("title")
    const professorParam = searchParams.get("professor")
    const requestId = searchParams.get("requestId")
    const disciplineName = searchParams.get("disciplineName")

    if (disciplineIdParam) setDisciplineId(disciplineIdParam)
    if (materialTypeParam) setMaterialType(materialTypeParam)
    if (titleParam) setTitle(titleParam.slice(0, TITLE_MAX_LENGTH))
    if (professorParam) setProfessor(professorParam.slice(0, PROFESSOR_MAX_LENGTH))

    if (requestId && disciplineCodeParam && disciplineName) {
      setDescription("")
      setAttendingRequest({
        id: requestId,
        disciplineCode: disciplineCodeParam,
        disciplineName,
      })
    } else {
      setAttendingRequest(null)
    }

    if (!requestId) {
      resetLockedFields()
      return
    }

    setLockedFields({
      discipline: Boolean(disciplineIdParam),
      type: Boolean(materialTypeParam),
      title: Boolean(titleParam),
      professor: Boolean(professorParam),
    })

    let cancelled = false

    const fetchRequestDetails = async () => {
      try {
        setIsPrefillingRequest(true)
        const request = await requestService.getRequestById(requestId)
        if (cancelled) return

        if (request.status !== "pending") {
          toast.info("Essa solicitação já foi atendida")
          setAttendingRequest(null)
          resetLockedFields()
          router.replace("/home/uploads")
          return
        }

        setDisciplineId(request.disciplineId)
        setMaterialType(request.type ?? "")
        setTitle(request.title.slice(0, TITLE_MAX_LENGTH))
        setDescription((request.description ?? "").slice(0, DESCRIPTION_MAX_LENGTH))
        setProfessor((request.professor ?? "").slice(0, PROFESSOR_MAX_LENGTH))
        setAttendingRequest({
          id: request.id,
          disciplineCode: request.disciplineCode,
          disciplineName: request.disciplineName,
        })
        setLockedFields({
          discipline: true,
          type: Boolean(request.type),
          title: true,
          professor: Boolean(request.professor),
        })
      } catch (error) {
        if (!cancelled) {
          toast.error("Não foi possível carregar os dados da solicitação")
        }
      } finally {
        if (!cancelled) {
          setIsPrefillingRequest(false)
        }
      }
    }

    fetchRequestDetails()

    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedTitle = title.trim()
    const normalizedDescription = description.trim()
    const normalizedProfessor = professor.trim()

    if (!disciplineId || !materialType || !normalizedTitle || !selectedFile) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    try {
      setIsUploading(true)

      const payload: CreateMaterialRequest = {
        title: normalizedTitle,
        description: normalizedDescription,
        type: materialType as MaterialType,
        disciplineId,
        professor: normalizedProfessor || undefined,
        file: selectedFile,
        answerKey: selectedGabarito || undefined,
      }

      if (attendingRequest) {
        await materialService.fulfillMaterialRequest(attendingRequest.id, payload)
      } else {
        await materialService.createMaterial(payload)
      }

      toast.success("Material enviado com sucesso!")
      setShowSuccess(true)
      
      setDisciplineId("")
      setMaterialType("")
      setTitle("")
      setDescription("")
      setProfessor("")
      setSelectedFile(null)
      setSelectedGabarito(null)
      setAttendingRequest(null)
      resetLockedFields()
      if (attendingRequest) {
        router.replace("/home/uploads")
      }

      await loadMyUploads(1)

      setTimeout(() => setShowSuccess(false), 5000)
    } catch (error) {
      console.error("Erro ao enviar material:", error)
      toast.error("Erro ao enviar material")
    } finally {
      setIsUploading(false)
    }
  }

  const requiresGabarito = materialType === "EXAM" || materialType === "EXERCISE_SHEET"

  const handleDownload = async (upload: Material) => {
    try {
      const url = await materialService.downloadMaterial(upload.id)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Erro ao fazer download:", error)
      toast.error("Erro ao fazer download")
    }
  }

  const handleDelete = async (upload: Material) => {
    try {
      setIsDeleting(true)
      await materialService.deleteMaterial(upload.id)
      toast.success("Material excluído com sucesso")

      const nextPage = Math.min(uploadsPage, Math.ceil((totalUploads - 1) / UPLOADS_PAGE_SIZE) || 1)
      await loadMyUploads(nextPage)
      
      setUploadToDelete(null)
    } catch (error) {
      console.error("Erro ao excluir material:", error)
      toast.error("Erro ao excluir material")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadAnswerKey = async (upload: Material) => {
    try {
      const url = await materialService.downloadAnswerKey(upload.id)
      window.open(url, "_blank")
    } catch (error) {
      console.error("Erro ao fazer download do gabarito:", error)
      toast.error("Erro ao fazer download do gabarito")
    }
  }

  const handleUpdateUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUpload) return

    const normalizedTitle = editTitle.trim()
    const normalizedDescription = editDescription.trim()
    const normalizedProfessor = editProfessor.trim()

    if (!editDisciplineId || !editMaterialType || !normalizedTitle) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    try {
      setIsUpdatingUpload(true)

      const payload: UpdateMaterialRequest = {
        disciplineId: editDisciplineId,
        type: editMaterialType as MaterialType,
        title: normalizedTitle,
        description: normalizedDescription,
        professor: normalizedProfessor || undefined,
        file: replacementFile || undefined,
        answerKey: replacementAnswerKey || undefined,
      }

      await materialService.updateMaterial(selectedUpload.id, payload)
      toast.success("Material atualizado com sucesso")

      setSelectedUpload(null)
      await loadMyUploads(uploadsPage)
    } catch (error) {
      console.error("Erro ao atualizar material:", error)
      toast.error("Erro ao atualizar material")
    } finally {
      setIsUpdatingUpload(false)
    }
  }

  const handleSelectDiscipline = (id: string) => {
    setDisciplineId(id)
    setDisciplineDropdownOpen(false)
    setDisciplineSearch("")
  }

  const handleSelectEditDiscipline = (id: string) => {
    setEditDisciplineId(id)
    setEditDisciplineDropdownOpen(false)
    setEditDisciplineSearch("")
  }

  const isUploadFormValid = Boolean(
    disciplineId && materialType && title.trim() && selectedFile,
  )

  const renderUploadsPagination = () => {
    if (totalUploads <= UPLOADS_PAGE_SIZE || totalUploads === 0) return null

    const totalPages = Math.max(1, Math.ceil(totalUploads / UPLOADS_PAGE_SIZE))
    const start = (uploadsPage - 1) * UPLOADS_PAGE_SIZE + 1
    const end = Math.min(uploadsPage * UPLOADS_PAGE_SIZE, totalUploads)

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Mostrando {start} - {end} de {totalUploads} uploads
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={uploadsPage === 1 || isLoadingUploads}
            onClick={() => loadMyUploads(1)}
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={uploadsPage === 1 || isLoadingUploads}
            onClick={() => loadMyUploads(uploadsPage - 1)}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {uploadsPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={uploadsPage === totalPages || isLoadingUploads}
            onClick={() => loadMyUploads(uploadsPage + 1)}
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            disabled={uploadsPage === totalPages || isLoadingUploads}
            onClick={() => loadMyUploads(totalPages)}
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
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
            Você está atendendo a solicitação para{" "}
            <strong>{attendingRequest.disciplineCode}</strong> - {attendingRequest.disciplineName}
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
                <Popover open={disciplineDropdownOpen} onOpenChange={setDisciplineDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="upload-discipline"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={disciplineDropdownOpen}
                      disabled={isLoadingDisciplines || lockedFields.discipline}
                      className={cn(
                        "w-full justify-between cursor-pointer",
                        !selectedDiscipline && "text-muted-foreground hover:text-muted-foreground",
                      )}
                    >
                      <span className="truncate text-left">
                        {selectedDiscipline
                          ? `${selectedDiscipline.code} - ${selectedDiscipline.name}`
                          : isLoadingDisciplines
                            ? "Carregando..."
                            : "Selecione a disciplina"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="p-2 border-b">
                      <Input
                        value={disciplineSearch}
                        onChange={(e) => setDisciplineSearch(e.target.value)}
                        placeholder="Buscar disciplina..."
                        autoComplete="off"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                      {filteredDisciplines.length === 0 ? (
                        <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma disciplina encontrada.</p>
                      ) : (
                        filteredDisciplines.map((disc) => (
                          <button
                            key={disc.id}
                            type="button"
                            onClick={() => handleSelectDiscipline(disc.id)}
                            className={cn(
                              "w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm text-left cursor-pointer hover:bg-accent hover:text-accent-foreground",
                              disciplineId === disc.id && "bg-accent",
                            )}
                          >
                            <span className="truncate">
                              {disc.code} - {disc.name}
                            </span>
                            <Check
                              className={cn("h-4 w-4", disciplineId === disc.id ? "opacity-100" : "opacity-0")}
                            />
                          </button>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-type">Tipo de Material</Label>
                <Select
                  value={materialType}
                  onValueChange={(value) => setMaterialType(value as MaterialType)}
                  disabled={lockedFields.type}
                >
                  <SelectTrigger id="upload-type" className="cursor-pointer">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXAM" className="cursor-pointer">
                      Provas antigas
                    </SelectItem>
                    <SelectItem value="EXERCISE_SHEET" className="cursor-pointer">
                      Listas de exercícios
                    </SelectItem>
                    <SelectItem value="SUMMARY" className="cursor-pointer">
                      Resumo
                    </SelectItem>
                    <SelectItem value="SLIDE" className="cursor-pointer">
                      Slides
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="upload-title">Título do Material</Label>
                  <span className="text-xs text-muted-foreground">
                    {title.length}/{TITLE_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="upload-title"
                  placeholder="Ex: Resumo de Árvores Binárias"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={TITLE_MAX_LENGTH}
                  disabled={lockedFields.title}
                  rows={2}
                  className="resize-none [overflow-wrap:anywhere]"
                />
                <p className="text-xs text-muted-foreground">Máximo de {TITLE_MAX_LENGTH} caracteres.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="upload-description">Descrição (opcional)</Label>
                  <span className="text-xs text-muted-foreground">
                    {description.length}/{DESCRIPTION_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="upload-description"
                  placeholder="Adicione uma descrição sobre o material..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  className="[overflow-wrap:anywhere]"
                />
                <p className="text-xs text-muted-foreground">Máximo de {DESCRIPTION_MAX_LENGTH} caracteres.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="upload-professor">Professor(a) (opcional)</Label>
                  <span className="text-xs text-muted-foreground">
                    {professor.length}/{PROFESSOR_MAX_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="upload-professor"
                  placeholder="Ex: Professor(a) Maria Silva"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  maxLength={PROFESSOR_MAX_LENGTH}
                  disabled={lockedFields.professor}
                  rows={2}
                  className="resize-none [overflow-wrap:anywhere]"
                />
                <p className="text-xs text-muted-foreground">Máximo de {PROFESSOR_MAX_LENGTH} caracteres.</p>
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

              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isUploading || isPrefillingRequest || !isUploadFormValid}
              >
                {isPrefillingRequest ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando solicitação...
                  </>
                ) : isUploading ? (
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
              <p>10 MB por arquivo</p>
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
          {isLoadingUploads ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não enviou nenhum material</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {uploads.map((upload) => (
                  <Card
                    key={upload.id}
                    className="h-36 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => setSelectedUpload(upload)}
                  >
                    <CardContent className="p-3 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono font-semibold text-primary">{upload.disciplineCode}</span>
                          </div>
                          <h3 className="font-medium text-sm mb-1 min-h-9 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [overflow-wrap:anywhere]">
                            {upload.title}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(upload.uploadedAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{upload.downloads}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {renderUploadsPagination()}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedUpload}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUpload(null)
            setEditDisciplineDropdownOpen(false)
            setEditDisciplineSearch("")
          }
        }}
      >
        <DialogContent className="max-w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="[overflow-wrap:anywhere]">Editar material</DialogTitle>
            <DialogDescription>Atualize os campos abaixo e, se quiser, substitua os arquivos.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUpload} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-upload-discipline">Disciplina</Label>
              <Popover open={editDisciplineDropdownOpen} onOpenChange={setEditDisciplineDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-upload-discipline"
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={editDisciplineDropdownOpen}
                    disabled={isLoadingDisciplines}
                    className={cn(
                      "w-full justify-between cursor-pointer",
                      !editSelectedDiscipline && "text-muted-foreground hover:text-muted-foreground",
                    )}
                  >
                    <span className="truncate text-left">
                      {editSelectedDiscipline
                        ? `${editSelectedDiscipline.code} - ${editSelectedDiscipline.name}`
                        : isLoadingDisciplines
                          ? "Carregando..."
                          : "Selecione a disciplina"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="p-2 border-b">
                    <Input
                      value={editDisciplineSearch}
                      onChange={(e) => setEditDisciplineSearch(e.target.value)}
                      placeholder="Buscar disciplina..."
                      autoComplete="off"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1">
                    {filteredEditDisciplines.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma disciplina encontrada.</p>
                    ) : (
                      filteredEditDisciplines.map((disc) => (
                        <button
                          key={disc.id}
                          type="button"
                          onClick={() => handleSelectEditDiscipline(disc.id)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm text-left cursor-pointer hover:bg-accent hover:text-accent-foreground",
                            editDisciplineId === disc.id && "bg-accent",
                          )}
                        >
                          <span className="truncate">
                            {disc.code} - {disc.name}
                          </span>
                          <Check
                            className={cn("h-4 w-4", editDisciplineId === disc.id ? "opacity-100" : "opacity-0")}
                          />
                        </button>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-upload-type">Tipo de material</Label>
              <Select value={editMaterialType} onValueChange={(value) => setEditMaterialType(value as MaterialType)}>
                <SelectTrigger id="edit-upload-type" className="cursor-pointer">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="edit-upload-title">Título do material</Label>
                <span className="text-xs text-muted-foreground">{editTitle.length}/{TITLE_MAX_LENGTH}</span>
              </div>
              <Textarea
                id="edit-upload-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                rows={2}
                className="resize-none [overflow-wrap:anywhere]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="edit-upload-description">Descrição</Label>
                <span className="text-xs text-muted-foreground">{editDescription.length}/{DESCRIPTION_MAX_LENGTH}</span>
              </div>
              <Textarea
                id="edit-upload-description"
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={DESCRIPTION_MAX_LENGTH}
                className="[overflow-wrap:anywhere]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="edit-upload-professor">Professor(a) (opcional)</Label>
                <span className="text-xs text-muted-foreground">{editProfessor.length}/{PROFESSOR_MAX_LENGTH}</span>
              </div>
              <Textarea
                id="edit-upload-professor"
                value={editProfessor}
                onChange={(e) => setEditProfessor(e.target.value)}
                maxLength={PROFESSOR_MAX_LENGTH}
                rows={2}
                className="resize-none [overflow-wrap:anywhere]"
              />
            </div>

            <div className="space-y-2">
              <Label>Substituir arquivo principal (opcional)</Label>
              <p className="text-xs text-muted-foreground">Arquivo atual: {selectedUpload?.fileName}</p>
              <Input
                type="file"
                accept=".pdf,application/pdf"
                className="cursor-pointer"
                onChange={(e) => setReplacementFile(e.target.files?.[0] ?? null)}
              />
              {replacementFile && <p className="text-xs text-muted-foreground truncate">Novo arquivo: {replacementFile.name}</p>}
            </div>

            {(editRequiresGabarito || selectedUpload?.answerKeyFileName) && (
              <div className="space-y-2">
                <Label>Substituir gabarito (opcional)</Label>
                {selectedUpload?.answerKeyFileName ? (
                  <p className="text-xs text-muted-foreground">Gabarito atual: {selectedUpload.answerKeyFileName}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Este material ainda não possui gabarito.</p>
                )}
                <Input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="cursor-pointer"
                  onChange={(e) => setReplacementAnswerKey(e.target.files?.[0] ?? null)}
                />
                {replacementAnswerKey && (
                  <p className="text-xs text-muted-foreground truncate">Novo gabarito: {replacementAnswerKey.name}</p>
                )}
              </div>
            )}

            <DialogFooter className="pt-2">
              <div className="w-full space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => selectedUpload && handleDownload(selectedUpload)}
                    className="cursor-pointer bg-transparent hover:text-foreground"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar material
                  </Button>

                  {selectedUpload?.answerKeyUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="cursor-pointer bg-transparent hover:text-foreground"
                      onClick={() => selectedUpload && handleDownloadAnswerKey(selectedUpload)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar gabarito
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" disabled className="cursor-not-allowed">
                      <Download className="mr-2 h-4 w-4" />
                      Sem gabarito
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      if (selectedUpload) {
                        setUploadToDelete(selectedUpload)
                        setSelectedUpload(null)
                      }
                    }}
                    className="cursor-pointer sm:col-span-2"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir material
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingUpload}
                  className="cursor-pointer w-full"
                >
                  {isUpdatingUpload ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!uploadToDelete} onOpenChange={(open) => !open && setUploadToDelete(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
            <span className="block mt-2 font-medium text-foreground">{uploadToDelete?.title}</span>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-destructive/10 hover:text-destructive cursor-pointer" disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => uploadToDelete && handleDelete(uploadToDelete)}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
export default withAuth(UploadsPage)
